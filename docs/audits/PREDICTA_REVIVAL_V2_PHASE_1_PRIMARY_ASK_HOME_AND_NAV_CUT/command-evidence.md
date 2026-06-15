# PREDICTA_REVIVAL_V2_PHASE_1_COMMAND_EVIDENCE

## Rerun Date

2026-06-15

## Verification Commands

- `corepack pnpm test:revival-v2-phase-1` - passed.
- `corepack pnpm --filter @pridicta/web typecheck` - passed.
- `git diff --check` - passed.
- `corepack pnpm test:translation-trust` - passed.
- `corepack pnpm build:web` - passed.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7` - passed against the local production server.
- `corepack pnpm test:global-translation-coverage` - passed.
- `corepack pnpm test:ui-personal-space` - passed across desktop, tablet, mobile, and narrow-mobile route checks.
- `corepack pnpm test:ui-text-overflow` - passed across 112 route and viewport checks.

## Live Contract Evidence

- `/dashboard?view=library` exposes direct `My Kundlis`, `Kundli`, `Reports`, and `Account` navigation instead of burying the user in a generic dashboard.
- `/dashboard/nadi/chat?legacyRoomSmoke=1` redirects into `/ask` with `school=JAIMINI`, prompt/source preservation, `autoSend=1`, and `handoffMode=room_safe`.
- Mobile primary shortcuts meet the 48px minimum touch target and avoid hidden utility drawers for the core post-Ask actions.

## Closure

This phase is green only for the Phase 1 scope: primary Ask home/navigation cut, direct library access, mobile primary shortcuts, and legacy room-safe redirects. Phase 2 must address page chatter and action-first route copy without reopening the Phase 1 navigation contract.
