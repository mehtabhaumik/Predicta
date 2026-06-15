# Predicta Intelligence And Chat Experience Roadmap

Status: `NO-GO`
Created: 2026-06-15

This roadmap owns Predicta's mind, voice, memory, app-action competence,
micro-messaging, prediction behavior, and chat experience. It is separate from
`PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md`, which owns UI, layout,
spacing, reports, charts, and visual/product surface quality.

Predicta is being presented as a holistic astrologer with 30 years of experience
across Vedic, KP, Jaimini, Numerology, and Signature. She must behave like one:
specific, calm, intuitive, practical, context-aware, and never like a broken
record or generic tutor.

## Product Standard

Predicta must feel like:

> A master astrologer who understands the app, the user's Kundli, the selected
> report, the active evidence room, the user's language, and the right astrology
> method to consult before giving a clear answer.

Predicta must not feel like:

- a chatbot sidekick
- a customer support script
- a repetitive template engine
- a school teacher
- a report explainer only
- a generic motivational assistant
- a system that burns AI when local memory can answer

## Non-Negotiable Rules

1. Predicta answers first and teaches only when asked.
2. Predicta must give prediction, guidance, remedies, and satisfaction where
   evidence supports it.
3. Predicta must not overclaim certainty, fate, medical/legal/financial advice,
   or guaranteed outcomes.
4. Predicta can consult multiple schools in main chat, but must disclose the
   evidence rooms used.
5. Specialist-room answers remain room-safe unless user explicitly asks for
   synthesis.
6. Predicta must know Vedic, KP, Jaimini, Numerology, Signature, Kundli Karma,
   Life Atlas, reports, passes, account flows, Family Vault, and app navigation.
7. Predicta must perform app-level functions where possible, not only describe
   them.
8. Predicta must try local memory and deterministic actions before AI.
9. Predicta must not consume AI for app navigation, deterministic Kundli
   creation, saved Kundli actions, report handoffs, entitlement explanations, or
   deterministic module summaries.
10. Predicta must vary phrasing and avoid broken-record repetition.
11. Micro-detailing and micro-messaging must feel warm, premium, and useful, not
    cheesy or noisy.
12. English, Hindi, and Gujarati chat must stay language-correct and native in
    tone.
13. Every intelligence phase must be strictly audited, fixed, verified, and
    committed before the next phase starts.

## Approved Execution Order

1. `PREDICTA_INTELLIGENCE_PHASE_0_CURRENT_CHAT_REDLINE_AND_PERSONA_LOCK`
2. `PREDICTA_INTELLIGENCE_PHASE_1_MASTER_ASTROLOGER_RESPONSE_CONTRACT`
3. `PREDICTA_INTELLIGENCE_PHASE_2_LOCAL_MEMORY_AND_DETERMINISTIC_ROUTER`
4. `PREDICTA_INTELLIGENCE_PHASE_3_APP_FUNCTION_MASTERY`
5. `PREDICTA_INTELLIGENCE_PHASE_4_MULTI_SCHOOL_CONSULTATION_ENGINE`
6. `PREDICTA_INTELLIGENCE_PHASE_5_MICRO_DETAILING_AND_MICRO_MESSAGING`
7. `PREDICTA_INTELLIGENCE_PHASE_6_ANTI_REPETITION_AND_CONVERSATION_MEMORY`
8. `PREDICTA_INTELLIGENCE_PHASE_7_PREDICTION_REMEDY_AND_SATISFACTION_GATE`
9. `PREDICTA_INTELLIGENCE_PHASE_8_TRANSLATION_NATIVE_TONE_CHAT_GATE`
10. `PREDICTA_INTELLIGENCE_PHASE_9_COST_GOVERNANCE_AND_AI_USAGE_PROOF`
11. `PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_INTELLIGENCE_PHASE_0_CURRENT_CHAT_REDLINE_AND_PERSONA_LOCK`

### Goal

Lock the current intelligence failures before improving them.

### Must Audit

- Main `/ask` chat answers.
- Legacy room chat redirects and handoffs.
- Vedic, KP, Jaimini, Numerology, Signature, Report, Life Atlas, Kundli Karma,
  Family Vault, pass, account, and support contexts.
