# Primary Predicta Scope Ledger

Status: GREEN for scope lock.

## Locked Product Center

Predicta is the primary intelligence layer and focal point of the app.

Specialist worlds remain available, but they become evidence rooms and depth
surfaces:

- `Vedic`: life foundation, dasha, charts, yogas, karma, remedies.
- `KP`: precise event questions, promise/block, cusp/sub-lord evidence, timing.
- `Jaimini`: soul path, destiny, karakas, Arudha, Chara Dasha, life direction.
- `Numerology`: name/date rhythm, personal cycles, timing support.
- `Signature`: expression and self-presentation, only when signature exists.
- `Kundli Karma`: Dosh, Shrap, Yog, Lal Kitab, karmic friction/support.
- `Life Atlas`: full synthesis report, not the default chat replacement.

## Current Repo Baseline

| Surface | Current Evidence | Phase 0 Redline |
|---|---|---|
| Main web dashboard | `apps/web/app/dashboard/page.tsx` already has `Ask Predicta` and `Create Kundli` CTAs. | Predicta is present, but the next phase must make her visually primary rather than one option among many. |
| Web header | `apps/web/components/WebHeader.tsx` links Vedic, KP, Jaimini, Numerology, Signature, Reports, Pricing. | Navigation still foregrounds worlds before the primary Predicta experience. Phase 1 must rebalance this. |
| Dashboard shell | `apps/web/components/DashboardShell.tsx` has each specialist room and chat subroute. | Specialist room chat routes exist; future phases must avoid five disconnected Predicta experiences. |
| Chat | `apps/web/components/WebPridictaChat.tsx` has active context, pass/cost display, deterministic shortcuts, report CTAs, and prediction keyword routing. | Good foundation, but Event Oracle must add real event-question taxonomy, evidence agreement, timing, trigger, and prediction tracker. |
| Specialist components | Vedic, KP, Jaimini, Numerology, Signature surfaces already have Ask Predicta/report CTAs. | These CTAs must become source-aware handoffs into primary Predicta, not generic links. |
| Reports | Report value contracts and report pages exist for multiple schools. | Future report alignment must remove schooling/toolkit/internal-contract tone and enforce prediction-first language. |
| Legacy Nadi | `apps/web/app/dashboard/nadi/page.tsx` and `/nadi/chat` redirect to Jaimini, but Nadi files/translations/history still exist. | Historical artifacts may remain, but active Event Oracle taxonomy must never treat Nadi as a current world. |

## Scope Lock

The next implementation phases must not:

- No active product lane may be renamed in Phase 0.
- delete specialist worlds
- convert Predicta into a generic chatbot
- silently mix schools
- let specialist-room chat compete with primary Predicta
- make reports or chat answer like lessons
- spend AI when deterministic memory can answer
- claim guaranteed outcomes

The next implementation phases must:

- make `Ask Predicta` the main action
- let users ask normal life questions first
- let Predicta refine vague questions
- route evidence to the correct worlds
- disclose evidence sources when synthesis crosses schools
- return direct answer, timing, trigger, confidence, delay factors, support
  factors, and next action
- keep evidence collapsed unless the user asks for proof
