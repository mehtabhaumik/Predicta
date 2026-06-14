# Predicta Intelligence Phase 0 App-Action Capability Map

Phase keyword: `PREDICTA_INTELLIGENCE_PHASE_0_CURRENT_CHAT_REDLINE_AND_PERSONA_LOCK`
Status: `LOCKED`
Date: 2026-06-15

## Existing Strong Capabilities

| Capability | Current Evidence | Status |
|---|---|---|
| Rules-first birth extraction on web | `apps/web/lib/pridicta-ai.ts` posts `rulesOnly: true` unless provider fallback is explicit. | Strong |
| Server-side AI entitlement gate | `apps/web/app/api/ask-pridicta/route.ts` requires Firebase user and evaluates ledger before upstream AI. | Strong |
| Zero-credit deterministic chat actions | `packages/astrology/src/predictaChatActions.ts` has provider decisions for deterministic/local memory actions. | Strong |
| Kundli Karma local answers | `kundli-karma` maps to `local_memory_answer`. | Strong |
| Web chat memory persistence | `WebPridictaChat.tsx` stores active context, messages, birth memory, and Predicta memory. | Strong |
| App memory digest | `packages/config/src/predictaMemory.ts` contains product structure, report lanes, local-memory-first rules, and school boundaries. | Strong |
| Mobile deterministic action priority | Mobile chat deterministic paths exist before provider answer path. | Strong |

## Weak Or Fragmented Capabilities

| Capability | Issue | Required Follow-Up |
|---|---|---|
| Master response shape | Backend prompt has many rules, but response order is not enforced as a reusable contract. | Phase 1 |
| Broken-record suppression | No central phrase ledger/test gate exists yet. | Phase 1 and Phase 6 |
| App function mastery | Some app actions can be staged, but user-facing text still sends users to screens in places. | Phase 3 |
| Multi-school consultation | Event Oracle evidence contracts exist, but main chat needs a clear `consulted rooms` behavior. | Phase 4 |
| Local-memory router | Deterministic actions exist, but intent classification is not yet a visible shared router contract across all chat paths. | Phase 2 |
| Native-language consistency | Many good translation files exist, but mobile still has direct fallback strings and mixed-script risk. | Phase 8 |
| Report section mastery | Memory exists, but answer style can still explain report architecture before meaning. | Phase 7 and report alignment |
| Micro-messaging | Current micro-messages are partially generic or repeated. | Phase 5 |

## Must Be Supported Without AI

- App navigation/help.
- Kundli creation from rules-based birth details.
- Missing birth-detail clarification.
- Saved Kundli list/switch/delete/edit prompts where state supports it.
- Chart snapshot and selected-chart handoff.
- Mahadasha, Gochar, Sade Sati, Panchang, and daily briefing summaries where
  deterministic data exists.
- Kundli Karma Dosh, Shrap, Yog, and Lal Kitab summaries.
- Report lane explanation and generated report context explanation.
- Family Vault eligibility and 2-to-4 comparison rule.
- Pass/credit/account explanation.
- Signature missing-sample explanation.

## Must Use AI Only When Needed

- Open-ended personalized synthesis beyond deterministic modules.
- Long-form premium report writing or Life Atlas narrative.
- Vague custom event question refinement when deterministic options are not
  enough.
- Contradiction resolution across schools.
- Premium editorial polish.
- Conversational follow-up that cannot be answered from local/generated context.

## Phase 1-3 Implementation Locks

- Phase 1 locks response behavior.
- Phase 2 locks the shared local-memory/deterministic router.
- Phase 3 makes Predicta perform app actions cleanly instead of explaining the
  app.

