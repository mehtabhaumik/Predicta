import type {
  DashaEvidenceItem,
  DashaEvidenceWeight,
  DashaWindowInsight,
  KundliData,
  MahadashaInsightDepth,
  MahadashaIntelligence,
  PlanetPosition,
} from '@pridicta/types';

const DASHA_ORDER = [
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

const DASHA_YEARS: Record<string, number> = {
  Jupiter: 16,
  Ketu: 7,
  Mars: 7,
  Mercury: 17,
  Moon: 10,
  Rahu: 18,
  Saturn: 19,
  Sun: 6,
  Venus: 20,
};

const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const PRESSURE_PLANETS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun']);

const PLANET_THEMES: Record<string, string> = {
  Jupiter: 'wisdom, protection, teachers, children, growth, and long-term grace',
  Ketu: 'detachment, spiritual correction, past-life residue, and simplification',
  Mars: 'courage, conflict handling, property, discipline, and decisive action',
  Mercury: 'skills, speech, business, learning, analysis, and nervous-system pace',
  Moon: 'emotions, home, mother, mind, public support, and daily stability',
  Rahu: 'ambition, foreign influence, technology, unusual growth, and strong desires',
  Saturn: 'karma, duty, delay, endurance, structure, and mature responsibility',
  Sun: 'authority, father figures, visibility, confidence, and leadership',
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

export function composeMahadashaIntelligence(
  kundli?: KundliData,
  options: {
    depth?: MahadashaInsightDepth;
    nowIso?: string;
  } = {},
): MahadashaIntelligence {
  const depth = options.depth ?? 'FREE';
  const nowIso = options.nowIso ?? new Date().toISOString();

  if (!kundli) {
    return buildPendingMahadasha(depth);
  }

  const current = kundli.dasha.current;
  const mahaPlanet = findPlanet(kundli, current.mahadasha);
  const antarPlanet = findPlanet(kundli, current.antardasha);
  const evidence = buildCurrentEvidence(kundli, mahaPlanet, antarPlanet);
  const confidence = resolveConfidence(kundli, mahaPlanet, antarPlanet);
  const currentTheme = buildCurrentTheme(current.mahadasha, current.antardasha);
  const currentMeaning = buildCurrentMeaning(kundli, mahaPlanet, antarPlanet);
  const antardashas = buildAntardashaWindows(kundli, nowIso, depth);
  const pratyantardashas = buildPratyantardashaWindows(
    kundli,
    nowIso,
    depth,
  );
  const mahadashas = kundli.dasha.timeline.map(item =>
    buildWindowInsight({
      depth,
      endDate: item.endDate,
      evidence: buildPlanetEvidence(kundli, item.mahadasha, 'mahadasha'),
      id: `mahadasha-${item.mahadasha.toLowerCase()}`,
      lord: item.mahadasha,
      nowIso,
      startDate: item.startDate,
      title: `${item.mahadasha} Mahadasha`,
      windowKind: 'Mahadasha',
    }),
  );
  const timingWindows = [
    ...antardashas.filter(item => item.status === 'current'),
    ...antardashas.filter(item => item.status === 'upcoming').slice(0, 3),
    ...pratyantardashas.filter(item => item.status === 'current').slice(0, 1),
  ];

  return {
    askPrompt: `Analyze my current ${current.mahadasha} Mahadasha and ${current.antardasha} Antardasha with chart proof, timing, remedies, and practical guidance.`,
    antardashas,
    ctas: buildDashaCtas(current, depth),
    current: {
      antardasha: current.antardasha,
      confidence,
      endDate: current.endDate,
      evidence,
      freeInsight: buildFreeCurrentInsight(
        kundli,
        current.mahadasha,
        current.antardasha,
        mahaPlanet,
        antarPlanet,
      ),
      mahadasha: current.mahadasha,
      premiumSynthesis:
        depth === 'PREMIUM'
          ? buildPremiumCurrentSynthesis(kundli, mahaPlanet, antarPlanet)
          : undefined,
      simpleMeaning: currentMeaning,
      startDate: current.startDate,
      theme: currentTheme,
    },
    depth,
    limitations: buildLimitations(kundli, depth),
    mahadashas,
    ownerName: kundli.birthDetails.name,
    pratyantardashas,
    premiumUnlock:
      'Premium deepens this into Antardasha/Pratyantardasha timing, dasha plus transit overlap, remedies, and report-ready evidence tables.',
    remedies: buildDashaRemedies(kundli, current.mahadasha, mahaPlanet),
    status: 'ready',
    subtitle:
      depth === 'PREMIUM'
        ? 'Astrologer-grade timing with Mahadasha, Antardasha, Pratyantardasha, chart proof, and practical windows.'
        : 'Useful timing insight from your current Mahadasha and Antardasha without hiding the core dasha map.',
    timingWindows,
    title: `${kundli.birthDetails.name}'s Mahadasha intelligence`,
  };
}

function buildPendingMahadasha(
  depth: MahadashaInsightDepth,
): MahadashaIntelligence {
  return {
    antardashas: [],
    askPrompt:
      'Create my Kundli, then analyze my current Mahadasha with timing and chart proof.',
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then explain my current Mahadasha and Antardasha.',
      },
    ],
    current: {
      antardasha: 'Pending',
      confidence: 'low',
      endDate: '',
      evidence: [],
      freeInsight:
        'Create a Kundli to calculate the Vimshottari timing sequence from the Moon nakshatra.',
      mahadasha: 'Pending',
      simpleMeaning:
        'Mahadasha is the big life chapter. Antardasha is the active sub-chapter inside it.',
      startDate: '',
      theme: 'Waiting for birth details',
    },
    depth,
    limitations: ['Mahadasha requires a calculated Kundli.'],
    mahadashas: [],
    ownerName: 'You',
    pratyantardashas: [],
    premiumUnlock:
      'Premium deepens Mahadasha into sub-periods, timing windows, remedies, and report-ready proof.',
    remedies: [],
    status: 'pending',
    subtitle:
      'Send date of birth, birth time, and birth place so Predicta can calculate the dasha sequence.',
    timingWindows: [],
    title: 'Mahadasha intelligence is waiting.',
  };
}

