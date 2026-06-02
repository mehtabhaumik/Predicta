# Predicta Email Phase 1 Resend Outbound Audit

## Phase

`PREDICTA_EMAIL_PHASE_1_RESEND_OUTBOUND_CUSTOMER_ADMIN_NOTIFICATIONS`

## Verdict

Green for Phase 1.

This phase creates the server-only outbound Resend layer, template rendering,
and post-persistence notification hook. It does not implement inbound webhooks,
support ticket threading, admin inbox UI, or feedback page rewiring.

## Implemented Files

- `apps/web/lib/email/resend-outbound.ts`
- `apps/web/lib/email/support-email-templates.ts`
- `apps/web/lib/email/support-outbound-notifications.ts`
- `scripts/run-email-phase-1-resend-outbound-gate.mjs`
- `package.json`

## Server-Only Resend Contract

`apps/web/lib/email/resend-outbound.ts` owns the server-side Resend transport.

It reads:

- `PREDICTA_RESEND_API_KEY`

It does not read:

- `NEXT_PUBLIC_*`
- unprefixed `RESEND_API_KEY`

The runtime secret is pinned by App Hosting as:

- `PREDICTA_RESEND_API_KEY@1`

## Outbound Config Behavior

The outbound layer supports two modes:

- non-live mode: missing `PREDICTA_RESEND_API_KEY` returns `undefined` so local
  non-email flows can continue without pretending email was sent
- live-required mode: missing `PREDICTA_RESEND_API_KEY` throws
  `ResendConfigurationError` with a clear message

## Customer/Admin Template Separation

Customer auto-reply template ID:

- `support.customer.auto_reply.received.v1`

Admin notification template ID:

- `support.admin.notification.received.v1`

The templates are intentionally separate:

- customer email is warm, premium, and action-oriented
- admin email is operational, sortable, and direct

## Notification Orchestration

`sendSupportOutboundNotifications()` accepts a persisted-ticket-shaped object:

- `ticketNumber`
- `subject`
- `message`
- `category`
- `priority`
- `status`
- `createdAt`
- optional customer identity/context fields

This is intentionally a post-persistence hook. It can be called by the future
canonical support submit endpoint after the ticket record exists.

Provider failures do not throw away ticket identity. The function always returns
the original `ticketNumber` and delivery events for each attempted send.

## Delivery Events

Delivery events include:

- `attemptedAt`
- `provider`
- `providerMessageId`
- `recipient`
- `status`
- `statusCode`
- `templateId`
- `ticketNumber`
- optional `error`

The orchestrator accepts `recordDeliveryEvent` so Phase 2 can persist these
events once the thread/message data model exists.

## Mocked Provider Audit

`corepack pnpm test:email-phase-1` verifies:

- Resend source uses `PREDICTA_RESEND_API_KEY`
- Resend source does not use `NEXT_PUBLIC_*`
- customer/admin templates have distinct IDs
- missing key is non-fatal when live email is not required
- missing key throws clearly in live-required mode
- mocked provider success sends customer and admin emails
- mocked provider success records accepted delivery events
- mocked provider rejection records a failed event and continues
- thrown provider/network error records a failed event
- missing customer email sends only the admin notification
- customer/admin/system route surfaces do not directly access Resend secrets

## Deferred To Later Phases

Phase 2:

- canonical support ticket thread model
- persistent delivery events
- private notes
- message lifecycle

Phase 3:

- inbound Resend webhook
- webhook verification
- inbound threading

Phase 4:

- admin support inbox UI

Phase 5:

- complete premium template catalog and admin reply composer

## Verification

- `corepack pnpm test:email-phase-1`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm test:email-phase-0`
- `git diff --check`
