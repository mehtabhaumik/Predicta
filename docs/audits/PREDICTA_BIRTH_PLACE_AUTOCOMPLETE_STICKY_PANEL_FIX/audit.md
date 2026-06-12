# Predicta Birth Place Autocomplete Sticky Panel Fix

## Issue

The Kundli birth-place autocomplete could leave the suggestion panel visible after
the user selected or auto-matched a city. The visible state looked selected, but
the panel still showed `Searching places...`, creating confusion and blocking
the form surface.

## Fix

- Treat a selected place as current when the input matches either a canonical
  label or a known fuzzy search term.
- Invalidate stale place-search requests before applying a selected place.
- Add a defensive close effect so selected, current places cannot keep an open
  suggestion list or loading state.
- Show local known-place suggestions immediately without mixing them with a
  stale loading message.
- Keep `Searching places...` outside the floating result list and only show it
  when there are no selectable results yet.
- Extend the regression gate to verify the dropdown remains closed after the
  selected field is focused again.
- Extend the regression gate to verify partial known-place input shows a result
  without a lingering `Searching places...` state.

## Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `node --check scripts/run-birth-place-autocomplete-gate.mjs`
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3039 corepack pnpm test:birth-place-autocomplete`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3039 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli,/dashboard,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/report corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3039 corepack pnpm test:ui-personal-space`
- `corepack pnpm test:global-translation-coverage`
- `git diff --check`

## Result

Green. Partial `Petla` shows the Petlad option without a stale loading label.
Exact `Petlad` resolves to `Petlad, Gujarat, India`, the suggestion panel
unmounts, `Searching places...` disappears, refocusing the selected field does
not reopen the panel, and the checked Kundli/astrology/report routes have no
overflow, personal-space, or translation-source regressions.

## Supplemental Accepted-State Reaudit

Date: 2026-06-11

### Additional Fix

- Replaced the accepted birth-place ref with React state so the UI rerenders
  immediately when a place is accepted.
- Added mouse, pointer, click, and keyboard selection fallbacks for suggestion
  options so the dropdown closes reliably across browser event paths.
- Kept stale search invalidation in place so pending place searches cannot
  revive the suggestion panel after a selected city is settled.

### Supplemental Evidence

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3028 corepack pnpm test:birth-place-autocomplete`: PASS. Exact `Petlad` resolves to `Petlad, Gujarat, India`; suggestions are unmounted; `Searching places...` is absent; refocus stays closed; no horizontal overflow.
- Browser verification on `http://127.0.0.1:3028/dashboard/kundli`: PASS. After entering `Petlad`, the input value is `Petlad, Gujarat, India`, no suggestions are mounted, no searching status remains, refocus stays closed, and no horizontal overflow is present.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3028 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3028 corepack pnpm test:app-revival-phase-9`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3028 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/kundli,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, `40` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3028 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/kundli,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

### Supplemental Result

Green. The selected birth-place state is now a hard UI terminal state: the
autocomplete cannot keep a stale loading receipt open once the place is settled,
and focusing the accepted field does not reopen the old suggestion panel.

## Exact Auto-Populate Reaudit

Date: 2026-06-12

### Additional Fix

- Added a blur-time exact-query settlement guard so a known local city can commit
  and close the overlay even if the user does not click the suggestion.
- Collapsed suggestions and loading into one mutually exclusive floating overlay
  so `Searching places...` cannot remain visible below a selectable result.
- Strengthened the regression gate to fail if typing exact `Petlad` does not
  auto-populate `Petlad, Gujarat, India` and dismiss the panel without an extra
  click.

### Supplemental Evidence

- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:birth-place-autocomplete`: PASS. Exact `Petlad` resolves to `Petlad, Gujarat, India`, suggestions are unmounted, `Searching places...` is absent, refocus stays closed, and no horizontal overflow is present.
- Browser verification on `http://127.0.0.1:3009/dashboard/kundli`: PASS. Filling `Petlad` leaves the input committed to `Petlad, Gujarat, India` with no suggestion panel, no searching text, and no horizontal overflow.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli,/dashboard,/ask corepack pnpm test:ui-text-overflow`: PASS, `12` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/kundli,/dashboard,/ask corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `git diff --check`: PASS.

