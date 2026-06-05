import type {
  KundliData,
  KundliKarmaActivation,
  KundliKarmaConfidence,
  KundliKarmaEvidence,
  KundliKarmaEvidenceKind,
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

const SHRAP_RULE_IDS = [
  'rule-shrap-pitru',
  'rule-shrap-matru',
  'rule-shrap-guru',
  'rule-shrap-sarpa-naga',
  'rule-shrap-preta',
  'rule-shrap-bhratri-bandhu',
  'rule-shrap-stree-patni',
  'rule-shrap-deva-brahma',
] as const;

const NODE_NAMES = new Set(['Rahu', 'Ketu']);
const DUSTHANA_HOUSES = new Set([6, 8, 12]);

export function composeKundliKarmaShrapIntelligence(kundli?: KundliData): KundliKarmaIntelligence {
  if (!kundli) {
    return buildPendingIntelligence();
  }

  const items = rankShrapItems([
    buildPitruShrap(kundli),
    buildMatruShrap(kundli),
    buildGuruShrap(kundli),
    buildSarpaNagaShrap(kundli),
    buildPretaShrap(kundli),
    buildBhratriBandhuShrap(kundli),
    buildStreePatniShrap(kundli),
    buildDevaBrahmaShrap(kundli),
  ]);
  const visibleSignals = items
    .filter(item => ['present', 'weak'].includes(item.status))
    .slice(0, 3)
    .map(item => `${item.displayName} indicator`);

  return {
    calculationStatus: items.some(item => item.status === 'needs_data') ? 'partial' : 'ready',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items,
    missingData: items
      .filter(item => item.status === 'needs_data' || item.status === 'pending_evidence')
      .map(item => `${item.displayName}: ${item.whyPresent}`),
    noAiRequiredFor: [
      'show Shrap summary',
      'explain karmic debt indicators',
      'show Shrap evidence',
      'show Shrap remedies',
      'explain why a Shrap indicator is pending',
    ],
    safetyNotes: [
      'Predicta uses Shrap as a karmic pressure indicator, not a frightening label.',
      'Shrap output is read as a karmic debt or karmic pressure indicator, not certainty.',
      'Remedies are dharma actions, repair, service, discipline, gratitude, and safe spiritual practice.',
    ],
    subjectName: kundli.birthDetails.name,
    summary: visibleSignals.length
      ? `Predicta found ${visibleSignals.join(', ')} as the main Karmic Debt & Shrap indicators to review calmly.`
      : 'Predicta did not find a major active Shrap indicator in the current chart evidence.',
    topSignals: visibleSignals,
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPendingIntelligence(): KundliKarmaIntelligence {
  return {
    calculationStatus: 'needs_data',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items: SHRAP_RULE_IDS.map(ruleId =>
      createShrapItem({
        displayName: getRuleName(ruleId),
        meaningForUser: 'Create or select a Kundli before Predicta reads Karmic Debt & Shrap indicators.',
        ruleId,
        status: 'needs_data',
        summary: 'Kundli data is required before this Shrap indicator can be checked.',
        whyPresent: 'Missing Kundli data.',
      }),
    ),
    missingData: ['Kundli data'],
    noAiRequiredFor: ['explain that Shrap checks need Kundli data'],
    safetyNotes: ['No Shrap indicator is inferred without Kundli evidence.'],
    subjectName: 'Pending Kundli',
    summary: 'Kundli data is needed before Predicta can check Karmic Debt & Shrap indicators.',
    topSignals: [],
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPitruShrap(kundli: KundliData): KundliKarmaItem {
  const sun = findPlanet(kundli, 'Sun');
  const ninthLord = lordPlanet(kundli, 9);
  const evidence = [
    ...afflictionEvidence('pitru-sun', sun, ['Rahu', 'Saturn'], kundli),
    ...afflictionEvidence('pitru-ninth-lord', ninthLord, ['Rahu', 'Saturn'], kundli, 'lordship'),
  ];
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-pitru',
      'Pitru Shrap',
      'Sun and ninth-house lineage evidence do not show the approved Pitru Shrap indicator.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 2 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, sun?.name ?? ninthLord?.name ?? 'Sun'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Pitru Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong ancestral-duty indicator is visible. The guidance is to repair family responsibilities where possible, honor elders without carrying unhealthy guilt, and build your own dharma through steady service.'
        : 'A partial ancestral-duty indicator is visible. Treat it as a reminder to keep family obligations clean without assuming a harsh life sentence.',
    ruleId: 'rule-shrap-pitru',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Pitru Shrap indicator: multiple ancestry/dharma evidence lines are active.'
        : 'Partial Pitru Shrap indicator: one ancestry/dharma evidence line is active.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildMatruShrap(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  const fourthLord = lordPlanet(kundli, 4);
  const evidence = [
    ...afflictionEvidence('matru-moon', moon, ['Rahu', 'Saturn'], kundli),
    ...afflictionEvidence('matru-fourth-lord', fourthLord, ['Rahu', 'Saturn'], kundli, 'lordship'),
  ];
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-matru',
      'Matru Shrap',
      'Moon and fourth-house mother/home evidence do not show the approved Matru Shrap indicator.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 2 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, moon?.name ?? fourthLord?.name ?? 'Moon'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Matru Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong maternal/home-line karmic debt indicator is visible. The maturity path is emotional repair, gratitude without self-erasure, and creating a calmer home rhythm than the one you inherited.'
        : 'A partial maternal/home-line indicator is visible. The useful response is gentleness, emotional discipline, and not repeating old family reactions.',
    ruleId: 'rule-shrap-matru',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Matru Shrap indicator: multiple mother/home evidence lines are active.'
        : 'Partial Matru Shrap indicator: one mother/home evidence line is active.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildGuruShrap(kundli: KundliData): KundliKarmaItem {
  const jupiter = findPlanet(kundli, 'Jupiter');
  const ninthLord = lordPlanet(kundli, 9);
  const evidence = [
    ...afflictionEvidence('guru-jupiter', jupiter, ['Rahu', 'Ketu', 'Saturn'], kundli),
    ...afflictionEvidence('guru-ninth-lord', ninthLord, ['Rahu', 'Ketu', 'Saturn'], kundli, 'lordship'),
  ];
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-guru',
      'Guru Shrap',
      'Jupiter and guru/dharma evidence do not show the approved Guru Shrap indicator.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 2 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, 'Jupiter'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Guru Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong teacher/wisdom-line indicator is visible. The guidance is to respect real knowledge, verify advice before rejecting it, and avoid ego battles with mentors, teachers, or spiritual guidance.'
        : 'A partial teacher/wisdom indicator is visible. It asks you to choose humility and good counsel without blindly surrendering your judgment.',
    ruleId: 'rule-shrap-guru',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Guru Shrap indicator: multiple wisdom/dharma evidence lines are active.'
        : 'Partial Guru Shrap indicator: one wisdom/dharma evidence line is active.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildSarpaNagaShrap(kundli: KundliData): KundliKarmaItem {
  const fifthLord = lordPlanet(kundli, 5);
  const nodesInFifth = kundli.planets.filter(planet => NODE_NAMES.has(planet.name) && planet.house === 5);
  const evidence: KundliKarmaEvidence[] = [
    ...nodesInFifth.map((planet, index) => planetEvidence(`sarpa-node-fifth-${index + 1}`, planet, 'planet_house')),
    ...afflictionEvidence('sarpa-fifth-lord', fifthLord, ['Rahu', 'Ketu'], kundli, 'lordship'),
  ];
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-sarpa-naga',
      'Sarpa / Naga Shrap',
      'Rahu/Ketu do not pressure the visible chart evidence.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 2 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, evidence[0]?.planet ?? 'Rahu'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Sarpa / Naga Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong lineage-continuity indicator is visible. The path is respect for life, patience with children/creative continuity themes, and steady ethical repair rather than fear-based ritual pressure.'
        : 'A partial Sarpa/Naga indicator is visible. Treat it as a call for patience, respect for living beings, and thoughtful continuity in family or creative duties.',
    ruleId: 'rule-shrap-sarpa-naga',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Sarpa / Naga Shrap indicator: multiple node/fifth-house evidence lines are active.'
        : 'Partial Sarpa / Naga Shrap indicator: one node/fifth-house evidence line is active.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildPretaShrap(kundli: KundliData): KundliKarmaItem {
  return createShrapItem({
    displayName: 'Preta Shrap',
    evidence: missingEvidence(
      'preta-shrap-needs-data',
      `Approved deterministic Preta Shrap evidence is not active for ${kundli.birthDetails.name}.`,
    ),
    meaningForUser:
      'Predicta does not make unsupported invisible-claim readings. This Shrap category remains pending until safe deterministic evidence and language are approved.',
    ruleId: 'rule-shrap-preta',
    status: 'needs_data',
    strength: 'none',
    summary: 'Preta Shrap remains needs-data for safety.',
    whyPresent: 'Approved deterministic Preta Shrap evidence is pending; Predicta will not fake this indicator.',
  });
}

function buildBhratriBandhuShrap(kundli: KundliData): KundliKarmaItem {
  const mars = findPlanet(kundli, 'Mars');
  const thirdLord = lordPlanet(kundli, 3);
  const evidence = [
    ...afflictionEvidence('bhratri-mars', mars, ['Rahu', 'Saturn'], kundli),
    ...afflictionEvidence('bhratri-third-lord', thirdLord, ['Rahu', 'Saturn'], kundli, 'lordship'),
  ];
  if (thirdLord && DUSTHANA_HOUSES.has(thirdLord.house)) {
    evidence.push(planetEvidence('bhratri-third-lord-dusthana', thirdLord, 'lordship'));
  }
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-bhratri-bandhu',
      'Bhratri / Bandhu Shrap',
      'Mars and third-house sibling/support evidence do not show the approved Bhratri/Bandhu Shrap indicator.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 2 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, mars?.name ?? thirdLord?.name ?? 'Mars'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Bhratri / Bandhu Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong sibling/support-circle debt indicator is visible. The guidance is to reduce rivalry, keep promises with relatives and close allies, and not let pride block repair.'
        : 'A partial sibling/support indicator is visible. It asks for cleaner communication and fewer impulsive breaks in close support relationships.',
    ruleId: 'rule-shrap-bhratri-bandhu',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Bhratri / Bandhu Shrap indicator: multiple sibling/support evidence lines are active.'
        : 'Partial Bhratri / Bandhu Shrap indicator: one sibling/support evidence line is active.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildStreePatniShrap(kundli: KundliData): KundliKarmaItem {
  const venus = findPlanet(kundli, 'Venus');
  const seventhLord = lordPlanet(kundli, 7);
  const evidence = [
    ...afflictionEvidence('stree-venus', venus, ['Rahu', 'Saturn', 'Mars'], kundli),
    ...afflictionEvidence('stree-seventh-lord', seventhLord, ['Rahu', 'Saturn', 'Mars'], kundli, 'lordship'),
  ];
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-stree-patni',
      'Stree / Patni Shrap',
      'Venus and seventh-house relationship evidence do not show the approved Stree/Patni Shrap indicator.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 2 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, venus?.name ?? seventhLord?.name ?? 'Venus'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Stree / Patni Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong relationship-respect debt indicator is visible. The maturity path is fairness, consent, emotional honesty, and not using affection as control or avoidance.'
        : 'A partial relationship-respect indicator is visible. It asks for cleaner partnership conduct and steady repair instead of blame.',
    ruleId: 'rule-shrap-stree-patni',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Stree / Patni Shrap indicator: multiple relationship evidence lines are active.'
        : 'Partial Stree / Patni Shrap indicator: one relationship evidence line is active.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildDevaBrahmaShrap(kundli: KundliData): KundliKarmaItem {
  const sun = findPlanet(kundli, 'Sun');
  const jupiter = findPlanet(kundli, 'Jupiter');
  const ninthLord = lordPlanet(kundli, 9);
  const evidence = [
    ...afflictionEvidence('deva-sun', sun, ['Rahu', 'Ketu', 'Saturn'], kundli),
    ...afflictionEvidence('deva-jupiter', jupiter, ['Rahu', 'Ketu', 'Saturn'], kundli),
    ...afflictionEvidence('deva-ninth-lord', ninthLord, ['Rahu', 'Ketu', 'Saturn'], kundli, 'lordship'),
  ];
  if (!evidence.length) {
    return notPresentItem(
      'rule-shrap-deva-brahma',
      'Deva / Brahma Shrap',
      'Sun, Jupiter, and ninth-house dharma evidence do not show the approved Deva/Brahma Shrap indicator.',
    );
  }
  const status: KundliKarmaItemStatus = evidence.length >= 3 ? 'present' : 'weak';
  return createShrapItem({
    activation: activationFor(kundli, jupiter?.name ?? sun?.name ?? ninthLord?.name ?? 'Jupiter'),
    crossReferences: shrapitDoshReferences(kundli),
    displayName: 'Deva / Brahma Shrap',
    evidence,
    meaningForUser:
      status === 'present'
        ? 'A strong dharma/reverence indicator is visible. The guidance is disciplined spiritual conduct, gratitude, truthful learning, and avoiding arrogance toward sacred duties or knowledge.'
        : 'A partial dharma/reverence indicator is visible. Treat it as a reminder to keep spiritual practice humble, honest, and useful.',
    ruleId: 'rule-shrap-deva-brahma',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'Strong Deva / Brahma Shrap indicator: multiple dharma/reverence evidence lines are active.'
        : 'Partial Deva / Brahma Shrap indicator: the evidence stays indicator-level, not certainty.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function createShrapItem({
  activation,
  crossReferences = [],
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
  crossReferences?: KundliKarmaItem['crossReferences'];
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
    crossReferences,
    displayName,
    evidence,
    id: ruleId.replace('rule-', ''),
    meaningForUser,
    module: 'SHRAP',
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

function notPresentItem(ruleId: string, displayName: string, reason: string): KundliKarmaItem {
  return createShrapItem({
    displayName,
    evidence: [
      {
        description: reason,
        id: `${ruleId}-not-present-evidence`,
        kind: 'context_boundary',
        weight: 'none',
      },
    ],
    meaningForUser: 'Predicta does not raise this Shrap indicator from the visible chart evidence.',
    ruleId,
    status: 'not_present',
    strength: 'none',
    summary: 'Not present in the current chart check.',
    whyPresent: reason,
  });
}

function missingEvidence(id: string, description: string): KundliKarmaEvidence[] {
  return [{ description, id, kind: 'missing_data', weight: 'none' }];
}

function afflictionEvidence(
  idPrefix: string,
  target: PlanetPosition | undefined,
  afflictorNames: string[],
  kundli: KundliData,
  kind: KundliKarmaEvidenceKind = 'conjunction',
): KundliKarmaEvidence[] {
  if (!target) {
    return [];
  }
  return afflictorNames
    .map(name => findPlanet(kundli, name))
    .filter((planet): planet is PlanetPosition => Boolean(planet && sameHouseOrSign(target, planet)))
    .map((planet, index) => pairEvidence(`${idPrefix}-${planet.name.toLowerCase()}-${index + 1}`, target, planet, kind));
}

function planetEvidence(
  id: string,
  planet: PlanetPosition,
  kind: KundliKarmaEvidenceKind,
): KundliKarmaEvidence {
  return {
    chart: 'D1',
    degree: planet.degree,
    description: `${planet.name} is in house ${planet.house}, ${planet.sign}, ${formatDegree(planet.degree)}°, ${planet.nakshatra} pada ${planet.pada}.`,
    house: planet.house,
    id,
    kind,
    nakshatra: planet.nakshatra,
    pada: planet.pada,
    planet: planet.name,
    sign: planet.sign,
    weight: 'medium',
  };
}

function pairEvidence(
  id: string,
  first: PlanetPosition,
  second: PlanetPosition,
  kind: KundliKarmaEvidenceKind,
): KundliKarmaEvidence {
  return {
    chart: 'D1',
    degree: first.degree,
    description: `${first.name} and ${second.name} share house ${first.house}/${second.house} and sign ${first.sign}/${second.sign}; degrees ${formatDegree(first.degree)}° and ${formatDegree(second.degree)}°.`,
    house: first.house,
    id,
    kind,
    nakshatra: first.nakshatra,
    pada: first.pada,
    planet: first.name,
    relatedPlanet: second.name,
    sign: first.sign,
    weight: closeByDegree(first, second, 8) ? 'high' : 'medium',
  };
}

function shrapitDoshReferences(kundli: KundliData): KundliKarmaItem['crossReferences'] {
  const saturn = findPlanet(kundli, 'Saturn');
  const rahu = findPlanet(kundli, 'Rahu');
  if (!saturn || !rahu || !sameHouseOrSign(saturn, rahu)) {
    return [];
  }
  return [
    {
      itemId: 'shrapit-dosh',
      module: 'DOSH',
      note: 'Saturn-Rahu Shrapit evidence is owned by the Dosh section; this Shrap section cross-references it instead of repeating the full reading.',
      relationship: 'do_not_duplicate',
      ruleId: 'rule-dosh-shrapit',
    },
  ];
}

function remediesFor(ruleId: string, displayName: string): KundliKarmaRemedy[] {
  return [
    {
      depth: 'free',
      description: `For ${displayName}, choose one simple dharma repair: gratitude, apology, service, discipline, or care toward the related person/life area.`,
      id: `${ruleId}-free-remedy`,
      safetyNote: 'Free remedy stays simple, safe, low-cost, and non-coercive.',
      title: 'Simple dharma repair',
      tradition: 'karma_dharma',
    },
    {
      depth: 'premium',
      description:
        'Premium can add mantra, vrata, donation timing, family-duty repair, avoid-list, and Lal Kitab-safe upay after evidence and contraindications are reviewed.',
      id: `${ruleId}-premium-remedy`,
      safetyNote: 'Premium depth must not become expensive fear-based remedy pressure.',
      title: 'Structured karmic debt remedy plan',
      tradition: 'vedic',
    },
  ];
}

function activationFor(kundli: KundliData, planet: string): KundliKarmaActivation {
  const current = kundli.dasha?.current;
  const active =
    current?.mahadasha === planet || current?.antardasha === planet
      ? `${current.mahadasha} Mahadasha / ${current.antardasha} Antardasha`
      : undefined;
  return {
    antardasha: current?.antardasha,
    confidence: active ? 'clear' : 'partial',
    dasha: current?.mahadasha,
    summary: active
      ? `${planet} is active in current dasha timing, so this Shrap indicator deserves practical attention now.`
      : `${planet} is not the main current dasha lord; treat this as background guidance unless later timing activates it.`,
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

function rankShrapItems(items: KundliKarmaItem[]): KundliKarmaItem[] {
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

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(planet => planet.name === name);
}

function lordPlanet(kundli: KundliData, houseNumber: number): PlanetPosition | undefined {
  const house = kundli.houses.find(item => item.house === houseNumber);
  return house?.lord ? findPlanet(kundli, house.lord) : undefined;
}

function sameHouseOrSign(first: PlanetPosition, second: PlanetPosition): boolean {
  return first.house === second.house || first.sign === second.sign;
}

function closeByDegree(first: PlanetPosition, second: PlanetPosition, orb: number): boolean {
  return Math.abs(first.absoluteLongitude - second.absoluteLongitude) <= orb;
}

function formatDegree(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function getRuleName(ruleId: string): string {
  return getKundliKarmaRuleProvenance(ruleId)?.displayName ?? ruleId;
}
