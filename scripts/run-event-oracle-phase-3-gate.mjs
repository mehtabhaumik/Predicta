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
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_3_MULTI_SCHOOL_EVIDENCE_CONTRACT_AND_CONFLICT_SCHEMA';
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
  'packages/astrology/src/eventOracleEvidenceContract.ts',
  `${path.relative(root, auditDir)}/phase-3-evidence-contract-audit.md`,
  `${path.relative(root, auditDir)}/phase-3-manifest.json`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Agreement score',
  'Conflict score',
  'Missing-evidence flags',
  'Evidence source labels',
  'Method boundaries',
  '`not enough evidence` state',
  'Missing evidence is never filled by AI invention',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 3 roadmap'));

const source = read('packages/astrology/src/eventOracleEvidenceContract.ts');
[
  'export type EventOracleEvidenceLayerId',
  'export type EventOracleEvidenceContract',
  'aiMayFillMissingEvidence: false',
  'sourceAware: true',
  'agreementScore',
  'conflictScore',
  'missingEvidenceFlags',
  'METHOD_BOUNDARIES',
  'EVIDENCE_SOURCE_LABELS',
  'buildEventOracleEvidenceContract',
  'not_enough_evidence',
].forEach(fragment => assertIncludes(source, fragment, 'event evidence contract'));

const indexSource = read('packages/astrology/src/index.ts');
assertIncludes(indexSource, "export * from './eventOracleEvidenceContract';", 'astrology export');

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  '"test:event-oracle-phase-3": "node scripts/run-event-oracle-phase-3-gate.mjs"',
  'package script',
);

const {
  buildEventOracleEvidenceContract,
  createReadySupportLayer,
} = require('../packages/astrology/src/eventOracleEvidenceContract.ts');
const { refineEventQuestion } = require('../packages/astrology/src/eventOracleQuestions.ts');

const foreign = refineEventQuestion('Will I get a UK work opportunity this year?');
const supportive = buildEventOracleEvidenceContract({
  refinement: foreign,
  layers: {
    jaimini: createReadySupportLayer('supports', 'Jaimini karaka direction supports work-linked foreign movement.'),
    kp: {
      availability: 'ready',
      confidence: 'moderate',
      stance: 'supports',
      summary: 'KP promise is visible through event houses and timing carriers.',
      technicalPoints: ['Relevant houses and significators support foreign work movement.'],
    },
    numerology: {
      availability: 'partial',
      confidence: 'weak',
      stance: 'neutral',
      summary: 'Numerology gives timing color only, not primary proof.',
      technicalPoints: ['Personal year rhythm is secondary.'],
    },
    vedic: createReadySupportLayer('supports', 'Vedic dasha and transit evidence support a foreign-work opening.'),
  },
});

assert.equal(supportive.contractVersion, 'event-oracle-evidence-phase-3-v1');
assert.equal(supportive.deterministic, true);
assert.equal(supportive.sourceAware, true);
assert.equal(supportive.aiMayFillMissingEvidence, false);
assert.equal(supportive.notEnoughEvidence, false);
assertGate(supportive.agreementScore > supportive.conflictScore, 'supportive case must agree more than conflict');
assertGate(supportive.requiredLayerIds.includes('vedic'), 'foreign evidence requires Vedic layer');
assertGate(supportive.requiredLayerIds.includes('kp'), 'foreign evidence requires KP layer');
assertGate(supportive.requiredLayerIds.includes('jaimini'), 'foreign evidence requires Jaimini layer');
assertGate(Boolean(supportive.evidenceSourceLabels.vedic), 'Vedic source label must exist');
assertGate(Boolean(supportive.methodBoundaries.kp), 'KP method boundary must exist');
assertGate(
  supportive.layers.every(layer => layer.sourceAware === true && Boolean(layer.label) && Boolean(layer.boundary)),
  'every evidence layer must remain source-aware with label and boundary',
);

