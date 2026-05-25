import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName =
  'PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD';
const auditRoot = `docs/audits/${phaseName}`;

function readWorkspaceFile(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

function requireFile(relativePath, minimumBytes = 1) {
  const fullPath = path.join(root, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  const size = statSync(fullPath).size;
  assert.ok(size >= minimumBytes, `${relativePath} has at least ${minimumBytes} bytes`);
  return fullPath;
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
for (const fragment of [
  phaseName,
  'Replace technical blabber with direct, useful, evidence-weighted prediction',
  'What is strong here?',
  'What is blocked or delayed here?',
  'What is currently active?',
  'What should the user do practically?',
  'What timing or maturity pattern matters?',
  'What evidence supports this reading?',
  'What should not be overstated?',
  'Do not lead with `this chart governs...` as the main value.',
  'Free: one strong, polished paragraph per focus chart and selected chart.',
  'Premium: deeper analysis with evidence, but still concise on-screen.',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 4 doc includes ${fragment}`);
}

const chartInsights = readWorkspaceFile('packages/astrology/src/chartInsights.ts');
for (const fragment of [
  'This chart points to',
  'The useful prediction is to move slowly',
  'so the user gets a prediction, not just placement labels.',
  'support, delay, or timing',
  'practical prediction',
  'specific guidance once the chart evidence is fully ready',
  'The safe prediction is to use',
  'The safe prediction is to treat',
  'timing relevance, and report-ready practical guidance',
]) {
  assertIncludes(chartInsights, fragment, `chart insight layer uses prediction-first language: ${fragment}`);
}

for (const fragment of [
  'This chart is currently saying that',
  'Use the prepared charts for active prediction while this chart stays in a lighter',
  'This chart should not be overstated before the full evidence is ready.',
  'This chart is listed with a lighter explanation until the full evidence is ready.',
  'This chart is visible, but Predicta is keeping the interpretation careful',
  'still governs',
  'This ${config.name} governs',
]) {
  assertNotIncludes(chartInsights, fragment, `chart insight layer removed generic copy: ${fragment}`);
}

const chartRegistry = readWorkspaceFile('packages/astrology/src/chartRegistry.ts');
assertIncludes(
  chartRegistry,
  'Prediction first: what the chart points to now',
  'chart registry makes Insight View prediction-first',
);
assertNotIncludes(
  chartRegistry,
  'Meaning first: what the chart governs',
  'chart registry does not preserve governs-first copy',
);

const pdf = readWorkspaceFile('packages/pdf/src/index.ts');
for (const fragment of [
  'Every chart now opens with a direct life prediction first.',
  '${chartType} prediction:',
  '${chartType} support:',
  '${chartType} pressure:',
  '${chartType} practical action:',
  'Premium prediction depth:',
  '${chartType} evidence anchor:',
  '${chartType} evidence appendix:',
]) {
  assertIncludes(pdf, fragment, `PDF narrative includes ${fragment}`);
}
for (const fragment of [
  '${chartType} meaning:',
  '${chartType} technical appendix:',
  'Every chart now opens with human meaning first.',
]) {
  assertNotIncludes(pdf, fragment, `PDF narrative removed ${fragment}`);
}

const chatBlocks = readWorkspaceFile('packages/astrology/src/chatChartBlocks.ts');
for (const fragment of [
  'Here is the direct prediction signal',
  'Prediction: ${block.reportHierarchy.meaning}',
  'Evidence appendix: ${block.reportHierarchy.technicalAppendix}',
  'Start with the practical life signal',
  'Evidence focus: ${insight.governs}',
  'prediction-led reading',
]) {
  assertIncludes(chatBlocks, fragment, `chat blocks include ${fragment}`);
}
assertNotIncludes(chatBlocks, 'Here is what your ${block.chartType}', 'chat blocks remove generic opener');
assertNotIncludes(chatBlocks, 'Technical appendix:', 'chat blocks remove technical-first label');

const webChart = readWorkspaceFile('apps/web/components/WebKundliChart.tsx');
for (const fragment of [
  'Varga prediction focus: ${localizedInsight.governs}',
  "translateUiText('What this points to now', appLanguage)",
]) {
  assertIncludes(webChart, fragment, `web chart insight UI includes ${fragment}`);
}
assertNotIncludes(webChart, 'What this chart governs', 'web chart no longer labels governs as the value');

const webChat = readWorkspaceFile('apps/web/components/WebPridictaChat.tsx');
const mobileChat = readWorkspaceFile('apps/mobile/src/screens/ChatScreen.tsx');
for (const [name, source] of [
  ['web chat', webChat],
  ['mobile chat', mobileChat],
]) {
  assertIncludes(source, "['Prediction', block.reportHierarchy.meaning]", `${name} labels hierarchy as Prediction`);
  assertIncludes(source, "['Evidence appendix', block.reportHierarchy.technicalAppendix]", `${name} labels hierarchy as Evidence appendix`);
  assertNotIncludes(source, "['Meaning', block.reportHierarchy.meaning]", `${name} removes Meaning label`);
  assertNotIncludes(source, "['Technical appendix', block.reportHierarchy.technicalAppendix]", `${name} removes Technical appendix label`);
}

const chartDoc = readWorkspaceFile('docs/PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md');
for (const fragment of [
  '`What this chart points to now`',
  '`What this chart is predicting for you`',
  'prediction-first hierarchy',
  'evidence appendix',
  'practical prediction before evidence',
]) {
  assertIncludes(chartDoc, fragment, `chart insight doc aligns with Phase 4: ${fragment}`);
}
assertNotIncludes(chartDoc, '`What this chart governs`', 'chart insight doc removes governs-first product rule');

const samples = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/phase4-prediction-language-samples.json`),
);
assert.ok(Array.isArray(samples.samples), 'sample artifact exposes samples array');
assert.ok(samples.samples.length >= 7, 'sample artifact audits at least seven chart/report sections');
for (const sample of samples.samples) {
  assert.ok(sample.section, 'sample has section');
  assert.ok(sample.freePrediction, `${sample.section} has freePrediction`);
  assert.ok(sample.premiumDepth, `${sample.section} has premiumDepth`);
  assert.equal(sample.answersWhatThisMeansForMe, true, `${sample.section} answers what this means for me`);
  assert.equal(sample.avoidsFatalism, true, `${sample.section} avoids fatalism`);
  assert.equal(sample.notJustGovernsCopy, true, `${sample.section} is not governs-only copy`);
}

for (const pdfArtifact of [
  `${auditRoot}/artifacts/phase4-free-kundli.pdf`,
  `${auditRoot}/artifacts/phase4-premium-kundli.pdf`,
]) {
  const fullPath = requireFile(pdfArtifact, 1_000_000);
  assert.equal(readFileSync(fullPath, { encoding: 'utf8', flag: 'r' }).slice(0, 4), '%PDF');
}

for (const file of [
  `${auditRoot}/artifacts/phase4-free-payload.json`,
  `${auditRoot}/artifacts/phase4-premium-payload.json`,
  `${auditRoot}/artifacts/phase4-content-audit.json`,
  `${auditRoot}/screenshots/web-mobile-source-proof.txt`,
  `${auditRoot}/verification.txt`,
]) {
  requireFile(file, 300);
}

console.log(
  'Kundli Value Phase 4 gate passed: prediction-first chart language, free/premium depth, chat/report parity, and artifacts are audited.',
);
