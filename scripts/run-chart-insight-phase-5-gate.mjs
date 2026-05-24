import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const files = {
  chartInsights: await readWorkspaceFile('packages/astrology/src/chartInsights.ts'),
  chartRegistry: await readWorkspaceFile('packages/astrology/src/chartRegistry.ts'),
  vargaInterpretation: await readWorkspaceFile('packages/astrology/src/vargaInterpretation.ts'),
  webChart: await readWorkspaceFile('apps/web/components/WebKundliChart.tsx'),
};

const advancedVargas = [
  'D5',
  'D6',
  'D8',
  'D11',
  'D13',
  'D15',
  'D17',
  'D18',
  'D19',
  'D21',
  'D22',
  'D23',
  'D25',
  'D26',
  'D27',
  'D28',
  'D29',
  'D31',
  'D32',
  'D33',
  'D34',
];

const advancedTypeBlock = extractBlock(files.chartInsights, 'type AdvancedVargaChartType =', ';');
const advancedSetBlock = extractObjectBlock(
  files.chartInsights,
  'const ADVANCED_VARGA_TYPES',
  'const ADVANCED_VARGA_CONFIDENCE_TIERS',
);
const confidenceBlock = extractObjectBlock(
  files.chartInsights,
  'const ADVANCED_VARGA_CONFIDENCE_TIERS',
  'const PLANET_DIGNITIES',
);
const definitionBlock = extractObjectBlock(
  files.chartInsights,
  'const ADVANCED_VARGA_INSIGHT_DEFINITIONS',
  '};',
  files.chartInsights.indexOf('const ADVANCED_VARGA_INSIGHT_DEFINITIONS'),
);

for (const chartType of advancedVargas) {
  assertIncludes(advancedTypeBlock, `'${chartType}'`, `${chartType} is in AdvancedVargaChartType`);
  assertIncludes(advancedSetBlock, `'${chartType}'`, `${chartType} is in ADVANCED_VARGA_TYPES`);
  assert.match(confidenceBlock, new RegExp(`${chartType}: '(supporting|narrow|sensitive)'`), `${chartType} has confidence tier`);
  assert.match(definitionBlock, new RegExp(`${chartType}: \\{`), `${chartType} has advanced meaning definition`);
  assert.match(files.chartRegistry, new RegExp(`id: '${chartType}'`), `${chartType} is registered in chart registry`);
  assert.match(files.vargaInterpretation, new RegExp(`${chartType}:`), `${chartType} has chart-specific interpretation note`);
}

for (const sensitiveType of ['D6', 'D8', 'D18', 'D21', 'D22', 'D26', 'D28', 'D31', 'D32', 'D34']) {
  assert.match(confidenceBlock, new RegExp(`${sensitiveType}: 'sensitive'`), `${sensitiveType} is guarded as sensitive`);
}

for (const phrase of [
  'advancedVargaConfidenceFrame',
  'buildAdvancedTechnicalEvidence',
  'D1 anchor:',
  'Advanced confidence:',
  'Chart-specific interpretation note:',
  'House/planet details:',
  'Planet condition proof:',
  'Dasha evidence:',
  'correction, protection, and steadier choices rather than fear or fixed fate',
  'PLANET_DIGNITIES',
  'COMBUSTION_ORBS',
  'isCoreJudgementPlanet',
]) {
  assertIncludes(files.chartInsights, phrase, `advanced technical contract includes ${phrase}`);
}

for (const phrase of [
  'D1 anchor rule',
  'Chart-specific note',
  'House evidence',
  'Planet condition',
  'formatPlanetTechnicalDetail',
  'formatPlanetTechnicalCondition',
]) {
  assertIncludes(files.webChart, phrase, `web Technical View includes ${phrase}`);
}

console.log('Chart Insight Phase 5 passed: advanced varga library and Technical View evidence contract are locked.');

function extractBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.ok(start >= 0, `${startMarker} exists`);
  const end = source.indexOf(endMarker, start);
  assert.ok(end > start, `${endMarker} follows ${startMarker}`);
  return source.slice(start, end + endMarker.length);
}

function extractObjectBlock(source, startMarker, endMarker, fromIndex = 0) {
  const start = source.indexOf(startMarker, fromIndex);
  assert.ok(start >= 0, `${startMarker} exists`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(end > start, `${endMarker} follows ${startMarker}`);
  return source.slice(start, end + endMarker.length);
}

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
