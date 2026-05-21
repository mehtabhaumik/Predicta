# Predicta Support And Confirmation System Phases

## Status

Approved implementation plan for the Predicta support, feedback, complaint,
query, and confirmation-email system.

This plan exists because Predicta should not bolt email onto the current
feedback form.

Predicta needs a real support intake pipeline with:

- one canonical backend ticket record
- durable database persistence
- operational ticket numbering
- customer-facing confirmation emails
- internal staff action emails
- category-aware next-step messaging
- safe mail delivery orchestration

This is not a styling-only task.

This is not a mail-send-only task.

This is a product + backend + ops system.

---

## Product Rule

Predicta support intake must behave like a real support system:

1. user submits a message
2. backend creates a durable record
3. backend assigns a readable `PRD` reference or ticket number
4. user gets a premium confirmation email
5. Predicta staff gets an internal action email
6. support work can be tracked later without relying on local storage or safety
   event proxies

The system must answer:

`What was submitted, how is it tracked, and what happens next?`

---

## Hard Rules

1. Do not overload the existing `/api/safety/report` seam for normal support
   intake.
2. All normal user contact must persist in one canonical backend-owned record.
3. `feedback` gets a `Reference ID`, not a problem-style `Ticket number`.
4. `question`, `complaint`, `bug-report`, `feature-request`, `billing`,
   `account`, and `safety-concern` get a `Ticket number`.
5. Ticket numbers must stay `PRD` prefixed and operationally readable.
6. Customer emails and internal ops emails must be different templates.
7. `reply-to` must route to `predicta@rudraix.com` without exposing internal
   routing details to the user.
8. Signed-in context must be attached when available:
   - `userId`
   - `kundliId`
   - route
   - language
9. Anti-spam and basic abuse controls are required before mail orchestration is
   called complete.
10. No phase may be called complete without local audit.
11. Do not start mail orchestration before the intake record and template system
    are already real.
12. No phase may silently create a parallel support model outside the approved
    table/collection contract.

---

## Real Architecture This Plan Must Use

Do not invent a fake support sidecar. Extend the current Predicta seams:

- `apps/web/app/feedback/page.tsx`
- `apps/web/app/api/safety/report/route.ts`
- `apps/web/lib/astro-api.ts`
- backend API routes and models under `backend/astro_api`
- existing database persistence seams already used by Predicta backend services

This rebuild should move support intake off the lightweight safety proxy path
and into a proper backend-owned endpoint, for example:

- `POST /support/submit`

If a submission is safety-related, it may also mirror a safety event
internally.

It must not treat the safety report system as the primary store for normal
support traffic.

---

## Canonical Intake Record

The unified backend support record must include at minimum:

- `id`
- `ticketNumber`
- `kind`
- `status`
- `priority`
- `userEmail`
- `userName`
- `sourceSurface`
- `route`
- `subject`
- `message`
- `language`
- `userId`
- `kundliId`
- `createdAt`
- `updatedAt`
- `meta`

Recommended `kind` values:

- `feedback`
- `question`
- `complaint`
- `bug-report`
- `feature-request`
- `billing`
- `account`
- `safety-concern`

Recommended `status` values:

- `NEW`
- `ACKNOWLEDGED`
- `IN_REVIEW`
- `WAITING_ON_USER`
- `RESOLVED`
- `CLOSED`

Recommended table:

- `support_tickets`

Optional future tables:

- `support_ticket_events`
- `support_ticket_replies`

For now, one canonical support table is enough if it also supports:

- `assignedTo`
- `resolutionNotes`
- `lastInternalActionAt`

---

## Approved Order

