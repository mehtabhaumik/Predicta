# PREDICTA_AUDIT_1_PHASE_9_NATIVE_MOBILE_UI_UX_PARITY_AUDIT_AND_FIX

## Contract

Native mobile must feel like the same premium Predicta product as web, while
respecting native constraints. This phase is not green from TypeScript alone.

## Required Native Guarantees

- Shared `Screen` owns safe-area, keyboard avoidance, adaptive horizontal
  padding, and scroll keyboard behavior.
- Report builder keeps the selected report and download action near the user,
  with marketplace and section customization hidden until explicitly expanded.
- Settings keeps critical account/language/security controls visible while
  support/legal links remain behind an intentional disclosure.
- Saved Kundlis exposes primary actions first and moves destructive/secondary
  actions behind a `More actions` disclosure per record.
- Paywall shows clear selected plan state and a price-aware primary checkout
  CTA.
- Login and birth-detail forms expose accessible labels, safe keyboard behavior,
  selected states, and touch-safe option controls.
- Native modals declare modal accessibility and expose touch-safe close actions.

## Device Evidence

The Phase 9 gate must save device-class screenshot evidence for:

- iPhone SE
- iPhone 15
- small Android
- tablet
- large tablet

## Green Criteria

- `corepack pnpm test:audit1-phase-9` passes.
- Native source assertions pass for safe-area, keyboard, density, disclosure,
  touch target, modal, form, payment, report, and saved-library behavior.
- Screenshot manifest records five device-class screenshots.
- Carry-forward checks for native TypeScript, Audit 1 Phase 8, and web/mobile
  visual proof remain green.
