# PREDICTA_PRE_LIVE_PHASE_15 Developer Runbook

Phase: `PREDICTA_PRE_LIVE_PHASE_15_AUDIT_NOISE_DETERMINISM_AND_DEVELOPER_RUNBOOK`

## Purpose

Use this runbook when preparing a local launch audit. The goal is simple: make
future red signals real red signals, not stale-server noise, dirty-artifact
noise, or harmless Metro color warnings.

## Required Starting State

Start from the repository root:

```bash
cd /Users/bmehta/Downloads/Predicta
git status --short
```

The output must be empty before public launch gates. If it is not empty, commit,
stash, or park the changes before running the launch audit.

## Production-Like Web Server

The launch audit server is always:

```text
http://127.0.0.1:3009
```

Do not use `localhost:3000` for launch audit gates. Port `3000` is treated as a
development server and may contain stale chunks, dev-only redirects, or a
different build state.

Start the production-like server:

```bash
corepack pnpm build:web
PORT=3009 corepack pnpm --filter @pridicta/web exec next start
```

In another terminal, verify the server:

```bash
PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:audit-server-preflight
```

## Public Launch Audit Sequence

Run these from a clean working tree:

```bash
PREDICTA_GREENLIGHT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:public-greenlight
corepack pnpm test:specialist-room-qa
corepack pnpm test:mobile
corepack pnpm test:pdf-golden
PREDICTA_PHASE14_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:pre-live-phase-14
corepack pnpm test:pre-live-phase-15
git diff --check
git status --short
```

`git status --short` must still be empty after read-only launch QA. If an audit
intentionally regenerates artifacts, it must either write deterministic bytes
that match the committed artifact or be run in a documented artifact phase.

## Visual And Buyer Gates

The public greenlight gate runs these internally, but they can be run directly:

```bash
PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:visual-proof
PREDICTA_BUYER_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:buyer-rejection
```

By default, visual screenshots are written to a temporary directory. Only set
`PREDICTA_VISUAL_OUTPUT_DIR=docs/audits/...` inside a dedicated artifact phase.

## Mobile Bundle Warning Policy

The Android bundle script removes `NO_COLOR` and sets `FORCE_COLOR=0` before
Metro starts:

```bash
corepack pnpm --filter @pridicta/mobile bundle:android
```

This prevents the harmless `NO_COLOR` versus `FORCE_COLOR` warning from looking
like an audit failure. Real Metro, TypeScript, Jest, or native bundling errors
must still fail the audit.

## Cleanup Commands

Stop the `3009` server with `Ctrl-C`.

Clean temporary local outputs if needed:

```bash
rm -rf /tmp/pridicta.android.bundle /tmp/pridicta-assets
find /tmp -maxdepth 1 -type d -name 'predicta-*' -prune -exec rm -rf {} +
git status --short
```

Do not delete committed `docs/audits/**` artifacts unless the active phase
explicitly instructs you to regenerate and recommit them.

## Dirty Audit Escape Hatch

`test:public-greenlight` refuses to run with a dirty working tree. The only
allowed exception is a deliberate local investigation:

```bash
PREDICTA_ALLOW_DIRTY_LAUNCH_AUDIT=1 PREDICTA_GREENLIGHT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:public-greenlight
```

Do not use that escape hatch for a green pre-live or launch decision.
