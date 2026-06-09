import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT';
const auditRoot = `docs/audits/${phaseName}`;

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
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
for (const fragment of [
  phaseName,
  'Align all school reports around the same value standard without mixing schools.',
  'Vedic: classical Kundli report with charts, dasha, Panchang, tables',
  'KP: event-answer report with verdict, timing, confidence, and proof appendix.',
  'Jaimini: destiny report with Atmakaraka, Karakamsha, Arudha, Upapada',
  'Numerology: number identity dossier with mandala, name rhythm, personal',
  'Signature: reflective expression report from confirmed visible traits only',
  'Life Atlas remains the only approved all-school synthesis report.',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 8 doc includes ${fragment}`);
}

const packageJson = readWorkspaceFile('package.json');
assertIncludes(
  packageJson,
  '"test:kundli-value-phase-8": "node scripts/run-kundli-value-phase-8-gate.mjs"',
  'package exposes Phase 8 gate',
);

const webReport = readWorkspaceFile('apps/web/components/WebDossierPreview.tsx');
for (const fragment of [
  'title: \'Vedic Reports\'',
  'title: \'KP Reports\'',
  'title: \'Jaimini Reports\'',
  'title: \'Numerology Reports\'',
  'title: \'Signature Reports\'',
  'title: \'Synthesis Reports\'',
  'Predicta Life Atlas is the only approved all-school synthesis report',
  'KP, Jaimini, Numerology, and Signature stay outside this lane.',
  'without accidentally buying a mixed bag',
  'Signature is optional enrichment only',
]) {
  assertIncludes(webReport, fragment, `web report marketplace includes ${fragment}`);
}

const mobileReport = readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx');
for (const fragment of [
  'SYNTHESIS REPORTS',
  'Predicta Life Atlas',
  'This is the only all-school synthesis report.',
  'SCHOOL-SPECIFIC REPORTS',
  'Vedic, KP, Jaimini, Numerology, and Signature stay in their own lanes.',
  'mapReportLaneToPredictaSchool(selectedReport.school)',
  'reportFocus: selectedReport.id',
]) {
  assertIncludes(mobileReport, fragment, `mobile report marketplace includes ${fragment}`);
}

const pricing = readWorkspaceFile('packages/config/src/pricing.ts');
for (const fragment of [
  "school: 'VEDIC'",
  "school: 'KP'",
  "school: 'JAIMINI'",
  "school: 'NUMEROLOGY'",
  "school: 'SIGNATURE'",
  "school: 'SYNTHESIS'",
  "id: 'LIFE_ATLAS'",
]) {
  assertIncludes(pricing, fragment, `pricing/report product catalog includes ${fragment}`);
}

const pdf = readWorkspaceFile('packages/pdf/src/index.ts');
for (const fragment of [
  'function buildRoomSpecificReportSections',
  "case 'KP':\n      return buildKpReportSections(kundli, mode)",
  "case 'JAIMINI':\n      return buildJaiminiReportSections(kundli, mode)",
  "case 'NUMEROLOGY':\n      return buildNumerologyReportSections(kundli, mode)",
  "case 'SIGNATURE':",
  'buildSignatureReportSections(signatureAnalysis, mode)',
  "case 'LIFE_ATLAS':\n      return buildLifeAtlasReportSections(kundli, mode, signatureAnalysis)",
  "if (reportFocus === 'KP')",
  "if (reportFocus === 'JAIMINI')",
  "if (reportFocus === 'NUMEROLOGY')",
  "if (reportFocus === 'SIGNATURE')",
  'buildEventOracleReportAlignmentSection',
  'buildVedicReportStructureSections(kundli, chartTypes, mode, language)',
  'buildMahadashaPhalaReportSection(intelligence, mode)',
  "title: 'Consolidated remedy/action plan'",
  'KP Event Verdict',
  'Jaimini Soul Compass',
  'D1/D9 Parashari chart pages are intentionally excluded from Jaimini report output',
  'Your Number Signature',
  'Numerology-only: no Parashari charts, KP event logic, Jaimini destiny evidence, or Signature traits are mixed into this report.',
  'Personal Number Mandala',
  'Name Energy Scanner',
  'Name Fit Score',
  'Missing / Repeated Number Pattern',
  'Only confirmed visible traits are used.',
  'What this can and cannot tell you',
  'Compare repeated signatures only when multiple confirmed samples are available.',
  'Predicta Life Atlas is the approved all-school synthesis report path.',
]) {
  assertIncludes(pdf, fragment, `PDF report composition includes ${fragment}`);
}

const pdfRenderer = readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
for (const fragment of [
  "const isFocusedRoom = ['JAIMINI', 'KP', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus)",
  "if (['JAIMINI', 'KP', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus))",
  'These supporting pages stay inside the selected school and keep technical detail tied to the prediction.',
  'Life Atlas is the approved synthesis path.',
]) {
  assertIncludes(pdfRenderer, fragment, `PDF renderer keeps focused/synthesis scope ${fragment}`);
}

const kpNadiGate = readWorkspaceFile('scripts/run-kp-nadi-predicta-strict-phase-gate.mjs');
const numerologyGate = readWorkspaceFile('scripts/run-numerology-predicta-strict-phase-gate.mjs');
const signatureGate = readWorkspaceFile('scripts/run-signature-predicta-ultra-strict-phase-gate.mjs');
const lifeAtlasGate = readWorkspaceFile('scripts/run-life-atlas-report-strict-contract-gate.mjs');
for (const [source, fragment, label] of [
  [kpNadiGate, 'KP Event Verdict', 'KP/Nadi report gate remains active'],
  [numerologyGate, 'Your Number Signature', 'Numerology report gate remains active'],
  [signatureGate, 'Only confirmed traits will flow to chat or reports', 'Signature report gate remains active'],
  [lifeAtlasGate, 'Predicta Life Atlas', 'Life Atlas synthesis gate remains active'],
]) {
  assertIncludes(source, fragment, label);
}

const audit = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/phase8-report-value-alignment.json`),
);
assert.equal(audit.status, 'strict-audit-green', 'audit status is strict-audit-green');
assert.deepEqual(
  audit.schoolLanes.map(lane => lane.id),
  ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE'],
  'audit records five school lanes',
);
assert.equal(audit.synthesisLane.id, 'LIFE_ATLAS', 'Life Atlas is the synthesis lane');
assert.equal(audit.synthesisLane.onlyApprovedAllSchoolSynthesis, true, 'Life Atlas only synthesis is locked');
assert.equal(audit.freeReportsUseful, true, 'audit locks useful free reports');
assert.equal(audit.premiumReportsDeeper, true, 'audit locks premium depth');
assert.equal(audit.noSilentSchoolMixing, true, 'audit locks no silent school mixing');

for (const file of [
  `${auditRoot}/artifacts/phase8-report-value-alignment.json`,
  `${auditRoot}/artifacts/source-alignment-matrix.txt`,
  `${auditRoot}/verification.txt`,
]) {
  requireFile(file, 500);
}

console.log(
  'Kundli Value Phase 8 gate passed: all school report lanes are value-aligned, separated, and Life Atlas remains the only synthesis lane.',
);
