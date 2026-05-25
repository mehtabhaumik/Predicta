# Predicta Kundli And Report Value Rebuild Strict Phases

This document defines the strict follow-up rebuild for Kundli value, report
prediction quality, chart purity, school boundaries, and AstroSage-level
coverage with Predicta-level polish.

It exists because Predicta already has many ingredients, but the delivered
reading can still feel too generic, too technical, too cluttered, or too
school-mixed. This phase set is not a replacement for the existing report/PDF,
chart insight, KP/Nadi, Numerology, Signature, or Life Atlas contracts. It is a
strict value-quality layer that builds on top of them.

## Relationship To Existing Phase Files

This document must not rename, collapse, or override existing phase files.

- `PREDICTA_REPORT_PDF_STRICT_PHASES.md` remains the controlling report/PDF
  template, PDF artifact, page rendering, footer, watermark, and parity
  contract.
- `PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md` remains the controlling chart
  insight hierarchy contract.
- `PREDICTA_KP_NADI_PREDICTA_STRICT_PHASE.md` remains the controlling KP/Nadi
  room and report contract.
- `PREDICTA_NUMEROLOGY_PREDICTA_STRICT_PHASE.md` remains the controlling
  Numerology report contract.
- `PREDICTA_SIGNATURE_PREDICTA_ULTRA_STRICT_PHASE.md` remains the controlling
  Signature report and privacy contract.
- `PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md` remains the only approved
  all-school synthesis report contract.
- `PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS` remains the
  app-wide Predicta memory architecture owner. This value rebuild must feed
  that memory system; it must not create a parallel memory system.

## Execution Rule

Run these phases after the current report/PDF and chart insight base phases are
stable, and before any public claim that Predicta Kundli reports are premium,
competitive, or AstroSage-beating.

Every phase below must be audited strictly. No phase is green from code review
alone.

## Non-Negotiable Rules

1. Do not remove, downgrade, or hide the full Varga chart library.
2. D1/Rashi, Moon/Chandra Lagna, D9/Navamsa, D10/Dashamsa, and Chalit are focus
   charts, not the only charts.
3. The Charts section must let users select any supported chart and see useful
   prediction/meaning for that chart.
4. Free users must get useful, non-technical insight for each selected chart.
5. Premium users must get deeper interpretation on-screen, but the app must not
   become a long wall of report content.
6. The PDF is the complete dossier surface. The app is the guided exploration
   surface.
7. On-screen premium means enough depth to feel valuable. Premium PDF means full
   chart-by-chart dossier depth.
8. Main report Kundli charts must not show micro/special points such as
   `Dhuma`, `Gulika`, `Mandi`, `Upaketu`, `Vyatipata`, `Indrachapa`,
   `Uranus`, `Neptune`, or `Pluto`.
9. Main report Kundli charts show only core Vedic grahas: Sun, Moon, Mars,
   Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, and Lagna where needed.
10. Micro/special points may exist only in a clearly labeled technical appendix
    or advanced evidence table, never on the main chart plate.
11. The required Vedic focus chart order is:
    `D1/Rashi`, `Moon/Chandra Lagna`, `D9/Navamsa`, `D10/Dashamsa`, `Chalit`.
12. Swamsa and Karakamsha charts are required Vedic chart surfaces for both free
    and premium users once implemented. User-facing copy may also recognize
    `Swamsha`, `Svamsa`, `Karakmasa`, and `Karakamsha`, but the implementation
    must keep one canonical internal naming map.
13. Swamsa and Karakamsha must appear on app screens and in reports with
    free/premium depth differences.
14. Free Swamsa and Karakamsha get a polished one-paragraph practical insight.
15. Premium Swamsa and Karakamsha get deeper interpretation, evidence, and
    timing relevance without crowding the app.
16. Chalit must be first-class for both free and premium users.
17. Mahadasha Phala must be a dedicated major section after the core chart
    readings, not scattered timing fragments.
18. Remedies must be consolidated into one remedy/action plan. Do not repeat
    full remedy sections across charts, dasha, yogas, and summaries.
