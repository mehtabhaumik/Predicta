# Predicta Public Release-Stop Contract

## Purpose

This contract exists to stop false readiness.

Predicta must not be described internally or externally as public-ready,
launch-ready, or ready for paid promotion unless the conditions below are met.

## Release-Stop Rule

Public release is blocked if any of the following are true:

1. Any `Critical` blocker in
   [PREDICTA_PUBLIC_BLOCKER_LEDGER.md](./PREDICTA_PUBLIC_BLOCKER_LEDGER.md) is
   open.
2. Any `Major` blocker in
   [PREDICTA_PUBLIC_BLOCKER_LEDGER.md](./PREDICTA_PUBLIC_BLOCKER_LEDGER.md) is
   open.
3. Any phase in
   [PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md](./PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md)
   before Phase 8 is incomplete.
4. The final QA gate in Phase 8 has not passed.
5. `python3 -m backend.astro_api.release_governance` does not return `READY`.

## Launch Claim Rule

The following claims are prohibited while the release-stop rule is active:

- public launch ready
- production ready for promotion
- ready for paid traffic
- ready for family onboarding
- ready for large-scale invite distribution
- ready for press or partner rollout

## Scope Of The Gate

This contract blocks:

- public promotion
- paid acquisition
- broad invite distribution
- family-data onboarding pushes
- PR/launch messaging
- investor/demo readiness claims that imply public product maturity

This contract does not block:

- isolated internal testing
- phase-by-phase implementation
- QA accounts and seeded audit flows
- private technical review

## Required Evidence Before Releasing The Stop

All of the following must exist and be current:

1. The roadmap in
   [PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md](./PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md)
   with all phases complete.
2. The blocker ledger in
   [PREDICTA_PUBLIC_BLOCKER_LEDGER.md](./PREDICTA_PUBLIC_BLOCKER_LEDGER.md)
   showing no open `Critical` or `Major` blockers.
3. Release governance in [../PREDICTA_RELEASE_GOVERNANCE.md](../PREDICTA_RELEASE_GOVERNANCE.md)
   confirming the technical and safety gate is `READY`.
4. Live smoke evidence across desktop, tablet, and mobile for the route matrix
   defined in Phase 8.

## Escalation Rule

If a new trust, localization, method-credibility, or runtime fragility issue is
found during any later phase:

1. reopen the relevant blocker or add a new blocker
2. map it to the correct existing phase
3. stop any launch-readiness claim again until it is closed

Do not hide new blockers under “follow-up polish.”

## Ownership Rule

Every public blocker must have:

- a code-area owner
- an exact route or route family
- a close condition
- a mapped execution phase

If any blocker lacks those fields, the release-stop contract remains active.

## Phase 0 Completion Rule

Phase 0 is complete only when:

- the roadmap exists
- the blocker ledger exists
- this contract exists
- release governance references the public-readiness gate
- docs index points to these artifacts

## Final Public-Ready Rule

Predicta may be called public-ready only when all of the following are true:

- no open `Critical` blockers
- no open `Major` blockers
- the ordered revival phases are complete
- final route/device QA is complete
- safety readiness is `READY`
- the product no longer feels like a dashboard shell, a half-translated app, a
  fake astrology tool, or a brittle chat wrapper
