# PREDICTA_EMAIL_PHASE_3_RESEND_INBOUND_WEBHOOK_AND_THREADING

## Verdict

Phase 3 is implemented only as the Resend inbound webhook and support-threading
layer. It does not implement the admin inbox UI, reply composer, template
library, security audit, or final end-to-end smoke phases.

## Public Webhook Contract

- Production public URL:
  `https://predicta.rudraix.com/api/email/resend/webhook`
- Web route:
  `apps/web/app/api/email/resend/webhook/route.ts`
- Runtime:
  `nodejs`
- Secret:
  `PREDICTA_RESEND_WEBHOOK_SECRET`
- Secret Manager reference:
  `PREDICTA_RESEND_WEBHOOK_SECRET@1`

## Resend Events To Configure

Enabled:

- `email.received`
- `email.sent`
- `email.delivered`
- `email.delivery_delayed`
- `email.bounced`
- `email.failed`
- `email.complained`
- `email.suppressed`

Not enabled:

- `email.opened`
- `email.clicked`

Reason: opened/clicked tracking is not required for support threading and adds
privacy noise.

## Implementation Scope

### Webhook route

`apps/web/app/api/email/resend/webhook/route.ts`

- Reads the raw body using `request.text()` before parsing JSON.
- Reads `svix-id`, `svix-timestamp`, and `svix-signature`.
- Reads `PREDICTA_RESEND_WEBHOOK_SECRET`.
- Rejects missing secret with `503`.
- Rejects invalid signatures with `401`.
- Rejects invalid payloads with `400`.
- Processes verified payloads through the server-side webhook module.

### Processor

`apps/web/lib/email/resend-webhook.ts`

- Verifies Resend/Svix signatures using HMAC SHA-256 and timing-safe compare.
- Enforces a five-minute timestamp tolerance to reduce replay risk.
- Keeps the exact Phase 3 event subscription list.
- Ignores `email.opened` and `email.clicked` if they arrive accidentally.
- Deduplicates webhook deliveries by webhook id before mutating support state.
- Fetches received email content from the Resend Receiving API when an inbound
  `email.received` event includes `email_id` and the server-side API key is
  available.
- Threads inbound replies by ticket metadata, headers, subject, or plus-address
  alias.
- Records unthreaded inbound messages for admin review instead of dropping them.
- Records delivery events on known support threads.
- Records unthreaded delivery events for admin review.

### Sanitizer

`apps/web/lib/email/support-html-sanitizer.ts`

- Removes blocked active/content tags.
- Removes event-handler attributes.
- Removes unsafe `javascript:`, `data:`, and `vbscript:` URL attributes.
- Converts safe HTML into plain text before storing customer-visible inbound
  support messages.

### Repository update

`apps/web/lib/email/support-ticket-thread.ts`

- Adds `findThreadByTicketNumber`.
- Keeps Phase 2 private-note non-leak behavior intact.

### Shared status update

- `packages/types/src/support.ts`
- `backend/astro_api/models.py`

Delivery status now supports Resend delivery webhook states:

- `accepted`
- `sent`
- `delivered`
- `delivery_delayed`
- `bounced`
- `failed`
- `complained`
- `suppressed`

## Provider Research Notes

Resend documentation confirms that `email.received` webhook payloads do not
include full message body, headers, or attachments. The webhook receives
metadata and the app must call the Received Emails API / Receiving API to fetch
HTML, text, headers, and attachment metadata when needed.

Resend documentation also confirms the retrieve endpoint shape:

`GET /emails/receiving/:email_id`

The implementation uses `html_format=cid` so inline images remain referenced by
content id rather than embedding raw data URIs into stored support text.

## Strict Audit Evidence

Dedicated Phase 3 gate:

```bash
corepack pnpm test:email-phase-3
```

Gate coverage:

- route exists at the required path
- route uses raw body and does not call `request.json()` before verification
- branded webhook URL remains documented
- event list includes every approved event
- `email.opened` and `email.clicked` remain excluded
- `PREDICTA_RESEND_WEBHOOK_SECRET@1` is present in App Hosting YAML
- valid signature accepted
- invalid signature rejected
- stale timestamp rejected
- malicious inbound HTML sanitized
- known-ticket inbound reply appended to the support thread
- duplicate webhook id does not append another message
- no-ticket inbound reply is quarantined
- known-ticket delivery event is recorded
- accidental opened event is ignored
- Receiving API fetch uses the server-side Resend API key

## Explicit Non-Scope

Not implemented in Phase 3:

- admin inbox UI
- admin reply composer
- template management UI
- durable Firestore adapter
- Resend dashboard webhook creation
- live deployed webhook smoke
- final security/privacy audit
- final end-to-end email smoke

Those belong to later email phases.
