# PREDICTA_REPORT_FINAL_PHASE_3_FREE_VS_PAID_DEPTH_CONTRACT

Verdict: GREEN for the shared free-vs-paid depth contract.

This phase locks the entitlement-depth rules underneath the final report
rebuild. It does not rewrite every Vedic, KP, Jaimini, Numerology, Signature,
or Life Atlas chapter yet. It guarantees that every report architecture now
carries a lane-aware free and paid depth contract before the lane rewrites
begin.

## Depth Lock

Every report architecture now carries:

1. Free depth promise
2. Paid depth promise
3. Active depth promise for the selected PDF mode
4. Prediction minimum
5. Evidence minimum
6. Timing/current relevance minimum
7. Action minimum
8. Proof/appendix minimum
9. Banned depth failures

## Free Contract

Free reports must be valuable, not hollow previews. Free gives a specific
user-facing prediction, the key evidence needed to trust it, timing/current
relevance when supported, at least one practical next step, and short proof
after the prediction.

## Paid Contract

Paid reports must add depth, not filler. Paid gives full diagnosis, supporting
and conflicting evidence, timing windows or current-cycle depth where available,
contradiction handling, practical guidance, and deeper proof in appendix/proof
pages.

## Lane-Specific Depth Lock

| Lane | Depth Promise |
| --- | --- |
| Vedic | Chart-backed prediction, timing, contradiction handling, and one consolidated action plan. |
| KP | Answer clarity, event proof, timing readiness, and decision guidance. |
| Jaimini | Destiny role, soul direction, public image, relationship mirror, and active chapter guidance. |
| Numerology | Number identity, name rhythm, current cycle, pattern tension, and usable alignment guidance. |
| Signature | Confirmed visible traits, confidence labels, self-expression guidance, and safe reflection. |
| Life Atlas | Emotional specificity, life arc, hidden thread, current chapter, and practical integration. |

## Banned Depth Failures

- Free report as hollow teaser.
- Paid report as page-count padding.
- Technical evidence without plain prediction.
- More tables without stronger guidance.
- Repeated remedies or repeated boundaries.
- Schooling the user instead of answering the user.

## Explicit Non-Goals

- This phase does not finish the lane-specific content rewrites.
- This phase does not change monetization entitlements or pricing.
- This phase does not create or restore a Nadi final-report lane.
- This phase does not replace PDF layout, chart rendering, watermark, or footer
  rules.

## Verification

- `corepack pnpm test:report-final-phase-3`
- `corepack pnpm --filter @pridicta/pdf typecheck`
- `corepack pnpm test:pdf-golden`
- `git diff --check`
