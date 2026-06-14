# Predicta Intelligence Phase 0 Chat Redline Transcript Set

Phase keyword: `PREDICTA_INTELLIGENCE_PHASE_0_CURRENT_CHAT_REDLINE_AND_PERSONA_LOCK`
Status: `GREEN BASELINE LOCK`
Date: 2026-06-15

This artifact locks the current Predicta chat failure modes before Phase 1
changes the response contract. These are redline transcript standards, not
marketing examples.

## Source Paths Audited

- `backend/astro_api/ai.py`
- `apps/web/components/WebPridictaChat.tsx`
- `apps/web/app/api/ask-pridicta/route.ts`
- `apps/web/lib/pridicta-ai.ts`
- `apps/mobile/src/screens/ChatScreen.tsx`
- `packages/astrology/src/predictaChatActions.ts`
- `packages/config/src/predictaMemory.ts`
- `packages/config/src/predictaWebChat.ts`
- `packages/config/src/translations/predictaWebChat.json`
- `docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_3_PREDICTA_INTELLIGENCE_CONTEXT_AND_LOCAL_MEMORY_SUPREMACY/predicta-context-local-memory-supremacy-audit.md`
- `docs/audits/PREDICTA_EVENT_ORACLE_PHASE_7_PREDICTION_FIRST_LANGUAGE_AND_NO_SCHOOLING_GATE/phase-7-red-team-audit.md`
- `docs/audits/PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE/zero-credit-deterministic-chat.md`

## Redline 1: Main Ask Predicta Event Question

User asks:

```text
Will I get a UK work opportunity this year?
```

Current risk:

- Backend prompt has good event-oracle rules, but also requires chart evidence
  sections in broad chart answers.
- If no event contract is selected, Predicta can still drift into broad
  explanation: `12th house means foreign travel`, `D10 is career`, or
  `this area represents...`.
- This is the exact competitor failure: useful engine, weak prediction.

Phase 1 required answer shape:

```text
Direct answer: There is a work-through-network opportunity signal, but I would
call it possible rather than confirmed until KP timing agrees.

Most likely window: ...
Most likely trigger: ...
What can delay it: ...
What to do now: ...
Evidence used: Vedic timing, D10 career support, KP event-readiness if selected.
```

No-go:

- Starting with a lesson about 12th house, D10, KP, dasha, or foreign houses.
- Saying exact dates without deterministic timing support.
- Hiding behind generic `foreign settlement is possible`.

## Redline 2: KP Room Question Missing

User opens KP and asks:

```text
Tell me about my career.
```

Current risk:

- Prior KP report/chats repeatedly told the user a specific question is needed.
- That can sound like a tool refusing to help.
- KP does need a question, but Predicta must still be useful immediately.

Phase 1 required answer shape:

```text
Direct answer: Career timing can be checked through KP, but this question is too
broad for a final verdict. I can still start with career readiness.

Choose one:
- Will I change job in the next 6 months?
- Will I get promotion this year?
- Is foreign work/transfer likely?
- I have no exact question; show my strongest career signal.
```

No-go:

- `KP needs a specific question` as the whole answer.
- D1/D9 Parashari explanation inside KP as the main method.
- Report/toolkit language.

## Redline 3: Jaimini Room Soul Direction

User asks:

```text
What is my destiny direction?
```

Current risk:

- Backend has Jaimini room boundaries, but legacy Nadi mapping still appears in
  compatibility code and room checks.
- If evidence is partial, Predicta can become defensive instead of helpful.

Phase 1 required answer shape:

```text
Direct answer: Your destiny direction is toward ...

How it shows up: ...
What to lean into now: ...
Jaimini evidence: Atmakaraka, Amatyakaraka, Swamsa/Karakamsha, Arudha/Upapada
when available.
```

No-go:

- Any active user-facing Nadi framing.
- Manuscript/ancient-record claims.
- A lecture about what Jaimini astrology is before answering.

## Redline 4: Numerology Room

User asks:

```text
What does my name number say?
```

Current risk:

- Numerology memory is present, but the app can answer in labels and definitions
  instead of lived guidance.
- Hindi/Gujarati prompts must not leak English archetype labels.

Phase 1 required answer shape:

```text
Direct answer: Your name rhythm pushes you toward ...

Strength: ...
Caution: ...
Current cycle use: ...
Evidence: name number, root/compound, birth/destiny/current cycle.
```

