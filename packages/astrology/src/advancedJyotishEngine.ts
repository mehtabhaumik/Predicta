import type {
  AdvancedAshtakavargaHouse,
  AdvancedJyotishCoverage,
  AdvancedJyotishEvidenceItem,
  AdvancedJyotishInsightDepth,
  AdvancedJyotishModulePolicy,
  AdvancedNakshatraInsight,
  AdvancedPanchangMuhurta,
  AdvancedYogaDoshaInsight,
  KundliData,
  PlanetPosition,
} from '@pridicta/types';

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'body, identity, confidence, and direction',
  2: 'money, speech, food habits, family, and savings',
  3: 'courage, siblings, writing, effort, and self-made growth',
  4: 'home, property, peace, mother, and emotional base',
  5: 'children, study, creativity, romance, and merit',
  6: 'workload, debts, health discipline, service, and competition',
  7: 'marriage, partnerships, clients, contracts, and public dealings',
  8: 'sudden change, research, shared money, secrets, and transformation',
  9: 'fortune, dharma, teachers, father, blessings, and travel',
  10: 'career, public work, duty, authority, and reputation',
  11: 'income, gains, network, elder siblings, and wishes',
  12: 'expenses, sleep, foreign lands, retreat, and spiritual release',
};

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashirsha',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

const NAKSHATRA_LORDS = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
] as const;

const MODULE_REGISTRY: AdvancedJyotishModulePolicy[] = [
  {
    freeAccess: 'Top yogas and care patterns with plain-language meaning.',
    id: 'yoga-dosha',
    premiumDepth:
      'Strength, softening factors, dasha activation, cancellation checks, and report depth.',
    simpleName: 'Chart Patterns',
    title: 'Yoga and dosha strength',
  },
  {
    freeAccess: 'Moon nakshatra, pada, lord, and one useful temperament insight.',
    id: 'nakshatra',
    premiumDepth:
      'Pada nuance, Tara-style compatibility hooks, remedies, and dasha/nakshatra overlap.',
    simpleName: 'Birth Star',
    title: 'Nakshatra intelligence',
  },
  {
    freeAccess: 'Strongest and careful houses with simple guidance.',
    id: 'ashtakavarga',
    premiumDepth:
      'SAV/BAV house table, Saturn/Jupiter transit filters, Sade Sati support, and planning.',
    simpleName: 'Strength Map',
    title: 'Ashtakavarga detail',
  },
  {
    freeAccess: 'Daily panchang-style guidance from weekday, tithi estimate, and Moon star.',
    id: 'panchang-muhurta',
    premiumDepth:
      'Personal muhurta planning, good/avoid windows, reminders, and decision support.',
    simpleName: 'Good Timing',
    title: 'Panchang and muhurta planning',
  },
  {
    freeAccess: 'Explains what evidence will be used for compatibility.',
    id: 'compatibility',
    premiumDepth:
      'Two-chart evidence model with Moon, nakshatra, D1/D9, dasha overlap, and communication advice.',
    simpleName: 'Compatibility',
    title: 'Compatibility evidence model',
  },
  {
    freeAccess: 'Explains how Prashna will be handled safely.',
    id: 'prashna',
    premiumDepth:
      'Question-time chart planning with clear separation from birth Kundli and no fake certainty.',
    premiumOnly: true,
    simpleName: 'Question Chart',
    title: 'Prashna planning',
  },
  {
    freeAccess: 'Safe behavioral and devotional remedies only.',
    id: 'safe-remedies',
    premiumDepth:
      'Planet-linked remedy schedules, cautions, consistency tracker, and report-ready plan.',
    simpleName: 'Safe Remedies',
    title: 'Safe remedy expansion',
  },
  {
    freeAccess: 'Hidden by default so beginners are not confused.',
    id: 'advanced-mode',
    premiumDepth:
      'Technical tables for serious users: BAV/SAV, dignities, dasha links, Vargas, and evidence rows.',
    simpleName: 'Advanced Mode',
    title: 'Astrologer-grade tables',
  },
];

