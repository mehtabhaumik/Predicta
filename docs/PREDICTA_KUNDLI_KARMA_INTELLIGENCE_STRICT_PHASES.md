# Predicta Kundli Karma Intelligence Strict Phases

This is the controlling roadmap for the new Kundli Karma Intelligence layer.
It is not a report-only roadmap.

Kundli Karma Intelligence must detect, rank, explain, and remedy Dosh, Shrap,
supportive Yog, challenging Yog, and Lal Kitab patterns across the deterministic
engine, web app, mobile app, Predicta intelligence, reports, translations, and
audit gates.

Reports consume this layer only after the calculation, app, and Predicta
intelligence phases are green.

## Relationship To Existing Roadmaps

- `PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md` owns final report
  voice, report structure, and golden report audits. It must consume this
  roadmap, not replace it.
- `PREDICTA_REPORT_PDF_STRICT_PHASES.md` owns PDF layout, watermark, chart-safe
  rendering, and page-level artifact audits.
- `PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md` owns AI credits,
  zero-credit deterministic chat, and local-memory-first cost control.
- `PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md` owns Jaimini Predicta.
  This roadmap only adds the alias guard that user wording such as `Gemini
  Jyotish` should be understood as `Jaimini Jyotish` and never confused with the
  Gemini AI provider.
- `PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md` owns global UI spacing,
  responsive behavior, accessibility, and app polish gates.

## Non-Negotiable Rules

1. Do not build this as random report pages.
2. Do not implement reports before deterministic calculation, app surfaces, and
   Predicta intelligence are green.
3. User-facing language must use `Dosh`, not `Dosha`.
4. User-facing language must use `Shrap`, not `Shrapa`.
5. User-facing language must use `Yog` for the pattern sections unless quoting
   a formal source title or historical competitor text.
6. Research notes may mention competitor terms such as `dosha`, `shrapa`, and
   `yoga`, but Predicta UI, reports, prompts, translations, and chat output use
   the canonical Predicta terms.
7. Never say `you are cursed`.
8. Use `karmic pressure indicator` or `karmic debt indicator` for Shrap/Dosh
   style cautions.
9. Never use Dosh or Shrap to scare users into paid remedies.
10. Premium adds depth, timing, evidence, contradiction handling, and a structured
    remedy plan. Premium must not add fear.
11. Every item must preserve exact evidence where available:
    planets, houses, signs, nakshatra/pada, aspects, lordships, D1, D9, Chalit,
    dignity, dasha, antardasha, transit trigger, and cancellation/softening
    factors.
12. Every item must explain what it means for the user, not only what the
    technical rule is.
13. Do not duplicate the same condition in Dosh, Shrap, and Yog sections. If the
    same condition appears in multiple categories, one section owns the full
    reading and the others cross-reference it.
14. Lal Kitab must remain its own clean section because its remedy language and
    house-wise reading style differ from Parashari Dosh/Yog logic.
15. Lal Kitab remedies must be safe, low-cost, non-fearful, non-medical, legal,
    and non-harmful.
16. App screens must stay calm. Show top active conditions first, then tabs/cards
    for details. Do not create a long wall.
17. Predicta must be able to explain the new layer from local deterministic
    memory without spending AI credit when the data already exists.
18. If deterministic evidence is missing, Predicta must say what is pending or
    ask for missing inputs instead of inventing an answer.
19. Web and mobile must have parity before report integration is called green.
20. Every phase must be strictly audited and committed before the next phase is
    started.

## Canonical Data Shape

Every Dosh, Shrap, and Yog item must expose:

- `id`
- `canonicalName`
- `category`: `dosh`, `shrap`, `supportive_yog`, `challenging_yog`
- `status`: `present`, `weak`, `cancelled`, `softened`, `not_present`,
  `needs_data`
