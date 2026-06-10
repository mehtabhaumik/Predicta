# PREDICTA_APP_REVIVAL_PHASE_3_DASHBOARD_TO_LIBRARY_DEMOTION Audit

Status: GREEN for Phase 3 scope and the birth-place autocomplete defect.
Date: 2026-06-10

## Implemented

- Demoted `/dashboard` from dense astrology cockpit to `My Astrology Library` saved-work surface.
- Kept `Ask Predicta` as the primary action on the Library page.
- Grouped saved-work surfaces separately from specialist evidence rooms.
- Updated shell navigation mental model from Dashboard to Library.
- Removed heavy dashboard cockpit imports/calculations from the dashboard overview.
- Fixed birth-place autocomplete so selected places close/invalidate stale search state and cannot keep showing `Searching places...` after selection.
- Added route-filter support to the text-overflow audit so stuck routes can be isolated without editing the script.

## Verification

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- Translation JSON parse for `competitorResponse.json` and `language.json`: PASS.
- `corepack pnpm build:web`: PASS.
- Route smoke on production server `127.0.0.1:3032`: PASS for `/`, `/ask`, `/dashboard`, `/dashboard/kundli`, `/dashboard/vedic`, `/dashboard/kp`, `/dashboard/jaimini`, `/dashboard/numerology`, `/dashboard/signature`, `/dashboard/report`.
- Browser proof `/dashboard`: Library page present, Ask Predicta present, saved-work and evidence-room cards present, old cockpit selector absent.
- Browser proof `/dashboard/kundli`: typing `Pet`, selecting `Petlad` sets input to `Petlad, Gujarat, India`; suggestions panel is `0` immediately and after settle; `Searching places...` is absent.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3032 corepack pnpm test:ui-personal-space`: PASS, 56 route/viewport checks.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3032 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard,/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS, 8 route/viewport checks.
- `git diff --check`: PASS.

## Caveat

- The full default `test:ui-text-overflow` matrix stalled on `/dashboard/kp` during this run. That route is outside the Phase 3/birth-place scope and passed the personal-space audit. The audit script now supports `PREDICTA_UI_OVERFLOW_ROUTES` to isolate route-specific failures without weakening the default full matrix.