const conflicted = buildEventOracleEvidenceContract({
  refinement: foreign,
  layers: {
    jaimini: {
      availability: 'partial',
      confidence: 'moderate',
      stance: 'mixed',
      summary: 'Jaimini shows destiny movement, but not a clean foreign-work promise.',
      technicalPoints: ['Karakas are mixed.'],
    },
    kp: {
      availability: 'ready',
      confidence: 'strong',
      stance: 'blocks',
      summary: 'KP event proof blocks the near-term foreign-work promise.',
      technicalPoints: ['Sub-lord chain blocks travel/work activation.'],
    },
    vedic: {
      availability: 'ready',
      confidence: 'moderate',
      stance: 'supports',
      summary: 'Vedic dasha support exists but is not enough to overrule KP conflict.',
      technicalPoints: ['Dasha support is partial.'],
    },
  },
});

assertGate(conflicted.conflictScore > 0, 'conflicted case must carry conflict score');
assertGate(
  conflicted.status === 'conflicted' || conflicted.confidence.level === 'low',
  'conflicting evidence must lower confidence or mark conflict',
);
assertGate(
  conflicted.confidence.downgradedBy.some(reason => reason.includes('conflicts')),
  'conflict must be explained in confidence downgrade reasons',
);

const missing = buildEventOracleEvidenceContract({
  refinement: foreign,
  layers: {},
});

assert.equal(missing.status, 'not_enough_evidence');
assert.equal(missing.confidence.level, 'not_enough_evidence');
assert.equal(missing.notEnoughEvidence, true);
assert.equal(missing.aiMayFillMissingEvidence, false);
assertGate(
  missing.missingEvidenceFlags.some(flag => flag.layerId === 'vedic' && flag.optional === false),
  'missing case must flag required Vedic evidence',
);
assertGate(
  missing.missingEvidenceFlags.some(flag => flag.layerId === 'lifeAtlas' && flag.optional === true),
  'Life Atlas missing context must be optional, not invented',
);

const relationship = refineEventQuestion('Where is this relationship likely to go?');
const relationshipWithoutSignature = buildEventOracleEvidenceContract({
  refinement: relationship,
  layers: {
    jaimini: createReadySupportLayer('supports', 'Jaimini supports relationship direction through destiny indicators.'),
    kp: createReadySupportLayer('supports', 'KP supports commitment possibility in the event proof.'),
    kundliKarma: createReadySupportLayer('mixed', 'Kundli Karma shows some friction but not a total block.'),
    numerology: createReadySupportLayer('neutral', 'Numerology is timing color only.'),
    vedic: createReadySupportLayer('supports', 'Vedic chart and timing support a clearer relationship direction.'),
  },
});

assert.equal(relationshipWithoutSignature.notEnoughEvidence, false);
assertGate(
  relationshipWithoutSignature.missingEvidenceFlags.some(flag => flag.layerId === 'signature' && flag.optional === true),
  'signature must be optional when absent',
);
assert.equal(relationshipWithoutSignature.aiMayFillMissingEvidence, false);

const manifest = readJson(`${path.relative(root, auditDir)}/phase-3-manifest.json`);
assertGate(manifest.phase === phaseName, 'manifest phase mismatch');
assertGate(manifest.status === 'GREEN', 'manifest status must be GREEN');
for (const key of [
  'deterministicTypedContract',
  'sourceAwareSchoolProof',
  'agreementConflictScores',
  'missingEvidenceFlags',
  'methodBoundaries',
  'notEnoughEvidenceState',
  'noAiEvidenceInvention',
  'signatureOptionalOnly',
]) {
  assertGate(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'evidence-sample-output.json'),
  `${JSON.stringify({ supportive, conflicted, missing, relationshipWithoutSignature }, null, 2)}\n`,
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: deterministic multi-school evidence contract, conflict scoring, missing flags, source labels, method boundaries, and no-AI-invention guard are green.`,
);
