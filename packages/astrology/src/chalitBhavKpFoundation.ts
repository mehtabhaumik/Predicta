import type {
  BhavChalitPlanetPlacement,
  ChalitPlanetPlacement,
  ChalitBhavKpFoundation,
  ChalitBhavKpInsightDepth,
  KpEventJudgement,
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
      activeLifeAreas: buildBhavActiveLifeAreas(shifts),
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
      practicalCorrection: buildBhavPracticalCorrection(shifts),
      shiftMeanings: buildBhavShiftMeanings(shifts),
      shifts,
      subtitle:
        'Chalit refines house delivery from the Lagna degree. It does not replace D1 Rashi.',
      title: 'Chalit chart house refinement',
      whatChanges: buildBhavWhatChanges(kundli, shifts),
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
      digest: buildKpDigest({
        activeKundliId: kundli.id,
        depth,
        eventQuestion: 'General KP outcome reading from the active birth profile; exact event timing can be narrowed later.',
        relevantHouses: buildRelevantHouses(topSignificators),
        judgement: buildKpEventJudgement(kp?.cusps ?? [], topSignificators, kp?.rulingPlanets),
        kpReady,
        mainCusps: [10, 11].filter(house => kp?.cusps.some(cusp => cusp.house === house)),
      }),
      eventJudgement: buildKpEventJudgement(kp?.cusps ?? [], topSignificators, kp?.rulingPlanets),
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
      activeLifeAreas: [],
      cusps: [],
      evidence: ['No Kundli is selected yet.'],
      freeInsight:
        'Chalit needs a calculated birth chart because it refines house delivery from the Lagna degree.',
      limitations: ['Create a Kundli first.'],
      practicalCorrection:
        'Create the Kundli first, then read Chalit as a lived-delivery refinement after D1.',
      shiftMeanings: [],
      shifts: [],
      subtitle: 'Pending until birth chart calculation.',
      title: 'Chalit chart house refinement',
      whatChanges:
        'Nothing can be compared yet because Chalit needs a calculated D1 and degree-based bhava boundaries.',
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
      eventJudgement: buildPendingKpEventJudgement(),
      freeInsight:
        'KP outcome support appears after Kundli calculation prepares precise cusps, star lords, sub lords, and ruling planets.',
      limitations: ['Create a Kundli first.'],
      planets: [],
      digest: buildKpDigest({
        depth,
        eventQuestion: 'Create a Kundli first, then KP can read visible outcome support and narrow timing when needed.',
        judgement: buildPendingKpEventJudgement(),
        kpReady: false,
        mainCusps: [],
        relevantHouses: [],
      }),
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
    return `${kundli.birthDetails.name}'s Chalit layer does not show major planet house shifts from D1 Rashi. The lived house story is close to the life-foundation chart, so read D1 normally and use Chalit for fine judgment instead of dramatic reinterpretation.`;
  }

  const top = shifts
    .slice(0, 3)
    .map(
      item =>
        `${item.planet} moves lived delivery from ${HOUSE_MEANINGS[item.rashiHouse]} to ${HOUSE_MEANINGS[targetHouse(item)]}`,
    )
    .join('; ');

  return `${kundli.birthDetails.name}'s Chalit layer shows lived house refinement: ${top}. This changes where the result is experienced, not the planet's sign or the root D1 promise.`;
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

function buildBhavWhatChanges(
  kundli: KundliData,
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
): string {
  if (!shifts.length) {
    return `${kundli.birthDetails.name}'s Chalit chart is saying the lived house delivery is broadly aligned with D1, so the root life pattern stays stable and Chalit mainly confirms fine timing and emphasis.`;
  }

  const activeAreas = buildBhavActiveLifeAreas(shifts).slice(0, 3);

  return `${kundli.birthDetails.name}'s Chalit chart is saying some D1 promises are delivered through different lived houses. The areas becoming louder in real life are ${activeAreas.join('; ')}, while the planet signs remain unchanged.`;
}

function buildBhavActiveLifeAreas(
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
): string[] {
  return Array.from(
    new Set(
      shifts
        .map(item => HOUSE_MEANINGS[targetHouse(item)])
        .filter(Boolean),
    ),
  );
}

function buildBhavPracticalCorrection(
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
): string {
  if (!shifts.length) {
    return 'Do not over-correct the chart. Use D1 as the main reading and Chalit only for subtle lived emphasis.';
  }

  const first = shifts[0];
  const target = HOUSE_MEANINGS[targetHouse(first)];

  return `When judging results, do not stop at the D1 house label. Check whether ${target} is where life is actually asking for attention, decisions, and maturity.`;
}

