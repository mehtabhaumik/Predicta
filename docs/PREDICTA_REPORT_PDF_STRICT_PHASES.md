# Predicta Report And PDF Strict Rebuild Phases

This document is the controlling phase contract for the next Predicta report and
PDF rebuild.

It exists because the report/PDF system must stop being judged by "mostly works"
or "technically generated". A phase is green only after its strict audit passes.
If any audit item fails, that phase remains red.

The rules below apply to every implementation phase. They are not optional
guidance and they are not limited to the phase where a feature is first
introduced. Before any phase is called green, its audit must confirm that the
phase did not violate any non-negotiable rule and did not regress a rule that
was already satisfied by an earlier phase.

## Non-Negotiable Rules

1. Do not collapse these phases into one broad implementation.
2. Do not mark a phase green from code review alone.
3. Do not mark a phase green without generated artifacts where the phase affects
   PDF output.
4. Do not hide PDF chart planets behind `+1`, `+2`, `+3`, or any other overflow
   counter.
5. Do not let mobile keep a lower-quality report path than web.
6. Do not make the report page a long reading wall. The PDF is the reading
   surface.
7. Free and Premium reports must share the same visual dignity. Premium adds
   depth, not respectability.
8. Predicta is the soul of the app. If the current memory/context system is not
   strong enough for her to know the app deeply, the memory system must be
   refined rather than leaving her unaware.
9. Every new report calculation, table, section, and PDF-visible insight must be
   reflected in Predicta's chat/context memory so she can explain it after the
   report is generated.
10. Footer text must be exactly:
   - left: `Prepared by Predicta @2026`
   - center: report subject name
   - right: `{page number} / {total pages}` using the real rendered page number
     and real rendered total page count
11. The first PDF page uses the dark Predicta visual theme only. All later pages
   use the premium light editorial theme unless a later approved phase changes
   that rule.
12. Every phase below requires strict audit before it is called green.
13. There is no fixed page boundary for Free or Premium reports. Report length
    is determined by the selected report, required sections, readability,
    pagination safety, and meaningful coverage.
14. Moon chart, also called Chandra Lagna chart, is a required Vedic chart
    surface. Web, mobile, Vedic section, Predicta memory, and reports must not
    omit it once this rebuild is implemented.
15. Vedic chart order is fixed everywhere charts are listed or rendered:
    Lagna/Rashi D1 first, Moon/Chandra Lagna chart second, Navamsa D9 third,
    then the remaining varga charts.
16. Vedic Kundli surfaces must use a Vedic/Indian graha visual language, not
    Western astrology glyph-only labeling. English surfaces use `Moon`, `Sun`,
    `Mars`, `Jupiter`, `Venus`, `Saturn`, `Mercury`, `Rahu`, and `Ketu`.
    Hindi roman surfaces use `Chandra`, `Surya`, `Mangal`, `Brahaspati`,
    `Shukra`, `Shani`, `Budh`, `Rahu`, and `Ketu`. Gujarati roman surfaces use
    `Chandra`, `Surya`, `Mangal`, `Guru`, `Shukra`, `Shani`, `Budh`, `Rahu`,
    and `Ketu`.
17. Moon phase visuals remain required, but must be refined as readable lunar
    phase discs for waxing, waning, full, and dark moon states instead of
    obscure symbol-only marks.
18. PDF interior pages must not use a light yellow template background. Interior
    pages must use the approved Predicta Pearl Editorial system: soft porcelain
    or moonstone paper, deep ink typography, restrained champagne accents,
    polished editorial spacing, and a faint centered Predicta logo watermark.
19. The first PDF page must feel like a personal celestial certificate, not a
    generic cover. It must include the subject's name, date of birth, birth
    time, birth place, report type, and a chart-backed birth moment signature.
20. Mahadasha Phala and Meaning must be structured, not dumped as a generic
    timeline. Past Mahadashas are summarized only at Mahadasha level. The
    current period is layered as Entire Mahadasha, Mahadasha plus Antardasha,
    and Mahadasha plus Antardasha plus Pratyantardasha.
21. Reports must be separated by Predicta school/world. Vedic, KP, Jaimini,
    Numerology, and Signature reports must not be mixed into one generic report
    lane. Any future combined report must be explicitly labeled as a Synthesis
    Report and approved as its own product path.
22. Predicta user-facing vocabulary is canonical: use `Dosh`, not `Dosha`; use
    `Shrap`, not `Shrapa`; use `Yog` for the Kundli pattern section unless a
    formal source title requires `Yoga`. This applies to report pages, app
    previews, chat memory, translations, and audit gates.
23. `Jaimini Jyotish` is the astrology school. User wording such as `Gemini
    Jyotish` must be interpreted as Jaimini Jyotish in chat, while Gemini the AI
    provider remains provider-only terminology and must not be used as an
    astrology report lane.
24. Predicta memory must be local-knowledge-first. Report questions about
    Dosh, Shrap, Yog, Lal Kitab, Jaimini, generated sections, app navigation,
    entitlements, or deterministic module output must not consume AI credit
    when the answer is available from local memory or calculation context.

## Approved Phase Order

1. `PREDICTA_REPORT_PDF_PHASE_0_STRICT_BASELINE_AND_CONTRACT_LOCK`
2. `PREDICTA_REPORT_PDF_PHASE_1_DOWNLOAD_DIALOG_AND_REPORT_PAGE_FLOW`
3. `PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION`
4. `PREDICTA_REPORT_PDF_PHASE_2_VEDIC_INTELLIGENCE_DATA_CONTRACT`
5. `PREDICTA_REPORT_PDF_PHASE_3_CLASSICAL_JYOTISH_MODULES`
6. `PREDICTA_REPORT_PDF_PHASE_4_DOCUMENT_BRAND_AND_TEMPLATE_SYSTEM`
7. `PREDICTA_REPORT_PDF_PHASE_4A_PEARL_EDITORIAL_INTERIOR_SYSTEM`
8. `PREDICTA_REPORT_PDF_PHASE_4B_CELESTIAL_SEAL_COVER_SYSTEM`
9. `PREDICTA_REPORT_PDF_PHASE_5_FULL_WIDTH_CHART_SAFE_PDF_LAYOUT`
10. `PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES`
11. `PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS`
12. `PREDICTA_REPORT_PDF_PHASE_8_WEB_MOBILE_PARITY`
13. `PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT`

Do not rename these phases during implementation.

## Global Phase Green Gate

Each phase can only be marked green after both checks pass:

1. The phase-specific strict audit passes.
2. The non-negotiable rules above are re-checked against the changed surfaces.

