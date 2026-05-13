import type {
  JyotishArea,
  KundliData,
  YearlyHoroscopeEvidenceItem,
  YearlyHoroscopeInsightDepth,
  YearlyHoroscopeMonthCard,
  YearlyHoroscopeVarshaphal,
} from '@pridicta/types';

const SIGNS = [
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

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, body, confidence, and personal direction',
  2: 'money, speech, family, food habits, and savings',
  3: 'effort, courage, siblings, writing, and self-made growth',
  4: 'home, property, peace, mother, and inner stability',
  5: 'children, creativity, study, romance, and merit',
  6: 'work pressure, debts, health discipline, service, and competition',
  7: 'marriage, partnerships, clients, contracts, and public dealings',
  8: 'sudden changes, research, shared money, secrets, and transformation',
  9: 'fortune, dharma, teachers, father, blessings, and travel',
  10: 'career, authority, status, duties, and public work',
  11: 'income, gains, networks, elder siblings, and wish fulfillment',
  12: 'expenses, sleep, foreign lands, retreat, and spiritual release',
};

const HOUSE_AREAS: Record<number, JyotishArea[]> = {
  1: ['general', 'wellbeing'],
  2: ['wealth', 'relationship'],
  3: ['career', 'general'],
  4: ['wellbeing', 'general'],
  5: ['relationship', 'spirituality'],
  6: ['wellbeing', 'career'],
  7: ['relationship', 'career'],
  8: ['timing', 'spirituality'],
  9: ['spirituality', 'timing'],
  10: ['career', 'timing'],
  11: ['wealth', 'career'],
  12: ['spirituality', 'wellbeing'],
};

const PLANET_MEANINGS: Record<string, string> = {
  Jupiter: 'growth, wisdom, mentors, children, faith, and long-term support',
  Ketu: 'detachment, simplification, spiritual correction, and release',
  Mars: 'energy, courage, conflict handling, property, and decisive action',
  Mercury: 'speech, business, study, analysis, writing, and planning',
  Moon: 'mind, emotions, home rhythm, public response, and daily stability',
  Rahu: 'ambition, foreign links, technology, disruption, and unusual growth',
  Saturn: 'discipline, duty, delay, endurance, karma, and structure',
  Sun: 'authority, confidence, father figures, visibility, and leadership',
  Venus: 'relationships, comfort, money habits, art, vehicles, and desire',
};

export function composeYearlyHoroscopeVarshaphal(
  kundli?: KundliData,
  options: {
    depth?: YearlyHoroscopeInsightDepth;
    nowIso?: string;
  } = {},
): YearlyHoroscopeVarshaphal {
  const depth = options.depth ?? 'FREE';
  const nowIso = options.nowIso ?? new Date().toISOString();

  if (!kundli) {
    return buildPendingYearly(depth, nowIso);
  }

  const foundation = kundli.yearlyHoroscope ?? buildDerivedFoundation(kundli, nowIso);
  const focusAreas = Array.from(
    new Set([
      ...(HOUSE_AREAS[foundation.munthaHouse] ?? ['general']),
      areaFromPlanet(kundli.dasha.current.mahadasha),
      areaFromPlanet(kundli.dasha.current.antardasha),
    ]),
  ).slice(0, depth === 'PREMIUM' ? 5 : 3);
  const evidence = buildEvidence(kundli, foundation);
  const supportSignals = evidence
    .filter(item => item.weight === 'supportive' || item.weight === 'neutral')
    .slice(0, depth === 'PREMIUM' ? 4 : 2);
  const cautionSignals = evidence
    .filter(item => item.weight === 'challenging' || item.weight === 'mixed')
    .slice(0, depth === 'PREMIUM' ? 4 : 2);

  return {
    askPrompt:
      'Analyze my yearly horoscope and Varshaphal with Varsha Lagna, Muntha, dasha, Gochar, timing windows, and practical guidance.',
    cautionSignals,
    ctas: buildYearlyCtas(),
    dashaOverlay: buildDashaOverlay(kundli),
    depth,
    evidence,
    focusAreas,
    freeInsight: buildFreeInsight(kundli, foundation),
    gocharOverlay: buildGocharOverlay(kundli),
    limitations: buildLimitations(foundation.limitations, depth),
    monthlyCards: buildMonthlyCards(kundli, foundation, nowIso, depth),
    munthaHouse: foundation.munthaHouse,
    munthaLord: foundation.munthaLord,
    munthaSign: foundation.munthaSign,
    ownerName: kundli.birthDetails.name,
    premiumSynthesis:
      depth === 'PREMIUM'
        ? buildPremiumSynthesis(kundli, foundation)
        : undefined,
    premiumUnlock:
      'Premium yearly horoscope adds all-month cards, Tajika-style yearly synthesis, dasha-Gochar overlap, remedies, and PDF-ready annual planning.',
    solarReturnUtc: foundation.solarReturnUtc,
    solarYearEnd: foundation.solarYearEnd,
    solarYearStart: foundation.solarYearStart,
    status: 'ready',
    subtitle:
      depth === 'PREMIUM'
        ? 'A detailed annual map from Varsha Lagna, Muntha, dasha, Gochar, and planning windows.'
        : 'A useful annual map from the yearly chart, Muntha, dasha, and current Gochar.',
    supportSignals,
    title: `${kundli.birthDetails.name}'s Yearly Horoscope and Varshaphal`,
    varshaLagna: foundation.varshaLagna,
    yearLabel: foundation.yearLabel,
    yearTheme: buildYearTheme(foundation),
  };
}

