# Predicta Intelligence Gap Ledger

## What Predicta Currently Knows

Predicta currently has partial awareness of:

- Advanced Jyotish as a broad topic.
- Existing `kundli.yogas`.
- Soft care patterns from Advanced Jyotish coverage.
- User intents around yoga, dosha, Manglik, Kaal Sarp, Kemadruma, and Lal Kitab.
- App routing and deterministic chat actions for some Vedic topics.

## What Predicta Does Not Know Yet

Predicta does not yet have:

- A deterministic Kundli Karma memory packet.
- Canonical `Dosh`, `Shrap`, `Yog`, `Lal Kitab` awareness.
- Structured evidence for each Dosh/Shrap/Yog/Lal Kitab item.
- Item status such as present, weak, cancelled, not present, pending evidence.
- Activation timing for each condition.
- Reduction/cancellation explanations for each condition.
- Safe remedy categorization for free vs premium.
- Cross-reference logic to avoid duplicate Shrapit/Kemadruma/Grahan readings.
- Local-memory-first answers for these modules after AI credits are exhausted.
- Translation keys for the new concepts.
- Audit tests proving she refuses unsupported or fear-based statements.

## Where Chat Would Need AI Unnecessarily Today

Current chat routing can detect yoga/dosha/Lal Kitab language, but because the
structured deterministic packet does not exist yet, Predicta may route useful
questions into AI unnecessarily.

Examples that should be deterministic after implementation:

- "Do I have Manglik Dosh?"
- "Is Kaal Sarp present in my Kundli?"
- "Which Yogs are strongest?"
- "Why is this Shrap indicator showing?"
- "What is my Lal Kitab remedy?"
- "Show the top three karmic pressure indicators."
- "Explain this remedy plan simply."

## Local-Memory Routing Needed Later

Later phases must add:

- `kundliKarmaIntelligence` to calculated Kundli context.
- `kundliKarmaMemory` or equivalent compact context for Predicta.
- Rule-ID-based explanations that do not require AI when data exists.
- Chat action handlers for Dosh/Shrap/Yog/Lal Kitab summary questions.
- Report-aware memory so Predicta can explain downloaded report sections.
- Safety refusal routes for unsupported Shrap or remedy claims.
- Zero-credit deterministic mode support.

## Jaimini/Gemini Jyotish Awareness

Predicta already has Jaimini room work in the product direction. The new Kundli
Karma work must not collide with Jaimini:

- Jaimini remains a specialist method.
- Kundli Karma is Vedic/Kundli-oriented unless a later approved synthesis route
  explicitly combines it.
- If the user says "Gemini Jyotish" but means Jaimini, Predicta should clarify
  gently or route to Jaimini without inventing a new school.

## Phase 0 Intelligence Conclusion

Predicta is not allowed to sound knowledgeable about Dosh/Shrap/Yog/Lal Kitab
until deterministic data exists. The next phases must first build the shared
calculation and data contract, then app surfaces, then Predicta memory, then
reports.
