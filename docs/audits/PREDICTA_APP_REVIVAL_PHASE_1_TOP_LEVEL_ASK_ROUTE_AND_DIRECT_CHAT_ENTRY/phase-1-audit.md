# Phase 1 Audit

Phase: `PREDICTA_APP_REVIVAL_PHASE_1_TOP_LEVEL_ASK_ROUTE_AND_DIRECT_CHAT_ENTRY`
Status: `GREEN`
Date: 2026-06-10

## Verdict

Predicta now has a top-level `/ask` route outside `DashboardShell`, and the
canonical source-aware `Ask Predicta` CTA helper now points to `/ask`.

This phase does not claim load-time victory. The fresh build still shows `/ask`
is heavy because it reuses the existing chat engine and shared chunks. That is
explicitly Phase 6 debt. Phase 1 is green only for direct reachability and
context-preserving entry.

## Implemented

- Added `apps/web/app/ask/page.tsx`.
- `/ask` renders:
  - `WebHeader`
  - `WebEventQuestionComposer`
  - `WebPridictaChat`
  - `WebFooter`
- Updated `apps/web/lib/predicta-chat-cta.ts` so every source-aware Predicta
  handoff returns `/ask?...`.
- Preserved all existing query context:
  - active Kundli
  - source screen
  - selected school
  - selected chart
  - selected house/planet
  - event question
  - report context
  - Kundli Karma context
  - family/relationship/timeline context
- Updated public primary entry points:
  - `HeroSection`
  - `FinalCTASection`
  - `TestimonialTrustLoop`
  - `WebGrowthAdvantage`
  - `WebHeader`
  - `WebFooter`
  - settings chat shortcut
- Kept legacy `/dashboard/chat` and specialist dashboard chat routes alive.
- Added `/ask` to the global UI personal-space and text-overflow audit route
  matrices so the new primary chat route cannot bypass layout gates.

## Verification

### Static

- `corepack pnpm --filter @pridicta/web typecheck`: passed.
- `corepack pnpm build:web`: passed.
- Static search found no remaining direct hardcoded:
  - `href="/dashboard/chat"`
  - `href="/dashboard/vedic/chat"`
  - `return '/dashboard/chat'`
  - `return '/dashboard/*/chat'`
- `git diff --check`: passed.

### Runtime

Production-like local server:

`PORT=3032 HOSTNAME=127.0.0.1 corepack pnpm --filter @pridicta/web exec next start`

Smoke results:

- `/ask`: `200`
- `/ask?sourceScreen=Landing&school=KP&prompt=Will%20I%20go%20abroad%3F`: `200`
- `/dashboard/chat`: `200`
- `/dashboard/vedic/chat`: `200`
- `/dashboard/kp/chat`: `200`
- `/`: `200`

### UI Regression Gates

- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3032 corepack pnpm test:ui-personal-space`:
  passed `56` route and viewport checks.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3032 corepack pnpm test:ui-text-overflow`:
  passed `112` route and viewport checks with `0` clipped text findings and
  `0` horizontal overflow findings.

### Fresh Build Route Payloads

From the fresh `.next/app-build-manifest.json`:

- `/ask/page`: about `3506.7 KB` JS assets before compression.
- `/dashboard/chat/page`: about `3475.8 KB` JS assets before compression.
- `/page`: about `3480.2 KB` JS assets before compression.

This proves direct access is fixed, but load time is not fixed yet.

## Remaining No-Go Debt

These are not Phase 1 failures, but they remain blockers for the full revival:

1. `/ask` is still too heavy.
2. Landing is still client-heavy.
3. Dashboard still needs to be demoted to Library/My Astrology.
4. Specialist worlds still need to become calmer evidence rooms.
5. Link-click latency still needs a dedicated gate.
6. Mobile text/voice-first app feel still needs a dedicated audit.

## Next Required Phase

`PREDICTA_APP_REVIVAL_PHASE_2_LANDING_CHAT_FIRST_REBUILD`
