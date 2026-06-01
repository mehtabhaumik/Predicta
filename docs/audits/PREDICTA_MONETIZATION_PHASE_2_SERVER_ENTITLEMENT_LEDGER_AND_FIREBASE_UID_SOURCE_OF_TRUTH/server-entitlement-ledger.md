# PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH

## Verdict

Phase 2 is implemented as a Firebase UID keyed server entitlement ledger. The
client can read entitlement state for UI cache, but quota authority is now held
in server/Firebase documents instead of browser storage, app storage, or device
state.

## Firebase UID Source Of Truth

The shared ledger schema lives in
`packages/monetization/src/serverEntitlementLedger.ts`.

The canonical ledger document path is:

```text
users/{firebaseUid}/entitlementLedger/current
```

The ledger stores:

- `freeAiCreditsUsed`
- `paidAiQuestionCreditsBalance`
- `reportCreditsByType`
- `savedKundliCount`
- `premiumEntitlement`
- `dayPassEntitlement`
- `familyBank`
- `audit.createdAt`
- `audit.updatedAt`
- `audit.lastOperationId`
- `audit.lastOperationKind`

This means clearing `localStorage`, mobile app state, or device cache cannot
reset the lifetime free AI question counter because the counter is read from the
Firebase UID ledger.

## Atomic Mutations

Web server mutations use Firestore REST `:commit` with write preconditions:

- `entitlementOperations/{operationId}` is created with
  `currentDocument.exists = false`.
- `entitlementLedger/current` is updated with the last observed `updateTime`, or
  created with `exists = false`.
- optimistic conflicts retry up to three times.

Mobile mutations use a Firestore transaction in
`apps/mobile/src/services/firebase/serverEntitlementLedgerSync.ts` and write the
same ledger/operation documents.

## Double-submit protection

Every successful mutation requires an `idempotencyKey`. The sanitized key becomes
the operation document ID:

```text
users/{firebaseUid}/entitlementOperations/{idempotencyKey}
```

If a repeated submit/click reuses the same key, the operation document already
exists and the mutation returns a duplicate result without spending twice.

## Failed AI/provider calls do not consume credits

The ledger has no reserve/pre-spend operation for free or paid AI questions.
Credit operations are explicitly named:

- `record_successful_free_ai_answer`
- `record_successful_paid_ai_answer`

Provider routes must call these only after a successful AI answer is produced.
If OpenAI/Gemini fails before an answer is returned, no ledger mutation is
performed and no credit is consumed.

## Family Bank

The ledger includes a separate `familyBank` object:

- `ownerUid`
- `memberUids`
- `members`
- `sharedQuestionCreditsBalance`
- `sharedReportCreditsByType`

Family Bank credits are separate from personal paid credits and can be consumed
only through explicit family-bank operations.

## Client State Is Cache Only

Web access state now attempts to read `/api/entitlements/ledger` first and maps
the Firebase UID ledger into the existing monetization state shape. Legacy user
document fields remain only as migration fallback when the new ledger endpoint is
unavailable.

The mutation route is not a public client credit-granting endpoint. It requires:

- a verified Firebase ID token, and
- `PREDICTA_ENTITLEMENT_OPERATION_SECRET` through
  `x-predicta-entitlement-operation-secret`.

That prevents a signed-in browser client from granting itself credits.

## Migration Behavior

Phase 2 keeps legacy web access reads as a fallback cache path. The authoritative
path is the server ledger, but this avoids stranding existing signed-in users
while later phases migrate all legacy purchase, Kundli-count, and report-credit
writers into ledger operations.

## Strict Audit Evidence

Required command:

```bash
corepack pnpm test:monetization-phase-2
```

The gate verifies:

- free lifetime AI credits stop at exactly `3`
- clearing local/device state cannot reset the server ledger object
- paid question pack grant and spend behavior
- failed provider calls do not have a pre-spend operation
- report credit grant and spend behavior
- premium entitlement activation
- day pass mapping and activation
- Family Bank shared question/report credit spend
- saved Kundli count sync
- web API uses verified Firebase UID and internal mutation secret
- web Firebase adapter uses idempotent operation docs and Firestore commit
- mobile helper uses Firestore transaction and operation docs
- web client reads server ledger before legacy fallback

## Known Follow-up Phases

Phase 3 wires the `3` lifetime free AI question flow into actual chat/provider
routes with preserved upsell. Phase 4 separates zero-credit deterministic chat
actions from AI provider calls. Phase 5 enforces saved Kundli count limits.
