import { strict as assert } from 'node:assert';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_6_REPORT_EDITORIAL_AND_PREDICTION_REBUILD';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

function readJson(source) {
  return JSON.parse(source);
}

function assertIncludes(source, phrase, label) {
  assert.match(source, new RegExp(escapeRegExp(phrase)), `${label} includes ${phrase}`);
}

function assertNotIncludes(source, phrase, label) {
  assert.doesNotMatch(source, new RegExp(escapeRegExp(phrase)), `${label} must not include ${phrase}`);
}

function assertOrder(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex >= 0, `${label} is missing ${first}`);
  assert(secondIndex >= 0, `${label} is missing ${second}`);
  assert(firstIndex < secondIndex, `${label} must place ${first} before ${second}`);
}

const [
  revivalRoadmap,
  reportRoadmap,
  packageJson,
  reportVoice,
  architecture,
  pdfComposer,
  pdfRenderer,
  webReportPreview,
  kpContract,
  jaiminiContract,
  vedicContract,
  numerologyContract,
  signatureContract,
  lifeAtlasContract,
  finalMatrixSource,
  noGoLedgerSource,
] = await Promise.all([
  readWorkspaceFile('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md'),
  readWorkspaceFile('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md'),
  readWorkspaceFile('package.json'),
  readWorkspaceFile('packages/pdf/src/reportVoiceContract.ts'),
  readWorkspaceFile('packages/pdf/src/reportArchitecture.ts'),
  readWorkspaceFile('packages/pdf/src/index.ts'),
  readWorkspaceFile('packages/pdf/src/reportDocument.tsx'),
  readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
  readWorkspaceFile('packages/pdf/src/kpReportValueContract.ts'),
  readWorkspaceFile('packages/pdf/src/jaiminiReportValueContract.ts'),
  readWorkspaceFile('packages/pdf/src/vedicReportValueContract.ts'),
  readWorkspaceFile('packages/pdf/src/numerologyReportValueContract.ts'),
  readWorkspaceFile('packages/pdf/src/signatureReportValueContract.ts'),
  readWorkspaceFile('packages/pdf/src/lifeAtlasReportValueContract.ts'),
  readWorkspaceFile('docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-golden-matrix.json'),
  readWorkspaceFile('docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json'),
]);

for (const phrase of [
  phaseName,
  'Make every report valuable, predictive, and satisfying.',
  'Rebuild all six report lanes:',
  'Free and paid artifacts are generated for every lane.',
  'Extracted text audit passes no-schooling and redundancy checks.',
]) {
  assertIncludes(revivalRoadmap, phrase, 'Revival V2 roadmap Phase 6');
}

assertIncludes(packageJson, '"test:revival-v2-phase-6"', 'package scripts');

for (const phrase of [
  'Reports must predict, guide, and satisfy.',
  'prediction must come before dense',
  'plain prediction -> timing/current relevance',
  'what to do next -> confidence/caution -> supporting evidence/appendix',
  'Final report gates must fail if primary report bodies become generic',
]) {
  assertIncludes(reportRoadmap, phrase, 'final report roadmap');
}
assertNotIncludes(reportRoadmap, 'technical evidence -> plain prediction', 'final report roadmap');

assertOrder(reportVoice, "'plain prediction'", "'supporting evidence / appendix'", 'report voice sequence');
for (const phrase of [
  'you will learn',
  'Predicta will answer',
  'supportive toolkit',
  'supportive rhythm guide',
  'hasSchoolingFirstRisk',
]) {
  assertIncludes(reportVoice, phrase, 'report voice contract');
}

assertOrder(architecture, "id: 'prediction-chapters'", "id: 'method-evidence'", 'report architecture stages');

for (const phrase of [
  'Predicta will answer',
  'buildKpReportSections',
  'buildJaiminiReportSections',
  'buildNumerologyReportSections',
  'buildSignatureReportSections',
  'buildLifeAtlasReportSections',
  'buildVedicPredictaReportSection',
]) {
  assertIncludes(pdfComposer, phrase, 'PDF composer');
}
for (const phrase of [
  'You will learn',
]) {
  assertNotIncludes(pdfComposer, phrase, 'PDF composer primary copy');
}

for (const phrase of [
  'Fun chart note',
  'Use the spreads in order',
  'Free is not a teaser',
  'Technical chart foundation',
  'technical workbook',
]) {
  assertNotIncludes(pdfRenderer, phrase, 'PDF renderer user-facing copy');
}
for (const phrase of [
  'Kundli prediction to carry',
  'Start with the answer',
  'Free gives real guidance',
  'Chart foundation behind the answer',
  'KP support evidence',
]) {
  assertIncludes(pdfRenderer, phrase, 'PDF renderer user-facing copy');
}

