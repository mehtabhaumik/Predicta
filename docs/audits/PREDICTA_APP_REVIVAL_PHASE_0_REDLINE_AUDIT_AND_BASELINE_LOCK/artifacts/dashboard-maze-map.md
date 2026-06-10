# Dashboard Maze Map

Phase: `PREDICTA_APP_REVIVAL_PHASE_0_REDLINE_AUDIT_AND_BASELINE_LOCK`

## Current Dashboard Groups

The current dashboard shell exposes these sections before the product is truly
chat-first:

- Ask Predicta
- Dashboard
- Vedic evidence
- KP evidence
- Jaimini evidence
- Numerology evidence
- Signature evidence
- Reports
- Library
- Account

Vedic alone exposes:

- Vedic Predicta
- Kundli
- All Charts
- Timeline
- Remedies
- Holistic Astrology
- Birth Time
- Decision

Library exposes:

- Saved Kundlis
- Family
- Relationship
- Wrapped

Account exposes:

- Account
- Settings
- Redeem Pass

## Why This Fails The Intended Experience

Normal users do not come to Predicta to choose an internal product area. They
come with a question:

- Will I go abroad?
- When will I marry?
- What should I do about my job?
- What is happening in my life right now?
- Can you make my Kundli?

The current route map asks the user to understand the product before receiving
the answer. That is the spiderweb problem.

## Required Reframe

Phase 3 must demote dashboard into `Library` or `My Astrology`.

The primary journey should be:

```text
Ask Predicta
-> create/select Kundli if needed
-> get direct answer
-> open evidence/report/library only if needed
```

