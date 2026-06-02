# PREDICTA_EMAIL_PHASE_5_ADMIN_REPLY_COMPOSER_AND_TEMPLATE_SYSTEM

## Verdict

Phase 5 is implemented as the catalog-backed template system plus admin reply
composer. It does not implement the Phase 6 security/privacy/localization audit
or the Phase 7 end-to-end email smoke.

## Template Source Of Truth

Dedicated source:

- `apps/web/lib/email/support-email-template-catalog.json`

Renderer:

- `apps/web/lib/email/support-email-template-renderer.ts`

Legacy Phase 1 adapter:

- `apps/web/lib/email/support-email-templates.ts`

The legacy adapter now delegates to the catalog renderer instead of carrying
hardcoded email-copy blocks.

## Template Catalog Coverage

Customer auto-reply templates:

- `support.customer.auto_reply.received.v1`
- `support.customer.auto_reply.payment_help_received.v1`
- `support.customer.auto_reply.report_download_issue_received.v1`
- `support.customer.auto_reply.kundli_help_received.v1`
- `support.customer.auto_reply.signature_help_received.v1`
- `support.customer.auto_reply.account_login_help_received.v1`
- `support.customer.auto_reply.premium_access_help_received.v1`
- `support.customer.auto_reply.bug_report_received.v1`
- `support.customer.auto_reply.refund_billing_request_received.v1`
- `support.customer.auto_reply.general_contact_received.v1`

Admin templates:

- `support.admin.notification.received.v1`
- `support.admin.reply.need_more_details.v1`
- `support.admin.reply.birth_details_missing.v1`
- `support.admin.reply.report_regeneration_shared.v1`
- `support.admin.reply.payment_link_razorpay_help.v1`
- `support.admin.reply.premium_access_activated.v1`
- `support.admin.reply.issue_acknowledged.v1`
- `support.admin.reply.bug_escalated.v1`
- `support.admin.reply.refund_under_review.v1`
- `support.admin.reply.resolved_closing.v1`
- `support.admin.reply.friendly_follow_up.v1`

System-triggered templates:

- `support.system.welcome_to_predicta.v1`
- `support.system.google_sign_in_confirmation.v1`
- `support.system.report_ready.v1`
- `support.system.report_download_link.v1`
- `support.system.premium_purchase_confirmation.v1`
- `support.system.question_pack_purchase_confirmation.v1`
- `support.system.report_pack_purchase_confirmation.v1`
- `support.system.ai_credits_exhausted.v1`
- `support.system.kundli_limit_reached.v1`
- `support.system.family_vault_invite.v1`
- `support.system.admin_reply_notification.v1`
- `support.system.security_account_alert.v1`

Every template includes:

- subject
- preview text
- heading
- body paragraphs
- CTA
- footer
- locale metadata
- group metadata
- category hints
- required variables

## Admin Composer

UI:

- `apps/web/components/WebAdminSupportInboxPanel.tsx`

API:

- `POST /api/email/admin/tickets/[ticketId]/reply`

The composer includes:

- suggested template based on ticket category
- searchable template cards
- editable reply body
- requested-details variable field
- resolution-summary variable field
- send and mark waiting
- send and resolve
- send and escalate

The composer only lists `support.admin.reply.*` templates. It does not allow
customer auto-reply templates or admin notification templates as reply drafts.

## Send Behavior

Server function:

- `sendAdminSupportReply`

Behavior:

- appends a customer-visible `admin_outbound` message
- records a Resend delivery event
- uses Resend when configured
- safely records a failed delivery event when Resend is not configured
- maps actions to ticket status:
  - waiting -> `WAITING_ON_USER`
  - resolve -> `RESOLVED`
  - escalate -> `ESCALATED`
- blocks customer reply sends when the body contains private-note language
- blocks customer/admin/system templates that are not admin reply templates

## Browser Evidence

Screenshots saved:

- `admin-reply-composer-desktop-1440.png`
- `admin-reply-composer-tablet-820.png`
- `admin-reply-composer-mobile-390.png`

Browser metrics:

| Breakpoint | Width | Horizontal overflow | Composer | Send actions | Template cards |
|---|---:|---|---|---|---:|
| Desktop | 1440 | no | visible | visible | 4 |
| Tablet | 820 | no | visible | visible | 4 |
| Mobile | 390 | no | visible | visible | 4 |

Browser action proof:

- Loaded protected owner inbox with `phase-5-token`.
- Selected the billing preview ticket.
- Edited the reply body.
- Clicked `Send and resolve`.
- Ticket updated to `RESOLVED`.
- Edited reply appeared in the thread.
- UI showed safe fallback copy because Resend was not configured in the local
  browser run.

## Strict Audit Evidence

Commands:

```bash
corepack pnpm test:email-phase-5
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/types typecheck
corepack pnpm test:email-phase-4
corepack pnpm test:email-phase-3
corepack pnpm test:email-phase-2
corepack pnpm test:email-phase-1
corepack pnpm test:email-phase-0
```

Gate coverage:

- every required customer auto-reply template exists
- every required admin reply template exists
- every required system-triggered template exists
- template required variables exist
- missing variable rendering fails
- template search works
- category-based suggestion works
- composer source has template search and all send actions
- Phase 1 adapters render through the catalog
- send and mark waiting updates status correctly
- send and resolve updates status correctly
- send and escalate updates status correctly
- delivery events are recorded
- private notes cannot be sent through the customer reply composer
- customer templates cannot be sent through the admin reply composer

## Explicit Non-Scope

Not implemented in Phase 5:

- full security/privacy audit
- full localization completeness audit
- duplicate-send/idempotency hardening
- durable production support-ticket adapter
- live Resend send smoke
- final end-to-end customer request -> admin reply smoke