export function composeAdvancedJyotishCoverage(
  kundli?: KundliData,
  options: {
    depth?: AdvancedJyotishInsightDepth;
    nowIso?: string;
  } = {},
): AdvancedJyotishCoverage {
  const depth = options.depth ?? 'FREE';
  const nowIso = options.nowIso ?? new Date().toISOString();

  if (!kundli) {
    return buildPendingCoverage(depth, nowIso);
  }

  return {
    advancedModeTables: buildAdvancedTables(kundli, depth),
    ashtakavargaDetail: buildAshtakavargaDetail(kundli, depth),
    askPrompt:
      'Show my advanced Jyotish coverage in simple language: yogas, care patterns, nakshatra, Ashtakavarga, panchang/muhurta, compatibility, Prashna planning, and safe remedies.',
    compatibility: {
      evidenceModel: [
        'Moon sign and Moon nakshatra for emotional fit.',
        'D1 7th house, Venus/Jupiter, and relationship houses for visible partnership patterns.',
        'D9 Navamsha for marriage maturity and deeper planet strength.',
        'Dasha overlap to understand timing and pressure windows.',
      ],
      requiredSecondProfile: true,
      status: 'single-chart',
      summary:
        'Compatibility needs a second Kundli. Predicta can still prepare the evidence checklist from this chart and compare once another profile is saved.',
    },
    ctas: buildCtas(),
    depth,
    freePolicy:
      'Free users get broad Jyotish coverage, every available chart, and useful insight without technical overwhelm.',
    limitations: [
      'Care patterns are not fear labels. They show where patience, verification, and remedy discipline help.',
      'Panchang and muhurta guidance here is a planning aid, not a guarantee.',
      'Prashna must use a fresh question-time chart and should stay separate from birth-Kundli reading.',
    ],
    moduleRegistry: MODULE_REGISTRY,
    nakshatraInsight: buildNakshatraInsight(kundli, depth),
    ownerName: kundli.birthDetails.name,
    panchangMuhurta: buildPanchangMuhurta(kundli, nowIso),
    prashna: {
      guardrails: [
        'Ask one clear question at a real decision moment.',
        'Do not reuse old question charts for a different question.',
        'Predicta must label Prashna separately from birth Kundli.',
      ],
      requiredInputs: ['Question text', 'Question time', 'Question place or timezone'],
      status: 'planned',
      summary:
        'Prashna will be a premium question-time chart workflow. It is planned here so Predicta does not mix it casually with birth-chart answers.',
    },
    premiumPolicy:
      'Premium turns the same surface into detailed synthesis, strength checks, timing, remedies, technical tables, and PDF-ready guidance.',
    premiumUnlock:
      'Premium Advanced Mode adds detailed yoga/dosha scoring, BAV/SAV tables, nakshatra depth, muhurta planning, compatibility synthesis, Prashna workflow, and safe remedy schedules.',
    safeRemedies: buildSafeRemedies(kundli),
    status: 'ready',
    subtitle:
      depth === 'PREMIUM'
        ? 'Serious Jyotish coverage with detailed tables and planning depth.'
        : 'Broad Jyotish coverage explained simply, with technical depth kept behind Premium.',
    title: `${kundli.birthDetails.name}'s Advanced Jyotish coverage`,
    yogaDoshaInsights: buildYogaDoshaInsights(kundli, depth),
  };
}