If a phase touches PDF output, generated PDFs or rendered page images are
required audit evidence. If a phase touches web or mobile surfaces, screenshots
or runtime inspection are required. If a phase touches calculations, deterministic
fixtures or tests are required. If a phase touches Predicta-facing content,
Predicta memory/context behavior must be audited so she can explain the new
content without guessing.

## Phase 0: `PREDICTA_REPORT_PDF_PHASE_0_STRICT_BASELINE_AND_CONTRACT_LOCK`

### Intent

Lock the current broken state, exact requirements, sample inputs, and audit
criteria before implementation begins.

### Required Work

- Capture the current report page behavior.
- Capture the current PDF output for at least:
  - free Kundli report
  - premium Kundli report
  - Gujarati or Hindi report
- Record the current chart failures, especially hidden planet counters and label
  crowding.
- Confirm the active report composition path and all PDF renderer paths.
- Confirm mobile still does or does not use a separate legacy PDF path.
- Record exact expected footer spelling: `Prepared by Predicta @2026`.

### Strict Audit

This phase is green only when:

- baseline PDFs are generated and stored in a temporary audit folder
- chart-page screenshots exist for broken and fixed comparison
- web report page screenshots exist for desktop and mobile widths
- all active renderer entry points are listed
- all known blockers are documented before code changes begin
- `git status --short` is captured so later work can distinguish new changes

## Phase 1: `PREDICTA_REPORT_PDF_PHASE_1_DOWNLOAD_DIALOG_AND_REPORT_PAGE_FLOW`

### Intent

Make `/dashboard/report` a simple download-first report generator with a polished
confirmation dialog.

### Required Work

- Replace any user-facing `Save Report` CTA with `Download your report`.
- After report preparation, show a polished dialog with:
  - report title
  - Free or Premium mode
  - subject name
  - short chart-backed preview
  - primary CTA: `Download your report`
  - secondary action: `Cancel`
- Keep the existing page-level `Download your report` CTA where the old save CTA
  existed.
- Keep report setup compact:
  - choose by outcome
  - choose report type
  - choose Free or Premium
  - optional section tuning
- Do not reintroduce a long report reading wall on the page.
- Preserve strict premium gating.

### Strict Audit

This phase is green only when:

- desktop report flow shows the dialog after report preparation
- mobile-width report flow shows the dialog without cramped controls
- `Cancel` closes the dialog without triggering download
- dialog CTA triggers the same PDF download as the page CTA
- `Save Report` no longer appears in the relevant report flow
- free users cannot open premium report generation without sign-in or purchase
  handling
- `corepack pnpm build:web` passes
- affected tests pass or any pre-existing failures are explicitly named with
  evidence
- screenshots are captured for desktop and mobile-width dialog states

## Phase 1A: `PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION`

### Intent

Redesign `/dashboard/report` into a clean report marketplace where each
Predicta school/world has its own report lane. Users must never feel they are
buying or downloading a mixed bag report that blends methods without consent.

### Required Work

- Start the report page with a clear choice:
  - `Choose your report world`
- Add five separated report lanes or premium cards/tabs:
  - `Vedic Reports`
  - `KP Reports`
  - `Jaimini Reports`
  - `Numerology Reports`
  - `Signature Reports`
- Each report lane must show only reports for that school.
- Each report lane must include:
  - report promise
  - best-for line
  - Free versus Premium/paid depth
  - required input/readiness state
  - method boundary note
  - `Download your report` path after report preparation
- The school boundaries are strict:
  - Vedic Predicta reports use classical Parashari Kundli, charts, dasha,
    panchang, varga, Dosh, Shrap, Yog, Lal Kitab, and remedies. They do not
    include KP, Jaimini, Numerology, or Signature report sections.
  - KP Predicta reports use event judgement and timing through cusps, star
    lords, sub-lords, sub-sub lords where available, significators, ruling
    planets, dasha support, and transit trigger windows. They do not become
    Vedic personality-style readings.
  - Jaimini Predicta reports use Atmakaraka, Chara Karakas, Karakamsha, Swamsa,
    Arudha, Upapada, Jaimini sign aspects, Chara Dasha, role/destiny guidance,
    and practical life-direction insight. They do not use KP cusp logic and do
    not become a Parashari D1/D9 chart dossier.
  - Numerology Predicta reports use name/date number rhythm, name number, birth
    number, destiny or life-path number, personal cycles, repeated/missing
    number patterns, and name refinement. They do not include Kundli judgement
    unless a separately approved synthesis report explicitly says so.
  - Signature Predicta reports use confirmed signature traits, size, slant,
    pressure, baseline, spacing, legibility, rhythm, underline/flourish,
    consistency, self-expression summary, and improvement guidance. They do not
    include Numerology or Vedic synthesis unless a separately approved synthesis
    report explicitly says so.
- KP report content contract:
  - selected event question
  - relevant houses for the selected event
  - KP cusps
  - star lord, sub lord, and sub-sub lord where available
  - significator hierarchy
  - ruling planets
  - dasha support
  - transit trigger windows
  - final event likelihood with confidence and limitations
  - free/basic gives useful promise and timing insight
  - premium/paid gives full event proof and timing reasoning
- Jaimini report content contract:
  - Atmakaraka and soul-role reading
  - Amatyakaraka and career-dharma reading
  - Darakaraka and relationship-mirror reading
  - Chara Karaka council
  - Swamsa and Karakamsha charts
  - Arudha and visible-identity proof
  - Upapada relationship/life-contract proof where available
  - Jaimini sign aspects
  - Chara Dasha chapter timing where available
  - practical destiny guidance
  - free/basic gives a useful destiny-role reading
  - premium/paid gives deeper Chara Karaka, Arudha, Upapada, Chara Dasha, and
    contradiction analysis
- Numerology report content contract:
  - name number
  - birth number
  - destiny or life-path number
  - personal year, personal month, and personal day where available
  - repeated and missing number patterns
  - name rhythm
  - strengths and caution patterns
  - timing calendar
  - free/basic gives core numbers and simple meaning
  - premium/paid gives detailed interpretation, timing, compatibility, and
    name-spelling or brand-name comparison
- Signature report content contract:
  - signature sample or confirmed manual-observation state
  - size
  - slant
  - pressure
  - baseline
  - spacing
  - legibility
  - rhythm
  - underline/flourish
  - consistency
  - self-expression summary
  - improvement suggestions
  - privacy and safety framing
  - free/basic gives reflective visible-trait insight
  - premium/paid gives multi-sample comparison, before/after guidance, and a
    signature refinement plan
- Do not ship a generic `All Reports` flow that hides school boundaries.
- Do not show synthesis reports inside any school lane unless a future approved
  phase creates an explicit `Synthesis Reports` lane.
