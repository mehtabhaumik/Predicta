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
  const sections = [
    snapshot,
    moonSection,
    houseWisePlacements,
    friendshipTable,
    beneficMalefic,
    buildChalitSection(chalitRows),
    buildPanchangSection(panchangLayer),
    buildPendingClassicalSection('samsa', 'Samsa', 'Samsa needs the approved deterministic module in Phase 3 before Predicta should give a strong table.'),
    buildPendingClassicalSection('ghatak-favorable', 'Ghatak and Favorable Factors', 'Ghatak and favorable factors need the approved deterministic module in Phase 3 before Predicta should list exact items.'),
    buildPendingClassicalSection('karakamsha', 'Karakamsha', 'Karakamsha needs Atmakaraka/Navamsha extraction from the approved Phase 3 module before exact interpretation.'),
    buildAshtakavargaSection(kundli),
    buildPendingClassicalSection('prastarashtakavarga', 'Prastarashtakavarga', 'Prastarashtakavarga source bindu tables are pending the approved Phase 3 module.'),
    buildPendingClassicalSection('avakhada-chakra', 'Avakhada Chakra', 'Avakhada chakra needs the approved Phase 3 module before exact Varna, Vashya, Yoni, Gana, Nadi, and related factors are shown.'),
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
    chartOrder: buildVedicChartOrder(kundli, moonChart),
    depth,
    friendshipTable,
    generatedAt: nowIso,
    ghatakFavorable: sections.find(section => section.id === 'ghatak-favorable')!,
    grahaVisualMetadata: buildGrahaVisualMetadata(moonChart),
    houseWisePlacements,
    karakamsha: sections.find(section => section.id === 'karakamsha')!,
    limitations: sections.flatMap(section => section.limitations),
    mahadashaPhala: mahadasha.section,
    moonChart: moonSection,
    ownerName: kundli.birthDetails.name,
    panchang: sections.find(section => section.id === 'panchang')!,
    prastarashtakavarga: sections.find(section => section.id === 'prastarashtakavarga')!,
    samsa: sections.find(section => section.id === 'samsa')!,
    sections,
    snapshot,
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
    karakamsha: buildPendingClassicalSection('karakamsha', 'Karakamsha', 'Karakamsha needs a calculated Kundli.'),
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
): VedicIntelligenceContract['chartOrder'] {
  const remaining = (Object.keys(kundli.charts) as ChartType[])
    .filter(chartType => chartType !== 'D1' && chartType !== 'D9')
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
  const rows = kundli.planets
    .filter(isCoreGraha)
    .map(planet => {
      const dignity = resolveDignity(planet);

      return {
        combust: false,
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
        observation: `${row.planet}: house ${row.house}, ${row.sign}, ${row.degree.toFixed(1)}°, ${row.nakshatra} pada ${row.pada}.`,
        source: 'D1 planet placement',
      })),
      explanation:
        'The house-wise planet table turns chart proof into a readable placement ledger.',
      freeInsight:
        'This table shows which planets are influencing which houses without forcing the user to decode the chart manually.',
      id: 'house-wise-placements',
      premiumAnalysis:
        'Premium adds interpretation by house, sign, nakshatra, dignity, retrogression, combustion where available, and current dasha relevance.',
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
  const rows: VedicPlanetFriendshipRow[] = presentGrahas.map(fromPlanet => ({
    compoundRelationship: 'pending',
    fromPlanet,
    naturalRelationships: Object.fromEntries(
      presentGrahas.map(toPlanet => [toPlanet, naturalRelation(fromPlanet, toPlanet)]),
    ),
    temporaryRelationships: Object.fromEntries(
      presentGrahas.map(toPlanet => [toPlanet, 'pending']),
    ),
  }));

  return {
    ...buildReadySection({
      evidence: [
        {
          observation:
            'Natural friendship is available now; temporary and compound friendship are explicitly pending Phase 3 hardening.',
          source: 'Classical natural friendship table',
        },
      ],
      explanation:
        'The friendship table shows how planets naturally cooperate, stay neutral, or create friction with each other.',
      freeInsight:
        'Use this as a simple relationship map between grahas, not as a fear table.',
      id: 'friendship-table',
      limitations: [
        'Temporary and compound friendship are pending deterministic Phase 3 hardening.',
      ],
      premiumAnalysis:
        'Premium will combine natural, temporary, and compound relationship with house lordship and active dasha once Phase 3 hardens the deterministic module.',
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
        'Functional classification is a contract-level house-lordship model; Phase 3 will harden edge cases and yogakaraka nuance.',
      ],
      premiumAnalysis:
        'Premium explains natural tone, Lagna-specific function, house ownership, dignity, dasha activation, and practical use without calling any planet permanently good or bad.',
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
      `${title} is part of the shared Vedic intelligence contract, but this exact calculation is not yet safe to claim.`,
    freeInsight:
      `${title} is included as a pending Vedic module so the app and report never silently omit it.`,
    id,
    limitations: [limitation],
    premiumAnalysis:
      `Premium will add detailed ${title} analysis after the deterministic Phase 3 module is implemented and audited.`,
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
    Jupiter: { en: 'Jupiter', gu: 'Guru', hi: 'Guru' },
    Ketu: { en: 'Ketu', gu: 'Ketu', hi: 'Ketu' },
    Mars: { en: 'Mars', gu: 'Mangal', hi: 'Mangal' },
    Mercury: { en: 'Mercury', gu: 'Mercury', hi: 'Mercury' },
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
