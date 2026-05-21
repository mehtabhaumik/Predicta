# Predicta Public Blocker Ledger

## Purpose

This ledger turns the hostile public-readiness audit into concrete release
blockers.

Public-readiness evidence was re-audited locally and on the deployed App
Hosting surface on 2026-05-21. All Critical and Major blockers below are now
closed against the current audited build.

Public launch is blocked until:

- every `Critical` blocker is closed
- every `Major` blocker is closed or explicitly downgraded through evidence
- the final readiness gate in
  [PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md](./PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md)
  passes

This is not a backlog of ideas.

This is the release-stop ledger for public readiness.

## Severity Rules

- `Critical`: public release blocker; no exception
- `Major`: trust, credibility, localization, or runtime blocker; no public
  launch while open
- `Medium`: must be resolved before launch if it compounds trust, clarity, or
  usability
- `Minor`: can be deferred only if it has no trust, data, or launch impact

## Ownership Model

Because this ledger lives in the repo, ownership is assigned by code area, not
by person.

- `Shell/Nav`: `apps/web/components/DashboardShell.tsx`,
  `apps/web/components/WebFooter.tsx`, `apps/web/components/HeroSection.tsx`
- `Kundli/Charts`: `apps/web/components/WebKundliWizard.tsx`,
  `apps/web/components/WebKundliChart.tsx`, `packages/astrology/*`
- `Localization`: `packages/config/src/translations/ui.json`, route-level copy,
  world components
- `Chat`: `apps/web/components/WebPridictaChat.tsx`, specialist room panels,
  specialist room loaders, backend chat orchestration
- `Reports/Monetization`: report routes, pricing, premium, checkout, PDF/export
  surfaces
- `Account/Settings`: auth dialog, settings route, redeem-pass flow, account
  continuity surfaces
- `Library/Family`: saved Kundlis, active-Kundli actions, family map, family
  profile flows

## Blocker Ledger

### Critical

#### `PRB-001` Navigation overload and dashboard-shell first impression

- Status: Closed
- Severity: Critical
- Phase: `PREDICTA_PUBLIC_PHASE_1_NAVIGATION_AND_SHELL_REBUILD`
- Ownership: `Shell/Nav`
- Routes:
  - `/`
  - `/dashboard`
  - `/dashboard/report`
  - `/dashboard/settings`
  - `/dashboard/saved-kundlis`
  - `/dashboard/family`
  - `/dashboard/vedic/chat`
- Problem:
  - public and app routes open with shell noise before the task
  - repeated `MAIN NAVIGATION`, `THIS SECTION`, trust-link stacks, language
    controls, and generic CTAs create an internal-dashboard feel
- Close when:
  - route chrome is intentional by surface type
  - the first screenful starts with the task
  - mobile uses one compact drawer instead of exposed shell clutter

#### `PRB-002` Kundli completion does not feel complete

- Status: Closed
- Severity: Critical
- Phase: `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`
- Ownership: `Kundli/Charts`
- Routes:
  - `/dashboard/kundli`
- Problem:
  - after Kundli creation, the route still reads `Create your Kundli first`
  - the success state is embedded inside a creation flow instead of becoming a
    decisive active-reading state
- Close when:
  - post-creation route state is conclusive
  - H1, CTA hierarchy, and visual structure all reflect successful creation
  - next step is singular and obvious

#### `PRB-003` Redeem Pass trust surface is untranslated in Hindi and Gujarati

- Status: Closed
- Severity: Critical
- Phase: `PREDICTA_PUBLIC_PHASE_3_TRANSLATION_AND_LANGUAGE_TRUST_GATE`
- Ownership: `Account/Settings`, `Localization`
- Routes:
  - `/dashboard/redeem-pass`
- Problem:
  - trust, access, and paid-entry copy is still visibly English on localized
    routes
- Close when:
  - the entire redeem-pass route is fully localized in `hi` and `gu`
  - helper copy, state messages, and CTA text all meet the same standard as
    primary product routes

#### `PRB-004` Default Vedic D1 surface leaks outer planets

- Status: Closed
- Severity: Critical
- Phase: `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`
- Ownership: `Kundli/Charts`
- Routes:
  - `/dashboard/kundli`
  - any Vedic D1 chart surface reusing the same renderer/accessibility labels
- Problem:
  - default Vedic D1 house labels include Uranus, Neptune, and Pluto
  - this damages method trust unless the product explicitly frames an advanced,
    optional, non-classical view
- Close when:
  - default Vedic D1 output is method-clean
  - any optional non-classical points are clearly disclosed and gated

### Major

#### `PRB-005` Prominent mixed-language leaks on localized routes

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_3_TRANSLATION_AND_LANGUAGE_TRUST_GATE`
- Ownership: `Localization`
- Routes:
  - `/dashboard/kp`
  - `/dashboard/nadi`
  - `/dashboard/report`
  - `/dashboard/settings`
  - `/feedback`
  - all world landing pages
- Problem:
  - visible English leaks such as `Open`, `Story links`, `confusion`, and
    duplicate `English` labels make localized routes feel unfinished
- Close when:
  - no prominent English leak remains on `hi` or `gu` routes
  - naming is consistent across language variants

#### `PRB-006` Advanced micro-points crowd the first chart layer

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`
- Ownership: `Kundli/Charts`
- Routes:
  - `/dashboard/kundli`
  - chart surfaces using the same label strategy
- Problem:
  - points like `Vyatipata`, `Dhuma`, `Parivesha`, `Mandi`, `Upaketu`,
    `Gulika`, and `Indrachapa` are exposed in the primary interaction layer
    without enough framing
- Close when:
  - the primary chart layer is understandable to non-experts
  - advanced points are disclosed contextually, not dumped into first contact

