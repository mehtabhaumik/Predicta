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
  chatBlocks: await readWorkspaceFile('packages/astrology/src/chatChartBlocks.ts'),
  chatFollowUps: await readWorkspaceFile('packages/astrology/src/chatFollowUps.ts'),
  doc: await readWorkspaceFile('docs/PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md'),
  mobileChat: await readWorkspaceFile('apps/mobile/src/screens/ChatScreen.tsx'),
  mobileTypes: await readWorkspaceFile('apps/mobile/src/types/astrology.ts'),
  packageJson: await readWorkspaceFile('package.json'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
  webChat: await readWorkspaceFile('apps/web/components/WebPridictaChat.tsx'),
  webCss: await readWorkspaceFile('apps/web/app/globals.css'),
};

for (const phrase of [
  'PREDICTA_CHART_INSIGHT_PHASE_7_CHAT_REPORT_AND_CTA_INTEGRATION',
  'meaning',
  'key insight',
  'free understanding',
  'premium depth',
  'technical appendix',
  'Remove stale chart copy that still sounds like a mechanic’s note',
]) {
  assertIncludes(files.doc, phrase, `Phase 7 contract includes ${phrase}`);
}

assertIncludes(
  files.packageJson,
  '"test:chart-insight-phase-7": "node scripts/run-chart-insight-phase-7-gate.mjs"',
  'package exposes Phase 7 gate',
);

for (const [name, source] of [
  ['package types', files.types],
  ['mobile types', files.mobileTypes],
]) {
  for (const phrase of [
    'ChatChartReportHierarchy',
    'meaning: string;',
    'keyInsight: string;',
    'freeUnderstanding: string;',
    'premiumDepth: string;',
    'technicalAppendix: string;',
    'reportHierarchy: ChatChartReportHierarchy;',
  ]) {
    assertIncludes(source, phrase, `${name} exposes report hierarchy ${phrase}`);
  }
}

for (const phrase of [
  'buildChatChartReportHierarchy',
  'reportHierarchy',
  'Meaning:',
  'Key insight:',
  'Free understanding:',
  'Premium depth:',
  'Technical appendix:',
  'Ask deeper',
  'Ask timing',
  'Ask remedy',
  'Understand ${humanArea}',
  'Compare with D1',
  'Compare with Moon',
]) {
  assertIncludes(files.chatBlocks, phrase, `chat chart blocks integrate ${phrase}`);
}

for (const phrase of [
  'Understand what this means for ${lifeArea}',
  'Compare ${chart} with D1 for ${lifeArea}',
  'Compare D1 with Moon chart for ${lifeArea}',
  'base.slice(0, 5)',
]) {
  assertIncludes(files.chatFollowUps, phrase, `chart follow-up CTAs include ${phrase}`);
}

for (const phrase of [
  'chat-chart-hierarchy-grid',
  'block.reportHierarchy.meaning',
  'block.reportHierarchy.keyInsight',
  'block.reportHierarchy.freeUnderstanding',
  'block.reportHierarchy.premiumDepth',
  'block.reportHierarchy.technicalAppendix',
]) {
  assertIncludes(files.webChat, phrase, `web chat renders hierarchy ${phrase}`);
}

for (const phrase of [
  'chat-chart-hierarchy-grid',
  'chat-chart-hierarchy-block',
]) {
  assertIncludes(files.webCss, phrase, `web CSS supports hierarchy ${phrase}`);
}

for (const phrase of [
  'styles.chatChartHierarchy',
  'styles.chatChartHierarchyBlock',
  'block.reportHierarchy.meaning',
  'block.reportHierarchy.keyInsight',
  'block.reportHierarchy.freeUnderstanding',
  'block.reportHierarchy.premiumDepth',
  'block.reportHierarchy.technicalAppendix',
]) {
  assertIncludes(files.mobileChat, phrase, `mobile chat renders hierarchy ${phrase}`);
}

for (const phrase of [
  '${chartType} meaning:',
  '${chartType} key insight:',
  '${chartType} free understanding:',
  'Premium depth:',
  '${chartType} technical appendix:',
]) {
  assertIncludes(files.pdf, phrase, `PDF chart narrative preserves ${phrase}`);
}

assert.ok(
  !files.chatBlocks.includes('chart was opened') &&
    !files.webChat.includes('chart was opened') &&
    !files.mobileChat.includes('chart was opened'),
  'chart chat copy must not say the chart was merely opened',
);

console.log('Chart Insight Phase 7 passed: chat, reports, and chart CTAs share the meaning-first hierarchy.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
