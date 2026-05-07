import { OPENAI_MODELS } from '@pridicta/config/aiModels';
import type { AIIntent, ChartContext, UserPlan } from '@pridicta/types';

const DEEP_PATTERNS = [
  /predict/i,
  /future/i,
  /next\s+\d+\s+(years?|months?)/i,
  /career.*marriage|marriage.*career/i,
  /dasha/i,
  /sade\s*sati|sadesati|saturn|shani/i,
  /gochar|transit|planetary\s*weather/i,
  /yearly\s*horoscope|annual\s*horoscope|varsha\s*phal|varshaphal|solar\s*return|muntha|tajika|this\s*year|next\s*year/i,
  /advanced\s*jyotish|advanced\s*mode|ashtakavarga|nakshatra|birth\s*star|yoga|dosha|manglik|kaal\s*sarp|kemadruma|panchang|muhurta|prashna|horary|lal\s*kitab/i,
  /chalit|bhav|kp|krishnamurti|paddhati|sub\s*lord|significator|nadi|naadi/i,
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

  if (
    DEEP_PATTERNS.some(pattern => pattern.test(normalized)) ||
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