- `strength`: `low`, `medium`, `high`, `very_high`
- `confidence`: `clear`, `partial`, `uncertain`
- `whyPresent`
- `evidence`
- `meaningForUser`
- `activation`
- `reducingFactors`
- `freeRemedy`
- `premiumRemedies`
- `crossReferences`
- `fearSafetyNote`

Evidence must support:

- planet
- house
- sign
- degree
- nakshatra/pada where available
- aspect
- lordship
- dignity
- D1 support
- D9 support
- Chalit support
- dasha/antardasha support
- transit trigger where available
- cancellation/softening evidence

## Required First Coverage

### Dosh

- `Manglik / Kuja`
- `Kaal Sarp`
- `Pitra`
- `Shrapit`
- `Guru Chandal`
- `Grahan`
- `Kemadruma`
- `Vish`
- `Angarak`
- `Daridra`
- `Paap Kartari`
- `Arishta / Balarishta`
- `Nadi Dosh` only in compatibility or Kundli matching context

### Shrap

The section title should be `Karmic Debt & Shrap Indicators`.

Include only where deterministic rules are available:

- `Pitru Shrap`
- `Matru Shrap`
- `Guru Shrap`
- `Sarpa / Naga Shrap`
- `Preta Shrap`
- `Bhratri / Bandhu Shrap`
- `Stree / Patni Shrap`
- `Deva / Brahma Shrap`

Each item must say `indicator` unless evidence is strong.

### Supportive Yog

- `Raja`
- `Dhana`
- `Gajakesari`
- `Panch Mahapurush`
- `Neecha Bhanga Raja`
- `Vipareeta Raja`
- `Budhaditya`
- `Chandra-Mangal`
- `Lakshmi`
- `Saraswati`
- `Adhi`
- `Dharma-Karmadhipati`
- `Parivartana`

### Challenging Yog

- `Daridra`
- `Kemadruma`
- `Shakata`
- `Paap Kartari`
- `Grahan`
- `Vish`
- `Angarak`
- `Shrapit`
- `Arishta`
- `Kuja / Manglik`
- `Kaal Sarp`

### Lal Kitab

- Lal Kitab planet-in-house reading.
- Lal Kitab Rin / Debt indicators:
  - pitra rin
  - self rin
  - maternal/family/social debts where deterministic rules are available
- Planet-wise upay.
- Do and do-not list.
- Remedy safety.
- Free output: top 3 observations and 1-2 safe remedies.
- Premium output: full house-wise reading, rin map, planet remedies, timing,
  contraindications, and 40-day/90-day plan.

## Strict Phase Order

1. `PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK`
2. `PREDICTA_KUNDLI_KARMA_PHASE_1_CANONICAL_TERMINOLOGY_LOCALIZATION_AND_SAFETY_CONTRACT`
3. `PREDICTA_KUNDLI_KARMA_PHASE_2_DETERMINISTIC_DATA_CONTRACT_AND_EVIDENCE_SCHEMA`
4. `PREDICTA_KUNDLI_KARMA_PHASE_3_DOSH_DETECTION_RANKING_AND_REMEDY_ENGINE`
5. `PREDICTA_KUNDLI_KARMA_PHASE_4_SHRAP_KARMIC_DEBT_DETECTION_AND_REMEDY_ENGINE`
6. `PREDICTA_KUNDLI_KARMA_PHASE_5_SUPPORTIVE_AND_CHALLENGING_YOG_ENGINE`
7. `PREDICTA_KUNDLI_KARMA_PHASE_6_LAL_KITAB_ENGINE`
8. `PREDICTA_KUNDLI_KARMA_PHASE_7_DEDUPING_RANKING_SNAPSHOT_AND_REMEDY_PLAN_ENGINE`
9. `PREDICTA_KUNDLI_KARMA_PHASE_8_WEB_VEDIC_APP_SURFACE`
10. `PREDICTA_KUNDLI_KARMA_PHASE_9_MOBILE_VEDIC_APP_SURFACE_PARITY`
11. `PREDICTA_KUNDLI_KARMA_PHASE_10_PREDICTA_INTELLIGENCE_LOCAL_MEMORY_INTEGRATION`
12. `PREDICTA_KUNDLI_KARMA_PHASE_11_CHAT_CTA_ZERO_CREDIT_AND_CONTEXT_HANDOFF`
13. `PREDICTA_KUNDLI_KARMA_PHASE_12_REPORT_INTEGRATION_FREE_AND_PREMIUM`
14. `PREDICTA_KUNDLI_KARMA_PHASE_13_TRANSLATION_ACCESSIBILITY_AND_NO_HARDCODED_COPY_SWEEP`
15. `PREDICTA_KUNDLI_KARMA_PHASE_14_GOLDEN_ARTIFACT_NO_GO_AUDIT`

