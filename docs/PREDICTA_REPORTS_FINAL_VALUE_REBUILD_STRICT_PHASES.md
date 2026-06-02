# Predicta Reports Final Value Rebuild Strict Phases

This is the final value-quality spine for Predicta reports. It does not replace
the PDF rendering, chart, monetization, Jaimini, Life Atlas, Numerology,
Signature, or Predicta memory contracts. It sits above them as the report
quality contract: every report must stop sounding like an astrology lesson and
start delivering prediction, guidance, evidence, timing, and value.

## Relationship To Existing Contracts

- `PREDICTA_REPORT_PDF_STRICT_PHASES.md` still owns PDF layout, watermark,
  cover, footer, chart-safe rendering, and web/mobile parity.
- `PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md` still owns Vedic
  chart purity, focus order, varga access, Mahadasha, and remedies.
- `PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md` still owns the product
  decision that Jaimini replaces Nadi.
- `PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md` still owns the approved
  all-school synthesis report.
- `PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md` still owns report
  entitlements, report credits, AI credits, and purchase flow.
- This final report value rebuild must feed Predicta memory. It must not create
  a parallel report-brain or a separate school taxonomy.

## Non-Negotiable Report Rules

1. Reports must predict, guide, and satisfy. They must not teach astrology as
   the main experience.
2. Technical evidence must be preserved, but prediction must immediately follow
   the evidence.
3. Every meaningful section follows this rhythm:
   `technical evidence -> plain prediction -> timing/current relevance -> what
   helps -> what blocks -> what to do next -> confidence/caution`.
4. Free reports are not hollow previews. Free reports must provide useful,
   specific, human-facing prediction.
5. Paid reports add depth, contradictions, timing, evidence, and practical
   guidance. Paid reports do not merely add more pages.
6. Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas reports stay
   separate. Life Atlas is the only approved synthesis lane.
7. No report may look like an internal system contract, QA artifact, toolkit,
   astrology course, or method tutorial.
8. Method-boundary and safety language must be short and tasteful, usually in a
   footer note or appendix. It must never become the main reading.
9. Redundancy is a defect. Remedies, cautions, boundaries, and generic
   definitions must not repeat across pages.
10. Every report-affecting phase must generate free and paid PDFs or composition
    fixtures for all affected report lanes before it can be green.
11. Every report-affecting phase must include extracted text audit, rendered PDF
    screenshots, redundancy audit, school-boundary audit, and app preview audit.
12. The user should feel: `This told me something useful about my life, not just
    what astrology means.`

## Approved Phase Order

1. `PREDICTA_REPORT_FINAL_PHASE_0_COMPETITOR_BENCHMARK_AND_REDLINE_LOCK`
2. `PREDICTA_REPORT_FINAL_PHASE_1_REPORT_VOICE_AND_PREDICTION_CONTRACT`
3. `PREDICTA_REPORT_FINAL_PHASE_2_SHARED_REPORT_ARCHITECTURE_ENGINE`
4. `PREDICTA_REPORT_FINAL_PHASE_3_FREE_VS_PAID_DEPTH_CONTRACT`
5. `PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD`
6. `PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD`
7. `PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD`
8. `PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD`
9. `PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD`
10. `PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD`
11. `PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT`
12. `PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY`
13. `PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_REPORT_FINAL_PHASE_0_COMPETITOR_BENCHMARK_AND_REDLINE_LOCK`

### Goal

Lock the market benchmark, Predicta redlines, free/paid value split, and report
quality bar before implementation begins.

### Required Research Sources

Phase 0 must use live/current source evidence from:

- AstroSage free report and Kundli coverage.
- Modern Vedic/Kundli competitors that provide free charts, dashas, yogas,
  Ashtakavarga, and concise explanations.
- Astro.com or comparable paid report samples with strong narrative voice.
- CHANI, The Pattern, TimePassages, or comparable modern astrology apps with
  non-technical user-facing language.
- KP sources/products focused on cusps, sub-lords, significators, event
  judgement, and timing.
- Jaimini sources/products focused on Atmakaraka, Chara Karakas, Karakamsha,
  Arudha, and Chara Dasha.
- Numerology report samples covering name number, birth/life path, personal
  cycles, missing/repeated numbers, and name rhythm.
- Signature/graphology sources that define visible traits and limitations.
- Soul Blueprint / Life Purpose report products that demonstrate premium
  emotional narrative structure.

### Must Produce

- Written benchmark audit under
  `docs/audits/PREDICTA_REPORT_FINAL_PHASE_0_COMPETITOR_BENCHMARK_AND_REDLINE_LOCK/`.
- Source matrix with URLs, what each competitor does well, what Predicta adopts,
  and what Predicta rejects.
- Redline ledger for all six report lanes:
  - Vedic
  - KP
  - Jaimini
  - Numerology
  - Signature
  - Life Atlas
- Free vs paid value contract.
- Explicit banned report behaviors.
- Defect-to-future-phase map.

### Green Criteria

- Phase 0 audit exists and is source-backed.
- Phase 0 gate passes.
- The audit includes zero implementation changes to report rendering.
- The final report roadmap includes all six report lanes and no Nadi lane.
- The audit clearly states what Predicta must adopt and reject from competitor
  reports.