function buildPendingYearly(
  depth: YearlyHoroscopeInsightDepth,
  nowIso: string,
): YearlyHoroscopeVarshaphal {
  const year = new Date(nowIso).getFullYear();
  return {
    askPrompt:
      'Create my Kundli, then prepare my yearly horoscope and Varshaphal.',
    cautionSignals: [],
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then prepare my yearly horoscope and Varshaphal.',
      },
    ],
    dashaOverlay: 'Dasha overlay appears after a Kundli is calculated.',
    depth,
    evidence: [
      {
        id: 'yearly-needs-kundli',
        interpretation:
          'Yearly horoscope needs the birth Sun, Lagna, Moon, dasha, and place to calculate the annual map.',
        observation: 'No Kundli is selected yet.',
        title: 'Birth chart needed',
        weight: 'neutral',
      },
    ],
    focusAreas: ['timing', 'general'],
    freeInsight:
      'Create a Kundli and Predicta will prepare a personal annual map instead of a generic yearly horoscope.',
    gocharOverlay: 'Gochar overlay appears after birth details are saved.',
    limitations: ['A personal yearly horoscope needs a calculated Kundli.'],
    monthlyCards: buildSampleMonthCards(nowIso),
    munthaHouse: 1,
    munthaLord: 'Mars',
    munthaSign: 'Aries',
    ownerName: 'You',
    premiumUnlock:
      'Premium yearly horoscope adds all-month cards, dasha-Gochar overlap, remedies, and PDF-ready annual planning.',
    solarYearEnd: `${year + 1}-12-31`,
    solarYearStart: `${year}-01-01`,
    status: 'pending',
    subtitle:
      'Create a Kundli so the annual map can use your birth Sun, Lagna, Moon, dasha, and place.',
    supportSignals: [],
    title: 'Yearly Horoscope and Varshaphal is waiting.',
    varshaLagna: 'Pending',
    yearLabel: `${year}-${year + 1}`,
    yearTheme: 'Personal annual theme pending until Kundli is ready.',
  };
}

function buildDerivedFoundation(
  kundli: KundliData,
  nowIso: string,
): NonNullable<KundliData['yearlyHoroscope']> {
  const now = new Date(nowIso);
  const birth = new Date(`${kundli.birthDetails.date}T00:00:00.000Z`);
  const birthdayThisYear = new Date(
    Date.UTC(now.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()),
  );
  const yearStart =
    now.getTime() >= birthdayThisYear.getTime()
      ? now.getUTCFullYear()
      : now.getUTCFullYear() - 1;
  const age = Math.max(0, yearStart - birth.getUTCFullYear());
  const lagnaIndex = Math.max(0, SIGNS.indexOf(kundli.lagna));
  const munthaSign = SIGNS[(lagnaIndex + age) % 12];
  const munthaHouse = ((SIGNS.indexOf(munthaSign) - lagnaIndex + 12) % 12) + 1;

  return {
    limitations: [
      'This saved Kundli was created before yearly horoscope details were added. Recalculate once to add exact solar-return timing.',
    ],
    method: 'TAJIKA_SOLAR_RETURN_FOUNDATION',
    munthaHouse,
    munthaLord: SIGN_LORDS[munthaSign] ?? 'Mars',
    munthaSign,
    planets: [],
    solarReturnUtc: birthdayThisYear.toISOString(),
    solarYearEnd: `${yearStart + 1}-${kundli.birthDetails.date.slice(5)}`,
    solarYearStart: `${yearStart}-${kundli.birthDetails.date.slice(5)}`,
    status: 'foundation',
    varshaLagna: kundli.lagna,
    yearAge: age,
    yearLabel: `${yearStart}-${yearStart + 1}`,
  };
}