Do not rename these phases during implementation.

## Phase 0: `PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK`

Lock the current state and research-backed scope before implementation.

### Required Work

- Audit current Vedic/Kundli calculations for existing Yog/Dosh style logic.
- Audit current report sections, Vedic app screens, mobile Vedic screens, and
  Predicta chat context.
- Record where `dosha`, `shrapa`, `yoga`, `Dosh`, `Shrap`, and `Yog` currently
  appear.
- Record which competitor ideas are adopted and rejected.
- Create a redline ledger for fear-selling, duplicated remedies, generic
  teaching language, and missing evidence.
- Confirm no implementation changes are made in Phase 0.

### Green Criteria

- Baseline audit artifact exists under
  `docs/audits/PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK/`.
- Existing calculation/report/app/chat references are inventoried.
- Competitor source matrix exists.
- Canonical wording decision is captured.
- No code implementation changes are made.

## Phase 1: `PREDICTA_KUNDLI_KARMA_PHASE_1_CANONICAL_TERMINOLOGY_LOCALIZATION_AND_SAFETY_CONTRACT`

Create the terminology, localization, and safety contract.

### Required Work

- Add canonical user-facing terms:
  - `Dosh`
  - `Shrap`
  - `Yog`
  - `Lal Kitab`
  - `Karmic Debt & Shrap Indicators`
- Add translation keys for English, Hindi, and Gujarati.
- Add blocked/fear-selling phrase list.
- Add safety copy:
  - no curse language
  - no guaranteed outcomes
  - no expensive fear-based remedy pressure
  - one remedy at a time for Lal Kitab
- Add canonical term gate that rejects user-facing `Dosha` and `Shrapa`.

### Green Criteria

- Translation JSON contains all new terms.
- No hardcoded user-facing terms are introduced.
- Gate proves user-facing output uses `Dosh` and `Shrap`.
- Fear-selling copy gate passes.

## Phase 2: `PREDICTA_KUNDLI_KARMA_PHASE_2_DETERMINISTIC_DATA_CONTRACT_AND_EVIDENCE_SCHEMA`

Build the shared deterministic data contract used by web, mobile, Predicta
memory, and reports.

### Required Work

- Add shared TypeScript types for Kundli Karma Intelligence.
- Add deterministic evidence schema.
- Add free/paid depth schema.
- Add item status, strength, confidence, activation, reduction, remedy, and
  cross-reference fields.
- Add fixtures for at least:
  - clean/no-alert chart
  - strong Dosh chart
  - strong Shrap indicator chart
  - supportive Yog chart
  - challenging Yog chart
  - Lal Kitab Rin/upay chart
  - overlapping Shrapit/Dosh/Yog dedupe chart

### Green Criteria

- Shared types compile.
- Fixtures are deterministic.
- Web, mobile, PDF, and Predicta context can import the same contract.
- No report-only contract is created.

## Phase 3: `PREDICTA_KUNDLI_KARMA_PHASE_3_DOSH_DETECTION_RANKING_AND_REMEDY_ENGINE`

Implement Dosh detection, ranking, explanation, cancellation, and remedies.