### Supplemental Result

Green. The exact auto-populate path now behaves like a completed action, not a
half-open search state: once Predicta recognizes the birth place, the field is
committed and the dropdown is gone.

## Mixed Option And Searching-State Reaudit

Date: 2026-06-12

### Additional Fix

- Made birth-place suggestion results authoritative: when selectable results are
  present, the loading state is cleared immediately.
- Made the `Searching places...` overlay mutually exclusive with visible
  suggestions, even if a stale async search result tries to update late.
- Strengthened browser-native autofill resistance on the place input with a
  dedicated field name, `new-password` autocomplete, autocorrect off, and
  spellcheck off.
- Extended the regression gate to fail if a Petlad option and
  `Searching places...` appear at the same time.

### Supplemental Evidence

- `node --check scripts/run-birth-place-autocomplete-gate.mjs`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:birth-place-autocomplete`: PASS. `hasMixedOptionAndSearching` is `false`; exact `Petlad` resolves to `Petlad, Gujarat, India`; suggestions are unmounted; `Searching places...` is absent; refocus stays closed; no horizontal overflow.
- `PREDICTA_BIRTH_PLACE_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3009 node scripts/run-birth-place-autocomplete-gate.mjs`: PASS with the same mixed-state guard.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS, `4` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/kundli corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `corepack pnpm test:app-revival-phase-6`: PASS.

### Supplemental Result

Green. The birth-place autocomplete now treats `Petlad` as a closed, committed
selection and forbids the trust-breaking state where a selectable place and
`Searching places...` are visible together.

## Immediate Local-Match And Autofill Collision Reaudit

Date: 2026-06-12

### Additional Fix

- Added live local-match rendering so known local places are available to the
  overlay immediately, even before async suggestion state catches up.
- Added immediate exact-place settlement during input changes so `Petlad` cannot
  spend a visible frame as both an accepted place and an open search.
- Suppressed the overlay whenever the current query is already a settled local
  place, even if stale suggestion/search state still exists.
- Replaced the birth-place input's browser autocomplete hint with stronger
  non-profile attributes: `autocomplete="off"`, `data-lpignore`,
  `data-1p-ignore`, and `data-form-type="other"`.
- Extended the regression gate to inspect the immediate exact-typed state after
  `Petlad`, not only the final settled state.

### Supplemental Evidence

- `node --check scripts/run-birth-place-autocomplete-gate.mjs`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:birth-place-autocomplete`: PASS. `exactImmediateHasSearchingPlaces=false`, `exactImmediateHasMixedOptionAndSearching=false`, exact `Petlad` resolves to `Petlad, Gujarat, India`, suggestions are unmounted, refocus stays closed, and no horizontal overflow is present.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS, `4` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/kundli corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

### Supplemental Result

Green. Known local birth places now settle before the user can see a half-open
search state, and browser profile/autofill UI is more aggressively discouraged
from colliding with Predicta's custom place picker.

## Human Typing Sticky-Panel Reaudit

Date: 2026-06-12

### Additional Fix

- Strengthened `scripts/run-birth-place-autocomplete-gate.mjs` with a
  character-by-character human typing scenario.
- The gate now reloads the Kundli page, focuses the birth-place input, types
  `Petlad` through Chrome input events, and fails if the suggestion panel,
  `Searching places...`, or the mixed option/searching state remains visible.
- This protects the exact screenshot failure mode where a Petlad suggestion and
  stale searching receipt could appear together.

### Supplemental Evidence

- `node --check scripts/run-birth-place-autocomplete-gate.mjs`: PASS.
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:birth-place-autocomplete`: PASS. Human typing settles to `Petlad, Gujarat, India`; suggestions are unmounted; `Searching places...` is absent; no mixed option/searching state remains.
- `PREDICTA_AUTOCOMPLETE_BASE_URL=https://predicta.rudraix.com corepack pnpm test:birth-place-autocomplete`: PASS with the same human typing proof on the deployed app.

### Supplemental Result

Green. The current local and deployed builds do not reproduce the sticky
Petlad autocomplete panel. The regression gate now covers both scripted input
and real character-by-character typing so the issue cannot silently return.