- Local memory packets and generated report context.
- Repeated phrases and template-like answers.
- AI provider calls that should be local/deterministic.
- English, Hindi, and Gujarati chat tone.
- Cases where Predicta teaches instead of answering.

### Must Produce

- Chat redline transcript set.
- Persona contract.
- Broken-record phrase ledger.
- App-action capability map.
- Local-memory-vs-AI decision ledger.

### Green Criteria

- Baseline evidence is documented.
- Persona and no-go behaviors are locked before implementation.

## Phase 1: `PREDICTA_INTELLIGENCE_PHASE_1_MASTER_ASTROLOGER_RESPONSE_CONTRACT`

### Goal

Make every Predicta answer follow a master-astrologer rhythm.

### Must Implement

- Shared response contract:
  `direct answer -> timing/trigger if available -> remedy/action -> confidence
  and caution -> evidence only if useful`.
- Ban primary-answer patterns that start with definitions, lessons, toolkits,
  or method explanations.
- Add safe prediction language: specific where evidence supports it, honest
  where evidence conflicts.
- Add response modes:
  - quick answer
  - event prediction
  - chart/report explanation
  - remedy guidance
  - app action
  - missing data
  - safety-sensitive answer

### Green Criteria

- Fixture answers pass no-schooling and prediction-first checks.
- Safety boundaries remain intact.

## Phase 2: `PREDICTA_INTELLIGENCE_PHASE_2_LOCAL_MEMORY_AND_DETERMINISTIC_ROUTER`

### Goal

Stop wasting AI and make Predicta feel locally smart.

### Must Implement

- Intent classification before provider calls:
  - `local_memory_answer`
  - `deterministic_action`
  - `missing_data_question`
  - `ai_required`
  - `blocked_needs_credit`
- Deterministic paths for:
  - Kundli creation/intake
  - saved Kundli switching
  - chart snapshots
  - Mahadasha/gochar/Panchang/Sade Sati
  - Kundli Karma Dosh/Shrap/Yog/Lal Kitab summaries
  - KP/Jaimini/Numerology/Signature room handoffs
  - report lane explanation
  - Family Vault eligibility
  - pass/credit/account explanation
  - navigation/help

### Green Criteria

- Provider logs prove no OpenAI/Gemini calls for deterministic actions.
- Exhausted-credit users still receive deterministic help.

## Phase 3: `PREDICTA_INTELLIGENCE_PHASE_3_APP_FUNCTION_MASTERY`

### Goal

Make Predicta operate the app, not just talk about it.

### Must Implement

- Chat actions for:
  - create Kundli
  - edit/switch saved Kundli
  - open report composer
  - explain selected report
  - guide signature upload/draw readiness
  - explain pass limits and redemption
  - open account/settings/help
  - Family Vault assignment and 2-to-4 comparison rules
- Preserve draft user intent when an action needs sign-in, entitlement, or
  missing data.

### Green Criteria

- Golden app-action transcripts pass.
- Links/handoffs carry correct context.

## Phase 4: `PREDICTA_INTELLIGENCE_PHASE_4_MULTI_SCHOOL_CONSULTATION_ENGINE`

### Goal

Let main Predicta consult the right schools before predicting.

### Must Implement

- Main chat can synthesize:
  - Vedic life foundation, dasha, charts, Yog, Dosh, Shrap, Lal Kitab
  - KP event promise/block/timing
  - Jaimini soul role and destiny direction
  - Numerology cycle support
  - Signature confirmed traits only
  - Life Atlas/report context when available
- If schools agree, confidence can rise.
- If schools conflict, Predicta must say so and lower confidence.
- Room-safe mode must not silently mix methods.

### Green Criteria

- Multi-school event fixtures include direct answer, evidence used, confidence,
  and next action.
- School-mixing gates pass.

## Phase 5: `PREDICTA_INTELLIGENCE_PHASE_5_MICRO_DETAILING_AND_MICRO_MESSAGING`

### Goal

Add warmth, premium feel, and delightful small moments without clutter.

### Must Implement

- Micro confirmations after actions:
  - Kundli selected
  - report ready
  - signature ready
  - pass nearing exhaustion
  - deterministic mode active
- Short progress messaging:
  - "I am checking timing first."
  - "KP is useful here because this is an event question."
  - "I need your birth place before I can be precise."