function buildAntardashaWindows(
  kundli: KundliData,
  nowIso: string,
  depth: MahadashaInsightDepth,
): DashaWindowInsight[] {
  const currentMaha =
    kundli.dasha.timeline.find(
      item => item.mahadasha === kundli.dasha.current.mahadasha,
    ) ?? kundli.dasha.timeline[0];

  return (currentMaha?.antardashas ?? []).map(item =>
    buildWindowInsight({
      depth,
      endDate: item.endDate,
      evidence: buildPlanetEvidence(kundli, item.antardasha, 'antardasha'),
      id: `antardasha-${item.antardasha.toLowerCase()}-${item.startDate}`,
      lord: item.antardasha,
      nowIso,
      startDate: item.startDate,
      title: `${item.antardasha} Antardasha`,
      windowKind: 'Antardasha',
    }),
  );
}

function buildPratyantardashaWindows(
  kundli: KundliData,
  nowIso: string,
  depth: MahadashaInsightDepth,
): DashaWindowInsight[] {
  const current = kundli.dasha.current;
  const start = parseTime(current.startDate);
  const end = parseTime(current.endDate);

  if (!start || !end || end <= start) {
    return [];
  }

  const totalMs = end - start;
  let cursor = start;
  const order = rotateDashaOrder(current.antardasha);

  return order.map((lord, index) => {
    const share = DASHA_YEARS[lord] / 120;
    const next =
      index === order.length - 1
        ? end
        : Math.min(end, cursor + totalMs * share);
    const insight = buildWindowInsight({
      depth,
      endDate: new Date(next).toISOString(),
      evidence: [
        {
          id: `pratyantar-derived-${lord.toLowerCase()}`,
          interpretation:
            'This is a deterministic sub-period estimate from Vimshottari proportions inside the current Antardasha.',
          observation: `${lord} Pratyantardasha is derived inside ${current.antardasha} Antardasha.`,
          title: 'Derived Pratyantardasha',
          weight: 'neutral',
        },
        ...buildPlanetEvidence(kundli, lord, 'pratyantardasha').slice(0, 2),
      ],
      id: `pratyantardasha-${lord.toLowerCase()}-${new Date(cursor).toISOString()}`,
      lord,
      nowIso,
      startDate: new Date(cursor).toISOString(),
      title: `${lord} Pratyantardasha`,
      windowKind: 'Pratyantardasha',
    });

    cursor = next;
    return insight;
  });
}

