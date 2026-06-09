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
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_4_PRECISION_TIMING_TRIGGER_AND_CONFIDENCE_ENGINE';
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
  'packages/astrology/src/eventOraclePredictionEngine.ts',
  `${path.relative(root, auditDir)}/phase-4-prediction-engine-audit.md`,
  `${path.relative(root, auditDir)}/phase-4-manifest.json`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  '`directAnswer`',
  '`timingWindow`',
  '`mostLikelyTrigger`',
  '`confidence`',
  '`whatCanDelayIt`',
  '`whatCanStrengthenIt`',
  '`whatToDoNow`',
  '`collapsedEvidence`',
  'exact date only when evidence supports it',
  'no fake certainty',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 4 roadmap'));

const source = read('packages/astrology/src/eventOraclePredictionEngine.ts');
[
  'export type EventOraclePredictionObject',
  'directAnswer',
  'timingWindow',
  'mostLikelyTrigger',
  'confidence',
  'whatCanDelayIt',
  'whatCanStrengthenIt',
  'whatToDoNow',
  'collapsedEvidence',
  'noGuaranteedOutcome: true',
  'exactDateSupported',
  'buildEventOraclePredictionObject',
].forEach(fragment => assertIncludes(source, fragment, 'event prediction engine'));

const indexSource = read('packages/astrology/src/index.ts');
assertIncludes(indexSource, "export * from './eventOraclePredictionEngine';", 'astrology export');

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  '"test:event-oracle-phase-4": "node scripts/run-event-oracle-phase-4-gate.mjs"',
  'package script',
);

const {
  buildEventOracleEvidenceContract,
  createReadySupportLayer,
} = require('../packages/astrology/src/eventOracleEvidenceContract.ts');
const { buildEventOraclePredictionObject } = require('../packages/astrology/src/eventOraclePredictionEngine.ts');
const { refineEventQuestion } = require('../packages/astrology/src/eventOracleQuestions.ts');

const foreign = refineEventQuestion('Will I get a UK work opportunity this year?');
const supportiveEvidence = buildEventOracleEvidenceContract({
  refinement: foreign,
  layers: {
    jaimini: createReadySupportLayer('supports', 'Jaimini karaka direction supports work-linked foreign movement.'),
    kp: {
      availability: 'ready',
      confidence: 'moderate',
      stance: 'supports',
      summary: 'KP promise is visible through foreign-work houses and event carriers.',
      technicalPoints: ['Relevant cusps and significators support work movement.'],
    },
    numerology: {
      availability: 'partial',
      confidence: 'weak',
      stance: 'neutral',
      summary: 'Numerology gives timing color only.',
      technicalPoints: ['Personal year rhythm is secondary.'],
    },
    vedic: createReadySupportLayer('supports', 'Vedic dasha and transit evidence support a foreign-work opening.'),
  },
});

const supportivePrediction = buildEventOraclePredictionObject({
  evidenceContract: supportiveEvidence,
  refinement: foreign,
  timing: {
    basis: 'Vedic dasha support and KP timing readiness agree on a practical near window.',
    endDate: '2026-06-30',
    evidenceLayerIds: ['vedic', 'kp'],
    label: 'March to June 2026',
    precision: 'month_range',
    startDate: '2026-03-01',
  },
  trigger: {
    evidenceLayerIds: ['kp', 'vedic'],
    label: 'Company-linked foreign opportunity',
    summary: 'The trigger may come through your existing company, a senior colleague, team restructuring, or a role opened by someone leaving.',
  },
});

for (const field of [
  'directAnswer',
  'timingWindow',
  'mostLikelyTrigger',
  'confidence',
  'whatCanDelayIt',
  'whatCanStrengthenIt',
  'whatToDoNow',
  'collapsedEvidence',
]) {
  assertGate(Boolean(supportivePrediction[field]), `prediction missing field ${field}`);
}
assert.equal(supportivePrediction.contractVersion, 'event-oracle-prediction-phase-4-v1');
assert.equal(supportivePrediction.deterministic, true);
assert.equal(supportivePrediction.noGuaranteedOutcome, true);
assert.equal(supportivePrediction.outcome, 'likely');
assert.equal(supportivePrediction.timingWindow.precision, 'month_range');
assertGate(
  supportivePrediction.mostLikelyTrigger.summary.includes('existing company'),
  'trigger must be practical and real-world oriented',
);
assertGate(
  supportivePrediction.confidence.evidenceBacked === true && supportivePrediction.confidence.score > 0,
  'confidence must be evidence-backed',
);
assertGate(
  supportivePrediction.collapsedEvidence.every(item => item.sourceAware === true && item.label),
  'collapsed evidence must remain source-aware',
);
assertGate(
  !supportivePrediction.directAnswer.toLowerCase().includes('guarantee'),
  'direct answer must not claim guarantee',
);

const unsupportedExactDate = buildEventOraclePredictionObject({
  evidenceContract: supportiveEvidence,
  refinement: foreign,
  timing: {
    basis: 'User asked for an exact date, but evidence only supports a broader window.',
    evidenceLayerIds: ['vedic'],
    label: '12 April 2026',
    precision: 'exact_date',
    startDate: '2026-04-12',
  },
});
assert.equal(
  unsupportedExactDate.timingWindow.precision,
  'not_precise_yet',
  'unsupported exact date must be downgraded',
);
assertGate(
  unsupportedExactDate.timingWindow.honestyNote.includes('does not prove exact-date precision'),
  'unsupported exact date downgrade needs honesty note',
);

