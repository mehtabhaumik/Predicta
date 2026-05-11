import type {
  KundliData,
  PlanetPosition,
  PurusharthaAxisInsight,
  PurusharthaCategory,
  PurusharthaLifeBalance,
} from '@pridicta/types';

type PurusharthaConfig = {
  category: PurusharthaCategory;
  label: PurusharthaAxisInsight['label'];
  houses: number[];
  meaning: string;
  simpleMeaning: string;
};

const PURUSHARTHA_CONFIG: PurusharthaConfig[] = [
  {
    category: 'dharma',
    houses: [1, 5, 9],
    label: 'Dharma',
    meaning: 'purpose, values, learning, blessings, faith, children, and right direction',
    simpleMeaning: 'what gives life meaning and direction',
  },
  {
    category: 'artha',
    houses: [2, 6, 10],
    label: 'Artha',
    meaning: 'money, work, service, discipline, career, responsibility, and practical stability',
    simpleMeaning: 'money, work, duty, and real-world structure',
  },
  {
    category: 'kama',
    houses: [3, 7, 11],
    label: 'Kama',
    meaning: 'desire, courage, partnership, social life, gains, and wish fulfillment',
    simpleMeaning: 'relationships, desire, effort, network, and visible gains',
  },
  {
    category: 'moksha',
    houses: [4, 8, 12],
    label: 'Moksha',
    meaning: 'peace, home, transformation, release, sleep, retreat, and spiritual freedom',
    simpleMeaning: 'inner peace, healing, surrender, and release',
  },
];

export function composePurusharthaLifeBalance(
  kundli?: KundliData,
): PurusharthaLifeBalance {
  if (!kundli) {
    const axes = buildPendingAxes();
    return {
      askPrompt:
        'Create my Kundli, then show my Dharma, Artha, Kama, and Moksha life balance.',
      axes,
      dominant: axes[0],
      limitations: ['Create a Kundli first so house strength and dasha timing can be read.'],
      needsCare: axes[3],
      status: 'pending',
      subtitle:
        'Create a Kundli to see whether life is emphasizing purpose, work, relationships, or inner release.',
      summary:
        'Purushartha means the four aims of life: Dharma, Artha, Kama, and Moksha.',
      title: 'Life balance is waiting.',
    };
  }

  const axes = PURUSHARTHA_CONFIG.map(config => buildAxisInsight(kundli, config));
  const sorted = [...axes].sort((a, b) => b.score - a.score);
  const careful = [...axes].sort((a, b) => a.score - b.score);
  const dominant = sorted[0];
  const needsCare = careful[0];

  return {
    askPrompt:
      'Explain my Purushartha life balance: Dharma, Artha, Kama, and Moksha with chart proof, timing, karma pattern, and one practical step.',
    axes,
    dominant,
    limitations: [
      'Purushartha balance shows life emphasis, not a fixed personality label.',
      'Timing should be cross-checked with dasha, Gochar, and the exact question.',
      'Health, legal, financial, or safety decisions still need qualified professional guidance.',
    ],
    needsCare,
    status: 'ready',
    subtitle:
      'A simple map of purpose, work, relationships, and inner release from houses, dasha, Gochar, and Ashtakavarga.',
    summary: `${dominant.label} is the strongest current emphasis: ${dominant.meaning}. ${needsCare.label} needs steadier care, so avoid ignoring ${needsCare.meaning}.`,
    title: `${kundli.birthDetails.name}'s Purushartha life balance`,
  };
}

