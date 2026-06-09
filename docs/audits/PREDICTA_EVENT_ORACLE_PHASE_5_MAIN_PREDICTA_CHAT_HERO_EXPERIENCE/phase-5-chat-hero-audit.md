# Phase 5 Main Predicta Chat Hero Audit

Phase:
`PREDICTA_EVENT_ORACLE_PHASE_5_MAIN_PREDICTA_CHAT_HERO_EXPERIENCE`

Verdict: GREEN after strict static and browser verification.

## What Changed

- Upgraded `apps/web/components/WebEventQuestionComposer.tsx` into the main
  Predicta chat hero.
- Added active Kundli context through `useWebKundliLibrary`.
- Added quiet pass/free-credit status through existing pass guardrail helpers.
- Added recent prediction threads using local browser state.
- Added zero-credit deterministic help copy.
- Added Phase 4 prediction-card rhythm: direct answer, timing/trigger,
  confidence/action, collapsed evidence.
- Added dedicated Event Oracle translations for English, Hindi, and Gujarati.
- Added responsive CSS for desktop, tablet, and mobile.

## UX Rules Locked

- The first visible chat area must be action-led.
- Predicta is the main character, not a side widget.
- User does not need to choose Vedic/KP/Jaimini first.
- Active Kundli context is visible without crowding.
- Credit/pass status is visible but not loud.
- Zero-credit deterministic help remains visible.
- The prediction card shows answer first and proof last.
- Mobile stacks cleanly with no CTA crowding or text leakage.

## Strict Audit Notes

- No long explanatory sentence is used as a CTA label.
- Hero copy lives in `eventOracle.json`.
- Hindi/Gujarati copy is native-script copy, not English mixed into native UI.
- The prediction card is a preview/readiness rhythm until real source evidence
  is supplied by later phases; it must not fake a real prediction.

## No-Go Rules

- Do not hide the active Kundli context.
- Do not make credits the hero.
- Do not move evidence/proof above the direct answer.
- Do not create overflow-prone four-column mobile cards.
- Do not hardcode translations in the component.
