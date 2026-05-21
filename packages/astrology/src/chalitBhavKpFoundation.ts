import type {
  BhavChalitPlanetPlacement,
  ChalitPlanetPlacement,
  ChalitBhavKpFoundation,
  ChalitBhavKpInsightDepth,
  KPCusp,
  KPPlanet,
  KPRulingPlanets,
  KPSignificator,
  KundliData,
} from '@pridicta/types';

type Options = {
  depth?: ChalitBhavKpInsightDepth;
};

export function composeChalitBhavKpFoundation(
  kundli?: KundliData,
  options: Options = {},
): ChalitBhavKpFoundation {
  const depth = options.depth ?? 'FREE';

  if (!kundli) {
    return buildPendingFoundation(depth);
  }

  const chalit = kundli.chalit;
  const kp = kundli.kp;
  const bhavReady = Boolean(chalit?.cusps.length);
  const kpReady = Boolean(kp?.cusps.length);
  const status: ChalitBhavKpFoundation['status'] =
    bhavReady && kpReady ? 'ready' : bhavReady || kpReady ? 'partial' : 'pending';
  const shifts = chalit?.shifts ?? [];
  const topSignificators = (kp?.significators ?? [])
    .slice()
    .sort((a, b) => strengthRank(a.strength) - strengthRank(b.strength))
    .slice(0, depth === 'PREMIUM' ? 9 : 4);

  return {
    askPrompt:
      'Explain what my Parashari Chalit chart is changing in real life, and what my KP chart is saying about concrete outcomes, separately and in plain language.',
    bhavChalit: {
      cusps: chalit?.cusps ?? [],
      evidence: buildBhavEvidence(kundli, shifts),
      freeInsight: bhavReady
        ? buildBhavFreeInsight(kundli, shifts)
        : 'Chalit chart will appear automatically once Predicta calculates the Lagna-degree bhava boundaries from the saved birth profile.',
      limitations: chalit?.limitations ?? [
        'Predicta needs exact birth date, time, place, coordinates, and timezone to calculate degree-based house refinement.',
      ],
      premiumSynthesis:
        depth === 'PREMIUM' && bhavReady
          ? buildBhavPremiumSynthesis(kundli, shifts)
          : undefined,
      shifts,
      subtitle:
        'Chalit refines house delivery from the Lagna degree. It does not replace D1 Rashi.',
      title: 'Chalit chart house refinement',
    },
    ctas: [
      {
        id: 'explain-chalit',
        label: 'Explain Chalit',
        prompt:
          'Explain my Parashari Chalit chart in simple words and tell me which planets shifted houses.',
      },
      {
        id: 'open-kp-world',
        label: 'Open KP',
        prompt:
          'Open my KP horoscope and explain cusps, sub lords, significators, and ruling planets separately from Parashari.',
      },
      {
        id: 'kp-career',
        label: 'KP Career',
        prompt:
          'Using KP only, check career promise from the 10th cusp sub lord, significators, and dasha support.',
      },
    ],
    depth,
    kp: {
      cusps: kp?.cusps ?? [],
      evidence: buildKpEvidence(kp?.cusps, topSignificators, kp?.rulingPlanets),
      freeInsight: kpReady && kp
        ? buildKpFreeInsight(kp.cusps, topSignificators)
        : 'KP horoscope details will appear automatically once Predicta calculates KP cusps, star lords, and sub lords from the saved birth profile.',
      limitations: kp?.limitations ?? [
        'Predicta needs exact birth date, time, place, coordinates, and timezone to calculate KP details.',
      ],
      planets: kp?.planets ?? [],
      premiumSynthesis:
        depth === 'PREMIUM' && kpReady && kp
          ? buildKpPremiumSynthesis(kp.cusps, topSignificators, kp.rulingPlanets)
          : undefined,
      rulingPlanets: kp?.rulingPlanets,
      significators: topSignificators,
      subtitle:
        'KP is an event-judgement system. It tells you where concrete results move, which cusp decides the event, and which planets actually carry it.',
      title: 'What the KP layer is showing',
    },
    ownerName: kundli.birthDetails.name,
    premiumUnlock:
      'Premium expands Parashari Chalit and KP separately: Chalit house delivery, KP event judgement, cusp and sub-lord logic, significator strength, dasha support, ruling-planet checks, and report-ready synthesis.',
    status,
  };
}

