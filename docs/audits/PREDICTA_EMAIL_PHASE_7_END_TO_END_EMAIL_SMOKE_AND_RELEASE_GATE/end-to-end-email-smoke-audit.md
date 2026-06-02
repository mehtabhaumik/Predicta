# Predicta Email Phase 7 End-To-End Smoke And Release Gate

Phase keyword: `PREDICTA_EMAIL_PHASE_7_END_TO_END_EMAIL_SMOKE_AND_RELEASE_GATE`

This phase proves the support/email system works as a complete product path, not only as isolated renderer, webhook, or inbox modules.

## Required Journey

- Customer submits a support request through the public support API.
- A support ticket is persisted in the shared support repository.
- A customer auto-reply is sent through the server-side Resend transport.
- An admin notification is sent through the server-side Resend transport.
- An inbound customer reply is received through the verified Resend webhook processor.
- The inbound reply is threaded into the matching ticket.
- Admin opens the ticket from the protected inbox path.
- Admin uses the suggested template and sends an edited reply.
- Ticket status updates.
- Delivery events and audit events are present.
- Missing-provider and provider-failure paths are proven.

## Live Smoke Policy

Live Resend smoke is intentionally opt-in. The gate will only attempt a live provider call when:

- `PREDICTA_EMAIL_PHASE_7_LIVE_SMOKE=1`
- `PREDICTA_RESEND_API_KEY` is available in the runtime

This prevents accidental real customer/admin emails during local or CI runs.

## Evidence

The deterministic smoke artifact is:

`docs/audits/PREDICTA_EMAIL_PHASE_7_END_TO_END_EMAIL_SMOKE_AND_RELEASE_GATE/phase-7-email-e2e-smoke-artifact.json`

The artifact captures stable proof summaries for:

- customer email artifact
- admin notification artifact
- inbound reply threading artifact
- admin reply artifact
- audit trail artifact
- missing-provider smoke
- provider-failure smoke
- live-smoke skipped/run status

## Required Verification

- `corepack pnpm test:email-phase-7`
- `corepack pnpm test:email-phase-6`
- `corepack pnpm test:email-phase-5`
- `corepack pnpm --filter @pridicta/web typecheck`
- `git diff --check`
