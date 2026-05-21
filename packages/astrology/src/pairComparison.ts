import type {
  FamilyMemberProfile,
  FamilyRelationshipLabel,
  KundliData,
  PairComparison,
  PairComparisonHighlight,
  PairComparisonPremiumSection,
  PairComparisonTone,
  PlanetPosition,
} from '@pridicta/types';

type PairComparisonOptions = {
  depth?: 'FREE' | 'PREMIUM';
};

const WATER_SIGNS = new Set(['Cancer', 'Scorpio', 'Pisces']);
const FIRE_SIGNS = new Set(['Aries', 'Leo', 'Sagittarius']);
const AIR_SIGNS = new Set(['Gemini', 'Libra', 'Aquarius']);
const EARTH_SIGNS = new Set(['Taurus', 'Virgo', 'Capricorn']);

export function composePairComparison(
  first?: KundliData,
  second?: KundliData,
  options: PairComparisonOptions = {},
): PairComparison {
  if (!first || !second) {
    const firstProfile = toFamilyProfile(first);
    const secondProfile = toFamilyProfile(second);
    return {
      status: 'pending',
      firstProfile,
      secondProfile,
      relationshipContextLabel: buildRelationshipContextLabel(
        firstProfile.relationship,
        secondProfile.relationship,
      ),
      headline: 'Choose exactly two saved profiles to unlock Pair Comparison.',
      overview:
        'Pair Comparison reads two real Kundlis for practical harmony, friction, karma, dharma, and next-step guidance. It is not only for marriage.',
      overallTone: 'mixed',
      harmonyAreas: [],
      frictionAreas: [],
      karmaTheme:
        'Predicta will name the central karma theme once both profiles are selected.',
      dharmaLesson:
        'Predicta will show the shared dharma lesson after both charts are present.',
      practicalGuidance:
        'Pick two saved profiles from Family Vault. Predicta will not invent relationship patterns without both charts.',
      freeHighlights: [],
      premiumSections: [],
      shareSummary: 'Predicta Pair Comparison is waiting for two saved profiles.',
      askPrompt:
        'Explain what Pair Comparison will do once exactly two saved profiles are selected. Keep it useful, non-fatalistic, and not marriage-only.',
    };
  }

  const firstProfile = toFamilyProfile(first);
  const secondProfile = toFamilyProfile(second);
  const tone = comparePairTone(first, second);
  const supportZones = sharedSupportZones(first, second);
  const tensionZones = sharedTensionZones(first, second);
  const harmonyAreas = buildHarmonyAreas(first, second, supportZones);
  const frictionAreas = buildFrictionAreas(first, second, tensionZones);
  const karmaTheme = buildKarmaTheme(first, second, tensionZones);
  const dharmaLesson = buildDharmaLesson(
    firstProfile.relationship,
    secondProfile.relationship,
  );
  const practicalGuidance = buildPracticalGuidance(
    tone,
    firstProfile.relationship,
    secondProfile.relationship,
  );
  const freeHighlights = buildFreeHighlights(
    first,
    second,
    tone,
    harmonyAreas,
    frictionAreas,
    karmaTheme,
    dharmaLesson,
    practicalGuidance,
  );
  const premiumSections = buildPremiumSections(
    first,
    second,
    tone,
    supportZones,
    tensionZones,
  );
  const relationshipContextLabel = buildRelationshipContextLabel(
    firstProfile.relationship,
    secondProfile.relationship,
  );

  return {
    status: 'ready',
    firstProfile,
    secondProfile,
    relationshipContextLabel,
    headline: `${first.birthDetails.name} and ${second.birthDetails.name}: ${pairHeadline(tone)}`,
    overview:
      tone === 'supportive'
        ? 'This pair has useful natural bridges, but maturity and timing still matter more than chart chemistry alone.'
        : tone === 'careful'
          ? 'This pair can still work in real life, but it needs clearer expectations, slower reactions, and better conflict hygiene.'
          : 'This pair is workable when both people respect different emotional timing instead of assuming the same style.',
    overallTone: tone,
    harmonyAreas,
    frictionAreas,
    karmaTheme,
    dharmaLesson,
    practicalGuidance,
    freeHighlights,
    premiumSections:
      options.depth === 'PREMIUM' ? premiumSections : premiumSections,
    shareSummary: [
      `Predicta Pair Comparison: ${first.birthDetails.name} + ${second.birthDetails.name}`,
      `Tone: ${pairHeadline(tone)}`,
      `Karma theme: ${karmaTheme}`,
      `Dharma lesson: ${dharmaLesson}`,
    ].join('\n'),
    askPrompt: [
      `Compare ${first.birthDetails.name} and ${second.birthDetails.name} as a Family Vault pair.`,
      'Focus on harmony areas, friction areas, one karma theme, one dharma lesson, and a practical next step.',
      'Keep it life-area-focused and non-fatalistic, not technical jargon.',
    ].join(' '),
  };
}

