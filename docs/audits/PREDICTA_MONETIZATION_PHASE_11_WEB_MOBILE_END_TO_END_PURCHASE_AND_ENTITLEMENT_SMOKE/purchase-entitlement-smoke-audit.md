# PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE

## Verdict

GREEN. Web/mobile purchase and entitlement behavior is now covered by a strict
source-and-ledger smoke gate, with disabled-gateway honesty preserved while
Razorpay is not wired.

## What Was Proven

- Signed-in free users receive exactly three lifetime AI answers.
- The fourth AI question is blocked before provider spend and returns the
  preserved-question upsell path.
- An approved non-fake test purchase simulation grants a 10-question Product
  Bank pack through the same server ledger operation used after verified
  payment.
- The preserved fourth question can resume through paid personal credits, then
  consumes exactly one paid AI credit after provider success.
- Free deterministic actions remain outside AI spend.
- Free users can create/save four Kundlis; the fifth new Kundli is blocked.
- Premium users remain unlimited with the daily abuse soft-limit intact.
- Family Vault assignment preserves members and Family Bank state.
- Family comparison allows two, three, or four Kundlis and blocks zero, one, or
  five-plus Kundlis.
- Free deterministic report generation stays available where allowed.
- Premium report generation blocks without entitlement, unlocks with a valid
  report credit, and consumes the report credit exactly once after generation.
- Mobile disabled billing returns pending/failure-safe states and does not grant
  entitlement.
- Web checkout shows Razorpay-disabled honesty and does not mark access active.

## Razorpay Status

Razorpay sandbox smoke is conditional. In this run,
`PREDICTA_RAZORPAY_SANDBOX_KEY_ID` and
`PREDICTA_RAZORPAY_SANDBOX_KEY_SECRET` were not present, so the gate recorded
`skipped-missing-keys`. Once sandbox keys are added, this phase gate must run
the sandbox branch instead of silently treating disabled checkout as a real
payment success.

## Required Gate

```bash
corepack pnpm test:monetization-phase-11
```

## Completed Verification

- `corepack pnpm test:monetization-phase-2`
- `corepack pnpm test:monetization-phase-3`
- `corepack pnpm test:monetization-phase-4`
- `corepack pnpm test:monetization-phase-5`
- `corepack pnpm test:monetization-phase-6`
- `corepack pnpm test:monetization-phase-7`
- `corepack pnpm test:monetization-phase-8`
- `corepack pnpm test:monetization-phase-9`
- `corepack pnpm test:monetization-phase-10`
- `corepack pnpm test:monetization-phase-11`
- `corepack pnpm --filter @pridicta/monetization typecheck`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm --filter @pridicta/mobile typecheck`
- `corepack pnpm --filter @pridicta/mobile exec jest --runInBand apps/mobile/__tests__/paymentWorkflow.test.ts apps/mobile/__tests__/mockBillingProvider.test.ts apps/mobile/__tests__/paywallService.test.ts`
- `corepack pnpm build:web`
- `git diff --check`
