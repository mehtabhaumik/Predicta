# Predicta Chart Insight Rebuild Phases

## Status

Approved implementation plan for the next chart-product rebuild.

This plan exists because the current chart experience is still too
astrology-first, too technical-first, and too weak on plain-language meaning.

Predicta must stop behaving like:

- here is a chart
- here are the labels
- here is some jargon
- now decode it yourself

Predicta must start behaving like:

- here is what this chart governs
- here is what this chart is saying
- here is why it matters in your life
- here is the free insight
- here is the premium depth
- here are the technical details if you want them

---

## Product Rule

Every chart surface must answer:

`Why should I care about this chart?`

Every chart surface must lead with:

1. `What this chart governs`
2. `What this chart is saying for you`
3. `Main strength`
4. `Main challenge`
5. `Life areas affected`
6. `Current guidance`
7. `Premium deep dive`
8. `Technical details`

The technical layer stays.

It just stops being first.

---

## Hard Rules

1. Free users must receive meaningful chart understanding, not bait.
2. Premium must unlock depth, synthesis, timing, and breadth, not basic meaning.
3. No chart may open with raw technical tables unless the user explicitly chooses
   the technical layer.
4. No fake predictive filler is allowed.
5. No method mixing is allowed:
   - Vedic/Varga surfaces stay Vedic
   - Chalit stays Chalit
   - KP stays KP
   - Nadi stays Nadi
6. D1 remains the root chart.
7. Every varga must explain what area it governs before giving placements.
8. Fear-heavy charts like D8, D30, D60, and Nadi karmic tension surfaces must be
   careful, bounded, and non-fatalistic.
9. The technical layer must remain accessible for serious astrology users.
10. The default mode must be `Insight View`, not `Technical View`.

---

## Real Architecture This Plan Must Use

Do not invent a parallel chart system. Extend the existing seams:

- `apps/web/app/dashboard/charts/page.tsx`
- `apps/web/components/WebChartsExplorer.tsx`
- `apps/web/components/WebKundliChart.tsx`
- `apps/web/components/WebBhavChalitPanel.tsx`
- `packages/astrology/src/chartInsights.ts`
- `packages/astrology/src/vargaInterpretation.ts`
- `packages/astrology/src/chartRegistry.ts`
- `packages/astrology/src/chatChartBlocks.ts`
- `packages/astrology/src/chalitBhavKpFoundation.ts`
- `packages/astrology/src/chartAccess.ts`
- `packages/types/src/astrology.ts`

This rebuild should extend those contracts instead of adding a second chart UX
pipeline.

---

## Approved Order

1. `PREDICTA_CHART_INSIGHT_PHASE_1_UNIVERSAL_CONTRACT_AND_VIEW_HIERARCHY`
2. `PREDICTA_CHART_INSIGHT_PHASE_2_D1_AND_CHALIT_MEANING_REBUILD`
3. `PREDICTA_CHART_INSIGHT_PHASE_3_CORE_VARGA_INSIGHT_REBUILD`
4. `PREDICTA_CHART_INSIGHT_PHASE_4_KP_AND_NADI_CHART_MEANING_REBUILD`
5. `PREDICTA_CHART_INSIGHT_PHASE_5_ADVANCED_VARGA_LIBRARY_AND_TECHNICAL_VIEW`
6. `PREDICTA_CHART_INSIGHT_PHASE_6_PREMIUM_DEEP_DIVE_AND_CROSS_CHART_SYNTHESIS`
7. `PREDICTA_CHART_INSIGHT_PHASE_7_CHAT_REPORT_AND_CTA_INTEGRATION`
8. `PREDICTA_CHART_INSIGHT_PHASE_8_FINAL_QA_DEPLOY_AND_LIVE_SMOKE`

Do not skip.

Do not merge two phases casually.

Do not start the next phase until the current phase is locally audited and green.

---

## Phase 1

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_1_UNIVERSAL_CONTRACT_AND_VIEW_HIERARCHY`

### Goal

Create one universal chart insight contract and one universal chart-view
hierarchy that every chart type must follow.

### Scope

- Add a richer chart insight type in the shared data contract.
- Split chart presentation into:
  - `Insight View`
  - `Technical View`
- Make `Insight View` the default everywhere.
- Replace the current summary/bullets model with a full user-first structure:
  - what this chart governs
  - what it is saying
  - main strength
  - main challenge
  - life areas affected
  - current guidance
  - free insight body
  - premium deep dive preview
  - technical details entry
- Rebuild the top of `WebKundliChart` and `WebChartsExplorer` around that
  hierarchy.
- Add one persistent `What This Chart Is Saying` panel above the technical layer.

### Must Touch

- `packages/types/src/astrology.ts`
- `packages/astrology/src/chartInsights.ts`
- `packages/astrology/src/chartRegistry.ts`
- `apps/web/components/WebKundliChart.tsx`
- `apps/web/components/WebChartsExplorer.tsx`
- related chart CSS in `apps/web/app/globals.css`

### Free vs Premium Rule

Free must already feel complete enough to understand the chart.

Premium should feel deeper, not less confusing.

### Exact Execution Prompt

> Rebuild the shared chart insight contract and chart page hierarchy so every
> chart opens with plain-language meaning instead of technical mechanics. Add a
> default `Insight View` and a secondary `Technical View`. Replace the current
> summary/bullets shape with a richer user-facing structure that explains what
> the chart governs, what it is saying, the main strength, the main challenge,
> the affected life areas, and the current guidance. Keep the technical layer,
> but demote it below the insight layer. Do not let free users feel like they
> are being blocked from basic meaning.

---

## Phase 2

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_2_D1_AND_CHALIT_MEANING_REBUILD`

