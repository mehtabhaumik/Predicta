import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const auditRoot = 'docs/audits/PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT';

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertExists(file, label) {
  await access(path.join(repoRoot, file));
  assert.ok(true, label);
}

const files = {
  aiContext: await readWorkspaceFile('packages/ai/src/contextBuilder.ts'),
  astrologyIndex: await readWorkspaceFile('packages/astrology/src/index.ts'),
  contract: await readWorkspaceFile('docs/PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md'),
  lifeAtlasModel: await readWorkspaceFile('packages/astrology/src/lifeAtlasReport.ts'),
  mobileContext: await readWorkspaceFile('apps/mobile/src/services/ai/contextBuilder.ts'),
  mobileReport: await readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx'),
  mobileTypes: await readWorkspaceFile('apps/mobile/src/types/astrology.ts'),
  packageJson: await readWorkspaceFile('package.json'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  pdfRenderer: await readWorkspaceFile('packages/pdf/src/reportDocument.tsx'),
  pricing: await readWorkspaceFile('packages/config/src/pricing.ts'),
  predictaMemory: await readWorkspaceFile('packages/config/src/predictaMemory.ts'),
  reportLabels: await readWorkspaceFile('packages/pdf/src/translations/reportLabels.json'),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
  webReport: await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
};

for (const phrase of [
  'Predicta Life Atlas',
  'the only approved report family where Predicta may combine multiple',
  'Signature analysis is optional enrichment only',
  'Signature expression layer was not included because no signature sample was provided.',
  'How Predicta Built This Reading',
  'Generated free and premium/paid PDFs are rendered to page images and visually',
]) {
  assertIncludes(files.contract, phrase, `contract locks ${phrase}`);
}

assertIncludes(
  files.packageJson,
  '"test:life-atlas-report": "node scripts/run-life-atlas-report-strict-contract-gate.mjs"',
  'package exposes Life Atlas gate',
);

for (const phrase of [
  'LifeAtlasReport',
  'LifeAtlasEvidenceLayer',
  'LifeAtlasReportSection',
  'memoryDigest',
  'how-predicta-built-this-reading',
]) {
  assertIncludes(files.types + files.mobileTypes, phrase, `shared/mobile type contract includes ${phrase}`);
}

for (const phrase of [
  'composeLifeAtlasReport',
  'LIFE_ATLAS_MISSING_SIGNATURE_NOTE',
  'Predicta Life Atlas is the approved all-school synthesis report',
  'Signature expression layer was not included because no signature sample was provided.',
  'The hidden thread becomes useful when it changes one daily decision',
  'What Is Intended For You',
  'Final Letter From Predicta',
  'does not claim Akashic Records',
  'does not guarantee events',
]) {
  assertIncludes(files.lifeAtlasModel + files.astrologyIndex, phrase, `Life Atlas model locks ${phrase}`);
}

for (const phrase of [
  "| 'LIFE_ATLAS'",
  "case 'LIFE_ATLAS':",
  'buildLifeAtlasReportSections',
  'reportFocus === \'LIFE_ATLAS\' ? [] : buildPdfHouseWisePlanetRows',
  "reportFocus === 'LIFE_ATLAS'",
  'Premium Predicta Life Atlas',
  'Free Predicta Life Atlas',
  'evidenceTable: [] satisfies PdfEvidenceRow[]',
  'How Predicta Built This Reading',
]) {
  assertIncludes(files.pdf, phrase, `PDF composition includes ${phrase}`);
}

for (const phrase of [
  "reportFocus === 'LIFE_ATLAS'",
  'Your life is not reduced to a report.',
  'Personal life map',
  'Your Life Atlas begins here',
  'How to carry this Life Atlas',
  'Personal snapshot and soul portrait',
  'Purpose and strategic abstract',
  'Premium life chapters',
  'Mirror, not cage',
]) {
  assertIncludes(files.pdfRenderer, phrase, `PDF renderer handles Life Atlas ${phrase}`);
}

for (const phrase of [
  "| 'LIFE_ATLAS'",
  "school: 'SYNTHESIS'",
  'Predicta Life Atlas',
  'Signature is optional enrichment only',
  'non-technical life story',
]) {
  assertIncludes(files.pricing, phrase, `pricing/marketplace includes ${phrase}`);
}

for (const phrase of [
  'REPORT_SYNTHESIS_LANE',
  'Synthesis Reports',
  'Predicta Life Atlas is the only approved all-school synthesis report',
  'Signature expression layer was not included because no signature sample was provided.',
  'School-separated reports',
  'Vedic Reports',
  'KP Reports',
  'Nadi Reports',
  'Numerology Reports',
  'Signature Reports',
]) {
  assertIncludes(files.webReport, phrase, `web report page separates Life Atlas: ${phrase}`);
}

for (const phrase of [
  'SYNTHESIS REPORTS',
  'SCHOOL-SPECIFIC REPORTS',
  'This is the only all-school synthesis report',
  'Missing signature does not block generation',
]) {
  assertIncludes(files.mobileReport, phrase, `mobile report page separates Life Atlas: ${phrase}`);
}

for (const phrase of [
  'PREDICTA_LIFE_ATLAS_MEMORY_CONTRACT',
  'approvedReportName',
  'Life Atlas is the flagship synthesis report',
  'Why is signature not included?',
  'What changes in Premium?',
]) {
  assertIncludes(files.predictaMemory, phrase, `Predicta memory knows Life Atlas: ${phrase}`);
}

for (const phrase of [
  'composeLifeAtlasReport',
  'lifeAtlasReport: compactLifeAtlasReport',
  'memoryDigest: atlas.memoryDigest',
  'signatureNote: atlas.signatureNote',
]) {
  assertIncludes(files.aiContext + files.mobileContext, phrase, `AI context includes Life Atlas digest: ${phrase}`);
}

for (const phrase of [
  'Opening Soul Portrait',
  'Why You Came Here',
  'The Hidden Thread',
  'How Predicta Built This Reading',
  'LIFE ATLAS',
  'LIFE ATLAS APPENDIX',
  'LIFE ATLAS TRUST',
]) {
  assertIncludes(files.reportLabels, phrase, `report labels localize ${phrase}`);
}

for (const banned of [
  'we accessed your Akashic Records',
  'this is guaranteed',
  'this will definitely happen',
  'you cannot escape this fate',
  'your signature shows this',
  'Saturn in house 6 causes this',
  'The KP cusp proves this will happen',
]) {
  assert.ok(
    !files.lifeAtlasModel.includes(banned) &&
      !files.pdf.includes(banned) &&
      !files.webReport.includes(banned) &&
      !files.mobileReport.includes(banned),
    `Life Atlas implementation avoids banned claim: ${banned}`,
  );
}

for (const artifact of [
  `${auditRoot}/artifacts/life-atlas-free.pdf`,
  `${auditRoot}/artifacts/life-atlas-premium.pdf`,
  `${auditRoot}/artifacts/life-atlas-free-payload.json`,
  `${auditRoot}/artifacts/life-atlas-premium-payload.json`,
  `${auditRoot}/screenshots/life-atlas-free-cover.png`,
  `${auditRoot}/screenshots/life-atlas-premium-cover.png`,
  `${auditRoot}/verification.txt`,
]) {
  await assertExists(artifact, `Life Atlas audit artifact exists: ${artifact}`);
}

console.log('Life Atlas strict contract gate passed: synthesis lane, PDF output, memory, web/mobile separation, optional signature handling, and artifacts are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
