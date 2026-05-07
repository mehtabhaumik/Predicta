import type {
  KundliData,
  NadiJyotishActivation,
  NadiJyotishInsightDepth,
  NadiJyotishPattern,
  NadiJyotishPremiumPlan,
  PlanetPosition,
} from '@pridicta/types';

type Options = {
  depth?: NadiJyotishInsightDepth;
  handoffQuestion?: string;
};

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

const PLANET_KARAKAS: Record<string, string> = {
  Jupiter: 'wisdom, children, teachers, faith, growth, and protection',
  Ketu: 'past-life detachment, moksha, research, isolation, and release',
  Mars: 'action, courage, land, siblings, conflict, and decisive effort',
  Mercury: 'speech, trade, learning, analysis, writing, and negotiation',
  Moon: 'mind, mother, nourishment, public mood, and emotional memory',
  Rahu: 'unusual ambition, foreignness, technology, hunger, and obsession',
  Saturn: 'karma, discipline, delay, work, responsibility, and maturity',
  Sun: 'father, authority, vitality, government, status, and self-respect',
  Venus: 'relationships, comfort, beauty, vehicles, pleasure, and agreement',
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, body, direction, and life approach',
  2: 'family, speech, savings, food habits, and stored wealth',
  3: 'effort, siblings, courage, skills, and self-made movement',
  4: 'home, mother, property, peace, and emotional security',
  5: 'children, learning, creativity, romance, and past merit',
  6: 'service, workload, debts, health discipline, and competition',
  7: 'marriage, partner, clients, contracts, and public exchange',
  8: 'sudden change, inheritance, hidden matters, research, and transformation',
  9: 'dharma, teachers, father, fortune, blessings, and long travel',
  10: 'career, duty, status, public contribution, and authority',
  11: 'income, gains, networks, elder support, and fulfillment',
  12: 'expenses, sleep, retreat, foreign lands, and spiritual letting go',
};

export function composeNadiJyotishPlan(
  kundli?: KundliData,
  options: Options = {},
): NadiJyotishPremiumPlan {
  const depth = options.depth ?? 'FREE';
  const handoffQuestion = options.handoffQuestion?.trim() || undefined;

  if (!kundli) {
    return buildPendingPlan(depth, handoffQuestion);
  }

  const patterns = buildPatterns(kundli, depth);
  const activations = buildActivations(kundli, patterns, depth);

  return {
    activations,
    askPrompt: handoffQuestion
      ? `Answer this in Nadi Predicta using Nadi-style planetary links only: ${handoffQuestion}`
      : 'Open my Nadi Predicta reading and explain the strongest planetary story patterns.',
    ctas: [
      {
        id: 'nadi-question',
        label: 'Ask Nadi Predicta',
        prompt: handoffQuestion
          ? `Use Nadi Predicta for this question: ${handoffQuestion}`
          : 'Use Nadi Predicta to read my strongest planetary story pattern.',
      },
      {
        id: 'nadi-validation',
        label: 'Validate Pattern',
        prompt:
          'Ask me simple validation questions before giving a deeper Nadi reading.',
      },
      {
        id: 'nadi-premium',
        label: 'Premium Nadi',
        prompt:
          'Show what Premium Nadi depth adds: planet links, timing activations, validation questions, and remedies.',
      },
    ],
    depth,
    freePreview: buildFreePreview(kundli, patterns),
    guardrails: buildGuardrails(),
    handoffQuestion,
    limitations: [
      'Predicta does not claim access to original palm-leaf manuscripts or private lineage records.',
      'This reading is a Nadi-inspired chart-signature layer, not Parashari yoga/dasha analysis and not KP sub-lord judgement.',
      'Nadi-style patterns need validation from the user before deeper event timing is presented.',
      'No Nadi answer should promise fixed events, death timing, medical certainty, legal certainty, or financial certainty.',
    ],
    methodSummary:
      'Predicta Nadi reads planet-to-planet stories: conjunction-style links, trinal links, opposition links, karaka themes, Rahu/Ketu karmic axis, and slow-transit activation. It stays separate from Parashari and KP.',
    ownerName: kundli.birthDetails.name,
    patterns,
    premiumOnly: true,
    premiumSynthesis:
      depth === 'PREMIUM'
        ? buildPremiumSynthesis(kundli, patterns, activations)
        : undefined,
    premiumUnlock:
      'Premium Nadi unlocks full chart-signature reading, validation questions, karmic story sequencing, transit activation windows, remedies, and a separate Nadi report without mixing Parashari or KP methods.',
    schoolBoundary:
      'Regular Predicta reads Parashari. KP Predicta reads KP. Nadi Predicta reads Nadi-style planetary stories and validation patterns only.',
    status: 'ready',
    subtitle:
      depth === 'PREMIUM'
        ? 'A separate premium Nadi reading room with chart-signature depth.'
        : 'A separate Nadi reading room. Free users see what the method found; Premium unlocks depth.',
    title: `${kundli.birthDetails.name}'s Nadi Predicta plan`,
    validationQuestions: buildValidationQuestions(kundli, patterns),
  };
}

