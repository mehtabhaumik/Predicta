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

type CoreVargaChartType =
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60';

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

const CORE_VARGA_TYPES = new Set<CoreVargaChartType>([
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D30',
  'D40',
  'D45',
  'D60',
]);

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
    if (isCoreVargaChartType(chart.chartType)) {
      return composeUnsupportedCoreVargaInsight(chart.chartType, hasPremiumAccess);
    }

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

  if (kundli && isCoreVargaChartType(chart.chartType)) {
    return composeCoreVargaInsight(chart, kundli, hasPremiumAccess);
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

function composeCoreVargaInsight(
  chart: ChartData,
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const chartType = chart.chartType as CoreVargaChartType;
  const config = getChartConfig(chartType);
  const definition = CORE_VARGA_INSIGHT_DEFINITIONS[chartType];
  const clusters = chart.planetDistribution
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
  const occupiedClusters = Object.entries(clusters)
    .filter(([, planets]) => planets.length > 0)
    .sort((first, second) => second[1].length - first[1].length);
  const dominantHouse = occupiedClusters[0] ? Number(occupiedClusters[0][0]) : undefined;
  const dominantPlanets = occupiedClusters[0]?.[1] ?? [];
  const supportHouse = occupiedClusters[1] ? Number(occupiedClusters[1][0]) : undefined;
  const supportPlanets = occupiedClusters[1]?.[1] ?? [];
  const currentDasha = kundli.dasha.current;
  const dashaPlanet = currentDasha.antardasha || currentDasha.mahadasha;
  const dashaPlacement = chart.planetDistribution.find(
    planet => planet.name === dashaPlanet || planet.name === currentDasha.mahadasha,
  );
  const activeArea = dominantHouse
    ? formatHouseArea(dominantHouse)
    : definition.defaultArea;
  const supportArea = supportHouse ? formatHouseArea(supportHouse) : definition.supportArea;
  const dashaArea = dashaPlacement
    ? formatHouseArea(dashaPlacement.house)
    : undefined;
  const lifeAreas = uniqueStrings([
    ...definition.lifeAreas,
    activeArea,
    supportArea,
    dashaArea,
  ]);
  const dominantPlanetText = dominantPlanets.length
    ? ` through ${dominantPlanets.join(', ')}`
    : '';
  const supportPlanetText = supportPlanets.length
    ? ` with secondary reinforcement from ${supportPlanets.join(', ')}`
    : '';
  const dashaSentence = dashaPlacement
    ? `${dashaPlacement.name} is active in this chart through ${formatHouseArea(dashaPlacement.house)}, so the current dasha is making this layer louder in practical life.`
    : `The current dasha of ${currentDasha.mahadasha}/${currentDasha.antardasha} still matters here, but this chart should be read as a focused confirmation rather than a standalone life chart.`;

  return {
    currentGuidance: dominantHouse
      ? `${definition.guidanceLead} Start with ${activeArea}, then use D1 to judge whether this area is being supported, delayed, or stretched in the main life story.`
      : `${definition.guidanceLead} Use this chart as a focused lens, then confirm the result through D1 and the current dasha before taking it as final.`,
    eyebrow: hasPremiumAccess
      ? `Premium ${definition.premiumLabel}`
      : `Free ${definition.freeLabel}`,
    freeInsights: [
      dominantHouse
        ? `${definition.freeLead} ${activeArea}${dominantPlanetText} is where this chart is speaking most clearly right now.`
        : `${definition.freeLead} This chart is quieter, so the signal should be taken as careful guidance rather than dramatic certainty.`,
      dashaSentence,
      supportArea
        ? `${definition.supportLead} ${supportArea}${supportPlanetText}.`
        : `${definition.supportLead} D1 remains the anchor that decides how much of this chart becomes visible in real life.`,
      definition.userValueLine,
    ],
    governs: definition.governs,
    lifeAreas,
    mainChallenge: dominantHouse
      ? `${definition.challengeLead} The pressure point here is confusing ${activeArea} with your whole life story. This chart only governs one layer of experience and must stay anchored to D1.`
      : definition.quietChallenge,
    mainStrength: dominantHouse
      ? `${definition.strengthLead} ${activeArea}${dominantPlanetText} stands out as the clearest area of signal in this chart.`
      : definition.quietStrength,
    premiumDeepDive: [
      `${definition.premiumLead} Premium explains how ${config.name} supports, complicates, or corrects the promise of D1.`,
      dashaArea
        ? `Premium also reads timing through ${dashaArea} so this chart does not stay theoretical.`
        : 'Premium also adds sharper timing, contradiction handling, and synthesis across related charts.',
      definition.premiumFinish,
    ],
    premiumNudge: definition.premiumNudge,
    technicalDetails: [
      `${chartType} focuses on ${CHART_FOCUS[chartType]}, and should always be judged through D1 first.`,
      dominantHouse
        ? `Primary house emphasis: house ${dominantHouse} (${activeArea})${dominantPlanetText}.`
        : 'No single house dominates this chart preview, so the signal should be read conservatively.',
      supportHouse
        ? `Secondary support: house ${supportHouse} (${supportArea})${supportPlanetText}.`
        : 'No second cluster stands out strongly enough to overrule the main emphasis.',
      dashaPlacement
        ? `Dasha-linked placement: ${dashaPlacement.name} in house ${dashaPlacement.house} (${formatHouseArea(dashaPlacement.house)}).`
        : `Current dasha: ${currentDasha.mahadasha}/${currentDasha.antardasha}.`,
      getChartReadingNote(chart.chartType),
      definition.technicalGuardrail,
    ],
    technicalSummary: hasPremiumAccess
      ? `Technical View keeps the ${config.name} evidence visible while Premium adds deeper D1 synthesis and timing.`
      : `Technical View keeps the ${config.name} evidence visible, while Insight View explains what this chart is trying to say in plain language.`,
    title: config.name,
    whatItSays: dominantHouse
      ? `${definition.storyLead} Right now the signal is strongest in ${activeArea}${dominantPlanetText}${supportArea ? `, with support around ${supportArea}` : ''}. ${dashaSentence}`
      : `${definition.storyLead} This chart is speaking softly right now, so it should be used as a confirming lens with D1 and current dasha rather than as a dramatic standalone reading.`,
  };
}

function composeUnsupportedCoreVargaInsight(
  chartType: CoreVargaChartType,
  hasPremiumAccess: boolean,
): ChartInsight {
  const config = getChartConfig(chartType);
  const definition = CORE_VARGA_INSIGHT_DEFINITIONS[chartType];

  return {
    currentGuidance:
      'Use the purpose of this chart now, but wait for prepared chart evidence before using it for strong prediction or technical detail.',
    eyebrow: 'Careful reading',
    freeInsights: [
      `${config.name} still governs ${definition.governs.toLowerCase()}`,
      'Predicta is keeping this chart conservative until the chart evidence is fully prepared.',
      definition.userValueLine,
    ],
    governs: definition.governs,
    lifeAreas: definition.lifeAreas,
    mainChallenge:
      'The challenge is over-reading a chart whose evidence is not fully prepared yet.',
    mainStrength:
      'You can still understand what this chart is for before moving into deeper evidence.',
    premiumDeepDive: [
      `${definition.premiumLead} Premium should only go deeper once the chart evidence is fully ready.`,
      definition.premiumFinish,
    ],
    premiumNudge: hasPremiumAccess
      ? undefined
      : definition.premiumNudge,
    technicalDetails: [
      `${chartType} is visible but kept conservative until chart preparation is complete.`,
      definition.technicalGuardrail,
      getChartReadingNote(chartType),
    ],
    technicalSummary:
      'Technical View stays bounded here because full chart evidence is not yet prepared.',
    title: config.name,
    whatItSays:
      `This ${config.name} governs ${definition.governs.toLowerCase()} Predicta is keeping the live reading careful until the chart evidence is complete, so the purpose stays visible without pretending to certainty.`,
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

function isCoreVargaChartType(chartType: ChartType): chartType is CoreVargaChartType {
  return CORE_VARGA_TYPES.has(chartType as CoreVargaChartType);
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

const CORE_VARGA_INSIGHT_DEFINITIONS: Record<
  CoreVargaChartType,
  {
    defaultArea: string;
    supportArea: string;
    governs: string;
    storyLead: string;
    strengthLead: string;
    challengeLead: string;
    guidanceLead: string;
    freeLead: string;
    supportLead: string;
    userValueLine: string;
    premiumLead: string;
    premiumFinish: string;
    premiumLabel: string;
    freeLabel: string;
    premiumNudge: string;
    quietChallenge: string;
    quietStrength: string;
    technicalGuardrail: string;
    lifeAreas: string[];
  }
> = {
  D2: {
    defaultArea: 'money, speech, and family stability',
    supportArea: 'gains, networks, and long-term fulfilment',
    governs:
      'How resources move through your life: earning, keeping, spending, nourishment, and financial temperament.',
    storyLead:
      'This Hora chart is describing your money temperament and how resources prefer to move through your life.',
    strengthLead:
      'The strongest financial signal in this chart is that',
    challengeLead:
      'The caution in D2 is not greed or fear by itself.',
    guidanceLead:
      'Use D2 to make cleaner money decisions, not to panic about wealth fate.',
    freeLead: 'The financial story here says',
    supportLead: 'The next useful support signal is',
    userValueLine:
      'Use this chart to understand how to handle money better, not just how much money may come.',
    premiumLead:
      'Premium turns D2 into a deeper money-behavior and financial rhythm reading.',
    premiumFinish:
      'Premium also connects D2 with D1, D10, and timing so money advice stays practical.',
    premiumLabel: 'resource-flow analysis',
    freeLabel: 'resource-flow insight',
    premiumNudge:
      'Premium turns D2 into a practical resource reading with money rhythm, career links, and timing support.',
    quietChallenge:
      'The caution here is subtle inconsistency: this chart needs D1 and timing support before making strong money claims.',
    quietStrength:
      'The strength here is restraint: D2 is asking for disciplined resource handling instead of hype.',
    technicalGuardrail:
      'D2 should be read as a money and nourishment lens, not as a general-life chart.',
    lifeAreas: ['money', 'resource flow', 'family stability', 'financial judgement'],
  },
  D3: {
    defaultArea: 'effort, courage, and initiative',
    supportArea: 'work pressure, health discipline, and daily struggle',
    governs:
      'Self-driven effort, courage, stamina, grit, sibling dynamics, and how you push through resistance.',
    storyLead:
      'This Drekkana chart is showing how you generate effort and how your nerve behaves under pressure.',
    strengthLead: 'The strongest D3 signal is that',
    challengeLead:
      'The caution in D3 is wasted effort or reactive courage.',
    guidanceLead:
      'Use D3 to judge where courage should be focused and where effort is leaking.',
    freeLead: 'The effort story here says',
    supportLead: 'The next stamina support signal is',
    userValueLine:
      'Use this chart to understand how to act better, recover faster, and stop burning energy in the wrong places.',
    premiumLead:
      'Premium turns D3 into a clearer stamina, courage, and friction-handling reading.',
    premiumFinish:
      'Premium also explains how D3 effort patterns support or undermine D1 timing and career execution.',
    premiumLabel: 'effort and courage analysis',
    freeLabel: 'effort and courage insight',
    premiumNudge:
      'Premium turns D3 into a focused effort, stamina, and execution reading tied back to D1.',
    quietChallenge:
      'The caution here is hidden fatigue: D3 may be asking for better pacing rather than louder action.',
    quietStrength:
      'The strength here is measured courage: not every effort battle needs to be forced right now.',
    technicalGuardrail:
      'D3 should be read as an effort and stamina lens with D1 support, not as a standalone life chart.',
    lifeAreas: ['effort', 'courage', 'siblings', 'stamina'],
  },
  D4: {
    defaultArea: 'home, emotional base, and private stability',
    supportArea: 'money, speech, and family stability',
    governs:
      'Inner anchoring, home-rootedness, residence patterns, property, and the emotional base that supports outer life.',
    storyLead:
      'This D4 chart is speaking about where you feel settled, rooted, and truly supported in private life.',
    strengthLead: 'The strongest D4 support is that',
    challengeLead:
      'The caution in D4 is emotional instability or restlessness around home and base.',
    guidanceLead:
      'Use D4 to understand where your inner base becomes strong enough to support the rest of life.',
    freeLead: 'The home-root story here says',
    supportLead: 'The next grounding support signal is',
    userValueLine:
      'Use this chart to understand how home, private peace, and rootedness affect every other part of your life.',
    premiumLead:
      'Premium turns D4 into a deeper reading of home stability, property karma, and emotional anchoring.',
    premiumFinish:
      'Premium also connects D4 with D1 and D12 so inner stability is read with family and lineage context.',
    premiumLabel: 'home and foundation analysis',
    freeLabel: 'home and foundation insight',
    premiumNudge:
      'Premium turns D4 into a home, rootedness, and emotional-base reading with stronger cross-chart synthesis.',
    quietChallenge:
      'The caution here is subtle instability: D4 may be asking for calmer routines rather than dramatic housing conclusions.',
    quietStrength:
      'The strength here is quiet grounding: this chart supports steadiness more than noise.',
    technicalGuardrail:
      'D4 refines home, property, and inner stability. It should not be inflated into a full life chart.',
    lifeAreas: ['home', 'property', 'emotional base', 'inner stability'],
  },
  D7: {
    defaultArea: 'creativity, children, merit, and self-expression',
    supportArea: 'partnership, marriage, and one-to-one commitments',
    governs:
      'Children, fertility themes, nurture style, creative legacy, and how your life energy extends into the next generation.',
    storyLead:
      'This D7 chart is speaking about creation, nurture, and the legacy you grow through care and generational continuity.',
    strengthLead: 'The strongest D7 blessing is that',
    challengeLead:
      'The caution in D7 is pressure around expectation, legacy, or how care is given and received.',
    guidanceLead:
      'Use D7 to understand your legacy pattern and how nurture becomes a living responsibility.',
    freeLead: 'The legacy story here says',
    supportLead: 'The next nurture support signal is',
    userValueLine:
      'Use this chart to understand how creativity, children, and legacy ask for maturity from you.',
    premiumLead:
      'Premium turns D7 into a deeper reading of legacy, children themes, and nurture responsibilities.',
    premiumFinish:
      'Premium also explains how D7 interacts with D1, D9, and timing instead of reducing this chart to one outcome.',
    premiumLabel: 'legacy and nurture analysis',
    freeLabel: 'legacy and nurture insight',
    premiumNudge:
      'Premium turns D7 into a deeper legacy, children, and nurture reading tied back to D1 and timing.',
    quietChallenge:
      'The caution here is projection: D7 may be asking for softer expectations rather than dramatic conclusions.',
    quietStrength:
      'The strength here is quiet blessing: this chart supports patient creative and generational growth.',
    technicalGuardrail:
      'D7 should stay a children, creativity, and legacy lens anchored to D1.',
    lifeAreas: ['children', 'creativity', 'legacy', 'nurture'],
  },
  D9: {
    defaultArea: 'fortune, dharma, teachers, and belief',
    supportArea: 'partnership, marriage, and one-to-one commitments',
    governs:
      'Marriage maturity, dharma alignment, inner refinement, fortune, and the deeper strength behind planetary promise.',
    storyLead:
      'This Navamsha chart is speaking about relationship maturity, dharma, and how life deepens after surface momentum settles.',
    strengthLead: 'The strongest D9 promise is that',
    challengeLead:
      'The caution in D9 is immaturity, misalignment, or reading marriage through fantasy instead of lived dharma.',
    guidanceLead:
      'Use D9 to judge depth, maturity, and the part of life that becomes more meaningful with time.',
    freeLead: 'The deeper maturity story here says',
    supportLead: 'The next dharma support signal is',
    userValueLine:
      'Use this chart to understand how marriage, dharma, and inner refinement are asking you to grow.',
    premiumLead:
      'Premium turns D9 into a deeper marriage, dharma, and planet-strength reading.',
    premiumFinish:
      'Premium also shows where D9 supports or corrects D1 before making strong relationship conclusions.',
    premiumLabel: 'marriage and dharma analysis',
    freeLabel: 'marriage and dharma insight',
    premiumNudge:
      'Premium turns D9 into a deeper marriage and dharma reading with D1 comparison, timing, and maturity analysis.',
    quietChallenge:
      'The caution here is subtle misalignment: D9 may be asking for inner correction before outer conclusions.',
    quietStrength:
      'The strength here is inner maturity: this chart often speaks through what deepens over time.',
    technicalGuardrail:
      'D9 is a dharma and marriage refinement chart. It must stay anchored to D1.',
    lifeAreas: ['marriage', 'dharma', 'inner maturity', 'fortune'],
  },
  D10: {
    defaultArea: 'career, responsibility, and public role',
    supportArea: 'gains, networks, and long-term fulfilment',
    governs:
      'Career role, authority, contribution, professional visibility, and how your work is delivered into the public world.',
    storyLead:
      'This Dashamsha chart is speaking about your career role and the way responsibility wants to express itself publicly.',
    strengthLead: 'The strongest D10 career signal is that',
    challengeLead:
      'The caution in D10 is misusing ambition, visibility, or authority without long-term grounding.',
    guidanceLead:
      'Use D10 to understand the role you are meant to deliver, not just the job title you want.',
    freeLead: 'The career-delivery story here says',
    supportLead: 'The next public-work support signal is',
    userValueLine:
      'Use this chart to understand how your work should be expressed, not just whether success is possible.',
    premiumLead:
      'Premium turns D10 into a deeper reading of role, recognition, authority, and timing.',
    premiumFinish:
      'Premium also connects D10 with D1 and D2 so work, money, and public contribution are read together.',
    premiumLabel: 'career and contribution analysis',
    freeLabel: 'career and contribution insight',
    premiumNudge:
      'Premium turns D10 into a deeper career-role reading with timing, D1 support, and contribution strategy.',
    quietChallenge:
      'The caution here is false urgency: D10 may be asking for steadier role-building rather than immediate status conclusions.',
    quietStrength:
      'The strength here is direction: even a quieter D10 can show where your work becomes meaningful.',
    technicalGuardrail:
      'D10 is a public-work and authority lens. It should stay anchored to D1 career promise.',
    lifeAreas: ['career', 'public work', 'authority', 'contribution'],
  },
  D12: {
    defaultArea: 'home, emotional base, and private stability',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Parents, ancestry, inherited tendencies, family patterns, and the lineage atmosphere you carry forward.',
    storyLead:
      'This D12 chart is speaking about parental imprint, inherited patterning, and how lineage continues to shape your life.',
    strengthLead: 'The strongest D12 support is that',
    challengeLead:
      'The caution in D12 is repeating lineage pressure unconsciously instead of working with it consciously.',
    guidanceLead:
      'Use D12 to understand what you inherited and what you are meant to soften, honor, or complete.',
    freeLead: 'The lineage story here says',
    supportLead: 'The next ancestral support signal is',
    userValueLine:
      'Use this chart to understand inherited family patterns without turning them into blame or fatalism.',
    premiumLead:
      'Premium turns D12 into a deeper lineage and parental-pattern reading.',
    premiumFinish:
      'Premium also connects D12 with D1, D40, and D45 so family inheritance is read with more precision.',
    premiumLabel: 'lineage and inheritance analysis',
    freeLabel: 'lineage and inheritance insight',
    premiumNudge:
      'Premium turns D12 into a lineage reading with parental pattern analysis and cross-chart support.',
    quietChallenge:
      'The caution here is subtle inheritance: this chart may be pointing to family atmosphere more than one loud event.',
    quietStrength:
      'The strength here is awareness: D12 often helps you separate what is yours from what was inherited.',
    technicalGuardrail:
      'D12 should remain a parents and lineage lens, not a general-purpose life chart.',
    lifeAreas: ['parents', 'lineage', 'inheritance', 'family karma'],
  },
  D16: {
    defaultArea: 'rest, expense, healing, and release',
    supportArea: 'home, emotional base, and private stability',
    governs:
      'Comfort, vehicles, lifestyle ease, pleasure, emotional enjoyment, and how much life actually feels supportable.',
    storyLead:
      'This D16 chart is speaking about comfort, enjoyment, and whether life feels supported enough to be lived with ease.',
    strengthLead: 'The strongest D16 support is that',
    challengeLead:
      'The caution in D16 is chasing comfort without emotional steadiness or using pleasure to escape pressure.',
    guidanceLead:
      'Use D16 to understand where comfort helps you thrive and where indulgence weakens stability.',
    freeLead: 'The comfort story here says',
    supportLead: 'The next enjoyment support signal is',
    userValueLine:
      'Use this chart to understand how ease, lifestyle, and rest affect your actual quality of life.',
    premiumLead:
      'Premium turns D16 into a deeper comfort, vehicle, and enjoyment reading.',
    premiumFinish:
      'Premium also explains how D16 supports or undermines emotional steadiness and practical life flow.',
    premiumLabel: 'comfort and lifestyle analysis',
    freeLabel: 'comfort and lifestyle insight',
    premiumNudge:
      'Premium turns D16 into a comfort, enjoyment, and stability reading with cleaner practical guidance.',
    quietChallenge:
      'The caution here is subtle depletion: D16 may be asking for better restoration rather than more stimulation.',
    quietStrength:
      'The strength here is supportability: this chart shows where life can become easier without becoming careless.',
    technicalGuardrail:
      'D16 should stay a comforts and lifestyle lens rather than being inflated into a general chart.',
    lifeAreas: ['comfort', 'vehicles', 'lifestyle', 'emotional ease'],
  },
  D20: {
    defaultArea: 'fortune, dharma, teachers, and belief',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Spiritual practice, devotion, mantra, inner discipline, grace, and the sincerity of your inner path.',
    storyLead:
      'This D20 chart is speaking about spiritual depth, discipline, and the type of inner practice that can genuinely steady you.',
    strengthLead: 'The strongest D20 support is that',
    challengeLead:
      'The caution in D20 is spiritual inconsistency, performance, or seeking relief without discipline.',
    guidanceLead:
      'Use D20 to understand what kind of inner practice truly steadies you and what weakens your discipline.',
    freeLead: 'The spiritual-practice story here says',
    supportLead: 'The next devotion support signal is',
    userValueLine:
      'Use this chart to understand how your inner practice should be shaped, not just whether you are spiritual.',
    premiumLead:
      'Premium turns D20 into a deeper reading of practice, devotion, and spiritual discipline.',
    premiumFinish:
      'Premium also explains how D20 supports D1 purpose, D9 dharma, and actual daily practice.',
    premiumLabel: 'spiritual practice analysis',
    freeLabel: 'spiritual practice insight',
    premiumNudge:
      'Premium turns D20 into a practice and discipline reading tied to D1 and D9 rather than abstract spirituality.',
    quietChallenge:
      'The caution here is drift: D20 may be asking for steadier discipline rather than bigger spiritual claims.',
    quietStrength:
      'The strength here is inner sincerity: even a quiet D20 can show what practice genuinely nourishes you.',
    technicalGuardrail:
      'D20 should remain a spiritual-practice chart anchored to D1, D9, and lived discipline.',
    lifeAreas: ['spiritual practice', 'devotion', 'mantra', 'inner discipline'],
  },
  D24: {
    defaultArea: 'creativity, children, merit, and self-expression',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Education, study rhythm, teachers, knowledge-building, learning confidence, and the way your mind grows through discipline.',
    storyLead:
      'This D24 chart is speaking about how you learn, what kind of knowledge deepens well, and how education becomes strength.',
    strengthLead: 'The strongest D24 support is that',
    challengeLead:
      'The caution in D24 is scattered learning, poor study rhythm, or knowledge without discipline.',
    guidanceLead:
      'Use D24 to understand how learning should be structured so growth becomes durable.',
    freeLead: 'The education story here says',
    supportLead: 'The next learning support signal is',
    userValueLine:
      'Use this chart to understand how to study better, learn faster, and choose the right knowledge path.',
    premiumLead:
      'Premium turns D24 into a deeper education, study-discipline, and teacher-pattern reading.',
    premiumFinish:
      'Premium also explains how D24 supports D1 direction and D10 skill expression.',
    premiumLabel: 'education and study analysis',
    freeLabel: 'education and study insight',
    premiumNudge:
      'Premium turns D24 into a deeper education and learning-discipline reading tied to D1 and skill development.',
    quietChallenge:
      'The caution here is hidden inconsistency: D24 may be asking for cleaner study rhythm more than more information.',
    quietStrength:
      'The strength here is learning potential: a calm D24 often supports long-term mastery.',
    technicalGuardrail:
      'D24 is an education and knowledge lens. It should stay anchored to D1 and real effort.',
    lifeAreas: ['education', 'learning', 'teachers', 'study discipline'],
  },
  D30: {
    defaultArea: 'work pressure, health discipline, and daily struggle',
    supportArea: 'change, vulnerability, and hidden pressure',
    governs:
      'Stress patterning, pressure handling, vulnerability, protection needs, and the places where life asks for caution and steadiness.',
    storyLead:
      'This D30 chart is speaking about pressure, strain, and where your system needs protection, not about guaranteed disaster.',
    strengthLead: 'The strongest D30 resilience signal is that',
    challengeLead:
      'The caution in D30 is unmanaged stress, repeated friction, or preventable vulnerability becoming louder than it needs to be.',
    guidanceLead:
      'Use D30 to reduce stress, improve protection, and stay practical instead of fatalistic.',
    freeLead: 'The stress-pattern story here says',
    supportLead: 'The next protection support signal is',
    userValueLine:
      'Use this chart to understand where caution, boundaries, and better habits can meaningfully reduce pressure.',
    premiumLead:
      'Premium turns D30 into a deeper protection and stress-pattern reading.',
    premiumFinish:
      'Premium also explains what should be monitored, what can be corrected, and what does not deserve panic.',
    premiumLabel: 'stress and protection analysis',
    freeLabel: 'stress and protection insight',
    premiumNudge:
      'Premium turns D30 into a bounded stress and protection reading with practical correction guidance.',
    quietChallenge:
      'The caution here is hidden stress load: D30 may be showing slow strain rather than one dramatic event.',
    quietStrength:
      'The strength here is prevention: this chart becomes useful when it guides protection rather than fear.',
    technicalGuardrail:
      'D30 must be read carefully and non-fatalistically as a stress and protection lens, never as doom language.',
    lifeAreas: ['stress', 'protection', 'vulnerability', 'pressure handling'],
  },
  D40: {
    defaultArea: 'home, emotional base, and private stability',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Maternal lineage, inherited blessing patterns, emotional grace, and the subtle support that comes through the mother line.',
    storyLead:
      'This D40 chart is speaking about the maternal line, the quality of inherited grace, and what emotional blessings or softness travel through that stream.',
    strengthLead: 'The strongest D40 blessing is that',
    challengeLead:
      'The caution in D40 is subtle emotional residue or maternal-line burdens that still influence the present.',
    guidanceLead:
      'Use D40 to understand what the maternal line supports and what may still need healing or conscious handling.',
    freeLead: 'The maternal-line story here says',
    supportLead: 'The next inherited support signal is',
    userValueLine:
      'Use this chart to understand soft inherited support and emotional lineage without turning it into superstition.',
    premiumLead:
      'Premium turns D40 into a deeper maternal-lineage and blessing-pattern reading.',
    premiumFinish:
      'Premium also connects D40 with D12 and D1 so lineage is read with lived context.',
    premiumLabel: 'maternal lineage analysis',
    freeLabel: 'maternal lineage insight',
    premiumNudge:
      'Premium turns D40 into a clearer maternal-lineage reading with D12 and D1 support.',
    quietChallenge:
      'The caution here is subtle residue: D40 may show emotional inheritance more than visible events.',
    quietStrength:
      'The strength here is grace: even a quiet D40 can show blessing and emotional support from the maternal line.',
    technicalGuardrail:
      'D40 should stay a maternal-lineage and auspiciousness lens, not a general chart.',
    lifeAreas: ['maternal lineage', 'emotional grace', 'inherited blessing', 'family patterns'],
  },
  D45: {
    defaultArea: 'career, responsibility, and public role',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Paternal lineage, inherited honor, character patterns, discipline, and the subtle merit carried through the father line.',
    storyLead:
      'This D45 chart is speaking about paternal-line character, inherited standards, and how honor and discipline travel through lineage.',
    strengthLead: 'The strongest D45 support is that',
    challengeLead:
      'The caution in D45 is hard inherited pressure, rigidity, or merit that is carried as burden instead of support.',
    guidanceLead:
      'Use D45 to understand what the paternal line strengthens and what it may demand too harshly.',
    freeLead: 'The paternal-line story here says',
    supportLead: 'The next inherited merit signal is',
    userValueLine:
      'Use this chart to understand inherited character and discipline without reducing your life to family weight alone.',
    premiumLead:
      'Premium turns D45 into a deeper paternal-lineage and character-pattern reading.',
    premiumFinish:
      'Premium also connects D45 with D12 and D1 so inherited standards are read in context.',
    premiumLabel: 'paternal lineage analysis',
    freeLabel: 'paternal lineage insight',
    premiumNudge:
      'Premium turns D45 into a clearer paternal-lineage and character reading with stronger context.',
    quietChallenge:
      'The caution here is subtle pressure: D45 may show inherited standards that need softening, not blind obedience.',
    quietStrength:
      'The strength here is merit: even a quiet D45 can show deep support through discipline and honor.',
    technicalGuardrail:
      'D45 should stay a paternal-lineage and character lens, not a general destiny chart.',
    lifeAreas: ['paternal lineage', 'character', 'discipline', 'inherited honor'],
  },
  D60: {
    defaultArea: 'change, vulnerability, and hidden pressure',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Deep karmic texture, root-level tendencies, hidden causes, and the background pattern beneath visible life events.',
    storyLead:
      'This D60 chart is speaking about karmic texture and deep background tendencies. It is for careful interpretation, not dramatic claims.',
    strengthLead: 'The strongest D60 support is that',
    challengeLead:
      'The caution in D60 is overstatement. This chart needs precision, humility, and very careful birth-time confidence.',
    guidanceLead:
      'Use D60 as a deep-confirmation chart for karmic texture, not as a casual prediction machine.',
    freeLead: 'The deep-karmic story here says',
    supportLead: 'The next root-pattern support signal is',
    userValueLine:
      'Use this chart to understand deep tendencies with humility, not to create fear or fake certainty.',
    premiumLead:
      'Premium turns D60 into a bounded deep-karma reading.',
    premiumFinish:
      'Premium also explains which D60 signals deserve weight and which should stay secondary because of birth-time sensitivity.',
    premiumLabel: 'deep karma analysis',
    freeLabel: 'deep karma insight',
    premiumNudge:
      'Premium turns D60 into a careful deep-karma reading with stronger birth-time caution and D1 synthesis.',
    quietChallenge:
      'The caution here is interpretation risk: D60 should stay subtle unless supported by D1, timing, and birth-time confidence.',
    quietStrength:
      'The strength here is depth: when handled carefully, D60 can explain why a visible life pattern feels karmically familiar.',
    technicalGuardrail:
      'D60 needs careful birth-time confidence and must remain a bounded deep-karma confirmation layer.',
    lifeAreas: ['deep karma', 'hidden causes', 'root tendencies', 'destiny texture'],
  },
};
