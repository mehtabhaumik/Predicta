import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT';
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

function sliceFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start === -1) {
    return '';
  }

  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

const requiredFiles = [
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'package.json',
  'scripts/run-pdf-report-golden-output-gate.mjs',
  'packages/pdf/src/index.ts',
  'packages/pdf/src/competitorReportContract.ts',
  'packages/astrology/src/lifeAtlasReport.ts',
  'packages/pdf/src/reportArchitecture.ts',
  'packages/pdf/src/reportDocument.tsx',
  'packages/config/src/predictaMemory.ts',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/mobile/src/screens/ReportScreen.tsx',
  `${auditDir}/final-report-golden-matrix.json`,
  `${auditDir}/final-report-no-go-ledger.json`,
  `${auditDir}/final-report-golden-artifact-no-go-audit.md`,
  `${auditDir}/phase-12-golden-artifact-no-go-manifest.json`,
];

requiredFiles.forEach(file => assert(exists(file), `missing required file: ${file}`));

const finalLanes = ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'];
const finalModes = ['FREE', 'PREMIUM'];

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Build the final golden report matrix',
  'Each lane must be audited in both Free and Premium/Paid depth.',
  'Nadi is not restored as an active final report lane',
  'Signature report remains blocked without confirmed visible traits',
  'Life Atlas remains the only all-school synthesis lane',
  'Critical/Major/Medium/Minor issue ledger',
  'Phase 12 cannot be green if any Critical or Major issue remains.',
  'test:report-final-phase-12',
  'test:pdf-golden',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 12'));

const packageJson = readJson('package.json');
[
  'test:report-final-phase-4',
  'test:report-final-phase-5',
  'test:report-final-phase-6',
  'test:report-final-phase-7',
  'test:report-final-phase-8',
  'test:report-final-phase-9',
  'test:report-final-phase-10',
  'test:report-final-phase-11',
  'test:report-final-phase-12',
  'test:pdf-golden',
].forEach(script => assert(packageJson.scripts?.[script], `package.json missing ${script}`));

const matrix = readJson(`${auditDir}/final-report-golden-matrix.json`);
assert(matrix.phase === phaseName, 'golden matrix phase mismatch');
assert(matrix.matrix?.length === 12, 'golden matrix must contain 12 cases');
for (const lane of finalLanes) {
  for (const mode of finalModes) {
    const match = matrix.matrix?.find(item => item.lane === lane && item.mode === mode);
    assert(match, `golden matrix missing ${lane}/${mode}`);
    assert(match?.requiredValue?.length > 40, `${lane}/${mode} must describe required value`);
  }
}
assert(!matrix.matrix?.some(item => item.lane === 'NADI' || item.reportFocus === 'NADI'), 'golden matrix must not contain NADI');

const ledger = readJson(`${auditDir}/final-report-no-go-ledger.json`);
assert(ledger.phase === phaseName, 'no-go ledger phase mismatch');
assert(ledger.verdict === 'GREEN', 'no-go ledger verdict must be GREEN');
assert(ledger.issueLedger?.critical === 0, 'no-go ledger must have zero Critical issues');
assert(ledger.issueLedger?.major === 0, 'no-go ledger must have zero Major issues');
[
  'Report starts with schooling before prediction',
  'Technical evidence replaces useful guidance',
  'Report becomes generic, overtechnical, toolkit-like, or emotionally flat',
  'Preview promises more than generated artifact delivers',
  'Predicta memory cannot answer report-section questions',
  'School-specific reports mix methods',
  'Nadi is restored as an active final report lane',
  'Signature report can generate without confirmed visible traits',
  'Life Atlas becomes technical proof instead of a life mirror',
  'Free report becomes a hollow teaser',
  'Paid report adds page-count padding instead of depth',
  'App preview becomes a full report wall',
  'Predicta chat cannot explain generated report sections',
].forEach(item => assert(ledger.blockedBehaviorsAudited?.includes(item), `ledger missing blocked behavior ${item}`));

