# Phase 0 Command Baseline

Phase: `PREDICTA_PRE_LIVE_PHASE_0_RUTHLESS_AUDIT_EVIDENCE_LOCK`

Date: 2026-05-26

This file records the command results from the ruthless pre-live audit that
caused the no-go verdict. Phase 0 did not rerun every heavy gate because its
job is to freeze the baseline and remediation order.

## Failed Or Blocked Commands From The Ruthless Audit

| Command | Recorded Result | Owner Phase |
|---|---|---|
| `python3 -m backend.astro_api.release_governance` | `BLOCKED`; `PRIDICTA_AI_PRICING_JSON` missing and cost/profit metrics were null. | Phase 1 |
| `corepack pnpm test:public-greenlight` | Failed at mobile/tablet visual proof; `/dashboard/report` overflow at 390px. | Phase 5 |
| `corepack pnpm test` | Failed in mobile Jest because `react-native-fs` Flow syntax was parsed through mobile PDF generation imports. | Phase 3 |
| `corepack pnpm test:specialist-room-qa` | Failed because `test:discipline-handoff` could not resolve `@pridicta/config` from temp compiled artifact. | Phase 4 |
| `corepack pnpm test:animation-regression` | Failed the protected interactive Kundli chart structure contract. | Phase 6 |
| `corepack pnpm test:buyer-rejection` | Failed due missing `printReport()` and report mobile overflow. | Phase 5 |

## Runtime Findings From The Ruthless Audit

| Surface | Recorded Result | Owner Phase |
|---|---|---|
| `localhost:3000` | Showed stale/broken browser state including `ChunkLoadError`, redirect problems, or route mismatch. | Phase 2 |
| `localhost:3009` | Clean production-like server worked better, but audit target expectations need hardening. | Phase 2 |
| Web Signature | Empty/weak input guard improved earlier, but trait detection still used fixed mode-based traits. | Phase 8 |
| Mobile Signature | No real upload/draw capture parity. | Phase 8 |
| Web checkout | Handoff flow only, not payment workflow. | Phase 7 |
| Mobile paywall | Production billing can throw when billing is not wired. | Phase 7 |

## Passing Evidence From The Ruthless Audit

| Command | Recorded Result |
|---|---|
| `python3 -m pytest backend/tests/test_astro_api.py -q` | Passed. |
| `python3 -m pytest backend/tests/test_safety_red_team_evals.py -q` | Passed. |
| `corepack pnpm build:web` | Passed. |
| `corepack pnpm --filter @pridicta/web typecheck` | Passed. |
| `corepack pnpm --filter @pridicta/pdf typecheck` | Passed. |
| `corepack pnpm test:pdf-golden` | Passed. |
| `corepack pnpm --filter @pridicta/mobile bundle:android` | Passed. |
| `git diff --check` | Passed. |

## Phase 0 Verification Commands

Phase 0 itself must verify:

```bash
rg -n "PREDICTA_PRE_LIVE_RUTHLESS|superseded|NO-GO|pre-live" docs
git diff --check
git status --short
```

