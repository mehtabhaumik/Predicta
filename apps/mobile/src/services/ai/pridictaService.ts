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
import { generateOpenAIResponse } from './providers/openaiProvider';
import { summarizeWithGemini } from './providers/geminiProvider';
import { optimizePridictaPayload } from './tokenOptimizer';
import {
  getCachedAIResponse,
  normalizeQuestion,
  setCachedAIResponse,
} from '../cache/responseCache';

export function buildPridictaSystemPrompt(): string {
  return [
    'You are Pridicta, a premium text-based Vedic astrology guide.',
    'You are a highly experienced Jyotish practitioner with 30 years of classical Vedic astrology expertise.',
    'You are not a Western astrologer. Use Vedic concepts, divisional charts, dashas, yogas, nakshatras, and ashtakavarga only when helpful.',
    'Speak calmly, wisely, compassionately, and practically. Be friendly and grounded.',
    'You may occasionally reference Shiva, Mahadev, Bholenath, Bhairav, or Rudra naturally and sparingly, never theatrically.',
    'Never be fear-based, manipulative, fatalistic, or promise guaranteed outcomes.',
    'Never say "99% true" or similar certainty claims.',
    'Prioritize the passed chartContext first. If the user came from D9, read D9 before broadening. If no context is passed, choose the relevant Vedic charts intelligently.',
    'You know the full Tier 1 and Tier 2 chart registry but should not dump chart names unless it helps the user.',
    'Keep responses concise, meaningful, emotionally calm, and cost-aware.',
    'Explain advanced astrology in normal language without overwhelming the user.',
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

function buildLocalResponse(
  message: string,
  kundli: KundliData,
  chartContext?: ChartContext,
): string {
  const currentDasha = kundli.dasha.current;
  const strongestHouses = kundli.ashtakavarga.strongestHouses.join(', ');

  return [
    chartContext?.chartType
      ? `I will begin from ${chartContext.chartType}, because that is where you opened this question.`
      : `I will start from the birth chart and then quietly cross-check D9 and D10 where needed.`,
    `For ${kundli.birthDetails.name}, the current ${currentDasha.mahadasha} Mahadasha and ${currentDasha.antardasha} Antardasha asks for patience, clean boundaries, and choices that mature over time.`,
    `Your strongest ashtakavarga support is around houses ${strongestHouses}, so effort, skill-building, and visible contribution matter more than rushing for quick certainty.`,
    `On your question, "${message}", the calm reading is this: take the next step that reduces confusion, protects dignity, and keeps long-term dharma intact. Mahadev's grace is felt most clearly when action is steady rather than anxious.`,
  ].join('\n\n');
}

export async function askPridicta({
  chartContext,
  deepAnalysis = false,
  history,
  kundli,
  message,
  userPlan,
}: PridictaChatRequest): Promise<PridictaChatResponse> {
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
        intent: cached.intent,
        model: cached.model,
        provider: 'cache',
        text: cached.text,
        usedDeepModel: false,
      };
    }
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
    'Kundli context:',
    compactContext,
    'Recent conversation:',
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
        content: buildPridictaSystemPrompt(),
        role: 'system',
      },
      {
        content: prompt,
        role: 'user',
      },
    ],
    model,
  });

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

  return {
    intent,
    model,
    provider: 'local',
    text: buildLocalResponse(message, kundli, chartContext),
    usedDeepModel: false,
  };
}

function isSafeToUseResponseCache(history: ConversationTurn[]): boolean {
  return history.filter(turn => turn.role === 'user').length === 0;
}
