# Predicta Intelligence Phase 0 Local-Memory Vs AI Decision Ledger

Phase keyword: `PREDICTA_INTELLIGENCE_PHASE_0_CURRENT_CHAT_REDLINE_AND_PERSONA_LOCK`
Status: `LOCKED`
Date: 2026-06-15

## Current Source Of Truth

- `apps/web/app/api/ask-pridicta/route.ts` is the server-side gate for provider
  AI chat calls.
- `packages/astrology/src/predictaChatActions.ts` contains deterministic and
  local-memory action decisions.
- `packages/config/src/predictaMemory.ts` contains the broader local-memory-first
  product doctrine.
- `apps/web/lib/pridicta-ai.ts` keeps birth extraction rules-only by default.

## Decision Matrix

| User Intent | Decision | AI Credit? | Notes |
|---|---|---:|---|
| Greeting | `deterministic_action` | No | Should be warm, short, and suggest useful next action. |
| Create Kundli from birth details | `deterministic_action` | No | Rules-first extraction and chart generation. |
| Missing Kundli | `missing_data_question` | No | Ask only for minimum birth details. |
| Saved Kundli action | `deterministic_action` | No | Switch/edit/delete should use app state. |
| Chart snapshot | `deterministic_action` | No | Use calculated chart context. |
| Mahadasha summary | `deterministic_action` | No | Use deterministic dasha engine unless long synthesis requested. |
| Gochar/Sade Sati/Panchang | `deterministic_action` | No | Use deterministic current modules. |
| Kundli Karma Dosh/Shrap/Yog/Lal Kitab | `local_memory_answer` | No | Must not expose local-memory machinery as repeated user copy. |
| KP missing event question | `missing_data_question` plus helpful options | No | Offer prefilled questions and general readiness path. |
| KP precise event answer | `ai_required` only if deterministic evidence needs synthesis | Maybe | Must start with verdict. |
| Jaimini soul direction | `deterministic_action` when calculated evidence exists; AI only for nuanced synthesis | Maybe | No Nadi manuscript framing. |
| Numerology core profile/current cycle | `deterministic_action` | No | Use number engine. |
| Signature missing sample | `missing_data_question` | No | Do not infer traits. |
| Signature confirmed traits summary | `deterministic_action` | No | AI only for nuanced premium synthesis. |
| Report lane explanation | `local_memory_answer` | No | Use report lane memory. |
| Generated report section meaning | `local_memory_answer` or `deterministic_action` | No | AI only for deeper conversational synthesis. |
| Open-ended life/career/marriage future synthesis | `ai_required` | Yes | Enforced by server entitlement. |
| Exhausted credits open-ended synthesis | `blocked_needs_credit` | No provider call | Preserve question and offer deterministic actions. |

## No-Go Conditions

- Do not call OpenAI/Gemini for rules-based Kundli creation.
- Do not call OpenAI/Gemini for app navigation/help.
- Do not call OpenAI/Gemini for deterministic module summaries.
- Do not call OpenAI/Gemini just to explain a report lane.
- Do not call OpenAI/Gemini after exhausted free credits for blocked synthesis.
- Do not fake local answers when the requested synthesis truly needs AI.

## Known Gap

The app has multiple partial routers: web chat, mobile chat, backend prompt, and
shared `predictaChatActions`. Phase 2 must consolidate the intent decision into
a clearer shared router contract and add proof that provider logs stay silent on
deterministic paths.

