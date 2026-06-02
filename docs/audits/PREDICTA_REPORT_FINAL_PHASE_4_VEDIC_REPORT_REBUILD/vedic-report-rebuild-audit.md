# PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD

Verdict: GREEN for the Vedic report value rebuild foundation.

This phase rebuilds the Vedic report lane around user value: prediction first,
evidence second, timing third, and one consolidated action plan. It does not
finish KP, Jaimini, Numerology, Signature, or Life Atlas rewrites.

## What Changed

- Added `packages/pdf/src/vedicReportValueContract.ts`.
- Added a Vedic Kundli prediction opening section immediately after birth and
  calculation context.
- Locked the Vedic report order as:
  birth snapshot, Kundli prediction opening, core chart prediction,
  planet/house evidence, Mahadasha Phala, classical tables, premium vargas,
  timing/life areas, consolidated remedies, appendix/proof.
- Reworded high-risk Vedic section bodies so prediction/meaning appears before
  method explanation.
- Kept technical evidence through proof rows and evidence tables instead of
  removing it.

## Required Vedic Coverage

The source contract now requires:

- Birth Snapshot
- Core Charts: D1, Moon, D9, D10, Chalit
- Panchang
- Avakhada Chakra
- Ghatak and Favorable Factors
- House-wise Planet Table
- Benefics and Malefics
- Mahadasha Phala
- Friendship Table
- Chalit Table
- Samsa
- Swamsa
- Karakamsha
- Ashtakavarga
- Prastarashtakavarga
- Yogas
- Consolidated Remedy Action Plan

## Free vs Paid

Free Vedic must give useful chart-backed prediction, focus chart summaries, key
timing, essential tables, and a practical next step.

Premium Vedic must add full diagnosis, contradiction handling, varga depth,
Mahadasha windows, classical-table proof, timing relevance, and practical
guidance. Premium must not add empty pages or repeated definitions.

## Banned Vedic Failures

- Vedic report as chart glossary.
- Meaning column that only defines the area.
- Mahadasha scattered outside its own section.
- Repeated remedies in multiple places.
- Premium pages that add length without sharper prediction.
- Classical tables without user-facing implication.

## Boundary Lock

Vedic remains Parashari/Vedic. KP, Jaimini, Numerology, Signature, and Life
Atlas remain separate lanes. The Vedic report may preserve technical Jyotish
evidence, but it must not turn into a mixed-school synthesis report.

## Verification

- `corepack pnpm test:report-final-phase-4`
- `corepack pnpm --filter @pridicta/pdf typecheck`
- `corepack pnpm test:pdf-golden`
- `git diff --check`
