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
- Extend the regression gate to verify the dropdown remains closed after the
  selected field is focused again.

## Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3036 corepack pnpm test:birth-place-autocomplete`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3036 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/kundli corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3036 corepack pnpm test:ui-personal-space`
- `corepack pnpm test:global-translation-coverage`

## Result

Green. The Petlad selection resolves to `Petlad, Gujarat, India`, the suggestion
panel unmounts, `Searching places...` disappears, refocusing the selected field
does not reopen the panel, and the Kundli route has no checked overflow or
personal-space regressions.