for (const phrase of [
  'Get a direct Kundli answer',
  'Get a direct KP answer',
  'See the soul role',
  'See what the name and birth numbers emphasize',
  'See what confirmed visible traits may reflect',
]) {
  assertIncludes(webReportPreview, phrase, 'web report preview');
}
for (const phrase of [
  'Learn what the Kundli',
  'Learn whether a specific event',
  'Learn the soul role',
  'Learn what the name',
  'Learn what confirmed visible traits',
]) {
  assertNotIncludes(webReportPreview, phrase, 'web report preview');
}

const laneContracts = [
  ['Vedic', vedicContract, 'openingPrediction'],
  ['KP', kpContract, 'openingPrediction'],
  ['Jaimini', jaiminiContract, 'openingPrediction'],
  ['Numerology', numerologyContract, 'openingPrediction'],
  ['Signature', signatureContract, 'openingReflection'],
  ['Life Atlas', lifeAtlasContract, 'flagshipOpening'],
];
for (const [lane, source, signal] of laneContracts) {
  assertIncludes(source, signal, `${lane} report value contract`);
  assertIncludes(source, 'freeDepthPromise', `${lane} report value contract`);
  assertIncludes(source, 'paidDepthPromise', `${lane} report value contract`);
  assertIncludes(source, 'bannedFailures', `${lane} report value contract`);
}
assertNotIncludes(numerologyContract, 'Supportive Toolkit', 'Numerology report contract');
assertIncludes(numerologyContract, 'Supportive Rhythm Guide', 'Numerology report contract');

const matrix = readJson(finalMatrixSource);
const ledger = readJson(noGoLedgerSource);
const lanes = ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'];
const modes = ['FREE', 'PREMIUM'];
assert.equal(matrix.matrix?.length, 12, 'golden matrix contains 12 lane/mode cases');
for (const lane of lanes) {
  for (const mode of modes) {
    assert(
      matrix.matrix?.some(item => item.lane === lane && item.mode === mode),
      `golden matrix contains ${lane}/${mode}`,
    );
  }
}
assert.equal(ledger.issueLedger?.critical, 0, 'no-go ledger has zero Critical issues');
assert.equal(ledger.issueLedger?.major, 0, 'no-go ledger has zero Major issues');
for (const phrase of [
  'Report starts with schooling before prediction',
  'Technical evidence replaces useful guidance',
  'Report becomes generic, overtechnical, toolkit-like, or emotionally flat',
  'Free report becomes a hollow teaser',
  'Paid report adds page-count padding instead of depth',
]) {
  assert(ledger.blockedBehaviorsAudited?.includes(phrase), `no-go ledger audits ${phrase}`);
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'redline-audit.md'),
  `${[
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN after source-contract audit, six-lane golden matrix verification, and no-go ledger review.',
    '',
    '## Locked Behavior',
    '',
    '- Report voice sequence is answer-first: prediction, timing, help/block, next action, confidence, then evidence/appendix.',
    '- The PDF renderer no longer uses schooling labels such as `Fun chart note`, `Use the spreads in order`, or `Free is not a teaser`.',
    '- Report previews sell direct answers rather than lessons.',
    '- Numerology uses `Supportive Rhythm Guide`, not `Supportive Toolkit`.',
    '- All six report lanes remain present in Free and Premium golden matrix cases.',
    '- The no-go ledger remains zero Critical and zero Major.',
  ].join('\n')}\n`,
);

writeFileSync(
  path.join(auditRoot, 'phase-6-report-editorial-prediction-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'GREEN',
      reportLanes: lanes,
      modes,
      sourceContract: 'answer-first',
      goldenMatrixCases: matrix.matrix?.length,
      noGoLedger: ledger.issueLedger,
      bannedCopyRemoved: [
        'Fun chart note',
        'Use the spreads in order',
        'Free is not a teaser',
        'Supportive Toolkit',
        'You will learn',
      ],
      finalVerificationCommands: [
        'corepack pnpm test:revival-v2-phase-6',
        'corepack pnpm test:report-final-phase-4',
        'corepack pnpm test:report-final-phase-5',
        'corepack pnpm test:report-final-phase-6',
        'corepack pnpm test:report-final-phase-1',
        'corepack pnpm test:report-final-phase-7',
        'corepack pnpm test:report-final-phase-8',
        'corepack pnpm test:report-final-phase-9',
        'corepack pnpm test:report-final-phase-12',
        'corepack pnpm test:pdf-golden',
        'corepack pnpm --filter @pridicta/pdf typecheck',
        'corepack pnpm --filter @pridicta/web typecheck',
        'corepack pnpm --filter @pridicta/mobile exec tsc --noEmit',
        'corepack pnpm build:web',
        'git diff --check',
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`${phaseName} passed: report editorial and prediction-first contracts are locked across all six lanes.`);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