1. `PREDICTA_SUPPORT_PHASE_1_CANONICAL_TICKET_SCHEMA_AND_STORAGE_CONTRACT`
2. `PREDICTA_SUPPORT_PHASE_2_TICKET_NUMBERING_PRIORITY_AND_NORMALIZATION`
3. `PREDICTA_SUPPORT_PHASE_3_BACKEND_SUBMIT_ENDPOINT_AND_ENRICHMENT_PIPELINE`
4. `PREDICTA_SUPPORT_PHASE_4_CUSTOMER_CONFIRMATION_TEMPLATE_SYSTEM`
5. `PREDICTA_SUPPORT_PHASE_5_INTERNAL_ACTION_EMAIL_TEMPLATE_SYSTEM`
6. `PREDICTA_SUPPORT_PHASE_6_RESEND_ORCHESTRATION_AND_DELIVERY_GUARDRAILS`
7. `PREDICTA_SUPPORT_PHASE_7_FEEDBACK_UI_INTEGRATION_AND_CONFIRMATION_EXPERIENCE`
8. `PREDICTA_SUPPORT_PHASE_8_FINAL_QA_DEPLOY_AND_LIVE_SMOKE`

Do not skip.

Do not merge phases casually.

Do not start the next phase until the current phase is locally audited and
green.

---

## Phase 1

### Keyword

`PREDICTA_SUPPORT_PHASE_1_CANONICAL_TICKET_SCHEMA_AND_STORAGE_CONTRACT`

### Goal

Create the real support-ticket schema and persistence contract before any email
work starts.

### Scope

- Define the canonical `support_tickets` record shape.
- Define `kind`, `status`, and `priority` enums/constants.
- Add any shared type contracts needed by web and backend.
- Choose the real persistence surface Predicta backend will use.
- Document which current feedback fields map into the new record.
- Add explicit separation between:
  - user-facing identifiers
  - internal metadata
  - optional future workflow fields

### Must Touch

- shared types used by web/backend
- backend support data model files
- persistence contract files for Predicta backend

### Exact Execution Prompt

> Build the canonical Predicta support-ticket schema first. Add one durable
> backend record for all inbound support and feedback traffic, including the
> `PRD` identifier field, category, status, priority, user contact fields,
> route/source metadata, and support workflow fields. Do not wire email yet.
> This phase must make the storage model real and future-safe.

### Strict Audit

- backend schema/unit tests pass
- typecheck passes for touched shared contracts
- local persistence smoke proves a record can be created and read back
- no normal support flow still depends on local-only storage as the source of
  truth

---

## Phase 2

### Keyword

`PREDICTA_SUPPORT_PHASE_2_TICKET_NUMBERING_PRIORITY_AND_NORMALIZATION`

### Goal

Make ticket IDs and support classification operationally useful before endpoint
or email fanout logic becomes complex.

### Scope

- Implement `PRD` ticket/reference number generation.
- Keep `feedback` softer with a `Reference ID`.
- Keep issue-style submissions operational with `Ticket number`.
- Normalize raw UI categories into canonical internal `kind` values.
- Add auto-priority rules, including:
  - `safety`
  - `billing`
  - `account lockout`
- Define deterministic fallback behavior when category or subject is weak.

### Must Touch

- backend ticket utility files
- support classification helpers
- shared type contracts where needed

### Exact Execution Prompt

> Implement Predicta support ticket numbering and normalization. Generate
> readable `PRD` identifiers such as `PRD-FBK-XXXXXX` and `PRD-BUG-XXXXXX`.
> Normalize incoming categories into canonical support kinds and assign sane
> priority defaults so staff can immediately understand what kind of message was
> submitted and how urgent it is.

### Strict Audit

- deterministic tests cover ticket/reference format
- deterministic tests cover category normalization
- deterministic tests cover priority assignment rules
- collision-resistant generation is verified locally with bulk test generation

---

## Phase 3

### Keyword

`PREDICTA_SUPPORT_PHASE_3_BACKEND_SUBMIT_ENDPOINT_AND_ENRICHMENT_PIPELINE`

### Goal

Replace the lightweight proxy approach with a proper backend support submit
endpoint.

### Scope

