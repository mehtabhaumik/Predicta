# PREDICTA_AI_MODEL_PHASE_0_BASELINE_PROVIDER_AND_COST_AUDIT Provider Path Map

Audit date: 2026-05-26

Phase status: green after strict audit.

This audit maps the current AI provider paths before any runtime model
orchestration changes. No runtime behavior was changed in this phase.

## Baseline Summary

Predicta currently uses a deterministic-first astrology architecture with
OpenAI as the primary user-facing AI provider and Gemini as a backend fallback.

- OpenAI is the primary chat and writing path.
- Gemini is configured and implemented, but currently acts as fallback-only when
  OpenAI is unavailable, unconfigured, or returns an empty reading.
- Deterministic astrology, safety, and chart logic remain the source of truth.
- Claude/Anthropic is absent from runtime code and dependency paths.

## Provider Paths

| Path | Entry Point | Provider Use | Baseline Classification |
|---|---|---|---|
| Web Predicta chat | `apps/web/app/api/ask-pridicta/route.ts` | Proxies to backend `/ask-pridicta` after trimming history and message length. | Web proxy path, no provider key in browser bundle. |
| Web birth extraction | `apps/web/app/api/extract-birth-details/route.ts` | Runs deterministic rules first, then proxies to backend `/extract-birth-details` and merges AI result when available. | Web proxy plus deterministic resilience. |
| Mobile Predicta chat | `apps/mobile/src/services/ai/pridictaService.ts` | Uses backend `/ask-pridicta`; computes model for cache key but backend owns provider call. | Mobile backend path, no provider key in client bundle. |
| Backend Predicta chat | `backend/astro_api/ai.py::ask_pridicta` | Runs safety, selects OpenAI model, builds context, calls `create_ai_text_response`, records safety audit metadata. | Primary AI reading path. |
| Backend OpenAI generation | `backend/astro_api/ai.py::create_openai_text_response` | Calls OpenAI Responses API at `/v1/responses`. | Primary provider path. |
| Backend Gemini fallback | `backend/astro_api/ai.py::create_ai_text_response` -> `create_gemini_text_response` | Calls Gemini `generateContent` only after OpenAI failure or empty output. | Fallback-only before this phase set. |
| Backend birth extraction | `backend/astro_api/ai.py::extract_birth_details` | Runs rules first, then calls `create_ai_text_response` with the free OpenAI model and parses JSON. | OpenAI primary, Gemini fallback through shared provider wrapper. |
| Backend safety moderation | `backend/astro_api/safety.py::moderate_text_with_openai` | Calls OpenAI moderation when an OpenAI key exists; returns `None` without a key. | OpenAI-only optional moderation path. |
| Deterministic blocked safety | `backend/astro_api/ai.py::ask_pridicta` | Returns `predicta-safety-protocol-v1` without provider generation when input is blocked. | Deterministic safety path. |
| Deterministic chart fallback | `backend/astro_api/ai.py::build_deterministic_chart_reply` | Used when providers are unavailable, provider output is empty, or output safety rewrite is needed. | Deterministic fallback path. |
| Release governance | `backend/astro_api/release_governance.py::evaluate_model_pins` | Checks approved model and prompt pins. | Release readiness guardrail. |

## OpenAI Chat Path

Source evidence:

- `backend/astro_api/ai.py` defines `OPENAI_RESPONSES_URL`.
- `ask_pridicta` selects the OpenAI model through `select_openai_model`.
- `create_openai_text_response` sends `system` and `user` input to OpenAI
  Responses API with `reasoning.effort`.
- `create_ai_text_response` returns provider `openai` and the active model when
  OpenAI returns non-empty text.

Baseline behavior:

```text
request
-> safety assessment
-> OpenAI moderation attempt
-> intent detection
-> OpenAI model selection
-> deterministic Kundli/Jyotish context
-> OpenAI Responses API
-> response provider/model metadata
```

## OpenAI Birth Extraction Path

Source evidence:

- Web route `apps/web/app/api/extract-birth-details/route.ts` runs deterministic
  extraction first and then proxies upstream.
- Backend `extract_birth_details` also runs deterministic rules first.
- Backend AI extraction calls `create_ai_text_response` with
  `FREE_REASONING_MODEL`.
- Parsed AI JSON is merged with deterministic output.

Baseline behavior:

```text
birth text
-> deterministic extraction
-> OpenAI primary AI extraction
-> Gemini fallback only if OpenAI fails
-> JSON validation
-> deterministic/AI merge
```

## OpenAI Moderation And Safety Path

Source evidence:

- `backend/astro_api/safety.py::moderate_text_with_openai` uses
  `omni-moderation-latest`.