### Goal

Fix the two most important chart surfaces first:

- D1
- Chalit

### Scope

- D1 must speak like a life chart, not a house-placement board.
- Chalit must explain lived house activation shifts in plain language.
- D1 free insight should answer:
  - what kind of life pattern stands out
  - what area is carrying the most weight
  - what opportunity is open
  - what pressure needs maturity
- Chalit free insight should answer:
  - what changes in lived experience compared with D1
  - which life areas become more active in real life
  - what practical correction or awareness matters now
- Keep the technical D1/Chalit drilldown, but move it under the meaning layer.

### Must Touch

- `packages/astrology/src/chartInsights.ts`
- `packages/astrology/src/vargaInterpretation.ts`
- `packages/astrology/src/chalitBhavKpFoundation.ts`
- `apps/web/components/WebKundliChart.tsx`
- `apps/web/components/WebBhavChalitPanel.tsx`

### Exact Execution Prompt

> Rebuild D1 and Chalit so they explain lived meaning first. D1 must feel like
> a life-foundation reading. Chalit must feel like a practical delivery shift
> reading. Both must tell the user what the chart is saying, what matters most,
> what the caution is, and what to do next. Technical house and placement detail
> must remain available but no longer lead the page.

---

## Phase 3

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_3_CORE_VARGA_INSIGHT_REBUILD`

### Goal

Rebuild the major user-facing vargas so they explain meaning before mechanics.

### Core Varga Set

- `D2`
- `D3`
- `D4`
- `D7`
- `D9`
- `D10`
- `D12`
- `D16`
- `D20`
- `D24`
- `D30`
- `D40`
- `D45`
- `D60`

### Scope

For each chart above, define:

- what this chart governs
- what this chart is likely saying right now
- what strength it reveals
- what caution it reveals
- what life areas it influences
- what practical guidance the user should take

Each chart must feel distinct:

- `D2`: money temperament and resource flow
- `D3`: effort, nerve, and self-driven stamina
- `D4`: inner base, home-rootedness, emotional anchoring
- `D7`: children, creativity, nurturing legacy
- `D9`: relationship dharma, maturity, marriage truth, soul-strength
- `D10`: career promise, responsibility, authority, public role
- `D12`: lineage burden and inherited family pattern
- `D16`: comfort, stability, and lifestyle handling
- `D20`: devotion, practice, and inner discipline
- `D24`: education, teachers, and study karma
- `D30`: stress, damage patterns, and protection needs
- `D40`: maternal blessings and inherited grace
- `D45`: paternal merit, honor, and family character
- `D60`: deep karma and root destiny texture

### Exact Execution Prompt

> Rebuild the core varga library so each chart explains its meaning in human
> stakes first. Do not let any varga read like a small D1 clone. Each one must
> have its own voice, purpose, and plain-language interpretation. Free users
> should get strong insight. Premium should go deeper into timing, layers,
> contradictions, and chart synthesis.

---

## Phase 4

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_4_KP_AND_NADI_CHART_MEANING_REBUILD`

### Goal

Make KP and Nadi chart surfaces human-readable without destroying method
credibility.

### Scope

- KP must explain event judgment in plain language:
  - what the chart is promising
  - where the decision point lies
  - why timing is supportive, mixed, or delayed
- Nadi must explain karmic planetary story in plain language:
  - what repeating pattern is visible
  - what karmic lesson is active
  - where the user is likely stuck
  - what shift changes the pattern
- Neither surface may collapse back into generic Vedic jargon.
- Neither surface may become fake spiritual filler.

### Must Touch

- `packages/astrology/src/chalitBhavKpFoundation.ts`
- Nadi planning/intelligence seams already used by the Nadi room
- chart CTA and chart block contracts where KP/Nadi chart context appears
- world-specific UI surfaces that expose chart meaning

### Exact Execution Prompt

> Rebuild KP and Nadi chart meaning layers so they explain what the system is
> actually saying about the user instead of only showing technical method
> evidence. KP must feel concrete, timed, and decision-oriented. Nadi must feel
> karmic, pattern-aware, and reflective without claiming fake manuscript
> authority. Keep both systems method-safe and distinct from ordinary Vedic
> chart reading.

---

