import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_3_FREE_VS_PAID_DEPTH_CONTRACT';
const auditDir = `docs/audits/${phaseName}`;
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  assert(!source.includes(needle), `${label} must not include ${needle}`);
}

[
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'packages/pdf/src/reportArchitecture.ts',
  'packages/pdf/src/reportDocument.tsx',
  `${auditDir}/free-vs-paid-depth-contract-audit.md`,
  `${auditDir}/phase-3-free-vs-paid-depth-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a shared free-vs-paid depth contract',
  'Free report depth must guarantee',
  'Paid report depth must guarantee',
  'Free must never become a hollow teaser.',
  'Paid must never become page-count padding.',
  'The active depth promise is consumed by the PDF renderer.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 3'));

const architecture = read('packages/pdf/src/reportArchitecture.ts');
[
  'ReportDepthModeContract',
  'ReportDepthContract',
  'depthContract: ReportDepthContract',
  'buildReportDepthContract',
  'buildFreeDepthContract',
  'buildPaidDepthContract',
  'getLaneDepthConfig',
  'Free report as hollow teaser',
  'Paid report as page-count padding',
  'Technical evidence without plain prediction',
  'More tables without stronger guidance',
  'Schooling the user instead of answering the user',
  'predictionMinimum',
  'evidenceMinimum',
  'timingMinimum',
  'actionMinimum',
  'proofMinimum',
].forEach(fragment => assertIncludes(architecture, fragment, 'free-vs-paid depth source'));

[
  'Vedic depth is measured by chart-backed prediction',
  'KP depth is measured by answer clarity',
  'Jaimini depth is measured by destiny role',
  'Numerology depth is measured by number identity',
  'Signature depth is measured by confirmed visible traits',
  'Life Atlas depth is measured by emotional specificity',
].forEach(fragment => assertIncludes(architecture, fragment, 'lane-specific depth promise'));

assertNotIncludes(architecture, "case 'NADI'", 'depth contract lane switch');

const reportDocument = read('packages/pdf/src/reportDocument.tsx');
[
  'const activeDepth = architecture.depthContract.active;',
  'body: activeDepth.promise',
].forEach(fragment => assertIncludes(reportDocument, fragment, 'PDF renderer depth usage'));

const audit = read(`${auditDir}/free-vs-paid-depth-contract-audit.md`);
[
  'Verdict: GREEN',
  'Free reports must be valuable, not hollow previews.',
  'Paid reports must add depth, not filler.',
  'Vedic',
  'KP',
  'Jaimini',
  'Numerology',
  'Signature',
  'Life Atlas',
  'This phase does not create or restore a Nadi final-report lane.',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 3 audit'));

const manifest = readJson(`${auditDir}/phase-3-free-vs-paid-depth-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.depthContractSource === 'packages/pdf/src/reportArchitecture.ts', 'manifest source mismatch');
assert(manifest.attachedToPdfArchitecture === true, 'manifest must record architecture attachment');
assert(manifest.rendererConsumesActiveDepth === true, 'manifest must record renderer usage');
assert(manifest.nadiFinalReportLane === false, 'manifest must explicitly reject Nadi final report lane');

const expectedLanes = ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'];
for (const lane of expectedLanes) {
  assert(manifest.reportLanes?.includes(lane), `manifest missing report lane ${lane}`);
}
assert(!manifest.reportLanes?.includes('NADI'), 'manifest must not include NADI lane');

const expectedMinimums = [
  'predictionMinimum',
  'evidenceMinimum',
  'timingMinimum',
  'actionMinimum',
  'proofMinimum',
];
for (const minimum of expectedMinimums) {
  assert(manifest.depthMinimums?.includes(minimum), `manifest missing depth minimum ${minimum}`);
}

[
  'phase3AuditExists',
  'phase3GatePasses',
  'reportDepthContractExists',
  'everyArchitectureCarriesDepthContract',
  'freeAndPaidMinimumsPresent',
  'allSixReportLanesCovered',
  'rendererConsumesActiveDepth',
  'noNadiFinalReportLane',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error('Report Final Phase 3 free-vs-paid depth gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Report Final Phase 3 free-vs-paid depth gate passed: every final report architecture carries lane-aware free and paid depth promises, renderer uses the active depth promise, and no Nadi final report lane is present.',
);
