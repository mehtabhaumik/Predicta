import type {
  KundliData,
  KundliKarmaActivation,
  KundliKarmaConfidence,
  KundliKarmaEvidence,
  KundliKarmaEvidenceKind,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaItemStatus,
  KundliKarmaModule,
  KundliKarmaReduction,
  KundliKarmaRemedy,
  KundliKarmaStrength,
  PlanetPosition,
} from '@pridicta/types';
import {
  KUNDLI_KARMA_CONTRACT_VERSION,
  KUNDLI_KARMA_DEPTH_CONTRACT,
  getKundliKarmaRuleProvenance,
} from './kundliKarmaContract';

const YOG_RULE_IDS = [
  'rule-yog-raja',
  'rule-yog-dhana',
  'rule-yog-gajakesari',
  'rule-yog-panch-mahapurush',
  'rule-yog-neecha-bhanga-raja',
  'rule-yog-vipareeta-raja',
  'rule-yog-budhaditya',
  'rule-yog-chandra-mangal',
  'rule-yog-lakshmi',
  'rule-yog-saraswati',
  'rule-yog-adhi',
  'rule-yog-dharma-karmadhipati',
  'rule-yog-parivartana',
  'rule-yog-challenging-daridra',
  'rule-yog-challenging-kemadruma',
  'rule-yog-challenging-shakata',
  'rule-yog-challenging-paap-kartari',
  'rule-yog-challenging-grahan',
  'rule-yog-challenging-vish',
  'rule-yog-challenging-angarak',
  'rule-yog-challenging-shrapit',
  'rule-yog-challenging-arishta',
  'rule-yog-challenging-kuja-manglik',
  'rule-yog-challenging-kaal-sarp',
] as const;

const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury']);
const CLASSICAL_GRAHAS = new Set(['Moon', 'Sun', 'Mars', 'Jupiter', 'Venus', 'Saturn', 'Mercury']);
const MALEFICS = new Set(['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun']);
const DUSTHANA_HOUSES = new Set([6, 8, 12]);
const KENDRA_HOUSES = new Set([1, 4, 7, 10]);
const TRIKONA_HOUSES = new Set([1, 5, 9]);
const MANGLIK_HOUSES = new Set([1, 4, 7, 8, 12]);
const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};
const OWN_SIGNS: Record<string, string[]> = {
  Jupiter: ['Sagittarius', 'Pisces'],
  Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'],
  Moon: ['Cancer'],
  Saturn: ['Capricorn', 'Aquarius'],
  Sun: ['Leo'],
  Venus: ['Taurus', 'Libra'],
};
const EXALTATION_SIGNS: Record<string, string> = {
  Jupiter: 'Cancer',
  Mars: 'Capricorn',
  Mercury: 'Virgo',
  Moon: 'Taurus',
  Saturn: 'Libra',
  Sun: 'Aries',
  Venus: 'Pisces',
};
const DEBILITATION_SIGNS: Record<string, string> = {
  Jupiter: 'Capricorn',
  Mars: 'Cancer',
  Mercury: 'Pisces',
  Moon: 'Scorpio',
  Saturn: 'Aries',
  Sun: 'Libra',
  Venus: 'Virgo',
};

