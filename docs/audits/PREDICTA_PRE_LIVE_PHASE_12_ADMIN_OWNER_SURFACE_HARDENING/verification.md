# PREDICTA_PRE_LIVE_PHASE_12_ADMIN_OWNER_SURFACE_HARDENING

## Verdict

GREEN after strict audit.

## Route Inventory

- Web owner route: `/dashboard/admin`.
- Web admin API proxy routes: `/api/access/admin/guest-passes`, `/api/access/admin/guest-passes/[codeId]/revoke`, `/api/safety/admin/release-readiness`, `/api/safety/admin/reports`, `/api/safety/admin/reports/[eventId]/review`.
- Backend admin routes: `/safety/admin/reports`, `/safety/admin/reports/{event_id}/review`, `/safety/admin/release-readiness`, `/ai/admin/telemetry/summary`, `/access/admin/guest-passes`, `/access/admin/guest-passes/{code_id}/revoke`.
- Mobile owner surface: `AdminAccess`.

## Public Build Guards

- Web owner console requires `PREDICTA_ENABLE_OWNER_CONSOLE=true` or `PRIDICTA_ENABLE_OWNER_CONSOLE=true`.
- `/dashboard/admin` renders a calm unavailable state before owner tools are mounted.
- Web admin API proxies return a 404 unavailable response before proxying when owner console is disabled.
- Mobile omits the `AdminAccess` stack route and Settings CTA unless owner tools are enabled and admin access is resolved.
- Backend admin endpoints still require `x-pridicta-admin-token`.

## Unauthorized Text Dumps

- `unauthorized-web-admin-text-dump.txt`
- `unauthorized-api-text-dump.txt`
- `public-navigation-text-dump.txt`

## Privacy

- Public navigation does not expose owner/internal surfaces by default.
- Unauthorized responses do not expose tokens, env names, user emails, private pass codes, safety report content, or telemetry payloads.
- Admin tools list safety reports and guest passes only after owner token checks pass.

## Verification Commands

- `corepack pnpm test:pre-live-phase-12`: passed.
- `corepack pnpm --filter @pridicta/web typecheck`: passed.
- `corepack pnpm --filter @pridicta/mobile exec tsc --noEmit`: passed.
- `python3 -m pytest backend/tests/test_astro_api.py backend/tests/test_safety_red_team_evals.py -q`: passed, 92 tests.
- `corepack pnpm build:web`: passed.
- `corepack pnpm test:public-greenlight`: passed against `http://127.0.0.1:3009`.
- `git diff --check`: passed.
