# PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT

## Verdict

Phase 5 adds one shared Kundli library entitlement contract for web and mobile.
Free signed-in users can save four Kundlis. The fifth new Kundli is blocked
with the birth draft still present. Premium users can continue beyond four,
with a quiet daily soft-limit guardrail for abnormal generation volume.

## Shared Contract

The shared policy lives in:

```text
packages/monetization/src/kundliLibraryEntitlement.ts
```

It defines:

- Free saved Kundli limit: `4`.
- Premium daily soft limit: `30` newly generated Kundlis/day.
- Updates and existing Kundli saves are allowed before creation limits apply.
- Unsigned users are still blocked from multiple saved Kundlis.
- Signed-in free users are blocked at the fifth new save.
- Premium users receive `unlimited` saved Kundli allowance unless soft-limit
  abuse protection is reached.

## Web Enforcement

Web storage now gates at `saveWebKundli()` and `canCreateAdditionalWebKundli()`
instead of relying on UI-only checks.

Covered web paths:

- Kundli wizard creation.
- Predicta chat Kundli creation.
- Chat save-as-new/edit confirmation.
- Birth-time detective recalculation as an update.
- Existing saved Kundli activation/opening.

Web also hydrates a premium entitlement snapshot after sign-in and ledger load so
premium users are not treated as free once their server ledger is available.

## Mobile Enforcement

Mobile storage now gates inside:

```text
apps/mobile/src/services/kundli/kundliRepository.ts
```

Covered mobile paths:

- Kundli screen creation.
- Chat Kundli creation.
- Chat edit/save-as-new confirmation.
- Birth-time detective recalculation as an update.
- KP/Jaimini school readiness recalculation saves.

The mobile Kundli screen routes free-limit users to Paywall, not Login.

## User Experience

The fifth free Kundli attempt must not erase entered birth data. It shows a
clear upgrade path:

```text
You have saved 4 Kundlis on the free plan. Your details are still here.
Upgrade to save another Kundli.
```

Existing saved Kundlis still open normally. Updates to the active Kundli keep the
same Kundli identity and do not count as a new profile.

## Strict Audit Evidence

Required command:

```bash
corepack pnpm test:monetization-phase-5
```

The gate verifies shared contract constants, web and mobile storage enforcement,
premium snapshot hydration, fifth-Kundli copy, update identity preservation, and
the audit manifest.