function buildPendingPlan(
  depth: NadiJyotishInsightDepth,
  handoffQuestion?: string,
): NadiJyotishPremiumPlan {
  return {
    activations: [],
    askPrompt:
      'Create my Kundli first, then open Nadi Predicta with my question.',
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then keep my question ready for Nadi Predicta.',
      },
    ],
    depth,
    freePreview:
      'Nadi Predicta needs a calculated birth profile before it can read planetary story links.',
    guardrails: buildGuardrails(),
    handoffQuestion,
    limitations: ['Create a Kundli first so Nadi Predicta has verified birth details.'],
    methodSummary:
      'Nadi Predicta will read Nadi-style planetary stories after the birth profile is ready.',
    ownerName: 'You',
    patterns: [],
    premiumOnly: true,
    premiumUnlock:
      'Premium Nadi unlocks a separate reading room with planetary story links, validation questions, timing activation, and remedies.',
    schoolBoundary:
      'Nadi Predicta is separate from Regular Parashari Predicta and KP Predicta.',
    status: 'pending',
    subtitle: 'Create your Kundli to begin the premium Nadi reading room.',
    title: 'Nadi Predicta plan',
    validationQuestions: ['Please share or create your birth profile first.'],
  };
}

function buildPatterns(
  kundli: KundliData,
  depth: NadiJyotishInsightDepth,
): NadiJyotishPattern[] {
  const planets = kundli.planets.filter(planet => PLANET_KARAKAS[planet.name]);
  const patterns: NadiJyotishPattern[] = [];

  for (let index = 0; index < planets.length; index += 1) {
    for (let next = index + 1; next < planets.length; next += 1) {
      const first = planets[index];
      const second = planets[next];
      const relation = getNadiRelation(first, second);
      if (!relation) {
        continue;
      }
      patterns.push(buildPattern(first, second, relation));
    }
  }

  const rahu = planets.find(planet => planet.name === 'Rahu');
  const ketu = planets.find(planet => planet.name === 'Ketu');
  if (rahu && ketu) {
    patterns.push({
      confidence: 'medium',
      evidence: [
        `Rahu is in ${rahu.sign}, house ${rahu.house}.`,
        `Ketu is in ${ketu.sign}, house ${ketu.house}.`,
      ],
      freeInsight:
        'Rahu and Ketu show where life pulls you forward and where it asks for release.',
      id: 'nadi-rahu-ketu-axis',
      lifeAreas: ['general', 'spirituality'],
      meaning: `Rahu pulls toward ${HOUSE_MEANINGS[rahu.house]}; Ketu asks maturity around ${HOUSE_MEANINGS[ketu.house]}.`,
      observation: `Rahu/Ketu axis runs through houses ${rahu.house}/${ketu.house}.`,
      planets: ['Rahu', 'Ketu'],
      premiumDetail:
        'Premium Nadi reads this as a karmic axis: appetite, unfinished desire, detachment, and the transit periods that awaken this story.',
      relation: 'rahu-ketu-axis',
      title: 'Rahu-Ketu karmic axis',
      weight: 'mixed',
    });
  }

  return patterns
    .sort((a, b) => patternRank(a) - patternRank(b))
    .slice(0, depth === 'PREMIUM' ? 8 : 4);
}