- Use these market/reference anchors during implementation research:
  - KP report expectations: `https://www.kpastro.ai/`,
    `https://deluxeastrology.com/kp-astrology`, and comparable KP report tools
    that emphasize cusps, sub-lords, significators, ruling planets, and event
    timing
  - Numerology report expectations: personal numerology report examples that
    include name number, birth number, destiny/life-path number, and personal
    timing cycles, such as
    `https://www.astronumero.org/wp-content/uploads/numerology-template-3-personal-analysis-detailed.pdf`
  - Signature report expectations: graphology references that focus on size,
    slant, pressure, baseline, spacing, rhythm, legibility, and signature
    consistency, such as `https://handwritingfoundation.org/graphology-terms/`
    and
    `https://instituteofgraphology.com/why-is-signature-important-in-graphology/`

### Strict Audit

This phase is green only when:

- `/dashboard/report` starts with `Choose your report world`
- web report page shows five separated lanes: Vedic, KP, Jaimini, Numerology, and
  Signature
- mobile-width report page shows the same five separated lanes without cramped
  controls
- each lane shows only school-appropriate report options
- each lane has a best-for line and method boundary note
- Vedic lane does not include KP, Jaimini, Numerology, or Signature sections
- KP lane does not become a Vedic personality report
- Jaimini lane does not use KP cusp logic and does not become a Parashari chart
  dossier
- Numerology lane does not include Kundli judgement unless an explicit future
  synthesis lane exists
- Signature lane does not include Numerology or Vedic synthesis unless an
  explicit future synthesis lane exists
- report generation passes the selected school/report focus into PDF
  composition explicitly
- generated KP sample report contains the KP content contract and no Vedic mixed
  bag sections
- generated Jaimini sample report contains the Jaimini content contract and no
  KP cusp logic
- generated Numerology sample report contains the Numerology content contract
  and no Kundli judgement
- generated Signature sample report contains the Signature content contract and
  no hard fixed-personality claims
- Free and Premium/paid depth is shown per lane without making free reports look
  cheap or useless
- any unavailable school data is shown as a readiness/pending state, not hidden
  or fabricated
- screenshots are captured for desktop and mobile-width report marketplace
- at least one generated PDF or composition fixture is captured for KP, Jaimini,
  Numerology, and Signature report focus
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes

## Phase 2: `PREDICTA_REPORT_PDF_PHASE_2_VEDIC_INTELLIGENCE_DATA_CONTRACT`

### Intent

Create one shared Vedic intelligence contract so the Vedic section, web report
page, mobile report surfaces, and PDF reports consume the same Vedic data
instead of rebuilding meaning in separate places.

This phase is not only for reports. The user-facing Vedic section must also use
this contract to show the newly added details in a clean, uncluttered way.
Reports consume the same data contract for PDF generation.

### Required Work

- Define structured Vedic intelligence models for:
  - Vedic snapshot
  - Moon chart / Chandra Lagna chart
  - Mahadasha Phala and Meaning
  - Vedic graha display labels and visual metadata
  - house-wise planet placement table
  - planet friendship table
  - natural benefics and natural malefics
  - functional benefics and functional malefics
  - Chalit table
  - Panchang
  - Samsa
  - Ghatak and favorable factors
  - Karakamsha
  - Ashtakavarga and Prastarashtakavarga
  - Avakhada chakra
- Each model must include:
  - concise explanation
  - free insight
  - premium detailed analysis field
  - evidence/source fields
  - limitations where calculation confidence is lower
- The Mahadasha Phala and Meaning model must include:
  - past Mahadasha summaries without Antardasha or Pratyantardasha expansion
  - current Entire Mahadasha block
  - current Mahadasha plus Antardasha block
  - current Mahadasha plus Antardasha plus Pratyantardasha block
  - free/basic insight for every visible block
  - premium/paid detail for every visible block
  - explicit note that Pratyantardasha is a fine timing layer and should not be
    overclaimed
- The shared contract must expose canonical graha display labels:
  - English: `Moon`, `Sun`, `Mars`, `Jupiter`, `Venus`, `Saturn`, `Mercury`,
    `Rahu`, `Ketu`
  - Hindi roman: `Chandra`, `Surya`, `Mangal`, `Brahaspati`, `Shukra`,
    `Shani`, `Budh`, `Rahu`, `Ketu`
  - Gujarati roman: `Chandra`, `Surya`, `Mangal`, `Guru`, `Shukra`, `Shani`,
    `Budh`, `Rahu`, `Ketu`
- The shared contract must expose Vedic graha visual metadata for web, mobile,
  and PDF:
  - accessible label
  - short label
  - localized display label
  - polished graha badge/icon token
  - Rahu/Ketu shadow-node treatment
  - moon phase state for waxing, waning, full, and dark moon visuals
- Add user-facing Vedic section models/components for the same intelligence:
  - clean cards or grouped sections
  - progressive disclosure where needed
  - free useful insight without technical overload
  - premium detailed analysis for every section
- When a valid Kundli is available, the Vedic section must show the newly added
  sections and items.
- The Vedic section must show the Moon chart / Chandra Lagna chart in a clean,
  meaningful way alongside D1, Chalit, and other relevant Vedic charts.
- The Vedic section must order charts as D1, Moon chart / Chandra Lagna chart,
  D9 Navamsa, then remaining vargas.
- When the user switches to another valid Kundli, the Vedic section must refresh
  to the selected Kundli's intelligence without showing stale details from the
  previous Kundli.
- PDF reports must consume the same Vedic intelligence contract as the Vedic
  section.
- Keep deterministic calculation separate from prose rendering.
- Keep Parashari/Vedic logic separate from KP and Jaimini logic unless an approved
  handoff/synthesis requires it.

### Strict Audit

This phase is green only when:

- TypeScript types compile across shared packages
- web, mobile, Vedic section, and PDF import the same Vedic intelligence
  contract
- no duplicate one-off report section type is introduced for only one surface
- fixture output proves every required section exists for a real Kundli
- Vedic section shows the newly added sections when a valid Kundli is active
- Vedic section shows the Moon chart / Chandra Lagna chart when a valid Kundli
  is active
- Vedic section shows Mahadasha Phala and Meaning with past periods summarized
  and current period split into Entire Mahadasha, Mahadasha plus Antardasha, and
  Mahadasha plus Antardasha plus Pratyantardasha
- Vedic section chart order is D1, Moon chart / Chandra Lagna chart, D9
  Navamsa, then remaining vargas
- Vedic section refreshes the displayed intelligence when the active Kundli is
  switched
