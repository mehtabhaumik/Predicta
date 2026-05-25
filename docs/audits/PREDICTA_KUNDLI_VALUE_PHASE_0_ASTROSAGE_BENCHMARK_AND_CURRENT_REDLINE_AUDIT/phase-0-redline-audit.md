# Predicta Kundli Value Phase 0 Redline Audit

Phase: `PREDICTA_KUNDLI_VALUE_PHASE_0_ASTROSAGE_BENCHMARK_AND_CURRENT_REDLINE_AUDIT`

Status: green for audit only. Implementation status: not started.

Date: 2026-05-25

## Scope

This is the strict before-state audit for the Kundli value rebuild. It compares
the current Predicta Vedic PDF, web, mobile, Charts, KP, and Nadi surfaces
against the attached AstroSage free Kundli benchmark. This audit does not copy
AstroSage's visual style, dated tone, fatalistic phrasing, or ad-heavy report
format. AstroSage is used only as a coverage benchmark.

## Audit Inputs

- AstroSage benchmark PDF:
  `/Users/bmehta/Downloads/HindiPdfNew.pdf`
- Current Predicta free Vedic PDF:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/pdfs/free-kundli-en.pdf`
- Current Predicta premium Vedic PDF:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/pdfs/premium-kundli-en.pdf`
- Web Vedic overview screenshots:
  `screenshots/web-vedic-overview-desktop.png`
- Mobile Vedic overview screenshots:
  `screenshots/mobile-vedic-overview.png`
- Charts section screenshots:
  `screenshots/charts-section-desktop.png`,
  `screenshots/charts-section-mobile.png`
- KP page screenshots:
  `screenshots/kp-page-desktop.png`,
  `screenshots/kp-page-mobile.png`
- Nadi page screenshots:
  `screenshots/nadi-page-desktop.png`,
  `screenshots/nadi-page-mobile.png`
- Predicta PDF chart screenshots:
  `screenshots/predicta-free-d1-chart-page.png`,
  `screenshots/predicta-premium-d1-chart-page.png`

Generated audit artifacts:

- `artifacts/pdf-coverage-matrix.json`
- `artifacts/surface-artifact-manifest.json`
- `artifacts/astrosage_free_benchmark-page-map.txt`
- `artifacts/predicta_free_current-page-map.txt`
- `artifacts/predicta_premium_current-page-map.txt`

## Benchmark Summary

The AstroSage free benchmark is 56 pages and text extraction found 129,488
characters. Coverage signals include Basic Details, Ghatak, favorable points,
Avakhada, Lagna/Rashi/Moon layers, Chalit, Vimshottari, Mahadasha,
Antardasha/Pratyantar, friendship table, Shadbala, Bhavabala, Shodashvarga,
Manglik, KP, Swamsa, and remedies.

Current Predicta is more polished visually and already has a stronger document
system than the original broken PDF. The current free Vedic PDF is 39 pages and
the current premium Vedic PDF is 47 pages. Predicta already includes D1, Moon,
D9, D10, house-wise graha placement, Panchang, Ghatak/favorable, Avakhada,
friendship, benefic/malefic, Ashtakavarga/Prastara, Karakamsha, and Mahadasha
terms. The remaining issue is not raw page count. The remaining issue is value:
focus order, first-class chart handling, prediction depth, deterministic module
readiness, and school separation.

## Redline Findings

### KV0-01: Chalit is not in the required focus chart opening sequence

Evidence: current Predicta free and premium PDFs show D1 on page 4, Moon on page
5, D9 on page 6, and D10 on page 7. Chalit does not appear as the fifth chart in
that opening chart sequence. Chalit appears later as a table/pending layer.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK`,
then `PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS`,
then `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`.

### KV0-02: Chalit exists, but it is not yet first-class

Evidence: current free PDF page 28 says Chalit rows are pending and includes 0
rows. Current premium PDF page 19 says Chalit chart will appear once Predicta
calculates Lagna-degree bhava boundaries and includes 0 shifted planets/cusps.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS`.

### KV0-03: Swamsa is missing from Predicta app/report surfaces

Evidence: AstroSage text extraction finds Swamsa in the benchmark. Predicta
current free and premium PDF term extraction does not find Swamsa. The phase
contract requires Swamsa as a Vedic chart surface for both free and premium once
implemented.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS`.

### KV0-04: Karakamsha exists as a section, but not as a complete chart surface

Evidence: current Predicta PDFs contain Karakamsha, but the audited pages show
it as a section/table-style interpretation rather than a fully rendered chart
surface with free one-paragraph insight and premium detailed interpretation.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS`.

### KV0-05: Main chart proof is cleaner, but predictive value is still too generic