19. Report language must answer what the chart means for the user, not merely
    what the chart technically governs.
20. Predictions must be straight, focused, evidence-weighted, and useful.
21. Predictions must not be fatalistic, medical, fear-based, or guaranteed.
22. KP must not show D1 as its primary chart surface. KP belongs to KP-style
    house/cusp/event evidence and must not visually behave like a Vedic D1 room.
23. KP chart surfaces must use Bhav Chalit / cusp-oriented evidence where chart
    display is needed, not a Parashari D1 personality chart.
24. Nadi must not become a Vedic chart dump or KP proof table. Nadi remains a
    karmic story and validation room.
25. Vedic, KP, Nadi, Numerology, and Signature reports remain separate school
    reports unless the user explicitly chooses the approved Life Atlas synthesis
    report.
26. Predicta memory must know every new chart, table, report section, depth
    rule, and school boundary added by these phases.

## Approved Phase Order

1. `PREDICTA_KUNDLI_VALUE_PHASE_0_ASTROSAGE_BENCHMARK_AND_CURRENT_REDLINE_AUDIT`
2. `PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK`
3. `PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS`
4. `PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS`
5. `PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD`
6. `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`
7. `PREDICTA_KUNDLI_VALUE_PHASE_6_WEB_MOBILE_PROGRESSIVE_DISCLOSURE`
8. `PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION`
9. `PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT`
10. `PREDICTA_KUNDLI_VALUE_PHASE_9_MEMORY_PARITY_AND_GOLDEN_ARTIFACT_AUDIT`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_KUNDLI_VALUE_PHASE_0_ASTROSAGE_BENCHMARK_AND_CURRENT_REDLINE_AUDIT`

### Goal

Create a strict before-state audit that compares Predicta against the attached
56-page AstroSage free Kundli benchmark without copying AstroSage's dated design
or unsafe language.

### Required Audit Inputs

- Existing Predicta free Vedic report PDF.
- Existing Predicta premium Vedic report PDF.
- Existing web Vedic overview screenshots.
- Existing mobile Vedic overview screenshots.
- Existing Charts section screenshots.
- Existing KP page/chart screenshots.
- Existing Nadi page/chart screenshots.
- The attached AstroSage 56-page free Kundli PDF as a coverage benchmark.

### Must Audit

- Chart clutter and micro/special point leakage.
- Whether D1, Moon, D9, D10, and Chalit appear first and in order.
- Whether the full Varga chart library is still accessible.
- Whether each chart has user-facing prediction or only technical meaning.
- Whether Chalit is available for free and premium.
- Whether Swamsa and Karakamsha exist on app/report surfaces.
- Whether Mahadasha Phala has the approved dedicated structure.
- Whether remedies are duplicated.
- Whether classical tables match or exceed competitor coverage.
- Whether KP is incorrectly showing Vedic D1 as its primary chart.
- Whether Nadi is mixing Vedic/KP logic.
- Whether free reports are genuinely useful, not hollow previews.
- Whether premium reports add real depth, not just more pages.

### Green Gate

- A written redline audit exists under
  `docs/audits/PREDICTA_KUNDLI_VALUE_PHASE_0_ASTROSAGE_BENCHMARK_AND_CURRENT_REDLINE_AUDIT/`.
- The audit includes screenshots or generated artifacts for every affected
  surface.
- The audit lists exact defects and maps each defect to the phase that will fix
  it.
- No implementation begins before this audit exists.

## Phase 1: `PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK`

### Goal

Make all main Vedic report charts readable, uncluttered, Vedic, and ordered.

### Required Implementation

- Exclude micro/special points from main report chart plates.
- Keep micro/special points available only in advanced technical appendix areas
  if the data is intentionally supported.
- Ensure no chart labels are hidden behind overflow counters.
- Ensure the focus chart order is always:
  `D1/Rashi`, `Moon/Chandra Lagna`, `D9/Navamsa`, `D10/Dashamsa`, `Chalit`.
- Ensure the same focus order appears in web, mobile, report preview, and PDF.
- Ensure chart labels use the approved Vedic graha language and localization
  rules from the report/PDF strict contract.

### Must Not Do

- Do not remove other Varga charts.
- Do not hide planets as `+1`, `+2`, or any other overflow count.
- Do not replace Vedic graha names with Western glyph-only labeling.
- Do not put special points back on main chart plates.

### Green Gate

- Free and premium generated PDFs show clean chart plates.
- The required focus chart order is visible in generated artifacts.
- No main chart plate shows `Dhuma`, `Gulika`, `Mandi`, `Upaketu`,
  `Vyatipata`, `Indrachapa`, `Uranus`, `Neptune`, or `Pluto`.
- Web and mobile screenshots prove the same order.
- Regression tests block micro/special point leakage onto main chart plates.

## Phase 2: `PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS`

### Goal

Preserve the complete Varga chart system while making every selectable chart
useful and predictive.

### Required Implementation

- The dedicated Charts section must expose all supported Varga charts.
- Users must be able to select any supported chart.
- Every selected chart must show:
  - the chart
  - one plain-language summary
  - key strengths
  - key cautions
  - what this means now
  - a section-aware `Ask Predicta` CTA
  - a `Download full report for detailed analysis` CTA
- Free users receive useful, concise insight.
- Premium users receive deeper interpretation and evidence, but not report-wall
  length on-screen.
- The full premium deep dive remains in the PDF.

### Required Supported Chart Principle

If Predicta supports a chart calculation, it must support a human-facing meaning
layer for that chart. A calculated chart without explanation is not considered a
complete product surface.

### Green Gate

- Web and mobile chart selector screenshots prove all supported charts remain
  available.
- At least D1, Moon, D9, D10, Chalit, and three non-focus Vargas are manually
  verified with visible predictions.
- Free and premium states are verified.
- The audit explicitly confirms that no Varga chart was removed or downgraded.

## Phase 3: `PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS`

### Goal

Promote Swamsa, Karakamsha, and Chalit to first-class chart experiences across
app and reports.

### Required Implementation

- Add Swamsa chart support where calculation evidence exists.
- Add Karakamsha chart support where calculation evidence exists.
- Support alias handling for `Swamsha`, `Svamsa`, `Karakmasa`, and
  `Karakamsha` so app copy, reports, and Predicta chat do not fragment naming.
- Add Chalit chart support for both free and premium users.
- Show Swamsa, Karakamsha, and Chalit on app screens.
- Show Swamsa, Karakamsha, and Chalit in relevant reports.
- Free users get one polished, non-technical paragraph for each.
- Premium users get detailed interpretation, evidence, timing relevance, and
  practical guidance for each.

### Interpretation Rules

- Swamsa must explain inner self-direction, soul-style expression, and the
  deeper pattern behind action without pretending certainty.
- Karakamsha must explain Atmakaraka-linked life direction and spiritual growth
  in plain language.
- Chalit must explain lived house delivery and practical shifts, not merely a
  house-number table.

### Green Gate

- Generated free and premium PDFs include Swamsa, Karakamsha, and Chalit where
  calculation evidence exists.
- Web and mobile screenshots show these charts or honest pending states.
- Predicta chat can explain each chart without generic filler.
- Missing calculation evidence is shown as pending/calculation-limited, not
  invented.

## Phase 4: `PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD`

### Goal

Replace technical blabber with direct, useful, evidence-weighted prediction
language.

### Required Reading Contract

Every chart/section interpretation must answer:

- What is strong here?
- What is blocked or delayed here?
- What is currently active?
- What should the user do practically?
- What timing or maturity pattern matters?
- What evidence supports this reading?
- What should not be overstated?

### Language Rules

- Do not lead with `this chart governs...` as the main value.
- Do not stop at describing life areas.
- Do not say vague things that could apply to anyone.
- Do not promise guaranteed events.
- Do not use scary, fatalistic, medical, or shame-based language.
- Do say what the chart is actually suggesting for the user's life.
- Do make premium deeper through evidence, contradiction handling, timing, and
  practical choices.

### Free Versus Premium

- Free: one strong, polished paragraph per focus chart and selected chart.
- Premium: deeper analysis with evidence, but still concise on-screen.
- Premium PDF: full detailed chapter per chart.

### Green Gate

- A content audit samples every major Vedic report section and verifies that it
  answers `what this means for me`.
- Generic `what this chart governs` copy cannot be the only interpretation.
- Free and premium examples are reviewed side by side.
- Predicta chat can explain the same prediction in plain language.

## Phase 5: `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`

### Goal

Rebuild Vedic report order and remove redundancy.

### Required Report Order

1. Celestial cover.
2. Birth Snapshot:
   - basic details
   - Panchang
   - Avakhada
   - Ghatak
   - favourable points
3. Core Charts First:
   - D1/Rashi
   - Moon/Chandra Lagna
   - D9/Navamsa
   - D10/Dashamsa
   - Chalit
4. Core chart interpretation:
   - free paragraph per chart
   - premium chapter per chart
5. Planet and house evidence:
   - house-wise table
   - dignity
   - degree
   - nakshatra/pada
   - combust/retrograde/exalted/debilitated
6. Mahadasha Phala:
   - past Mahadasha summaries only
   - current Entire Mahadasha
   - current Mahadasha plus Antardasha
   - current Mahadasha plus Antardasha plus Pratyantardasha
   - upcoming timing windows
7. Classical tables:
   - friendship table
   - Chalit table
   - Panchang
   - Avakhada
   - Ashtakavarga
   - Prastarashtakavarga
   - Shadbala/Bhavabala where available
   - Manglik/Sade Sati/Yoga evidence where relevant
8. Premium Vargas:
   - D2, D3, D4, D7, D12, D16, D20, D24, D27, D30, D40, D45, D60 where
     available
   - each with predictive section
9. One consolidated remedy/action plan.

### Redundancy Rules

- Full remedy guidance appears once.
- Inline sections may include a short `supporting practice` reference only.
- Repeated remedy blocks are not allowed.
- Repeated generic explanations are not allowed.

### Green Gate

- Free and premium PDFs show the approved order.
- Mahadasha Phala is a dedicated section after core chart readings.
- Remedies appear as one consolidated plan.
- Generated artifacts prove no duplicate remedy blocks.
- Report length is allowed to grow as needed, but pagination must remain
  readable and premium.

## Phase 6: `PREDICTA_KUNDLI_VALUE_PHASE_6_WEB_MOBILE_PROGRESSIVE_DISCLOSURE`

### Goal

Adopt useful AstroSage-level content on web/mobile without turning the app into
a 56-page wall.

### Required App Sections

- `Birth Snapshot`
  - Panchang
  - Avakhada
  - favourable/ghatak
- `Charts`
  - D1
  - Moon
  - D9
  - D10
  - Chalit
  - full chart library selector
- `What This Means`
  - short predictive cards per chart
- `Current Timing`
  - Mahadasha card
- `Classical Tables`
  - collapsible advanced tables
- `Ask Predicta`
  - section-aware CTAs
- `Download Full Report`
  - PDF remains the deep reading surface

### UX Rules

- Keep screens clean, calm, and progressively disclosed.
- Do not make the report page a long reading wall.
- Tables must be collapsible or horizontally safe on mobile.
- Premium on-screen depth must be valuable but not overwhelming.
- Every action/result must appear near where the user acted.

### Green Gate

- Web screenshots show the progressive hierarchy.
- Mobile screenshots show the same hierarchy without clutter.
- User can access focus charts quickly and full chart library deliberately.
- Download CTA is visible without making the app feel like a PDF dump.

## Phase 7: `PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION`

### Goal

Stop KP and Nadi from visually or logically mixing with Vedic chart behavior.

### KP Requirements

- KP must be event-answer first.
- KP must not show D1 as the primary chart surface.
- KP chart display must be Bhav Chalit / cusp-oriented where a chart is needed.
- KP must show:
  - event question
  - relevant houses
  - cusp/sub-lord evidence
  - significator hierarchy
  - ruling planets
  - timing readiness
  - verdict/confidence
- Technical details belong in proof drawer or report appendix.

### Nadi Requirements

- Nadi must be karmic-story first.
- Nadi must not show Vedic D1 as a generic personality chart dump.
- Nadi must not use KP cusp logic.
- Nadi must show:
  - strongest story thread
  - gift inside the pattern
  - repeating lesson
  - activation areas
  - validation questions
  - activation windows
- Nadi must not claim real palm-leaf access unless that source exists.

### Green Gate

- KP web/mobile screenshots prove D1 is not the primary KP chart.
- KP uses Bhav Chalit / cusp-oriented evidence where chart display is needed.
- Nadi screenshots prove story-first flow.
- KP and Nadi reports remain separate from Vedic reports.
- Predicta chat respects the active KP/Nadi room boundary.

## Phase 8: `PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT`

### Goal

Align all school reports around the same value standard without mixing schools.

### Required Report Standards

- Vedic: classical Kundli report with charts, dasha, Panchang, tables,
  predictions, and consolidated remedy plan.
- KP: event-answer report with verdict, timing, confidence, and proof appendix.
- Nadi: karmic-story report with validation, patterns, activation windows, and
  practical guidance.
- Numerology: number identity dossier with mandala, name rhythm, personal
  cycles, missing/repeated grid, and premium name/compatibility depth.
- Signature: reflective expression report from confirmed visible traits only,
  never hard prediction or personality certainty.

### Green Gate

- Each school has its own report lane.
- No school report silently imports another school's content.
- Life Atlas remains the only approved all-school synthesis report.
- Free reports are useful.
- Premium reports are clearly deeper.

## Phase 9: `PREDICTA_KUNDLI_VALUE_PHASE_9_MEMORY_PARITY_AND_GOLDEN_ARTIFACT_AUDIT`

### Goal

Make Predicta aware of every new chart, report section, depth rule, and school
boundary, then verify generated artifacts.

### Required Predicta Memory Awareness

Predicta must know:

- focus charts and their order
- full Varga library availability
- selected-chart prediction behavior
- Swamsa meaning and availability
- Karakamsha meaning and availability
- Chalit as lived house delivery
- micro/special point exclusion from main report charts
- Mahadasha Phala section rules
- consolidated remedy rule
- Vedic/KP/Nadi/Numerology/Signature report separation
- KP must not use D1 as primary chart
- Nadi must remain story/validation first
- free versus premium depth boundaries
- PDF as complete dossier surface
- app as progressive exploration surface

### Golden Artifact Requirements

- Free Vedic PDF.
- Premium Vedic PDF.
- KP PDF.
- Nadi PDF.
- Numerology PDF.
- Signature PDF with confirmed traits.
- Signature PDF without signature traits or with pending state.
- Web screenshots for Vedic, Charts, KP, Nadi, Numerology, Signature.
- Mobile screenshots for Vedic, Charts, KP, Nadi, Numerology, Signature.
- Predicta chat transcripts proving she can explain the new sections.

### Green Gate

- Every artifact is generated and stored under the phase audit folder.
- Every PDF is visually inspected for chart purity, order, readability,
  prediction quality, and redundancy.
- Every app screenshot is inspected for progressive disclosure and school
  boundaries.
- Predicta chat is audited for awareness and room-safe behavior.
- The phase cannot be green if any required artifact is missing.

## Final Release Rule

After these phases are complete, Predicta may claim that its Kundli/report
system is competitive only if the final audit proves:

- free reports are useful and comprehensive
- premium reports are materially deeper
- charts are readable and uncluttered
- all supported charts remain available
- KP and Nadi do not mix with Vedic chart behavior
- Predicta explains what things mean for the user, not just what they govern
- generated artifacts support every claim
