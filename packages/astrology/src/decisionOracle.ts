import type {
  DecisionArea,
  DecisionEvidence,
  DecisionMemo,
  DecisionState,
  KundliData,
  TimelineEvent,
  TransitInsight,
} from '@pridicta/types';

type AreaConfig = {
  planets: string[];
  houses: number[];
  label: string;
};

const AREA_CONFIG: Record<DecisionArea, AreaConfig> = {
  career: {
    houses: [10, 6, 11],
    label: 'Career',
    planets: ['Saturn', 'Sun', 'Mercury', 'Jupiter'],
  },
  education: {
    houses: [4, 5, 9],
    label: 'Education',
    planets: ['Mercury', 'Jupiter', 'Moon'],
  },
  general: {
    houses: [1, 5, 9, 10],
    label: 'General',
    planets: ['Sun', 'Moon', 'Jupiter', 'Saturn'],
  },
  legal: {
    houses: [6, 8, 9, 12],
    label: 'Legal',
    planets: ['Saturn', 'Mars', 'Jupiter'],
  },
  relocation: {
    houses: [4, 9, 12],
    label: 'Relocation',
    planets: ['Moon', 'Rahu', 'Saturn', 'Jupiter'],
  },
  relationship: {
    houses: [2, 7, 11],
    label: 'Relationship',
    planets: ['Venus', 'Jupiter', 'Moon'],
  },
  wealth: {
    houses: [2, 9, 11],
    label: 'Wealth',
    planets: ['Jupiter', 'Venus', 'Mercury'],
  },
  wellbeing: {
    houses: [1, 6, 8, 12],
    label: 'Wellbeing',
    planets: ['Moon', 'Saturn', 'Mars'],
  },
};

export function composeDecisionMemo({
  kundli,
  question,
}: {
  kundli?: KundliData;
  question: string;
}): DecisionMemo {
  const cleanQuestion = question.trim();
  const area = classifyDecisionArea(cleanQuestion);
  const highStakes = detectHighStakes(cleanQuestion, area);
  const missingQuestions = buildClarifyingQuestions(cleanQuestion, area);

  if (!kundli) {
    return {
      aiPrompt: 'Create a decision memo after my kundli is generated.',
      area,
      clarifyingQuestions: ['Create a kundli first so the decision can be checked against chart timing.'],
      evidence: [
        {
          id: 'missing-kundli',
          interpretation: 'The Oracle needs birth chart, dasha, transit, and ashtakavarga evidence.',
          observation: 'No active kundli is available.',
          source: 'safety',
          title: 'Kundli required',
          weight: 'neutral',
        },
      ],
      headline: 'Create a kundli before deciding with Predicta.',
      id: `decision-pending-${Date.now()}`,
      nextAction: 'Generate a real kundli, then ask the decision again.',
      question: cleanQuestion,
      remedies: [],
      risk: 'Without chart evidence, Predicta can only help frame the question.',
      shortAnswer: 'Needs chart evidence before a decision memo can be trusted.',
      state: 'needs-more-info',
      status: 'pending',
      timing: 'Pending',
    };
  }

  const config = AREA_CONFIG[area];
  const evidence = buildDecisionEvidence(kundli, config, highStakes);
  const score = scoreEvidence(evidence);
  const state = resolveDecisionState({
    area,
    hasClarifyingGaps: missingQuestions.length > 0,
    highStakes,
    score,
  });
  const timing = buildTiming(kundli, area, config, state);
  const risk = buildRisk(area, state, highStakes, config);
  const nextAction = buildNextAction(area, state, missingQuestions, highStakes);
  const remedies = buildDecisionRemedies(kundli, config);
  const safetyNote = highStakes
    ? 'This is a high-stakes topic. Treat this memo as reflective timing support, not professional medical, legal, financial, or safety advice. Consult a qualified professional before acting.'
    : undefined;

  return {
    aiPrompt: buildAiPrompt(cleanQuestion, area, state),
    area,
    clarifyingQuestions: missingQuestions,
    evidence,
    headline: `${AREA_CONFIG[area].label} decision memo: ${labelState(state)}`,
    id: `decision-${kundli.id}-${hashText(cleanQuestion)}`,
    nextAction,
    question: cleanQuestion,
    remedies,
    risk,
    safetyNote,
    shortAnswer: buildShortAnswer(state, area),
    state,
    status: 'ready',
    timing,
  };
}

