# Predicta Execution Phases

This document is the strict execution playbook for turning Predicta into a premium, evidence-based Vedic astrology product.

## Non-Negotiable Rules

1. Mobile and web must stay in parity.
   - Anything built for mobile must have a web equivalent unless it is truly mobile-system-specific.
   - Anything built for web must have a mobile equivalent unless it is truly web-system-specific.
   - Shared logic belongs in `packages/*` or `backend/*`, not duplicated in platform screens.

2. Predicta must never become a generic AI horoscope app.
   - Every serious reading must be backed by deterministic chart evidence.
   - The LLM explains structured astrology. It must not invent unsupported astrology.
   - Unsupported vargas, weak birth time, missing data, and uncertainty must be disclosed.

3. Every phase must ship end to end.
   - Backend/shared contract.
   - Mobile experience.
   - Web experience.
   - Report/AI integration if relevant.
   - Tests or typechecks.

4. User experience must be spoon-fed.
   - Assume the user is a 10-year-old.
   - Use simple labels, guided steps, clear next actions, and visible proof.
   - Never expose raw complexity before giving a plain-language summary.

5. Every phase ends with one execution keyword.
   - After implementation and verification, report the keyword for the next phase.
   - Do not provide all keywords as “done” at once.

---

## Phase 1: Destiny Passport

**Execution Keyword:** `EXECUTE_DESTINY_PASSPORT`

### Goal

Create the first “wow” artifact: a beautiful, shareable identity card that explains who the user is astrologically in a simple, premium way.

### User Story

“I entered my birth details. Predicta instantly gives me a Destiny Passport that says who I am, what phase I am in, what is strong, what needs care, and what I should do now.”

### Strict Prompt For Codex

You are implementing Predicta Phase 1: Destiny Passport.

Build a shared Destiny Passport data model generated from the real kundli payload. It must include: name, Lagna, Moon sign, Nakshatra, current Mahadasha/Antardasha, strongest houses, weakest houses, current life theme, current caution, one recommended action, birth time confidence, and a share-safe summary.

Rules:
- Keep logic deterministic and shared.
- Backend/generated kundli should expose passport data where appropriate, or shared package should compose it from `KundliData`.
- Mobile and web must both render the same passport fields.
- Do not create a marketing page. Build the usable product surface.
- Keep the UI premium, compact, and immediately understandable.
- Include an “Why?” or “Chart proof” affordance that reveals 3 evidence bullets.
- Do not add fear-based language.
- Add tests or typechecks.

### Required Deliverables

- Shared `DestinyPassport` type.
- Shared composer/helper for passport generation.
- Mobile Destiny Passport card on home/kundli flow.
- Web Destiny Passport card on dashboard/kundli flow.
- Evidence drawer/panel.
- Share-safe text output.
- Verification commands run.

### Success Criteria

- A new user can understand their chart identity in under 15 seconds.
- The card feels personal, not generic.
- Mobile and web show the same information.
- No AI call is required to render the passport.

---

## Phase 2: Life Timeline

**Execution Keyword:** `EXECUTE_LIFE_TIMELINE`

### Goal

Turn dasha and transit data into a simple life map that users can scroll and understand.

### User Story

“Predicta shows me what life chapter I am in, what is coming next, and why each period matters.”

### Strict Prompt For Codex

You are implementing Predicta Phase 2: Life Timeline.

Build an interactive timeline powered by `lifeTimeline`, dasha, transit, remedy, and rectification data. The timeline must be plain-language first and evidence second. It should show current period, upcoming period, long-range dasha chapters, important transit weather, remedy milestones, and rectification warnings.

Rules:
- Use existing backend `lifeTimeline` data where available.
- Add shared timeline grouping/formatting helpers if needed.
- Mobile and web must both support the same timeline concepts.
- Every event must have: title, date window, type, summary, confidence, and evidence/action.
- User can tap/click an event and ask Pridicta from that event context.
- No generic “future prediction” language without evidence.

### Required Deliverables

