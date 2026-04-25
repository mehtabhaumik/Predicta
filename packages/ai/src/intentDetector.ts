import type {
  AstrologyMemory,
  ChartContext,
  ConversationTurn,
  IntentDetectionResult,
  PredictaEmotionalTone,
  PredictaUserIntent,
} from '@pridicta/types';

type IntentSignal = {
  intent: PredictaUserIntent;
  pattern: RegExp;
  weight: number;
  signal: string;
};

const INTENT_SIGNALS: IntentSignal[] = [
  { intent: 'marriage', pattern: /\b(marriage|marry|shaadi|wedding|spouse timing)\b/i, weight: 5, signal: 'marriage_keywords' },
  { intent: 'relationship', pattern: /\b(relationship|partner|love|dating|breakup|separation|bond|together)\b/i, weight: 4, signal: 'relationship_keywords' },
  { intent: 'career', pattern: /\b(career|job|profession|office|promotion|role|business|work|leadership)\b/i, weight: 4, signal: 'career_keywords' },
  { intent: 'finance', pattern: /\b(finance|money|income|salary|wealth|debt|savings|cash|earning)\b/i, weight: 4, signal: 'finance_keywords' },
  { intent: 'health', pattern: /\b(health|body|illness|disease|sleep|stress|energy|healing)\b/i, weight: 4, signal: 'health_keywords' },
  { intent: 'family', pattern: /\b(family|parents|mother|father|home life|siblings)\b/i, weight: 3, signal: 'family_keywords' },
  { intent: 'children', pattern: /\b(children|child|pregnancy|conceive|baby)\b/i, weight: 4, signal: 'children_keywords' },
  { intent: 'education', pattern: /\b(education|study|studies|exam|degree|college|university)\b/i, weight: 4, signal: 'education_keywords' },
  { intent: 'spirituality', pattern: /\b(spiritual|sadhana|meditation|bhakti|soul|dharma|moksha|inner path)\b/i, weight: 4, signal: 'spirituality_keywords' },
  { intent: 'dasha', pattern: /\b(dasha|mahadasha|antardasha)\b/i, weight: 5, signal: 'dasha_keywords' },
  { intent: 'transit', pattern: /\b(transit|gochar|saturn return|retrograde)\b/i, weight: 4, signal: 'transit_keywords' },
  { intent: 'remedy', pattern: /\b(remedy|upay|upaya|what should i do|solution|healing ritual)\b/i, weight: 4, signal: 'remedy_keywords' },
  { intent: 'chart_explanation', pattern: /\b(chart|kundli|horoscope|d1|d9|d10|navamsha|dashamsha|placement|house|planet|lagna|nakshatra)\b/i, weight: 3, signal: 'chart_keywords' },
  { intent: 'prediction_timing', pattern: /\b(when|timing|time window|how long|which period|next year|this year)\b/i, weight: 3, signal: 'timing_keywords' },
  { intent: 'emotional_support', pattern: /\b(why is everything delayed|why am i suffering|i feel lost|i feel broken|i feel stuck|please help me understand)\b/i, weight: 4, signal: 'emotional_support_keywords' },
];

const EMOTIONAL_TONE_SIGNALS: Array<{
  tone: PredictaEmotionalTone;
  pattern: RegExp;
  signal: string;
}> = [
  { tone: 'scared', pattern: /\b(scared|afraid|terrified|panic)\b/i, signal: 'fear_words' },
  { tone: 'worried', pattern: /\b(worried|concerned|uneasy)\b/i, signal: 'worry_words' },
  { tone: 'frustrated', pattern: /\b(frustrated|fed up|tired of|angry|annoyed)\b/i, signal: 'frustration_words' },
  { tone: 'sad', pattern: /\b(sad|heavy|heartbroken|grief|grieving|loss|crying)\b/i, signal: 'sadness_words' },
  { tone: 'anxious', pattern: /\b(anxious|restless|overthinking|uncertain|stressed)\b/i, signal: 'anxiety_words' },
  { tone: 'hopeful', pattern: /\b(hopeful|wish|praying|optimistic)\b/i, signal: 'hope_words' },
  { tone: 'confused', pattern: /\b(confused|unclear|mixed up|do not understand|not sure)\b/i, signal: 'confusion_words' },
  { tone: 'curious', pattern: /\b(curious|wondering|tell me|explain|help me understand)\b/i, signal: 'curiosity_words' },
];

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function getRecentUserTurns(history?: ConversationTurn[]): string[] {
  return (history ?? [])
    .filter(turn => turn.role === 'user')
    .slice(-5)
    .map(turn => normalize(turn.text));
}