- free users see useful, non-technical insight in the Vedic section
- premium users see detailed analysis for every newly added Vedic section
- missing or pending calculations are represented as honest pending states, not
  fabricated values
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm --filter @pridicta/astrology build` passes
- `corepack pnpm build:web` passes

## Phase 3: `PREDICTA_REPORT_PDF_PHASE_3_CLASSICAL_JYOTISH_MODULES`

### Intent

Implement the deterministic Jyotish modules that the richer report requires.

### Required Work

- Implement Moon chart / Chandra Lagna chart generation:
  - Moon sign becomes the first-house reference
  - all signs and planets are remapped from Moon as the Lagna reference
  - the chart must preserve actual planet sign, degree, nakshatra, and status
  - output must be deterministic and shared by web, mobile, reports, and chat
- Implement planet friendship:
  - natural friendship
  - temporary friendship where supported
  - compound relationship where supported
  - user-facing interpretation
- Implement natural benefic/malefic classification.
- Implement functional benefic/malefic classification by Lagna.
- Implement house-wise planet condition data:
  - planet
  - house
  - sign
  - degree
  - nakshatra and pada
  - retrograde
  - combust
  - exalted
  - debilitated
  - dignity
- Implement or harden Mahadasha Phala and Meaning:
  - past Mahadashas return Mahadasha-level summaries only
  - past Mahadashas do not show Antardasha or Pratyantardasha drill-down
  - free/basic past Mahadasha output is a short useful summary insight
  - premium/paid past Mahadasha output is one polished paragraph per Mahadasha
  - current Entire Mahadasha returns free insight and premium detailed phala
  - current Mahadasha plus Antardasha returns free insight and premium detailed
    combination analysis
  - current Mahadasha plus Antardasha plus Pratyantardasha returns free insight
    and one premium paragraph only
  - Pratyantardasha language stays conservative because it is a fine timing
    layer
- Implement or harden:
  - Moon chart / Chandra Lagna chart
  - Samsa
  - Ghatak and favorable factors
  - Chalit table for Chalit chart
  - Panchang
  - Karakamsha
  - Ashtakavarga
  - Prastarashtakavarga
  - Avakhada chakra
- If a module cannot be implemented with current backend data, it must return a
  clear pending/calculation-limited state and must not invent values.

### Strict Audit

This phase is green only when:

- deterministic unit tests cover every new module
- deterministic tests prove Moon chart houses are correctly remapped from Moon
  while planet signs/degrees/status are preserved
- snapshot or fixture tests cover at least one real Kundli
- tests prove no required table silently disappears
- tests prove pending states are explicit when data is unavailable
- tests prove past Mahadashas never expand into Antardasha or
  Pratyantardasha detail
- tests prove current Mahadasha output has the three required layers: Entire
  Mahadasha, Mahadasha plus Antardasha, and Mahadasha plus Antardasha plus
  Pratyantardasha
- tests prove Premium adds depth without fabricating certainty or overclaiming
  Pratyantardasha timing
- graha labels follow the approved language contract: English uses `Moon`,
  `Sun`, `Mars`, `Jupiter`, `Venus`, `Saturn`, `Mercury`, `Rahu`, `Ketu`; Hindi
  roman uses `Chandra`, `Surya`, `Mangal`, `Brahaspati`, `Shukra`, `Shani`,
  `Budh`, `Rahu`, `Ketu`; Gujarati roman uses `Chandra`, `Surya`, `Mangal`,
  `Guru`, `Shukra`, `Shani`, `Budh`, `Rahu`, `Ketu`
- Sanskrit/Jyotish labels are spelled consistently in English, Hindi, and
  Gujarati surfaces where localized labels exist
- `corepack pnpm --filter @pridicta/astrology build` passes
- `corepack pnpm --filter @pridicta/pdf build` passes
- mobile typecheck impact is audited and either green or explicitly blocked by
  known unrelated failures

## Phase 4: `PREDICTA_REPORT_PDF_PHASE_4_DOCUMENT_BRAND_AND_TEMPLATE_SYSTEM`

### Intent

Rebuild the PDF visual system so every report feels like a polished Predicta
dossier.

### Required Work

- First page only:
  - dark Predicta theme
  - magenta, blue, and green hues
  - polished cover hierarchy
  - subject name and report mode
- Every page:
  - faint Predicta logo watermark
  - structured footer:
    - left: `Prepared by Predicta @2026`
    - center: subject name
    - right: `{page number} / {total pages}` using the real rendered page
      number and real rendered total page count
- Light editorial pages after the cover:
  - premium spacing
  - readable hierarchy
  - no SaaS-dashboard card dump
  - deterministic page templates
- Preserve registered Indic fonts.
- Preserve free/premium dignity parity.

### Strict Audit

This phase is green only when:

- generated free PDF has the dark cover and light interior pages
- generated premium PDF has the dark cover and light interior pages
- every inspected page has the watermark
- every inspected page has the corrected structured footer
- Hindi and Gujarati generated PDFs show native-script text without gibberish
- no page has footer/content collision
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes
- rendered PDF page screenshots are captured for cover, chart, table, and final
  page

## Phase 4A: `PREDICTA_REPORT_PDF_PHASE_4A_PEARL_EDITORIAL_INTERIOR_SYSTEM`

### Intent

Replace the current light yellow interior look with a quiet, spacious, ultra
premium editorial paper system. The PDF should feel like a luxury astrology
dossier: polished, precise, readable, and unmistakably Predicta.

The dark Predicta cover remains the expressive cosmic surface. Interior pages
must feel like premium paper with subtle brand atmosphere, not a dashboard
export and not a yellow template.

### Required Work

- Remove light yellow interior page backgrounds from report PDFs.
- Define the Predicta Pearl Editorial interior palette:
  - soft porcelain or moonstone page background, such as `#F7F7F2`, `#F4F1EA`,
    or `#F6F5F0`
  - deep ink/navy-black text, such as `#151925`
  - no pure black as the default text treatment
  - restrained champagne gold accent lines, such as `#C8A96A`
  - tiny magenta, blue, and green Predicta accents only for section markers or
    carefully controlled brand moments
- Add a faint centered Predicta logo watermark on every page:
  - approximately `3%` to `6%` opacity
  - large enough to feel branded
  - never strong enough to compete with text, charts, tables, or footers
- Replace Helvetica-style generic typography with a premium editorial type
  system:
  - English headings use an elegant editorial serif such as `Cormorant
    Garamond` or `Libre Baskerville`
  - English body text uses a readable premium serif such as `Source Serif 4` or
    `Newsreader`
  - Hindi uses a registered Indic serif such as `Noto Serif Devanagari`
  - Gujarati uses a registered Indic serif such as `Noto Serif Gujarati`
  - fallback fonts must be deliberate and documented, not accidental Helvetica
