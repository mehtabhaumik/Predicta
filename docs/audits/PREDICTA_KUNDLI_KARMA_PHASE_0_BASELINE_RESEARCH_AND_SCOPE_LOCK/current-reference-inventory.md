# Current Reference Inventory

## Search Terms Audited

Terms searched across app, backend, shared astrology packages, PDF, config, and
scripts:

- `dosha`
- `dosh`
- `shrap`
- `shrapa`
- `yoga`
- `yog`
- `lal kitab`
- `Lal Kitab`
- `Kundli Karma`
- `advancedJyotish`
- `Advanced Jyotish`

## Active Runtime References

| Area | File | Current Reference | Phase 0 Risk |
|---|---|---|---|
| Backend calculations | `backend/astro_api/calculations.py` | `infer_yogas()` detects a tiny set of patterns. | Too shallow for Kundli Karma. |
| Backend types | `backend/astro_api/models.py` | `YogaInsight` only has `name`, `strength`, `meaning`. | No evidence/status/activation/remedy/source contract. |
| Backend AI | `backend/astro_api/ai.py` | Intent regex and prompts include yoga, dosha, manglik, kaal sarp, kemadruma, Lal Kitab. | Predicta may talk about topics before deterministic outputs exist. |
| Backend prompt compaction | `backend/astro_api/ai_prompt_efficiency.py` | Compacts `advancedJyotishCoverage` and `yogas`. | No Kundli Karma memory packet. |
| Shared action layer | `packages/astrology/src/predictaChatActions.ts` | Detects advanced Jyotish/yoga/dosha/Lal Kitab intent and composes existing coverage. | Zero-credit deterministic support is incomplete for new modules. |
| Shared Advanced Jyotish | `packages/astrology/src/advancedJyotishEngine.ts` | `yoga-dosha` module and `yogaDoshaInsights`. | Taxonomy and wording do not match Dosh/Shrap/Yog/Lal Kitab. |
| Shared chart insights | `packages/astrology/src/chartInsights.ts` | Mentions D1, yogas, and technical evidence. | Can support evidence later but not enough for new feature. |
| Web app | `apps/web/components/WebAdvancedJyotishPanel.tsx` | Displays Advanced Jyotish patterns and module cards. | Not a dedicated Kundli Karma UI. |
| Web chat | `apps/web/components/WebPridictaChat.tsx` | AI-intent detection includes yoga/dosha. | AI credit routing must not be wasted for deterministic answers later. |
| Web dossier | `apps/web/components/WebDossierPreview.tsx` | Mentions planet strength and yogas. | Report preview must not misrepresent missing Kundli Karma modules. |
| Mobile UI | `apps/mobile/src/components/AdvancedJyotishPanel.tsx` | Displays first Advanced Jyotish pattern. | No mobile Kundli Karma parity. |
| Mobile AI router | `apps/mobile/src/services/ai/aiRouter.ts` | Regex detects yoga/dosha/Lal Kitab. | Needs deterministic routing once modules exist. |
| Mobile context builder | `apps/mobile/src/services/ai/contextBuilder.ts` | Passes compact Advanced Jyotish and yogas. | Needs Kundli Karma memory packet. |
| PDF report | `packages/pdf/src/index.ts` | Builds generic Yog and Advanced Jyotish sections. | Report must wait until app/intelligence modules are implemented. |
| PDF document | `packages/pdf/src/reportDocument.tsx` | Section pack can include `yogas`. | Needs final report architecture update in later phase. |
| Pricing copy | `packages/config/src/pricing.ts` | Premium depth mentions yogas and remedies. | Future packaging must align with real implementation. |
| Translations | `packages/config/src/translations/ui.json` | UI copy references yogas/advanced Jyotish. | Needs canonical Dosh/Shrap/Yog localization in later phase. |

## Existing Internal/Historical References

Some historical docs/audits contain the requested roadmap terms. These are not
runtime implementation and must not be mistaken for green behavior.

## Phase 0 Conclusion

Predicta has adjacent foundations, but no actual Kundli Karma Intelligence layer
exists yet. Later phases must build deterministic calculations first, then app
surfaces, then Predicta intelligence, then reports.
