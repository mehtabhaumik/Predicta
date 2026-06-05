import type {
  KundliData,
  KundliKarmaActivation,
  KundliKarmaConfidence,
  KundliKarmaEvidence,
  KundliKarmaEvidenceKind,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaItemStatus,
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

export type KundliKarmaDoshContext = 'single_kundli' | 'compatibility';

export type ComposeKundliKarmaDoshOptions = {
  context?: KundliKarmaDoshContext;
};

const DOSH_RULE_IDS = [
  'rule-dosh-manglik-kuja',
  'rule-dosh-kaal-sarp',
  'rule-dosh-pitra',
  'rule-dosh-shrapit',
  'rule-dosh-guru-chandal',
  'rule-dosh-grahan',
  'rule-dosh-kemadruma',
  'rule-dosh-vish',
  'rule-dosh-angarak',
  'rule-dosh-daridra',
  'rule-dosh-paap-kartari',
  'rule-dosh-arishta-balarishta',
  'rule-dosh-nadi-compatibility-only',
] as const;

const NODE_NAMES = new Set(['Rahu', 'Ketu']);
const CLASSICAL_GRAHAS = new Set([
  'Moon',
  'Sun',
  'Mars',
  'Jupiter',
  'Venus',
  'Saturn',
  'Mercury',
]);
const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury']);
const MALEFICS = new Set(['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun']);
const MANGLIK_HOUSES = new Set([1, 4, 7, 8, 12]);
const DUSTHANA_HOUSES = new Set([6, 8, 12]);
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

export function composeKundliKarmaDoshIntelligence(
  kundli?: KundliData,
  options: ComposeKundliKarmaDoshOptions = {},
): KundliKarmaIntelligence {
  if (!kundli) {
    return buildPendingIntelligence();
  }

  const context = options.context ?? 'single_kundli';
  const items = [
    buildManglikDosh(kundli),
    buildKaalSarpDosh(kundli),
    buildPitraDosh(kundli),
    buildShrapitDosh(kundli),
    buildGuruChandalDosh(kundli),
    buildGrahanDosh(kundli),
    buildKemadrumaDosh(kundli),
    buildVishDosh(kundli),
    buildAngarakDosh(kundli),
    buildDaridraDosh(kundli),
    buildPaapKartariDosh(kundli),
    buildArishtaBalarishtaDosh(kundli),
    buildNadiDosh(context),
  ];
  const ranked = rankDoshItems(items);
  const visibleSignals = ranked
    .filter(item => ['present', 'weak', 'cancelled', 'pending_evidence'].includes(item.status))
    .slice(0, 3)
    .map(item => item.displayName);

  return {
    calculationStatus: ranked.some(item => item.status === 'needs_data') ? 'partial' : 'ready',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items: ranked,
    missingData: ranked
      .filter(item => item.status === 'needs_data' || item.status === 'pending_evidence')
      .map(item => `${item.displayName}: ${item.whyPresent}`),
    noAiRequiredFor: [
      'show Dosh summary',
      'explain Dosh status',
      'show Dosh evidence',
      'show Dosh remedies',
      'show why a Dosh is blocked or pending',
    ],
    safetyNotes: [
      'Predicta never uses curse language for Dosh output.',
      'Dosh output is guidance and timing support, not guaranteed outcome.',
      'Remedies stay simple, safe, and non-coercive.',
    ],
    subjectName: kundli.birthDetails.name,
    summary: visibleSignals.length
      ? `Predicta found ${visibleSignals.join(', ')} as the main Dosh signals to review calmly.`
      : 'Predicta did not find a major active Dosh signal in the current chart evidence.',
    topSignals: visibleSignals,
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPendingIntelligence(): KundliKarmaIntelligence {
  return {
    calculationStatus: 'needs_data',
    depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
    generatedBy: 'deterministic_contract',
    items: DOSH_RULE_IDS.map(ruleId =>
      createDoshItem({
        displayName: getRuleName(ruleId),
        meaningForUser: 'Create or select a Kundli before Predicta reads Dosh evidence.',
        ruleId,
        status: 'needs_data',
        summary: 'Kundli data is required before Dosh can be checked.',
        whyPresent: 'Missing Kundli data.',
      }),
    ),
    missingData: ['Kundli data'],
    noAiRequiredFor: ['explain that Dosh checks need Kundli data'],
    safetyNotes: ['No Dosh is inferred without Kundli evidence.'],
    subjectName: 'Pending Kundli',
    summary: 'Kundli data is needed before Predicta can check Dosh evidence.',
    topSignals: [],
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildManglikDosh(kundli: KundliData): KundliKarmaItem {
  const mars = findPlanet(kundli, 'Mars');
  if (!mars) {
    return missingPlanetItem('rule-dosh-manglik-kuja', 'Manglik / Kuja Dosh', 'Mars');
  }
  if (!MANGLIK_HOUSES.has(mars.house)) {
    return notPresentItem(
      'rule-dosh-manglik-kuja',
      'Manglik / Kuja Dosh',
      `Mars is in house ${mars.house}, not in the tested Manglik houses 1, 4, 7, 8, or 12.`,
    );
  }

  const reductions = dignityReductions(mars, `${mars.name.toLowerCase()}-manglik`);
  const status: KundliKarmaItemStatus = reductions.length ? 'cancelled' : 'present';
  return createDoshItem({
    activation: activationFor(kundli, mars.name),
    displayName: 'Manglik / Kuja Dosh',
    evidence: [planetEvidence('manglik-mars-house', mars, 'planet_house', 'D1')],
    meaningForUser:
      status === 'cancelled'
        ? 'Mars brings directness and heat into relationship decisions, but dignity softens the pressure so it can mature into courage and clean boundaries.'
        : 'Mars can make relationship choices intense, fast, or reactive. The useful guidance is to slow decisions, communicate plainly, and avoid turning pressure into conflict.',
    reductions,
    ruleId: 'rule-dosh-manglik-kuja',
    status,
    strength: status === 'cancelled' ? 'low' : mars.house === 7 || mars.house === 8 ? 'high' : 'medium',
    summary:
      status === 'cancelled'
        ? 'Manglik pressure is detected but meaningfully softened by Mars dignity.'
        : `Mars sits in house ${mars.house}, so Manglik pressure is active and should be handled with maturity.`,
    whyPresent: `Mars is in house ${mars.house}, ${mars.sign}, ${formatDegree(mars.degree)}°, ${mars.nakshatra} pada ${mars.pada}.`,
  });
}

function buildKaalSarpDosh(kundli: KundliData): KundliKarmaItem {
  const rahu = findPlanet(kundli, 'Rahu');
  const ketu = findPlanet(kundli, 'Ketu');
  const classical = kundli.planets.filter(planet => CLASSICAL_GRAHAS.has(planet.name));
  if (!rahu || !ketu || classical.length < 7) {
    return createDoshItem({
      displayName: 'Kaal Sarp Dosh',
      evidence: missingEvidence('kaal-sarp-missing', 'Rahu, Ketu, and seven classical graha longitudes are required.'),
      meaningForUser: 'Predicta does not judge Kaal Sarp until the full node-axis evidence is available.',
      ruleId: 'rule-dosh-kaal-sarp',
      status: 'needs_data',
      summary: 'Kaal Sarp needs complete node-axis evidence.',
      whyPresent: 'Missing Rahu/Ketu or classical graha longitude data.',
    });
  }

  const betweenForward = classical.filter(planet =>
    isLongitudeBetween(planet.absoluteLongitude, rahu.absoluteLongitude, ketu.absoluteLongitude),
  );
  const betweenReverse = classical.filter(planet =>
    isLongitudeBetween(planet.absoluteLongitude, ketu.absoluteLongitude, rahu.absoluteLongitude),
  );
  const concentration = Math.max(betweenForward.length, betweenReverse.length);
  if (concentration < 5) {
    return notPresentItem(
      'rule-dosh-kaal-sarp',
      'Kaal Sarp Dosh',
      `Only ${concentration} classical grahas are concentrated on one Rahu-Ketu arc; Predicta does not raise Kaal Sarp.`,
    );
  }

  const status: KundliKarmaItemStatus = concentration === classical.length ? 'present' : 'weak';
  return createDoshItem({
    activation: activationFor(kundli, 'Rahu'),
    displayName: 'Kaal Sarp Dosh',
    evidence: [
      planetEvidence('kaal-sarp-rahu', rahu, 'axis', 'D1'),
      planetEvidence('kaal-sarp-ketu', ketu, 'axis', 'D1'),
      {
        description: `${concentration} of ${classical.length} classical grahas fall on one Rahu-Ketu arc.`,
        id: 'kaal-sarp-arc-count',
        kind: 'axis',
        weight: status === 'present' ? 'high' : 'medium',
      },
    ],
    meaningForUser:
      status === 'present'
        ? 'Life may feel pulled by one strong karmic direction. The guidance is to build patience, avoid obsessive shortcuts, and choose steady release over panic.'
        : 'The node axis is concentrated but not complete. It can create periods of pressure, yet other chart factors still distribute life energy.',
    reductions:
      status === 'weak'
        ? [
            {
              confidence: 'clear',
              description: 'The grahas are not fully trapped on one node arc, so Predicta treats this as partial pressure.',
              evidenceIds: ['kaal-sarp-arc-count'],
              id: 'kaal-sarp-partial-reduction',
            },
          ]
        : [],
    ruleId: 'rule-dosh-kaal-sarp',
    status,
    strength: status === 'present' ? 'high' : 'medium',
    summary:
      status === 'present'
        ? 'A complete Rahu-Ketu arc concentration is detected.'
        : 'A partial Rahu-Ketu concentration is detected, so the reading stays moderate.',
    whyPresent: `${concentration} classical grahas are on one side of the Rahu-Ketu axis.`,
  });
}

function buildPitraDosh(kundli: KundliData): KundliKarmaItem {
  const sun = findPlanet(kundli, 'Sun');
  const rahu = findPlanet(kundli, 'Rahu');
  const saturn = findPlanet(kundli, 'Saturn');
  const ninth = kundli.houses.find(house => house.house === 9);
  const ninthLord = ninth?.lord ? findPlanet(kundli, ninth.lord) : undefined;
  const evidence: KundliKarmaEvidence[] = [];
  if (sun && rahu && sameHouseOrSign(sun, rahu)) {
    evidence.push(pairEvidence('pitra-sun-rahu', sun, rahu, 'conjunction'));
  }
  if (sun && saturn && sameHouseOrSign(sun, saturn)) {
    evidence.push(pairEvidence('pitra-sun-saturn', sun, saturn, 'conjunction'));
  }
  if (ninthLord && [rahu?.house, saturn?.house].includes(ninthLord.house)) {
    evidence.push(planetEvidence('pitra-ninth-lord', ninthLord, 'lordship', 'D1'));
  }
  if (!evidence.length) {
    return notPresentItem(
      'rule-dosh-pitra',
      'Pitra Dosh',
      'Sun and ninth-house evidence do not show the approved chart pattern.',
    );
  }
  return createDoshItem({
    activation: activationFor(kundli, sun?.name ?? ninthLord?.name ?? 'Sun'),
    displayName: 'Pitra Dosh',
    evidence,
    meaningForUser:
      'Ancestral duty or family-line responsibility can become a recurring life theme. The useful path is gratitude, service, repairing family duties where possible, and building your own dharma cleanly.',
    ruleId: 'rule-dosh-pitra',
    status: evidence.length >= 2 ? 'present' : 'weak',
    strength: evidence.length >= 2 ? 'high' : 'medium',
    summary:
      evidence.length >= 2
        ? 'Multiple ancestry/dharma indicators are active.'
        : 'One ancestry/dharma indicator is visible, so Predicta keeps the reading moderate.',
    whyPresent: evidence.map(item => item.description).join(' '),
  });
}

function buildShrapitDosh(kundli: KundliData): KundliKarmaItem {
  const saturn = findPlanet(kundli, 'Saturn');
  const rahu = findPlanet(kundli, 'Rahu');
  if (!saturn || !rahu) {
    return missingPlanetItem('rule-dosh-shrapit', 'Shrapit Dosh', 'Saturn/Rahu');
  }
  if (!sameHouseOrSign(saturn, rahu)) {
    return notPresentItem(
      'rule-dosh-shrapit',
      'Shrapit Dosh',
      'Saturn and Rahu do not share a sign or house in the visible chart pattern.',
    );
  }
  return createDoshItem({
    activation: activationFor(kundli, 'Saturn'),
    crossReferences: [
      {
        itemId: 'shrapit-yog',
        module: 'CHALLENGING_YOG',
        note: 'Same Saturn-Rahu evidence; later Yog phase must cross-reference instead of repeating the full reading.',
        relationship: 'do_not_duplicate',
        ruleId: 'rule-yog-challenging-shrapit',
      },
    ],
    displayName: 'Shrapit Dosh',
    evidence: [pairEvidence('shrapit-saturn-rahu', saturn, rahu, 'conjunction')],
    meaningForUser:
      'Saturn-Rahu pressure can make duty feel heavy and delayed. The guidance is disciplined routine, truthful boundaries, and avoiding desperate shortcuts during pressure periods.',
    ruleId: 'rule-dosh-shrapit',
    status: 'present',
    strength: closeByDegree(saturn, rahu, 8) ? 'high' : 'medium',
    summary: 'Saturn and Rahu share the visible chart evidence.',
    whyPresent: `Saturn and Rahu share ${saturn.sign}/house ${saturn.house}.`,
  });
}

function buildGuruChandalDosh(kundli: KundliData): KundliKarmaItem {
  const jupiter = findPlanet(kundli, 'Jupiter');
  const node = findFirst(kundli, ['Rahu', 'Ketu'], planet => jupiter ? sameHouseOrSign(jupiter, planet) : false);
  if (!jupiter || !node) {
    return notPresentItem(
      'rule-dosh-guru-chandal',
      'Guru Chandal Dosh',
      'Jupiter does not share a house/sign with Rahu or Ketu in the visible chart pattern.',
    );
  }
  return createDoshItem({
    activation: activationFor(kundli, 'Jupiter'),
    displayName: 'Guru Chandal Dosh',
    evidence: [pairEvidence('guru-chandal-jupiter-node', jupiter, node, 'conjunction')],
    meaningForUser:
      'Wisdom, belief, and decision-making can get pulled toward unconventional or restless directions. The guidance is to verify advice, stay ethical, and avoid confusing rebellion with truth.',
    reductions: dignityReductions(jupiter, 'guru-chandal-jupiter'),
    ruleId: 'rule-dosh-guru-chandal',
    status: dignityReductions(jupiter, 'guru-chandal-jupiter').length ? 'cancelled' : 'present',
    strength: closeByDegree(jupiter, node, 8) ? 'high' : 'medium',
    summary: 'Jupiter shares visible chart evidence, so Guru Chandal pressure is visible.',
    whyPresent: `Jupiter and ${node.name} share ${jupiter.sign}/house ${jupiter.house}.`,
  });
}

function buildGrahanDosh(kundli: KundliData): KundliKarmaItem {
  const luminary = findFirst(kundli, ['Sun', 'Moon'], planet =>
    findFirst(kundli, ['Rahu', 'Ketu'], node => sameHouseOrSign(planet, node)) !== undefined,
  );
  const node = luminary ? findFirst(kundli, ['Rahu', 'Ketu'], item => sameHouseOrSign(luminary, item)) : undefined;
  if (!luminary || !node) {
    return notPresentItem(
      'rule-dosh-grahan',
      'Grahan Dosh',
      'Sun/Moon do not share a house/sign with Rahu or Ketu in the visible chart pattern.',
    );
  }
  return createDoshItem({
    activation: activationFor(kundli, luminary.name),
    displayName: 'Grahan Dosh',
    evidence: [pairEvidence('grahan-luminary-node', luminary, node, 'conjunction')],
    meaningForUser:
      luminary.name === 'Moon'
        ? 'Emotional clarity can fluctuate under stress. The guidance is to avoid reactive conclusions and build a steady daily emotional anchor.'
        : 'Identity and authority choices can feel shadowed during pressure. The guidance is to act with humility, patience, and clean intent.',
    ruleId: 'rule-dosh-grahan',
    status: closeByDegree(luminary, node, 8) ? 'present' : 'weak',
    strength: closeByDegree(luminary, node, 8) ? 'high' : 'medium',
    summary: `${luminary.name} shares node evidence, so Grahan pressure is visible.`,
    whyPresent: `${luminary.name} and ${node.name} share ${luminary.sign}/house ${luminary.house}.`,
  });
}

function buildKemadrumaDosh(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  if (!moon) {
    return missingPlanetItem('rule-dosh-kemadruma', 'Kemadruma Dosh', 'Moon');
  }
  const before = normalizeHouse(moon.house - 1);
  const after = normalizeHouse(moon.house + 1);
  const adjacentSupport = kundli.planets.filter(
    planet =>
      CLASSICAL_GRAHAS.has(planet.name) &&
      planet.name !== 'Moon' &&
      (planet.house === before || planet.house === after),
  );
  if (adjacentSupport.length) {
    return notPresentItem(
      'rule-dosh-kemadruma',
      'Kemadruma Dosh',
      `${adjacentSupport.map(planet => planet.name).join(', ')} supports Moon through adjacent house evidence.`,
    );
  }
  const kendraSupport = kundli.planets.filter(
    planet =>
      BENEFICS.has(planet.name) &&
      [1, 4, 7, 10].includes(houseDistance(moon.house, planet.house)),
  );
  return createDoshItem({
    activation: activationFor(kundli, 'Moon'),
    displayName: 'Kemadruma Dosh',
    evidence: [planetEvidence('kemadruma-moon', moon, 'chart_support', 'D1')],
    meaningForUser:
      'Emotional support may need to be built deliberately instead of assumed. The guidance is routine, grounded companionship, and not isolating when pressure rises.',
    reductions: kendraSupport.map(planet => ({
      confidence: 'clear' as const,
      description: `${planet.name} gives kendra support to Moon, so Kemadruma pressure is softened.`,
      evidenceIds: ['kemadruma-moon'],
      id: `kemadruma-${planet.name.toLowerCase()}-support`,
    })),
    ruleId: 'rule-dosh-kemadruma',
    status: kendraSupport.length ? 'cancelled' : 'present',
    strength: kendraSupport.length ? 'low' : 'medium',
    summary: kendraSupport.length
      ? 'Moon isolation is detected but softened by benefic kendra support.'
      : 'Moon has no adjacent classical graha support in the visible chart pattern.',
    whyPresent: `Moon is in house ${moon.house}; houses ${before} and ${after} do not contain supporting classical grahas.`,
  });
}

function buildVishDosh(kundli: KundliData): KundliKarmaItem {
  const moon = findPlanet(kundli, 'Moon');
  const saturn = findPlanet(kundli, 'Saturn');
  if (!moon || !saturn) {
    return missingPlanetItem('rule-dosh-vish', 'Vish Dosh', 'Moon/Saturn');
  }
  if (sameHouseOrSign(moon, saturn)) {
    return createDoshItem({
      activation: activationFor(kundli, 'Moon'),
      displayName: 'Vish Dosh',
      evidence: [pairEvidence('vish-moon-saturn', moon, saturn, 'conjunction')],
      meaningForUser:
        'Mind and responsibility can feel heavy together. The guidance is to reduce emotional isolation, keep sleep/routine clean, and not make permanent decisions in temporary heaviness.',
      ruleId: 'rule-dosh-vish',
      status: 'present',
      strength: closeByDegree(moon, saturn, 8) ? 'high' : 'medium',
      summary: 'Moon and Saturn share the visible chart evidence.',
      whyPresent: `Moon and Saturn share ${moon.sign}/house ${moon.house}.`,
    });
  }
  if (houseDistance(moon.house, saturn.house) === 7) {
    return createDoshItem({
      displayName: 'Vish Dosh',
      evidence: [pairEvidence('vish-moon-saturn-variant', moon, saturn, 'aspect')],
      meaningForUser:
        'Moon-Saturn opposition is a tradition-variation signal. Predicta marks it for review rather than making a strong Dosh claim.',
      ruleId: 'rule-dosh-vish',
      status: 'pending_evidence',
      strength: 'low',
      summary: 'Unknown tradition variation: Moon and Saturn are opposite, but Predicta will not silently choose a stronger rule.',
      whyPresent: 'unknown tradition variation: Moon-Saturn opposition needs the approved Phase 3 rule variant before stronger output.',
    });
  }
  return notPresentItem(
    'rule-dosh-vish',
    'Vish Dosh',
    'Moon and Saturn do not share the visible chart evidence.',
  );
}

function buildAngarakDosh(kundli: KundliData): KundliKarmaItem {
  const mars = findPlanet(kundli, 'Mars');
  const rahu = findPlanet(kundli, 'Rahu');
  if (!mars || !rahu) {
    return missingPlanetItem('rule-dosh-angarak', 'Angarak Dosh', 'Mars/Rahu');
  }
  if (!sameHouseOrSign(mars, rahu)) {
    return notPresentItem(
      'rule-dosh-angarak',
      'Angarak Dosh',
      'Mars and Rahu do not share a sign or house in the visible chart pattern.',
    );
  }
  return createDoshItem({
    activation: activationFor(kundli, 'Mars'),
    displayName: 'Angarak Dosh',
    evidence: [pairEvidence('angarak-mars-rahu', mars, rahu, 'conjunction')],
    meaningForUser:
      'Impulse and ambition can become overheated. The guidance is to pause before conflict, use physical energy constructively, and avoid proving yourself through risk.',
    ruleId: 'rule-dosh-angarak',
    status: 'present',
    strength: closeByDegree(mars, rahu, 8) ? 'high' : 'medium',
    summary: 'Mars and Rahu share the visible chart evidence.',
    whyPresent: `Mars and Rahu share ${mars.sign}/house ${mars.house}.`,
  });
}

function buildDaridraDosh(kundli: KundliData): KundliKarmaItem {
  const secondLord = lordPlanet(kundli, 2);
  const eleventhLord = lordPlanet(kundli, 11);
  const pressured = uniquePlanets([secondLord, eleventhLord]).filter(
    (planet): planet is PlanetPosition => Boolean(planet && DUSTHANA_HOUSES.has(planet.house)),
  );
  if (!pressured.length) {
    return notPresentItem(
      'rule-dosh-daridra',
      'Daridra Dosh',
      'Second and eleventh house lords are not both pressured by the visible chart pattern.',
    );
  }
  const support = kundli.planets.filter(planet => BENEFICS.has(planet.name) && [2, 11].includes(planet.house));
  return createDoshItem({
    activation: activationFor(kundli, pressured[0].name),
    displayName: 'Daridra Dosh',
    evidence: pressured.map((planet, index) =>
      planetEvidence(`daridra-wealth-lord-${index + 1}`, planet, 'lordship', 'D1'),
    ),
    meaningForUser:
      'Money and resource handling need discipline. This does not deny prosperity; it asks for cleaner earning, spending, saving, and responsibility around family resources.',
    reductions: support.map(planet => ({
      confidence: 'clear' as const,
      description: `${planet.name} supports a wealth house, reducing resource-pressure severity.`,
      evidenceIds: [`daridra-wealth-lord-1`],
      id: `daridra-${planet.name.toLowerCase()}-support`,
    })),
    ruleId: 'rule-dosh-daridra',
    status: support.length ? 'weak' : pressured.length >= 2 ? 'present' : 'weak',
    strength: support.length ? 'low' : pressured.length >= 2 ? 'high' : 'medium',
    summary:
      pressured.length >= 2
        ? 'Both wealth-growth lords show dusthana pressure in the visible chart pattern.'
        : 'One wealth-growth lord shows dusthana pressure, so Predicta keeps this moderate.',
    whyPresent: pressured
      .map(planet => `${planet.name} is in house ${planet.house}, ${planet.sign}.`)
      .join(' '),
  });
}

function buildPaapKartariDosh(kundli: KundliData): KundliKarmaItem {
  const lagnaHouse = 1;
  const before = normalizeHouse(lagnaHouse - 1);
  const after = normalizeHouse(lagnaHouse + 1);
  const beforeMalefic = kundli.planets.find(planet => planet.house === before && MALEFICS.has(planet.name));
  const afterMalefic = kundli.planets.find(planet => planet.house === after && MALEFICS.has(planet.name));
  if (!beforeMalefic || !afterMalefic) {
    return notPresentItem(
      'rule-dosh-paap-kartari',
      'Paap Kartari Dosh',
      'Lagna is not hemmed by malefics on both sides in the visible chart pattern.',
    );
  }
  return createDoshItem({
    activation: activationFor(kundli, beforeMalefic.name),
    displayName: 'Paap Kartari Dosh',
    evidence: [
      planetEvidence('paap-kartari-before', beforeMalefic, 'planet_house', 'D1'),
      planetEvidence('paap-kartari-after', afterMalefic, 'planet_house', 'D1'),
    ],
    meaningForUser:
      'Identity and initiative can feel pressured from both sides. The guidance is to protect attention, avoid reactive starts, and build action through steady containment.',
    ruleId: 'rule-dosh-paap-kartari',
    status: 'present',
    strength: 'high',
    summary: 'Lagna is hemmed by malefic planets on both sides in the visible chart pattern.',
    whyPresent: `${beforeMalefic.name} is in house ${before}; ${afterMalefic.name} is in house ${after}.`,
  });
}

function buildArishtaBalarishtaDosh(kundli: KundliData): KundliKarmaItem {
  return createDoshItem({
    displayName: 'Arishta / Balarishta Dosh',
    evidence: missingEvidence(
      'arishta-needs-data',
      `High-safety Arishta checks are not active for ${kundli.birthDetails.name} until approved deterministic safeguards exist.`,
    ),
    meaningForUser:
      'Predicta does not give frightening health or longevity claims. This rule remains pending until safe deterministic evidence and wording are approved.',
    ruleId: 'rule-dosh-arishta-balarishta',
    status: 'needs_data',
    strength: 'none',
    summary: 'Arishta/Balarishta remains needs-data for safety.',
    whyPresent: 'Approved high-safety evidence is pending; Predicta will not fake this reading.',
  });
}

function buildNadiDosh(context: KundliKarmaDoshContext): KundliKarmaItem {
  if (context !== 'compatibility') {
    return createDoshItem({
      displayName: 'Nadi Dosh',
      evidence: [
        {
          description: 'Nadi Dosh is compatibility-only and is blocked in single-person Kundli Karma output.',
          id: 'nadi-dosh-single-kundli-block',
          kind: 'context_boundary',
          weight: 'none',
        },
      ],
      meaningForUser:
        'Nadi Dosh is checked only in matching/compatibility, not in a single Kundli reading.',
      ruleId: 'rule-dosh-nadi-compatibility-only',
      status: 'blocked_context',
      strength: 'none',
      summary: 'Nadi Dosh is blocked outside compatibility context.',
      whyPresent: 'Single Kundli context.',
    });
  }
  return createDoshItem({
    displayName: 'Nadi Dosh',
    evidence: missingEvidence('nadi-dosh-compatibility-pending', 'Compatibility partner data is required.'),
    meaningForUser:
      'Nadi Dosh needs both charts and matching context before Predicta can check it.',
    ruleId: 'rule-dosh-nadi-compatibility-only',
    status: 'needs_data',
    strength: 'none',
    summary: 'Nadi Dosh is compatibility-only and needs two-chart evidence.',
    whyPresent: 'Compatibility context is allowed, but partner evidence is missing.',
  });
}

function createDoshItem({
  activation,
  crossReferences = [],
  displayName,
  evidence = [],
  meaningForUser,
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
    module: 'DOSH',
    reductions,
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
  return createDoshItem({
    displayName,
    evidence: [
      {
        description: reason,
        id: `${ruleId}-not-present-evidence`,
        kind: 'context_boundary',
        weight: 'none',
      },
    ],
    meaningForUser: 'Predicta does not raise this Dosh from the visible chart evidence.',
    ruleId,
    status: 'not_present',
    strength: 'none',
    summary: 'Not present in the current chart check.',
    whyPresent: reason,
  });
}

function missingPlanetItem(ruleId: string, displayName: string, planet: string): KundliKarmaItem {
  return createDoshItem({
    displayName,
    evidence: missingEvidence(`${ruleId}-missing`, `${planet} evidence is missing.`),
    meaningForUser: 'Predicta does not judge this Dosh until required planetary evidence is available.',
    ruleId,
    status: 'needs_data',
    strength: 'none',
    summary: 'Required evidence is missing.',
    whyPresent: `${planet} evidence is missing.`,
  });
}

function missingEvidence(id: string, description: string): KundliKarmaEvidence[] {
  return [{ description, id, kind: 'missing_data', weight: 'none' }];
}

function planetEvidence(
  id: string,
  planet: PlanetPosition,
  kind: KundliKarmaEvidenceKind,
  chart: KundliKarmaEvidence['chart'],
): KundliKarmaEvidence {
  return {
    chart,
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

function dignityReductions(planet: PlanetPosition, idPrefix: string): KundliKarmaReduction[] {
  const ownSign = OWN_SIGNS[planet.name]?.includes(planet.sign);
  const exalted = EXALTATION_SIGNS[planet.name] === planet.sign;
  if (!ownSign && !exalted) {
    return [];
  }
  return [
    {
      confidence: 'clear',
      description: `${planet.name} is ${exalted ? 'exalted' : 'in own sign'} in ${planet.sign}, so the pressure is softened rather than read harshly.`,
      evidenceIds: [`${idPrefix}-dignity`],
      id: `${idPrefix}-dignity-reduction`,
    },
  ];
}

function remediesFor(ruleId: string, displayName: string): KundliKarmaRemedy[] {
  return [
    {
      depth: 'free',
      description: `For ${displayName}, choose one simple karma/dharma action: service, apology, restraint, discipline, or truthful repair related to the life area involved.`,
      id: `${ruleId}-free-remedy`,
      safetyNote: 'Free remedy stays simple, safe, low-cost, and non-coercive.',
      title: 'Simple dharma correction',
      tradition: 'karma_dharma',
    },
    {
      depth: 'premium',
      description: `Premium can add mantra, vrata, donation timing, avoid-list, and Lal Kitab-safe upay only after the full evidence and contraindications are reviewed.`,
      id: `${ruleId}-premium-remedy`,
      safetyNote: 'Premium depth must not become expensive fear-based remedy pressure.',
      title: 'Structured remedy plan',
      tradition: ruleId.includes('lal-kitab') ? 'lal_kitab' : 'vedic',
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
      ? `${planet} is active in current dasha timing, so this Dosh deserves practical attention now.`
      : `${planet} is not the main current dasha lord; treat this as background guidance unless later timing activates it.`,
  };
}

function confidenceFor(status: KundliKarmaItemStatus): KundliKarmaConfidence {
  if (status === 'present' || status === 'cancelled' || status === 'not_present' || status === 'blocked_context') {
    return 'clear';
  }
  if (status === 'needs_data' || status === 'pending_evidence') {
    return 'uncertain';
  }
  return 'partial';
}

function rankDoshItems(items: KundliKarmaItem[]): KundliKarmaItem[] {
  const statusScore: Record<KundliKarmaItemStatus, number> = {
    present: 70,
    weak: 50,
    cancelled: 45,
    pending_evidence: 35,
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

function findFirst(
  kundli: KundliData,
  names: string[],
  predicate: (planet: PlanetPosition) => boolean,
): PlanetPosition | undefined {
  return names.map(name => findPlanet(kundli, name)).find(
    (planet): planet is PlanetPosition => Boolean(planet && predicate(planet)),
  );
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

function isLongitudeBetween(value: number, start: number, end: number): boolean {
  const normalizedValue = normalizeDegree(value);
  const normalizedStart = normalizeDegree(start);
  const normalizedEnd = normalizeDegree(end);
  if (normalizedStart <= normalizedEnd) {
    return normalizedValue >= normalizedStart && normalizedValue <= normalizedEnd;
  }
  return normalizedValue >= normalizedStart || normalizedValue <= normalizedEnd;
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