export function classifyDecisionArea(question: string): DecisionArea {
  const text = question.toLowerCase();

  if (matches(text, ['job', 'career', 'work', 'business', 'startup', 'promotion', 'quit'])) {
    return 'career';
  }
  if (matches(text, ['marry', 'marriage', 'relationship', 'partner', 'breakup', 'divorce', 'dating'])) {
    return 'relationship';
  }
  if (matches(text, ['money', 'invest', 'investment', 'loan', 'salary', 'wealth', 'buy', 'sell'])) {
    return 'wealth';
  }
  if (matches(text, ['study', 'college', 'exam', 'education', 'course', 'degree', 'school'])) {
    return 'education';
  }
  if (matches(text, ['move', 'relocate', 'abroad', 'immigration', 'city', 'country', 'home'])) {
    return 'relocation';
  }
  if (matches(text, ['health', 'medical', 'surgery', 'medicine', 'doctor', 'therapy', 'pregnancy'])) {
    return 'wellbeing';
  }
  if (matches(text, ['legal', 'court', 'lawsuit', 'case', 'contract', 'police', 'tax'])) {
    return 'legal';
  }

  return 'general';
}

function buildDecisionEvidence(
  kundli: KundliData,
  config: AreaConfig,
  highStakes: boolean,
): DecisionEvidence[] {
  const current = kundli.dasha.current;
  const dashaPlanets = [current.mahadasha, current.antardasha];
  const dashaMatch = dashaPlanets.filter(planet => config.planets.includes(planet));
  const strongestMatch = config.houses.filter(house =>
    kundli.ashtakavarga.strongestHouses.includes(house),
  );
  const weakestMatch = config.houses.filter(house =>
    kundli.ashtakavarga.weakestHouses.includes(house),
  );
  const transit = pickRelevantTransit(kundli.transits ?? [], config.houses);
  const timeline = pickRelevantTimelineEvent(kundli.lifeTimeline ?? [], config);
  const evidence: DecisionEvidence[] = [
    {
      id: 'decision-dasha',
      interpretation: dashaMatch.length
        ? 'The active timing period directly touches this decision area.'
        : 'The active timing period is indirect, so the answer should stay measured.',
      observation: `${current.mahadasha}/${current.antardasha} is active from ${current.startDate} to ${current.endDate}.`,
      source: 'dasha',
      title: 'Active dasha timing',
      weight: dashaMatch.length ? 'supportive' : 'mixed',
    },
    {
      id: 'decision-ashtakavarga',
      interpretation: strongestMatch.length
        ? `Houses ${strongestMatch.join(', ')} give practical support for this area.`
        : weakestMatch.length
          ? `Houses ${weakestMatch.join(', ')} need caution before acting.`
          : 'House strength is neutral, so timing and details matter more.',
      observation: `Relevant houses: ${config.houses.join(', ')}. Strong: ${strongestMatch.join(', ') || 'none'}; pressure: ${weakestMatch.join(', ') || 'none'}.`,
      source: 'ashtakavarga',
      title: 'House strength',
      weight: strongestMatch.length ? 'supportive' : weakestMatch.length ? 'challenging' : 'neutral',
    },
  ];

  if (transit) {
    evidence.push({
      id: 'decision-transit',
      interpretation: transit.weight === 'challenging'
        ? 'This transit asks for slower movement and more verification.'
        : transit.weight === 'supportive'
          ? 'This transit adds workable support if the practical facts agree.'
          : 'This transit is useful context, but not enough for an absolute answer.',
      observation: `${transit.planet} in ${transit.sign}, house ${transit.houseFromLagna} from Lagna and ${transit.houseFromMoon} from Moon.`,
      source: 'transit',
      title: 'Transit weather',
      weight: transit.weight,
    });
  }

  if (timeline) {
    evidence.push({
      id: 'decision-timeline',
      interpretation: timeline.summary,
      observation: `${timeline.title}: ${timeline.startDate}${timeline.endDate ? ` to ${timeline.endDate}` : ''}.`,
      source: 'timeline',
      title: 'Timeline signal',
      weight: timeline.kind === 'remedy' ? 'neutral' : 'mixed',
    });
  }

  if (highStakes) {
    evidence.push({
      id: 'decision-safety',
      interpretation: 'Professional guidance must lead the final decision.',
      observation: 'The question appears high-stakes.',
      source: 'safety',
      title: 'Safety boundary',
      weight: 'challenging',
    });
  }

  return evidence;
}

