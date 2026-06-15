# Predicta Intelligence Phase 2 Local Memory And Deterministic Router Audit

Phase keyword: `PREDICTA_INTELLIGENCE_PHASE_2_LOCAL_MEMORY_AND_DETERMINISTIC_ROUTER`
Status: `GREEN`
Date: 2026-06-15

## Verdict

GREEN after shared router implementation, runtime classification fixtures,
web/mobile source-order proof, compatibility gates, and typechecks.

## What Changed

- Added `PredictaRouterDecision` and `PredictaRouterDecisionReason`.
- Added `classifyPredictaRouterDecision()` as the shared router classifier inside
  `packages/astrology/src/predictaChatActions.ts`.
- Updated `buildPredictaActionReply()` to use the shared router decision instead
  of hand-rolling local decision branches.
- Added `shouldCallProvider` as an explicit boolean so tests and future web/mobile
  code can prove whether a provider call is allowed.
- Added reasons:
  - `empty_input`
  - `open_ended_ai_required`
  - `open_ended_blocked_needs_credit`
  - `missing_kundli`
  - `local_memory_available`
  - `deterministic_action_available`
- Added `scripts/run-predicta-intelligence-phase-2-router-gate.mjs`.
- Added `test:predicta-intelligence-phase-2`.

## Router Contract

| Intent | Decision | Provider Call |
|---|---|---|
| Empty input | `missing_data_question` | No |
| Open-ended synthesis with credits | `ai_required` | Yes |
| Open-ended synthesis after exhausted credits | `blocked_needs_credit` | No |
| Action needing Kundli without Kundli | `missing_data_question` | No |
| Deterministic module with Kundli | `deterministic_action` | No |
| Kundli Karma definition/local memory | `local_memory_answer` | No |
| Pricing, saved Kundlis, handoffs | `deterministic_action` | No |

## Provider-Bypass Proof

- Web chat still checks birth intake, chart snapshot, and
  `buildPredictaActionReply()` before final `askWithProof()`.
- Mobile chat still checks chart intent and `buildPredictaActionReply()` before
  final `askPredicta()`.
- Server route still consumes credits only for provider responses:
  `response.provider === 'openai' || response.provider === 'gemini'`.
- Exhausted-credit open-ended answers return deterministic block/upsell paths
  instead of provider calls.
- Kundli Karma local memory answers do not expose provider internals and still
  show the trust signal that no AI credit is needed.

## Verification

Passed:

```bash
corepack pnpm test:predicta-intelligence-phase-2
corepack pnpm test:predicta-intelligence-phase-1
corepack pnpm test:monetization-phase-4
corepack pnpm test:kundli-karma-phase-10
corepack pnpm test:kundli-karma-phase-11
corepack pnpm test:competitor-response-phase-3
corepack pnpm --filter @pridicta/astrology typecheck
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/mobile exec tsc --noEmit
python3 -m py_compile backend/astro_api/ai.py
git diff --check
```

## Next Phase

`PREDICTA_INTELLIGENCE_PHASE_3_APP_FUNCTION_MASTERY`

