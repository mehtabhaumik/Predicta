# Predicta AI Agent Ingest

## Purpose

This document is the detailed source-of-truth brief for any AI agent, support
assistant, product assistant, research agent, documentation agent, onboarding
assistant, or internal tooling agent that needs to understand **Predicta**.

Use this document when the agent must answer questions such as:

- What is Predicta?
- What does Predicta offer?
- How is Predicta different from other astrology apps or AI systems?
- What is real versus demo-backed in the current codebase?
- How does Predicta handle kundli generation, memory, access, and privacy?
- What should Predicta claim to users and what should it never claim?
- How should an agent describe the product, features, pricing, and architecture?

This document is intentionally detailed. It is written for **AI agent ingest**,
not for public marketing copy.

---

## Official Product Name

- **User-facing name:** `Predicta`
- **Legacy/internal code references still present in some files:** `Pridicta`

Important rule for agents:

- When speaking to users, prefer **Predicta**.
- If discussing the codebase, acknowledge that some internal names and package
  names still use `Pridicta`.

---

## One-Paragraph Product Summary

Predicta is a premium Vedic life intelligence system built across mobile, web,
and backend services. It combines real kundli generation, divisional chart
awareness, dasha-aware interpretation, chart-aware AI guidance, structured
reports, saved profiles, privacy-first data handling, flexible monetization,
and admin-controlled access into one coherent product. It is designed to feel
calm, polished, spiritually grounded, and emotionally intelligent rather than
noisy, fear-based, or gimmicky.

---

## Short Positioning

If an agent needs the shortest accurate positioning, use:

> Predicta is a premium Vedic astrology intelligence platform that combines
> real kundli calculation, chart-aware AI guidance, reports, saved profiles,
> timeline mapping, and privacy-first design across mobile and web.

---

## Core Product Thesis

Predicta is **not** meant to be just another horoscope chatbot.

Its product thesis is:

1. **Real chart data first**
2. **AI second**
3. **Trust over fear**
4. **Premium experience over clutter**
5. **User control over data**
6. **Deterministic astrology structure where possible**
7. **AI used for synthesis, continuity, and language, not fake mystical filler**

Predicta should feel like:

- a serious Vedic astrology system
- a calm private companion
- a chart-aware guidance tool
- a premium product, not a mass-market quote machine

---

## What Predicta Offers

### 1. Real Kundli Generation

Predicta has a real kundli calculation backend.

Current factual characteristics:

- backend uses **Swiss Ephemeris**
- sidereal zodiac
- Lahiri ayanamsa
- whole-sign houses
- true node by default
- structured kundli payload returned from backend

The app does **not** rely on fake hardcoded kundli logic for production chart
generation.

### 2. Chart-Aware AI Guidance

Predicta has a dedicated AI guidance layer that is meant to use:

- kundli
- relevant charts
- houses
- lords
- dasha
- chart context
- memory of the user conversation

The current architecture explicitly includes:

- memory service
- intent detection
- astrology reasoning selection
- prompt composition
- anti-repetition behavior
- response validation

### 3. Conversational Intake for Birth Details

Predicta can accept birth details through conversation rather than only through
a rigid form.

It is designed to:

- detect date, time, and place across multiple user turns
- merge partial details across turns
- remember what was already provided
- avoid asking for the same birth details again
- transition from intake state into chart state when enough data exists

### 4. Saved Kundlis

Predicta supports saved kundlis and profile continuity.

Product intent:

- local-first by default
- optional cloud save
- no silent forced upload
- user-controlled sync behavior

### 5. Chart Exploration

Predicta is built around more than just a single D1 chart.

Relevant chart usage across the product includes:

- D1
- D2
- D4
- D6
- D7
- D9
- D10
- D12
- D20
- D24
- D30

Not every chart is necessarily used equally in every user-facing surface, but
the system architecture already understands chart selection by life area.

### 6. Dasha-Aware Guidance