function toFamilyProfile(kundli?: KundliData): FamilyMemberProfile {
  return {
    currentDasha: kundli
      ? `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`
      : 'Pending',
    id: kundli?.id ?? 'pending',
    isOwnerProfile: Boolean(kundli?.isOwnerProfile),
    lagna: kundli?.lagna ?? 'Pending',
    moonSign: kundli?.moonSign ?? 'Pending',
    nakshatra: kundli?.nakshatra ?? 'Pending',
    name: kundli?.birthDetails.name ?? 'Pending profile',
    relationship: kundli?.relationshipToOwner ?? 'other',
    relationshipColorToken: kundli?.relationshipColorToken ?? 'sage',
    relationshipDisplayLabel:
      kundli?.relationshipDisplayLabel ?? labelFromRelationship(kundli?.relationshipToOwner ?? 'other'),
  };
}

function buildFreeHighlights(
  first: KundliData,
  second: KundliData,
  tone: PairComparisonTone,
  harmonyAreas: string[],
  frictionAreas: string[],
  karmaTheme: string,
  dharmaLesson: string,
  practicalGuidance: string,
): PairComparisonHighlight[] {
  return [
    {
      id: 'overall-tone',
      title: 'Overall relationship tone',
      summary: pairHeadline(tone),
      guidance: practicalGuidance,
      evidence: [
        `${first.birthDetails.name}: ${first.moonSign} Moon and ${first.dasha.current.mahadasha} Mahadasha.`,
        `${second.birthDetails.name}: ${second.moonSign} Moon and ${second.dasha.current.mahadasha} Mahadasha.`,
      ],
    },
    {
      id: 'harmony',
      title: 'Harmony areas',
      summary: harmonyAreas.join(' '),
      guidance: 'Lean on these areas first when the relationship is under pressure.',
      evidence: supportEvidence(first, second),
    },
    {
      id: 'friction',
      title: 'Friction areas',
      summary: frictionAreas.join(' '),
      guidance: 'Name these issues early instead of waiting for a bigger reaction.',
      evidence: tensionEvidence(first, second),
    },
    {
      id: 'karma-theme',
      title: 'One karma theme',
      summary: karmaTheme,
      guidance: 'Treat the repeating lesson as something to work with, not a fixed label.',
      evidence: buildKarmaEvidence(first, second),
    },
    {
      id: 'dharma-lesson',
      title: 'One dharma lesson',
      summary: dharmaLesson,
      guidance: practicalGuidance,
      evidence: buildDharmaEvidence(first, second),
    },
  ];
}

