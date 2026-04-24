import type { ChartContext, KundliData } from '@pridicta/types';
import { detectDecisionIntent } from './decisionMirror';

const SMALL_TALK_ONLY_PATTERN =
  /^(?:hi|hello|hey|hey there|hello there|hi there|yo|namaste|good morning|good afternoon|good evening|good night|how are you|how are you doing|are you there|thanks|thank you|ok|okay|cool|nice)(?:\s+(?:predicta|pridicta))?[!?.\s]*$/i;

const ASTROLOGY_CUE_PATTERN =
  /\b(chart|kundli|horoscope|dasha|lagna|nakshatra|career|marriage|relationship|love|planet|report|pdf|prediction|predict|future|transit|remed(?:y|ies))\b/i;

function normalizePrompt(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

const PREDICTA_INTRO_MESSAGES = [
  'Hello. I am Predicta. Ask a life question, explore a report, or share your birth details when you are ready.',
  'Welcome. I can help with chart questions, timing patterns, report guidance, or a focused life decision.',
  'Hello. Start with what feels most important right now, and I will keep the guidance calm and clear.',
  'I am here for thoughtful chart guidance, practical timing questions, and steady follow-up.',
  'Bring me a chart question, a life crossroads, or your birth details, and we can begin from there.',
  'Hello. We can start with your kundli, a relationship question, a work decision, or a report you want to understand.',
  'If something feels unclear, ask directly. I will help you sort the signal from the noise.',
  'I am here to make deep astrology easier to follow, without turning it into pressure or confusion.',
  'Ask about timing, career, relationships, a report section, or the bigger pattern you are trying to understand.',
  'Hello. If your chart is ready, I can read from it. If not, I can still help you frame the right next question.',
  'You can begin with one clear question. I will keep the answer grounded, useful, and easy to revisit.',
  'If you are unsure where to begin, tell me what has been on your mind lately and I will help narrow the focus.',
  'I can help with chart interpretation, life direction, report clarity, and decision support when the question is honest and specific.',
  'Hello. We can take this one layer at a time, from a simple question to a deeper reading.',
  'Bring me the question behind the noise. I will keep the guidance steady and practical.',
  'If you want a true chart reading, we can start from your birth details. If not, begin with the life question itself.',
  'Ask from the heart or ask from the chart. Either way, I will keep the reading thoughtful and clear.',
  'Hello. I am here to help you understand patterns, timing, and choices without turning the reading into theatre.',
];

const CHART_READY_SUFFIXES = [
  'Your chart is open, so I can anchor the guidance to it when needed.',
  'I already have your kundli in view, so we can go straight to the meaningful part.',
  'Your chart is ready, which means I can keep the reading tied to real placements and timing.',
  'I have your kundli available, so chart-specific questions can stay grounded in the actual data.',
];

function getRandomItem(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}

export function getRandomPredictaIntro(options?: {
  hasKundli?: boolean;
}): string {
  const intro = getRandomItem(PREDICTA_INTRO_MESSAGES);

  if (!options?.hasKundli) {
    return intro;
  }

  return `${intro} ${getRandomItem(CHART_READY_SUFFIXES)}`;
}

export function isSmallTalkPrompt(input: string): boolean {
  const normalized = normalizePrompt(input);
  if (!normalized) {
    return false;
  }

  if (ASTROLOGY_CUE_PATTERN.test(normalized)) {
    return false;
  }

  return SMALL_TALK_ONLY_PATTERN.test(normalized);
}

export function buildSmallTalkResponse(
  input: string,
  options?: {
    hasKundli?: boolean;
    chartContext?: ChartContext;
  },
): string {
  const normalized = normalizePrompt(input).toLowerCase();
  const hasKundli = Boolean(options?.hasKundli);
  const chartLabel =
    options?.chartContext?.chartType ?? options?.chartContext?.chartName;
  const guidanceHint = hasKundli
    ? chartLabel
      ? `If you want, we can look at ${chartLabel} or any life question you want to explore.`
      : 'If you want, we can look at your chart or any life question you want to explore.'
    : 'If you want, tell me your birth details or ask a focused life question and I will guide you from there.';

  if (normalized.includes('how are you')) {
    return `I am here and ready with you. ${guidanceHint}`;
  }

  if (normalized.includes('thank')) {
    return 'Always. Take your time, and ask when you are ready.';
  }

  return `Hello. I am here. ${guidanceHint}`;
}

export function buildNoKundliResponse(input: string): string {
  const normalized = normalizePrompt(input);

  if (isSmallTalkPrompt(normalized)) {
    return buildSmallTalkResponse(normalized, {
      hasKundli: false,
    });
  }

  if (/\b(chart|kundli|horoscope|reading|analy[sz]e|analysis|birth chart)\b/i.test(normalized)) {
    return 'I do not have your kundli yet, so I will not guess from a chart that is not there. Share your birth date, exact birth time, and birth place when you are ready, and I can read from the real chart after that.';
  }

  if (/\b(dasha|lagna|nakshatra|planet|house|placement|D\d+)\b/i.test(normalized)) {
    return 'I can explain what those chart factors mean, but I cannot read them as yours until your kundli is created. Share your birth date, exact birth time, and birth place if you want a real chart-based reading.';
  }

  return 'I can help with a focused life question right away. If you want a real chart reading, I will need your birth date, exact birth time, and birth place first.';
}

export function buildPredictaWaitingMessage(
  input: string,
  chartContext?: ChartContext,
  options?: {
    hasKundli?: boolean;
  },
): string {
  const normalized = normalizePrompt(input);
  const hasKundli = options?.hasKundli ?? true;

  if (isSmallTalkPrompt(normalized)) {
    return 'Listening...';
  }

  if (!hasKundli) {
    if (/\b(chart|kundli|horoscope|reading|analy[sz]e|analysis)\b/i.test(normalized)) {
      return 'Getting clear on what you want to explore first...';
    }

    if (/\b(date|time|place|birth)\b/i.test(normalized)) {
      return 'Reading the birth details you shared...';
    }

    return 'Thinking through the best place to begin...';
  }

  if (/\b(pdf|report|summary|download)\b/i.test(normalized)) {
    return 'Pulling the clearest points into one summary...';
  }

  if (
    chartContext?.chartType &&
    (/\b(d\d+|chart|show|placement|planet|house|lagna|nakshatra|dasha|timing|career|relationship)\b/i.test(
      normalized,
    ) ||
      normalized.includes(chartContext.chartType.toLowerCase()))
  ) {
    return `Checking the ${chartContext.chartType} signals that matter most...`;
  }

  const decisionIntent = detectDecisionIntent(normalized, chartContext);
  if (decisionIntent.isDecisionQuestion) {
    return 'Weighing both sides of your question...';
  }

  if (/\bdasha|timing|period\b/i.test(normalized)) {
    return 'Checking the timing patterns around your question...';
  }

  if (/\bcareer|job|work|business|profession\b/i.test(normalized)) {
    return 'Tracing the strongest work and timing signals...';
  }

  if (/\blove|marriage|relationship|partner\b/i.test(normalized)) {
    return 'Looking at the emotional and relationship patterns around this...';
  }

  return 'Thinking through your question...';
}

export function buildLocalPredictaFallback(
  message: string,
  kundli?: KundliData,
  chartContext?: ChartContext,
): string {
  if (isSmallTalkPrompt(message)) {
    return buildSmallTalkResponse(message, {
      chartContext,
      hasKundli: Boolean(kundli),
    });
  }

  if (!kundli) {
    return buildNoKundliResponse(message);
  }

  const currentDasha = kundli.dasha.current;
  const strongestHouses = kundli.ashtakavarga.strongestHouses.join(', ');
  const hasSelectedChart =
    Boolean(chartContext?.chartType) &&
    Boolean(chartContext?.chartType && kundli.charts[chartContext.chartType]);
  const opening = hasSelectedChart && chartContext?.chartType
    ? `I will begin from ${chartContext.chartType}, because that is the clearest lens for this question.`
    : 'I will start from the birth chart and quietly cross-check the supporting chart factors.';

  return [
    opening,
    `The current ${currentDasha.mahadasha} / ${currentDasha.antardasha} period asks for steady choices, clear boundaries, and actions that can hold over time.`,
    `Your strongest ashtakavarga support is around houses ${strongestHouses}, so progress is more reliable when it comes from structure and visible effort rather than pressure.`,
    `On your question, "${normalizePrompt(
      message,
    )}", the calm reading is this: choose the next step that reduces confusion, protects dignity, and keeps your long-term direction intact.`,
  ].join('\n\n');
}
