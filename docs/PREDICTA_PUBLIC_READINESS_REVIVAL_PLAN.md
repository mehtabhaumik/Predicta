# Predicta Public Readiness Revival Plan

## Status

This roadmap records the earlier public-readiness recovery work. It is now
superseded for launch claims by the 2026-05-26 pre-live no-go audit in
[PREDICTA_PRE_LIVE_RUTHLESS_AUDIT_REMEDIATION_PHASES.md](./PREDICTA_PRE_LIVE_RUTHLESS_AUDIT_REMEDIATION_PHASES.md).

Predicta must not be called public-launch-ready until that newer remediation
spine is fully green.

This roadmap exists to turn the current product from a stitched dashboard with
real astrology capability into a launch-grade product that can earn trust,
money, birth data, and family data from conservative users.

This is not a feature wishlist.

This is a strict recovery plan for fixing launch blockers, trust failures,
astrology credibility leaks, localization gaps, IA confusion, and brittle
runtime behavior.

## Non-Negotiable Product Rule

Predicta must feel like:

- one product
- five first-class worlds
- calm
- trustworthy
- culturally respectful
- astrologically grounded
- easy for non-technical users
- safe for birth and family data
- worth paying for

It must not feel like:

- a dashboard shell
- a chatbot wrapper
- a half-translated tool
- an internal admin surface
- a fake astrology app
- a fragile prototype

## Launch Freeze Rule

Do not publicly position Predicta as launch-ready until every phase in this
document is complete and the final readiness gate passes.

No new growth, expansion, or visual experimentation work is allowed while any
critical public-readiness blocker from this document remains open.

## Recovery Principles

1. Fix trust surfaces before adding new capability.
2. Fix user-facing structure before tuning copy.
3. Fix Vedic credibility leaks before claiming premium authority.
4. Fix translation craft before promoting Hindi/Gujarati readiness.
5. Fix chat resilience before leaning on Predicta as the main product promise.
6. Fix family-data IA before pushing family retention or monetization.
7. Fix mobile and tablet behavior before calling any UI-facing phase complete.

## Phase Order

1. `PREDICTA_PUBLIC_PHASE_0_EVIDENCE_LOCK_AND_RELEASE_FREEZE`
2. `PREDICTA_PUBLIC_PHASE_1_NAVIGATION_AND_SHELL_REBUILD`
3. `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`
4. `PREDICTA_PUBLIC_PHASE_3_TRANSLATION_AND_LANGUAGE_TRUST_GATE`
5. `PREDICTA_PUBLIC_PHASE_4_WORLD_IDENTITY_AND_LOCAL_IA_REBUILD`
6. `PREDICTA_PUBLIC_PHASE_5_CHAT_RESILIENCE_AND_SPECIALIST_PRESENTATION`
7. `PREDICTA_PUBLIC_PHASE_6_REPORTS_AUTH_SETTINGS_AND_MONETIZATION_REBUILD`
8. `PREDICTA_PUBLIC_PHASE_7_LIBRARY_FAMILY_AND_DATA_CONFIDENCE_REBUILD`
9. `PREDICTA_PUBLIC_PHASE_8_FINAL_PUBLIC_READINESS_QA_GATE`

---

## Phase 0

### `PREDICTA_PUBLIC_PHASE_0_EVIDENCE_LOCK_AND_RELEASE_FREEZE`

### Goal

Lock the public-readiness problem statement so the team stops drifting into
random fixes, isolated polish, or new features.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_0_EVIDENCE_LOCK_AND_RELEASE_FREEZE`.
> Predicta is under a public-readiness freeze. Do not add new user-facing
> features. Do not widen scope. Convert the hostile audit findings into tracked
> blockers, route-level checklists, and a release-stop contract. The output of
> this phase must make it impossible to call Predicta launch-ready while known
> blockers remain. Preserve the product rule: one Predicta, five first-class
> worlds, shared user context, and no casual method mixing.

### Hard Rules

- No new product ideas.
- No marketing-driven changes.
- No launch-readiness claims.
- No phase completion without written blocker closure criteria.

### Required Output

- Blocker ledger grouped by route and severity:
  [PREDICTA_PUBLIC_BLOCKER_LEDGER.md](./PREDICTA_PUBLIC_BLOCKER_LEDGER.md)
- Clear ownership of each blocker cluster.
- A release-stop checklist tied to this roadmap:
  [PREDICTA_PUBLIC_RELEASE_STOP_CONTRACT.md](./PREDICTA_PUBLIC_RELEASE_STOP_CONTRACT.md)

### Exit Criteria

- Every critical and major finding from the hostile audit is mapped to a phase.
- The team has one source of truth for public-readiness recovery.
- Release governance references the public-readiness gate and blocker ledger.

---

## Phase 1

### `PREDICTA_PUBLIC_PHASE_1_NAVIGATION_AND_SHELL_REBUILD`

### Goal

Remove the internal-dashboard feel from public pages and app routes. Rebuild
global navigation, route chrome, and page scaffolding so the product feels
calm, premium, and intentional.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_1_NAVIGATION_AND_SHELL_REBUILD`.
> Remove the noisy shell that makes Predicta feel like an internal dashboard.
> Rebuild public navigation, app navigation, route headers, footer exposure,
> section labels, and CTA hierarchy so each route starts with the task, not
> with internal scaffolding. Kill `MAIN NAVIGATION`, `THIS SECTION`, repeated
> trust link stacks, duplicate language controls, and repeated `Open` framing
> where they weaken clarity. Mobile must use one compact drawer. Tablet must
> stay single-column where task focus matters. Public pages, dashboard pages,
> and chat pages must each have their own chrome rules.

