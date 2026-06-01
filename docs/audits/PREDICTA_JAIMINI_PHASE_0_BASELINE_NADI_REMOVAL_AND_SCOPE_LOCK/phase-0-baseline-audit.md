# PREDICTA_JAIMINI_PHASE_0_BASELINE_NADI_REMOVAL_AND_SCOPE_LOCK

Status: GREEN after evidence lock and strict audit.

This phase does not implement the Jaimini migration. It locks the current Nadi
dependency baseline and the exact replacement scope before any code-level
removal or rename begins.

## Evidence Artifacts

- `artifacts/nadi-reference-files.txt`
  - full repository Nadi file inventory, including historical audit artifacts.
- `artifacts/nadi-reference-inventory.txt`
  - full repository `rg "Nadi|nadi|NADI"` inventory, including historical audit
    artifacts.
- `artifacts/nadi-reference-counts-by-top-path.txt`
  - full repository counts by top-level path.
- `artifacts/nadi-reference-line-counts.txt`
  - full repository file and match-line totals.
- `artifacts/active-nadi-reference-files.txt`
  - active migration inventory excluding `docs/audits/**`.
- `artifacts/active-nadi-reference-inventory.txt`
  - active migration match inventory excluding `docs/audits/**`.
- `artifacts/active-nadi-reference-counts-by-top-path.txt`
  - active migration counts by top-level path.
- `artifacts/active-nadi-reference-line-counts.txt`
  - active migration file and match-line totals.

## Inventory Totals

Full repository scan:

- `209` files contain `Nadi`, `nadi`, or `NADI`.
- `2377` matching lines were captured.

Active migration scan, excluding historical audit artifacts:

- `137` active files contain `Nadi`, `nadi`, or `NADI`.
- `1965` active matching lines were captured.

Active count by top-level area:

- `apps`: `41` files.
- `scripts`: `37` files.
- `packages`: `27` files.
- `docs`: `18` files.
- `backend`: `10` files.
- root docs/config: `4` files.

## Must-Audit Coverage Review

### Web Routes And Components

Active Nadi web dependencies exist in:

- `apps/web/app/dashboard/nadi/page.tsx`
- `apps/web/app/dashboard/nadi/chat/page.tsx`
- `apps/web/components/WebNadiPredictaLoader.tsx`
- `apps/web/components/WebNadiPredictaPanel.tsx`
- `apps/web/components/WebDossierPreview.tsx`
- `apps/web/components/DashboardShell.tsx`
- `apps/web/components/WebHeader.tsx`
- `apps/web/components/PredictaWorldFrame.tsx`
- `apps/web/lib/predicta-chat-cta.ts`
- `apps/web/lib/web-auto-save-memory.ts`
- safety, feedback, founder, Vedic, redeem-pass, and accuracy pages.

Replacement scope:

- create Jaimini route(s) and navigation.
- either delete or redirect legacy Nadi routes through a controlled migration
  route.
- replace Nadi web panels with a prediction-first Jaimini room, not a renamed
  panel.
- update report marketplace lanes and Life Atlas composer copy.

### Mobile Screens

Active Nadi mobile dependencies exist in:

- `apps/mobile/src/screens/NadiPredictaScreen.tsx`
- `apps/mobile/src/navigation/RootNavigator.tsx`
- `apps/mobile/src/navigation/routes.ts`
- `apps/mobile/src/screens/ChatScreen.tsx`
- `apps/mobile/src/screens/HomeScreen.tsx`
- `apps/mobile/src/screens/ReportScreen.tsx`
- `apps/mobile/src/store/useAppStore.ts`
- `apps/mobile/src/types/astrology.ts`
- mobile AI context/router files.

Replacement scope:

- add `JaiminiPredictaScreen`.
- replace route types and navigator entries.
- update mobile report selection and chat context.
- keep mobile screen stack-safe, not table-heavy.

### Shared Astrology Types And Deterministic Modules

Active Nadi shared-package dependencies exist in:

- `packages/types/src/astrology.ts`
- `packages/astrology/src/nadiJyotishPlan.ts`
- `packages/astrology/src/chartLayout.ts`
- `packages/astrology/src/predictaChatActions.ts`
- `packages/astrology/src/predictaIntelligenceUiPattern.ts`
- `packages/astrology/src/lifeAtlasReport.ts`
- `packages/astrology/src/chartInsights.ts`
- `packages/astrology/src/chatChartBlocks.ts`
- `packages/astrology/src/schoolReadiness.ts`
- `packages/config/src/predictaMemory.ts`
- `packages/config/src/pricing.ts`

Replacement scope:

- create a real Jaimini deterministic module, not a renamed Nadi module.
- introduce `JAIMINI` school type and Jaimini data contract.
- replace `nadiJyotishPlan` references with `jaiminiPlan` only after the
  deterministic contract exists.