- The free and paid report split is locked before Phase 1 begins.

## Phase 1: `PREDICTA_REPORT_FINAL_PHASE_1_REPORT_VOICE_AND_PREDICTION_CONTRACT`

Rebuild report voice rules so every report section becomes predictive,
actionable, and human. Ban filler definitions, toolkit language, school-like
instructions, and internal method-boundary paragraphs as primary content.

### Required Work

- Add a shared report voice contract that every report section can pass through
  before localization/rendering.
- Lock the required section rhythm:
  `technical evidence -> plain prediction -> timing/current relevance -> what
  helps -> what blocks -> what to do next -> confidence/caution`.
- Rewrite user-facing report copy away from:
  - toolkit language
  - internal system-document language
  - school-like method lessons
  - “what this chart governs” as the main value
  - “technical evidence” as the first user-facing promise
- Keep evidence visible, but move it behind prediction language, proof rows, or
  appendices.
- Add a gate that prevents the report engine from reintroducing banned
  schooling/toolkit phrases in primary report bodies and bullets.

### Green Criteria

- Shared report voice contract exists in source.
- `composeReportSections` applies the report voice contract before localization.
- High-risk phrases are rewritten before report rendering.
- Phase 1 audit artifact exists.
- Phase 1 gate passes.
- PDF package typecheck passes.
- PDF golden output gate passes.

## Phase 2: `PREDICTA_REPORT_FINAL_PHASE_2_SHARED_REPORT_ARCHITECTURE_ENGINE`

Create a shared report architecture that every lane can use without becoming
generic: personal opening, method-specific evidence, prediction chapters, timing
or cycle relevance, action plan, and appendix.

### Required Work

- Add a shared report architecture engine that defines the required report spine
  for every report lane.
- The required spine is:
  - personal opening
  - method-specific evidence
  - prediction chapters
  - timing/current relevance
  - action plan
  - appendix/proof
- Attach the architecture to every PDF composition, including empty/fallback
  reports.
- Keep school boundaries inside the architecture:
  - Vedic stays Vedic/Parashari
  - KP stays event/cusp/sub-lord/significator oriented
  - Jaimini stays Atmakaraka/Chara Karaka/Karakamsha/Arudha/Chara Dasha oriented
  - Numerology stays number-led
  - Signature stays confirmed-visible-trait only
  - Life Atlas remains the only synthesis lane
- Do not create a Nadi final-report lane.
- Add a gate that proves all six lanes expose the shared architecture without
  becoming generic.

### Green Criteria

- Shared report architecture source exists.
- Every generated `PdfComposition` includes an architecture object.
- The architecture includes all six required stages.
- The architecture has school-specific promises and boundaries for Vedic, KP,
  Jaimini, Numerology, Signature, and Life Atlas.
- No Nadi final-report lane appears in the final report architecture manifest.
- Phase 2 audit artifact exists.
- Phase 2 gate passes.
- PDF package typecheck passes.
- PDF golden output gate passes.

## Phase 3: `PREDICTA_REPORT_FINAL_PHASE_3_FREE_VS_PAID_DEPTH_CONTRACT`

Lock depth rules: Free gives specific useful prediction and key evidence. Paid
adds full diagnosis, contradictions, timing windows, proof depth, and practical
guidance.

### Required Work

- Add a shared free-vs-paid depth contract to the report architecture engine.
- The depth contract must travel with every `PdfComposition` through
  `PdfReportArchitecture`.
- Free report depth must guarantee:
  - a specific user-facing prediction
  - key evidence needed to trust the prediction
  - current/timing relevance when evidence supports it
  - at least one practical next step
  - short proof after prediction, not instead of prediction
- Paid report depth must guarantee:
  - full diagnosis for the selected lane/focus
  - supporting and conflicting evidence
  - timing windows or current-cycle depth where available
  - contradiction handling
  - practical guidance separated into now/prepare/avoid/revisit
  - deeper proof in appendix/proof pages
- The contract must be lane-aware for:
  - Vedic
  - KP
  - Jaimini
  - Numerology
  - Signature
  - Life Atlas
- Free must never become a hollow teaser.
- Paid must never become page-count padding.
- Add a gate that proves all six final report lanes expose both free and paid
  depth promises and that the renderer consumes the active depth promise.

### Green Criteria

- `ReportDepthContract` exists in source.
- Every `PdfReportArchitecture` includes `depthContract`.
- Free and paid depth minimums exist for prediction, evidence, timing, action,
  and proof.
- All six final report lanes expose lane-specific depth promises.
- The active depth promise is consumed by the PDF renderer.
- No Nadi final-report depth lane appears in the manifest.
- Phase 3 audit artifact exists.
- Phase 3 gate passes.
- PDF package typecheck passes.
- PDF golden output gate passes.

## Phase 4: `PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD`

Rebuild Vedic as a premium Kundli dossier with charts, Panchang, Avakhada,
planet/house evidence, Mahadasha Phala, yogas, Ashtakavarga, and a consolidated
remedy/action plan.

### Required Work

