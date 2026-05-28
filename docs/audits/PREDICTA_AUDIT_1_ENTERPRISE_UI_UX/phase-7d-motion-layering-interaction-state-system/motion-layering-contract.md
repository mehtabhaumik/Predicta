# Predicta Motion, Layering, And Interaction State Contract

Phase ID: `PREDICTA_AUDIT_1_PHASE_7D_MOTION_LAYERING_AND_INTERACTION_STATE_SYSTEM`

This contract makes motion and layering part of the design system, not route
decoration. Every new interactive surface must use shared motion tokens,
z-index tokens, visible focus states, and reduced-motion fallbacks.

## Reveal Motion

Reveal Motion is for page, section, modal, and selected-card entry. It must use
`--predicta-motion-reveal` or `--predicta-motion-standard` with
`--predicta-ease-out`. It must never be the only way a user discovers content.
Static content must remain readable if animation is disabled.

## Feedback Motion

Feedback Motion is for taps, selections, toggles, uploads, report selection,
chat actions, payment actions, and signature confirmation. It must use
`--predicta-motion-fast` and the shared `.predicta-feedback-target` primitive
unless a component has a stronger primitive-level state contract.

Hover, focus, active, selected, loading, disabled, and error states must be
visibly distinct. Keyboard focus must remain visible on every button, link,
summary, input, select, and custom action target.

## Progress Motion

Progress Motion is for loading, scanning, report preparation, payment
readiness, and other waiting states. Signature scanning and report preparation
must use a progress primitive such as `.predicta-progress-scan`, not a
route-local animation. Progress visuals must clarify status without blocking
the next available action.

## Ambient Motion

Ambient Motion is optional and decorative. It is allowed only when it does not
reduce text contrast, does not distract from the primary CTA, and does not
continue aggressively under reduced-motion preferences.

## Overlay And Z-Index Contract

Layering must use the token ladder:

- `--predicta-z-base` for normal page content.
- `--predicta-z-raised` for local elevated content.
- `--predicta-z-sticky` for sticky CTAs, sticky chat input, and sticky headers.
- `--predicta-z-overlay` for backdrops, drawers, and screen-level scrims.
- `--predicta-z-modal` for modal panels and foreground overlay content.
- `--predicta-z-toast` for confirmations and temporary receipts.
- `--predicta-z-critical` only for emergency top-layer recovery states.

Raw global z-index values such as `10000`, `10001`, and `10002` are forbidden.
Modals must sit above drawers, sticky CTAs, dropdowns, chat utilities,
signature scan states, report composer states, and payment states.

## Reduced Motion Contract

Every animation and transition must respect `prefers-reduced-motion: reduce`.
Reduced motion must not hide progress, disable feedback, or remove visible
state changes. It may replace animation with instant state presentation.

## Keyboard Contract

All interactive motion and overlay states must remain keyboard reachable.
Focus must move predictably through actions, and the focused element must show a
visible outline or equivalent tokenized focus ring.

## Hard Failure Rules

- No arbitrary global z-index values.
- No route-local scan, reveal, or feedback animation without shared tokens.
- No overlay that covers a CTA without a visible close/cancel path.
- No animation that ignores reduced-motion preferences.
- No interactive element below the shared touch target.
- No report, payment, chat, signature, modal, drawer, dropdown, or sticky state
  can layer unpredictably against another.
