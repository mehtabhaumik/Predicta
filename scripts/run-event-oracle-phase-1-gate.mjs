import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_1_ONE_PRIMARY_PREDICTA_PRODUCT_TAXONOMY_AND_NAVIGATION';
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
  `${auditDir}/phase-1-navigation-audit.md`,
  `${auditDir}/phase-1-manifest.json`,
  `${auditDir}/verification.txt`,
].forEach(file => assert(exists(file), `missing required file ${file}`));

const dashboardShell = read('apps/web/components/DashboardShell.tsx');
[
  "href: '/dashboard/chat'",
  "id: 'predicta'",
  'label: labels.actions.askPredicta',
  'label: labels.nav.vedicEvidence',
  'label: labels.nav.kpEvidence',
  'label: labels.nav.jaiminiEvidence',
  'label: labels.nav.numerologyEvidence',
  'label: labels.nav.signatureEvidence',
  "if (pathname === '/dashboard')",
  "if (pathname === '/dashboard/chat')",
  "section.id === 'predicta'",
  "eyebrow: getAppShellLabels('en').groups.predicta",
  "eyebrow: getAppShellLabels('hi').groups.predicta",
  "eyebrow: getAppShellLabels('gu').groups.predicta",
].forEach(fragment => assertIncludes(dashboardShell, fragment, 'DashboardShell'));

[
  "{ href: '/dashboard/vedic/chat', label: labels.nav.chat }",
  "{ href: '/dashboard/kp/chat', label: labels.nav.chat }",
  "{ href: '/dashboard/jaimini/chat', label: labels.nav.chat }",
  "{ href: '/dashboard/numerology/chat', label: labels.nav.chat }",
  "{ href: '/dashboard/signature/chat', label: labels.nav.chat }",
].forEach(fragment => assertNotIncludes(dashboardShell, fragment, 'DashboardShell disconnected specialist chat nav'));

const header = read('apps/web/components/WebHeader.tsx');
assertIncludes(header, "{ href: '/dashboard/chat', label: labels.actions.askPredicta }", 'WebHeader');

const footer = read('apps/web/components/WebFooter.tsx');
assertIncludes(footer, "{ href: '/dashboard/chat', label: 'Ask Predicta' }", 'WebFooter');
assertNotIncludes(footer, "{ href: '/dashboard/vedic/chat', label: 'Ask Vedic Predicta' }", 'WebFooter old Vedic default');

const dashboard = read('apps/web/app/dashboard/page.tsx');
[
  'primary-predicta-panel',
  'competitorCopy.primaryPredictaEyebrow',
  'competitorCopy.primaryPredictaTitle',
  'competitorCopy.primaryPredictaBody',
  'competitorCopy.primaryPredictaProof',
  'Dashboard Primary Predicta',
  "'/dashboard/chat?sourceScreen=Private+Preview",
].forEach(fragment => assertIncludes(dashboard, fragment, 'dashboard page'));
assertNotIncludes(dashboard, "'/dashboard/vedic/chat?sourceScreen=Private+Preview", 'dashboard private preview old route');

const css = read('apps/web/app/globals.css');
[
  '.primary-predicta-panel',
  '.primary-predicta-actions',
  'grid-template-columns: minmax(0, 1.35fr) auto',
  'overflow-x: clip',
  '.kundli-empty-actions',
  '.dashboard-topbar-actions .button',
].forEach(fragment => assertIncludes(css, fragment, 'globals css'));

const language = readJson('packages/config/src/translations/language.json');
for (const lang of ['en', 'hi', 'gu']) {
  const nav = language.appShellLabels?.[lang]?.nav ?? {};
  [
    'vedicEvidence',
    'kpEvidence',
    'jaiminiEvidence',
    'numerologyEvidence',
    'signatureEvidence',
  ].forEach(key => assert(Boolean(nav[key]), `language ${lang} missing nav.${key}`));
}

const competitor = readJson('packages/config/src/translations/competitorResponse.json');
for (const lang of ['en', 'hi', 'gu']) {
  const dashboardCopy = competitor.copy?.[lang]?.dashboard ?? {};
  [
    'primaryPredictaEyebrow',
    'primaryPredictaTitle',
    'primaryPredictaBody',
    'primaryPredictaPrimary',
    'primaryPredictaSecondary',
    'primaryPredictaProof',
  ].forEach(key => assert(Boolean(dashboardCopy[key]), `competitorResponse ${lang} missing dashboard.${key}`));
}

const manifest = readJson(`${auditDir}/phase-1-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest status must be GREEN');
assert(manifest.implementationChanged === true, 'Phase 1 must record implementation changes');
assert(manifest.primaryPredictaHref === '/dashboard/chat', 'manifest primary href mismatch');
assert(manifest.overviewHref === '/dashboard', 'manifest overview href mismatch');
for (const route of ['/dashboard/vedic', '/dashboard/kp', '/dashboard/jaimini', '/dashboard/numerology', '/dashboard/signature', '/dashboard/report']) {
  assert(manifest.preservedSpecialistRoutes?.includes(route), `manifest missing preserved route ${route}`);
}
for (const key of [
  'phase0StillGreen',
  'primaryPredictaNavigationExists',
  'specialistWorldsPreserved',
  'evidenceRoomLabelsLocalized',
  'dashboardPrimaryPredictaPanelExists',
  'noActiveNadiEvidenceRoom',
  'visualEvidenceCaptured',
  'mobileOverflowGuardAudited',
  'typecheckPasses',
  'buildPasses',
]) {
  assert(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}

for (const screenshot of [
  'desktop-dashboard.png',
  'tablet-dashboard.png',
  'mobile-dashboard.png',
  'desktop-chat.png',
  'mobile-menu.png',
]) {
  assert(exists(`${auditDir}/screenshots/${screenshot}`), `missing screenshot ${screenshot}`);
}

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  '"test:event-oracle-phase-1": "node scripts/run-event-oracle-phase-1-gate.mjs"',
  'package script',
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: one primary Predicta navigation, evidence-room taxonomy, localized copy, preserved specialist routes, and visual-proof artifacts are green.`,
);
