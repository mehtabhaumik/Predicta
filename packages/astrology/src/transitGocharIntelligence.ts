import type {
  JyotishArea,
  KundliData,
  TransitGocharEvidenceItem,
  TransitGocharInsightDepth,
  TransitGocharIntelligence,
  TransitGocharMonthlyCard,
  TransitGocharPlanetInsight,
  TransitInsight,
} from '@pridicta/types';

const PLANET_AREAS: Record<string, JyotishArea> = {
  Jupiter: 'spirituality',
  Ketu: 'spirituality',
  Mars: 'career',
  Mercury: 'general',
  Moon: 'relationship',
  Rahu: 'career',
  Saturn: 'timing',
  Sun: 'career',
  Venus: 'relationship',
};

const PLANET_MEANINGS: Record<string, string> = {
  Jupiter: 'growth, wisdom, mentors, children, faith, and long-term support',
  Ketu: 'detachment, simplification, spiritual correction, and release',
  Mars: 'energy, courage, conflict handling, property, and decisive action',
  Mercury: 'speech, business, study, analysis, writing, and nervous-system pace',
  Moon: 'mind, emotions, home rhythm, public response, and daily stability',
  Rahu: 'ambition, foreign influence, technology, disruption, and unusual growth',
  Saturn: 'discipline, responsibility, delay, endurance, karma, and structure',
  Sun: 'authority, confidence, father figures, visibility, and leadership',
  Venus: 'relationships, comfort, money habits, art, vehicles, and desire',
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, health, confidence, and personal direction',
  2: 'money, speech, family values, and savings',
  3: 'effort, courage, siblings, writing, and self-made growth',
  4: 'home, property, mother, emotional peace, and education foundations',
  5: 'children, creativity, intelligence, romance, and merit',
  6: 'work pressure, debts, disease, service, competition, and discipline',
  7: 'marriage, partnerships, contracts, clients, and public dealings',
  8: 'sudden changes, research, inheritance, secrets, and transformation',
  9: 'fortune, dharma, father, teachers, travel, and blessings',
  10: 'career, status, authority, karma, and public responsibility',
  11: 'income, gains, networks, elder siblings, and fulfillment of desires',
  12: 'expenses, sleep, foreign lands, isolation, losses, and spiritual release',
};

const SLOW_PLANETS = ['Saturn', 'Jupiter', 'Rahu', 'Ketu'];

export function composeTransitGocharIntelligence(
  kundli?: KundliData,
  options: {
    depth?: TransitGocharInsightDepth;
    nowIso?: string;
  } = {},
): TransitGocharIntelligence {
  const depth = options.depth ?? 'FREE';
  const nowIso = options.nowIso ?? new Date().toISOString();

  if (!kundli) {
    return buildPendingGochar(depth, nowIso);
  }

  const transits = kundli.transits ?? [];
  const planetInsights = transits.map(transit =>
    buildPlanetInsight(kundli, transit, depth),
  );
  const topOpportunities = planetInsights
    .filter(item => item.weight === 'supportive')
    .sort(sortByPriority)
    .slice(0, depth === 'PREMIUM' ? 4 : 2);
  const cautionSignals = planetInsights
    .filter(item => item.weight === 'challenging' || item.weight === 'mixed')
    .sort(sortByPriority)
    .slice(0, depth === 'PREMIUM' ? 5 : 2);
  const dominantWeight = resolveDominantWeight(planetInsights);
  const visibleInsights =
    depth === 'PREMIUM'
      ? planetInsights.sort(sortByPriority)
      : planetInsights.sort(sortByPriority).slice(0, 5);
  const monthlyCards = buildMonthlyCards(kundli, planetInsights, nowIso, depth);

  return {
    askPrompt:
      'Analyze my current Gochar/transits with Lagna, Moon, dasha overlay, opportunities, cautions, and practical timing.',
    calculatedAt: transits[0]?.calculatedAt ?? nowIso,
    cautionSignals,
    ctas: buildGocharCtas(),
    dashaOverlay: buildDashaOverlay(kundli, planetInsights),
    depth,
    dominantWeight,
    evidence: buildGocharEvidence(kundli, planetInsights),
    limitations: buildLimitations(depth, transits.length > 0),
    monthlyCards,
    ownerName: kundli.birthDetails.name,
    planetInsights: visibleInsights,
    premiumUnlock:
      'Premium Gochar adds all-planet transit synthesis, 12-month planning cards, dasha overlap, remedies, and report-grade timing notes.',
    snapshotSummary: buildSnapshotSummary(kundli, planetInsights, dominantWeight),
    status: 'ready',
    subtitle:
      depth === 'PREMIUM'
        ? 'All-planet transit synthesis from Lagna, Moon, dasha overlay, and planning cards.'
        : 'A useful current Gochar snapshot with the biggest opportunities and caution signals.',
    title: `${kundli.birthDetails.name}'s Transit and Gochar reading`,
    topOpportunities,
  };
}

