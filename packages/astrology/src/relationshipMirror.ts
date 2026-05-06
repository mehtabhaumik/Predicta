import type {
  KundliData,
  PlanetPosition,
  RelationshipMirror,
  RelationshipMirrorEvidence,
  RelationshipMirrorSection,
} from '@pridicta/types';

const WATER_SIGNS = new Set(['Cancer', 'Scorpio', 'Pisces']);
const FIRE_SIGNS = new Set(['Aries', 'Leo', 'Sagittarius']);
const AIR_SIGNS = new Set(['Gemini', 'Libra', 'Aquarius']);
const EARTH_SIGNS = new Set(['Taurus', 'Virgo', 'Capricorn']);

export function composeRelationshipMirror(
  first?: KundliData,
  second?: KundliData,
): RelationshipMirror {
  if (!first || !second) {
    return {
      askPrompt:
        'Explain how Relationship Mirror will compare two calculated kundlis without making fatalistic claims.',
      evidence: [],
      firstName: first?.birthDetails.name ?? 'First person',
      headline: 'Add two calculated kundlis to unlock the mirror.',
      howToTalkThisWeek:
        'Start by adding or selecting two saved kundlis. The weekly conversation advice needs both charts.',
      overview:
        'Relationship Mirror needs two real charts before it can compare emotional style, communication, commitment, conflict, and timing.',
      secondName: second?.birthDetails.name ?? 'Second person',
      sections: [],
      shareSummary: 'Predicta Relationship Mirror is waiting for two saved kundlis.',
      status: 'pending',
      timingOverlap: 'Pending until both dasha timelines are available.',
    };
  }

  const evidence = buildEvidence(first, second);
  const sections = buildSections(first, second, evidence);
  const firstName = first.birthDetails.name;
  const secondName = second.birthDetails.name;
  const headline = `${firstName} and ${secondName}: connection with room for growth`;
  const overview = buildOverview(first, second);
  const howToTalkThisWeek = buildHowToTalk(first, second);
  const timingOverlap = buildTimingOverlap(first, second);

  return {
    askPrompt: [
      `Explain the Relationship Mirror for ${firstName} and ${secondName}.`,
      'Use emotional style, communication, commitment, conflict trigger, timing overlap, and weekly conversation advice.',
      'Avoid deterministic claims and cite evidence from both charts.',
    ].join(' '),
    evidence,
    firstName,
    headline,
    howToTalkThisWeek,
    overview,
    secondName,
    sections,
    shareSummary: [
      `Predicta Relationship Mirror: ${firstName} + ${secondName}`,
      overview,
      `Talk this week: ${howToTalkThisWeek}`,
    ].join('\n'),
    status: 'ready',
    timingOverlap,
  };
}

function buildEvidence(
  first: KundliData,
  second: KundliData,
): RelationshipMirrorEvidence[] {
  const firstMercury = findPlanet(first, 'Mercury');
  const secondMercury = findPlanet(second, 'Mercury');
  const firstVenus = findPlanet(first, 'Venus');
  const secondVenus = findPlanet(second, 'Venus');
  const firstMars = findPlanet(first, 'Mars');
  const secondMars = findPlanet(second, 'Mars');
  const moonWeight = sameElement(first.moonSign, second.moonSign)
    ? 'harmony'
    : first.moonSign === second.moonSign
      ? 'harmony'
      : 'growth';

  return [
    {
      id: 'moon-style',
      interpretation:
        moonWeight === 'harmony'
          ? 'Their emotional rhythms can recognize each other more easily.'
          : 'They may need translation before reacting emotionally.',
      observation: `${first.birthDetails.name}: ${first.moonSign} Moon, ${first.nakshatra}. ${second.birthDetails.name}: ${second.moonSign} Moon, ${second.nakshatra}.`,
      person: 'both',
      title: 'Emotional style',
      weight: moonWeight,
    },
    {
      id: 'mercury-talk',
      interpretation:
        firstMercury && secondMercury && sameElement(firstMercury.sign, secondMercury.sign)
          ? 'Communication can land better when they stay specific.'
          : 'They should repeat back what they heard before concluding intent.',
      observation: `${planetLine(first.birthDetails.name, firstMercury)} ${planetLine(second.birthDetails.name, secondMercury)}`,
      person: 'both',
      title: 'Communication pattern',
      weight:
        firstMercury && secondMercury && sameElement(firstMercury.sign, secondMercury.sign)
          ? 'harmony'
          : 'growth',
    },
    {
      id: 'venus-commitment',
      interpretation:
        firstVenus && secondVenus && firstVenus.house === secondVenus.house
          ? 'Values may converge around similar relationship needs.'
          : 'Commitment expectations should be spoken plainly, not assumed.',
      observation: `${planetLine(first.birthDetails.name, firstVenus)} ${planetLine(second.birthDetails.name, secondVenus)}`,
      person: 'both',
      title: 'Commitment pattern',
      weight:
        firstVenus && secondVenus && firstVenus.house === secondVenus.house
          ? 'harmony'
          : 'neutral',
    },
    {
      id: 'mars-conflict',
      interpretation:
        firstMars && secondMars && sameElement(firstMars.sign, secondMars.sign)
          ? 'Conflict styles can escalate quickly unless they slow the pace.'
          : 'Conflict may come from different speeds of reaction.',
      observation: `${planetLine(first.birthDetails.name, firstMars)} ${planetLine(second.birthDetails.name, secondMars)}`,
      person: 'both',
      title: 'Conflict trigger',
      weight: 'friction',
    },
    {
      id: 'dasha-overlap',
      interpretation: compareDasha(first, second),
      observation: `${first.birthDetails.name}: ${first.dasha.current.mahadasha}/${first.dasha.current.antardasha}. ${second.birthDetails.name}: ${second.dasha.current.mahadasha}/${second.dasha.current.antardasha}.`,
      person: 'both',
      title: 'Timing overlap',
      weight:
        first.dasha.current.mahadasha === second.dasha.current.mahadasha
          ? 'harmony'
          : 'growth',
    },
  ];
}

