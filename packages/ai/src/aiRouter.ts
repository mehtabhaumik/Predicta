import { OPENAI_MODELS } from '@pridicta/config/aiModels';
import type { AIIntent, ChartContext, UserPlan } from '@pridicta/types';
import { detectDecisionIntent } from './decisionMirror';

const DEEP_PATTERNS = [
  /predict/i,
  /future/i,
  /next\s+\d+\s+(years?|months?)/i,
  /career.*marriage|marriage.*career/i,
  /dasha/i,
  /pdf|report/i,
  /remed/i,
  /compare|cross[-\s]?check/i,
];

export function detectIntent(
  userQuestion: string,
  chartContext?: ChartContext,
): AIIntent {
  const normalized = userQuestion.trim();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const decisionIntent = detectDecisionIntent(normalized, chartContext);

  if (
    DEEP_PATTERNS.some(pattern => pattern.test(normalized)) ||
    (decisionIntent.isDecisionQuestion &&
      decisionIntent.suggestedDepth === 'EXPANDED') ||
    chartContext?.selectedSection?.toLowerCase().includes('report')
  ) {
    return 'deep';
  }

  if (wordCount <= 8 && !chartContext?.chartType) {
    return 'simple';
  }

  return 'moderate';
}

export function selectOpenAIModelForIntent({
  intent,
  userPlan,
}: {
  intent: AIIntent;
  userPlan: UserPlan;
}): string {
  if (intent === 'deep' && userPlan === 'PREMIUM') {
    return OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS;
  }

  return OPENAI_MODELS.FREE_REASONING;
}

export function shouldConsumeDeepQuota(
  intent: AIIntent,
  model: string,
): boolean {
  return intent === 'deep' && model === OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS;
}