- Add a Vedic-specific report value contract that locks:
  - required Vedic modules
  - prediction-first order
  - free depth
  - paid depth
  - banned Vedic failures
- Vedic reports must start with birth/calculation context, then a direct
  Kundli prediction opening before dense tables.
- Core Vedic focus remains:
  - D1/Rashi
  - Moon/Chandra Lagna
  - D9/Navamsa
  - D10/Dashamsa
  - Chalit
- Required Vedic coverage must include:
  - Panchang
  - Avakhada Chakra
  - Ghatak and favorable factors
  - house-wise planet table
  - benefic/malefic logic
  - Mahadasha Phala
  - friendship table
  - Chalit table
  - Samsa
  - Swamsa
  - Karakamsha
  - Ashtakavarga
  - Prastarashtakavarga
  - yogas
  - consolidated remedy/action plan
- Mahadasha Phala must remain a dedicated section after core chart and planet
  evidence, not scattered as small timing snippets.
- Remedies must appear as one consolidated action plan. Other sections may
  reference remedies briefly but must not duplicate the full plan.
- Premium must add deeper varga interpretation, contradictions, timing windows,
  proof depth, and practical guidance. Premium must not merely add more pages.
- Free must keep useful chart-backed prediction and essential evidence.

### Green Criteria

- Vedic report value contract source exists.
- Required Vedic modules are listed in source and audit manifest.
- `composeReportSections` uses the Vedic value opening for Vedic/Kundli lanes.
- Vedic snapshot, chart, evidence-table, Mahadasha, classical, Ashtakavarga,
  yoga, guidance, and remedy sections are prediction-first.
- One consolidated remedy/action plan remains the only full remedy plan.
- Vedic report architecture keeps KP, Jaimini, Numerology, Signature, and Life
  Atlas out of the Vedic lane.
- Phase 4 audit artifact exists.
- Phase 4 gate passes.
- PDF package typecheck passes.
- PDF golden output gate passes.

## Phase 5: `PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD`

Rebuild KP as a specific event/outcome report with question, verdict, promise,
block, timing readiness, cusps, sub-lords, significators, ruling planets, dasha
support, and proof appendix.

### Required Work

- Add a KP-specific report value contract that locks:
  - KP prediction opening
  - KP event-support chart requirement
  - verdict/promise/block/timing/action order
  - free depth
  - paid depth
  - banned KP failures
- KP reports must answer the user with visible outcome prediction even when no
  custom event question is supplied. They may invite a sharper future event
  question, but they must not make the report feel incomplete or like homework.
- KP chart must be included in KP reports.
- KP reports must not render D1/D9 Parashari chart pages.
- KP must preserve technical knowledge through:
  - relevant houses
  - cusps and lord chains
  - star lord, sub lord, and sub-sub lord where available
  - significator hierarchy
  - ruling planets
  - dasha support
  - timing readiness
  - proof appendix
- KP main reading must be understandable to a common person:
  - what is likely moving
  - what is blocked or delayed
  - what timing mood is active
  - what to do next
  - what not to trust
- Premium KP must add deeper proof and timing depth, not more jargon.
- Free KP must include a real verdict, active areas, caution, timing mood, and
  practical action.

### Green Criteria

- KP report value contract source exists.
- Required KP modules are listed in source and audit manifest.
- `buildKpReportSections` uses the KP value opening.
- KP chart requirement is locked.
- D1/D9 Parashari chart output remains excluded from KP reports.
- KP free and paid report sections lead with prediction, not user homework.
- KP technical proof remains available after the prediction.
- Phase 5 audit artifact exists.
- Phase 5 gate passes.
- PDF package typecheck passes.
- Astrology package typecheck passes if KP foundation text changes.
- PDF golden output gate passes.

## Phase 6: `PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD`

Rebuild Jaimini as a destiny, role, soul-direction, and life-arc report using
Jaimini evidence: Atmakaraka, Amatyakaraka, Chara Karakas, Karakamsha, Arudha,
Rashi Drishti, and Chara Dasha where available.

## Phase 7: `PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD`

Rebuild Numerology as a Number Identity Dossier with number mandala, name
rhythm, birth code, current cycle, missing/repeated grid, compatibility, and
paid name refinement where available.

## Phase 8: `PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD`

Rebuild Signature as reflective expression guidance based only on confirmed
visible traits. It must not make hard predictions, forensic claims, or character
certainty claims.

## Phase 9: `PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD`

Rebuild Life Atlas as the emotional flagship: soul portrait, life arc, destiny
pattern, current chapter, hidden thread, practical next steps, and a personal
closing letter.

## Phase 10: `PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT`

Align app previews with report quality. Web/mobile should show focused previews
and strong download nudges, not full report walls.

## Phase 11: `PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY`

Predicta must know the report architecture, generated sections, free/paid depth,
and school boundaries so she can explain reports conversationally without
guessing or mixing methods.

## Phase 12: `PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT`

Generate free and paid PDFs for all six lanes. Render pages, extract text,
audit redundancy, audit prediction quality, audit school boundaries, audit
visual polish, and block release if any report still schools the user instead
of helping them.
