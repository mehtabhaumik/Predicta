# Predicta Report Download-First Rebuild

This document defines one strict phase to rebuild the Reports product into a
simple, premium, download-first experience.

It exists because the current report page still behaves like a vertically
stacked internal builder with too much on-page reading, repeated information,
weak premium gating, and chart rendering that does not feel synchronized with
the main Kundli product.

The phase below is intentionally broad. The current report problems are not a
series of isolated bugs. They are one product-shape problem.

## Phase Order

There is only one approved implementation phase in this rebuild.

1. `PREDICTA_REPORT_PHASE_1_DOWNLOAD_FIRST_EXPERIENCE_REBUILD`

Do not split this into ad hoc sub-phases unless explicitly approved.

## Execution Rules

1. Do not drift away from the existing product promise:
   - keep `Choose by outcome, not by complexity`
   - keep fast report choice
   - keep useful charts and chart-backed insight
   - keep free users respected
2. Do not keep report-body reading on the web page just because it already
   exists.
3. The web report page is a selector, explainer, preview, and download surface.
   It is not the final reading surface.
4. The final reading surface is the generated PDF.
5. Premium selection must not leak premium detail to a free guest.
6. Charts inside reports must use the same real Kundli contract as the rest of
   Predicta:
   - same house structure
   - same sign treatment
   - same planet glyph treatment
   - same degree/status semantics
   - same birth-time theme logic
7. PDF output must remain compact enough to print cleanly and must not create
   label bleeding, cross-house leakage, or visual inconsistency.
8. The rebuild must improve both:
   - `/dashboard/report`
   - downloadable PDF output

## Approved Phase

### `PREDICTA_REPORT_PHASE_1_DOWNLOAD_FIRST_EXPERIENCE_REBUILD`

**Intent**

Turn Reports into a simple, fun, premium-feeling flow:

- choose a report by outcome
- optionally tune sections/charts/life areas
- generate a clean report package
- show a short, elegant confirmation state
- show a few synchronized charts and useful summary cues
- download the real report as PDF

The web page must stop behaving like the report itself.

**Problems This Phase Must Close**

1. `Birth and calculation foundation` and later sections are too dense and feel
   like joined running text.
2. Evidence tables repeat information and are not visually scannable.
3. Column widths and wrapping make tables look broken.
4. The page encourages vertical scrolling through large text slabs instead of
   driving toward a clear report outcome.
5. Free guests can currently wander into premium-looking states too easily.
6. Generated charts on the report page still need to feel fully synchronized
   with real Kundlis, not like a separate report-only chart system.
7. The report experience does not yet feel fun, simple, or premium.

**Required Product Rebuild**

#### 1. Make the web page download-first

After the user generates a report:

- remove the long report-body reading UI from the report page
- replace it with a compact generated-report confirmation surface
- that surface must clearly say one of:
  - `Here is your free insight report`
  - `Here is your detailed analysis report`
- the surface must contain:
  - clear report title
  - report mode
  - chart preview block
  - one strong PDF download CTA
  - optional secondary CTA such as `Ask Predicta about this report`

The page must not continue dumping full report sections below the preview.

#### 2. Keep report configuration simple but capable

The page should still allow:

- choosing by outcome
- selecting report family
- optionally choosing charts / life areas / sections
- choosing `download everything`

But this must be rebuilt into compact, obvious controls rather than a long
scrolling reading page.

#### 3. Fix premium gating correctly

Premium behavior must be strict:

- guest user selecting premium -> sign-in CTA
- signed-in non-premium user selecting premium -> purchase CTA
- entitled premium user -> actual premium report generation path

Free users must never feel punished:

- free report should still be substantial
- free PDF must feel polished and complete, not like a teaser pamphlet
- premium adds depth, synthesis, timing, and full coverage, not dignity

#### 4. Move the real reading into the PDF

The generated PDF becomes the real report reading surface.

That means:

- free PDF must be rich, useful, and well designed
- premium PDF must feel like the full intelligence dossier
- information must be structured visually, not dumped as essay blocks

#### 5. Rebuild PDF information architecture

PDF sections must be presented as scannable blocks, not broken running text.

Use:

- short executive statements
- card-style summaries
- grouped life-area blocks
- compact insight bullets
- evidence rows only where they truly add value
- charts where needed
- timing/remedy/action blocks where helpful

Avoid:

- giant joined paragraphs
- repeated evidence in multiple places
- wide weak tables with wrapping labels
- technical repetition that adds no user value

#### 6. Rebuild tables or remove them

Every table must justify its existence.

Allowed:

- concise comparison tables
- compact timing windows
- clear evidence matrices with strong headers

Not allowed:

- tables that merely restate prose
- tables with repeated `FOUNDATION`-style labels stacked vertically
- tables that wrap so badly they become harder to read than cards

If a table fails readability, replace it with cards, rows, chips, or grouped
evidence blocks.

#### 7. Keep report charts fully synchronized with Predicta Kundlis

For all report charts:

- D1
- Chalit
- vargas
- KP
- Nadi

the report charts must:

- use the same sign + house + planet semantics as main Kundlis
- use the same birth-time theme logic
- keep labels contained inside houses
- remain PDF-safe
- avoid visual ambiguity for non-astrology users

#### 8. Add meaningful theme explanation

For charts and report chart blocks, keep the theme note system and ensure it
reads naturally:

- why the chart uses sunrise/day/afternoon/sunset/night palette
- tied to birth time
- slightly fun, but still meaningful

This note must not overwhelm the PDF or create extra clutter.

#### 9. Reduce chatter and internal narration

The report page must not feel like an internal builder or system shell.

Keep:

- helpful guidance
- report choice clarity
- premium/free boundary clarity

Remove:

- unnecessary explanation text
- repetitive help copy
- anything that forces more scrolling than decision-making

#### 10. Preserve and improve the useful features

Do not remove good ideas. Rebuild them cleanly.

Must preserve in improved form:

- `Choose by outcome, not by complexity`
- fast report choice
- section/chart/life-area tuning
- chart previews
- report-to-chat bridge
- easy PDF download

## Required Deliverables

This phase is complete only when all of the following are true:

1. `/dashboard/report` behaves like a clean report generator, not a long report
   reader.
2. Generated report state shows a compact confirmation + chart preview + strong
   PDF CTA.
3. On-page long report sections are removed from the main web report flow.
4. Premium gating works correctly for:
   - guest
   - signed-in free
   - premium user
5. Free PDF looks substantial and premium-branded.
6. Premium PDF looks meaningfully deeper and more complete.
7. Report charts are visually synchronized with real Kundlis.
8. No report chart labels bleed across house boundaries.
9. Report tables are either fixed or replaced with better presentation blocks.
10. The page feels fun, simple, crisp, and premium on desktop, tablet, and
    mobile.

## Exact Execution Prompt

> Execute `PREDICTA_REPORT_PHASE_1_DOWNLOAD_FIRST_EXPERIENCE_REBUILD`.
>
> Rebuild the entire Reports experience into a download-first product. Keep
> outcome-led report selection, chart previews, and section/life-area tuning,
> but remove the long on-page report-reading body from the web flow. After a
> report is generated, show a concise premium-feeling confirmation state with a
> clear free vs premium report identity, a strong PDF download CTA above the
> charts, and a small set of synchronized chart previews. Make premium gating
> strict for guest, signed-in free, and premium users. Rebuild the free and
> premium PDFs so both feel polished and substantial, with information presented
> in clean structured blocks instead of cluttered essay text or weak wrapping
> tables. Keep report charts visually identical in semantics and theme logic to
> real Kundlis, with no label leakage and no report-only chart language drift.
> Preserve the useful product ideas, but remove vertical-scrolling clutter,
> repetitive chatter, and confusing presentation.

## Strict Audit

This phase is not green until all of the following pass.

### Code And Build

- `corepack pnpm build:web`
- `corepack pnpm test:pdf-golden`
- `corepack pnpm test:room-report-pdf`
- `corepack pnpm test:charts`
- `git diff --check`

### Local Product Smoke

Using the built local app:

- `/dashboard/report`
- guest flow
- signed-in free flow
- premium-entitled flow if locally available

Verify:

1. report selection is visible without a long scroll spiral
2. report generation moves the user to a compact result state
3. PDF CTA is obvious and sits above the charts
4. charts are immediately visible in the result state
5. no long report-body reading dump remains on the page
6. charts use real sign/planet/degree semantics
7. theme note renders cleanly
8. no chart label bleeding
9. no horizontal overflow on mobile
10. no console-visible client exception

### PDF Visual Audit

Generate both:

- free PDF
- premium PDF

Verify:

1. free PDF does not feel shallow
2. premium PDF clearly feels deeper
3. typography is clean
4. tables either read cleanly or have been replaced
5. no repeated low-value sections
6. no chart rendering goof-ups
7. no house-label leakage
8. no broken page splits for key chart/summary sections

### Viewport Audit

Verify on:

- desktop
- tablet
- mobile

Focus:

- report choice
- generated result state
- chart preview block
- PDF CTA placement
- premium gate CTA

## Recommendation Summary

This rebuild should follow one product rule:

**The web page helps you choose and generate the report. The PDF is the report.**

That single rule resolves most of the current clutter and trust problems.
