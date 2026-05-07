import type {
  BhavChalitCusp,
  BhavChalitPlanetPlacement,
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

  const bhav = kundli.bhavChalit;
  const kp = kundli.kp;
  const bhavReady = Boolean(bhav?.cusps.length);
  const kpReady = Boolean(kp?.cusps.length);
  const status: ChalitBhavKpFoundation['status'] =
    bhavReady && kpReady ? 'ready' : bhavReady || kpReady ? 'partial' : 'pending';
  const shifts = bhav?.shifts ?? [];
  const topSignificators = (kp?.significators ?? [])
    .slice()
    .sort((a, b) => strengthRank(a.strength) - strengthRank(b.strength))
    .slice(0, depth === 'PREMIUM' ? 9 : 4);

  return {
    askPrompt:
      'Explain my Chalit/Bhav chart and KP horoscope separately, with simple proof and free vs premium depth.',
    bhavChalit: {
      cusps: bhav?.cusps ?? [],
      evidence: buildBhavEvidence(kundli, shifts),
      freeInsight: bhavReady
        ? buildBhavFreeInsight(kundli, shifts)
        : 'Bhav Chalit will appear automatically once Predicta calculates exact house-cusp details from the saved birth profile.',
      limitations: bhav?.limitations ?? [
        'Predicta needs exact birth date, time, place, coordinates, and timezone to calculate degree-based house refinement.',
      ],
      premiumSynthesis:
        depth === 'PREMIUM' && bhavReady
          ? buildBhavPremiumSynthesis(kundli, shifts)
          : undefined,
      shifts,
      subtitle:
        'Bhav Chalit refines house placement by exact cusps. It does not replace D1 Rashi.',
      title: 'Bhav Chalit house refinement',
    },
    ctas: [
      {
        id: 'explain-chalit',
        label: 'Explain Chalit',
        prompt:
          'Explain my Bhav Chalit chart in simple words and tell me which planets shifted houses.',
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
        'KP is its own system: cusps, star lords, sub lords, significators, ruling planets, and event-focused judgment.',
      title: 'KP Horoscope foundation',
    },
    ownerName: kundli.birthDetails.name,
    premiumUnlock:
      'Premium expands Chalit/KP into cusp-by-cusp analysis, sub-lord event judgment, significator strength, dasha support, ruling-planet checks, and report-ready synthesis.',
    status,
  };
}

function buildPendingFoundation(
  depth: ChalitBhavKpInsightDepth,
): ChalitBhavKpFoundation {
  return {
    askPrompt:
      'Create my Kundli, then explain Chalit/Bhav and KP horoscope separately.',
    bhavChalit: {
      cusps: [],
      evidence: ['No active Kundli is available.'],
      freeInsight:
        'Bhav Chalit needs a calculated birth chart because it refines exact house cusps from birth time and place.',
      limitations: ['Create a Kundli first.'],
      shifts: [],
      subtitle: 'Pending until birth chart calculation.',
      title: 'Bhav Chalit house refinement',
    },
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then show Chalit/Bhav and KP horoscope.',
      },
    ],
    depth,
    kp: {
      cusps: [],
      evidence: ['No active Kundli is available.'],
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
  shifts: BhavChalitPlanetPlacement[],
): string {
  if (!shifts.length) {
    return `${kundli.birthDetails.name}'s Chalit layer does not show major planet house shifts from D1 Rashi. Read D1 houses normally, while still using exact cusps for fine judgment.`;
  }

  const top = shifts
    .slice(0, 3)
    .map(item => `${item.planet} moves from house ${item.rashiHouse} to ${item.bhavHouse}`)
    .join('; ');

  return `${kundli.birthDetails.name}'s Chalit layer shows house refinement: ${top}. This changes house emphasis, not the planet's sign.`;
}

function buildBhavPremiumSynthesis(
  kundli: KundliData,
  shifts: BhavChalitPlanetPlacement[],
): string {
  const current = kundli.dasha.current;
  const dashaShift = shifts.find(
    item =>
      item.planet === current.mahadasha || item.planet === current.antardasha,
  );

  return [
    shifts.length
      ? `Premium Chalit reads ${shifts.length} shifted planet(s), exact cusps, D1 sign dignity, and house delivery together.`
      : 'Premium Chalit confirms that sign and house emphasis are broadly aligned, so D1 house reading remains stable.',
    dashaShift
      ? `${dashaShift.planet} is active in dasha and shifts to Chalit house ${dashaShift.bhavHouse}, so that house deserves extra timing attention.`
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

  return [
    'KP is separate from the normal D1/Varga reading. It focuses on cusps, star lords, sub lords, and significators.',
    tenth
      ? `10th cusp sub lord: ${tenth.lordChain.subLord} for career/event judgment.`
      : '',
    seventh
      ? `7th cusp sub lord: ${seventh.lordChain.subLord} for relationship/partnership judgment.`
      : '',
    top
      ? `${top.planet} is a strong starter significator for houses ${top.signifiesHouses.join(', ')}.`
      : '',
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

  return [
    'Premium KP should judge the exact question through the relevant cusp sub lord, supporting significators, dasha period, and ruling planets.',
    tenth
      ? `Career lens: 10th cusp star/sub/sub-sub chain is ${tenth.lordChain.starLord}/${tenth.lordChain.subLord}/${tenth.lordChain.subSubLord}.`
      : '',
    eleventh
      ? `Fulfilment/gains lens: 11th cusp sub lord is ${eleventh.lordChain.subLord}.`
      : '',
    rulingPlanets
      ? `Ruling planets available: day ${rulingPlanets.dayLord}, Moon star ${rulingPlanets.moonStarLord}, Lagna sub ${rulingPlanets.lagnaSubLord}.`
      : '',
    `Top significators included: ${significators
      .slice(0, 5)
      .map(item => `${item.planet}(${item.signifiesHouses.join('/')})`)
      .join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildBhavEvidence(
  kundli: KundliData,
  shifts: BhavChalitPlanetPlacement[],
): string[] {
  return [
    `D1 root remains ${kundli.lagna} Lagna with ${kundli.moonSign} Moon.`,
    `Chalit shifts detected: ${shifts.length}.`,
    shifts[0]
      ? `${shifts[0].planet} is the first shift: D1 house ${shifts[0].rashiHouse} to Bhav house ${shifts[0].bhavHouse}.`
      : 'No major Chalit shift appears in this Kundli yet.',
  ];
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
