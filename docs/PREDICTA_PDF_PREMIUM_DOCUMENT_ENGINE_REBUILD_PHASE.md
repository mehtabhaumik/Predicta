# Predicta Premium PDF Document Engine Rebuild

This document defines one strict implementation phase to replace the current
HTML-dump PDF output with a real premium document engine.

The current PDF is not failing because a few cards need prettier CSS. It is
failing because the renderer is browser-flow-first instead of document-first.
That creates weak pagination, chart splitting, cluttered blocks, and a report
that feels like exported UI instead of a premium astrology dossier.

## Approved Phase Order

There is one approved implementation phase in this rebuild:

1. `PREDICTA_PDF_PHASE_1_PREMIUM_DOCUMENT_ENGINE_REBUILD`

Do not split this into casual sub-phases without approval.

## Hard Rules

1. Do not keep iterating the current HTML-dump renderer as the primary PDF
   engine.
2. Keep the shared report-composition layer in `packages/pdf/src/index.ts` as
   the semantic source of truth unless a field is clearly broken.
3. Replace the rendering layer with a document-first PDF pipeline that supports
   deterministic pagination.
4. Charts must never split across pages.
5. Charts must use the same sign, house, planet, degree, and status semantics
   as the real Kundli product.
6. Charts must use the same birth-time theme model:
   - sunrise
   - day
   - afternoon
   - sunset
   - night
7. Free PDF must feel complete and premium-branded, not teaser-thin.
8. Premium PDF must feel like a true dossier, not a longer free PDF.
9. The final PDF must look like a premium SaaS product, not an exported web
   page.
10. Do not break the report download-first web flow while rebuilding the PDF
    engine.

## Current Problem Statement

The current PDF output fails in four structural ways:

1. The renderer is still one giant HTML string in
   `apps/mobile/src/services/pdf/pdfGenerator.ts`.
2. Sections are page-sized browser blocks with absolute footers rather than
   real document templates.
3. Charts are rendered as mini HTML pills over an SVG outline, which is not
   robust enough for premium output.
4. The report uses too many web-style cards/tables/paragraph walls instead of a
   real report information hierarchy.

That is why the PDF currently looks like:

- an HTML dump
- an ugly internal export
- a cluttered report wall
- a chart layout that can cut or feel unstable across pages

## Real Architecture This Phase Must Use

Preserve and extend the existing seams. Do not invent a disconnected PDF data
model.

Must keep using:

- `packages/pdf/src/index.ts`
- `packages/astrology/src/chartLayout.ts`
- `apps/web/components/WebDossierPreview.tsx`
- `apps/mobile/src/services/pdf/pdfGenerator.ts`

Must replace or heavily rewrite:

- the HTML-string renderer in
  `apps/mobile/src/services/pdf/pdfGenerator.ts`

Preferred target architecture:

- a real structured PDF renderer such as:
  - `@react-pdf/renderer`
  - `pdfkit`
  - `pdf-lib`
- one document-template pipeline
- explicit page templates
- chart-safe page objects
- deterministic pagination

The exact library may vary, but the renderer must be document-first and
chart-aware.

## Approved Phase

### `PREDICTA_PDF_PHASE_1_PREMIUM_DOCUMENT_ENGINE_REBUILD`

**Intent**

Replace the current PDF renderer with a premium document engine that produces:

- crisp cover pages
- premium report spreads
- stable chart placement
- clean section hierarchy
- substantial free PDF
- detailed premium dossier

without looking like exported HTML.

**Problems This Phase Must Close**

1. PDF looks like HTML dump.
2. Charts can cut or visually feel split across pages.
3. Report sections look like joined page cards instead of a real document.
4. Tables and evidence rows feel repetitive and ugly.
5. Report charts do not feel as polished as the real Kundli product.
6. Free PDF does not yet feel premium enough.
7. Premium PDF does not yet feel like a polished paid dossier.

## Required Rebuild

### 1. Replace the renderer

Build a real PDF rendering engine.

The new renderer must:

- support deterministic page breaks
- support non-breaking chart blocks
- support reusable page templates
- support styled typographic systems
- support consistent header/footer behavior

The old HTML-string layout path must stop being the core production renderer.

### 2. Keep the semantic report composition layer

`packages/pdf/src/index.ts` should remain the semantic report-composition layer
for:

- cover metadata
- executive summary
- chart snapshot data
- section composition
- trust profile
- free vs premium content boundaries

But it should not be responsible for visual HTML layout decisions.

### 3. Create real PDF page templates

The PDF must have explicit page archetypes, not generic repeated web cards.

Required template set:

- cover page
- report overview page
- chart spread page
- life-theme section page
- timing section page
- guidance/remedy section page
- premium deep-dive section page
- trust/limits page
- technical appendix page