- Add a real support submit endpoint, for example `POST /support/submit`.
- Move feedback/support submission off the normal `/api/safety/report` proxy
  path.
- Attach signed-in enrichment when present:
  - `userId`
  - `activeKundliId`
  - current route
  - app language
- Add admin-ready metadata:
  - browser
  - OS
  - timestamp
  - source surface
- Add anti-spam protection:
  - honeypot
  - length caps
  - rate limit or equivalent throttle
- If the category is safety-related, mirror a safety event internally without
  making it the primary support store.

### Must Touch

- backend support endpoint files
- relevant web API bridge files
- `apps/web/app/feedback/page.tsx`
- current safety proxy seam only where needed to stop misrouting

### Exact Execution Prompt

> Build the real backend support submit flow. Add a canonical support endpoint,
> persist the ticket record there, enrich it with signed-in/user/session
> metadata, and add basic abuse controls before any email is sent. Safety
> categories may mirror a safety event internally, but normal support must no
> longer depend on the safety report proxy as the main path.

### Strict Audit

- endpoint tests pass
- local submit smoke proves a record is persisted through the new endpoint
- anti-spam validation is locally tested
- safety-category submit smoke proves support persistence still happens and
  safety mirroring does not break the request

---

## Phase 4

### Keyword

`PREDICTA_SUPPORT_PHASE_4_CUSTOMER_CONFIRMATION_TEMPLATE_SYSTEM`

### Goal

Create the polished customer-facing email template system before wiring live
delivery.

### Scope

- Build the customer template family:
  - `Feedback confirmation`
  - `Support / query / complaint confirmation`
- Use Predicta logo and premium dark styling.
- Include:
  - clean heading
  - calm thank-you line
  - `Reference ID` or `Ticket number`
  - submission summary
  - user message block
  - category-aware `What happens next`
  - helpful links
  - safety/privacy footer
- Vary `What happens next` by category:
  - feedback
  - bug/complaint
  - general query
- Keep helpful links focused:
  - dashboard
  - reports
  - Kundli Library
  - feedback/support page
  - safety/method or founder/trust page

### Must Touch

- email template render files
- branding asset references
- support copy utilities

### Exact Execution Prompt

> Build the customer confirmation email system for Predicta support submissions.
> Use premium branding, the Predicta logo, a calm tone, and category-aware
> `What happens next` blocks. Feedback must feel acknowledged without fake
> urgency. Problem-style submissions must feel tracked and actionable. Do not
> wire live delivery yet; make the render system real first.

### Strict Audit

- local template render snapshot checks pass
- visual verification confirms logo, hierarchy, ID block, summary, message, and
  next-step sections render correctly
- category-aware copy tests prove feedback/query/complaint variants differ as
  intended

---

## Phase 5

### Keyword

`PREDICTA_SUPPORT_PHASE_5_INTERNAL_ACTION_EMAIL_TEMPLATE_SYSTEM`

### Goal

Create the staff-facing operational email templates separately from the
customer-facing confirmation templates.

### Scope

- Build the internal template family:
  - `Feedback received`
  - `Support / query / complaint action email`
- Include:
  - ticket/reference number
  - kind
  - priority
  - created timestamp
  - user email
  - user id if present
  - route/source page
  - app language
  - related kundli id if present
  - message body
  - recommended action
  - future admin/dashboard link placeholder if needed
- Keep the internal template operational, not marketing-heavy.

### Must Touch

- internal email template render files
- support copy utilities
- shared support formatting helpers

### Exact Execution Prompt

> Build the internal Predicta support action email templates. These emails must
> be direct, sortable, and operational. They should tell staff exactly what
> happened, who sent it, where it came from, how urgent it is, and what staff
> should do next. Do not reuse the customer template with minor edits.

### Strict Audit

- local internal-template render snapshot checks pass
- visual verification confirms operations-first layout
- test coverage proves key metadata fields always appear when available

---

## Phase 6

### Keyword

