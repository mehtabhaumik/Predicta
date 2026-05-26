# PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT Cost Risk Ledger

Audit date: 2026-05-26

This ledger records the current model-cost and telemetry risks before any AI
orchestration implementation begins.

## Executive Finding

Predicta has model/provider metadata in chat responses and safety audit events,
but it does not yet have the cost telemetry needed to manage profit at scale.
The largest current gap is not model choice. The largest gap is observability:
provider calls do not consistently record feature, plan, token usage, estimated
cost, fallback reason, cache state, or latency.

## Current Cost Controls That Exist

- Free users are limited to 3 questions per day, 0 deep calls per day, and 1 PDF
  per month.
- Premium users are limited to 50 questions per day, 10 deep calls per day, and
  5 PDFs per month.
- Day pass users are limited to 10 questions, 3 deep calls, and 1 PDF per pass.
- Guest-pass tiers define total question, deep-reading, and premium PDF limits.
- Mobile has a local response cache for first-turn no-history questions.
- Web chat route trims history and message length before proxying to backend.
- Backend max output tokens differ between free and premium/deep paths.
- Release governance checks approved model pins.

## Current Telemetry Gaps

| Gap | Risk | Severity | Required Follow-Up |
|---|---|---|---|
| No provider token usage is captured from OpenAI/Gemini responses. | Cannot calculate true cost per answer/report. | Critical | Phase 1 telemetry must capture provider usage where available. |
| No estimated cost ledger exists. | Profit margins cannot be managed by feature or plan. | Critical | Phase 1 must add cost estimates by provider/model/feature. |
| No feature label on provider calls. | Cannot distinguish chat, birth extraction, report writing, validator, translation QA, or safety. | Critical | Phase 1 telemetry must require a feature enum. |
| No fallback reason is stored. | Cannot tell whether Gemini is saving outages or hiding OpenAI errors. | High | Phase 1 must log fallback reason. |
| No latency bucket is stored. | Cannot balance cost, speed, and quality. | High | Phase 1 must log latency bucket. |
| Mobile cache hits do not feed server telemetry. | Cache value is invisible in cost analysis. | Medium | Phase 1 or 2 must include cache-state reporting. |
| Web has no equivalent AI response cache. | Repeated simple web questions may create avoidable provider spend. | Medium | Later phase should evaluate safe web/server cache. |
| Safety audit records provider/model but not token/cost. | Safety trace is useful but not enough for margin analysis. | Medium | Phase 1 should keep safety audit separate but link telemetry IDs. |
| Gemini exists only as fallback. | Gemini spend/quality value is underused. | Medium | Phase 3 converts Gemini into validator/QA worker. |
| Premium report multi-model QA is not implemented. | Premium reports may cost less now but miss quality checks that justify pricing. | Medium | Phase 4 implements paid-only pipeline. |
| Prompt caching is not tracked. | Potential OpenAI cost savings are not measured. | Medium | Phase 6 must track cached token usage where returned. |
| Structured output is prompt/parse based in places. | Bad JSON can cause retries or fallback waste. | Medium | Phase 6 must add structured output schemas. |

## Provider-Specific Risk Notes

### OpenAI

OpenAI is correctly primary, but the backend currently extracts only text from
Responses API output. Usage metadata is not persisted into a cost ledger.

Risk: premium and free usage can look identical operationally unless model and
plan metadata are separately inspected.

Required: capture provider usage fields, request feature, plan, model, intent,
cache state, and estimated cost.

### Gemini

Gemini fallback is implemented, but validator and batch-QA use cases are not
active yet.

Risk: Gemini only creates resilience, not the full value of lower-cost
validation, translation QA, redundancy scanning, and long-context report checks.

Required: Phase 3 must add structured validator output and Phase 5 must add
batch-ready QA artifacts.

### Deterministic Engine

Deterministic fallback protects the user experience when providers fail.

Risk: deterministic fallback is not currently cost-problematic, but fallback
rates are not measured as product-health metrics.

Required: record deterministic fallback events with reason and feature.

### Claude/Anthropic

Claude/Anthropic is not integrated at runtime.

Risk: none today. Future risk is unplanned provider sprawl.

Required: Phase 2 and Phase 7 must block unapproved provider drift.

## Profit Risk By Surface

| Surface | Current Risk | Baseline Status |
|---|---|---|
| Free chat | Repeated low-value free turns can still hit OpenAI without server telemetry. | Bounded by question limits, but not cost-audited. |
| Premium chat | Deep model is correctly reserved for premium/deep intent, but no cost ledger exists. | Functionally gated, financially under-observed. |
| Birth extraction | Uses deterministic rules first, then AI extraction. | Good resilience, no cost telemetry. |
| Premium reports | No explicit multi-model premium QA pipeline yet. | Cost lower, quality ceiling lower. |
| Golden/report QA | Mostly deterministic scripts and artifact audits. | Good for repeatability, missing Gemini batch-style QA. |
| Translation QA | No AI batch sweep in this baseline. | Risk remains for mixed-language defects. |
| Signature | Confirmed traits are deterministic; raw signature provider-image path is not approved. | Privacy-safe baseline. |

## Phase 0 Decision

Do not change runtime routing in Phase 0. Proceed to Phase 1 with telemetry and
budget ledger implementation before adding Gemini validator or premium
multi-model report orchestration.

