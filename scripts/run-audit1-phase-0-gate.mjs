import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-0-evidence-lock');
const phaseName = 'PREDICTA_AUDIT_1_PHASE_0_EVIDENCE_LOCK_AND_AUDIT_SERVER_TRUTH';

const requiredFiles = [
  'docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md',
  `${auditRoot}/README.md`,
  `${auditRoot}/audit-server-contract.json`,
  `${auditRoot}/route-list.json`,
  `${phaseRoot}/phase-0-evidence-manifest.json`,
  `${phaseRoot}/logs/canonical-3009-audit-server-preflight.log`,
  `${phaseRoot}/logs/observed-3016-audit-server-preflight.log`,
  `${phaseRoot}/logs/observed-3016-ui-text-overflow.log`,
  `${phaseRoot}/logs/observed-3016-visual-proof.log`,
  `${phaseRoot}/logs/observed-3016-buyer-rejection.log`,
  'scripts/lib/predicta-audit-page-readiness.mjs',
];

for (const file of requiredFiles) {
  assert.ok(existsSync(file), `Phase 0 artifact missing: ${file}`);
}

const roadmap = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
assert.match(roadmap, new RegExp(phaseName), 'Audit 1 roadmap must preserve Phase 0 name');
assert.match(roadmap, /canonical audit base URL is documented/i, 'Phase 0 green criteria must document canonical URL');
assert.match(roadmap, /route-specific selectors/i, 'Phase 0 green criteria must require route-specific selectors');

const contract = JSON.parse(read(`${auditRoot}/audit-server-contract.json`));
assert.equal(contract.canonicalBaseUrl, 'http://127.0.0.1:3009', 'Canonical audit server must be 3009');
assert.equal(contract.observedBrokenBaseUrl, 'http://127.0.0.1:3016', 'Observed broken server must be locked');
assert.ok(contract.disallowedBaseUrls.includes('http://localhost:3000'), 'localhost:3000 must be explicitly disallowed');

const routeList = JSON.parse(read(`${auditRoot}/route-list.json`));
assert.ok(routeList.publicRoutes.includes('/'), 'Route list must include landing');
assert.ok(routeList.dashboardRoutes.includes('/dashboard/kp'), 'Route list must include KP');
assert.ok(routeList.dashboardRoutes.includes('/dashboard/account'), 'Route list must include account');
assert.ok(routeList.dashboardRoutes.includes('/dashboard/report'), 'Route list must include report');

const manifest = JSON.parse(read(`${phaseRoot}/phase-0-evidence-manifest.json`));
assert.equal(manifest.phase, phaseName, 'Manifest must name Phase 0');
assert.equal(manifest.canonicalBaseUrl, contract.canonicalBaseUrl, 'Manifest canonical URL must match contract');
assert.equal(manifest.observedBaseUrl, contract.observedBrokenBaseUrl, 'Manifest observed URL must match contract');
assert.equal(manifest.results.length, 5, 'Manifest must contain all five evidence commands');

for (const result of manifest.results) {
  assert.ok(result.log && existsSync(result.log), `Manifest log missing for ${result.name}`);
  const log = read(result.log);
  assert.match(log, /exitStatus:/, `${result.name} log must preserve exit status`);
  assert.match(log, /--- stdout ---/, `${result.name} log must preserve stdout`);
  assert.match(log, /--- stderr ---/, `${result.name} log must preserve stderr`);
}

const readinessHelper = read('scripts/lib/predicta-audit-page-readiness.mjs');
assert.match(readinessHelper, /fetch\(location\.href/, 'Readiness helper must validate browser-route HTTP status');
assert.match(readinessHelper, /Application error: a client-side exception has occurred/, 'Readiness helper must reject client errors');
assert.match(readinessHelper, /routeExpectations/, 'Readiness helper must use route-specific expectations');
assert.match(readinessHelper, /loadedStyleSheets/, 'Readiness helper must reject missing styled assets');
assert.match(readinessHelper, /nextScripts/, 'Readiness helper must reject missing Next assets');

const overflowGate = read('scripts/run-ui-text-overflow-audit.mjs');
const visualGate = read('scripts/run-mobile-tablet-visual-proof-gate.mjs');
const buyerGate = read('scripts/run-end-to-end-buyer-rejection-test.mjs');

for (const [label, source] of [
  ['UI text overflow audit', overflowGate],
  ['visual proof gate', visualGate],
  ['buyer rejection gate', buyerGate],
]) {
  assert.match(source, /assertAuditablePredictaPage/, `${label} must refuse unauditable pages before measuring`);
}

const pkg = JSON.parse(read('package.json'));
assert.equal(pkg.scripts['audit1:phase0:evidence'], 'node scripts/run-audit1-phase-0-evidence-lock.mjs');
assert.equal(pkg.scripts['test:audit1-phase-0'], 'node scripts/run-audit1-phase-0-gate.mjs');

console.log(`${phaseName} gate passed: evidence, server contract, route list, and page readiness guards are locked.`);

function read(file) {
  return readFileSync(file, 'utf8');
}
