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
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_4_SHRAP_KARMIC_DEBT_DETECTION_AND_REMEDY_ENGINE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const {
  KUNDLI_KARMA_RULE_PROVENANCE,
} = require('../packages/astrology/src/kundliKarmaContract.ts');
const {
  composeKundliKarmaShrapIntelligence,
} = require('../packages/astrology/src/kundliKarmaShrapEngine.ts');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Implement the section as `Karmic Debt & Shrap Indicators`.',
  'Pitru Shrap',
  'Matru Shrap',
  'Guru Shrap',
  'Sarpa / Naga Shrap',
  'Preta Shrap',
  'Bhratri / Bandhu Shrap',
  'Stree / Patni Shrap',
  'Deva / Brahma Shrap',
  'Each item must use `indicator` unless evidence is strong.',
  'No output says the user is cursed.',
  'Cross-reference tests prevent repeated Shrapit readings.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 4 roadmap'));

const engineSource = read('packages/astrology/src/kundliKarmaShrapEngine.ts');
[
  'composeKundliKarmaShrapIntelligence',
  'buildPitruShrap',
  'buildMatruShrap',
  'buildGuruShrap',
  'buildSarpaNagaShrap',
  'buildPretaShrap',
  'buildBhratriBandhuShrap',
  'buildStreePatniShrap',
  'buildDevaBrahmaShrap',
  'karmic debt or karmic pressure indicator',
  'shrapitDoshReferences',
  'do_not_duplicate',
].forEach(fragment => assertIncludes(engineSource, fragment, 'Shrap engine source'));

const contractSource = read('packages/astrology/src/kundliKarmaContract.ts');
[
  'fixture-shrap-pitru-present',
  'fixture-shrap-matru-weak',
  'fixture-shrap-guru-present',
  'fixture-shrap-sarpa-naga-present',
  'fixture-needs-data-preta-shrap',
  'fixture-shrap-bhratri-bandhu-weak',
  'fixture-shrap-stree-patni-present',
  'fixture-shrap-deva-brahma-weak',
].forEach(fragment => assertIncludes(contractSource, fragment, 'Shrap provenance contract'));

const banned = [
  /cursed/i,
  /curse/i,
  /guaranteed failure/i,
  /guaranteed success/i,
  /only premium can save/i,
  /must buy/i,
  /will ruin/i,
  /will destroy/i,
  /death/i,
];

const fixtureOutputs = {
  clean: composeKundliKarmaShrapIntelligence(buildKundli('clean', [
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
  pitruPresent: composeKundliKarmaShrapIntelligence(buildKundli('pitru-present', [
    p('Sun', 'Aries', 5, 5, 9),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Aries', 9, 9, 9),
    p('Rahu', 'Gemini', 11, 71, 3),
    p('Ketu', 'Sagittarius', 11, 251, 5),
  ])),
  matruWeak: composeKundliKarmaShrapIntelligence(buildKundli('matru-weak', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Scorpio', 12, 222, 4),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Scorpio', 18, 228, 4),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  guruPresent: composeKundliKarmaShrapIntelligence(buildKundli('guru-present', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Capricorn', 8, 278, 9),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Pisces', 22, 352, 8),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 12, 282, 9),
    p('Rahu', 'Pisces', 24, 354, 8),
    p('Ketu', 'Virgo', 24, 174, 2),
  ])),
  sarpaPresent: composeKundliKarmaShrapIntelligence(buildKundli('sarpa-present', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Sagittarius', 16, 256, 5),
    p('Ketu', 'Gemini', 16, 76, 11),
  ])),
  bhratriWeak: composeKundliKarmaShrapIntelligence(buildKundli('bhratri-weak', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Capricorn', 14, 284, 6),
    p('Saturn', 'Aquarius', 20, 320, 7),
    p('Rahu', 'Pisces', 16, 346, 8),
    p('Ketu', 'Virgo', 16, 166, 2),
  ])),
  streePresent: composeKundliKarmaShrapIntelligence(buildKundli('stree-present', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Aquarius', 8, 308, 7),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Pisces', 14, 344, 8),
    p('Saturn', 'Aquarius', 20, 320, 7),
    p('Rahu', 'Pisces', 16, 346, 8),
    p('Ketu', 'Virgo', 16, 166, 2),
  ])),
  devaWeak: composeKundliKarmaShrapIntelligence(buildKundli('deva-weak', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Sagittarius', 25, 265, 5),
  ])),
  shrapitBoundary: composeKundliKarmaShrapIntelligence(buildKundli('shrapit-boundary', [
    p('Sun', 'Aries', 5, 5, 9),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Aries', 9, 9, 9),
    p('Rahu', 'Aries', 11, 11, 9),
    p('Ketu', 'Libra', 11, 191, 3),
  ])),
};

