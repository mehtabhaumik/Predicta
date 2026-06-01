import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_JAIMINI_PHASE_11_QA_GATES_RELEASE_GOVERNANCE_AND_RED_TEAM';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const staleActiveNadiPattern = /\b(Nadi Predicta|Nadi Reports|Nadi report|Nadi reading|Nadi Method|palm-leaf manuscript access)\b/i;

mkdirSync(auditRoot, { recursive: true });

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function requireIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function requireNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

function requireFile(relativePath, minBytes = 1) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  assert.ok(statSync(fullPath).size >= minBytes, `${relativePath} has at least ${minBytes} bytes`);
  return fullPath;
}

const checks = [];
function pass(label) {
  checks.push(label);
}

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'release governance says KP/Jaimini boundaries, not KP/Nadi.',
  'report QA checks for Jaimini/Nadi mixing.',
  'chat red-team checks prevent Nadi leaf claims.',
  'buyer/release gates include Jaimini report artifacts.',
  'public greenlight includes Jaimini route.',
]) {
  requireIncludes(roadmap, fragment, `roadmap locks Phase 11 requirement: ${fragment}`);
  pass(`roadmap requirement present: ${fragment}`);
}

const governance = read('backend/astro_api/release_governance.py');
for (const fragment of [
  'KP and Jaimini school boundaries remain enforced.',
  'KP/Jaimini method-boundary QA detects school mixing.',
  'Jaimini',
]) {
  requireIncludes(governance, fragment, `release governance includes ${fragment}`);
  pass(`release governance includes ${fragment}`);
}
requireNotIncludes(governance, 'KP/Nadi', 'release governance no longer names KP/Nadi boundary');
requireNotIncludes(governance, 'KP and Nadi', 'release governance no longer names KP and Nadi boundary');
pass('release governance excludes stale KP/Nadi boundary language');

const reportPipeline = read('backend/astro_api/report_ai_pipeline.py');
requireIncludes(reportPipeline, '"jaimini": ReportQAPolicy()', 'report QA policies include active Jaimini');
requireIncludes(reportPipeline, '"nadi": ReportQAPolicy(),  # legacy alias only', 'report QA policies keep Nadi as legacy alias only');
pass('report QA policy has Jaimini first-class coverage and legacy alias boundary');

const safety = read('backend/astro_api/safety.py');
const redTeam = read('backend/astro_api/red_team_evals.py');
const redTeamTest = read('backend/tests/test_safety_red_team_evals.py');
for (const [source, label] of [
  [safety, 'safety output categories'],
  [redTeam, 'red-team cases'],
  [redTeamTest, 'red-team API test'],
]) {
  requireIncludes(source, 'fake-manuscript-claim', `${label} blocks unsupported manuscript authority`);
  pass(`${label} uses fake-manuscript-claim`);
}
requireIncludes(redTeam, 'jaimini-legacy-nadi-leaf-confusion', 'legacy Nadi leaf prompt is red-teamed through Jaimini');
requireIncludes(redTeamTest, 'Jaimini Predicta', 'API red-team test expects Jaimini prompt boundary');
requireIncludes(redTeamTest, '"predictaSchool": "NADI"', 'legacy NADI alias is still covered by API red-team test');
requireNotIncludes(redTeamTest, 'assert "Nadi Predicta"', 'API red-team test does not preserve Nadi Predicta prompt');
pass('legacy Nadi leaf claims are rewritten through Jaimini boundary');

const aiPrompt = read('backend/astro_api/ai.py');
for (const fragment of [
  'Legacy alias for Jaimini Predicta',
  'Never claim leaf or manuscript access.',
  'KP and Jaimini remain separate schools',
  'Jaimini Predicta reads karakas, Arudha, Upapada, Jaimini aspects, and Chara Dasha only.',
]) {
  requireIncludes(aiPrompt, fragment, `AI prompt/memory includes ${fragment}`);
  pass(`AI prompt/memory includes ${fragment}`);
}
for (const stale of [
  'KP and Nadi remain separate schools',
  'Do not mix Nadi with Parashari or KP in the same answer.',
  'Useful Nadi-style story marker',
  'Premium Nadi checks',
]) {
  requireNotIncludes(aiPrompt, stale, `AI prompt/memory excludes stale ${stale}`);
  pass(`AI prompt/memory excludes stale ${stale}`);
}

