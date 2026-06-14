# Predicta Revival V2.1: Top Astrology App Rebuild

Status: `NO-GO`
Created: 2026-06-15

This roadmap supersedes the earlier Predicta Revival V2 plan. It keeps the
chat-first direction, but tightens the missing pain points: spacing, layout,
mobile/tablet feel, report quality, Kundli chart containment, PDF polish,
translation discipline, and prediction-first value.

Predicta must stop feeling like a SaaS control panel. The product must feel like
a premium astrology intelligence app where the user can ask first, receive real
guidance, and open evidence only when needed.

## Relationship To Existing Roadmaps

- `PREDICTA_APP_REVIVAL_CHAT_FIRST_PERFORMANCE_STRICT_PHASES.md` remains the
  historical chat-first spine. This V2.1 roadmap replaces it as the controlling
  revival roadmap.
- `PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md` owns precision
  event prediction and multi-school evidence contracts.
- `PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md` owns report value
  contracts. This roadmap forces those contracts to be re-audited through app
  preview and visual/PDF artifacts.
- `PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md` owns global UI/UX quality
  standards. This roadmap applies those standards to the revived app journey.
- `PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md` owns Predicta's mind,
  voice, memory, app-action competence, and chat experience.

## Non-Negotiable Rules

1. Predicta Chat is the primary product doorway.
2. Dashboard surfaces are secondary saved-work/library surfaces.
3. Specialist worlds stay powerful, but behave as calm evidence rooms.
4. No page may open with long chatter before value or action.
5. Every visible page has one clear primary action above the fold.
6. No unnecessary columns, stretched vertical CTA stacks, or control-panel grids.
7. Every card, chip, badge, pill, CTA, dropdown, label, and form field needs
   intentional personal space.
8. No text, label, planet, degree, sign number, badge, pill, or CTA may leak,
   clip, collide, or overflow its container.
9. Reports must predict and guide first. They must not school the user.
10. Technical evidence must be preserved, but it must follow user meaning.
11. Kundli chart labels, planets, degrees, and sign numbers must stay inside
    their houses/cells across web, mobile, and PDF.
12. Free reports must give useful prediction. Paid reports add depth, timing,
    contradictions, proof, and practical guidance.
13. All user-facing copy must come from dedicated translation JSON/config files.
14. English, Hindi, and Gujarati surfaces must not leak weird mixed-language UI.
15. Every phase must be strictly audited, fixed, verified, and committed before
    the next phase starts.

## Approved Execution Order