function buildPremiumSections(
  first: KundliData,
  second: KundliData,
  tone: PairComparisonTone,
  supportZones: number[],
  tensionZones: number[],
): PairComparisonPremiumSection[] {
  const firstMercury = findPlanet(first, 'Mercury');
  const secondMercury = findPlanet(second, 'Mercury');
  const firstVenus = findPlanet(first, 'Venus');
  const secondVenus = findPlanet(second, 'Venus');
  const firstMars = findPlanet(first, 'Mars');
  const secondMars = findPlanet(second, 'Mars');

  return [
    {
      id: 'emotional-rhythm',
      title: 'Emotional rhythm',
      summary:
        sameElement(first.moonSign, second.moonSign)
          ? 'Their emotional language can meet naturally, so reassurance lands faster.'
          : 'They may feel the same event differently, so translation matters before reaction.',
      guidance:
        'Ask what the other person is feeling before deciding what they meant.',
      evidence: [
        `${first.birthDetails.name}: ${first.moonSign} Moon in ${first.nakshatra}.`,
        `${second.birthDetails.name}: ${second.moonSign} Moon in ${second.nakshatra}.`,
      ],
    },
    {
      id: 'communication-style',
      title: 'Communication style',
      summary:
        firstMercury && secondMercury && sameElement(firstMercury.sign, secondMercury.sign)
          ? 'The speech rhythm can sync well when both stay specific.'
          : 'Their speech timing may differ, so quick assumptions can create needless tension.',
      guidance:
        'Use one-topic conversations and repeat back key decisions in plain language.',
      evidence: [
        planetEvidence(first.birthDetails.name, firstMercury),
        planetEvidence(second.birthDetails.name, secondMercury),
      ],
    },
    {
      id: 'duty-friction',
      title: 'Family duty and expectation friction',
      summary:
        tensionZones.includes(4) || tensionZones.includes(10)
          ? 'Home responsibility or public duty can become a pressure point if one person carries the invisible work.'
          : 'Duty mismatch looks manageable, but expectations still need to be spoken clearly.',
      guidance:
        'Clarify who owns which responsibility instead of letting resentment do the speaking.',
      evidence: [
        `Shared tension houses: ${tensionZones.join(', ') || 'none repeated'}.`,
        `Current Mahadashas: ${first.dasha.current.mahadasha} and ${second.dasha.current.mahadasha}.`,
      ],
    },
    {
      id: 'money-alignment',
      title: 'Finance and value alignment',
      summary:
        supportZones.includes(2) || supportZones.includes(11)
          ? 'Money values can cooperate when both keep the plan explicit.'
          : 'Money style may differ in pace or comfort level, so shared rules matter more than assumptions.',
      guidance:
        'Agree on one savings rule, one spending rule, and one point where both must consult each other.',
      evidence: [
        `Support zones: ${supportZones.join(', ') || 'none repeated'}.`,
        `Weak-value zones: ${tensionZones.join(', ') || 'none repeated'}.`,
      ],
    },
    {
      id: 'responsibility-balance',
      title: 'Responsibility balance',
      summary:
        tone === 'supportive'
          ? 'Responsibility can be shared well if the pair keeps small check-ins consistent.'
          : tone === 'careful'
            ? 'One person may start carrying the emotional or practical burden unless roles are reset early.'
            : 'Responsibility balance is workable, but it should not be left to guesswork.',
      guidance: 'Make invisible work visible before it becomes anger.',
      evidence: [
        `${first.birthDetails.name} current chapter: ${first.dasha.current.mahadasha}/${first.dasha.current.antardasha}.`,
        `${second.birthDetails.name} current chapter: ${second.dasha.current.mahadasha}/${second.dasha.current.antardasha}.`,
      ],
    },
    {
      id: 'healing-potential',
      title: 'Healing potential',
      summary:
        supportZones.length >= 2
          ? 'This pair has enough natural support to recover well after tension when the repair is honest.'
          : 'Healing is still possible, but it needs deliberate repair habits instead of emotional guessing.',
      guidance: 'After conflict, ask for one repair action instead of one more explanation.',
      evidence: supportEvidence(first, second),
    },
    {
      id: 'timing-window',
      title: 'Supportive timing windows',
      summary:
        first.dasha.current.mahadasha === second.dasha.current.mahadasha
          ? 'Shared Mahadasha can make growth easier to understand, but it can also amplify the same pressure at the same time.'
          : 'Different Mahadashas mean the pair should respect different life clocks instead of forcing one pace.',
      guidance:
        'Use low-pressure days for important talks; do not make serious decisions in the first heat of conflict.',
      evidence: [
        `${first.birthDetails.name}: ${first.dasha.current.mahadasha}/${first.dasha.current.antardasha}.`,
        `${second.birthDetails.name}: ${second.dasha.current.mahadasha}/${second.dasha.current.antardasha}.`,
      ],
    },
  ];
}