function buildWindowInsight({
  depth,
  endDate,
  evidence,
  id,
  lord,
  nowIso,
  startDate,
  title,
  windowKind,
}: {
  depth: MahadashaInsightDepth;
  endDate: string;
  evidence: DashaEvidenceItem[];
  id: string;
  lord: string;
  nowIso: string;
  startDate: string;
  title: string;
  windowKind: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha';
}): DashaWindowInsight {
  const status = resolveWindowStatus(startDate, endDate, nowIso);
  const focusAreas = inferFocusAreasFromEvidence(evidence, lord);

  return {
    endDate,
    evidence,
    focusAreas,
    id,
    practicalGuidance: buildPracticalGuidance(lord, focusAreas, status),
    premiumDetail:
      depth === 'PREMIUM'
        ? `${title} should be read by combining the lord's natal house, sign dignity, active transits, Ashtakavarga support, and the topic-specific divisional chart.`
        : undefined,
    startDate,
    status,
    theme: `${windowKind} of ${lord}: ${PLANET_THEMES[lord] ?? 'period-specific karma and focus'}.`,
    timing: `${formatDate(startDate)} to ${formatDate(endDate)}`,
    title,
  };
}

function buildCurrentEvidence(
  kundli: KundliData,
  mahaPlanet?: PlanetPosition,
  antarPlanet?: PlanetPosition,
): DashaEvidenceItem[] {
  return [
    {
      id: 'current-period',
      interpretation:
        'The Mahadasha sets the big life chapter, while Antardasha shows the active delivery channel.',
      observation: `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} runs until ${formatDate(kundli.dasha.current.endDate)}.`,
      title: 'Current Vimshottari period',
      weight: 'neutral',
    },
    mahaPlanet
      ? planetPlacementEvidence(mahaPlanet, 'Mahadasha lord')
      : missingPlanetEvidence(kundli.dasha.current.mahadasha, 'Mahadasha lord'),
    antarPlanet
      ? planetPlacementEvidence(antarPlanet, 'Antardasha lord')
      : missingPlanetEvidence(kundli.dasha.current.antardasha, 'Antardasha lord'),
    {
      id: 'ashtakavarga-support',
      interpretation:
        'Strong houses show easier delivery; weak houses need discipline and realistic pacing.',
      observation: `Strong houses: ${kundli.ashtakavarga.strongestHouses
        .slice(0, 3)
        .join(', ')}. Pressure houses: ${kundli.ashtakavarga.weakestHouses
        .slice(0, 3)
        .join(', ')}.`,
      title: 'Ashtakavarga support',
      weight: 'mixed',
    },
  ];
}

function buildPlanetEvidence(
  kundli: KundliData,
  lord: string,
  source: string,
): DashaEvidenceItem[] {
  const planet = findPlanet(kundli, lord);

  if (!planet) {
    return [missingPlanetEvidence(lord, source)];
  }

  const house = kundli.houses.find(item => item.house === planet.house);

  return [
    planetPlacementEvidence(planet, source),
    {
      id: `${source}-${lord.toLowerCase()}-house-lord`,
      interpretation: house
        ? `House ${planet.house} connects this period to ${HOUSE_MEANINGS[planet.house]}. Its lord ${house.lord} adds the delivery style.`
        : `House ${planet.house} is relevant, but house-lord detail is unavailable.`,
      observation: house
        ? `${lord} is in house ${planet.house}; that house sign is ${house.sign} and lord is ${house.lord}.`
        : `${lord} is in house ${planet.house}.`,
      title: 'House channel',
      weight: classifyWeight(planet.name, planet.house),
    },
  ];
}

function planetPlacementEvidence(
  planet: PlanetPosition,
  titlePrefix: string,
): DashaEvidenceItem {
  return {
    id: `${titlePrefix.toLowerCase().replace(/\s+/g, '-')}-${planet.name.toLowerCase()}`,
    interpretation: `${planet.name} operates through house ${planet.house}: ${HOUSE_MEANINGS[planet.house]}. ${planet.nakshatra} adds the nakshatra flavor.`,
    observation: `${planet.name} is in ${planet.sign}, house ${planet.house}, ${planet.nakshatra} pada ${planet.pada}${planet.retrograde ? ', retrograde' : ''}.`,
    title: titlePrefix,
    weight: classifyWeight(planet.name, planet.house),
  };
}