### Required Work

- Implement the first Dosh list:
  - Manglik / Kuja
  - Kaal Sarp
  - Pitra
  - Shrapit
  - Guru Chandal
  - Grahan
  - Kemadruma
  - Vish
  - Angarak
  - Daridra
  - Paap Kartari
  - Arishta / Balarishta
  - Nadi Dosh only in compatibility/matching context
- For each Dosh, output presence, strength, evidence, meaning, activation,
  reducing factors, free remedy, premium remedies, and cross-references.
- Add cancellation/softening logic where deterministic evidence supports it.
- Add tests for present, weak, cancelled, not present, and needs-data states.

### Green Criteria

- Dosh engine tests pass.
- Dosh output never uses curse/fear language.
- Every present Dosh includes exact evidence.
- Every absent Dosh avoids false alarm language.
- Nadi Dosh is blocked outside compatibility/matching context.

## Phase 4: `PREDICTA_KUNDLI_KARMA_PHASE_4_SHRAP_KARMIC_DEBT_DETECTION_AND_REMEDY_ENGINE`

Implement Shrap and karmic debt indicators carefully.

### Required Work

- Implement the section as `Karmic Debt & Shrap Indicators`.
- Include deterministic rules where available for:
  - Pitru Shrap
  - Matru Shrap
  - Guru Shrap
  - Sarpa / Naga Shrap
  - Preta Shrap
  - Bhratri / Bandhu Shrap
  - Stree / Patni Shrap
  - Deva / Brahma Shrap
- Each item must use `indicator` unless evidence is strong.
- Explain dharma remedy and maturity path without fear.
- Add cross-reference support so Shrapit is not fully duplicated across Dosh,
  Shrap, and challenging Yog sections.

### Green Criteria

- Shrap engine tests pass.
- No output says the user is cursed.
- Every present/weak indicator includes exact evidence or says what is pending.
- Cross-reference tests prevent repeated Shrapit readings.

## Phase 5: `PREDICTA_KUNDLI_KARMA_PHASE_5_SUPPORTIVE_AND_CHALLENGING_YOG_ENGINE`

Implement supportive and challenging Yog detection and interpretation.

### Required Work

- Implement supportive Yog detection for:
  - Raja
  - Dhana
  - Gajakesari
  - Panch Mahapurush
  - Neecha Bhanga Raja
  - Vipareeta Raja
  - Budhaditya
  - Chandra-Mangal
  - Lakshmi
  - Saraswati
  - Adhi
  - Dharma-Karmadhipati
  - Parivartana
- Implement challenging Yog detection for:
  - Daridra
  - Kemadruma
  - Shakata
  - Paap Kartari
  - Grahan
  - Vish
  - Angarak
  - Shrapit
  - Arishta
  - Kuja / Manglik
  - Kaal Sarp
- Explain what supports success, what creates friction, when it activates, and
  what to do.
- Add dedupe/cross-reference logic with Dosh and Shrap engines.

### Green Criteria

- Supportive Yog tests pass.
- Challenging Yog tests pass.
- Output is predictive and useful, not a method lesson.
- Dedupe tests pass for overlapping conditions.

## Phase 6: `PREDICTA_KUNDLI_KARMA_PHASE_6_LAL_KITAB_ENGINE`

Implement Lal Kitab as its own deterministic layer.

### Required Work

- Add planet-in-house Lal Kitab readings.
- Add Lal Kitab Rin/Debt indicators where deterministic rules are available.
- Add planet-wise upay.
- Add do and do-not guidance.
- Add remedy safety:
  - one remedy at a time
  - low-cost and non-fearful
  - no harmful, illegal, medical, or guaranteed claims
  - no expensive puja pressure
- Add free output: top 3 observations and 1-2 safe remedies.
- Add premium output: full house-wise reading, rin map, planet remedies, timing,
  contraindications, and 40-day/90-day plan.