- Rebuild table styling:
  - no heavy boxes
  - hairline dividers
  - generous row height
  - muted header bands
  - small-caps or letterspaced labels where supported by the selected font
- Rebuild Kundli chart plates:
  - clean porcelain chart plates
  - refined gold or copper chart lines
  - labels that feel engraved or editorial, not pill clutter
  - no light yellow chart cards
- Keep free and premium reports visually equal in dignity. Premium can add more
  pages, more detail, and deeper analysis, but not a more respectable visual
  foundation.

### Strict Audit

This phase is green only when:

- generated free PDF interiors use Predicta Pearl Editorial backgrounds, not
  light yellow
- generated premium PDF interiors use Predicta Pearl Editorial backgrounds, not
  light yellow
- rendered page images prove the centered watermark appears on cover, chart,
  table, dense reading, and final pages without overpowering content
- rendered page images prove text remains readable over the watermark
- rendered page images prove table pages use hairline dividers, generous row
  height, and muted header treatment instead of heavy boxes
- rendered page images prove Kundli chart plates use porcelain backgrounds and
  refined gold or copper lines instead of yellow cards
- English generated PDFs do not rely on Helvetica as the primary heading or body
  font
- Hindi and Gujarati generated PDFs use registered Indic fonts and show no
  gibberish
- free and premium report screenshots have the same baseline design dignity
- first page still uses the dark Predicta theme only
- every inspected interior page keeps the corrected footer and has no
  footer/content collision
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes

## Phase 4B: `PREDICTA_REPORT_PDF_PHASE_4B_CELESTIAL_SEAL_COVER_SYSTEM`

### Intent

Make the first page feel like a personal celestial certificate and a premium
Predicta artifact. The cover must create a "this was made for me" moment before
the reading begins.

### Required Work

- Keep the first page as the only dark Predicta page:
  - deep midnight/navy-black foundation
  - subtle magenta, blue, and green aurora gradients
  - no loud rainbow gradient blocks
  - no light interior-page styling on the cover
- Create a refined central celestial seal:
  - circular seal composition
  - faint North Indian Kundli geometry inside or behind the seal
  - lunar orbit ring
  - tiny polished star-field details
  - thin champagne-gold celestial ring or Kundli outline
- Present the subject identity with luxury invitation-like hierarchy:
  - subject name as the primary cover element
  - date of birth
  - birth time
  - birth place
  - generous spacing around every personal detail
  - clean small-caps rows or equivalent refined metadata treatment
  - gold dividers or hairlines, not table boxes
- Include report identity:
  - report type, such as `Free Kundli Report` or `Premium Vedic Report`
  - quiet descriptor, such as `A Predicta Vedic Intelligence Report`
  - quiet preparation line, such as `Prepared with birth chart, panchang, dasha,
    and classical Jyotish analysis`
- Add the birth moment signature:
  - Moon nakshatra and pada, such as `Moon: Mula Pada 4`
  - Lagna sign, such as `Lagna: Leo`
  - current dasha, such as `Current Dasha: Venus`
  - values must come from deterministic chart/report data, not decorative text
  - if a value is unavailable, show an honest pending/limited state or omit that
    token without fabricating it
- Place the Predicta logo on the cover with restraint:
  - top or bottom placement
  - not oversized
  - visually subordinate to the subject name and celestial seal
- Preserve typography rules:
  - elegant serif for the subject name
  - polished small metadata typography for date, time, place, and report type
  - registered Indic fonts for Hindi and Gujarati cover text
- Avoid cover layouts that look like:
  - a form
  - a dashboard card
  - a generic PDF title page
  - a plain data table

### Strict Audit

This phase is green only when:

- rendered free PDF cover includes subject name, date of birth, birth time,
  birth place, report type, and birth moment signature
- rendered premium PDF cover includes subject name, date of birth, birth time,
  birth place, report type, and birth moment signature
- cover birth moment signature is backed by deterministic report data for Moon
  nakshatra/pada, Lagna sign, and current dasha where available
- cover does not fabricate unavailable signature values
- rendered cover uses deep midnight/navy-black dark Predicta theme with subtle
  magenta, blue, and green aurora hues
- rendered cover includes a refined central celestial seal with Kundli geometry,
  lunar orbit, star-field detail, and champagne-gold ring or outline
- rendered cover does not look like a dashboard card, form, table, or generic
  title page
- Predicta logo placement is polished and not oversized
- English generated covers do not rely on Helvetica as the primary heading or
  body font
- Hindi and Gujarati generated covers use registered Indic fonts and show no
  gibberish
- cover remains visually distinct from the Pearl Editorial interior pages
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes

## Phase 5: `PREDICTA_REPORT_PDF_PHASE_5_FULL_WIDTH_CHART_SAFE_PDF_LAYOUT`

### Intent

Make PDF charts document-grade. No hidden planets. No split charts. No label
leakage.

### Required Work

- Render one Kundli chart per row.
- Give each Kundli 100% row width and proper vertical space.
- Show all classical planets in the chart.
- Remove all PDF chart overflow counters.
- Replace Western planet glyph-only labels with the shared Vedic graha badge
  system.
- Keep planet labels readable in the chart, legend, and house-wise table:
  English uses `Moon`, `Sun`, `Mars`, `Jupiter`, `Venus`, `Saturn`, `Mercury`,
  `Rahu`, `Ketu`; Hindi roman uses `Chandra`, `Surya`, `Mangal`,
  `Brahaspati`, `Shukra`, `Shani`, `Budh`, `Rahu`, `Ketu`; Gujarati roman uses
  `Chandra`, `Surya`, `Mangal`, `Guru`, `Shukra`, `Shani`, `Budh`, `Rahu`,
  `Ketu`.
- Render Rahu and Ketu as polished shadow-node graha badges, not generic Western
  node glyphs or frightening demon imagery.
- Render waxing, waning, full, and dark moon states as refined lunar phase discs
  with readable labels.
- Add a planet legend or adjacent house-wise table when the chart itself would
  become crowded.
- Keep chart geometry synchronized with the app's North Indian chart model.
- Keep chart theme notes concise and non-cluttering.
- Add house-wise planet placement table immediately after chart pages.
- Include Moon chart / Chandra Lagna chart in chart pages where the selected
  report needs core Vedic chart proof.
- Render report chart pages in this order: Lagna/Rashi D1, Moon chart /
  Chandra Lagna chart, Navamsa D9, then remaining varga charts.

### Strict Audit

This phase is green only when:

- report chart pages render in the required order: D1, Moon chart / Chandra
  Lagna chart, D9 Navamsa, then remaining vargas
- D1, Moon chart / Chandra Lagna chart, and D9 chart pages show all planets
  without `+1`, `+2`, or `+3`
