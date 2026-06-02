# PREDICTA_REPORT_FINAL_PHASE_1_REPORT_VOICE_AND_PREDICTION_CONTRACT

Verdict: GREEN for report voice contract implementation.

This phase does not rebuild every report lane. It adds the shared voice
contract that future lane rebuilds must use and applies it to the current PDF
section enrichment path so user-facing report body and bullet copy is
prediction-first instead of schooling-first.

## What Changed

- Added `packages/pdf/src/reportVoiceContract.ts`.
- Added the locked report voice rhythm:
  `technical evidence -> plain prediction -> timing/current relevance -> what
  helps -> what blocks -> what to do next -> confidence/caution`.
- Added rewrite protection for toolkit, schooling, internal system-document,
  and evidence-first phrases.
- Applied the voice contract inside `enrichSection()` before localization and
  rendering.
- Rewrote the high-risk chart detail line from `evidence anchor` to `life area
  affected`.
- Rewrote Jaimini and Life Atlas source-map copy away from “technical evidence
  first” phrasing.

## Locked User-Facing Rule

Technical details are still preserved, but they must not be the report’s main
promise. The user-facing order is:

1. Say what Predicta is predicting.
2. Say why now.
3. Say what helps.
4. Say what blocks.
5. Say what the user should do next.
6. Put proof/details in evidence rows, proof sections, or appendices.

## Banned Primary Report Voice

- “How to read this report” as the main report body.
- “Toolkit” language.
- “Technical classroom” language.
- “Structured decision memo” language.
- “Meaningful insight” without a concrete prediction.
- “Chart-backed notes” without a concrete prediction.
- “Evidence anchor” as a rendered user-facing phrase.
- “Before showing the technical evidence” in report headlines.
- “What this chart governs” as the main value promise.

## Phase 1 Limit

This phase creates and applies the shared contract. It does not fully rebuild
Vedic, KP, Jaimini, Numerology, Signature, or Life Atlas content depth. Those are
owned by Phases 4-9.

## Verification

- `corepack pnpm test:report-final-phase-1`
- `corepack pnpm --filter @pridicta/pdf typecheck`
- `corepack pnpm test:pdf-golden`
- `git diff --check`