const manifest = readJson(`${auditDir}/phase-12-golden-artifact-no-go-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.goldenMatrixCases === 12, 'manifest must record 12 golden cases');
assert(manifest.nadiFinalReportLane === false, 'manifest must reject Nadi final report lane');
assert(manifest.issueLedger?.critical === 0, 'manifest must have zero Critical issues');
assert(manifest.issueLedger?.major === 0, 'manifest must have zero Major issues');
for (const lane of finalLanes) {
  assert(manifest.finalReportLanes?.includes(lane), `manifest missing final report lane ${lane}`);
}
assert(!manifest.finalReportLanes?.includes('NADI'), 'manifest must not include NADI final report lane');
[
  'corepack pnpm test:report-final-phase-12',
  'corepack pnpm test:pdf-golden',
  'corepack pnpm --filter @pridicta/pdf typecheck',
  'corepack pnpm --filter @pridicta/config typecheck',
  'corepack pnpm --filter @pridicta/web typecheck',
  'corepack pnpm --filter @pridicta/mobile exec tsc --noEmit',
  'git diff --check',
].forEach(command =>
  assert(manifest.finalVerificationCommands?.includes(command), `manifest missing verification command ${command}`),
);

const priorManifests = [
  ['PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD', 'phase-4-vedic-report-rebuild-manifest.json', 'VEDIC'],
  ['PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD', 'phase-5-kp-report-rebuild-manifest.json', 'KP'],
  ['PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD', 'phase-6-jaimini-report-rebuild-manifest.json', 'JAIMINI'],
  ['PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD', 'phase-7-numerology-report-rebuild-manifest.json', 'NUMEROLOGY'],
  ['PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD', 'phase-8-signature-report-rebuild-manifest.json', 'SIGNATURE'],
  ['PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD', 'phase-9-life-atlas-flagship-rebuild-manifest.json', 'LIFE_ATLAS'],
  ['PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT', 'phase-10-report-page-app-preview-alignment-manifest.json', undefined],
  ['PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY', 'phase-11-predicta-memory-chat-report-mastery-manifest.json', undefined],
];
for (const [phase, fileName, lane] of priorManifests) {
  const file = `docs/audits/${phase}/${fileName}`;
  assert(exists(file), `missing prior manifest ${file}`);
  if (!exists(file)) {
    continue;
  }
  const prior = readJson(file);
  assert(prior.phase === phase, `${phase} manifest phase mismatch`);
  assert(prior.status === 'GREEN', `${phase} manifest must be GREEN`);
  if (lane) {
    const priorLane = prior.reportLane ?? prior.reportLanes?.[0];
    assert(
      priorLane === lane || prior.reportLanes?.includes(lane),
      `${phase} manifest must prove ${lane} lane`,
    );
  }
}

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "reportFocus === 'KP'",
  "reportFocus === 'JAIMINI'",
  "reportFocus === 'NUMEROLOGY'",
  "reportFocus === 'SIGNATURE'",
  "reportFocus === 'LIFE_ATLAS'",
  'buildVedicReportValueContract',
  'buildKpReportValueContract',
  'buildJaiminiReportValueContract',
  'buildNumerologyReportValueContract',
  'buildSignatureReportValueContract',
  'buildLifeAtlasReportValueContract',
  'buildMahadashaPhalaReportSection',
  'buildRemedySection',
  'buildPdfChartSnapshots',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF final report source'));

const kpSections = sliceFunction(pdfIndex, 'buildKpReportSections');
assertNotIncludes(kpSections, 'Ask one exact KP question', 'KP final report sections');
assertNotIncludes(kpSections, 'needs one concrete event question', 'KP final report sections');
assertIncludes(kpSections, 'What KP is predicting', 'KP final report sections');
assertIncludes(kpSections, 'Final KP Guidance', 'KP final report sections');

const lifeAtlasSections = sliceFunction(pdfIndex, 'buildLifeAtlasReportSections');
assertIncludes(lifeAtlasSections, 'Your Life Atlas Begins Here', 'Life Atlas final report sections');
assertIncludes(lifeAtlasSections, 'closing letter', 'Life Atlas final report sections');
assertNotIncludes(lifeAtlasSections, 'technical proof', 'Life Atlas final report sections');
assertNotIncludes(lifeAtlasSections, 'method lesson', 'Life Atlas final report sections');

const lifeAtlasSource = read('packages/astrology/src/lifeAtlasReport.ts');
assertIncludes(lifeAtlasSource, 'Final Letter From Predicta', 'Life Atlas source final letter');

const signatureSections = sliceFunction(pdfIndex, 'buildSignatureReportSections');
assertIncludes(signatureSections, 'Signature Input Required', 'Signature final report sections');
assertIncludes(signatureSections, 'Only confirmed visible traits are used.', 'Signature final report sections');
assertNotIncludes(signatureSections, 'future prediction', 'Signature final report sections');
assertNotIncludes(signatureSections, 'forensic proof', 'Signature final report sections');

const architecture = read('packages/pdf/src/reportArchitecture.ts');
[
  'competitorResponseContract',
  'Free report as hollow teaser',
  'Paid report as page-count padding',
  'Schooling the user instead of answering the user',
  'Life Atlas is the only approved synthesis lane',
].forEach(fragment => assertIncludes(architecture, fragment, 'report architecture no-go source'));
assertNotIncludes(architecture, "case 'NADI'", 'report architecture final lane switch');

const competitorContract = read('packages/pdf/src/competitorReportContract.ts');
[
  'PREDICTA_COMPETITOR_REPORT_POSITION',
  'AskSoma',
  'YastroTalk',
  'Nebula',
  'prediction-first opening',
  'emotional usefulness',
  'evidence-backed confidence',
  'timing/current relevance',
  'direct practical guidance',
  'free value',
  'paid depth',
  'no fear/fluff/per-minute-pressure tone',
  'no psychic/advisor confusion',
  'no method mixing',
  'PREDICTA_COMPETITOR_REPORT_PREVIEW_REQUIREMENTS',
  'PREDICTA_COMPETITOR_REPORT_MEMORY_REQUIREMENTS',
  'PREDICTA_COMPETITOR_REPORT_ARTIFACT_REQUIREMENTS',
].forEach(fragment => assertIncludes(competitorContract, fragment, 'competitor report no-go contract'));

const competitorMemory = read('packages/config/src/predictaMemory.ts');
[
  'competitorResponseRule',
  'AskSoma, YastroTalk, and Nebula',
  'Generated report context carries the competitor-response report rule',
  'generatedReportContext',
].forEach(fragment => assertIncludes(competitorMemory, fragment, 'Predicta report memory competitor contract'));

const webReport = read('apps/web/components/WebDossierPreview.tsx');
[
  'data-report-final-phase10-preview="compact"',
  'signatureReportBlocked',
  'Signature report download is blocked until a confirmed signature sample is available.',
  'buildGeneratedReportMemoryContext',
].forEach(fragment => assertIncludes(webReport, fragment, 'web report final audit'));

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'testID="report-final-phase10-preview"',
  'Signature reports require a confirmed signature sample.',
  'Mobile report download will stay blocked until a real signature input is attached to this session.',
  'buildGeneratedReportMemoryContext',
].forEach(fragment => assertIncludes(mobileReport, fragment, 'mobile report final audit'));

const pdfGolden = read('scripts/run-pdf-report-golden-output-gate.mjs');
[
  'Prepared by Predicta @2026',
  'render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}',
  'buildPdfChartSnapshots',
  'hiddenPlanetCount: 0',
  'expectNoBannedUserFacingCopy',
].forEach(fragment => assertIncludes(pdfGolden, fragment, 'PDF golden output gate'));

const memory = read('packages/config/src/predictaMemory.ts');
[
  'PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY',
  'PREDICTA_FINAL_REPORT_LANE_MASTERY',
  'What does this report mean for me?',
  'Give me the prediction first',
  'Report chat must answer what it means for the user before giving technical evidence.',
].forEach(fragment => assertIncludes(memory, fragment, 'Predicta report memory mastery'));

const audit = read(`${auditDir}/final-report-golden-artifact-no-go-audit.md`);
[
  'Verdict',
  'GREEN',
  'Vedic/Kundli Free',
  'KP Premium',
  'Jaimini Premium',
  'Numerology Premium',
  'Signature Premium',
  'Life Atlas Premium',
  'Critical: 0',
  'Major: 0',
  'Nadi is intentionally not part of the final report golden matrix',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 12 audit'));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