Each template must have:

- deliberate hierarchy
- consistent spacing rhythm
- page-safe content limits
- no accidental overflow

### 4. Rebuild chart rendering as a document-grade component

Charts inside the PDF must:

- stay whole on a page
- never split across page boundaries
- use the same North Indian structure as app charts
- use the same sign labels, planet glyphs, degree labels, and status marks
- use PDF-safe label density presets
- avoid label bleed into adjacent houses
- preserve time-of-day theme identity

If the PDF needs a slightly tighter chart preset than the app, that is allowed,
but it must still remain visually and semantically synchronized with the real
Kundli product.

### 5. Rebuild information hierarchy for readability

The PDF must stop behaving like a stack of web cards and paragraphs.

Required reading hierarchy:

1. strong section headline
2. one plain-language takeaway
3. compact insight blocks
4. evidence or chart proof only where it adds value
5. practical next-step or timing/guidance block

Avoid:

- long joined prose walls
- repeated evidence stated three times in different forms
- page-long tables that restate paragraph content

### 6. Replace weak tables with better presentation

Every table must justify itself.

Allowed:

- concise timing windows
- compact comparison grids
- appendix-style technical matrices

Not allowed:

- broken wrapping columns
- repeated `FACTOR / FOUNDATION / FOUNDATION` style vertical clutter
- wide UI-like tables that degrade into unreadable wrapped blocks

If a section is clearer as cards, rows, ribbons, or grouped callouts, use that
instead.

### 7. Make free and premium PDF packaging distinct but equally polished

Free PDF must include:

- premium-quality cover
- proper chart spread
- useful executive summary
- meaningful life guidance
- timing/guidance where allowed
- enough depth to feel generous

Premium PDF must add:

- deeper chart synthesis
- cross-chart interpretation
- richer timing windows
- detailed life-area spreads
- stronger remedies/guidance structure
- technical appendix or advanced evidence where appropriate

Free should feel respected.
Premium should feel expansive.

### 8. Add clean chart theme notes

For charts and chart spreads, include a concise meaningful note about why the
palette reflects the birth-time window.

It must feel:

- clear
- slightly fun
- not chatty
- not cluttering the page

### 9. Preserve the report download-first product flow

This phase is about the PDF engine, not reverting the report page back into a
long reading wall.

Keep the current report page principle:

- choose
- generate
- preview charts
- download the report

The PDF is the reading surface.

### 10. Keep mobile and web in parity

Web and mobile must generate the same report class and same report quality.

No “mobile gets HTML export, web gets better PDF” split is allowed.

## Required Deliverables

This phase is complete only when all of the following are true:

1. The production PDF renderer is document-first, not HTML-dump-first.
2. Cover page looks premium and deliberate.
3. Charts do not split across pages.
4. Charts use synchronized Kundli semantics and theme logic.
5. No chart label bleeds into the wrong house.
6. No page contains obviously broken wrapping tables.
7. Free PDF feels substantial and premium-branded.
8. Premium PDF feels like a true paid dossier.
9. The report page download-first experience still works.
10. Web and mobile stay in parity on report class and content quality.

## Strict Audit Requirements

The phase is not green until all of the following pass:

1. Renderer and build audit
   - `corepack pnpm build:web`
   - affected mobile/report build checks
   - any new PDF engine compile/type checks
2. PDF golden audit
   - regenerate golden PDFs for free and premium
   - visually compare against prior broken output
3. Pagination audit
   - verify charts never split across pages
   - verify headers/footers do not collide with content
4. Chart containment audit
   - verify no label bleed into adjacent houses
   - verify theme notes and chart legends remain readable
5. Readability audit
   - no long clutter walls
   - no obviously broken tables
   - no repeated low-value evidence blocks
6. Surface parity audit
   - confirm mobile and web generate the same report class
7. Live artifact audit
   - open generated free PDF and premium PDF and inspect real pages visually
8. `git diff --check`

If any of those fail, the phase is not complete.

## Exact Execution Prompt

> Execute `PREDICTA_PDF_PHASE_1_PREMIUM_DOCUMENT_ENGINE_REBUILD`.
>
> Replace the current HTML-dump PDF renderer with a real document-grade PDF
> engine while preserving `packages/pdf/src/index.ts` as the semantic report
> composition layer. Rebuild the PDF into a premium astrology dossier with
> explicit page templates, deterministic pagination, non-breaking chart
> placement, synchronized Kundli semantics and birth-time theme logic, cleaner
> information hierarchy, and substantial free plus detailed premium packaging.
> Keep the report page download-first. Do not ship until free and premium PDFs
> are visually clean, premium-looking, chart-safe, and fully audited.
