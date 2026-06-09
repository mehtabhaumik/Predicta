import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_2_EVENT_QUESTION_TAXONOMY_AND_REFINEMENT_ENGINE';
const auditDir = path.join(root, 'docs/audits', phaseName);
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function assertGate(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  `${path.relative(root, auditDir)}/phase-2-question-taxonomy-audit.md`,
  `${path.relative(root, auditDir)}/phase-2-manifest.json`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'career move',
  'promotion',
  'job change',
  'foreign travel',
  'relocation',
  'visa / PR',
  'marriage timing',
  'relationship outcome',
  'money/property',
  'business growth',
  'education/study stream',
  'court/litigation',
  'family/child/matching',
  'wellness caution with safety disclaimers',
  'I have no specific question, guide me',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 2 roadmap'));

const engineSource = read('packages/astrology/src/eventOracleQuestions.ts');
[
  'export type EventQuestionCategoryId',
  'EVENT_QUESTION_CATEGORIES',
  'EVENT_QUESTION_CHIPS',
  'detectEventQuestionCategory',
  'refineEventQuestion',
  'shouldSpendAiCredit: false',
  "'needs-one-clarifier'",
  "'guide-me'",
  "'wellness_caution'",
].forEach(fragment => assertIncludes(engineSource, fragment, 'event question engine'));

const {
  EVENT_QUESTION_CATEGORIES,
  EVENT_QUESTION_CHIPS,
  detectEventQuestionCategory,
  refineEventQuestion,
} = require('../packages/astrology/src/eventOracleQuestions.ts');

const requiredCategories = [
  'business_growth',
  'career_move',
  'court_litigation',
  'education_study_stream',
  'family_child_matching',
  'foreign_travel',
  'guide_me',
  'job_change',
  'marriage_timing',
  'money_property',
  'promotion',
  'relationship_outcome',
  'relocation',
  'visa_pr',
  'wellness_caution',
];

assert.deepEqual(
  EVENT_QUESTION_CATEGORIES.map(category => category.id).sort(),
  requiredCategories.sort(),
  'event category taxonomy must match Phase 2 scope',
);

assertGate(EVENT_QUESTION_CHIPS.length >= 8, 'must expose at least eight pre-populated question chips');

const abroad = refineEventQuestion('Will I get a UK work opportunity this year?');
assert.equal(abroad.categoryId, 'foreign_travel', 'foreign opportunity category');
assert.equal(abroad.clarity, 'clear', 'specific foreign question should be clear');
assert.equal(abroad.downstream.shouldSpendAiCredit, false, 'deterministic foreign match should not spend AI');
assertGate(abroad.downstream.evidenceRooms.includes('kp'), 'foreign question should include KP evidence');
assertGate(abroad.downstream.evidenceRooms.includes('vedic'), 'foreign question should include Vedic evidence');

const vagueCareer = refineEventQuestion('career');
assert.equal(vagueCareer.categoryId, 'career_move', 'vague career category');
assert.equal(vagueCareer.clarity, 'needs-one-clarifier', 'vague career should ask one clarifier');
assertGate(Boolean(vagueCareer.clarifyingQuestion), 'vague career has one clarifying question');
assert.equal(vagueCareer.downstream.shouldSpendAiCredit, false, 'vague deterministic category should not spend AI');
assert.equal(vagueCareer.downstream.preserveOriginalQuestion, 'career', 'original vague intent preserved');
assertGate(vagueCareer.interactionPlan.length <= 3, 'vague refinement reaches question under three interactions');

const guide = refineEventQuestion('', 'guide_me');
assert.equal(guide.categoryId, 'guide_me', 'guide-me category');
assert.equal(guide.clarity, 'guide-me', 'guide-me clarity');
assertGate(Boolean(guide.clarifyingQuestion), 'guide-me has one next question');

const wellness = refineEventQuestion('I am worried about health stress this month');
assert.equal(wellness.categoryId, 'wellness_caution', 'wellness category');
assert.equal(wellness.downstream.needsMedicalDisclaimer, true, 'wellness must carry disclaimer flag');

assert.equal(detectEventQuestionCategory('visa renewal delay'), 'visa_pr', 'visa keyword route');
assert.equal(detectEventQuestionCategory('court case settlement'), 'court_litigation', 'court keyword route');

const configSource = read('packages/config/src/eventOracle.ts');
assertIncludes(configSource, 'getEventOracleCopy', 'event oracle config accessor');

const eventOracleCopy = readJson('packages/config/src/translations/eventOracle.json').copy;
for (const lang of ['en', 'hi', 'gu']) {
  const localized = eventOracleCopy[lang];
  assertGate(Boolean(localized?.composer?.guideMe), `eventOracle ${lang} missing composer.guideMe`);
  assertGate(Boolean(localized?.composer?.freePaid), `eventOracle ${lang} missing freePaid`);
  for (const categoryId of requiredCategories) {
    assertGate(Boolean(localized?.categoryLabels?.[categoryId]), `eventOracle ${lang} missing category label ${categoryId}`);
    assertGate(Boolean(localized?.categoryClarifiers?.[categoryId]), `eventOracle ${lang} missing category clarifier ${categoryId}`);
  }
  for (const chip of EVENT_QUESTION_CHIPS) {
    assertGate(Boolean(localized?.chipQuestions?.[chip.id]), `eventOracle ${lang} missing chip ${chip.id}`);
  }
}

for (const lang of ['hi', 'gu']) {
  const localized = eventOracleCopy[lang];
  const joined = [
    ...Object.values(localized.categoryLabels),
    ...Object.values(localized.chipQuestions),
    ...Object.values(localized.composer),
  ].join(' ');
  for (const forbidden of [
    'event question',
    'Career move',
    'Foreign travel',
    'AI credits',
    'guide करें',
    'guide કરો',
    'refine',
    'work opportunity',
  ]) {
    assertGate(!joined.includes(forbidden), `eventOracle ${lang} leaks English phrase ${forbidden}`);
  }
}

const component = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  'getEventOracleCopy',
  'getEventQuestionChips',
  'refineEventQuestion',
  'copy.composer.guideMe',
  'copy.categoryClarifiers',
  'Primary Predicta Event Oracle',
].forEach(fragment => assertIncludes(component, fragment, 'web event question composer'));