export function composeKundliKarmaYogIntelligence(kundli?: KundliData): KundliKarmaIntelligence {
  if (!kundli) {
    return buildPendingIntelligence();
  }

  const items = rankYogItems([
    buildRajaYog(kundli),
    buildDhanaYog(kundli),
    buildGajakesariYog(kundli),
    buildPanchMahapurushYog(kundli),
    buildNeechaBhangaRajaYog(kundli),
    buildVipareetaRajaYog(kundli),
    buildBudhadityaYog(kundli),
    buildChandraMangalYog(kundli),
    buildLakshmiYog(kundli),
    buildSaraswatiYog(kundli),
    buildAdhiYog(kundli),
    buildDharmaKarmadhipatiYog(kundli),
    buildParivartanaYog(kundli),
    buildChallengingDaridraYog(kundli),
    buildChallengingKemadrumaYog(kundli),
    buildShakataYog(kundli),
    buildChallengingPaapKartariYog(kundli),
    buildChallengingGrahanYog(kundli),
    buildChallengingVishYog(kundli),
    buildChallengingAngarakYog(kundli),
    buildChallengingShrapitYog(kundli),
    buildChallengingArishtaYog(kundli),
    buildChallengingKujaManglikYog(kundli),
    buildChallengingKaalSarpYog(kundli),
  ]);
  const activeSupportive = items.filter(item => item.module === 'SUPPORTIVE_YOG' && activeStatus(item.status));
  const activeChallenging = items.filter(item => item.module === 'CHALLENGING_YOG' && activeStatus(item.status));
  const visibleSignals = [...activeSupportive.slice(0, 2), ...activeChallenging.slice(0, 1)].map(
    item => item.displayName,
  );

  return {
    calculationStatus: items.some(item => item.status === 'needs_data') ? 'partial' : 'ready',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items,
    missingData: items
      .filter(item => item.status === 'needs_data' || item.status === 'pending_evidence')
      .map(item => `${item.displayName}: ${item.whyPresent}`),
    noAiRequiredFor: [
      'show Yog summary',
      'explain supportive Yog evidence',
      'explain challenging Yog evidence',
      'show Yog remedies',
      'show Yog cross-references',
    ],
    safetyNotes: [
      'Predicta reads Yog as support and friction guidance, not a fixed fate.',
      'Supportive and challenging Yog can coexist; the contradiction note explains how promise and pressure both operate.',
      'Overlapping Dosh/Shrap/Yog conditions are cross-referenced instead of repeated.',
    ],
    subjectName: kundli.birthDetails.name,
    summary: visibleSignals.length
      ? `Predicta found ${visibleSignals.join(', ')} as the main Yog signals: support first, friction second, with exact evidence.`
      : 'Predicta did not find a major active Yog signal in the current chart evidence.',
    topSignals: visibleSignals,
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPendingIntelligence(): KundliKarmaIntelligence {
  return {
    calculationStatus: 'needs_data',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items: YOG_RULE_IDS.map(ruleId =>
      createYogItem({
        displayName: getRuleName(ruleId),
        meaningForUser: 'Create or select a Kundli before Predicta reads Yog evidence.',
        module: ruleId.includes('challenging') ? 'CHALLENGING_YOG' : 'SUPPORTIVE_YOG',
        ruleId,
        status: 'needs_data',
        summary: 'Kundli data is required before this Yog can be checked.',
        whyPresent: 'Missing Kundli data.',
      }),
    ),
    missingData: ['Kundli data'],
    noAiRequiredFor: ['explain that Yog checks need Kundli data'],
    safetyNotes: ['No Yog is inferred without Kundli evidence.'],
    subjectName: 'Pending Kundli',
    summary: 'Kundli data is needed before Predicta can check Yog evidence.',
    topSignals: [],
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildRajaYog(kundli: KundliData): KundliKarmaItem {
  const kendraLords = [1, 4, 7, 10].map(house => lordPlanet(kundli, house));
  const trikonaLords = [1, 5, 9].map(house => lordPlanet(kundli, house));
  const pair = connectedPair(kendraLords, trikonaLords);
  if (!pair) {
    return notPresentItem('rule-yog-raja', 'Raja Yog', 'SUPPORTIVE_YOG', 'Kendra and trikona lord evidence is not connected in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, pair[0].name),
    displayName: 'Raja Yog',
    evidence: [pairEvidence('raja-kendra-trikona', pair[0], pair[1], 'lordship')],
    meaningForUser:
      'Leadership grows when duty and purpose work together. This Yog supports recognition through responsibility, not shortcuts.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-raja',
    status: 'present',
    strength: strongPlanet(pair[0]) || strongPlanet(pair[1]) ? 'high' : 'medium',
    summary: 'Raja Yog is active because kendra and trikona lord evidence connects.',
    whyPresent: `${pair[0].name} and ${pair[1].name} connect through house/sign evidence.`,
  });
}

function buildDhanaYog(kundli: KundliData): KundliKarmaItem {
  const pair = connectedPair([lordPlanet(kundli, 2), lordPlanet(kundli, 11)], [lordPlanet(kundli, 5), lordPlanet(kundli, 9)]);
  if (!pair) {
    return notPresentItem('rule-yog-dhana', 'Dhana Yog', 'SUPPORTIVE_YOG', 'Wealth and fortune lord evidence is not connected in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, pair[0].name),
    displayName: 'Dhana Yog',
    evidence: [pairEvidence('dhana-wealth-fortune', pair[0], pair[1], 'lordship')],
    meaningForUser:
      'Resource-building support is visible. Money grows best through skill, planning, and clean alliances rather than scattered effort.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-dhana',
    status: 'present',
    strength: 'high',
    summary: 'Dhana Yog is active through wealth-growth lord connection.',
    whyPresent: `${pair[0].name} and ${pair[1].name} connect wealth and fortune evidence.`,
  });
}

function buildGajakesariYog(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  const jupiter = findPlanet(kundli, 'Jupiter');
  if (!moon || !jupiter || ![1, 4, 7, 10].includes(houseDistance(moon.house, jupiter.house))) {
    return notPresentItem('rule-yog-gajakesari', 'Gajakesari Yog', 'SUPPORTIVE_YOG', 'Jupiter is not in kendra from Moon in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, 'Jupiter'),
    displayName: 'Gajakesari Yog',
    evidence: [pairEvidence('gajakesari-moon-jupiter', moon, jupiter, 'chart_support')],
    meaningForUser:
      'Emotional intelligence and wise judgment can protect you during pressure. Use counsel, learning, and patience as real advantages.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-gajakesari',
    status: 'present',
    strength: strongPlanet(jupiter) ? 'high' : 'medium',
    summary: 'Gajakesari Yog is active because Jupiter supports Moon from a kendra position.',
    whyPresent: `Jupiter is ${houseDistance(moon.house, jupiter.house)} houses from Moon.`,
  });
}

function buildPanchMahapurushYog(kundli: KundliData): KundliKarmaItem {
  const planet = kundli.planets.find(item => ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(item.name) && KENDRA_HOUSES.has(item.house) && strongPlanet(item));
  if (!planet) {
    return notPresentItem('rule-yog-panch-mahapurush', 'Panch Mahapurush Yog', 'SUPPORTIVE_YOG', 'No eligible strong classical planet is in a kendra in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, planet.name),
    displayName: 'Panch Mahapurush Yog',
    evidence: [planetEvidence('panch-mahapurush-planet', planet, 'planet_house')],
    meaningForUser:
      'A strong personal capacity is visible. The chart supports mastery when this planet is used with discipline and maturity.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-panch-mahapurush',
    status: 'present',
    strength: 'high',
    summary: `${planet.name} forms the visible chart evidence.`,
    whyPresent: `${planet.name} is strong in ${planet.sign} and placed in kendra house ${planet.house}.`,
  });
}

function buildNeechaBhangaRajaYog(kundli: KundliData): KundliKarmaItem {
  const debilitated = kundli.planets.find(planet => DEBILITATION_SIGNS[planet.name] === planet.sign);
  if (!debilitated) {
    return notPresentItem('rule-yog-neecha-bhanga-raja', 'Neecha Bhanga Raja Yog', 'SUPPORTIVE_YOG', 'No debilitation-correction evidence is visible in the visible chart pattern.');
  }
  const debilityLord = findPlanet(kundli, SIGN_LORDS[debilitated.sign]);
  if (!debilityLord || !KENDRA_HOUSES.has(debilityLord.house)) {
    return createYogItem({
      displayName: 'Neecha Bhanga Raja Yog',
      evidence: [planetEvidence('neecha-debilitated-planet', debilitated, 'planet_sign')],
      meaningForUser:
        'A debilitation is visible, but the correction evidence is incomplete. Predicta marks this as pending rather than promising reversal.',
      module: 'SUPPORTIVE_YOG',
      ruleId: 'rule-yog-neecha-bhanga-raja',
      status: 'pending_evidence',
      strength: 'low',
      summary: 'Debilitation is visible, but cancellation evidence is incomplete.',
      whyPresent: `${debilitated.name} is debilitated in ${debilitated.sign}; correction lord kendra support is missing.`,
    });
  }
  return createYogItem({
    activation: activationFor(kundli, debilityLord.name),
    displayName: 'Neecha Bhanga Raja Yog',
    evidence: [
      planetEvidence('neecha-debilitated-planet', debilitated, 'planet_sign'),
      planetEvidence('neecha-correction-lord', debilityLord, 'lordship'),
    ],
    meaningForUser:
      'A weakness can mature into strength through pressure, humility, and disciplined correction. This is not instant luck; it is earned rise.',
    module: 'SUPPORTIVE_YOG',
    reductions: [
      {
        confidence: 'clear',
        description: `${debilityLord.name} gives correction support from kendra house ${debilityLord.house}.`,
        evidenceIds: ['neecha-debilitated-planet', 'neecha-correction-lord'],
        id: 'neecha-bhanga-correction',
      },
    ],
    ruleId: 'rule-yog-neecha-bhanga-raja',
    status: 'present',
    strength: 'medium',
    summary: 'Neecha Bhanga Raja Yog is active through debilitation plus correction support.',
    whyPresent: `${debilitated.name} is debilitated in ${debilitated.sign}, and ${debilityLord.name} gives kendra correction support.`,
  });
}

function buildVipareetaRajaYog(kundli: KundliData): KundliKarmaItem {
  const dusthanaLords = [6, 8, 12].map(house => lordPlanet(kundli, house)).filter((planet): planet is PlanetPosition => Boolean(planet));
  const planet = dusthanaLords.find(item => DUSTHANA_HOUSES.has(item.house));
  if (!planet) {
    return notPresentItem('rule-yog-vipareeta-raja', 'Vipareeta Raja Yog', 'SUPPORTIVE_YOG', 'Dusthana lords do not occupy dusthana houses in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, planet.name),
    displayName: 'Vipareeta Raja Yog',
    evidence: [planetEvidence('vipareeta-dusthana-lord', planet, 'lordship')],
    meaningForUser:
      'Difficult terrain can become advantage when handled with patience. You rise by solving messy problems others avoid.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-vipareeta-raja',
    status: 'present',
    strength: 'medium',
    summary: 'Vipareeta Raja Yog is active through dusthana-lord-in-dusthana evidence.',
    whyPresent: `${planet.name} carries dusthana lord evidence and sits in house ${planet.house}.`,
  });
}

function buildBudhadityaYog(kundli: KundliData): KundliKarmaItem {
  return conjunctionYog(kundli, 'Sun', 'Mercury', 'rule-yog-budhaditya', 'Budhaditya Yog', 'SUPPORTIVE_YOG', 'Intelligence, communication, and authority can work together. Use this for clear decisions, writing, business, and leadership with facts.');
}

function buildChandraMangalYog(kundli: KundliData): KundliKarmaItem {
  return conjunctionYog(kundli, 'Moon', 'Mars', 'rule-yog-chandra-mangal', 'Chandra-Mangal Yog', 'SUPPORTIVE_YOG', 'Emotion and action combine strongly. It supports enterprise and initiative when impulse is disciplined.');
}

function buildLakshmiYog(kundli: KundliData): KundliKarmaItem {
  const ninthLord = lordPlanet(kundli, 9);
  const venus = findPlanet(kundli, 'Venus');
  if (!ninthLord || !venus || !(strongPlanet(ninthLord) && [...KENDRA_HOUSES, ...TRIKONA_HOUSES].includes(ninthLord.house))) {
    return notPresentItem('rule-yog-lakshmi', 'Lakshmi Yog', 'SUPPORTIVE_YOG', 'Ninth-lord strength and Venus support are not both visible in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, ninthLord.name),
    displayName: 'Lakshmi Yog',
    evidence: [planetEvidence('lakshmi-ninth-lord', ninthLord, 'lordship'), planetEvidence('lakshmi-venus', venus, 'chart_support')],
    meaningForUser:
      'Grace and resources grow when values, generosity, and disciplined effort stay aligned. This supports prosperity through clean conduct.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-lakshmi',
    status: 'present',
    strength: 'high',
    summary: 'Lakshmi Yog is active through strong ninth-lord and Venus support evidence.',
    whyPresent: `${ninthLord.name} is strong and Venus is available as prosperity support.`,
  });
}

function buildSaraswatiYog(kundli: KundliData): KundliKarmaItem {
  const planets = ['Jupiter', 'Venus', 'Mercury'].map(name => findPlanet(kundli, name));
  const supported = planets.filter((planet): planet is PlanetPosition => Boolean(planet && [1, 2, 4, 5, 7, 9, 10].includes(planet.house)));
  if (supported.length < 3) {
    return notPresentItem('rule-yog-saraswati', 'Saraswati Yog', 'SUPPORTIVE_YOG', 'Jupiter, Venus, and Mercury do not all occupy supported houses in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, 'Mercury'),
    displayName: 'Saraswati Yog',
    evidence: supported.map((planet, index) => planetEvidence(`saraswati-${index + 1}`, planet, 'chart_support')),
    meaningForUser:
      'Learning, expression, and refinement are major assets. This supports education, communication, art, advice, and elegant problem-solving.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-saraswati',
    status: 'present',
    strength: 'high',
    summary: 'Saraswati Yog is active through Jupiter, Venus, and Mercury support.',
    whyPresent: 'Jupiter, Venus, and Mercury occupy supported houses in the visible chart pattern.',
  });
}

function buildAdhiYog(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  const benefics = moon ? kundli.planets.filter(planet => BENEFICS.has(planet.name) && [6, 7, 8].includes(houseDistance(moon.house, planet.house))) : [];
  if (!moon || benefics.length < 2) {
    return notPresentItem('rule-yog-adhi', 'Adhi Yog', 'SUPPORTIVE_YOG', 'Benefic support in sixth/seventh/eighth from Moon is not strong enough in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, benefics[0].name),
    displayName: 'Adhi Yog',
    evidence: benefics.map((planet, index) => pairEvidence(`adhi-benefic-${index + 1}`, moon, planet, 'chart_support')),
    meaningForUser:
      'Pressure can be handled with composure because supportive forces protect the mind. Use diplomacy, counsel, and measured strategy.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-adhi',
    status: benefics.length >= 3 ? 'present' : 'weak',
    strength: benefics.length >= 3 ? 'high' : 'medium',
    summary: 'Adhi Yog is visible through benefic support around Moon.',
    whyPresent: `${benefics.map(planet => planet.name).join(', ')} support Moon from the tested houses.`,
  });
}

function buildDharmaKarmadhipatiYog(kundli: KundliData): KundliKarmaItem {
  const ninthLord = lordPlanet(kundli, 9);
  const tenthLord = lordPlanet(kundli, 10);
  if (!ninthLord || !tenthLord || !sameHouseOrSign(ninthLord, tenthLord)) {
    return notPresentItem('rule-yog-dharma-karmadhipati', 'Dharma-Karmadhipati Yog', 'SUPPORTIVE_YOG', 'Ninth and tenth lords are not connected in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, tenthLord.name),
    displayName: 'Dharma-Karmadhipati Yog',
    evidence: [pairEvidence('dharma-karma-lords', ninthLord, tenthLord, 'lordship')],
    meaningForUser:
      'Purpose and work can align. Career becomes stronger when it serves a meaningful principle instead of only status.',
    module: 'SUPPORTIVE_YOG',
    ruleId: 'rule-yog-dharma-karmadhipati',
    status: 'present',
    strength: 'high',
    summary: 'Dharma-Karmadhipati Yog is active through ninth/tenth lord connection.',
    whyPresent: `${ninthLord.name} and ${tenthLord.name} connect dharma and career evidence.`,
  });
}

function buildParivartanaYog(kundli: KundliData): KundliKarmaItem {
  for (const first of kundli.planets) {
    const firstLord = SIGN_LORDS[first.sign];
    const second = firstLord ? findPlanet(kundli, firstLord) : undefined;
    if (second && SIGN_LORDS[second.sign] === first.name && first.name !== second.name) {
      return createYogItem({
        activation: activationFor(kundli, first.name),
        displayName: 'Parivartana Yog',
        evidence: [pairEvidence('parivartana-exchange', first, second, 'lordship')],
        meaningForUser:
          'Two life areas exchange strength and responsibility. Progress comes when you coordinate both areas instead of treating them separately.',
        module: 'SUPPORTIVE_YOG',
        ruleId: 'rule-yog-parivartana',
        status: 'present',
        strength: 'medium',
        summary: 'Parivartana Yog is active through sign-lord exchange.',
        whyPresent: `${first.name} and ${second.name} occupy each other’s signs.`,
      });
    }
  }
  return notPresentItem('rule-yog-parivartana', 'Parivartana Yog', 'SUPPORTIVE_YOG', 'No sign-lord exchange is visible in the visible chart pattern.');
}

function buildChallengingDaridraYog(kundli: KundliData): KundliKarmaItem {
  const secondLord = lordPlanet(kundli, 2);
  const eleventhLord = lordPlanet(kundli, 11);
  const pressured = uniquePlanets([secondLord, eleventhLord]).filter((planet): planet is PlanetPosition => Boolean(planet && DUSTHANA_HOUSES.has(planet.house)));
  if (!pressured.length) {
    return notPresentItem('rule-yog-challenging-daridra', 'Daridra Yog', 'CHALLENGING_YOG', 'Wealth-growth lords do not show dusthana pressure in the visible chart pattern.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-daridra', 'Daridra Yog', 'rule-dosh-daridra', 'daridra-dosh', pressured, 'Money needs cleaner structure. This is guidance for disciplined earning, saving, and responsibility, not denial of prosperity.');
}

function buildChallengingKemadrumaYog(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  if (!moon) {
    return needsDataItem('rule-yog-challenging-kemadruma', 'Kemadruma Yog', 'CHALLENGING_YOG', 'Moon evidence is missing.');
  }
  const before = normalizeHouse(moon.house - 1);
  const after = normalizeHouse(moon.house + 1);
  const support = kundli.planets.filter(planet => CLASSICAL_GRAHAS.has(planet.name) && planet.name !== 'Moon' && (planet.house === before || planet.house === after));
  if (support.length) {
    return notPresentItem('rule-yog-challenging-kemadruma', 'Kemadruma Yog', 'CHALLENGING_YOG', 'Moon has adjacent classical support in the visible chart pattern.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-kemadruma', 'Kemadruma Yog', 'rule-dosh-kemadruma', 'kemadruma-dosh', [moon], 'Emotional steadiness must be built deliberately through routine, support, and grounded companionship.');
}

function buildShakataYog(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  const jupiter = findPlanet(kundli, 'Jupiter');
  if (!moon || !jupiter || ![6, 8, 12].includes(houseDistance(jupiter.house, moon.house))) {
    return notPresentItem('rule-yog-challenging-shakata', 'Shakata Yog', 'CHALLENGING_YOG', 'Moon is not in sixth/eighth/twelfth from Jupiter in the visible chart pattern.');
  }
  return createYogItem({
    activation: activationFor(kundli, 'Moon'),
    displayName: 'Shakata Yog',
    evidence: [pairEvidence('shakata-moon-jupiter', jupiter, moon, 'chart_support')],
    meaningForUser:
      'Confidence and emotional rhythm may move in waves. The guidance is to avoid overreacting to temporary dips and keep a stable plan.',
    module: 'CHALLENGING_YOG',
    ruleId: 'rule-yog-challenging-shakata',
    status: 'present',
    strength: 'medium',
    summary: 'Shakata Yog is active through Moon-Jupiter distance evidence.',
    whyPresent: `Moon is ${houseDistance(jupiter.house, moon.house)} houses from Jupiter.`,
  });
}

function buildChallengingPaapKartariYog(kundli: KundliData): KundliKarmaItem {
  const beforeMalefic = kundli.planets.find(planet => planet.house === 12 && MALEFICS.has(planet.name));
  const afterMalefic = kundli.planets.find(planet => planet.house === 2 && MALEFICS.has(planet.name));
  if (!beforeMalefic || !afterMalefic) {
    return notPresentItem('rule-yog-challenging-paap-kartari', 'Paap Kartari Yog', 'CHALLENGING_YOG', 'Lagna is not hemmed by malefics on both sides in the visible chart pattern.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-paap-kartari', 'Paap Kartari Yog', 'rule-dosh-paap-kartari', 'paap-kartari-dosh', [beforeMalefic, afterMalefic], 'Initiative needs containment. Start slowly, protect attention, and avoid reactive decisions.');
}

function buildChallengingGrahanYog(kundli: KundliData): KundliKarmaItem {
  const pair = luminaryNodePair(kundli);
  if (!pair) {
    return notPresentItem('rule-yog-challenging-grahan', 'Grahan Yog', 'CHALLENGING_YOG', 'Sun/Moon do not share node evidence in the visible chart pattern.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-grahan', 'Grahan Yog', 'rule-dosh-grahan', 'grahan-dosh', pair, 'Clarity can fluctuate under pressure. Pause, verify, and do not make identity or emotional decisions from shadowed moments.');
}

function buildChallengingVishYog(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  const saturn = findPlanet(kundli, 'Saturn');
  if (!moon || !saturn || !sameHouseOrSign(moon, saturn)) {
    return notPresentItem('rule-yog-challenging-vish', 'Vish Yog', 'CHALLENGING_YOG', 'Moon and Saturn do not share the visible chart evidence.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-vish', 'Vish Yog', 'rule-dosh-vish', 'vish-dosh', [moon, saturn], 'Emotional weight needs routine, rest, and realistic support. Do not turn temporary heaviness into permanent conclusions.');
}

function buildChallengingAngarakYog(kundli: KundliData): KundliKarmaItem {
  const mars = findPlanet(kundli, 'Mars');
  const rahu = findPlanet(kundli, 'Rahu');
  if (!mars || !rahu || !sameHouseOrSign(mars, rahu)) {
    return notPresentItem('rule-yog-challenging-angarak', 'Angarak Yog', 'CHALLENGING_YOG', 'Mars and Rahu do not share the visible chart evidence.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-angarak', 'Angarak Yog', 'rule-dosh-angarak', 'angarak-dosh', [mars, rahu], 'Impulse and ambition can overheat. Use physical energy constructively and pause before conflict.');
}

function buildChallengingShrapitYog(kundli: KundliData): KundliKarmaItem {
  const saturn = findPlanet(kundli, 'Saturn');
  const rahu = findPlanet(kundli, 'Rahu');
  if (!saturn || !rahu || !sameHouseOrSign(saturn, rahu)) {
    return notPresentItem('rule-yog-challenging-shrapit', 'Shrapit Yog', 'CHALLENGING_YOG', 'Saturn and Rahu do not share the visible chart evidence.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-shrapit', 'Shrapit Yog', 'rule-dosh-shrapit', 'shrapit-dosh', [saturn, rahu], 'Duty and pressure can feel heavy. The answer is disciplined routine and clean boundaries, not fear.');
}

function buildChallengingArishtaYog(kundli: KundliData): KundliKarmaItem {
  return needsDataItem(
    'rule-yog-challenging-arishta',
    'Arishta Yog',
    'CHALLENGING_YOG',
    `High-safety Arishta checks are not active for ${kundli.birthDetails.name}; Predicta will not fake this Yog.`,
  );
}

function buildChallengingKujaManglikYog(kundli: KundliData): KundliKarmaItem {
  const mars = findPlanet(kundli, 'Mars');
  if (!mars || !MANGLIK_HOUSES.has(mars.house)) {
    return notPresentItem('rule-yog-challenging-kuja-manglik', 'Kuja / Manglik Yog', 'CHALLENGING_YOG', 'Mars is not in the tested Kuja/Manglik houses in the visible chart pattern.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-kuja-manglik', 'Kuja / Manglik Yog', 'rule-dosh-manglik-kuja', 'manglik-kuja-dosh', [mars], 'Relationship pressure needs maturity, patience, and clean communication rather than fast reactive choices.');
}

function buildChallengingKaalSarpYog(kundli: KundliData): KundliKarmaItem {
  const rahu = findPlanet(kundli, 'Rahu');
  const ketu = findPlanet(kundli, 'Ketu');
  const classical = kundli.planets.filter(planet => CLASSICAL_GRAHAS.has(planet.name));
  if (!rahu || !ketu || classical.length < 7) {
    return needsDataItem('rule-yog-challenging-kaal-sarp', 'Kaal Sarp Yog', 'CHALLENGING_YOG', 'Rahu/Ketu and classical graha evidence are required.');
  }
  const concentration = Math.max(
    classical.filter(planet => isLongitudeBetween(planet.absoluteLongitude, rahu.absoluteLongitude, ketu.absoluteLongitude)).length,
    classical.filter(planet => isLongitudeBetween(planet.absoluteLongitude, ketu.absoluteLongitude, rahu.absoluteLongitude)).length,
  );
  if (concentration < 5) {
    return notPresentItem('rule-yog-challenging-kaal-sarp', 'Kaal Sarp Yog', 'CHALLENGING_YOG', 'The Rahu-Ketu arc concentration is not strong enough in the visible chart pattern.');
  }
  return challengingCrossRefItem(kundli, 'rule-yog-challenging-kaal-sarp', 'Kaal Sarp Yog', 'rule-dosh-kaal-sarp', 'kaal-sarp-dosh', [rahu, ketu], 'Life direction can feel tightly pulled. Build patience and avoid obsessive shortcuts.');
}

function conjunctionYog(
  kundli: KundliData,
  firstName: string,
  secondName: string,
  ruleId: string,
  displayName: string,
  module: KundliKarmaModule,
  meaningForUser: string,
): KundliKarmaItem {
  const first = findPlanet(kundli, firstName);
  const second = findPlanet(kundli, secondName);
  if (!first || !second || !sameHouseOrSign(first, second)) {
    return notPresentItem(ruleId, displayName, module, `${firstName} and ${secondName} do not share house/sign evidence in the visible chart pattern.`);
  }
  return createYogItem({
    activation: activationFor(kundli, first.name),
    displayName,
    evidence: [pairEvidence(`${ruleId.replace('rule-yog-', '')}-pair`, first, second, 'conjunction')],
    meaningForUser,
    module,
    ruleId,
    status: 'present',
    strength: closeByDegree(first, second, 8) ? 'high' : 'medium',
    summary: `${displayName} is active through ${firstName}-${secondName} connection.`,
    whyPresent: `${firstName} and ${secondName} share ${first.sign}/house ${first.house}.`,
  });
}

function challengingCrossRefItem(
  kundli: KundliData,
  ruleId: string,
  displayName: string,
  ownerRuleId: string,
  ownerItemId: string,
  planets: PlanetPosition[],
  meaningForUser: string,
): KundliKarmaItem {
  return createYogItem({
    activation: activationFor(kundli, planets[0]?.name ?? 'Saturn'),
    crossReferences: [
      {
        itemId: ownerItemId,
        module: 'DOSH',
        note: 'Same deterministic condition; the Dosh/Shrap section owns the full reading and this Yog cross-references it to avoid duplicate interpretation.',
        relationship: 'do_not_duplicate',
        ruleId: ownerRuleId,
      },
    ],
    displayName,
    evidence: planets.map((planet, index) => planetEvidence(`${ruleId}-evidence-${index + 1}`, planet, index ? 'chart_support' : 'planet_house')),
    meaningForUser,
    module: 'CHALLENGING_YOG',
    ruleId,
    status: 'present',
    strength: planets.length > 1 ? 'high' : 'medium',
    summary: `${displayName} is active, but the full reading is cross-referenced to avoid repeating the same condition.`,
    whyPresent: planets.map(planet => `${planet.name} is in house ${planet.house}, ${planet.sign}.`).join(' '),
  });
}

function createYogItem({
  activation,
  crossReferences = [],
  displayName,
  evidence = [],
  meaningForUser,
  module,
  reductions = [],
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
  module: KundliKarmaModule;
  reductions?: KundliKarmaReduction[];
  ruleId: string;
  status: KundliKarmaItemStatus;
  strength?: KundliKarmaStrength;
  summary: string;
  whyPresent: string;
}): KundliKarmaItem {
  const rule = getKundliKarmaRuleProvenance(ruleId);
  return {
    activation: activation ?? {
      confidence: activeStatus(status) ? 'partial' : 'uncertain',
      summary: activeStatus(status)
        ? 'Activation is read through matching dasha/transit triggers when available.'
        : 'Activation is not interpreted for this status.',
    },
    confidence: confidenceFor(status),
    crossReferences,
    displayName,
    evidence,
    id: ruleId.replace('rule-', ''),
    meaningForUser,
    module,
    reductions,
    remedies: remediesFor(ruleId, displayName, module),
    ruleId,
    sourceReferenceIds: rule?.sourceReferenceIds ?? [],
    status,
    strength,
    summary,
    whyPresent,
  };
}

function notPresentItem(ruleId: string, displayName: string, module: KundliKarmaModule, reason: string): KundliKarmaItem {
  return createYogItem({
    displayName,
    evidence: [{ description: reason, id: `${ruleId}-not-present-evidence`, kind: 'context_boundary', weight: 'none' }],
    meaningForUser: 'Predicta does not raise this Yog from the visible chart evidence.',
    module,
    ruleId,
    status: 'not_present',
    strength: 'none',
    summary: 'Not present in the current chart check.',
    whyPresent: reason,
  });
}

function needsDataItem(ruleId: string, displayName: string, module: KundliKarmaModule, reason: string): KundliKarmaItem {
  return createYogItem({
    displayName,
    evidence: [{ description: reason, id: `${ruleId}-needs-data`, kind: 'missing_data', weight: 'none' }],
    meaningForUser: 'Predicta does not judge this Yog until safe deterministic evidence is available.',
    module,
    ruleId,
    status: 'needs_data',
    strength: 'none',
    summary: 'Required evidence is missing or intentionally pending.',
    whyPresent: reason,
  });
}

function planetEvidence(id: string, planet: PlanetPosition, kind: KundliKarmaEvidenceKind): KundliKarmaEvidence {
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

function pairEvidence(id: string, first: PlanetPosition, second: PlanetPosition, kind: KundliKarmaEvidenceKind): KundliKarmaEvidence {
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

function remediesFor(ruleId: string, displayName: string, module: KundliKarmaModule): KundliKarmaRemedy[] {
  const supportive = module === 'SUPPORTIVE_YOG';
  return [
    {
      depth: 'free',
      description: supportive
        ? `For ${displayName}, strengthen the promise with one steady action: practice, humility, consistency, and clean use of the supported life area.`
        : `For ${displayName}, reduce friction with one steady action: restraint, routine, repair, and practical discipline around the affected life area.`,
      id: `${ruleId}-free-remedy`,
      safetyNote: 'Free guidance stays simple, safe, low-cost, and non-coercive.',
      title: supportive ? 'Use the support consciously' : 'Reduce the friction safely',
      tradition: 'karma_dharma',
    },
    {
      depth: 'premium',
      description: supportive
        ? 'Premium can add timing, mantra, devata focus, practice plan, and evidence-based activation guidance.'
        : 'Premium can add timing, mantra, vrata, donation, avoid-list, and safe Lal Kitab-compatible upay after contraindications are reviewed.',
      id: `${ruleId}-premium-remedy`,
      safetyNote: 'Premium depth must not become expensive fear-based remedy pressure.',
      title: supportive ? 'Structured activation plan' : 'Structured maturity plan',
      tradition: 'vedic',
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
      ? `${planet} is active in current dasha timing, so this Yog deserves practical attention now.`
      : `${planet} is not the main current dasha lord; treat this as background guidance unless later timing activates it.`,
  };
}

function confidenceFor(status: KundliKarmaItemStatus): KundliKarmaConfidence {
  if (status === 'present' || status === 'cancelled' || status === 'not_present') {
    return 'clear';
  }
  if (status === 'needs_data' || status === 'pending_evidence') {
    return 'uncertain';
  }
  return 'partial';
}

function rankYogItems(items: KundliKarmaItem[]): KundliKarmaItem[] {
  const statusScore: Record<KundliKarmaItemStatus, number> = {
    present: 70,
    weak: 50,
    cancelled: 45,
    pending_evidence: 30,
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

function activeStatus(status: KundliKarmaItemStatus): boolean {
  return status === 'present' || status === 'weak' || status === 'cancelled';
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(planet => planet.name === name);
}

function lordPlanet(kundli: KundliData, houseNumber: number): PlanetPosition | undefined {
  const house = kundli.houses.find(item => item.house === houseNumber);
  return house?.lord ? findPlanet(kundli, house.lord) : undefined;
}

function connectedPair(firstPlanets: Array<PlanetPosition | undefined>, secondPlanets: Array<PlanetPosition | undefined>): [PlanetPosition, PlanetPosition] | undefined {
  for (const first of uniquePlanets(firstPlanets)) {
    for (const second of uniquePlanets(secondPlanets)) {
      if (first && second && first.name !== second.name && sameHouseOrSign(first, second)) {
        return [first, second];
      }
    }
  }
  return undefined;
}

function uniquePlanets(planets: Array<PlanetPosition | undefined>): Array<PlanetPosition | undefined> {
  const seen = new Set<string>();
  return planets.filter(planet => {
    if (!planet) {
      return false;
    }
    const key = `${planet.name}-${planet.absoluteLongitude}-${planet.house}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function luminaryNodePair(kundli: KundliData): [PlanetPosition, PlanetPosition] | undefined {
  for (const luminaryName of ['Sun', 'Moon']) {
    const luminary = findPlanet(kundli, luminaryName);
    const node = ['Rahu', 'Ketu'].map(name => findPlanet(kundli, name)).find(item => item && luminary && sameHouseOrSign(luminary, item));
    if (luminary && node) {
      return [luminary, node];
    }
  }
  return undefined;
}

function sameHouseOrSign(first: PlanetPosition, second: PlanetPosition): boolean {
  return first.house === second.house || first.sign === second.sign;
}

function closeByDegree(first: PlanetPosition, second: PlanetPosition, orb: number): boolean {
  return Math.abs(first.absoluteLongitude - second.absoluteLongitude) <= orb;
}

function strongPlanet(planet: PlanetPosition): boolean {
  return OWN_SIGNS[planet.name]?.includes(planet.sign) || EXALTATION_SIGNS[planet.name] === planet.sign;
}

function isLongitudeBetween(value: number, start: number, end: number): boolean {
  const normalizedValue = normalizeDegree(value);
  const normalizedStart = normalizeDegree(start);
  const normalizedEnd = normalizeDegree(end);
  if (normalizedStart <= normalizedEnd) {
    return normalizedValue >= normalizedStart && normalizedValue <= normalizedEnd;
  }
  return normalizedValue >= normalizedStart || normalizedValue >= 0 && normalizedValue <= normalizedEnd;
}

function normalizeDegree(value: number): number {
  return ((value % 360) + 360) % 360;
}

function normalizeHouse(value: number): number {
  return ((value - 1 + 12) % 12) + 1;
}

function houseDistance(from: number, to: number): number {
  return normalizeHouse(to - from + 1);
}

function formatDegree(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function getRuleName(ruleId: string): string {
  return getKundliKarmaRuleProvenance(ruleId)?.displayName ?? ruleId;
}
