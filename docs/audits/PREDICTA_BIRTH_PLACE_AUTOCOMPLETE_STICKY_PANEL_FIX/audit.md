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
