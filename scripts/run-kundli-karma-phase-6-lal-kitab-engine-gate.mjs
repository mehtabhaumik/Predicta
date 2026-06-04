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
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_6_LAL_KITAB_ENGINE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const {
  KUNDLI_KARMA_RULE_PROVENANCE,
} = require('../packages/astrology/src/kundliKarmaContract.ts');
const {
  composeKundliKarmaLalKitabIntelligence,
} = require('../packages/astrology/src/kundliKarmaLalKitabEngine.ts');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Add planet-in-house Lal Kitab readings.',
  'Add Lal Kitab Rin/Debt indicators where deterministic rules are available.',
  'Add planet-wise upay.',
  'one remedy at a time',
  'low-cost and non-fearful',
  'no harmful, illegal, medical, or guaranteed claims',
  'no expensive puja pressure',
  '40-day/90-day plan',
  'safe fallback when a Lal Kitab rule is tradition-dependent',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 6 roadmap'));

const engineSource = read('packages/astrology/src/kundliKarmaLalKitabEngine.ts');
[
  'composeKundliKarmaLalKitabIntelligence',
  'buildPlanetHouseReading',
  'buildRinIndicators',
  'buildUpayItems',
  'buildUnsupportedVariation',
  'one safe remedy at a time',
  '40-day/90-day plan',
  'Lal Kitab remains a separate remedial layer',
].forEach(fragment => assertIncludes(engineSource, fragment, 'Lal Kitab engine source'));

const contractSource = read('packages/astrology/src/kundliKarmaContract.ts');
[
  'fixture-lal-kitab-planet-house-readings',
  'fixture-lal-kitab-rin-present',
  'fixture-lal-kitab-upay-safety',
  'fixture-lal-kitab-unsupported-variation',
  'rule-lal-kitab-unsupported-variation',
].forEach(fragment => assertIncludes(contractSource, fragment, 'Lal Kitab provenance contract'));

const banned = [
  /guaranteed failure/i,
  /guaranteed success/i,
  /only premium can save/i,
  /must buy/i,
  /will ruin/i,
  /will destroy/i,
  /death/i,
  /cure/i,
  /diagnos/i,
  /medical treatment/i,
  /expensive puja/i,
  /do harmful/i,
  /do illegal/i,
];

const output = composeKundliKarmaLalKitabIntelligence(buildKundli('lal-kitab-core', [
  p('Sun', 'Aries', 5, 5, 9),
  p('Moon', 'Cancer', 12, 102, 4),
  p('Mars', 'Gemini', 8, 68, 3),
  p('Mercury', 'Virgo', 18, 168, 2),
  p('Jupiter', 'Pisces', 22, 352, 5),
  p('Venus', 'Libra', 14, 194, 7),
  p('Saturn', 'Scorpio', 20, 230, 8),
  p('Rahu', 'Pisces', 24, 354, 5),
  p('Ketu', 'Virgo', 24, 174, 11),
]));

assert.equal(output.generatedBy, 'deterministic_contract', 'engine must be deterministic');
assert.equal(output.items.every(item => item.module === 'LAL_KITAB'), true, 'all items remain Lal Kitab module');
assert.ok(output.noAiRequiredFor.includes('show Lal Kitab summary'), 'no-AI route hint exists');
assert.match(output.safetyNotes.join(' '), /separate remedial layer/i, 'separate Lal Kitab layer is stated');
assert.match(output.safetyNotes.join(' '), /one safe remedy at a time/i, 'one-at-a-time remedy safety is stated');
assertNoUnsafeCopy(output, 'core output');

assertStatus(output, 'Lal Kitab Sun in house 9', 'present');
assertStatus(output, 'Lal Kitab Moon in house 4', 'present');
assertStatus(output, 'Lal Kitab Saturn in house 8', 'present');
assertStatus(output, 'Lal Kitab Pitru Rin indicator', 'present');
assertStatus(output, 'Lal Kitab Matru Rin indicator', 'present');
assertStatus(output, 'Lal Kitab Guru Rin indicator', 'present');
assertStatus(output, 'Lal Kitab Sun upay', 'present');
assertStatus(output, 'Lal Kitab unsupported tradition variation', 'needs_data');

const planetHouseItems = output.items.filter(item => item.ruleId === 'rule-lal-kitab-planet-house' && item.status === 'present');
assert.equal(planetHouseItems.length, 9, 'all nine classical/node planet-house readings are present');