## Phase 5

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_5_ADVANCED_VARGA_LIBRARY_AND_TECHNICAL_VIEW`

### Goal

Finish the advanced chart library and formalize the technical mode so serious
users still trust the product.

### Advanced Set

- `D5`
- `D6`
- `D8`
- `D11`
- `D13`
- `D15`
- `D17`
- `D18`
- `D19`
- `D21`
- `D22`
- `D23`
- `D25`
- `D26`
- `D27`
- `D28`
- `D29`
- `D31`
- `D32`
- `D33`
- `D34`

### Scope

- Add useful plain-language insight for the advanced chart set.
- Keep the tone conservative where chart confidence is narrower.
- Ensure `Technical View` is powerful enough for expert users:
  - house/planet details
  - dignity and condition where available
  - D1 anchor rule
  - chart-specific interpretation notes
  - KP/Nadi technical structure where relevant

### Exact Execution Prompt

> Complete the advanced varga library without turning the product into a jargon
> wall. Every advanced chart still needs a plain-language meaning layer, but the
> technical mode must remain rich enough that advanced users do not feel the app
> became shallow. Keep prediction language careful on narrow or high-risk
> vargas.

---

## Phase 6

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_6_PREMIUM_DEEP_DIVE_AND_CROSS_CHART_SYNTHESIS`

### Goal

Make Premium feel worth paying for because it thinks deeper, not because it
withholds the basic point.

### Scope

Premium must add:

- layered chart interpretation
- timing windows
- strength vs contradiction analysis
- D1-to-varga synthesis
- varga-to-varga synthesis where relevant
- practical guidance and remedy direction
- clearer confidence framing

Premium cross-chart synthesis should explicitly cover:

- D1 + D9
- D1 + D10
- D1 + Chalit
- D1 + KP
- D1 + Nadi
- other chart pairs only when meaningful

### Exact Execution Prompt

> Rebuild Premium chart depth so it delivers layered human interpretation,
> timing, contradiction handling, and cross-chart synthesis. Premium must answer
> more deeply, not merely show more jargon. Do not lock the basic meaning of a
> chart behind premium. Premium should feel like a true senior-reading layer.

---

## Phase 7

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_7_CHAT_REPORT_AND_CTA_INTEGRATION`

### Goal

Make the chart meaning system consistent across chart page, chat, and reports.

### Scope

- Rebuild chart chat blocks so opening a chart in chat feels insight-led.
- Rebuild chart CTAs so they sound like:
  - ask deeper
  - ask timing
  - ask remedy
  - compare with D1
  - understand what this means for career/love/family
- Rebuild chart report sections so report exports follow the same hierarchy:
  - meaning
  - key insight
  - free understanding
  - premium depth
  - technical appendix
- Remove stale chart copy that still sounds like a mechanic’s note.

### Must Touch

- `packages/astrology/src/chatChartBlocks.ts`
- chart CTA builders
- report composition surfaces
- specialist chat entry points that open charts

### Exact Execution Prompt

> Integrate the chart insight contract into chat and reports so the user gets
> the same product promise everywhere. When a chart opens in chat, Predicta must
> first explain what the chart is saying, not just that the chart was opened.
> Report sections must also lead with human meaning before technical detail.

---

## Phase 8

### Keyword

`PREDICTA_CHART_INSIGHT_PHASE_8_FINAL_QA_DEPLOY_AND_LIVE_SMOKE`

### Goal

Do not ship this rebuild unless it is visibly better for real users on the live
app.

### Required QA

- desktop
- tablet
- mobile
- English
- Hindi
- Gujarati
- free mode
- premium mode
- D1
- Chalit
- core vargas
- advanced vargas
- KP
- Nadi
- chart page
- chart inside chat
- chart report output

### Must Verify

- every chart answers `what this chart is saying`
- free users get real value without feeling punished
- premium depth is visibly better and genuinely deeper
- technical view still exists and remains trustworthy
- no mixed-language leaks in the rebuilt insight layer
- no fake authority or fear-heavy copy
- no method mixing across Vedic/KP/Nadi
- no layout regressions on the charts route or chart cards

### Exact Execution Prompt

> Run the final chart insight QA gate only after all chart phases are locally
> green. Smoke-test the rebuilt chart experience in free and premium modes on
> desktop, tablet, and mobile. Verify D1, Chalit, core vargas, advanced vargas,
> KP, and Nadi. Then deploy and smoke-test the live app. Do not call the chart
> rebuild complete until the deployed experience proves that charts now explain
> what they are saying in a human-first way.

---

## First Phase

The first implementation phase should be:

`PREDICTA_CHART_INSIGHT_PHASE_1_UNIVERSAL_CONTRACT_AND_VIEW_HIERARCHY`

Why this is first:

- all later chart work depends on the shared insight contract
- the current UI hierarchy is the root problem
- D1, Chalit, varga, KP, Nadi, chat, and reports should not all invent their
  own meaning format

One universal contract first.

Then chart-specific execution.
