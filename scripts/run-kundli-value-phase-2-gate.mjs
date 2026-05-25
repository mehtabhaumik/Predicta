import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditRoot = path.join(
  root,
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS',
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

const phaseName =
  'PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS';
const auditRelativeRoot = `docs/audits/${phaseName}`;

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
assertIncludes(phaseDoc, phaseName, 'Phase 2 remains documented');
for (const fragment of [
  'The dedicated Charts section must expose all supported Varga charts.',
  'Users must be able to select any supported chart.',
  'Free users receive useful, concise insight.',
  'Premium users receive deeper interpretation and evidence',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 2 doc includes ${fragment}`);
}

const chartAccess = readWorkspaceFile('packages/astrology/src/chartAccess.ts');
assertIncludes(chartAccess, 'ALL_VISIBLE_CHART_TYPES', 'chart access exposes all visible chart types');
assertIncludes(chartAccess, 'CHART_REGISTRY.map(', 'chart access is registry-backed');
assertIncludes(chartAccess, 'return ALL_VISIBLE_CHART_TYPES', 'chart access does not premium-lock chart types');

const registry = readWorkspaceFile('packages/astrology/src/chartRegistry.ts');
const typeSource = readWorkspaceFile('packages/types/src/astrology.ts');
const chartTypeMatch = typeSource.match(/export type ChartType =([\s\S]*?);/);
assert.ok(chartTypeMatch, 'ChartType union is readable');
const chartTypes = [...chartTypeMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
assert.ok(chartTypes.length >= 35, 'full Varga chart type library remains broad');
for (const chartType of chartTypes) {
  assertIncludes(registry, `id: '${chartType}'`, `${chartType} remains in CHART_REGISTRY`);
}

assertIncludes(
  typeSource,
  "'moon'",
  'shared ChartInsightProfile includes Moon and school-safe profiles',
);
assertIncludes(typeSource, "'chalit'", 'shared ChartInsightProfile includes Chalit profile');
assertIncludes(typeSource, "'kp'", 'shared ChartInsightProfile includes KP profile');
assertIncludes(typeSource, "'nadi'", 'shared ChartInsightProfile includes Nadi profile');

const insights = readWorkspaceFile('packages/astrology/src/chartInsights.ts');
for (const fragment of [
  'function composeMoonChartInsight',
  "profile === 'moon'",
  'function composeChalitChartInsight',
  'function composeCoreVargaInsight',
  'function composeAdvancedVargaInsight',
  "type PremiumSynthesisChartType = ChartType | 'MOON'",
  "case 'MOON':",
  'Moon chart complements D1; it does not replace Lagna/Rashi judgement.',
]) {
  assertIncludes(insights, fragment, `chart insight layer includes ${fragment}`);
}
for (const chartType of chartTypes) {
  assertIncludes(insights, chartType, `${chartType} has a meaning/evidence reference`);
}

const webCharts = readWorkspaceFile('apps/web/components/WebChartsExplorer.tsx');
for (const fragment of [
  'type ChartExplorerSelection = ChartType |',
  "'MOON'",
  "'CHALIT'",
  'composeVedicIntelligenceContract',
  'buildParashariChalitChart',
  'resolveSelectedChart',
  'getInsightProfileForSelection',
  "profile: selectedInsightProfile",
  '<option value="MOON">',
  '<option value="CHALIT">',
  'chartTypes.map(chartType',
  'full Varga library remains available below',
]) {
  assertIncludes(webCharts, fragment, `web Charts selector includes ${fragment}`);
}

const webChart = readWorkspaceFile('apps/web/components/WebKundliChart.tsx');
for (const fragment of [
  'What This Chart Is Saying',
  'Main strength',
  'Main challenge',
  'Current guidance',
  'Ask Predicta about this chart',
  'Download full report for detailed analysis',
]) {
  assertIncludes(webChart, fragment, `web chart detail includes ${fragment}`);
}

const vedicPanel = readWorkspaceFile('apps/web/components/WebVedicIntelligencePanel.tsx');
assertIncludes(vedicPanel, "profile: 'moon'", 'web Vedic panel reads Moon chart through Moon profile');

const mobileCharts = readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx');
for (const fragment of [
  'type ChartScreenSelection = ChartType |',
  "'MOON'",
  "'CHALIT'",
  'composeVedicIntelligenceContract',
  'buildParashariChalitChart',
  'resolveSelectedChart',
  'getInsightProfileForSelection',
  'profile: selectedInsightProfile',
  'chartTypes.map(chartType',
  'Download full report for detailed analysis',
  'Ask Predicta about',
  'Strength:',
  'Challenge:',
  'Guidance:',
  'PREMIUM DEEP DIVE',
  'full Varga library remains available below',
]) {
  assertIncludes(mobileCharts, fragment, `mobile Charts selector includes ${fragment}`);
}

const coveragePath = requireFile(
  `${auditRelativeRoot}/artifacts/chart-library-coverage.json`,
  500,
);
const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
assert.equal(coverage.phase, phaseName, 'coverage artifact records Phase 2');
assert.deepEqual(
  coverage.chartTypes,
  chartTypes,
  'coverage artifact includes the exact full ChartType union in order',
);
assert.ok(
  coverage.entries.every(entry => entry.selectable === true && entry.meaningLayer === 'composeChartInsight'),
  'every coverage entry is selectable and meaning-backed',
);

const matrixPath = requireFile(
  `${auditRelativeRoot}/artifacts/manual-verification-matrix.json`,
  500,
);
const matrix = JSON.parse(readFileSync(matrixPath, 'utf8'));
const requiredSelections = ['D1', 'MOON', 'D9', 'D10', 'CHALIT', 'D2', 'D5', 'D24'];
for (const selection of requiredSelections) {
  const row = matrix.selections.find(item => item.selection === selection);
  assert.ok(row, `${selection} appears in manual verification matrix`);
  assert.equal(row.chartVisible, true, `${selection} chart visible`);
  assert.equal(row.freePredictionVisible, true, `${selection} free prediction visible`);
  assert.equal(row.premiumDepthVisible, true, `${selection} premium depth visible`);
  assert.equal(row.askCtaVisible, true, `${selection} Ask Predicta CTA visible`);
  assert.equal(row.downloadCtaVisible, true, `${selection} download report CTA visible`);
}

requireFile(`${auditRelativeRoot}/screenshots/web-chart-selector-source-proof.txt`, 300);
requireFile(`${auditRelativeRoot}/screenshots/mobile-chart-selector-source-proof.txt`, 300);
requireFile(`${auditRelativeRoot}/verification.txt`, 500);

assert.ok(existsSync(auditRoot), 'Phase 2 audit directory exists');

console.log(
  'Kundli Value Phase 2 gate passed: full Varga library remains selectable with Moon/Chalit predictions and free/premium CTAs.',
);
