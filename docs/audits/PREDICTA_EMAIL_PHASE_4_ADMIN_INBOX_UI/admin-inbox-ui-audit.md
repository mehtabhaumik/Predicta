# PREDICTA_EMAIL_PHASE_4_ADMIN_INBOX_UI

## Verdict

Phase 4 is implemented as a protected owner-console support inbox UI. It adds
the support-desk surface only. It does not implement the Phase 5 reply composer,
template search, send actions, durable production adapter, or final end-to-end
email smoke.

## Admin-Only Access Contract

- Public/default builds keep `/dashboard/admin` hidden behind
  `isOwnerConsoleEnabled()`.
- Support inbox API routes require owner-console enablement before data access.
- Support inbox API routes require `x-pridicta-admin-token`.
- If `PREDICTA_SUPPORT_ADMIN_TOKEN`, `PREDICTA_OWNER_ADMIN_TOKEN`, or
  `PRIDICTA_ADMIN_TOKEN` is configured, the header token must match.
- Missing token returns `401`.
- Wrong configured token returns `403`.
- Owner-console disabled returns the existing public-build unavailable `404`.

## Implemented Routes

- `GET /api/email/admin/tickets`
- `GET /api/email/admin/tickets/[ticketId]`
- `PATCH /api/email/admin/tickets/[ticketId]`

## Implemented UI

Route:

- `/dashboard/admin`

Component:

- `apps/web/components/WebAdminSupportInboxPanel.tsx`

The inbox includes:

- owner-key entry
- ticket health metrics
- ticket list
- search by ticket, subject, customer name, email, and preview
- status filter
- priority filter
- category filter
- selected thread detail panel
- customer context panel
- request context panel
- delivery event panel
- status control
- priority control
- assignment control
- distinct customer, system, admin, and private note message styling
- visible private note warning: `Private note · never emailed`

## Data Boundary

Phase 4 uses the support thread repository contract from Phases 2 and 3. In
non-production only, it can seed `.invalid` preview tickets so the owner desk can
be audited without real customer data. Production does not seed preview tickets.

This is intentionally not the durable Firestore/support backend adapter. Durable
storage remains a later integration concern.

## Responsive Browser Evidence

Screenshots saved:

- `admin-inbox-desktop-1440.png`
- `admin-inbox-tablet-820.png`
- `admin-inbox-mobile-390.png`

Browser metrics:

| Breakpoint | Width | Horizontal overflow | Ticket cards | Private note | Delivery state |
|---|---:|---|---:|---|---|
| Desktop | 1440 | no | 3 | visible | visible |
| Tablet | 820 | no | 3 | visible | visible |
| Mobile | 390 | no | 3 | visible | visible |

## Strict Audit Evidence

Commands:

```bash
corepack pnpm test:email-phase-4
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/types typecheck
corepack pnpm test:email-phase-3
corepack pnpm test:email-phase-2
corepack pnpm test:email-phase-1
corepack pnpm test:email-phase-0
```

Additional browser/runtime proof:

- Local protected owner server:
  `PREDICTA_ENABLE_OWNER_CONSOLE=true PREDICTA_SUPPORT_ADMIN_TOKEN=phase-4-token PORT=3024 HOSTNAME=127.0.0.1 corepack pnpm --filter @pridicta/web dev`
- Browser URL:
  `http://127.0.0.1:3024/dashboard/admin`
- Test owner key:
  `phase-4-token`

## Gate Coverage

`corepack pnpm test:email-phase-4` checks:

- Phase 4 roadmap contract
- admin page owner guard remains present
- inbox renders before older owner tools
- API routes require support inbox admin auth
- token gate returns `404`, `401`, and `403` correctly
- correct token can list inbox data
- support thread repository can list/update inbox tickets
- status/priority/assignment controls have backing operations
- private notes remain `internal_only` and `deliveryEligible: false`
- delivery events are present for display
- production does not seed preview tickets
- component has search/filter/detail/context/private-note/delivery UI
- component does not use `dangerouslySetInnerHTML`
- responsive CSS contains desktop, tablet, and mobile layout contracts

## Explicit Non-Scope

Not implemented in Phase 4:

- admin reply composer
- email template picker
- template rendering management UI
- send and mark waiting/resolved/escalated actions
- private note creation
- durable production support-ticket adapter
- live deployed owner-console smoke
- final email privacy/security audit
