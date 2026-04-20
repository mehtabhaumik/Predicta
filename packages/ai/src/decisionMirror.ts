import type {
  ChartContext,
  DecisionIntentResult,
  DecisionMirrorDepth,
  DecisionMirrorResponse,
  KundliData,
  UserPlan,
} from '@pridicta/types';
import { buildStableCacheKey } from '@pridicta/utils';

const DECISION_PATTERNS = [
  /\bshould\s+i\b/i,
  /\bdo\s+i\s+(choose|accept|leave|move|start|buy|sell|invest|marry|wait)\b/i,
  /\bwhich\s+(option|path|choice|job|offer)\b/i,
  /\b(decide|decision|confused|choose|choice|option)\b/i,
  /\b(accept|reject|resign|relocate|marry|invest|purchase|business)\b/i,
];

const DEEP_DECISION_PATTERNS = [
  /\bmarriage|divorce|relocation|business|investment|resign|career switch\b/i,
  /\bnext\s+\d+\s+(months?|years?)\b/i,
  /\bmultiple|compare|between|versus|vs\.?\b/i,
  /\bdasha|D9|D10|chart|kundli\b/i,
];

export function detectDecisionIntent(
  question: string,
  chartContext?: ChartContext,
): DecisionIntentResult {
  const normalized = question.trim();
  const reasons: string[] = [];
  let confidence = 0;

  for (const pattern of DECISION_PATTERNS) {
    if (pattern.test(normalized)) {
      confidence += 0.22;
      reasons.push('decision_language');
      break;
    }
  }

  if (/\?/.test(normalized)) {
    confidence += 0.12;
  }

  if (chartContext?.chartType || chartContext?.selectedSection) {
    confidence += 0.12;
    reasons.push('chart_context');
  }

  const deepSignals = DEEP_DECISION_PATTERNS.filter(pattern =>
    pattern.test(normalized),
  ).length;

  if (deepSignals > 0) {
    confidence += Math.min(0.28, deepSignals * 0.14);
    reasons.push('high_impact_decision');
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 18) {
    confidence += 0.1;
    reasons.push('multi_part_question');
  }

  return {
    confidence: Math.min(0.98, confidence),
    isDecisionQuestion: confidence >= 0.34,
    reasons: [...new Set(reasons)],
    suggestedDepth:
      deepSignals > 0 || wordCount >= 22 || chartContext?.chartType
        ? 'EXPANDED'
        : 'FREE',
  };
}

export function getDecisionMirrorDepth({
  chartContext,
  hasPremiumAccess,
  question,
}: {
  chartContext?: ChartContext;
  hasPremiumAccess: boolean;
  question: string;
}): DecisionMirrorDepth {
  const detected = detectDecisionIntent(question, chartContext);

  return hasPremiumAccess && detected.suggestedDepth === 'EXPANDED'
    ? 'EXPANDED'
    : 'FREE';
}

export function selectDecisionMirrorPlan({
  depth,
  userPlan,
}: {
  depth: DecisionMirrorDepth;
  userPlan: UserPlan;
}): UserPlan {
  return depth === 'EXPANDED' ? userPlan : 'FREE';
}

export function buildDecisionMirrorCacheKey({
  chartContext,
  depth,
  kundli,
  question,
}: {
  chartContext?: ChartContext;
  depth: DecisionMirrorDepth;
  kundli: KundliData;
  question: string;
}): string {
  return buildStableCacheKey(
    {
      chartContext: chartContext ?? null,
      depth,
      inputHash: kundli.calculationMeta.inputHash,
      kundliId: kundli.id,
      question: normalizeDecisionQuestion(question),
      type: 'decision-mirror-v1',
    },
    'decision-mirror',
  );
}