### Green Criteria

- Lal Kitab engine tests pass.
- Free and premium depth outputs differ by depth, not fear.
- Remedy safety gate passes.
- Lal Kitab remains separate from the consolidated Parashari remedy plan while
  still feeding the final remedy plan.

## Phase 7: `PREDICTA_KUNDLI_KARMA_PHASE_7_DEDUPING_RANKING_SNAPSHOT_AND_REMEDY_PLAN_ENGINE`

Create the ranked snapshot and consolidated remedy plan.

### Required Work

- Rank active conditions by strength, confidence, life relevance, and current
  activation.
- Build:
  - strongest Dosh
  - strongest Yog
  - strongest Shrap/Rin indicator
  - top remedy
  - top 3 active conditions for app UI
- Deduplicate overlapping readings.
- Consolidate remedies so the same remedy is not repeated across sections.
- Separate remedies into:
  - free karma/dharma action
  - premium mantra/devata/vrata/donation/behavioral/timing/Lal Kitab upay where
    safe
  - avoid-list
  - timing guidance

### Green Criteria

- Ranking fixtures pass.
- Dedupe fixtures pass.
- Consolidated remedy plan has no duplicate remedy rows.
- Top 3 app snapshot is available from the shared contract.

## Phase 8: `PREDICTA_KUNDLI_KARMA_PHASE_8_WEB_VEDIC_APP_SURFACE`

Implement the web Vedic app surface.

### Required Work

- Add a calm Kundli Karma section to the Vedic world.
- Show only top 3 active conditions upfront.
- Add tabs/cards:
  - `Dosh`
  - `Shrap`
  - `Yog`
  - `Lal Kitab`
- Let users expand details.
- Add CTAs:
  - `Ask Predicta why this appears`
  - `Download detailed report`
- Free users see useful summary and safe basic remedies.
- Premium users see deeper evidence and remedy detail without page crowding.
- Avoid long walls, dense tables, CTA collisions, and fear language.

### Green Criteria

- Desktop, tablet, mobile, and narrow-mobile screenshots are captured.
- No overflow, clipping, cramped chips, or CTA collisions.
- Section is compact and progressive.
- Web uses the shared deterministic contract.
- Ask Predicta CTA carries section context.

## Phase 9: `PREDICTA_KUNDLI_KARMA_PHASE_9_MOBILE_VEDIC_APP_SURFACE_PARITY`

Implement mobile parity for the Vedic Kundli Karma surface.

### Required Work

- Add the same top 3 snapshot.
- Add mobile-safe tabs/cards or stack links.
- Add expandable details.
- Add the same CTAs and context handoff.
- Ensure touch targets, spacing, scroll behavior, and empty/loading/error states
  are clean.

### Green Criteria

- Native/mobile tests pass.
- Mobile screenshots/proofs exist.
- Mobile uses the shared deterministic contract.
- No lower-quality mobile path exists.

## Phase 10: `PREDICTA_KUNDLI_KARMA_PHASE_10_PREDICTA_INTELLIGENCE_LOCAL_MEMORY_INTEGRATION`

Update Predicta intelligence before report integration.

### Required Work

- Add Kundli Karma modules to Predicta memory:
  - Dosh
  - Shrap
  - Yog
  - Lal Kitab
- Add Jaimini Jyotish alias handling:
  - user `Gemini Jyotish` means Jaimini Jyotish
  - Gemini AI provider remains provider terminology only
- Add local-memory-first router for these modules.
- Add provider-decision labels:
  - `local_memory_answer`
  - `deterministic_action`
  - `missing_data_question`
  - `ai_required`
  - `blocked_needs_credit`
- Predicta must explain:
  - why a pattern appears
  - what evidence supports it
  - what it means
  - what activates it
  - what softens it
  - free vs premium depth
  - safe remedies
- Predicta must avoid AI when deterministic/local memory has the answer.

### Green Criteria

