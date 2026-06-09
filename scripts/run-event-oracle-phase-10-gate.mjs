import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const Module = require('module');
const root = process.cwd();
const aliasMap = new Map([
  ['@pridicta/config', path.join(root, 'packages/config/src/index.ts')],
  ['@pridicta/types', path.join(root, 'packages/types/src/index.ts')],
]);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
  if (aliasMap.has(request)) return aliasMap.get(request);
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

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

const phaseName =
  'PREDICTA_EVENT_ORACLE_PHASE_10_PREDICTION_TRACKER_OUTCOME_LEDGER_AND_TRUST_LOOP';
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
  'packages/astrology/src/eventOracleOutcomeTracker.ts',
  'packages/astrology/src/index.ts',
  'packages/config/src/eventOracle.ts',
  'packages/config/src/translations/eventOracle.json',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'apps/web/components/WebAdminHumanReviewPanel.tsx',
  'apps/web/app/globals.css',
  `${path.relative(root, auditDir)}/phase-10-manifest.json`,
  `${path.relative(root, auditDir)}/phase-10-outcome-ledger-audit.md`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Saved prediction cards',
  'happened',
  'partially happened',
  'did not happen',
  'pending',
  'too early to judge',
  'Follow-up reminder by timing window',
  'Admin analytics by event category, confidence band, and outcome',
  'Outcomes never expose private data to Family Vault unless explicitly shared',
  'Accuracy metrics are category-aware and not misleading',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 10 roadmap'));

const trackerSource = read('packages/astrology/src/eventOracleOutcomeTracker.ts');
[
  'export type EventOracleOutcomeState',
  'export type EventOraclePredictionTrackerCard',
  'createPredictionTrackerCard',
  'updatePredictionOutcome',
  'setPredictionFamilyVaultSharing',
  'isPredictionVisibleToFamilyVault',
  'refreshPredictionReminderState',
  'buildOutcomeAnalytics',
  'pending or too-early predictions',
].forEach(fragment => assertIncludes(trackerSource, fragment, 'outcome tracker engine'));

const webComposer = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  'PREDICTION_TRACKER_KEY',
  'createPredictionTrackerCard',
  'copy.tracker.savePrediction',
  'copy.tracker.familyPrivate',
  'changeOutcome',
  'toggleFamilyShare',
  'isPredictionVisibleToFamilyVault',
].forEach(fragment => assertIncludes(webComposer, fragment, 'web tracker UI'));

const adminPanel = read('apps/web/components/WebAdminHumanReviewPanel.tsx');
[
  'buildOutcomeAnalytics',
  'eventCopy.tracker.adminAnalyticsTitle',
  'eventCopy.tracker.analyticsCaution',
  'category.trustRateLabel',
].forEach(fragment => assertIncludes(adminPanel, fragment, 'admin analytics UI'));

const css = read('apps/web/app/globals.css');
[
  '.event-question-tracker-panel',
  '.event-question-tracker-grid',
  '.event-question-tracker-card',
  '.event-question-tracker-card dl',
  'grid-template-columns: 1fr',
].forEach(fragment => assertIncludes(css, fragment, 'tracker responsive CSS'));

const translations = readJson('packages/config/src/translations/eventOracle.json');
for (const language of ['en', 'hi', 'gu']) {
  const tracker = translations.copy?.[language]?.tracker;
  assertGate(Boolean(tracker), `missing tracker copy for ${language}`);
  [
    'title',
    'savePrediction',
    'markOutcome',
    'familyPrivate',
    'shareWithFamily',
    'unshareFromFamily',
    'happened',
    'partiallyHappened',
    'didNotHappen',
    'pending',
    'tooEarly',
    'adminAnalyticsTitle',
    'analyticsCaution',
  ].forEach(key => assertGate(Boolean(tracker?.[key]), `missing tracker.${key} for ${language}`));
}

const {
  buildEventOracleEvidenceContract,
  buildEventOraclePredictionObject,
  buildOutcomeAnalytics,
  createPredictionTrackerCard,
  createReadySupportLayer,
  isPredictionVisibleToFamilyVault,
  refineEventQuestion,
  refreshPredictionReminderState,
  setPredictionFamilyVaultSharing,
  updatePredictionOutcome,
} = require('../packages/astrology/src/index.ts');