- Gentle fun messages that stay elegant and rare.
- Context-aware nudges:
  - "You were looking at career timing; I will keep this event-focused."
  - "Your report is ready, so I can explain the exact section."

### Green Criteria

- Microcopy is short, useful, and translation-backed.
- No cheesy, noisy, or repetitive messaging.

## Phase 6: `PREDICTA_INTELLIGENCE_PHASE_6_ANTI_REPETITION_AND_CONVERSATION_MEMORY`

### Goal

Stop broken-record behavior.

### Must Implement

- Track recent response patterns and avoid repeating the same opening,
  disclaimer, upsell, or generic sentence.
- Remember active:
  - Kundli
  - report
  - school/world
  - selected chart
  - event question
  - signature readiness
  - pass/credit state
  - last user goal
- Summarize prior context compactly for future turns.

### Green Criteria

- Multi-turn transcript audit shows variation and correct context recall.

## Phase 7: `PREDICTA_INTELLIGENCE_PHASE_7_PREDICTION_REMEDY_AND_SATISFACTION_GATE`

### Goal

Make Predicta satisfying, not merely correct.

### Must Test

- Career promotion/job change.
- Foreign travel/relocation.
- Marriage/relationship timing.
- Money/property.
- Family/child/matching.
- KP event question.
- Jaimini destiny direction.
- Numerology cycle.
- Signature reflection.
- Dosh/Shrap/Yog/Lal Kitab remedy.

### Green Criteria

- Answers provide prediction/guidance, timing where available, remedy/action,
  confidence, and evidence.
- No answer reads like a lesson unless user asked to learn.

## Phase 8: `PREDICTA_INTELLIGENCE_PHASE_8_TRANSLATION_NATIVE_TONE_CHAT_GATE`

### Goal

Make Predicta sound natural in English, Hindi, and Gujarati.

### Must Implement

- Native-tone fixtures for all major answer modes.
- No Hindi/Gujarati leakage in English mode.
- No English leakage in Hindi/Gujarati except approved canonical terms.
- App-action and micro-messaging copy comes from translation files.

### Green Criteria

- Translation trust gates pass.
- Manual transcript audit passes.

## Phase 9: `PREDICTA_INTELLIGENCE_PHASE_9_COST_GOVERNANCE_AND_AI_USAGE_PROOF`

### Goal

Protect AI cost while improving intelligence.

### Must Implement

- Telemetry for every provider decision.
- Proof that deterministic/local-memory paths avoid AI.
- AI only for true synthesis, premium writing, nuanced follow-up, or paid
  precision reading.
- Clear exhausted-credit behavior.
- A shared AI usage proof contract that lists zero-credit capabilities,
  local-memory actions, deterministic actions, and AI-allowed categories.
- Router samples proving Kundli creation, saved profile actions, chart
  snapshots, Mahadasha, Gochar, Panchang, Kundli Karma, school handoffs,
  reports, Family Vault, and pass help do not call AI.
- Provider-call samples proving open-ended synthesis uses AI only when credits
  or paid entitlement allow it, and switches to deterministic preserved-question
  upsell when credits are exhausted.
- Backend telemetry proof for OpenAI, Gemini fallback/validator, deterministic
  fallback, cache state, entitlement source, product credit source, token usage,
  and estimated cost.

### Green Criteria

- Cost governance gates pass.
- Provider-call samples match expected intent categories.
- Exhausted-credit chat still offers deterministic Kundli, charts, dasha,
  Gochar, panchang, reports, saved profiles, Family Vault, and pass actions.
- No free or zero-credit path can invoke Gemini validator or premium models.

## Phase 10: `PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT`

### Goal

Prove Predicta feels like the main character and master astrologer.

### Must Produce

- Golden transcripts for:
  - no Kundli
  - saved Kundli
  - exhausted credits
  - Vedic
  - KP
  - Jaimini
  - Numerology
  - Signature
  - Reports
  - Life Atlas
  - Kundli Karma
  - Family Vault
  - pass/redeem
  - English, Hindi, Gujarati

### Green Criteria

- No generic, repetitive, teacher-like, or unsupported answers.
- Predicta gives a satisfying user experience before technical proof.