- Predicta can answer Dosh/Shrap/Yog/Lal Kitab questions from local memory.
- Predicta can explain top 3 active conditions after a Kundli is available.
- Predicta can explain missing/pending data honestly.
- No OpenAI/Gemini call is made for deterministic/local-memory answers.
- Web and mobile context builders include the new memory.

## Phase 11: `PREDICTA_KUNDLI_KARMA_PHASE_11_CHAT_CTA_ZERO_CREDIT_AND_CONTEXT_HANDOFF`

Wire user interaction from app sections to Predicta chat.

### Required Work

- `Ask Predicta why this appears` must pass:
  - active Kundli id
  - section type
  - item id
  - evidence summary
  - free/premium mode
  - selected language
- Zero-credit users must still get deterministic explanations.
- Deeper open-ended synthesis must use the correct AI-credit gate.
- Add quick prompts for:
  - explain my strongest Dosh
  - explain my Shrap indicator
  - explain my strongest supportive Yog
  - explain my strongest challenging Yog
  - explain my Lal Kitab remedy

### Green Criteria

- Chat handoff works on web and mobile.
- Zero-credit deterministic answers work.
- AI-credit gated follow-ups preserve the user question.
- Context survives navigation where the current memory system supports it.

## Phase 12: `PREDICTA_KUNDLI_KARMA_PHASE_12_REPORT_INTEGRATION_FREE_AND_PREMIUM`

Only now integrate reports.

### Required Work

- Add report chapter after core charts and Mahadasha, before final remedy plan:
  1. `Kundli Karma Snapshot`
  2. `Dosh In Your Kundli`
  3. `Karmic Debt & Shrap Indicators`
  4. `Positive Yog`
  5. `Challenging Yog`
  6. `Lal Kitab Reading`
  7. `One Consolidated Remedy Plan`
- Free reports show lists, summaries, key evidence, and safe basic remedies.
- Premium reports show item-by-item detail, timing, cancellation, activation,
  contradiction handling, and detailed remedy plan.
- Reports must consume the same shared contract used by the app and Predicta
  memory.

### Green Criteria

- Free and premium PDF artifacts are generated.
- Extracted text proves prediction-first language.
- No duplicate remedies.
- No fear-selling.
- No user-facing `Dosha` or `Shrapa`.
- Report sections match app/Predicta intelligence data.

## Phase 13: `PREDICTA_KUNDLI_KARMA_PHASE_13_TRANSLATION_ACCESSIBILITY_AND_NO_HARDCODED_COPY_SWEEP`

Audit translations, accessibility, and hardcoded copy.

### Required Work

- English/Hindi/Gujarati translations for all new labels, descriptions, CTAs,
  safety text, and report headings.
- No hardcoded user-facing copy in components/functions.
- Accessibility audit for tabs/cards, expanders, CTAs, and report download
  nudges.
- Verify language does not mix English/Hindi/Gujarati incorrectly.

### Green Criteria

- Translation gates pass.
- Accessibility checks pass.
- Hidden drawers/expanders are covered.
- No hardcoded user-facing copy remains for this layer.

## Phase 14: `PREDICTA_KUNDLI_KARMA_PHASE_14_GOLDEN_ARTIFACT_NO_GO_AUDIT`

Final no-go audit for the whole Kundli Karma layer.

### Required Work

- Generate deterministic fixtures.
- Capture web screenshots.
- Capture mobile screenshots/proofs.
- Generate free and premium Vedic PDFs.
- Extract report text.
- Audit Predicta chat local-memory responses.
- Audit AI provider logs for avoided calls.
- Produce Critical/Major/Medium/Minor ledger.

### Green Criteria

- Zero Critical issues.
- Zero Major issues.
- All phase gates remain green.
- Web/mobile/report/Predicta intelligence all consume the same data.
- Predicta explains the layer without unnecessary AI usage.
- The app feels calm, helpful, and non-fearful.