Evidence: current PDF chart pages are visually far cleaner than the old broken
report and include degrees. However the subsequent meaning sections still often
read like report taxonomy: what a chart governs, why a table exists, or why a
module is pending. The user value requirement is sharper: "what this actually
means for me."

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD`.

### KV0-06: Mahadasha Phala is present, but the approved reading structure needs redline enforcement

Evidence: current PDFs include Mahadasha, Antardasha, and Pratyantar terms, but
the report still needs the approved major section after core chart readings:
past Mahadasha summaries only, current entire Mahadasha, current MD+AD, and
current MD+AD+PD with free/premium depth differences.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`.

### KV0-07: Remedies are still scattered too widely

Evidence: current free PDF term extraction finds Remedies/Remedy across multiple
pages; premium does the same. Some references are useful, but the final product
needs one consolidated remedy/action plan with small contextual mentions only
where needed.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`.

### KV0-08: Classical coverage is not yet AstroSage-beating

Evidence: AstroSage includes Shadbala, Bhavabala, Shodashvarga, Manglik, KP
tables, and dense dasha tables in a free report. Current Predicta coverage is
strong on Ashtakavarga/Prastara and Vedic intelligence, but does not yet expose
Shadbala/Bhavabala/Manglik/Shodashvarga with equivalent usefulness and a modern
non-fearful interpretation layer.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`,
then `PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT`.

### KV0-09: The full varga library must remain visible and selectable

Evidence: the Charts section now has a selectable chart library, and the recent
chart bugfix prevents a missing chart from silently rendering D1. This remains a
strict watch item because future focus-chart work must not remove advanced
vargas from the app.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_2_FULL_VARGA_LIBRARY_AND_SELECTABLE_CHART_PREDICTIONS`.

### KV0-10: Free report is useful, but still has too many pending boundaries

Evidence: Predicta free is no longer hollow, but the current free PDF still
contains important pending statements for Chalit, Samsa, and some detailed
classical factors. Free users need concise useful insight without feeling like
they downloaded a report full of "not ready yet" modules.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD`,
then `PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE`.

### KV0-11: Premium adds pages, but must add sharper prediction depth

Evidence: premium is 47 pages versus free 39 pages, but premium must feel like a
deeper dossier: dedicated chart chapters, contradictions, timing relevance,
evidence-weighted predictions, and practical guidance. More pages alone is not
the premium bar.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_4_PREDICTION_LANGUAGE_AND_DEPTH_REBUILD`,
then `PREDICTA_KUNDLI_VALUE_PHASE_8_ALL_REPORT_VALUE_ALIGNMENT`.

### KV0-12: KP must remain event-first and not become a D1 chart room

Evidence: current KP page code is largely event-first and cusp/sub-lord based,
but Phase 0 keeps this as a strict redline because the product requirement says
KP must use Bhav Chalit/cusp-oriented evidence where a chart is needed, not a
Parashari D1 personality chart.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION`.

### KV0-13: Nadi must remain karmic-story and validation-first

Evidence: Nadi surfaces exist, but this audit marks the next requirement:
do not let Nadi become a Vedic chart dump or KP proof table. It needs a clear
story path, validation bridge, activation windows, and careful non-palm-leaf
source boundary.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION`.

### KV0-14: Main report chart purity must remain locked

Evidence: current main chart pages are much cleaner than the earlier broken
PDF. The old failure mode was micro/special point clutter. The current audit
keeps this as a regression blocker: main chart plates must not show Dhuma,
Gulika, Mandi, Upaketu, Vyatipata, Indrachapa, Uranus, Neptune, or Pluto.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_1_CHART_PURITY_AND_FOCUS_ORDER_LOCK`.

### KV0-15: App surfaces must stay guided, not report-length walls

Evidence: the phase screenshots show web/mobile/dashboard surfaces are already
using cards rather than full report walls. Future implementation must preserve
that: the app gives enough insight, while PDF remains the deep dossier surface.

Fix phase: `PREDICTA_KUNDLI_VALUE_PHASE_6_WEB_MOBILE_PROGRESSIVE_DISCLOSURE`.

## Coverage Decision From AstroSage

Adopt as coverage pressure:

- Basic details, Panchang, Ghatak, favorable points, Avakhada.
- D1, Moon, D9, D10, Chalit, full varga access, Swamsa/Karakamsha.
- House-wise planetary positions with signs/degrees/status.
- Vimshottari/Mahadasha/Antardasha/Pratyantar timing, with the Predicta depth
  rules already approved.
- Friendship table, benefic/malefic logic, Ashtakavarga, Prastara.
- Shadbala/Bhavabala/Manglik/Shodashvarga coverage if deterministic evidence is
  available and safely framed.

Reject from AstroSage:

- Dated visual style.
- Ad-heavy report framing.
- Fear-first dosha language.
- Medical, fatalistic, or guaranteed prediction tone.
- Unexplained table dumps without user-facing meaning.

## Green Gate Result

This phase is green as a baseline/redline audit because:

- The written redline audit exists in the required audit folder.
- Generated artifacts exist for PDFs and coverage extraction.
- Screenshots are present for every affected app/report surface named in the
  Phase 0 contract.
- Each defect is mapped to a future approved phase.
- No implementation changes were made in this phase.
