import type {
  AstrologyMemory,
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
} from './aiRouter';
import {
  buildPredictaIntelligenceContext,
  buildPredictaSystemIdentity,
  buildLocalPredictaFallback,
  buildNoKundliResponse,
  buildDecisionMirrorResponse,
  detectDecisionIntent,
  formatDecisionMirrorText,
  guardPredictaResponse,
  validatePredictaResponse,
  getDecisionMirrorDepth,
} from '@pridicta/ai';
import { generateBackendPridictaResponse } from './providers/backendAiProvider';
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

export async function askPridicta({
  chartContext,
  deepAnalysis = false,
  history,
  kundli,
  memory,
  message,
  preferredLanguage,
  userPlan,
}: PridictaChatRequest & {
  memory?: AstrologyMemory;
}): Promise<PridictaChatResponse> {
  const intelligenceContext = buildPredictaIntelligenceContext({
    chartContext,
    history,
    kundli,
    memory,
    message,
    preferredLanguage,
  });

  if (!kundli) {
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
      const guardedText = guardPredictaResponse({
        history,
        intentProfile: intelligenceContext.intentProfile,
        memory: intelligenceContext.memory,
        text: backendResponse.text.trim(),
      });
      const validation = validatePredictaResponse({
        chartContext,
        intentProfile: intelligenceContext.intentProfile,
        kundli,
        memory: intelligenceContext.memory,
        reasoningContext: intelligenceContext.reasoningContext,
        text: guardedText,
      });

      return {
        ...backendResponse,
        text: validation.valid
          ? guardedText
          : buildNoKundliResponse(message, {
              history,
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
  const selectedModel = selectOpenAIModelForIntent({ intent, userPlan });
  const normalizedQuestion = normalizeQuestion(message);
  const cacheInput = {
    activeKundliId: kundli.id,
    calculationInputHash: kundli.calculationMeta.inputHash,
    chartContext,
    intent,
    model: selectedModel,
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
  const backendResponse = await generateBackendPridictaResponse({
    chartContext,
    deepAnalysis,
    history,
    intelligenceContext: buildPredictaIntelligenceContext({
      chartContext,
      history,
      kundli,
      memory,
      message,
      preferredLanguage,
    }),
    kundli,
    message,
    preferredLanguage,
    userPlan,
  });

  if (backendResponse?.text?.trim()) {
    const guardedText = guardPredictaResponse({
      history,
      intentProfile: intelligenceContext.intentProfile,
      memory: intelligenceContext.memory,
      text: backendResponse.text.trim(),
    });
    const validation = validatePredictaResponse({
      chartContext,
      intentProfile: intelligenceContext.intentProfile,
      kundli,
      memory: intelligenceContext.memory,
      reasoningContext: intelligenceContext.reasoningContext,
      text: guardedText,
    });

    if (isSafeToUseResponseCache(history)) {
      await setCachedAIResponse(cacheInput, {
        createdAt: new Date().toISOString(),
        intent: backendResponse.intent ?? intent,
        model: backendResponse.model,
        text: validation.valid ? guardedText : buildLocalPredictaFallback(message, kundli, chartContext, {
          history,
        }),
      }).catch(() => undefined);
    }

    return {
      ...backendResponse,
      text: validation.valid
        ? guardedText
        : buildLocalPredictaFallback(message, kundli, chartContext, {
            history,
          }),
    };
  }

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

    return {
      decisionMirror,
      intent,
      model: selectedModel,
      provider: 'local',
      text,
      usedDeepModel: false,
    };
  }

  return {
    intent,
    model: selectedModel,
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
