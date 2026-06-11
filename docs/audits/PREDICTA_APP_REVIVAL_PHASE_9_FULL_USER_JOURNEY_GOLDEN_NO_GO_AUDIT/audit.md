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

## Live Deployment Follow-Up

- Pushed `main` through `926f502c`.
- Deployed Firebase App Hosting backend `predicta-web` for project
  `predicta-a4758`.
- Confirmed the deployed backend update time advanced to
  `2026-06-10T15:48:40.330406Z`.
- Added App Hosting `minInstances: 1` after live smoke proved query-string
  handoff routes were hitting a slow server path. After the warm-instance
  rollout, `https://predicta.rudraix.com/ask?x=1` returned `200`.
- Reran `PREDICTA_FULL_JOURNEY_BASE_URL=https://predicta.rudraix.com corepack pnpm test:app-revival-phase-9`.
- Reran `PREDICTA_AUTOCOMPLETE_BASE_URL=https://predicta.rudraix.com corepack pnpm test:birth-place-autocomplete`.
- Hardened the autocomplete gate to wait for the hydrated live input before
  interacting with the field.

## Verdict

Green. The app now preserves Ask Predicta context through the chat-first
journey, the Petlad autocomplete regression remains fixed in the current
production build and deployed domain, and the broad navigation, translation,
overflow, spacing, and mobile gates are green.

## Supplemental Mobile Chat Doorway Reaudit

Date: 2026-06-11

After the direct `/ask` and landing mobile density pass, Phase 9 was rerun
against the local production build to confirm the new visitor, legacy redirect,
language, redeem-pass, zero-credit, specialist handoff, and report-composer
journeys still work from the simplified chat-first entry.

### Evidence

- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, 15 scenarios and screenshots regenerated. The runner printed the pass manifest and then required manual process cleanup after writing evidence.
- `full-user-journey-manifest.json`: regenerated at `2026-06-11T16:21:28.332Z` with zero failed scenarios.
- `mobile-390-new-visitor-direct-ask.png`: direct ask path opens on the compact input-first surface.
- `mobile-390-new-visitor-asks-question.png`: selected prompt remains in the textarea before chat/auth handoff.
- `mobile-390-legacy-dashboard-chat-redirects-to-ask.png`: legacy dashboard chat still redirects to the `/ask` doorway with the user question preserved.

### Verdict

Green. The simplified mobile doorway did not break the chat-first journey,
legacy handoffs, language checks, redeem-pass lock, zero-credit deterministic
help, specialist evidence links, or report-composer access.
