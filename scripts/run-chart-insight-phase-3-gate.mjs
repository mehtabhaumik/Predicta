import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const chartInsights = await readWorkspaceFile('packages/astrology/src/chartInsights.ts');
const vargaInterpretation = await readWorkspaceFile('packages/astrology/src/vargaInterpretation.ts');
const webChart = await readWorkspaceFile('apps/web/components/WebKundliChart.tsx');

const coreVargas = [
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D30',
  'D40',
  'D45',
  'D60',
];

assert.match(chartInsights, /type CoreVargaHumanStake = \{/);
assert.match(chartInsights, /const CORE_VARGA_HUMAN_STAKES: Record<CoreVargaChartType, CoreVargaHumanStake>/);

const humanStakeBlock = extractObjectBlock(
  chartInsights,
  'const CORE_VARGA_HUMAN_STAKES',
  'const CORE_VARGA_INSIGHT_DEFINITIONS',
);
const definitionBlock = extractObjectBlock(
  chartInsights,
  'const CORE_VARGA_INSIGHT_DEFINITIONS',
  'const ADVANCED_VARGA_INSIGHT_DEFINITIONS',
);

for (const chartType of coreVargas) {
  assert.match(humanStakeBlock, new RegExp(`${chartType}: \\{`), `${chartType} human-stakes entry exists`);
  assert.match(definitionBlock, new RegExp(`${chartType}: \\{`), `${chartType} definition entry exists`);

  const entry = extractEntry(humanStakeBlock, chartType);
  for (const field of [
    'humanStakes',
    'currentSignal',
    'strengthReveals',
    'cautionReveals',
    'practicalGuidance',
    'timingFrame',
    'crossChartAnchor',
  ]) {
    assert.match(entry, new RegExp(`${field}:`), `${chartType} includes ${field}`);
  }
}

for (const phrase of [
  'resource rhythm',
  'nerve, initiative',
  'private foundation',
  'legacy that grows through care',
  'dharma maturity',
  'public delivery',
  'lineage',
  'lived comfort',
  'inner practice',
  'learning karma',
  'protection',
  'maternal inheritance',
  'paternal inheritance',
  'deep karma',
]) {
  assert.match(humanStakeBlock, new RegExp(escapeRegExp(phrase)), `distinct core varga voice includes ${phrase}`);
}

for (const phrase of [
  'Human stakes:',
  'What it is saying:',
  'Strength revealed:',
  'Caution revealed:',
  'CORE_VARGA_HUMAN_STAKES[chartType]',
  'crossChartAnchor',
]) {
  assert.match(chartInsights, new RegExp(escapeRegExp(phrase)), `composeCoreVargaInsight uses ${phrase}`);
}

assert.match(webChart, /Varga prediction focus: \$\{localizedInsight\.governs\}/);
assert.match(vargaInterpretation, /D2 is Hora/);
assert.match(vargaInterpretation, /D9 is Navamsha/);
assert.match(vargaInterpretation, /D30 refines stress/);
assert.match(vargaInterpretation, /D60 is a deep karmic texture chart/);

console.log('Chart Insight Phase 3 passed: core varga human-stakes library is locked.');

function extractObjectBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  assert.ok(start >= 0, `${startMarker} exists`);
  assert.ok(end > start, `${endMarker} follows ${startMarker}`);
  return source.slice(start, end);
}

function extractEntry(block, key) {
  const start = block.indexOf(`${key}: {`);
  assert.ok(start >= 0, `${key} entry exists`);
  const nextMatch = block.slice(start + key.length + 3).match(/\n  D(?:\d+): \{/);
  const end = nextMatch ? start + key.length + 3 + (nextMatch.index ?? 0) : block.length;
  return block.slice(start, end);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