### Hard Rules

- No route may open with admin-style scaffolding above the real task.
- Chat pages keep no footer.
- Mobile must not show a pseudo-sidebar experience.
- Non-clickable badges must not look interactive.

### Priority Routes

- `/`
- `/dashboard`
- `/dashboard/report`
- `/dashboard/settings`
- `/dashboard/saved-kundlis`
- `/dashboard/family`
- `/dashboard/vedic/chat`

### Exit Criteria

- Landing feels like a premium product, not a nav dump.
- App pages open into the task itself.
- Mobile navigation is compact, obvious, and non-repetitive.
- Footer and trust-link behavior follows route type intentionally.

---

## Phase 2

### `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`

### Goal

Make Kundli creation, active-Kundli success states, and default Vedic chart
presentation feel trustworthy and method-safe.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`.
> Fix the first serious astrology moment in Predicta: Kundli creation and the
> first chart the user sees. After creation, the app must move into a decisive
> active-reading state, not remain trapped in a “Create your Kundli first”
> route identity. Remove or explicitly gate method-breaking Vedic chart output
> such as Uranus, Neptune, and Pluto on the default D1 surface unless the
> product has a clear advanced disclosure rule. Reduce advanced micro-point
> clutter on the primary chart layer. Preserve real place search quality,
> timezone confirmation, keyboard house access, and chart context handoff.

### Hard Rules

- No success state may still read like a pre-success state.
- Default Vedic D1 must stay method-clean.
- Advanced points must not dominate the primary chart layer.
- Chart CTA handoff must preserve active Kundli and selected context.

### Required Scope

- Kundli creation
- Confirmation step
- Success routing/state
- Active Kundli panel
- Default Vedic D1 chart labels
- House accessibility labels
- Chart proof framing

### Exit Criteria

- Kundli completion feels conclusive and premium.
- Default Vedic chart no longer leaks credibility-breaking method drift.
- The first chart experience is clear for non-experts.

---

## Phase 3

### `PREDICTA_PUBLIC_PHASE_3_TRANSLATION_AND_LANGUAGE_TRUST_GATE`

### Goal

Make English, Hindi, and Gujarati feel production-ready across prominent
surfaces, especially trust, auth, pass, settings, reports, and world pages.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_3_TRANSLATION_AND_LANGUAGE_TRUST_GATE`.
> Treat all visible mixed-language leaks as release blockers. Audit and fix
> app copy, world pages, trust pages, account flows, report surfaces, modals,
> buttons, chips, empty states, and feedback surfaces so Hindi uses proper
> Hindi script, Gujarati uses proper Gujarati script, and English leaks appear
> only where culturally expected. The Redeem Pass experience must be fully
> localized. Settings must not duplicate language labels. Numerology naming
> must become consistent across languages.

### Hard Rules

- No prominent English leak on a localized route.
- No half-translated trust or access page.
- No random script mixing.
- No duplicated language controls that create uncertainty.

### Must-Fix Routes

- `/dashboard/redeem-pass`
- `/dashboard/settings`
- `/dashboard/report`
- `/dashboard/kp`
- `/dashboard/nadi`
- `/feedback`
- all five world landing pages

### Exit Criteria

- Hindi and Gujarati look deliberate, not machine-covered.
- Trust/access pages meet the same localization bar as feature pages.
- Language switching does not expose naming inconsistency or duplicate labels.

---

## Phase 4

### `PREDICTA_PUBLIC_PHASE_4_WORLD_IDENTITY_AND_LOCAL_IA_REBUILD`

