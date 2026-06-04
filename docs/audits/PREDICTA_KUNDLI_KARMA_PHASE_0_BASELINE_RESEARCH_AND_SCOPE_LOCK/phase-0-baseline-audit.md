# PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK

## Verdict

Phase 0 is a baseline, research, and scope-lock phase only. It is not an
implementation phase.

Status after this artifact set: `GREEN FOR BASELINE ONLY`.

Green means:

- current repo references were inventoried
- source matrix exists
- rule candidate registry exists
- Predicta intelligence gaps were captured
- redlines were locked before implementation
- no code implementation changes were made

It does not mean Kundli Karma Intelligence is implemented.

## Canonical Wording Lock

Predicta must use:

- `Dosh`
- `Shrap`
- `Yog`
- `Lal Kitab`

Predicta must not use user-facing `Dosha`, `Shrapa`, or `Yoga` for the new
Kundli Karma feature family except when quoting/referencing external source
titles or historical/internal code identifiers during migration.

## Current State Summary

The app already exposes partial Yog/Dosh-like language, but it is not a real
Kundli Karma Intelligence layer yet.

- Backend calculation currently has a shallow `infer_yogas()` function that
  recognizes only a few simple patterns and falls back to a generic pattern.
- Backend types expose `YogaInsight` with only `name`, `strength`, and
  `meaning`; there is no evidence, activation, cancellation, remedy, or source
  contract.
- Shared astrology code has `advancedJyotishCoverage.yogaDoshaInsights`, but it
  mixes recognized yogas and softened care patterns without the new Dosh/Shrap/
  Yog/Lal Kitab taxonomy.
- Web and mobile show an `Advanced Jyotish` panel, not a dedicated Kundli Karma
  surface with calm tabs and top active conditions.
- PDF output has a generic Yog section and Advanced Jyotish coverage section,
  but no report chapter for Dosh, Shrap, Yog, Lal Kitab, or consolidated remedy
  planning.
- Predicta chat/prompt context recognizes words like yoga, dosha, manglik, kaal
  sarp, kemadruma, and Lal Kitab, but the intelligence does not yet have a
  deterministic structured memory layer for the requested additions.

## Current Calculation Inventory

Audited references:

- `backend/astro_api/calculations.py`
- `backend/astro_api/models.py`
- `packages/astrology/src/advancedJyotishEngine.ts`
- `packages/astrology/src/predictaChatActions.ts`
- `packages/astrology/src/chartInsights.ts`
- `apps/web/components/WebAdvancedJyotishPanel.tsx`
- `apps/mobile/src/components/AdvancedJyotishPanel.tsx`
- `apps/mobile/src/services/ai/contextBuilder.ts`
- `apps/mobile/src/services/ai/aiRouter.ts`
- `backend/astro_api/ai.py`
- `packages/pdf/src/index.ts`
- `packages/pdf/src/reportDocument.tsx`
- `packages/pdf/src/reportArchitecture.ts`

Findings:

- Existing backend Yog logic is not broad enough for the requested rule catalog.
- Existing care-pattern logic has useful ethical framing, but it is not
  deterministic evidence-grade enough for final user/report output.
- Lal Kitab is currently recognized as a chat topic, not implemented as a
  house-based reading/remedy module.
- Shrap is not implemented as its own taxonomy.
- Dosh is not implemented as its own taxonomy.
- Yog is not split into supportive and challenging outputs with activation and
  reduction logic.
- Remedy planning is not centralized across these conditions.

## Current Report Inventory

Audited report references:

- `packages/pdf/src/index.ts`
- `packages/pdf/src/reportDocument.tsx`
- `packages/pdf/src/vedicReportValueContract.ts`
- `packages/pdf/src/reportArchitecture.ts`

Findings:

- Reports mention yogas and doshas in the broad Vedic report promise.
- The current report section titled `Recognized chart patterns` does not satisfy
  the requested item-by-item Dosh/Shrap/Yog evidence structure.
- Advanced Jyotish coverage is still too broad and cannot become the new feature
  by renaming alone.
- Report implementation must wait until the deterministic app/intelligence
  layer exists. Report-first implementation is explicitly forbidden.

## Current App Surface Inventory

Audited app references:

- `apps/web/components/WebAdvancedJyotishPanel.tsx`
- `apps/web/components/WebChartsExplorer.tsx`
- `apps/web/components/WebPridictaChat.tsx`
- `apps/web/components/WebDossierPreview.tsx`
- `apps/mobile/src/components/AdvancedJyotishPanel.tsx`
- `apps/mobile/src/screens/ChartsScreen.tsx`
- `apps/mobile/src/screens/ChatScreen.tsx`

Findings:

- Web and mobile have Advanced Jyotish cards but no clean Kundli Karma area.
- Existing UI is not organized as canonical `Dosh`, `Shrap`, `Yog`, and
  `Lal Kitab` sections.
- App screens must show only top active conditions upfront, with progressive
  disclosure for deeper details.
- The app must not become a long fear-heavy Kundli wall.

## Current Predicta Intelligence Inventory

Audited intelligence references:

- `backend/astro_api/ai.py`
- `backend/astro_api/ai_prompt_efficiency.py`
- `packages/astrology/src/predictaChatActions.ts`
- `apps/mobile/src/services/ai/aiRouter.ts`
- `apps/mobile/src/services/ai/contextBuilder.ts`
- `apps/web/components/WebPridictaChat.tsx`

Findings:

- Predicta can currently detect astrology intent around yoga/dosha/Lal Kitab.
- Predicta does not yet have a local deterministic Kundli Karma memory packet.
- Predicta does not yet know the new canonical wording rule.
- Predicta does not yet know how to answer Dosh/Shrap/Yog/Lal Kitab questions
  without AI when deterministic output exists.
- Predicta must be upgraded after deterministic modules are implemented, not
  taught to hallucinate missing calculations.

## Competitor Ideas Adopted

- Broad Dosh coverage, but with exact evidence and non-scary language.
- Yog catalogs, but with activation, strength, and useful prediction.
- Lal Kitab as a separate house-based remedial layer.
- Rin/debt indicators only where deterministic rules are reliable.
- Remedies that are practical, low-cost, and non-fearful.
- Long-form premium detail, but only after calm app summaries exist.

## Competitor Ideas Rejected

- Fear-selling.
- Curse language.
- Expensive remedy pressure.
- Generic one-size remedy lists.
- Technical teaching as the main user value.
- Report-only implementation.
- AI-generated detections without deterministic evidence.
- Duplicating one condition across Dosh, Shrap, Yog, and remedies as separate
  unrelated claims.

## Phase 0 Non-Implementation Confirmation

No source code behavior, UI behavior, calculation engine, report renderer, chat
router, entitlement logic, or localization behavior is changed in this phase.

The only permitted Phase 0 changes are audit and scope-lock artifacts in this
directory.