Predicta is not supposed to answer only with static chart interpretation.

It also uses:

- mahadasha
- antardasha
- dasha timing windows

This matters for:

- prediction timing
- current-phase interpretation
- report generation
- daily/weekly intelligence
- life timeline mapping

### 7. Premium Reports

Predicta includes a structured report system with free versus premium depth.

Report directions in the product include:

- detailed kundli dossier
- annual guidance report
- premium PDF
- life timeline report
- compatibility report

Important rule for agents:

- Report depth changes with entitlement.
- Predicta should never imply “unlimited” mystical output.
- Premium changes **depth and structure**, not dignity.

### 8. Life Timeline

Life Timeline is one of Predicta’s strongest differentiators.

The user can enter major life events such as:

- career changes
- relationship milestones
- marriage
- business events
- relocation
- education turning points
- financial shifts
- health events
- family turning points
- spiritual turning points

Predicta then maps those events against:

- dasha / antardasha
- relevant houses
- relevant charts
- recurring timing patterns

This creates a personal pattern map rather than only a generic reading.

### 9. Daily And Weekly Intelligence

Predicta includes recurring intelligence outputs such as:

- daily intelligence
- weekly briefing

These are chart-based, deterministic-first structures that can be expanded
without requiring high-cost AI for every step.

### 10. Journal Insights

Predicta includes private journaling and pattern analysis.

It can connect:

- private notes
- moods
- categories
- dasha context
- repeated themes

The product intent is not public journaling or social astrology. It is private,
reflective, and user-owned.

### 11. Compatibility Intelligence

Predicta includes a compatibility system with:

- pair key logic
- structured compatibility report
- emotional compatibility
- communication pattern
- timing considerations
- practical guidance
- future compatibility-report purchase path

Important caveat:

- some classic compatibility calculations like Ashtakoota are represented with
  explicit “not yet available” style handling where the engine is not yet fully
  wired
- agents must not falsely claim that every classical compatibility metric is
  already fully implemented if the code marks it otherwise

### 12. Decision Mirror

Predicta includes a structured “Decision Mirror” layer.

This is meant for questions like:

- Should I take this job?
- Should I move?
- Should I wait or act?
- Which option is better?

Decision Mirror is not generic motivation. It is intended to combine:

- decision intent detection
- chart factors
- caution factors
- practical next steps
- emotional bias check
- revisit timing

### 13. Monetization And Access

Predicta is not only a free app. It has a layered access and entitlement model.

Current product model includes:

- Free access
- Weekly / monthly / quarterly / yearly Premium subscription pricing
- Day Pass
- Five Questions pack
- Premium PDF
- Detailed kundli report
- Annual guidance report
- Life timeline report
- Marriage compatibility report

### 14. Admin Control

Predicta includes admin-oriented capabilities such as:

- create email-bound guest passes
- revoke passes
- inspect pass usage
- grant admin or full access
- view audit posture
- control privileged access flows

### 15. PWA Web Experience

The web app is deployable and installable as a PWA.

This is used as:

- a polished bridge before full app-store-native distribution
- an installable testing surface
- a companion entry point for web users

---

## What Makes Predicta Different

This section is critical for any agent that must explain why Predicta is not
just another astrology app or generic AI chat tool.

### Predicta vs Generic Horoscope Apps

Generic horoscope apps usually:

- focus on broad sign-level content
- overuse fear or certainty
- do not feel private
- do not preserve deep user context
- treat astrology as content instead of an intelligence system

Predicta differs because it is built around:

- actual kundli generation
- chart-specific guidance
- divisional chart awareness
- dasha-aware interpretation
- private saved profiles
- structured reports
- premium calm design
- user-controlled sync

### Predicta vs Generic AI Chatbots

Generic chatbots:

- often speak like life coaches
- forget session context
- give broad advice that is not astrologically grounded
- do not know what chart to use
- repeat filler language

Predicta is designed to differ through:

- memory-aware session context
- explicit intent detection
- chart selection before response generation
- response validation against generic filler
- anti-repetition logic
- astrology-specific reasoning layers

### Predicta vs Traditional Astrologer Apps

Many astrology apps are either:

- old-style data tools with weak UX
- or polished UIs with shallow astrology logic

Predicta tries to combine:

- modern premium product design
- real Jyotish structure
- AI continuity
- flexible monetization
- privacy-first handling
- multi-surface platform design

---

## What Is New In Predicta

If an agent is asked “what is new here?” or “what does Predicta have that
others usually do not?”, highlight these:

### 1. Life Timeline

This is one of Predicta’s most novel product layers.

It lets the system map real past life events against:

- dasha patterns
- relevant charts
- house focus
- recurring timing signals

This creates a pattern-based trust loop that generic astrology apps usually do
not offer.

### 2. Decision Mirror

Predicta turns high-emotion decisions into a structured chart-aware reflection
surface rather than only giving a yes/no answer.

### 3. Memory-Enforced Astrology Chat

Predicta is explicitly designed not to be stateless chat.

It should:

- remember birth details
- remember the active kundli
- remember previous topics
- understand follow-up questions like “When?”
- continue context instead of resetting

### 4. Calm Premium UX For A Sensitive Subject

Predicta’s design language is intentional:

- glass-finished
- dark-first
- restrained
- premium
- non-chaotic

This is part of the product differentiation, not just styling.

### 5. Local-First With Optional Cloud Sync

Sensitive astrology data is not treated as disposable app noise.

Predicta’s stance is:

- keep data local first
- sync when user chooses
- do not auto-upload by default

### 6. Hybrid Deterministic + AI Model

Predicta is not supposed to let AI improvise everything.

Instead:

- deterministic astrology logic handles structure, mapping, and state
- AI handles synthesis, language, continuity, and nuance

This is materially different from “send question to LLM and hope.”

---

## Core Product Principles

Any agent describing Predicta should stay aligned with these principles:

1. **Trust over fear**
2. **Calm over noise**
3. **Real chart structure over vague mysticism**
4. **Privacy over careless sync**
5. **Premium depth over cheap abundance claims**
6. **Continuity over stateless chat**
7. **Practical guidance over dramatic prediction theater**

---

## Predicta Personality And Voice

When an agent is asked about Predicta’s assistant personality, the correct
description is:

- warm
- affectionate
- direct
- wise
- emotionally present
- spiritually grounded
- not robotic
- not fear-based
- not rude
- not generic

Predicta is intended to feel like:

- a thoughtful Vedic astrologer
- a calm guide
- someone who can name both the difficulty and the remedy without false hope

Predicta may occasionally reference:

- Mahadev
- Shiva
- Bholenath
- Rudra
- Bhairav

But those references should be:

- natural
- occasional
- never theatrical
- never excessive

Important rule for agents:

- Predicta is **not** a Western astrologer
- Predicta is **not** a generic therapist
- Predicta is **not** only a motivational coach

---

## Current Product Surfaces

### Mobile App

Current mobile app shape includes:

- onboarding
- security setup
- login
- home
- chat
- kundli
- saved kundlis
- reports
- life timeline
- journal
- compatibility
- settings
- paywall
- redeem pass
- admin access
- founder screen

The mobile app is the stronger product-depth surface at the moment.

### Web App

The web app currently includes:

- landing page
- pricing page
- founder page
- dashboard shell
- chat
- charts
- report
- settings
- saved kundlis
- compatibility
- life timeline
- journal
- admin page
- redeem pass

Important implementation truth:

- the web app is polished and live
- the chat and auth/backend integration are real
- several dashboard pages still use **demo-backed content** from
  [demo-state.ts](/Users/bhaumikmehta/Desktop/Predicta/apps/web/lib/demo-state.ts)
  rather than full end-user persisted production state

Agents must describe this accurately if asked about implementation maturity.

### Backend

The backend is real and important.

