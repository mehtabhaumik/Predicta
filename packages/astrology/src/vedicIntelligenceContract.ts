import type {
  ChartData,
  ChartType,
  KundliData,
  PlanetPosition,
  VedicBeneficMaleficClassification,
  VedicChalitTableRow,
  VedicGrahaVisualMetadata,
  VedicHouseWisePlanetPlacement,
  VedicIntelligenceContract,
  VedicIntelligenceEvidence,
  VedicIntelligenceSection,
  VedicFriendshipRelation,
  VedicMahadashaPhalaBlock,
  VedicPlanetFriendshipRow,
} from '@pridicta/types';
import { buildParashariChalitChart } from './chartLayout';
import {
  buildKarakamshaChart,
  buildSwamsaChart,
  resolveAtmakaraka,
} from './jaiminiSoulCharts';
import { composeMahadashaIntelligence } from './mahadashaIntelligence';
import { composePersonalPanchangLayer } from './personalPanchangLayer';

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const CORE_GRAHAS = [
  'Moon',
  'Sun',
  'Mars',
  'Jupiter',
  'Venus',
  'Saturn',
  'Mercury',
  'Rahu',
  'Ketu',
];

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

const NATURAL_FRIENDS: Record<string, string[]> = {
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Moon: ['Sun', 'Mercury'],
  Saturn: ['Mercury', 'Venus'],
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Venus: ['Mercury', 'Saturn'],
};

const NATURAL_ENEMIES: Record<string, string[]> = {
  Jupiter: ['Mercury', 'Venus'],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Moon: [],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Sun: ['Venus', 'Saturn'],
  Venus: ['Sun', 'Moon'],
};

const SIGN_LORDS: Record<string, string> = {
  Aquarius: 'Saturn',
  Aries: 'Mars',
  Cancer: 'Moon',
  Capricorn: 'Saturn',
  Gemini: 'Mercury',
  Leo: 'Sun',
  Libra: 'Venus',
  Pisces: 'Jupiter',
  Sagittarius: 'Jupiter',
  Scorpio: 'Mars',
  Taurus: 'Venus',
  Virgo: 'Mercury',
};

const HOUSE_AREAS: Record<number, string> = {
  1: 'identity and body',
  2: 'money, speech, and family',
  3: 'effort and courage',
  4: 'home and emotional base',
  5: 'creativity, children, and merit',
  6: 'work pressure and discipline',
  7: 'partnership and contracts',
  8: 'change and vulnerability',
  9: 'fortune, teachers, and dharma',
  10: 'career and public role',
  11: 'gains and networks',
  12: 'rest, expense, and release',
};

const TEMPORARY_FRIEND_HOUSES = new Set([2, 3, 4, 10, 11, 12]);

export function composeVedicIntelligenceContract({
  depth = 'FREE',
  kundli,
  nowIso = new Date().toISOString(),
}: {
  depth?: 'FREE' | 'PREMIUM';
  kundli?: KundliData;
  nowIso?: string;
}): VedicIntelligenceContract {
  if (!kundli) {
    return buildPendingVedicIntelligence(depth, nowIso);
  }

  const moonChart = buildMoonChart(kundli);
  const swamsaChart = buildSwamsaChart(kundli);
  const karakamshaChart = buildKarakamshaChart(kundli);
  const chalitChart = buildParashariChalitChart(kundli);
  const houseWisePlacements = buildHouseWisePlacements(kundli);
  const friendshipTable = buildFriendshipRows(kundli);
  const beneficMalefic = buildBeneficMaleficClassification(kundli);
  const chalitRows = buildChalitRows(kundli);
  const panchangLayer = kundli.personalPanchang ?? composePersonalPanchangLayer(kundli);
  const mahadasha = buildMahadashaPhala(kundli, depth);
  const snapshot = buildSnapshotSection(kundli);
  const moonSection = {
    ...buildReadySection({
      evidence: [
        {
          observation: `Moon sign ${kundli.moonSign} becomes the first-house reference while planet signs and degrees stay unchanged.`,
          source: 'D1 Moon placement',
        },
      ],
      freeInsight:
        'The Moon chart shows how the same Kundli feels from the mind, emotion, and lived reaction pattern.',
      id: 'moon-chart',
      premiumAnalysis:
        'Premium reads the Moon chart with D1 and dasha so emotional timing, habit loops, relationship reactions, and stress responses are not judged from Lagna alone.',
      title: 'Moon Chart / Chandra Lagna Chart',
      explanation:
        'Chandra Lagna remaps houses from the Moon sign. It is a required Vedic lens for mind, emotional timing, and lived experience.',
    }),
    chart: moonChart,
  };
  const swamsaSection = {
    ...buildSwamsaSection(kundli, swamsaChart),
    chart: swamsaChart,
  };
  const karakamshaSection = {
    ...buildKarakamshaSection(kundli, karakamshaChart),
    chart: karakamshaChart,
  };
  const sections = [
    snapshot,
    moonSection,
    swamsaSection,
    houseWisePlacements,
    friendshipTable,
    beneficMalefic,
    buildChalitSection(chalitRows),
    buildPanchangSection(panchangLayer),
    buildPendingClassicalSection('samsa', 'Samsa', 'Samsa remains calculation-limited because this backend does not yet expose a verified Samsa taxonomy. Predicta must not invent it.'),
    buildGhatakFavorableSection(kundli),
    karakamshaSection,
    buildAshtakavargaSection(kundli),
    buildPrastarashtakavargaSection(kundli),
    buildAvakhadaSection(kundli, panchangLayer),
    mahadasha.section,
  ];

  return {
    ashtakavarga: sections.find(section => section.id === 'ashtakavarga')!,
    avakhadaChakra: sections.find(section => section.id === 'avakhada-chakra')!,
    beneficMalefic,
    chalitTable: {
      ...sections.find(section => section.id === 'chalit-table')!,
      rows: chalitRows,
    },
    chartOrder: buildVedicChartOrder(kundli, moonChart, swamsaChart, karakamshaChart, chalitChart),
    depth,
    friendshipTable,
    generatedAt: nowIso,
    ghatakFavorable: sections.find(section => section.id === 'ghatak-favorable')!,
    grahaVisualMetadata: buildGrahaVisualMetadata(moonChart),
    houseWisePlacements,
    karakamsha: karakamshaSection,
    limitations: sections.flatMap(section => section.limitations),
    mahadashaPhala: mahadasha.section,
    moonChart: moonSection,
    ownerName: kundli.birthDetails.name,
    panchang: sections.find(section => section.id === 'panchang')!,
    prastarashtakavarga: sections.find(section => section.id === 'prastarashtakavarga')!,
    samsa: sections.find(section => section.id === 'samsa')!,
    sections,
    snapshot,
    swamsa: swamsaSection,
  };
}