function buildPendingCoverage(
  depth: AdvancedJyotishInsightDepth,
  nowIso: string,
): AdvancedJyotishCoverage {
  return {
    advancedModeTables: [],
    ashtakavargaDetail: [],
    askPrompt:
      'Create my Kundli, then show advanced Jyotish coverage in simple language.',
    compatibility: {
      evidenceModel: ['Create Kundli first.'],
      requiredSecondProfile: true,
      status: 'single-chart',
      summary: 'Compatibility evidence starts after a Kundli is calculated.',
    },
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then show advanced Jyotish coverage.',
      },
    ],
    depth,
    freePolicy:
      'Free users get useful insight across the available Jyotish surface.',
    limitations: ['Create a Kundli first.'],
    moduleRegistry: MODULE_REGISTRY,
    nakshatraInsight: {
      evidence: [],
      lord: 'Pending',
      moonNakshatra: 'Pending',
      pada: 0,
      simpleInsight: 'Moon nakshatra appears after Kundli calculation.',
      theme: 'Pending',
    },
    ownerName: 'You',
    panchangMuhurta: {
      avoidFor: ['Personal timing until Kundli is ready.'],
      date: nowIso,
      evidence: [],
      favorableWindows: ['Create Kundli first.'],
      moonNakshatra: 'Pending',
      simpleGuidance: 'Personal panchang planning appears after Kundli calculation.',
      tithi: 'Pending',
      weekday: weekday(nowIso),
    },
    prashna: {
      guardrails: ['Create Kundli first for birth-chart context.'],
      requiredInputs: ['Question text', 'Question time', 'Question place'],
      status: 'planned',
      summary: 'Prashna planning is available after the main chart is ready.',
    },
    premiumPolicy:
      'Premium adds detailed synthesis, timing, remedies, and technical tables.',
    premiumUnlock:
      'Premium Advanced Mode adds detailed scoring, planning, and report depth.',
    safeRemedies: ['Create Kundli first so remedies can be evidence-linked.'],
    status: 'pending',
    subtitle: 'Create Kundli first so Predicta can map the full Jyotish surface.',
    title: 'Advanced Jyotish coverage is waiting.',
    yogaDoshaInsights: [],
  };
}

function buildYogaDoshaInsights(
  kundli: KundliData,
  depth: AdvancedJyotishInsightDepth,
): AdvancedYogaDoshaInsight[] {
  const yogaInsights: AdvancedYogaDoshaInsight[] = kundli.yogas.map((yoga, index) => ({
    cancellationFactors:
      yoga.strength === 'mild'
        ? ['This pattern is mild, so it should not be overread without dasha activation.']
        : ['Check dasha and related house strength before making timing claims.'],
    evidence: [
      {
        id: `yoga-${index + 1}`,
        interpretation: yoga.meaning,
        observation: `${yoga.name} is marked ${yoga.strength}.`,
        title: yoga.name,
        weight: yoga.strength === 'strong' ? 'supportive' : 'neutral',
      },
    ],
    id: `yoga-${index + 1}`,
    kind: 'yoga' as const,
    name: yoga.name,
    status: 'active' as const,
    strength: yoga.strength,
    summary: yoga.meaning,
  }));

  const carePatterns = [
    buildManglikCarePattern(kundli),
    buildKemadrumaCarePattern(kundli),
    buildNodeAxisCarePattern(kundli),
  ].filter((item): item is AdvancedYogaDoshaInsight => Boolean(item));

  return [...yogaInsights, ...carePatterns].slice(
    0,
    depth === 'PREMIUM' ? 12 : 5,
  );
}

function buildManglikCarePattern(
  kundli: KundliData,
): AdvancedYogaDoshaInsight | undefined {
  const mars = findPlanet(kundli, 'Mars');
  if (!mars || ![1, 4, 7, 8, 12].includes(mars.house)) return undefined;

  return {
    cancellationFactors: [
      mars.sign === 'Aries' || mars.sign === 'Scorpio'
        ? 'Mars is in its own sign, which can soften the pattern through discipline and directness.'
        : 'Check Jupiter/Venus support and D9 before judging marriage outcomes.',
      'This should never be used as a fear label or rejection rule.',
    ],
    evidence: [
      {
        id: 'care-mars-relationship',
        interpretation:
          'Mars in a relationship-sensitive house can make reactions faster, so communication discipline matters.',
        observation: `Mars is in house ${mars.house}, ${mars.sign}.`,
        title: 'Mars relationship care',
        weight: 'mixed',
      },
    ],
    id: 'care-manglik',
    kind: 'care-pattern',
    name: 'Mars relationship care pattern',
    status: mars.sign === 'Aries' || mars.sign === 'Scorpio' ? 'softened' : 'needs-review',
    strength: mars.house === 7 || mars.house === 8 ? 'moderate' : 'mild',
    summary:
      'This is handled as a communication and timing care pattern, not a scary dosha label.',
  };
}