function scoreEvidence(evidence: DecisionEvidence[]): number {
  return evidence.reduce((score, item) => {
    if (item.weight === 'supportive') {
      return score + 2;
    }
    if (item.weight === 'mixed') {
      return score;
    }
    if (item.weight === 'challenging') {
      return score - 2;
    }
    return score;
  }, 0);
}

function resolveDecisionState({
  area,
  hasClarifyingGaps,
  highStakes,
  score,
}: {
  area: DecisionArea;
  hasClarifyingGaps: boolean;
  highStakes: boolean;
  score: number;
}): DecisionState {
  if (hasClarifyingGaps) {
    return 'needs-more-info';
  }
  if (highStakes || area === 'legal' || area === 'wellbeing') {
    return 'wait';
  }
  if (score >= 3) {
    return 'green';
  }
  if (score >= 0) {
    return 'yellow';
  }
  if (score <= -3) {
    return 'red';
  }
  return 'wait';
}

function buildClarifyingQuestions(question: string, area: DecisionArea): string[] {
  const text = question.toLowerCase();
  const questions: string[] = [];

  if (question.trim().length < 16) {
    questions.push('What exact choice are you comparing?');
  }
  if (!matches(text, ['when', 'now', 'month', 'year', 'today', 'tomorrow', 'week', 'date'])) {
    questions.push('What timing window are you considering?');
  }
  if (area === 'career' && !matches(text, ['offer', 'quit', 'join', 'business', 'promotion', 'role'])) {
    questions.push('Is this about changing jobs, starting work, promotion, or business?');
  }
  if (area === 'relationship' && !matches(text, ['marry', 'commit', 'break', 'proposal', 'date', 'partner'])) {
    questions.push('Is this about commitment, marriage, repair, or separation?');
  }
  if (area === 'wealth' && !matches(text, ['amount', 'buy', 'sell', 'loan', 'invest', 'save'])) {
    questions.push('What money action is involved: buy, sell, invest, borrow, or save?');
  }

  return questions.slice(0, 3);
}

function detectHighStakes(question: string, area: DecisionArea): boolean {
  const text = question.toLowerCase();

  return (
    area === 'wellbeing' ||
    area === 'legal' ||
    matches(text, [
      'suicide',
      'self harm',
      'emergency',
      'surgery',
      'medicine',
      'diagnosis',
      'court',
      'lawsuit',
      'tax',
      'all my savings',
      'life savings',
    ])
  );
}

function buildTiming(
  kundli: KundliData,
  area: DecisionArea,
  config: AreaConfig,
  state: DecisionState,
): string {
  const current = kundli.dasha.current;
  const relevantEvent = pickRelevantTimelineEvent(kundli.lifeTimeline ?? [], config);

  if (state === 'needs-more-info') {
    return 'Timing cannot be narrowed until the missing decision details are answered.';
  }

  if (relevantEvent) {
    return `${relevantEvent.title} is the nearest planning signal: ${relevantEvent.startDate}${relevantEvent.endDate ? ` to ${relevantEvent.endDate}` : ''}.`;
  }

  return `${AREA_CONFIG[area].label} decisions should be tested inside the current ${current.mahadasha}/${current.antardasha} period, ending ${current.endDate}.`;
}

