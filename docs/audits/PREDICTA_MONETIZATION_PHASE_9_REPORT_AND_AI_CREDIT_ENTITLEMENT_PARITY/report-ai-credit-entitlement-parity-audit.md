# PREDICTA_MONETIZATION_PHASE_9_REPORT_AND_AI_CREDIT_ENTITLEMENT_PARITY

## Verdict

GREEN. Web, mobile, server ledger, Product Bank, Family Bank, and report PDF
generation now use the same entitlement contract for AI credits and report
credits.

## Locked Contract

- Free deterministic reports remain available where the report lane allows them.
- Premium reports require Premium subscription, Day Pass PDF allowance, personal
  report credit, or Family Bank report credit.
- Premium report credits are mapped by lane: Vedic, KP, Jaimini, Numerology,
  Signature, Life Atlas, with generic Premium PDF credit as fallback.
- Signature report generation remains blocked unless confirmed signature traits
  are attached.
- Life Atlas does not require signature; missing signature only removes the
  optional enrichment layer.
- Day Pass AI questions and Day Pass report PDFs decrement the server ledger
  after successful use.
- Web and mobile both use the shared report entitlement contract instead of
  separate school-specific credit logic.
- Report page copy shows the required report credit/access before generation.

## Audit Evidence

- Shared contract: `packages/monetization/src/entitlementParity.ts`.
- Server ledger operations: `packages/monetization/src/serverEntitlementLedger.ts`.
- Web AI parity: `apps/web/app/api/ask-pridicta/route.ts`.
- Mobile AI parity: `apps/mobile/src/services/ai/pridictaService.ts`.
- Web PDF entitlement: `apps/web/app/api/report/pdf/route.ts`.
- Mobile PDF entitlement: `apps/mobile/src/screens/ReportScreen.tsx`.
- Report composer requirement copy: `apps/web/components/WebDossierPreview.tsx`.

## Strict Gate

Run:

```bash
corepack pnpm test:monetization-phase-9
```

The gate must prove:

- Every report lane maps to the correct credit type.
- Generic Premium PDF credits work as fallback for each report lane.
- Family Bank report credits work across all report lanes.
- Free reports do not require premium/report credit.
- Premium reports are blocked without entitlement.
- Signature report remains input-gated.
- Life Atlas remains unblocked by missing signature.
- Day Pass AI and report PDF operations decrement server ledger.
- Web/mobile no longer use lower-control entitlement forks for premium reports.

## Completed Verification

- `corepack pnpm test:monetization-phase-6`
- `corepack pnpm test:monetization-phase-8`
- `corepack pnpm test:monetization-phase-9`
- `corepack pnpm --filter @pridicta/types typecheck`
- `corepack pnpm --filter @pridicta/config typecheck`
- `corepack pnpm --filter @pridicta/monetization typecheck`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm --filter @pridicta/mobile typecheck`
- `python3 -m pytest backend/tests/test_astro_api.py -q`
- `corepack pnpm test:pdf-golden`
- `corepack pnpm build:web`
- `git diff --check`
