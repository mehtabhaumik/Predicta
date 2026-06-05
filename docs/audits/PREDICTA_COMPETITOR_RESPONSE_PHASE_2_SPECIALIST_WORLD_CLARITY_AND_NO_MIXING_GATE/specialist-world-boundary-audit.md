# PREDICTA_COMPETITOR_RESPONSE_PHASE_2 Specialist World Boundary Audit

Status: GREEN after implementation and strict gate verification.

## Boundary Decisions

- Vedic remains the Parashari/Kundli lane for charts, dasha, gochar, Panchang, Kundli Karma, remedies, and classical Vedic report evidence.
- KP remains event-answer and timing-first. PDF output uses the KP chart shell instead of D1/D9 Parashari chart pages as the primary room chart.
- Jaimini is the active replacement for Nadi. It owns soul role, karakas, Arudha, Swamsa, Karakamsha, Chara Dasha, and destiny chapter language.
- Numerology remains number-only. Report marketplace and report generation do not use Kundli/Dasha identity as Numerology’s product shell.
- Signature remains confirmed-trait-only. The report API enforces ready signature traits before rendering Signature PDF output.
- Life Atlas remains the only approved synthesis lane.

## Active Nadi Removal

- Active report lane types no longer include `NADI`.
- PDF generation no longer exposes `NADI` as `PdfReportFocus`, `PdfChartRole`, report switch branch, chart shell, or room-specific section builder.
- Mobile saved Kundli chart previews now expose `PARASHARI`, `KP`, and `JAIMINI`, not `NADI`.
- The shared chart preview renderer uses `JAIMINI` as a first-class render school and treats legacy Nadi chart names as Jaimini only for compatibility detection.

## Compatibility Kept On Purpose

- Web `/dashboard/nadi` redirects to `/dashboard/jaimini`.
- Web `/dashboard/nadi/chat` redirects to `/dashboard/jaimini/chat`.
- Legacy chat context may still accept `NADI`, but it normalizes to Jaimini behavior and labels.
- The astrology package still contains archived Nadi data model/types because old saved contexts and historical modules may reference them. They are not active report marketplace lanes.

## No-Mixing Fixes

- `apps/web/app/api/report/pdf/route.ts` normalizes legacy report focus `NADI` to `JAIMINI` before entitlement evaluation, PDF rendering, credit idempotency, and filename creation.
- `packages/pdf/src/index.ts` removed the Nadi report section builder and active Nadi PDF branches.
- `packages/pdf/src/reportDocument.tsx` no longer contains active Nadi-specific renderer branches.
- `packages/config/src/predictaMemory.ts` keeps the migration rule but no longer treats Nadi as a final report lane key.
- `apps/mobile/src/screens/SavedKundlisScreen.tsx` now routes the Jaimini preview to the Jaimini room directly.

## Remaining Allowed Nadi References

Allowed references are limited to migration/legacy redirects, historical type names, compatibility chat aliases, and non-product terms such as compatibility `nadi` fields. They must not appear as active navigation, marketplace, report focus, report product, PDF chart role, or downloadable report lane.
