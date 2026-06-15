# PREDICTA_REVIVAL_V2_PHASE_2_COMMAND_EVIDENCE

## Rerun Date

2026-06-15

## Verification Commands

- `corepack pnpm test:revival-v2-phase-2` - passed.
- `corepack pnpm --filter @pridicta/web typecheck` - passed after the production build regenerated `.next/types`.
- `corepack pnpm test:translation-trust` - passed.
- `corepack pnpm test:global-translation-coverage` - passed.
- `corepack pnpm build:web` - passed.
- `PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:competitor-response-phase-4` - passed against local production server.
- `PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:audit1-phase-4` - passed against local production server.
- `PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:audit1-phase-6` - passed against local production server.
- `corepack pnpm test:ui-personal-space` - passed across desktop, tablet, mobile, and narrow-mobile route checks.
- `corepack pnpm test:ui-text-overflow` - passed across 112 route and viewport checks.
- `git diff --check` - passed.

## Important Audit Notes

- The old specialist-room and competitor-response gates still expected the pre-Revival model where heavy specialist rooms mounted as the route hero. They now audit the approved V2.1 model: Ask-first evidence room entries with collapsed proof drawers and deferred detail rooms.
- The report composer density gate now audits the visible report surface instead of counting the global Ask dock. The global Ask dock is intentionally hidden on `/dashboard/report` because the report composer already owns the next action.
- The report composer gate now verifies the selected report card and inline action composer are in the same selected-choice surface, with the composer following the selected card.

## Closure

This phase is green for action-first first screens, selected-report action placement, no first-screen report form density, specialist-room Ask-first entries, and no text overflow/personal-space regressions in the audited route matrix. Phase 3 owns broader spacing-system normalization.
