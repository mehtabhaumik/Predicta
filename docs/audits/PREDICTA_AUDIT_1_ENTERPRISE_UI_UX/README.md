# Predicta Audit 1 Enterprise UI/UX Evidence

This folder is the durable evidence bundle for
`PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md`.

## Canonical Audit Server

The canonical production-like local audit target is:

```text
http://127.0.0.1:3009
```

Audit scripts must not silently switch to `localhost:3000`, a random Next dev
server, or an in-app browser tab URL. If another port is inspected, it must be
recorded as observed evidence, not treated as the canonical target.

## Phase 0 Locked Evidence

Phase 0 records the current server ambiguity and makes browser audit scripts
fail fast when a route is not a healthy Predicta page.

Artifacts:

- `audit-server-contract.json`: canonical URL, disallowed URLs, and observed
  broken URL.
- `route-list.json`: routes that Audit 1 must cover.
- `phase-0-evidence-lock/phase-0-evidence-manifest.json`: exact commands,
  environment, exit statuses, and log paths.
- `phase-0-evidence-lock/logs/`: raw stdout/stderr for audit commands.
- `phase-0-evidence-lock/screenshots/`: visual proof output location when the
  visual gate reaches screenshot capture.

## Strict Rule

Browser audits must prove all of the following before measuring layout:

- route HTTP status is healthy
- visible content is recognizable as Predicta
- route-specific content is present
- no client-side error marker is visible
- expected Next/static styling assets are present

If any of those fail, the script must stop immediately instead of reporting
layout, overflow, or buyer-quality metrics for an invalid page.

## Phase 1 Server Recovery

Phase 1 makes the canonical audit server repeatable:

```bash
corepack pnpm audit:build
corepack pnpm audit:serve
corepack pnpm test:audit-server-preflight
corepack pnpm test:audit1-phase-1
```

`audit:build` creates the required production `.next/BUILD_ID`. `audit:serve`
starts the production-like local server on `http://127.0.0.1:3009`.

Phase 1 artifacts live in:

```text
phase-1-static-asset-app-shell-recovery/
```

The Phase 1 gate checks the canonical server, sampled `_next/static` CSS/JS
assets, route readiness, browser exceptions, and styled screenshots for the
required app-shell routes.

## Phase 2 Landing Hero Overflow Lock

Phase 2 proves the landing first impression does not leak horizontally:

```bash
corepack pnpm test:audit1-phase-2
```

The gate checks `/` at `320`, `360`, `390`, `430`, `768`, `834`, `1024`, and
`1440` widths. It fails on page horizontal overflow, landing Kundli label/planet
leakage outside the viewport or chart board, missing mobile density mode, hidden
above-fold CTA, or an `html/body overflow-x:hidden` masking fix.

Phase 2 artifacts live in:

```text
phase-2-landing-mobile-hero-overflow-lock/
```

## Phase 3 Trust Surface Repair

Phase 3 proves trust-critical public and account surfaces are real, readable,
and unclipped:

```bash
corepack pnpm test:audit1-phase-3
corepack pnpm test:ui-text-overflow
```

The Phase 3 gate checks account, settings, safety, legal, feedback, pricing, and
checkout at desktop, tablet, and mobile widths. It fails if `/dashboard/account`
redirects away, account/settings lack signed-in or signed-out continuity states,
the founder promise is clipped on safety, or any trust surface leaks/clips text.

Phase 3 artifacts live in:

```text
phase-3-safety-account-trust-surface-repair/
```

## Phase 4 Report Composer Action Density Rebuild

Phase 4 proves the report page behaves like a compact composer instead of a
control panel:

```bash
corepack pnpm test:audit1-phase-4
corepack pnpm test:pre-live-phase-13
PREDICTA_BUYER_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:buyer-rejection
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 4 gate checks `/dashboard/report` at desktop, tablet, and mobile
widths. It fails if desktop exposes more than 10 first-screen actions, tablet
more than 8, mobile more than 6, any form controls remain in the report
composer density path, the school tabs are not horizontal on desktop/tablet or
stacked full-width on mobile, closed marketplace/customization drawers still
paint hidden controls, or the selected report action panel is not directly under
the selected card.

Phase 4 artifacts live in:

```text
phase-4-report-composer-action-density-rebuild/
```

## Phase 5 Signature Scan Flow And Action Density Rebuild

Phase 5 proves Signature Predicta starts with one privacy-first staged scan
panel instead of spreading upload, draw, trait, preview, and report controls
across the page:

```bash
corepack pnpm test:audit1-phase-5
corepack pnpm test:signature-predicta
PREDICTA_BUYER_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:buyer-rejection
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 5 gate checks `/dashboard/signature` at desktop, tablet, and mobile
widths. It fails if the page exposes more than 12 visible buttons on
desktop/tablet or more than 8 on mobile, loses the staged scan panel, hides the
no-storage privacy assurance, omits the immediate receipt, allows the report
path to look available before confirmed traits, clips text, or leaks horizontal
overflow. It also source-checks mobile parity so mobile remains honest about
real capture availability and never manufactures signature traits.

Phase 5 artifacts live in:

```text
phase-5-signature-scan-flow-action-density-rebuild/
```

## Phase 6 Specialist Room Visual Identity And Progressive Disclosure

Phase 6 proves the five astrology worlds no longer feel like the same card stack
with different labels:

```bash
corepack pnpm test:audit1-phase-6
corepack pnpm test:specialist-room-qa
PREDICTA_BUYER_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:buyer-rejection
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 6 gate checks Vedic, KP, Nadi, Numerology, and Signature at desktop,
tablet, and mobile widths. It fails if any room lacks its unique hero
interaction, exposes method/proof cards outside a collapsed disclosure by
default, lets chat become the dominant primary CTA, loses its primary report or
guidance CTA, clips text, or leaks horizontal overflow.

Phase 6 artifacts live in:

```text
phase-6-specialist-room-visual-identity-progressive-disclosure/
```

## Phase 7 Global Layout Token And Component System Lock

Phase ID: `PREDICTA_AUDIT_1_PHASE_7_GLOBAL_LAYOUT_TOKEN_AND_COMPONENT_SYSTEM_LOCK`

Phase 7 proves the UI is no longer only visually reviewed; it has a source-level
design-system lock:

```bash
corepack pnpm test:audit1-phase-7
corepack pnpm --filter @pridicta/ui-tokens typecheck
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/mobile typecheck
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 7 gate fails if the shared token package does not expose semantic
colors, typography, spacing, radii, elevation, motion, z-index, breakpoints, and
primitive classes; if mobile does not consume the shared token package; if web
does not expose primitives for page shell, section stack, cards, action rows,
tabs, tables, forms, empty states, loading states, modals, and sticky CTAs; if
the CSS token aliases are missing; or if the Audit 2 drift metrics artifact is
not regenerated.

Phase 7 artifacts live in:

```text
phase-7-global-layout-token-component-system-lock/
phase-7-design-system-drift-metrics.json
```

## Phase 7A Design Token Single Source Of Truth

Phase ID: `PREDICTA_AUDIT_1_PHASE_7A_DESIGN_TOKEN_SINGLE_SOURCE_OF_TRUTH`

Phase 7A proves Predicta has one authoritative token contract for web, native
mobile, PDF/report rendering, and specialist-room UI surfaces:

```bash
corepack pnpm test:audit1-phase-7a
corepack pnpm test:audit1-phase-7
corepack pnpm --filter @pridicta/ui-tokens typecheck
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/mobile typecheck
corepack pnpm --filter @pridicta/pdf typecheck
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 7A gate fails if required semantic color, typography, spacing, radius,
elevation, motion, z-index, or breakpoint token names are missing; if mobile or
PDF stop consuming `@pridicta/ui-tokens`; if web CSS loses Predicta token
aliases; if mobile reintroduces local raw color literals; or if raw color,
radius, shadow, font-size, or z-index additions appear outside the token source,
documented artifact folders, or explicit token alias lines.

Phase 7A artifacts live in:

```text
phase-7a-design-token-single-source-of-truth/
phase-7a-design-token-drift-report.json
```

## Phase 7B Component Primitive Normalization

Phase ID: `PREDICTA_AUDIT_1_PHASE_7B_COMPONENT_PRIMITIVE_NORMALIZATION`

Phase 7B proves high-touch interactions use shared component primitives instead
of route-local button, panel, form, and state styling:

```bash
corepack pnpm test:audit1-phase-7b
corepack pnpm test:audit1-phase-7a
corepack pnpm test:audit1-phase-7
corepack pnpm --filter @pridicta/ui-tokens typecheck
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 7B gate fails if required primitives are not exported, if their CSS
classes are missing, if report/signature/specialist-room primary interactions
do not consume shared primitives, if disabled/loading/focus/hover/active/
selected/error examples are absent, or if generated desktop/tablet/mobile
component screenshots show missing primitives, horizontal overflow, or tap
targets below 44px.

Phase 7B artifacts live in:

```text
phase-7b-component-primitive-normalization/
phase-7b-component-primitive-normalization-manifest.json
screenshots/
```

## Phase 7C Responsive Breakpoint Matrix And Layout Contract

Phase ID: `PREDICTA_AUDIT_1_PHASE_7C_RESPONSIVE_BREAKPOINT_MATRIX_AND_LAYOUT_CONTRACT`

Phase 7C proves responsive behavior across the full device-class matrix instead
of only desktop, one tablet, and one phone:

```bash
corepack pnpm test:audit1-phase-7c
corepack pnpm test:audit1-phase-7b
corepack pnpm test:audit1-phase-7a
corepack pnpm test:audit1-phase-7
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 7C gate fails if any required route or responsive state surface loses
expected identity text, leaks horizontal overflow, clips text, exposes edge
collisions, hides CTAs, drops tappable targets below 44px, breaks sticky/fixed
viewport safety, or does not save a screenshot for every required route and
breakpoint.

Phase 7C artifacts live in:

```text
phase-7c-responsive-breakpoint-matrix-layout-contract/
phase-7c-responsive-breakpoint-matrix-manifest.json
responsive-layout-contract.md
screenshots/
```

## Phase 7D Motion Layering And Interaction State System

Phase ID: `PREDICTA_AUDIT_1_PHASE_7D_MOTION_LAYERING_AND_INTERACTION_STATE_SYSTEM`

Phase 7D proves Predicta motion, overlay layering, reduced-motion behavior, and
keyboard focus states are systemized instead of route-local:

```bash
corepack pnpm test:audit1-phase-7d
corepack pnpm test:audit1-phase-7c
corepack pnpm test:audit1-phase-7b
corepack pnpm test:audit1-phase-7a
corepack pnpm test:audit1-phase-7
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm test:visual-proof
corepack pnpm test:ui-text-overflow
```

The Phase 7D gate fails if motion tokens or CSS motion primitives are missing,
if forbidden global raw z-index values return, if modal/drawer/dropdown/sticky
CTA/chat/signature/report/payment layers are not ordered safely, if keyboard
focus is not visible, if reduced motion does not suppress progress/reveal
animation safely, or if generated desktop/tablet/mobile screenshots show
overflow or undersized touch targets.

Phase 7D artifacts live in:

```text
phase-7d-motion-layering-interaction-state-system/
phase-7d-motion-layering-interaction-state-manifest.json
motion-layering-contract.md
screenshots/
```
