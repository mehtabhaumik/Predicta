# PREDICTA_REPORT_PDF_PHASE_0_STRICT_BASELINE_AND_CONTRACT_LOCK Audit

Audit date: 2026-05-23

Phase status: green for baseline capture only.

This audit records the current broken state before implementation fixes begin.
It does not mark later report/PDF quality as green.

## Fixture Used

- `fixtures/bhaumik-crowded-kundli.json`
- Subject: `Bhaumik Mehta`
- Birth details: `1980-08-22`, `06:30`, `Petlad, Gujarat, India`
- Purpose: deliberately crowded D1 house to expose hidden planet counters,
  label crowding, and report/PDF chart containment problems.

## Generated Baseline PDFs

All PDFs were generated through the current web route:

`POST /api/report/pdf`

Files:

- `pdfs/free-kundli-en.pdf`
- `pdfs/premium-kundli-en.pdf`
- `pdfs/free-kundli-gu.pdf`

Quick Look first-page previews:

- `pdf-page-previews/free-kundli-en/free-kundli-en.pdf.png`
- `pdf-page-previews/premium-kundli-en/premium-kundli-en.pdf.png`
- `pdf-page-previews/free-kundli-gu/free-kundli-gu.pdf.png`

Baseline findings from PDF previews:

- First page is not the approved dark Predicta cover.
- Interior/cover styling still reads as light paper/exported report, not the
  future Celestial Seal Cover.
- Footer is not the required phase text.
- Current footer reads as a long sentence:
  `A Predicta promise by Bhaumik Mehta | Chart-backed Jyotish guidance with clear safety boundaries | © 2026`
- Required future footer is:
  `Prepared by Predicta @2026` left, subject name centered, and real
  `{page number} / {total pages}` right.
- Gujarati PDF generation succeeds, but the first-page preview still shows
  English cover copy, so localization quality remains a blocker for later
  phases.

## Captured Report Page Screenshots

Screenshots were captured from the running app using the same crowded fixture
seeded into browser storage.

- `screenshots/report-page-desktop-baseline.png`
- `screenshots/report-page-mobile-baseline.png`

Baseline findings from the report page:

- The page is still a long report-builder surface rather than a simple
  download-first confirmation/dialog flow.
- The primary CTA still says `Preview selected report` / `Preview after these
  changes`, not `Download your report`.
- Report options are still mixed into one marketplace grid.
- KP, Nadi, Numerology, Signature, Vedic, and general report options appear
  together rather than in clean school-separated lanes.
- The page still contains a large amount of on-page report configuration and
  preview scaffolding, which later phases must reduce.

## Captured Chart Page Screenshots

Screenshots were captured from the running app using the same crowded fixture
seeded into browser storage.

- `screenshots/chart-page-desktop-crowded-baseline.png`
- `screenshots/chart-page-mobile-crowded-baseline.png`

Baseline chart findings:

- The chart page still hides planets behind overflow counters when space is
  tight.
- In the crowded D1 fixture, the chart shows visible planet pills plus a hidden
  counter instead of every planet.
- This confirms the future PDF rule: downloaded reports must not hide planets
  behind `+1`, `+2`, `+3`, or any overflow counter.
- Current chart visuals still rely on small pill labels and do not yet use the
  future Vedic/Indian graha visual language.
- Moon chart / Chandra Lagna is not part of the current visible chart order in
  this baseline flow.

## Active Renderer Entry Points

Detailed path inventory:

- `renderer-paths/active-renderer-entry-points.md`

Summary:

- Web report page:
  `apps/web/app/dashboard/report/page.tsx`
- Web report builder/download:
  `apps/web/components/WebDossierPreview.tsx`
- Web PDF API:
  `apps/web/app/api/report/pdf/route.ts`
- Shared report composition:
  `packages/pdf/src/index.ts`
- Shared web PDF document renderer:
  `packages/pdf/src/reportDocument.tsx`
- Mobile report screen:
  `apps/mobile/src/screens/ReportScreen.tsx`
- Mobile PDF generator:
  `apps/mobile/src/services/pdf/pdfGenerator.ts`

## Mobile Renderer Split

Mobile still uses a separate legacy HTML export path:

- `apps/mobile/src/services/pdf/pdfGenerator.ts`
- `react-native-html-to-pdf`

Web uses:

- `apps/web/app/api/report/pdf/route.ts`
- `@react-pdf/renderer`

This confirms the Phase 0 parity blocker.

## Commands Run

Baseline PDFs:

```sh
POST /api/report/pdf with the crowded Kundli fixture for:
FREE en
PREMIUM en
FREE gu
```

Screenshot capture:

```sh
Google Chrome headless via Chrome DevTools Protocol
```

Deterministic checks:

```sh
node scripts/run-room-report-and-pdf-rebuild.mjs
```

Result:

```text
Room report and PDF rebuild passed: 42 deterministic assertions.
```

Golden PDF gate:

```sh
node scripts/run-pdf-report-golden-output-gate.mjs
```

Result:

```text
PDF report golden output gate failed.
- packages/pdf/src/reportDocument.tsx / premium document renderer: missing backgroundColor: '#ECEFF4'
- packages/pdf/src/reportDocument.tsx / premium document renderer: missing backgroundColor: '#F3F6FB'
```

This failure is recorded as baseline evidence, not fixed in Phase 0.

## Initial Git Status

Captured before Phase 0 artifacts were added:

- `logs/initial-git-status.txt`

The worktree was already dirty before Phase 0. Later implementation phases must
avoid accidentally reverting or staging unrelated existing edits.

## Phase 0 Strict Audit Checklist

- Baseline PDFs generated and stored in audit folder: pass.
- Free Kundli PDF captured: pass.
- Premium Kundli PDF captured: pass.
- Gujarati PDF captured: pass.
- Chart-page screenshots captured for future broken/fixed comparison: pass.
- Web report page screenshots captured for desktop and mobile widths: pass.
- Active renderer entry points listed: pass.
- Mobile legacy renderer path confirmed: pass.
- Known blockers documented before fixes begin: pass.
- `git status --short` captured: pass.

## Known Blockers For Later Phases

- Report page is not yet download-dialog-first.
- Report marketplace is not yet school-separated.
- PDF cover is not the approved dark Predicta first page.
- PDF interior/cover is not yet the approved Pearl Editorial system.
- Footer text is not the required `Prepared by Predicta @2026`.
- PDF/page footer structure is not the required left/center/right layout.
- Chart rendering can hide planets behind overflow counters.
- Chart labels still use cramped pills.
- Moon chart / Chandra Lagna is not included in the baseline chart/report order.
- Mobile PDF output still uses `react-native-html-to-pdf`.
- Web and mobile report renderers are not in parity.
- Gujarati PDF cover copy remains English in the captured baseline preview.
- Golden PDF output gate is failing on existing renderer expectations.