function buildPattern(
  first: PlanetPosition,
  second: PlanetPosition,
  relation: NadiJyotishPattern['relation'],
): NadiJyotishPattern {
  const relationText = relationLabel(relation);
  const lifeAreas = Array.from(
    new Set([...areasForPlanet(first.name), ...areasForPlanet(second.name)]),
  );
  const weight = patternWeight(first.name, second.name, relation);

  return {
    confidence: relation === 'same-sign' ? 'high' : 'medium',
    evidence: [
      `${first.name}: ${first.sign}, house ${first.house}, ${first.nakshatra}.`,
      `${second.name}: ${second.sign}, house ${second.house}, ${second.nakshatra}.`,
      `${relationText} links their karakas.`,
    ],
    freeInsight: `${first.name} and ${second.name} are linked by ${relationText}. This is a useful Nadi-style story marker, but Premium is needed for full sequencing and timing.`,
    id: `nadi-${first.name.toLowerCase()}-${second.name.toLowerCase()}-${relation}`,
    lifeAreas,
    meaning: `${first.name} carries ${PLANET_KARAKAS[first.name]}; ${second.name} carries ${PLANET_KARAKAS[second.name]}. Their link connects ${HOUSE_MEANINGS[first.house]} with ${HOUSE_MEANINGS[second.house]}.`,
    observation: `${first.name} in ${first.sign} house ${first.house} has a ${relationText} with ${second.name} in ${second.sign} house ${second.house}.`,
    planets: [first.name, second.name],
    premiumDetail: `Premium Nadi reads this as a story chain: ${first.name} theme -> ${second.name} theme, then checks maturity age, slow-transit activation, and validation questions before giving event-level guidance.`,
    relation,
    title: `${first.name}-${second.name} story link`,
    weight,
  };
}

function buildActivations(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  depth: NadiJyotishInsightDepth,
): NadiJyotishActivation[] {
  const current = kundli.dasha.current;
  const dashaPattern = patterns.find(pattern =>
    pattern.planets.some(
      planet =>
        planet === current.mahadasha || planet === current.antardasha,
    ),
  );
  const activations: NadiJyotishActivation[] = [];

  if (dashaPattern) {
    activations.push({
      guidance:
        'Treat this as an active story, then validate with real-life events before going deeper.',
      id: 'nadi-dasha-activation',
      observation: `${current.mahadasha}/${current.antardasha} touches ${dashaPattern.planets.join(' and ')}.`,
      premiumDetail:
        'Premium connects this active story to sub-period timing, repeated life themes, and practical remedy discipline.',
      timing: `${current.startDate} to ${current.endDate}`,
      title: 'Current timing touches a Nadi story',
      trigger: `${current.mahadasha}/${current.antardasha}`,
    });
  }

  const slowTransits = (kundli.transits ?? []).filter(transit =>
    ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(transit.planet),
  );
  slowTransits.slice(0, depth === 'PREMIUM' ? 4 : 2).forEach(transit => {
    const linkedPattern = patterns.find(pattern =>
      pattern.evidence.some(item => item.includes(transit.sign)),
    );
    activations.push({
      guidance:
        transit.weight === 'supportive'
          ? 'Use this window for steady progress without overpromising outcomes.'
          : 'Move slowly, validate facts, and avoid fear-based conclusions.',
      id: `nadi-transit-${transit.planet.toLowerCase()}`,
      observation: linkedPattern
        ? `${transit.planet} is moving through ${transit.sign}, touching a sign used by ${linkedPattern.title}.`
        : `${transit.planet} is moving through ${transit.sign}, house ${transit.houseFromLagna} from Lagna.`,
      premiumDetail:
        'Premium checks whether this slow transit repeats a natal planet story and whether the user has already seen similar events.',
      timing: transit.calculatedAt,
      title: `${transit.planet} activation`,
      trigger: `${transit.planet} in ${transit.sign}`,
    });
  });

  return activations.slice(0, depth === 'PREMIUM' ? 5 : 3);
}

function buildFreePreview(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
): string {
  const top = patterns[0];
  if (!top) {
    return `${kundli.birthDetails.name}'s Nadi space is ready. Predicta will prepare the first preview once planetary story details are available from the saved birth profile.`;
  }
  return `Nadi preview: ${top.title} stands out. ${top.freeInsight}`;
}

function buildPremiumSynthesis(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  activations: NadiJyotishActivation[],
): string {
  const patternText = patterns
    .slice(0, 3)
    .map(pattern => pattern.title)
    .join(', ');
  const activationText = activations
    .slice(0, 2)
    .map(activation => activation.trigger)
    .join(', ');
  return `${kundli.birthDetails.name}'s Premium Nadi reading will sequence ${patternText || 'planetary story links'} and check activation through ${activationText || 'current timing'} before giving practical guidance.`;
}