- chart pages do not use Western glyph-only planet labels on Vedic Kundli
  surfaces
- chart pages follow the approved English versus Hindi/Gujarati graha naming
  rules
- Rahu/Ketu and moon phase visuals are clear, polished, and readable in rendered
  page images
- Moon chart uses Moon as the first-house reference and does not duplicate D1
  house placement by mistake
- a crowded chart fixture still shows every classical planet somewhere visible
  in the chart/legend/table set
- no chart label crosses into a wrong house
- no chart splits across pages
- house-wise table includes planet, house, sign, degree, nakshatra/pada,
  retrograde, combust, exalted, debilitated, and dignity
- chart pages are visually inspected from rendered page images
- `corepack pnpm --filter @pridicta/astrology build` passes
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes

## Phase 6: `PREDICTA_REPORT_PDF_PHASE_6_REPORT_CONTENT_PACKAGING_AND_TABLES`

### Intent

Package the expanded Vedic intelligence into clean report sections without
overwhelming users.

### Required Work

- Add report sections for:
  - Vedic snapshot
  - Moon chart / Chandra Lagna chart
  - Mahadasha Phala and Meaning
  - friendship table
  - benefics and malefics
  - house-wise planet table
  - Chalit table
  - Panchang
  - Samsa
  - Ghatak and favorable factors
  - Karakamsha
  - Ashtakavarga
  - Prastarashtakavarga
  - Avakhada chakra
- Free reports must include every section with:
  - clear explanation
  - practical user meaning
  - concise insight
- Free/basic Mahadasha Phala and Meaning must include:
  - past Mahadasha summary insight only
  - current Entire Mahadasha insight
  - current Mahadasha plus Antardasha insight
  - current Mahadasha plus Antardasha plus Pratyantardasha practical timing
    insight
- Premium reports must add:
  - detailed analysis
  - contradiction handling
  - timing relevance
  - cross-reference to dasha, gochar, Chalit, and Ashtakavarga where useful
- Premium/paid Mahadasha Phala and Meaning must include:
  - one polished paragraph per past Mahadasha, still without Antardasha or
    Pratyantardasha drill-down
  - detailed phala for the current Entire Mahadasha using chart evidence,
    dignity, house, sign, nakshatra, strength, and caution/support
  - detailed combination analysis for current Mahadasha plus Antardasha
  - one paragraph only for current Mahadasha plus Antardasha plus
    Pratyantardasha
  - conservative wording that avoids pretending Pratyantardasha can guarantee
    exact events
- Tables must be readable. If a table wraps badly, convert it into cards,
  row-blocks, or appendix pages.

### Strict Audit

This phase is green only when:

- free generated PDF contains every required section
- premium generated PDF contains every required section with deeper analysis
- generated report includes Moon chart / Chandra Lagna chart when the report
  needs core Vedic chart proof
- generated report includes Mahadasha Phala and Meaning with the approved past
  summary and current three-layer structure
- generated free/basic Mahadasha section is useful without becoming a long dasha
  wall
- generated premium/paid Mahadasha section adds depth but keeps
  Pratyantardasha to one paragraph
- generated report keeps Vedic chart order as D1, Moon chart / Chandra Lagna
  chart, D9 Navamsa, then remaining vargas
- no table has broken wrapping that makes it harder to read than prose
- no section dumps raw technical evidence without a plain-language explanation
- no page contains a dense wall of text
- section ordering feels easy for a first-time user
- generated English, Hindi, and Gujarati PDFs are visually inspected
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes

## Phase 7: `PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS`

### Intent

Enhance Predicta's memory, chat context, and report-to-chat handoff so she
understands every new report calculation and table. The user should be able to
ask about anything in the generated report and get a grounded explanation, not a
generic answer.

This phase must also refine Predicta's broader app memory if needed. Predicta
should behave like a living digest of the entire app: she should know the app's
features, routes, reports, specialist rooms, calculations, pricing boundaries,
saved-context behavior, and astrology concepts well enough to guide a user
calmly without sounding lost or generic.

Predicta must be a master of Parashari Vedic, Krishnamurti KP, Jaimini Jyotish,
Numerology, and Signature Analysis. She can answer questions from any of these
systems when the user is in the correct context, and she must remain aware of
which context is active.

Knowing the entire app does not mean mixing every method carelessly. Predicta
must remain source-aware and room-safe:

- Vedic Predicta answers from Parashari/Vedic context only.
- KP Predicta answers from Krishnamurti KP context only.
- Jaimini Predicta answers from Jaimini Jyotish context only.
- Numerology Predicta may answer solely from Numerology, or combine Vedic plus
  Numerology when the user asks for a combined reading.
- Signature Predicta may answer solely from Signature Analysis, or combine
  Vedic plus Signature Analysis when the user asks for a combined reading.
- If a user asks for a method outside the active room, Predicta should hand off
  or clearly ask whether the user wants a combined reading where that room
  supports combination.

### Whole-App Awareness Scope

If the current memory/context architecture cannot support the scope below, this
phase must improve that architecture before it can be green.

Predicta must know:

- Product structure:
  - one Predicta product
  - five specialist rooms/worlds
  - Vedic Predicta
  - KP Predicta
  - Jaimini Predicta
  - Numerology Predicta
  - Signature Predicta
  - school-separated report lanes for Vedic, KP, Jaimini, Numerology, and
    Signature
  - no mixed bag report path unless a future approved Synthesis Reports lane is
    added
  - shared Kundli/profile context
  - room-specific method boundaries
  - supported combination rules for Numerology plus Vedic and Signature plus
    Vedic
- Core user flows:
  - create Kundli
  - open saved Kundlis
  - ask chat questions
  - switch specialist rooms
  - generate reports
  - download PDFs
  - open remedies
  - review birth-time confidence
  - use family/relationship surfaces where available
  - use premium/day-pass/report purchase flows
- App content and feature catalog:
  - dashboard cards and what they do
  - Vedic world content
  - charts page content
  - report marketplace options
  - report marketplace school lanes and their boundaries
  - pricing/free/premium boundaries
  - support/safety/legal guidance at a high level
  - language preferences
  - saved context and recovery behavior
- Astrology capability map:
  - D1, Moon chart / Chandra Lagna chart, D9, D10, Chalit, vargas, dasha,
    gochar, Sade Sati, remedies
  - Panchang, Ashtakavarga, Prastarashtakavarga, Avakhada, Karakamsha
  - planet dignity, combustion, retrogression, benefic/malefic logic
  - friendship tables and house-wise planet evidence
  - Parashari/Vedic scope and evidence rules
  - Krishnamurti KP cusp/sub-lord/significator scope and boundaries
  - Jaimini Jyotish Atmakaraka, Chara Karaka, Karakamsha, Swamsa, Arudha,
    Upapada, Rashi Drishti, and Chara Dasha scope and boundaries
  - Dosh, Shrap, Yog, and Lal Kitab scope and evidence rules
  - Numerology-only and Vedic-plus-Numerology scope
  - Signature-only and Vedic-plus-Signature scope
