# PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT

## Status

Green.

## Scope

This phase makes the revived Predicta experience feel more like a mobile
astrology app and less like a squeezed dashboard. The strict focus was the
first-screen Predicta input, touch-safe voice access, contained chips/actions,
evidence-room stacking, report action stacking, and no accidental horizontal
overflow.

## Changes

- Mobile landing now places the Predicta ask console before the hero copy.
- Mobile `/ask` now places the textarea first and the `Ask Predicta` /
  `Speak instead` actions immediately below it.
- Suggested questions are contained in a vertical in-card scroller on mobile so
  no chip or button extends outside the viewport.
- `/ask` voice now starts the chat with voice mode instead of only showing a
  notice.
- Added `test:app-revival-phase-8` and a browser-backed Phase 8 gate that
  checks 360px, 390px, 430px, 768px, 834px, 1024px, and desktop widths.
- The Phase 8 gate saves screenshot artifacts for landing, ask, dashboard,
  specialist worlds, and report routes.

## Evidence

- `node --check scripts/run-app-revival-phase-8-mobile-app-feel-gate.mjs`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3040 corepack pnpm test:app-revival-phase-8`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3040 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/report,/dashboard/kundli,/dashboard/redeem-pass,/pricing corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3040 corepack pnpm test:ui-personal-space`
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3040 corepack pnpm test:birth-place-autocomplete`
- `corepack pnpm test:global-translation-coverage`
- `git diff --check`

## Artifact Proof

- Manifest:
  `docs/audits/PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT/mobile-app-feel-manifest.json`
- Screenshot directory:
  `docs/audits/PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT/screenshots`
- 63 route and viewport screenshots were generated.
- At 360px, the landing textarea starts at `164px` and the `/ask` textarea
  starts at `148px`.
- At 360px, landing and `/ask` voice buttons are visible, at least 44px tall,
  and do not overlap the viewport edge.

## Result

Predicta is now more action-first on mobile: the user sees the input and
Ask/Speak actions before the app starts explaining itself. The checked
dashboard, specialist-world, report, Kundli, pricing, and redeem-pass routes
have no audited text overflow, no horizontal overflow, no personal-space
violations, and no regression in the birth-place autocomplete selector.

## Supplemental Mobile Header And Action Rhythm Lock

Date: 2026-06-11

After the route runtime rebuild, the mobile shells were technically valid but
still carried a control-panel smell: dashboard/evidence/report pages placed the
menu button below the primary Ask Predicta CTA, and the `/ask` lean header could
wrap into a second row of navigation pills before the user reached the question
box.

### Changes

- Dashboard mobile topbar now keeps `Ask Predicta` and the menu button in one
  compact action row.
- The dashboard menu button uses the same touch target sizing as the primary
  mobile topbar row instead of dropping into a lonely second line.
- `/ask` mobile navigation now stays in one horizontal scroll row, preventing
  `Premium` from wrapping into a bulky extra row above the chat prompt.
- The first-screen hierarchy remains: question field, Ask/Speak actions,
  then explanation and suggested questions.

### Evidence

- `corepack pnpm build:web`: PASS.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS, 63 route and viewport screenshots regenerated.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, 32 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `git diff --check`: PASS.

### Visual Audit Notes

- `mobile-390-dashboard.png`: primary Ask Predicta CTA and menu are now aligned
  in one row inside the top card.
- `mobile-390-dashboard-report.png`: report page now keeps the CTA/menu row
  compact before the report chooser begins.
- `mobile-390-ask.png`: the top navigation stays one line high with horizontal
  scroll instead of wrapping into a second row before the chat prompt.