function detectFollowUp(message: string, history?: ConversationTurn[]): boolean {
  const normalized = normalize(message).toLowerCase();
  if (!history?.length) {
    return false;
  }

  if (normalized.split(/\s+/).length <= 4) {
    return true;
  }

  return /\b(when\??|why\??|how\??|are you sure|what about|and then|more clearly|explain that|what do you mean)\b/i.test(
    normalized,
  );
}

function inferIntentFromChartContext(chartContext?: ChartContext): PredictaUserIntent | null {
  const chartType = chartContext?.chartType;
  if (!chartType) {
    return null;
  }

  if (chartType === 'D10') {
    return 'career';
  }

  if (chartType === 'D9') {
    return 'relationship';
  }

  if (chartType === 'D20') {
    return 'spirituality';
  }

  return 'chart_explanation';
}

function rankIntents(
  message: string,
  history?: ConversationTurn[],
  chartContext?: ChartContext,
  memory?: AstrologyMemory,
): { ranked: PredictaUserIntent[]; citedSignals: string[]; confidence: number } {
  const scores = new Map<PredictaUserIntent, number>();
  const citedSignals: string[] = [];
  const normalized = normalize(message);
  const recentTurns = getRecentUserTurns(history);

  for (const signal of INTENT_SIGNALS) {
    if (signal.pattern.test(normalized)) {
      scores.set(signal.intent, (scores.get(signal.intent) ?? 0) + signal.weight);
      citedSignals.push(signal.signal);
    }
  }

  const chartIntent = inferIntentFromChartContext(chartContext);
  if (chartIntent) {
    scores.set(chartIntent, (scores.get(chartIntent) ?? 0) + 2);
    citedSignals.push('chart_context');
  }

  if (recentTurns.length > 0) {
    for (let index = recentTurns.length - 1; index >= 0; index -= 1) {
      for (const signal of INTENT_SIGNALS) {
        if (signal.pattern.test(recentTurns[index])) {
          scores.set(signal.intent, (scores.get(signal.intent) ?? 0) + 1);
        }
      }
    }
  }

  if (memory?.lastIntent) {
    scores.set(memory.lastIntent, (scores.get(memory.lastIntent) ?? 0) + 1);
    citedSignals.push('memory_last_intent');
  }

  if (scores.size === 0) {
    scores.set('general_question', 1);
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([intent]) => intent);

  const topScore = scores.get(ranked[0]) ?? 1;
  return {
    ranked,
    citedSignals,
    confidence: Math.min(0.98, 0.45 + topScore * 0.1),
  };
}

export function detectEmotionalTone(
  message: string,
  history?: ConversationTurn[],
  memory?: AstrologyMemory,
): PredictaEmotionalTone {
  const normalized = normalize(message);

  for (const signal of EMOTIONAL_TONE_SIGNALS) {
    if (signal.pattern.test(normalized)) {
      return signal.tone;
    }
  }

  const recentTurns = getRecentUserTurns(history);
  for (let index = recentTurns.length - 1; index >= 0; index -= 1) {
    for (const signal of EMOTIONAL_TONE_SIGNALS) {
      if (signal.pattern.test(recentTurns[index])) {
        return signal.tone;
      }
    }
  }

  return memory?.emotionalTone ?? 'neutral';
}

export function detectPredictaIntent(input: {
  message: string;
  history?: ConversationTurn[];
  chartContext?: ChartContext;
  memory?: AstrologyMemory;
}): IntentDetectionResult {
  const { ranked, citedSignals, confidence } = rankIntents(
    input.message,
    input.history,
    input.chartContext,
    input.memory,
  );
  const isFollowUp = detectFollowUp(input.message, input.history);
  const emotionalTone = detectEmotionalTone(
    input.message,
    input.history,
    input.memory,
  );

  let primaryIntent = ranked[0] ?? 'general_question';
  if (
    isFollowUp &&
    primaryIntent === 'general_question' &&
    (input.memory?.lastIntent || ranked[1])
  ) {
    primaryIntent = input.memory?.lastIntent ?? ranked[1] ?? 'follow_up';
    citedSignals.push('follow_up_resolution');
  }

  return {
    primaryIntent,
    secondaryIntents: ranked.slice(1, 3),
    emotionalTone,
    isFollowUp,
    confidence,
    citedSignals: [...new Set(citedSignals)],
  };
}
