import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_0_ASTROLOKAL_BENCHMARK_AND_PRIMARY_PREDICTA_SCOPE_LOCK';
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
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assert(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  `${auditDir}/astrolokal-benchmark.md`,
  `${auditDir}/primary-predicta-scope-ledger.md`,
  `${auditDir}/event-prediction-gap-ledger.md`,
  `${auditDir}/roadmap-conflict-ledger.md`,
  `${auditDir}/phase-0-manifest.json`,
  `${auditDir}/verification.txt`,
].forEach(file => assert(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'PREDICTA_EVENT_ORACLE_PHASE_1_ONE_PRIMARY_PREDICTA_PRODUCT_TAXONOMY_AND_NAVIGATION',
  'PREDICTA_EVENT_ORACLE_PHASE_2_EVENT_QUESTION_TAXONOMY_AND_REFINEMENT_ENGINE',
  'PREDICTA_EVENT_ORACLE_PHASE_3_MULTI_SCHOOL_EVIDENCE_CONTRACT_AND_CONFLICT_SCHEMA',
  'PREDICTA_EVENT_ORACLE_PHASE_4_PRECISION_TIMING_TRIGGER_AND_CONFIDENCE_ENGINE',
  'PREDICTA_EVENT_ORACLE_PHASE_5_MAIN_PREDICTA_CHAT_HERO_EXPERIENCE',
  'PREDICTA_EVENT_ORACLE_PHASE_6_SPECIALIST_WORLD_EVIDENCE_ROOM_HANDOFFS',
  'PREDICTA_EVENT_ORACLE_PHASE_7_PREDICTION_FIRST_LANGUAGE_AND_NO_SCHOOLING_GATE',
  'PREDICTA_EVENT_ORACLE_PHASE_8_PRECISION_READING_MONETIZATION_AND_ENTITLEMENTS',
  'PREDICTA_EVENT_ORACLE_PHASE_9_OPTIONAL_HUMAN_ASTROLOGER_REVIEW_SYSTEM',
  'PREDICTA_EVENT_ORACLE_PHASE_10_PREDICTION_TRACKER_OUTCOME_LEDGER_AND_TRUST_LOOP',
  'PREDICTA_EVENT_ORACLE_PHASE_11_REPORT_AND_LIFE_ATLAS_ALIGNMENT',
  'PREDICTA_EVENT_ORACLE_PHASE_12_LOCALIZATION_ACCESSIBILITY_AND_SAFETY_COPY',
  'PREDICTA_EVENT_ORACLE_PHASE_13_GOLDEN_ARTIFACT_LIVE_SMOKE_AND_NO_GO_AUDIT',
  'Predicta is the primary intelligence layer',
  'Specialist worlds remain available',
  'Do not silently mix schools',
  'Every event answer must include',
  'Do not claim `100% guarantee`',
  'If local deterministic memory can answer, Predicta must avoid AI usage',
].forEach(fragment => assertIncludes(roadmap, fragment, 'roadmap'));

const benchmark = read(`${auditDir}/astrolokal-benchmark.md`);
[
  'Status: GREEN',
  'AstroLokal Benchmark Matrix',
  'Unverified Anecdote Handling',
  'AstroLokal Strengths Predicta Must Beat',
  'AstroLokal Weaknesses Predicta Must Exploit Ethically',
  'Predicta Locked Response',
  'No app UI, runtime Predicta intelligence, report renderer, monetization behavior',
  'https://www.astrolokal.com/',
  'https://play.google.com/store/apps/details?id=com.astrolokal.astrology',
  'https://apps.apple.com/us/app/astrolokal/id6744983158',
  'https://apps.apple.com/in/app/astrolokal/id6744983158?platform=iphone&see-all=reviews',
].forEach(fragment => assertIncludes(benchmark, fragment, 'benchmark'));

const scope = read(`${auditDir}/primary-predicta-scope-ledger.md`);
[
  'Predicta is the primary intelligence layer and focal point of the app.',
  '`Vedic`',
  '`KP`',
  '`Jaimini`',
  '`Numerology`',
  '`Signature`',
  '`Kundli Karma`',
  '`Life Atlas`',
  'Current Repo Baseline',
  'apps/web/app/dashboard/page.tsx',
  'apps/web/components/WebHeader.tsx',
  'apps/web/components/WebPridictaChat.tsx',
  'No active product lane may be renamed in Phase 0',
].forEach(fragment => assertIncludes(scope, fragment, 'scope ledger'));

const gaps = read(`${auditDir}/event-prediction-gap-ledger.md`);
[
  'Required Event Categories',
  'career move',
  'foreign travel',
  'visa / PR',
  'marriage timing',
  'court/litigation',
  '`directAnswer`',
  '`timingWindow`',
  '`mostLikelyTrigger`',
  '`collapsedEvidence`',
  'Free Event Oracle preview',
  'Paid Precision Reading',
].forEach(fragment => assertIncludes(gaps, fragment, 'event gap ledger'));

const conflicts = read(`${auditDir}/roadmap-conflict-ledger.md`);
[
  'PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
  'PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md',
  'PREDICTA_AI_MODEL_ORCHESTRATION_ULTRA_STRICT_PHASES.md',
  'PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md',
  'PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md',
  'PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md',
  'No active specialist world may be removed in Phase 0',
].forEach(fragment => assertIncludes(conflicts, fragment, 'roadmap conflict ledger'));

const manifest = readJson(`${auditDir}/phase-0-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest status must be GREEN');
assert(manifest.implementationChanged === false, 'Phase 0 must be audit/scope only');
assert(manifest.sourceBacked === true, 'manifest must be source backed');
assertIncludes(manifest.lockedProductCenter ?? '', 'primary intelligence layer', 'manifest locked product center');
assertIncludes(manifest.lockedPrecisionProduct ?? '', 'Predicta Precision Reading', 'manifest locked precision product');
assert(manifest.benchmarkedCompetitor === 'AstroLokal', 'manifest competitor mismatch');

[
  'https://www.astrolokal.com/',
  'https://play.google.com/store/apps/details?id=com.astrolokal.astrology',
  'https://apps.apple.com/us/app/astrolokal/id6744983158',
  'https://apps.apple.com/in/app/astrolokal/id6744983158?platform=iphone&see-all=reviews',
].forEach(url => assert(manifest.sourceUrls?.includes(url), `manifest missing source URL ${url}`));

[
  'one primary Predicta intelligence layer',
  'specialist worlds as evidence rooms',
  'event-question-first user flow',
  'direct answer before evidence',
  'timing window and likely trigger where evidence supports it',
  'optional human astrologer review after deterministic Predicta draft',
  'saved transcript and prediction tracker',
  'no per-minute pressure',
  'local-memory-first before AI',
].forEach(standard =>
  assert(manifest.adoptedStandards?.includes(standard), `manifest missing adopted standard ${standard}`),
);

[
  'sidekick chat',
  'five disconnected Predicta chats',
  'silent school mixing',
  'toolkit or astrology lesson tone',
  '100% guarantee claims',
  'unsupported exact dates',
  'fear-selling remedies',
  'human astrologer freestyle without deterministic evidence',
  'uncontrolled AI usage',
  'active Nadi evidence world',
].forEach(pattern =>
  assert(manifest.rejectedPatterns?.includes(pattern), `manifest missing rejected pattern ${pattern}`),
);

[
  'astrolokalBenchmarkExists',
  'primaryPredictaScopeLocked',
  'eventPredictionGapLedgerExists',
  'roadmapConflictLedgerExists',
  'noImplementationChangesBeyondRoadmapArtifactsAndGate',
  'phaseGatePasses',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`));

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  '"test:event-oracle-phase-0": "node scripts/run-event-oracle-phase-0-gate.mjs"',
  'package script',
);

assertNotIncludes(roadmap, 'Nadi`: active', 'roadmap active Nadi');
assertNotIncludes(scope, '`Nadi`:', 'scope active Nadi');

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: AstroLokal benchmark, primary Predicta scope, event prediction redlines, roadmap conflict ledger, and audit-only baseline are green.`,
);