- Shared timeline presenter/helper.
- Mobile timeline screen or section.
- Web timeline screen or section.
- Event drilldown.
- “Ask from this event” context wiring.
- Report integration if missing.
- Verification commands run.

### Success Criteria

- User can see “now,” “next,” and “later.”
- Timeline explains what to do, not only what may happen.
- Events are chart-backed and confidence-labeled.

---

## Phase 3: Daily Cosmic Briefing

**Execution Keyword:** `EXECUTE_DAILY_BRIEFING`

### Goal

Make Predicta habit-forming with a daily chart-aware briefing.

### User Story

“Every morning, Predicta tells me what kind of day this is for me, what to do, what to avoid, and why.”

### Strict Prompt For Codex

You are implementing Predicta Phase 3: Daily Cosmic Briefing.

Build a deterministic daily briefing from transits, current dasha, Moon/Lagna context, ashtakavarga pressure/support, and remedies. The briefing must include: today’s theme, best action, avoid action, emotional weather, career/money/relationship cue, remedy micro-action, and chart evidence.

Rules:
- Must not be a generic horoscope.
- Must be computed from existing kundli + transit data.
- Mobile and web must render the same briefing.
- Add multilingual-ready labels/content fields.
- Add notification-ready structure but do not implement push notifications unless explicitly requested.
- Keep it concise enough for a morning glance.

### Required Deliverables

- Shared `DailyBriefing` type and composer.
- Mobile home briefing card.
- Web dashboard briefing card.
- Evidence expansion.
- “Ask about today” context.
- Verification commands run.

### Success Criteria

- User gets value in under 10 seconds.
- It feels personal and timely.
- It gives one clear action.

---

## Phase 4: Decision Oracle

**Execution Keyword:** `EXECUTE_DECISION_ORACLE`

### Goal

Help users make real-life decisions using chart timing and evidence.

### User Story

“I ask whether I should change jobs, marry, move, invest, study, or start something. Predicta gives me a decision memo with timing, risk, and next step.”

### Strict Prompt For Codex

You are implementing Predicta Phase 4: Decision Oracle.

Build a decision workflow where the user enters a decision question. Predicta classifies the decision area, asks missing clarifying questions if needed, checks relevant chart factors, dasha, transits, timeline, and remedies, then returns a structured decision memo.

Rules:
- Never output fatalistic yes/no as absolute truth.
- Use decision states: green, yellow, red, wait, needs-more-info.
- Every decision must include evidence, timing, risk, and action.
- Mobile and web must share the same decision request/response model.
- The model must support AI final explanation, but deterministic evidence must drive the structure.
- High-stakes medical/legal/financial advice must include safe disclaimers and recommend professional help.

### Required Deliverables

- Shared decision types.
- Backend/shared decision classifier and evidence composer.
- Mobile decision flow.
- Web decision flow.
- AI prompt integration.
- Report export hook.
- Verification commands run.

### Success Criteria

- The output feels like a serious advisor memo.
- User knows what to do next.
- The answer explains why.

---

## Phase 5: Remedy Coach

**Execution Keyword:** `EXECUTE_REMEDY_COACH`

### Goal

Make remedies practical, personalized, trackable, and non-exploitative.

### User Story

“Predicta tells me which remedies are relevant to my chart, why they matter, how often to do them, and whether I am being consistent.”

### Strict Prompt For Codex

You are implementing Predicta Phase 5: Remedy Coach.

Build a remedy system that turns existing remedy insights into a guided coach. Each remedy must explain: linked planet/house, reason, practice, cadence, caution, expected inner shift, and tracking status.

Rules:
- No fear-based gemstone upsells.
- No guaranteed outcomes.
- Remedies must be tied to chart evidence.
- Mobile and web must both allow viewing remedy details and marking practice done.
- Tracking can be local-first if no backend persistence exists yet.
- Include “why this remedy?” and “when to stop/review?”

### Required Deliverables

- Shared remedy status model.
- Mobile remedy coach surface.
- Web remedy coach surface.
- Local tracking/persistence.
- Report integration.
- Verification commands run.

### Success Criteria

- User understands the remedy in simple language.
- User can track consistency.
- Remedy feels helpful, not superstitious or manipulative.

