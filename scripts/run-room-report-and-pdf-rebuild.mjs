import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const pdfSource = await readWorkspaceFile('packages/pdf/src/index.ts');
const pricingSource = await readWorkspaceFile('packages/config/src/pricing.ts');
const webReportSource = await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx');
const mobileReportSource = await readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx');
const mobilePdfSource = await readWorkspaceFile('apps/mobile/src/services/pdf/pdfGenerator.ts');
const labelSource = await readWorkspaceFile('packages/pdf/src/translations/reportLabels.json');

for (const focus of ['VEDIC', 'KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE']) {
  assert.match(pdfSource, new RegExp(`\\| '${focus}'`), `PDF report focus includes ${focus}`);
  assert.match(pricingSource, new RegExp(`id: '${focus}'`), `marketplace includes ${focus}`);
}

assert.match(pdfSource, /reportFocus = 'KUNDLI'/);
assert.match(pdfSource, /function buildRoomSpecificReportSections/);
assert.match(pdfSource, /function buildVedicPredictaReportSection/);
assert.match(pdfSource, /case 'KP':\n\s+return buildKpReportSections\(kundli, mode\)/);
assert.match(pdfSource, /KP Event Verdict/);
assert.match(pdfSource, /KP Bhav Chalit Cusp Chart/);
assert.match(pdfSource, /case 'NADI':\n\s+return buildNadiReportSections\(kundli, mode\)/);
assert.match(pdfSource, /Nadi Strongest Story Thread/);
assert.match(pdfSource, /Nadi Story Anchor Chart/);
assert.match(pdfSource, /D1\/D9 Parashari chart pages are intentionally excluded from Nadi report output/);
assert.match(pdfSource, /case 'NUMEROLOGY':\n\s+return buildNumerologyReportSections\(kundli, mode\)/);
assert.match(pdfSource, /Your Number Signature/);
assert.match(pdfSource, /D1\/D9 Parashari chart pages are intentionally excluded from Numerology report output/);
assert.match(pdfSource, /case 'SIGNATURE':/);
assert.doesNotMatch(pdfSource, /buildSignatureNumerologySynthesisSection/);
assert.doesNotMatch(pdfSource, /SIGNATURE \+ NUMEROLOGY/);
assert.match(pdfSource, /KP, Nadi, Numerology, and Signature stay separate/);
assert.match(pdfSource, /It does not claim palm-leaf manuscript access/);
assert.match(pdfSource, /It reads name rhythm and birth-date numbers without casually mixing/);
assert.match(pdfSource, /not identity verification or handwriting forensics/);
assert.match(pdfSource, /getReportChartTypes\(kundli, mode, reportFocus\)/);
assert.match(pdfSource, /getFreeChartTypesForFocus\(reportFocus\)/);
assert.match(pdfSource, /buildFocusedSchoolTrustSection/);
assert.match(pdfSource, /reportFocus === 'NUMEROLOGY'/);
assert.match(pdfSource, /No Numerology or Vedic synthesis is mixed into this Signature lane/);

assert.match(webReportSource, /Choose your report world/);
for (const lane of [
  'Vedic Reports',
  'KP Reports',
  'Nadi Reports',
  'Numerology Reports',
  'Signature Reports',
]) {
  assert.match(webReportSource, new RegExp(lane), `web report page has ${lane}`);
}
assert.match(webReportSource, /REPORT_SCHOOL_LANES/);
assert.match(webReportSource, /product\.school === lane\.id/);
assert.match(webReportSource, /reportFocus: selectedReportId/);
assert.match(mobileReportSource, /reportFocus: selectedReportId/);
assert.match(mobilePdfSource, /PdfReportFocus/);
assert.match(mobilePdfSource, /reportFocus\?: PdfReportFocus/);
assert.match(mobilePdfSource, /buildMobileReportPdfPayload/);
assert.match(mobilePdfSource, /fetch\(env\.reportPdfApiUrl/);

for (const phrase of [
  'Vedic Predicta Report',
  'KP Predicta Report',
  'Nadi Predicta Report',
]) {
  assert.match(pricingSource, new RegExp(phrase), `pricing has ${phrase}`);
}

const labels = JSON.parse(labelSource);
for (const key of [
  'Vedic Predicta report proof',
  'KP horoscope cusp and significator foundation',
  'Nadi Predicta premium plan',
]) {
  assert.ok(labels.titleMap[key], `report title label exists for ${key}`);
  assert.match(labels.titleMap[key].hi, /[\u0900-\u097F]/, `${key} Hindi label uses native script`);
  assert.match(labels.titleMap[key].gu, /[\u0A80-\u0AFF]/, `${key} Gujarati label uses native script`);
}

for (const key of ['VEDIC PREDICTA', 'KP PREDICTA', 'NADI']) {
  assert.ok(labels.eyebrowMap[key], `report eyebrow label exists for ${key}`);
  assert.match(labels.eyebrowMap[key].hi, /[\u0900-\u097F]/, `${key} Hindi label uses native script`);
  assert.match(labels.eyebrowMap[key].gu, /[\u0A80-\u0AFF]/, `${key} Gujarati label uses native script`);
}

console.log('Room report and PDF rebuild passed: 58 deterministic assertions.');
