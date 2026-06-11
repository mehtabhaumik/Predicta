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

## Supplemental Empty My Kundlis KPI Removal Lock

Date: 2026-06-12

### Implemented

- Hid the `Kundli status` metric panel for brand-new users with no active or
  saved Kundli so `/dashboard` no longer opens with `0 saved Kundlis` and
  `0 active profile` dashboard counters.
- Preserved the same status panel for returning users once an active or saved
  Kundli exists, keeping useful management context without making first-time
  users feel like they entered a SaaS control panel.
- Kept the first visible actions as `Ask Predicta` and `Create Kundli`, with
  saved Kundli management still available below.

### Supplemental Verification

- Headless Chrome DOM smoke on `http://127.0.0.1:3009/dashboard` at mobile
  width: `Ask Predicta` present, `/dashboard/kundli` link present,
  `.library-status-panel` count `0`, zero-KPI text absent, horizontal overflow
  absent.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard,/dashboard/report,/pricing,/dashboard/kundli,/dashboard/saved-kundlis,/ask,/ corepack pnpm test:ui-text-overflow`: PASS, `28` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard,/dashboard/report,/pricing,/dashboard/kundli,/dashboard/saved-kundlis,/ask,/ corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `git diff --check`: PASS.

### Supplemental Result

Green. Empty `/dashboard` now behaves like a chat-first saved-work surface
instead of a dashboard KPI page, while returning-user Kundli status remains
available when it has real content.

## Supplemental Empty Dashboard Secondary Tools Drawer Lock

Date: 2026-06-12

### Implemented

- Wrapped saved-work and specialist-room tool grids in a closed secondary drawer
  for brand-new users with no active or saved Kundli.
- Kept all saved Kundli, report, Family Vault, pass, account, Vedic, KP,
  Jaimini, Numerology, and Signature links in the DOM for discoverability and
  link reliability, while making the first visible dashboard action stay
  `Ask Predicta` / `Create Kundli`.
- Preserved expanded management sections for returning users once a Kundli
  exists, because those users actually need the saved-work controls.
- Added English, Hindi, and Gujarati drawer copy through
  `competitorResponse.json`; no dashboard copy was hardcoded in the component.
- Added explicit closed-details CSS so the drawer truly hides nested tool
  sections when closed instead of merely looking collapsed.

### Supplemental Verification

- Browser DOM verification on `http://127.0.0.1:3009/dashboard`: PASS.
  Empty dashboard had `Ask Predicta`, `Create Kundli`, `.library-status-panel`
  count `0`, `.library-secondary-drawer` present and closed, `visibleLibrarySections`
  `0`, and no horizontal overflow.
- Translation JSON parse for `competitorResponse.json`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS. Dashboard page-specific
  bundle stayed within budget.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, `15` scenarios.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard,/ask,/dashboard/kundli,/dashboard/report,/pricing corepack pnpm test:ui-text-overflow`: PASS, `20` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard,/ask,/dashboard/kundli,/dashboard/report,/pricing corepack pnpm test:ui-personal-space`: PASS after rerun, `56` route/viewport checks. The first run hit a browser `Runtime.evaluate` timeout and produced no spacing finding.
- `git diff --check`: PASS.

### Supplemental Result

Green. First-time `/dashboard` no longer exposes a wall of management cards
before the user has even created a Kundli. Predicta remains the main path, the
birth-details path stays obvious, and deeper tools are available only when the
user intentionally opens them.

## Supplemental Kundli Ready Chat-First Drawer Lock

Date: 2026-06-12

### Implemented

- Changed the post-Kundli ready flow so `Ask Predicta first` is the only
  exposed primary action in the next-step panel.
- Preserved `Today for me`, `Open charts`, `Timing map`, `Create report`, and
  `Remedies`, but moved them into a closed `More Kundli tools` drawer so the
  user is not pushed into a control-panel spread immediately after creation.
- Added English, Hindi, and Gujarati translations for the new drawer labels in
  `ui.json`; the newly added copy is not hardcoded in the component.
- Added explicit closed-details CSS so the secondary tool grid is not painted
  while the drawer is closed.
- Used an adaptive card grid inside the drawer to prevent cramped text,
  clipping, or horizontal overflow when the user chooses to open it.

### Supplemental Verification

- Translation JSON parse for `ui.json`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS after the drawer CSS fix.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, `15` scenarios.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli,/dashboard,/ask,/dashboard/report,/pricing corepack pnpm test:ui-text-overflow`: PASS, `20` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/kundli,/dashboard,/ask,/dashboard/report,/pricing corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `corepack pnpm test:birth-place-autocomplete`: PASS; the Petlad autocomplete
  overlay fix remained intact.
- Headless Chrome ready-state verification on `/dashboard/kundli`: PASS.
  A golden Kundli was seeded into browser storage; `.kundli-tools-drawer`
  existed, was closed, preserved `5` secondary tool links, painted `0` of them
  while closed, exposed `Ask Predicta first`, and had `0px` horizontal overflow.
- `git diff --check`: PASS.

### Supplemental Result

Green. After Kundli creation, the app now keeps the user pointed at Predicta
instead of presenting a spiderweb of equal-weight tools. The deeper chart,
timing, report, and remedy paths remain available, but they no longer compete
with the first guided reading.