function buildEvidence(
  kundli: KundliData,
  foundation: NonNullable<KundliData['yearlyHoroscope']>,
): YearlyHoroscopeEvidenceItem[] {
  const currentDasha = kundli.dasha.current;
  const slowTransits = (kundli.transits ?? []).filter(transit =>
    ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(transit.planet),
  );

  return [
    {
      id: 'yearly-varsha-lagna',
      interpretation:
        'Varsha Lagna sets the tone of the annual chart; it shows how the year presents itself externally.',
      observation: `Varsha Lagna is ${foundation.varshaLagna}.`,
      title: 'Varsha Lagna',
      weight: 'neutral',
    },
    {
      id: 'yearly-muntha',
      interpretation: `Muntha spotlights ${HOUSE_MEANINGS[foundation.munthaHouse]}, so this area needs conscious attention this year.`,
      observation: `Muntha is in ${foundation.munthaSign}, house ${foundation.munthaHouse}, ruled by ${foundation.munthaLord}.`,
      title: 'Muntha focus',
      weight:
        foundation.munthaHouse === 6 ||
        foundation.munthaHouse === 8 ||
        foundation.munthaHouse === 12
          ? 'mixed'
          : foundation.munthaHouse === 10 || foundation.munthaHouse === 11
          ? 'supportive'
          : 'neutral',
    },
    {
      id: 'yearly-dasha',
      interpretation:
        'Dasha is the life chapter. Varshaphal gives the annual map, but dasha decides which topics can actually activate strongly.',
      observation: `Current dasha is ${currentDasha.mahadasha}/${currentDasha.antardasha} until ${currentDasha.endDate}.`,
      title: 'Dasha overlay',
      weight: currentDasha.mahadasha === foundation.munthaLord ? 'supportive' : 'neutral',
    },
    {
      id: 'yearly-gochar',
      interpretation:
        'Slow Gochar planets shape the weather of the year; they are read with Lagna, Moon, and dasha.',
      observation:
        slowTransits.length > 0
          ? slowTransits
              .slice(0, 4)
              .map(
                transit =>
                  `${transit.planet} in ${transit.sign} from house ${transit.houseFromLagna} Lagna/${transit.houseFromMoon} Moon`,
              )
              .join('; ')
          : 'Current slow Gochar data is pending.',
      title: 'Yearly Gochar weather',
      weight: slowTransits.some(transit => transit.weight === 'challenging')
        ? 'mixed'
        : 'neutral',
    },
  ];
}

function buildYearTheme(
  foundation: NonNullable<KundliData['yearlyHoroscope']>,
): string {
  return `This solar year highlights ${HOUSE_MEANINGS[foundation.munthaHouse]} through Muntha, while ${foundation.varshaLagna} Varsha Lagna colors how the year unfolds.`;
}

function buildFreeInsight(
  kundli: KundliData,
  foundation: NonNullable<KundliData['yearlyHoroscope']>,
): string {
  return `For ${foundation.yearLabel}, the yearly spotlight is house ${foundation.munthaHouse}: ${HOUSE_MEANINGS[foundation.munthaHouse]}. Read this with your ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} dasha before making timing claims.`;
}

function buildPremiumSynthesis(
  kundli: KundliData,
  foundation: NonNullable<KundliData['yearlyHoroscope']>,
): string {
  return `Premium synthesis: ${foundation.varshaLagna} Varsha Lagna sets the yearly tone, Muntha in house ${foundation.munthaHouse} concentrates attention on ${HOUSE_MEANINGS[foundation.munthaHouse]}, and ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} decides which promises can activate. Month cards should be used for planning, not fear.`;
}