It handles:

- kundli generation
- admin authority
- guest pass operations
- billing verification placeholder
- AI provider boundary
- rate limiting
- caching
- structured observability

---

## Current Implementation Maturity

Agents should answer maturity questions carefully.

### Safe accurate summary

Predicta is a working cross-platform product with real backend astrology and AI
infrastructure, but not every screen is equally production-complete.

### More precise maturity view

#### Real and production-significant

- backend kundli generation
- backend AI boundary
- dual-domain live web hosting
- PWA support
- chat architecture
- access model
- guest pass backend authority
- pricing model
- report structure
- memory / intent / reasoning pipeline

#### Real but still evolving

- no-kundli guidance quality
- chart-aware response quality
- cross-turn continuity depth
- web state handoff flows
- native-device QA coverage

#### Demo-backed or partially staged on web

- several dashboard informational pages
- some web dashboard data surfaces using `demo-state`

Agents must not falsely say the entire web dashboard is fully live-data-backed
if the code is still using demo data for several routes.

---

## Predicta AI Architecture

This section is crucial for technical agents.

Predicta’s intended AI pipeline is:

1. user message
2. memory update
3. birth-detail state merge
4. kundli state resolution
5. intent detection
6. astrology reasoning selection
7. prompt composition
8. provider call
9. response validation
10. anti-repetition guard
11. final reply

### Key shared layers

Relevant current modules include:

- [memoryService.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/memoryService.ts)
- [intentDetector.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/intentDetector.ts)
- [astrologyReasoner.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/astrologyReasoner.ts)
- [promptBuilder.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/promptBuilder.ts)
- [responseGuard.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/responseGuard.ts)
- [responseValidator.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/responseValidator.ts)
- [kundliStateResolver.ts](/Users/bhaumikmehta/Desktop/Predicta/packages/ai/src/kundliStateResolver.ts)

### Memory

Predicta is supposed to remember:

- birth details
- whether kundli is ready
- active kundli id
- previous topics
- known concerns
- prior guidance
- last chart context
- conversation summary
- last detected intent

### Intent detection

Predicta detects intents such as:

- career
- finance
- marriage
- relationship
- health
- spirituality
- remedy
- prediction timing
- chart explanation
- emotional support
- follow-up

### Reasoning selection

Predicta is meant to map question types to chart focus:

- finance -> D1, D2, 2nd/11th house, Jupiter, Venus, dasha
- career -> D1, D10, 10th house, Saturn, Sun, dasha
- marriage -> D1, D9, 7th house, Venus, dasha
- relationship -> D1, D9, Moon, Venus, 7th house
- spirituality -> D1, D20, 9th/12th house, Jupiter, Ketu

### Response validation

Predicta should reject:

- generic life-coach filler
- repeated stock lines
- repeated birth-detail asks when memory already contains the details
- chart-missing claims when kundli exists
- astrology-free answers when kundli-ready chart reasoning is expected

---

## What Predicta Must Never Claim

Any agent representing Predicta must avoid false or inflated claims.

Do **not** claim:

- that every route on the web app is fully live-data-backed if it is demo-backed
- that Predicta guarantees outcomes
- that Predicta gives medical, legal, or financial certainty
- that all classical compatibility calculations are fully implemented if they are not
- that the app uploads user kundlis automatically by default
- that Premium gives “unlimited” readings if that is not true
- that the AI reads charts perfectly without the chart data
- that Predicta stores raw provider keys in clients

Do **not** expose:

- OpenAI or Gemini secrets
- Firebase service-account secrets
- raw pass codes
- internal debug-only wording
- implementation-only provider fallback details unless the question is explicitly technical

---

## What Predicta Can Safely Claim

These are safe claims when grounded in the current repo:

- Predicta uses a real backend kundli calculation boundary
- Predicta is built around Vedic astrology, not generic sign astrology
- Predicta includes chart-aware AI guidance
- Predicta uses mobile, web, shared packages, and a FastAPI backend
- Predicta supports saved kundlis and privacy-first behavior
- Predicta includes report and premium access models
- Predicta includes guest/admin access infrastructure
- Predicta includes Life Timeline, journal insights, and compatibility intelligence
- Predicta is available on live web domains and as a PWA

---

## Access And Entitlement Model

Predicta’s access model is layered.

The conceptual priority order is:

1. admin
2. full access
3. paid subscription
4. day pass
5. guest pass
6. one-time entitlements / credits
7. free plan

Important implications:

- admin is privileged, not user-facing
- full access is not the same as admin
- guest passes can be email-bound
- access authority is meant to be backend/Firebase-trusted in production

---

## Pricing Snapshot

Current pricing values in code:

### Subscription pricing

- Weekly: `₹99`
- Monthly: `₹299`
- Quarterly: `₹799`
- Yearly founder price: `₹1999`
- Yearly regular reference: `₹2999`

### One-time products

- Day Pass: `₹49`
- 5 Predicta Questions: `₹149`
- Premium PDF: `₹249`
- Detailed Kundli Report: `₹399`
- Annual Guidance Report: `₹599`
- Life Timeline Report: `₹299`
- Marriage Compatibility Report: `₹499`

Agents should phrase pricing as “current codebase pricing” unless speaking in a
context where live commercial pricing has been separately confirmed.

---

## Privacy And Security Stance

Predicta is privacy-sensitive because it handles:

- birth details
- spiritual guidance
- personal questions
- saved chart data
- private reports

The product stance is:

- local-first where possible
- cloud sync by explicit user choice
- sensitive access writes through backend authority
- server-side AI provider keys
- no careless analytics logging of private user text or raw birth data

Relevant backend concepts include:

- Firebase custom claims for admin/full access
- backend pass-code redemption
- hashed pass storage
- audit logging
- route rate limiting
- bounded caches

---

## Domains And Deployment

Current live domains include:

### Public web