function comparePairTone(first: KundliData, second: KundliData): PairComparisonTone {
  let score = 0;

  if (first.moonSign === second.moonSign || sameElement(first.moonSign, second.moonSign)) {
    score += 2;
  }
  if (sharedSupportZones(first, second).length >= 2) {
    score += 1;
  }
  if (sharedTensionZones(first, second).length >= 2) {
    score -= 2;
  }
  if (!sameElement(planetSign(first, 'Mars'), planetSign(second, 'Mars'))) {
    score -= 1;
  }

  if (score >= 2) {
    return 'supportive';
  }
  if (score <= -1) {
    return 'careful';
  }
  return 'mixed';
}

function buildHarmonyAreas(first: KundliData, second: KundliData, supportZones: number[]): string[] {
  const areas: string[] = [];
  if (first.moonSign === second.moonSign || sameElement(first.moonSign, second.moonSign)) {
    areas.push('Their emotional rhythm has at least one natural bridge, so reassurance can land when both slow down.');
  }
  if (supportZones.includes(2) || supportZones.includes(11)) {
    areas.push('Shared support around values, gains, or practical cooperation can make planning easier.');
  }
  if (supportZones.includes(4) || supportZones.includes(7)) {
    areas.push('Home, care, or partnership themes can become a support zone when both people stay explicit.');
  }
  if (!areas.length) {
    areas.push('Their support styles are different, but that can still become a strength when responsibilities are divided clearly.');
  }
  return areas.slice(0, 3);
}

function buildFrictionAreas(first: KundliData, second: KundliData, tensionZones: number[]): string[] {
  const areas: string[] = [];
  if (!sameElement(first.moonSign, second.moonSign)) {
    areas.push('They may process emotion through different speeds or tones, so quick assumptions can hurt the bond.');
  }
  if (tensionZones.includes(6) || tensionZones.includes(8)) {
    areas.push('Stress, repair, or hidden resentment can build if difficult topics are delayed for too long.');
  }
  if (first.dasha.current.mahadasha === second.dasha.current.mahadasha) {
    areas.push('Similar timing pressure can create empathy, but it can also make both people less emotionally available at once.');
  }
  if (!areas.length) {
    areas.push('The main risk is not one dramatic flaw. It is letting small misunderstandings repeat without repair.');
  }
  return areas.slice(0, 3);
}

function buildKarmaTheme(first: KundliData, second: KundliData, tensionZones: number[]): string {
  if (tensionZones.includes(4) || tensionZones.includes(8)) {
    return 'This pair keeps learning that emotional safety cannot be assumed. It has to be rebuilt through steadier repair and honest care.';
  }
  if (tensionZones.includes(2) || tensionZones.includes(11)) {
    return 'This pair carries a karma lesson around values, expectations, and how support is given or received.';
  }
  return 'The central karma theme is learning how to respect different pacing without turning difference into rejection.';
}

function buildDharmaLesson(
  firstRelationship: FamilyRelationshipLabel,
  secondRelationship: FamilyRelationshipLabel,
): string {
  const pairKey = [firstRelationship, secondRelationship].sort().join(':');
  if (/mother|father|son|daughter|niece|nephew/.test(pairKey)) {
    return 'The dharma here is guidance without control and care without emotional overreach.';
  }
  if (/spouse|partner|fiance/.test(pairKey)) {
    return 'The dharma here is direct truth, emotional steadiness, and not making silence carry the whole relationship.';
  }
  if (/manager|co-worker|business-partner|mentor|student/.test(pairKey)) {
    return 'The dharma here is role clarity, fairness, and respect for different responsibilities.';
  }
  return 'The dharma here is to make expectations explicit, keep dignity intact, and repair small breaks before they grow.';
}

