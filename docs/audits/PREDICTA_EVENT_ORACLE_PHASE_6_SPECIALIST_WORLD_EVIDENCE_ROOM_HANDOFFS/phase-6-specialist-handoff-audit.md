# PREDICTA_EVENT_ORACLE_PHASE_6_SPECIALIST_WORLD_EVIDENCE_ROOM_HANDOFFS

## Verdict

GREEN after strict source, type, translation, build, and browser smoke audit.

## What Changed

- Added explicit handoff metadata to Predicta chat CTAs:
  `eventOracleHandoff`, `handoffMode`, `evidenceSourceLabel`, and `carriedContextLabel`.
- Routed school-less handoffs to main `/dashboard/chat` instead of silently falling back to Vedic chat.
- Extended shared `ChartContext` on web/mobile type surfaces.
- Updated Predicta chat URL parsing and intro generation so carried evidence is visible to the user.
- Added signed-out/pre-auth context visibility so users do not lose the carried evidence while being asked to sign in.
- Wired room-safe evidence handoffs from Vedic, KP, Jaimini, Numerology, Signature, and Kundli Karma.
- Wired report-section handoffs as main Predicta synthesis because report sections can legitimately explain generated context.
- Added dedicated UI translation JSON entries for the new handoff labels and modes.

## Specialist Handoff Audit

| Surface | Required behavior | Status |
|---|---|---|
| Vedic | Ask Predicta about Vedic dasha/chart/yog context | GREEN |
| KP | Ask Predicta an event question with KP evidence | GREEN |
| Jaimini | Ask Predicta about current destiny chapter evidence | GREEN |
| Numerology | Ask Predicta about current number cycle evidence | GREEN |
| Signature | Ask Predicta using confirmed traits only | GREEN |
| Kundli Karma | Ask Predicta why Dosh/Shrap/Yog/Lal Kitab evidence appears | GREEN |
| Reports | Ask Predicta about a generated report section | GREEN |

## Boundaries

- Specialist-room CTAs use `handoffMode=room_safe`.
- Report section CTAs use `handoffMode=main_synthesis`.
- The chat intro displays the evidence source and mode.
- The account-required state still displays the carried evidence source and question.
- No specialist room was removed.
- No world silently leaks into another through an unmarked CTA.

## Remaining Scope

Phase 6 does not rewrite prediction language or report content. That belongs to later Event Oracle/report phases.
