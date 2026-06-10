# Phase 2 Audit

Phase: `PREDICTA_APP_REVIVAL_PHASE_2_LANDING_CHAT_FIRST_REBUILD`
Status: `GREEN`
Date: 2026-06-10

## Verdict

The landing page now starts with the action Predicta should be known for:
asking Predicta a real question. The old first-screen chart-heavy hero was
removed from the landing route, and `/` is no longer a client component.

This phase does not claim the final performance budget. It does prove the
landing experience is now chat-first, less control-panel-like, and materially
lighter than the previous landing build.

## Implemented

- Converted `apps/web/app/page.tsx` to a server component.
- Added `apps/web/components/LandingChatFirstContent.tsx` as a small client
  island for question input, suggested chips, and voice entry affordance.
- Added dedicated JSON-backed landing ask copy in
  `packages/config/src/translations/competitorResponse.json` for:
  - English
  - Hindi
  - Gujarati
- Removed eager landing imports for:
  - `HeroSection`
  - `PremiumSectionWrapper`
  - `PricingTeaser`
  - `TestimonialTrustLoop`
  - `WebGrowthAdvantage`
  - `FinalCTASection`
- Added responsive CSS for the chat-first landing hero, chips, hints, and
  supporting sections.

## Verification

### Build And Type Safety

- `corepack pnpm --filter @pridicta/web typecheck`: passed.
- `corepack pnpm build:web`: passed.

### Payload Movement

Fresh `next build` output:

- `/`: `593 kB` First Load JS.
- Previous Phase 1 `/`: `882 kB` First Load JS.

Fresh `.next/app-build-manifest.json` asset totals:

- `/page`: `2452.7 KB`.
- Previous Phase 1 `/page`: about `3480.2 KB`.

### Runtime Smoke

Production-like server:

`PORT=3032 HOSTNAME=127.0.0.1 corepack pnpm --filter @pridicta/web exec next start`

Smoke:

- `/`: `200`
- `/ask`: `200`

### Browser Proof

In-app browser verification at `http://127.0.0.1:3032/` found:

- Ask hero present.
- Textarea present.
- Suggested question chips present without scrolling.
- Old hero chart absent.
- Horizontal overflow: `0`.
- Clicking `Is foreign travel or relocation active for me?` navigated to `/ask`
  with the prompt and `sourceScreen=Landing`.

### UI Gates

- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3032 corepack pnpm test:ui-personal-space`:
  passed `56` route and viewport checks.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3032 corepack pnpm test:ui-text-overflow`:
  passed `112` route and viewport checks.

## Remaining No-Go Debt

These are not Phase 2 failures, but remain part of the active revival goal:

1. `/ask` is still too heavy.
2. Dashboard still presents as the center of the product until Phase 3 demotes
   it to Library/My Astrology.
3. Full text/voice chat-shell performance and voice capture belong to Phase 4
   and Phase 6.
4. Link-click latency still needs the dedicated Phase 7 gate.

## Next Required Phase

`PREDICTA_APP_REVIVAL_PHASE_3_DASHBOARD_TO_LIBRARY_DEMOTION`
