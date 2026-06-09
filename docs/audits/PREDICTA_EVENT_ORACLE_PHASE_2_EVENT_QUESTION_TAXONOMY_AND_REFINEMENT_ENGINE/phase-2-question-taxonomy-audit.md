# PREDICTA_EVENT_ORACLE_PHASE_2_EVENT_QUESTION_TAXONOMY_AND_REFINEMENT_ENGINE

Status: GREEN after implementation and strict audit.

## Scope

Phase 2 gives primary Predicta a deterministic event-question intake layer so
users do not need to know whether their question belongs to Vedic, KP, Jaimini,
Numerology, Signature, or Kundli Karma.

This phase does not calculate the final prediction. Phase 3 owns multi-school
evidence; Phase 4 owns timing, trigger, and confidence.

## Implementation Summary

- Added `packages/astrology/src/eventOracleQuestions.ts`.
- Added a complete typed category taxonomy:
  - career move
  - promotion
  - job change
  - foreign travel
  - relocation
  - visa / PR
  - marriage timing
  - relationship outcome
  - money/property
  - business growth
  - education/study stream
  - court/litigation
  - family/child/matching
  - wellness caution
  - guide me
- Added deterministic keyword category detection.
- Added deterministic vague-question refinement with:
  - original question preservation
  - one clarifying question
  - suggested sharper phrasing
  - under-three-interaction plan
  - no AI-credit spend for deterministic matching
- Added downstream structured data:
  - category id
  - evidence rooms
  - medical disclaimer flag for wellness
  - free/paid entitlement copy
  - refinement readiness
- Added `packages/config/src/translations/eventOracle.json` and
  `packages/config/src/eventOracle.ts` for dedicated localized Event Oracle UI
  copy.
- Added a Phase 2 leakage guard so Hindi/Gujarati event-composer values do not
  fall back to obvious English phrases such as `event question`, `AI credits`,
  `Career move`, or `Foreign travel`.
- Added `apps/web/components/WebEventQuestionComposer.tsx` above the primary
  Predicta chat page.
- Added responsive CSS for chips, custom input, and refined question card.

## Strict Audit Findings

| Requirement | Result |
|---|---|
| Complete event category taxonomy exists | PASS |
| Pre-populated question chips exist | PASS |
| Custom question input exists | PASS |
| `I have no specific question, guide me` exists | PASS |
| Vague questions ask one clarifying question | PASS |
| Original user intent is preserved | PASS |
| Deterministic category matching does not spend AI credits | PASS |
| Downstream evidence engines receive structured question data | PASS |
| Free/paid entitlement behavior is clear | PASS |
| English, Hindi, Gujarati composer copy exists in dedicated JSON | PASS |
| Hindi/Gujarati composer values avoid obvious English leakage | PASS |
| Wellness question carries medical-disclaimer flag | PASS |

## Phase 2 Verdict

GREEN.

Predicta can now help the user reach a clear event question before prediction
work begins. This is intentionally action-first, not schooling-first.
