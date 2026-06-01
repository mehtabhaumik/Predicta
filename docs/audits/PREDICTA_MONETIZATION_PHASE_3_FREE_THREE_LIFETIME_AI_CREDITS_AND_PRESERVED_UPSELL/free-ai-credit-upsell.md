# PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL

## Verdict

Phase 3 implements the signed-in free user's `3` lifetime Predicta AI question
rule against the server entitlement ledger. The old local/daily free AI budget
is no longer the authority for web or mobile chat.

## Server-backed free AI rule

The free starter balance comes from:

```text
users/{firebaseUid}/entitlementLedger/current.freeAiCreditsUsed
```

The total free lifetime allowance is:

```text
FREE_AI_QUESTION_LIFETIME_LIMIT = 3
```

Clearing browser storage, app storage, or cached Zustand state cannot reset this
counter because web and mobile read the Firebase UID ledger.

## Provider-call boundary

Web `/api/ask-pridicta` now checks the ledger before calling the backend
provider route. If the user's free starter credits are exhausted, it returns a
deterministic preserved-question upsell response and does not call
OpenAI/Gemini.

Mobile `askPridicta` reads the same Firebase UID ledger before calling the
backend. If credits are exhausted, mobile returns the same deterministic upsell
response locally and does not call the provider endpoint.

## Successful-answer consumption only

Free AI credit is consumed only by:

```text
record_successful_free_ai_answer
```

That operation is called only after a successful response with provider:

- `openai`
- `gemini`

Cached answers, deterministic responses, blocked upsell responses, failed
provider calls, and unreachable backend calls do not spend free starter credits.

## Preserved fourth question

When the fourth free AI question is attempted, the response includes:

- `freeAiUpsell.blocked = true`
- `freeAiUpsell.preservedQuestion`
- `freeAiUpsell.purchaseOptions`
- `freeAiCreditsRemaining = 0`
- `freeAiCreditsTotal = 3`

Purchase options are:

- `10 questions`
- `25 questions`
- `100 questions`
- `Premium`

The user sees the exact question they tried to ask and receives clear purchase
or deterministic action CTAs.

## Web visibility

Web chat shows the server-backed starter AI balance in the chat surface.

Web account/settings shows the same balance in the overview grid:

```text
Starter AI: {remaining} / {total}
```

## Mobile visibility

Mobile chat shows a compact starter AI balance strip.

Mobile settings shows the same balance in the account card.

## Deterministic actions stay available

The blocked upsell response explicitly keeps deterministic actions available:

- Kundli creation
- charts
- reports
- Family Vault

Phase 4 will further split deterministic chat routing from provider routing, but
Phase 3 no longer blocks the user through the old local daily free AI budget.

## Strict audit evidence

Required command:

```bash
corepack pnpm test:monetization-phase-3
```

The gate verifies:

- shared/mobile response contracts include preserved-question metadata
- web route blocks before provider fetch
- web route records credit only after provider fetch
- web route spends only on OpenAI/Gemini responses
- web chat no longer calls `consumeWebAiBudget`
- web chat/account display server-ledger free AI balance
- mobile service blocks before backend request
- mobile service records credit only after provider response
- mobile chat no longer uses local `canAskQuestion` or `recordQuestion`
- mobile chat/settings display server-ledger free AI balance
- fourth-question upsell purchase options are present

## Follow-up boundaries

Phase 4 owns the deeper zero-credit deterministic chat router. Phase 5 owns the
four-saved-Kundli entitlement limit. Phase 6 owns paid question/report product
bank consumption.
