# Word Navigation Rebuild Roadmap

You are right. The current direction is too subtle. It treats KP, Nadi, Numerology, and Signature like add-ons. That weakens trust.

## Core Correction

Predicta should become:

**One product. Five distinct worlds. Five specialist Predictas. Shared user context. No method mixing.**

Public/user-facing sections should be:

- **Vedic**
- **KP**
- **Nadi**
- **Numerology**
- **Signature**

Not “schools,” not hidden room selectors, not buried tabs.

Under the hood it can still be one Predicta system, but the user must feel each page is a dedicated expert space.

## What Must Change

### 1. Create Dedicated Worlds

Each section gets its own page, hero, proof cards, reports, and obvious CTA:

- Chat with Vedic Predicta
- Chat with KP Predicta
- Chat with Nadi Predicta
- Chat with Numerology Predicta
- Chat with Signature Predicta

### 2. Dedicated Chat Context Per World

Each chat must load its own room context automatically:

- `/dashboard/vedic/chat`
- `/dashboard/kp/chat`
- `/dashboard/nadi/chat`
- `/dashboard/numerology/chat`
- `/dashboard/signature/chat`

No generic “Predicta Chart” where users hunt for the right mode.

### 3. Navigation Must Be Rebuilt

Main navigation should show major worlds:

- Dashboard
- Vedic
- KP
- Nadi
- Numerology
- Signature
- Reports
- Library
- Account

Inside each world, local nav shows only relevant items.

### 4. Predicta Intelligence Must Be Rebuilt By Discipline

Current Numerology and Signature behavior sounds generic. That is unacceptable.

Each room needs:

- separate prompt
- separate memory
- separate proof cards
- separate allowed data
- separate report format
- separate safety language
- strict handoff rules

### 5. No Fake Authority Claims

Do not claim “50 years experience” unless we can make that visible through quality. Better:

- show method proof
- show calculation steps
- show why the answer is grounded
- show what data was used
- show what is uncertain

Trust comes from proof, not inflated claims.

### 6. Language Policy Changes

Your new direction overrides the earlier Hinglish/Gujlish chat rule.

Going forward:

- App Hindi uses proper Hindi script.
- App Gujarati uses proper Gujarati script.
- Predicta Hindi replies use Hindi script.
- Predicta Gujarati replies use Gujarati script.
- English terms may appear only where normal users expect them, not randomly mixed.
- No half-translated UI.

## Proposed Revival Phases

### 1. `EXECUTE_WORLD_NAVIGATION_REBUILD`

Create Vedic, KP, Nadi, Numerology, Signature as first-class navigation worlds.

### 2. `EXECUTE_DEDICATED_PREDICTA_ROOM_PAGES`

Give each world its own page, hero, visible Chat CTA, proof cards, and local nav.

### 3. `EXECUTE_ROOM_SPECIFIC_CHAT_ROUTES`

Create dedicated chat routes for Vedic, KP, Nadi, Numerology, and Signature.

### 4. `EXECUTE_ROOM_CONTEXT_PROMPT_REBUILD`

Rebuild each Predicta room prompt, data contract, proof style, and safety behavior.

### 5. `EXECUTE_NUMEROLOGY_INTELLIGENCE_REBUILD`

Make Numerology Predicta actually use name number, destiny number, birth number, personal year/month/day, compatibility, and name correction logic.

### 6. `EXECUTE_SIGNATURE_INTELLIGENCE_REBUILD`

Make Signature Predicta useful: visual traits, writing rhythm, confidence expression, consistency, improvement suggestions, and optional numerology synthesis.

### 7. `EXECUTE_DISCIPLINE_HANDOFF_REBUILD`

If user asks KP in Vedic, Vedic Predicta hands off cleanly to KP with context. Same for every room.

### 8. `EXECUTE_NATIVE_SCRIPT_CHAT_LANGUAGE_REBUILD`

Make Predicta chat use real Hindi/Gujarati script, not romanized Hinglish/Gujlish.

### 9. `EXECUTE_TRANSLATION_COMPLETION_TRUST_GATE`

Audit every prominent page and kill mixed-language UI. Missing translations fallback to English only internally, not as public launch behavior.

### 10. `EXECUTE_ROOM_REPORT_AND_PDF_REBUILD`

Each world gets its own report section and PDF output, with discipline-specific proof.

### 11. `EXECUTE_SPECIALIST_ROOM_QA_GATE`

Strict tests:

- Vedic does not answer as KP.
- KP does not answer as Vedic.
- Nadi avoids fake manuscript claims.
- Numerology actually calculates.
- Signature gives useful analysis.
- Hindi/Gujarati scripts render properly.
- Handoffs preserve context.

## Recommendation

Do not keep improving the current subtle implementation. Rebuild the product structure around the five worlds.

That is the trust fix.

Next phase to execute first:

`EXECUTE_WORLD_NAVIGATION_REBUILD`
