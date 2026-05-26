# Predicta AI Model Orchestration Ultra Strict Phases

This document defines the strict implementation path for Predicta's AI provider
strategy, model priority, cost controls, Gemini validator usage, provider
telemetry, and release governance.

It exists because Predicta already has the correct backbone: deterministic
astrology first, OpenAI primary, Gemini fallback. The next upgrade is not to add
more random AI. The next upgrade is to make model usage deliberate, profitable,
auditable, and safer.

## Relationship To Existing Phase Files

This document must not rename, collapse, or override existing phase files.

- `PREDICTA_REPORT_PDF_STRICT_PHASES.md` remains the controlling report/PDF
  artifact, page rendering, visual system, watermark, footer, parity, and golden
  artifact contract.
- `PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md` remains the
  controlling Kundli value, chart purity, prediction language, and Vedic report
  coverage contract.
- `PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md` remains the controlling chart
  insight hierarchy contract.
- `PREDICTA_KP_NADI_PREDICTA_STRICT_PHASE.md` remains the controlling KP/Nadi
  specialist room and report contract.
- `PREDICTA_NUMEROLOGY_PREDICTA_STRICT_PHASE.md` remains the controlling
  Numerology specialist room and report contract.
- `PREDICTA_SIGNATURE_PREDICTA_ULTRA_STRICT_PHASE.md` remains the controlling
  Signature privacy, trait confirmation, and report contract.
- `PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md` remains the only approved
  all-school synthesis report contract.
- `PREDICTA_REPORT_PDF_PHASE_7_PREDICTA_MEMORY_AND_CHAT_AWARENESS` remains the
  app-wide Predicta memory architecture owner. This AI orchestration work must
  feed that memory and context system; it must not create a parallel Predicta.
- `backend/astro_api/release_governance.py` remains the model-pin and release
  readiness owner until a later approved phase replaces it.

## Current Baseline

Repo baseline before this phase set:

- OpenAI is the primary chat and writing path in `backend/astro_api/ai.py`.
- Free/simple routing uses `gpt-5.4-mini`.
- Premium/deep routing uses `gpt-5.5`.
- Gemini Flash and Gemini Pro are configured.
- Gemini is currently used mainly as backend fallback when OpenAI fails or is
  not configured.
- Claude is not materially integrated and is not part of the approved operating
  strategy.
- Provider/model values are returned in chat responses.
- Predicta does not yet have strong app-wide cost telemetry, token telemetry,
  model-budget enforcement, Gemini validator workflows, or batch QA workflows.

## Approved Model Priority

The approved priority is:

1. Deterministic Predicta astrology engine.
2. OpenAI `gpt-5.4-mini`.
3. OpenAI `gpt-5.5`.
4. Gemini Flash.
5. Gemini Pro.

### Role Map

| Layer | Approved Role |
|---|---|
| Deterministic Predicta astrology engine | All calculations, charts, dashas, KP, Nadi, Numerology, Signature contracts, report data, and evidence. |
| OpenAI `gpt-5.4-mini` | Free chat, quick explanations, structured JSON, birth extraction, lightweight report copy, low-cost polishing. |
| OpenAI `gpt-5.5` | Premium chat, Premium report writing, Life Atlas synthesis, final paid-report polish, difficult user-facing reasoning. |
| Gemini Flash | Cheap fallback, batch QA, translation audit, redundancy checks, report section validation, lightweight contradiction scan. |
| Gemini Pro | Premium report contradiction scan, long PDF/report audit, deep QA only. |

## Non-Negotiable Rules

1. AI must not calculate astrology. Astrology calculations come from the
   deterministic Predicta engine only.
2. AI may explain, synthesize, polish, validate, translate, classify, and audit
   deterministic data.
3. Do not introduce Claude or Anthropic runtime dependencies unless a future
   approved business phase explicitly justifies the cost and operational
   overhead.
4. Do not route ordinary free-user chat to premium models.
5. Do not route free-user reports through multi-model premium pipelines.
6. Do not let Gemini replace OpenAI as the primary Predicta voice without a
   separate approved quality and tone audit.
7. Gemini must become a validator and QA worker, not a second uncontrolled
   astrologer.
8. Gemini fallback must remain available for provider resilience.
9. Every provider call must record provider, model, feature, user plan, intent,
   fallback reason, cache state, and token/cost estimate where available.
10. Provider telemetry must not store raw birth data, raw signature images,
    private chat text, or unnecessary personally identifiable data.
11. Cost telemetry must use privacy-preserving IDs or hashes.
12. Premium paid workflows may use multi-model pipelines only when the added
    quality is auditable.
13. Free workflows must prefer deterministic data, caching, short outputs, and
    low-cost model paths.
