import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const renderer = await readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
const composer = await readWorkspaceFile('packages/pdf/src/index.ts');
const phase = await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md');

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_4B_CELESTIAL_SEAL_COVER_SYSTEM',
  'personal celestial certificate',
  'birth moment signature',
  'Moon nakshatra and pada',
  'Lagna sign',
  'current dasha',
  'no loud rainbow gradient blocks',
]) {
  assert.match(phase, new RegExp(escapeRegExp(phrase)), `phase doc includes ${phrase}`);
}

for (const phrase of [
  'function PdfCelestialSeal',
  '<PdfCelestialSeal />',
  'Circle cx={105}',
  'Path',
  'Line',
  "stroke={gold}",
  "stroke={mutedGold}",
  'coverSealWrap',
  'coverSignaturePill',
  'coverPreparationLine',
  'coverDetailRow',
  'coverDetailLabel',
  'coverDetailValue',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `cover seal renderer includes ${phrase}`);
}

for (const phrase of [
  'report.cover.subjectName',
  'report.cover.dateOfBirth',
  'report.cover.birthTime',
  'report.cover.birthPlace',
  'report.cover.reportType',
  'report.cover.descriptor',
  'report.cover.preparationLine',
  'report.cover.birthMomentSignature.map',
]) {
  assert.match(renderer, new RegExp(escapeRegExp(phrase)), `cover layout renders ${phrase}`);
}

for (const phrase of [
  'function buildBaseCoverIdentity',
  'birthMomentSignature',
  'Moon:',
  'Lagna:',
  'Current Dasha:',
  "kundli.planets.find(planet => planet.name === 'Moon')?.pada",
  'kundli.dasha?.current?.mahadasha',
  'kundli.lagna',
  'kundli.birthDetails.name',
  'kundli.birthDetails.date',
  'kundli.birthDetails.time',
  'kundli.birthDetails.place',
  'getCoverReportFocusLabel',
]) {
  assert.match(composer, new RegExp(escapeRegExp(phrase)), `cover data contract includes ${phrase}`);
}

for (const banned of [
  'coverMetaCard',
  'coverMetaLine',
  'A polished astrology report built like a keepsake dossier',
]) {
  assert.doesNotMatch(renderer, new RegExp(escapeRegExp(banned)), `cover no longer uses old ${banned}`);
}

assert.match(renderer, /backgroundColor: PDF_PAGE_TEMPLATES\.cover\.background/, 'cover still uses dark Predicta background');
assert.match(renderer, /coverAuroraMagenta/, 'cover keeps magenta aurora');
assert.match(renderer, /coverAuroraBlue/, 'cover keeps blue aurora');
assert.match(renderer, /coverAuroraGreen/, 'cover keeps green aurora');
assert.match(renderer, /Predicta Editorial Display/, 'cover uses editorial display font path for English headings');
assert.match(renderer, /Predicta Devanagari/, 'cover preserves Hindi font registration');
assert.match(renderer, /Predicta Gujarati/, 'cover preserves Gujarati font registration');

console.log('Report PDF Phase 4B gate passed: celestial seal cover, deterministic subject identity, report type, birth details, and birth moment signature are locked.');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