- User guidance behavior:
  - explain where to go in the app
  - explain what a feature does
  - explain what a report section means
  - explain what is free vs premium
  - explain what data is missing or pending
  - avoid pretending a calculation exists when it is pending
  - avoid scary or fatalistic language
  - hand off to the right specialist room when needed

### Predicta Must Be Aware Of

Predicta must know that reports can now include:

- Vedic snapshot:
  - Lagna
  - Moon chart / Chandra Lagna chart
  - Moon sign
  - Moon nakshatra and pada
  - current dasha
  - Panchang summary
  - strongest and weakest Ashtakavarga houses
- Mahadasha Phala and Meaning:
  - Mahadasha as the major life chapter
  - Antardasha as the active delivery channel inside the Mahadasha
  - Pratyantardasha as a fine timing layer that must be explained carefully
  - past Mahadashas are summarized only at Mahadasha level
  - past Mahadashas must not be explained with Antardasha or Pratyantardasha
    drill-down in reports
  - free/basic past Mahadasha gives a short useful summary insight
  - premium/paid past Mahadasha gives one polished paragraph per Mahadasha
  - current Entire Mahadasha gets its own insight and premium detailed phala
  - current Mahadasha plus Antardasha gets its own insight and premium
    combination analysis
  - current Mahadasha plus Antardasha plus Pratyantardasha gets its own insight
    and one premium paragraph only
  - Predicta must avoid overclaiming exact events from Pratyantardasha
- Cover birth moment signature:
  - subject name
  - date of birth
  - birth time
  - birth place
  - report type
  - Moon nakshatra and pada
  - Lagna sign
  - current dasha where available
  - why these cover fields were chosen and what they mean
- House-wise planet placement table:
  - planet
  - house
  - sign
  - degree
  - nakshatra and pada
  - retrograde status
  - combust status
  - exalted status
  - debilitated status
  - dignity
- Planet friendship table:
  - natural friendship
  - temporary friendship where available
  - compound relationship where available
  - how relationship tension or support should be explained simply
- Benefic and malefic classification:
  - natural benefics
  - natural malefics
  - functional benefics by Lagna
  - functional malefics by Lagna
  - why natural and functional classifications can differ
- Chalit table:
  - D1 house
  - Chalit house
  - shift direction
  - shifted or unchanged status
  - practical delivery meaning
- Panchang:
  - birth Panchang where available
  - current personal Panchang where available
  - weekday, tithi, Moon rhythm, favorable actions, cautions, and remedy tone
- Samsa:
  - what it means
  - how it is calculated or why it is pending
  - user-facing interpretation
- Ghatak and favorable factors:
  - Ghatak signals
  - favorable supports
  - how to explain caution without fear language
- Karakamsha:
  - Atmakaraka basis where available
  - Navamsha/Karakamsha context
  - user-facing purpose and dharma meaning
- Ashtakavarga:
  - SAV house scores
  - BAV planet scores where available
  - strongest houses
  - weakest houses
  - practical guidance by score band
- Prastarashtakavarga:
  - bindu source table where available
  - pending/calculation-limited state where not available
  - how it supports transit and strength judgment
- Avakhada chakra:
  - birth-star identity fields
  - gana, yoni, nadi, varna, vashya, tatva, and related fields where available
  - user-facing explanation that avoids overwhelming beginners
- Dosh:
  - present/weak/cancelled/softened/not-present status
  - exact planetary, house, sign, nakshatra, dignity, and timing evidence where
    available
  - plain-life meaning, activation, softening factors, and remedies
  - canonical user-facing term is `Dosh`, not `Dosha`
- Shrap:
  - karmic pressure indicators only where deterministic evidence supports them
  - why the pattern appears, what it asks the user to mature, and what safely
    helps
  - canonical user-facing term is `Shrap`, not `Shrapa`
  - never call the user cursed
- Yog:
  - positive and challenging Yog entries
  - why each Yog is present, what supports it, what weakens it, and when it
    becomes relevant
  - avoid duplicate readings when the same planetary condition appears in Dosh,
    Shrap, and Yog sections
- Lal Kitab:
  - house-wise planet reading
  - planet-wise upay where safe
  - rin/debt indicators only with deterministic evidence
  - do/don't guidance and remedy contraindications
  - no fear-selling or guaranteed outcomes
- PDF/report presentation rules:
  - `/dashboard/report` uses separate school report lanes
  - Vedic, KP, Jaimini, Numerology, and Signature reports stay method-bounded
  - synthesis reports are not available unless separately approved and clearly
    labeled
  - first page dark Predicta theme
  - Celestial Seal Cover with subject details and birth moment signature
  - light editorial interior pages
  - faint Predicta watermark
  - footer text `Prepared by Predicta @2026`
  - one full-width Kundli per row
  - Moon chart included where core Vedic chart proof is needed
  - Vedic chart order is D1, Moon chart / Chandra Lagna chart, D9 Navamsa, then
    remaining vargas
  - no chart overflow counters
  - house-wise planet table after charts
- Free/Premium boundaries:
  - free includes every section with concise useful insight
  - premium adds detailed analysis, cross-references, contradictions, timing,
    and practical guidance
  - premium never changes the truth of the calculation, only the depth

### Required Work

- Add the new report intelligence contract to Predicta chat context.
- Add or refine an app-wide Predicta memory digest that indexes the app's
  available routes, specialist rooms, report types, calculations, premium
  boundaries, and user-facing feature explanations.
- Add report-summary memory when a user generates or downloads a report.
- Add section-aware report-to-chat handoff prompts for every new table and
  calculation.
- Add report-lane memory so Predicta knows which school produced the report and
  does not explain it with another school's method by mistake.
- Update Vedic Predicta system/context instructions so she knows these modules
  belong to Parashari/Vedic report logic.
- Update KP/Jaimini/Numerology/Signature boundaries so they do not incorrectly
  claim or mix these Vedic modules unless a handoff/synthesis is explicit.
- Add follow-up prompts such as:
  - `Explain my friendship table`
  - `Explain my functional benefics and malefics`
  - `Explain my Chalit shifts`
  - `Explain my Moon chart`
  - `Explain my Mahadasha Phala`
  - `Explain my current Mahadasha, Antardasha, and Pratyantardasha`
  - `Explain my Avakhada chakra`
  - `Explain my Ashtakavarga score`
  - `Explain my Ghatak and favorable factors`
  - `Explain my Dosh section`
  - `Explain my Shrap indicators`
  - `Explain my positive Yog`
  - `Explain my challenging Yog`
  - `Explain my Lal Kitab guidance`
  - `Explain Jaimini Jyotish`