- If no OpenAI key exists, moderation returns `None`.
- `ask_pridicta` merges deterministic safety assessment and moderation result.
- Blocked input returns deterministic safety text and does not call the
  generation provider.

Baseline behavior:

```text
user message
-> deterministic safety assessment
-> optional OpenAI moderation
-> blocked requests return deterministic safety protocol
-> allowed requests continue to provider generation
```

## Gemini Fallback Path

Source evidence:

- `GEMINI_GENERATE_URL` exists in `backend/astro_api/ai.py`.
- `create_ai_text_response` tries OpenAI first.
- Gemini is selected through `select_gemini_model` only after OpenAI
  configuration/provider failure or empty output.
- `GEMINI_FLASH_MODEL` is selected for non-premium fallback.
- `GEMINI_PRO_MODEL` is selected for premium deep fallback.

Baseline classification: Gemini is fallback-only before this phase set. It is
not yet a deliberate validator, batch QA worker, translation auditor, or premium
report contradiction scanner.

## Deterministic Fallback Path

Deterministic fallback is active in these cases:

- blocked safety response
- provider configuration failure
- provider error
- empty provider output
- unsafe output categories requiring rewrite
- specialist room deterministic handoff
- deterministic KP/Nadi/Numerology/Signature fallback replies

The deterministic engine is also the source of Kundli data, chart data,
Jyotish analysis, KP/Nadi context, Numerology context, Signature confirmed
traits, and report evidence.

## Web API Proxy Path

Source evidence:

- `apps/web/app/api/ask-pridicta/route.ts` reads JSON, trims history to 8
  messages, trims message text to 4000 characters, then proxies to backend.
- `apps/web/lib/astro-api.ts` reads `PRIDICTA_WEB_ASTRO_API_URL`,
  `PRIDICTA_ASTRO_API_URL`, or `http://127.0.0.1:8000`.
- Provider keys and final prompt orchestration are not in browser bundles.

## Mobile Backend Path

Source evidence:

- `apps/mobile/src/services/ai/pridictaService.ts` calls
  `${env.astrologyApiUrl}/ask-pridicta`.
- Mobile computes model for response-cache key using the shared local router,
  but backend remains the provider boundary.
- Mobile sends a safety identifier and app language.

## Provider And Model Type Fields

Current shared response provider unions:

- Backend `PridictaChatResponse.provider`:
  `openai | gemini | deterministic`
- Shared/mobile `PridictaChatResponse.provider`:
  `openai | gemini | cache | deterministic`
- Response includes `model`, `intent`, `usedDeepModel`, and optional
  `jyotishAnalysis`.

## Response Cache Behavior

Current cache behavior is mobile-only:

- Cache key includes active Kundli ID, calculation input hash, chart context,
  intent, language, selected model, normalized question, and local user ID.
- Cache is used only when there are no prior user turns in history.
- Cached responses return provider `cache` and `usedDeepModel: false`.
- Cached response payload includes text, model, intent, and created time.
- No server-side provider-cost telemetry is connected to cache hits yet.

## Usage Limits Baseline

Current free and premium app usage limits:

| Plan | Questions | Deep Calls | PDFs |
|---|---:|---:|---:|
| Free | 3 per day | 0 per day | 1 per month |
| Premium | 50 per day | 10 per day | 5 per month |
| Day pass | 10 per pass | 3 per pass | 1 per pass |

Current guest access limits:

| Pass Type | Questions | Deep Readings | Premium PDFs | Duration |
|---|---:|---:|---:|---:|
| Guest trial | 25 | 5 | 1 | 7 days |
| VIP review | 150 | 30 | 5 | 30 days |
| Investor pass | 300 | 60 | 10 | 90 days |
| Family pass | 2000 | 300 | 50 | 365 days |
| Internal test | 5000 | 1000 | 100 | 365 days |

## Provider-Mocked Tests Baseline

Current tests already monkeypatch provider behavior in:

- `backend/tests/test_astro_api.py`
- `backend/tests/test_safety_red_team_evals.py`

Covered patterns include:

- fake OpenAI success
- fake OpenAI provider/config errors
- fake Gemini fallback
- fake moderation
- fake shared `create_ai_text_response` failure
- deterministic fallback assertions
- provider/model response assertions

## Claude/Anthropic Absence

Runtime search found no Anthropic/Claude provider integration in backend, apps,
packages, or scripts. Current Claude/Anthropic mentions are limited to the new
AI orchestration planning document and docs index entry.

## Phase 0 Conclusion

Phase 0 confirms the current baseline:

- deterministic astrology remains source of truth
- OpenAI is primary
- Gemini is fallback-only
- Claude/Anthropic is absent from runtime
- provider/model fields exist
- current cost telemetry is insufficient for profit optimization
- no runtime behavior changed in this phase