function buildPracticalGuidance(
  tone: PairComparisonTone,
  firstRelationship: FamilyRelationshipLabel,
  secondRelationship: FamilyRelationshipLabel,
): string {
  if (firstRelationship === 'manager' || secondRelationship === 'manager') {
    return 'Keep role boundaries clear, put decisions in writing, and do not use emotional guessing where structure is needed.';
  }
  if (
    ['spouse', 'partner', 'fiance'].includes(firstRelationship) ||
    ['spouse', 'partner', 'fiance'].includes(secondRelationship)
  ) {
    return tone === 'careful'
      ? 'Slow the pace, discuss expectations directly, and do not treat conflict as proof that the bond is failing.'
      : 'Use direct reassurance, keep one shared routine steady, and talk before resentment hardens.';
  }
  if (tone === 'supportive') {
    return 'Use the natural support already present here. Small honest check-ins will carry this pair further than dramatic promises.';
  }
  if (tone === 'careful') {
    return 'Keep conversations shorter, cleaner, and more specific. This pair improves through clarity, not emotional force.';
  }
  return 'Respect different styles, set one practical agreement, and review it before the next tension cycle.';
}

function buildRelationshipContextLabel(
  firstRelationship: FamilyRelationshipLabel,
  secondRelationship: FamilyRelationshipLabel,
): string {
  return `${labelFromRelationship(firstRelationship)} and ${labelFromRelationship(secondRelationship)}`;
}

function labelFromRelationship(relationship: FamilyRelationshipLabel): string {
  return relationship
    .split('-')
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function sharedSupportZones(first: KundliData, second: KundliData): number[] {
  const firstZones = first.ashtakavarga.strongestHouses.slice(0, 4);
  const secondZones = second.ashtakavarga.strongestHouses.slice(0, 4);
  return firstZones.filter(house => secondZones.includes(house));
}

function sharedTensionZones(first: KundliData, second: KundliData): number[] {
  const firstZones = first.ashtakavarga.weakestHouses.slice(0, 4);
  const secondZones = second.ashtakavarga.weakestHouses.slice(0, 4);
  return firstZones.filter(house => secondZones.includes(house));
}

function supportEvidence(first: KundliData, second: KundliData): string[] {
  return [
    `${first.birthDetails.name} strong houses: ${first.ashtakavarga.strongestHouses.slice(0, 3).join(', ')}.`,
    `${second.birthDetails.name} strong houses: ${second.ashtakavarga.strongestHouses.slice(0, 3).join(', ')}.`,
  ];
}

function tensionEvidence(first: KundliData, second: KundliData): string[] {
  return [
    `${first.birthDetails.name} sensitive houses: ${first.ashtakavarga.weakestHouses.slice(0, 3).join(', ')}.`,
    `${second.birthDetails.name} sensitive houses: ${second.ashtakavarga.weakestHouses.slice(0, 3).join(', ')}.`,
  ];
}

function buildKarmaEvidence(first: KundliData, second: KundliData): string[] {
  return [
    `Current chapters: ${first.dasha.current.mahadasha} and ${second.dasha.current.mahadasha}.`,
    `Shared tension zones: ${sharedTensionZones(first, second).join(', ') || 'none repeated'}.`,
  ];
}

function buildDharmaEvidence(first: KundliData, second: KundliData): string[] {
  return [
    `Shared support zones: ${sharedSupportZones(first, second).join(', ') || 'none repeated'}.`,
    `Moon signs: ${first.moonSign} and ${second.moonSign}.`,
  ];
}

function planetEvidence(name: string, planet?: PlanetPosition): string {
  if (!planet) {
    return `${name}: chart preparation is needed for this planet detail.`;
  }
  return `${name}: ${planet.name} in ${planet.sign}, house ${planet.house}.`;
}

function planetSign(kundli: KundliData, planetName: string): string {
  return findPlanet(kundli, planetName)?.sign ?? '';
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function sameElement(firstSign?: string, secondSign?: string): boolean {
  if (!firstSign || !secondSign) {
    return false;
  }
  const groups = [WATER_SIGNS, FIRE_SIGNS, AIR_SIGNS, EARTH_SIGNS];
  return groups.some(group => group.has(firstSign) && group.has(secondSign));
}

function pairHeadline(tone: PairComparisonTone): string {
  if (tone === 'supportive') {
    return 'strong support with manageable friction';
  }
  if (tone === 'careful') {
    return 'real potential, but only with steadier handling';
  }
  return 'mixed, workable, and timing-sensitive';
}