- Ensure Predicta can answer:
  - what the table means
  - how it was calculated or why it is pending
  - what it means for the user's life
  - what free vs premium depth changes
  - what confidence limits apply
- Ensure chat replies cite the relevant table/section instead of inventing new
  unrelated reasoning.
- Ensure saved report context can survive navigation and later chat entry.
- Ensure app-wide feature awareness can be refreshed when routes, pricing,
  reports, calculations, or specialist-room capabilities change.
- Ensure Predicta can answer "Where do I find this?", "What does this feature
  do?", and "Why is this in my report?" from app memory rather than guessing.

### Strict Audit

This phase is green only when:

- Predicta can answer basic navigation and feature questions across the app
  without sounding generic or lost
- Predicta can explain the difference between the five specialist rooms and
  route the user correctly
- Predicta can answer Parashari Vedic, Krishnamurti KP, Jaimini Jyotish,
  Numerology, and Signature Analysis questions in the correct active context
- Vedic Predicta can explain the user's Moon chart / Chandra Lagna chart and how
  it differs from D1
- Vedic, KP, and Jaimini rooms do not mix methods unless they explicitly hand off
- Numerology can answer solely from Numerology or combine Vedic plus Numerology
  when requested
- Signature can answer solely from Signature Analysis or combine Vedic plus
  Signature Analysis when requested
- after generating a report, Vedic Predicta can answer questions about every new
  report section listed above
- after generating a report, Vedic Predicta can explain why past Mahadashas are
  summarized and why the current Mahadasha is split into three layers
- after generating a report, Vedic Predicta can explain the free versus premium
  difference for Mahadasha Phala without promising impossible certainty
- app-wide memory includes route/feature/report/calculation summaries, not only
  the active Kundli
- chat context includes the generated report mode, report type, subject name,
  selected school/report lane, and available section list
- Predicta can explain why the Reports page separates Vedic, KP, Jaimini,
  Numerology, and Signature reports
- Predicta does not answer a KP report question with Vedic reasoning, a Jaimini
  report question with KP cusp logic, or a Numerology/Signature report question
  with Kundli judgement unless an explicit synthesis path exists
- asking about a pending calculation produces an honest pending/explanation
  response, not a fabricated answer
- asking KP/Jaimini/Numerology/Signature about a Vedic-only report module triggers
  the correct boundary or handoff behavior
- follow-up prompts exist for the major new tables
- report-to-chat CTA carries selected report context into chat
- saved report context survives navigation and reload where the existing memory
  system supports it
- tests or deterministic fixtures prove the app memory digest updates when new
  report sections or major app features are added
- tests cover report-context construction and at least three table-specific chat
  handoffs
- `corepack pnpm --filter @pridicta/config build` passes if the config package
  has a build script
- `corepack pnpm --filter @pridicta/astrology build` passes
- `corepack pnpm build:web` passes
- affected mobile checks pass or known unrelated blockers are documented

## Phase 8: `PREDICTA_REPORT_PDF_PHASE_8_WEB_MOBILE_PARITY`

### Intent

Remove the report-quality split between web and mobile.

### Required Work

- Mobile and web must use the same report intelligence contract.
- Mobile must not keep a lower-quality HTML-only report export if web uses a
  document-grade renderer.
- PDF requests must produce the same report class and content quality across
  surfaces.
- Any surface-specific download/file-saving code must only handle transport,
  not rebuild report content.

### Strict Audit

This phase is green only when:

- web and mobile share the same report composition data
- web and mobile expose Moon chart / Chandra Lagna chart through the same shared
  chart/intelligence contract
- mobile no longer owns a divergent report HTML body as the report source of
  truth
- mobile generated/downloaded report matches the web report class
- mobile tests pass or unrelated existing failures are documented with exact
  error output
- web build passes
- at least one mobile report generation path is manually or programmatically
  verified
- no lower-quality mobile PDF path remains

## Phase 9: `PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT`

### Intent

Run the final no-goof-ups audit before release.

### Required Work

- Generate golden PDFs for:
  - free Kundli report
  - premium Kundli report
  - KP report
  - Jaimini report
  - Numerology report
  - Signature report
  - Gujarati report
  - Hindi report
  - at least one crowded-chart fixture
- Render all pages to images.
- Inspect cover, chart pages, table pages, dense sections, and final pages.
- Compare against Phase 0 baseline.
- Audit report page dialog and CTAs on desktop and mobile widths.

### Strict Audit

This phase is green only when:

- every golden PDF opens successfully
- every golden PDF cover uses the Celestial Seal Cover system
- every golden PDF cover includes subject name, DOB, birth time, birth place,
  report type, and chart-backed birth moment signature
- every golden PDF uses the corrected footer
- every golden PDF uses watermarks
- every golden PDF has no chart overflow counters
- every relevant Vedic golden PDF includes Moon chart / Chandra Lagna chart
- every relevant Vedic golden PDF preserves chart order: D1, Moon chart /
  Chandra Lagna chart, D9 Navamsa, then remaining vargas
- every golden PDF has no chart label bleed
- every golden PDF has no Indic gibberish
- `/dashboard/report` remains school-separated with Vedic, KP, Jaimini,
  Numerology, and Signature report lanes
- KP, Jaimini, Numerology, and Signature golden reports stay inside their approved
  method boundaries and do not become mixed bag reports
- every required section appears in free and premium reports
- every golden PDF includes Mahadasha Phala and Meaning with past Mahadasha
  summaries and the current three-layer structure
- every relevant Vedic golden PDF includes Dosh, Shrap, positive Yog,
  challenging Yog, and Lal Kitab sections with canonical terminology
- every premium/paid golden PDF keeps Pratyantardasha analysis to one paragraph
  and avoids overclaiming exact events
- premium reports visibly add depth instead of merely changing labels
- `/dashboard/report` remains download-first
- Predicta can answer questions about the generated report sections from report
  memory/context
- `Download your report` appears in the dialog and page CTA
- `Cancel` works
- `Save Report` is absent from the target report flow
- `corepack pnpm --filter @pridicta/astrology build` passes
- `corepack pnpm --filter @pridicta/pdf build` passes
- `corepack pnpm build:web` passes
- affected mobile checks pass or known unrelated blockers are documented
- `git diff --check` passes

## Final Green Rule

The rebuild is green only when Phase 9 is green.

Individual phases may be green locally, but the full report/PDF rebuild is not
green until the final golden artifact release audit passes.