function buildKemadrumaCarePattern(
  kundli: KundliData,
): AdvancedYogaDoshaInsight | undefined {
  const moon = findPlanet(kundli, 'Moon');
  if (!moon) return undefined;
  const adjacentHouses = [wrapHouse(moon.house - 1), wrapHouse(moon.house + 1)];
  const hasAdjacentPlanet = kundli.planets.some(
    planet =>
      planet.name !== 'Moon' &&
      !['Rahu', 'Ketu'].includes(planet.name) &&
      adjacentHouses.includes(planet.house),
  );
  if (hasAdjacentPlanet) return undefined;

  return {
    cancellationFactors: [
      'If benefics influence the Moon or Moon is strong in vargas, the emotional isolation pattern softens.',
      'Use this only for emotional support planning, not fatalistic prediction.',
    ],
    evidence: [
      {
        id: 'care-moon-adjacent',
        interpretation:
          'Moon without close neighboring support can need stronger routines, community, and emotional naming.',
        observation: `Moon is in house ${moon.house}, with no non-node planet in adjacent houses.`,
        title: 'Moon support care',
        weight: 'mixed',
      },
    ],
    id: 'care-kemadruma',
    kind: 'care-pattern',
    name: 'Moon support care pattern',
    status: 'needs-review',
    strength: 'mild',
    summary:
      'This suggests emotional rhythm needs conscious support; it is not a doom statement.',
  };
}

function buildNodeAxisCarePattern(
  kundli: KundliData,
): AdvancedYogaDoshaInsight | undefined {
  const rahu = findPlanet(kundli, 'Rahu');
  const ketu = findPlanet(kundli, 'Ketu');
  if (!rahu || !ketu) return undefined;
  const nonNodes = kundli.planets.filter(
    planet => planet.name !== 'Rahu' && planet.name !== 'Ketu',
  );
  const oneSide = nonNodes.every(planet =>
    isBetweenClockwise(planet.absoluteLongitude, rahu.absoluteLongitude, ketu.absoluteLongitude),
  );
  const otherSide = nonNodes.every(planet =>
    isBetweenClockwise(planet.absoluteLongitude, ketu.absoluteLongitude, rahu.absoluteLongitude),
  );
  if (!oneSide && !otherSide) return undefined;

  return {
    cancellationFactors: [
      'If planets cross the nodal boundary by degree or strong benefic support exists, intensity softens.',
      'Treat this as focus/intensity, not fear.',
    ],
    evidence: [
      {
        id: 'care-node-axis',
        interpretation:
          'A concentrated nodal axis can create intense focus and sudden turns. Predicta should slow timing claims and use dasha proof.',
        observation: 'Most planets sit within one Rahu-Ketu arc.',
        title: 'Rahu-Ketu concentration',
        weight: 'mixed',
      },
    ],
    id: 'care-node-axis',
    kind: 'care-pattern',
    name: 'Rahu-Ketu concentration care pattern',
    status: 'needs-review',
    strength: 'moderate',
    summary:
      'This pattern can show intensity and unusual life turns, but it must be softened by chart strength and timing evidence.',
  };
}