1. `PREDICTA_REVIVAL_V2_PHASE_0_CURRENT_TRUTH_AND_NO_GO_LOCK`
2. `PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT`
3. `PREDICTA_REVIVAL_V2_PHASE_2_ACTION_FIRST_PAGE_REWRITE`
4. `PREDICTA_REVIVAL_V2_PHASE_3_LAYOUT_SPACING_AND_PERSONAL_SPACE_SYSTEM`
5. `PREDICTA_REVIVAL_V2_PHASE_4_MOBILE_TABLET_APP_FEEL_REBUILD`
6. `PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK`
7. `PREDICTA_REVIVAL_V2_PHASE_6_REPORT_EDITORIAL_AND_PREDICTION_REBUILD`
8. `PREDICTA_REVIVAL_V2_PHASE_7_REPORT_VISUAL_PREMIUM_AND_PDF_ARTIFACT_GATE`
9. `PREDICTA_REVIVAL_V2_PHASE_8_PREDICTA_MASTERY_AND_NO_SCHOOLING_CHAT_GATE`
10. `PREDICTA_REVIVAL_V2_PHASE_9_TRANSLATION_ZERO_LEAK_SWEEP`
11. `PREDICTA_REVIVAL_V2_PHASE_10_PERFORMANCE_LINK_AND_GOLDEN_JOURNEY_GATE`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_REVIVAL_V2_PHASE_0_CURRENT_TRUTH_AND_NO_GO_LOCK`

### Goal

Lock current truth before changes. Identify every major reason Predicta still
feels like a control panel instead of a top astrology app.

### Must Audit

- Landing and `/ask` first viewport.
- Dashboard/library hierarchy.
- Vedic, KP, Jaimini, Numerology, Signature, Reports, Pricing, Account, Family,
  Redeem Pass, and Kundli flows.
- Mobile, tablet, desktop, and narrow-mobile screenshots.
- Route payload and perceived link-click latency.
- Translation leaks and mixed-language UI.
- Margin, padding, spacing, chip/badge/pill/CTA/form personal space.
- Kundli chart containment on web, mobile, and PDF.
- Free and paid report samples for all report lanes.
- Report text for schooling, filler, redundancy, weak prediction, bad editing,
  repeated remedies, and inconsistent data points.

### Green Criteria

- Redline audit exists with screenshots, route evidence, PDF evidence, and
  command outputs.
- No implementation begins until the baseline is committed.

## Phase 1: `PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT`

### Goal

Make `Ask Predicta` the unmistakable product doorway.

### Must Implement

- Landing primary action opens `/ask`.
- `/ask` stays minimal and distraction-free.
- Mobile nav prioritizes `Ask`, `Kundlis`, `Reports`, and `Account`.
- Specialist worlds are accessible as secondary evidence rooms.
- Generic dashboard/control-panel language is removed from primary journeys.
- Legacy links redirect or preserve context cleanly.

### Green Criteria

- New user can ask Predicta in one click/tap.
- No dashboard maze is required for the primary journey.
- Link reliability gate passes.

## Phase 2: `PREDICTA_REVIVAL_V2_PHASE_2_ACTION_FIRST_PAGE_REWRITE`

### Goal

Stop the app from talking before helping.

### Must Implement

- Every major page starts with:
  - what Predicta says or what the user can do now
  - one clear primary action
  - compact supporting context
- Remove long intro chatter, toolkit wording, and educational paragraphs from
  first screens.
- Specialist rooms use direct meaning first and evidence drawers second.
- Report pages show selected-card actions immediately under the selected option.

### Green Criteria

- No audited route opens with paragraph-heavy chatter before action.
- User can identify the next best action in under five seconds.

## Phase 3: `PREDICTA_REVIVAL_V2_PHASE_3_LAYOUT_SPACING_AND_PERSONAL_SPACE_SYSTEM`

### Goal

Fix global spacing inconsistency and cramped UI.

### Must Implement

- Shared spacing rules for section stacks, cards, forms, chips, badges, pills,
  CTAs, dropdowns, tabs, modals, drawers, and sticky bars.
- Remove unnecessary columns where they create empty whitespace or crowded text.
- Prevent stretched vertical CTAs unless intentionally designed.
- Normalize top/bottom margins for stacked containers and action groups.

### Green Criteria

- UI personal-space audit passes on critical routes and breakpoints.
- Manual screenshot audit shows no touching CTAs, cramped chips, or boundary
  collisions.

## Phase 4: `PREDICTA_REVIVAL_V2_PHASE_4_MOBILE_TABLET_APP_FEEL_REBUILD`

### Goal

Make mobile and tablet feel intentionally designed, not squeezed desktop.

### Must Implement

- Mobile first viewport centers the Ask Predicta experience.
- Touch targets are at least 44px.
- Sticky bars do not overlap content.
- Forms stack cleanly with sufficient vertical rhythm.
- Evidence rooms and report composer are compact and tappable.

### Green Criteria

- 360px, 390px, 430px, 768px, 834px, 1024px, and desktop screenshots pass.
- No horizontal overflow or text leakage.

## Phase 5: `PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK`

### Goal

Make Kundli charts trustworthy and premium.

### Must Implement

- Sign numbers, planet names, degree labels, and house labels remain inside
  their houses/cells.
- Labels use available blank space intelligently instead of pushing toward
  boundaries.
- No hidden `+1`, `+2`, or overflow counters in report charts.
- D1, Moon, D9, D10, Chalit, Swamsa, Karakamsha, and selectable vargas are
  covered.
- PDF charts render 100% chart width without broken inner lines or clipped
  geometry.

### Green Criteria

- Web/mobile containment gates pass.
- PDF chart screenshots pass manual and automated review.

## Phase 6: `PREDICTA_REVIVAL_V2_PHASE_6_REPORT_EDITORIAL_AND_PREDICTION_REBUILD`

### Goal

Make every report valuable, predictive, and satisfying.

### Must Implement

- Rebuild all six report lanes:
  - Vedic
  - KP
  - Jaimini
  - Numerology
  - Signature
  - Life Atlas
- Keep technical knowledge, but immediately translate it into prediction and
  practical meaning.
- Remove schooling, toolkit instructions, generic definitions, filler, repeated
  remedies, and internal system-contract pages.
- Free reports give real value. Paid reports add depth, timing, contradictions,
  evidence, and practical guidance.

### Green Criteria

- Free and paid artifacts are generated for every lane.
- Extracted text audit passes no-schooling and redundancy checks.

## Phase 7: `PREDICTA_REVIVAL_V2_PHASE_7_REPORT_VISUAL_PREMIUM_AND_PDF_ARTIFACT_GATE`

### Goal

Make report PDFs look and read like premium astrology dossiers.

### Must Implement

- Fix typography, contrast, watermark, page density, orphan pages, chart width,
  pagination, table style, and cover/interior consistency.
- Remove sparse leftover pages.
- Ensure app previews and generated reports match.

### Green Criteria

- Rendered screenshot review passes for free and paid PDFs.
- PDF golden gates pass.

## Phase 8: `PREDICTA_REVIVAL_V2_PHASE_8_PREDICTA_MASTERY_AND_NO_SCHOOLING_CHAT_GATE`

### Goal

Make the app UI and chat reinforce the same prediction-first experience.

### Must Implement

- Every page handoff into Predicta carries source context.
- Predicta gives direct answers, not lessons, unless user asks to learn.
- App surfaces do not promise what chat/report context cannot explain.

### Green Criteria

- Golden chat transcripts pass for all major worlds and report handoffs.

## Phase 9: `PREDICTA_REVIVAL_V2_PHASE_9_TRANSLATION_ZERO_LEAK_SWEEP`

### Goal

Eliminate missing, mixed, and hardcoded translations.

### Must Implement

- Audit visible and hidden surfaces in English, Hindi, and Gujarati.
- Move hardcoded user-facing copy into dedicated translation JSON/config files.
- Include drawers, modals, forms, errors, empty states, reports, and chat.

### Green Criteria

- Global translation coverage and translation trust gates pass.
- Manual route dumps show no major language leaks.

## Phase 10: `PREDICTA_REVIVAL_V2_PHASE_10_PERFORMANCE_LINK_AND_GOLDEN_JOURNEY_GATE`

### Goal

Prove the revived app is fast, reliable, premium, and easy.

### Must Test

- New user asks a question.
- New user creates Kundli from chat.
- Returning user asks a prediction.
- User opens Vedic/KP/Jaimini evidence from Predicta.
- User downloads a report.
- User redeems a pass.
- User exhausts credits and still receives deterministic help.
- User switches English, Hindi, and Gujarati.

### Green Criteria

- Build, typecheck, link, mobile, overflow, spacing, translation, chart, report,
  and golden journey gates pass.
- Working tree is committed clean.