function buildSections(
  first: KundliData,
  second: KundliData,
  evidence: RelationshipMirrorEvidence[],
): RelationshipMirrorSection[] {
  return [
    {
      advice: 'Name the feeling before solving it.',
      area: 'emotional-style',
      evidenceIds: ['moon-style'],
      summary: evidenceById(evidence, 'moon-style').interpretation,
      title: 'Emotional mirror',
    },
    {
      advice: 'Use short sentences and ask, "what did you hear me say?"',
      area: 'communication',
      evidenceIds: ['mercury-talk'],
      summary: evidenceById(evidence, 'mercury-talk').interpretation,
      title: 'Communication',
    },
    {
      advice: 'Do not test loyalty indirectly. Ask for the commitment behavior you need.',
      area: 'commitment',
      evidenceIds: ['venus-commitment'],
      summary: evidenceById(evidence, 'venus-commitment').interpretation,
      title: 'Commitment pattern',
    },
    {
      advice: 'Pause before replying when either person sounds rushed, blamed, or unheard.',
      area: 'conflict',
      evidenceIds: ['mars-conflict'],
      summary: evidenceById(evidence, 'mars-conflict').interpretation,
      title: 'Conflict trigger',
    },
    {
      advice: 'Plan important conversations when both people have space, not during pressure peaks.',
      area: 'timing',
      evidenceIds: ['dasha-overlap'],
      summary: compareDasha(first, second),
      title: 'Timing overlap',
    },
    {
      advice: buildHowToTalk(first, second),
      area: 'weekly-advice',
      evidenceIds: ['moon-style', 'mercury-talk', 'dasha-overlap'],
      summary: 'This week works best through explicit reassurance and slower replies.',
      title: 'How to talk this week',
    },
  ];
}

function buildOverview(first: KundliData, second: KundliData): string {
  if (sameElement(first.moonSign, second.moonSign)) {
    return 'Their emotional worlds can find a shared language, but timing still needs care.';
  }

  return 'This connection can be meaningful when both people translate their emotional needs instead of assuming them.';
}

function buildHowToTalk(first: KundliData, second: KundliData): string {
  const firstMercury = findPlanet(first, 'Mercury');
  const secondMercury = findPlanet(second, 'Mercury');

  if (firstMercury && secondMercury && sameElement(firstMercury.sign, secondMercury.sign)) {
    return 'Talk directly, pick one topic, and end with one agreed next step.';
  }

  return 'Use the sentence: "I may be hearing this differently. Can you say what you need in one simple line?"';
}

function buildTimingOverlap(first: KundliData, second: KundliData): string {
  const firstCurrent = first.dasha.current;
  const secondCurrent = second.dasha.current;

  if (firstCurrent.mahadasha === secondCurrent.mahadasha) {
    return `Both are in ${firstCurrent.mahadasha} Mahadasha, so similar life lessons may be loud at the same time.`;
  }

  return `${first.birthDetails.name} is in ${firstCurrent.mahadasha}/${firstCurrent.antardasha}; ${second.birthDetails.name} is in ${secondCurrent.mahadasha}/${secondCurrent.antardasha}. Respect different timing pressures.`;
}

function compareDasha(first: KundliData, second: KundliData): string {
  if (first.dasha.current.mahadasha === second.dasha.current.mahadasha) {
    return 'Shared Mahadasha themes can create recognition, but also mirrored pressure.';
  }

  return 'Different Mahadashas mean each person may be solving a different life lesson right now.';
}

function evidenceById(
  evidence: RelationshipMirrorEvidence[],
  id: string,
): RelationshipMirrorEvidence {
  return evidence.find(item => item.id === id) ?? evidence[0];
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function planetLine(name: string, planet?: PlanetPosition): string {
  if (!planet) {
    return `${name}: planet not available.`;
  }

  return `${name}: ${planet.name} in ${planet.sign}, house ${planet.house}.`;
}

function sameElement(firstSign: string, secondSign: string): boolean {
  return (
    (WATER_SIGNS.has(firstSign) && WATER_SIGNS.has(secondSign)) ||
    (FIRE_SIGNS.has(firstSign) && FIRE_SIGNS.has(secondSign)) ||
    (AIR_SIGNS.has(firstSign) && AIR_SIGNS.has(secondSign)) ||
    (EARTH_SIGNS.has(firstSign) && EARTH_SIGNS.has(secondSign))
  );
}
