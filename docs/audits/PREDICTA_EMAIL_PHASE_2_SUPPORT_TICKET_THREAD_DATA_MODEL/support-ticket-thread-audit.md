# Predicta Email Phase 2 Support Ticket Thread Audit

## Phase

`PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL`

## Verdict

Green for Phase 2.

The support ticket thread contract now exists across shared TypeScript types,
web lifecycle/repository helpers, and backend Pydantic models. This phase does
not implement the submit endpoint, inbound webhook, admin inbox, or durable
production storage adapter yet.

## Implemented Files

- `packages/types/src/support.ts`
- `packages/types/src/index.ts`
- `apps/web/lib/email/support-ticket-thread.ts`
- `backend/astro_api/models.py`
- `scripts/run-email-phase-2-support-ticket-thread-gate.mjs`
- `docs/audits/PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL/support-thread-migration-backfill-plan.md`
- `package.json`

## Shared Contract

`@pridicta/types` now exports:

- `SupportTicketCategory`
- `SupportTicketStatus`
- `SupportTicketPriority`
- `SupportTicketMessageKind`
- `SupportTicketMessageVisibility`
- `SupportTicketRecord`
- `SupportTicketMessage`
- `SupportEmailDeliveryEvent`
- `SupportTicketAuditEvent`
- `SupportTicketThread`

Message kinds are explicit:

- `customer_inbound`
- `admin_outbound`
- `system_auto_reply`
- `internal_private_note`

## Private Note Non-Leak Contract

Private notes are structurally separated:

- `kind: internal_private_note`
- `visibility: internal_only`
- `deliveryEligible: false`

The web lifecycle helper throws if an internal private note is treated as a
customer-deliverable message.

The backend Pydantic model rejects internal private notes that claim customer
visibility or delivery eligibility.

## Web Repository Contract

`apps/web/lib/email/support-ticket-thread.ts` provides:

- `createSupportTicketThread`
- `addSupportTicketMessage`
- `updateSupportTicketStatus`
- `updateSupportTicketPriority`
- `assignSupportTicket`
- `recordSupportEmailDeliveryEvent`
- `assertCustomerDeliverableMessage`
- `getCustomerVisibleSupportMessages`
- `SupportTicketThreadRepository`
- `InMemorySupportTicketThreadRepository`

The in-memory repository is a test/development adapter and contract example.
Durable persistence remains a later implementation step.

## Audit Event Contract

Audit events are created for:

- ticket creation
- message added
- status changed
- priority changed
- assignment changed
- delivery recorded

## Delivery Event Contract

Persistent delivery events include:

- provider
- recipient
- status
- status code
- template id
- ticket id
- ticket number
- optional provider message id
- optional error

Phase 1's outbound callback can feed this model once the canonical submit/thread
persistence path is wired.

## Migration And Backfill Boundary

The migration plan explicitly blocks automatic import of:

- browser `localStorage` feedback drafts
- raw `mailto` messages

Only backend-owned records may be backfilled later. Safety audit events remain
safety audit records unless an explicit support ticket is created with proper
customer-visible/internal-only separation.

## Deferred To Later Phases

Phase 3:

- Resend inbound webhook
- webhook verification
- inbound threading
- unthreaded quarantine

Phase 4:

- admin inbox UI
- thread detail
- private note UI
- delivery state UI

Future support-submit work:

- durable database adapter
- canonical submit endpoint
- feedback/checkout rewiring

## Verification

- `corepack pnpm test:email-phase-2`
- `corepack pnpm --filter @pridicta/types typecheck`
- backend support model import and private-note validation smoke
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm test:email-phase-1`
- `corepack pnpm test:email-phase-0`
- `git diff --check`
