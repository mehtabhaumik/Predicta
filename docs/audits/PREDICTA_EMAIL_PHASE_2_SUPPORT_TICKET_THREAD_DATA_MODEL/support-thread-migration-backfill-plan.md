# Predicta Email Phase 2 Support Thread Migration And Backfill Plan

## Phase

`PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL`

## Current Legacy Inputs

Predicta does not yet have a canonical support ticket table.

Legacy support-like inputs currently include:

- local feedback drafts in browser `localStorage` key `pridicta.userFeedback.v1`
- lightweight safety events created through `/api/safety/report`
- checkout manual-support intent state in browser storage
- `mailto:support@predicta.app` messages that bypass app persistence

## Backfill Rule

Do not silently import every local/browser-only feedback draft as a real support
ticket. Those records are not durable, may be device-local, and may not have
customer consent or complete context.

Backfill should only happen from backend-owned records.

## Phase 3+ Backend Backfill Strategy

When canonical persistence is introduced, use this order:

1. Keep existing safety events in their current safety audit store.
2. For safety-related support categories, create a support ticket first and then
   mirror to safety when needed.
3. If old backend safety events need support review, create support tickets with:
   - `category: safety-concern`
   - `status: NEW`
   - `priority: HIGH`
   - `sourceSurface: legacy-safety-audit`
   - one `system_auto_reply` or `customer_inbound` message only when the
     original user message is available
4. Do not backfill `mailto` messages unless the admin imports them manually and
   the sender/thread context is clear.
5. Do not backfill browser `localStorage` entries automatically.

## Ticket Number Rule

Backfilled support tickets must receive normal `PRD` ticket numbers. Do not use
provider message IDs, safety event IDs, or local storage timestamps as the
customer-facing ticket number.

## Privacy Rule

Backfilled internal reviewer notes must become `internal_private_note` messages
with:

- `visibility: internal_only`
- `deliveryEligible: false`

They must never become customer-visible replies.

## Green Requirement For Backfill Implementation

A future backfill implementation is not green until it proves:

- no local-only browser drafts are imported automatically
- safety events remain safety-audit records
- imported safety-support records keep customer-visible and internal-only data
  separated
- each created support ticket receives a new `PRD` ticket number
- every created message receives an audit event
