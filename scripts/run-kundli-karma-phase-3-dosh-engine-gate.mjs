import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_3_DOSH_DETECTION_RANKING_AND_REMEDY_ENGINE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const {
  KUNDLI_KARMA_RULE_PROVENANCE,
} = require('../packages/astrology/src/kundliKarmaContract.ts');
const {
  composeKundliKarmaDoshIntelligence,
} = require('../packages/astrology/src/kundliKarmaDoshEngine.ts');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), `${label}: forbidden ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Implement the first Dosh list:',
  'For each Dosh, output presence, strength, evidence, meaning, activation,',
  'Add cancellation/softening logic where deterministic evidence supports it.',
  'Add source-backed rule ids for every implemented Dosh.',
  'unknown tradition variation',
  'Dosh output never uses curse/fear language.',
  'Nadi Dosh is blocked outside compatibility/matching context.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 3 roadmap'));

const engineSource = read('packages/astrology/src/kundliKarmaDoshEngine.ts');
[
  'composeKundliKarmaDoshIntelligence',
  'buildManglikDosh',
  'buildKaalSarpDosh',
  'buildPitraDosh',
  'buildShrapitDosh',
  'buildGuruChandalDosh',
  'buildGrahanDosh',
  'buildKemadrumaDosh',
  'buildVishDosh',
  'buildAngarakDosh',
  'buildDaridraDosh',
  'buildPaapKartariDosh',
  'buildArishtaBalarishtaDosh',
  'buildNadiDosh',
  'unknown tradition variation',
  'dignityReductions',
  'remediesFor',
].forEach(fragment => assertIncludes(engineSource, fragment, 'Dosh engine source'));

const contractSource = read('packages/astrology/src/kundliKarmaContract.ts');
[
  "'implemented'",
  'fixture-dosh-manglik-present',
  'fixture-dosh-manglik-cancelled',
  'fixture-dosh-nadi-blocked-context',
  'fixture-dosh-arishta-needs-data',
].forEach(fragment => assertIncludes(contractSource, fragment, 'Dosh provenance contract'));

const banned = [
  /you are cursed/i,
  /guaranteed failure/i,
  /guaranteed success/i,
  /only premium can save/i,
  /must buy/i,
  /will ruin/i,
  /will destroy/i,
  /death/i,
];

const fixtureOutputs = {
  clean: composeKundliKarmaDoshIntelligence(buildKundli('clean', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  manglikPresent: composeKundliKarmaDoshIntelligence(buildKundli('manglik-present', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Libra', 8, 188, 7),
    p('Mercury', 'Virgo', 18, 168, 9),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Gemini', 14, 74, 11),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Pisces', 16, 346, 8),
    p('Ketu', 'Virgo', 16, 166, 2),
  ])),
  manglikCancelled: composeKundliKarmaDoshIntelligence(buildKundli('manglik-cancelled', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Aries', 8, 8, 7),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Gemini', 14, 74, 11),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Pisces', 16, 346, 8),
    p('Ketu', 'Virgo', 16, 166, 2),
  ])),
  kaalSarp: composeKundliKarmaDoshIntelligence(buildKundli('kaal-sarp', [
    p('Rahu', 'Aries', 0, 0, 1),
    p('Sun', 'Aries', 10, 10, 1),
    p('Moon', 'Taurus', 20, 50, 2),
    p('Mars', 'Gemini', 4, 64, 3),
    p('Mercury', 'Cancer', 8, 98, 4),
    p('Jupiter', 'Leo', 12, 132, 5),
    p('Venus', 'Virgo', 16, 166, 6),
    p('Saturn', 'Gemini', 25, 85, 3),
    p('Ketu', 'Libra', 0, 180, 7),
  ])),
  shrapit: composeKundliKarmaDoshIntelligence(buildKundli('shrapit', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Aquarius', 20, 320, 7),
    p('Rahu', 'Aquarius', 22, 322, 7),
    p('Ketu', 'Leo', 22, 142, 1),
  ])),
  guruChandal: composeKundliKarmaDoshIntelligence(buildKundli('guru-chandal', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Pisces', 22, 352, 8),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Pisces', 24, 354, 8),
    p('Ketu', 'Virgo', 24, 174, 2),
  ])),
  grahanPitraWeak: composeKundliKarmaDoshIntelligence(buildKundli('grahan-pitra-weak', [
    p('Sun', 'Pisces', 5, 335, 8),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Pisces', 14, 344, 8),
    p('Ketu', 'Virgo', 14, 164, 2),
  ])),
  kemadruma: composeKundliKarmaDoshIntelligence(buildKundli('kemadruma', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Scorpio', 12, 222, 5),
    p('Mars', 'Aquarius', 8, 308, 9),
    p('Mercury', 'Virgo', 18, 168, 9),
    p('Jupiter', 'Sagittarius', 22, 262, 7),
    p('Venus', 'Libra', 14, 194, 3),
    p('Saturn', 'Capricorn', 20, 290, 8),
    p('Rahu', 'Pisces', 16, 346, 11),
    p('Ketu', 'Virgo', 16, 166, 2),
  ])),
  vishVariation: composeKundliKarmaDoshIntelligence(buildKundli('vish-variation', [
    p('Sun', 'Leo', 5, 125, 2),
    p('Moon', 'Taurus', 12, 42, 1),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 5),
    p('Jupiter', 'Sagittarius', 22, 262, 9),
    p('Venus', 'Libra', 14, 194, 6),
    p('Saturn', 'Scorpio', 12, 222, 7),
    p('Rahu', 'Pisces', 16, 346, 11),
    p('Ketu', 'Virgo', 16, 166, 5),
  ])),
  angarak: composeKundliKarmaDoshIntelligence(buildKundli('angarak', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Gemini', 10, 70, 3),
    p('Ketu', 'Sagittarius', 10, 250, 9),
  ])),
  daridra: composeKundliKarmaDoshIntelligence(buildKundli('daridra', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Cancer', 12, 102, 6),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 6),
    p('Jupiter', 'Sagittarius', 22, 262, 8),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Pisces', 16, 346, 8),
    p('Ketu', 'Virgo', 16, 166, 2),
  ])),
  paapKartari: composeKundliKarmaDoshIntelligence(buildKundli('paap-kartari', [
    p('Sun', 'Leo', 5, 125, 5),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 2),
    p('Mercury', 'Virgo', 18, 168, 6),
    p('Jupiter', 'Sagittarius', 22, 262, 8),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Pisces', 20, 350, 12),
    p('Rahu', 'Cancer', 16, 106, 4),
    p('Ketu', 'Capricorn', 16, 286, 10),
  ])),
};

assertStatus(fixtureOutputs.manglikPresent, 'Manglik / Kuja Dosh', 'present');
assertStatus(fixtureOutputs.manglikCancelled, 'Manglik / Kuja Dosh', 'cancelled');
assertStatus(fixtureOutputs.kaalSarp, 'Kaal Sarp Dosh', 'present');
assertStatus(fixtureOutputs.shrapit, 'Shrapit Dosh', 'present');
assertStatus(fixtureOutputs.guruChandal, 'Guru Chandal Dosh', 'cancelled');
assertStatus(fixtureOutputs.grahanPitraWeak, 'Grahan Dosh', 'weak');
assertStatus(fixtureOutputs.grahanPitraWeak, 'Pitra Dosh', 'weak');
assertStatus(fixtureOutputs.kemadruma, 'Kemadruma Dosh', 'present');
assertStatus(fixtureOutputs.vishVariation, 'Vish Dosh', 'pending_evidence');
assertStatus(fixtureOutputs.angarak, 'Angarak Dosh', 'present');
assertStatus(fixtureOutputs.daridra, 'Daridra Dosh', 'weak');
assertStatus(fixtureOutputs.paapKartari, 'Paap Kartari Dosh', 'present');
assertStatus(fixtureOutputs.clean, 'Manglik / Kuja Dosh', 'not_present');
assertStatus(fixtureOutputs.clean, 'Arishta / Balarishta Dosh', 'needs_data');
assertStatus(fixtureOutputs.clean, 'Nadi Dosh', 'blocked_context');

const compatibilityNadi = composeKundliKarmaDoshIntelligence(buildKundli('compatibility-nadi', []), {
  context: 'compatibility',
});
assertStatus(compatibilityNadi, 'Nadi Dosh', 'needs_data');

for (const [name, output] of Object.entries(fixtureOutputs)) {
  assert.equal(output.generatedBy, 'deterministic_contract', `${name}: engine must be deterministic`);
  assert.ok(output.noAiRequiredFor.includes('show Dosh summary'), `${name}: no-AI route hint exists`);
  assertNoFearCopy(output, name);
  for (const item of output.items) {
    assert.equal(item.module, 'DOSH', `${name}/${item.displayName}: module is DOSH`);
    assert.ok(item.ruleId.startsWith('rule-dosh-'), `${name}/${item.displayName}: has Dosh rule id`);
    assert.ok(item.sourceReferenceIds.length > 0, `${name}/${item.displayName}: has source references`);
    assert.ok(item.remedies.some(remedy => remedy.depth === 'free'), `${name}/${item.displayName}: has free remedy`);
    assert.ok(item.remedies.some(remedy => remedy.depth === 'premium'), `${name}/${item.displayName}: has premium remedy`);
    if (item.status === 'present' || item.status === 'weak' || item.status === 'cancelled') {
      assert.ok(item.evidence.length > 0, `${name}/${item.displayName}: active item has evidence`);
      assert.ok(
        item.evidence.some(evidence => evidence.planet && evidence.house && evidence.sign && typeof evidence.degree === 'number') ||
          item.evidence.some(evidence => evidence.kind === 'axis' || evidence.kind === 'lordship'),
        `${name}/${item.displayName}: active item has exact planet/house/sign/degree or explicit axis/lordship evidence`,
      );
    }
    if (item.status === 'not_present') {
      assert.match(item.summary, /Not present/i, `${name}/${item.displayName}: absent item avoids alarm`);
    }
  }
}

const implementedDoshRules = KUNDLI_KARMA_RULE_PROVENANCE.filter(rule =>
  rule.id.startsWith('rule-dosh-') && rule.implementationStatus === 'implemented'
);
for (const rule of implementedDoshRules) {
  assert.ok(rule.sourceReferenceIds.length > 0, `${rule.id}: source references exist`);
  assert.ok(rule.fixtureIds.length > 0, `${rule.id}: fixture ids exist`);
}

assert(
  itemFor(fixtureOutputs.shrapit, 'Shrapit Dosh').crossReferences.some(
    reference => reference.relationship === 'do_not_duplicate',
  ),
  'Shrapit Dosh must cross-reference later Yog duplicate prevention',
);
assert.match(
  itemFor(fixtureOutputs.vishVariation, 'Vish Dosh').whyPresent,
  /unknown tradition variation/i,
  'Vish variation must mark unknown tradition variation',
);

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Dosh engine runtime fixtures passed present, weak, cancelled, not_present, needs_data, pending_evidence, and blocked_context states',
    '- all implemented Dosh outputs carry rule ids, source references, remedies, and evidence',
    '- Nadi Dosh is blocked outside compatibility context',
    '- unknown tradition variation path is marked pending_evidence instead of overclaimed',
    '- fear-selling and curse-language gates passed',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 3 gate passed: Dosh detection, ranking, evidence, remedies, Nadi boundary, and safety checks are green.',
);

function assertStatus(output, displayName, status) {
  assert.equal(itemFor(output, displayName).status, status, `${displayName} status`);
}

function itemFor(output, displayName) {
  const item = output.items.find(candidate => candidate.displayName === displayName);
  assert.ok(item, `missing item ${displayName}`);
  return item;
}

function assertNoFearCopy(output, fixtureName) {
  const serialized = JSON.stringify(output);
  for (const pattern of banned) {
    assert.ok(!pattern.test(serialized), `${fixtureName}: banned phrase ${pattern}`);
  }
}

function p(name, sign, degree, absoluteLongitude, house) {
  return {
    absoluteLongitude,
    degree,
    house,
    name,
    nakshatra: 'Fixture Star',
    pada: 1,
    retrograde: false,
    sign,
  };
}

function buildKundli(id, planets) {
  const resolvedPlanets = planets.length ? planets : [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ];
  return {
    ashtakavarga: {},
    birthDetails: {
      date: '1980-08-22',
      latitude: 19.07,
      longitude: 72.88,
      name: `Dosh Fixture ${id}`,
      place: 'Mumbai, India',
      time: '06:30',
      timezone: 'Asia/Kolkata',
    },
    calculationMeta: {},
    charts: {},
    dasha: {
      current: {
        antardasha: 'Mars',
        endDate: '2027-01-01',
        mahadasha: 'Saturn',
        startDate: '2025-01-01',
      },
      timeline: [],
    },
    houses: [
      { house: 1, lord: 'Sun', planets: [], sign: 'Leo' },
      { house: 2, lord: 'Mercury', planets: [], sign: 'Virgo' },
      { house: 3, lord: 'Venus', planets: [], sign: 'Libra' },
      { house: 4, lord: 'Mars', planets: [], sign: 'Scorpio' },
      { house: 5, lord: 'Jupiter', planets: [], sign: 'Sagittarius' },
      { house: 6, lord: 'Saturn', planets: [], sign: 'Capricorn' },
      { house: 7, lord: 'Saturn', planets: [], sign: 'Aquarius' },
      { house: 8, lord: 'Jupiter', planets: [], sign: 'Pisces' },
      { house: 9, lord: 'Mars', planets: [], sign: 'Aries' },
      { house: 10, lord: 'Venus', planets: [], sign: 'Taurus' },
      { house: 11, lord: 'Mercury', planets: [], sign: 'Gemini' },
      { house: 12, lord: 'Moon', planets: [], sign: 'Cancer' },
    ],
    id,
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Fixture Star',
    planets: resolvedPlanets,
    yogas: [],
  };
}
