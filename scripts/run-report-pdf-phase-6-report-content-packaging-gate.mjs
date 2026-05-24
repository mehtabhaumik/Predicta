import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertFileExists(file, label) {
  await access(path.join(repoRoot, file));
  assert.ok(true, label);
}

const files = {
  packageJson: await readWorkspaceFile('package.json'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  phaseContract: await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md'),
};

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES',
  'Free/basic Mahadasha Phala and Meaning must include',
  'Premium/paid Mahadasha Phala and Meaning must include',
  'Tables must be readable',
]) {
  assertIncludes(files.phaseContract, phrase, `Phase 6 contract locks ${phrase}`);
}

for (const phrase of [
  '"test:report-pdf-phase-6": "node scripts/run-report-pdf-phase-6-report-content-packaging-gate.mjs"',
]) {
  assertIncludes(files.packageJson, phrase, `package script exposes ${phrase}`);
}

for (const phrase of [
  'buildVedicIntelligencePackagingSections',
  'composeVedicIntelligenceContract({',
  'depth: mode ===',
  'buildVedicSnapshotReportSection',
  'buildMoonChartReportSection',
  'buildMahadashaPhalaReportSection',
  'buildHouseWisePlanetTableSections',
  'buildFriendshipTableSections',
  'buildBeneficMaleficReportSection',
  'buildChalitTableReportSections',
  'buildClassicalVedicReportSection',
]) {
  assertIncludes(files.pdf, phrase, `PDF packaging includes ${phrase}`);
}

for (const title of [
  'Vedic snapshot',
  'Moon Chart / Chandra Lagna Chart',
  'Mahadasha Phala and Meaning',
  'Planet friendship table',
  'Benefics and malefics',
  'House-wise planet table',
  'Chalit table',
  'Panchang',
  'Samsa',
  'Ghatak and favorable factors',
  'Karakamsha',
  'Ashtakavarga',
  'Prastarashtakavarga',
  'Avakhada chakra',
]) {
  assertIncludes(files.pdf, title, `PDF content packaging renders required section title: ${title}`);
}

for (const phrase of [
  'currentEntireMahadasha',
  'currentMahadashaAntardasha',
  'currentMahadashaAntardashaPratyantardasha',
  'pastMahadashas',
  'Past Mahadashas are summarized at Mahadasha level only',
  'they do not expand into Antardasha or Pratyantardasha drill-down',
  'Pratyantardasha to one careful paragraph',
  'Pratyantardasha practical and concise',
]) {
  assertIncludes(files.pdf, phrase, `Mahadasha packaging enforces ${phrase}`);
}

for (const phrase of [
  'chunkArray(rows, 4)',
  'continued',
  'Continuation of the same house-wise planet table',
  'Continuation of the planet friendship table',
  'Continuation of the Chalit table',
  'evidenceTable: chunk.map',
]) {
  assertIncludes(files.pdf, phrase, `table readability uses row-block/card packaging: ${phrase}`);
}

for (const phrase of [
  'Chart order remains fixed: Lagna/Rashi D1 first, Moon/Chandra Lagna second, Navamsa D9 third, then other vargas.',
  'Free includes the useful meaning and honest calculation boundary without turning this into a technical wall.',
  'Predicta shows the boundary instead of inventing unsupported detail.',
]) {
  assertIncludes(files.pdf, phrase, `plain-language/non-dump rule includes ${phrase}`);
}

for (const artifact of [
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES/verification.txt',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES/free-en.pdf',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES/premium-en.pdf',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES/free-hi.pdf',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES/free-gu.pdf',
]) {
  await assertFileExists(artifact, `Phase 6 audit artifact exists: ${artifact}`);
}

console.log('Report/PDF Phase 6 passed: Vedic intelligence is packaged into readable report sections and artifact-audited.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
