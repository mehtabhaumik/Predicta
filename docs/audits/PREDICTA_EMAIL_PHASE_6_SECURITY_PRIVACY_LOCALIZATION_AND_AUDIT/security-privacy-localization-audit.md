# Predicta Email Phase 6 Security, Privacy, Localization Audit

Phase keyword: `PREDICTA_EMAIL_PHASE_6_SECURITY_PRIVACY_LOCALIZATION_AND_AUDIT`

Verdict target: this phase can only be called green after the automated Phase 6 gate and inherited email gates pass.

## Locked Security Rules

- Resend outbound delivery remains server-only through `apps/web/lib/email/resend-outbound.ts`.
- Inbound Resend webhooks remain server-only through `apps/web/app/api/email/resend/webhook/route.ts`.
- The webhook must read `request.text()` and verify `svix-id`, `svix-timestamp`, and `svix-signature` before processing.
- Client and mobile files must not reference `PREDICTA_RESEND_API_KEY`, `PREDICTA_RESEND_WEBHOOK_SECRET`, `resend-outbound`, or `resend-webhook`.
- The admin inbox routes must remain protected by `requireSupportInboxAdmin`.

## Locked Privacy Rules

- Inbound HTML must be sanitized before storage or display.
- Admin inbox UI must not use `dangerouslySetInnerHTML`.
- Internal private notes remain `internal_only`.
- Private-note language is blocked from the customer reply composer.
- Admin private notes are shown as private notes in the inbox and must never be sent to customers.
- Support templates include privacy/trust footer copy.

## Locked Localization And Template Rules

- Customer, admin, and system email templates live in `support-email-template-catalog.json`.
- Components and email adapters must not hardcode long template bodies.
- Every template declares `locale`.
- Every template placeholder must be declared in `requiredVariables`.
- Every declared required variable must be used by the template.
- The renderer remains the only supported path for template interpolation.

## Locked Support Prediction Rules

- Support emails may help with report access, account state, payments, bugs, and safe next steps.
- Support emails must not generate new astrology predictions.
- Support emails must not claim guaranteed outcomes, fixed futures, or fatalistic certainty.
- Signature support copy must preserve the reflective-guidance guardrail.

## Locked Audit Trail Rules

- Payment, refund, and Premium-access admin replies must append a customer-visible admin message.
- Payment, refund, and Premium-access admin replies must record a delivery event.
- Payment, refund, and Premium-access admin replies must record a ticket status transition.
- Duplicate admin reply submissions must be idempotent and must not append duplicate messages, delivery events, or customer emails.

## Phase 6 Evidence

The dedicated gate is `scripts/run-email-phase-6-security-privacy-localization-gate.mjs`.

Required verification:

- `corepack pnpm test:email-phase-6`
- `corepack pnpm test:email-phase-5`
- `corepack pnpm test:email-phase-4`
- `corepack pnpm test:email-phase-3`
- `corepack pnpm test:email-phase-2`
- `corepack pnpm test:email-phase-1`
- `corepack pnpm test:email-phase-0`
- `corepack pnpm --filter @pridicta/web typecheck`
- `git diff --check`
