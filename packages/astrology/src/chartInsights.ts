import type { ChartData, ChartType } from '@pridicta/types';
import { getChartConfig } from './chartRegistry';
import { getChartReadingNote } from './vargaInterpretation';

export type ChartInsightDepth = 'free' | 'premium';

export type ChartInsight = {
  title: string;
  eyebrow: string;
  governs: string;
  whatItSays: string;
  mainStrength: string;
  mainChallenge: string;
  lifeAreas: string[];
  currentGuidance: string;
  freeInsights: string[];
  premiumDeepDive: string[];
  technicalSummary: string;
  technicalDetails: string[];
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
  const corePlanetsByHouse = chart.planetDistribution
    .filter(
      planet =>
        planet.kind !== 'modern' &&
        planet.kind !== 'sensitive' &&
        planet.kind !== 'upagraha',
    )
    .reduce<Record<number, string[]>>((accumulator, planet) => {
      const bucket = accumulator[planet.house] ?? [];
      bucket.push(planet.name);
      accumulator[planet.house] = bucket;
      return accumulator;
    }, {});
  const occupiedClusters = Object.entries(corePlanetsByHouse)
    .filter(([, planets]) => planets.length > 0)
    .sort((first, second) => second[1].length - first[1].length);
  const occupiedHouseCount = occupiedClusters.length;
  const strongestHouses = occupiedClusters
    .slice(0, 3)
    .map(
      ([house, planets]) =>
        `${chart.chartType} house ${house}: ${planets.join(', ')}`,
    );
  const primaryCluster = occupiedClusters[0];
  const primaryHouse = primaryCluster ? Number(primaryCluster[0]) : undefined;
  const primaryPlanets = primaryCluster?.[1] ?? [];
  const focus = CHART_FOCUS[chart.chartType];
  const readingNote = getChartReadingNote(chart.chartType);
  const lifeAreas = deriveLifeAreas(config.purpose);
  const clusterMeaning = primaryHouse
    ? `the strongest concentration is around house ${primaryHouse}${primaryPlanets.length ? ` with ${primaryPlanets.join(', ')}` : ''}`
    : 'no single house is dominating the preview, so the chart should be read more carefully with D1 and timing support';
  const governs = config.purpose;
  const whatItSays = primaryHouse
    ? `This chart is currently saying that ${clusterMeaning}, which makes this part of life speak louder than the rest.`
    : `This chart is currently saying that the story here is subtle, so timing, D1 anchoring, and patient interpretation matter more than dramatic claims.`;
  const mainStrength = primaryHouse
    ? `Your clearest strength here is the focused pull around house ${primaryHouse}, because clustered placements usually make this area easier to notice and work with.`
    : 'Your strength here is restraint: this chart is not screaming, so it can be judged carefully without panic or overstatement.';
  const mainChallenge =
    occupiedHouseCount >= 4
      ? 'The challenge here is scattered pressure across multiple houses, so this area can feel split until priorities become clearer.'
      : chart.chartType === 'D1'
      ? 'The challenge is not to reduce your whole life chart to one loud placement. D1 still needs balance across houses, timing, and maturity.'
      : `The challenge is not to treat ${chart.chartType} like a standalone life chart. It still needs D1 as the root anchor.`;
  const currentGuidance =
    chart.chartType === 'D1'
      ? 'Use this chart to understand the main life pattern first, then ask Predicta about the specific area that feels most urgent right now.'
      : `Use ${chart.chartType} as a focused lens, then compare it with D1 before making a strong conclusion.`;
  const freeInsights = [
    primaryHouse
      ? `Start with the loudest signal: ${clusterMeaning}.`
      : 'Start with the overall mood of the chart instead of hunting for one dramatic placement.',
    occupiedHouseCount
      ? `${occupiedHouseCount} houses are active in this chart, so the reading should stay grounded in what is actually emphasized.`
      : 'This preview is quiet, so the chart should be read conservatively.',
    chart.chartType === 'D1'
      ? 'This is the root chart, so it tells you where the main life story is taking shape.'
      : `This chart refines one area of life. It becomes more useful when it is compared with D1 and timing.`,
    `The most useful question to ask next is how this chart affects ${lifeAreas.slice(0, 2).join(' and ')}.`,
  ];
  const premiumDeepDive = [
    `Premium reads ${chart.chartType} with D1 anchoring, timing support, and confidence framing instead of stopping at placement labels.`,
    primaryHouse
      ? `Premium explains how house ${primaryHouse} supports, stretches, or complicates the rest of the chart.`
      : 'Premium clarifies whether this quieter chart is supportive, mixed, or timing-sensitive.',
    'Premium also adds deeper synthesis, contradiction handling, and report-ready interpretation.',
  ];
  const technicalSummary = hasPremiumAccess
    ? `Technical View keeps the evidence layer visible while Premium adds deeper synthesis for ${config.name}.`
    : `Technical View keeps the evidence layer visible, while the default Insight View explains what ${config.name} is trying to say in plain language.`;
  const technicalDetails = [
    chart.chartType === 'D1'
      ? `D1 focuses on ${focus}.`
      : `${chart.chartType} focuses on ${focus}, and should be judged through D1 first.`,
    `${occupiedHouseCount} houses have planet placements in this chart.`,
    strongestHouses.length
      ? `Placement clusters: ${strongestHouses.join('; ')}.`
      : 'No planet-heavy house stands out in this chart preview.',
    readingNote,
    chart.chartType === 'D1'
      ? 'D1 remains the root chart for all predictions.'
      : `Read ${chart.chartType} together with D1; never judge this area from the varga alone.`,
  ];

  if (!chart.supported) {
    return {
      eyebrow: 'Careful reading',
      currentGuidance:
        'Use the prepared charts for active prediction while this chart stays in a lighter, more careful state.',
      freeInsights: [
        'Predicta is keeping this chart conservative until the evidence is complete.',
        'The point is to avoid fake certainty, not to hide the chart.',
      ],
      governs: config.purpose,
      lifeAreas,
      mainChallenge:
        'This chart should not be overstated before the full evidence is ready.',
      mainStrength:
        'The chart is still visible, so you can understand its purpose before deeper calculation is available.',
      premiumDeepDive: [
        'Premium should only go deeper after the chart evidence is complete.',
      ],
      technicalDetails: [
        'Predicta shows this chart and keeps the reading conservative until the chart evidence is complete.',
        'Use the prepared charts for prediction while this chart receives a lighter explanation.',
      ],
      technicalSummary:
        'This chart is listed with a lighter explanation until the full evidence is ready.',
      title: config.name,
      whatItSays:
        chart.unsupportedReason ??
        'This chart is visible, but Predicta is keeping the interpretation careful until the full evidence is ready.',
    };
  }

  return {
    currentGuidance,
    eyebrow: hasPremiumAccess ? 'Premium detailed analysis' : 'Free useful insight',
    freeInsights,
    governs,
    lifeAreas,
    mainChallenge,
    mainStrength,
    premiumDeepDive,
    premiumNudge:
      'Premium turns this into layered chart synthesis with D1 anchoring, timing, strength checks, and report-ready guidance.',
    technicalDetails,
    technicalSummary,
    title: config.name,
    whatItSays,
  };
}

function deriveLifeAreas(purpose: string): string[] {
  return purpose
    .replace(/\.$/, '')
    .split(/,| and /)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}
