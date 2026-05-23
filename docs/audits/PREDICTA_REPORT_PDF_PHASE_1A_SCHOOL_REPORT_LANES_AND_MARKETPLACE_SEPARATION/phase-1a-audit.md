# PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION Audit

Status: GREEN

Audit date: 2026-05-24

## Scope

Phase 1A separates `/dashboard/report` into school-specific report lanes so
users choose a report world before preparing or downloading a report. This phase
also tightens focused PDF composition so KP, Nadi, Numerology, and Signature
reports do not silently become mixed-school reports.

## Implementation Evidence

- `/dashboard/report` starts the marketplace with `Choose your report world`.
- The web report marketplace now shows five separated lanes:
  - `Vedic Reports`
  - `KP Reports`
  - `Nadi Reports`
  - `Numerology Reports`
  - `Signature Reports`
- Report products now carry an explicit school ownership field.
- Each lane filters products with `product.school === lane.id`.
- Each lane shows:
  - report promise
  - best-for line
  - Free/basic depth
  - Premium/paid depth
  - required input/readiness state
  - method boundary note
  - report cards that continue into the existing `Download your report` flow
- Signature report copy no longer offers Numerology + Signature synthesis inside
  the Signature lane.
- Focused PDF composition now uses school-specific summary, cover metadata, and
  boundary sections for KP, Nadi, Numerology, and Signature.

## Artifact Evidence

- Desktop marketplace screenshot:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/screenshots/report-marketplace-school-lanes-desktop.png`
- Mobile-width marketplace screenshot:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/screenshots/report-marketplace-school-lanes-mobile.png`
- Runtime marketplace verification:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/logs/marketplace-runtime-check.json`
- KP composition payload:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/composition-fixtures/kp-composition-payload.json`
- Nadi composition payload:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/composition-fixtures/nadi-composition-payload.json`
- Numerology composition payload:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/composition-fixtures/numerology-composition-payload.json`
- Signature composition payload:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/composition-fixtures/signature-composition-payload.json`
- Generated KP PDF:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/pdfs/kp-school-report.pdf`
- Generated Nadi PDF:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/pdfs/nadi-school-report.pdf`
- Generated Numerology PDF:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/pdfs/numerology-school-report.pdf`
- Generated Signature PDF:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/pdfs/signature-school-report.pdf`
- Verification command log:
  `docs/audits/PREDICTA_REPORT_PDF_PHASE_1A_SCHOOL_REPORT_LANES_AND_MARKETPLACE_SEPARATION/logs/verification.txt`

## Strict Requirement Audit

- `/dashboard/report` starts with `Choose your report world`: PASS
- Web report page shows five separated lanes: PASS
- Mobile-width report page shows the same five lanes without cramped controls:
  PASS
- Each lane shows only school-appropriate report options: PASS
- Each lane has a best-for line and method boundary note: PASS
- Vedic lane does not include KP, Nadi, Numerology, or Signature sections:
  PASS
- KP lane does not become a Vedic personality report: PASS
- Nadi lane does not use KP cusp logic and does not claim palm-leaf manuscript
  access: PASS
- Numerology lane does not include Kundli judgement unless a future synthesis
  lane exists: PASS
- Signature lane does not include Numerology or Vedic synthesis unless a future
  synthesis lane exists: PASS
- Report generation passes the selected school/report focus into PDF
  composition explicitly: PASS
- Generated KP sample PDF captured: PASS
- Generated Nadi sample PDF captured: PASS
- Generated Numerology sample PDF captured: PASS
- Generated Signature sample PDF captured: PASS
- Free and Premium/paid depth is shown per lane without making free reports look
  cheap or useless: PASS
- Unavailable school data is shown as readiness/pending state, not hidden or
  fabricated: PASS
- `corepack pnpm --filter @pridicta/pdf build` passes: PASS
- `corepack pnpm build:web` passes: PASS

## Notes

This phase intentionally does not add a Synthesis Reports lane. Life Atlas and
other cross-school products remain outside the five school lanes until their own
approved phase permits them.