function buildPendingVedicIntelligence(
  depth: 'FREE' | 'PREMIUM',
  nowIso: string,
): VedicIntelligenceContract {
  const pendingSection = buildPendingClassicalSection(
    'snapshot',
    'Vedic Snapshot',
    'Create a valid Kundli before Predicta can prepare the shared Vedic intelligence contract.',
  );
  const mahadashaBlock = buildPendingMahadashaBlock('pending-mahadasha', 'Mahadasha Phala pending');
  const mahadashaSection = {
    ...buildPendingClassicalSection(
      'mahadasha-phala',
      'Mahadasha Phala and Meaning',
      'Mahadasha needs a calculated Kundli and Moon nakshatra.',
    ),
    currentEntireMahadasha: mahadashaBlock,
    currentMahadashaAntardasha: mahadashaBlock,
    currentMahadashaAntardashaPratyantardasha: mahadashaBlock,
    pastMahadashas: [],
    pratyantardashaCaution:
      'Pratyantardasha is a fine timing layer and must not be overclaimed.',
  };

  return {
    ashtakavarga: buildPendingClassicalSection('ashtakavarga', 'Ashtakavarga', 'Ashtakavarga needs a calculated Kundli.'),
    avakhadaChakra: buildPendingClassicalSection('avakhada-chakra', 'Avakhada Chakra', 'Avakhada chakra needs a calculated Kundli.'),
    beneficMalefic: {
      ...buildPendingClassicalSection('benefic-malefic', 'Benefics and Malefics', 'Benefic/malefic classification needs Lagna and planet data.'),
      functionalBenefics: [],
      functionalMalefics: [],
      naturalBenefics: [],
      naturalMalefics: [],
    },
    chalitTable: {
      ...buildPendingClassicalSection('chalit-table', 'Chalit Table', 'Chalit table needs a calculated Kundli.'),
      rows: [],
    },
    chartOrder: [],
    depth,
    friendshipTable: {
      ...buildPendingClassicalSection('friendship-table', 'Planet Friendship Table', 'Planet friendship needs planet data.'),
      rows: [],
    },
    generatedAt: nowIso,
    ghatakFavorable: buildPendingClassicalSection('ghatak-favorable', 'Ghatak and Favorable Factors', 'Ghatak factors need a calculated Kundli.'),
    grahaVisualMetadata: buildGrahaVisualMetadata(),
    houseWisePlacements: {
      ...buildPendingClassicalSection('house-wise-placements', 'House-wise Planet Table', 'House-wise table needs planet data.'),
      rows: [],
    },
    karakamsha: {
      ...buildPendingClassicalSection('karakamsha', 'Karakamsha', 'Karakamsha needs a calculated Kundli.'),
      chart: undefined,
    },
    limitations: [pendingSection.limitations[0]],
    mahadashaPhala: mahadashaSection,
    moonChart: {
      ...buildPendingClassicalSection('moon-chart', 'Moon Chart / Chandra Lagna Chart', 'Moon chart needs a calculated Moon sign.'),
      chart: undefined,
    },
    ownerName: 'You',
    panchang: buildPendingClassicalSection('panchang', 'Panchang', 'Panchang needs birth date/time/place.'),
    prastarashtakavarga: buildPendingClassicalSection('prastarashtakavarga', 'Prastarashtakavarga', 'Prastarashtakavarga needs source bindu data.'),
    samsa: buildPendingClassicalSection('samsa', 'Samsa', 'Samsa needs a calculated Kundli.'),
    sections: [pendingSection, mahadashaSection],
    snapshot: {
      ...pendingSection,
      currentDasha: 'Pending',
      lagna: 'Pending',
      moonSign: 'Pending',
      nakshatra: 'Pending',
      strongestHouses: [],
      weakestHouses: [],
    },
    swamsa: {
      ...buildPendingClassicalSection('swamsa', 'Swamsa Chart', 'Swamsa needs a calculated Navamsa chart.'),
      chart: undefined,
    },
  };
}

function buildMoonChart(kundli: KundliData): ChartData | undefined {
  const d1 = kundli.charts.D1;
  const moon = kundli.planets.find(planet => planet.name === 'Moon');
  const moonSign = moon?.sign ?? kundli.moonSign;

  if (!d1?.supported || !moonSign || !SIGN_ORDER.includes(moonSign)) {
    return undefined;
  }

  const moonSignIndex = SIGN_ORDER.indexOf(moonSign);
  const planetDistribution = d1.planetDistribution.map(planet => {
    const signIndex = SIGN_ORDER.indexOf(planet.sign);
    const house = signIndex >= 0
      ? ((signIndex - moonSignIndex + 12) % 12) + 1
      : planet.house;

    return {
      ...planet,
      house,
    };
  });

  return {
    ascendantSign: moonSign,
    chartType: 'D1',
    housePlacements: buildHousePlacements(planetDistribution),
    name: 'Moon Chart / Chandra Lagna Chart',
    planetDistribution,
    signPlacements: buildSignPlacements(planetDistribution),
    supported: true,
  };
}