const supportedExactDate = buildEventOraclePredictionObject({
  evidenceContract: supportiveEvidence,
  refinement: foreign,
  timing: {
    basis: 'Deterministic timing evidence explicitly supports date-level precision.',
    evidenceLayerIds: ['vedic', 'kp'],
    exactDateSupported: true,
    label: '12 April 2026',
    precision: 'exact_date',
    startDate: '2026-04-12',
  },
});
assert.equal(supportedExactDate.timingWindow.precision, 'exact_date');
assertGate(
  supportedExactDate.timingWindow.honestyNote.includes('explicitly supports it'),
  'supported exact date must explain why it is allowed',
);

const conflictedEvidence = buildEventOracleEvidenceContract({
  refinement: foreign,
  layers: {
    jaimini: {
      availability: 'partial',
      confidence: 'moderate',
      stance: 'mixed',
      summary: 'Jaimini is mixed for work-linked foreign movement.',
      technicalPoints: ['Karakas are mixed.'],
    },
    kp: {
      availability: 'ready',
      confidence: 'strong',
      stance: 'blocks',
      summary: 'KP blocks near-term foreign-work timing.',
      technicalPoints: ['Sub-lord chain blocks timing readiness.'],
    },
    vedic: {
      availability: 'ready',
      confidence: 'moderate',
      stance: 'supports',
      summary: 'Vedic supports movement but not enough to overrule KP.',
      technicalPoints: ['Dasha support is partial.'],
    },
  },
});
const conflictedPrediction = buildEventOraclePredictionObject({
  evidenceContract: conflictedEvidence,
  refinement: foreign,
});
assertGate(
  ['blocked', 'mixed', 'delayed'].includes(conflictedPrediction.outcome),
  'conflicted evidence must not become clean likely answer',
);
assertGate(
  conflictedPrediction.confidence.level === 'low' || conflictedPrediction.outcome !== 'likely',
  'conflict must lower confidence or avoid likely outcome',
);
assertGate(
  conflictedPrediction.whatCanDelayIt.some(reason => /mixed signals|conflict/i.test(reason)),
  'delay factors must mention mixed/conflicting signals',
);

const missingEvidence = buildEventOracleEvidenceContract({
  refinement: foreign,
  layers: {},
});
const missingPrediction = buildEventOraclePredictionObject({
  evidenceContract: missingEvidence,
  refinement: foreign,
});
assert.equal(missingPrediction.outcome, 'needs_evidence');
assert.equal(missingPrediction.confidence.level, 'not_enough_evidence');
assert.equal(missingPrediction.timingWindow.precision, 'not_precise_yet');
assertGate(
  missingPrediction.directAnswer.startsWith('Needs clarity:'),
  'missing evidence answer must refuse fake prediction',
);
assertGate(
  missingPrediction.whatToDoNow.some(action =>
    /selected kundli|clear event|missing context/i.test(action),
  ),
  'missing evidence action must tell user what to do next',
);

const wellness = refineEventQuestion('What wellness caution should I be mindful of right now?');
const wellnessEvidence = buildEventOracleEvidenceContract({
  refinement: wellness,
  layers: {
    kundliKarma: createReadySupportLayer('mixed', 'Kundli Karma shows stress pressure, but not diagnosis.'),
    numerology: createReadySupportLayer('neutral', 'Numerology gives routine color only.'),
    vedic: createReadySupportLayer('supports', 'Vedic timing shows routine pressure.'),
  },
});
const wellnessPrediction = buildEventOraclePredictionObject({
  evidenceContract: wellnessEvidence,
  refinement: wellness,
});
assertGate(
  wellnessPrediction.whatToDoNow.some(action => action.includes('medical professional')),
  'wellness predictions must keep medical safety action',
);
assertGate(
  wellnessPrediction.directAnswer.includes('wellness') || wellnessPrediction.directAnswer.includes('caution'),
  'wellness answer must stay caution-framed',
);

const manifest = readJson(`${path.relative(root, auditDir)}/phase-4-manifest.json`);
assertGate(manifest.phase === phaseName, 'manifest phase mismatch');
assertGate(manifest.status === 'GREEN', 'manifest status must be GREEN');
for (const key of [
  'predictionObjectComplete',
  'honestTimingWindows',
  'exactDateGuard',
  'practicalTriggerLanguage',
  'evidenceBackedConfidence',
  'conflictLowersConfidence',
  'noGuaranteedOutcomes',
  'collapsedEvidenceSourceAware',
]) {
  assertGate(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'prediction-sample-output.json'),
  `${JSON.stringify(
    {
      supportivePrediction,
      unsupportedExactDate,
      supportedExactDate,
      conflictedPrediction,
      missingPrediction,
      wellnessPrediction,
    },
    null,
    2,
  )}\n`,
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: prediction object fields, honest timing, practical triggers, evidence-backed confidence, conflict downgrade, and no-guarantee rules are green.`,
);