function buildPendingGochar(
  depth: TransitGocharInsightDepth,
  nowIso: string,
): TransitGocharIntelligence {
  const momentSky = buildMomentSkyPreview(nowIso);

  return {
    askPrompt:
      'Create my Kundli, then analyze my current Gochar/transits from Lagna and Moon.',
    calculatedAt: nowIso,
    cautionSignals: momentSky.cautionSignals,
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then analyze my Gochar/transits from Lagna and Moon.',
      },
    ],
    dashaOverlay: 'Pending until Kundli and dasha are calculated.',
    depth,
    dominantWeight: 'neutral',
    evidence: [
      {
        id: 'moment-sky-preview',
        interpretation:
          'This is the current sky preview. It becomes personal after a Kundli is saved and Predicta can anchor Gochar to Lagna, Moon, and dasha.',
        observation: 'No Kundli is selected yet, so Predicta is showing the sky for this moment.',
        title: 'Moment sky preview',
        weight: 'neutral',
      },
    ],
    limitations: ['Transit intelligence needs a calculated Kundli.'],
    monthlyCards: momentSky.monthlyCards,
    ownerName: 'You',
    planetInsights: momentSky.planetInsights,
    premiumUnlock:
      'Premium adds all-planet synthesis, 12-month cards, dasha overlap, and report-grade timing notes.',
    snapshotSummary:
      'Moment sky preview: if a child were born right now, Predicta would read this current planetary weather first, then personalize it through Lagna, Moon, and dasha after birth details are saved.',
    status: 'pending',
    subtitle:
      'Send birth details so Predicta can calculate Lagna, Moon, dasha, and current sidereal transits.',
    title: 'Transit and Gochar reading is waiting.',
    topOpportunities: momentSky.topOpportunities,
  };
}

function buildMomentSkyPreview(nowIso: string): {
  cautionSignals: TransitGocharPlanetInsight[];
  monthlyCards: TransitGocharMonthlyCard[];
  planetInsights: TransitGocharPlanetInsight[];
  topOpportunities: TransitGocharPlanetInsight[];
} {
  const month = new Date(nowIso).getMonth();
  const momentSign = [
    'Capricorn',
    'Aquarius',
    'Pisces',
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
  ][month];
  const momentInsights: TransitGocharPlanetInsight[] = [
    buildMomentPlanetInsight('Jupiter', momentSign, 9, 5, 'supportive'),
    buildMomentPlanetInsight('Saturn', momentSign, 6, 8, 'mixed'),
    buildMomentPlanetInsight('Rahu', momentSign, 11, 3, 'mixed'),
  ];

  return {
    cautionSignals: momentInsights.filter(item => item.weight !== 'supportive'),
    monthlyCards: Array.from({ length: 3 }, (_, index) => {
      const date = new Date(nowIso);
      date.setMonth(date.getMonth() + index);
      return {
        confidence: 'low',
        focusAreas: ['timing', 'career'],
        guidance:
          'Create a Kundli to personalize this through real Lagna, Moon, dasha, and houses.',
        id: `moment-gochar-month-${index + 1}`,
        monthLabel: date.toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
        planets: momentInsights.map(item => item.planet),
        summary:
          'A moment-sky planning card showing how Predicta turns planetary weather into simple planning.',
        title: 'Moment-sky planning',
      };
    }),
    planetInsights: momentInsights,
    topOpportunities: momentInsights.filter(item => item.weight === 'supportive'),
  };
}

