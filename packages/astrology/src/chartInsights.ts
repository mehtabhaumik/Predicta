import type { ChartData, ChartType } from '@pridicta/types';
import { getChartConfig } from './chartRegistry';

export type ChartInsightDepth = 'free' | 'premium';

export type ChartInsight = {
  title: string;
  eyebrow: string;
  summary: string;
  bullets: string[];
  premiumNudge?: string;
};

const CHART_FOCUS: Record<ChartType, string> = {
  D1: 'body, identity, life direction, houses, and visible karma',
  D2: 'wealth handling, resources, and money temperament',
  D3: 'courage, siblings, effort, and practical stamina',
  D4: 'home, property, fixed assets, and inner stability',
  D5: 'authority, recognition, merit, and leadership',
  D6: 'obstacles, health discipline, competition, and service',
  D7: 'children, creativity, legacy, and generational blessings',
  D8: 'sudden changes, transformation, and hidden pressure',
  D9: 'marriage, dharma, maturity, and deeper planet strength',
  D10: 'career, public work, authority, and contribution',
  D11: 'gains, networks, ambitions, and fulfillment',
  D12: 'parents, lineage, inherited tendencies, and family karma',
  D13: 'subtle comforts and material supports',
  D15: 'character refinement and subtle personal fortune',
  D16: 'vehicles, comforts, luxuries, and enjoyment',
  D17: 'influence, authority, and fine-grained success strength',
  D18: 'inner conflicts, hidden weaknesses, and karmic vulnerabilities',
  D19: 'fulfillment, subtle prosperity, and spiritual tendencies',
  D20: 'spiritual practice, mantra, devotion, and inner discipline',
  D21: 'karmic extremes, fortune, and dharmic pressure',
  D22: 'strength, vulnerability, accidents, and protection',
  D23: 'subtle support, mental steadiness, and refined fortune',
  D24: 'education, learning, teachers, and study discipline',
  D25: 'spiritual strength, endurance, and subtle karmic merit',
  D26: 'refined discomforts and correction points',
  D27: 'physical and mental strength, vitality, courage, and stamina',
  D28: 'hidden adversity, restraint, and deep karmic tests',
  D29: 'fine karmic outcomes, subtle gains, and unseen support',
  D30: 'stress patterns, misfortune signatures, and protection needs',
  D31: 'fine-grained vulnerabilities and inner purification',
  D32: 'strength distribution, hardship, and endurance',
  D33: 'subtle fortune and micro-patterns in timing',
  D34: 'specific karmic texture and correction points',
  D40: 'maternal lineage, auspiciousness, and inherited blessings',
  D45: 'paternal lineage, character, honor, and family merit',
  D60: 'deep karmic root, destiny texture, and hidden causes',
};

export function composeChartInsight({
  chart,
  hasPremiumAccess,
}: {
  chart: ChartData;
  hasPremiumAccess: boolean;
}): ChartInsight {
  const config = getChartConfig(chart.chartType);
  const occupiedHouseCount = Object.values(chart.housePlacements).filter(
    planets => planets.length > 0,
  ).length;
  const strongestHouses = Object.entries(chart.housePlacements)
    .filter(([, planets]) => planets.length > 0)
    .slice(0, 3)
    .map(([house, planets]) => `House ${house}: ${planets.join(', ')}`);
  const focus = CHART_FOCUS[chart.chartType];

  if (!chart.supported) {
    return {
      bullets: [
        'Predicta shows this chart in the vault, but does not pretend the formula is verified yet.',
        'Use verified charts for prediction until this varga is enabled.',
      ],
      eyebrow: 'Formula not verified',
      summary:
        chart.unsupportedReason ??
        'This divisional chart is listed, but the calculation engine has not enabled a verified formula yet.',
      title: config.name,
    };
  }

  if (!hasPremiumAccess) {
    return {
      bullets: [
        `${chart.chartType} focuses on ${focus}.`,
        `${occupiedHouseCount} houses have planet placements in this chart.`,
        strongestHouses.length
          ? `Useful starting points: ${strongestHouses.join('; ')}.`
          : 'No planet-heavy house stands out in this chart preview.',
        chart.chartType === 'D1'
          ? 'D1 remains the root chart for all predictions.'
          : `Read ${chart.chartType} together with D1; never judge this area from the varga alone.`,
      ],
      eyebrow: 'Free useful insight',
      premiumNudge:
        'Premium turns this into detailed chart synthesis with D1 anchoring, dasha timing, strength checks, and report-ready guidance.',
      summary: `This free view gives the practical purpose of ${config.name} and the main placement pattern without deep prediction.`,
      title: config.name,
    };
  }

  return {
    bullets: [
      `${chart.chartType} focuses on ${focus}, and should be judged through D1 first.`,
      `Ascendant sign in this chart is ${chart.ascendantSign}, setting the lens for this area.`,
      strongestHouses.length
        ? `Detailed placement clusters: ${strongestHouses.join('; ')}.`
        : 'Detailed strength needs dignity, dasha, and D1 comparison because no house is heavily occupied.',
      'Premium analysis should compare this chart with D1 houses, dasha activation, planet dignity, and timing windows.',
      'For predictions, use this varga as confirmation, not as a standalone replacement for D1.',
    ],
    eyebrow: 'Premium detailed analysis',
    summary: `Premium depth reads ${config.name} as a real synthesis layer: D1 anchor, varga placements, dasha activation, confidence, and practical next steps.`,
    title: config.name,
  };
}
