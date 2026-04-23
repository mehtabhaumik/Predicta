import type { ChartContext, KundliData } from '@pridicta/types';
import { detectDecisionIntent } from './decisionMirror';

const SMALL_TALK_ONLY_PATTERN =
  /^(?:hi|hello|hey|hey there|hello there|hi there|yo|namaste|good morning|good afternoon|good evening|good night|how are you|how are you doing|are you there|thanks|thank you|ok|okay|cool|nice)(?:\s+(?:predicta|pridicta))?[!?.\s]*$/i;

const ASTROLOGY_CUE_PATTERN =
  /\b(chart|kundli|horoscope|dasha|lagna|nakshatra|career|marriage|relationship|love|planet|report|pdf|prediction|predict|future|transit|remed(?:y|ies))\b/i;

function normalizePrompt(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
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

export function buildPredictaWaitingMessage(
  input: string,
  chartContext?: ChartContext,
): string {
  const normalized = normalizePrompt(input);

  if (isSmallTalkPrompt(normalized)) {
    return 'Listening...';
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
  kundli: KundliData,
  chartContext?: ChartContext,
): string {
  if (isSmallTalkPrompt(message)) {
    return buildSmallTalkResponse(message, {
      chartContext,
      hasKundli: true,
    });
  }

  const currentDasha = kundli.dasha.current;
  const strongestHouses = kundli.ashtakavarga.strongestHouses.join(', ');
  const opening = chartContext?.chartType
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