---

## Phase 6: Birth Time Detective

**Execution Keyword:** `EXECUTE_BIRTH_TIME_DETECTIVE`

### Goal

Make birth time confidence understandable and interactive.

### User Story

“Predicta tells me whether my birth time is reliable. If not, it asks simple life-event questions and improves confidence.”

### Strict Prompt For Codex

You are implementing Predicta Phase 6: Birth Time Detective.

Build a rectification workflow using existing rectification insight data. The user should answer guided life-event questions. Predicta should store answers, show confidence, and explain which chart judgments are safe or unsafe.

Rules:
- Do not claim full professional rectification unless the algorithm genuinely supports it.
- Use confidence language: stable, needs checking, unreliable.
- Explain impact: D1 safer, divisional timing cautious, D60 unavailable/untrusted.
- Mobile and web must offer the same question flow.
- Answers should be saved locally first.

### Required Deliverables

- Shared rectification questionnaire model.
- Mobile rectification flow.
- Web rectification flow.
- Confidence meter.
- AI/report integration.
- Verification commands run.

### Success Criteria

- User knows whether their birth time can be trusted.
- User understands why approximate time affects predictions.
- No false precision.

---

## Phase 7: Relationship Mirror

**Execution Keyword:** `EXECUTE_RELATIONSHIP_MIRROR`

### Goal

Create a viral, emotionally powerful relationship comparison feature.

### User Story

“I add another person and Predicta shows how we connect, where we clash, how to talk, and what timing affects us.”

### Strict Prompt For Codex

You are implementing Predicta Phase 7: Relationship Mirror.

Build compatibility using two kundlis. It must compare emotional style, communication, commitment pattern, conflict trigger, timing overlap, and relationship advice.

Rules:
- Avoid deterministic claims like “this relationship will fail.”
- Use compatibility areas, not one shallow score.
- Include evidence from both charts.
- Mobile and web must support selecting/adding two profiles.
- Output must include “how to talk to this person this week.”
- Build share-safe summary but protect private birth data.

### Required Deliverables

- Shared compatibility types.
- Two-profile selector.
- Mobile relationship mirror.
- Web relationship mirror.
- Evidence-backed compatibility output.
- Share-safe summary.
- Verification commands run.

### Success Criteria

- Feature is emotionally sticky.
- User wants to add partner/friend/family.
- It is nuanced, not gimmicky.

---

## Phase 8: Family Karma Map

**Execution Keyword:** `EXECUTE_FAMILY_KARMA_MAP`

### Goal

Make Predicta sticky for households, not just individuals.

### User Story

“I add my family and Predicta shows repeated patterns, support zones, and how to handle each relationship.”

### Strict Prompt For Codex

You are implementing Predicta Phase 8: Family Karma Map.

Build a family map from saved kundlis. Show family members, relationship type, emotional pattern, support pattern, repeated karmic themes, and practical guidance.

Rules:
- Privacy-first.
- No blame language.
- Avoid saying family members are “bad” or “cursed.”
- Mobile and web must share family graph/list semantics.
- The first version can be list-based if graph UI is too large, but structure must allow future graph visualization.

### Required Deliverables

- Shared family map types.
- Family member relationship labels.
- Mobile family map.
- Web family map.
- Relationship guidance cards.
- Verification commands run.

### Success Criteria

- User wants to add more family members.
- Guidance feels compassionate and useful.

---

## Phase 9: Predicta Wrapped

**Execution Keyword:** `EXECUTE_PREDICTA_WRAPPED`

### Goal

Create the viral annual share artifact.

### User Story

“Predicta gives me a beautiful yearly recap of what I lived through and what is coming next.”

### Strict Prompt For Codex

You are implementing Predicta Phase 9: Predicta Wrapped.

Build a yearly recap from dasha, transit, timeline, user activity, saved questions, and report insights. It should be shareable, beautiful, and privacy-safe.

Rules:
- Do not expose exact birth time/place in share cards.
- Use user-consented share text/images only.
- Mobile and web must both render the wrapped experience.
- Include year theme, hard lesson, growth area, best window, caution window, next-year preview.