function buildMomentPlanetInsight(
  planet: string,
  sign: string,
  houseFromLagna: number,
  houseFromMoon: number,
  weight: TransitGocharPlanetInsight['weight'],
): TransitGocharPlanetInsight {
  return {
    area: PLANET_AREAS[planet] ?? 'general',
    degree: 0,
    evidence: [
      {
        id: `moment-${planet.toLowerCase()}`,
        interpretation:
          'Current sky preview until a real Kundli exists. This shows the planetary weather Predicta will later personalize.',
        observation: `${planet} moment-sky signal in ${sign}.`,
        title: 'Moment sky',
        weight,
      },
    ],
    headline: `${planet} in ${sign}`,
    houseFromLagna,
    houseFromMoon,
    id: `moment-gochar-${planet.toLowerCase()}`,
    planet,
    practicalGuidance:
      'Treat this as current sky weather, not a personal prediction until your Kundli is saved.',
    retrograde: false,
    sign,
    simpleMeaning: `${planet} signal for ${PLANET_MEANINGS[planet]}.`,
    weight,
  };
}

function buildPlanetInsight(
  kundli: KundliData,
  transit: TransitInsight,
  depth: TransitGocharInsightDepth,
): TransitGocharPlanetInsight {
  const area = PLANET_AREAS[transit.planet] ?? 'general';
  const dashaMatch =
    kundli.dasha.current.mahadasha === transit.planet ||
    kundli.dasha.current.antardasha === transit.planet;
  const evidence = [
    {
      id: `gochar-${transit.planet.toLowerCase()}-position`,
      interpretation:
        'Lagna shows external life area; Moon shows subjective pressure or support.',
      observation: `${transit.planet} is in ${transit.sign}, house ${transit.houseFromLagna} from Lagna and house ${transit.houseFromMoon} from Moon${transit.retrograde ? ', retrograde' : ''}.`,
      title: `${transit.planet} Gochar`,
      weight: transit.weight,
    },
    {
      id: `gochar-${transit.planet.toLowerCase()}-dasha`,
      interpretation: dashaMatch
        ? 'This transit is louder because the same planet is active in dasha.'
        : 'This transit is background weather unless it strongly touches the question area.',
      observation: `Current dasha is ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
      title: 'Dasha overlay',
      weight: dashaMatch ? 'supportive' : 'neutral',
    },
  ] satisfies TransitGocharEvidenceItem[];

  return {
    area,
    degree: transit.degree,
    evidence,
    headline: `${transit.planet} in ${transit.sign}`,
    houseFromLagna: transit.houseFromLagna,
    houseFromMoon: transit.houseFromMoon,
    id: `gochar-${transit.planet.toLowerCase()}`,
    planet: transit.planet,
    practicalGuidance: buildPracticalGuidance(transit, dashaMatch),
    premiumDetail:
      depth === 'PREMIUM'
        ? `${transit.planet} should be cross-checked against D1 houses ${transit.houseFromLagna}/${transit.houseFromMoon}, dasha activation, Ashtakavarga strength, and the user's exact question area before prediction language.`
        : undefined,
    retrograde: transit.retrograde,
    sign: transit.sign,
    simpleMeaning: `${transit.planet} brings ${PLANET_MEANINGS[transit.planet] ?? 'its transit meaning'} through house ${transit.houseFromLagna} (${HOUSE_MEANINGS[transit.houseFromLagna]}) from Lagna and house ${transit.houseFromMoon} (${HOUSE_MEANINGS[transit.houseFromMoon]}) from Moon.`,
    weight: transit.weight,
  };
}

function buildMonthlyCards(
  kundli: KundliData,
  insights: TransitGocharPlanetInsight[],
  nowIso: string,
  depth: TransitGocharInsightDepth,
): TransitGocharMonthlyCard[] {
  const slow = insights.filter(item => SLOW_PLANETS.includes(item.planet));
  const months = depth === 'PREMIUM' ? 12 : 3;
  const now = new Date(nowIso);

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now);
    date.setMonth(now.getMonth() + index);
    const primary = slow[index % Math.max(slow.length, 1)] ?? insights[index % Math.max(insights.length, 1)];
    const support = insights.find(item => item.weight === 'supportive');
    const caution = insights.find(
      item => item.weight === 'challenging' || item.weight === 'mixed',
    );
    const focusAreas = [
      primary?.area ?? 'timing',
      support?.area,
      caution?.area,
    ].filter(Boolean) as JyotishArea[];

    return {
      confidence: depth === 'PREMIUM' ? 'medium' : 'low',
      focusAreas: [...new Set(focusAreas)].slice(0, 3),
      guidance: buildMonthlyGuidance(primary, support, caution),
      id: `gochar-month-${index + 1}`,
      monthLabel: date.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      }),
      planets: [
        primary?.planet,
        support?.planet,
        caution?.planet,
      ].filter(Boolean) as string[],
      summary: primary
        ? `${primary.planet} keeps ${HOUSE_MEANINGS[primary.houseFromLagna]} visible while ${HOUSE_MEANINGS[primary.houseFromMoon]} colors the inner experience.`
        : 'Transit planning appears after current transit data is available.',
      title: primary
        ? `${primary.planet} ${primary.weight} planning`
        : 'Transit planning pending',
    };
  });
}