`PREDICTA_SUPPORT_PHASE_6_RESEND_ORCHESTRATION_AND_DELIVERY_GUARDRAILS`

### Goal

Wire real mail delivery only after records and templates are already real.

### Scope

- Add Resend orchestration.
- Send customer confirmation from `care@predicta.rudraix.com` to the user.
- Send internal action email from `care@predicta.rudraix.com` to
  `predicta@rudraix.com`.
- Set `reply-to: predicta@rudraix.com`.
- Make mail sending failure-safe:
  - support ticket creation must not be lost if email fails
  - delivery errors should be recorded for staff
- Keep user copy free of internal routing details.
- Add environment validation for mail configuration.

### Must Touch

- backend mail orchestration files
- environment/config validation
- endpoint flow that calls the mail sender after persistence

### Exact Execution Prompt

> Wire Predicta support delivery through Resend only after persistence and
> template rendering are already complete. Send one customer confirmation email
> and one internal staff action email per submission. Use `care@predicta.rudraix.com`
> as sender, set `reply-to` to `predicta@rudraix.com`, and ensure a mail-send
> failure never drops the ticket record.

### Strict Audit

- local mail orchestration tests pass with mocked provider responses
- failure-path tests prove ticket persistence survives provider failure
- config validation tests prove missing mail env vars fail clearly

---

## Phase 7

### Keyword

`PREDICTA_SUPPORT_PHASE_7_FEEDBACK_UI_INTEGRATION_AND_CONFIRMATION_EXPERIENCE`

### Goal

Reconnect the web support surface to the new backend system and make the user
experience feel like a real tracked submission flow.

### Scope

- Rebuild the existing feedback/support page around the canonical support kinds.
- Add any needed distinction between feedback and issue-style submissions.
- Replace the current local-save + safety-proxy behavior with the new support
  submit flow.
- Show a clear success state including:
  - `Reference ID` or `Ticket number`
  - calm confirmation copy
  - what happens next summary
- Keep the flow premium and respectful.
- Do not make free users feel ignored.

### Must Touch

- `apps/web/app/feedback/page.tsx`
- any web support form helpers
- new or updated web API bridge files

### Exact Execution Prompt

> Integrate the Predicta web feedback/support surface with the new support
> system. Replace the current local-only save and lightweight safety proxy
> behavior with the real submit flow. After submit, show a tracked, calm success
> state with the reference or ticket number and a useful explanation of what
> happens next.

### Strict Audit

- local UI smoke proves each support kind submits successfully
- success state shows the right ID style for feedback vs issue-style messages
- signed-in and signed-out flows are both verified locally
- no submission path silently falls back to local-only success without backend
  persistence

---

## Phase 8

### Keyword

`PREDICTA_SUPPORT_PHASE_8_FINAL_QA_DEPLOY_AND_LIVE_SMOKE`

### Goal

Run the final end-to-end support-system gate only after all implementation
phases are green locally.

### Scope

- strict local end-to-end support submit QA
- local email render QA
- local mail orchestration QA
- deploy
- deployed-app smoke

### Exact Execution Prompt

> Run the final Predicta support-system QA gate only after all support phases
> are locally green. Verify the real web submit flow, stored support ticket,
> rendered customer confirmation email, rendered internal action email, and
> failure-safe mail behavior. Then deploy and smoke test the deployed app
> without skipping customer-facing confirmation states.

### Strict Audit

- local support submit smoke for:
  - feedback
  - question
  - complaint
  - bug-report
  - feature-request
  - billing
  - account
  - safety-concern
- local persistence verification proves each category reaches `support_tickets`
- local rendered email verification for both customer and internal templates
- local failure-path verification for mail provider error
- deployed-app smoke proves real submit path works on the hosted app

---

## First Phase

The first implementation phase should be:

`PREDICTA_SUPPORT_PHASE_1_CANONICAL_TICKET_SCHEMA_AND_STORAGE_CONTRACT`
