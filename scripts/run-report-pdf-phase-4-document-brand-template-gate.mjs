import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertExists(file) {
  await access(path.join(repoRoot, file));
}

const renderer = await readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
const composer = await readWorkspaceFile('packages/pdf/src/index.ts');
const route = await readWorkspaceFile('apps/web/app/api/report/pdf/route.ts');
const phase = await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md');

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_4_DOCUMENT_BRAND_AND_TEMPLATE_SYSTEM',
  'dark Predicta theme',
  'faint Predicta logo watermark',
  'Prepared by Predicta @2026',
  '{page number} / {total pages}',
]) {
  assert.match(phase, new RegExp(escapeRegExp(phrase)), `phase doc includes ${phrase}`);
}

for (const phrase of [
  'PDF_PAGE_TEMPLATES',
  "cover: {",
  "interior: {",
  "background: '#07101F'",
  "background: '#F7F7F2'",
  'PdfCoverAtmosphere',
  'coverAuroraMagenta',
  'coverAuroraBlue',
  'coverAuroraGreen',
  'const chartRows = chunk(chartCards, 1);',
  "width: '100%'",
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `renderer includes ${phrase}`);
}

for (const phrase of [
  'PDF_PREPARED_BY_TEXT',
  'Prepared by Predicta @2026',
  'function PdfFooter({ subjectName }',
  'styles.footerLeft',
  'styles.footerCenter',
  'styles.footerRight',
  'render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}',
  'getReportSubjectName(report)',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `structured footer includes ${phrase}`);
}

for (const phrase of [
  'function PdfWatermark',
  '<PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />',
  'styles.watermarkLogo',
  'styles.watermarkText',
  'opacity: PDF_PAGE_TEMPLATES.watermark.opacity',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `watermark system includes ${phrase}`);
}

for (const phrase of [
  'Predicta Devanagari',
  'Predicta Gujarati',
  'NotoSerifDevanagari-Regular.ttf',
  'NotoSerifGujarati-Regular.ttf',
  "language === 'hi'",
  "language === 'gu'",
  'प्रेडिक्टा सारांश',
  'પ્રેડિક્ટા સારાંશ',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `Indic font system includes ${phrase}`);
}

assert.doesNotMatch(renderer, /<PdfFooter footer=/, 'renderer does not use the old string footer prop');
assert.doesNotMatch(renderer, /\+{cell\.hiddenPlanetCount}/, 'PDF charts do not render overflow counters');
assert.doesNotMatch(renderer, /backgroundColor: '#FFF8E8'/, 'renderer does not use the rejected yellow report background');
assert.doesNotMatch(composer, /A Predicta promise by Bhaumik Mehta/, 'composer does not ship the old footer copy');
assert.match(composer, /footer: 'Prepared by Predicta @2026'/, 'composer metadata uses corrected footer copy');
assert.match(composer, /presentation: 'full'/, 'composer builds full-density chart snapshots for PDF');
assert.match(route, /logoSrc: await loadPredictaLogoDataUri\(\)/, 'web PDF route still injects the Predicta logo');

for (const file of [
  'packages/pdf/assets/fonts/NotoSerifDevanagari-Regular.ttf',
  'packages/pdf/assets/fonts/NotoSerifGujarati-Regular.ttf',
]) {
  await assertExists(file);
}

console.log('Report PDF Phase 4 gate passed: dark cover template, light editorial interior, logo watermark, exact structured footer, real page totals, and Indic font registration are locked.');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
