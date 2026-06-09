import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_7_PREDICTION_FIRST_LANGUAGE_AND_NO_SCHOOLING_GATE';
const auditDir = path.join(root, 'docs/audits', phaseName);
const failures = [];

const FORBIDDEN_PATTERNS = [
  /\bthis house represents\b/i,
  /\bkp uses\b/i,
  /\bthis report helps you understand\b/i,
  /\btoolkit\b/i,
  /\bmethod lesson\b/i,
  /\bhow to read\b/i,
  /\bimplementation-contract\b/i,
  /\binternal contract\b/i,
  /\bsystem internal\b/i,
  /\bproof first\b/i,
  /\bevidence first\b/i,
  /\bi will read this through\b/i,
  /\bi will keep this inside\b/i,
  /\bmethod will not be mixed\b/i,
];

const OUTCOME_OPENERS = /^(Likely|Delayed|Blocked|Mixed|Possible|Needs clarity):/;

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

function assertForbiddenClean(text, label) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    assertGate(!pattern.test(text), `${label}: forbidden phrase ${pattern}`);
  }
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'packages/astrology/src/eventOraclePredictionEngine.ts',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'apps/web/components/WebPridictaChat.tsx',
  `${path.relative(root, auditDir)}/browser-smoke.json`,
  `${path.relative(root, auditDir)}/phase-7-manifest.json`,
  `${path.relative(root, auditDir)}/phase-7-red-team-audit.md`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Answers start with what the user wants to know',
  'likely / delayed / blocked / mixed / needs clarity',
  'timing window',
  'trigger',
  'action',
  'Technical language is allowed only after the answer',
  'Red-team prompts across all event categories pass',
  'Free answers are useful but concise',
  'Paid answers are deeper, not more verbose filler',
  'Predictions are not fear-based',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 7 roadmap'));

const engineSource = read('packages/astrology/src/eventOraclePredictionEngine.ts');
[
  'export type EventOracleReadingDepth',
  'export type EventOracleReadingDigest',
  'buildEventOracleReadingDigest',
  "return 'Needs clarity:",
  'return `Blocked:',
  "return 'Mixed:",
  'return `Delayed:',
  'return `Likely:',
  'return `Possible:',
].forEach(fragment => assertIncludes(engineSource, fragment, 'Event Oracle prediction-first engine'));
assertForbiddenClean(engineSource, 'Event Oracle prediction engine');

const composerSource = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  'copy.predictionCard.directAnswerLabel',
  'predictionPreview.directAnswer',
  'predictionPreview.timingWindow.label',
  'predictionPreview.mostLikelyTrigger.summary',
  'predictionPreview.whatToDoNow',
  'predictionPreview.collapsedEvidence',
].forEach(fragment => assertIncludes(composerSource, fragment, 'Event Oracle composer answer order'));

const chatSource = read('apps/web/components/WebPridictaChat.tsx');
[
  'start with the prediction',
  'verdict, timing, trigger, and next step first',
  'Vedic prediction, timing, and practical guidance first',
  'proof stays available after that',
].forEach(fragment => assertIncludes(chatSource, fragment, 'Predicta chat no-schooling intro'));
assertForbiddenClean(chatSource, 'Web Predicta chat');

const {
  buildEventOracleEvidenceContract,
  createReadySupportLayer,
} = require('../packages/astrology/src/eventOracleEvidenceContract.ts');
const {
  buildEventOraclePredictionObject,
  buildEventOracleReadingDigest,
} = require('../packages/astrology/src/eventOraclePredictionEngine.ts');
const {
  getEventQuestionCategories,
  refineEventQuestion,
} = require('../packages/astrology/src/eventOracleQuestions.ts');

