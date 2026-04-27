import type {
  AstrologyMemory,
  ChartContext,
  IntentDetectionResult,
  KundliData,
  PredictaResponseValidationResult,
  AstrologyReasoningContext,
} from '@pridicta/types';
import {
  resolveKundliState,
} from './kundliStateResolver';

const GENERIC_FILLER_PATTERNS = [
  /\bthe real pressure is usually\b/i,
  /\bsay it in one plain sentence\b/i,
  /\bwe can begin without pretending\b/i,
  /\bbased on the provided data\b/i,
  /\bthis depends on several factors\b/i,
  /\bthis is a common concern\b/i,
  /\bseek clarity about\b/i,
];

const REPEATED_INTAKE_PATTERNS = [
  /\btell me your birth details\b/i,
  /\bsend your date of birth\b/i,
  /\bsend your birth time\b/i,
  /\bsend your birth place\b/i,
  /\bgive me your birth details\b/i,
];

const MISSING_CHART_PATTERNS = [
  /\bi do not have your chart\b/i,
  /\bi don't have your chart\b/i,
  /\bwithout your chart\b/i,
  /\bmissing your actual d\d+\b/i,
  /\bonly have your d1\b/i,
  /\bi(?:'ll| will) need your .*kundli\b/i,
  /\bi(?:'ll| will) need your .*navamsa\b/i,
];

const ASTROLOGY_MARKERS = [
  /\bd1\b/i,
  /\bd2\b/i,
  /\bd9\b/i,
  /\bd10\b/i,
  /\bd20\b/i,
  /\bdasha\b/i,
  /\btransit\b/i,
  /\bhouse\b/i,
  /\bhouses\b/i,
  /\blord\b/i,
  /\blagna\b/i,
  /\bnakshatra\b/i,
  /\bnavamsha\b/i,
  /\bdashamsha\b/i,
  /\bvenus\b/i,
  /\bjupiter\b/i,
  /\bsaturn\b/i,
  /\bsun\b/i,
  /\bmoon\b/i,
  /\bmercury\b/i,
  /\bmars\b/i,
  /\brahu\b/i,
  /\bketu\b/i,
];

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function extractReasoningKeywords(
  reasoningContext?: AstrologyReasoningContext,
  chartContext?: ChartContext,
): string[] {
  const keywords = new Set<string>();

  for (const chart of reasoningContext?.primaryCharts ?? []) {
    keywords.add(chart.toLowerCase());
  }
  for (const chart of reasoningContext?.secondaryCharts ?? []) {
    keywords.add(chart.toLowerCase());
  }
  for (const factor of reasoningContext?.relevantFactors ?? []) {
    factor
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(token => token.length >= 3)
      .forEach(token => keywords.add(token));
  }
  if (chartContext?.chartType) {
    keywords.add(chartContext.chartType.toLowerCase());
  }
  if (chartContext?.selectedPlanet) {
    keywords.add(chartContext.selectedPlanet.toLowerCase());
  }

  return [...keywords];
}

function hasAstrologyAnchor(input: {
  text: string;
  kundli?: KundliData;
  chartContext?: ChartContext;
  reasoningContext?: AstrologyReasoningContext;
}): boolean {
  const normalized = normalize(input.text).toLowerCase();
  if (ASTROLOGY_MARKERS.some(pattern => pattern.test(normalized))) {
    return true;
  }

  const dynamicKeywords = extractReasoningKeywords(
    input.reasoningContext,
    input.chartContext,
  );

  return dynamicKeywords.some(keyword => normalized.includes(keyword));
}

export function validatePredictaResponse(input: {
  text: string;
  memory?: AstrologyMemory;
  kundli?: KundliData;
  chartContext?: ChartContext;
  intentProfile?: IntentDetectionResult;
  reasoningContext?: AstrologyReasoningContext;
}): PredictaResponseValidationResult {
  const reasons: string[] = [];
  const normalized = normalize(input.text);
  const kundliState = resolveKundliState({
    chartContext: input.chartContext,
    kundli: input.kundli,
    memory: input.memory,
  });
  const hasBirthDetails = Boolean(
    input.memory?.birthDetailsComplete ||
      input.memory?.birthDetails?.date ||
      input.memory?.birthDetails?.time ||
      input.memory?.birthDetails?.place,
  );

  if (GENERIC_FILLER_PATTERNS.some(pattern => pattern.test(normalized))) {
    reasons.push('generic_filler');
  }

  if (
    hasBirthDetails &&
    REPEATED_INTAKE_PATTERNS.some(pattern => pattern.test(normalized))
  ) {
    reasons.push('reasked_birth_details');
  }

  if (
    kundliState.kundliReady &&
    MISSING_CHART_PATTERNS.some(pattern => pattern.test(normalized))
  ) {
    reasons.push('denied_existing_chart');
  }

  if (
    kundliState.kundliReady &&
    !hasAstrologyAnchor({
      chartContext: input.chartContext,
      kundli: input.kundli,
      reasoningContext: input.reasoningContext,
      text: normalized,
    })
  ) {
    reasons.push('missing_astrology_anchor');
  }

  if (
    input.intentProfile?.isFollowUp &&
    /\b(start over|tell me your birth details|what is your question)\b/i.test(normalized)
  ) {
    reasons.push('lost_follow_up_thread');
  }

  if (
    !kundliState.kundliReady &&
    /\b(motivational|mindset|clarity|alignment)\b/i.test(normalized) &&
    !/\b(d1|d2|d9|d10|2nd|7th|10th|11th|jyotish|vedic)\b/i.test(normalized)
  ) {
    reasons.push('life_coach_tone');
  }

  return {
    reasons,
    requiresRegeneration: reasons.length > 0,
    valid: reasons.length === 0,
  };
}
