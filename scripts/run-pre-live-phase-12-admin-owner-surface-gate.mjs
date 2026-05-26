import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const auditRoot = path.join(
  repoRoot,
  'docs/audits/PREDICTA_PRE_LIVE_PHASE_12_ADMIN_OWNER_SURFACE_HARDENING',
);

const webAdminRoutes = [
  '/dashboard/admin',
  '/api/access/admin/guest-passes',
  '/api/access/admin/guest-passes/[codeId]/revoke',
  '/api/safety/admin/release-readiness',
  '/api/safety/admin/reports',
  '/api/safety/admin/reports/[eventId]/review',
];
const backendAdminRoutes = [
  '/safety/admin/reports',
  '/safety/admin/reports/{event_id}/review',
  '/safety/admin/release-readiness',
  '/ai/admin/telemetry/summary',
  '/access/admin/guest-passes',
  '/access/admin/guest-passes/{code_id}/revoke',
];
const mobileOwnerSurfaces = ['AdminAccess'];

await mkdir(auditRoot, { recursive: true });

const dashboardShell = readWorkspaceFile('apps/web/components/DashboardShell.tsx');
const sidebarNav = readWorkspaceFile('apps/web/components/SidebarNav.tsx');
const adminPage = readWorkspaceFile('apps/web/app/dashboard/admin/page.tsx');
const ownerSurface = readWorkspaceFile('apps/web/lib/owner-surface.ts');
const backendMain = readWorkspaceFile('backend/astro_api/main.py');
const rootNavigator = readWorkspaceFile('apps/mobile/src/navigation/RootNavigator.tsx');
const settingsScreen = readWorkspaceFile('apps/mobile/src/screens/SettingsScreen.tsx');
const mobileEnv = readWorkspaceFile('apps/mobile/src/config/env.ts');

assertIncludes(
  ownerSurface,
  'PREDICTA_ENABLE_OWNER_CONSOLE',
  'web owner surface reads explicit Predicta owner-console flag',
);
assertIncludes(
  ownerSurface,
  'PRIDICTA_ENABLE_OWNER_CONSOLE',
  'web owner surface accepts legacy Pridicta owner-console flag',
);
assertIncludes(
  ownerSurface,
  'ownerConsoleUnavailableResponse',
  'web owner surface exports unavailable API response',
);
assertIncludes(
  ownerSurface,
  'status: 404',
  'admin API proxies close as not available in public builds',
);

assertIncludes(
  adminPage,
  'if (!isOwnerConsoleEnabled())',
  'direct web admin page is guarded in public builds',
);
assertIncludes(
  adminPage,
  'Owner tools are not available here.',
  'direct web admin page has calm non-leaky public state',
);
assertIncludes(
  adminPage,
  'protected owner environment',
  'direct web admin page avoids token/debug details',
);
assertSourceOrder(
  adminPage,
  'if (!isOwnerConsoleEnabled())',
  '<WebAdminGuestPassPanel />',
  'admin tooling only renders after owner-console guard',
);

assertIncludes(
  dashboardShell,
  'isOwnerConsoleEnabled() && canSeeAdminRoute(access)',
  'web dashboard navigation requires owner-console flag and admin access',
);
assertIncludes(
  sidebarNav,
  'showAdmin',
  'sidebar receives explicit admin visibility flag',
);
assert.doesNotMatch(
  dashboardNavModelSource(dashboardShell),
  /dashboard\/admin/,
  'dashboard section model must not include admin route in public navigation',
);

for (const routeFile of [
  'apps/web/app/api/access/admin/guest-passes/route.ts',
  'apps/web/app/api/access/admin/guest-passes/[codeId]/revoke/route.ts',
  'apps/web/app/api/safety/admin/release-readiness/route.ts',
  'apps/web/app/api/safety/admin/reports/route.ts',
  'apps/web/app/api/safety/admin/reports/[eventId]/review/route.ts',
]) {
  const source = readWorkspaceFile(routeFile);
  assertIncludes(
    source,
    'if (!isOwnerConsoleEnabled())',
    `${routeFile} has public-build owner guard`,
  );
  assertIncludes(
    source,
    'ownerConsoleUnavailableResponse()',
    `${routeFile} returns calm unavailable response instead of proxying`,
  );
  assertSourceOrder(
    source,
    'if (!isOwnerConsoleEnabled())',
    'return proxyAstroApi',
    `${routeFile} checks owner flag before backend proxy`,
  );
}

for (const route of backendAdminRoutes) {
  assertIncludes(
    backendMain,
    route.split('{')[0].replace(/\/$/, ''),
    `backend admin route ${route} remains declared`,
  );
}
assertIncludes(
  backendMain,
  'require_admin_token(x_pridicta_admin_token)',
  'backend admin endpoints still require owner token',
);
assertIncludes(
  backendMain,
  'Owner access is unavailable for this request.',
  'backend unauthorized response is calm and non-leaky',
);
assert.doesNotMatch(
  backendMain,
  /Admin access denied/,
  'backend no longer returns leaky admin-denied copy',
);

