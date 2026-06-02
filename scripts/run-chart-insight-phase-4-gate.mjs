import { strict as assert } from 'node:assert';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

if (
  !existsSync(path.join(repoRoot, 'apps/web/components/WebNadiPredictaPanel.tsx')) &&
  existsSync(path.join(repoRoot, 'apps/web/components/WebJaiminiPredictaPanel.tsx'))
) {
  console.log(
    'Chart Insight Phase 4 legacy KP/Nadi gate superseded: Nadi UI surfaces were removed after the Jaimini replacement; run test:jaimini-phase-10 for the active localization/school-boundary gate.',
  );
  process.exit(0);
}

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const files = {
  aiContext: await readWorkspaceFile('packages/ai/src/contextBuilder.ts'),
  chartInsights: await readWorkspaceFile('packages/astrology/src/chartInsights.ts'),
  kpFoundation: await readWorkspaceFile('packages/astrology/src/chalitBhavKpFoundation.ts'),
  mobileKp: await readWorkspaceFile('apps/mobile/src/components/KpPredictaPanel.tsx'),
  mobileNadi: await readWorkspaceFile('apps/mobile/src/screens/NadiPredictaScreen.tsx'),
  nadiPlan: await readWorkspaceFile('packages/astrology/src/nadiJyotishPlan.ts'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  predictaChat: await readWorkspaceFile('packages/astrology/src/predictaChatActions.ts'),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
  webKp: await readWorkspaceFile('apps/web/components/WebKpPredictaPanel.tsx'),
  webNadi: await readWorkspaceFile('apps/web/components/WebNadiPredictaPanel.tsx'),
  webSaved: await readWorkspaceFile('apps/web/components/WebSavedKundlis.tsx'),
};

for (const phrase of [
  'export type ChartInsightProfile',
  "| 'default'",
  "| 'chalit'",
  "| 'kp'",
  "| 'nadi'",
  'export type KpEventJudgement',
  'export type NadiChartStoryLens',
  'eventJudgement: KpEventJudgement',
  'storyLens: NadiChartStoryLens',
]) {
  assertIncludes(files.types, phrase, `shared type contract includes ${phrase}`);
}

for (const phrase of [
  'buildKpEventJudgement',
  'verdictLabel',
  'decisionPoint',
  'timingReadiness',
  'proofPath',
  'Ask one exact KP question',
]) {
  assertIncludes(files.kpFoundation, phrase, `KP meaning layer includes ${phrase}`);
}

for (const phrase of [
  'buildNadiStoryLens',
  'hiddenPatternSentence',
  'validationBridge',
  'shiftThatHelps',
  'does not claim access',
  'fixed fate',
]) {
  assertIncludes(files.nadiPlan, phrase, `Nadi story layer includes ${phrase}`);
}

for (const phrase of [
  'composeKpChartInsight',
  'composeNadiChartInsight',
  "profile === 'kp'",
  "profile === 'nadi'",
  'KP event verdict',
  'Nadi confidence grows through calculated story evidence plus user validation',
]) {
  assertIncludes(files.chartInsights, phrase, `chart insight profile includes ${phrase}`);
}

assertIncludes(files.webSaved, "insightProfile={school === 'KP' ? 'kp' : school === 'NADI' ? 'nadi' : 'default'}", 'saved-kundli chart dialog routes KP/Nadi profiles');

for (const [name, source] of [
  ['web KP panel', files.webKp],
  ['mobile KP panel', files.mobileKp],
]) {
  assertIncludes(source, 'EVENT VERDICT', `${name} exposes event verdict compass`);
  assertIncludes(source, 'eventJudgement.plainLanguage', `${name} exposes plain-language KP meaning`);
  assertIncludes(source, 'eventJudgement.proofPath', `${name} exposes KP proof path`);
}

for (const [name, source] of [
  ['web Nadi panel', files.webNadi],
  ['mobile Nadi panel', files.mobileNadi],
]) {
  assertIncludes(source, 'HIDDEN PATTERN', `${name} exposes hidden pattern sentence`);
  assertIncludes(source, 'storyLens.strongestThread', `${name} exposes Nadi story thread`);
  assertIncludes(source, 'storyLens.shiftThatHelps', `${name} exposes Nadi shift`);
}

for (const phrase of [
  'storyLens: plan.storyLens',
  'Event verdict:',
  'Hidden pattern:',
]) {
  assert.ok(
    files.aiContext.includes(phrase) ||
      files.chartInsights.includes(phrase) ||
      files.nadiPlan.includes(phrase) ||
      files.predictaChat.includes(phrase),
    `memory/chat seam includes ${phrase}`,
  );
}

for (const phrase of [
  'Event verdict compass',
  'Timing readiness',
  'Hidden pattern sentence',
  'Shift that helps',
  'storyLens.evidencePath',
]) {
  assertIncludes(files.pdf, phrase, `PDF/report seam includes ${phrase}`);
}

assert.doesNotMatch(files.nadiPlan, /accessed (the )?(original )?palm-leaf/i);
assert.doesNotMatch(files.nadiPlan, /is a verified manuscript record/i);
assert.doesNotMatch(files.chartInsights, /Nadi.*KP cusp logic.*judgement/i);

console.log('Chart Insight Phase 4 passed: KP and Nadi chart meaning layers are method-safe and human-readable.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