const refinement = refineEventQuestion(
  'Will a foreign work opportunity open for me this year?',
  'foreign_travel',
);
const evidenceContract = buildEventOracleEvidenceContract({
  refinement,
  layers: {
    jaimini: createReadySupportLayer('supports', 'Jaimini supports foreign work direction.'),
    kp: createReadySupportLayer('supports', 'KP supports event timing.'),
    vedic: createReadySupportLayer('supports', 'Vedic dasha supports movement.'),
  },
});
const prediction = buildEventOraclePredictionObject({
  evidenceContract,
  refinement,
  timing: {
    basis: 'Three evidence rooms agree on a practical work-linked timing window.',
    endDate: '2026-06-30',
    evidenceLayerIds: ['vedic', 'kp', 'jaimini'],
    label: 'March to June',
    precision: 'month_range',
    startDate: '2026-03-01',
  },
  trigger: {
    evidenceLayerIds: ['kp', 'vedic'],
    label: 'Workplace trigger',
    summary: 'The trigger may come through a workplace vacancy or team change.',
  },
});
const card = createPredictionTrackerCard({
  nowIso: '2026-03-01T00:00:00.000Z',
  prediction,
});
assert.equal(card.outcomeState, 'pending');
assert.equal(card.privacy, 'private');
assert.equal(card.originalQuestion, prediction.question.original);
assert.equal(card.answer, prediction.directAnswer);
assert.equal(card.timingWindow.label, 'March to June');
assert.equal(card.trigger, prediction.mostLikelyTrigger.summary);
assert.equal(card.confidence.label, prediction.confidence.label);
assert.ok(card.evidenceSourceLabels.length >= 3);
assert.equal(isPredictionVisibleToFamilyVault(card), false);
assert.equal(card.followUpReminder.state, 'pending');

const dueCard = refreshPredictionReminderState(card, '2026-07-01T00:00:00.000Z');
assert.equal(dueCard.followUpReminder.state, 'due');

const happenedCard = updatePredictionOutcome(dueCard, {
  note: 'User reported the workplace opportunity partly opened.',
  outcomeState: 'partially_happened',
  updatedAt: '2026-07-02T00:00:00.000Z',
});
assert.equal(happenedCard.outcomeState, 'partially_happened');
assert.equal(happenedCard.followUpReminder.state, 'completed');

const sharedCard = setPredictionFamilyVaultSharing(
  happenedCard,
  true,
  '2026-07-02T00:10:00.000Z',
);
assert.equal(isPredictionVisibleToFamilyVault(sharedCard), true);
const privateAgain = setPredictionFamilyVaultSharing(
  sharedCard,
  false,
  '2026-07-02T00:15:00.000Z',
);
assert.equal(isPredictionVisibleToFamilyVault(privateAgain), false);

const pendingCareer = createPredictionTrackerCard({
  nowIso: '2026-06-01T00:00:00.000Z',
  prediction: buildEventOraclePredictionObject({
    evidenceContract: buildEventOracleEvidenceContract({
      refinement: refineEventQuestion('Will I change jobs this year?', 'job_change'),
      layers: {
        kp: createReadySupportLayer('supports', 'KP supports job movement.'),
        vedic: createReadySupportLayer('mixed', 'Vedic timing is mixed.'),
      },
    }),
    refinement: refineEventQuestion('Will I change jobs this year?', 'job_change'),
  }),
});
const analytics = buildOutcomeAnalytics([privateAgain, pendingCareer]);
assert.equal(analytics.totalTracked, 2);
assert.ok(analytics.caution.includes('exclude pending'));
const foreignAnalytics = analytics.byCategory.find(item => item.categoryId === 'foreign_travel');
assert.ok(foreignAnalytics);
assert.equal(foreignAnalytics.reviewableCount, 1);
assert.equal(foreignAnalytics.outcomeCounts.partially_happened, 1);
assert.ok(foreignAnalytics.trustRateLabel.includes('matched'));
const jobAnalytics = analytics.byCategory.find(item => item.categoryId === 'job_change');
assert.ok(jobAnalytics);
assert.equal(jobAnalytics.reviewableCount, 0);
assert.equal(jobAnalytics.trustRateLabel, 'Not enough judged outcomes yet');

if (failures.length) {
  console.error(`${phaseName}: FAIL`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);
