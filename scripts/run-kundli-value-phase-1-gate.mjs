import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditRoot = path.join(
  root,
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK',
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

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
assertIncludes(
  phaseDoc,
  'PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK',
  'Phase 1 remains documented',
);

const focusOrder = readWorkspaceFile('packages/astrology/src/vedicFocusChartOrder.ts');
for (const fragment of [
  "export type VedicFocusChartRole = 'D1' | 'MOON' | 'D9' | 'D10' | 'CHALIT'",
  'VEDIC_FOCUS_CHART_ORDER',
  "'D1'",
  "'MOON'",
  "'D9'",
  "'D10'",
  "'CHALIT'",
  'getVedicFocusChartLabel',
]) {
  assertIncludes(focusOrder, fragment, `focus order contract includes ${fragment}`);
}
assert.ok(
  focusOrder.indexOf("'D1'") <
    focusOrder.indexOf("'MOON'") &&
    focusOrder.indexOf("'MOON'") <
      focusOrder.indexOf("'D9'") &&
    focusOrder.indexOf("'D9'") <
      focusOrder.indexOf("'D10'") &&
    focusOrder.indexOf("'D10'") <
      focusOrder.indexOf("'CHALIT'"),
  'focus order sequence is D1, Moon, D9, D10, Chalit',
);

const pdfComposer = readWorkspaceFile('packages/pdf/src/index.ts');
for (const fragment of [
  "chartRole: ChartType | 'MOON' | 'CHALIT'",
  'VEDIC_FOCUS_CHART_ORDER',
  'buildParashariChalitChart(kundli)',
  'filterReportChartForMainPlate(chart)',
  'isClassicalGraha(planet.name)',
  'getReportChartDisplayName(role, model.displayChartName, language)',
  'hiddenPlanetCount: 0',
]) {
  assertIncludes(pdfComposer, fragment, `PDF composer includes ${fragment}`);
}

const bannedSpecialPoints = [
  'Dhuma',
  'Gulika',
  'Mandi',
  'Upaketu',
  'Vyatipata',
  'Indrachapa',
  'Uranus',
  'Neptune',
  'Pluto',
];
for (const point of bannedSpecialPoints) {
  assertIncludes(
    pdfComposer,
    point,
    `PDF composer still recognizes ${point} for non-main technical filtering`,
  );
}

const pdfRenderer = readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
assertIncludes(pdfRenderer, 'formatPdfChartRole(snapshot)', 'PDF renderer formats Moon and Chalit labels');
assertNotIncludes(
  pdfRenderer,
  'chart-overflow-counter',
  'PDF renderer never renders an overflow counter',
);
assertNotIncludes(
  pdfRenderer,
  '+{cell.hiddenPlanetCount}',
  'PDF renderer never hides chart labels behind +n',
);

const webPreview = readWorkspaceFile('apps/web/components/WebDossierPreview.tsx');
const webPreviewChartFunction = webPreview.slice(
  webPreview.indexOf('function ReportChartSnapshot'),
  webPreview.indexOf('function getReportSectionKey'),
);
assertIncludes(
  webPreviewChartFunction,
  'formatReportPreviewChartRole(snapshot)',
  'web report preview formats Moon and Chalit labels',
);
assertNotIncludes(
  webPreviewChartFunction,
  'chart-overflow-counter',
  'web report preview chart snapshot does not render +n counters',
);

const webCharts = readWorkspaceFile('apps/web/components/WebChartsExplorer.tsx');
for (const fragment of [
  'VEDIC_FOCUS_CHART_ORDER',
  'getVedicFocusChartLabel',
  'getVedicFocusChartShortLabel',
  'full Varga library remains available below',
]) {
  assertIncludes(webCharts, fragment, `web Charts screen includes ${fragment}`);
}

const mobileCharts = readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx');
for (const fragment of [
  'VEDIC_FOCUS_CHART_ORDER',
  'getVedicFocusChartLabel',
  'getVedicFocusChartShortLabel',
  'full Varga library remains available below',
]) {
  assertIncludes(mobileCharts, fragment, `mobile Charts screen includes ${fragment}`);
}

const css = readWorkspaceFile('apps/web/app/globals.css');
for (const fragment of [
  '.vedic-focus-order-card',
  '.vedic-focus-order-rail',
  'grid-template-columns: repeat(5, minmax(0, 1fr))',
]) {
  assertIncludes(css, fragment, `web CSS includes ${fragment}`);
}

const manifestPath = requireFile(
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK/artifact-manifest.json',
  500,
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const manifestFiles = new Set(manifest.map(item => item.file));
for (const required of [
  'artifacts/phase1-free-kundli.pdf',
  'artifacts/phase1-premium-kundli.pdf',
  'artifacts/phase1-free-kundli-payload.json',
  'artifacts/phase1-premium-kundli-payload.json',
  'artifacts/phase1-fixture-notes.json',
  'screenshots/phase1-free-kundli.pdf.png',
  'screenshots/web-charts-focus-order.png',
]) {
  assert.ok(manifestFiles.has(required), `${required} is present in Phase 1 manifest`);
}

for (const pdf of [
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK/artifacts/phase1-free-kundli.pdf',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK/artifacts/phase1-premium-kundli.pdf',
]) {
  const fullPath = requireFile(pdf, 1_000_000);
  assert.equal(readFileSync(fullPath, { encoding: 'utf8', flag: 'r' }).slice(0, 4), '%PDF');
}

requireFile(
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK/screenshots/mobile-charts-focus-order-source-proof.txt',
  100,
);
requireFile(
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK/verification.txt',
  400,
);

console.log('Kundli Value Phase 1 gate passed: chart purity and focus order are locked.');
