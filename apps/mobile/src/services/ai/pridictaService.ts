import { GEMINI_MODELS } from '../../config/aiModels';
import type {
  ChartContext,
  ConversationTurn,
  KundliData,
  PridictaChatRequest,
  PridictaChatResponse,
} from '../../types/astrology';
import { buildAIContext } from './contextBuilder';
import {
  detectIntent,
  selectOpenAIModelForIntent,
  shouldConsumeDeepQuota,
} from './aiRouter';
import {
  buildLocalPredictaFallback,
  buildDecisionMirrorResponse,
  buildAiLanguageContext,
  detectDecisionIntent,
  formatDecisionMirrorText,
  getDecisionMirrorDepth,
  isSmallTalkPrompt,
} from '@pridicta/ai';
import { generateOpenAIResponse } from './providers/openaiProvider';
import { summarizeWithGemini } from './providers/geminiProvider';
import { generateBackendPridictaResponse } from './providers/backendAiProvider';
import { optimizePridictaPayload } from './tokenOptimizer';
import {
  getCachedAIResponse,
  normalizeQuestion,
  setCachedAIResponse,
} from '../cache/responseCache';

export function buildPridictaSystemPrompt(preferredLanguage?: string): string {
  const languageContext = buildAiLanguageContext(preferredLanguage);

  return [
    'You are Pridicta, a premium text-based Vedic astrology guide.',
    'You are a highly experienced Jyotish practitioner with 30 years of classical Vedic astrology expertise.',
    'You are not a Western astrologer. Use Vedic concepts, divisional charts, dashas, yogas, nakshatras, and ashtakavarga only when helpful.',
    'Speak calmly, wisely, compassionately, and practically. Be friendly and grounded.',
    'You may occasionally reference Shiva, Mahadev, Bholenath, Bhairav, or Rudra naturally and sparingly, never theatrically.',
    'Never be fear-based, manipulative, fatalistic, or promise guaranteed outcomes.',
    'Never say "99% true" or similar certainty claims.',
    'Use only the chart data that is actually available in the kundli context.',
    'Prioritize the passed chartContext first. If the user came from D9, read D9 before broadening.',
    'Do not default to D10 or career themes for general questions.',
    'If no chartContext is passed, begin from the broad birth chart picture and bring in divisional charts only when they are clearly relevant.',
    'You know the full Tier 1 and Tier 2 chart registry but should not dump chart names unless it helps the user.',
    'Use the recent conversation as working memory. If the user asks what you already know, what they already shared, or what you mean, answer that directly.',
    'If something is missing, name exactly what is known and what is still missing. Do not repeat a generic sentence when the user is asking for clarification.',
    'When the user challenges you or asks a follow-up about your last answer, respond like a thoughtful human guide rather than a template.',
    'Keep responses concise, meaningful, emotionally calm, and cost-aware.',
    'Explain advanced astrology in normal language without overwhelming the user.',
    languageContext.instruction,
  ].join('\n');
}

export function serializeKundliForAi(
  kundli: KundliData,
  context?: ChartContext,
): string {
  return JSON.stringify(
    buildAIContext(kundli, context),
    null,
    2,
  );
}

export function trimConversationHistory(
  history: ConversationTurn[],
): ConversationTurn[] {
  return history.slice(-8);
}

async function maybeCompactContextWithGemini(serializedContext: string) {
  const prompt = [
    'Compact this Vedic kundli context for a downstream OpenAI astrologer.',
    'Keep factual chart context only. Do not create final user guidance or persona.',
    serializedContext,
  ].join('\n\n');

  return summarizeWithGemini(prompt, GEMINI_MODELS.FLASH_HELPER);
}

