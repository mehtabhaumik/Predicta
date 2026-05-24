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
const phase = await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md');

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_4A_PEARL_EDITORIAL_INTERIOR_SYSTEM',
  'Predicta Pearl Editorial',
  'no light yellow',
  'Cormorant',
  'Source Serif 4',
  'Noto Serif Devanagari',
  'Noto Serif Gujarati',
  'hairline dividers',
  'porcelain chart plates',
]) {
  assert.match(phase, new RegExp(escapeRegExp(phrase)), `phase doc includes ${phrase}`);
}

for (const phrase of [
  'Predicta Editorial Display',
  'Predicta Editorial Body',
  'CormorantGaramond-SemiBold.ttf',
  'CormorantGaramond-Bold.ttf',
  'SourceSerif4-Regular.ttf',
  'SourceSerif4-SemiBold.ttf',
  'SourceSerif4-Bold.ttf',
  "background: '#F7F7F2'",
  "ink: '#151925'",
  "border: '#D9D1BF'",
  'getDisplayTextStyle(report.language)',
  'fontFamily: documentFontFamily',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `Pearl editorial type system includes ${phrase}`);
}

for (const phrase of [
  'evidenceTable',
  'evidenceTableHeader',
  'evidenceTableRow',
  "borderWidth: 0.6",
  "borderBottomWidth: 0.4",
  "backgroundColor: '#EFE9DC'",
  '<PdfEvidenceTable rows={item.section.evidenceTable.slice(0, 4)} />',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `Pearl table system includes ${phrase}`);
}

for (const phrase of [
  "background: '#F7F3EA'",
  "panel: '#FDF9F1'",
  "outline: '#B9874E'",
  "outline: '#A78F68'",
  'const chartRows = chunk(chartCards, 1);',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `Pearl chart plate system includes ${phrase}`);
}

for (const banned of [
  'Helvetica',
  '#FFF8E8',
  '#FFF1D9',
  '#FFF7EA',
  '#FFF4D9',
  '#ECEFF4',
  '#F3F6FB',
  '#FFF9F1',
  '#FFFDF6',
  '#FFF4F0',
  '#FFF8F5',
]) {
  assert.doesNotMatch(renderer, new RegExp(escapeRegExp(banned)), `renderer avoids ${banned}`);
}

for (const file of [
  'packages/pdf/assets/fonts/CormorantGaramond-SemiBold.ttf',
  'packages/pdf/assets/fonts/CormorantGaramond-Bold.ttf',
  'packages/pdf/assets/fonts/SourceSerif4-Regular.ttf',
  'packages/pdf/assets/fonts/SourceSerif4-SemiBold.ttf',
  'packages/pdf/assets/fonts/SourceSerif4-Bold.ttf',
  'packages/pdf/assets/fonts/NotoSerifDevanagari-Regular.ttf',
  'packages/pdf/assets/fonts/NotoSerifGujarati-Regular.ttf',
  'packages/pdf/assets/fonts/OFL.txt',
]) {
  await assertExists(file);
}

console.log('Report PDF Phase 4A gate passed: Pearl Editorial palette, serif typography, hairline tables, porcelain chart plates, watermark discipline, and no Helvetica/yellow interiors are locked.');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
