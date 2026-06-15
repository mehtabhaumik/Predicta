import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT';
const auditDir = path.join(repoRoot, 'docs/audits', phaseName);
const failures = [];

const requiredFiles = [
  'docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md',
  'docs/audits/PREDICTA_REVIVAL_V2_PHASE_0_CURRENT_TRUTH_AND_NO_GO_LOCK/redline-audit.md',
  'apps/web/components/HeroSection.tsx',
  'apps/web/app/ask/page.tsx',
  'apps/web/components/AskPredictaLeanHeader.tsx',
  'apps/web/components/AskPredictaLightShell.tsx',
  'apps/web/components/DashboardShell.tsx',
  'apps/web/components/SidebarNav.tsx',
  'apps/web/app/dashboard/page.tsx',
  'apps/web/app/dashboard/_lib/legacy-chat-redirect.ts',
  'apps/web/middleware.ts',
  'apps/web/app/globals.css',
  'package.json',
];

for (const file of requiredFiles) {
  assertGate(exists(file), `missing required Phase 1 file: ${file}`);
}

const packageJson = readJson('package.json');
assertGate(
  packageJson.scripts?.['test:revival-v2-phase-1'] ===
    'node scripts/run-revival-v2-phase-1-primary-ask-gate.mjs',
  'package.json must expose test:revival-v2-phase-1',
);

const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
assertIncludes(roadmap, phaseName, 'revival v2.1 roadmap');
for (const rule of [
  'Landing primary action opens `/ask`.',
  '`/ask` stays minimal and distraction-free.',
  'Mobile nav prioritizes `Ask`, `Kundlis`, `Reports`, and `Account`.',
  'Specialist worlds are accessible as secondary evidence rooms.',
  'Generic dashboard/control-panel language is removed from primary journeys.',
  'Legacy links redirect or preserve context cleanly.',
]) {
  assertIncludes(roadmap, rule, 'Phase 1 contract');
}

const hero = read('apps/web/components/HeroSection.tsx');
assertIncludes(hero, 'href="/ask"', 'landing primary action');
assertIncludes(hero, 'className="button"', 'landing primary action styling');
assertIncludes(hero, 'href="/ask?sourceScreen=Landing', 'landing specialist handoff remains through Ask');

const askPage = read('apps/web/app/ask/page.tsx');
assertIncludes(askPage, '<AskPredictaLeanHeader />', '/ask lean header');
assertIncludes(askPage, '<AskPredictaLightShell />', '/ask light shell');
assertNotIncludes(askPage, 'DashboardShell', '/ask must not render dashboard shell');
assertNotIncludes(askPage, 'DashboardPassBanner', '/ask must not render dashboard utilities');

const shell = read('apps/web/components/DashboardShell.tsx');
assertIncludes(shell, "href: '/ask'", 'dashboard nav model primary Predicta route');
assertIncludes(shell, "id: 'predicta'", 'dashboard nav model primary Predicta id');
assertIncludes(shell, "className=\"dashboard-mobile-primary-ask\"", 'mobile drawer primary ask shortcut');
assertIncludes(shell, "const mobilePrimarySections = ['library', 'reports', 'account']", 'mobile primary shortcut order');
assertIncludes(shell, "className=\"dashboard-mobile-primary-shortcuts\"", 'mobile primary shortcuts wrapper');
assertIncludes(shell, "return labels.nav.library;", 'library source label must not use dashboard wording');
assertIncludes(shell, "DASHBOARD_WORLD_SECTION_IDS.has(activeSection.id)", 'specialist worlds stay secondary');
assertIncludes(shell, "shellLabels.groups.worlds", 'specialist worlds drawer remains labeled as worlds');
assertNotIncludes(shell, 'visibleUtilitySections', 'mobile utility drawer must not hide primary library/report/account links');
assertNotIncludes(shell, "label: labels.nav.dashboard", 'library primary item must not use dashboard wording');