function buildNakshatraInsight(
  kundli: KundliData,
  depth: AdvancedJyotishInsightDepth,
): AdvancedNakshatraInsight {
  const moon = findPlanet(kundli, 'Moon');
  const index = Math.max(0, NAKSHATRAS.indexOf(kundli.nakshatra));
  const lord = NAKSHATRA_LORDS[index % NAKSHATRA_LORDS.length] ?? 'Moon';
  const theme = nakshatraTheme(kundli.nakshatra);

  return {
    evidence: [
      {
        id: 'moon-nakshatra',
        interpretation:
          'Moon nakshatra describes emotional habit, instinctive comfort, and how timing feels from inside.',
        observation: `${kundli.moonSign} Moon in ${kundli.nakshatra}${moon ? ` pada ${moon.pada}` : ''}.`,
        title: 'Moon birth star',
        weight: 'neutral',
      },
      {
        id: 'nakshatra-lord',
        interpretation:
          'The nakshatra lord connects the birth-star style to dasha timing and remedy tone.',
        observation: `${kundli.nakshatra} is read with ${lord} as the star lord.`,
        title: 'Nakshatra lord',
        weight:
          kundli.dasha.current.mahadasha === lord ||
          kundli.dasha.current.antardasha === lord
            ? 'supportive'
            : 'neutral',
      },
    ],
    lord,
    moonNakshatra: kundli.nakshatra,
    pada: moon?.pada ?? 0,
    premiumSynthesis:
      depth === 'PREMIUM'
        ? `${kundli.nakshatra} should be read with Moon sign, pada, ${lord} dasha links, Tara-style compatibility checks, and a simple remedy tone.`
        : undefined,
    simpleInsight: `${kundli.nakshatra} gives a ${theme} emotional style. Keep advice practical and gentle, especially during ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
    theme,
  };
}

function buildAshtakavargaDetail(
  kundli: KundliData,
  depth: AdvancedJyotishInsightDepth,
): AdvancedAshtakavargaHouse[] {
  const houses = Array.from({ length: 12 }, (_, index) => index + 1);
  return houses
    .map(house => {
      const score = kundli.ashtakavarga.sav[house - 1] ?? 0;
      const tone =
        score >= 30 ? 'supportive' : score <= 24 ? 'careful' : 'steady';
      return {
        guidance:
          tone === 'supportive'
            ? 'Use this area for progress, repair, and visible effort.'
            : tone === 'careful'
            ? 'Slow down, verify details, and build discipline here.'
            : 'Steady effort works best here; avoid extremes.',
        house,
        score,
        theme: HOUSE_MEANINGS[house],
        tone,
      } satisfies AdvancedAshtakavargaHouse;
    })
    .sort((a, b) => {
      if (depth === 'PREMIUM') return a.house - b.house;
      return b.score - a.score;
    })
    .slice(0, depth === 'PREMIUM' ? 12 : 5);
}

function buildPanchangMuhurta(
  kundli: KundliData,
  nowIso: string,
): AdvancedPanchangMuhurta {
  const moonTransit = (kundli.transits ?? []).find(item => item.planet === 'Moon');
  const sunTransit = (kundli.transits ?? []).find(item => item.planet === 'Sun');
  const tithi = moonTransit && sunTransit
    ? tithiName(moonTransit.degree + signOffset(moonTransit.sign), sunTransit.degree + signOffset(sunTransit.sign))
    : 'Tithi estimate pending';
  const day = weekday(nowIso);

  return {
    avoidFor: [
      'Irreversible decisions without checking dasha and practical facts.',
      'Fear-based remedies or expensive rituals.',
    ],
    date: nowIso,
    evidence: [
      {
        id: 'panchang-weekday',
        interpretation:
          'Weekday gives a simple devotional and practical tone for the day.',
        observation: `${day} planning tone.`,
        title: 'Weekday',
        weight: 'neutral',
      },
      {
        id: 'panchang-moon-star',
        interpretation:
          'Moon star helps choose the emotional rhythm of the day.',
        observation: `Natal Moon star: ${kundli.nakshatra}. Current Moon: ${moonTransit?.sign ?? 'pending'}.`,
        title: 'Moon rhythm',
        weight: 'neutral',
      },
    ],
    favorableWindows: [
      'Use the first calm window of the day for planning and commitments.',
      'Use evenings for review, gratitude, and remedy consistency.',
    ],
    moonNakshatra: kundli.nakshatra,
    simpleGuidance:
      'Use Panchang as a planning helper: align important actions with calm mind, clean facts, and dasha support.',
    tithi,
    weekday: day,
  };
}

function buildAdvancedTables(
  kundli: KundliData,
  depth: AdvancedJyotishInsightDepth,
): AdvancedJyotishCoverage['advancedModeTables'] {
  const dasha = kundli.dasha.current;
  const baseRows = [
    {
      label: 'Current dasha',
      note: 'Timing chapter for interpreting all promises.',
      value: `${dasha.mahadasha}/${dasha.antardasha}`,
    },
    {
      label: 'Strong houses',
      note: 'Higher SAV support areas.',
      value: kundli.ashtakavarga.strongestHouses.join(', '),
    },
    {
      label: 'Care houses',
      note: 'Lower SAV areas need pacing and discipline.',
      value: kundli.ashtakavarga.weakestHouses.join(', '),
    },
  ];

  return [
    {
      id: 'advanced-core',
      rows: baseRows,
      summary:
        depth === 'PREMIUM'
          ? 'Premium can show expanded tables without confusing beginners.'
          : 'Advanced details stay summarized in free mode.',
      title: 'Core technical table',
    },
    {
      id: 'ashtakavarga-table',
      rows: buildAshtakavargaDetail(kundli, 'PREMIUM').map(item => ({
        label: `House ${item.house}`,
        note: item.theme,
        value: `${item.score} bindus - ${item.tone}`,
      })),
      summary:
        'SAV table for houses. Free users see highlights; Premium can use the full table in reports.',
      title: 'Ashtakavarga SAV table',
    },
  ];
}

function buildSafeRemedies(kundli: KundliData): string[] {
  const dasha = kundli.dasha.current;
  const weakest = kundli.ashtakavarga.weakestHouses[0];
  return [
    `For ${dasha.mahadasha}/${dasha.antardasha}, keep one small weekly discipline instead of many rituals.`,
    weakest
      ? `House ${weakest} needs steady care: ${HOUSE_MEANINGS[weakest]}. Choose practical service, clean speech, and consistency.`
      : 'Use simple prayer, service, and honest effort before any complex remedy.',
    'Avoid fear purchases. Remedies should be safe, affordable, and repeatable.',
  ];
}

function buildCtas(): AdvancedJyotishCoverage['ctas'] {
  return [
    {
      id: 'advanced-simple',
      label: 'Simple Advanced View',
      prompt:
        'Explain my advanced Jyotish coverage simply: yogas, care patterns, nakshatra, Ashtakavarga, and safe remedies.',
    },
    {
      id: 'advanced-table',
      label: 'Advanced Tables',
      prompt:
        'Show advanced Jyotish tables for my Kundli with plain-English meaning and no fear language.',
    },
    {
      id: 'muhurta-plan',
      label: 'Plan Timing',
      prompt:
        'Use Panchang, muhurta style, dasha, and Gochar to help me choose a practical timing window.',
    },
  ];
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(planet => planet.name === name);
}

function wrapHouse(house: number): number {
  if (house < 1) return 12;
  if (house > 12) return 1;
  return house;
}

function isBetweenClockwise(value: number, start: number, end: number): boolean {
  const normalized = ((value % 360) + 360) % 360;
  const normalizedStart = ((start % 360) + 360) % 360;
  const normalizedEnd = ((end % 360) + 360) % 360;
  if (normalizedStart <= normalizedEnd) {
    return normalized >= normalizedStart && normalized <= normalizedEnd;
  }
  return normalized >= normalizedStart || normalized <= normalizedEnd;
}

function nakshatraTheme(nakshatra: string): string {
  if (['Ashwini', 'Hasta', 'Revati'].includes(nakshatra)) return 'helpful, quick, skill-oriented';
  if (['Rohini', 'Purva Phalguni', 'Uttara Phalguni'].includes(nakshatra)) return 'creative, relational, comfort-aware';
  if (['Pushya', 'Anuradha', 'Shravana'].includes(nakshatra)) return 'devotional, loyal, learning-oriented';
  if (['Ardra', 'Mula', 'Jyeshtha'].includes(nakshatra)) return 'intense, truth-seeking, transformative';
  if (['Dhanishta', 'Shatabhisha', 'Swati'].includes(nakshatra)) return 'independent, networked, movement-oriented';
  return 'purposeful, layered, and growth-oriented';
}

function weekday(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
}

function signOffset(sign: string): number {
  const signs = [
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
  return Math.max(0, signs.indexOf(sign)) * 30;
}

function tithiName(moonLongitude: number, sunLongitude: number): string {
  const diff = ((moonLongitude - sunLongitude) % 360 + 360) % 360;
  const tithiNumber = Math.floor(diff / 12) + 1;
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const names = [
    'Pratipada',
    'Dvitiya',
    'Tritiya',
    'Chaturthi',
    'Panchami',
    'Shashthi',
    'Saptami',
    'Ashtami',
    'Navami',
    'Dashami',
    'Ekadashi',
    'Dwadashi',
    'Trayodashi',
    'Chaturdashi',
    'Purnima/Amavasya',
  ];
  return `${paksha} ${names[(tithiNumber - 1) % 15]}`;
}
