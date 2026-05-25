import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const phase = await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md');
const composer = await readWorkspaceFile('packages/pdf/src/index.ts');
const renderer = await readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
const chartLayout = await readWorkspaceFile('packages/astrology/src/chartLayout.ts');

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_5_FULL_WIDTH_CHART_SAFE_PDF_LAYOUT',
  'Render one Kundli chart per row',
  'Remove all PDF chart overflow counters',
  'Moon chart / Chandra Lagna chart',
  'house-wise planet placement table',
]) {
  assert.match(phase, new RegExp(escapeRegExp(phrase)), `phase doc includes ${phrase}`);
}

for (const phrase of [
  "chartRows = chunk(chartCards, 1)",
  "width: '100%'",
  'height: 450',
  'PdfHouseWisePlanetTablePage',
  'report.houseWisePlanetRows',
  'PdfMoonPhaseDisc',
  'nodePlanetChip',
  'formatPdfChartRole(snapshot)',
  'planet.displayName',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `renderer includes ${phrase}`);
}

for (const phrase of [
  "chartRole: ChartType | 'MOON' | 'CHALIT'",
  'houseWisePlanetRows: PdfHouseWisePlanetRow[]',
  "composeVedicIntelligenceContract({ kundli }).moonChart.chart",
  'VEDIC_FOCUS_CHART_ORDER',
  "buildParashariChalitChart(kundli)",
  "presentation: 'full'",
  'hiddenPlanetCount: 0',
  'buildPdfHouseWisePlanetRows',
  'formatPdfGrahaName',
  "Jupiter: { en: 'Jupiter', gu: 'Guru', hi: 'Brahaspati' }",
  "Moon: { en: 'Moon', gu: 'Chandra', hi: 'Chandra' }",
  "Sun: { en: 'Sun', gu: 'Surya', hi: 'Surya' }",
  "return ['D1', 'D9', 'D10'];",
]) {
  assert.match(composer, new RegExp(escapeRegExp(phrase)), `composer includes ${phrase}`);
}

for (const phrase of [
  'combust: string',
  'debilitation: string',
  'degree: string',
  'dignity: string',
  'exaltation: string',
  'graha: string',
  'house: string',
  'nakshatraPada: string',
  'retrograde: string',
  'sign: string',
]) {
  assert.match(composer, new RegExp(escapeRegExp(phrase)), `placement table row includes ${phrase}`);
}

assert.match(chartLayout, /full:\s*{[\s\S]*maxVisiblePlanets:\s*12/, 'full chart surfaces can expose every classical graha without PDF counters');
assert.doesNotMatch(renderer, /\+{cell\.hiddenPlanetCount}/, 'renderer does not print chart overflow counters');
assert.doesNotMatch(renderer, /hiddenPlanetCount}\s*<\/Text>/, 'renderer does not render hidden planet count text');

console.log('Report PDF Phase 5 gate passed: full-width chart pages, Moon chart ordering, all-graha labels, moon phase discs, node badges, and house-wise placement table are locked.');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