function buildPendingFoundation(
  depth: ChalitBhavKpInsightDepth,
): ChalitBhavKpFoundation {
  return {
    askPrompt:
      'Create my Kundli, then explain Parashari Chalit and KP horoscope separately.',
    bhavChalit: {
      cusps: [],
      evidence: ['No Kundli is selected yet.'],
      freeInsight:
        'Chalit needs a calculated birth chart because it refines house delivery from the Lagna degree.',
      limitations: ['Create a Kundli first.'],
      shifts: [],
      subtitle: 'Pending until birth chart calculation.',
      title: 'Chalit chart house refinement',
    },
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then show Chalit and KP horoscope separately.',
      },
    ],
    depth,
    kp: {
      cusps: [],
      evidence: ['No Kundli is selected yet.'],
      freeInsight:
        'KP needs precise cusps, star lords, sub lords, and ruling planets, so it starts after Kundli calculation.',
      limitations: ['Create a Kundli first.'],
      planets: [],
      significators: [],
      subtitle: 'Pending until birth chart calculation.',
      title: 'KP Horoscope foundation',
    },
    ownerName: 'You',
    premiumUnlock:
      'Premium will add detailed cusp and significator analysis once a Kundli exists.',
    status: 'pending',
  };
}

function buildBhavFreeInsight(
  kundli: KundliData,
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
): string {
  if (!shifts.length) {
    return `${kundli.birthDetails.name}'s Chalit layer does not show major planet house shifts from D1 Rashi. Read D1 houses normally, while still using Lagna-degree bhavas for fine judgment.`;
  }

  const top = shifts
    .slice(0, 3)
    .map(item => `${item.planet} moves from house ${item.rashiHouse} to ${targetHouse(item)}`)
    .join('; ');

  return `${kundli.birthDetails.name}'s Chalit layer shows house refinement: ${top}. This changes house emphasis, not the planet's sign.`;
}

function buildBhavPremiumSynthesis(
  kundli: KundliData,
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
): string {
  const current = kundli.dasha.current;
  const dashaShift = shifts.find(
    item =>
      item.planet === current.mahadasha || item.planet === current.antardasha,
  );

  return [
    shifts.length
      ? `Premium Chalit reads ${shifts.length} shifted planet(s), Lagna-degree bhavas, D1 sign dignity, and house delivery together.`
      : 'Premium Chalit confirms that sign and house emphasis are broadly aligned, so D1 house reading remains stable.',
    dashaShift
      ? `${dashaShift.planet} is active in dasha and shifts to Chalit house ${targetHouse(dashaShift)}, so that house deserves extra timing attention.`
      : `Current dasha ${current.mahadasha}/${current.antardasha} does not show a major Chalit shift from the available shift list.`,
  ].join(' ');
}

