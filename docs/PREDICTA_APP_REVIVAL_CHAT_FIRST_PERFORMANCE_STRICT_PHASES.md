# Predicta App Revival: Chat-First Astrology Experience And Performance Roadmap

Status: `NO-GO`
Created: 2026-06-10

This roadmap exists because Predicta has become too dashboard-like. The app has
powerful astrology, report, monetization, memory, and specialist-world systems,
but the user experience can still feel like stitched SaaS control panels instead
of a real astrology intelligence app.

This file is an additive execution spine. It does not replace:

- `PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md`
- `PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md`
- `PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md`
- `PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md`
- `PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md`

It closes the gap those roadmaps do not fully force: Predicta must be a fast,
simple, text-and-voice-first astrology companion before it is a dashboard.

## Current Evidence

The current app state proves the issue is structural, not just visual.

- `apps/web/app/page.tsx` is a client component, so the landing page carries
  client state and interactive weight before the user can ask anything.
- `apps/web/components/HeroSection.tsx` sends the primary hero CTA to
  `/dashboard`, not directly to the primary Predicta chat.
- `apps/web/app/dashboard/layout.tsx` wraps dashboard pages in
  `DashboardShell`, so chat still lives inside a control-panel shell.
- `apps/web/components/DashboardShell.tsx` exposes many routes and route groups
  before the user gets the emotional payoff of asking Predicta.
- Current built route manifest shows large route asset payloads:
  - landing `/`: about `3.48 MB` JS assets before compression
  - `/dashboard/chat`: about `3.47 MB` JS assets before compression
  - `/dashboard/report`: about `3.67 MB` JS assets before compression
  - largest shared chunks include about `1.6 MB` and `852 KB`

These numbers explain the user's complaint: links feel late, pages feel heavy,
and the app makes people navigate the machine instead of simply asking
Predicta.

## Product Rule

Predicta must feel like:

> Ask a living astrology intelligence first. Let Predicta open the right
> evidence, Kundli, report, payment, or specialist room only when needed.

Predicta must not feel like:

- a SaaS dashboard
- a control panel
- a report builder maze
- a toolkit
- a set of disconnected astrology pages
- a slow app where links feel uncertain

## Non-Negotiable Rules

1. Predicta chat is the front door.
2. The homepage primary CTA must take the user to Predicta, not a dashboard.
3. A user must be able to reach Predicta Chat directly from public navigation,
   mobile navigation, dashboard chrome, footer, and every specialist world.
4. Dashboard becomes `Library` or `My Astrology`; it is not the product home.
5. Specialist worlds become evidence rooms that Predicta can open.
6. No screen may make the user choose an astrology school before asking a
   normal life question.
7. Prediction and guidance come before education and technical proof.
8. Proof, reports, charts, passes, settings, and saved Kundlis are supporting
   surfaces.
9. Landing and chat performance budgets are release blockers.
10. Link-click latency is a release blocker.
11. Mobile must feel like a calm text/voice astrology app, not a squeezed
    desktop dashboard.
12. No phase is green from source review alone.
13. UI phases require desktop, tablet, mobile, and narrow-mobile proof.
14. Performance phases require build manifest proof and runtime click proof.
15. Each phase must be strictly audited, fixed, verified, and committed before
    the next phase starts.

## Target Experience

### First Screen

The first meaningful surface should be:

```text
What do you want to know?

[ Ask Predicta...                         ] [voice]

Try:
Will I go abroad?
When will my job improve?
What should I focus on now?
Should I generate my Kundli?
```

If the user has no Kundli, Predicta asks for birth details conversationally.

If the user has a Kundli, Predicta answers directly and opens evidence only when
needed.

### Navigation

Primary:

- `Ask Predicta`

Secondary:

- `My Kundlis`
- `Reports`
- `Library`
- `Pricing`

Evidence rooms:

- `Vedic`
- `KP`
- `Jaimini`
- `Numerology`
- `Signature`
- `Kundli Karma`

Evidence rooms must not visually compete with the primary Predicta experience.

## Approved Phase Order