### Goal

Make Vedic, KP, Nadi, Numerology, and Signature feel like real first-class
worlds inside one coherent Predicta product.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_4_WORLD_IDENTITY_AND_LOCAL_IA_REBUILD`.
> Rebuild the five Predicta worlds so they no longer feel like themed tabs
> inside one generic dashboard. Each world needs its own page hierarchy, proof
> style, action emphasis, report path, and obvious “Chat with Predicta” CTA.
> Keep shared profile, shared Kundli, shared language, and shared session
> state. Do not fragment the product into five disconnected products. Reduce
> generic repeated cards and replace them with world-specific task framing.

### Hard Rules

- One Predicta system underneath.
- Five first-class worlds in the user experience.
- No method mixing unless explicitly framed as handoff or synthesis.
- Local world navigation shows only relevant actions.

### Required Scope

- `/dashboard/vedic`
- `/dashboard/kp`
- `/dashboard/nadi`
- `/dashboard/numerology`
- `/dashboard/signature`

### Exit Criteria

- Each world feels distinct in purpose and proof style.
- Cross-world consistency remains intact.
- Users do not need to decode the structure to understand where they are.

---

## Phase 5

### `PREDICTA_PUBLIC_PHASE_5_CHAT_RESILIENCE_AND_SPECIALIST_PRESENTATION`

### Goal

Make Predicta chat resilient, calm, room-aware, and credible even when state is
partial, stale, or missing.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_5_CHAT_RESILIENCE_AND_SPECIALIST_PRESENTATION`.
> Keep the specialist-room model, but remove brittle runtime behavior and
> system-style narration. Direct loads, stale local storage, missing active
> Kundli, and partial session state must never crash a chat route. Replace
> client-side exceptions with recoverable flows such as selecting a saved
> Kundli, recreating one, or continuing without the missing context where safe.
> Reduce mechanical setup narration and let the room prove itself through
> grounded answers, chart proof, and clean helper affordances.

### Hard Rules

- No client-side crash on chat route entry.
- No method drift across specialist rooms.
- No footer on chat routes.
- No oversized action clutter around the conversation.

### Required Scope

- `/dashboard/vedic/chat`
- `/dashboard/kp/chat`
- `/dashboard/nadi/chat`
- `/dashboard/numerology/chat`
- `/dashboard/signature/chat`

### Exit Criteria

- All room chat routes recover gracefully from bad local state.
- Specialist-room shells feel premium instead of mechanical.
- Chat keeps context without demanding users understand internal setup.

---

## Phase 6

### `PREDICTA_PUBLIC_PHASE_6_REPORTS_AUTH_SETTINGS_AND_MONETIZATION_REBUILD`

### Goal

Rebuild the product’s high-stakes trust and monetization surfaces so they feel
worth paying for and safe to create an account in.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_6_REPORTS_AUTH_SETTINGS_AND_MONETIZATION_REBUILD`.
> Fix the routes where users decide whether Predicta deserves money and personal
> identity. Redesign report selection into a clear outcome-led chooser. Remove
> paragraph-buttons and premature export clutter. Rebuild settings and auth
> into a calmer trust shell with cleaner account continuity, language control,
> and privacy framing. Upgrade monetization moments so they appear after value,
> not before trust.

### Hard Rules

- Report selection must be legible on mobile.
- Account creation must feel calm and high-trust.
- Export actions belong inside clean report/chat flows, not in cluttered
  selection surfaces.
- Premium value must be outcome-based, not desperate.

### Priority Routes

- `/dashboard/report`
- `/dashboard/settings`
- sign-in modal
- `/pricing`
- `/checkout`
- `/dashboard/premium`
- `/dashboard/redeem-pass`

### Exit Criteria

- Report choice is fast and obvious.
- Auth and settings feel premium instead of noisy.
- Monetization no longer undermines trust.

---

## Phase 7

### `PREDICTA_PUBLIC_PHASE_7_LIBRARY_FAMILY_AND_DATA_CONFIDENCE_REBUILD`

### Goal

Clarify saved-Kundli storage, active-Kundli control, family profiles, and the
boundary between personal and family data so users feel safe storing household
information.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_7_LIBRARY_FAMILY_AND_DATA_CONFIDENCE_REBUILD`.
> Rebuild Kundli Library and Family Vault information architecture so users can
> instantly tell the difference between “my saved Kundlis” and “family-level
> relationship/pattern features.” Remove templated repetition and weak “Open”
> framing. Make creation, switching, editing, deletion, family profile setup,
> and Predicta handoff obvious. Destructive flows must feel branded, careful,
> and reversible where appropriate.