assertStatus(fixtureOutputs.pitruPresent, 'Pitru Shrap', 'present');
assertStatus(fixtureOutputs.matruWeak, 'Matru Shrap', 'weak');
assertStatus(fixtureOutputs.guruPresent, 'Guru Shrap', 'present');
assertStatus(fixtureOutputs.sarpaPresent, 'Sarpa / Naga Shrap', 'present');
assertStatus(fixtureOutputs.clean, 'Preta Shrap', 'needs_data');
assertStatus(fixtureOutputs.bhratriWeak, 'Bhratri / Bandhu Shrap', 'weak');
assertStatus(fixtureOutputs.streePresent, 'Stree / Patni Shrap', 'present');
assertStatus(fixtureOutputs.devaWeak, 'Deva / Brahma Shrap', 'weak');
assertStatus(fixtureOutputs.clean, 'Pitru Shrap', 'not_present');

for (const [name, output] of Object.entries(fixtureOutputs)) {
  assert.equal(output.generatedBy, 'deterministic_contract', `${name}: engine must be deterministic`);
  assert.ok(output.noAiRequiredFor.includes('show Shrap summary'), `${name}: no-AI route hint exists`);
  assertNoFearCopy(output, name);
  for (const item of output.items) {
    assert.equal(item.module, 'SHRAP', `${name}/${item.displayName}: module is SHRAP`);
    assert.ok(item.ruleId.startsWith('rule-shrap-'), `${name}/${item.displayName}: has Shrap rule id`);
    assert.ok(item.sourceReferenceIds.length > 0, `${name}/${item.displayName}: has source references`);
    assert.ok(item.remedies.some(remedy => remedy.depth === 'free'), `${name}/${item.displayName}: has free remedy`);
    assert.ok(item.remedies.some(remedy => remedy.depth === 'premium'), `${name}/${item.displayName}: has premium remedy`);
    if (item.status === 'present' || item.status === 'weak') {
      assert.ok(item.evidence.length > 0, `${name}/${item.displayName}: active item has evidence`);
      assert.ok(
        item.evidence.some(evidence => evidence.planet && evidence.house && evidence.sign && typeof evidence.degree === 'number'),
        `${name}/${item.displayName}: active item has exact planet/house/sign/degree evidence`,
      );
      assert.match(
        `${item.summary} ${item.meaningForUser}`,
        /indicator/i,
        `${name}/${item.displayName}: active Shrap output must remain indicator-based`,
      );
    }
    if (item.status === 'weak') {
      assert.match(
        `${item.summary} ${item.meaningForUser}`,
        /partial|indicator/i,
        `${name}/${item.displayName}: weak Shrap output must say partial/indicator`,
      );
    }
    if (item.status === 'not_present') {
      assert.match(item.summary, /Not present/i, `${name}/${item.displayName}: absent item avoids alarm`);
    }
  }
}

const implementedShrapRules = KUNDLI_KARMA_RULE_PROVENANCE.filter(rule =>
  rule.id.startsWith('rule-shrap-') && rule.implementationStatus === 'implemented'
);
assert.equal(implementedShrapRules.length, 7, 'seven Shrap rules are implemented; Preta remains needs_data');
for (const rule of implementedShrapRules) {
  assert.ok(rule.sourceReferenceIds.length > 0, `${rule.id}: source references exist`);
  assert.ok(rule.fixtureIds.length > 0, `${rule.id}: fixture ids exist`);
}

const pretaRule = KUNDLI_KARMA_RULE_PROVENANCE.find(rule => rule.id === 'rule-shrap-preta');
assert.equal(pretaRule?.implementationStatus, 'needs_data', 'Preta Shrap must remain needs_data');

assert(
  itemFor(fixtureOutputs.shrapitBoundary, 'Pitru Shrap').crossReferences.some(
    reference => reference.relationship === 'do_not_duplicate' && reference.ruleId === 'rule-dosh-shrapit',
  ),
  'Shrapit overlap must cross-reference Dosh ownership instead of repeating the full Shrapit reading',
);

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Shrap engine runtime fixtures passed present, weak, not_present, and needs_data states',
    '- all implemented Shrap indicators carry rule ids, source references, fixtures, remedies, and exact evidence',
    '- weak/partial Shrap output stays indicator-based and does not use certainty language',
    '- Preta Shrap remains needs_data with honest pending handling',
    '- Shrapit overlap is cross-referenced to Dosh ownership with do_not_duplicate',
    '- fear-selling and curse-language gates passed',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 4 gate passed: Shrap/Karmic Debt indicators, evidence, remedies, Preta needs-data, Shrapit dedupe, and safety checks are green.',
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
  return {
    ashtakavarga: {},
    birthDetails: {
      date: '1980-08-22',
      latitude: 19.07,
      longitude: 72.88,
      name: `Shrap Fixture ${id}`,
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
    planets,
    yogas: [],
  };
}