function buildAxisInsight(
  kundli: KundliData,
  config: PurusharthaConfig,
): PurusharthaAxisInsight {
  const savScores = config.houses.map(house => kundli.ashtakavarga.sav[house - 1] ?? 24);
  const savAverage = average(savScores);
  const planetHits = kundli.planets.filter(planet =>
    config.houses.includes(planet.house),
  );
  const dashaHits = [
    findPlanet(kundli, kundli.dasha.current.mahadasha),
    findPlanet(kundli, kundli.dasha.current.antardasha),
  ].filter(
    (planet): planet is PlanetPosition =>
      planet !== undefined && config.houses.includes(planet.house),
  );
  const transitHits = (kundli.transits ?? []).filter(transit =>
    config.houses.includes(transit.houseFromLagna),
  );
  const score = clamp(
    Math.round(
      (savAverage / 40) * 70 +
        planetHits.length * 4 +
        dashaHits.length * 9 +
        transitHits.filter(item => item.weight === 'supportive').length * 5 -
        transitHits.filter(item => item.weight === 'challenging').length * 4,
    ),
    18,
    96,
  );
  const tone: PurusharthaAxisInsight['tone'] =
    score >= 68 ? 'supportive' : score >= 42 ? 'steady' : 'careful';

  return {
    category: config.category,
    chartEvidence: buildEvidence(kundli, config, savScores, planetHits, dashaHits, transitHits),
    currentEmphasis: buildCurrentEmphasis(kundli, config, dashaHits, transitHits),
    houses: config.houses,
    label: config.label,
    meaning: config.meaning,
    practicalGuidance: buildPracticalGuidance(config, tone),
    score,
    tone,
  };
}

function buildEvidence(
  kundli: KundliData,
  config: PurusharthaConfig,
  savScores: number[],
  planetHits: PlanetPosition[],
  dashaHits: PlanetPosition[],
  transitHits: NonNullable<KundliData['transits']>,
): string[] {
  const evidence = [
    `${config.label} houses are ${config.houses.join(', ')}: ${config.simpleMeaning}.`,
    `Ashtakavarga scores for these houses: ${savScores.join(', ')}.`,
  ];

  if (planetHits.length) {
    evidence.push(
      `Planets in ${config.label} houses: ${planetHits
        .map(planet => `${planet.name} in house ${planet.house}`)
        .join(', ')}.`,
    );
  }

  if (dashaHits.length) {
    evidence.push(
      `Current dasha activates this aim through ${dashaHits
        .map(planet => `${planet.name} in house ${planet.house}`)
        .join(', ')}.`,
    );
  }

  if (transitHits.length) {
    evidence.push(
      `Current Gochar touches this aim through ${transitHits
        .slice(0, 3)
        .map(transit => `${transit.planet} house ${transit.houseFromLagna}`)
        .join(', ')}.`,
    );
  }

  return evidence.slice(0, 5);
}

function buildCurrentEmphasis(
  kundli: KundliData,
  config: PurusharthaConfig,
  dashaHits: PlanetPosition[],
  transitHits: NonNullable<KundliData['transits']>,
): string {
  if (dashaHits.length) {
    return `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} is pulling attention toward ${config.label}: ${config.simpleMeaning}.`;
  }

  const slowTransit = transitHits.find(transit =>
    ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(transit.planet),
  );
  if (slowTransit) {
    return `${slowTransit.planet} Gochar is currently activating ${config.label} through house ${slowTransit.houseFromLagna}.`;
  }

  return `${config.label} is present as a baseline life aim: ${config.simpleMeaning}.`;
}

function buildPracticalGuidance(
  config: PurusharthaConfig,
  tone: PurusharthaAxisInsight['tone'],
): string {
  const prefix =
    tone === 'supportive'
      ? 'Use this support consciously.'
      : tone === 'steady'
        ? 'Keep this balanced through simple routine.'
        : 'Give this area patient care without panic.';

  if (config.category === 'dharma') {
    return `${prefix} Choose one action that protects values, learning, or long-term direction.`;
  }
  if (config.category === 'artha') {
    return `${prefix} Keep money, work, deadlines, and health discipline practical.`;
  }
  if (config.category === 'kama') {
    return `${prefix} Keep desire, communication, partnership, and social choices clean.`;
  }
  return `${prefix} Protect sleep, home peace, emotional release, and spiritual grounding.`;
}

function buildPendingAxes(): PurusharthaAxisInsight[] {
  return PURUSHARTHA_CONFIG.map((config, index) => ({
    category: config.category,
    chartEvidence: ['Create Kundli first.'],
    currentEmphasis: 'Waiting for birth chart.',
    houses: config.houses,
    label: config.label,
    meaning: config.meaning,
    practicalGuidance: 'Create your Kundli to personalize this life aim.',
    score: [58, 54, 52, 50][index] ?? 50,
    tone: 'steady',
  }));
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
