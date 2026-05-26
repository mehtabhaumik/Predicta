# Phase 2 Audit Server Runbook

Phase: `PREDICTA_PRE_LIVE_PHASE_2_AUDIT_SERVER_AND_PUBLIC_GREENLIGHT_HARNESS`

## Production-Like Local Server

Use this for public greenlight, buyer, visual, animation, and final launch
audit gates:

```bash
corepack pnpm build:web
PORT=3009 corepack pnpm --filter @pridicta/web exec next start
corepack pnpm test:audit-server-preflight
corepack pnpm test:public-greenlight
```

## Port Rule

The default audit server is:

```text
http://127.0.0.1:3009
```

Do not use `localhost:3000` for launch audit runs. The preflight refuses port
`3000` by default because that is normally the dev server and can hide stale
chunks, dev-only redirects, or mismatched build state.

For a deliberate dev-server-only investigation, set:

```bash
PREDICTA_ALLOW_NEXT_DEV_AUDIT=1
```

## Route Matrix

The preflight verifies:

- `/`
- `/dashboard`
- `/dashboard/report`
- `/dashboard/signature`
- `/dashboard/kp`
- `/dashboard/nadi`
- `/dashboard/numerology`
- `/dashboard/settings`
- `/dashboard/family`
- `/dashboard/account`

`/dashboard/account` currently redirects to `/dashboard/settings` as the
account/settings surface.

## Static Asset Check

The preflight samples root `_next/static` CSS and JS assets and fails if any
return non-2xx responses.

