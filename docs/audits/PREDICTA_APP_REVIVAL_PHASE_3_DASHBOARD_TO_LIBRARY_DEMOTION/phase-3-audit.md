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

## Supplemental My Kundlis Language Lock

Date: 2026-06-11

### Implemented

- Replaced remaining control-panel-facing `Library` navigation copy with
  `My Kundlis` in English, Hindi, and Gujarati.
- Reframed dashboard copy from "evidence rooms" and "library status" toward
  user intent: Kundli status, saved astrology, and deeper astrology rooms.
- Replaced specialist navigation labels such as `Vedic Evidence` and
  `KP Evidence` with calmer room labels like `Vedic Room`, `KP Room`,
  and native Hindi/Gujarati equivalents.
- Removed newly introduced Hindi/Gujarati mixed-language copy such as `room`,
  `detail`, `redeem`, and `account` from the changed dashboard sections.

### Supplemental Verification

- Translation JSON parse for `competitorResponse.json` and `language.json`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3030 corepack pnpm test:app-revival-phase-7`: PASS. The click manifest now shows `My Kundlis`, `Vedic Room`, `KP Room`, `Jaimini Room`, `Numerology Room`, and `Signature Room` as active visible labels.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3030 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, `36` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3030 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

### Supplemental Result

Green. The saved-work surface now reads as `My Kundlis` instead of a generic
SaaS library/control panel, while preserving all management links and the
dominant Ask Predicta path.

## Supplemental Secondary Surface Label Lock

Date: 2026-06-12

### Implemented

- Replaced remaining visible and handoff-level `Kundli Library` labels with
  `My Kundlis` across footer, dashboard shell, saved Kundlis, account settings,
  Family Vault, Family Karma Map, and shared translation JSON.
- Replaced specialist handoff `Evidence Room` source labels with calmer room
  labels for KP, Jaimini, Numerology, Signature, and Kundli Karma.
- Reframed Event Oracle copy from "evidence rooms" to "astrology methods" so
  Predicta remains primary and the schools read as supporting methods.
- Left internal code symbols such as `useWebKundliLibrary` untouched to avoid
  unnecessary data/model churn.

### Supplemental Verification

- Targeted text scan for `Kundli Library`, `Evidence Room`, `evidence rooms`,
  stale source-screen labels, and `Open Library`: PASS for app/translation
  surfaces in scope.
- Translation JSON parse for `eventOracle.json` and `ui.json`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3031 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3031 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/saved-kundlis,/dashboard/family,/dashboard/settings,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, `48` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3031 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/saved-kundlis,/dashboard/family,/dashboard/settings,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `git diff --check`: PASS.

### Supplemental Result

Green. The remaining `Library` terms are internal code symbols or legitimate
chart-library labels, not visible navigation/control-panel language.

## Supplemental Birth-Place Overlay Race Lock

Date: 2026-06-12

### Implemented

- Split birth-place dropdown closing into a non-invalidating UI reset and an
  explicit close that invalidates pending searches.
- Treated a selected or accepted birth place as a hard overlay-suppression
  state, so suggestions and `Searching places...` cannot render after a valid
  selection.
- Removed duplicate mouse/click selection handlers from suggestion buttons and
  kept one pointer path plus keyboard selection to avoid repeated selection
  events fighting the focus/blur lifecycle.

### Supplemental Verification

- Focused production-server Chrome smoke on `/dashboard/kundli`: typed `Pet`,
  selected `Petlad`, and verified `inputValue` became
  `Petlad, Gujarat, India`, `statusText` was `null`, `suggestionsText` was
  `null`, and `listboxCount` was `0`.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS after production
  build completed. The earlier parallel typecheck collided with `.next/types`
  generation while build was running and was rerun successfully.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3032 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS, `4` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3032 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/kundli corepack pnpm test:ui-personal-space`: PASS.
- `git diff --check`: PASS.

### Supplemental Result

Green. Birth-place autocomplete now closes cleanly after a valid place is
selected and does not leave the search receipt or suggestion list on screen.
