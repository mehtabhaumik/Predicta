# PREDICTA_INTELLIGENCE_PHASE_4_MULTI_SCHOOL_CONSULTATION_ENGINE

## Verdict

GREEN after strict audit.

Phase 4 adds a deterministic main-Predicta multi-school consultation layer for
real-life event questions. It does not replace specialist rooms. If the user is
inside KP, Jaimini, Numerology, Signature, or legacy Nadi context, Predicta
keeps the answer room-safe and refuses silent method mixing.

## Implemented Scope

- Added `predictaMultiSchoolConsultation` as the shared deterministic
  consultation engine.
- Main Predicta can consult Vedic, KP, Jaimini, Kundli Karma, Numerology,
  optional Signature evidence, and Life Atlas context before producing an event
  answer.
- Consultation output includes direct answer, timing window, likely trigger,
  confidence, evidence used, conflicts, and next action.
- Confidence rises when multiple schools support the same direction and lowers
  when signals conflict.
- Signature is optional only and is included only when confirmed ready traits
  exist.
- Missing Kundli returns a deterministic no-credit Kundli creation path.
- Specialist room contexts return `room_safe_blocked` instead of silently mixing
  methods.
- Predicta chat action routing now recognizes event questions and sends them to
  main Predicta consultation.
- Explicit school terms keep priority over main consultation, so KP/Jaimini/
  Numerology/Signature handoffs are not stolen by the event detector.
- Legacy Nadi chat now redirects to Jaimini chat because Nadi was replaced.
- Public header exposes the Jaimini lane.

## Audit Findings Fixed During Phase

- Fixed Life Atlas/Kundli Karma partial-data crashes by wrapping deterministic
  layers with safe evidence fallbacks.
- Fixed Signature upload guidance being captured as a generic event question by
  tightening router priority.
- Fixed KP handoff regression where `Will KP sub lord show my job change?`
  was incorrectly routed to multi-school consultation.
- Fixed compiled QA harness resolution for `@pridicta/config/uiTranslations`
  across discipline handoff, native-script chat, numerology foundation,
  numerology room, and signature room gates.
- Updated specialist-room QA to validate the active one-primary-Predicta
  `/ask` redirect contract instead of the retired direct room rendering
  contract.
- Restored explicit web handoff copy: `The method will not be mixed.`

## Not In Scope

- This phase does not generate paid Precision Reading products.
- This phase does not implement human astrologer review.
- This phase does not change report PDFs.
- This phase does not claim guaranteed outcomes.