const chatPage = read('apps/web/app/dashboard/chat/page.tsx');
assertIncludes(chatPage, '<WebEventQuestionComposer />', 'primary chat page');

const css = read('apps/web/app/globals.css');
[
  '.event-question-composer',
  '.event-question-chip-grid',
  '.event-question-custom-row',
  '.event-question-refined-card',
  'grid-template-columns: repeat(4, minmax(0, 1fr))',
  'grid-template-columns: repeat(2, minmax(0, 1fr))',
].forEach(fragment => assertIncludes(css, fragment, 'event composer css'));

const manifest = readJson(`${path.relative(root, auditDir)}/phase-2-manifest.json`);
assertGate(manifest.phase === phaseName, 'manifest phase mismatch');
assertGate(manifest.status === 'GREEN', 'manifest status must be GREEN');
for (const key of [
  'eventTaxonomyComplete',
  'prepopulatedQuestionChips',
  'customQuestionInput',
  'guideMeOption',
  'vagueQuestionRefinement',
  'deterministicNoAiCreditForMatching',
  'downstreamStructuredData',
  'freePaidEntitlementCopy',
  'localizedComposerCopy',
]) {
  assertGate(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'engine-sample-output.json'),
  `${JSON.stringify({ abroad, vagueCareer, guide, wellness }, null, 2)}\n`,
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: event taxonomy, deterministic refinement, localized composer, guide-me path, and downstream structured question data are green.`,
);
