# PREDICTA_PRE_LIVE_PHASE_7_PAYMENT_WORKFLOW_AND_RAZORPAY_READY_CONTRACT

Status: GREEN
Date: 2026-05-27

## Scope

This phase makes the payment workflow safe before Razorpay is wired. The app must not throw, must not fake payment success, must not activate paid access from mock billing in production, and must expose a strict Razorpay-ready contract for order creation, signature verification, payment status, entitlement activation, cancellation, failure, and support handoff.

## Implemented Contract

- Added a shared payment workflow contract in `packages/monetization/src/paymentWorkflow.ts`.
- Locked gateway states:
  - `gateway_ready`
  - `gateway_disabled`
  - `payment_pending`
  - `payment_cancelled`
  - `payment_failed`
  - `manual_support_requested`
  - `entitlement_active`
- Added Razorpay-ready interfaces for:
  - order creation
  - signature verification
  - idempotency
  - payment status
  - entitlement activation
  - cancellation and failure transitions
- Added secret hygiene guard so payment intent metadata cannot store card tokens, secrets, signatures, keys, or raw payment secrets.

## Web Checkout

- `/checkout` now creates a safe payment intent for the selected product.
- With Razorpay disabled, checkout renders `gateway_disabled` instead of pretending payment is live.
- Disabled copy is explicit: Razorpay secure checkout is being connected, no payment was taken, and Predicta will not mark access as paid until verified payment or approved support handoff exists.
- The support-ticket handoff links to `/feedback?source=checkout&area=billing&from=payment-disabled`.
- Payment intent persistence is best-effort only and guarded so checkout does not break when embedded browser storage is unavailable.

## Mobile Billing

- Added a disabled production billing provider that never throws for purchase, restore, or manage paths.
- Production mode never uses mock billing even when `enableMockBilling` is accidentally true.
- Disabled purchases return `PENDING`, include safe payment intent metadata, and activate no entitlement.
- Restore returns an empty result safely.
- Manage subscription safely resolves while Razorpay/native billing is not connected.

## Strict Audit Evidence

- `corepack pnpm --filter @pridicta/monetization typecheck`: PASS
- `corepack pnpm --filter @pridicta/mobile typecheck`: PASS
- `corepack pnpm --filter @pridicta/web typecheck`: PASS
- `corepack pnpm build:web`: PASS
- `corepack pnpm --filter @pridicta/mobile exec jest __tests__/paymentWorkflow.test.ts --runInBand`: PASS
- `corepack pnpm --filter @pridicta/mobile exec jest __tests__/paymentWorkflow.test.ts __tests__/mockBillingProvider.test.ts --runInBand`: PASS
- `corepack pnpm test:mobile`: PASS
- `corepack pnpm --filter @pridicta/mobile bundle:android`: PASS
- `corepack pnpm test:translation-trust`: PASS
- `git diff --check`: PASS

## Browser Smoke Evidence

Target: `http://localhost:3009/checkout?productId=pridicta_day_pass_24h`

Observed:

- Page rendered without throwing.
- Gateway state: `gateway_disabled`.
- Disabled checkout copy included `Secure checkout is being connected`.
- Disabled checkout copy included `No payment was taken`.
- Disabled checkout copy included `will not mark access as paid`.
- Support-ticket handoff was visible and linked to `/feedback?source=checkout&area=billing&from=payment-disabled`.
- Browser local storage was unavailable in the embedded browser, and checkout still rendered safely.

Screenshot:

- `docs/audits/PREDICTA_PRE_LIVE_PHASE_7_PAYMENT_WORKFLOW_AND_RAZORPAY_READY_CONTRACT/web-checkout-disabled.png`

## Green Criteria

- Web checkout does not throw with Razorpay disabled.
- Mobile paywall/billing paths do not throw with production billing disabled.
- Mock billing cannot activate paid access in production mode.
- Disabled payment flow is honest and localized.
- Safe payment intent/status metadata is available without storing secrets.
- Tests cover disabled, pending, cancelled, failed, and success-interface states.
- Razorpay can be wired later through the shared contract without redesigning checkout.