1. `PREDICTA_APP_REVIVAL_PHASE_0_REDLINE_AUDIT_AND_BASELINE_LOCK`
2. `PREDICTA_APP_REVIVAL_PHASE_1_TOP_LEVEL_ASK_ROUTE_AND_DIRECT_CHAT_ENTRY`
3. `PREDICTA_APP_REVIVAL_PHASE_2_LANDING_CHAT_FIRST_REBUILD`
4. `PREDICTA_APP_REVIVAL_PHASE_3_DASHBOARD_TO_LIBRARY_DEMOTION`
5. `PREDICTA_APP_REVIVAL_PHASE_4_LIGHTWEIGHT_CHAT_SHELL_AND_TEXT_VOICE_FLOW`
6. `PREDICTA_APP_REVIVAL_PHASE_5_SPECIALIST_WORLDS_AS_EVIDENCE_ROOMS`
7. `PREDICTA_APP_REVIVAL_PHASE_6_ROUTE_BUNDLE_AND_LOAD_TIME_REBUILD`
8. `PREDICTA_APP_REVIVAL_PHASE_7_LINK_CLICK_LATENCY_AND_NAVIGATION_RELIABILITY`
9. `PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT`
10. `PREDICTA_APP_REVIVAL_PHASE_9_FULL_USER_JOURNEY_GOLDEN_NO_GO_AUDIT`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_APP_REVIVAL_PHASE_0_REDLINE_AUDIT_AND_BASELINE_LOCK`

### Goal

Lock the exact current-state failure before implementation.

### Must Audit

- Route inventory.
- Current public-to-chat click paths.
- Current dashboard-shell route hierarchy.
- Current header/footer primary CTA targets.
- Current route asset payloads from `.next/app-build-manifest.json`.
- Current click-to-visible-content timing for:
  - `/`
  - `/ask` if it exists
  - `/dashboard/chat`
  - `/dashboard`
  - `/dashboard/report`
  - `/dashboard/vedic`
  - `/dashboard/kp`
  - `/dashboard/jaimini`
- Current translation leaks on top navigation and chat-first surfaces.
- Current broken or late links.

### Must Produce

- Redline audit artifact.
- Route payload table.
- Direct-chat access map.
- Dashboard-maze map.
- Link reliability ledger.
- No-go criteria for app revival.

### Green Criteria

- Current failure is documented with file paths, route evidence, and payload
  numbers.
- No implementation starts until the redline is committed.

## Phase 1: `PREDICTA_APP_REVIVAL_PHASE_1_TOP_LEVEL_ASK_ROUTE_AND_DIRECT_CHAT_ENTRY`

### Goal

Make Predicta directly reachable without entering the dashboard maze.

### Must Implement

- Top-level `/ask` route or `/chat` route.
- Public header primary action points to `/ask`.
- Hero primary CTA points to `/ask`.
- Footer primary Predicta link points to `/ask`.
- Dashboard topbar `Ask Predicta` points to `/ask` while preserving active
  Kundli, source screen, selected school, selected report, or selected evidence
  context.
- `/dashboard/chat` remains available as compatibility or redirects cleanly.
- Mobile menu makes `Ask Predicta` the first and most visually important
  action.

### Must Not Do

- Remove dashboard chat compatibility.
- Drop existing chat context parameters.
- Break zero-credit deterministic chat mode.
- Break event-question routing.

### Green Criteria

- User can reach Predicta Chat from public landing in one click.
- User can reach Predicta Chat from any app route in one tap/click.
- Context handoff remains intact.
- Desktop, tablet, mobile, and narrow-mobile proof exists.

## Phase 2: `PREDICTA_APP_REVIVAL_PHASE_2_LANDING_CHAT_FIRST_REBUILD`

### Goal

Rebuild the landing page around one simple promise: ask Predicta.

### Must Implement

- Landing page starts with a text input and voice affordance.
- Suggested question chips are visible without scrolling.
- If no Kundli exists, Predicta starts a conversational Kundli intake.
- If a Kundli exists, Predicta can answer immediately.
- Remove dashboard-style capability grids from the first screen.
- Defer charts, testimonials, pricing, and report previews below the primary
  chat moment.

### Must Not Do

- Make landing a long product brochure before the user can act.
- Use the hero chart as the dominant first interaction on mobile.
- Route the primary action to `/dashboard`.

### Green Criteria

- First viewport clearly answers: "Ask Predicta now."
- Mobile first viewport has no horizontal overflow.
- User can begin a question without understanding Vedic, KP, Jaimini, or
  reports.

## Phase 3: `PREDICTA_APP_REVIVAL_PHASE_3_DASHBOARD_TO_LIBRARY_DEMOTION`

### Goal

Stop making dashboard the product center.

### Must Implement

- Rename the mental model from `Dashboard` to `Library` or `My Astrology`.
- Dashboard overview becomes a saved-work surface:
  - Kundlis
  - reports
  - Family Vault
  - passes
  - account/settings
- Predicta remains the primary action on the Library screen.
- Specialist rooms are grouped as evidence rooms, not equal top-level products.

### Green Criteria

- No first-run user lands in a dense dashboard when they intended to ask a
  question.
- Saved-work surfaces are useful but secondary.
- Existing routes remain reachable.

## Phase 4: `PREDICTA_APP_REVIVAL_PHASE_4_LIGHTWEIGHT_CHAT_SHELL_AND_TEXT_VOICE_FLOW`

### Goal

Make chat feel like the product, not a route inside a product.

### Must Implement

- Minimal chat shell outside heavy dashboard chrome.
- Text input always visible.
- Voice input placeholder/affordance if full voice stack is not ready.
- Event question chips.
- Kundli creation from chat.
- Zero-credit deterministic answers stay available.
- Upgrade gates appear only when AI synthesis is needed.
- Evidence drawers open only after the answer.

### Green Criteria

- Chat route has the lowest possible initial payload.
- Chat route loads faster than dashboard routes.
- User can create Kundli or ask a question from chat without navigating away.

## Phase 5: `PREDICTA_APP_REVIVAL_PHASE_5_SPECIALIST_WORLDS_AS_EVIDENCE_ROOMS`

### Goal

Preserve all specialist power while removing the feeling of disconnected
mini-apps.

### Must Implement

- Vedic, KP, Jaimini, Numerology, Signature, and Kundli Karma present as
  evidence rooms.
- Each room starts with:
  - direct meaning
  - one next action
  - evidence drawer
  - `Ask Predicta about this`
- No room opens with long educational copy.
- No room forces the user to learn astrology before receiving guidance.

### Green Criteria

- Specialist rooms are calm, short, and action-first.
- User understands why the room exists.
- Predicta can pull room context into a direct answer.

## Phase 6: `PREDICTA_APP_REVIVAL_PHASE_6_ROUTE_BUNDLE_AND_LOAD_TIME_REBUILD`

### Goal

Make the app feel fast enough to trust.

### Hard Budgets

- Landing route JS target: under `250 KB` before compression for page-specific
  code, excluding framework baseline.
- `/ask` route JS target: under `400 KB` before compression for page-specific
  code, excluding framework baseline.
- No public landing route may eagerly import heavy astrology engines.
- No public landing route may eagerly import report/PDF code.
- No public landing route may eagerly import dashboard shell code.
- Heavy charts, testimonials, pricing, reports, and specialist surfaces must be
  lazy or below-the-fold where possible.

### Must Implement

- Convert `apps/web/app/page.tsx` to a server component unless a documented
  blocker exists.
- Move language/client preference logic into a small client island.
- Dynamically import motion-heavy and chart-heavy landing sections.
- Split dashboard shell from chat shell.
- Audit large shared chunks and remove avoidable imports from landing/chat.

### Green Criteria

- Build manifest shows meaningful route payload reduction.
- Runtime smoke proves first render and click-to-chat are improved.
- No route loses translations or accessibility.

## Phase 7: `PREDICTA_APP_REVIVAL_PHASE_7_LINK_CLICK_LATENCY_AND_NAVIGATION_RELIABILITY`

### Goal

Make every major link feel immediate and trustworthy.

### Must Audit

- Public header links.
- Mobile drawer links.
- Hero/final CTA links.
- Dashboard topbar links.
- Specialist room CTAs.
- Report composer CTAs.
- Pricing/checkout links.
- Redeem pass links.
- Footer links.

### Must Implement

- Broken-link gate.
- Link-click latency smoke.
- Preload/prefetch only high-value routes.
- No nested interactive element bugs.
- No disabled-looking active links where users expect navigation.

### Green Criteria

- No major route link is broken.
- Critical clicks show visible progress or content quickly.
- Mobile drawer links are reliable.

## Phase 8: `PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT`

### Goal

Make Predicta feel like a mobile astrology app, not a squeezed web dashboard.

### Must Implement

- Mobile first screen centers Predicta input.
- Touch targets meet 44px minimum.
- Sticky actions do not overlap content.
- No route has accidental horizontal scrolling.
- No card, chip, badge, or input leaks text.
- Voice affordance is easy to reach.
- Evidence rooms stack cleanly.

### Green Criteria

- 360px, 390px, 430px, 768px, 834px, 1024px, and desktop screenshots pass.
- UI text overflow and personal-space gates pass.

## Phase 9: `PREDICTA_APP_REVIVAL_PHASE_9_FULL_USER_JOURNEY_GOLDEN_NO_GO_AUDIT`

### Goal

Prove the revived app actually feels like the intended product.

### Must Test

- New visitor asks a question.
- New visitor creates Kundli from chat.
- Returning user asks a prediction.
- User opens Vedic evidence from an answer.
- User opens KP/Jaimini evidence from an event question.
- User downloads a report from a chat-driven flow.
- User hits AI credit exhaustion and still gets deterministic help.
- User redeems a pass.
- User navigates on mobile.
- User switches English, Hindi, and Gujarati.

### Green Criteria

- No dashboard maze is required for the primary journey.
- Predicta is reachable directly.
- App feels faster.
- Links feel reliable.
- No major UI overflow.
- No major translation leaks.
- No school-mixing confusion.
- No phase is green without artifacts and runtime proof.