function missingPlanetEvidence(
  planet: string,
  titlePrefix: string,
): DashaEvidenceItem {
  return {
    id: `${titlePrefix.toLowerCase().replace(/\s+/g, '-')}-${planet.toLowerCase()}-missing`,
    interpretation:
      'Predicta will keep this reading broad until this placement is available in the Kundli.',
    observation: `${planet} placement is not available in the primary planet list.`,
    title: titlePrefix,
    weight: 'neutral',
  };
}

function buildCurrentTheme(mahadasha: string, antardasha: string): string {
  return `${mahadasha} sets the major life chapter; ${antardasha} decides which part of that chapter is active right now.`;
}

function buildCurrentMeaning(
  kundli: KundliData,
  mahaPlanet?: PlanetPosition,
  antarPlanet?: PlanetPosition,
): string {
  const mahaHouse = mahaPlanet
    ? `Mahadasha lord works through house ${mahaPlanet.house} (${HOUSE_MEANINGS[mahaPlanet.house]}).`
    : `${kundli.dasha.current.mahadasha} Mahadasha needs broad interpretation because placement detail is unavailable.`;
  const antarHouse = antarPlanet
    ? `Antardasha lord works through house ${antarPlanet.house} (${HOUSE_MEANINGS[antarPlanet.house]}).`
    : `${kundli.dasha.current.antardasha} Antardasha placement detail is unavailable.`;

  return `${mahaHouse} ${antarHouse}`;
}

function buildFreeCurrentInsight(
  kundli: KundliData,
  mahadasha: string,
  antardasha: string,
  mahaPlanet?: PlanetPosition,
  antarPlanet?: PlanetPosition,
): string {
  const mahaArea = mahaPlanet
    ? HOUSE_MEANINGS[mahaPlanet.house]
    : PLANET_THEMES[mahadasha];
  const antarArea = antarPlanet
    ? HOUSE_MEANINGS[antarPlanet.house]
    : PLANET_THEMES[antardasha];

  return `Useful insight: this ${mahadasha}/${antardasha} period is likely to make ${mahaArea} the big chapter, while ${antarArea} becomes the active sub-focus until ${formatDate(kundli.dasha.current.endDate)}.`;
}

function buildPremiumCurrentSynthesis(
  kundli: KundliData,
  mahaPlanet?: PlanetPosition,
  antarPlanet?: PlanetPosition,
): string {
  const strongest = kundli.ashtakavarga.strongestHouses.slice(0, 3).join(', ');
  const weakest = kundli.ashtakavarga.weakestHouses.slice(0, 3).join(', ');
  const maha = mahaPlanet
    ? `${mahaPlanet.name} in house ${mahaPlanet.house}, ${mahaPlanet.sign}, ${mahaPlanet.nakshatra}`
    : `${kundli.dasha.current.mahadasha} placement unavailable`;
  const antar = antarPlanet
    ? `${antarPlanet.name} in house ${antarPlanet.house}, ${antarPlanet.sign}, ${antarPlanet.nakshatra}`
    : `${kundli.dasha.current.antardasha} placement unavailable`;

  return `Premium synthesis: read ${maha} as the chapter lord and ${antar} as the active delivery lord. Strong Ashtakavarga houses (${strongest}) can deliver with less friction; pressure houses (${weakest}) need structure, boundaries, and realistic timing. Final judgment should cross-check the question topic with D1 and relevant divisional chart.`;
}

function buildDashaRemedies(
  kundli: KundliData,
  mahadasha: string,
  mahaPlanet?: PlanetPosition,
): string[] {
  const remedies = kundli.remedies
    ?.filter(item => item.linkedPlanets.includes(mahadasha))
    .slice(0, 2)
    .map(item => `${item.title}: ${item.practice}`);

  if (remedies?.length) {
    return remedies;
  }

  const house = mahaPlanet?.house;
  return [
    house
      ? `Keep one weekly discipline for house ${house}: ${HOUSE_MEANINGS[house]}.`
      : `Keep the ${mahadasha} period simple: consistent routine, clean speech, and no fear-based ritual pressure.`,
    `Track decisions monthly until ${formatDate(kundli.dasha.current.endDate)}; dasha results become clearer through repeated patterns.`,
  ];
}

function buildLimitations(
  kundli: KundliData,
  depth: MahadashaInsightDepth,
): string[] {
  const limitations = [
    'Dasha shows timing potential, not a guaranteed event.',
    'Exact event timing must be cross-checked with transit and the relevant divisional chart.',
  ];

  if (depth === 'FREE') {
    limitations.push(
      'Free insight stays concise; Premium adds Pratyantardasha, dasha-transit overlap, and detailed synthesis.',
    );
  }

  if (kundli.birthDetails.isTimeApproximate || kundli.rectification?.needsRectification) {
    limitations.push(
      'Birth time needs care, so fine timing should stay conservative.',
    );
  }

  return limitations;
}