function buildValidationQuestions(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
): string[] {
  const questions = [
    `Does ${kundli.birthDetails.name} relate more to practical responsibility first, or emotional restlessness first?`,
    'Has the same life issue repeated in cycles rather than one isolated event?',
    'Is the current question about an event, a relationship pattern, money/career movement, or spiritual direction?',
  ];

  const top = patterns[0];
  if (top) {
    questions.unshift(
      `Before I go deeper: does the ${top.planets.join('-')} theme show up in real life as ${top.lifeAreas.join(', ')}?`,
    );
  }

  return questions;
}

function buildGuardrails(): string[] {
  return [
    'No fake palm-leaf claim.',
    'No ancient manuscript certainty unless a real external manuscript process exists.',
    'Do not mix Nadi with Parashari yoga/dasha or KP sub-lord rules inside the same answer.',
    'Use validation questions before strong event statements.',
    'Give guidance, timing themes, and remedies without fear or guaranteed outcomes.',
  ];
}

function getNadiRelation(
  first: PlanetPosition,
  second: PlanetPosition,
): NadiJyotishPattern['relation'] | undefined {
  const distance = signDistance(first.sign, second.sign);
  if (distance === 0) {
    return 'same-sign';
  }
  if (distance === 4 || distance === 8) {
    return 'trine-link';
  }
  if (distance === 6) {
    return 'opposition-link';
  }
  if (distance === 1 || distance === 11) {
    return 'sequence-link';
  }
  if (first.house === second.house) {
    return 'karaka-link';
  }
  return undefined;
}

function signDistance(first: string, second: string): number {
  const firstIndex = SIGN_ORDER.indexOf(first);
  const secondIndex = SIGN_ORDER.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0) {
    return -1;
  }
  return (secondIndex - firstIndex + 12) % 12;
}

function relationLabel(relation: NadiJyotishPattern['relation']): string {
  if (relation === 'same-sign') {
    return 'same-sign conjunction-style link';
  }
  if (relation === 'trine-link') {
    return 'trinal story link';
  }
  if (relation === 'opposition-link') {
    return 'opposition story link';
  }
  if (relation === 'sequence-link') {
    return 'sequence link';
  }
  if (relation === 'rahu-ketu-axis') {
    return 'karmic axis';
  }
  return 'karaka link';
}

function areasForPlanet(planet: string): NadiJyotishPattern['lifeAreas'] {
  if (planet === 'Venus') {
    return ['relationship', 'wealth'];
  }
  if (planet === 'Jupiter') {
    return ['spirituality', 'general'];
  }
  if (planet === 'Saturn') {
    return ['career', 'wellbeing'];
  }
  if (planet === 'Mercury') {
    return ['career', 'general'];
  }
  if (planet === 'Mars') {
    return ['wealth', 'career'];
  }
  if (planet === 'Moon') {
    return ['general', 'wellbeing'];
  }
  if (planet === 'Sun') {
    return ['general', 'career'];
  }
  if (planet === 'Rahu') {
    return ['career', 'general'];
  }
  if (planet === 'Ketu') {
    return ['spirituality', 'wellbeing'];
  }
  return ['general'];
}

function patternWeight(
  first: string,
  second: string,
  relation: NadiJyotishPattern['relation'],
): NadiJyotishPattern['weight'] {
  const pair = new Set([first, second]);
  if (pair.has('Saturn') && (pair.has('Rahu') || pair.has('Mars'))) {
    return 'challenging';
  }
  if (pair.has('Jupiter') && (pair.has('Venus') || pair.has('Moon'))) {
    return 'supportive';
  }
  if (relation === 'opposition-link' || pair.has('Rahu') || pair.has('Ketu')) {
    return 'mixed';
  }
  return 'neutral';
}

function patternRank(pattern: NadiJyotishPattern): number {
  const relationRank: Record<NadiJyotishPattern['relation'], number> = {
    'same-sign': 0,
    'rahu-ketu-axis': 1,
    'trine-link': 2,
    'opposition-link': 3,
    'sequence-link': 4,
    'karaka-link': 5,
  };
  return relationRank[pattern.relation];
}
