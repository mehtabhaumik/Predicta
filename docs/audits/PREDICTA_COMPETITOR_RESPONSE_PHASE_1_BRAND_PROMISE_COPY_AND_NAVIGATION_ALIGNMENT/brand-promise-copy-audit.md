# PREDICTA_COMPETITOR_RESPONSE_PHASE_1_BRAND_PROMISE_COPY_AND_NAVIGATION_ALIGNMENT

Status: GREEN

## Scope

This phase aligns the first-touch product promise and navigation-adjacent copy
with the locked competitor-response position:

> Predicta is the premium evidence-backed astrology intelligence app for people
> who want real guidance, not fear, fluff, or per-minute astrologer pressure.

This phase does not rewrite report chapters, report prediction engines, chat
reasoning, or pricing entitlement logic. Those remain controlled by later
competitor-response and report-final phases.

## Updated Source Of Truth

Created a dedicated localization-ready copy source:

- `packages/config/src/translations/competitorResponse.json`
- `packages/config/src/competitorResponse.ts`
- `packages/config/src/index.ts`

The copy source now controls the public hero, landing narrative, dashboard
welcome/depth panels, report-page intro, and public header tagline.

## Surfaces Aligned

- Public hero now promises real chart guidance, not fear or fluff.
- Header tagline now says evidence-backed guidance instead of generic holistic
  astrology.
- Landing capability copy now names specialist-world separation and Life Atlas
  as the only synthesis lane.
- Landing intelligence copy now states chart math first and AI as synthesis,
  not astrology invention.
- Dashboard first-run and active states now use prediction-first, evidence-backed
  language.
- Report page intro now tells users to choose a school or Life Atlas lane, then
  expect prediction, evidence, timing, and guidance.

## Strict Redline Checks

- Active navigation copy must not resurrect Nadi.
- Public product promise must not sound like a psychic marketplace.
- User-facing first-touch copy must not push per-minute pressure.
- Brand copy must not become a toolkit, lesson, or implementation contract.
- New copy must live in dedicated translation JSON rather than components.
- Free value and paid depth must both be visible.

## Known Deferred Work

The hardcoded report lane descriptions inside `WebDossierPreview` remain
deferred to report marketplace/report preview alignment phases because they are
tied to product lanes, entitlement behavior, and report-packaging contracts.
This phase only aligns the report-page entry promise, not the full report lane
contract.

## Audit Result

Code review found the phase-scoped copy source and wired surfaces aligned with
the locked benchmark. The Phase 1 gate, translation trust, localization
architecture, global translation coverage, config/web typecheck, production web
build, local production smoke, and diff hygiene passed.
