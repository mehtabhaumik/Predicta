import { AI_CONTEXT_LIMITS } from '../../config/aiModels';
import {
  AI_FREE_RUNTIME_POLICY,
  AI_PREMIUM_RUNTIME_POLICY,
} from '@pridicta/config/aiCostGovernance';
import type {
  AIContextPayload,
  AIIntent,
  ChartContext,
  ConversationTurn,
  KundliData,
  SupportedLanguage,
  UserPlan,
} from '../../types/astrology';
import { buildAIContext } from './contextBuilder';

export type OptimizedAIPayload = {
  context: AIContextPayload;
  history: ConversationTurn[];
  maxOutputTokens: number;
};

export function optimizePridictaPayload({
  chartContext,
  history,
  intent,
  kundli,
  language = 'en',
  userPlan,
}: {
  chartContext?: ChartContext;
  history: ConversationTurn[];
  intent: AIIntent;
  kundli: KundliData;
  language?: SupportedLanguage;
  userPlan: UserPlan;
}): OptimizedAIPayload {
  return {
    context: buildAIContext(kundli, chartContext, language, userPlan),
    history: trimConversationHistory(history, intent),
    maxOutputTokens: getMaxOutputTokens(intent, userPlan),
  };
}

function trimConversationHistory(
  history: ConversationTurn[],
  intent: AIIntent,
): ConversationTurn[] {
  const maxTurns =
    intent === 'deep'
      ? AI_PREMIUM_RUNTIME_POLICY.maxHistoryTurns
      : AI_FREE_RUNTIME_POLICY.maxHistoryTurns;

  return history.slice(-maxTurns).map(turn => ({
    role: turn.role,
    text: turn.text.slice(0, 800),
  }));
}

function getMaxOutputTokens(intent: AIIntent, userPlan: UserPlan): number {
  if (userPlan === 'PREMIUM' && intent === 'deep') {
    return Math.min(
      AI_CONTEXT_LIMITS.PREMIUM_MAX_OUTPUT_TOKENS,
      AI_PREMIUM_RUNTIME_POLICY.maxOutputTokens,
    );
  }

  if (intent === 'simple') {
    return Math.min(260, AI_FREE_RUNTIME_POLICY.maxOutputTokens);
  }

  return Math.min(
    AI_CONTEXT_LIMITS.FREE_MAX_OUTPUT_TOKENS,
    AI_FREE_RUNTIME_POLICY.maxOutputTokens,
  );
}
