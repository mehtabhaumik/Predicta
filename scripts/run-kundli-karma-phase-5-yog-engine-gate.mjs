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
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_5_SUPPORTIVE_AND_CHALLENGING_YOG_ENGINE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const {
  KUNDLI_KARMA_RULE_PROVENANCE,
} = require('../packages/astrology/src/kundliKarmaContract.ts');
const {
  composeKundliKarmaYogIntelligence,
} = require('../packages/astrology/src/kundliKarmaYogEngine.ts');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Raja',
  'Dhana',
  'Gajakesari',
  'Panch Mahapurush',
  'Neecha Bhanga Raja',
  'Vipareeta Raja',
  'Budhaditya',
  'Chandra-Mangal',
  'Lakshmi',
  'Saraswati',
  'Adhi',
  'Dharma-Karmadhipati',
  'Parivartana',
  'Daridra',
  'Kemadruma',
  'Shakata',
  'Paap Kartari',
  'Grahan',
  'Vish',
  'Angarak',
  'Shrapit',
  'Arishta',
  'Kuja / Manglik',
  'Kaal Sarp',
  'Dedupe tests pass for overlapping conditions.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 5 roadmap'));

const engineSource = read('packages/astrology/src/kundliKarmaYogEngine.ts');
[
  'composeKundliKarmaYogIntelligence',
  'buildRajaYog',
  'buildDhanaYog',
  'buildGajakesariYog',
  'buildPanchMahapurushYog',
  'buildNeechaBhangaRajaYog',
  'buildVipareetaRajaYog',
  'buildBudhadityaYog',
  'buildChandraMangalYog',
  'buildLakshmiYog',
  'buildSaraswatiYog',
  'buildAdhiYog',
  'buildDharmaKarmadhipatiYog',
  'buildParivartanaYog',
  'buildChallengingDaridraYog',
  'buildChallengingKemadrumaYog',
  'buildShakataYog',
  'buildChallengingPaapKartariYog',
  'buildChallengingGrahanYog',
  'buildChallengingVishYog',
  'buildChallengingAngarakYog',
  'buildChallengingShrapitYog',
  'buildChallengingArishtaYog',
  'buildChallengingKujaManglikYog',
  'buildChallengingKaalSarpYog',
  'do_not_duplicate',
  'Supportive and challenging Yog can coexist',
].forEach(fragment => assertIncludes(engineSource, fragment, 'Yog engine source'));

const contractSource = read('packages/astrology/src/kundliKarmaContract.ts');
[
  'fixture-yog-raja-present',
  'fixture-yog-dhana-present',
  'fixture-yog-gajakesari-present',
  'fixture-yog-panch-mahapurush-present',
  'fixture-yog-neecha-bhanga-present',
  'fixture-yog-vipareeta-raja-present',
  'fixture-yog-budhaditya-present',
  'fixture-yog-chandra-mangal-present',
  'fixture-yog-lakshmi-present',
  'fixture-yog-saraswati-present',
  'fixture-yog-adhi-present',
  'fixture-yog-dharma-karmadhipati-present',
  'fixture-yog-parivartana-present',
  'fixture-yog-challenging-daridra-cross-ref',
  'fixture-yog-challenging-shakata-present',
  'fixture-yog-challenging-arishta-needs-data',
].forEach(fragment => assertIncludes(contractSource, fragment, 'Yog provenance contract'));

const banned = [
  /you are cursed/i,
  /curse/i,
  /guaranteed failure/i,
  /guaranteed success/i,
  /only premium can save/i,
  /must buy/i,
  /will ruin/i,
  /will destroy/i,
  /death/i,
];
const lessonPhrases = [/this house represents/i, /this yog teaches astrology/i, /method lesson/i];

