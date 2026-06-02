import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_2_SHARED_REPORT_ARCHITECTURE_ENGINE';
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
  'packages/pdf/src/index.ts',
  'packages/pdf/src/reportDocument.tsx',
  `${auditDir}/shared-report-architecture-audit.md`,
  `${auditDir}/phase-2-shared-report-architecture-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a shared report architecture engine',
  'personal opening',
  'method-specific evidence',
  'prediction chapters',
  'timing/current relevance',
  'action plan',
  'appendix/proof',
  'Do not create a Nadi final-report lane.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 2'));

const architecture = read('packages/pdf/src/reportArchitecture.ts');
[
  'PdfReportArchitecture',
  'ReportArchitectureStageId',
  "'personal-opening'",
  "'method-evidence'",
  "'prediction-chapters'",
  "'timing-relevance'",
  "'action-plan'",
  "'appendix-proof'",
  'buildReportArchitecture',
  'toFinalReportArchitectureFocus',
  "return 'JAIMINI';",
  'Vedic reports read Kundli evidence',
  'KP answers event readiness',
  'Jaimini reads destiny role',
  'Numerology reads number identity',
  'Signature reads confirmed visible expression traits',
  'Life Atlas is the flagship synthesis',
  'Life Atlas is the only approved synthesis lane',
].forEach(fragment => assertIncludes(architecture, fragment, 'shared report architecture source'));
assertNotIncludes(architecture, "case 'NADI'", 'shared report architecture switch');

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './reportArchitecture'",
  'type PdfReportArchitecture',
  'architecture: PdfReportArchitecture;',
  'toFinalReportArchitectureFocus(reportFocus)',
  "architecture: buildReportArchitecture({ mode, reportFocus: 'KUNDLI' })",
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF composition architecture'));

const reportDocument = read('packages/pdf/src/reportDocument.tsx');
[
  'const architecture = report.architecture;',
  'buildOnboardingCards(report.mode, scope, reportFocus, architecture)',
  "architecture.stages.find(stage => stage.id === 'prediction-chapters')",
  'architecture.reportPromise',
].forEach(fragment => assertIncludes(reportDocument, fragment, 'PDF renderer architecture usage'));

const audit = read(`${auditDir}/shared-report-architecture-audit.md`);
[
  'Verdict: GREEN',
  'Shared Spine',
  'Personal opening',
  'Method-specific evidence',
  'Prediction chapters',
  'Timing or current relevance',
  'Action plan',
  'Appendix and proof',
  'This phase does not create or restore a Nadi final-report lane.',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 2 audit'));

const manifest = readJson(`${auditDir}/phase-2-shared-report-architecture-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.sharedArchitectureSource === 'packages/pdf/src/reportArchitecture.ts', 'manifest source mismatch');
assert(manifest.attachedToPdfComposition === true, 'manifest must record PdfComposition attachment');
assert(manifest.fallbackReportCovered === true, 'manifest must record fallback report coverage');
assert(manifest.nadiFinalReportLane === false, 'manifest must explicitly reject Nadi final report lane');

const expectedStages = [
  'personal-opening',
  'method-evidence',
  'prediction-chapters',
  'timing-relevance',
  'action-plan',
  'appendix-proof',
];
for (const stage of expectedStages) {
  assert(manifest.requiredStages?.includes(stage), `manifest missing stage ${stage}`);
}

const expectedLanes = ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'];
for (const lane of expectedLanes) {
  assert(manifest.reportLanes?.includes(lane), `manifest missing report lane ${lane}`);
}
assert(!manifest.reportLanes?.includes('NADI'), 'manifest must not include NADI lane');

[
  'phase2AuditExists',
  'phase2GatePasses',
  'sharedArchitectureSourceExists',
  'allRequiredStagesPresent',
  'allSixReportLanesCovered',
  'noNadiFinalReportLane',
  'pdfCompositionCarriesArchitecture',
  'emptyReportCarriesArchitecture',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error('Report Final Phase 2 shared architecture gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Report Final Phase 2 shared architecture gate passed: every report composition carries the shared six-stage architecture, all six final report lanes are represented, school boundaries are explicit, and Nadi is not a final report lane.',
);