const auditServer = read('scripts/assert-predicta-audit-server-ready.mjs');
const buyer = read('scripts/run-end-to-end-buyer-rejection-test.mjs');
const visual = read('scripts/run-mobile-tablet-visual-proof-gate.mjs');
for (const [source, label] of [
  [auditServer, 'audit server preflight'],
  [buyer, 'buyer rejection gate'],
  [visual, 'mobile/tablet visual proof gate'],
]) {
  requireIncludes(source, '/dashboard/jaimini', `${label} includes Jaimini route`);
  pass(`${label} includes /dashboard/jaimini`);
}

const roomReportGate = read('scripts/run-room-report-and-pdf-rebuild.mjs');
for (const fragment of [
  "'JAIMINI'",
  'Jaimini Reports',
  'Jaimini Predicta Report',
  "case 'JAIMINI'",
  'buildJaiminiReportSections',
  'Jaimini Soul Compass',
]) {
  requireIncludes(roomReportGate, fragment, `room/report QA gate includes ${fragment}`);
  pass(`room/report QA gate includes ${fragment}`);
}
for (const stale of [
  'Nadi Reports',
  'Nadi Predicta Report',
  "case 'NADI'",
  'buildNadiReportSections',
]) {
  requireNotIncludes(roomReportGate, stale, `room/report QA gate excludes active ${stale}`);
  pass(`room/report QA gate excludes active ${stale}`);
}

const phase7Manifest = readJson(
  'docs/audits/PREDICTA_JAIMINI_PHASE_7_JAIMINI_REPORTS_FREE_AND_PREMIUM/artifact-manifest.json',
);
const phase8Manifest = readJson(
  'docs/audits/PREDICTA_JAIMINI_PHASE_8_LIFE_ATLAS_JAIMINI_EVIDENCE_LAYER/artifact-manifest.json',
);

function auditArtifacts(manifest, phaseDir, requiredIds) {
  assert.deepEqual(
    manifest.artifacts.map(item => item.id).sort(),
    [...requiredIds].sort(),
    `${phaseDir} has the exact required artifact IDs`,
  );
  pass(`${phaseDir} artifact IDs match release contract`);

  for (const artifact of manifest.artifacts) {
    requireFile(path.join(phaseDir, artifact.pdf), 1_000_000);
    requireFile(path.join(phaseDir, artifact.payload), 500);
    requireFile(path.join(phaseDir, artifact.text), 500);
    assert.ok(artifact.pageCount >= (artifact.mode === 'PREMIUM' ? 10 : 7), `${artifact.id} has substantial pages`);
    const text = read(path.join(phaseDir, artifact.text));
    requireIncludes(text, 'Jaimini', `${artifact.id} text includes Jaimini`);
    assert.doesNotMatch(text, staleActiveNadiPattern, `${artifact.id} text has no active Nadi or palm-leaf claims`);
    for (const preview of artifact.previews) {
      requireFile(path.join(phaseDir, preview), 1_000);
    }
    pass(`${artifact.id} PDF, payload, extracted text, and previews are release-audited`);
  }
}

auditArtifacts(
  phase7Manifest,
  'docs/audits/PREDICTA_JAIMINI_PHASE_7_JAIMINI_REPORTS_FREE_AND_PREMIUM',
  ['jaimini-free', 'jaimini-premium'],
);
auditArtifacts(
  phase8Manifest,
  'docs/audits/PREDICTA_JAIMINI_PHASE_8_LIFE_ATLAS_JAIMINI_EVIDENCE_LAYER',
  ['life-atlas-jaimini-free', 'life-atlas-jaimini-premium'],
);

const phase9Gate = read('scripts/run-jaimini-phase-9-marketplace-entitlement-gate.mjs');
for (const fragment of [
  "JAIMINI_REPORT: 'pridicta_jaimini_report'",
  'Jaimini Report Credit',
  'JAIMINI_REPORT',
  'hasJaiminiReportCredit',
]) {
  requireIncludes(phase9Gate, fragment, `marketplace entitlement gate includes ${fragment}`);
  pass(`marketplace entitlement gate includes ${fragment}`);
}

const publicGreenlight = read('scripts/run-public-testing-greenlight-audit.mjs');
requireIncludes(publicGreenlight, 'assertPredictaAuditServerReady', 'public greenlight uses audit-server route preflight');
pass('public greenlight uses audit-server route preflight that includes Jaimini');

writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    `checks: ${checks.length}`,
    '',
    ...checks.map(item => `- ${item}`),
    '',
  ].join('\n'),
);

console.log(`${phaseName} passed with ${checks.length} strict release governance, report QA, artifact, public route, and red-team checks.`);
