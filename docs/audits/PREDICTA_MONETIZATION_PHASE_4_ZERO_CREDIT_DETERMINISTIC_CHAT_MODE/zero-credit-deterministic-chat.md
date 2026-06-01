# PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE

## Verdict

Phase 4 splits chat behavior into deterministic actions, AI provider answers,
and blocked purchase paths. Exhausted free users can still use calculation-engine
chat actions without spending AI credits.

## Deterministic action path

Web and mobile now route these actions before provider calls:

- Kundli creation from chat
- saved/open/switch Kundli commands
- chart snapshot and chart cards
- Mahadasha
- Gochar/transit
- Panchang
- remedies
- report brief
- saved Kundlis
- Family map / Family Vault style guidance
- app navigation/help actions

These actions use the deterministic Predicta calculation/action layer instead of
OpenAI or Gemini.

## AI provider path

Open-ended personalized synthesis still uses the provider path. When a free
user has exhausted the three lifetime starter AI questions, the Phase 3 server
ledger gate returns a deterministic preserved-question upsell response before
calling OpenAI/Gemini.

## Blocked purchase path

Blocked AI answers return:

- `provider: deterministic`
- preserved question text
- purchase options
- zero-credit deterministic action copy

This keeps the chat alive while making it clear that deeper AI synthesis needs a
question pack or Premium.

## Birth extraction rule

Birth-detail extraction is now rules-first.

Web `/api/extract-birth-details`:

- returns rules-only by default
- supports `rulesOnly`
- supports `allowProviderFallback`
- calls provider fallback only when explicitly allowed and rules are incomplete

Mobile `extractBirthDetailsFromText`:

- runs `extractWithRules(input)` first
- calls backend extraction only when `allowProviderFallback === true` and rules
  are incomplete

This prevents Kundli creation from chat from consuming AI by default.

## User-facing label

Deterministic module replies are labeled:

```text
Calculation-engine reply:
```

The label is intentionally short. It tells the user this response did not spend
an AI credit without making the chat feel like an internal system document.

## Telemetry

Web records a local non-blocking marker:

```text
predicta.zeroCreditDeterministicEvents.v1
predicta:zero-credit-deterministic-action
```

Mobile records:

```text
zero_credit_deterministic_action
```

The telemetry is non-blocking and must never interrupt chat.

## Strict audit evidence

Required command:

```bash
corepack pnpm test:monetization-phase-4
```

The gate verifies:

- web/mobile birth extraction is rules-first
- provider fallback is explicit and not default
- web deterministic branches run before `askWithProof`
- mobile deterministic branches run before `askPredicta`
- deterministic replies are labeled as calculation-engine replies
- web and mobile zero-credit telemetry hooks exist
- blocked purchase path remains deterministic
- provider credit spend remains OpenAI/Gemini-only

## Follow-up boundaries

Phase 5 owns saved Kundli count entitlement. Phase 6 owns paid question/report
product-bank spend. Phase 8 owns deeper AI cost governance and abuse protection.
