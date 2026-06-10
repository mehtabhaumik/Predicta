# Link Reliability Ledger

Phase: `PREDICTA_APP_REVIVAL_PHASE_0_REDLINE_AUDIT_AND_BASELINE_LOCK`

## Observed Risk Classes

### R1. Primary CTAs Route To Dashboard

Examples:

- `apps/web/components/HeroSection.tsx:66`
- `apps/web/components/FinalCTASection.tsx`
- `apps/web/components/TestimonialTrustLoop.tsx`
- `apps/web/components/WebGrowthAdvantage.tsx`
- `apps/web/components/WebHeader.tsx`

Risk:

The user clicks expecting Predicta but lands in a dashboard/product area.

Required fix:

Phase 1 must route primary Predicta CTAs to top-level Predicta.

### R2. Context-Aware Chat Links Are Dashboard-Bound

Example:

- `apps/web/lib/predicta-chat-cta.ts`

Risk:

Even correct source-aware CTAs inherit dashboard latency and dashboard chrome.

Required fix:

Change the canonical chat path contract while preserving all query context.

### R3. Many Internal Links Depend On Heavy Dashboard Route Payloads

Examples:

- `/dashboard/report`
- `/dashboard/kundli`
- `/dashboard/charts`
- `/dashboard/vedic`
- `/dashboard/kp`
- `/dashboard/jaimini`

Risk:

Links may work but feel late because each major route pulls heavy shared chunks.

Required fix:

Phase 6 must split route payloads. Phase 7 must add click-to-visible-content
latency proof.

### R4. No Dedicated Link-Latency Gate Exists Yet

Risk:

Existing UI gates can pass while clicks still feel late.

Required fix:

Add a revival-specific link-click latency smoke in Phase 7.