function buildDashaOverlay(kundli: KundliData): string {
  const current = kundli.dasha.current;
  return `${current.mahadasha} Mahadasha and ${current.antardasha} Antardasha are active until ${current.endDate}. The annual chart should be read inside this dasha chapter.`;
}

function buildGocharOverlay(kundli: KundliData): string {
  const slow = (kundli.transits ?? [])
    .filter(transit => ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(transit.planet))
    .slice(0, 4);

  if (!slow.length) {
    return 'Current Gochar data is pending, so the yearly map is anchored mainly to the chart and dasha.';
  }

  return `Slow Gochar anchors: ${slow
    .map(
      transit =>
        `${transit.planet} in ${transit.sign} (${transit.weight}, house ${transit.houseFromLagna} from Lagna)`,
    )
    .join('; ')}.`;
}

function buildMonthlyCards(
  kundli: KundliData,
  foundation: NonNullable<KundliData['yearlyHoroscope']>,
  nowIso: string,
  depth: YearlyHoroscopeInsightDepth,
): YearlyHoroscopeMonthCard[] {
  const count = depth === 'PREMIUM' ? 12 : 3;
  const dashaPlanet = kundli.dasha.current.antardasha;
  const focusAreas = HOUSE_AREAS[foundation.munthaHouse] ?? ['general'];

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(nowIso);
    date.setMonth(date.getMonth() + index);
    const monthLabel = date.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
    const focusArea = focusAreas[index % focusAreas.length];
    return {
      confidence: kundli.birthDetails.isTimeApproximate ? 'medium' : 'high',
      focusAreas: [focusArea],
      guidance:
        index === 0
          ? `Start with ${foundation.munthaHouse}th-house discipline: ${HOUSE_MEANINGS[foundation.munthaHouse]}.`
          : `Keep ${dashaPlanet} themes practical: ${PLANET_MEANINGS[dashaPlanet] ?? 'current dasha themes'}.`,
      id: `yearly-month-${index + 1}`,
      monthLabel,
      summary: `A planning card for ${monthLabel}, anchored to Muntha and current dasha.`,
      title: index === 0 ? 'Set the annual tone' : `Build through ${dashaPlanet}`,
    };
  });
}

function buildSampleMonthCards(nowIso: string): YearlyHoroscopeMonthCard[] {
  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(nowIso);
    date.setMonth(date.getMonth() + index);
    return {
      confidence: 'low',
      focusAreas: ['timing'],
      guidance:
        'Create a Kundli to turn this current-year preview into your personal yearly map.',
      id: `yearly-preview-month-${index + 1}`,
      monthLabel: date.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      }),
      summary: 'A year-planning preview that becomes personal after Kundli calculation.',
      title: 'Yearly planning preview',
    };
  });
}

function buildLimitations(
  sourceLimitations: string[] = [],
  depth: YearlyHoroscopeInsightDepth,
): string[] {
  const limits = [
    ...sourceLimitations,
    'Varshaphal is a one-year planning map. It must be read with D1, dasha, Gochar, and real-world effort.',
  ];

  if (depth === 'FREE') {
    limits.push(
      'Free yearly insight stays concise. Premium adds deeper month-by-month synthesis and report-ready evidence.',
    );
  }

  return Array.from(new Set(limits));
}

function buildYearlyCtas(): YearlyHoroscopeVarshaphal['ctas'] {
  return [
    {
      id: 'ask-year-theme',
      label: 'Explain This Year',
      prompt:
        'Explain my yearly horoscope in simple language with Varsha Lagna, Muntha, dasha, and Gochar proof.',
    },
    {
      id: 'ask-career-year',
      label: 'Career This Year',
      prompt:
        'Read my yearly horoscope for career, using Varshaphal, dasha, Gochar, and confidence.',
    },
    {
      id: 'ask-year-report',
      label: 'Make Year Report',
      prompt:
        'Create a yearly horoscope report preview with useful insight first and premium depth options.',
    },
  ];
}

function areaFromPlanet(planet: string): JyotishArea {
  if (planet === 'Venus' || planet === 'Moon') return 'relationship';
  if (planet === 'Jupiter' || planet === 'Ketu') return 'spirituality';
  if (planet === 'Saturn') return 'timing';
  if (planet === 'Mercury' || planet === 'Mars' || planet === 'Sun') {
    return 'career';
  }
  if (planet === 'Rahu') return 'career';
  return 'general';
}
