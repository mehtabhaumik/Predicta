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
  contract: await readWorkspaceFile('packages/astrology/src/vedicIntelligenceContract.ts'),
  phaseContract: await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md'),
  phaseZeroFixture: await readWorkspaceFile(
    'docs/audits/PREDICTA_REPORT_PDF_PHASE_0_STRICT_BASELINE_AND_CONTRACT_LOCK/fixtures/bhaumik-crowded-kundli.json',
  ),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
};

const fixture = JSON.parse(files.phaseZeroFixture);

for (const phrase of [
  'COMBUSTION_ORBS',
  'getAngularSeparation',
  'isCombustPlanet',
  'buildMoonChart',
  'Moon Chart / Chandra Lagna Chart',
  '((signIndex - moonSignIndex + 12) % 12) + 1',
  '...planet',
  'house,',
]) {
  assertIncludes(files.contract, phrase, `Moon chart and house-condition module includes ${phrase}`);
}

for (const phrase of [
  'temporaryRelation',
  'compoundRelation',
  'compoundRelationships',
  'interpretation',
  'Natural, temporary, and compound relationships are calculated',
  'Classical friendship module',
]) {
  assertIncludes(files.contract + files.types, phrase, `friendship module includes ${phrase}`);
}

assert.ok(
  !files.contract.includes('temporary and compound friendship are explicitly pending Phase 3 hardening'),
  'Phase 3 removes the old temporary/compound friendship pending stub',
);

for (const phrase of [
  'buildGhatakFavorableSection',
  'buildKarakamshaSection',
  'resolveAtmakaraka',
  'buildPrastarashtakavargaSection',
  'buildAvakhadaSection',
  'calculation-limited',
  'Predicta must not invent',
  "buildPendingClassicalSection('samsa'",
]) {
  assertIncludes(files.contract, phrase, `classical module hardening includes ${phrase}`);
}

for (const phrase of [
  'pastMahadashas',
  ".filter(item => item.status === 'past')",
  'currentEntireMahadasha',
  'currentMahadashaAntardasha',
  'currentMahadashaAntardashaPratyantardasha',
  'Past Mahadashas are summarized only at Mahadasha level',
  'Pratyantardasha is a fine timing layer',
  'one careful paragraph',
]) {
  assertIncludes(files.contract, phrase, `Mahadasha Phala module includes ${phrase}`);
}

assert.doesNotMatch(
  files.contract,
  /past(?:Mahadasha)?(?:Antardasha|Pratyantardasha)/i,
  'Past Mahadashas must not introduce AD/PD drill-down fields or wording',
);

for (const phrase of [
  "Jupiter: { en: 'Jupiter', gu: 'Guru', hi: 'Brahaspati' }",
  "Mercury: { en: 'Mercury', gu: 'Budh', hi: 'Budh' }",
  "Moon: { en: 'Moon', gu: 'Chandra', hi: 'Chandra' }",
  "Sun: { en: 'Sun', gu: 'Surya', hi: 'Surya' }",
  "Mars: { en: 'Mars', gu: 'Mangal', hi: 'Mangal' }",
  "Venus: { en: 'Venus', gu: 'Shukra', hi: 'Shukra' }",
  "Saturn: { en: 'Saturn', gu: 'Shani', hi: 'Shani' }",
  "Rahu: { en: 'Rahu', gu: 'Rahu', hi: 'Rahu' }",
  "Ketu: { en: 'Ketu', gu: 'Ketu', hi: 'Ketu' }",
]) {
  assertIncludes(files.contract, phrase, `roman graha label contract includes ${phrase}`);
}

for (const phrase of [
  'Hindi roman',
  'Brahaspati',
  'Gujarati roman',
  'Budh',
]) {
  assertIncludes(files.phaseContract, phrase, `phase contract locks ${phrase}`);
}

for (const sectionId of [
  'moon-chart',
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
  'mahadasha-phala',
]) {
  assertIncludes(files.contract, sectionId, `${sectionId} is still present in the shared contract`);
}

const fixtureMoon = fixture.planets.find(planet => planet.name === 'Moon');
assert.ok(fixture.moonSign, 'real Phase 0 fixture has Moon sign for Moon chart testing');
assert.equal(fixtureMoon?.sign, fixture.moonSign, 'fixture Moon planet sign matches Kundli moonSign');
assert.ok(Array.isArray(fixture.planets) && fixture.planets.length >= 9, 'real Phase 0 fixture has core graha placements');
assert.ok(fixtureMoon, 'fixture Moon placement is available');
assert.ok(fixture.planets.every(planet => typeof planet.degree === 'number'), 'fixture planets preserve degree data');
assert.ok(fixture.planets.every(planet => typeof planet.retrograde === 'boolean'), 'fixture planets preserve retrograde status');
assert.ok(fixture.charts?.D1?.planetDistribution?.length >= 9, 'fixture D1 chart has planet distribution');
assert.ok(fixture.charts?.D9?.planetDistribution?.length >= 9, 'fixture D9 chart exists for Karakamsha testing');
assert.ok(fixture.ashtakavarga?.bav && Object.keys(fixture.ashtakavarga.bav).length > 0, 'fixture has BAV rows for Prastarashtakavarga');

console.log('Report/PDF Phase 3 passed: classical Jyotish modules are deterministic, explicit, and gated.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