14. A model change is not green until release governance and tests confirm the
    approved pins or the pin update is explicitly reviewed.
15. No model may overrule safety boundaries, school boundaries, or the active
    Predicta room contract.
16. Vedic, KP, Nadi, Numerology, Signature, and Life Atlas outputs must remain
    method-safe.
17. Report QA must check for missing sections, duplicated remedies, mixed
    methods, language mismatch, unsupported claims, scary phrasing, and generic
    filler.
18. Translation QA must check that English does not contain accidental Hindi or
    Gujarati unless the product copy intentionally allows a Sanskrit/Jyotish
    term.
19. Signature image analysis must not send raw signature images to any provider
    unless a future approved privacy phase adds explicit consent,
    no-retention/no-storage wording, and audit evidence.
20. All Gemini batch/validator outputs are advisory. The deterministic report
    contract and OpenAI finalizer own the final user-facing wording.
21. Prompt caching and structured outputs must be used where they materially
    improve reliability, cost, or auditability.
22. Every phase below requires strict audit before it is called green.

## Approved Premium Pipeline

For premium and high-value paid workflows:

```text
Deterministic calculations
-> OpenAI drafts user-facing reading
-> Gemini validates missing sections, contradictions, repetition, overclaiming
-> OpenAI finalizes polished user-facing version
-> deterministic release/audit gates verify artifacts
```

This pipeline is approved for:

- Premium Vedic reports.
- Premium KP reports.
- Premium Nadi reports.
- Premium Numerology reports.
- Premium Signature reports using confirmed traits only.
- Predicta Life Atlas.
- Golden artifact audits.
- High-risk language or translation QA.

## Approved Free Pipeline

For free workflows:

```text
Deterministic calculations
-> OpenAI mini concise insight
-> cache when safe
-> deterministic fallback when provider is unavailable
```

Free workflows may use Gemini Flash only for:

- provider fallback
- low-cost QA jobs that are not on the user request path
- release audit batches
- translation sweeps

## Approved Phase Order

1. `PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT`
2. `PREDICTA_AI_MODEL_PHASE_1_TELEMETRY_AND_BUDGET_LEDGER`
3. `PREDICTA_AI_MODEL_PHASE_2_ROUTER_POLICY_AND_MODEL_PRIORITY_LOCK`
4. `PREDICTA_AI_MODEL_PHASE_3_GEMINI_VALIDATOR_LAYER`
5. `PREDICTA_AI_MODEL_PHASE_4_REPORT_QA_AND_MULTI_MODEL_PREMIUM_PIPELINE`
6. `PREDICTA_AI_MODEL_PHASE_5_BATCH_AUDITS_TRANSLATION_AND_GOLDEN_REPORT_QA`
7. `PREDICTA_AI_MODEL_PHASE_6_PROMPT_CACHING_STRUCTURED_OUTPUTS_AND_CONTEXT_EFFICIENCY`
8. `PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT`

### Goal

Create a strict baseline audit of every AI provider path before changing runtime
behavior.

### Must Audit

- OpenAI chat path.
- OpenAI birth extraction path.
- OpenAI moderation/safety path.
- Gemini fallback path.
- deterministic fallback path.
- web API proxy path.
- mobile backend path.
- environment variables and approved model pins.
- provider/model fields in shared types.
- response cache behavior.
- current free, premium, day-pass, and guest access limits.
- all tests that monkeypatch provider behavior.

### Required Artifacts

- `docs/audits/PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT/provider-path-map.md`
- `docs/audits/PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT/model-pin-baseline.json`
- `docs/audits/PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT/cost-risk-ledger.md`
- `docs/audits/PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT/verification.txt`

### Green Criteria

- Every current provider path is mapped.
- Every configured model pin is listed.
- Gemini is explicitly classified as fallback-only before this phase set.
- Claude/Anthropic absence is confirmed.
- Current cost telemetry gaps are documented.
- No runtime behavior changes are made in this phase.

## Phase 1: `PREDICTA_AI_MODEL_PHASE_1_TELEMETRY_AND_BUDGET_LEDGER`

### Goal

Add privacy-preserving telemetry so Predicta can see what each feature costs and
which model/provider served it.

### Required Implementation

- Add a shared AI telemetry event model.
- Record:
  - event ID
  - timestamp
  - provider
  - model
  - feature
  - active Predicta school
  - report type when relevant
  - user plan
  - intent
  - cache state
  - fallback reason
  - request success/failure
  - latency bucket
  - estimated input tokens
  - estimated output tokens
  - provider-reported token usage where available
  - estimated cost where pricing config exists
- Add privacy-preserving subject hash fields only where needed.
- Add a local development telemetry store.
- Add admin-safe telemetry summary loading.
- Do not store raw prompts, raw chat messages, raw birth details, or raw
  signature images in telemetry.