No-go:

- `Name number shows how the name projects into the world` as the main answer.
- Mixed English labels in Hindi/Gujarati unless explicitly requested.
- Numerology answer borrowing Vedic proof silently.

## Redline 5: Signature Room

User asks:

```text
What does my signature say about me?
```

Current risk:

- Signature safety rules are strong, but the answer can sound like a disclaimer
  first.
- Missing signature must block trait invention.

Phase 1 required answer shape when signature exists:

```text
Direct answer: Your confirmed signature traits show ...

What this may reflect: ...
Practical refinement: ...
Confidence: ...
Boundary: reflective guidance, not forensic proof.
```

Phase 1 required answer shape when missing:

```text
I cannot read signature traits yet because no confirmed signature sample is
available. Upload or draw it, then I can read visible traits without storing the
raw image.
```

No-go:

- Any trait invented without confirmed sample.
- `This proves your personality`.
- Vedic/KP/Numerology blending unless user explicitly asks for synthesis.

## Redline 6: Kundli Karma Local Memory

User asks:

```text
Explain my strongest Dosh.
```

Current good behavior:

- `packages/astrology/src/predictaChatActions.ts` can answer Kundli Karma from
  local memory.
- Provider decision is `local_memory_answer`.
- No AI credit is needed.

Current risk:

- User-facing text still exposes implementation labels such as
  `Provider decision: local_memory_answer. No AI credit is needed.`
- That is useful for audit, but too system-like for normal chat if overused.

Phase 1 required answer shape:

```text
Direct answer: The strongest Dosh pressure is ...

Why it appears: ...
What it means: ...
When it activates: ...
Safe remedy: ...
```

No-go:

- Starting with local-memory machinery.
- Repeating provider labels inside every user answer.
- Fear-selling Shrap/Dosh.

## Redline 7: App-Level Action

User asks:

```text
Create my Kundli. My DOB is 22 Aug 1980, 06:30 AM, Petlad Gujarat India.
```

Current good behavior:

- Web birth extraction calls `/api/extract-birth-details` with `rulesOnly` by
  default.
- Mobile deterministic chat actions run before provider calls.

Current risk:

- The app still sometimes tells users to go to another screen.
- Phase 1+ must make app actions feel completed inside chat whenever possible.

Required behavior:

```text
Done. I created the Kundli here and selected it.

Now ask about career, marriage, timing, remedies, or reports.
```

No-go:

- Spending AI credit for rules-based birth intake.
- Sending user away when chat can stage or complete the action.

## Redline 8: Exhausted Free AI Credits

User asks an open-ended synthesis after credits are exhausted:

```text
Tell me everything about my future.
```

Current good behavior:

- Server ledger blocks AI spend and preserves purchase upsell path.
- Deterministic actions remain available.

Required behavior:

```text
Your starter AI questions are used. I can still help right now with Kundli,
charts, dasha, gochar, Kundli Karma, reports, saved profiles, and Family Vault
using the calculation engine. For a deeper free-form Predicta answer, unlock more
questions.
```

No-go:

- Dead chat.
- Hiding deterministic options.
- Calling AI after block.

## Redline 9: Report Section Question

User asks:

```text
What does my Mahadasha section mean?
```

Current risk:

- Backend report memory exists, but the prompt can ask Predicta to explain what
  a report section is.
- User wants meaning, not report architecture.

Required behavior:

```text
Direct answer: This Mahadasha chapter is about ...

Current effect: ...
What to be careful about: ...
What to do now: ...
Report evidence: current MD, AD, PD, and chart support.
```

No-go:

- `This section includes...`
- `Mahadasha is a planetary period...` before the actual answer.
- Premium upsell before giving free meaning.

## Redline 10: Language Tone

User selects English and asks in English:

```text
What should I focus on now?
```

Required:

- English only.
- No Hindi/Gujarati leakage.

User selects Gujarati and asks in Gujarati:

```text
હવે મને શું કરવું જોઈએ?
```

Required:

- Natural Gujarati script.
- No English labels such as `Builder`, `Current phase`, `Improvement plan`,
  unless app/product code genuinely requires it.

No-go:

- Weird mixed-language output.
- Romanized Hinglish/Gujlish in native-script mode.
- Translation keys or native-copy IDs leaking.

