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

6. Never hide charts from free users.
   - Free users must be able to open every chart that Predicta can render.
   - Monetization must separate **visibility** from **depth**.
   - Free chart access means useful insight, simple explanation, and honest limitations.
   - Premium chart access means detailed analysis, D1 anchoring, dasha/transit timing, confidence, remedies, and report-ready synthesis.
   - Unsupported or unverified chart formulas must be shown honestly as not enabled/verified. Never fake a chart.

7. Reports and PDF downloads must include the full Jyotish surface.
   - Free reports must include all available charts with useful, easy-to-understand insights.
   - Premium reports must include detailed analysis for all available charts from `D1` to `D{n}`.
   - Every PDF/downloadable report must include, where calculable: Mahadasha/Antardasha, Sade Sati, Bhav chart, Chalit chart, Ashtakavarga, transits, yogas/doshas, remedies, and chart evidence.
   - The difference between free and premium reports is useful insight vs detailed analysis, not missing astrology.

8. Predicta must be technical in the background and simple for the user.
   - Terms like Chalit, KP, Nadi, Ashtakavarga, and Varshaphal must be explained in plain language before technical detail.
   - A 10-year-old should understand what the chart/module is for before seeing advanced proof.
   - Advanced users may get technical detail through Premium/Advanced Mode, but simple mode must remain calm and guided.

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
- Free report must still look polished and must include all available charts with useful insight.
- Premium report must include detailed analysis for all available charts from `D1` to `D{n}`.
- Every report/PDF must include Mahadasha/Antardasha, Sade Sati, Bhav, Chalit, Ashtakavarga, transits, yogas/doshas, remedies, chart evidence, and confidence where calculable.
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

## Phase 13: All Charts Free, Depth Premium

**Execution Keyword:** `EXECUTE_ALL_CHARTS_FREE_DEPTH_PREMIUM`

### Goal

Refine monetization so Predicta competes with major astrology apps without feeling restrictive.

### User Story

“I can open every chart in my Kundli for free. Predicta gives me a useful simple explanation. If I want astrologer-grade depth, timing, remedies, and report-level analysis, I upgrade.”

### Strict Prompt For Codex

You are implementing Predicta Phase 13: All Charts Free, Depth Premium.

Move the product from chart-locking to depth-based monetization. Every available chart must be visible to free users. Free users receive useful insight. Premium users receive detailed analysis for each chart with D1 anchoring, dasha/transit timing, chart strength, confidence, remedies, and report-ready synthesis.

Rules:
- Do not hide any chart from free users.
- Free users can open all available charts.
- Free chart insight must be useful, simple, and honest.
- Premium chart analysis must be detailed, evidence-rich, and synthesized with D1.
- Unsupported/unverified charts must remain visible as not enabled/verified, never faked.
- Mobile and web must stay in parity.
- Chat, reports, chart screens, and AI context must all follow the same entitlement rule.

### Required Deliverables

- Shared chart access/depth policy.
- Free and Premium chart insight composers.
- Web chart explorer showing all available charts.
- Mobile chart explorer showing all available charts.
- AI context updated so selected chart focus works for free, but depth stays limited.
- Report entitlement language updated.
- Verification commands run.

### Success Criteria

- Free user can open D1, D9, D10, and every available chart.
- Free user gets useful insight, not a locked wall.
- Premium still feels valuable because depth, synthesis, timing, and reports are clearly better.

---

## Phase 14: Chat-Native Chart Renderer

**Execution Keyword:** `EXECUTE_CHAT_CHART_RENDERER`

### Goal

Make Predicta feel like an astrologer working live inside chat.

### User Story

“I ask ‘show me D9’ and Predicta renders the D9 chart inside the chat, explains it simply, anchors the reading to D1, and lets me ask deeper follow-up questions.”

### Strict Prompt For Codex

You are implementing Predicta Phase 14: Chat-Native Chart Renderer.

Add rich chat message blocks that can render mini North Indian charts, insight cards, evidence chips, and context CTAs directly inside the chat thread. If a user asks for any chart that exists, Predicta should render it in chat and explain it according to user plan depth.

Rules:
- Predicta must not send the user away to another screen when chat can do the action.
- Every rendered chart must be North Indian style unless a future explicit chart-style setting is added.
- D1 remains the root chart for prediction.
- If user asks about D9, D10, D2, etc., Predicta must say it will read that chart with D1 as the anchor.
- Free user gets mini chart + useful insights.
- Premium user gets mini chart + detailed synthesis and follow-up memory.
- Mobile and web chat must support equivalent chart message blocks.

### Required Deliverables

