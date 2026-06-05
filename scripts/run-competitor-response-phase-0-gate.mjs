import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_COMPETITOR_RESPONSE_PHASE_0_BENCHMARK_REDLINE_AND_POSITION_LOCK';
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

function assertIncludes(source, fragment, label) {
  assert(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

[
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
  `${auditDir}/competitor-benchmark.md`,
  `${auditDir}/phase-0-manifest.json`,
  `${auditDir}/verification.txt`,
].forEach(file => assert(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md');
[
  phaseName,
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_1_BRAND_PROMISE_COPY_AND_NAVIGATION_ALIGNMENT',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_2_SPECIALIST_WORLD_CLARITY_AND_NO_MIXING_GATE',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_3_PREDICTA_INTELLIGENCE_CONTEXT_AND_LOCAL_MEMORY_SUPREMACY',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_4_APP_SURFACE_PREDICTION_FIRST_UX_REBUILD',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_5_REPORT_PREVIEW_AND_CTA_VALUE_ALIGNMENT',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_6_FREE_VS_PAID_VALUE_AND_COST_CONTROL_ALIGNMENT',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_7_REPORT_CONTRACT_UPGRADE_AGAINST_COMPETITORS',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_8_RERUN_ALL_REPORT_FINAL_PHASES',
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_9_GOLDEN_ARTIFACT_COMPETITOR_NO_GO_REAUDIT',
  'premium evidence-backed astrology intelligence app',
  'not fear, fluff, or per-minute astrologer pressure',
].forEach(fragment => assertIncludes(roadmap, fragment, 'competitor response roadmap'));

const audit = read(`${auditDir}/competitor-benchmark.md`);
[
  'Status: GREEN',
  'Locked Market Position',
  'AskSoma compare',
  'AskSoma about',
  'AskSoma free apps comparison',
  'YastroTalk',
  'YastroTalk pricing',
  'Nebula about',
  'Nebula app mobile',
  'Predicta Current Redline Ledger',
  'Updated Positioning Statements',
  'Exact Areas To Update In Future Phases',
  'Banned Behaviors For Later Phases',
  'Defect To Future Phase Map',
  'No product copy, app UI, Predicta intelligence, report renderer, or report',
].forEach(fragment => assertIncludes(audit, fragment, 'phase 0 audit'));

[
  'generic report language',
  'toolkit/schooling language',
  'engine-heavy overwhelm',
  'psychic confusion',
  'weak free value',
  'paid depth that only adds pages',
  'missing Predicta memory/context',
].forEach(fragment => assertIncludes(audit, fragment, 'redline coverage'));

[
  'apps/web/app/dashboard/report/page.tsx',
  'packages/astrology/src/predictaChatActions.ts',
  'packages/pdf/src/*ReportValueContract.ts',
  'packages/config/src/translations/monetization.json',
].forEach(fragment => assertIncludes(audit, fragment, 'exact update target'));

assertNotIncludes(audit, '| Nadi |', 'phase 0 active lane table');
assertNotIncludes(audit, 'Nadi report lane', 'phase 0 active report lane');

const manifest = readJson(`${auditDir}/phase-0-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.implementationChanged === false, 'Phase 0 must be audit-only');
assert(manifest.sourceBacked === true, 'manifest must be source-backed');
assert(
  manifest.lockedMarketPosition ===
    'Predicta is the premium evidence-backed astrology intelligence app for people who want real guidance, not fear, fluff, or per-minute astrologer pressure.',
  'locked market position mismatch',
);

['AskSoma', 'YastroTalk', 'Nebula'].forEach(competitor =>
  assert(manifest.competitors?.includes(competitor), `manifest missing competitor ${competitor}`),
);

[
  'https://asksoma.ai/compare/',
  'https://asksoma.ai/about',
  'https://asksoma.ai/compare/best/best-free-astrology-apps.html',
  'https://yastrotalk.com/',
  'https://www.yastrotalk.com/pricing',
  'https://www.asknebula.com/about-us',
  'https://www.asknebula.com/nebula-app-mobile',
].forEach(url => assert(manifest.sourceUrls?.includes(url), `manifest missing source URL ${url}`));

[
  'prediction-first user guidance',
  'emotionally clear mentor tone',
  'visible but calm deterministic evidence',
  'specialist-world separation',
  'free deterministic value with paid depth',
  'local-memory-first Predicta intelligence',
  'no fear, fluff, psychic confusion, or per-minute pressure',
].forEach(standard =>
  assert(manifest.adoptedStandards?.includes(standard), `manifest missing adopted standard ${standard}`),
);

[
  'psychic marketplace framing',
  'engine-heavy overwhelm',
  'generic report language',
  'toolkit or astrology lesson tone',
  'uncontrolled unlimited AI promises',
  'active Nadi report lane',
  'paid depth that only adds pages',
].forEach(pattern =>
  assert(manifest.rejectedPatterns?.includes(pattern), `manifest missing rejected pattern ${pattern}`),
);

[
  'sourceBackedBenchmarkExists',
  'lockedPositioningPresent',
  'exactAppReportIntelligenceTargetsNamed',
  'redlineLedgerExists',
  'noImplementationChangesBeyondAuditArtifactsAndGate',
  'phaseGatePasses',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`));

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  '"test:competitor-response-phase-0": "node scripts/run-competitor-response-phase-0-gate.mjs"',
  'package script',
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: competitor benchmark, locked positioning, redline ledger, exact update targets, and audit-only scope are green.`,
);
