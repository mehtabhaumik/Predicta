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