for (const item of output.items) {
  assert.ok(item.ruleId.startsWith('rule-lal-kitab-'), `${item.displayName}: has Lal Kitab rule id`);
  assert.ok(item.sourceReferenceIds.length > 0, `${item.displayName}: has source references`);
  assert.ok(item.remedies.some(remedy => remedy.depth === 'free'), `${item.displayName}: has free remedy`);
  assert.ok(item.remedies.some(remedy => remedy.depth === 'premium'), `${item.displayName}: has premium remedy`);
  assert.ok(
    item.remedies.some(remedy => /40 days|40-day/i.test(`${remedy.description} ${remedy.title}`)),
    `${item.displayName}: free/premium remedy includes 40-day framing`,
  );
  assert.ok(
    item.remedies.some(remedy => /90-day|90 day|90-day plan/i.test(`${remedy.description} ${remedy.title}`)),
    `${item.displayName}: premium remedy includes 90-day framing`,
  );
  if (item.status === 'present' || item.status === 'weak') {
    assert.ok(item.evidence.length > 0, `${item.displayName}: active item has evidence`);
    assert.ok(
      item.evidence.some(evidence => evidence.planet && evidence.house && evidence.sign && typeof evidence.degree === 'number'),
      `${item.displayName}: active item has exact planet/house/sign/degree evidence`,
    );
  }
}

for (const item of output.items.filter(candidate => candidate.ruleId === 'rule-lal-kitab-upay')) {
  assert.match(item.meaningForUser, /Start with one/i, `${item.displayName}: upay says one at a time`);
  assert.match(item.meaningForUser, /Avoid-list/i, `${item.displayName}: upay includes avoid-list`);
}

const implementedLalKitabRules = KUNDLI_KARMA_RULE_PROVENANCE.filter(rule =>
  rule.module === 'LAL_KITAB' && rule.implementationStatus === 'implemented'
);
assert.equal(implementedLalKitabRules.length, 3, 'planet-house, Rin, and upay rules are implemented');
for (const rule of implementedLalKitabRules) {
  assert.ok(rule.sourceReferenceIds.length > 0, `${rule.id}: source references exist`);
  assert.ok(rule.fixtureIds.length > 0, `${rule.id}: fixture ids exist`);
}

const unsupportedRule = KUNDLI_KARMA_RULE_PROVENANCE.find(rule => rule.id === 'rule-lal-kitab-unsupported-variation');
assert.equal(unsupportedRule?.implementationStatus, 'needs_data', 'unsupported variation remains needs_data');

const clean = composeKundliKarmaLalKitabIntelligence(buildKundli('lal-kitab-clean', [
  p('Sun', 'Leo', 5, 125, 1),
  p('Moon', 'Taurus', 12, 42, 10),
  p('Mars', 'Gemini', 8, 68, 3),
  p('Mercury', 'Virgo', 18, 168, 2),
  p('Jupiter', 'Sagittarius', 22, 262, 7),
  p('Venus', 'Libra', 14, 194, 4),
  p('Saturn', 'Capricorn', 20, 290, 6),
  p('Rahu', 'Aquarius', 16, 316, 11),
  p('Ketu', 'Leo', 16, 136, 5),
]));
assertStatus(clean, 'Lal Kitab Rin / debt indicators', 'not_present');
assertNoUnsafeCopy(clean, 'clean output');

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Lal Kitab engine runtime fixture passed planet-in-house readings for all nine classical/node grahas',
    '- deterministic Rin indicators passed for Pitru, Matru, and Guru Rin',
    '- planet-wise upay items passed one-at-a-time, avoid-list, free 40-day, and premium 40-day/90-day safety checks',
    '- unsupported tradition variation remains needs_data',
    '- Lal Kitab remains separate from Dosh, Shrap, and Yog modules',
    '- unsafe remedy and fear-language gates passed',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 6 gate passed: Lal Kitab planet-house readings, Rin indicators, safe upay, unsupported fallback, and remedy safety checks are green.',
);

function assertStatus(result, displayName, status) {
  assert.equal(itemFor(result, displayName).status, status, `${displayName} status`);
}

function itemFor(result, displayName) {
  const item = result.items.find(candidate => candidate.displayName === displayName);
  assert.ok(item, `missing item ${displayName}`);
  return item;
}

function assertNoUnsafeCopy(result, fixtureName) {
  const serialized = JSON.stringify(result);
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
      name: `Lal Kitab Fixture ${id}`,
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
