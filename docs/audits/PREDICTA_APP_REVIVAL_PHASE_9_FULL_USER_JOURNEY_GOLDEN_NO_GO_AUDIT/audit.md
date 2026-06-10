# PREDICTA_APP_REVIVAL_PHASE_9_FULL_USER_JOURNEY_GOLDEN_NO_GO_AUDIT

## Scope

This audit verifies the chat-first Predicta journey after the app revival work.
The gate covers new-user entry, saved-Kundli entry, specialist evidence handoffs,
report composer access, zero-credit deterministic help, redeem-pass lock,
mobile navigation, and Hindi/Gujarati navigation labels.

## Fix Applied

- Preserved Ask Predicta prompt context synchronously before rendering the
  heavier chat/auth gate.
- `autoSend=true`, `prompt`, and `sourceScreen` now remain in the `/ask` URL
  immediately after a suggested question is selected or submitted.
- This protects sign-in continuation and prevents the user's question from
  being lost between the lightweight Ask shell and the full Predicta chat.

## Runtime Evidence

- `node --check scripts/run-app-revival-phase-9-full-user-journey-gate.mjs`
- `node --check scripts/run-birth-place-autocomplete-gate.mjs`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3042 corepack pnpm test:birth-place-autocomplete`
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3042 corepack pnpm test:app-revival-phase-9`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3042 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3042 corepack pnpm test:app-revival-phase-8`
- `corepack pnpm test:global-translation-coverage`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3042 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/report,/dashboard/kundli,/dashboard/redeem-pass,/pricing corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3042 corepack pnpm test:ui-personal-space`
- `git diff --check`

## Gate Results

- Phase 9 full journey gate: passed with 13 scenarios and screenshot evidence.
- Birth-place autocomplete sticky panel regression: passed. Petlad selection
  closes suggestions, removes `Searching places...`, and refocus keeps the
  panel closed.
- Link reliability: passed across public and dashboard routes.
- Mobile app feel: passed with 63 responsive results and screenshot evidence.
- Translation source coverage: passed.
- UI text overflow: passed across 48 route and viewport checks.
- UI personal space: passed across 56 route and viewport checks.

## Verdict

Green. The app now preserves Ask Predicta context through the chat-first
journey, the Petlad autocomplete regression remains fixed in the current
production build, and the broad navigation, translation, overflow, spacing,
and mobile gates are green.
