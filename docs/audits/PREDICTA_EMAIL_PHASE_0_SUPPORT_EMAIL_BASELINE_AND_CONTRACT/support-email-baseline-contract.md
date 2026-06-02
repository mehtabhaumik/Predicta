# Predicta Email Phase 0 Baseline And Contract Audit

## Phase

`PREDICTA_EMAIL_PHASE_0_SUPPORT_EMAIL_BASELINE_AND_CONTRACT`

## Verdict

Green for Phase 0 only.

This phase does not implement Resend delivery, inbound webhook handling, support
threading, or admin inbox UI. It locks the current baseline and no-collision
contract so later phases cannot pretend those capabilities already exist.

## Current Support And Contact Surfaces

### Web Feedback Page

- File: `apps/web/app/feedback/page.tsx`
- Current behavior:
  - collects feedback area, tester type, page, optional email, and message
  - signed-in email is read through Firebase Auth
  - saves a local copy to `localStorage` key `pridicta.userFeedback.v1`
  - posts a lightweight event to `/api/safety/report`
  - offers a `mailto:support@predicta.app` backup link
- Redline:
  - no canonical support ticket is created
  - no `PRD` ticket/reference number is assigned
  - no customer auto-reply is sent
  - no admin notification email is sent
  - normal support still rides the safety proxy path

### Web Checkout Support Handoff

- File: `apps/web/app/checkout/page.tsx`
- Current behavior:
  - payment gateway can be disabled while Razorpay is being connected
  - manual support request updates a local payment intent state
  - support handoff is a `mailto:support@predicta.app`
  - the page links to `/feedback?source=checkout&area=billing&from=payment-disabled`
- Redline:
  - support handoff is not persisted as a support ticket
  - payment intent is not attached to a canonical support thread
  - there is no admin inbox item for checkout help
  - there is no audited billing/refund/access email flow yet

### Web Safety Report Proxy

- File: `apps/web/app/api/safety/report/route.ts`
- Current behavior:
  - proxies JSON to backend `/safety/report`
- Backend route:
  - `backend/astro_api/main.py`
  - `POST /safety/report`
- Redline:
  - this is a safety audit event path, not a normal support intake model
  - Phase 1+ must not treat this as the canonical support store
  - safety-related support may mirror here, but normal support must persist in
    the support ticket system first

### Admin Surfaces

- File: `apps/web/app/dashboard/admin/page.tsx`
- Current behavior:
  - owner console gate controls visibility
  - page currently exposes guest pass operations only
- Related admin API routes:
  - `apps/web/app/api/access/admin/guest-passes/route.ts`
  - `apps/web/app/api/safety/admin/reports/route.ts`
  - `apps/web/app/api/safety/admin/release-readiness/route.ts`
- Redline:
  - no support inbox exists
  - no support ticket list exists
  - no thread view exists
  - no admin reply composer exists
  - no private-note UI exists
  - no email delivery-state UI exists

### Backend Support Capability

- File: `backend/astro_api/main.py`
- Current behavior:
  - backend has safety audit, access/guest-pass admin, AI telemetry, and report
    pipeline routes
  - no `/support/submit` route exists
  - no support-ticket schema exists in backend models
  - no support-ticket repository exists
  - no support-message/thread repository exists
- Redline:
  - Phase 2 must create a real thread/message model before admin inbox UI
  - Phase 1 may wire outbound email only after a ticket creation seam exists or
    through a carefully staged support submit path

### Runtime Secret Configuration

- File: `apps/web/apphosting.yaml`
- Current Resend runtime env:
  - `PREDICTA_RESEND_API_KEY` from `PREDICTA_RESEND_API_KEY@1`
  - `PREDICTA_RESEND_WEBHOOK_SECRET` from
    `PREDICTA_RESEND_WEBHOOK_SECRET@1`
- Redline:
  - secrets are configured for runtime but no code consumes them yet
  - no client-side code may import or expose these secrets
  - App Hosting must have Secret Manager access before deployed smoke is green

## Current Email-Related State

- No Resend client wrapper exists.
- No `apps/web/app/api/email/resend/webhook/route.ts` exists.
- No email template source-of-truth files exist.
- No customer auto-reply templates exist.
- No admin reply templates exist.
- No system-triggered email templates exist.
- No inbound webhook verification exists.
- No email delivery event model exists.
- No support inbox UI exists.

## No-Collision Contract

`docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md` is the controlling
roadmap for the full Predicta Email Experience System:

- Resend outbound delivery
- Resend inbound webhook handling
- support ticket threading
- Outlook-like admin inbox
- admin reply composer
- customer/admin/system template catalog
- localization readiness
- privacy/security audit
- end-to-end email release smoke

`docs/PREDICTA_SUPPORT_CONFIRMATION_SYSTEM_PHASES.md` remains a useful
foundation for:

- canonical support intake
- `PRD` ticket/reference numbering
- moving normal support off the safety report proxy
- customer confirmation email intent
- internal action email intent

Do not create a parallel support model.

Do not add a second email roadmap.

If a future implementation finds overlap, use:

1. `PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md` for email, inbox,
   threading, templates, webhooks, and final email release gates.
2. `PREDICTA_SUPPORT_CONFIRMATION_SYSTEM_PHASES.md` for older support-intake
   context only.
3. The stricter rule when both files mention the same concern.

## Template Source-Of-Truth Contract

Future email templates must not be hardcoded inside:

- React components
- Next.js route handlers
- backend endpoint functions
- support submit orchestration
- admin inbox UI components

Template content must live in dedicated template source files and expose:

- `id`
- `category`
- `audience`
- `subject`
- `previewText`
- `header`
- `warmOpening`
- `mainMessage`
- `primaryCta`
- `contextBlock`
- `supportFooter`
- `privacyFooter`
- `variables`
- `allowedActions`
- `localizationStatus`

## Required Template Categories

### Customer Auto-Replies

- `Support Request Received`
- `Payment / Checkout Help Received`
- `Report Download Issue Received`
- `Kundli / Birth Details Help Received`
- `Signature Upload Help Received`
- `Account / Login Help Received`
- `Premium Access Help Received`
- `Bug Report Received`
- `Refund / Billing Request Received`
- `General Contact Received`

### Admin Replies

- `Need More Details`
- `Birth Details Missing`
- `Report Regeneration Shared`
- `Payment Link / Razorpay Help`
- `Premium Access Activated`
- `Issue Acknowledged`
- `Bug Escalated`
- `Refund Under Review`
- `Resolved / Closing`
- `Friendly Follow-Up`

### System-Triggered Emails

- `Welcome To Predicta`
- `Google Sign-In Confirmation`
- `Report Ready`
- `Report Download Link`
- `Premium Purchase Confirmation`
- `Question Pack Purchase Confirmation`
- `Report Pack Purchase Confirmation`
- `AI Credits Exhausted`
- `Kundli Limit Reached`
- `Family Vault Invite`
- `Admin Reply Notification`
- `Security / Account Alert`

## First Audit Artifacts Required By Later Phases

### Phase 1

- outbound provider mock success artifact
- outbound provider mock failure artifact
- customer auto-reply render artifact
- admin notification render artifact
- delivery-event persistence artifact
- server-only secret usage proof

### Phase 2

- ticket/thread schema artifact
- message lifecycle artifact
- private-note non-leak artifact
- status/priority audit-event artifact

### Phase 3

- branded webhook URL artifact:
  `https://predicta.rudraix.com/api/email/resend/webhook`
- webhook signature verification artifact
- inbound HTML sanitization artifact
- duplicate webhook idempotency artifact
- known-ticket threading artifact
- unthreaded quarantine artifact

### Phase 4

- desktop admin inbox screenshot
- tablet admin inbox screenshot
- mobile admin inbox screenshot
- unauthorized admin access artifact
- private-note visibility artifact

### Phase 5

- template catalog manifest
- template render snapshots
- missing-variable failure artifact
- suggested-template behavior artifact
- composer status-action artifact

### Phase 6

- security gate artifact
- privacy leak gate artifact
- localization/template source gate artifact
- payment/refund/access audit artifact
- no-unsupported-prediction email artifact

### Phase 7

- mocked end-to-end support journey artifact
- customer auto-reply artifact
- admin notification artifact
- inbound threading artifact
- admin reply artifact
- audit trail artifact
- controlled live Resend smoke artifact if credentials and deployment are safe

## Phase 0 Green Evidence

- Current support/contact/admin/email surfaces inventoried.
- Existing support-confirmation roadmap compared and scoped.
- New email roadmap declared as the controlling inbox/template/Resend source.
- Runtime secret contract confirmed as version `1` for both Resend secrets.
- Template taxonomy and source-of-truth rules locked.
- Later-phase audit artifacts defined.
- No implementation falsely claims Resend delivery or inbound webhook readiness.
