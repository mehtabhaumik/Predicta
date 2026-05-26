# Phase 1 Pricing Source

Phase: `PREDICTA_PRE_LIVE_PHASE_1_RELEASE_GOVERNANCE_COST_PROFIT_UNLOCK`

## Source Policy

Release governance now has an approved fallback pricing source in
`backend/astro_api/ai_telemetry.py`.

The fallback values are governance budget rates, not a replacement for provider
billing review. They exist so release governance is never cost-blind when
`PRIDICTA_AI_PRICING_JSON` is absent in a default/local/live-like environment.

## Override Policy

`PRIDICTA_AI_PRICING_JSON` remains the approved override for deployment or CI
when provider pricing needs to be updated without code changes.

If the override is malformed JSON or not an object, pricing configuration
returns empty and release governance blocks instead of silently passing.

## Cost Metric Policy

Release governance now calculates cost from stored token counts when older
telemetry events have `estimatedCostUsd: null`.

If a required workflow bucket has no telemetry event yet, release governance
uses a conservative budget token profile for that missing bucket so the
profit-safety summary remains complete while still requiring telemetry to exist.

## Privacy Policy

No raw birth data, raw signature image, private chat text, or payment data is
added to telemetry by this phase.

