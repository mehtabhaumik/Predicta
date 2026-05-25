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
  mobileCharts: await readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx'),
  mobileTypes: await readWorkspaceFile('apps/mobile/src/types/astrology.ts'),
  packageTypes: await readWorkspaceFile('packages/types/src/astrology.ts'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  webChart: await readWorkspaceFile('apps/web/components/WebKundliChart.tsx'),
  webCss: await readWorkspaceFile('apps/web/app/globals.css'),
};

for (const [name, source] of [
  ['package types', files.packageTypes],
  ['mobile types', files.mobileTypes],
]) {
  assertIncludes(source, 'layeredInterpretation: string[];', `${name} exposes layered premium contract`);
}

for (const phrase of [
  'buildPremiumLayeredInterpretation',
  'buildStrengthContradictionAnalysis',
  'Layer 1:',
  'Layer 2:',
  'Layer 3:',
  'Layer 4:',
  'Strength map:',
  'Contradiction map:',
  'Synthesis check:',
  "return ['D9', 'D10', 'CHALIT', 'KP', 'NADI'];",
  'D1 + Chalit',
  'D1 + KP',
  'D1 + Nadi',
  'getCrossChartTargets',
  'buildPremiumGuidance',
  'buildPremiumRemedyDirection',
  'buildConfidenceFraming',
]) {
  assertIncludes(files.chartInsights, phrase, `premium chart insight includes ${phrase}`);
}

for (const phrase of [
  'D2',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D20',
  'D24',
  'D30',
  'D5',
  'D6',
  'D8',
  'D11',
  'D17',
  'D22',
  'D27',
  'D34',
]) {
  assertIncludes(files.chartInsights, `case '${phrase}':`, `${phrase} has meaningful cross-chart target handling`);
}

for (const phrase of [
  'Layered interpretation',
  'insight.premiumInsight.layeredInterpretation',
  'Cross-chart synthesis',
  'Strength vs contradiction',
  'Confidence framing',
]) {
  assertIncludes(files.webChart, phrase, `web premium panel includes ${phrase}`);
}

assertIncludes(files.webCss, 'chart-premium-block-wide', 'web premium panel supports wide layered block');

for (const phrase of [
  'PREMIUM DEEP DIVE',
  'PremiumMiniList',
  'Layered interpretation',
  'Cross-chart synthesis',
  'Strength vs contradiction',
  'Confidence:',
]) {
  assertIncludes(files.mobileCharts, phrase, `mobile chart screen includes ${phrase}`);
}

for (const phrase of [
  'Every chart now opens with a direct life prediction first. Premium then adds evidence, timing windows, contradiction handling, cross-chart synthesis, and a compact appendix',
  'Premium prediction depth:',
]) {
  assertIncludes(files.pdf, phrase, `PDF chart narrative still preserves ${phrase}`);
}

assert.ok(
  !files.chartInsights.includes('basic meaning is available only in Premium'),
  'premium does not hide basic chart meaning',
);

console.log('Chart Insight Phase 6 passed: Premium deep dive and cross-chart synthesis are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
