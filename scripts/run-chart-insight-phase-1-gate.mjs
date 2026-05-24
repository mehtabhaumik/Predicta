import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const sharedTypes = await readWorkspaceFile('packages/types/src/astrology.ts');
const chartInsights = await readWorkspaceFile('packages/astrology/src/chartInsights.ts');
const chartRegistry = await readWorkspaceFile('packages/astrology/src/chartRegistry.ts');
const webChart = await readWorkspaceFile('apps/web/components/WebKundliChart.tsx');
const webExplorer = await readWorkspaceFile('apps/web/components/WebChartsExplorer.tsx');
const mobileCharts = await readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx');
const mobileKundli = await readWorkspaceFile('apps/mobile/src/screens/KundliScreen.tsx');
const mobileChat = await readWorkspaceFile('apps/mobile/src/screens/ChatScreen.tsx');
const mobileTypes = await readWorkspaceFile('apps/mobile/src/types/astrology.ts');
const globalCss = await readWorkspaceFile('apps/web/app/globals.css');

assert.match(sharedTypes, /export type ChartViewMode = 'insight' \| 'technical'/);
assert.match(sharedTypes, /export type ChartViewHierarchyItem = \{/);
assert.match(sharedTypes, /label: 'Insight View' \| 'Technical View'/);
assert.match(sharedTypes, /export type ChartInsight = \{/);

for (const field of [
  'governs',
  'whatItSays',
  'mainStrength',
  'mainChallenge',
  'lifeAreas',
  'currentGuidance',
  'freeInsights',
  'premiumDeepDive',
  'technicalSummary',
  'technicalDetails',
]) {
  assert.match(sharedTypes, new RegExp(`${field}:`), `shared ChartInsight includes ${field}`);
}

assert.match(sharedTypes, /export type ChatChartInsight = ChartInsight/);
assert.match(chartInsights, /from '@pridicta\/types'/);
assert.doesNotMatch(chartInsights, /export type ChartInsight = \{/);
assert.match(chartInsights, /export type \{[\s\S]*ChartInsightDepth[\s\S]*\} from '@pridicta\/types'/);

assert.match(chartRegistry, /export const CHART_VIEW_HIERARCHY: ChartViewHierarchyItem\[\]/);
assert.match(chartRegistry, /id: 'insight'[\s\S]*default: true/);
assert.match(chartRegistry, /id: 'technical'/);
assert.match(chartRegistry, /export function getDefaultChartViewMode\(\): ChartViewMode/);

assert.match(webChart, /CHART_VIEW_HIERARCHY/);
assert.match(webChart, /getDefaultChartViewMode/);
assert.match(webChart, /useState<ChartViewMode>\(getDefaultChartViewMode\)/);
assert.match(webChart, /What This Chart Is Saying/);
assert.match(webChart, /viewMode === 'insight'/);
assert.match(webChart, /Technical View/);
assert.match(webChart, /technicalSummary/);

assert.match(webExplorer, /composeChartInsight/);
assert.match(webExplorer, /selectedInsight\.whatItSays/);
assert.match(webExplorer, /selectedInsight\.mainStrength/);
assert.match(webExplorer, /selectedInsight\.mainChallenge/);
assert.match(webExplorer, /selectedInsight\.currentGuidance/);

assert.match(mobileTypes, /export type ChartInsight = \{/);
assert.match(mobileTypes, /export type ChatChartInsight = ChartInsight/);
assert.match(mobileCharts, /What This Chart Is Saying/);
assert.match(mobileCharts, /insight\.whatItSays/);
assert.match(mobileCharts, /insight\.mainStrength/);
assert.match(mobileCharts, /insight\.mainChallenge/);
assert.match(mobileCharts, /insight\.currentGuidance/);
assert.match(mobileKundli, /insight\.whatItSays/);
assert.match(mobileKundli, /insight\.mainStrength/);
assert.match(mobileKundli, /insight\.currentGuidance/);
assert.match(mobileChat, /block\.insight\.mainStrength/);
assert.match(mobileChat, /block\.insight\.mainChallenge/);
assert.match(mobileChat, /block\.insight\.currentGuidance/);
assert.match(mobileChat, /block\.insight\.freeInsights/);

for (const source of [mobileCharts, mobileKundli, mobileChat]) {
  assert.doesNotMatch(source, /insight\.summary|insight\.bullets|block\.insight\.bullets/);
}

assert.match(globalCss, /\.selected-chart-insight-grid/);
assert.match(globalCss, /\.chart-insight-eyebrow/);

console.log('Chart Insight Phase 1 passed: universal contract and view hierarchy are locked.');