function buildRisk(
  area: DecisionArea,
  state: DecisionState,
  highStakes: boolean,
  config: AreaConfig,
): string {
  if (highStakes) {
    return 'The main risk is treating reflective timing as a substitute for qualified professional advice.';
  }
  if (state === 'green') {
    return `Risk is manageable if houses ${config.houses.join(', ')} are handled with practical checks.`;
  }
  if (state === 'yellow') {
    return 'Risk is moderate. The chart supports exploration, but practical facts must lead the final move.';
  }
  if (state === 'red') {
    return 'Risk is elevated. Avoid rushing, overcommitting, or ignoring contradictory facts.';
  }
  if (state === 'wait') {
    return 'Risk comes from timing pressure. Waiting for clearer information is part of the recommendation.';
  }
  return 'Risk cannot be judged until the decision is more specific.';
}

function buildNextAction(
  area: DecisionArea,
  state: DecisionState,
  missingQuestions: string[],
  highStakes: boolean,
): string {
  if (missingQuestions.length) {
    return `Answer this first: ${missingQuestions[0]}`;
  }
  if (highStakes) {
    return 'Speak with a qualified professional, then use Predicta only to reflect on timing and personal readiness.';
  }
  if (state === 'green') {
    return `Take one reversible ${AREA_CONFIG[area].label.toLowerCase()} step and review the result before expanding.`;
  }
  if (state === 'yellow') {
    return 'Make a small test move, collect facts, and ask again with the outcome.';
  }
  if (state === 'red') {
    return 'Pause the commitment and reduce downside before acting.';
  }
  return 'Wait, clarify the facts, and set a review date instead of forcing a final decision today.';
}

function buildDecisionRemedies(kundli: KundliData, config: AreaConfig): string[] {
  return (kundli.remedies ?? [])
    .filter(
      remedy =>
        remedy.linkedHouses.some(house => config.houses.includes(house)) ||
        remedy.linkedPlanets.some(planet => config.planets.includes(planet)),
    )
    .slice(0, 2)
    .map(remedy => `${remedy.title}: ${remedy.practice}`);
}

function buildShortAnswer(state: DecisionState, area: DecisionArea): string {
  const areaLabel = AREA_CONFIG[area].label.toLowerCase();

  switch (state) {
    case 'green':
      return `Green means the chart supports a careful ${areaLabel} move, as long as practical facts agree.`;
    case 'yellow':
      return `Yellow means explore the ${areaLabel} decision through a small, reversible step.`;
    case 'red':
      return `Red means the ${areaLabel} decision carries enough pressure to pause or redesign it.`;
    case 'wait':
      return `Wait means timing or stakes are too sensitive for a rushed ${areaLabel} call.`;
    case 'needs-more-info':
      return 'Needs more info means the question is not specific enough for a serious memo.';
  }
}

function buildAiPrompt(
  question: string,
  area: DecisionArea,
  state: DecisionState,
): string {
  return [
    `Explain this Predicta Decision Oracle memo: "${question}".`,
    `Decision area: ${area}. State: ${state}.`,
    'Use deterministic chart evidence first: dasha, transits, timeline, ashtakavarga, remedies.',
    'Do not give fatalistic yes/no. Include timing, risk, next action, and any safety boundary.',
  ].join(' ');
}

function pickRelevantTransit(
  transits: TransitInsight[],
  houses: number[],
): TransitInsight | undefined {
  return transits.find(
    transit =>
      houses.includes(transit.houseFromLagna) ||
      houses.includes(transit.houseFromMoon),
  );
}

function pickRelevantTimelineEvent(
  events: TimelineEvent[],
  config: AreaConfig,
): TimelineEvent | undefined {
  return events.find(
    event =>
      event.houses.some(house => config.houses.includes(house)) ||
      event.planets.some(planet => config.planets.includes(planet)),
  );
}

function labelState(state: DecisionState): string {
  switch (state) {
    case 'green':
      return 'green, testable support';
    case 'yellow':
      return 'yellow, proceed carefully';
    case 'red':
      return 'red, redesign first';
    case 'wait':
      return 'wait, timing needs patience';
    case 'needs-more-info':
      return 'needs more information';
  }
}

function matches(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

function hashText(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