- remove Nadi chart-preview logic and replace with Jaimini-specific chart/data
  surfaces.

### Backend AI, Chat Prompts, Safety, And Governance

Active backend dependencies exist in:

- `backend/astro_api/ai.py`
- `backend/astro_api/ai_batch_qa.py`
- `backend/astro_api/ai_prompt_efficiency.py`
- `backend/astro_api/red_team_evals.py`
- `backend/astro_api/release_governance.py`
- `backend/astro_api/report_ai_pipeline.py`
- `backend/astro_api/safety.py`
- `backend/astro_api/safety_audit.py`
- backend tests.

Replacement scope:

- replace Nadi room memory with Jaimini room memory.
- replace Nadi deterministic reply path with Jaimini deterministic reply path.
- update release governance from KP/Nadi to KP/Jaimini.
- keep a red-team check that prevents fake Nadi/palm-leaf claims if users ask
  about old Nadi behavior.
- update AI batch/report QA to catch stale Nadi references and Jaimini method
  mixing.

### Reports And PDF

Active report/PDF dependencies exist in:

- `packages/pdf/src/index.ts`
- `packages/pdf/src/reportDocument.tsx`
- `packages/pdf/src/translations/reportLabels.json`
- `apps/web/components/WebDossierPreview.tsx`
- `apps/mobile/src/screens/ReportScreen.tsx`
- `backend/astro_api/report_ai_pipeline.py`

Replacement scope:

- add Jaimini report type and report lane.
- remove Nadi free/premium report generation from active user flows.
- update report labels and entitlement handling.
- update PDF QA and golden cases in later phases.

### Life Atlas

Active Life Atlas Nadi dependencies exist in:

- `packages/astrology/src/lifeAtlasReport.ts`
- `docs/PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md`
- `apps/web/components/WebDossierPreview.tsx`
- `backend/astro_api/ai.py`
- Life Atlas QA/report scripts and historical fixtures.

Replacement scope:

- Life Atlas inputs become Vedic, KP, Jaimini, Numerology, optional Signature.
- Jaimini contributes soul role, visible identity, career dharma, relationship
  mirror, and Chara Dasha chapter.
- Life Atlas must stay non-technical in the main body.

### Localization And Native Copy

Active translation dependencies exist in:

- `packages/config/src/translations/accuracyMethod.json`
- `packages/config/src/translations/language.json`
- `packages/config/src/translations/nativeCopy.json`
- `packages/config/src/translations/testimonialTrust.json`
- `packages/config/src/translations/ui.json`
- `packages/config/src/translations/webGrowthAdvantage.json`
- `packages/pdf/src/translations/reportLabels.json`
- component-level hardcoded fallback strings.

Replacement scope:

- add Jaimini English, Hindi, and Gujarati copy.
- remove stale user-facing Nadi copy.
- keep migration-only Nadi references only in roadmap/audit evidence or old
  route redirect explanations.
- do not hardcode translations in components.

### QA Scripts And Release Gates

Active Nadi references exist in:

- `scripts/run-kp-nadi-predicta-strict-phase-gate.mjs`
- `scripts/run-kundli-value-phase-7-gate.mjs`
- `scripts/run-specialist-room-qa-gate.mjs`
- `scripts/run-discipline-handoff-contract.mjs`
- `scripts/run-pre-live-phase-16-predicta-mastery-gate.mjs`
- `scripts/run-pdf-report-golden-output-gate.mjs`
- public greenlight, animation, buyer, report, and UI gate scripts.

Replacement scope:

- split or rename KP/Nadi gates into KP/Jaimini or school-boundary gates.
- include Jaimini route/report/chat coverage.
- add grep-based stale-Nadi gate after migration phases.
- preserve historical artifacts but prevent them from being active release
  expectations.

### Docs And Roadmaps

Active docs still describe Nadi in current or historical phase language.

Must update or supersede:

- `docs/PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md`
- `docs/PREDICTA_KP_NADI_PREDICTA_STRICT_PHASE.md`
- `docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md`
- `docs/PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md`
- `docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md`
- `docs/PREDICTA_AI_MODEL_ORCHESTRATION_ULTRA_STRICT_PHASES.md`
- `docs/PREDICTA_PRE_LIVE_RUTHLESS_AUDIT_REMEDIATION_PHASES.md`
- `docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md`
- `docs/Predicta_Chat_Enhancements.md`
- `docs/README.md`
- root release/safety/execution docs.

Historical audit artifacts should remain immutable unless a later cleanup phase
explicitly archives them. They are not user-facing, but they explain why the old
Nadi work existed.

## Jaimini Replacement Inventory

Phase 1 and later must create or update these replacement surfaces:

- `Jaimini Predicta` navigation label.
- `/dashboard/jaimini` route.
- `/dashboard/jaimini/chat` route.
- mobile Jaimini route/screen.
- `JAIMINI` school enum/type.
- `jaiminiPlan` deterministic shared contract.
- `charaKarakas`.
- `atmakaraka`.
- `amatyakaraka`.
- `darakaraka`.
- `karakamsha`.
- `swamsa`.
- `arudhaLagna`.
- `upapadaLagna`.
- `jaiminiAspects`.
- `charaDashaTimeline`.
- `currentCharaDasha`.
- Jaimini web room.
- Jaimini mobile room.
- Jaimini free report.
- Jaimini premium report.
- Jaimini report entitlement/credit.
- Jaimini translation keys.
- Jaimini chat/memory prompt boundary.
- Jaimini release governance and QA gates.
- Life Atlas Jaimini evidence layer.

## Migration Risk Map

### Critical Risk: Rename-Only Migration

Nadi is not a valid foundation for Jaimini. `nadiJyotishPlan` must not be
renamed into `jaiminiPlan` without replacing the calculation and interpretation
logic.

Required prevention:

- Phase 2 must introduce deterministic Jaimini calculations.
- Phase 3 must rebuild the interpretation language.
- Phase 7 must generate actual Jaimini free and premium PDFs before green.

### Critical Risk: Hidden Prompt Memory Drift

`backend/astro_api/ai.py`, `packages/config/src/predictaMemory.ts`, and related
chat/action packages contain many Nadi room rules. A stale prompt would make
Predicta claim the wrong specialist model even if UI is changed.

Required prevention:

- Phase 6 must grep and sample chat transcripts.
- specialist-room QA must fail on stale Nadi output after migration.

### Critical Risk: Report Marketplace Entitlement Drift

Nadi appears in report lanes, report credits, pricing, PDF labels, and report QA.
Replacing the label without aligning entitlements can break checkout/report
generation.

Required prevention:

- Phase 9 must smoke Jaimini report credits and purchase-safe report generation.
- Report page must show Jaimini lane cleanly and no Nadi lane.

### Major Risk: Life Atlas Token Mention

Life Atlas could mention Jaimini without using meaningful Jaimini evidence.

Required prevention:

- Phase 8 must prove Life Atlas uses actual Jaimini data for soul role, visible
  identity, career dharma, relationship mirror, and destiny chapter.

### Major Risk: Translation Drift

Nadi appears in JSON translations and component fallback strings. Without a
strict localization phase, English/Hindi/Gujarati may show mixed Nadi/Jaimini
copy.

Required prevention:

- Phase 10 must pass translation trust and native-script checks.
- no hardcoded Jaimini/Nadi copy should remain in components except route
  migration logic.

### Major Risk: Old Audit Artifacts Polluting Grep Gates

Historical artifacts contain Nadi references by design. A naive `rg` gate will
keep failing forever.

Required prevention:

- Future stale-Nadi gates must distinguish active code/user-facing docs from
  historical audit artifacts.
- Historical artifacts can stay under `docs/audits/**` unless an archive phase
  says otherwise.

## Docs Superseded Or Requiring Update

Superseded as active execution roadmaps:

- `docs/PREDICTA_KP_NADI_PREDICTA_STRICT_PHASE.md`
- Nadi portions of `docs/PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md`
- Nadi portions of `docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md`

Must be updated during later phases:

- `docs/PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md`
- `docs/PREDICTA_REPORT_PDF_STRICT_PHASES.md`
- `docs/PREDICTA_AI_MODEL_ORCHESTRATION_ULTRA_STRICT_PHASES.md`
- `docs/PREDICTA_PRE_LIVE_RUTHLESS_AUDIT_REMEDIATION_PHASES.md`
- `docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md`
- `docs/Predicta_Chat_Enhancements.md`
- `docs/README.md`
- `PREDICTA_EXECUTION_PHASES.md`
- `PREDICTA_RELEASE_GOVERNANCE.md`
- `PREDICTA_SAFETY_PROTOCOLS.md`

Already aligned:

- `docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md`
  - now references Jaimini report credits and the Jaimini replacement roadmap.

## Phase 0 Green Criteria Audit

- `rg "Nadi|nadi|NADI"` inventory is saved in phase evidence: PASS.
- Active migration inventory excluding historical audit artifacts is saved:
  PASS.
- Replacement scope is locked before implementation: PASS.
- Migration risk map exists: PASS.
- Docs to supersede/update are listed: PASS.
- No product implementation was started in this phase: PASS.
- Dirty tree will contain only Phase 0 evidence before commit: PASS after final
  git audit.

Phase 0 can be called green only after `git diff --check`, artifact presence
checks, and final `git status --short` review pass.
