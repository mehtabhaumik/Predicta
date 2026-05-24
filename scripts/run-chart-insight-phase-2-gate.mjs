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
const mobileTypes = await readWorkspaceFile('apps/mobile/src/types/astrology.ts');
const chartInsights = await readWorkspaceFile('packages/astrology/src/chartInsights.ts');
const chalitFoundation = await readWorkspaceFile('packages/astrology/src/chalitBhavKpFoundation.ts');
const vargaInterpretation = await readWorkspaceFile('packages/astrology/src/vargaInterpretation.ts');
const webChart = await readWorkspaceFile('apps/web/components/WebKundliChart.tsx');
const webChalit = await readWorkspaceFile('apps/web/components/WebBhavChalitPanel.tsx');
const globalCss = await readWorkspaceFile('apps/web/app/globals.css');

for (const source of [sharedTypes, mobileTypes]) {
  assert.match(source, /export type ChalitShiftMeaning = \{/);
  for (const field of [
    'whatChanges',
    'activeLifeAreas',
    'practicalCorrection',
    'shiftMeanings',
  ]) {
    assert.match(source, new RegExp(`${field}:`), `Chalit foundation includes ${field}`);
  }
}

for (const phrase of [
  'Life pattern:',
  'Main weight:',
  'Opportunity:',
  'Pressure needing maturity:',
  'first growth lane',
  'getD1LifeFoundationNote()',
]) {
  assert.match(chartInsights, new RegExp(escapeRegExp(phrase)), `D1 insight includes ${phrase}`);
}

for (const phrase of [
  'foundation.bhavChalit.whatChanges',
  'foundation.bhavChalit.activeLifeAreas',
  'foundation.bhavChalit.practicalCorrection',
  'getChalitReadingNote()',
  'Most active lived areas',
  'What changes:',
]) {
  assert.match(chartInsights, new RegExp(escapeRegExp(phrase)), `Chalit insight includes ${phrase}`);
}

for (const phrase of [
  'buildBhavWhatChanges',
  'buildBhavActiveLifeAreas',
  'buildBhavPracticalCorrection',
  'buildBhavShiftMeanings',
  'lived house refinement',
  'lived delivery',
]) {
  assert.match(chalitFoundation, new RegExp(escapeRegExp(phrase)), `Chalit foundation includes ${phrase}`);
}

assert.match(vargaInterpretation, /export function getD1LifeFoundationNote/);
assert.match(vargaInterpretation, /export function getChalitReadingNote/);
assert.match(vargaInterpretation, /D1 is the life-foundation chart/);
assert.match(vargaInterpretation, /Parashari Chalit is the lived-delivery layer/);

assert.match(webChart, /D1 focus: life pattern, main weight, open opportunity, and maturity pressure/);
assert.match(webChart, /Chalit focus: lived house delivery and practical correction/);
assert.match(webChalit, /className="chalit-meaning-panel"/);
assert.match(webChalit, /bhav\.whatChanges/);
assert.match(webChalit, /bhav\.practicalCorrection/);
assert.match(webChalit, /bhav\.activeLifeAreas/);
assert.match(webChalit, /bhav\.shiftMeanings/);
assert.doesNotMatch(webChalit, /<th>D1 House<\/th>/);
assert.doesNotMatch(webChalit, /<th>Chalit House<\/th>/);

assert.match(globalCss, /\.chalit-meaning-panel/);
assert.match(globalCss, /\.chart-insight-focus/);

console.log('Chart Insight Phase 2 passed: D1 and Chalit meaning rebuild is locked.');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