- Shared chat block schema for chart cards.
- Web chat mini chart renderer.
- Mobile chat mini chart renderer.
- Chart intent parser for “show D9”, “open Navamsha”, “career chart”, etc.
- Chat focus memory for selected chart/house/planet.
- “Ask about this house,” “Compare with D1,” and “Create report” CTAs.
- Verification commands run.

### Success Criteria

- User can ask for a chart naturally and see it in chat.
- Follow-up questions remember the active chart focus.
- Free vs Premium depth is obvious but non-hostile.

---

## Phase 15: Mahadasha Intelligence

**Execution Keyword:** `EXECUTE_MAHADASHA_INTELLIGENCE`

### Goal

Make dasha analysis one of Predicta’s strongest recurring value loops.

### User Story

“Predicta tells me what life chapter I am in, why it feels this way, what is active now, what is coming next, and what I should do.”

### Strict Prompt For Codex

You are implementing Predicta Phase 15: Mahadasha Intelligence.

Build deterministic Mahadasha, Antardasha, and Pratyantardasha analysis. Free users get useful current-period insight. Premium users get a detailed dasha tree, timing windows, area impact, planet strength, D1 plus relevant divisional cross-check, remedies, and report sections.

Rules:
- Do not let the LLM invent dasha periods.
- Dasha dates must come from deterministic calculation.
- Free output must be short, useful, and understandable.
- Premium output must include detailed analysis, evidence, confidence, and action windows.
- Include dasha in chat, timeline, reports, PDFs, and daily/yearly surfaces.
- Mobile and web must stay in parity.

### Required Deliverables

- Shared dasha analysis model.
- Current Mahadasha/Antardasha free insight.
- Premium Mahadasha/Antardasha/Pratyantardasha analyzer.
- Dasha timeline cards.
- Chat intent support for dasha questions.
- Report/PDF integration.
- Verification commands run.

### Success Criteria

- User understands their current life chapter in plain language.
- Premium dasha analysis feels materially deeper than free.
- All dasha claims are deterministic and date-backed.

---

## Phase 16: Sade Sati And Saturn Transit Report

**Execution Keyword:** `EXECUTE_SADE_SATI_SATURN`

### Goal

Turn a high-interest Jyotish topic into a calm, evidence-based, non-fear product.

### User Story

“Predicta tells me if I am in Sade Sati, which phase, what it means, what to watch, and how to handle it without scaring me.”

### Strict Prompt For Codex

You are implementing Predicta Phase 16: Sade Sati And Saturn Transit Report.

Build deterministic Sade Sati detection and Saturn transit analysis. Free users get status, phase, simple caution/support guidance. Premium users get exact dates, phase-by-phase analysis, Moon chart impact, D1 house impact, Ashtakavarga support, remedies, monthly pressure windows, and report/PDF sections.

Rules:
- No fear language.
- No “doom” prediction.
- Always explain Sade Sati simply before technical detail.
- Use Moon sign, Saturn transit, D1 house impact, and Ashtakavarga where available.
- Include helpful remedies without manipulation.
- Mobile and web must stay in parity.

### Required Deliverables

- Sade Sati detection module.
- Saturn transit phase model.
- Free insight card.
- Premium detailed report section.
- Chat intent support.
- PDF/report integration.
- Verification commands run.

### Success Criteria

- User feels informed, not scared.
- Free gives value.
- Premium gives timing, proof, remedies, and planning depth.

---

## Phase 17: Chalit, Bhav, And KP Foundations

**Execution Keyword:** `EXECUTE_CHALIT_BHAV_KP_FOUNDATION`

### Goal

Win where many apps are weak: explain Chalit/Bhav and KP in a user-friendly way.

### User Story

“Predicta explains what my Chalit chart is, how it differs from D1, what KP means, and what these systems reveal, without drowning me in technical jargon.”

### Strict Prompt For Codex

You are implementing Predicta Phase 17: Chalit, Bhav, And KP Foundations.

Add Bhav/Chalit chart support and a first KP horoscope foundation. Free users get useful insight explaining what Chalit/KP are and what they show. Premium users get detailed analysis with cusps, house shifts, significators, sub-lords, and event-oriented interpretation.

Rules:
- Do not hide Chalit/Bhav/KP from free users if the chart can be rendered.
- Free users get a clear simple explanation and useful insight.
- Premium users get detailed Chalit/Bhav/KP analysis.
- Chalit must be explained as house-position refinement, not a replacement for D1.
- KP must be explained as a different Jyotish thought focused on cusps, significators, and sub-lords.
- Keep KP separate from traditional Parashari/Vedic sections.
- Mobile and web must stay in parity.

### Required Deliverables

- Shared Bhav/Chalit data model.
- Chalit chart renderer or chart variant.
- KP section shell with clear free explanation.
- KP data model for cusps/significators/sub-lords.
- Free Chalit/KP insight copy.
- Premium detailed Chalit/KP analysis structure.
- Report/PDF integration.
- Verification commands run.

