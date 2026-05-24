import type {
  BhavChalitPlanetPlacement,
  ChalitPlanetPlacement,
  ChartData,
  ChartInsight,
  ChartInsightProfile,
  ChartPremiumInsight,
  ChartType,
  KundliData,
  PlanetPosition,
} from '@pridicta/types';
import { composeChalitBhavKpFoundation } from './chalitBhavKpFoundation';
import { getChartConfig } from './chartRegistry';
import { composeNadiJyotishPlan } from './nadiJyotishPlan';
import {
  getChalitReadingNote,
  getChartReadingNote,
  getD1LifeFoundationNote,
} from './vargaInterpretation';

export type {
  ChartInsight,
  ChartInsightDepth,
  ChartInsightProfile,
  ChartPremiumInsight,
} from '@pridicta/types';

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

type AdvancedVargaChartType =
  | 'D5'
  | 'D6'
  | 'D8'
  | 'D11'
  | 'D13'
  | 'D15'
  | 'D17'
  | 'D18'
  | 'D19'
  | 'D21'
  | 'D22'
  | 'D23'
  | 'D25'
  | 'D26'
  | 'D27'
  | 'D28'
  | 'D29'
  | 'D31'
  | 'D32'
  | 'D33'
  | 'D34';

type AdvancedVargaConfidenceTier = 'supporting' | 'narrow' | 'sensitive';

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

const ADVANCED_VARGA_TYPES = new Set<AdvancedVargaChartType>([
  'D5',
  'D6',
  'D8',
  'D11',
  'D13',
  'D15',
  'D17',
  'D18',
  'D19',
  'D21',
  'D22',
  'D23',
  'D25',
  'D26',
  'D27',
  'D28',
  'D29',
  'D31',
  'D32',
  'D33',
  'D34',
]);

const ADVANCED_VARGA_CONFIDENCE_TIERS: Record<
  AdvancedVargaChartType,
  AdvancedVargaConfidenceTier
> = {
  D5: 'supporting',
  D6: 'sensitive',
  D8: 'sensitive',
  D11: 'supporting',
  D13: 'narrow',
  D15: 'narrow',
  D17: 'narrow',
  D18: 'sensitive',
  D19: 'narrow',
  D21: 'sensitive',
  D22: 'sensitive',
  D23: 'narrow',
  D25: 'narrow',
  D26: 'sensitive',
  D27: 'narrow',
  D28: 'sensitive',
  D29: 'narrow',
  D31: 'sensitive',
  D32: 'sensitive',
  D33: 'narrow',
  D34: 'sensitive',
};

const PLANET_DIGNITIES: Record<string, { debilitated: string; exalted: string }> = {
  Jupiter: { debilitated: 'Capricorn', exalted: 'Cancer' },
  Mars: { debilitated: 'Cancer', exalted: 'Capricorn' },
  Mercury: { debilitated: 'Pisces', exalted: 'Virgo' },
  Moon: { debilitated: 'Scorpio', exalted: 'Taurus' },
  Saturn: { debilitated: 'Aries', exalted: 'Libra' },
  Sun: { debilitated: 'Libra', exalted: 'Aries' },
  Venus: { debilitated: 'Virgo', exalted: 'Pisces' },
};

