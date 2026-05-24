import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditRoot = path.join(
  root,
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT',
);

function readWorkspaceFile(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function requireFile(relativePath, minimumBytes = 1) {
  const fullPath = path.join(root, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  const size = statSync(fullPath).size;
  assert.ok(size >= minimumBytes, `${relativePath} has at least ${minimumBytes} bytes`);
  return fullPath;
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function assertMatches(source, pattern, label) {
  assert.match(source, pattern, label);
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md');
assertIncludes(
  phaseDoc,
  'PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT',
  'Phase 9 remains documented as the final report/PDF release audit',
);
assertIncludes(
  phaseDoc,
  'The rebuild is green only when Phase 9 is green.',
  'Final green rule stays explicit',
);

const manifestPath = requireFile(
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/artifact-manifest.json',
  500,
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const requiredGoldenIds = [
  'free-kundli-en',
  'premium-kundli-en',
  'kp-report-en',
  'nadi-report-en',
  'numerology-report-en',
  'signature-report-en',
  'free-kundli-gu',
  'free-kundli-hi',
  'crowded-chart-kundli-en',
];

assert.deepEqual(
  manifest.map(item => item.id).sort(),
  [...requiredGoldenIds].sort(),
  'all Phase 9 required golden PDFs are represented in the artifact manifest',
);

let renderedPageCount = 0;
for (const item of manifest) {
  assert.ok(item.bytes > 1_000_000, `${item.id} PDF is a real rendered artifact`);
  assert.ok(item.pages >= 8, `${item.id} has enough pages to inspect beyond the cover`);
  assert.equal(
    item.renderedPages.length,
    item.pages,
    `${item.id} has one rendered image per PDF page`,
  );
  renderedPageCount += item.renderedPages.length;

  const pdfPath = requireFile(
    `docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/${item.pdf}`,
    1_000_000,
  );
  const header = readFileSync(pdfPath, { encoding: 'utf8', flag: 'r' }).slice(0, 4);
  assert.equal(header, '%PDF', `${item.id} opens as a PDF file`);

  for (const renderedPage of item.renderedPages) {
    requireFile(
      `docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/${renderedPage}`,
      1_000,
    );
  }
}
assert.ok(renderedPageCount >= 200, 'all pages from the golden PDF matrix were rendered');

for (const screenshot of [
  'desktop-dashboard-report.png',
  'tablet-dashboard-report.png',
  'mobile-dashboard-report.png',
]) {
  requireFile(
    `docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/screenshots/${screenshot}`,
    10_000,
  );
}

const pdfComposition = readWorkspaceFile('packages/pdf/src/index.ts');
const pdfRenderer = readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
const webReport = readWorkspaceFile('apps/web/components/WebDossierPreview.tsx');
const mobileReport = readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx');
const mobilePdf = readWorkspaceFile('apps/mobile/src/services/pdf/pdfGenerator.ts');

for (const fragment of [
  '<PdfCelestialSeal />',
  'PdfWatermark',
  'Prepared by Predicta @2026',
  'render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}',
  'report.cover.subjectName',
  'report.cover.dateOfBirth',
  'report.cover.birthTime',
  'report.cover.birthPlace',
  'report.cover.reportType',
  'report.cover.birthMomentSignature.map',
  'Predicta Devanagari',
  'Predicta Gujarati',
]) {
  assertIncludes(pdfRenderer, fragment, `PDF renderer includes ${fragment}`);
}

assert.doesNotMatch(
  pdfRenderer,
  /\+\s*\{?\s*cell\.hiddenPlanetCount/,
  'PDF renderer does not hide planets behind overflow counters',
);

for (const fragment of [
  "entries.push({ chart: moonChart, role: 'MOON' })",
  "displayChartName: role === 'MOON' ? 'Moon Chart / Chandra Lagna Chart' : model.displayChartName",
  'hiddenPlanetCount: 0',
  'buildPdfHouseWisePlanetRows',
  'buildMahadashaPhalaReportSection',
  'Past Mahadashas are summarized at Mahadasha level only',
  'currentEntireMahadasha',
  'currentMahadashaAntardasha',
  'currentMahadashaAntardashaPratyantardasha',
  'Premium keeps the current Pratyantardasha to one careful paragraph',
  'buildFriendshipTableSections',
  'buildBeneficMaleficReportSection',
  'buildChalitTableReportSections',
  'buildClassicalVedicReportSection(intelligence.panchang',
  'buildClassicalVedicReportSection(intelligence.samsa',
  'buildClassicalVedicReportSection(intelligence.karakamsha',
  'buildClassicalVedicReportSection(intelligence.ashtakavarga',
  'KP, Nadi, Numerology, and Signature stay separate',
  'It does not claim palm-leaf manuscript access',
  'It reads name rhythm and birth-date numbers without casually mixing',
  'not identity verification or handwriting forensics',
]) {
  assertIncludes(pdfComposition, fragment, `PDF composition includes ${fragment}`);
}

const moonIndex = pdfComposition.indexOf("entries.push({ chart: moonChart, role: 'MOON' })");
const d9Index = pdfComposition.indexOf("return prioritizeChartTypes(chartTypes, reportFocus)");
assert.ok(moonIndex > 0 && d9Index > moonIndex, 'Moon/Chandra Lagna is inserted before later varga prioritization');

for (const fragment of [
  'Choose your report world',
  'Download your report',
  'Cancel',
  'REPORT_SCHOOL_LANES',
  'product.school === lane.id',
  'downloadReportPdf()',
  '/api/report/pdf',
  'reportFocus: selectedReportId',
]) {
  assertIncludes(webReport, fragment, `web report flow includes ${fragment}`);
}
assert.doesNotMatch(webReport, />\s*Save Report\s*</, 'target report flow does not render Save Report CTA');

for (const fragment of [
  'reportFocus: selectedReportId',
  'Download your report',
]) {
  assertIncludes(mobileReport, fragment, `mobile report flow includes ${fragment}`);
}

for (const fragment of [
  'reportPdfApiUrl',
  'buildMobileReportPdfPayload',
  'fetch(env.reportPdfApiUrl',
]) {
  assertIncludes(mobilePdf, fragment, `mobile PDF path includes ${fragment}`);
}

assertMatches(
  pdfRenderer,
  /backgroundColor: PDF_PAGE_TEMPLATES\.cover\.background/,
  'cover uses the dark Predicta template',
);
assertMatches(
  pdfRenderer,
  /backgroundColor: PDF_PAGE_TEMPLATES\.interior\.background/,
  'interior pages use the Pearl Editorial template',
);

requireFile(
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/verification.txt',
  500,
);

console.log(
  `Report/PDF Phase 9 passed: ${requiredGoldenIds.length} golden PDFs and ${renderedPageCount} rendered page images audited.`,
);
