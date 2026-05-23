# Phase 0 Active Report And PDF Renderer Entry Points

Audit date: 2026-05-23

## Web Report Page

- `apps/web/app/dashboard/report/page.tsx`
  - Loads the report page.
  - Renders `WebDossierPreview`.
- `apps/web/components/WebDossierPreview.tsx`
  - Reads the active Kundli from web local storage through
    `loadWebKundliStore`.
  - Builds the on-page report preview through `composeReportSections`.
  - Downloads PDFs by posting to `/api/report/pdf`.
  - Sends `kundli`, `language`, `mode`, `reportFocus`, `sectionKeys`, and
    optional `signatureAnalysis`.

## Web PDF Route

- `apps/web/app/api/report/pdf/route.ts`
  - Active web PDF API.
  - Uses `@react-pdf/renderer` `renderToBuffer`.
  - Calls `buildPredictaPdfResult`.
  - Calls `createPredictaReportPdfElement`.
  - Loads `apps/web/public/predicta-logo.png` or `public/predicta-logo.png`.

## Shared Report Composition

- `packages/pdf/src/index.ts`
  - Builds semantic report composition.
  - Owns `composeReportSections`.
  - Owns `PdfReportFocus`.
  - Owns section selection and chart snapshot construction.
  - Uses `buildChartRenderModel` from `@pridicta/astrology`.

## Shared PDF Document Renderer

- `packages/pdf/src/reportDocument.tsx`
  - Active document renderer for the web PDF route.
  - Uses `@react-pdf/renderer`.
  - Registers Predicta fonts from `packages/pdf/assets/fonts`.
  - Renders cover, summary, chart pages, section spreads, footer, and page
    numbers.

## Mobile Report Screen

- `apps/mobile/src/screens/ReportScreen.tsx`
  - Mobile report screen.
  - Calls `generateHoroscopePdf`.
  - Passes `reportFocus` into the mobile PDF path.

## Mobile PDF Renderer

- `apps/mobile/src/services/pdf/pdfGenerator.ts`
  - Active mobile PDF generation path.
  - Still builds an HTML string.
  - Still imports `react-native-html-to-pdf`.
  - This is a separate lower-quality renderer from the web `@react-pdf`
    document route and must remain a Phase 0 blocker until rebuilt.

## Renderer Split Finding

Web and mobile do not currently share one document-grade PDF renderer:

- Web: `@react-pdf/renderer`.
- Mobile: `react-native-html-to-pdf` HTML export.

This violates the later parity rule and must be closed before the rebuild can
be called green beyond baseline capture.