const outputs = {
  supportiveSuite: composeKundliKarmaYogIntelligence(buildKundli('supportive-suite', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 2),
    p('Mars', 'Sagittarius', 8, 248, 5),
    p('Mercury', 'Sagittarius', 7, 247, 5),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  panchLakshmi: composeKundliKarmaYogIntelligence(buildKundli('panch-lakshmi', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Aries', 8, 8, 1),
    p('Mercury', 'Gemini', 18, 78, 11),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  neechaBhanga: composeKundliKarmaYogIntelligence(buildKundli('neecha-bhanga', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Aries', 8, 8, 1),
    p('Mercury', 'Gemini', 18, 78, 11),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Aries', 20, 20, 9),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  budhaChandra: composeKundliKarmaYogIntelligence(buildKundli('budha-chandra', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Gemini', 12, 72, 3),
    p('Mars', 'Gemini', 13, 73, 3),
    p('Mercury', 'Leo', 7, 127, 1),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  saraswatiAdhi: composeKundliKarmaYogIntelligence(buildKundli('saraswati-adhi', [
    p('Sun', 'Leo', 5, 125, 2),
    p('Moon', 'Aries', 12, 12, 1),
    p('Mars', 'Scorpio', 8, 218, 8),
    p('Mercury', 'Virgo', 18, 168, 6),
    p('Jupiter', 'Libra', 22, 202, 7),
    p('Venus', 'Scorpio', 14, 224, 8),
    p('Saturn', 'Capricorn', 20, 290, 10),
    p('Rahu', 'Aquarius', 16, 316, 11),
    p('Ketu', 'Leo', 16, 136, 5),
  ])),
  dharmaParivartana: composeKundliKarmaYogIntelligence(buildKundli('dharma-parivartana', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Taurus', 12, 42, 10),
    p('Mars', 'Libra', 8, 188, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Aries', 14, 14, 3),
    p('Saturn', 'Capricorn', 20, 290, 6),
    p('Rahu', 'Aquarius', 16, 316, 7),
    p('Ketu', 'Leo', 16, 136, 1),
  ])),
  challengingSuite: composeKundliKarmaYogIntelligence(buildKundli('challenging-suite', [
    p('Sun', 'Pisces', 5, 335, 8),
    p('Moon', 'Gemini', 12, 72, 6),
    p('Mars', 'Gemini', 8, 68, 2),
    p('Mercury', 'Virgo', 18, 168, 6),
    p('Jupiter', 'Capricorn', 22, 292, 1),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Cancer', 20, 110, 12),
    p('Rahu', 'Pisces', 7, 337, 8),
    p('Ketu', 'Virgo', 7, 157, 2),
  ])),
  shrapitAngarakVish: composeKundliKarmaYogIntelligence(buildKundli('shrapit-angarak-vish', [
    p('Sun', 'Leo', 5, 125, 1),
    p('Moon', 'Gemini', 12, 72, 3),
    p('Mars', 'Gemini', 8, 68, 3),
    p('Mercury', 'Virgo', 18, 168, 2),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Libra', 14, 194, 4),
    p('Saturn', 'Gemini', 20, 80, 3),
    p('Rahu', 'Gemini', 10, 70, 3),
    p('Ketu', 'Sagittarius', 10, 250, 9),
  ])),
  kaalSarp: composeKundliKarmaYogIntelligence(buildKundli('kaal-sarp', [
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
};

assertStatus(outputs.supportiveSuite, 'Raja Yog', 'present');
assertStatus(outputs.supportiveSuite, 'Dhana Yog', 'present');
assertStatus(outputs.supportiveSuite, 'Gajakesari Yog', 'present');
assertStatus(outputs.supportiveSuite, 'Vipareeta Raja Yog', 'present');
assertStatus(outputs.panchLakshmi, 'Panch Mahapurush Yog', 'present');
assertStatus(outputs.panchLakshmi, 'Lakshmi Yog', 'present');
assertStatus(outputs.neechaBhanga, 'Neecha Bhanga Raja Yog', 'present');
assertStatus(outputs.budhaChandra, 'Budhaditya Yog', 'present');
assertStatus(outputs.budhaChandra, 'Chandra-Mangal Yog', 'present');
assertStatus(outputs.supportiveSuite, 'Saraswati Yog', 'present');
assertStatus(outputs.saraswatiAdhi, 'Adhi Yog', 'present');
assertStatus(outputs.dharmaParivartana, 'Dharma-Karmadhipati Yog', 'present');
assertStatus(outputs.dharmaParivartana, 'Parivartana Yog', 'present');
assertStatus(outputs.challengingSuite, 'Daridra Yog', 'present');
assertStatus(outputs.challengingSuite, 'Kemadruma Yog', 'present');
assertStatus(outputs.challengingSuite, 'Shakata Yog', 'present');
assertStatus(outputs.challengingSuite, 'Paap Kartari Yog', 'present');
assertStatus(outputs.challengingSuite, 'Grahan Yog', 'present');
assertStatus(outputs.shrapitAngarakVish, 'Vish Yog', 'present');
assertStatus(outputs.shrapitAngarakVish, 'Angarak Yog', 'present');
assertStatus(outputs.shrapitAngarakVish, 'Shrapit Yog', 'present');
assertStatus(outputs.challengingSuite, 'Arishta Yog', 'needs_data');
assertStatus(outputs.panchLakshmi, 'Kuja / Manglik Yog', 'present');
assertStatus(outputs.kaalSarp, 'Kaal Sarp Yog', 'present');
assertStatus(outputs.supportiveSuite, 'Neecha Bhanga Raja Yog', 'not_present');

for (const [name, output] of Object.entries(outputs)) {
  assert.equal(output.generatedBy, 'deterministic_contract', `${name}: engine must be deterministic`);
  assert.ok(output.noAiRequiredFor.includes('show Yog summary'), `${name}: no-AI route hint exists`);
  assert.match(output.safetyNotes.join(' '), /coexist|contradiction note/i, `${name}: contradiction note exists`);
  assertNoForbiddenCopy(output, name);
  for (const item of output.items) {
    assert.ok(
      item.module === 'SUPPORTIVE_YOG' || item.module === 'CHALLENGING_YOG',
      `${name}/${item.displayName}: module is Yog`,
    );
    assert.ok(item.ruleId.startsWith('rule-yog-'), `${name}/${item.displayName}: has Yog rule id`);
    assert.ok(item.sourceReferenceIds.length > 0, `${name}/${item.displayName}: has source references`);
    assert.ok(item.remedies.some(remedy => remedy.depth === 'free'), `${name}/${item.displayName}: has free remedy`);
    assert.ok(item.remedies.some(remedy => remedy.depth === 'premium'), `${name}/${item.displayName}: has premium remedy`);
    if (item.status === 'present' || item.status === 'weak' || item.status === 'cancelled') {
      assert.ok(item.evidence.length > 0, `${name}/${item.displayName}: active item has evidence`);
      assert.ok(
        item.evidence.some(evidence => evidence.planet && evidence.house && evidence.sign && typeof evidence.degree === 'number'),
        `${name}/${item.displayName}: active item has exact planet/house/sign/degree evidence`,
      );
      assert.doesNotMatch(item.meaningForUser, /represents|governs|area is/i, `${name}/${item.displayName}: meaning is not a lesson`);
    }
    if (item.status === 'not_present') {
      assert.match(item.summary, /Not present/i, `${name}/${item.displayName}: absent item avoids alarm`);
    }
  }
}

const implementedYogRules = KUNDLI_KARMA_RULE_PROVENANCE.filter(rule =>
  (rule.module === 'SUPPORTIVE_YOG' || rule.module === 'CHALLENGING_YOG') &&
  rule.implementationStatus === 'implemented'
);
for (const rule of implementedYogRules) {
  assert.ok(rule.sourceReferenceIds.length > 0, `${rule.id}: source references exist`);
  assert.ok(rule.fixtureIds.length > 0, `${rule.id}: fixture ids exist`);
}

const arishtaRule = KUNDLI_KARMA_RULE_PROVENANCE.find(rule => rule.id === 'rule-yog-challenging-arishta');
assert.equal(arishtaRule?.implementationStatus, 'needs_data', 'Arishta Yog remains needs_data');

[
  itemFor(outputs.challengingSuite, 'Daridra Yog'),
  itemFor(outputs.challengingSuite, 'Kemadruma Yog'),
  itemFor(outputs.challengingSuite, 'Paap Kartari Yog'),
  itemFor(outputs.challengingSuite, 'Grahan Yog'),
  itemFor(outputs.shrapitAngarakVish, 'Vish Yog'),
  itemFor(outputs.shrapitAngarakVish, 'Angarak Yog'),
  itemFor(outputs.shrapitAngarakVish, 'Shrapit Yog'),
  itemFor(outputs.panchLakshmi, 'Kuja / Manglik Yog'),
  itemFor(outputs.kaalSarp, 'Kaal Sarp Yog'),
].forEach(item => {
  assert.ok(
    item.crossReferences.some(reference => reference.relationship === 'do_not_duplicate'),
    `${item.displayName}: overlapping challenging Yog must cross-reference owner`,
  );
});

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- supportive Yog runtime fixtures passed for Raja, Dhana, Gajakesari, Panch Mahapurush, Neecha Bhanga Raja, Vipareeta Raja, Budhaditya, Chandra-Mangal, Lakshmi, Saraswati, Adhi, Dharma-Karmadhipati, and Parivartana',
    '- challenging Yog runtime fixtures passed for Daridra, Kemadruma, Shakata, Paap Kartari, Grahan, Vish, Angarak, Shrapit, Kuja/Manglik, and Kaal Sarp',
    '- Arishta Yog remains needs_data with honest pending handling',
    '- overlapping Dosh/Shrap/Yog conditions carry do_not_duplicate cross-references',
    '- all active Yog items carry rule ids, source references, remedies, and exact evidence',
    '- prediction-first and no-fear/no-schooling language gates passed',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 5 gate passed: supportive Yog, challenging Yog, evidence, remedies, dedupe, contradiction framing, and safety checks are green.',
);

function assertStatus(output, displayName, status) {
  assert.equal(itemFor(output, displayName).status, status, `${displayName} status`);
}

function itemFor(output, displayName) {
  const item = output.items.find(candidate => candidate.displayName === displayName);
  assert.ok(item, `missing item ${displayName}`);
  return item;
}

function assertNoForbiddenCopy(output, fixtureName) {
  const serialized = JSON.stringify(output);
  for (const pattern of [...banned, ...lessonPhrases]) {
    assert.ok(!pattern.test(serialized), `${fixtureName}: forbidden phrase ${pattern}`);
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
      name: `Yog Fixture ${id}`,
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