### Required Tests

- telemetry records OpenAI success.
- telemetry records Gemini fallback.
- telemetry records deterministic fallback.
- telemetry redacts raw user content.
- telemetry includes feature, plan, model, provider, cache state, and fallback
  reason.

### Green Criteria

- Tests pass.
- A local audit artifact shows at least one OpenAI, Gemini fallback, and
  deterministic fallback telemetry example using fake provider calls.
- Telemetry can support profit analysis without exposing private user content.

## Phase 2: `PREDICTA_AI_MODEL_PHASE_2_ROUTER_POLICY_AND_MODEL_PRIORITY_LOCK`

### Goal

Make model routing explicit, centralized, testable, and aligned with the
approved model priority.

### Required Implementation

- Add an AI routing policy module owned by the backend.
- Route by:
  - feature
  - user plan
  - active school
  - intent
  - report type
  - latency sensitivity
  - quality tier
  - provider availability
  - safety risk
- Keep OpenAI primary.
- Keep Gemini fallback.
- Reserve Gemini validator calls for validator phases.
- Reserve Gemini Pro for premium/deep QA only.
- Add explicit cost guardrails for free, guest, day-pass, and premium paths.
- Add a no-Claude assertion to release governance unless explicitly approved.

### Required Tests

- free/simple chat routes to OpenAI mini.
- premium/deep chat routes to OpenAI premium.
- free report generation does not invoke multi-model premium pipeline.
- premium report generation is eligible for validator pipeline.
- Gemini Flash is selected for non-premium fallback.
- Gemini Pro is selected only for premium/deep validator or fallback.
- Claude/Anthropic provider names fail the approved-provider gate.

### Green Criteria

- Routing rules are centralized.
- Existing web and mobile paths use the backend policy.
- No client bundle contains provider keys or final prompt orchestration.
- Release governance blocks unapproved provider/model drift.

## Phase 3: `PREDICTA_AI_MODEL_PHASE_3_GEMINI_VALIDATOR_LAYER`

### Goal

Convert Gemini from fallback-only into an explicit validator/QA worker without
letting it become an uncontrolled second astrologer.

### Required Implementation

- Add a Gemini validation function separate from user-facing generation.
- Validator input must use deterministic report/chat context, not raw private
  user text unless necessary and privacy-reviewed.
- Validator output must be structured JSON.
- Validator must check:
  - missing required sections
  - contradictions
  - duplicated remedies
  - method mixing
  - unsupported predictions
  - fatalistic or scary language
  - language mismatch
  - excessive technical jargon
  - weak/generic insight
  - premium/free depth mismatch
- Validator must return:
  - pass/fail
  - severity
  - issue list
  - suggested fix categories
  - confidence
  - model/provider metadata

### Required Tests

- catches missing report section.
- catches duplicated remedies.
- catches KP/Vedic method mixing.
- catches Hindi/Gujarati text in English-only output.
- catches hard guarantee language.
- returns structured JSON only.
- does not call validator on ordinary free chat.

### Green Criteria

- Gemini validator is callable in tests with mocked provider response.
- Validator failures do not automatically publish user-facing content.
- Validator output is treated as advisory and auditable.

## Phase 4: `PREDICTA_AI_MODEL_PHASE_4_REPORT_QA_AND_MULTI_MODEL_PREMIUM_PIPELINE`

### Goal

Wire the approved premium pipeline into paid report generation without adding
cost to ordinary free reports.

### Required Implementation

- Add premium report orchestration:
  - deterministic report data
  - OpenAI draft
  - Gemini validator
  - OpenAI finalizer if validator finds fixable issues
  - deterministic artifact gate
- Apply to:
  - Premium Vedic report
  - Premium KP report
  - Premium Nadi report
  - Premium Numerology report
  - Premium Signature report using confirmed traits only
  - Life Atlas
- Free reports must not run the full multi-model pipeline.
- If Gemini validator is unavailable, premium report generation must either:
  - continue with an explicit `validatorUnavailable` audit flag, or
  - block if the report type is configured as validator-required.
- The choice must be configurable by report type.

### Required Tests

- premium report calls OpenAI draft, Gemini validator, and OpenAI finalizer.
- free report does not call Gemini validator.
- validator failure triggers finalizer with issue summary.
- validator pass skips unnecessary finalizer where safe.
- missing Gemini key follows configured behavior.
- report artifact records validator metadata without exposing private prompts.

### Required Artifacts

- generated premium report fixture with validator pass.
- generated premium report fixture with validator-found issue and finalizer fix.
- generated free report fixture proving no premium validator path.

### Green Criteria