function buildGocharEvidence(
  kundli: KundliData,
  insights: TransitGocharPlanetInsight[],
): TransitGocharEvidenceItem[] {
  const slow = insights.filter(item => SLOW_PLANETS.includes(item.planet));
  const supportive = insights.filter(item => item.weight === 'supportive');
  const caution = insights.filter(
    item => item.weight === 'challenging' || item.weight === 'mixed',
  );

  return [
    {
      id: 'gochar-lagna-moon-rule',
      interpretation:
        'Predicta reads visible events from Lagna and inner pressure/support from Moon.',
      observation: `${kundli.lagna} Lagna and ${kundli.moonSign} Moon are both used for Gochar.`,
      title: 'Lagna and Moon rule',
      weight: 'neutral',
    },
    {
      id: 'gochar-slow-planets',
      interpretation:
        'Slow planets carry the strongest medium-term planning value.',
      observation: `Slow transit anchors: ${slow.map(item => `${item.planet} in ${item.sign}`).join(', ') || 'pending'}.`,
      title: 'Slow-planet anchors',
      weight: slow.length ? 'mixed' : 'neutral',
    },
    {
      id: 'gochar-support-caution',
      interpretation:
        'Support and caution are both shown so the answer avoids forced positivity or fear.',
      observation: `${supportive.length} supportive transit(s), ${caution.length} caution/mixed transit(s).`,
      title: 'Support/caution balance',
      weight: caution.length > supportive.length ? 'mixed' : 'supportive',
    },
  ];
}

function buildSnapshotSummary(
  kundli: KundliData,
  insights: TransitGocharPlanetInsight[],
  dominantWeight: TransitGocharIntelligence['dominantWeight'],
): string {
  const strongest = insights[0];
  const caution = insights.find(
    item => item.weight === 'challenging' || item.weight === 'mixed',
  );

  if (!strongest) {
    return 'Transit snapshot is pending until current Gochar data is available.';
  }

  return `${kundli.birthDetails.name}'s Gochar currently reads as ${dominantWeight}. ${strongest.planet} in ${strongest.sign} is the first anchor; ${caution ? `${caution.planet} asks for extra pacing.` : 'support signals are cleaner than pressure signals.'}`;
}

