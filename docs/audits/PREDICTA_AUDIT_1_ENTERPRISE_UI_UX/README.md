# Predicta Audit 1 Enterprise UI/UX Evidence

This folder is the durable evidence bundle for
`PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md`.

## Canonical Audit Server

The canonical production-like local audit target is:

```text
http://127.0.0.1:3009
```

Audit scripts must not silently switch to `localhost:3000`, a random Next dev
server, or an in-app browser tab URL. If another port is inspected, it must be
recorded as observed evidence, not treated as the canonical target.

## Phase 0 Locked Evidence

Phase 0 records the current server ambiguity and makes browser audit scripts
fail fast when a route is not a healthy Predicta page.

Artifacts:

- `audit-server-contract.json`: canonical URL, disallowed URLs, and observed
  broken URL.
- `route-list.json`: routes that Audit 1 must cover.
- `phase-0-evidence-lock/phase-0-evidence-manifest.json`: exact commands,
  environment, exit statuses, and log paths.
- `phase-0-evidence-lock/logs/`: raw stdout/stderr for audit commands.
- `phase-0-evidence-lock/screenshots/`: visual proof output location when the
  visual gate reaches screenshot capture.

## Strict Rule

Browser audits must prove all of the following before measuring layout:

- route HTTP status is healthy
- visible content is recognizable as Predicta
- route-specific content is present
- no client-side error marker is visible
- expected Next/static styling assets are present

If any of those fail, the script must stop immediately instead of reporting
layout, overflow, or buyer-quality metrics for an invalid page.