function buildDashaCtas(
  current: KundliData['dasha']['current'],
  depth: MahadashaInsightDepth,
): MahadashaIntelligence['ctas'] {
  const base = [
    {
      id: 'ask-current-dasha',
      label: 'Ask current dasha',
      prompt: `Explain my ${current.mahadasha}/${current.antardasha} period in simple words with chart proof.`,
    },
    {
      id: 'ask-money-timing',
      label: 'Money timing',
      prompt: `Use my current ${current.mahadasha}/${current.antardasha} dasha to explain money timing and practical next steps.`,
    },
    {
      id: 'ask-career-timing',
      label: 'Career timing',
      prompt: `Use my current ${current.mahadasha}/${current.antardasha} dasha to explain career timing and risk windows.`,
    },
  ];

  if (depth === 'PREMIUM') {
    base.push({
      id: 'ask-pratyantar',
      label: 'Sub-period detail',
      prompt: `Go deeper into my current Pratyantardasha inside ${current.mahadasha}/${current.antardasha}.`,
    });
  }

  return base;
}

function inferFocusAreasFromEvidence(
  evidence: DashaEvidenceItem[],
  lord: string,
): string[] {
  const areas = evidence
    .map(item => {
      const houseMatch = item.interpretation.match(/house (\d+)/i);
      const house = houseMatch ? Number(houseMatch[1]) : undefined;
      return house ? HOUSE_MEANINGS[house] : undefined;
    })
    .filter(Boolean) as string[];

  return [...new Set([PLANET_THEMES[lord], ...areas].filter(Boolean))].slice(
    0,
    3,
  );
}

function buildPracticalGuidance(
  lord: string,
  focusAreas: string[],
  status: DashaWindowInsight['status'],
): string {
  const timing =
    status === 'current'
      ? 'Use this window actively.'
      : status === 'upcoming'
      ? 'Prepare before this window starts.'
      : status === 'past'
      ? 'Review what this window already taught.'
      : 'Keep this as a long-range planning signal.';
  const focus = focusAreas[0] ?? PLANET_THEMES[lord] ?? 'the linked life area';

  return `${timing} Keep the focus practical around ${focus}; avoid forcing results before the timing matures.`;
}

function resolveConfidence(
  kundli: KundliData,
  mahaPlanet?: PlanetPosition,
  antarPlanet?: PlanetPosition,
): 'low' | 'medium' | 'high' {
  if (kundli.birthDetails.isTimeApproximate || kundli.rectification?.needsRectification) {
    return 'medium';
  }
  return mahaPlanet && antarPlanet ? 'high' : 'medium';
}

function resolveWindowStatus(
  startDate: string,
  endDate: string,
  nowIso: string,
): DashaWindowInsight['status'] {
  const start = parseTime(startDate);
  const end = parseTime(endDate);
  const now = parseTime(nowIso);

  if (start <= now && now <= end) {
    return 'current';
  }
  if (now < start) {
    return start - now < 1000 * 60 * 60 * 24 * 365 * 3 ? 'upcoming' : 'later';
  }
  return 'past';
}

function rotateDashaOrder(startLord: string): string[] {
  const index = DASHA_ORDER.findIndex(
    item => item.toLowerCase() === startLord.toLowerCase(),
  );
  const startIndex = index >= 0 ? index : 0;
  return [
    ...DASHA_ORDER.slice(startIndex),
    ...DASHA_ORDER.slice(0, startIndex),
  ];
}

function findPlanet(
  kundli: KundliData,
  planet: string,
): PlanetPosition | undefined {
  return kundli.planets.find(
    item => item.name.toLowerCase() === planet.toLowerCase(),
  );
}

function classifyWeight(
  planetName: string,
  house: number,
): DashaEvidenceWeight {
  if ([6, 8, 12].includes(house)) {
    return PRESSURE_PLANETS.has(planetName) ? 'challenging' : 'mixed';
  }
  if ([1, 4, 5, 7, 9, 10, 11].includes(house)) {
    return BENEFICS.has(planetName) ? 'supportive' : 'mixed';
  }
  return 'neutral';
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function parseTime(value: string): number {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}