### Hard Rules

- Personal saved-Kundli storage and family-layer features must be visually and
  conceptually distinct.
- Family surfaces must feel more careful than ordinary dashboard sections.
- Destructive actions must not rely on browser-native confirms.

### Required Scope

- `/dashboard/saved-kundlis`
- `/dashboard/family`
- active Kundli switch/edit/delete surfaces
- family profile creation and map entry points

### Exit Criteria

- Library and family IA are obvious on first view.
- Data stewardship feels careful enough for household use.
- Predicta context handoff from library/family actions remains intact.

---

## Phase 8

### `PREDICTA_PUBLIC_PHASE_8_FINAL_PUBLIC_READINESS_QA_GATE`

### Goal

Fail any remaining surface that still looks unfinished, mixed-language,
method-unsafe, cluttered, cramped, or brittle.

### Exact Phase Prompt

> Execute `PREDICTA_PUBLIC_PHASE_8_FINAL_PUBLIC_READINESS_QA_GATE`.
> Perform a ruthless release audit across landing, dashboard, all five worlds,
> all five chat rooms, Kundli creation, reports, library, family, account,
> pricing, checkout, trust pages, pass flow, and localization. Test desktop,
> tablet, and mobile. Attempt stale state, guest state, incomplete state,
> mixed-language state, and destructive flows. Do not mark Predicta ready if
> any route still feels like a dashboard shell, a half-translated product, a
> fake astrology tool, a cluttered monetization funnel, or a brittle chat app.

### Hard Rules

- Zero critical blockers.
- Zero prominent translation leaks.
- Zero method-credibility leaks on default Vedic surfaces.
- Zero chat route crashes from recoverable bad state.
- Zero mobile two-column regressions on task-first pages.

### Required Validation

```bash
python3 -m pytest backend/tests/test_astro_api.py -q
python3 -m pytest backend/tests/test_safety_red_team_evals.py -q
pnpm typecheck
pnpm test
pnpm build:web
git diff --check
python3 -m backend.astro_api.release_governance
```

### Required Live Smoke Matrix

- Desktop 1440px
- Tablet 768px or iPad class
- Mobile 390px or iPhone class

### Required Route Matrix

- `/`
- `/dashboard`
- `/dashboard/kundli`
- `/dashboard/vedic`
- `/dashboard/kp`
- `/dashboard/nadi`
- `/dashboard/numerology`
- `/dashboard/signature`
- `/dashboard/vedic/chat`
- `/dashboard/kp/chat`
- `/dashboard/nadi/chat`
- `/dashboard/numerology/chat`
- `/dashboard/signature/chat`
- `/dashboard/report`
- `/dashboard/saved-kundlis`
- `/dashboard/family`
- `/dashboard/settings`
- `/dashboard/redeem-pass`
- `/pricing`
- `/checkout`
- `/accuracy-method`
- `/safety`
- `/legal`
- `/founder`
- `/feedback`

### Exit Criteria

- Product feels public-ready to a demanding conservative user.
- No major route creates doubt about trust, astrology credibility, or data
  safety.
- Release governance returns `READY`.

---

## Phase Summary List

1. `PREDICTA_PUBLIC_PHASE_0_EVIDENCE_LOCK_AND_RELEASE_FREEZE`
2. `PREDICTA_PUBLIC_PHASE_1_NAVIGATION_AND_SHELL_REBUILD`
3. `PREDICTA_PUBLIC_PHASE_2_KUNDLI_ENTRY_AND_CHART_CREDIBILITY_REBUILD`
4. `PREDICTA_PUBLIC_PHASE_3_TRANSLATION_AND_LANGUAGE_TRUST_GATE`
5. `PREDICTA_PUBLIC_PHASE_4_WORLD_IDENTITY_AND_LOCAL_IA_REBUILD`
6. `PREDICTA_PUBLIC_PHASE_5_CHAT_RESILIENCE_AND_SPECIALIST_PRESENTATION`
7. `PREDICTA_PUBLIC_PHASE_6_REPORTS_AUTH_SETTINGS_AND_MONETIZATION_REBUILD`
8. `PREDICTA_PUBLIC_PHASE_7_LIBRARY_FAMILY_AND_DATA_CONFIDENCE_REBUILD`
9. `PREDICTA_PUBLIC_PHASE_8_FINAL_PUBLIC_READINESS_QA_GATE`

## Execution Recommendation

Do not skip ahead.

Run the phases in order.

If a later phase exposes an earlier structural weakness, reopen the earlier
phase and close the gap there instead of layering more patchwork on top.