function buildVedicChartOrder(
  kundli: KundliData,
  moonChart?: ChartData,
  swamsaChart?: ChartData,
  karakamshaChart?: ChartData,
  chalitChart?: ChartData,
): VedicIntelligenceContract['chartOrder'] {
  const remaining = (Object.keys(kundli.charts) as ChartType[])
    .filter(chartType => chartType !== 'D1' && chartType !== 'D9' && chartType !== 'D10')
    .sort((first, second) => chartTypeNumber(first) - chartTypeNumber(second));

  return [
    {
      chart: kundli.charts.D1,
      explanation: 'Lagna/Rashi D1 is always the root life chart.',
      id: 'D1',
      title: 'Lagna/Rashi Chart D1',
    },
    {
      chart: moonChart,
      explanation: 'Moon/Chandra Lagna chart is always second because it remaps houses from the Moon.',
      id: 'MOON',
      title: 'Moon Chart / Chandra Lagna Chart',
    },
    {
      chart: kundli.charts.D9,
      explanation: 'Navamsa D9 follows the Moon chart for dharma, maturity, and deeper planet strength.',
      id: 'D9',
      title: 'Navamsa Chart D9',
    },
    {
      chart: kundli.charts.D10,
      explanation: 'Dashamsa D10 follows D9 for career, public contribution, and visible work results.',
      id: 'D10',
      title: 'Dashamsa Chart D10',
    },
    {
      chart: chalitChart,
      explanation: 'Chalit follows the core charts as the lived house-delivery layer for practical result shifts.',
      id: 'CHALIT',
      title: 'Chalit Chart',
    },
    {
      chart: swamsaChart,
      explanation: 'Swamsa is a first-class inner self-direction chart based on the Navamsa self lens.',
      id: 'SWAMSA',
      title: 'Swamsa Chart',
    },
    {
      chart: karakamshaChart,
      explanation: 'Karakamsha is a first-class Atmakaraka-linked life-direction chart based on Navamsa evidence.',
      id: 'KARAKAMSHA',
      title: 'Karakamsha Chart',
    },
    ...remaining.map(chartType => ({
      chart: kundli.charts[chartType],
      explanation: `${chartType} follows after D1, Moon chart, and D9 in the Vedic chart order.`,
      id: chartType,
      title: kundli.charts[chartType]?.name ?? chartType,
    })),
  ];
}