### Required Deliverables

- Shared wrapped composer.
- Mobile wrapped carousel.
- Web wrapped carousel.
- Share-safe export text.
- Privacy check.
- Verification commands run.

### Success Criteria

- Users want to screenshot/share it.
- It feels personal without leaking private data.

---

## Phase 10: Premium Intelligence Dossier 2.0

**Execution Keyword:** `EXECUTE_DOSSIER_2`

### Goal

Make the premium PDF/report feel like a serious personal intelligence file.

### User Story

“I pay because the report feels handcrafted, evidence-based, beautiful, and useful for decisions.”

### Strict Prompt For Codex

You are implementing Predicta Phase 10: Premium Intelligence Dossier 2.0.

Upgrade the report into a structured premium dossier with executive summary, evidence tables, timelines, transits, decision windows, remedies, rectification confidence, and area-specific intelligence.

Rules:
- Must reuse shared report composition.
- Mobile PDF and web preview must stay in parity.
- Premium depth adds analysis, not dignity.
- Free report must still look polished.
- No generic prose.
- Include chart evidence and confidence labels throughout.

### Required Deliverables

- Improved shared report schema.
- Mobile PDF rendering upgrade.
- Web report preview upgrade.
- Premium/free section gating.
- Visual polish.
- Verification commands run.

### Success Criteria

- Report feels worth paying for.
- It is obviously chart-derived.
- It is share-worthy but privacy-aware.

---

## Phase 11: Multilingual Predicta

**Execution Keyword:** `EXECUTE_MULTILINGUAL_PREDICTA`

### Goal

Make Predicta usable in English, Hindi, and Gujarati with culturally natural phrasing.

### User Story

“I choose my language and Predicta explains my kundli clearly in the language I think in.”

### Strict Prompt For Codex

You are implementing Predicta Phase 11: Multilingual Predicta.

Build multilingual support across AI requests, report sections, UI labels, and share-safe summaries. Start with English, Hindi, Gujarati.

Rules:
- Do not hardcode scattered translations in screens.
- Use shared language keys/helpers.
- AI prompt must honor requested language.
- Reports must accept language.
- Mobile and web must share language choice.
- Sanskrit terms may remain where appropriate but require simple explanations.

### Required Deliverables

- Shared language preference type and labels.
- Mobile language selector.
- Web language selector.
- AI request language wiring.
- Report language wiring.
- Verification commands run.

### Success Criteria

- A Hindi/Gujarati user can understand core flows without English.
- AI answers in the selected language.

---

## Phase 12: Trust, Safety, And Proof Layer

**Execution Keyword:** `EXECUTE_TRUST_LAYER`

### Goal

Make Predicta trustworthy enough for serious users.

### User Story

“Predicta tells me what it knows, what it does not know, and why it is saying something.”

### Strict Prompt For Codex

You are implementing Predicta Phase 12: Trust, Safety, And Proof Layer.

Add confidence labels, evidence panels, uncertainty language, high-stakes safety handling, and audit-friendly reasoning traces across chat, reports, decisions, remedies, and timeline.

Rules:
- No fatalistic certainty.
- No medical/legal/financial diagnosis.
- Every recommendation should have evidence or say evidence is weak.
- Mobile and web must share the same confidence semantics.
- Add test coverage for safety-sensitive formatting.

### Required Deliverables

- Shared confidence model.
- Evidence/proof UI components.
- Safety copy helpers.
- AI prompt hardening.
- Report safety panels.
- Verification commands run.

### Success Criteria

- Predicta feels serious, not manipulative.
- Users understand confidence and limitations.

---

## Execution Protocol

When the user says a phase keyword:

1. Read this file first.
2. Confirm the target phase.
3. Inspect current code before editing.
4. Implement backend/shared logic before platform UI.
5. Implement mobile and web parity.
6. Run relevant verification.
7. Report what changed.
8. Give the next phase keyword only after the current phase is done.

Initial next keyword:

`EXECUTE_DESTINY_PASSPORT`
