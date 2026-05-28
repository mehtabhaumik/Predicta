# Phase 7C Responsive Layout Contract

Phase ID: `PREDICTA_AUDIT_1_PHASE_7C_RESPONSIVE_BREAKPOINT_MATRIX_AND_LAYOUT_CONTRACT`

This contract makes responsive behavior explicit so future work does not add
improvised one-off layouts that only pass one phone width.

## Device Classes

The strict matrix covers:

- `mobile-320`: smallest supported portrait phone.
- `mobile-360`: narrow Android portrait.
- `mobile-390`: current default iPhone-class portrait.
- `mobile-430`: large phone portrait.
- `mobile-landscape-568`: short landscape phone.
- `tablet-768`: portrait tablet.
- `tablet-834`: large portrait tablet.
- `tablet-landscape-1024`: tablet landscape and small laptop crossover.
- `laptop-1280`: compact laptop.
- `desktop-1440`: standard desktop.
- `desktop-1728`: large desktop.
- `ultrawide-1920`: ultrawide desktop.

## Public Shell

Public pages use the shared page gutter and max-content rhythm. Hero content,
trust panels, legal/safety cards, pricing cards, and checkout panels must not
touch the viewport edge on mobile or become over-wide on desktop and ultrawide.
Primary CTAs stay visible above the first meaningful fold where the page has a
conversion goal.

## Dashboard Shell

Dashboard pages use the dashboard max-width, responsive page gutter, and safe
sticky behavior. Top navigation, route headings, sidebars, and action bars must
stack before they squeeze. No dashboard surface may depend on hidden horizontal
scroll to remain readable.

## Report Composer

The report composer remains a compact selection surface. School navigation can
be horizontal on tablet/desktop but must stack or wrap cleanly on mobile. The
selected report action panel must stay inside the selected lane and must not
force users to hunt below unrelated sections.

## Specialist Rooms

Vedic, KP, Nadi, Numerology, and Signature rooms use the specialist frame,
unique hero interaction, one dominant action, secondary chat entry, collapsed
proof disclosure, and responsive card rhythm. The rooms may look distinct, but
their gutters, touch targets, and breakpoint behavior must remain consistent.

## Charts and Kundli Surfaces

Charts preserve aspect ratio and containment before typography scale. Kundli
boards, chart cards, radar panels, and number/signature visuals must scale down
inside their parent before labels collide with page edges.

## Primitive State Surfaces

Modals, drawers, dropdowns, tabs, tables, empty states, loading states, success
states, and error states are part of the responsive contract. They must be
captured in the Phase 7C matrix even when a route does not naturally expose all
states at once.

## Hard Failure Rules

- No accidental horizontal page scroll.
- No clipped text unless the element intentionally uses an ellipsis affordance.
- No visible CTA may be off-screen or below the minimum tappable size.
- No sticky or fixed element may cover most of a small viewport.
- No route may lose its expected identity text at any required breakpoint.
- No route may pass without a screenshot saved for the exact breakpoint.
