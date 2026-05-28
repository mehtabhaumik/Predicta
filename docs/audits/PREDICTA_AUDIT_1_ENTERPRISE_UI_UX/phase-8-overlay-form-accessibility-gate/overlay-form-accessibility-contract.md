# Phase 8 Overlay, Form, And Accessibility Contract

Phase ID: `PREDICTA_AUDIT_1_PHASE_8_OVERLAY_FORM_AND_ACCESSIBILITY_GATE`

This phase makes overlays and form actions behave like dependable product
infrastructure, not decorative panels.

## Focus Trap Contract

- Every modal, destructive dialog, report download dialog, help dialog, saved
  Kundli preview dialog, intro overlay, and mobile drawer must expose
  `role="dialog"` and `aria-modal="true"`.
- Dialogs must move focus into the dialog when opened.
- `Tab` and `Shift+Tab` must stay inside the dialog.
- `Escape` must close the dialog.
- Closing a dialog must return focus to the element that opened it when
  possible.

## Scroll And Layer Contract

- Open dialogs must lock document scroll.
- Backdrops must sit above sticky CTAs, drawers, menus, and page content.
- Drawer and modal z-index usage must come from shared Predicta layer tokens.
- Backdrop clicks may close only non-destructive dialogs; destructive flows must
  keep a clear explicit cancel action.

## Selector And Disclosure Contract

- Language selection must be keyboard operable with arrow keys, Home, and End.
- Selector controls must expose selected state through ARIA, not visual color
  alone.
- Details, disclosure, tab, and compact menu controls must keep at least a
  `44px` interaction target.

## Form Contract

- Every visible input, select, and textarea must have an accessible name from a
  label, ARIA label, title, or placeholder.
- Form labels, hints, error states, and controls must stay visually adjacent.
- Radio, checkbox, chip, and pill controls must expose selected/checked state.

## Cross-Platform Touch Contract

- Web buttons, links styled as buttons, summaries, checkbox controls, and
  compact chat/report controls must keep a `44px` touch target.
- Native mobile report, settings, paywall, and signature controls must expose
  accessibility roles and selected/checked state where applicable.
- Disabled controls must remain honest and discoverable; they cannot look like a
  primary enabled action.

## Evidence Contract

The Phase 8 gate must create:

- desktop, tablet, and mobile screenshots for report, signature, account,
  checkout, and feedback overlay/form surfaces
- a manifest with touch-target, form-label, dialog, selector, and keyboard
  checks
- source-level checks for the shared focus trap, report dialog, destructive
  dialog, auth dialog, language selector, and native touch/selection states