export function buildDecisionMirrorResponse({
  chartContext,
  depth,
  generatedAt = new Date().toISOString(),
  kundli,
  question,
}: {
  chartContext?: ChartContext;
  depth: DecisionMirrorDepth;
  generatedAt?: string;
  kundli: KundliData;
  question: string;
}): DecisionMirrorResponse {
  const currentDasha = kundli.dasha.current;
  const strongest = kundli.ashtakavarga.strongestHouses;
  const weakest = kundli.ashtakavarga.weakestHouses;
  const chartFocus = chartContext?.chartType
    ? `${chartContext.chartType}${chartContext.chartName ? ` ${chartContext.chartName}` : ''}`
    : chartContext?.selectedSection ?? 'D1 with D9/D10 cross-check when relevant';
  const supportive = [
    `${kundli.lagna} lagna keeps the decision anchored in identity, timing, and practical responsibility.`,
    `${currentDasha.mahadasha}/${currentDasha.antardasha} dasha asks for steady timing rather than emotional urgency.`,
    `Ashtakavarga support around houses ${strongest.slice(0, 3).join(', ') || 'pending'} favors choices with visible effort and repeatable structure.`,
    `The active context is ${chartFocus}, so this mirror keeps that lens in front before broadening.`,
  ];
  const cautions = [
    `Pressure around houses ${weakest.slice(0, 2).join(', ') || 'pending'} suggests avoiding decisions made only to escape discomfort.`,
    'If the choice needs secrecy, urgency, or emotional bargaining, slow the pace and verify the facts first.',
    'A good decision should protect dignity, health, and long-term dharma, not just solve today’s anxiety.',
  ];

  return {
    cacheKey: buildDecisionMirrorCacheKey({
      chartContext,
      depth,
      kundli,
      question,
    }),
    cautionFactors: depth === 'EXPANDED' ? cautions : cautions.slice(0, 2),
    decisionSummary: `You are asking for a mirror on: "${summarizeQuestion(question)}". The balanced view is to choose the path that improves stability without forcing certainty.`,
    depth,
    disclaimer:
      'This is guidance for reflection, not certainty or a guaranteed outcome. Use it with real-world facts and your own judgment.',
    emotionalBiasCheck:
      'Ask yourself whether the strongest emotion here is clarity, fear, guilt, or pressure. If it is pressure, pause before committing.',
    generatedAt,
    practicalNextStep:
      'Write the two realistic options, one risk for each, and one reversible next action you can take within 48 hours.',
    revisitLater:
      depth === 'EXPANDED'
        ? `Revisit this after ${currentDasha.antardasha} pressure changes, or sooner if new facts arrive.`
        : 'Revisit after one calm conversation or one night of sleep, especially if the decision still feels rushed.',
    supportiveChartFactors:
      depth === 'EXPANDED' ? supportive : supportive.slice(0, 2),
    timingWindows: buildTimingWindows(kundli, depth),
  };
}

export function formatDecisionMirrorText(response: DecisionMirrorResponse): string {
  return [
    'Decision Mirror',
    '',
    `Decision summary: ${response.decisionSummary}`,
    '',
    `Supportive factors: ${response.supportiveChartFactors.join(' ')}`,
    '',
    `Caution factors: ${response.cautionFactors.join(' ')}`,
    '',
    `Practical next step: ${response.practicalNextStep}`,
    '',
    `Emotional bias check: ${response.emotionalBiasCheck}`,
    '',
    `Revisit later: ${response.revisitLater}`,
    '',
    response.disclaimer,
  ].join('\n');
}

export function validateDecisionMirrorResponse(
  response: DecisionMirrorResponse,
): boolean {
  return Boolean(
    response.decisionSummary &&
      response.supportiveChartFactors.length > 0 &&
      response.cautionFactors.length > 0 &&
      response.timingWindows.length > 0 &&
      response.practicalNextStep &&
      response.emotionalBiasCheck &&
      response.revisitLater &&
      response.disclaimer.includes('not certainty') &&
      response.cacheKey,
  );
}

function buildTimingWindows(
  kundli: KundliData,
  depth: DecisionMirrorDepth,
): DecisionMirrorResponse['timingWindows'] {
  const current = kundli.dasha.current;
  const windows = [
    {
      endDate: current.endDate,
      focus: `Use the current ${current.mahadasha}/${current.antardasha} period for fact-checking and sober commitment.`,
      label: 'Current dasha window',
      startDate: current.startDate,
    },
    {
      focus:
        'If the decision still feels emotionally noisy, wait for a quieter review point before making it irreversible.',
      label: 'Pause and review',
    },
  ];

  return depth === 'EXPANDED'
    ? [
        ...windows,
        {
          focus:
            'A deeper reading should compare D1, D9, D10, current dasha, and the practical facts around the decision.',
          label: 'Premium cross-check',
        },
      ]
    : windows;
}

function normalizeDecisionQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, ' ');
}

function summarizeQuestion(question: string): string {
  const normalized = question.trim().replace(/\s+/g, ' ');
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}