const sidebar = read('apps/web/components/SidebarNav.tsx');
assertIncludes(sidebar, "const PRIMARY_SECTION_IDS = new Set(['predicta', 'library', 'reports', 'account'])", 'desktop primary set');
assertIncludes(sidebar, 'nav-section-predicta-first', 'desktop Ask first section');
assertIncludes(sidebar, 'WORLD_SECTION_IDS.has(activeSection.id)', 'desktop specialist worlds stay secondary');

const dashboardPage = read('apps/web/app/dashboard/page.tsx');
assertIncludes(dashboardPage, 'router.replace(askHref, { scroll: false })', '/dashboard client fallback must hand off to Ask');
assertIncludes(dashboardPage, 'const askSourceScreen = labels.nav.library;', 'library source screen must avoid dashboard wording');
assertIncludes(dashboardPage, 'href="/dashboard?view=library"', 'saved-work library remains available only as secondary route');

const legacyRedirect = read('apps/web/app/dashboard/_lib/legacy-chat-redirect.ts');
assertIncludes(legacyRedirect, 'redirect(`/ask?${params.toString()}`)', 'legacy chat redirect target');
assertIncludes(legacyRedirect, "params.set('autoSend', 'true')", 'legacy prompt auto-send preservation');
assertIncludes(legacyRedirect, "params.set('handoffMode', 'room_safe')", 'room-safe school preservation');

const middleware = read('apps/web/middleware.ts');
assertIncludes(middleware, "nextUrl.pathname !== '/dashboard'", 'middleware only redirects dashboard root');
assertIncludes(middleware, "askUrl.pathname = '/ask'", '/dashboard server redirect target');
assertIncludes(middleware, "askUrl.searchParams.set('autoSend', 'true')", '/dashboard redirect auto-send handoff');

const css = read('apps/web/app/globals.css');
assertIncludes(css, '.dashboard-mobile-primary-shortcuts', 'mobile primary shortcut CSS');
assertIncludes(css, 'min-height: 48px;', 'mobile shortcut touch target minimum');

mkdirSync(auditDir, { recursive: true });

const ledger = {
  phase: phaseName,
  verdict: failures.length ? 'BLOCKED' : 'GREEN',
  sourceChecks: {
    landingPrimaryAsk: true,
    askLeanShell: true,
    mobileNavPrimaryShortcuts: ['Ask Predicta', 'My Kundlis', 'Reports', 'Account'],
    specialistWorldsSecondary: true,
    legacyContextPreserved: true,
    dashboardRootRedirectsToAsk: true,
  },
  failures,
};

writeFileSync(
  path.join(auditDir, 'phase-1-primary-ask-ledger.json'),
  `${JSON.stringify(ledger, null, 2)}\n`,
);

writeFileSync(
  path.join(auditDir, 'redline-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    failures.length ? 'BLOCKED.' : 'GREEN.',
    '',
    '## Locked Behavior',
    '',
    '- Landing primary action opens `/ask`.',
    '- `/ask` stays outside the dashboard shell and uses the lean chat shell.',
    '- Mobile navigation exposes Ask first, then direct Kundlis, Reports, and Account shortcuts.',
    '- Specialist worlds stay accessible as secondary evidence rooms.',
    '- `/dashboard` redirects to `/ask`; `/dashboard?view=library` remains the saved-work surface.',
    '- Legacy chat links preserve prompt, school, auto-send, and room-safe handoff into `/ask`.',
    '',
    '## Follow-Up',
    '',
    'Phase 2 must now cut long page chatter and make every major route action-first.',
    '',
  ].join('\n'),
);

if (failures.length) {
  console.error(`${phaseName} blocked:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} GREEN`);

function exists(file) {
  return existsSync(path.join(repoRoot, file));
}

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertGate(condition, message) {
  try {
    assert.equal(Boolean(condition), true, message);
  } catch {
    failures.push(message);
  }
}

function assertIncludes(source, expected, label) {
  assertGate(source.includes(expected), `${label} must include ${expected}`);
}

function assertNotIncludes(source, expected, label) {
  assertGate(!source.includes(expected), `${label} must not include ${expected}`);
}
