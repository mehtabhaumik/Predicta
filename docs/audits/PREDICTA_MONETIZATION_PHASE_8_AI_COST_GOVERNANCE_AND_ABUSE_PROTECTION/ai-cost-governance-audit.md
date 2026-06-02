# PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION

## Verdict

Phase 8 is green only if Predicta's AI spend path is bounded by code, not trust.

## Cost Governance Lock

- Free AI uses OpenAI mini only.
- Free chat output is capped to the strict free token budget.
- Free chat history is trimmed aggressively.
- Free user traffic cannot invoke Gemini validator.
- If OpenAI is unavailable for free chat, Predicta falls back to deterministic guidance instead of Gemini.
- Premium deep chat can use the premium OpenAI model only when the request is premium and deep.
- Gemini Pro validator is reserved for paid premium report QA.
- Batch QA can use Gemini Flash only as a non-real-time governance job with explicit budget thresholds.
- Feature spend thresholds include alert and stop levels for free chat, paid questions, premium report drafts, premium validators, and batch QA.
- Web AI proxy includes IP/device/free-path throttles as abuse protection only; Firebase UID entitlement remains the quota authority.
- Telemetry records provider, model, feature, user plan, entitlement source, product credit source, token usage, estimated cost, cache state, and cache hit.

## Audit Evidence

- Shared TypeScript governance: `packages/config/src/aiCostGovernance.ts`.
- Backend governance: `backend/astro_api/ai_cost_governance.py`.
- Web proxy throttle and entitlement metadata: `apps/web/app/api/ask-pridicta/route.ts`.
- Shared/mobile model selection guards: `packages/ai/src/aiRouter.ts`, `apps/mobile/src/services/ai/aiRouter.ts`.
- Shared/mobile token trimming: `packages/ai/src/tokenOptimizer.ts`, `apps/mobile/src/services/ai/tokenOptimizer.ts`.
- Python routing fail-closed validator policy: `backend/astro_api/ai_routing_policy.py`.
- Python validator deterministic fallback for non-premium calls: `backend/astro_api/ai_validator.py`.
- Premium report and batch QA spend checks: `backend/astro_api/report_ai_pipeline.py`, `backend/astro_api/ai_batch_qa.py`.

## Strict Gate

Run:

```bash
corepack pnpm test:monetization-phase-8
```

The gate must prove:

- Free path cannot use the premium model.
- Free path cannot invoke Gemini validator.
- Premium report validation is Gemini Pro eligible only when premium/paid.
- Spend threshold simulation blocks unsafe provider usage.
- Web abuse throttles exist and are not the quota authority.
- Release governance AI checks remain green.