const COMBUSTION_ORBS: Record<string, number> = {
  Jupiter: 11,
  Mars: 17,
  Mercury: 14,
  Moon: 12,
  Saturn: 15,
  Venus: 10,
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
    if (isCoreVargaChartType(chart.chartType)) {
      return composeUnsupportedCoreVargaInsight(chart.chartType, hasPremiumAccess, kundli);
    }

    if (isAdvancedVargaChartType(chart.chartType)) {
      return composeUnsupportedAdvancedVargaInsight(chart.chartType, hasPremiumAccess, kundli);
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

  if (profile === 'kp' && kundli) {
    return composeKpChartInsight(kundli, hasPremiumAccess);
  }

  if (profile === 'nadi' && kundli) {
    return composeNadiChartInsight(kundli, hasPremiumAccess);
  }

  if (chart.chartType === 'D1' && kundli) {
    return composeD1ChartInsight(kundli, hasPremiumAccess);
  }

  if (kundli && isCoreVargaChartType(chart.chartType)) {
    return composeCoreVargaInsight(chart, kundli, hasPremiumAccess);
  }

  if (kundli && isAdvancedVargaChartType(chart.chartType)) {
    return composeAdvancedVargaInsight(chart, kundli, hasPremiumAccess);
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
  const lagnaApproach = signApproach(kundli.lagna);
  const lifePattern = `${kundli.lagna} Lagna gives this life ${withIndefiniteArticle(lagnaApproach)} outer direction, while ${kundli.moonSign} Moon gives the inner life a ${moonStyle(kundli.moonSign)} rhythm.`;
  const opportunity = supportArea
    ? `The area of ${dominantArea} opens the clearest opportunity, with ${supportArea} acting as the supporting lane.`
    : `The area of ${dominantArea} opens the clearest opportunity when the user chooses steady, visible effort instead of scattering attention.`;
  const maturityPressure = `${pressureArea} needs maturity because this is where the chart can leak energy through delay, fear, reaction, or over-correction.`;
  const lifeAreas = uniqueStrings([
    dominantArea,
    supportArea,
    pressureArea,
    'life direction',
  ]);

  return {
    currentGuidance: `Treat ${dominantArea} as the first growth lane. Move there deliberately, but keep ${pressureArea} clean and mature so the life pattern does not lose strength through its pressure point.`,
    eyebrow: hasPremiumAccess ? 'Premium life-foundation analysis' : 'Free life-foundation insight',
    freeInsights: [
      `Life pattern: ${lifePattern}`,
      `Main weight: The area of ${dominantArea} is carrying the loudest signal, so it should not be treated as background.`,
      `Opportunity: ${opportunity}`,
      `Pressure needing maturity: ${maturityPressure}`,
      `Current chapter: ${currentDasha.mahadasha}/${currentDasha.antardasha} is asking the user to handle ${planetTheme(currentDasha.mahadasha)} with more skill.`,
      firstYoga
        ? `A notable pattern is ${firstYoga.name}, which adds a ${firstYoga.strength} emphasis around ${stripTrailingSentencePunctuation(firstYoga.meaning.toLowerCase())}.`
        : `The strongest support right now is around ${dominantArea}, so that is where visible progress can build fastest.`,
    ],
    governs:
      'Your life foundation: identity, direction, relationships, work, family, and the visible karma pattern that everything else grows from.',
    lifeAreas,
    mainChallenge: `The pressure zone is ${pressureArea}, so this is where overreaction, delay, or emotional drain can distort the otherwise strong parts of the chart.`,
    mainStrength: supportArea
      ? `The life chart is strongest when ${dominantArea} and ${supportArea} are built patiently, because these areas carry the most usable momentum.`
      : `The life chart is strongest when the area of ${dominantArea} is built patiently, because this area carries the most usable momentum.`,
    premiumDeepDive: [
      'Premium reads D1 through Lagna, Moon, dasha, yogas, and house strength together instead of stopping at one loud placement.',
      `Premium also explains how ${pressureArea} modifies the promise of ${dominantArea} across timing and maturity.`,
      'Premium then connects D1 with Chalit, core vargas, and practical next steps.',
    ],
    premiumInsight: buildChartPremiumInsight({
      chartType: 'D1',
      kundli,
      activeArea: dominantArea,
      supportArea,
      pressureArea,
    }),
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
      getD1LifeFoundationNote(),
    ],
    technicalSummary:
      'Technical View keeps the D1 evidence layer visible: Lagna, Moon, dasha, house emphasis, and yogic support.',
    title: config.name,
    whatItSays: `${lifePattern} The strongest life weight is on ${dominantArea}, so the chart is not asking for vague self-improvement; it is asking the user to build that area consciously. ${opportunity} The caution is ${pressureArea}, where maturity matters more than speed. Current ${currentDasha.mahadasha}/${currentDasha.antardasha} timing makes ${planetTheme(currentDasha.mahadasha)} part of the active lesson.`,
  };
}

function composeChalitChartInsight(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const shifts = kundli.chalit?.shifts ?? [];
  const foundation = composeChalitBhavKpFoundation(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
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
  const activeAreas = foundation.bhavChalit.activeLifeAreas.slice(0, 3);

  return {
    currentGuidance: dashaShift
      ? `${foundation.bhavChalit.practicalCorrection} Read D1 for the promise, then use Chalit to judge how ${formatHouseArea(targetHouse(dashaShift))} is actually receiving the result right now.`
      : 'Use Chalit as a fine-tuning layer, not as an excuse to rewrite a D1 picture that is already delivering clearly.',
    eyebrow: hasPremiumAccess ? 'Premium lived-delivery analysis' : 'Free Chalit insight',
    freeInsights: shifts.length
      ? [
          `What changes: ${foundation.bhavChalit.whatChanges}`,
          `${activeShiftText}, so lived experience may feel different from a plain D1 house reading.`,
          activeAreas.length
            ? `Most active lived areas: ${activeAreas.join('; ')}.`
            : 'The lived delivery layer is active, but the exact life area should be read carefully.',
          `Practical correction: ${foundation.bhavChalit.practicalCorrection}`,
          'The sign stays from D1. What changes here is the house that receives the result.',
        ]
      : [
          `What changes: ${foundation.bhavChalit.whatChanges}`,
          'That is useful because it means you do not need a dramatic reinterpretation to understand the main life pattern.',
          `Practical correction: ${foundation.bhavChalit.practicalCorrection}`,
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
    premiumInsight: buildChartPremiumInsight({
      chartType: 'CHALIT',
      kundli,
      activeArea: shifts.length
        ? formatHouseArea(targetHouse(dashaShift ?? shifts[0]!))
        : 'life delivery and bhava emphasis',
      supportArea: shifts.length ? formatHouseArea(shifts[0]!.rashiHouse) : 'D1 root promise',
      pressureArea: shifts.length ? formatHouseArea((dashaShift ?? shifts[0]!).rashiHouse) : undefined,
    }),
    premiumNudge:
      'Premium turns Chalit into a real lived-delivery reading with D1 comparison, active dasha timing, and sharper judgement.',
    technicalDetails: [
      `Chalit shifts detected: ${shifts.length}.`,
      dashaShift
        ? `${dashaShift.planet}: D1 house ${dashaShift.rashiHouse} to Chalit house ${targetHouse(dashaShift)}.`
        : 'No major Chalit house-delivery shift is active in this preview.',
      `Cusps available: ${kundli.chalit?.cusps.length ?? 0}.`,
      `Current dasha: ${currentDasha.mahadasha}/${currentDasha.antardasha}.`,
      getChalitReadingNote(),
      'This is separate from KP cusp/sub-lord event judgement.',
    ],
    technicalSummary:
      'Technical View keeps the bhava-shift evidence visible: shifted planets, cusp count, and the D1-versus-Chalit delivery rule.',
    title: 'Chalit Chart',
    whatItSays: shifts.length
      ? `${foundation.bhavChalit.whatChanges} Right now ${activeShiftText}, so real life may feel more like ${formatHouseArea(targetHouse(dashaShift ?? shifts[0]!))} than expected from a simple D1-only reading.`
      : `${foundation.bhavChalit.whatChanges} The main story does not need dramatic reinterpretation right now; Chalit is acting more like confirmation and fine-tuning.`,
  };
}

function composeKpChartInsight(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const foundation = composeChalitBhavKpFoundation(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const kp = foundation.kp;
  const judgement = kp.eventJudgement;

  return {
    currentGuidance:
      'Start with one exact event question, then let the relevant houses, cusp sub lord, significators, ruling planets, and dasha support answer it.',
    eyebrow: hasPremiumAccess ? 'Premium KP event insight' : 'Free KP event insight',
    freeInsights: [
      `Verdict compass: ${judgement.verdictLabel}.`,
      `Promise: ${judgement.promise}`,
      `Decision point: ${judgement.decisionPoint}`,
      `Timing readiness: ${judgement.timingReadiness}`,
      `Next best question: ${judgement.nextQuestion}`,
    ],
    governs:
      'event promise, decision point, timing readiness, ruling planets, and significator proof',
    lifeAreas: judgement.eventCarriers.length
      ? judgement.eventCarriers.map(carrier => `${carrier.planet}: ${carrier.role}`)
      : ['event question', 'cusp proof', 'timing readiness'],
    mainChallenge: judgement.mainBlock,
    mainStrength: judgement.plainLanguage,
    premiumDeepDive: [
      'Premium KP expands the selected event into a full proof path instead of a generic life reading.',
      ...judgement.proofPath,
      kp.premiumSynthesis ?? kp.freeInsight,
    ],
    premiumInsight: hasPremiumAccess
      ? {
          confidenceFraming:
            'KP confidence stays event-specific. It should never guarantee outcomes or replace practical reality checks.',
          contradictionSignals: [
            judgement.mainBlock,
            'If the event houses, significators, and ruling planets disagree, Predicta must call the timing mixed or delayed.',
          ],
          crossChartSynthesis: [
            'KP remains separate from Parashari D1 and Chalit; it can reference birth context but must not become a personality reading.',
          ],
          headline: `KP event verdict: ${judgement.verdictLabel}`,
          layeredInterpretation: [
            `Layer 1: the event answer is ${judgement.verdictLabel}, so Premium starts with the decision posture rather than a generic life reading.`,
            `Layer 2: the proof path checks ${judgement.proofPath.slice(0, 2).join(' ')}`,
            'Layer 3: timing is accepted only when event houses, significators, ruling planets, dasha support, and real-world readiness agree.',
          ],
          practicalGuidance: [judgement.nextQuestion, judgement.timingReadiness],
          remedyDirection: [
            'Use precision: define the event, time window, and real-world decision before asking for timing.',
          ],
          timingWindows: [judgement.timingReadiness],
        }
      : undefined,
    premiumNudge:
      'Premium KP turns this into a proof-backed event judgement with confidence, limitations, and timing support.',
    technicalDetails: [
      ...judgement.proofPath,
      `KP cusps available: ${kp.cusps.length}.`,
      `KP significators available: ${kp.significators.length}.`,
      `Confidence: ${judgement.confidence}.`,
    ],
    technicalSummary:
      'Technical View keeps KP evidence visible: cusps, star/sub/sub-sub lords, significators, ruling planets, and timing support.',
    title: 'KP Horoscope event meaning',
    whatItSays: judgement.plainLanguage,
  };
}

function composeNadiChartInsight(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const plan = composeNadiJyotishPlan(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const lens = plan.storyLens;

  return {
    currentGuidance:
      'Treat the strongest story as a pattern to validate. Ask what repeats, where it activates, and what conscious shift changes the loop.',
    eyebrow: hasPremiumAccess ? 'Premium Nadi story insight' : 'Free Nadi story insight',
    freeInsights: [
      `Strongest thread: ${lens.strongestThread}`,
      `Repeating pattern: ${lens.repeatingPattern}`,
      `Active lesson: ${lens.activeLesson}`,
      `Where the user may be stuck: ${lens.stuckPoint}`,
      `Shift that helps: ${lens.shiftThatHelps}`,
    ],
    governs:
      'planetary story links, karmic pattern validation, Rahu-Ketu style axis awareness, and activation windows',
    lifeAreas: plan.patterns[0]?.lifeAreas ?? ['karmic pattern', 'validation', 'activation'],
    mainChallenge: lens.stuckPoint,
    mainStrength: lens.hiddenPatternSentence,
    premiumDeepDive: [
      plan.premiumSynthesis ?? plan.freePreview,
      `Validation bridge: ${lens.validationBridge}`,
      `Activation summary: ${lens.activationSummary}`,
      ...lens.evidencePath,
    ],
    premiumInsight: hasPremiumAccess
      ? {
          confidenceFraming:
            'Nadi confidence grows through calculated story evidence plus user validation. It must not claim manuscript access or fixed fate.',
          contradictionSignals: [
            'If the user does not validate the pattern, Predicta must soften the reading and ask better questions.',
            'Nadi does not use KP cusp/sub-lord proof.',
          ],
          crossChartSynthesis: [
            'Nadi stays in its own story-link lane. It may feed a future synthesis report only when explicitly labeled as synthesis.',
          ],
          headline: lens.hiddenPatternSentence,
          layeredInterpretation: [
            `Layer 1: the strongest story thread is ${lens.strongestThread}.`,
            `Layer 2: Premium validates the repeating pattern through ${lens.validationBridge}`,
            'Layer 3: activation windows are used as reflective timing prompts, not as fixed fate or manuscript claims.',
          ],
          practicalGuidance: [lens.shiftThatHelps, lens.validationBridge],
          remedyDirection: [
            'Use reflective practice, validation questions, and gentle remedies instead of fear or fatalism.',
          ],
          timingWindows: [lens.activationSummary],
        }
      : undefined,
    premiumNudge:
      'Premium Nadi sequences multiple story links, validates them, and turns activation windows into careful guidance.',
    technicalDetails: [
      ...lens.evidencePath,
      `Patterns available: ${plan.patterns.length}.`,
      `Activations available: ${plan.activations.length}.`,
      'No palm-leaf manuscript access is claimed.',
    ],
    technicalSummary:
      'Technical View keeps Nadi evidence visible: planet links, relation type, life areas, validation questions, and activation windows.',
    title: 'Nadi planetary story meaning',
    whatItSays: lens.hiddenPatternSentence,
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
  const humanStake = CORE_VARGA_HUMAN_STAKES[chartType];
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
    ? ` through ${formatPlanetList(dominantPlanets)}`
    : '';
  const supportPlanetText = supportPlanets.length
    ? ` with secondary reinforcement from ${formatPlanetList(supportPlanets)}`
    : '';
  const dashaSentence = dashaPlacement
    ? `${humanStake.timingFrame} ${dashaPlacement.name} is active through ${formatHouseArea(dashaPlacement.house)}, so this chart is becoming louder through a concrete life area instead of staying abstract.`
    : `${humanStake.timingFrame} The current dasha of ${currentDasha.mahadasha}/${currentDasha.antardasha} still matters, but this varga should be read as a focused confirmation rather than a standalone life chart.`;

  return {
    currentGuidance: dominantHouse
      ? `${humanStake.practicalGuidance} Start with ${activeArea}, then use D1 to judge whether this area is being supported, delayed, or stretched in the main life story.`
      : `${humanStake.practicalGuidance} Use this chart as a focused lens, then confirm the result through D1 and the current dasha before taking it as final.`,
    eyebrow: hasPremiumAccess
      ? `Premium ${definition.premiumLabel}`
      : `Free ${definition.freeLabel}`,
    freeInsights: [
      `Human stakes: ${humanStake.humanStakes}`,
      dominantHouse
        ? `What it is saying: ${humanStake.currentSignal} The clearest signal is ${activeArea}${dominantPlanetText}.`
        : `What it is saying: ${humanStake.currentSignal} This chart is quieter, so the signal should be taken as careful guidance rather than dramatic certainty.`,
      `Strength revealed: ${humanStake.strengthReveals}`,
      `Caution revealed: ${humanStake.cautionReveals}`,
      dashaSentence,
      supportArea
        ? `Support layer: ${supportArea}${supportPlanetText}.`
        : 'Support layer: D1 remains the anchor that decides how much of this chart becomes visible in real life.',
      definition.userValueLine,
    ],
    governs: definition.governs,
    lifeAreas,
    mainChallenge: dominantHouse
      ? `${humanStake.cautionReveals} The pressure point here is confusing ${activeArea} with your whole life story. This chart only governs one layer of experience and must stay anchored to D1.`
      : definition.quietChallenge,
    mainStrength: dominantHouse
      ? `${humanStake.strengthReveals} In this chart, the clearest signal comes through ${activeArea}${dominantPlanetText}.`
      : definition.quietStrength,
    premiumDeepDive: [
      `${definition.premiumLead} Premium explains how ${config.name} supports, complicates, or corrects the promise of D1 through ${humanStake.crossChartAnchor}.`,
      dashaArea
        ? `Premium also reads timing through ${dashaArea} so this chart does not stay theoretical.`
        : 'Premium also adds sharper timing, contradiction handling, and synthesis across related charts.',
      definition.premiumFinish,
    ],
    premiumInsight: buildChartPremiumInsight({
      chartType,
      kundli,
      activeArea,
      supportArea,
      pressureArea: dashaArea,
    }),
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
      ? `${humanStake.humanStakes} Right now it is saying: ${humanStake.currentSignal} The signal is strongest in ${activeArea}${dominantPlanetText}${supportArea ? `, with support around ${supportArea}` : ''}. ${dashaSentence}`
      : `${humanStake.humanStakes} This chart is speaking softly right now, so it should be used as a confirming lens with D1 and current dasha rather than as a dramatic standalone reading.`,
  };
}

function composeUnsupportedCoreVargaInsight(
  chartType: CoreVargaChartType,
  hasPremiumAccess: boolean,
  kundli?: KundliData,
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
    premiumInsight: buildChartPremiumInsight({
      chartType,
      kundli,
      activeArea: definition.defaultArea,
      supportArea: definition.supportArea,
    }),
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

function advancedVargaConfidenceFrame(chartType: AdvancedVargaChartType): {
  freeSentence: string;
  technicalSentence: string;
} {
  const tier = ADVANCED_VARGA_CONFIDENCE_TIERS[chartType];

  if (tier === 'sensitive') {
    return {
      freeSentence:
        'This is a sensitive advanced lens, so Predicta uses it for correction, protection, and steadier choices rather than fear or fixed fate.',
      technicalSentence:
        'Advanced confidence: sensitive. Treat this as a bounded confirmation layer and require D1, dasha, and lived evidence before any strong conclusion.',
    };
  }

  if (tier === 'narrow') {
    return {
      freeSentence:
        'This is a narrow advanced lens, so it is useful for refinement but should not carry the whole reading by itself.',
      technicalSentence:
        'Advanced confidence: narrow. Use this chart to refine a specific topic, then verify the promise through D1 and the relevant core varga.',
    };
  }

  return {
    freeSentence:
      'This is a supporting advanced lens. It can clarify the topic, but D1 and the relevant core varga still decide the main weight.',
    technicalSentence:
      'Advanced confidence: supporting. Read the chart as topic evidence, not as a standalone replacement for D1 or core varga judgement.',
  };
}

function buildAdvancedTechnicalEvidence({
  chart,
  chartType,
  currentDasha,
  dashaPlacement,
  dominantHouse,
  supportHouse,
}: {
  chart: ChartData;
  chartType: AdvancedVargaChartType;
  currentDasha: KundliData['dasha']['current'];
  dashaPlacement?: PlanetPosition;
  dominantHouse?: number;
  supportHouse?: number;
}): string[] {
  const confidence = advancedVargaConfidenceFrame(chartType);
  const dashaEvidence = dashaPlacement
    ? `Dasha evidence: ${dashaPlacement.name} currently links ${currentDasha.mahadasha}/${currentDasha.antardasha} to house ${dashaPlacement.house} (${formatHouseArea(dashaPlacement.house)}) in ${chartType}.`
    : `Dasha evidence: ${currentDasha.mahadasha}/${currentDasha.antardasha} is active, but no direct ${chartType} planet placement should be overstated from it.`;

  return [
    `D1 anchor: ${chartType} is a confirming divisional chart. D1 remains the root promise and this chart only refines its specific topic.`,
    confidence.technicalSentence,
    `Chart-specific interpretation note: ${getChartReadingNote(chart.chartType)}`,
    formatAdvancedHousePlanetDetails(chart, dominantHouse, supportHouse),
    formatAdvancedPlanetConditionProof(chart),
    dashaEvidence,
  ];
}

function formatAdvancedHousePlanetDetails(
  chart: ChartData,
  dominantHouse?: number,
  supportHouse?: number,
): string {
  const occupied = Array.from(
    chart.planetDistribution
      .filter(isCoreJudgementPlanet)
      .reduce<Map<number, PlanetPosition[]>>((accumulator, planet) => {
        const bucket = accumulator.get(planet.house) ?? [];
        bucket.push(planet);
        accumulator.set(planet.house, bucket);
        return accumulator;
      }, new Map()),
  )
    .sort((first, second) => {
      if (first[0] === dominantHouse) {
        return -1;
      }

      if (second[0] === dominantHouse) {
        return 1;
      }

      if (first[0] === supportHouse) {
        return -1;
      }

      if (second[0] === supportHouse) {
        return 1;
      }

      return second[1].length - first[1].length;
    })
    .slice(0, 4)
    .map(([house, planets]) => {
      const planetSummary = planets
        .slice(0, 5)
        .map(planet => `${planet.name} ${planet.sign} ${planet.degree.toFixed(1)}°`)
        .join(', ');

      return `house ${house} (${formatHouseArea(house)}): ${planetSummary}`;
    });

  if (!occupied.length) {
    return 'House/planet details: no core graha cluster is strong enough to carry a narrow technical claim.';
  }

  return `House/planet details: ${occupied.join('; ')}.`;
}

function formatAdvancedPlanetConditionProof(chart: ChartData): string {
  const sun = chart.planetDistribution.find(planet => planet.name === 'Sun');
  const conditionRows = chart.planetDistribution
    .filter(isCoreJudgementPlanet)
    .map(planet => ({
      planet,
      states: describePlanetConditions(planet, sun),
    }))
    .filter(item => item.states.length > 0);

  if (!conditionRows.length) {
    return 'Planet condition proof: no exalted, debilitated, combust, or retrograde condition stands out among core grahas; read sign, house, and D1 support before increasing confidence.';
  }

  const proof = conditionRows
    .slice(0, 6)
    .map(
      ({ planet, states }) =>
        `${planet.name} in ${planet.sign} house ${planet.house} (${states.join(', ')})`,
    )
    .join('; ');

  return `Planet condition proof: ${proof}.`;
}

function describePlanetConditions(
  planet: PlanetPosition,
  sun?: PlanetPosition,
): string[] {
  const conditions: string[] = [];
  const dignity = PLANET_DIGNITIES[planet.name];

  if (dignity?.exalted === planet.sign) {
    conditions.push('exalted');
  }

  if (dignity?.debilitated === planet.sign) {
    conditions.push('debilitated');
  }

  if (planet.retrograde) {
    conditions.push('retrograde');
  }

  if (isCombustPlanet(planet, sun)) {
    conditions.push('combust');
  }

  return conditions;
}

function isCombustPlanet(planet: PlanetPosition, sun?: PlanetPosition): boolean {
  if (!sun || planet.name === 'Sun' || planet.name === 'Rahu' || planet.name === 'Ketu') {
    return false;
  }

  const orb = COMBUSTION_ORBS[planet.name];

  if (orb === undefined) {
    return false;
  }

  return getAngularSeparation(planet.absoluteLongitude, sun.absoluteLongitude) <= orb;
}

function getAngularSeparation(first: number, second: number): number {
  const raw = Math.abs(first - second) % 360;

  return raw > 180 ? 360 - raw : raw;
}

function isCoreJudgementPlanet(planet: PlanetPosition): boolean {
  return (
    planet.kind !== 'modern' &&
    planet.kind !== 'sensitive' &&
    planet.kind !== 'upagraha'
  );
}

function composeAdvancedVargaInsight(
  chart: ChartData,
  kundli: KundliData,
  hasPremiumAccess: boolean,
): ChartInsight {
  const chartType = chart.chartType as AdvancedVargaChartType;
  const config = getChartConfig(chartType);
  const definition = ADVANCED_VARGA_INSIGHT_DEFINITIONS[chartType];
  const confidence = advancedVargaConfidenceFrame(chartType);
  const clusters = chart.planetDistribution
    .filter(isCoreJudgementPlanet)
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
    ? ` through ${formatPlanetList(dominantPlanets)}`
    : '';
  const supportPlanetText = supportPlanets.length
    ? ` with secondary reinforcement from ${formatPlanetList(supportPlanets)}`
    : '';
  const dashaSentence = dashaPlacement
    ? `${dashaPlacement.name} is active in this chart through ${formatHouseArea(dashaPlacement.house)}, so current timing is making this advanced layer louder in practical life.`
    : `The current dasha of ${currentDasha.mahadasha}/${currentDasha.antardasha} still matters here, but this chart should stay a focused confirming lens instead of a standalone verdict.`;
  const technicalEvidence = buildAdvancedTechnicalEvidence({
    chart,
    chartType,
    currentDasha,
    dashaPlacement,
    dominantHouse,
    supportHouse,
  });

  return {
    currentGuidance: dominantHouse
      ? `${definition.guidanceLead} Start with ${activeArea}, then check whether D1 and the active dasha are actually carrying this theme into visible life.`
      : `${definition.guidanceLead} Use this chart as a careful confirming lens and let D1 decide how much weight it deserves right now.`,
    eyebrow: hasPremiumAccess
      ? `Premium ${definition.premiumLabel}`
      : `Free ${definition.freeLabel}`,
    freeInsights: [
      dominantHouse
        ? `${definition.freeLead} ${activeArea}${dominantPlanetText} is where this advanced chart is speaking most clearly right now.`
        : `${definition.freeLead} This chart is quieter, so it should be used as a subtle clue rather than a dramatic conclusion.`,
      dashaSentence,
      supportArea
        ? `${definition.supportLead} ${supportArea}${supportPlanetText}.`
        : `${definition.supportLead} D1 remains the anchor that decides how much of this chart becomes visible in lived life.`,
      definition.userValueLine,
      confidence.freeSentence,
    ],
    governs: definition.governs,
    lifeAreas,
    mainChallenge: dominantHouse
      ? `${definition.challengeLead} The risk here is treating ${activeArea} as a full-life judgement when this chart only refines one narrow layer and must stay anchored to D1.`
      : definition.quietChallenge,
    mainStrength: dominantHouse
      ? `${definition.strengthLead} the clearest advanced-chart signal comes through ${activeArea}${dominantPlanetText}.`
      : definition.quietStrength,
    premiumDeepDive: [
      `${definition.premiumLead} Premium explains how ${config.name} supports, sharpens, or softens the main D1 promise.`,
      dashaArea
        ? `Premium also reads the timing emphasis through ${dashaArea} so this advanced chart becomes usable instead of decorative.`
        : 'Premium also adds tighter timing, contradiction handling, and cross-chart confidence framing.',
      definition.premiumFinish,
    ],
    premiumInsight: buildChartPremiumInsight({
      chartType,
      kundli,
      activeArea,
      supportArea,
      pressureArea: dashaArea,
    }),
    premiumNudge: definition.premiumNudge,
    technicalDetails: [
      `${chartType} focus: ${CHART_FOCUS[chartType]}.`,
      dominantHouse
        ? `Primary house emphasis: house ${dominantHouse} (${activeArea})${dominantPlanetText}.`
        : 'No single house dominates this advanced chart preview, so the signal should stay conservative.',
      supportHouse
        ? `Secondary support: house ${supportHouse} (${supportArea})${supportPlanetText}.`
        : 'No second cluster stands out strongly enough to overrule the main emphasis.',
      ...technicalEvidence,
      definition.technicalGuardrail,
    ],
    technicalSummary: hasPremiumAccess
      ? `Technical View keeps the ${config.name} evidence visible while Premium adds deeper D1 synthesis, timing support, and caution framing.`
      : `Technical View keeps the ${config.name} evidence visible, while Insight View explains the practical meaning of this advanced chart in plain language.`,
    title: config.name,
    whatItSays: dominantHouse
      ? `${definition.storyLead} Right now the signal is strongest in ${activeArea}${dominantPlanetText}${supportArea ? `, with support around ${supportArea}` : ''}. ${dashaSentence}`
      : `${definition.storyLead} This advanced chart is speaking softly right now, so it should be used as a careful confirming lens with D1 and current dasha rather than as a dramatic standalone reading.`,
  };
}

function composeUnsupportedAdvancedVargaInsight(
  chartType: AdvancedVargaChartType,
  hasPremiumAccess: boolean,
  kundli?: KundliData,
): ChartInsight {
  const config = getChartConfig(chartType);
  const definition = ADVANCED_VARGA_INSIGHT_DEFINITIONS[chartType];
  const confidence = advancedVargaConfidenceFrame(chartType);

  return {
    currentGuidance:
      'Use the purpose of this advanced chart now, but wait for prepared chart evidence before using it for strong prediction or narrow technical claims.',
    eyebrow: 'Careful reading',
    freeInsights: [
      `${config.name} still governs ${definition.governs.toLowerCase()}`,
      'Predicta is keeping this advanced chart conservative until the chart evidence is fully prepared.',
      definition.userValueLine,
      confidence.freeSentence,
    ],
    governs: definition.governs,
    lifeAreas: definition.lifeAreas,
    mainChallenge:
      'The challenge is over-reading a narrow chart whose evidence is not fully prepared yet.',
    mainStrength:
      'You can still understand why this advanced chart matters before moving into deeper evidence.',
    premiumDeepDive: [
      `${definition.premiumLead} Premium should only go deeper once the chart evidence is fully ready.`,
      definition.premiumFinish,
    ],
    premiumInsight: buildChartPremiumInsight({
      chartType,
      kundli,
      activeArea: definition.defaultArea,
      supportArea: definition.supportArea,
    }),
    premiumNudge: hasPremiumAccess ? undefined : definition.premiumNudge,
    technicalDetails: [
      `${chartType} is visible but kept conservative until chart preparation is complete.`,
      `D1 anchor: ${chartType} is a confirming divisional chart. D1 remains the root promise and this chart only refines its specific topic.`,
      confidence.technicalSentence,
      definition.technicalGuardrail,
      `Chart-specific interpretation note: ${getChartReadingNote(chartType)}`,
    ],
    technicalSummary:
      'Technical View stays bounded here because full advanced-chart evidence is not yet prepared.',
    title: config.name,
    whatItSays:
      `This ${config.name} governs ${definition.governs.toLowerCase()} Predicta is keeping the live reading careful until the chart evidence is complete, so the purpose stays visible without pretending to certainty.`,
  };
}

type PremiumSynthesisChartType = ChartType | 'CHALIT';

function buildChartPremiumInsight({
  chartType,
  kundli,
  activeArea,
  supportArea,
  pressureArea,
}: {
  chartType: PremiumSynthesisChartType;
  kundli?: KundliData;
  activeArea: string;
  supportArea?: string;
  pressureArea?: string;
}): ChartPremiumInsight {
  if (!kundli) {
    return {
      headline:
        'Premium keeps the meaning clear here, but waits for fuller chart evidence before making strong synthesis claims.',
      layeredInterpretation: [
        'Layer 1: keep the basic chart meaning available first; do not hide the main point behind Premium.',
        'Layer 2: wait for D1 anchoring, timing, and related chart evidence before turning this into a senior reading.',
        'Layer 3: use Premium for practical synthesis only after the chart evidence is complete.',
      ],
      timingWindows: [
        'Timing windows deepen after the saved Kundli evidence is fully prepared.',
      ],
      contradictionSignals: [
        'Contradiction handling stays careful until the chart evidence is ready.',
      ],
      crossChartSynthesis: [
        'Cross-chart synthesis becomes available once D1 anchoring and related chart evidence are fully prepared.',
      ],
      practicalGuidance: [
        `Use ${activeArea} as the current topic, but let D1 remain the root reference until the chart is fully ready.`,
      ],
      remedyDirection: [
        'Keep remedies simple and low-risk until Premium has a full chart evidence layer to confirm them.',
      ],
      confidenceFraming:
        'Confidence is intentionally bounded because this chart is still in a careful-reading state.',
    };
  }

  const current = kundli.dasha.current;
  const nextMahadasha = findNextMahadasha(kundli);
  const strongest = kundli.ashtakavarga.strongestHouses
    .slice(0, 2)
    .map(formatHouseArea);
  const weakest = kundli.ashtakavarga.weakestHouses
    .slice(0, 2)
    .map(formatHouseArea);
  const transitSupport = pickTransitByWeight(kundli, 'supportive');
  const transitCaution = pickTransitByWeight(kundli, 'challenging');
  const crossChartSynthesis = buildCrossChartSynthesis({
    chartType,
    kundli,
    activeArea,
    supportArea,
  });
  const layeredInterpretation = buildPremiumLayeredInterpretation({
    activeArea,
    chartType,
    current,
    pressureArea,
    supportArea,
  });

  return {
    headline: buildPremiumHeadline(chartType, activeArea, supportArea, pressureArea),
    layeredInterpretation,
    timingWindows: [
      `Current timing window: ${current.mahadasha}/${current.antardasha} from ${current.startDate} to ${current.endDate}.`,
      nextMahadasha
        ? `Next major chapter: ${nextMahadasha.mahadasha} begins on ${nextMahadasha.startDate}, so Premium watches whether this chart gains or loses weight then.`
        : `This chart should be read inside the active ${current.mahadasha}/${current.antardasha} chapter before making strong future claims.`,
      transitSupport
        ? `Transit support: ${transitSupport.planet} is currently helping through house ${transitSupport.houseFromLagna}, which can make ${activeArea} easier to activate.`
        : transitCaution
        ? `Transit caution: ${transitCaution.planet} is currently pressing house ${transitCaution.houseFromLagna}, so Premium keeps timing practical instead of dramatic.`
        : `Transit overlay stays secondary here, so dasha remains the main timing frame for ${activeArea}.`,
    ],
    contradictionSignals: buildStrengthContradictionAnalysis({
      activeArea,
      pressureArea,
      strongest,
      supportArea,
      weakest,
    }),
    crossChartSynthesis,
    practicalGuidance: buildPremiumGuidance(chartType, activeArea, supportArea, pressureArea),
    remedyDirection: buildPremiumRemedyDirection(kundli, chartType, activeArea),
    confidenceFraming: buildConfidenceFraming(kundli, chartType),
  };
}

function buildPremiumHeadline(
  chartType: PremiumSynthesisChartType,
  activeArea: string,
  supportArea?: string,
  pressureArea?: string,
): string {
  if (chartType === 'D1') {
    return `Premium reads ${activeArea} as the main life promise, then checks whether ${supportArea ?? 'the next support area'} and ${pressureArea ?? 'the pressure zone'} confirm or complicate it before giving advice.`;
  }

  if (chartType === 'CHALIT') {
    return `Premium treats ${activeArea} as the lived-delivery layer, then checks whether D1 promise and the source house are actually aligned before making practical judgment.`;
  }

  return `Premium treats ${activeArea} as the main signal in ${chartType}, then checks whether D1, timing, and ${supportArea ?? 'a second support layer'} confirm it before calling it reliable.`;
}

function buildPremiumLayeredInterpretation({
  activeArea,
  chartType,
  current,
  pressureArea,
  supportArea,
}: {
  activeArea: string;
  chartType: PremiumSynthesisChartType;
  current: KundliData['dasha']['current'];
  pressureArea?: string;
  supportArea?: string;
}): string[] {
  const chartRole = chartType === 'D1'
    ? 'the root life promise'
    : chartType === 'CHALIT'
    ? 'the lived delivery layer'
    : `the focused ${chartType} topic layer`;

  return [
    `Layer 1: ${chartType} is read as ${chartRole}, with ${activeArea} as the first human concern rather than a placement label.`,
    `Layer 2: D1, dasha, and ${supportArea ?? 'the next meaningful support chart'} are checked together so the reading can separate promise, support, and pressure.`,
    `Layer 3: the active ${current.mahadasha}/${current.antardasha} period decides whether this insight is ready for action now or should remain preparation.`,
    pressureArea
      ? `Layer 4: ${pressureArea} is treated as the contradiction zone, so Premium explains what to strengthen before pushing harder.`
      : 'Layer 4: Premium looks for contradiction before advice, so confidence comes from agreement across charts instead of one loud signal.',
  ];
}

function buildStrengthContradictionAnalysis({
  activeArea,
  pressureArea,
  strongest,
  supportArea,
  weakest,
}: {
  activeArea: string;
  pressureArea?: string;
  strongest: string[];
  supportArea?: string;
  weakest: string[];
}): string[] {
  return [
    strongest.length
      ? `Strength map: D1 supports ${strongest.join(' and ')}, so Premium checks whether ${activeArea} is backed by those houses or fighting them.`
      : `Strength map: Premium checks whether ${activeArea} is actually supported by D1 before trusting the chart too quickly.`,
    weakest.length
      ? `Contradiction map: D1 shows softness around ${weakest.join(' and ')}, so overlap with ${pressureArea ?? activeArea} is handled as a real caution instead of ignored.`
      : `Contradiction map: Premium looks for where ${pressureArea ?? activeArea} could be stretched by weaker D1 support.`,
    supportArea
      ? `Synthesis check: ${supportArea} acts as the balancing layer, so Premium does not judge ${activeArea} in isolation.`
      : `Synthesis check: Premium looks for a second confirming life area before treating ${activeArea} as decisive.`,
  ];
}

function buildCrossChartSynthesis({
  chartType,
  kundli,
  activeArea,
  supportArea,
}: {
  chartType: PremiumSynthesisChartType;
  kundli: KundliData;
  activeArea: string;
  supportArea?: string;
}): string[] {
  const chalitFoundation = composeChalitBhavKpFoundation(kundli, { depth: 'PREMIUM' });
  const nadiPlan = composeNadiJyotishPlan(kundli, { depth: 'PREMIUM' });
  const pairTargets = getCrossChartTargets(chartType);

  const lines = pairTargets.map(target => {
    if (target === 'CHALIT') {
      return `${chartType === 'D1' ? 'D1 + Chalit' : `${chartType} + Chalit`}: ${chalitFoundation.bhavChalit.premiumSynthesis ?? chalitFoundation.bhavChalit.freeInsight}`;
    }

    if (target === 'KP') {
      return `${chartType === 'D1' ? 'D1 + KP' : `${chartType} + KP`}: ${chalitFoundation.kp.premiumSynthesis ?? chalitFoundation.kp.freeInsight}`;
    }

    if (target === 'NADI') {
      return `${chartType === 'D1' ? 'D1 + Nadi' : `${chartType} + Nadi`}: ${nadiPlan.premiumSynthesis ?? nadiPlan.freePreview}`;
    }

    return describeChartPairSignal(kundli, chartType, target, activeArea, supportArea);
  });

  return lines.slice(0, 5);
}

function getCrossChartTargets(
  chartType: PremiumSynthesisChartType,
): Array<ChartType | 'CHALIT' | 'KP' | 'NADI'> {
  switch (chartType) {
    case 'D1':
      return ['D9', 'D10', 'CHALIT', 'KP', 'NADI'];
    case 'CHALIT':
      return ['D1', 'KP'];
    case 'D2':
      return ['D10', 'D1'];
    case 'D4':
      return ['D12', 'D1'];
    case 'D7':
      return ['D9', 'D1'];
    case 'D9':
      return ['D1', 'D7'];
    case 'D10':
      return ['D1', 'D2'];
    case 'D12':
      return ['D40', 'D45'];
    case 'D20':
      return ['D9', 'D1'];
    case 'D24':
      return ['D10', 'D1'];
    case 'D30':
      return ['D6', 'D1'];
    case 'D5':
      return ['D10', 'D1'];
    case 'D6':
      return ['D30', 'D1'];
    case 'D8':
      return ['D30', 'D1'];
    case 'D11':
      return ['D2', 'D10'];
    case 'D16':
      return ['D4', 'D1'];
    case 'D17':
      return ['D10', 'D11'];
    case 'D18':
      return ['D30', 'D1'];
    case 'D19':
      return ['D9', 'D20'];
    case 'D21':
      return ['D9', 'D1'];
    case 'D22':
      return ['D27', 'D1'];
    case 'D23':
      return ['D19', 'D1'];
    case 'D25':
      return ['D20', 'D27'];
    case 'D26':
      return ['D6', 'D30'];
    case 'D27':
      return ['D3', 'D6'];
    case 'D28':
      return ['D8', 'D30'];
    case 'D29':
      return ['D11', 'D19'];
    case 'D31':
      return ['D18', 'D30'];
    case 'D32':
      return ['D3', 'D27'];
    case 'D33':
      return ['D11', 'D19'];
    case 'D34':
      return ['D21', 'D60'];
    case 'D40':
      return ['D12', 'D1'];
    case 'D45':
      return ['D12', 'D1'];
    case 'D60':
      return ['D1', 'D9'];
    default:
      return ['D1'];
  }
}

function describeChartPairSignal(
  kundli: KundliData,
  sourceChartType: PremiumSynthesisChartType,
  targetChartType: ChartType,
  activeArea: string,
  supportArea?: string,
): string {
  const signal = getChartDominantSignal(kundli, targetChartType);
  const pairLabel =
    sourceChartType === 'D1'
      ? `D1 + ${targetChartType}`
      : `${sourceChartType} + ${targetChartType}`;
  return `${pairLabel}: ${signal.chartName} is loudest around ${signal.area}, so Premium checks whether that supports ${activeArea}${supportArea ? ` and balances ${supportArea}` : ''} in the root chart.`;
}

function getChartDominantSignal(
  kundli: KundliData,
  chartType: ChartType,
): { area: string; chartName: string } {
  const chart = kundli.charts[chartType];
  const chartName = getChartConfig(chartType).name;

  if (!chart) {
    return { area: getChartConfig(chartType).purpose, chartName };
  }

  const clusterMap = chart.planetDistribution
    .filter(
      planet =>
        planet.kind !== 'modern' &&
        planet.kind !== 'sensitive' &&
        planet.kind !== 'upagraha',
    )
    .reduce<Record<number, number>>((accumulator, planet) => {
      accumulator[planet.house] = (accumulator[planet.house] ?? 0) + 1;
      return accumulator;
    }, {});

  const dominantHouse = Object.entries(clusterMap)
    .sort((first, second) => second[1] - first[1])[0]?.[0];

  return dominantHouse
    ? { area: formatHouseArea(Number(dominantHouse)), chartName }
    : { area: getChartConfig(chartType).purpose, chartName };
}

function buildPremiumGuidance(
  chartType: PremiumSynthesisChartType,
  activeArea: string,
  supportArea?: string,
  pressureArea?: string,
): string[] {
  const base = [
    `Use ${activeArea} as the main decision lens, but let D1 decide how much of it is truly ready to act on.`,
    supportArea
      ? `Keep ${supportArea} involved as the balancing layer so this reading does not become one-dimensional.`
      : `Look for a second supporting life area before treating this chart as decisive.`,
  ];

  if (pressureArea) {
    base.push(`Move carefully where ${pressureArea} is under strain, because that is where timing and maturity matter most.`);
  }

  if (chartType === 'D1') {
    base.push('Use Premium to decide what deserves action now, what needs patience, and what should not be forced this dasha.');
  } else if (chartType === 'CHALIT') {
    base.push('Use Premium to separate the promised area from the lived-delivery area before changing your conclusion.');
  } else {
    base.push(`Use Premium to keep ${chartType} in its proper role: focused, useful, and anchored to D1 rather than over-expanded.`);
  }

  return base;
}

function buildPremiumRemedyDirection(
  kundli: KundliData,
  chartType: PremiumSynthesisChartType,
  activeArea: string,
): string[] {
  const remedyLines = (kundli.remedies ?? [])
    .slice(0, 2)
    .map(remedy => `${remedy.title}: ${remedy.practice}`);

  if (remedyLines.length) {
    return remedyLines;
  }

  const weeklyIntention = kundli.sadhanaRemedyPath?.weeklyIntention;

  return [
    weeklyIntention
      ? `Keep the remedy tone practical: ${weeklyIntention}`
      : `Keep remedies simple and tied to ${activeArea}, not to fear or grand promises.`,
    chartType === 'D30' || chartType === 'D8' || chartType === 'D28'
      ? 'Choose calming, disciplined remedies over intense or fear-driven actions.'
      : 'Prefer steady discipline, cleaner routines, and one repeatable practice over too many symbolic actions.',
  ];
}

function buildConfidenceFraming(
  kundli: KundliData,
  chartType: PremiumSynthesisChartType,
): string {
  const sensitiveCharts = new Set<PremiumSynthesisChartType>([
    'D8',
    'D18',
    'D21',
    'D22',
    'D28',
    'D30',
    'D31',
    'D34',
    'D60',
  ]);

  if (kundli.birthDetails.isTimeApproximate || kundli.birthDetails.timeConfidence === 'approximate') {
    return `Confidence stays medium at best because birth time is approximate, so ${chartType} should be used for pattern guidance more than sharp certainty.`;
  }

  if (sensitiveCharts.has(chartType)) {
    return `Confidence stays intentionally restrained because ${chartType} is a narrow or sensitive chart and should not be overstated, even with a stable birth time.`;
  }

  return `Confidence is stronger here because birth time is stable, D1 anchoring is available, and ${chartType} can be judged with timing instead of guesswork.`;
}

function findNextMahadasha(
  kundli: KundliData,
): { mahadasha: string; startDate: string } | undefined {
  const current = kundli.dasha.current.mahadasha;
  const currentIndex = kundli.dasha.timeline.findIndex(
    item => item.mahadasha === current,
  );

  return currentIndex >= 0 ? kundli.dasha.timeline[currentIndex + 1] : undefined;
}

function pickTransitByWeight(
  kundli: KundliData,
  weight: 'supportive' | 'challenging',
) {
  return (kundli.transits ?? []).find(transit => transit.weight === weight);
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

function withIndefiniteArticle(phrase: string): string {
  return /^[aeiou]/i.test(phrase) ? `an ${phrase}` : `a ${phrase}`;
}

function stripTrailingSentencePunctuation(value: string): string {
  return value.replace(/[.!?]+$/, '');
}

function formatPlanetList(planets: string[]): string {
  if (planets.length <= 1) {
    return planets[0] ?? '';
  }

  if (planets.length === 2) {
    return `${planets[0]} and ${planets[1]}`;
  }

  return `${planets.slice(0, -1).join(', ')}, and ${planets[planets.length - 1]}`;
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

function isAdvancedVargaChartType(
  chartType: ChartType,
): chartType is AdvancedVargaChartType {
  return ADVANCED_VARGA_TYPES.has(chartType as AdvancedVargaChartType);
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

type VargaInsightDefinition = {
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
};

type CoreVargaHumanStake = {
  humanStakes: string;
  currentSignal: string;
  strengthReveals: string;
  cautionReveals: string;
  practicalGuidance: string;
  timingFrame: string;
  crossChartAnchor: string;
};

const CORE_VARGA_HUMAN_STAKES: Record<CoreVargaChartType, CoreVargaHumanStake> = {
  D2: {
    humanStakes:
      'D2 is about resource rhythm: how money is earned, held, shared, spent, and emotionally digested.',
    currentSignal:
      'resources need cleaner handling, steadier nourishment, and less reaction around security.',
    strengthReveals:
      'It reveals where financial steadiness, practical speech, and family-value support can become usable strength.',
    cautionReveals:
      'It cautions against money anxiety, careless spending, or treating wealth as the whole measure of safety.',
    practicalGuidance:
      'Make money decisions slower, document commitments, and build habits that protect what is already coming in.',
    timingFrame:
      'Money timing should be judged through active dasha, career support, and actual resource behavior.',
    crossChartAnchor: 'D1 life direction, D10 work delivery, and timing',
  },
  D3: {
    humanStakes:
      'D3 is about nerve, initiative, siblings, stamina, and whether effort becomes clean action or scattered struggle.',
    currentSignal:
      'courage wants direction, not just intensity, and effort must be aimed where it can actually move life.',
    strengthReveals:
      'It reveals where self-driven effort, resilience, and practical courage can cut through resistance.',
    cautionReveals:
      'It cautions against reactive bravery, wasted movement, sibling friction, and effort without recovery.',
    practicalGuidance:
      'Choose fewer battles, pace the body, and put courage behind one useful action instead of ten noisy attempts.',
    timingFrame:
      'Effort timing should be judged through dasha pressure, D1 support, and whether daily stamina is available.',
    crossChartAnchor: 'D1 initiative, D6 pressure handling, and lived stamina',
  },
  D4: {
    humanStakes:
      'D4 is about the private foundation: home, property, emotional rootedness, and whether life has a stable inner base.',
    currentSignal:
      'inner stability is becoming central, so outer progress depends on a calmer base behind the scenes.',
    strengthReveals:
      'It reveals where home, land, privacy, and emotional steadiness can become real support.',
    cautionReveals:
      'It cautions against restlessness, unsettled home patterns, or ignoring the emotional cost of instability.',
    practicalGuidance:
      'Stabilize the base first: routines, home decisions, rest, and emotional boundaries matter more than appearance.',
    timingFrame:
      'Home and property timing should be checked through D1, dasha, and whether emotional readiness exists.',
    crossChartAnchor: 'D1 foundations, D12 lineage, and Chalit delivery',
  },
  D7: {
    humanStakes:
      'D7 is about what life asks you to nurture: children, creativity, fertility themes, and the legacy that grows through care.',
    currentSignal:
      'creation needs patience, protection, and responsibility rather than pressure or comparison.',
    strengthReveals:
      'It reveals where blessings can grow through mentoring, creative continuity, children, or patient nurturing.',
    cautionReveals:
      'It cautions against projecting expectations onto children, legacy, or creative outcomes too quickly.',
    practicalGuidance:
      'Care for what is growing without forcing its timeline; nurture consistently and reduce emotional pressure.',
    timingFrame:
      'Children and legacy timing should be read through D1, D9, dasha, and real-life readiness.',
    crossChartAnchor: 'D1 fifth-house promise, D9 maturity, and timing',
  },
  D9: {
    humanStakes:
      'D9 is about dharma maturity: marriage truth, inner refinement, soul-strength, and what becomes meaningful with time.',
    currentSignal:
      'maturity is the test, so relationships and dharma must be judged by depth, consistency, and lived alignment.',
    strengthReveals:
      'It reveals where commitment, fortune, values, and inner strength deepen after surface desire settles.',
    cautionReveals:
      'It cautions against fantasy, immature promises, or judging marriage and dharma from outer attraction alone.',
    practicalGuidance:
      'Look for alignment over excitement; choose what matures well rather than what only feels immediate.',
    timingFrame:
      'Relationship and dharma timing should be checked through D1, dasha, and lived maturity.',
    crossChartAnchor: 'D1 promise, relationship evidence, and dharma timing',
  },
  D10: {
    humanStakes:
      'D10 is about public delivery: career promise, responsibility, authority, contribution, and the role the world can recognize.',
    currentSignal:
      'work must become more defined, useful, and accountable before authority can feel stable.',
    strengthReveals:
      'It reveals where professional role, leadership, reputation, and contribution can become visible.',
    cautionReveals:
      'It cautions against chasing status without role clarity, responsibility, or sustained delivery.',
    practicalGuidance:
      'Refine the role, make the contribution concrete, and build authority through consistent public usefulness.',
    timingFrame:
      'Career timing should be read through D1, dasha, D2 resources, and actual professional momentum.',
    crossChartAnchor: 'D1 career promise, D2 resource flow, and dasha timing',
  },
  D12: {
    humanStakes:
      'D12 is about lineage: parents, inheritance, family atmosphere, ancestral burdens, and patterns carried forward.',
    currentSignal:
      'family imprint is influencing the present, so inherited patterns need awareness instead of blame.',
    strengthReveals:
      'It reveals where parental support, ancestral memory, and family continuity can become wisdom.',
    cautionReveals:
      'It cautions against unconsciously repeating family burdens or calling inherited pressure personal failure.',
    practicalGuidance:
      'Honor what strengthens you, name what burdens you, and choose one family pattern to soften consciously.',
    timingFrame:
      'Lineage timing should be checked through D1, D40, D45, and active family-life events.',
    crossChartAnchor: 'D1 roots, D40 maternal line, and D45 paternal line',
  },
  D16: {
    humanStakes:
      'D16 is about lived comfort: vehicles, lifestyle, ease, pleasure, emotional support, and whether life feels sustainable.',
    currentSignal:
      'comfort should support stability, not become escape, overindulgence, or a substitute for emotional repair.',
    strengthReveals:
      'It reveals where ease, beauty, vehicles, and lifestyle choices can restore the person.',
    cautionReveals:
      'It cautions against comfort without structure, pleasure that weakens steadiness, or lifestyle strain.',
    practicalGuidance:
      'Improve one comfort system practically: sleep, vehicle, home ease, spending rhythm, or recovery habit.',
    timingFrame:
      'Comfort timing should be judged through D1, D4, dasha, and whether the lifestyle can actually be maintained.',
    crossChartAnchor: 'D1 support, D4 home base, and resource reality',
  },
  D20: {
    humanStakes:
      'D20 is about inner practice: devotion, mantra, discipline, surrender, and the spiritual rhythm that steadies life.',
    currentSignal:
      'practice needs sincerity and repetition rather than performance, intensity, or spiritual display.',
    strengthReveals:
      'It reveals where devotion, sadhana, grace, and inner discipline can make the person steadier.',
    cautionReveals:
      'It cautions against inconsistency, spiritual bypassing, or seeking relief without discipline.',
    practicalGuidance:
      'Choose one small practice and keep it regular; the chart rewards sincerity more than drama.',
    timingFrame:
      'Practice timing should be read through D1, D9, current dasha, and actual daily discipline.',
    crossChartAnchor: 'D1 purpose, D9 dharma, and lived practice',
  },
  D24: {
    humanStakes:
      'D24 is about learning karma: education, teachers, study rhythm, knowledge confidence, and the discipline of mastery.',
    currentSignal:
      'knowledge needs structure, repetition, and the right teacher or method before it becomes usable skill.',
    strengthReveals:
      'It reveals where study, memory, teachers, and disciplined learning can become long-term advantage.',
    cautionReveals:
      'It cautions against scattered learning, information addiction, or quitting before skill matures.',
    practicalGuidance:
      'Pick a learning path, reduce noise, and turn knowledge into practice through a repeatable study rhythm.',
    timingFrame:
      'Education timing should be checked through D1, D10 skill expression, dasha, and current effort.',
    crossChartAnchor: 'D1 direction, D10 application, and study discipline',
  },
  D30: {
    humanStakes:
      'D30 is about protection: stress, damage patterns, vulnerability, pressure points, and how to reduce avoidable harm.',
    currentSignal:
      'pressure must be handled practically, with boundaries and prevention instead of fear or fatalistic language.',
    strengthReveals:
      'It reveals where resilience, caution, and protective habits can reduce strain.',
    cautionReveals:
      'It cautions against unmanaged stress, repeated friction, hidden depletion, and careless exposure.',
    practicalGuidance:
      'Lower the stress load, protect routines, and treat caution as self-respect rather than fear.',
    timingFrame:
      'Stress timing should be read through D1, dasha, health habits, and repeated lived patterns.',
    crossChartAnchor: 'D1 pressure houses, D6 struggle, and real-life prevention',
  },
  D40: {
    humanStakes:
      'D40 is about maternal inheritance: emotional grace, blessings, softness, and unresolved residue from the mother line.',
    currentSignal:
      'maternal-line influence is subtle, so emotional support and inherited tenderness need careful recognition.',
    strengthReveals:
      'It reveals where grace, softness, care, and maternal blessings can support the person.',
    cautionReveals:
      'It cautions against carrying maternal pain unconsciously or overlooking quiet inherited support.',
    practicalGuidance:
      'Notice what the mother line gave, what still hurts, and what emotional pattern can be healed gently.',
    timingFrame:
      'Maternal-line timing should be read through D12, D1, family events, and emotional evidence.',
    crossChartAnchor: 'D12 lineage, D1 roots, and maternal evidence',
  },
  D45: {
    humanStakes:
      'D45 is about paternal inheritance: character, standards, honor, discipline, and the weight or merit of the father line.',
    currentSignal:
      'paternal-line standards are active, so discipline must become support rather than harsh self-judgement.',
    strengthReveals:
      'It reveals where inherited merit, character, duty, and standards can become stabilizing strength.',
    cautionReveals:
      'It cautions against rigidity, inherited pressure, pride, or carrying family honor as a burden.',
    practicalGuidance:
      'Keep the discipline that strengthens you and soften the standard that turns into punishment.',
    timingFrame:
      'Paternal-line timing should be read through D12, D1, duty patterns, and visible family context.',
    crossChartAnchor: 'D12 lineage, D1 character, and paternal evidence',
  },
  D60: {
    humanStakes:
      'D60 is about deep karma: root tendencies, hidden causes, destiny texture, and patterns that feel older than the visible story.',
    currentSignal:
      'deep background patterning may be present, but it must be handled with humility and birth-time caution.',
    strengthReveals:
      'It reveals where a visible life pattern may have a deeper karmic root or repeating texture.',
    cautionReveals:
      'It cautions against false certainty, fear, or using deep-karma language without strong supporting evidence.',
    practicalGuidance:
      'Use D60 as a confirmation layer only; keep the guidance humble, practical, and anchored to D1.',
    timingFrame:
      'Deep-karma timing should be read only with D1, D9, dasha, and birth-time confidence.',
    crossChartAnchor: 'D1, D9, dasha, and birth-time confidence',
  },
};

const CORE_VARGA_INSIGHT_DEFINITIONS: Record<CoreVargaChartType, VargaInsightDefinition> = {
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

const ADVANCED_VARGA_INSIGHT_DEFINITIONS: Record<
  AdvancedVargaChartType,
  VargaInsightDefinition
> = {
  D5: {
    defaultArea: 'career, responsibility, and public role',
    supportArea: 'creativity, children, merit, and self-expression',
    governs:
      'Authority, recognition, merit, creative stature, and how leadership becomes visible when your promise is strong enough to carry it.',
    storyLead:
      'This D5 chart is speaking about recognition, earned merit, and the type of authority that becomes visible when your work carries weight.',
    strengthLead: 'The strongest D5 authority signal is that',
    challengeLead:
      'The caution in D5 is confusing visibility with substance or status with merit.',
    guidanceLead:
      'Use D5 to judge how leadership is earned and expressed, not to chase labels alone.',
    freeLead: 'The authority story here says',
    supportLead: 'The next merit support signal is',
    userValueLine:
      'Use this chart to understand where your recognition becomes credible, not just where you want to be seen.',
    premiumLead:
      'Premium turns D5 into a deeper authority, merit, and recognition reading.',
    premiumFinish:
      'Premium also connects D5 with D1 and D10 so leadership is read with life-direction and career context.',
    premiumLabel: 'authority and merit analysis',
    freeLabel: 'authority and merit insight',
    premiumNudge:
      'Premium turns D5 into a stronger recognition and leadership reading with D1 and D10 synthesis.',
    quietChallenge:
      'The caution here is overreach: a quiet D5 asks for steadier merit-building rather than image pressure.',
    quietStrength:
      'The strength here is credibility: even a calm D5 can show where authority grows naturally.',
    technicalGuardrail:
      'D5 is an authority and recognition lens. Read it with D1 and D10 instead of inflating it into a full life chart.',
    lifeAreas: ['authority', 'recognition', 'leadership', 'merit'],
  },
  D6: {
    defaultArea: 'work pressure, health discipline, and daily struggle',
    supportArea: 'effort, courage, and initiative',
    governs:
      'Obstacles, service, discipline, health strain, competition, and the way pressure is handled in practical life.',
    storyLead:
      'This D6 chart is speaking about pressure, discipline, and how obstacles can be worked through without losing steadiness.',
    strengthLead: 'The strongest D6 resilience signal is that',
    challengeLead:
      'The caution in D6 is allowing friction, health neglect, or reactive conflict to become a daily pattern.',
    guidanceLead:
      'Use D6 to become cleaner under pressure, not more anxious about every obstacle.',
    freeLead: 'The obstacle-handling story here says',
    supportLead: 'The next service-and-discipline support signal is',
    userValueLine:
      'Use this chart to understand where discipline and better habits reduce friction in real life.',
    premiumLead:
      'Premium turns D6 into a deeper reading of obstacles, service, and health discipline.',
    premiumFinish:
      'Premium also connects D6 with D1 and D30 so pressure is read practically instead of fearfully.',
    premiumLabel: 'obstacle and discipline analysis',
    freeLabel: 'obstacle and discipline insight',
    premiumNudge:
      'Premium turns D6 into a practical obstacle, discipline, and health-pattern reading.',
    quietChallenge:
      'The caution here is slow strain: a quiet D6 may be asking for routine correction more than alarm.',
    quietStrength:
      'The strength here is manageability: D6 becomes useful when it improves discipline rather than fear.',
    technicalGuardrail:
      'D6 is a pressure and service lens. It needs D1 and timing support before strong prediction.',
    lifeAreas: ['obstacles', 'service', 'health discipline', 'competition'],
  },
  D8: {
    defaultArea: 'change, vulnerability, and hidden pressure',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Hidden pressure, transformation, sudden change, karmic intensity, and the places where life demands humility and careful handling.',
    storyLead:
      'This D8 chart is speaking about hidden pressure and transformation. It should guide caution and maturity, not fear.',
    strengthLead: 'The strongest D8 stabilizing signal is that',
    challengeLead:
      'The caution in D8 is panic, fatalism, or treating a narrow chart like a sentence instead of a warning layer.',
    guidanceLead:
      'Use D8 to improve steadiness, caution, and depth of response when life becomes intense.',
    freeLead: 'The transformation story here says',
    supportLead: 'The next stabilizing support signal is',
    userValueLine:
      'Use this chart to understand where maturity and protection matter, not to create drama.',
    premiumLead:
      'Premium turns D8 into a bounded transformation and pressure reading.',
    premiumFinish:
      'Premium also explains what deserves caution, what is manageable, and what should not be overstated.',
    premiumLabel: 'transformation and pressure analysis',
    freeLabel: 'transformation and pressure insight',
    premiumNudge:
      'Premium turns D8 into a careful transformation reading with stronger caution framing and D1 support.',
    quietChallenge:
      'The caution here is interpretation risk: a quiet D8 should stay a subtle caution signal unless D1 and timing strongly support it.',
    quietStrength:
      'The strength here is preparedness: D8 helps you stay calmer when life asks for maturity.',
    technicalGuardrail:
      'D8 must stay careful, bounded, and non-fatalistic. Read it with D1, timing, and humility.',
    lifeAreas: ['transformation', 'hidden pressure', 'sudden change', 'vulnerability'],
  },
  D11: {
    defaultArea: 'gains, networks, and long-term fulfilment',
    supportArea: 'career, responsibility, and public role',
    governs:
      'Gains, networks, fulfillment, social advantage, and the channels through which effort turns into larger result.',
    storyLead:
      'This D11 chart is speaking about gains, support networks, and how ambitions become materially or socially fulfilled.',
    strengthLead: 'The strongest D11 gain signal is that',
    challengeLead:
      'The caution in D11 is chasing gains without grounding or mistaking noise for real support.',
    guidanceLead:
      'Use D11 to understand what kind of network or gain pattern truly supports your path.',
    freeLead: 'The gains story here says',
    supportLead: 'The next fulfillment support signal is',
    userValueLine:
      'Use this chart to understand how opportunities, networks, and gains actually arrive.',
    premiumLead:
      'Premium turns D11 into a deeper gains, ambition, and fulfillment reading.',
    premiumFinish:
      'Premium also connects D11 with D2 and D10 so income, status, and networks are read together.',
    premiumLabel: 'gains and fulfillment analysis',
    freeLabel: 'gains and fulfillment insight',
    premiumNudge:
      'Premium turns D11 into a stronger gains and network reading tied to D2 and D10.',
    quietChallenge:
      'The caution here is false expectation: a quiet D11 may be asking for patient network building.',
    quietStrength:
      'The strength here is sustainable support: this chart shows where help becomes real rather than flashy.',
    technicalGuardrail:
      'D11 is a gains and fulfillment lens, not a full life chart.',
    lifeAreas: ['gains', 'networks', 'ambition', 'fulfillment'],
  },
  D13: {
    defaultArea: 'home, emotional base, and private stability',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Subtle comforts, material support, finer conveniences, and the quieter forms of ease that improve lived stability.',
    storyLead:
      'This D13 chart is speaking about subtle support and the quieter comforts that make life feel more held together.',
    strengthLead: 'The strongest D13 support signal is that',
    challengeLead:
      'The caution in D13 is overvaluing comfort without asking whether it actually creates steadiness.',
    guidanceLead:
      'Use D13 to judge which supports make life smoother and which comforts become distracting.',
    freeLead: 'The subtle-support story here says',
    supportLead: 'The next comfort support signal is',
    userValueLine:
      'Use this chart to understand what makes life easier in a way that genuinely helps.',
    premiumLead:
      'Premium turns D13 into a finer reading of subtle support and material ease.',
    premiumFinish:
      'Premium also explains how D13 supports D4 and D16 so comfort is read with emotional reality.',
    premiumLabel: 'subtle support analysis',
    freeLabel: 'subtle support insight',
    premiumNudge:
      'Premium turns D13 into a nuanced comfort and support reading with D4 and D16 context.',
    quietChallenge:
      'The caution here is softness without structure: a quiet D13 needs D4 support to matter.',
    quietStrength:
      'The strength here is refinement: small supports can still noticeably improve lived stability.',
    technicalGuardrail:
      'D13 is a subtle-support lens and should stay secondary to D1, D4, and D16.',
    lifeAreas: ['comfort', 'material support', 'ease', 'stability'],
  },
  D15: {
    defaultArea: 'self, body, and identity',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Character refinement, subtle personal fortune, ethical texture, and the quieter qualities that shape how life responds to you.',
    storyLead:
      'This D15 chart is speaking about refinement of character and the subtle fortune that grows from how you carry yourself.',
    strengthLead: 'The strongest D15 refinement signal is that',
    challengeLead:
      'The caution in D15 is believing character quality is automatic instead of cultivated.',
    guidanceLead:
      'Use D15 to understand what should be refined inwardly so outer life responds more cleanly.',
    freeLead: 'The refinement story here says',
    supportLead: 'The next fortune support signal is',
    userValueLine:
      'Use this chart to understand what kind of inner refinement improves your outer path.',
    premiumLead:
      'Premium turns D15 into a deeper reading of subtle fortune and character patterning.',
    premiumFinish:
      'Premium also connects D15 with D1 and D9 so character growth is read with dharma context.',
    premiumLabel: 'character refinement analysis',
    freeLabel: 'character refinement insight',
    premiumNudge:
      'Premium turns D15 into a deeper subtle-fortune and character reading with D1 and D9 context.',
    quietChallenge:
      'The caution here is complacency: a quiet D15 still asks for inward polishing.',
    quietStrength:
      'The strength here is grace through refinement: this chart improves quality more than drama.',
    technicalGuardrail:
      'D15 is a subtle character-refinement lens and should stay anchored to D1 and D9.',
    lifeAreas: ['character', 'subtle fortune', 'refinement', 'ethical texture'],
  },
  D17: {
    defaultArea: 'career, responsibility, and public role',
    supportArea: 'gains, networks, and long-term fulfilment',
    governs:
      'Fine-grained success strength, influence, and the subtle supporting force behind visible achievement.',
    storyLead:
      'This D17 chart is speaking about influence and the finer strength behind visible success.',
    strengthLead: 'The strongest D17 influence signal is that',
    challengeLead:
      'The caution in D17 is assuming influence is stable without checking whether D1 and D10 can hold it.',
    guidanceLead:
      'Use D17 to understand what quietly strengthens success and what needs reinforcement before scale.',
    freeLead: 'The influence story here says',
    supportLead: 'The next success-support signal is',
    userValueLine:
      'Use this chart to understand the subtle force behind success, not just the outer result.',
    premiumLead:
      'Premium turns D17 into a deeper influence and success-strength reading.',
    premiumFinish:
      'Premium also connects D17 with D10 and D11 so visibility, gains, and support are read together.',
    premiumLabel: 'influence and success-strength analysis',
    freeLabel: 'influence and success-strength insight',
    premiumNudge:
      'Premium turns D17 into a finer influence and success reading with D10 and D11 synthesis.',
    quietChallenge:
      'The caution here is hidden fragility: a quiet D17 may be asking for stronger support before scaling.',
    quietStrength:
      'The strength here is subtle reinforcement: this chart shows where success can become more stable.',
    technicalGuardrail:
      'D17 is a success-strength lens and should stay secondary to D1 and D10.',
    lifeAreas: ['influence', 'success strength', 'recognition support', 'stability'],
  },
  D18: {
    defaultArea: 'change, vulnerability, and hidden pressure',
    supportArea: 'work pressure, health discipline, and daily struggle',
    governs:
      'Inner conflicts, karmic weaknesses, hidden strain, and the places where self-sabotage or unresolved pressure can quietly accumulate.',
    storyLead:
      'This D18 chart is speaking about inner conflict and hidden weakness. It should be used for sober correction, not self-attack.',
    strengthLead: 'The strongest D18 stabilizing signal is that',
    challengeLead:
      'The caution in D18 is amplifying shame, fear, or inner conflict beyond what the chart can responsibly prove.',
    guidanceLead:
      'Use D18 to identify pressure patterns that need gentle correction and better support.',
    freeLead: 'The hidden-conflict story here says',
    supportLead: 'The next stabilizing support signal is',
    userValueLine:
      'Use this chart to understand where inner pressure needs better handling, not harsher judgment.',
    premiumLead:
      'Premium turns D18 into a bounded inner-conflict and vulnerability reading.',
    premiumFinish:
      'Premium also shows which signals are actionable and which should stay secondary because of chart narrowness.',
    premiumLabel: 'inner-conflict and vulnerability analysis',
    freeLabel: 'inner-conflict and vulnerability insight',
    premiumNudge:
      'Premium turns D18 into a careful inner-conflict reading with stronger caution framing.',
    quietChallenge:
      'The caution here is projection: a quiet D18 should remain a soft correction signal unless multiple layers agree.',
    quietStrength:
      'The strength here is self-awareness: this chart can help reduce hidden strain when handled gently.',
    technicalGuardrail:
      'D18 must stay cautious, bounded, and non-fatalistic. Use it as a correction lens, not a doom chart.',
    lifeAreas: ['inner conflict', 'hidden strain', 'vulnerability', 'correction'],
  },
  D19: {
    defaultArea: 'fortune, dharma, teachers, and belief',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Fulfillment, subtle prosperity, spiritual tendency, and the deeper satisfaction pattern behind visible life outcomes.',
    storyLead:
      'This D19 chart is speaking about subtle fulfillment and the kind of prosperity that feels inwardly meaningful.',
    strengthLead: 'The strongest D19 fulfillment signal is that',
    challengeLead:
      'The caution in D19 is mistaking external gain for inner fulfillment or spiritual steadiness.',
    guidanceLead:
      'Use D19 to judge what kind of success actually leaves you settled instead of merely stimulated.',
    freeLead: 'The fulfillment story here says',
    supportLead: 'The next prosperity support signal is',
    userValueLine:
      'Use this chart to understand what kind of fulfillment really nourishes you.',
    premiumLead:
      'Premium turns D19 into a deeper fulfillment, grace, and subtle-prosperity reading.',
    premiumFinish:
      'Premium also connects D19 with D9 and D20 so fulfillment is read with dharma and practice context.',
    premiumLabel: 'fulfillment and subtle prosperity analysis',
    freeLabel: 'fulfillment and subtle prosperity insight',
    premiumNudge:
      'Premium turns D19 into a more precise fulfillment reading with dharma and practice support.',
    quietChallenge:
      'The caution here is vagueness: a quiet D19 needs D9 and lived reality before strong claims.',
    quietStrength:
      'The strength here is contentment: this chart helps separate nourishment from noise.',
    technicalGuardrail:
      'D19 is a subtle fulfillment lens and should stay anchored to D1, D9, and lived experience.',
    lifeAreas: ['fulfillment', 'subtle prosperity', 'spiritual tendency', 'inner nourishment'],
  },
  D21: {
    defaultArea: 'fortune, dharma, teachers, and belief',
    supportArea: 'career, responsibility, and public role',
    governs:
      'Karmic extremes, deep fortune swings, dharmic pressure, and the places where life can feel unusually intensified.',
    storyLead:
      'This D21 chart is speaking about karmic intensity and dharmic pressure. It should be read with restraint and context.',
    strengthLead: 'The strongest D21 stabilizing signal is that',
    challengeLead:
      'The caution in D21 is exaggeration. This is a narrow chart that can sound louder than it should if D1 does not support it.',
    guidanceLead:
      'Use D21 to notice intensified karmic pressure points without turning them into dramatic certainty.',
    freeLead: 'The intensified-karma story here says',
    supportLead: 'The next stabilizing support signal is',
    userValueLine:
      'Use this chart to understand where pressure feels amplified and where steadiness matters more.',
    premiumLead:
      'Premium turns D21 into a bounded karmic-pressure reading.',
    premiumFinish:
      'Premium also explains which intensified signals deserve weight and which should remain background context.',
    premiumLabel: 'karmic-pressure analysis',
    freeLabel: 'karmic-pressure insight',
    premiumNudge:
      'Premium turns D21 into a careful karmic-pressure reading with stronger restraint and D1 synthesis.',
    quietChallenge:
      'The caution here is inflation: a quiet D21 should stay secondary unless D1 and timing reinforce it clearly.',
    quietStrength:
      'The strength here is awareness under pressure: this chart can help you respond more carefully when life feels intensified.',
    technicalGuardrail:
      'D21 should stay a cautious karmic-pressure lens, not a dramatic prediction engine.',
    lifeAreas: ['karmic pressure', 'dharmic intensity', 'fortune swings', 'stability'],
  },
  D22: {
    defaultArea: 'self, body, and identity',
    supportArea: 'work pressure, health discipline, and daily struggle',
    governs:
      'Strength, protection, vulnerability, accidents, and the practical relationship between resilience and exposure.',
    storyLead:
      'This D22 chart is speaking about strength and vulnerability. It should sharpen caution and resilience, not create alarm.',
    strengthLead: 'The strongest D22 protection signal is that',
    challengeLead:
      'The caution in D22 is turning protection questions into fatalistic certainty.',
    guidanceLead:
      'Use D22 to strengthen resilience, bodily awareness, and practical caution where needed.',
    freeLead: 'The protection story here says',
    supportLead: 'The next resilience support signal is',
    userValueLine:
      'Use this chart to understand how to stay stronger and safer, not to fear every risk.',
    premiumLead:
      'Premium turns D22 into a bounded protection and resilience reading.',
    premiumFinish:
      'Premium also explains which vulnerabilities deserve practical attention and which do not deserve panic.',
    premiumLabel: 'protection and resilience analysis',
    freeLabel: 'protection and resilience insight',
    premiumNudge:
      'Premium turns D22 into a careful resilience and caution reading with stronger confidence framing.',
    quietChallenge:
      'The caution here is projection: a quiet D22 should stay a practical caution note, not a crisis claim.',
    quietStrength:
      'The strength here is prevention: this chart becomes valuable when it improves care and steadiness.',
    technicalGuardrail:
      'D22 must stay practical, bounded, and non-fatalistic as a resilience and protection lens.',
    lifeAreas: ['strength', 'protection', 'vulnerability', 'resilience'],
  },
  D23: {
    defaultArea: 'self, body, and identity',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Mental steadiness, subtle support, refined fortune, and the quieter factors that help judgement stay balanced.',
    storyLead:
      'This D23 chart is speaking about steadiness and subtle support in the background of judgement and life flow.',
    strengthLead: 'The strongest D23 steadiness signal is that',
    challengeLead:
      'The caution in D23 is overlooking small stabilizers and then misreading life as harsher than it is.',
    guidanceLead:
      'Use D23 to notice what quietly steadies your mind and path.',
    freeLead: 'The steadiness story here says',
    supportLead: 'The next subtle-support signal is',
    userValueLine:
      'Use this chart to understand what helps your mind and path stay quietly supported.',
    premiumLead:
      'Premium turns D23 into a deeper mental-steadiness and subtle-support reading.',
    premiumFinish:
      'Premium also connects D23 with D1 and D19 so steadiness is read with fulfillment context.',
    premiumLabel: 'mental steadiness analysis',
    freeLabel: 'mental steadiness insight',
    premiumNudge:
      'Premium turns D23 into a nuanced steadiness reading with stronger D1 context.',
    quietChallenge:
      'The caution here is subtle drift: a quiet D23 may still be asking for cleaner mental rhythm.',
    quietStrength:
      'The strength here is supportability: small supports can have a disproportionate stabilizing effect.',
    technicalGuardrail:
      'D23 is a subtle-steadiness lens and should stay secondary to D1 and lived evidence.',
    lifeAreas: ['mental steadiness', 'subtle support', 'judgement', 'refined fortune'],
  },
  D25: {
    defaultArea: 'effort, courage, and initiative',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Spiritual strength, inner endurance, disciplined merit, and the subtle courage that supports sincere effort.',
    storyLead:
      'This D25 chart is speaking about inner endurance and the kind of subtle strength that keeps effort sincere over time.',
    strengthLead: 'The strongest D25 endurance signal is that',
    challengeLead:
      'The caution in D25 is trying to force spiritual or moral strength without discipline.',
    guidanceLead:
      'Use D25 to understand what strengthens inner endurance without becoming rigid.',
    freeLead: 'The endurance story here says',
    supportLead: 'The next merit support signal is',
    userValueLine:
      'Use this chart to understand what kind of inner strength lasts when life gets demanding.',
    premiumLead:
      'Premium turns D25 into a deeper endurance and spiritual-strength reading.',
    premiumFinish:
      'Premium also connects D25 with D20 and D27 so spiritual and practical endurance are read together.',
    premiumLabel: 'endurance and spiritual-strength analysis',
    freeLabel: 'endurance and spiritual-strength insight',
    premiumNudge:
      'Premium turns D25 into a stronger endurance reading with D20 and D27 support.',
    quietChallenge:
      'The caution here is inconsistency: a quiet D25 may be asking for steadier practice and effort.',
    quietStrength:
      'The strength here is durable sincerity: this chart supports quiet inner staying power.',
    technicalGuardrail:
      'D25 is a subtle endurance lens and should stay anchored to D20, D27, and D1.',
    lifeAreas: ['endurance', 'spiritual strength', 'disciplined merit', 'inner courage'],
  },
  D26: {
    defaultArea: 'work pressure, health discipline, and daily struggle',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Refined discomfort, emotional friction, sensitive correction points, and the subtle places where life asks for adjustment.',
    storyLead:
      'This D26 chart is speaking about refined discomfort and correction points. It should help adjustment, not self-criticism.',
    strengthLead: 'The strongest D26 corrective signal is that',
    challengeLead:
      'The caution in D26 is amplifying minor friction into a larger judgement than the chart can support.',
    guidanceLead:
      'Use D26 to make small corrections that reduce repeated emotional or practical friction.',
    freeLead: 'The correction-point story here says',
    supportLead: 'The next easing support signal is',
    userValueLine:
      'Use this chart to understand where small adjustments can reduce repeated discomfort.',
    premiumLead:
      'Premium turns D26 into a bounded refined-discomfort and correction reading.',
    premiumFinish:
      'Premium also separates real friction signals from temporary sensitivity or noise.',
    premiumLabel: 'correction-point analysis',
    freeLabel: 'correction-point insight',
    premiumNudge:
      'Premium turns D26 into a careful correction reading with stronger caution and action guidance.',
    quietChallenge:
      'The caution here is oversensitivity: a quiet D26 should point to small refinements, not large conclusions.',
    quietStrength:
      'The strength here is precision: this chart helps improve life through small but meaningful corrections.',
    technicalGuardrail:
      'D26 should stay a refined-correction lens and avoid dramatic prediction language.',
    lifeAreas: ['correction', 'emotional friction', 'discomfort', 'adjustment'],
  },
  D27: {
    defaultArea: 'self, body, and identity',
    supportArea: 'effort, courage, and initiative',
    governs:
      'Physical and mental strength, resilience, vitality, courage, recovery power, and how force can be sustained without collapse.',
    storyLead:
      'This D27 chart is speaking about resilience, vitality, and how your strength behaves under effort and recovery.',
    strengthLead: 'The strongest D27 resilience signal is that',
    challengeLead:
      'The caution in D27 is wasting strength through poor pacing, ego reaction, or scattered effort.',
    guidanceLead:
      'Use D27 to understand how strength should be protected, built, and directed.',
    freeLead: 'The resilience story here says',
    supportLead: 'The next vitality support signal is',
    userValueLine:
      'Use this chart to understand what strengthens your body, mind, and staying power.',
    premiumLead:
      'Premium turns D27 into a deeper vitality and resilience reading.',
    premiumFinish:
      'Premium also connects D27 with D3 and D6 so courage, stamina, and pressure handling are read together.',
    premiumLabel: 'resilience and vitality analysis',
    freeLabel: 'resilience and vitality insight',
    premiumNudge:
      'Premium turns D27 into a stronger resilience reading with D3 and D6 support.',
    quietChallenge:
      'The caution here is uneven energy: a quiet D27 may be asking for smarter pacing rather than harder effort.',
    quietStrength:
      'The strength here is recoverability: this chart helps show where resilience can become more durable.',
    technicalGuardrail:
      'D27 is a strength and resilience lens that should stay anchored to D1 and real lived stamina.',
    lifeAreas: ['resilience', 'vitality', 'courage', 'recovery'],
  },
  D28: {
    defaultArea: 'change, vulnerability, and hidden pressure',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Hidden adversity, restraint, karmic tests, and the deeper pressure patterns that call for patience and non-reactive handling.',
    storyLead:
      'This D28 chart is speaking about hidden adversity and restraint. It should sharpen patience and caution, not fear.',
    strengthLead: 'The strongest D28 stabilizing signal is that',
    challengeLead:
      'The caution in D28 is reacting to deep pressure without context or turning restraint into helplessness.',
    guidanceLead:
      'Use D28 to understand where patience, protection, and disciplined response matter most.',
    freeLead: 'The deep-test story here says',
    supportLead: 'The next stabilizing support signal is',
    userValueLine:
      'Use this chart to understand deeper tests without giving them more power than they deserve.',
    premiumLead:
      'Premium turns D28 into a bounded hidden-adversity reading.',
    premiumFinish:
      'Premium also explains what deserves practical caution and what should remain quiet background context.',
    premiumLabel: 'hidden-adversity analysis',
    freeLabel: 'hidden-adversity insight',
    premiumNudge:
      'Premium turns D28 into a careful deep-test reading with stronger caution framing.',
    quietChallenge:
      'The caution here is over-reading shadow signals: a quiet D28 should stay secondary unless repeated elsewhere.',
    quietStrength:
      'The strength here is restraint: this chart helps you respond with steadiness under deeper pressure.',
    technicalGuardrail:
      'D28 must remain a cautious adversity lens, not a dramatic fate chart.',
    lifeAreas: ['hidden adversity', 'restraint', 'deep tests', 'patience'],
  },
  D29: {
    defaultArea: 'gains, networks, and long-term fulfilment',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Subtle gains, unseen support, finer outcomes, and the background blessings that do not always announce themselves loudly.',
    storyLead:
      'This D29 chart is speaking about subtle gains and unseen support that help outcomes land more smoothly.',
    strengthLead: 'The strongest D29 support signal is that',
    challengeLead:
      'The caution in D29 is overlooking quiet support because it does not look dramatic enough.',
    guidanceLead:
      'Use D29 to notice what quietly supports gains, timing, and softer outcomes.',
    freeLead: 'The subtle-gains story here says',
    supportLead: 'The next unseen-support signal is',
    userValueLine:
      'Use this chart to understand where results are being helped quietly in the background.',
    premiumLead:
      'Premium turns D29 into a finer subtle-gains and support reading.',
    premiumFinish:
      'Premium also connects D29 with D11 and D19 so support, gains, and fulfillment are read together.',
    premiumLabel: 'subtle gains analysis',
    freeLabel: 'subtle gains insight',
    premiumNudge:
      'Premium turns D29 into a deeper subtle-gains reading with D11 and D19 context.',
    quietChallenge:
      'The caution here is misreading quiet support as absence; this chart often works softly.',
    quietStrength:
      'The strength here is subtle help: D29 can show why outcomes feel better supported than expected.',
    technicalGuardrail:
      'D29 is a subtle-support lens and should stay secondary to stronger D1 and D11 evidence.',
    lifeAreas: ['subtle gains', 'unseen support', 'finer outcomes', 'background help'],
  },
  D31: {
    defaultArea: 'change, vulnerability, and hidden pressure',
    supportArea: 'rest, expense, healing, and release',
    governs:
      'Fine-grained vulnerabilities, restraint, inner purification, and the subtler places where life asks for correction and humility.',
    storyLead:
      'This D31 chart is speaking about subtle vulnerabilities and purification. It should guide refinement, not fear.',
    strengthLead: 'The strongest D31 stabilizing signal is that',
    challengeLead:
      'The caution in D31 is harsh self-judgement or dramatic reading of a very narrow chart.',
    guidanceLead:
      'Use D31 to understand what should be softened, purified, or handled more carefully.',
    freeLead: 'The vulnerability-correction story here says',
    supportLead: 'The next refining support signal is',
    userValueLine:
      'Use this chart to understand where smaller corrections can reduce deeper friction.',
    premiumLead:
      'Premium turns D31 into a bounded vulnerability and purification reading.',
    premiumFinish:
      'Premium also separates true correction points from passing intensity or noise.',
    premiumLabel: 'vulnerability and purification analysis',
    freeLabel: 'vulnerability and purification insight',
    premiumNudge:
      'Premium turns D31 into a careful purification reading with stronger caution and refinement guidance.',
    quietChallenge:
      'The caution here is over-interpretation: a quiet D31 should stay a subtle correction signal.',
    quietStrength:
      'The strength here is refinement through humility: this chart helps soften unnecessary friction.',
    technicalGuardrail:
      'D31 must stay narrow, careful, and non-dramatic as a vulnerability-correction lens.',
    lifeAreas: ['vulnerability', 'purification', 'restraint', 'correction'],
  },
  D32: {
    defaultArea: 'effort, courage, and initiative',
    supportArea: 'work pressure, health discipline, and daily struggle',
    governs:
      'Strength distribution, hardship patterning, endurance, and the way effort behaves when life becomes demanding.',
    storyLead:
      'This D32 chart is speaking about endurance and hardship handling. It helps judge how effort holds under strain.',
    strengthLead: 'The strongest D32 endurance signal is that',
    challengeLead:
      'The caution in D32 is trying to force strength where pacing, support, or recovery are missing.',
    guidanceLead:
      'Use D32 to understand where endurance is reliable and where support is needed before pushing harder.',
    freeLead: 'The endurance-under-strain story here says',
    supportLead: 'The next hardship-support signal is',
    userValueLine:
      'Use this chart to understand how your effort behaves when life gets heavier.',
    premiumLead:
      'Premium turns D32 into a deeper endurance and hardship-pattern reading.',
    premiumFinish:
      'Premium also connects D32 with D3, D6, and D27 so effort, strain, and resilience stay aligned.',
    premiumLabel: 'endurance under strain analysis',
    freeLabel: 'endurance under strain insight',
    premiumNudge:
      'Premium turns D32 into a stronger endurance reading with D3, D6, and D27 support.',
    quietChallenge:
      'The caution here is hidden depletion: a quiet D32 may still be asking for more recovery discipline.',
    quietStrength:
      'The strength here is realistic endurance: this chart improves pacing and sustainable effort.',
    technicalGuardrail:
      'D32 is an endurance-under-strain lens and should stay anchored to D1 and lived stamina.',
    lifeAreas: ['endurance', 'hardship', 'effort under strain', 'pacing'],
  },
  D33: {
    defaultArea: 'gains, networks, and long-term fulfilment',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Subtle fortune, refined outcomes, and micro-patterns that quietly shape timing and result quality.',
    storyLead:
      'This D33 chart is speaking about refined fortune and subtle timing texture in the background of outcomes.',
    strengthLead: 'The strongest D33 fortune signal is that',
    challengeLead:
      'The caution in D33 is demanding loud proof from a chart that works through finer patterns.',
    guidanceLead:
      'Use D33 to understand small timing textures and subtle advantages without overstating them.',
    freeLead: 'The refined-outcome story here says',
    supportLead: 'The next subtle-fortune signal is',
    userValueLine:
      'Use this chart to understand where quieter support improves the quality of outcomes.',
    premiumLead:
      'Premium turns D33 into a finer timing-texture and subtle-fortune reading.',
    premiumFinish:
      'Premium also connects D33 with D11 and timing so refined support becomes more interpretable.',
    premiumLabel: 'refined fortune analysis',
    freeLabel: 'refined fortune insight',
    premiumNudge:
      'Premium turns D33 into a nuanced subtle-fortune reading with timing context.',
    quietChallenge:
      'The caution here is impatience: a quiet D33 usually needs timing support before it becomes obvious.',
    quietStrength:
      'The strength here is refinement: this chart helps explain why some outcomes land more smoothly.',
    technicalGuardrail:
      'D33 is a subtle outcome-quality lens and should stay secondary to stronger chart layers.',
    lifeAreas: ['subtle fortune', 'timing texture', 'refined outcomes', 'quiet support'],
  },
  D34: {
    defaultArea: 'change, vulnerability, and hidden pressure',
    supportArea: 'fortune, dharma, teachers, and belief',
    governs:
      'Specific karmic texture, nuanced correction points, and the finer destiny factors that should be read with caution and humility.',
    storyLead:
      'This D34 chart is speaking about specific karmic texture and fine correction points. It should stay careful and bounded.',
    strengthLead: 'The strongest D34 stabilizing signal is that',
    challengeLead:
      'The caution in D34 is pretending high certainty from a very nuanced and narrow chart.',
    guidanceLead:
      'Use D34 to notice fine correction themes without turning them into absolute destiny claims.',
    freeLead: 'The karmic-texture story here says',
    supportLead: 'The next stabilizing support signal is',
    userValueLine:
      'Use this chart to understand fine correction themes with humility, not with dramatic certainty.',
    premiumLead:
      'Premium turns D34 into a bounded nuanced-karma reading.',
    premiumFinish:
      'Premium also explains which fine texture signals deserve weight and which should stay secondary.',
    premiumLabel: 'nuanced karma analysis',
    freeLabel: 'nuanced karma insight',
    premiumNudge:
      'Premium turns D34 into a careful nuanced-karma reading with stronger restraint and D1 synthesis.',
    quietChallenge:
      'The caution here is false certainty: a quiet D34 should remain a subtle background-correction layer.',
    quietStrength:
      'The strength here is nuance: this chart helps refine judgement when handled with restraint.',
    technicalGuardrail:
      'D34 must remain a subtle karmic-texture lens with cautious, non-dramatic language.',
    lifeAreas: ['karmic texture', 'correction themes', 'nuance', 'subtle destiny factors'],
  },
};
