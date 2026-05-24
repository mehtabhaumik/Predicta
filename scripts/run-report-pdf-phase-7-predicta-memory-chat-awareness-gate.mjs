import { strict as assert } from 'node:assert';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const auditRoot =
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS';

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

async function assertExists(file, label) {
  await access(path.join(repoRoot, file));
  assert.ok(true, label);
}

const files = {
  aiContext: await readWorkspaceFile('packages/ai/src/contextBuilder.ts'),
  chatActions: await readWorkspaceFile('packages/astrology/src/predictaChatActions.ts'),
  chatFollowUps: await readWorkspaceFile('packages/astrology/src/chatFollowUps.ts'),
  contract: await readWorkspaceFile('docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md'),
  mobileChat: await readWorkspaceFile('apps/mobile/src/screens/ChatScreen.tsx'),
  mobileContext: await readWorkspaceFile('apps/mobile/src/services/ai/contextBuilder.ts'),
  mobileReport: await readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx'),
  mobileTypes: await readWorkspaceFile('apps/mobile/src/types/astrology.ts'),
  packageJson: await readWorkspaceFile('package.json'),
  predictaMemory: await readWorkspaceFile('packages/config/src/predictaMemory.ts'),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
  webAutoSave: await readWorkspaceFile('apps/web/lib/web-auto-save-memory.ts'),
  webChat: await readWorkspaceFile('apps/web/components/WebPridictaChat.tsx'),
  webCta: await readWorkspaceFile('apps/web/lib/predicta-chat-cta.ts'),
  webReport: await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
};

for (const phrase of [
  'PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS',
  "Predicta's broader app memory",
  'living digest of the entire app',
  'Vedic Predicta answers from Parashari/Vedic context only',
  'Vedic Predicta can answer questions about every new',
  'chat context includes the generated report mode, report type, subject name',
]) {
  assertIncludes(files.contract, phrase, `Phase 7 contract locks ${phrase}`);
}

assertIncludes(
  files.packageJson,
  '"test:report-pdf-phase-7": "node scripts/run-report-pdf-phase-7-predicta-memory-chat-awareness-gate.mjs"',
  'package exposes Phase 7 gate',
);

for (const phrase of [
  'ReportSchoolLaneId',
  'GeneratedReportContext',
  'PredictaAppMemoryDigest',
  'PredictaReportSectionMemory',
  'reportAvailableSections',
  'reportFocus',
  'reportMode',
  'reportSchoolLane',
  'reportSubjectName',
  'generatedReportContext?: GeneratedReportContext',
  'appMemoryDigest?: PredictaAppMemoryDigest',
  'reportSectionMemory?: PredictaReportSectionMemory',
]) {
  assertIncludes(files.types + files.mobileTypes, phrase, `shared/mobile types include ${phrase}`);
}

for (const phrase of [
  'PREDICTA_APP_MEMORY_DIGEST',
  'five specialist rooms/worlds',
  'Synthesis Reports lane',
  'Predicta Life Atlas is the approved Synthesis Reports lane',
  'D1, Moon/Chandra Lagna, D9, D10, Chalit',
  'Krishnamurti KP',
  'Nadi: story-link and validation-first',
  'Numerology: name number, birth number, destiny/life-path number',
  'Signature: confirmed visible signature traits only',
  'PREDICTA_REPORT_SECTION_MEMORY_CATALOG',
  'buildGeneratedReportMemoryContext',
  'findPredictaReportSectionMemory',
]) {
  assertIncludes(files.predictaMemory, phrase, `Predicta memory digest includes ${phrase}`);
}

for (const prompt of [
  'Explain my friendship table',
  'Explain my functional benefics and malefics',
  'Explain my Chalit shifts',
  'Explain my Moon chart',
  'Explain my Mahadasha Phala',
  'Explain my current Mahadasha, Antardasha, and Pratyantardasha',
  'Explain my Avakhada chakra',
  'Explain my Ashtakavarga score',
  'Explain my Ghatak and favorable factors',
]) {
  assertIncludes(
    files.predictaMemory + files.chatFollowUps,
    prompt,
    `required report follow-up exists: ${prompt}`,
  );
}

for (const section of [
  'Moon chart / Chandra Lagna chart',
  'Mahadasha Phala and Meaning',
  'House-wise planet placement table',
  'Planet friendship table',
  'Natural and functional benefics/malefics',
  'Chalit table',
  'Panchang',
  'Samsa',
  'Ghatak and favorable factors',
  'Karakamsha',
  'Ashtakavarga',
  'Prastarashtakavarga',
  'Avakhada chakra',
]) {
  assertIncludes(files.predictaMemory, section, `section memory catalog includes ${section}`);
}

for (const phrase of [
  'appMemoryDigest: PREDICTA_APP_MEMORY_DIGEST',
  'generatedReportContext',
  'reportSectionMemory',
  'findPredictaReportSectionMemory',
  'buildGeneratedReportMemoryContext',
]) {
  assertIncludes(files.aiContext + files.mobileContext, phrase, `AI context builder includes ${phrase}`);
}

for (const phrase of [
  'reportAvailableSections',
  'reportFocus',
  'reportMode',
  'reportSchoolLane',
  'reportSectionPrompt',
  'reportSubjectName',
]) {
  assertIncludes(files.webCta, phrase, `web CTA carries ${phrase}`);
  assertIncludes(files.webChat, phrase, `web chat parses ${phrase}`);
}

assertIncludes(files.webCta, 'setListParam', 'web CTA serializes report section lists');
assertIncludes(files.webChat, 'parseListParam', 'web chat parses report section lists');

for (const phrase of [
  'buildCurrentReportMemoryContext',
  'generatedReportContext: buildCurrentReportMemoryContext',
  'buildCurrentReportAskHref',
  'mapReportLaneToPredictaSchool',
  'reportSchoolLane: product.school',
]) {
  assertIncludes(files.webReport, phrase, `web report handoff includes ${phrase}`);
}

for (const phrase of [
  'generatedReportContext?: GeneratedReportContext',
  'saveWebSpecialistPredictaContext',
  'reportSchoolLane: context.reportSchoolLane',
]) {
  assertIncludes(files.webAutoSave, phrase, `web auto-save preserves ${phrase}`);
}

for (const phrase of [
  'buildGeneratedReportMemoryContext',
  'reportAvailableSections',
  'reportFocus',
  'reportMode',
  'reportSchoolLane',
  'mapReportLaneToPredictaSchool',
]) {
  assertIncludes(files.mobileReport, phrase, `mobile report handoff includes ${phrase}`);
}

for (const phrase of [
  'formatReportContextLine',
  'Report context:',
  'formatMobileReportContextLine',
]) {
  assertIncludes(files.webChat + files.mobileChat, phrase, `chat intro includes ${phrase}`);
}

for (const phrase of [
  'Reports are school-lane aware',
  'Vedic report memory includes Moon/Chandra Lagna',
  'Free report: every included section stays useful',
  'Premium PDF bundle: the same calculation truth',
]) {
  assertIncludes(files.chatActions, phrase, `Predicta report action knows ${phrase}`);
}

await assertExists(`${auditRoot}/verification.txt`, 'Phase 7 audit verification exists');

console.log('Report/PDF Phase 7 passed: Predicta memory, chat awareness, and report handoff context are strictly wired.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
