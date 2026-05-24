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
  astrologyIndex: await readWorkspaceFile('packages/astrology/src/index.ts'),
  contract: await readWorkspaceFile('packages/astrology/src/vedicIntelligenceContract.ts'),
  mobileCharts: await readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx'),
  mobilePanel: await readWorkspaceFile('apps/mobile/src/components/VedicIntelligencePanel.tsx'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
  webPanel: await readWorkspaceFile('apps/web/components/WebVedicIntelligencePanel.tsx'),
  webVedicPage: await readWorkspaceFile('apps/web/app/dashboard/vedic/page.tsx'),
};

for (const phrase of [
  'export type VedicIntelligenceContract',
  'export type VedicIntelligenceSection',
  'export type VedicGrahaVisualMetadata',
  'export type VedicHouseWisePlanetPlacement',
  'export type VedicPlanetFriendshipRow',
  'export type VedicMahadashaPhalaBlock',
  'Moon',
  'Sun',
  'Mars',
  'Jupiter',
  'Venus',
  'Saturn',
  'Mercury',
  'Rahu',
  'Ketu',
  'Chandra',
  'Surya',
  'Mangal',
  'Guru',
  'Shukra',
  'Shani',
]) {
  assertIncludes(files.types + files.contract, phrase, `shared type/contract includes ${phrase}`);
}

for (const sectionId of [
  'snapshot',
  'moon-chart',
  'mahadasha-phala',
  'house-wise-placements',
  'friendship-table',
  'benefic-malefic',
  'chalit-table',
  'panchang',
  'samsa',
  'ghatak-favorable',
  'karakamsha',
  'ashtakavarga',
  'prastarashtakavarga',
  'avakhada-chakra',
]) {
  assertIncludes(files.types, `'${sectionId}'`, `${sectionId} is in shared section id union`);
  assertIncludes(files.contract, sectionId, `${sectionId} is built in Vedic intelligence contract`);
}

for (const phrase of [
  'composeVedicIntelligenceContract',
  'buildMoonChart',
  'Moon Chart / Chandra Lagna Chart',
  'currentEntireMahadasha',
  'currentMahadashaAntardasha',
  'currentMahadashaAntardashaPratyantardasha',
  'pastMahadashas',
  'Pratyantardasha is a fine timing layer and should not be overclaimed',
  'Natural, temporary, and compound relationships are calculated',
  'Pending deterministic module',
  "id: 'D1'",
  "id: 'MOON'",
  "id: 'D9'",
  'localizedDisplayLabel',
  'node-shadow',
  'lunar-disc-',
]) {
  assertIncludes(files.contract, phrase, `contract implementation includes ${phrase}`);
}

assertIncludes(files.astrologyIndex, "export * from './vedicIntelligenceContract';", 'astrology package exports Vedic contract');

for (const [name, source] of [
  ['web Vedic section', files.webPanel + files.webVedicPage],
  ['mobile Vedic surface', files.mobilePanel + files.mobileCharts],
  ['PDF report', files.pdf],
]) {
  assertIncludes(source, 'composeVedicIntelligenceContract', `${name} imports/uses shared contract`);
}

for (const phrase of [
  'Shared Vedic intelligence contract',
  'Moon/Chandra Lagna second',
  'reports, and PDFs consume',
]) {
  assertIncludes(files.webPanel + files.mobilePanel, phrase, `user-facing Vedic surfaces include ${phrase}`);
}

for (const phrase of [
  'buildVedicIntelligencePackagingSections',
  'Vedic snapshot',
  'Moon Chart / Chandra Lagna Chart',
  'Mahadasha Phala and Meaning',
  'Past Mahadashas are summarized at Mahadasha level only',
  'mahadasha.pratyantardashaCaution',
]) {
  assertIncludes(files.pdf, phrase, `PDF consumes contract with ${phrase}`);
}

assert.ok(
  !files.contract.includes('KP Predicta') && !files.contract.includes('Nadi Predicta'),
  'Vedic intelligence contract stays Parashari/Vedic and does not mix KP/Nadi room logic',
);

console.log('Report/PDF Phase 2 passed: shared Vedic intelligence contract is wired across web, mobile, and PDF.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
