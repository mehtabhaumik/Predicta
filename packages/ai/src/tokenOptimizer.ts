import { AI_CONTEXT_LIMITS } from '@pridicta/config/aiModels';
import type {
  AIContextPayload,
  AIIntent,
  ChartContext,
  ConversationTurn,
  KundliData,
  SupportedLanguage,
  UserPlan,
} from '@pridicta/types';
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
      ? AI_CONTEXT_LIMITS.MAX_HISTORY_TURNS
      : Math.max(3, Math.floor(AI_CONTEXT_LIMITS.MAX_HISTORY_TURNS / 2));

  return history.slice(-maxTurns).map(turn => ({
    role: turn.role,
    text: turn.text.slice(0, 800),
  }));
}

function getMaxOutputTokens(intent: AIIntent, userPlan: UserPlan): number {
  if (userPlan === 'PREMIUM' && intent === 'deep') {
    return AI_CONTEXT_LIMITS.PREMIUM_MAX_OUTPUT_TOKENS;
  }

  if (intent === 'simple') {
    return Math.min(260, AI_CONTEXT_LIMITS.FREE_MAX_OUTPUT_TOKENS);
  }

  return AI_CONTEXT_LIMITS.FREE_MAX_OUTPUT_TOKENS;
}