### Success Criteria

- User understands why Chalit differs from D1.
- User understands KP as a separate method.
- Predicta feels more educational and premium than technical competitor apps.

---

## Phase 18: Yearly Horoscope And Varshaphal

**Execution Keyword:** `EXECUTE_YEARLY_HOROSCOPE_VARSHAPHAL`

### Goal

Give users a yearly planning surface that is personal, visual, and report-worthy.

### User Story

“Predicta shows my year theme, what the yearly horoscope represents, important months, caution windows, and growth areas.”

### Strict Prompt For Codex

You are implementing Predicta Phase 18: Yearly Horoscope And Varshaphal.

Build a yearly horoscope surface using Varshaphal/annual chart where available, dasha, transits, Ashtakavarga, and existing life timeline data. Explain what a yearly horoscope represents before giving predictions.

Rules:
- Do not present yearly horoscope as generic sun-sign content.
- Explain that yearly horoscope is a planning lens for a specific year, not a replacement for birth chart.
- Free users get year theme, 3 useful windows, and simple advice.
- Premium users get annual chart/Varshaphal depth, month-by-month cards, dasha/transit overlap, remedies, and PDF report.
- Mobile and web must stay in parity.

### Required Deliverables

- Shared yearly horoscope model.
- Year selection UI.
- Free yearly insight card.
- Premium month-by-month analysis.
- Chat intent support for “my 2027 horoscope.”
- Report/PDF integration.
- Verification commands run.

### Success Criteria

- User understands the year in under 30 seconds.
- Premium creates a clear reason to buy a yearly report.
- All timing is date-backed and confidence-labeled.

---

## Phase 19: Advanced Jyotish Coverage Engine

**Execution Keyword:** `EXECUTE_ADVANCED_JYOTISH_ENGINE`

### Goal

Expand Predicta toward “everything Vedic astrology has to offer” while keeping the user experience simple.

### User Story

“Predicta has the serious Jyotish depth in the background, but it explains only what I need in simple words.”

### Strict Prompt For Codex

You are implementing Predicta Phase 19: Advanced Jyotish Coverage Engine.

Add deterministic modules for yogas, doshas, nakshatra intelligence, Ashtakavarga depth, panchang/muhurta, compatibility, Prashna planning, Lal Kitab-style safe remedies where appropriate, and advanced-mode technical tables.

Rules:
- Every module must have free useful insight and premium detailed analysis unless explicitly premium-only.
- Keep technical detail behind expandable panels or Advanced Mode.
- Do not add fear-based dosha language.
- Remedies must be safe, non-exploitative, and evidence-linked.
- Mobile and web must stay in parity.

### Required Deliverables

- Module registry for Jyotish features.
- Free vs Premium depth policy per module.
- Yoga/dosha strength and cancellation structure.
- Nakshatra insight module.
- Ashtakavarga detail module.
- Panchang/muhurta planning model.
- Compatibility evidence model.
- Report/PDF integration.
- Verification commands run.

### Success Criteria

- Predicta feels broad and serious without becoming confusing.
- Free remains generous.
- Premium has obvious depth and planning value.

---

## Phase 20: Nadi Jyotish Premium Plan

**Execution Keyword:** `EXECUTE_NADI_JYOTISH_PLAN`

### Goal

Plan Nadi Jyotish as a premium-only specialty without faking lineage-specific claims.

### User Story

“Predicta offers a Nadi-style premium reading that feels special, but it clearly explains what method is being used and avoids pretending to access sacred manuscripts.”

### Strict Prompt For Codex

You are implementing Predicta Phase 20: Nadi Jyotish Premium Plan.

Create the architecture and product plan for a Nadi Jyotish premium module. Nadi must be premium-only. The first implementation should be conservative: Nadi-inspired pattern reading from deterministic chart signatures, not claims of reading original palm-leaf manuscripts.

Rules:
- Nadi Jyotish is strictly Premium.
- Do not claim access to real palm-leaf manuscripts unless an authentic external process exists.
- Clearly explain the method used.
- Keep language respectful and culturally sensitive.
- Use deterministic chart signatures, life-pattern questions, memory, and validation prompts.
- Mobile and web must stay in parity.

### Required Deliverables

- Nadi module product specification.
- Data model for Nadi-style pattern signatures.
- Premium-only entitlement handling.
- Safety/claims disclaimer.
- Chat workflow plan.
- Report/PDF section plan.
- Verification commands run if implementation begins.

### Success Criteria

- Nadi feels premium and special.
- Claims are honest and defensible.
- It can later become a real paid product without legal/trust risk.

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
