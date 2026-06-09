# Phase 3 Evidence Contract Audit

Phase:
`PREDICTA_EVENT_ORACLE_PHASE_3_MULTI_SCHOOL_EVIDENCE_CONTRACT_AND_CONFLICT_SCHEMA`

Verdict: GREEN after strict gate verification.

## What Changed

- Added `packages/astrology/src/eventOracleEvidenceContract.ts`.
- Exported the contract through `packages/astrology/src/index.ts`.
- Added `scripts/run-event-oracle-phase-3-gate.mjs`.
- Added `test:event-oracle-phase-3` to `package.json`.

## Contract Rules Locked

- Predicta compares evidence without silently mixing methods.
- Every layer carries a source label and method boundary.
- Required layers are derived from the Phase 2 question refinement.
- Signature evidence is optional and can only come from confirmed visible traits.
- Life Atlas is synthesis context only after source evidence exists.
- Missing evidence is flagged and never filled by AI invention.
- Conflicting evidence lowers confidence or marks the contract conflicted.
- `not_enough_evidence` is an explicit state, not a vague low-confidence answer.

## Evidence Layers

- `vedic`: dasha, antardasha, pratyantardasha, transit, house lords, D1, Moon,
  D9, D10, Chalit, yogas, Dosh, Shrap, Yog, and Lal Kitab context.
- `kp`: relevant houses, cusps, star lord, sub lord, significators, ruling
  planets, promise/block, and timing readiness.
- `jaimini`: karakas, Arudha, Karakamsha, Upapada, Chara Dasha, and rashi
  drishti.
- `kundliKarma`: Dosh, Shrap, Yog, Lal Kitab pressure/support, and non-fearful
  remedy context.
- `numerology`: personal year/month/day, name rhythm, and secondary timing
  color.
- `signature`: confirmed visible traits only, optional, never invented.
- `lifeAtlas`: synthesis context only, optional, never source proof replacement.

## Strict Audit Cases

- Supportive foreign-work evidence must produce agreement above conflict.
- KP-blocking evidence must create conflict pressure and downgrade confidence.
- Fully missing required evidence must return `not_enough_evidence`.
- Relationship evidence without a signature must remain answerable when other
  required layers exist, while still flagging signature as optional.

## No-Go Rules

- Do not let AI synthesize missing chart proof.
- Do not treat Life Atlas as source evidence.
- Do not require Signature for event prediction.
- Do not hide school conflicts behind polished copy.
- Do not produce Phase 4 timing/prediction objects until this contract is ready.