function buildKpFreeInsight(
  cusps: KPCusp[],
  significators: KPSignificator[],
): string {
  const tenth = cusps.find(cusp => cusp.house === 10);
  const seventh = cusps.find(cusp => cusp.house === 7);
  const top = significators[0];
  const topAreas = top
    ? uniqueHouseAreas(top.signifiesHouses).slice(0, 3).join(', ')
    : undefined;

  return [
    topAreas
      ? `KP is saying that concrete results are currently more likely to move through ${topAreas}.`
      : 'KP is saying that this chart should be used for a concrete event question, not broad personality reading.',
    top
      ? `${top.planet} looks like the clearest event carrier from the current significator list.`
      : '',
    tenth
      ? `Career judgement starts from the 10th cusp sub lord ${tenth.lordChain.subLord}.`
      : '',
    seventh
      ? `Relationship judgement starts from the 7th cusp sub lord ${seventh.lordChain.subLord}.`
      : '',
    'KP becomes most useful when the user asks one exact event question and lets the houses, cusp sub lord, significators, and timing answer it.',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildKpPremiumSynthesis(
  cusps: KPCusp[],
  significators: KPSignificator[],
  rulingPlanets?: KPRulingPlanets,
): string {
  const tenth = cusps.find(cusp => cusp.house === 10);
  const eleventh = cusps.find(cusp => cusp.house === 11);
  const top = significators[0];

  return [
    top
      ? `Premium KP reads the full event chain from ${top.planet} and the connected houses ${top.signifiesHouses.join(', ')} before making timing claims.`
      : 'Premium KP judges the exact event through the relevant cusp sub lord, supporting significators, dasha period, and ruling planets.',
    tenth
      ? `Career lens: the 10th cusp star/sub/sub-sub chain is ${tenth.lordChain.starLord}/${tenth.lordChain.subLord}/${tenth.lordChain.subSubLord}.`
      : '',
    eleventh
      ? `Fulfilment and gains are checked through the 11th cusp sub lord ${eleventh.lordChain.subLord}.`
      : '',
    rulingPlanets
      ? `Ruling planets keep the timing grounded: day ${rulingPlanets.dayLord}, Moon star ${rulingPlanets.moonStarLord}, Lagna sub ${rulingPlanets.lagnaSubLord}.`
      : '',
    `Top event carriers included: ${significators
      .slice(0, 5)
      .map(item => `${item.planet}(${item.signifiesHouses.join('/')})`)
      .join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

function uniqueHouseAreas(houses: number[]): string[] {
  return Array.from(
    new Set(
      houses
        .map(house => HOUSE_MEANINGS[house])
        .filter(Boolean),
    ),
  );
}

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'self, identity, and visible direction',
  2: 'money, family, and stored value',
  3: 'effort, movement, and initiative',
  4: 'home, stability, and property',
  5: 'creativity, merit, and speculation',
  6: 'work, service, and pressure handling',
  7: 'partnership, marriage, and public exchange',
  8: 'sudden change, inheritance, and hidden pressure',
  9: 'fortune, dharma, and blessings',
  10: 'career, authority, and public role',
  11: 'gains, fulfilment, and network support',
  12: 'expense, release, and retreat',
};

function buildBhavEvidence(
  kundli: KundliData,
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
): string[] {
  return [
    `D1 root remains ${kundli.lagna} Lagna with ${kundli.moonSign} Moon.`,
    `Chalit shifts detected: ${shifts.length}.`,
    shifts[0]
      ? `${shifts[0].planet} is the first shift: D1 house ${shifts[0].rashiHouse} to Chalit house ${targetHouse(shifts[0])}.`
      : 'No major Chalit shift appears in this Kundli yet.',
  ];
}

function targetHouse(
  item: BhavChalitPlanetPlacement | ChalitPlanetPlacement,
): number {
  return 'chalitHouse' in item ? item.chalitHouse : item.bhavHouse;
}

function buildKpEvidence(
  cusps: KPCusp[] = [],
  significators: KPSignificator[],
  rulingPlanets?: KPRulingPlanets,
): string[] {
  const tenth = cusps.find(cusp => cusp.house === 10);

  return [
    `KP cusps available: ${cusps.length}.`,
    tenth
      ? `10th cusp chain: ${tenth.lordChain.signLord}/${tenth.lordChain.starLord}/${tenth.lordChain.subLord}.`
      : '10th cusp chain is not clear yet.',
    `Significators included: ${significators.length}.`,
    rulingPlanets
      ? `Ruling planets include day lord ${rulingPlanets.dayLord} and Lagna sub lord ${rulingPlanets.lagnaSubLord}.`
      : 'Ruling planets are not clear yet.',
  ];
}

function strengthRank(strength: KPSignificator['strength']): number {
  return { A: 0, B: 1, C: 2, D: 3 }[strength];
}