const redTeamResults = [];
for (const category of getEventQuestionCategories()) {
  const refinement = refineEventQuestion(category.defaultQuestion, category.id);
  const layers = Object.fromEntries(
    refinement.downstream.evidenceRooms.map(layerId => [
      layerId,
      createReadySupportLayer(
        'supports',
        `${layerId} supports the ${category.id} prediction with event-specific timing.`,
      ),
    ]),
  );
  const prediction = buildEventOraclePredictionObject({
    evidenceContract: buildEventOracleEvidenceContract({ refinement, layers }),
    refinement,
    timing: {
      basis: 'Multiple evidence rooms support a practical timing window.',
      endDate: '2026-06-30',
      evidenceLayerIds: refinement.downstream.evidenceRooms.slice(0, 2),
      label: 'Next practical window',
      precision: 'quarter',
      startDate: '2026-04-01',
    },
    trigger: {
      evidenceLayerIds: refinement.downstream.evidenceRooms.slice(0, 2),
      label: 'Real-world trigger',
      summary: 'The trigger is likely to appear through a practical opening, conversation, approval, deadline, or role change tied to the question.',
    },
  });
  const freeDigest = buildEventOracleReadingDigest(prediction, 'FREE');
  const paidDigest = buildEventOracleReadingDigest(prediction, 'PAID');

  assertGate(
    OUTCOME_OPENERS.test(prediction.directAnswer),
    `${category.id}: direct answer must start with outcome label`,
  );
  assertForbiddenClean(prediction.directAnswer, `${category.id} direct answer`);
  assertForbiddenClean(prediction.mostLikelyTrigger.summary, `${category.id} trigger`);
  prediction.whatToDoNow.forEach((action, index) =>
    assertForbiddenClean(action, `${category.id} action ${index}`),
  );
  assertGate(
    freeDigest.action.length <= 2,
    `${category.id}: free digest must remain concise`,
  );
  assertGate(
    paidDigest.action.length > freeDigest.action.length,
    `${category.id}: paid digest must be deeper than free`,
  );
  assertGate(
    paidDigest.evidenceSummary.length >= freeDigest.evidenceSummary.length,
    `${category.id}: paid evidence depth must not be thinner than free`,
  );
  assertGate(
    !/\bdoomed|curse|guaranteed disaster|definitely fail\b/i.test(
      JSON.stringify(prediction),
    ),
    `${category.id}: prediction must not be fear-based`,
  );

  redTeamResults.push({
    categoryId: category.id,
    directAnswer: prediction.directAnswer,
    freeActionCount: freeDigest.action.length,
    paidActionCount: paidDigest.action.length,
  });
}

const blockedRefinement = refineEventQuestion('Will this court matter move in my favor?', 'court_litigation');
const blockedLayers = Object.fromEntries(
  blockedRefinement.downstream.evidenceRooms.map(layerId => [
    layerId,
    createReadySupportLayer('blocks', `${layerId} blocks the event promise right now.`),
  ]),
);
const blockedPrediction = buildEventOraclePredictionObject({
  evidenceContract: buildEventOracleEvidenceContract({
    refinement: blockedRefinement,
    layers: blockedLayers,
  }),
  refinement: blockedRefinement,
});
assert.equal(blockedPrediction.outcome, 'blocked');
assertGate(
  blockedPrediction.directAnswer.startsWith('Blocked:'),
  'blocked red-team answer must start with Blocked:',
);
assertGate(
  !/\bdoomed|curse|guaranteed disaster|definitely fail\b/i.test(blockedPrediction.directAnswer),
  'blocked red-team answer must not be fear-based',
);

const manifest = readJson(`${path.relative(root, auditDir)}/phase-7-manifest.json`);
assertGate(manifest.phase === phaseName, 'manifest phase mismatch');
assertGate(manifest.status === 'GREEN', 'manifest status must be GREEN');
for (const key of [
  'outcomeFirstDirectAnswers',
  'timingTriggerActionBeforeProof',
  'forbiddenSchoolingCopyRejected',
  'allEventCategoriesRedTeamed',
  'freeConcisePaidDeeper',
  'nonFearBasedPredictions',
]) {
  assertGate(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}
assertGate(
  manifest.redTeamCategories === getEventQuestionCategories().length,
  'manifest redTeamCategories must match category count',
);

const browserSmoke = readJson(`${path.relative(root, auditDir)}/browser-smoke.json`);
const predictionCardSmoke = browserSmoke.checks?.primaryPredictaPredictionCard;
assertGate(browserSmoke.phase === phaseName, 'browser smoke phase mismatch');
assertGate(predictionCardSmoke?.outcomeFirst === true, 'browser smoke direct answer must be outcome-first');
assertGate(predictionCardSmoke?.answerBeforeTiming === true, 'browser smoke answer must appear before timing');
assertGate(predictionCardSmoke?.proofAfterTiming === true, 'browser smoke proof must appear after timing');
assertGate(
  Array.isArray(predictionCardSmoke?.forbidden) && predictionCardSmoke.forbidden.length === 0,
  'browser smoke must not include forbidden schooling phrases',
);
assertGate(
  predictionCardSmoke?.documentScrollWidth === browserSmoke.viewportWidth,
  'browser smoke must not overflow viewport',
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: ${redTeamResults.length} event categories open with prediction-first answers, reject schooling/toolkit copy, keep free concise, make paid deeper, and avoid fear-based language.`,
);
