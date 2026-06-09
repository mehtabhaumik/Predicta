# Event Prediction Gap Ledger

Status: GREEN for redline lock.

## Required Event Categories

Predicta Event Oracle must support these categories before the final roadmap can
be green:

- career move
- promotion
- job change
- foreign travel
- relocation
- visa / PR
- marriage timing
- relationship outcome
- money/property
- business growth
- education/study stream
- court/litigation
- family/child/matching
- wellness caution with safety disclaimers

## Required Answer Shape

Every Event Oracle prediction must produce:

- `directAnswer`
- `timingWindow`
- `mostLikelyTrigger`
- `confidence`
- `whatCanDelayIt`
- `whatCanStrengthenIt`
- `whatToDoNow`
- `collapsedEvidence`

## Current Gap Findings

| Gap | Current Repo Signal | Why It Blocks Event Oracle | Future Phase Owner |
|---|---|---|---|
| Event question taxonomy is not formalized. | Chat keyword detection exists in `WebPridictaChat.tsx`, but event categories are not a strict typed product contract. | Users should not need to know whether their question needs Vedic, KP, or Jaimini. | Phase 2 |
| Cross-school evidence contract is not unified around event outcomes. | Vedic, KP, Jaimini, Numerology, Signature, and Kundli Karma engines exist separately. | Precision requires agreement/conflict scoring across evidence rooms. | Phase 3 |
| Timing/trigger object is not the central response artifact. | Existing chat/report flows often provide guidance and summaries, but not always a direct timing/trigger structure. | The AstroLokal-style wow comes from a specific event window and likely real-world trigger. | Phase 4 |
| Primary Predicta is not yet the universal hero experience. | The app has multiple room entry points and chat CTAs, but worlds still feel like top-level destinations. | The user should ask Predicta first and let her choose evidence rooms. | Phase 5 |
| Handoffs are not yet structured as evidence-room context packages. | CTAs often link to chat/report but do not guarantee a typed context payload. | Predicta needs to know exactly what chart, dasha, event, or report section the user selected. | Phase 6 |
| No prediction tracker exists as the trust loop. | Reports and chats can be saved, but outcomes are not captured as happened/partial/not happened/pending. | Competitors rely on anecdotes. Predicta should build measurable trust. | Phase 10 |

## Banned Event Answer Patterns

- "This house represents..." before answering the question.
- "KP uses..." before answering the question.
- "This report helps you understand..." instead of telling the user what is
  likely.
- "Definitely" or `100%` certainty.
- Generic life-coaching filler.
- Fear-selling or remedy pressure.
- Unsupported exact dates.
- Hidden source mixing.

## Free Vs Paid Event Standard

Free Event Oracle preview:

- direct short answer
- broad timing/readiness where deterministic evidence supports it
- one next step
- clear paid path for full precision reading

Paid Precision Reading:

- direct answer
- timing window
- likely trigger
- contradiction handling
- agreement/conflict score
- practical action plan
- evidence drawer
- optional human review add-on
- saved transcript/summary
- prediction tracker entry