function buildDashaOverlay(
  kundli: KundliData,
  insights: TransitGocharPlanetInsight[],
): string {
  const current = kundli.dasha.current;
  const matching = insights.filter(
    item =>
      item.planet === current.mahadasha || item.planet === current.antardasha,
  );

  if (matching.length) {
    return `Dasha overlay is active: ${matching
      .map(item => item.planet)
      .join(', ')} appears in both Gochar and ${current.mahadasha}/${current.antardasha} timing.`;
  }

  return `Current dasha is ${current.mahadasha}/${current.antardasha}; transits should be treated as weather unless they touch the user's question area.`;
}

function buildPracticalGuidance(
  transit: TransitInsight,
  dashaMatch: boolean,
): string {
  const pace =
    transit.weight === 'supportive'
      ? 'use this for steady progress'
      : transit.weight === 'challenging'
      ? 'slow decisions and confirm facts'
      : 'stay flexible and avoid extremes';
  const dasha = dashaMatch
    ? ' Because this planet is active in dasha, take the signal more seriously.'
    : '';

  return `${pace} around ${HOUSE_MEANINGS[transit.houseFromLagna]}; emotionally, watch ${HOUSE_MEANINGS[transit.houseFromMoon]}.${dasha}`;
}

function buildMonthlyGuidance(
  primary?: TransitGocharPlanetInsight,
  support?: TransitGocharPlanetInsight,
  caution?: TransitGocharPlanetInsight,
): string {
  if (!primary) {
    return 'Wait for current transit data before planning.';
  }

  return [
    `Lead with ${primary.planet}: ${primary.practicalGuidance}`,
    support ? `Use ${support.planet} for support.` : '',
    caution ? `Do not ignore ${caution.planet} caution.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildLimitations(
  depth: TransitGocharInsightDepth,
  hasTransits: boolean,
): string[] {
  const limitations = [
    'Gochar is timing weather, not a guaranteed event.',
    'Use D1, dasha, and the exact question area before making predictions.',
  ];

  if (!hasTransits) {
    limitations.push('Current transit details are not available yet.');
  }

  if (depth === 'FREE') {
    limitations.push(
      'Free insight shows the useful transit snapshot; Premium adds all-planet synthesis and 12-month planning cards.',
    );
  }

  return limitations;
}

function buildGocharCtas(): TransitGocharIntelligence['ctas'] {
  return [
    {
      id: 'ask-current-gochar',
      label: 'Explain Gochar',
      prompt:
        'Explain my current Gochar/transits from Lagna and Moon with practical guidance.',
    },
    {
      id: 'ask-monthly-transits',
      label: 'Monthly cards',
      prompt:
        'Show my next transit planning cards and explain what to do month by month.',
    },
    {
      id: 'ask-dasha-transit',
      label: 'Dasha overlay',
      prompt:
        'Combine my current dasha with Gochar and tell me what timing is actually active.',
    },
  ];
}

function resolveDominantWeight(
  insights: TransitGocharPlanetInsight[],
): TransitGocharIntelligence['dominantWeight'] {
  const counts = insights.reduce(
    (acc, item) => {
      acc[item.weight] += 1;
      return acc;
    },
    {
      challenging: 0,
      mixed: 0,
      neutral: 0,
      supportive: 0,
    },
  );

  if (counts.challenging >= 2) {
    return 'challenging';
  }
  if (counts.supportive > counts.mixed + counts.challenging) {
    return 'supportive';
  }
  if (counts.mixed || counts.challenging) {
    return 'mixed';
  }
  return 'neutral';
}

function sortByPriority(
  a: TransitGocharPlanetInsight,
  b: TransitGocharPlanetInsight,
): number {
  const planetPriority = ['Saturn', 'Jupiter', 'Rahu', 'Ketu', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  return planetPriority.indexOf(a.planet) - planetPriority.indexOf(b.planet);
}
