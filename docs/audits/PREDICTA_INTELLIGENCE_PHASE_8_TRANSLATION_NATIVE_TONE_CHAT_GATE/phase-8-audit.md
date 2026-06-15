# PREDICTA_INTELLIGENCE_PHASE_8_TRANSLATION_NATIVE_TONE_CHAT_GATE

## Verdict

Green after strict runtime transcript audit.

## What Changed

- Added dedicated Predicta chat labels and native-tone phrases to `packages/config/src/translations/predictaUx.json`.
- Exposed typed `getPredictaChatLabel` and `getPredictaChatPhrase` helpers from `packages/config/src/predictaUx.ts`.
- Rebuilt native chat branches for major answer modes so Hindi/Gujarati replies do not become native openings with English bodies:
  - Multi-school consultation
  - Decision timing
  - KP Predicta
  - Jaimini Predicta
  - Numerology Predicta gate coverage
  - Signature Predicta
  - Kundli Karma
  - Mahadasha
- Added the strict runtime gate `scripts/run-predicta-intelligence-phase-8-native-tone-gate.mjs`.
- Registered `corepack pnpm test:predicta-intelligence-phase-8`.

## Strict Findings Fixed

- Signature native replies leaked English model summaries such as `Writing rhythm`.
- KP Gujarati replies leaked English technical labels such as `cusp`, `sub-lord`, `significator`, and `ruling planets`.
- Kundli Karma native replies leaked English condition/remedy fragments such as `in house`.
- Native microcopy leaked `profile`, `generic chart`, `limit`, and `Paid action`.
- Mahadasha English lacked the direct-answer frame expected from the Phase 7 satisfaction contract.

## Scope Notes

- Canonical method names remain allowed where they are product terms: `Predicta`, `KP`, `Jaimini`, `Kundli Karma`, `Numerology`, `Life Atlas`, `Dosh`, `Shrap`, `Yog`, and `Lal Kitab`.
- Native replies now use translated labels and translated high-level summaries rather than translating every technical evidence fragment inline. Deep technical tables remain report/specialist evidence surfaces.

## Green Criteria Evidence

- Translation trust gates pass.
- Native-script chat gate passes.
- New Phase 8 transcript gate passes with English, Hindi, and Gujarati transcripts.
- Specialist-room QA passes after the native Signature phrase compatibility fix.