export async function askPridicta({
  chartContext,
  deepAnalysis = false,
  history,
  kundli,
  message,
  preferredLanguage,
  userPlan,
}: PridictaChatRequest): Promise<PridictaChatResponse> {
  const languageContext = buildAiLanguageContext(preferredLanguage);
  if (isSmallTalkPrompt(message)) {
    return {
      intent: 'simple',
      model: 'predicta-small-talk',
      provider: 'local',
      text: buildLocalPredictaFallback(message, kundli, chartContext),
      usedDeepModel: false,
    };
  }

  const detectedIntent = detectIntent(message, chartContext);
  const intent = deepAnalysis ? 'deep' : detectedIntent;
  const model = selectOpenAIModelForIntent({ intent, userPlan });
  const normalizedQuestion = normalizeQuestion(message);
  const cacheInput = {
    activeKundliId: kundli.id,
    calculationInputHash: kundli.calculationMeta.inputHash,
    chartContext,
    intent,
    model,
    normalizedQuestion,
    userId: `local-${kundli.id}`,
  };

  if (isSafeToUseResponseCache(history)) {
    const cached = await getCachedAIResponse(cacheInput);

    if (cached) {
      return {
        cached: true,
        decisionMirror: cached.decisionMirror,
        intent: cached.intent,
        model: cached.model,
        provider: 'cache',
        text: cached.text,
        usedDeepModel: false,
      };
    }
  }

  const decisionIntent = detectDecisionIntent(message, chartContext);
  if (decisionIntent.isDecisionQuestion) {
    const decisionDepth = getDecisionMirrorDepth({
      chartContext,
      hasPremiumAccess: userPlan === 'PREMIUM',
      question: message,
    });
    const decisionMirror = buildDecisionMirrorResponse({
      chartContext,
      depth: decisionDepth,
      kundli,
      question: message,
    });
    const text = formatDecisionMirrorText(decisionMirror);

    if (isSafeToUseResponseCache(history)) {
      await setCachedAIResponse(cacheInput, {
        createdAt: new Date().toISOString(),
        decisionMirror,
        intent,
        model,
        text,
      }).catch(() => undefined);
    }

    return {
      decisionMirror,
      intent,
      model,
      provider: 'local',
      text,
      usedDeepModel: false,
    };
  }

  const backendResponse = await generateBackendPridictaResponse({
    chartContext,
    deepAnalysis,
    history,
    kundli,
    message,
    preferredLanguage,
    userPlan,
  });

  if (backendResponse?.text?.trim()) {
    if (isSafeToUseResponseCache(history)) {
      await setCachedAIResponse(cacheInput, {
        createdAt: new Date().toISOString(),
        intent: backendResponse.intent ?? intent,
        model: backendResponse.model,
        text: backendResponse.text.trim(),
      }).catch(() => undefined);
    }

    return {
      ...backendResponse,
      text: backendResponse.text.trim(),
    };
  }

  const optimized = optimizePridictaPayload({
    chartContext,
    history,
    intent,
    kundli,
    userPlan,
  });
  const serializedContext = JSON.stringify(optimized.context, null, 2);
  const compactContext =
    (await maybeCompactContextWithGemini(serializedContext)) ??
    serializedContext;
  const usedDeepModel = shouldConsumeDeepQuota(intent, model);

  const prompt = [
    `Language preference: ${languageContext.locale}`,
    languageContext.instruction,
    'Kundli context:',
    compactContext,
    'Recent conversation (authoritative working memory):',
    optimized.history
      .map(
        turn => `${turn.role === 'user' ? 'User' : 'Pridicta'}: ${turn.text}`,
      )
      .join('\n'),
    `User question: ${message}`,
  ].join('\n\n');

  const text = await generateOpenAIResponse({
    maxOutputTokens: optimized.maxOutputTokens,
    messages: [
      {
        content: buildPridictaSystemPrompt(languageContext.locale),
        role: 'system',
      },
      {
        content: prompt,
        role: 'user',
      },
    ],
    model,
  }).catch(() => null);

  if (text?.trim()) {
    if (isSafeToUseResponseCache(history)) {
      await setCachedAIResponse(cacheInput, {
        createdAt: new Date().toISOString(),
        intent,
        model,
        text: text.trim(),
      }).catch(() => undefined);
    }

    return {
      intent,
      model,
      provider: 'openai',
      text: text.trim(),
      usedDeepModel,
    };
  }

  const geminiText = await summarizeWithGemini(
    [
      buildPridictaSystemPrompt(languageContext.locale),
      'Use this context and user question to answer as Predicta. Keep the tone calm, practical, and non-fear-based.',
      prompt,
    ].join('\n\n'),
    GEMINI_MODELS.FLASH_HELPER,
  ).catch(() => null);

  if (geminiText?.trim()) {
    if (isSafeToUseResponseCache(history)) {
      await setCachedAIResponse(cacheInput, {
        createdAt: new Date().toISOString(),
        intent,
        model: GEMINI_MODELS.FLASH_HELPER,
        text: geminiText.trim(),
      }).catch(() => undefined);
    }

    return {
      intent,
      model: GEMINI_MODELS.FLASH_HELPER,
      provider: 'gemini',
      text: geminiText.trim(),
      usedDeepModel: false,
    };
  }

  return {
    intent,
    model,
    provider: 'local',
    text: buildLocalPredictaFallback(message, kundli, chartContext),
    usedDeepModel: false,
  };
}

function isSafeToUseResponseCache(history: ConversationTurn[]): boolean {
  return history.filter(turn => turn.role === 'user').length === 0;
}