function buildSnapshotSection(
  kundli: KundliData,
): VedicIntelligenceContract['snapshot'] {
  return {
    ...buildReadySection({
      evidence: [
        {
          observation: `${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.nakshatra} Nakshatra.`,
          source: 'Calculated Kundli identity',
        },
      ],
      explanation:
        'The Vedic snapshot gives the user a clean first layer before tables and technical proof.',
      freeInsight: `${kundli.birthDetails.name} has ${kundli.lagna} Lagna with ${kundli.moonSign} Moon in ${kundli.nakshatra}, so the reading starts from both outer direction and inner rhythm.`,
      id: 'snapshot',
      premiumAnalysis:
        'Premium connects Lagna, Moon, Nakshatra, current dasha, strongest houses, and pressure houses before giving timing or remedy advice.',
      title: 'Vedic Snapshot',
    }),
    currentDasha: `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
    lagna: kundli.lagna,
    moonSign: kundli.moonSign,
    nakshatra: kundli.nakshatra,
    strongestHouses: kundli.ashtakavarga.strongestHouses,
    weakestHouses: kundli.ashtakavarga.weakestHouses,
  };
}

function buildHouseWisePlacements(
  kundli: KundliData,
): VedicIntelligenceContract['houseWisePlacements'] {
  const sun = kundli.planets.find(planet => planet.name === 'Sun');
  const rows = kundli.planets
    .filter(isCoreGraha)
    .map(planet => {
      const dignity = resolveDignity(planet);

      return {
        combust: isCombustPlanet(planet, sun),
        debilitated: dignity === 'debilitated',
        degree: planet.degree,
        dignity,
        exalted: dignity === 'exalted',
        house: planet.house,
        nakshatra: planet.nakshatra,
        pada: planet.pada,
        planet: planet.name,
        retrograde: planet.retrograde,
        sign: planet.sign,
      };
    });

  return {
    ...buildReadySection({
      evidence: rows.map(row => ({
        observation: `${row.planet}: house ${row.house}, ${row.sign}, ${row.degree.toFixed(1)}°, ${row.nakshatra} pada ${row.pada}, ${row.combust ? 'combust' : 'not combust'}, ${row.dignity}.`,
        source: 'D1 planet placement',
      })),
      explanation:
        'The house-wise planet table turns chart proof into a readable placement ledger.',
      freeInsight:
        'This table shows which planets are influencing which houses so chart evidence turns into clear life guidance.',
      id: 'house-wise-placements',
      premiumAnalysis:
        'Premium adds interpretation by house, sign, nakshatra, dignity, retrogression, deterministic combustion, and current dasha relevance.',
      title: 'House-wise Planet Table',
    }),
    rows,
  };
}

function buildFriendshipRows(
  kundli: KundliData,
): VedicIntelligenceContract['friendshipTable'] {
  const presentGrahas = CORE_GRAHAS.filter(graha =>
    kundli.planets.some(planet => planet.name === graha),
  );
  const rows: VedicPlanetFriendshipRow[] = presentGrahas.map(fromPlanet => {
    const naturalRelationships = Object.fromEntries(
      presentGrahas.map(toPlanet => [toPlanet, naturalRelation(fromPlanet, toPlanet)]),
    ) as Record<string, VedicFriendshipRelation>;
    const temporaryRelationships = Object.fromEntries(
      presentGrahas.map(toPlanet => [toPlanet, temporaryRelation(kundli, fromPlanet, toPlanet)]),
    ) as Record<string, VedicFriendshipRelation>;
    const compoundRelationships = Object.fromEntries(
      presentGrahas.map(toPlanet => [
        toPlanet,
        compoundRelation(naturalRelationships[toPlanet], temporaryRelationships[toPlanet]),
      ]),
    ) as Record<string, VedicFriendshipRelation>;

    return {
      compoundRelationship: summarizeCompoundRelationship(compoundRelationships),
      compoundRelationships,
      fromPlanet,
      interpretation: summarizeFriendship(fromPlanet, compoundRelationships),
      naturalRelationships,
      temporaryRelationships,
    };
  });

  return {
    ...buildReadySection({
      evidence: [
        {
          observation:
            'Natural, temporary, and compound relationships are calculated from the classical natural friendship table and D1 sign distance.',
          source: 'Classical friendship module',
        },
      ],
      explanation:
        'The friendship table shows how planets naturally cooperate, stay neutral, or create friction with each other.',
      freeInsight:
        'Use this as a simple relationship map between grahas, not as a fear table.',
      id: 'friendship-table',
      premiumAnalysis:
        'Premium combines natural, temporary, and compound relationship with house lordship, dignity, and active dasha so the table becomes usable guidance rather than raw labels.',
      title: 'Planet Friendship Table',
    }),
    rows,
  };
}

function buildBeneficMaleficClassification(
  kundli: KundliData,
): VedicIntelligenceContract['beneficMalefic'] {
  const classification: VedicBeneficMaleficClassification = {
    functionalBenefics: functionalBenefics(kundli.lagna),
    functionalMalefics: functionalMalefics(kundli.lagna),
    naturalBenefics: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
    naturalMalefics: ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'],
  };

  return {
    ...classification,
    ...buildReadySection({
      evidence: [
        {
          observation: `${kundli.lagna} Lagna determines functional benefic and malefic emphasis.`,
          source: 'Lagna lordship classification',
        },
      ],
      explanation:
        'Natural benefics/malefics describe inherent planetary tone. Functional benefics/malefics depend on Lagna and house lordship.',
      freeInsight:
        'This helps users understand why a planet can feel supportive in one chart and more demanding in another.',
      id: 'benefic-malefic',
      limitations: [
        'Functional classification is deterministic by Lagna house lordship and should be interpreted with dignity, yogas, and dasha before making strong claims.',
      ],
      premiumAnalysis:
        'Premium explains natural tone, Lagna-specific function, house ownership, yogakaraka nuance, dignity, dasha activation, and practical use without calling any planet permanently good or bad.',
      title: 'Benefics and Malefics',
    }),
  };
}

function buildChalitRows(kundli: KundliData): VedicChalitTableRow[] {
  return (kundli.chalit?.planetPlacements ?? []).map(placement => ({
    chalitHouse: placement.chalitHouse,
    planet: placement.planet,
    rashiHouse: placement.rashiHouse,
    rashiSign: placement.rashiSign,
    shiftDirection: placement.shiftDirection,
    shifted: placement.shifted,
  }));
}

function buildChalitSection(rows: VedicChalitTableRow[]): VedicIntelligenceSection {
  return rows.length
    ? buildReadySection({
        evidence: rows.map(row => ({
          observation: `${row.planet}: D1 house ${row.rashiHouse} to Chalit house ${row.chalitHouse}.`,
          source: 'Parashari Chalit placement',
        })),
        explanation:
          'Chalit shows where the D1 planet result is delivered in lived house experience.',
        freeInsight:
          'Use Chalit as a delivery correction, not as a replacement for D1.',
        id: 'chalit-table',
        premiumAnalysis:
          'Premium reads each shifted planet with D1 sign dignity, Chalit house delivery, active dasha, and real-life result area.',
        title: 'Chalit Table',
      })
    : buildPendingClassicalSection(
        'chalit-table',
        'Chalit Table',
        'Chalit rows are pending because Chalit placements are not available in this Kundli.',
      );
}

function buildPanchangSection(
  panchang: ReturnType<typeof composePersonalPanchangLayer>,
): VedicIntelligenceSection {
  return buildReadySection({
    evidence: [
      {
        observation: `${panchang.weekdayLord} day, ${panchang.tithi}, Moon sign ${panchang.moonSign}.`,
        source: 'Personal Panchang layer',
      },
    ],
    explanation:
      'Panchang gives the daily Vedic rhythm through weekday lord, tithi, Moon, and action quality.',
    freeInsight: panchang.todayFocus,
    id: 'panchang',
    premiumAnalysis:
      'Premium connects Panchang rhythm with dasha, Moon condition, current gochar, and practical daily action.',
    title: 'Panchang',
  });
}

function buildAshtakavargaSection(kundli: KundliData): VedicIntelligenceSection {
  return buildReadySection({
    evidence: [
      {
        observation: `SAV total ${kundli.ashtakavarga.totalScore}; strongest houses ${kundli.ashtakavarga.strongestHouses.join(', ')}; weakest houses ${kundli.ashtakavarga.weakestHouses.join(', ')}.`,
        source: 'Ashtakavarga SAV/BAV summary',
      },
    ],
    explanation:
      'Ashtakavarga shows where the chart has easier support and where discipline is needed.',
    freeInsight:
      `Strong houses: ${kundli.ashtakavarga.strongestHouses.slice(0, 3).join(', ')}. Pressure houses: ${kundli.ashtakavarga.weakestHouses.slice(0, 3).join(', ')}.`,
    id: 'ashtakavarga',
    premiumAnalysis:
      'Premium uses Ashtakavarga to weigh timing, transits, dasha delivery, and which houses need support before prediction language becomes confident.',
    title: 'Ashtakavarga',
  });
}

function buildGhatakFavorableSection(kundli: KundliData): VedicIntelligenceSection {
  const favorableHouses = kundli.ashtakavarga.strongestHouses.slice(0, 3);
  const pressureHouses = kundli.ashtakavarga.weakestHouses.slice(0, 3);

  return buildReadySection({
    evidence: [
      {
        observation: `${kundli.moonSign} Moon with strongest houses ${favorableHouses.join(', ')} and pressure houses ${pressureHouses.join(', ')}.`,
        source: 'Moon sign and Ashtakavarga strength map',
      },
    ],
    explanation:
      'Ghatak and favorable factors help Predicta separate supportive lanes from areas that need more caution.',
    freeInsight:
      `Favorable focus is strongest around houses ${favorableHouses.join(', ')}; caution is needed around houses ${pressureHouses.join(', ')}.`,
    id: 'ghatak-favorable',
    limitations: [
      'Exact traditional Ghatak day, tithi, nakshatra, and rashi factors are calculation-limited until those source tables are exposed by the backend.',
      'Predicta must describe this as a favorable and caution map, not as a complete Ghatak chakra.',
    ],
    premiumAnalysis:
      'Premium reads favorable and caution factors through Moon sign, house strength, dasha activation, and practical behavior so the user gets usable guidance without fear language.',
    title: 'Ghatak and Favorable Factors',
  });
}

function buildSwamsaSection(
  kundli: KundliData,
  chart?: ChartData,
): VedicIntelligenceSection {
  const navamsa = kundli.charts.D9;

  if (!chart || !navamsa?.supported) {
    return buildPendingClassicalSection(
      'swamsa',
      'Swamsa Chart',
      'Swamsa is pending because verified Navamsa chart evidence is not available in this Kundli.',
    );
  }

  return buildReadySection({
    evidence: [
      {
        observation: `Swamsa uses ${chart.ascendantSign} as the Navamsa self-reference and keeps D9 planet signs intact.`,
        source: 'D9 Navamsa ascendant and planet placements',
      },
    ],
    explanation:
      'Swamsa is the Navamsa self-direction lens. It translates inner motivation, soul-style expression, and the deeper pattern behind action into practical language.',
    freeInsight:
      `Swamsa points the inner compass through ${chart.ascendantSign}, highlighting self-direction and authentic action style rather than fixed fate.`,
    id: 'swamsa',
    premiumAnalysis:
      `Premium reads Swamsa through D9 ${chart.ascendantSign}, D1 promise, Chalit delivery, and active dasha before giving practical spiritual guidance.`,
    title: 'Swamsa Chart',
  });
}

function buildKarakamshaSection(
  kundli: KundliData,
  chart?: ChartData,
): VedicIntelligenceSection {
  const atmakaraka = resolveAtmakaraka(kundli);
  const navamsaPlanet = atmakaraka
    ? kundli.charts.D9?.planetDistribution.find(planet => planet.name === atmakaraka.name)
    : undefined;

  if (!atmakaraka || !navamsaPlanet || !chart) {
    return buildPendingClassicalSection(
      'karakamsha',
      'Karakamsha',
      'Karakamsha is pending because Atmakaraka or Navamsa planet placement is not available in this Kundli.',
    );
  }

  return buildReadySection({
    evidence: [
      {
        observation: `${atmakaraka.name} is the Atmakaraka by highest sign degree (${atmakaraka.degree.toFixed(1)}°) and occupies ${navamsaPlanet.sign} in D9.`,
        source: 'D1 Atmakaraka and D9 Navamsa placement',
      },
    ],
    explanation:
      'Karakamsha uses the Atmakaraka carried into Navamsa to describe a subtle soul-direction and spiritual growth lens.',
    freeInsight:
      `${atmakaraka.name} as Atmakaraka points the deeper life lesson toward ${navamsaPlanet.sign} themes in Navamsa, so this chart should be read as growth direction rather than fatalistic destiny.`,
    id: 'karakamsha',
    premiumAnalysis:
      `Premium reads ${atmakaraka.name} through D1 house ${atmakaraka.house}, ${atmakaraka.sign} dignity, D9 ${navamsaPlanet.sign}, Karakamsha ascendant ${chart.ascendantSign}, Chalit delivery, and active dasha before giving soul-purpose language.`,
    title: 'Karakamsha Chart',
  });
}

function buildPrastarashtakavargaSection(kundli: KundliData): VedicIntelligenceSection {
  const bavEntries = Object.entries(kundli.ashtakavarga.bav ?? {});

  if (!bavEntries.length) {
    return buildPendingClassicalSection(
      'prastarashtakavarga',
      'Prastarashtakavarga',
      'Prastarashtakavarga is pending because source BAV rows are not available in this Kundli.',
    );
  }

  const strongestRows = bavEntries
    .map(([planet, scores]) => ({
      planet,
      strongestHouse: strongestHouseFromScores(scores),
      total: scores.reduce((sum, score) => sum + score, 0),
    }))
    .slice(0, 7);

  return buildReadySection({
    evidence: strongestRows.map(row => ({
      observation: `${row.planet}: BAV total ${row.total}, strongest house ${row.strongestHouse}.`,
      source: 'Bhinna Ashtakavarga row',
    })),
    explanation:
      'Prastarashtakavarga is the detailed bindu proof layer behind Ashtakavarga. Predicta currently exposes the planet-wise BAV working rows.',
    freeInsight:
      'The detailed Ashtakavarga layer is available as planet-wise support rows so the report does not hide the proof behind one SAV number.',
    id: 'prastarashtakavarga',
    limitations: [
      'Source-contributor bindu cells are calculation-limited; the current deterministic output uses available BAV rows and does not invent missing contributor-level bindus.',
    ],
    premiumAnalysis:
      'Premium uses the BAV rows to explain which planets supply support to which houses, while clearly marking missing source-contributor bindu detail as calculation-limited.',
    title: 'Prastarashtakavarga',
  });
}

function buildAvakhadaSection(
  kundli: KundliData,
  panchang: ReturnType<typeof composePersonalPanchangLayer>,
): VedicIntelligenceSection {
  return buildReadySection({
    evidence: [
      {
        observation: `Moon sign ${kundli.moonSign}, Nakshatra ${kundli.nakshatra}, weekday lord ${panchang.weekdayLord}, tithi ${panchang.tithi}.`,
        source: 'Birth Moon and Panchang identity',
      },
    ],
    explanation:
      'Avakhada Chakra is a compact identity table of birth-star factors. Predicta exposes verified available factors and marks exact missing factors clearly.',
    freeInsight:
      `${kundli.nakshatra} with ${kundli.moonSign} Moon gives the verified Avakhada identity base available for this Kundli.`,
    id: 'avakhada-chakra',
    limitations: [
      'Exact Varna, Vashya, Yoni, Gana, Nadi, and related Avakhada factors are calculation-limited until the backend exposes those deterministic tables.',
    ],
    premiumAnalysis:
      'Premium explains the verified Moon, Nakshatra, pada, weekday, and tithi base now, then adds exact Avakhada sub-factors only when the deterministic source tables are available.',
    title: 'Avakhada Chakra',
  });
}

function buildMahadashaPhala(
  kundli: KundliData,
  depth: 'FREE' | 'PREMIUM',
): { section: VedicIntelligenceContract['mahadashaPhala'] } {
  const intelligence = composeMahadashaIntelligence(kundli, { depth });
  const currentPd =
    intelligence.pratyantardashas.find(item => item.status === 'current') ??
    intelligence.pratyantardashas[0];
  const currentAd =
    intelligence.antardashas.find(item => item.status === 'current') ??
    intelligence.antardashas.find(item => item.title.startsWith(kundli.dasha.current.antardasha)) ??
    intelligence.antardashas[0];
  const currentMd =
    intelligence.mahadashas.find(item => item.status === 'current') ??
    intelligence.mahadashas.find(item => item.title.startsWith(kundli.dasha.current.mahadasha)) ??
    intelligence.mahadashas[0];
  const pastMahadashas = intelligence.mahadashas
    .filter(item => item.status === 'past')
    .map(item => windowToMahadashaBlock(item.id, item.title, item.timing, item));

  const section = {
    ...buildReadySection({
      evidence: intelligence.current.evidence.map(item => ({
        observation: item.observation,
        source: item.title,
      })),
      explanation:
        'Mahadasha Phala explains the major life chapter, active sub-period, and fine timing layer in a structured way.',
      freeInsight: intelligence.current.freeInsight,
      id: 'mahadasha-phala',
      limitations: [
        ...intelligence.limitations,
        'Past Mahadashas are summarized only at Mahadasha level. They must not expand into Antardasha or Pratyantardasha drill-down.',
        'Pratyantardasha is a fine timing layer and should not be overclaimed.',
      ],
      premiumAnalysis:
        intelligence.current.premiumSynthesis ??
        'Premium adds chart evidence, dasha lord placement, house focus, Ashtakavarga support, and practical timing caution.',
      title: 'Mahadasha Phala and Meaning',
    }),
    currentEntireMahadasha: windowToMahadashaBlock(
      'current-entire-mahadasha',
      `Entire ${kundli.dasha.current.mahadasha} Mahadasha`,
      currentMd?.timing ?? `${kundli.dasha.current.startDate} to ${kundli.dasha.current.endDate}`,
      currentMd,
      intelligence.current.freeInsight,
      intelligence.current.premiumSynthesis,
    ),
    currentMahadashaAntardasha: windowToMahadashaBlock(
      'current-mahadasha-antardasha',
      `${kundli.dasha.current.mahadasha} Mahadasha + ${kundli.dasha.current.antardasha} Antardasha`,
      currentAd?.timing ?? `${kundli.dasha.current.startDate} to ${kundli.dasha.current.endDate}`,
      currentAd,
      intelligence.current.simpleMeaning,
      intelligence.current.premiumSynthesis,
    ),
    currentMahadashaAntardashaPratyantardasha: windowToMahadashaBlock(
      'current-mahadasha-antardasha-pratyantardasha',
      `${kundli.dasha.current.mahadasha} Mahadasha + ${kundli.dasha.current.antardasha} Antardasha + ${
        currentPd?.title.replace(' Pratyantardasha', '') ?? 'Pratyantardasha'
      }`,
      currentPd?.timing ?? 'Fine timing pending',
      currentPd,
      currentPd?.practicalGuidance ??
        'Use this fine layer as a practical timing cue, not a guaranteed event claim.',
      currentPd?.premiumDetail ??
        'Premium keeps Pratyantardasha to one careful paragraph because this layer is too fine to overstate.',
      [
        'Pratyantardasha is a fine timing layer and should not be overclaimed.',
      ],
    ),
    pastMahadashas,
    pratyantardashaCaution:
      'Pratyantardasha is a fine timing layer. Predicta uses it for practical timing nuance, not absolute certainty.',
  };

  return { section };
}

function windowToMahadashaBlock(
  id: string,
  title: string,
  period: string,
  window?: {
    evidence: Array<{ interpretation: string; observation: string; title: string }>;
    practicalGuidance: string;
    premiumDetail?: string;
    theme: string;
  },
  freeInsight?: string,
  premiumAnalysis?: string,
  limitations: string[] = [],
): VedicMahadashaPhalaBlock {
  return {
    evidence:
      window?.evidence.map(item => ({
        observation: item.observation,
        source: item.title,
      })) ?? [],
    freeInsight:
      freeInsight ??
      window?.practicalGuidance ??
      'This Mahadasha is summarized at the major-period level only.',
    id,
    limitations,
    period,
    premiumAnalysis:
      premiumAnalysis ??
      window?.premiumDetail ??
      'Premium gives one polished paragraph for this Mahadasha without drilling into past Antardasha or Pratyantardasha.',
    title,
  };
}

function buildGrahaVisualMetadata(
  chart?: ChartData,
): VedicGrahaVisualMetadata[] {
  const moonPhase = chart ? resolveMoonPhase(chart) : 'unknown';

  return CORE_GRAHAS.map(graha => {
    const labels = grahaLabels(graha);
    const moonToken =
      graha === 'Moon'
        ? (`lunar-disc-${moonPhase}` as const)
        : undefined;

    return {
      accessibleLabel: labels.en,
      badgeToken: moonToken ?? grahaToken(graha),
      displayLabel: labels.en,
      graha,
      localizedDisplayLabel: labels,
      shadowNode: graha === 'Rahu' || graha === 'Ketu',
      shortLabel: shortGrahaLabel(graha),
    };
  });
}

function buildReadySection({
  evidence,
  explanation,
  freeInsight,
  id,
  limitations = [],
  premiumAnalysis,
  title,
}: {
  evidence: VedicIntelligenceEvidence[];
  explanation: string;
  freeInsight: string;
  id: VedicIntelligenceSection['id'];
  limitations?: string[];
  premiumAnalysis: string;
  title: string;
}): VedicIntelligenceSection {
  return {
    evidence,
    explanation,
    freeInsight,
    id,
    limitations,
    premiumAnalysis,
    status: 'ready',
    title,
  };
}

function buildPendingClassicalSection(
  id: VedicIntelligenceSection['id'],
  title: string,
  limitation: string,
): VedicIntelligenceSection {
  return {
    evidence: [
      {
        observation: limitation,
        source: 'Pending deterministic module',
      },
    ],
    explanation:
      `${title} is part of the approved Vedic coverage, but this exact calculation is not yet safe to claim.`,
    freeInsight:
      `${title} is included as a pending Vedic module so the app and report never silently omit it.`,
    id,
    limitations: [limitation],
    premiumAnalysis:
      `Premium will add detailed ${title} analysis once the calculation is fully available and release-audited.`,
    status: 'pending',
    title,
  };
}

function buildPendingMahadashaBlock(
  id: string,
  title: string,
): VedicMahadashaPhalaBlock {
  return {
    evidence: [],
    freeInsight: 'Create a valid Kundli to calculate this dasha layer.',
    id,
    limitations: ['Dasha calculation is pending.'],
    period: 'Pending',
    premiumAnalysis:
      'Premium dasha analysis becomes available after the Kundli and Moon nakshatra are calculated.',
    title,
  };
}

function buildHousePlacements(planets: PlanetPosition[]): Record<number, string[]> {
  return planets.reduce<Record<number, string[]>>((current, planet) => {
    current[planet.house] = [...(current[planet.house] ?? []), planet.name];
    return current;
  }, {});
}

function buildSignPlacements(planets: PlanetPosition[]): Record<string, string[]> {
  return planets.reduce<Record<string, string[]>>((current, planet) => {
    current[planet.sign] = [...(current[planet.sign] ?? []), planet.name];
    return current;
  }, {});
}

function resolveDignity(
  planet: PlanetPosition,
): VedicHouseWisePlanetPlacement['dignity'] {
  const dignity = PLANET_DIGNITIES[planet.name];

  if (dignity?.exalted === planet.sign) {
    return 'exalted';
  }

  if (dignity?.debilitated === planet.sign) {
    return 'debilitated';
  }

  return 'neutral';
}

function isCombustPlanet(planet: PlanetPosition, sun?: PlanetPosition): boolean {
  const orb = COMBUSTION_ORBS[planet.name];

  if (!sun || !orb || planet.name === 'Sun' || planet.name === 'Rahu' || planet.name === 'Ketu') {
    return false;
  }

  return getAngularSeparation(planet.absoluteLongitude, sun.absoluteLongitude) <= orb;
}

function getAngularSeparation(firstLongitude: number, secondLongitude: number): number {
  const difference = Math.abs(firstLongitude - secondLongitude) % 360;
  return difference > 180 ? 360 - difference : difference;
}

function naturalRelation(
  fromPlanet: string,
  toPlanet: string,
): VedicFriendshipRelation {
  if (fromPlanet === toPlanet) {
    return 'friend';
  }

  if (NATURAL_FRIENDS[fromPlanet]?.includes(toPlanet)) {
    return 'friend';
  }

  if (NATURAL_ENEMIES[fromPlanet]?.includes(toPlanet)) {
    return 'enemy';
  }

  return fromPlanet === 'Rahu' || fromPlanet === 'Ketu' ? 'pending' : 'neutral';
}

function temporaryRelation(
  kundli: KundliData,
  fromPlanet: string,
  toPlanet: string,
): VedicFriendshipRelation {
  if (fromPlanet === toPlanet) {
    return 'friend';
  }

  const from = kundli.planets.find(planet => planet.name === fromPlanet);
  const to = kundli.planets.find(planet => planet.name === toPlanet);

  if (!from || !to) {
    return 'pending';
  }

  const fromSignIndex = SIGN_ORDER.indexOf(from.sign);
  const toSignIndex = SIGN_ORDER.indexOf(to.sign);

  if (fromSignIndex < 0 || toSignIndex < 0) {
    return 'pending';
  }

  const houseDistance = ((toSignIndex - fromSignIndex + 12) % 12) + 1;
  return TEMPORARY_FRIEND_HOUSES.has(houseDistance) ? 'friend' : 'enemy';
}

function compoundRelation(
  natural: VedicFriendshipRelation | undefined,
  temporary: VedicFriendshipRelation | undefined,
): VedicFriendshipRelation {
  if (!natural || !temporary || natural === 'pending' || temporary === 'pending') {
    return 'pending';
  }

  if (natural === temporary) {
    return natural;
  }

  if (natural === 'neutral') {
    return temporary;
  }

  if (temporary === 'neutral') {
    return natural;
  }

  return 'neutral';
}

function summarizeCompoundRelationship(
  relationships: Record<string, VedicFriendshipRelation>,
): VedicFriendshipRelation {
  const values = Object.values(relationships).filter(value => value !== 'pending');
  const friendCount = values.filter(value => value === 'friend').length;
  const enemyCount = values.filter(value => value === 'enemy').length;
  const neutralCount = values.filter(value => value === 'neutral').length;

  if (!values.length) {
    return 'pending';
  }

  if (friendCount >= enemyCount && friendCount >= neutralCount) {
    return 'friend';
  }

  if (enemyCount > friendCount && enemyCount >= neutralCount) {
    return 'enemy';
  }

  return 'neutral';
}

function summarizeFriendship(
  fromPlanet: string,
  relationships: Record<string, VedicFriendshipRelation>,
): string {
  const friendCount = Object.values(relationships).filter(value => value === 'friend').length;
  const enemyCount = Object.values(relationships).filter(value => value === 'enemy').length;
  const pendingCount = Object.values(relationships).filter(value => value === 'pending').length;

  return `${fromPlanet} has ${friendCount} supportive compound links and ${enemyCount} tense links in this Kundli${
    pendingCount ? `, with ${pendingCount} link(s) left calculation-limited` : ''
  }.`;
}

function strongestHouseFromScores(scores: number[]): number {
  return scores.reduce(
    (strongestIndex, score, index) => (score > scores[strongestIndex] ? index : strongestIndex),
    0,
  ) + 1;
}

function functionalBenefics(lagna: string): string[] {
  const trineLords = [1, 5, 9]
    .map(house => SIGN_LORDS[signFromHouse(lagna, house)])
    .filter(Boolean);

  return Array.from(new Set(trineLords));
}

function functionalMalefics(lagna: string): string[] {
  const pressureLords = [3, 6, 8, 11, 12]
    .map(house => SIGN_LORDS[signFromHouse(lagna, house)])
    .filter(Boolean);

  return Array.from(new Set(pressureLords));
}

function signFromHouse(lagna: string, house: number): string {
  const lagnaIndex = SIGN_ORDER.indexOf(lagna);

  if (lagnaIndex < 0) {
    return lagna;
  }

  return SIGN_ORDER[(lagnaIndex + house - 1) % 12] ?? lagna;
}

function grahaLabels(graha: string): Record<'en' | 'gu' | 'hi', string> {
  const labels: Record<string, Record<'en' | 'gu' | 'hi', string>> = {
    Jupiter: { en: 'Jupiter', gu: 'Guru', hi: 'Brahaspati' },
    Ketu: { en: 'Ketu', gu: 'Ketu', hi: 'Ketu' },
    Mars: { en: 'Mars', gu: 'Mangal', hi: 'Mangal' },
    Mercury: { en: 'Mercury', gu: 'Budh', hi: 'Budh' },
    Moon: { en: 'Moon', gu: 'Chandra', hi: 'Chandra' },
    Rahu: { en: 'Rahu', gu: 'Rahu', hi: 'Rahu' },
    Saturn: { en: 'Saturn', gu: 'Shani', hi: 'Shani' },
    Sun: { en: 'Sun', gu: 'Surya', hi: 'Surya' },
    Venus: { en: 'Venus', gu: 'Shukra', hi: 'Shukra' },
  };

  return labels[graha] ?? { en: graha, gu: graha, hi: graha };
}

function grahaToken(graha: string): VedicGrahaVisualMetadata['badgeToken'] {
  if (graha === 'Rahu' || graha === 'Ketu') {
    return 'node-shadow';
  }

  const tokens: Record<string, VedicGrahaVisualMetadata['badgeToken']> = {
    Jupiter: 'planet-gold',
    Mars: 'planet-fire',
    Mercury: 'planet-green',
    Saturn: 'planet-steel',
    Sun: 'planet-gold',
    Venus: 'benefic-soft',
  };

  return tokens[graha] ?? 'planet-silver';
}

function shortGrahaLabel(graha: string): string {
  const labels: Record<string, string> = {
    Jupiter: 'Ju',
    Ketu: 'Ke',
    Mars: 'Ma',
    Mercury: 'Me',
    Moon: 'Mo',
    Rahu: 'Ra',
    Saturn: 'Sa',
    Sun: 'Su',
    Venus: 'Ve',
  };

  return labels[graha] ?? graha.slice(0, 2);
}

function resolveMoonPhase(chart: ChartData): 'dark' | 'full' | 'unknown' | 'waning' | 'waxing' {
  const moon = chart.planetDistribution.find(planet => planet.name === 'Moon');
  const sun = chart.planetDistribution.find(planet => planet.name === 'Sun');

  if (!moon || !sun) {
    return 'unknown';
  }

  const separation = (moon.absoluteLongitude - sun.absoluteLongitude + 360) % 360;

  if (separation <= 12 || separation >= 348) {
    return 'dark';
  }

  if (separation >= 168 && separation <= 192) {
    return 'full';
  }

  return separation > 0 && separation < 180 ? 'waxing' : 'waning';
}

function isCoreGraha(planet: PlanetPosition): boolean {
  return CORE_GRAHAS.includes(planet.name);
}

function chartTypeNumber(chartType: ChartType): number {
  return Number(chartType.replace('D', '')) || 0;
}
