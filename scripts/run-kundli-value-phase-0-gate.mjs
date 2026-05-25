import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const auditRoot =
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_0_ASTROSAGE_BENCHMARK_AND_CURRENT_REDLINE_AUDIT';

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertExists(file, label) {
  await access(path.join(repoRoot, file));
  assert.ok(true, label);
}

const audit = await readWorkspaceFile(`${auditRoot}/phase-0-redline-audit.md`);
const manifest = JSON.parse(
  await readWorkspaceFile(`${auditRoot}/artifacts/surface-artifact-manifest.json`),
);
const coverage = JSON.parse(
  await readWorkspaceFile(`${auditRoot}/artifacts/pdf-coverage-matrix.json`),
);
const phaseDoc = await readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
const packageJson = await readWorkspaceFile('package.json');

for (const phrase of [
  'PREDICTA_KUNDLI_VALUE_PHASE_0_ASTROSAGE_BENCHMARK_AND_CURRENT_REDLINE_AUDIT',
  'Implementation status: not started',
  'AstroSage benchmark PDF',
  'Current Predicta free Vedic PDF',
  'Current Predicta premium Vedic PDF',
  'Web Vedic overview screenshots',
  'Mobile Vedic overview screenshots',
  'Charts section screenshots',
  'KP page screenshots',
  'Nadi page screenshots',
  'Generated audit artifacts',
  'Redline Findings',
  'Coverage Decision From AstroSage',
  'Reject from AstroSage',
  'Green Gate Result',
]) {
  assertIncludes(audit, phrase, `audit includes ${phrase}`);
}

for (const defect of [
  'KV0-01',
  'KV0-02',
  'KV0-03',
  'KV0-04',
  'KV0-05',
  'KV0-06',
  'KV0-07',
  'KV0-08',
  'KV0-09',
  'KV0-10',
  'KV0-11',
  'KV0-12',
  'KV0-13',
  'KV0-14',
  'KV0-15',
]) {
  assertIncludes(audit, defect, `redline defect ${defect} is documented`);
  assertIncludes(audit, 'Fix phase:', `redline defects are mapped to fix phases`);
}

for (const phase of [
  'PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK',
  'PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS',
  'PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS',
  'PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD',
  'PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE',
  'PREDICTA_KUNDLI_VALUE_PHASE_6_WEB_MOBILE_PROGRESSIVE_DISCLOSURE',
  'PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION',
  'PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT',
]) {
  assertIncludes(audit, phase, `audit maps findings to ${phase}`);
  assertIncludes(phaseDoc, phase, `phase doc still owns ${phase}`);
}

assert.equal(
  coverage.coverage.astrosage_free_benchmark.pageCount,
  56,
  'AstroSage benchmark is confirmed as 56 pages',
);
assert.ok(
  coverage.coverage.predicta_free_current.pageCount > 0,
  'current free Predicta PDF is included in coverage matrix',
);
assert.ok(
  coverage.coverage.predicta_premium_current.pageCount > 0,
  'current premium Predicta PDF is included in coverage matrix',
);

for (const term of [
  'Ghatak',
  'Friendship',
  'Shadbala',
  'Bhavabala',
  'Shodashvarga',
  'Manglik',
  'Swamsa',
]) {
  assert.ok(
    coverage.coverage.astrosage_free_benchmark.termCounts[term] > 0,
    `AstroSage benchmark term ${term} is captured`,
  );
}

for (const term of [
  'Panchang',
  'Ghatak',
  'Avakhada',
  'Moon',
  'D9',
  'D10',
  'Chalit',
  'Mahadasha',
  'Friendship',
  'Ashtakavarga',
  'Karakamsha',
]) {
  assert.ok(
    coverage.coverage.predicta_free_current.termCounts[term] > 0,
    `Predicta free current term ${term} is captured`,
  );
}

for (const artifact of [
  `${auditRoot}/artifacts/astrosage_free_benchmark-page-map.txt`,
  `${auditRoot}/artifacts/predicta_free_current-page-map.txt`,
  `${auditRoot}/artifacts/predicta_premium_current-page-map.txt`,
  `${auditRoot}/artifacts/pdf-coverage-matrix.json`,
  `${auditRoot}/artifacts/surface-artifact-manifest.json`,
]) {
  await assertExists(artifact, `${artifact} exists`);
}

assert.equal(manifest.screenshots.length, 10, 'Phase 0 includes screenshots for every affected surface group');
for (const screenshot of manifest.screenshots) {
  await assertExists(`${auditRoot}/${screenshot.artifact}`, `${screenshot.surface} screenshot exists`);
}

assertIncludes(
  packageJson,
  '"test:kundli-value-phase-0": "node scripts/run-kundli-value-phase-0-gate.mjs"',
  'package exposes Kundli Value Phase 0 gate',
);

console.log('Kundli Value Phase 0 passed: AstroSage benchmark, Predicta redline, artifacts, and phase mappings are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
