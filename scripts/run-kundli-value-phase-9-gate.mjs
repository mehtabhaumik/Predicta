import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_KUNDLI_VALUE_PHASE_9_MEMORY_PARITY_AND_GOLDEN_ARTIFACT_AUDIT';
const auditRoot = `docs/audits/${phaseName}`;
const reportGoldenRoot = 'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT';

function readWorkspaceFile(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function requireFile(relativePath, minimumBytes = 1) {
  const fullPath = path.join(root, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  const size = statSync(fullPath).size;
  assert.ok(size >= minimumBytes, `${relativePath} has at least ${minimumBytes} bytes`);
  return fullPath;
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
for (const fragment of [
  phaseName,
  'Make Predicta aware of every new chart, report section, depth rule, and school',
  'focus charts and their order',
  'full Varga library availability',
  'micro/special point exclusion from main report charts',
  'KP must not use D1 as primary chart',
  'PDF as complete dossier surface',
  'app as progressive exploration surface',
  'Predicta chat transcripts proving she can explain the new sections.',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 9 contract includes ${fragment}`);
}

const packageJson = readWorkspaceFile('package.json');
assertIncludes(
  packageJson,
  '"test:kundli-value-phase-9": "node scripts/run-kundli-value-phase-9-gate.mjs"',
  'package exposes Phase 9 Kundli value gate',
);

const predictaMemory = readWorkspaceFile('packages/config/src/predictaMemory.ts');
for (const fragment of [
  'D1, Moon/Chandra Lagna, D9, D10, Chalit',
  'full Varga library selectable with prediction-first summaries for every supported chart',
  'Swamsa and Karakamsha are first-class Vedic soul-direction chart surfaces',
  'Main Vedic report chart plates exclude micro/special points and outer planets',
  'Mahadasha Phala',
  'consolidated remedy plan',
  'PDF reports are the complete dossier surface',
  'app screens stay progressive, clean, and CTA-led',
  'KP must use Bhav Chalit/cusp-oriented evidence where a chart is needed and must not use D1 as the primary KP chart surface',
  'Nadi: story-link and validation-first interpretation',
  'Report marketplace options are school-separated',
  'Free answers remain useful and non-technical',
  'premium answers add evidence, timing, contradictions, and practical depth',
  'Explain my Swamsa chart',
  'Explain my Karakamsha chart',
  "id: 'swamsa'",
  "title: 'Swamsa'",
  "id: 'karakamsha'",
]) {
  assertIncludes(predictaMemory, fragment, `Predicta memory parity includes ${fragment}`);
}

const aiContext = readWorkspaceFile('packages/ai/src/contextBuilder.ts');
const mobileContext = readWorkspaceFile('apps/mobile/src/services/ai/contextBuilder.ts');
for (const fragment of [
  'appMemoryDigest: PREDICTA_APP_MEMORY_DIGEST',
  'reportSectionMemory',
  'findPredictaReportSectionMemory',
  'buildGeneratedReportMemoryContext',
]) {
  assertIncludes(aiContext + mobileContext, fragment, `AI context carries memory parity ${fragment}`);
}

const chatFollowUps = readWorkspaceFile('packages/astrology/src/chatFollowUps.ts');
const chatActions = readWorkspaceFile('packages/astrology/src/predictaChatActions.ts');
for (const fragment of [
  'Explain my Swamsa chart',
  'Explain my Karakamsha chart',
  'Vedic report memory includes Moon/Chandra Lagna, Swamsa, Karakamsha',
  'Reports are school-lane aware',
]) {
  assertIncludes(chatFollowUps + chatActions, fragment, `chat/report action memory includes ${fragment}`);
}

const pdfGoldenManifest = JSON.parse(
  readWorkspaceFile(`${reportGoldenRoot}/artifact-manifest.json`),
);
const requiredPdfIds = [
  'free-kundli-en',
  'premium-kundli-en',
  'kp-report-en',
  'nadi-report-en',
  'numerology-report-en',
  'signature-report-en',
];
for (const id of requiredPdfIds) {
  const manifestItem = pdfGoldenManifest.find(item => item.id === id);
  assert.ok(manifestItem, `${id} exists in golden PDF manifest`);
  assert.ok(manifestItem.bytes > 1_000_000, `${id} is a substantial golden PDF`);
  assert.ok(manifestItem.renderedPages.length === manifestItem.pages, `${id} has all pages rendered`);
  requireFile(`${reportGoldenRoot}/${manifestItem.pdf}`, 1_000_000);
  for (const renderedPage of manifestItem.renderedPages.slice(0, 3)) {
    requireFile(`${reportGoldenRoot}/${renderedPage}`, 1_000);
  }
}
requireFile(
  'docs/audits/PREDICTA_SIGNATURE_PREDICTA_ULTRA_STRICT_PHASE/artifacts/signature-missing.pdf',
  1_000_000,
);
requireFile(
  'docs/audits/PREDICTA_SIGNATURE_PREDICTA_ULTRA_STRICT_PHASE/artifacts/signature-missing-pages/signature-missing.pdf.png',
  10_000,
);

for (const screenshot of [
  'desktop-dashboard-kundli.png',
  'desktop-dashboard-charts.png',
  'desktop-dashboard-kp.png',
  'desktop-dashboard-nadi.png',
  'desktop-dashboard-numerology.png',
  'desktop-dashboard-signature.png',
  'mobile-dashboard-kundli.png',
  'mobile-dashboard-charts.png',
  'mobile-dashboard-kp.png',
  'mobile-dashboard-nadi.png',
  'mobile-dashboard-numerology.png',
  'mobile-dashboard-signature.png',
]) {
  requireFile(`${reportGoldenRoot}/screenshots/${screenshot}`, 10_000);
}

for (const verification of [
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_6_WEB_MOBILE_PROGRESSIVE_DISCLOSURE/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION/verification.txt',
  'docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT/verification.txt',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS/verification.txt',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/verification.txt',
]) {
  requireFile(verification, 500);
}

const memoryAudit = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/phase9-memory-parity-audit.json`),
);
assert.equal(memoryAudit.phase, phaseName, 'memory audit records Phase 9');
assert.equal(memoryAudit.status, 'strict-audit-green', 'memory audit is green');
assert.equal(memoryAudit.memoryParityRules.length, 14, 'all required memory parity rules are recorded');
assert.equal(memoryAudit.lifeAtlasBoundary, 'only-approved-all-school-synthesis', 'Life Atlas boundary is locked');

const artifactManifest = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/golden-artifact-coverage-manifest.json`),
);
assert.deepEqual(
  artifactManifest.requiredPdfs.map(item => item.id),
  [
    'free-vedic',
    'premium-vedic',
    'kp',
    'nadi',
    'numerology',
    'signature-confirmed',
    'signature-missing',
  ],
  'Phase 9 artifact manifest records every required PDF class',
);
assert.equal(artifactManifest.webScreenshots.length, 6, 'Phase 9 manifest records six web screenshots');
assert.equal(artifactManifest.mobileScreenshots.length, 6, 'Phase 9 manifest records six mobile screenshots');

const transcripts = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/predicta-chat-transcripts.json`),
);
assert.ok(transcripts.transcripts.length >= 8, 'chat transcript artifact covers required sections');
for (const transcript of transcripts.transcripts) {
  assert.ok(transcript.roomSafe, `${transcript.id} remains room safe`);
  assert.ok(transcript.answer.includes(transcript.mustMention), `${transcript.id} proves required answer awareness`);
}

requireFile(`${auditRoot}/artifacts/phase9-memory-parity-audit.json`, 1_000);
requireFile(`${auditRoot}/artifacts/golden-artifact-coverage-manifest.json`, 1_000);
requireFile(`${auditRoot}/artifacts/predicta-chat-transcripts.json`, 1_000);
requireFile(`${auditRoot}/verification.txt`, 1_000);

console.log(
  'Kundli Value Phase 9 gate passed: memory parity, room-safe chat awareness, golden PDFs, screenshots, and prior phase artifacts are audited.',
);
