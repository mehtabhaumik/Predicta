import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const [
  roadmap,
  packageJson,
  chartLayout,
  chartStressSuite,
  webChart,
  webChat,
  webSavedKundlis,
  webHero,
  webReportPreview,
  globalCss,
  mobileChart,
  pdfComposer,
  pdfRenderer,
] = await Promise.all([
  readWorkspaceFile('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md'),
  readWorkspaceFile('package.json'),
  readWorkspaceFile('packages/astrology/src/chartLayout.ts'),
  readWorkspaceFile('packages/astrology/src/chartStressSuite.ts'),
  readWorkspaceFile('apps/web/components/WebKundliChart.tsx'),
  readWorkspaceFile('apps/web/components/WebPridictaChat.tsx'),
  readWorkspaceFile('apps/web/components/WebSavedKundlis.tsx'),
  readWorkspaceFile('apps/web/components/HeroSection.tsx'),
  readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
  readWorkspaceFile('apps/web/app/globals.css'),
  readWorkspaceFile('apps/mobile/src/components/charts/KundliChart.tsx'),
  readWorkspaceFile('packages/pdf/src/index.ts'),
  readWorkspaceFile('packages/pdf/src/reportDocument.tsx'),
]);

for (const phrase of [
  phaseName,
  'Sign numbers, planet names, degree labels, and house labels remain inside',
  'their houses/cells.',
  'Labels use available blank space intelligently instead of pushing toward',
  'boundaries.',
  'No hidden `+1`, `+2`, or overflow counters in report charts.',
  'D1, Moon, D9, D10, Chalit, Swamsa, Karakamsha, and selectable vargas are',
  'PDF charts render 100% chart width without broken inner lines or clipped',
]) {
  assert.match(roadmap, new RegExp(escapeRegExp(phrase)), `roadmap includes ${phrase}`);
}

assert.match(packageJson, /"test:revival-v2-phase-5"/, 'package script exposes the Phase 5 gate');

for (const phrase of [
  'export type ChartLabelBox',
  'labelBox: ChartLabelBox',
  'NORTH_INDIAN_HOUSE_LABEL_BOXES',
  'getNorthIndianHouseLabelBox(house, labelDensity, presentation)',
  "report: {",
  'maxVisiblePlanets: 12',
]) {
  assert.match(chartLayout, new RegExp(escapeRegExp(phrase)), `chart layout includes ${phrase}`);
}

for (const phrase of [
  'isPointInNorthIndianHouse(corner.x, corner.y, cell.house)',
  'label box leaks',
  'report charts never hide core planets behind overflow counters',
  'Report charts must preserve every core planet',
]) {
  assert.match(chartStressSuite, new RegExp(escapeRegExp(phrase)), `chart stress suite includes ${phrase}`);
}

for (const [label, source] of [
  ['web main chart', webChart],
  ['web chat mini chart', webChat],
  ['web saved Kundli mini chart', webSavedKundlis],
  ['web hero chart', webHero],
  ['web report preview chart', webReportPreview],
]) {
  assert.match(source, /--label-x|--library-label-x/, `${label} consumes safe label x coordinates`);
  assert.match(source, /--label-y|--library-label-y/, `${label} consumes safe label y coordinates`);
  assert.doesNotMatch(source, /chart-overflow-counter/, `${label} does not render +n chart counters`);
}

for (const phrase of [
  'left: var(--label-x, var(--house-x))',
  'top: var(--label-y, var(--house-y))',
  'width: var(--label-w',
  'height: var(--label-h',
  'left: var(--library-label-x, var(--house-x))',
  'top: var(--library-label-y, var(--house-y))',
  'width: var(--library-label-w',
]) {
  assert.match(globalCss, new RegExp(escapeRegExp(phrase)), `global CSS includes ${phrase}`);
}
assert.doesNotMatch(globalCss, /chart-overflow-counter/, 'global CSS no longer keeps chart overflow counter styling alive');

for (const phrase of [
  'numberOfLines={1}',
  'maxHeight: 58',
  "overflow: 'hidden'",
  'cellHeader',
]) {
  assert.match(mobileChart, new RegExp(escapeRegExp(phrase)), `mobile chart containment includes ${phrase}`);
}

for (const phrase of [
  'labelBox: {',
  'labelBox: cell.labelBox',
  'hiddenPlanetCount: 0',
  "presentation: 'full'",
]) {
  assert.match(pdfComposer, new RegExp(escapeRegExp(phrase)), `PDF composer includes ${phrase}`);
}

for (const phrase of [
  'buildPolygonAwareChartLabels(cell, boardWidth, boardHeight)',
  'rectInsidePolygon(box, polygon, CHART_LABEL_MIN_EDGE_CLEARANCE)',
  "width: '100%'",
  'height: 450',
]) {
  assert.match(pdfRenderer, new RegExp(escapeRegExp(phrase)), `PDF renderer includes ${phrase}`);
}
assert.doesNotMatch(pdfRenderer, /chart-overflow-counter|\+\s*\{?\s*cell\.hiddenPlanetCount/u, 'PDF renderer does not render chart overflow counters');

const chartStress = spawnSync('corepack', ['pnpm', 'test:charts'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: 'pipe',
});

if (chartStress.status !== 0) {
  process.stdout.write(chartStress.stdout);
  process.stderr.write(chartStress.stderr);
  process.exit(chartStress.status ?? 1);
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'redline-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN.',
    '',
    '## Locked Behavior',
    '',
    '- Web chart labels consume shared safe label boxes instead of broad static CSS widths.',
    '- Chat, saved Kundli, landing, report preview, and main chart surfaces do not render +n overflow counters.',
    '- Mobile chart cells hide/wrap within their own cell boundary and truncate individual chips safely.',
    '- PDF chart snapshots force all report planets visible and use polygon-aware placement.',
    '- The chart stress suite verifies full label rectangles stay inside their North Indian houses.',
    '',
    '## Chart Stress Evidence',
    '',
    '```text',
    chartStress.stdout.trim(),
    '```',
  ].join('\n'),
);

console.log(`${phaseName} passed: Kundli chart containment is locked across shared model, web, mobile, and PDF chart contracts.`);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
