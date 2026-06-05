import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_2_SPECIALIST_WORLD_CLARITY_AND_NO_MIXING_GATE';
const phase1Name =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_1_BRAND_PROMISE_COPY_AND_NAVIGATION_ALIGNMENT';
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

function assertIncludes(source, fragment, label) {
  assert(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

[
  `docs/audits/${phase1Name}/phase-1-manifest.json`,
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
  'apps/web/components/DashboardShell.tsx',
  'apps/web/components/WebHeader.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/web/app/dashboard/nadi/page.tsx',
  'apps/web/app/dashboard/nadi/chat/page.tsx',
  'apps/mobile/src/screens/SavedKundlisScreen.tsx',
  'packages/astrology/src/chartLayout.ts',
  'packages/pdf/src/index.ts',
  'packages/pdf/src/reportDocument.tsx',
  'packages/types/src/astrology.ts',
  'apps/mobile/src/types/astrology.ts',
  'packages/config/src/predictaMemory.ts',
  `${auditDir}/specialist-world-boundary-audit.md`,
  `${auditDir}/phase-2-manifest.json`,
  `${auditDir}/verification.txt`,
].forEach(file => assert(exists(file), `missing required file ${file}`));

const phase1Manifest = readJson(`docs/audits/${phase1Name}/phase-1-manifest.json`);
assert(phase1Manifest.status === 'GREEN', 'Phase 1 manifest must be GREEN');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Vedic: classical Kundli, charts, dasha, gochar, Panchang, Kundli Karma,',
  'KP: event answer and timing through cusp/sub-lord/significator evidence.',
  'Jaimini: soul direction, karakas, Karakamsha, Arudha, Chara Dasha, destiny',
  'Life Atlas: approved synthesis lane only.',
  "No school uses another school's chart/report shell.",
].forEach(fragment => assertIncludes(roadmap, fragment, 'roadmap phase 2'));

const dashboardShell = read('apps/web/components/DashboardShell.tsx');
const webHeader = read('apps/web/components/WebHeader.tsx');
const reportPreview = read('apps/web/components/WebDossierPreview.tsx');
const pricing = read('packages/config/src/pricing.ts');
const mobileSaved = read('apps/mobile/src/screens/SavedKundlisScreen.tsx');
const chartLayout = read('packages/astrology/src/chartLayout.ts');
const pdfIndex = read('packages/pdf/src/index.ts');
const pdfDocument = read('packages/pdf/src/reportDocument.tsx');
const apiRoute = read('apps/web/app/api/report/pdf/route.ts');
const types = read('packages/types/src/astrology.ts');
const mobileTypes = read('apps/mobile/src/types/astrology.ts');
const memory = read('packages/config/src/predictaMemory.ts');

[
  dashboardShell,
  webHeader,
  reportPreview,
  pricing,
].forEach((source, index) => {
  const label = ['DashboardShell', 'WebHeader', 'WebDossierPreview', 'pricing'][index];
  assert(source.includes('JAIMINI') || source.includes('/dashboard/jaimini'), `${label}: missing Jaimini lane`);
  assertNotIncludes(source, 'Nadi Reports', label);
  assertNotIncludes(source, 'NADI_REPORT', label);
});

assertIncludes(
  read('apps/web/app/dashboard/nadi/page.tsx'),
  "redirect('/dashboard/jaimini')",
  'legacy web Nadi page redirect',
);
assertIncludes(
  read('apps/web/app/dashboard/nadi/chat/page.tsx'),
  "redirect('/dashboard/jaimini/chat')",
  'legacy web Nadi chat redirect',
);

assertIncludes(chartLayout, "export type ChartRenderSchool = 'JAIMINI' | 'KP' | 'PARASHARI';", 'chart layout');
assertIncludes(chartLayout, "return 'JAIMINI';", 'chart layout legacy detector');
assertIncludes(chartLayout, 'buildJaiminiPreviewChart', 'chart layout');
assertNotIncludes(chartLayout, "school === 'NADI'", 'chart layout');
assertNotIncludes(chartLayout, 'buildNadiPreviewChart', 'chart layout');
assertNotIncludes(chartLayout, "code: 'Nadi'", 'chart layout');

assertIncludes(mobileSaved, "(['PARASHARI', 'KP', 'JAIMINI'] as ChartRenderSchool[])", 'mobile saved Kundli previews');
assertNotIncludes(mobileSaved, "(['PARASHARI', 'KP', 'NADI'] as ChartRenderSchool[])", 'mobile saved Kundli previews');
assertNotIncludes(mobileSaved, "chartDialog.school === 'NADI'", 'mobile saved Kundli previews');

assertNotIncludes(types, "| 'NADI'\n  | 'NUMEROLOGY'\n  | 'SIGNATURE'\n  | 'SYNTHESIS'\n  | 'VEDIC'", 'shared ReportSchoolLaneId');
assertNotIncludes(mobileTypes, "| 'NADI'\n  | 'NUMEROLOGY'\n  | 'SIGNATURE'\n  | 'SYNTHESIS'\n  | 'VEDIC'", 'mobile ReportSchoolLaneId');
assertIncludes(memory, 'Nadi was replaced by Jaimini', 'Predicta memory migration guardrail');
assertIncludes(memory, "type FinalReportLaneMemoryKey = ReportSchoolLaneId | 'LIFE_ATLAS';", 'Predicta report memory lane type');
assertNotIncludes(memory, "Exclude<ReportSchoolLaneId, 'NADI'>", 'Predicta report memory lane type');
assertNotIncludes(memory, "schoolLane === 'NADI'", 'Predicta report memory lane type');

assertIncludes(apiRoute, 'normalizeLegacyReportFocus', 'report API route');
assertIncludes(apiRoute, "String(payload.reportFocus) === 'NADI'", 'report API legacy normalization');
assertIncludes(apiRoute, "? 'JAIMINI'", 'report API legacy normalization');
assertIncludes(apiRoute, "normalizedPayload.reportFocus === 'SIGNATURE'", 'report API signature enforcement');
assertIncludes(apiRoute, 'hasReadySignatureAnalysis(normalizedPayload.signatureAnalysis)', 'report API signature enforcement');

assertNotIncludes(pdfIndex, "| 'NADI'", 'PDF report focus and chart roles');
assertNotIncludes(pdfIndex, "case 'NADI'", 'PDF report switch branches');
assertNotIncludes(pdfIndex, "reportFocus === 'NADI'", 'PDF report focus branches');
assertNotIncludes(pdfIndex, 'buildNadiReportSections', 'PDF Nadi report builder');
assertNotIncludes(pdfIndex, 'composeNadiJyotishPlan', 'PDF Nadi report import');
assertNotIncludes(pdfIndex, "buildSchoolPreviewChart(kundli, 'NADI')", 'PDF Nadi chart shell');
assertIncludes(pdfIndex, "const kpChart = reportFocus === 'KP'", 'PDF KP chart shell');
assertIncludes(pdfIndex, "buildSchoolPreviewChart(kundli, 'KP')", 'PDF KP chart shell');
assertIncludes(pdfIndex, "reportFocus === 'JAIMINI'", 'PDF Jaimini focus branch');
assertIncludes(pdfIndex, "'SWAMSA'", 'PDF Jaimini charts');
assertIncludes(pdfIndex, "'KARAKAMSHA'", 'PDF Jaimini charts');

assertNotIncludes(pdfDocument, "reportFocus === 'NADI'", 'PDF renderer active Nadi branch');
assertNotIncludes(pdfDocument, "snapshot.chartRole === 'NADI'", 'PDF renderer active Nadi chart');
assertNotIncludes(pdfDocument, "eyebrow === 'NADI'", 'PDF renderer active Nadi section');
assertNotIncludes(pdfDocument, 'Nadi story prediction', 'PDF renderer Nadi copy');
assertIncludes(pdfDocument, "['JAIMINI', 'KP', 'NUMEROLOGY', 'SIGNATURE']", 'PDF renderer focused room list');

assertIncludes(reportPreview, "id: 'JAIMINI'", 'report marketplace Jaimini lane');
assertIncludes(reportPreview, "id: 'SYNTHESIS'", 'report marketplace synthesis lane');
assertIncludes(reportPreview, "productIds: ['LIFE_ATLAS']", 'report marketplace Life Atlas lane');
assertNotIncludes(reportPreview, "id: 'NADI'", 'report marketplace active Nadi lane');
assertNotIncludes(reportPreview, "productIds: ['NADI']", 'report marketplace active Nadi product');

const manifest = readJson(`${auditDir}/phase-2-manifest.json`);
assert(manifest.phase === phaseName, 'phase 2 manifest phase mismatch');
assert(manifest.status === 'GREEN', 'phase 2 manifest must be GREEN');
assert(manifest.greenCriteria?.activeNadiReportLaneRemoved === true, 'phase 2 manifest missing activeNadiReportLaneRemoved');
assert(manifest.greenCriteria?.legacyNadiRoutesRedirectToJaimini === true, 'phase 2 manifest missing legacy redirect criterion');
assert(manifest.greenCriteria?.signatureRequiresConfirmedTraits === true, 'phase 2 manifest missing signature enforcement criterion');
assert(manifest.greenCriteria?.kpUsesKpChartShell === true, 'phase 2 manifest missing KP chart criterion');
assert(manifest.greenCriteria?.lifeAtlasOnlySynthesisLane === true, 'phase 2 manifest missing Life Atlas synthesis criterion');

if (failures.length) {
  console.error(`\n${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);