- Premium pipeline improves quality without becoming mandatory for free reports.
- Cost telemetry captures each provider call in the pipeline.
- Golden artifact gates still pass.

## Phase 5: `PREDICTA_AI_MODEL_PHASE_5_BATCH_AUDITS_TRANSLATION_AND_GOLDEN_REPORT_QA`

### Goal

Use Gemini Flash/Batch-style workflows for non-real-time QA where cost savings
matter.

### Required Implementation

- Add async/batch-ready QA job definitions for:
  - translation sweeps
  - report redundancy scans
  - golden PDF text audits
  - method-boundary checks
  - missing-section checks
  - overclaim/safety scans
- Batch jobs must not block user-facing downloads unless explicitly configured.
- Batch output must write audit artifacts.
- Batch jobs must support mocked provider mode for CI.
- If actual Gemini Batch API is not implemented in this phase, the code must be
  structured so the synchronous local runner can be swapped for Batch without
  changing audit schemas.

### Required Tests

- translation QA flags mixed-language defects.
- golden report QA flags duplicated remedy sections.
- method-boundary QA flags KP/Vedic mixing.
- mocked batch output writes deterministic audit JSON.

### Green Criteria

- Non-real-time QA becomes cheaper and repeatable.
- The workflow is auditable without exposing raw private user data.
- The release team can run QA locally before deploy.

## Phase 6: `PREDICTA_AI_MODEL_PHASE_6_PROMPT_CACHING_STRUCTURED_OUTPUTS_AND_CONTEXT_EFFICIENCY`

### Goal

Reduce cost and improve reliability by tightening prompt structure, context
shape, and structured outputs.

### Required Implementation

- Keep stable system and room-contract content before dynamic user context.
- Add prompt-cache keys where supported and useful.
- Track cached token usage where provider returns it.
- Use structured output schemas for:
  - birth extraction
  - validator reports
  - report QA summaries
  - translation QA summaries
  - routing decisions where model-assisted classification is ever used
- Compact Predicta memory context before model calls.
- Remove duplicated large context fields where deterministic IDs or summaries
  are enough.
- Keep app memory rich for Predicta, but do not send the entire app universe to
  every cheap/free turn.

### Required Tests

- structured output parsing rejects malformed JSON.
- prompt construction keeps static content before dynamic content.
- compact context still includes active school, Kundli ID/hash, selected report,
  selected chart/section, and memory digest.
- free chat prompt remains under the approved budget.
- premium report prompt remains under the approved budget or fails with a clear
  audit reason.

### Green Criteria

- Cost is reduced without dumbing down Predicta.
- Predicta remains context-aware.
- Provider calls become easier to audit and retry.

## Phase 7: `PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE`

### Goal

Make AI model usage release-safe, margin-aware, and impossible to silently
degrade.

### Required Implementation

- Extend release governance to include:
  - approved providers
  - approved model pins
  - prompt version
  - validator availability policy
  - telemetry availability
  - cost budget thresholds
  - free/premium routing assertions
  - no-Claude assertion
  - signature privacy assertion
  - method-boundary assertion
  - translation QA assertion
- Add profit-safety report output:
  - estimated average free chat cost
  - estimated average premium chat cost
  - estimated average premium report cost
  - Gemini validator cost
  - fallback rate
  - cache hit rate
  - deterministic fallback rate
  - top cost-risk features
- Release gate must fail if:
  - unapproved model/provider is active
  - telemetry is disabled for provider calls
  - free path routes to premium model without explicit entitlement
  - Gemini validator is required but unavailable
  - raw signature image is sent to provider without approved privacy phase
  - model outputs fail safety or language QA thresholds

### Required Tests

- release governance passes with approved OpenAI + Gemini pins.
- release governance fails on Claude/Anthropic provider.
- release governance fails on unapproved premium model pin.
- release governance fails when free route uses premium model.
- release governance fails when required validator is unavailable.
- release governance emits profit-safety summary.

### Green Criteria

- Model usage is profitable by design, not hope.
- Quality gates are repeatable.
- No phase is called green from code review alone.
- Release governance can prove the OpenAI + Gemini strategy is active,
  bounded, and safe.

## Execution Guidance

Run this phase set after the current user-facing report and specialist-room
surfaces are stable enough to produce artifacts, and before any expensive
premium-report scaling work.

Recommended immediate order:

1. Phase 0 baseline audit.
2. Phase 1 telemetry.
3. Phase 2 router policy.
4. Phase 3 Gemini validator.
5. Phase 4 premium report pipeline.
6. Phase 5 batch QA.
7. Phase 6 context/caching optimization.
8. Phase 7 release governance.

Every completed phase must produce audit artifacts and be committed before the
next phase is called green.

