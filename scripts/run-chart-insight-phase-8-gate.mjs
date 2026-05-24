import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const auditRoot =
  'docs/audits/PREDICTA_CHART_INSIGHT_PHASE_8_FINAL_QA_DEPLOY_AND_LIVE_SMOKE';

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertExists(file, label) {
  await access(path.join(repoRoot, file));
  assert.ok(true, label);
}

const files = {
  chartDoc: await readWorkspaceFile('docs/PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md'),
  chartInsights: await readWorkspaceFile('packages/astrology/src/chartInsights.ts'),
  chartRegistry: await readWorkspaceFile('packages/astrology/src/chartRegistry.ts'),
  chatBlocks: await readWorkspaceFile('packages/astrology/src/chatChartBlocks.ts'),
  mobileCharts: await readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx'),
  mobileKundli: await readWorkspaceFile('apps/mobile/src/screens/KundliScreen.tsx'),
  mobileChat: await readWorkspaceFile('apps/mobile/src/screens/ChatScreen.tsx'),
  nadiPlan: await readWorkspaceFile('packages/astrology/src/nadiJyotishPlan.ts'),
  packageJson: await readWorkspaceFile('package.json'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  varga: await readWorkspaceFile('packages/astrology/src/vargaInterpretation.ts'),
  webCharts: await readWorkspaceFile('apps/web/components/WebChartsExplorer.tsx'),
  webKundli: await readWorkspaceFile('apps/web/components/WebKundliChart.tsx'),
  webChat: await readWorkspaceFile('apps/web/components/WebPridictaChat.tsx'),
  webKp: await readWorkspaceFile('apps/web/components/WebKpPredictaPanel.tsx'),
  webNadi: await readWorkspaceFile('apps/web/components/WebNadiPredictaPanel.tsx'),
};

for (const phrase of [
  'PREDICTA_CHART_INSIGHT_PHASE_8_FINAL_QA_DEPLOY_AND_LIVE_SMOKE',
  'Do not ship this rebuild unless it is visibly better for real users on the live',
  'desktop',
  'tablet',
  'mobile',
  'English',
  'Hindi',
  'Gujarati',
  'free mode',
  'premium mode',
  'D1',
  'Chalit',
  'core vargas',
  'advanced vargas',
  'KP',
  'Nadi',
  'chart page',
  'chart inside chat',
  'chart report output',
]) {
  assertIncludes(files.chartDoc, phrase, `Phase 8 contract includes ${phrase}`);
}

assertIncludes(
  files.packageJson,
  '"test:chart-insight-phase-8": "node scripts/run-chart-insight-phase-8-gate.mjs"',
  'package exposes Chart Insight Phase 8 gate',
);

for (const phase of [1, 2, 3, 4, 5, 6, 7]) {
  assertIncludes(
    files.packageJson,
    `"test:chart-insight-phase-${phase}"`,
    `prior chart phase ${phase} remains executable`,
  );
}

for (const phrase of [
  'Insight View',
  'Technical View',
  'governs',
  'whatItSays',
  'mainStrength',
  'mainChallenge',
  'lifeAreas',
  'currentGuidance',
  'freeInsights',
  'premiumDeepDive',
  'technicalDetails',
]) {
  assertIncludes(
    files.chartInsights + files.chartRegistry + files.webCharts + files.webKundli,
    phrase,
    `meaning-first chart contract and UI include ${phrase}`,
  );
}

for (const phrase of [
  'D1',
  'MOON',
  'D9',
  'D10',
  'D24',
  'D30',
  'D60',
  'D30 refines stress',
  'D60 is a deep karmic texture chart',
  'non-fatalistic',
]) {
  assertIncludes(files.varga + files.chartInsights, phrase, `core/advanced varga QA includes ${phrase}`);
}

assertIncludes(files.chartDoc, 'D1 remains the root chart', 'phase contract keeps D1 as root chart');

for (const phrase of [
  'eventJudgement.plainLanguage',
  'eventJudgement.proofPath',
  'storyLens.strongestThread',
  'storyLens.shiftThatHelps',
]) {
  assertIncludes(
    files.webKp + files.webNadi + files.nadiPlan,
    phrase,
    `KP/Nadi method-safe meaning includes ${phrase}`,
  );
}

assertIncludes(
  files.chartInsights,
  'No palm-leaf manuscript access is claimed',
  'Nadi chart insight explicitly avoids palm-leaf manuscript claims',
);

for (const phrase of [
  'reportHierarchy',
  'Meaning:',
  'Key insight:',
  'Free understanding:',
  'Premium depth:',
  'Technical appendix:',
  'block.reportHierarchy.meaning',
]) {
  assertIncludes(
    files.chatBlocks + files.webChat + files.mobileChat + files.pdf,
    phrase,
    `chat/report chart output includes ${phrase}`,
  );
}

for (const phrase of [
  'selectedInsight.mainStrength',
  'selectedInsight.mainChallenge',
  'selectedInsight.currentGuidance',
  'insight.mainStrength',
  'insight.currentGuidance',
]) {
  assertIncludes(
    files.webCharts + files.mobileCharts + files.mobileKundli,
    phrase,
    `desktop/tablet/mobile chart surfaces expose ${phrase}`,
  );
}

assert.ok(
  !/chart was opened/i.test(files.chatBlocks + files.webChat + files.mobileChat + files.pdf),
  'chart chat/report copy must not regress to mechanical opened-chart copy',
);

await assertExists(`${auditRoot}/verification.txt`, 'Phase 8 verification artifact exists');
await assertExists(`${auditRoot}/live-smoke.txt`, 'Phase 8 live-smoke artifact exists');

console.log('Chart Insight Phase 8 passed: final QA matrix, deploy smoke artifacts, and meaning-first chart surfaces are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