#### `PRB-007` Five worlds exist but still feel like themed dashboard tabs

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_4_WORLD_IDENTITY_AND_LOCAL_IA_REBUILD`
- Ownership: `Shell/Nav`, `Chat`, `Localization`
- Routes:
  - `/dashboard/vedic`
  - `/dashboard/kp`
  - `/dashboard/nadi`
  - `/dashboard/numerology`
  - `/dashboard/signature`
- Problem:
  - world-specific identity is too weak
  - shared scaffolding and repeated cards flatten the specialist experience
- Close when:
  - each world has clear local IA, proof style, task hierarchy, and chat/report
    path
  - shared product context remains smooth underneath

#### `PRB-008` Report chooser is cluttered, verbose, and weak on mobile

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_6_REPORTS_AUTH_SETTINGS_AND_MONETIZATION_REBUILD`
- Ownership: `Reports/Monetization`, `Localization`
- Routes:
  - `/dashboard/report`
- Problem:
  - report cards behave like paragraph-buttons
  - export/copy actions appear before a clean report-selection journey exists
- Close when:
  - report selection is outcome-led, legible, and clean on mobile/tablet
  - export actions live inside an intentional report flow

#### `PRB-009` Settings and auth surfaces feel busy and low-trust

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_6_REPORTS_AUTH_SETTINGS_AND_MONETIZATION_REBUILD`
- Ownership: `Account/Settings`, `Localization`
- Routes:
  - `/dashboard/settings`
  - sign-in modal
- Problem:
  - repeated language controls, dense helper copy, and inherited shell noise
    weaken trust on identity and privacy surfaces
- Close when:
  - settings and auth feel calm, premium, and purpose-built
  - account continuity and language controls are clear without repetition

#### `PRB-010` Chat routes are brittle under incomplete or stale state

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_5_CHAT_RESILIENCE_AND_SPECIALIST_PRESENTATION`
- Ownership: `Chat`
- Routes:
  - `/dashboard/vedic/chat`
  - `/dashboard/kp/chat`
  - by extension all specialist-room chat entry points
- Problem:
  - direct chat loads with incomplete state can fail into a client-side
    application error instead of a recoverable flow
- Close when:
  - stale, missing, or partial local state never crashes a room route
  - room entry gracefully recovers through selection or re-creation

#### `PRB-011` Library and Family Vault information architecture is muddy

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_7_LIBRARY_FAMILY_AND_DATA_CONFIDENCE_REBUILD`
- Ownership: `Library/Family`, `Shell/Nav`, `Localization`
- Routes:
  - `/dashboard/saved-kundlis`
  - `/dashboard/family`
- Problem:
  - the distinction between personal saved Kundlis and family-layer features is
    weak
  - repeated `Open`/section framing makes the data model feel templated
- Close when:
  - users can instantly tell what is personal, what is family-level, and how
    data flows between them
  - family actions feel careful enough for household data

#### `PRB-012` Internal/system-style wording weakens product trust

- Status: Closed
- Severity: Major
- Phase: `PREDICTA_PUBLIC_PHASE_5_CHAT_RESILIENCE_AND_SPECIALIST_PRESENTATION`
- Ownership: `Chat`, `Shell/Nav`, `Localization`
- Routes:
  - chat preload surfaces
  - dashboard helper copy
  - settings
  - reports
- Problem:
  - copy still sounds like system scaffolding instead of calm product language
- Close when:
  - specialist rooms and app routes speak plainly and briefly
  - process narration is removed unless it helps trust or recovery

## Route-Level Checklists

### Public and shared-shell routes

- `/`
- `/dashboard`
- `/pricing`
- `/accuracy-method`
- `/safety`
- `/legal`
- `/founder`
- `/feedback`

Checklist:

- task or narrative starts before shell clutter
- route chrome matches public-surface expectations
- mobile header/nav stays compact
- localized variants do not leak visible English

### Kundli and chart routes

- `/dashboard/kundli`
- active chart surfaces

Checklist:

- place search remains high quality
- confirmation state is clear before creation
- post-creation state is conclusive
- default Vedic chart is method-clean
- first chart layer is understandable to non-experts

### World landing routes

- `/dashboard/vedic`
- `/dashboard/kp`
- `/dashboard/nadi`
- `/dashboard/numerology`
- `/dashboard/signature`

Checklist:

- world identity is distinct
- obvious room-specific chat CTA exists
- local navigation is relevant
- proof style matches the world
- no mixed-language leakage

### Specialist-room chat routes

- `/dashboard/vedic/chat`
- `/dashboard/kp/chat`
- `/dashboard/nadi/chat`
- `/dashboard/numerology/chat`
- `/dashboard/signature/chat`

Checklist:

- room loads without crashing under stale/missing state
- footer remains hidden
- context recovery is graceful
- specialist presentation is calm, not mechanical
- mobile thread stays readable and single-column

### Trust, account, and monetization routes

- `/dashboard/settings`
- `/dashboard/redeem-pass`
- `/dashboard/report`
- `/dashboard/premium`
- `/checkout`

Checklist:

- trust copy is fully localized
- auth and settings feel premium
- monetization is outcome-led
- report selection is legible on mobile
- no cluttered export-before-value flow

### Saved-data routes

- `/dashboard/saved-kundlis`
- `/dashboard/family`

Checklist:

- personal vs family storage is obvious
- destructive actions feel branded and careful
- active-Kundli control is easy to understand
- data handoff into Predicta stays intact

## Green Rule For Phase 0

Phase 0 is green only when:

- this ledger exists
- every critical and major public blocker is mapped to a phase
- every blocker has ownership and close criteria
- the release-stop contract exists
- release governance is updated to reference the public-readiness gate