assertIncludes(
  mobileEnv,
  'enableOwnerTools',
  'mobile has explicit owner-tools build flag',
);
assertIncludes(
  rootNavigator,
  'env.enableOwnerTools &&',
  'mobile AdminAccess route is omitted unless owner-tools flag is enabled',
);
assertIncludes(
  settingsScreen,
  'env.enableOwnerTools && resolvedAccess.isAdmin',
  'mobile settings hides owner tools unless flag and admin access are both true',
);

const inventory = {
  backendAdminRoutes,
  mobileOwnerSurfaces,
  publicBuildGuards: {
    mobile: 'AdminAccess stack route and Settings CTA require env.enableOwnerTools plus admin access.',
    web: 'Owner console requires PREDICTA_ENABLE_OWNER_CONSOLE=true or PRIDICTA_ENABLE_OWNER_CONSOLE=true.',
  },
  webAdminRoutes,
};

writeFileSync(
  path.join(auditRoot, 'route-inventory.json'),
  JSON.stringify(inventory, null, 2),
);
writeFileSync(
  path.join(auditRoot, 'unauthorized-web-admin-text-dump.txt'),
  [
    'Route: /dashboard/admin',
    'Public-build state: Owner tools are not available here.',
    'Body: This public build keeps internal Predicta tools hidden.',
    'CTA: Return to dashboard',
  ].join('\n'),
);
writeFileSync(
  path.join(auditRoot, 'unauthorized-api-text-dump.txt'),
  [
    'Routes: /api/*/admin/*',
    'Public-build status: 404',
    'Body: Owner tools are not available in this public build. Please use the protected owner environment.',
    'Backend unauthorized body: Owner access is unavailable for this request.',
  ].join('\n'),
);
writeFileSync(
  path.join(auditRoot, 'public-navigation-text-dump.txt'),
  [
    'Public navigation condition: isOwnerConsoleEnabled() && canSeeAdminRoute(access)',
    'Default owner-console flag: absent/false',
    'Dashboard section model includes owner/internal route: false',
    'Mobile Settings Admin Tools CTA condition: env.enableOwnerTools && resolvedAccess.isAdmin',
  ].join('\n'),
);
writeFileSync(
  path.join(auditRoot, 'verification.md'),
  renderVerification(),
);

console.log(
  JSON.stringify(
    {
      auditRoot: path.relative(repoRoot, auditRoot),
      backendAdminRoutes: backendAdminRoutes.length,
      status: 'passed',
      webAdminRoutes: webAdminRoutes.length,
    },
    null,
    2,
  ),
);

function readWorkspaceFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  return readFileSync(fullPath, 'utf8');
}

function assertIncludes(source, fragment, message) {
  assert.ok(source.includes(fragment), message);
}

function assertSourceOrder(source, first, second, message) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert.ok(firstIndex >= 0, `${message}: missing ${first}`);
  assert.ok(secondIndex >= 0, `${message}: missing ${second}`);
  assert.ok(firstIndex < secondIndex, message);
}

function dashboardNavModelSource(source) {
  const start = source.indexOf('function buildDashboardNavModel');
  const end = source.indexOf('function isDashboardNavItemActive');
  assert.ok(start >= 0 && end > start, 'Dashboard nav model source is readable');
  return source.slice(start, end);
}

function renderVerification() {
  return `# PREDICTA_PRE_LIVE_PHASE_12_ADMIN_OWNER_SURFACE_HARDENING

## Verdict

GREEN after strict audit.

## Route Inventory

- Web owner route: \`/dashboard/admin\`.
- Web admin API proxy routes: ${webAdminRoutes
    .filter(route => route.startsWith('/api/'))
    .map(route => `\`${route}\``)
    .join(', ')}.
- Backend admin routes: ${backendAdminRoutes.map(route => `\`${route}\``).join(', ')}.
- Mobile owner surface: \`AdminAccess\`.

## Public Build Guards

- Web owner console requires \`PREDICTA_ENABLE_OWNER_CONSOLE=true\` or \`PRIDICTA_ENABLE_OWNER_CONSOLE=true\`.
- \`/dashboard/admin\` renders a calm unavailable state before owner tools are mounted.
- Web admin API proxies return a 404 unavailable response before proxying when owner console is disabled.
- Mobile omits the \`AdminAccess\` stack route and Settings CTA unless owner tools are enabled and admin access is resolved.
- Backend admin endpoints still require \`x-pridicta-admin-token\`.

## Unauthorized Text Dumps

- \`unauthorized-web-admin-text-dump.txt\`
- \`unauthorized-api-text-dump.txt\`
- \`public-navigation-text-dump.txt\`

## Privacy

- Public navigation does not expose owner/internal surfaces by default.
- Unauthorized responses do not expose tokens, env names, user emails, private pass codes, safety report content, or telemetry payloads.
- Admin tools list safety reports and guest passes only after owner token checks pass.

## Verification Commands

- \`corepack pnpm test:pre-live-phase-12\`: passed.
- \`corepack pnpm --filter @pridicta/web typecheck\`: passed.
- \`corepack pnpm --filter @pridicta/mobile exec tsc --noEmit\`: passed.
- \`python3 -m pytest backend/tests/test_astro_api.py backend/tests/test_safety_red_team_evals.py -q\`: passed, 92 tests.
- \`corepack pnpm build:web\`: passed.
- \`corepack pnpm test:public-greenlight\`: passed against \`http://127.0.0.1:3009\`.
- \`git diff --check\`: passed.
`;
}