function buildBhavShiftMeanings(
  shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>,
) {
  return shifts.map(item => {
    const toHouse = targetHouse(item);
    const fromArea = HOUSE_MEANINGS[item.rashiHouse];
    const toArea = HOUSE_MEANINGS[toHouse];

    return {
      awareness: `${item.planet} should be interpreted through ${toArea} in lived delivery, while its D1 sign dignity and root promise remain the anchor.`,
      fromArea,
      fromHouse: item.rashiHouse,
      meaning: `${item.planet} may feel less like a pure ${fromArea} story and more like a ${toArea} responsibility or opportunity in daily life.`,
      planet: item.planet,
      toArea,
      toHouse,
    };
  });
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
    'KP becomes most useful when the prediction is tied to visible event support, timing signals, and practical action.',
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

function buildKpEventJudgement(
  cusps: KPCusp[],
  significators: KPSignificator[],
  rulingPlanets?: KPRulingPlanets,
): KpEventJudgement {
  const tenth = cusps.find(cusp => cusp.house === 10);
  const eleventh = cusps.find(cusp => cusp.house === 11);
  const topCarrier = significators[0];
  const supportCarrier = significators[1];
  const blocker = significators.find(item => item.strength === 'D') ?? significators.at(-1);
  const relevantAreas = topCarrier
    ? uniqueHouseAreas(topCarrier.signifiesHouses).slice(0, 3)
    : [];
  const confidence: KpEventJudgement['confidence'] =
    cusps.length >= 12 && significators.length >= 4 && rulingPlanets
      ? 'clear'
      : cusps.length || significators.length
        ? 'partial'
        : 'uncertain';
  const verdictLabel: KpEventJudgement['verdictLabel'] =
    confidence === 'clear'
      ? 'Mixed promise'
      : confidence === 'partial'
        ? 'Needs more clarity'
        : 'Not enough proof';

  return {
    confidence,
    decisionPoint: tenth
      ? `The decision point is the relevant cusp sub lord; for career-style events, the 10th cusp sub lord is ${tenth.lordChain.subLord}.`
      : 'The decision point becomes clear once the relevant cusp sub lord is available.',
    eventCarriers: [
      topCarrier
        ? {
            planet: topCarrier.planet,
            reason: `${topCarrier.planet} carries houses ${topCarrier.signifiesHouses.join(', ') || 'pending'} with ${topCarrier.strength} strength.`,
            role: 'carrier' as const,
          }
        : undefined,
      supportCarrier
        ? {
            planet: supportCarrier.planet,
            reason: `${supportCarrier.planet} supports the event chain through houses ${supportCarrier.signifiesHouses.join(', ') || 'pending'}.`,
            role: 'supporter' as const,
          }
        : undefined,
      blocker && blocker !== topCarrier && blocker !== supportCarrier
        ? {
            planet: blocker.planet,
            reason: `${blocker.planet} needs caution because its support is weaker or more indirect in the current significator list.`,
            role: 'blocker' as const,
          }
        : undefined,
    ].filter((item): item is KpEventJudgement['eventCarriers'][number] => Boolean(item)),
    mainBlock: blocker
      ? `${blocker.planet} is the caution point: do not treat this as a final promise until the exact event houses and timing support agree.`
      : 'The main block is not a negative fate signal; it is missing proof for the exact event question.',
    nextQuestion:
      'If a real decision is in front of the user, KP can narrow the prediction with a specific event and time window.',
    plainLanguage: topCarrier
      ? `KP is not giving a personality reading here. It is saying the event should be judged through ${relevantAreas.join(', ') || 'the houses carried by the main significator'}, with ${topCarrier.planet} as the clearest carrier and cusp sub-lord proof before timing.`
      : 'KP is reading the strongest visible outcome signals now; a future exact event question can narrow timing later.',
    promise: topCarrier
      ? `The promise is visible through ${topCarrier.planet} and the houses it carries: ${topCarrier.signifiesHouses.join(', ') || 'pending'}.`
      : 'The promise is pending until significators are available.',
    proofPath: [
      '1. Start from the visible outcome area or exact event if one is available.',
      `2. Check the event houses${tenth ? ` and the relevant cusp sub lord (${tenth.lordChain.subLord} shown on the 10th cusp for career-style events)` : ''}.`,
      `3. Read event carriers${topCarrier ? `, starting with ${topCarrier.planet}` : ''}.`,
      rulingPlanets
        ? `4. Confirm timing with ruling planets: day ${rulingPlanets.dayLord}, Moon star ${rulingPlanets.moonStarLord}, Lagna sub ${rulingPlanets.lagnaSubLord}.`
        : '4. Confirm timing only after ruling planets and dasha support are available.',
    ],
    eventVerdictCompass: {
      block: blocker
        ? `${blocker.planet} is the caution or delay signal.`
        : 'Block is pending until the event proof is sharper.',
      confidence,
      promise: topCarrier
        ? `${topCarrier.planet} carries the clearest promise.`
        : 'Promise is pending.',
      timing: rulingPlanets ? 'Timing support is partial and usable.' : 'Timing is pending.',
    },
    timingReadiness: rulingPlanets
      ? `Timing support is ${eleventh ? 'usable but still event-specific' : 'partial'} because ruling planets are available; final timing still needs the selected event and dasha/transit trigger.`
      : 'Timing is not ready for a strong statement yet because ruling planets are missing.',
    timingReadinessState: rulingPlanets ? 'partial' : 'pending',
    verdictLabel,
    questionClarityState: 'needs-exact-question',
    questionToProofPath: [
      'Event question',
      'Relevant houses',
      'Main cusp and sub lord',
      'Event carriers',
      'Timing support',
    ],
  };
}

function buildPendingKpEventJudgement(): KpEventJudgement {
  return {
    confidence: 'uncertain',
    decisionPoint: 'Create a Kundli first so KP can calculate cusps and sub lords.',
    eventCarriers: [],
    mainBlock: 'No KP proof exists yet.',
    nextQuestion: 'Create the Kundli, then KP can read visible outcome support and narrow timing when needed.',
    plainLanguage:
      'KP can read visible outcome support after calculation prepares cusps, support markers, event carriers, timing signals, and dasha support.',
    promise: 'Pending until KP cusps and significators are calculated.',
    proofPath: [
      '1. Create a Kundli.',
      '2. Let Predicta prepare KP cusps and significators.',
      '3. Narrow into a concrete event only when the user has a real decision or time window.',
    ],
    eventVerdictCompass: {
      block: 'No KP proof exists yet.',
      confidence: 'uncertain',
      promise: 'Pending until KP cusps and significators are calculated.',
      timing: 'Pending until ruling planets and dasha support are available.',
    },
    timingReadiness: 'Pending until KP ruling planets are calculated.',
    timingReadinessState: 'pending',
    verdictLabel: 'Not enough proof',
    questionClarityState: 'pending',
    questionToProofPath: [
      'Create Kundli',
      'Prepare KP cusps',
      'Ask exact event question',
      'Judge carriers and timing',
    ],
  };
}

function buildKpDigest({
  activeKundliId,
  depth,
  eventQuestion,
  judgement,
  kpReady,
  mainCusps,
  relevantHouses,
}: {
  activeKundliId?: string;
  depth: ChalitBhavKpInsightDepth;
  eventQuestion: string;
  judgement: KpEventJudgement;
  kpReady: boolean;
  mainCusps: number[];
  relevantHouses: number[];
}): ChalitBhavKpFoundation['kp']['digest'] {
  return {
    activeKundliId,
    blockers: judgement.eventCarriers
      .filter(item => item.role === 'blocker')
      .map(item => item.planet),
    currentVerdict: judgement.verdictLabel,
    depthAvailable: depth,
    eventCarriers: judgement.eventCarriers,
    exactUserEventQuestion: eventQuestion,
    latestReportSummary:
      'KP report leads with event answer, timing readiness, confidence, practical next step, and keeps full technical proof in a Proof Appendix.',
    mainCusps,
    promiseBlockTimingConfidenceSummary: `${judgement.eventVerdictCompass.promise} ${judgement.eventVerdictCompass.block} ${judgement.eventVerdictCompass.timing} Confidence: ${judgement.eventVerdictCompass.confidence}.`,
    proofAvailability: kpReady ? 'ready' : relevantHouses.length ? 'partial' : 'pending',
    questionClarityState: judgement.questionClarityState,
    relevantHouses,
    selectedEventCategory: 'general',
    timingReadiness: judgement.timingReadiness,
  };
}

function buildRelevantHouses(significators: KPSignificator[]): number[] {
  return Array.from(
    new Set(
      significators
        .flatMap(item => item.signifiesHouses)
        .filter(house => house >= 1 && house <= 12),
    ),
  ).slice(0, 8);
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
