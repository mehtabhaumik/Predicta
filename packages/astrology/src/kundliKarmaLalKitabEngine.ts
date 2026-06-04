import type {
  KundliData,
  KundliKarmaActivation,
  KundliKarmaConfidence,
  KundliKarmaEvidence,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaItemStatus,
  KundliKarmaRemedy,
  KundliKarmaStrength,
  PlanetPosition,
} from '@pridicta/types';
import {
  KUNDLI_KARMA_CONTRACT_VERSION,
  KUNDLI_KARMA_DEPTH_CONTRACT,
  getKundliKarmaRuleProvenance,
} from './kundliKarmaContract';

const LAL_KITAB_RULE_IDS = [
  'rule-lal-kitab-planet-house',
  'rule-lal-kitab-rin',
  'rule-lal-kitab-upay',
  'rule-lal-kitab-unsupported-variation',
] as const;

const CLASSICAL_AND_NODES = new Set(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']);
const HOUSE_FOCUS: Record<number, string> = {
  1: 'identity and first response',
  2: 'speech, family resources, and values',
  3: 'courage, siblings, and effort',
  4: 'home, emotional foundation, and mother-line duties',
  5: 'children, learning, creativity, and continuity',
  6: 'service, discipline, debts, and conflict handling',
  7: 'partnership, contracts, and public dealing',
  8: 'inheritance, hidden pressure, and transformation',
  9: 'father-line duty, dharma, teachers, and blessings',
  10: 'work, status, authority, and public karma',
  11: 'networks, gains, elder support, and fulfillment',
  12: 'release, sleep, expense, foreign ties, and private life',
};
const PLANET_TONE: Record<string, string> = {
  Jupiter: 'wisdom, counsel, faith, and generosity',
  Ketu: 'release, detachment, ancestral residue, and subtle correction',
  Mars: 'courage, impulse, land, siblings, and direct action',
  Mercury: 'speech, trade, learning, and nervous decision-making',
  Moon: 'care, emotion, mother-line memory, and daily stability',
  Rahu: 'hunger, unusual desire, shadow pressure, and shortcuts',
  Saturn: 'duty, delay, service, workers, and long-term accountability',
  Sun: 'father-line duty, authority, self-respect, and ego correction',
  Venus: 'comfort, relationship conduct, beauty, and material refinement',
};
const SAFE_UPAY: Record<string, { do: string; avoid: string }> = {
  Jupiter: {
    avoid: 'Do not use advice or faith to dominate others.',
    do: 'Share knowledge humbly, respect teachers, and help students or children in a simple way.',
  },
  Ketu: {
    avoid: 'Do not turn detachment into neglect of real duties.',
    do: 'Practice quiet service, keep spaces clean, and release one unnecessary habit at a time.',
  },
  Mars: {
    avoid: 'Do not act from anger, risky speed, or ego pressure.',
    do: 'Use physical effort constructively and repair conflict through direct but respectful action.',
  },
  Mercury: {
    avoid: 'Do not manipulate through speech, gossip, or clever half-truths.',
    do: 'Keep promises, speak clearly, and support learning, books, or skill-building.',
  },
  Moon: {
    avoid: 'Do not punish yourself through emotional isolation.',
    do: 'Care for mother-line duties, keep sleep stable, and offer gentle food or care where appropriate.',
  },
  Rahu: {
    avoid: 'Do not chase shortcuts, intoxication, or image games when pressure rises.',
    do: 'Choose honest restraint, clean boundaries, and one practical detox from chaotic habits.',
  },
  Saturn: {
    avoid: 'Do not disrespect workers, elders, time, or long commitments.',
    do: 'Serve patiently, honor labor, keep routines, and finish one neglected responsibility.',
  },
  Sun: {
    avoid: 'Do not turn pride into harshness toward father, authority, or dependents.',
    do: 'Practice humility, respect rightful authority, and repair father-line or leadership duties.',
  },
  Venus: {
    avoid: 'Do not use comfort, beauty, or affection as escape from responsibility.',
    do: 'Keep relationship conduct fair, simplify excess luxury, and practice gratitude in partnership.',
  },
};

export function composeKundliKarmaLalKitabIntelligence(kundli?: KundliData): KundliKarmaIntelligence {
  if (!kundli) {
    return buildPendingIntelligence();
  }

  const planetItems = kundli.planets
    .filter(planet => CLASSICAL_AND_NODES.has(planet.name))
    .map(planet => buildPlanetHouseReading(kundli, planet));
  const rinItems = buildRinIndicators(kundli);
  const upayItems = buildUpayItems(kundli, [...planetItems, ...rinItems]);
  const unsupported = buildUnsupportedVariation(kundli);
  const items = rankLalKitabItems([...planetItems, ...rinItems, ...upayItems, unsupported]);
  const visibleSignals = items
    .filter(item => ['present', 'weak'].includes(item.status))
    .slice(0, 3)
    .map(item => item.displayName);

  return {
    calculationStatus: items.some(item => item.status === 'needs_data') ? 'partial' : 'ready',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items,
    missingData: items
      .filter(item => item.status === 'needs_data' || item.status === 'pending_evidence')
      .map(item => `${item.displayName}: ${item.whyPresent}`),
    noAiRequiredFor: [
      'show Lal Kitab summary',
      'show Lal Kitab planet-in-house reading',
      'show Lal Kitab Rin indicators',
      'show one safe Lal Kitab upay',
      'explain unsupported Lal Kitab variation',
    ],
    safetyNotes: [
      'Lal Kitab remains a separate remedial layer from Parashari Dosh, Shrap, and Yog.',
      'Predicta recommends one safe remedy at a time and avoids harmful, illegal, clinical, guaranteed, or expensive-pressure claims.',
      'Free output shows top observations and simple safe upay; premium adds full house-wise reading, timing, contraindications, and 40-day/90-day planning.',
    ],
    subjectName: kundli.birthDetails.name,
    summary: visibleSignals.length
      ? `Predicta found ${visibleSignals.join(', ')} as the top Lal Kitab observations with safe, one-at-a-time upay guidance.`
      : 'Predicta did not find a major Lal Kitab observation in the implemented deterministic checks.',
    topSignals: visibleSignals,
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPendingIntelligence(): KundliKarmaIntelligence {
  return {
    calculationStatus: 'needs_data',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items: LAL_KITAB_RULE_IDS.map(ruleId =>
      createLalKitabItem({
        displayName: getRuleName(ruleId),
        meaningForUser: 'Create or select a Kundli before Predicta reads Lal Kitab evidence.',
        ruleId,
        status: 'needs_data',
        summary: 'Kundli data is required before this Lal Kitab item can be checked.',
        whyPresent: 'Missing Kundli data.',
      }),
    ),
    missingData: ['Kundli data'],
    noAiRequiredFor: ['explain that Lal Kitab checks need Kundli data'],
    safetyNotes: ['No Lal Kitab item is inferred without Kundli evidence.'],
    subjectName: 'Pending Kundli',
    summary: 'Kundli data is needed before Predicta can check Lal Kitab evidence.',
    topSignals: [],
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPlanetHouseReading(kundli: KundliData, planet: PlanetPosition): KundliKarmaItem {
  const focus = HOUSE_FOCUS[planet.house] ?? 'life conduct';
  const tone = PLANET_TONE[planet.name] ?? 'practical conduct';
  const strength = strengthForPlanetHouse(planet);
  return createLalKitabItem({
    activation: activationFor(kundli, planet.name),
    displayName: `Lal Kitab ${planet.name} in house ${planet.house}`,
    evidence: [planetEvidence(`lal-kitab-${planet.name.toLowerCase()}-house-${planet.house}`, planet)],
    meaningForUser: `${planet.name} brings ${tone} into ${focus}. The practical reading is to correct conduct in this area before adding any remedy.`,
    ruleId: 'rule-lal-kitab-planet-house',
    status: 'present',
    strength,
    summary: `${planet.name} in house ${planet.house} gives a Lal Kitab planet-in-house observation.`,
    whyPresent: `${planet.name} is in house ${planet.house}, ${planet.sign}, ${formatDegree(planet.degree)}°, ${planet.nakshatra} pada ${planet.pada}.`,
  });
}

function buildRinIndicators(kundli: KundliData): KundliKarmaItem[] {
  const sun = findPlanet(kundli, 'Sun');
  const moon = findPlanet(kundli, 'Moon');
  const jupiter = findPlanet(kundli, 'Jupiter');
  const saturn = findPlanet(kundli, 'Saturn');
  const rahu = findPlanet(kundli, 'Rahu');
  const ketu = findPlanet(kundli, 'Ketu');
  const indicators: KundliKarmaItem[] = [];

  if (sun && (sun.house === 9 || sharesHouseOrSign(sun, saturn) || sharesHouseOrSign(sun, rahu))) {
    indicators.push(
      rinItem({
        displayName: 'Lal Kitab Pitru Rin indicator',
        evidence: [
          planetEvidence('lal-kitab-pitru-rin-sun', sun),
          ...optionalPairEvidence('lal-kitab-pitru-rin-saturn', sun, saturn),
          ...optionalPairEvidence('lal-kitab-pitru-rin-rahu', sun, rahu),
        ],
        meaning:
          'Father-line duty, authority conduct, and gratitude need clean repair. The useful path is humility, responsibility, and not repeating pride-based family patterns.',
        planet: 'Sun',
        strength: sun.house === 9 && (saturn || rahu) ? 'high' : 'medium',
        why: 'Sun/father-line evidence is emphasized by house or Saturn/Rahu pressure.',
      }),
    );
  }

  if (moon && (moon.house === 4 || sharesHouseOrSign(moon, saturn) || sharesHouseOrSign(moon, rahu))) {
    indicators.push(
      rinItem({
        displayName: 'Lal Kitab Matru Rin indicator',
        evidence: [
          planetEvidence('lal-kitab-matru-rin-moon', moon),
          ...optionalPairEvidence('lal-kitab-matru-rin-saturn', moon, saturn),
          ...optionalPairEvidence('lal-kitab-matru-rin-rahu', moon, rahu),
        ],
        meaning:
          'Mother-line care, emotional conduct, and home duties need gentle correction. The useful path is steady care without guilt or emotional extremes.',
        planet: 'Moon',
        strength: moon.house === 4 && (saturn || rahu) ? 'high' : 'medium',
        why: 'Moon/mother-line evidence is emphasized by house or Saturn/Rahu pressure.',
      }),
    );
  }

  if (jupiter && (jupiter.house === 5 || jupiter.house === 9 || sharesHouseOrSign(jupiter, rahu) || sharesHouseOrSign(jupiter, ketu))) {
    indicators.push(
      rinItem({
        displayName: 'Lal Kitab Guru Rin indicator',
        evidence: [
          planetEvidence('lal-kitab-guru-rin-jupiter', jupiter),
          ...optionalPairEvidence('lal-kitab-guru-rin-rahu', jupiter, rahu),
          ...optionalPairEvidence('lal-kitab-guru-rin-ketu', jupiter, ketu),
        ],
        meaning:
          'Knowledge, teachers, children, and dharma need respectful handling. The useful path is learning with humility and helping someone grow.',
        planet: 'Jupiter',
        strength: sharesHouseOrSign(jupiter, rahu) || sharesHouseOrSign(jupiter, ketu) ? 'high' : 'medium',
        why: 'Jupiter/guru-line evidence is emphasized by house or node pressure.',
      }),
    );
  }

  return indicators.length
    ? indicators
    : [
        createLalKitabItem({
          displayName: 'Lal Kitab Rin / debt indicators',
          evidence: [
            {
              description: 'The implemented Rin rules do not raise Pitru, Matru, or Guru Rin from this fixture.',
              id: 'lal-kitab-rin-not-present',
              kind: 'context_boundary',
              weight: 'none',
            },
          ],
          meaningForUser: 'Predicta does not raise a Lal Kitab Rin indicator from the implemented evidence.',
          ruleId: 'rule-lal-kitab-rin',
          status: 'not_present',
          strength: 'none',
          summary: 'Not present in the implemented deterministic check.',
          whyPresent: 'No implemented Rin indicator was found.',
        }),
      ];
}

function rinItem({
  displayName,
  evidence,
  meaning,
  planet,
  strength,
  why,
}: {
  displayName: string;
  evidence: KundliKarmaEvidence[];
  meaning: string;
  planet: string;
  strength: KundliKarmaStrength;
  why: string;
}): KundliKarmaItem {
  return createLalKitabItem({
    activation: { confidence: 'partial', summary: `${planet} timing can make this Rin indicator more noticeable.` },
    displayName,
    evidence,
    meaningForUser: meaning,
    ruleId: 'rule-lal-kitab-rin',
    status: 'present',
    strength,
    summary: `${displayName} is active from deterministic Lal Kitab Rin evidence.`,
    whyPresent: why,
  });
}

function buildUpayItems(kundli: KundliData, sourceItems: KundliKarmaItem[]): KundliKarmaItem[] {
  const activePlanetNames = sourceItems
    .flatMap(item => item.evidence.map(evidence => evidence.planet).filter((name): name is string => Boolean(name)))
    .filter(name => SAFE_UPAY[name]);
  const unique = [...new Set(activePlanetNames)].slice(0, 3);
  if (!unique.length) {
    return [
      createLalKitabItem({
        displayName: 'Lal Kitab safe upay',
        evidence: [{ description: 'No active planet-specific upay is selected until planet evidence exists.', id: 'lal-kitab-upay-pending', kind: 'missing_data', weight: 'none' }],
        meaningForUser: 'Predicta waits for planet evidence before recommending a Lal Kitab upay.',
        ruleId: 'rule-lal-kitab-upay',
        status: 'needs_data',
        strength: 'none',
        summary: 'Planet evidence is needed before selecting upay.',
        whyPresent: 'No planet evidence available.',
      }),
    ];
  }
  return unique.map((planetName, index) => {
    const planet = findPlanet(kundli, planetName);
    const upay = SAFE_UPAY[planetName];
    return createLalKitabItem({
      activation: activationFor(kundli, planetName),
      displayName: `Lal Kitab ${planetName} upay`,
      evidence: planet
        ? [planetEvidence(`lal-kitab-${planetName.toLowerCase()}-upay-evidence`, planet)]
        : [{ description: `${planetName} evidence selected from active Lal Kitab items.`, id: `lal-kitab-${planetName.toLowerCase()}-upay-evidence`, kind: 'lal_kitab_house', planet: planetName, weight: 'medium' }],
      meaningForUser: `Start with one ${planetName} upay only: ${upay.do} Avoid-list: ${upay.avoid}`,
      ruleId: 'rule-lal-kitab-upay',
      status: 'present',
      strength: index === 0 ? 'high' : 'medium',
      summary: `Safe one-at-a-time Lal Kitab upay selected for ${planetName}.`,
      whyPresent: `${planetName} appears in active Lal Kitab evidence, so Predicta chooses a safe practical upay.`,
    });
  });
}

function buildUnsupportedVariation(kundli: KundliData): KundliKarmaItem {
  return createLalKitabItem({
    displayName: 'Lal Kitab unsupported tradition variation',
    evidence: [
      {
        description: `Tradition-dependent Lal Kitab claims are not activated for ${kundli.birthDetails.name} without approved deterministic evidence.`,
        id: 'lal-kitab-unsupported-variation',
        kind: 'missing_data',
        weight: 'none',
      },
    ],
    meaningForUser:
      'If a Lal Kitab rule is tradition-dependent, Predicta marks it pending instead of making a strong claim or recommending an unsafe remedy.',
    ruleId: 'rule-lal-kitab-unsupported-variation',
    status: 'needs_data',
    strength: 'none',
    summary: 'Unsupported Lal Kitab variation remains needs-data.',
    whyPresent: 'Approved deterministic rule evidence is pending.',
  });
}

function createLalKitabItem({
  activation,
  displayName,
  evidence = [],
  meaningForUser,
  ruleId,
  status,
  strength = 'medium',
  summary,
  whyPresent,
}: {
  activation?: KundliKarmaActivation;
  displayName: string;
  evidence?: KundliKarmaEvidence[];
  meaningForUser: string;
  ruleId: string;
  status: KundliKarmaItemStatus;
  strength?: KundliKarmaStrength;
  summary: string;
  whyPresent: string;
}): KundliKarmaItem {
  const rule = getKundliKarmaRuleProvenance(ruleId);
  return {
    activation: activation ?? {
      confidence: status === 'present' || status === 'weak' ? 'partial' : 'uncertain',
      summary:
        status === 'present' || status === 'weak'
          ? 'Activation is read through matching dasha/transit triggers when available.'
          : 'Activation is not interpreted for this status.',
    },
    confidence: confidenceFor(status),
    crossReferences: [],
    displayName,
    evidence,
    id: `${ruleId.replace('rule-', '')}-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    meaningForUser,
    module: 'LAL_KITAB',
    reductions: [],
    remedies: remediesFor(ruleId, displayName),
    ruleId,
    sourceReferenceIds: rule?.sourceReferenceIds ?? [],
    status,
    strength,
    summary,
    whyPresent,
  };
}

function remediesFor(ruleId: string, displayName: string): KundliKarmaRemedy[] {
  return [
    {
      depth: 'free',
      description: `For ${displayName}, do one safe correction for 40 days: simple service, respectful conduct, clean routine, or the specific one-planet upay shown in the reading.`,
      id: `${ruleId}-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-free-remedy`,
      safetyNote: 'Use one safe remedy at a time. Do not mix many remedies or spend under fear.',
      title: 'One safe 40-day correction',
      tradition: 'lal_kitab',
    },
    {
      depth: 'premium',
      description:
        'Premium can add full house-wise reading, Rin map, planet remedies, timing, contraindications, avoid-list, and a 40-day/90-day plan after safety review.',
      id: `${ruleId}-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-premium-remedy`,
      safetyNote: 'Premium Lal Kitab depth must remain low-cost, legal, non-clinical, non-harmful, and never guaranteed.',
      title: 'Structured Lal Kitab plan',
      tradition: 'lal_kitab',
    },
  ];
}

function planetEvidence(id: string, planet: PlanetPosition): KundliKarmaEvidence {
  return {
    chart: 'D1',
    degree: planet.degree,
    description: `${planet.name} is in house ${planet.house}, ${planet.sign}, ${formatDegree(planet.degree)}°, ${planet.nakshatra} pada ${planet.pada}.`,
    house: planet.house,
    id,
    kind: 'lal_kitab_house',
    nakshatra: planet.nakshatra,
    pada: planet.pada,
    planet: planet.name,
    sign: planet.sign,
    weight: strengthForPlanetHouse(planet),
  };
}

function optionalPairEvidence(id: string, first: PlanetPosition, second?: PlanetPosition): KundliKarmaEvidence[] {
  if (!second || !sharesHouseOrSign(first, second)) {
    return [];
  }
  return [
    {
      chart: 'D1',
      degree: first.degree,
      description: `${first.name} and ${second.name} share house ${first.house}/${second.house} and sign ${first.sign}/${second.sign}.`,
      house: first.house,
      id,
      kind: 'lal_kitab_house',
      planet: first.name,
      relatedPlanet: second.name,
      sign: first.sign,
      weight: 'medium',
    },
  ];
}

function activationFor(kundli: KundliData, planet: string): KundliKarmaActivation {
  const current = kundli.dasha?.current;
  const active = current?.mahadasha === planet || current?.antardasha === planet;
  return {
    antardasha: current?.antardasha,
    confidence: active ? 'clear' : 'partial',
    dasha: current?.mahadasha,
    summary: active
      ? `${planet} is active in current dasha timing, so start with one safe Lal Kitab correction now.`
      : `${planet} is not the main current dasha lord; treat this as background Lal Kitab guidance unless later timing activates it.`,
  };
}

function confidenceFor(status: KundliKarmaItemStatus): KundliKarmaConfidence {
  if (status === 'present' || status === 'not_present') {
    return 'clear';
  }
  if (status === 'needs_data' || status === 'pending_evidence') {
    return 'uncertain';
  }
  return 'partial';
}

function rankLalKitabItems(items: KundliKarmaItem[]): KundliKarmaItem[] {
  const statusScore: Record<KundliKarmaItemStatus, number> = {
    present: 70,
    weak: 50,
    cancelled: 30,
    pending_evidence: 25,
    needs_data: 20,
    blocked_context: 10,
    not_present: 0,
  };
  const strengthScore: Record<KundliKarmaStrength, number> = {
    very_high: 5,
    high: 4,
    medium: 3,
    low: 2,
    none: 0,
  };
  return [...items].sort(
    (first, second) =>
      statusScore[second.status] +
      strengthScore[second.strength] -
      (statusScore[first.status] + strengthScore[first.strength]),
  );
}

function strengthForPlanetHouse(planet: PlanetPosition): KundliKarmaStrength {
  if (['Rahu', 'Ketu', 'Saturn'].includes(planet.name) && [6, 8, 12].includes(planet.house)) {
    return 'high';
  }
  if (['Sun', 'Moon', 'Jupiter'].includes(planet.name) && [4, 5, 9].includes(planet.house)) {
    return 'high';
  }
  if ([1, 4, 7, 10].includes(planet.house)) {
    return 'medium';
  }
  return 'low';
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(planet => planet.name === name);
}

function sharesHouseOrSign(first: PlanetPosition | undefined, second: PlanetPosition | undefined): boolean {
  return Boolean(first && second && (first.house === second.house || first.sign === second.sign));
}

function formatDegree(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function getRuleName(ruleId: string): string {
  return getKundliKarmaRuleProvenance(ruleId)?.displayName ?? ruleId;
}
