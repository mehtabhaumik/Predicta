import type {
  BhavChalitPlanetPlacement,
  ChalitPlanetPlacement,
  ChartData,
  ChartType,
  KundliData,
} from '@pridicta/types';
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

export type ChartInsightProfile = 'default' | 'chalit';

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
  kundli,
  profile = 'default',
}: {
  chart: ChartData;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  profile?: ChartInsightProfile;
}): ChartInsight {
  const config = getChartConfig(chart.chartType);
  const lifeAreas = deriveLifeAreas(config.purpose);

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

  if (profile === 'chalit' && kundli) {
    return composeChalitChartInsight(kundli, hasPremiumAccess);
  }

  if (chart.chartType === 'D1' && kundli) {
    return composeD1ChartInsight(kundli, hasPremiumAccess);
  }

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

function composeD1ChartInsight(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const config = getChartConfig('D1');
  const dominantHouse = kundli.ashtakavarga.strongestHouses[0] ?? 1;
  const supportHouse = kundli.ashtakavarga.strongestHouses[1];
  const pressureHouse = kundli.ashtakavarga.weakestHouses[0] ?? 8;
  const currentDasha = kundli.dasha.current;
  const firstYoga = kundli.yogas[0];
  const dominantArea = formatHouseArea(dominantHouse);
  const supportArea = supportHouse ? formatHouseArea(supportHouse) : undefined;
  const pressureArea = formatHouseArea(pressureHouse);
  const lifeAreas = uniqueStrings([
    dominantArea,
    supportArea,
    pressureArea,
    'life direction',
  ]);

  return {
    currentGuidance: `Start with ${dominantArea} as the active growth zone, but protect ${pressureArea} so the strongest parts of the chart do not get drained by neglect.`,
    eyebrow: hasPremiumAccess ? 'Premium life-foundation analysis' : 'Free life-foundation insight',
    freeInsights: [
      `${kundli.lagna} Lagna gives the chart a ${signApproach(kundli.lagna)} approach to life.`,
      `${kundli.moonSign} Moon in ${kundli.nakshatra} shows how emotions, instinct, and inner timing tend to move.`,
      `The current life chapter is ${currentDasha.mahadasha}/${currentDasha.antardasha}, so the chart is asking for maturity around ${planetTheme(currentDasha.mahadasha)}.`,
      firstYoga
        ? `A notable pattern is ${firstYoga.name}, which adds a ${firstYoga.strength} emphasis around ${firstYoga.meaning.toLowerCase()}.`
        : `The strongest support right now is around ${dominantArea}, so that is where visible progress can build fastest.`,
    ],
    governs:
      'Your life foundation: identity, direction, relationships, work, family, and the visible karma pattern that everything else grows from.',
    lifeAreas,
    mainChallenge: `The pressure zone is ${pressureArea}, so this is where overreaction, delay, or emotional drain can distort the otherwise strong parts of the chart.`,
    mainStrength: supportArea
      ? `Your strongest pattern is the support around ${dominantArea} and ${supportArea}, so life responds better when you build from those areas instead of forcing weaker ones.`
      : `Your strongest pattern is the support around ${dominantArea}, so life responds better when you build from that area instead of forcing weaker ones.`,
    premiumDeepDive: [
      'Premium reads D1 through Lagna, Moon, dasha, yogas, and house strength together instead of stopping at one loud placement.',
      `Premium also explains how ${pressureArea} modifies the promise of ${dominantArea} across timing and maturity.`,
      'Premium then connects D1 with Chalit, core vargas, and practical next steps.',
    ],
    premiumNudge:
      'Premium turns D1 into a layered life reading with timing, contradictions, and cross-chart synthesis.',
    technicalDetails: [
      `Lagna: ${kundli.lagna}.`,
      `Moon sign: ${kundli.moonSign} in ${kundli.nakshatra}.`,
      `Current dasha: ${currentDasha.mahadasha}/${currentDasha.antardasha}.`,
      `Strong houses: ${kundli.ashtakavarga.strongestHouses.slice(0, 3).join(', ')}.`,
      `Pressure houses: ${kundli.ashtakavarga.weakestHouses.slice(0, 3).join(', ')}.`,
      firstYoga
        ? `Primary yoga noted: ${firstYoga.name} (${firstYoga.strength}).`
        : 'No single yoga is being promoted as the whole story here.',
      getChartReadingNote('D1'),
    ],
    technicalSummary:
      'Technical View keeps the D1 evidence layer visible: Lagna, Moon, dasha, house emphasis, and yogic support.',
    title: config.name,
    whatItSays: `${kundli.lagna} Lagna makes the life approach ${signApproach(kundli.lagna)}, and the chart is speaking most strongly through ${dominantArea}. ${kundli.moonSign} Moon adds an inner tone of ${moonStyle(kundli.moonSign)}, while ${currentDasha.mahadasha}/${currentDasha.antardasha} is pushing growth through ${planetTheme(currentDasha.mahadasha)}.`,
  };
}

function composeChalitChartInsight(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const shifts = kundli.chalit?.shifts ?? [];
  const currentDasha = kundli.dasha.current;
  const dashaShift =
    shifts.find(
      item =>
        item.planet === currentDasha.mahadasha ||
        item.planet === currentDasha.antardasha,
    ) ?? shifts[0];
  const shiftAreas = uniqueStrings(
    shifts
      .slice(0, 3)
      .flatMap(item => [formatHouseArea(item.rashiHouse), formatHouseArea(targetHouse(item))]),
  );
  const activeShiftText = dashaShift
    ? `${dashaShift.planet} shifts lived results from ${formatHouseArea(dashaShift.rashiHouse)} into ${formatHouseArea(targetHouse(dashaShift))}`
    : 'the lived house delivery is staying close to the D1 picture';

  return {
    currentGuidance: dashaShift
      ? `Read D1 for the promise, then use Chalit to judge how ${formatHouseArea(targetHouse(dashaShift))} is actually receiving the result right now.`
      : 'Use Chalit as a fine-tuning layer, not as an excuse to rewrite a D1 picture that is already delivering clearly.',
    eyebrow: hasPremiumAccess ? 'Premium lived-delivery analysis' : 'Free Chalit insight',
    freeInsights: shifts.length
      ? [
          `${shifts.length} planet${shifts.length === 1 ? '' : 's'} show meaningful house-delivery shifts in this chart.`,
          `${activeShiftText}, so lived experience may feel different from a plain D1 house reading.`,
          'The sign stays from D1. What changes here is the house that receives the result.',
          `The most useful next question is whether ${formatHouseArea(targetHouse(dashaShift ?? shifts[0]!))} is where life is actually becoming louder now.`,
        ]
      : [
          'This Chalit chart is not showing major delivery shifts, so the lived story is broadly aligned with the D1 picture.',
          'That is useful because it means you do not need a dramatic reinterpretation to understand the main life pattern.',
          'Use Chalit here as confirmation and fine judgement, not as a contradiction machine.',
        ],
    governs:
      'Real-life house delivery, activation shifts, and where planets actually deliver results after Lagna-degree bhava refinement.',
    lifeAreas: shiftAreas.length ? shiftAreas : ['life delivery', 'bhava emphasis', 'timing judgement'],
    mainChallenge: shifts.length
      ? 'The challenge is confusing sign meaning with house delivery. The sign stays from D1, but the result may land in a different house.'
      : 'The challenge is over-correcting a chart that is already behaving close to the D1 pattern.',
    mainStrength: shifts.length
      ? `The strength of Chalit is practical clarity: it shows that results are landing through ${formatHouseArea(targetHouse(dashaShift ?? shifts[0]!))}, not just where the plain D1 house picture begins.`
      : 'The strength here is stability: D1 promise and lived house delivery are largely aligned.',
    premiumDeepDive: [
      'Premium Chalit reads shifted planets, Lagna-degree bhavas, D1 dignity, and active dasha together.',
      dashaShift
        ? `Premium also judges why ${dashaShift.planet} is delivering through ${formatHouseArea(targetHouse(dashaShift))} and what that changes in real life.`
        : 'Premium confirms where Chalit agrees with D1 and where only subtle timing refinement is needed.',
      'Premium keeps Chalit separate from KP and avoids mixing cusp-sub-lord logic into a Parashari house-delivery read.',
    ],
    premiumNudge:
      'Premium turns Chalit into a real lived-delivery reading with D1 comparison, active dasha timing, and sharper judgement.',
    technicalDetails: [
      `Chalit shifts detected: ${shifts.length}.`,
      dashaShift
        ? `${dashaShift.planet}: D1 house ${dashaShift.rashiHouse} to Chalit house ${targetHouse(dashaShift)}.`
        : 'No major Chalit house-delivery shift is active in this preview.',
      `Cusps available: ${kundli.chalit?.cusps.length ?? 0}.`,
      `Current dasha: ${currentDasha.mahadasha}/${currentDasha.antardasha}.`,
      'Parashari Chalit keeps the D1 sign but refines the house that receives the result.',
      'This is separate from KP cusp/sub-lord event judgement.',
    ],
    technicalSummary:
      'Technical View keeps the bhava-shift evidence visible: shifted planets, cusp count, and the D1-versus-Chalit delivery rule.',
    title: 'Chalit Chart',
    whatItSays: shifts.length
      ? `This Chalit chart is saying that some results land in different life areas than the plain D1 house picture suggests. Right now ${activeShiftText}, so real life may feel more like ${formatHouseArea(targetHouse(dashaShift ?? shifts[0]!))} than expected from a simple D1-only reading.`
      : 'This Chalit chart is saying that lived experience is broadly aligned with the D1 picture, so the main story does not need dramatic reinterpretation right now.',
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

function targetHouse(
  item: BhavChalitPlanetPlacement | ChalitPlanetPlacement,
): number {
  return 'chalitHouse' in item ? item.chalitHouse : item.bhavHouse;
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

function formatHouseArea(house: number): string {
  return HOUSE_AREA_LABELS[house] ?? `house ${house}`;
}

function signApproach(sign: string): string {
  return SIGN_APPROACH[sign] ?? 'distinct and individual';
}

function moonStyle(sign: string): string {
  return MOON_STYLE[sign] ?? 'sensitive and changeable';
}

function planetTheme(planet: string): string {
  return PLANET_THEME[planet] ?? 'timing, consequences, and maturity';
}

const HOUSE_AREA_LABELS: Record<number, string> = {
  1: 'self, body, and identity',
  2: 'money, speech, and family stability',
  3: 'effort, courage, and initiative',
  4: 'home, emotional base, and private stability',
  5: 'creativity, children, merit, and self-expression',
  6: 'work pressure, health discipline, and daily struggle',
  7: 'partnership, marriage, and one-to-one commitments',
  8: 'change, vulnerability, and hidden pressure',
  9: 'fortune, dharma, teachers, and belief',
  10: 'career, responsibility, and public role',
  11: 'gains, networks, and long-term fulfilment',
  12: 'rest, expense, healing, and release',
};

const SIGN_APPROACH: Record<string, string> = {
  Aries: 'direct, fast-moving, and self-starting',
  Taurus: 'steady, practical, and security-seeking',
  Gemini: 'curious, adaptive, and mentally busy',
  Cancer: 'protective, emotional, and rooted in care',
  Leo: 'expressive, visible, and dignity-driven',
  Virgo: 'careful, analytical, and improvement-focused',
  Libra: 'relational, balanced, and harmony-seeking',
  Scorpio: 'intense, private, and transformative',
  Sagittarius: 'expansive, idealistic, and forward-looking',
  Capricorn: 'disciplined, strategic, and responsibility-led',
  Aquarius: 'independent, unconventional, and systems-minded',
  Pisces: 'sensitive, imaginative, and spiritually porous',
};

const MOON_STYLE: Record<string, string> = {
  Aries: 'urgent and quick to react',
  Taurus: 'steady and comfort-seeking',
  Gemini: 'restless and thought-driven',
  Cancer: 'deeply feeling and protective',
  Leo: 'warm, proud, and expressive',
  Virgo: 'observant and self-correcting',
  Libra: 'social and comparison-aware',
  Scorpio: 'intense and difficult to fool',
  Sagittarius: 'hopeful and freedom-seeking',
  Capricorn: 'contained and responsibility-aware',
  Aquarius: 'detached and mentally spacious',
  Pisces: 'impressionable and emotionally absorbent',
};

const PLANET_THEME: Record<string, string> = {
  Sun: 'visibility, authority, and self-definition',
  Moon: 'emotional processing, care, and inner steadiness',
  Mars: 'action, conflict, courage, and pressure handling',
  Mercury: 'thinking, learning, trade, and communication',
  Jupiter: 'growth, faith, blessing, and wise expansion',
  Venus: 'relationships, harmony, comfort, and attraction',
  Saturn: 'duty, delay, realism, and long-term discipline',
  Rahu: 'ambition, amplification, appetite, and unfamiliar hunger',
  Ketu: 'detachment, simplification, release, and karmic pruning',
};
