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
  buildPredictaIntelligenceContext,
  buildPredictaSystemIdentity,
  buildPredictaUserPrompt,
  buildLocalPredictaFallback,
  buildNoKundliResponse,
  buildDecisionMirrorResponse,
  buildAiLanguageContext,
  detectDecisionIntent,
  formatDecisionMirrorText,
  guardPredictaResponse,
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
  return buildPredictaSystemIdentity(preferredLanguage);
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

  if (!kundli) {
    const intelligenceContext = buildPredictaIntelligenceContext({
      chartContext,
      history,
      kundli,
      memory: undefined,
      message,
      preferredLanguage,
    });
    const backendResponse = await generateBackendPridictaResponse({
      chartContext,
      deepAnalysis,
      history,
      intelligenceContext,
      kundli,
      message,
      preferredLanguage,
      userPlan,
    });

    if (backendResponse?.text?.trim()) {
      return {
        ...backendResponse,
        text: guardPredictaResponse({
          history,
          intentProfile: intelligenceContext.intentProfile,
          memory: intelligenceContext.memory,
          text: backendResponse.text.trim(),
        }),
      };
    }

    return {
      intent: detectIntent(message, chartContext),
      model: 'predicta-no-kundli-local',
      provider: 'local',
      text: guardPredictaResponse({
        history,
        intentProfile: intelligenceContext.intentProfile,
        memory: intelligenceContext.memory,
        text: buildNoKundliResponse(message, {
          history,
        }),
      }),
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
    intelligenceContext: buildPredictaIntelligenceContext({
      chartContext,
      history,
      kundli,
      memory: undefined,
      message,
      preferredLanguage,
    }),
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
      text: guardPredictaResponse({
        history,
        text: backendResponse.text.trim(),
      }),
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

  const intelligenceContext = buildPredictaIntelligenceContext({
    chartContext,
    history,
    kundli,
    memory: undefined,
    message,
    preferredLanguage,
  });
  const prompt = buildPredictaUserPrompt({
    compactContext,
    history: optimized.history,
    intelligenceContext,
    message,
  });

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
      text: guardPredictaResponse({
        history,
        intentProfile: intelligenceContext.intentProfile,
        memory: intelligenceContext.memory,
        text: text.trim(),
      }),
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
      text: guardPredictaResponse({
        history,
        intentProfile: intelligenceContext.intentProfile,
        memory: intelligenceContext.memory,
        text: geminiText.trim(),
      }),
      usedDeepModel: false,
    };
  }

  return {
    intent,
    model,
    provider: 'local',
    text: guardPredictaResponse({
      history,
      intentProfile: intelligenceContext.intentProfile,
      memory: intelligenceContext.memory,
      text: buildLocalPredictaFallback(message, kundli, chartContext, {
        history,
      }),
    }),
    usedDeepModel: false,
  };
}

function isSafeToUseResponseCache(history: ConversationTurn[]): boolean {
  return history.filter(turn => turn.role === 'user').length === 0;
}
