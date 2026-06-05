import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY';
const auditDir = `docs/audits/${phaseName}`;
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  assert(!source.includes(needle), `${label} must not include ${needle}`);
}

function sliceBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  if (start === -1) {
    return '';
  }

  const end = source.indexOf(endNeedle, start + startNeedle.length);
  return source.slice(start, end === -1 ? source.length : end);
}

[
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'packages/config/src/predictaMemory.ts',
  'packages/types/src/astrology.ts',
  'apps/mobile/src/types/astrology.ts',
  'packages/ai/src/contextBuilder.ts',
  'apps/mobile/src/services/ai/contextBuilder.ts',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  `${auditDir}/predicta-memory-chat-report-mastery-audit.md`,
  `${auditDir}/phase-11-predicta-memory-chat-report-mastery-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Extend Predicta memory with the final report architecture',
  'Generated report context must carry',
  'Predicta must answer report questions in this order',
  'prediction/meaning first',
  'school-specific evidence second',
  'practical next step third',
  'Life Atlas is the only approved all-school synthesis lane',
  'test:report-final-phase-11',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 11'));

const memory = read('packages/config/src/predictaMemory.ts');
[
  'PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY',
  'PREDICTA_FINAL_REPORT_LANE_MASTERY',
  'compactPreviewRule',
  'competitorResponseRule',
  'depthRule',
  'responseRule',
  'schoolBoundaryRule',
  'Personal opening',
  'Method-specific evidence',
  'Prediction chapters',
  'Timing or current relevance',
  'Action plan',
  'Appendix and proof',
  'prediction and meaning first',
  'answer what it means for the user',
  'Generated report context carries architecture stages',
  'Generated report context carries the competitor-response report rule',
  'What does this report mean for me?',
  'Give me the prediction first',
  'Explain my KP verdict and timing readiness',
  'Explain my Jaimini soul role',
  'Explain my Numerology current cycle',
  'Explain my Signature trait map',
  'Explain my Life Atlas hidden thread',
  'buildFinalReportMemoryMastery',
].forEach(fragment => assertIncludes(memory, fragment, 'Predicta memory source'));

const laneMastery = sliceBetween(
  memory,
  'export const PREDICTA_FINAL_REPORT_LANE_MASTERY',
  'export const PREDICTA_APP_MEMORY_DIGEST',
);
['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS', 'SYNTHESIS'].forEach(
  lane => assertIncludes(laneMastery, `${lane}:`, 'final report lane mastery'),
);
assertNotIncludes(laneMastery, 'NADI:', 'final report lane mastery');

const sectionCatalog = sliceBetween(
  memory,
  'export const PREDICTA_REPORT_SECTION_MEMORY_CATALOG',
  'export function buildGeneratedReportMemoryContext',
);
[
  "schoolLane: 'VEDIC'",
  "schoolLane: 'KP'",
  "schoolLane: 'JAIMINI'",
  "schoolLane: 'NUMEROLOGY'",
  "schoolLane: 'SIGNATURE'",
  "schoolLane: 'SYNTHESIS'",
  'kp-verdict-timing-readiness',
  'kp-proof-path',
  'jaimini-soul-role',
  'jaimini-arudha-upapada',
  'numerology-number-signature',
  'numerology-name-rhythm',
  'signature-trait-map',
  'signature-privacy-boundary',
  'life-atlas-hidden-thread',
  'life-atlas-evidence-appendix',
].forEach(fragment => assertIncludes(sectionCatalog, fragment, 'report section memory catalog'));

const generatedBuilder = sliceBetween(
  memory,
  'export function buildGeneratedReportMemoryContext',
  'export function findPredictaReportSectionMemory',
);
[
  'architectureStages: [...PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.stages]',
  'chatMasteryRule: mastery.chatMasteryRule',
  'compactPreviewRule:',
  'competitorResponseRule:',
  'depthContract: mastery.depthContract',
  'freePaidDepthRule: PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.depthRule',
  'schoolBoundaryRule: mastery.schoolBoundaryRule',
  'selectedSections',
  'availableSections',
].forEach(fragment => assertIncludes(generatedBuilder, fragment, 'generated report context builder'));

for (const file of ['packages/types/src/astrology.ts', 'apps/mobile/src/types/astrology.ts']) {
  const source = read(file);
  [
    'architectureStages?: string[]',
    'chatMasteryRule?: string',
    'compactPreviewRule?: string',
    'competitorResponseRule?: string',
    'depthContract?: string',
    'freePaidDepthRule?: string',
    'schoolBoundaryRule?: string',
  ].forEach(fragment => assertIncludes(source, fragment, `${file} GeneratedReportContext`));
}

for (const file of ['packages/ai/src/contextBuilder.ts', 'apps/mobile/src/services/ai/contextBuilder.ts']) {
  const source = read(file);
  [
    'PREDICTA_APP_MEMORY_DIGEST',
    'buildGeneratedReportMemoryContext',
    'findPredictaReportSectionMemory',
    'appMemoryDigest: PREDICTA_APP_MEMORY_DIGEST',
    'generatedReportContext',
    'reportSectionMemory',
    'reportFocus: chartContext.reportFocus',
    'availableSections: chartContext.reportAvailableSections ?? []',
  ].forEach(fragment => assertIncludes(source, fragment, `${file} AI report memory context`));
}

for (const file of ['apps/web/components/WebDossierPreview.tsx', 'apps/mobile/src/screens/ReportScreen.tsx']) {
  const source = read(file);
  [
    'buildGeneratedReportMemoryContext',
    'availableSections',
    'selectedSections',
    'reportFocus',
    'schoolLane',
    'subjectName',
  ].forEach(fragment => assertIncludes(source, fragment, `${file} report handoff`));
}

const audit = read(`${auditDir}/predicta-memory-chat-report-mastery-audit.md`);
[
  'GREEN after source-contract audit',
  'prediction and meaning first',
  'school-specific evidence second',
  'practical next step third',
  'generatedReportContext',
  'reportSectionMemory',
  'Nadi remains excluded from final report mastery',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 11 audit'));

const manifest = readJson(`${auditDir}/phase-11-predicta-memory-chat-report-mastery-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
[
  'architectureStages',
  'availableSections',
  'selectedSections',
  'mode',
  'reportFocus',
  'schoolLane',
  'compactPreviewRule',
  'competitorResponseRule',
  'depthContract',
  'freePaidDepthRule',
  'schoolBoundaryRule',
  'chatMasteryRule',
].forEach(field =>
  assert(manifest.generatedReportContextFields?.includes(field), `manifest missing generated report field ${field}`),
);
['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'].forEach(lane =>
  assert(manifest.finalReportLanes?.includes(lane), `manifest missing final report lane ${lane}`),
);
assert(!manifest.finalReportLanes?.includes('NADI'), 'manifest must not include NADI final report lane');
[
  'Prediction and meaning first.',
  'School-specific evidence second.',
  'Practical next step third.',
  'Safety and limits last.',
  'Compact previews are not full report walls.',
  'Competitor-response report standard is active.',
  'Life Atlas is the only approved all-school synthesis lane.',
  'Nadi is not an active final report lane.',
].forEach(rule => assert(manifest.strictRules?.includes(rule), `manifest missing strict rule ${rule}`));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