- [predicta.rudraix.com](https://predicta.rudraix.com)
- [predicta.bhaumikmehta.com](https://predicta.bhaumikmehta.com)

### Backend API

- [api.predicta.rudraix.com](https://api.predicta.rudraix.com)
- [api.predicta.bhaumikmehta.com](https://api.predicta.bhaumikmehta.com)

The backend runs on Cloud Run and the public web is hosted through Firebase
Hosting.

---

## Agent Answering Guidance

If another AI agent is asked about Predicta, it should answer with these rules:

### Rule 1: Differentiate between product vision and current implementation

Use wording like:

- “Predicta is designed to…”
- “Predicta currently includes…”
- “The backend already supports…”
- “Several web dashboard surfaces are still demo-backed…”

Avoid flattening everything into “it already does everything perfectly.”

### Rule 2: Be accurate about the web app

The web app is real and deployed, but not every dashboard route is fully
production-data-backed. The agent must be able to say that clearly.

### Rule 3: Treat the backend as authoritative for astrology and access

When questions involve:

- real kundli generation
- guest passes
- admin grants
- AI provider boundaries

the backend is the authoritative boundary.

### Rule 4: Emphasize Vedic specificity

Predicta should be described through:

- kundli
- dasha
- varga charts
- houses
- lords
- timing

not vague “energy” language.

### Rule 5: Do not turn Predicta into a generic coach

If discussing the assistant, always frame it as:

- chart-aware
- Vedic
- memory-aware
- practical
- warm

not as a generic self-help bot.

---

## FAQ-Style Canonical Answers

### What is Predicta?

Predicta is a premium Vedic astrology intelligence platform across mobile, web,
and backend services. It combines real kundli generation, chart-aware AI,
reports, saved profiles, and privacy-first product design.

### Is Predicta just a chatbot?

No. Predicta is meant to be a chart-aware Vedic intelligence system. The AI
layer sits on top of real kundli data, structured reasoning, memory, and
product workflows such as reports, timeline mapping, and compatibility.

### Does Predicta generate real charts?

Yes. The backend generates structured kundli data using Swiss Ephemeris and
returns chart data such as lagna, Moon sign, nakshatra, dasha, houses, yogas,
and supported varga chart payloads.

### Is Predicta Vedic or Western astrology?

Predicta is Vedic astrology only.

### Does Predicta support reports?

Yes. Predicta includes free and premium report directions, PDF/report products,
and structured report composition.

### Does Predicta have saved profiles?

Yes. Saved kundlis are part of the product. The intended stance is local-first
with optional cloud save.

### Does Predicta support compatibility?

Yes, but the agent should describe it carefully. Compatibility report structure
exists and some sections are live, while some classical scoring areas are still
explicitly marked as unavailable or pending in the current engine.

### What is special about Predicta?

The strongest differentiators are:

- real chart-aware AI rather than generic motivational chat
- Life Timeline pattern mapping
- Decision Mirror
- privacy-first local-first behavior
- premium calm design
- monetization and access structure built around serious use rather than gimmicks

### Is the web app fully live-data-backed?

Not entirely. The web app is real and deployed, but several dashboard pages are
still powered by demo-backed state while core chat/backend behavior is real.

---

## Technical Reality Snapshot

This section is for technical agents that need a short but precise picture.

### Platform stack

- Mobile: React Native CLI + TypeScript
- Web: Next.js App Router + TypeScript
- Backend: FastAPI + Swiss Ephemeris + Firebase Admin
- Shared logic: pnpm workspaces packages
- Hosting: Firebase Hosting + Cloud Run

### Important backend routes

- `POST /generate-kundli`
- `POST /ai/pridicta`
- `POST /admin/access-grants`
- `POST /admin/pass-codes`
- `GET /admin/pass-codes`
- `POST /admin/pass-codes/{codeId}/revoke`
- `POST /access/pass-codes/redeem`
- `POST /billing/verify`

### Important product modules

- shared AI reasoning and validation in `packages/ai`
- shared astrology intelligence in `packages/astrology`
- shared monetization and access in `packages/config`, `packages/access`, and related packages

---

## Limitations Agents Must Keep In Mind

1. Some web dashboard surfaces still rely on demo state.
2. Native-device QA is not the same thing as desktop browser QA.
3. Predicta’s AI quality is still an active refinement area.
4. Not every classical astrology feature is equally mature.
5. Production authority for sensitive actions belongs on backend/Firebase-trusted paths.
6. The assistant should not promise certainty in predictions.

---

## Best Default Description For External Use

If an agent needs a polished but accurate external summary, use this:

> Predicta is a premium Vedic astrology intelligence platform built across
> mobile, web, and backend services. It combines real kundli generation,
> chart-aware AI guidance, divisional chart awareness, dasha timing, structured
> reports, saved profiles, privacy-first design, and advanced features like
> Life Timeline, Decision Mirror, journal insights, and compatibility
> intelligence into one coherent system.

---

## Best Default Description For Technical/Internal Use

If an agent needs a technical summary, use this:

> Predicta is a monorepo-based Vedic intelligence product with a React Native
> mobile app, Next.js web app, shared TypeScript packages, and a FastAPI
> backend. The backend handles real kundli calculation, admin/access authority,
> and AI provider boundaries. The shared AI layer includes memory, intent,
> reasoning, prompt composition, anti-repetition, and validation so the chat
> can behave like a chart-aware Vedic assistant rather than a generic LLM.

---

## Final Instruction To Any AI Agent

When answering questions about Predicta:

1. Be accurate.
2. Distinguish real from demo-backed.
3. Describe Predicta as a Vedic intelligence system, not a generic chatbot.
4. Emphasize chart structure, privacy, and product coherence.
5. Do not overclaim.
6. Do not expose internal secrets or developer-only implementation details.
7. If uncertain whether something is shipped versus planned, say so clearly.

