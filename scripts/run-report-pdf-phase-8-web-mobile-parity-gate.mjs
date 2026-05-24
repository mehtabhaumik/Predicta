import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const auditRoot = 'docs/audits/PREDICTA_REPORT_PDF_PHASE_8_WEB_MOBILE_PARITY';

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertExists(file, label) {
  await access(path.join(repoRoot, file));
  assert.ok(true, label);
}

const files = {
  env: await readWorkspaceFile('apps/mobile/src/config/env.ts'),
  mobilePackage: await readWorkspaceFile('apps/mobile/package.json'),
  mobilePdf: await readWorkspaceFile('apps/mobile/src/services/pdf/pdfGenerator.ts'),
  mobileReport: await readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx'),
  packageJson: await readWorkspaceFile('package.json'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  phaseContract: await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md'),
  webReportRoute: await readWorkspaceFile('apps/web/app/api/report/pdf/route.ts'),
  webReport: await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
};

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_8_WEB_MOBILE_PARITY',
  'Mobile and web must use the same report intelligence contract',
  'Mobile must not keep a lower-quality HTML-only report export',
  'Any surface-specific download/file-saving code must only handle transport',
  'no lower-quality mobile PDF path remains',
]) {
  assertIncludes(files.phaseContract, phrase, `Phase 8 contract locks ${phrase}`);
}

assertIncludes(
  files.packageJson,
  '"test:report-pdf-phase-8": "node scripts/run-report-pdf-phase-8-web-mobile-parity-gate.mjs"',
  'package exposes Phase 8 gate',
);

for (const forbidden of [
  'react-native-html-to-pdf',
  'generatePDF(',
  'buildHoroscopePdfHtml',
  '<!doctype html>',
  '<html>',
  'html:',
]) {
  assert.ok(!files.mobilePdf.includes(forbidden), `mobile PDF generator does not contain ${forbidden}`);
  assert.ok(!files.mobilePackage.includes(forbidden), `mobile package no longer depends on ${forbidden}`);
}

for (const phrase of [
  'env.reportPdfApiUrl',
  'fetch(env.reportPdfApiUrl',
  'buildMobileReportPdfPayload',
  'PdfGenerationRequest',
  'reportFocus',
  'sectionKeys',
  'signatureAnalysis',
  'RNFS.writeFile',
  'arrayBufferToBase64',
  'DocumentDirectoryPath',
]) {
  assertIncludes(files.mobilePdf, phrase, `mobile PDF transport uses document-grade API seam: ${phrase}`);
}

for (const phrase of [
  'reportPdfApiUrl',
  'PRIDICTA_REPORT_PDF_API_URL',
  'http://10.0.2.2:3000/api/report/pdf',
]) {
  assertIncludes(files.env, phrase, `mobile env exposes report PDF API URL: ${phrase}`);
}

for (const phrase of [
  '"react-native-fs"',
  'react-native-fs',
]) {
  assertIncludes(files.mobilePackage + files.mobilePdf, phrase, `mobile can save returned PDF bytes: ${phrase}`);
}

for (const phrase of [
  'renderToBuffer',
  'createPredictaReportPdfElement',
  'buildPredictaPdfResult',
  'PdfGenerationRequest',
]) {
  assertIncludes(files.webReportRoute, phrase, `web route remains document-grade renderer: ${phrase}`);
}

for (const phrase of [
  'composeReportSections({',
  'reportFocus: selectedReportId',
  'sectionKeys:',
]) {
  assertIncludes(files.webReport + files.mobileReport, phrase, `web/mobile share report composition selection: ${phrase}`);
}

for (const phrase of [
  'shouldIncludeMoonChart(reportFocus)',
  "return !['KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus)",
  "'D1'",
  "'MOON'",
  "'D9'",
]) {
  assertIncludes(files.pdf, phrase, `shared PDF intelligence exposes Moon chart and fixed chart order: ${phrase}`);
}

await assertExists(`${auditRoot}/verification.txt`, 'Phase 8 audit verification exists');

console.log('Report/PDF Phase 8 passed: mobile now uses the document-grade PDF API transport and no HTML-only mobile report source remains.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
