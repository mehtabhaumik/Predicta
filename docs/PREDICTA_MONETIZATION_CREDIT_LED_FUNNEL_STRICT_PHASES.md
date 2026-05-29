# Predicta Monetization Credit-Led Funnel Strict Phases

## Purpose

Predicta must become a signed-in, credit-led product that gives free users real
value without creating uncontrolled AI cost. The app must not abandon users when
free AI credits are exhausted. Instead, Predicta chat must continue in
zero-credit deterministic mode for Kundli creation, chart surfaces, saved
profiles, reports, Family Vault, navigation, and deterministic astrology
modules.

This roadmap is a monetization and entitlement spine only. It builds on the
existing AI-model, payment, report, localization, and UI audit roadmaps. It must
not overwrite those contracts.

## Market Learning From Melooha

Melooha's public App Store, Google Play, and FAQ surfaces show a useful pattern:
questions, reports, compatibility, and family/shared product access are
monetized as consumable packs/product banks rather than only subscriptions.

Predicta should adopt the product-bank idea with better transparency:

- Free signed-in users receive clear starter value.
- Paid question credits are non-expiring consumables.
- Paid report credits are non-expiring consumables.
- Premium remains a subscription for serious users, but not fake unlimited AI.
- Family Vault can share purchased credits through an explicit Family Bank.
- Private chat/report history remains private unless the user explicitly shares
  it.

Predicta must not copy confusing high-ticket pricing blindly. Predicta should
win through transparent credits, specialist worlds, web + mobile parity, and
trustworthy cost boundaries.

## Non-Negotiable Rules

1. No personalized generation without sign-in.
2. Google sign-in must be the primary path and must be audited on web and
   mobile.
3. Free AI credits are lifetime starter credits, not daily resets.
4. Free users receive exactly `3` lifetime Predicta AI questions.
5. Free users can save exactly `4` Kundlis total.
6. Premium users can generate and save unlimited Kundlis, protected by invisible
   abuse limits.
7. Family comparison must accept minimum `2` and maximum `4` Kundlis per
   comparison.
8. Free users must still receive deterministic value after AI credits are
   exhausted.
9. AI credit must never be consumed for deterministic actions.
10. Server-side Firebase UID entitlement state is the source of truth. Client
    state is only UI cache.
11. `localStorage`, app store state, or device identifiers must never be trusted
    as the quota authority.
12. Free reports must be deterministic or tightly templated unless a paid report
    credit is consumed.
13. Premium report AI pipeline may use OpenAI premium writing and Gemini
    validation only for paid/high-value report paths.
14. No Gemini validator for free chat or free reports.
15. Free AI answers must be concise and token-capped.
16. The fourth free AI question attempt must preserve the user's question and
    show a purchase/upgrade path without losing context.
17. Paid question/report credits do not expire unless a future legal/payment
    policy explicitly changes this.
18. Family Bank credits can be shared, but private chat text, raw signature
    images, and private report history are not shared automatically.
19. Razorpay-disabled states must remain honest and non-throwing until Razorpay
    is actually wired.
20. Every phase must be strictly audited and committed before the next phase is
    started.

## Existing Roadmap Boundaries

This roadmap must build on:

- `PREDICTA_AI_MODEL_ORCHESTRATION_ULTRA_STRICT_PHASES.md` for provider routing,
  telemetry, prompt efficiency, and cost governance.
- `PREDICTA_PRE_LIVE_RUTHLESS_AUDIT_REMEDIATION_PHASES.md` Phase 7 for
  Razorpay-ready payment states.
- `PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md` for payment/auth/report/chat UI
  quality.
- `PREDICTA_REPORT_PDF_STRICT_PHASES.md` for report rules and PDF parity.
- `PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md` for public trust and
  monetization-surface quality.

This roadmap must not redefine PDF layout, AI model pins, payment gateway
signature verification, or general UI design-system rules except where
entitlement and credit behavior require integration.

## Approved Product Model

### Free Signed-In

- `3` lifetime Predicta AI questions.
- `4` saved Kundlis total.
- Deterministic daily guidance, Vedic/Numerology/KP/Nadi/Signature surfaces
  where data exists.
- Deterministic/free report generation.
- Family Vault assignment using saved Kundlis.
- Family comparison preview when `2-4` Kundlis are selected.
- Upgrade path when asking for AI synthesis, premium report AI, or more saved
  Kundlis.

### Question Packs

- Non-expiring paid AI question credits.
- Usable across Vedic, KP, Nadi, Numerology, Signature, and Life Atlas chat.
- Exact balance shown before and after use.
- One credit is consumed only when a real AI provider call is made.
- Failed provider calls must not consume a credit unless a successful answer was
  returned.

### Report Packs

- Non-expiring paid report credits.
- School-specific or bundle-specific:
  - Vedic report credit
  - KP report credit
  - Nadi report credit
  - Numerology report credit
  - Signature report credit
  - Life Atlas report credit
  - report bundle credit
- Free deterministic reports do not consume premium AI credits.
- Premium AI report writing consumes the appropriate report credit.

### Premium

- Unlimited Kundlis with invisible abuse protection.
- Monthly AI allowance or generous fair-use allowance, not uncontrolled
  unlimited provider calls.
- Discounted question/report packs.
- Premium reports use stronger writing/finalization and validator QA only where
  cost is justified.

### Family Bank

- A signed-in owner can share purchased question/report credits with Family
  Vault members.
- Family Bank balance is separate from private personal chat history.
- A family member can use shared credits only after the owner explicitly enables
  sharing.
- Family comparison requires `2-4` selected Kundlis.

## Zero-Credit Predicta Chat Contract

After free AI credits are exhausted, Predicta chat must still help without AI.

Zero-credit mode can:

- Create Kundli from chat using deterministic/rule-based birth detail parsing.
- Ask for missing birth details.
- Resolve birth place candidates when local data is enough.
- Generate deterministic Kundli charts.
- Save/open/switch Kundlis when entitlement allows it.
- Show chart snapshot: Lagna, Moon sign, Nakshatra, current dasha, strong and
  weak houses.
- Show Mahadasha, Gochar, Sade Sati, Panchang, daily briefing, yearly
  horoscope, remedies, Purushartha, Chalit, KP foundation, Nadi plan,
  Numerology profile, Life Atlas preview, and report brief from deterministic
  modules.
- Route users to Vedic, KP, Nadi, Numerology, Signature, Reports, Family Vault,
  pricing, checkout, settings, and help surfaces.
- Generate deterministic/free reports.
- Explain account status, limits, balances, and what to buy next using static
  copy.

Zero-credit mode must not:

- Call OpenAI or Gemini.
- Spend a free or paid AI credit.
- Pretend a deterministic module is an AI answer.
- Give open-ended personalized synthesis that requires provider generation.
- Consume AI budget for birth detail extraction when rules can parse the input.
- Consume AI budget for Kundli creation.
- Consume AI budget for app navigation or saved-profile operations.

Required exhausted-credit copy:

```text
Your 3 free AI questions are used. I can still help with Kundli creation,
charts, dasha, gochar, panchang, remedies, saved profiles, reports, and Family
Vault using Predicta's calculation engine. For deeper personalized AI answers,
unlock more questions.
```

Required quick actions:

- `Create Kundli`
- `Show my chart`
- `Current Mahadasha`
- `Today's Gochar`
- `Generate free report`
- `Family Vault`
- `Buy AI questions`

## Strict Phase Order

### PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK

Lock the current monetization, auth, AI-budget, saved-Kundli, report, and Family
Vault behavior before making changes.

Required work:

- Audit web and mobile sign-in paths.
- Audit Google sign-in config, error states, redirect/popup behavior, and
  missing Firebase config behavior.
- Audit current free/premium usage limits.
- Audit all AI provider call paths.
- Audit web and mobile Kundli save/generation limits.
- Audit report download entitlement behavior.
- Audit Family Vault assignment and comparison selection behavior.
- Audit Razorpay-disabled checkout behavior.
- Record where quota is currently client-side only.
- Record where deterministic chat actions are currently blocked by AI budget.

Green criteria:

- A baseline ledger exists under `docs/audits/`.
- Current user-visible defects are categorized as Critical/Major/Medium/Minor.
- No entitlement implementation starts before this ledger is complete.
- Working tree is clean and committed.

### PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA

Make signed-in account identity mandatory for meaningful personalized actions.

Required work:

- Gate AI chat, Kundli saving, report download, Family Vault, and family
  comparison behind sign-in.
- Keep marketing/public education/demo surfaces browseable.
- Make Google sign-in primary and visually prominent.
- Preserve email sign-in only if it is intentionally supported and audited.
- Fix Google sign-in failure, popup-blocked, cancelled, missing config, and
  redirect fallback states.
- Add web/mobile parity for auth messaging.
- Ensure no personalized action silently falls back to guest-local entitlement.

Green criteria:

- Unsigned user cannot spend AI, save Kundli, download report, assign Family
  Vault, or run family comparison.
- Signed-in Google user can proceed through the same actions.
- Auth errors are understandable and localized.
- Web and mobile auth QA passes.
- Strict UI/UX audit proves no auth modal overflow or CTA collision.

### PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH

Create the server-side entitlement ledger that replaces local quota authority.

Required work:

- Define entitlement schema by Firebase UID:
  - free AI credits used
  - paid AI question credits balance
  - report credits by type
  - saved Kundli count
  - premium entitlement
  - day pass entitlement
  - Family Bank owner/member relationships
  - audit timestamps
- Add server/API helpers to read and mutate entitlement atomically.
- Add idempotency keys for credit consumption.
- Add anti-replay protections for repeated submit/click.
- Make client state a cache only.
- Add migration behavior for existing local saved states where safe.

Green criteria:

- Free AI credits cannot reset by clearing browser/app storage.
- Credit consumption is atomic.
- Failed AI/provider calls do not consume credits.
- Double-submit does not double-spend.
- Entitlement tests cover free, paid pack, premium, day pass, and Family Bank.

### PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL

Implement the `3` lifetime free AI question rule.

Required work:

- Replace `FREE.questionsPerDay: 3` behavior with server-backed
  `freeAiQuestionsLifetime: 3`.
- Show visible free AI balance in chat and account surfaces.
- Consume one free credit only when a provider AI answer is successfully
  returned.
- On fourth AI question attempt, preserve the exact user question.
- Show purchase options:
  - `10 questions`
  - `25 questions`
  - `100 questions`
  - `Premium`
- Allow the user to complete purchase later and resume the preserved question.
- Keep deterministic chat actions available without credit.

Green criteria:

- First three AI questions work for a signed-in free user.
- Fourth AI question is blocked with preserved text and clear CTA.
- Deterministic actions still work after credits are exhausted.
- No OpenAI/Gemini call is made for the blocked fourth question.
- Web and mobile parity passes.

### PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE

Make Predicta chat useful after AI credits are exhausted.

Required work:

- Split chat handling into:
  - deterministic action path
  - AI provider path
  - blocked purchase path
- Fix the current issue where web chat may consume AI budget before deterministic
  birth extraction/Kundli creation.
- Use rule-based birth extraction first.
- Use provider extraction only when paid/allowed and deterministic extraction is
  insufficient.
- Add zero-credit quick actions.
- Make exhausted-credit copy clear and calming.
- Ensure deterministic module answers are labeled as calculation-engine answers,
  not AI answers.
- Add telemetry for `zero_credit_deterministic_action`.

Green criteria:

- Exhausted free user can create Kundli from chat without AI credit.
- Exhausted free user can ask for chart snapshot, Mahadasha, Gochar, Panchang,
  remedies, report brief, saved Kundlis, and Family Vault navigation without
  AI.
- Exhausted free user cannot receive open-ended AI synthesis without purchase.
- Provider call logs prove no OpenAI/Gemini calls for deterministic actions.

### PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT

Implement signed-in free `4` Kundlis and Premium unlimited Kundlis with abuse
protection.

Required work:

- Free signed-in users can save up to `4` Kundlis total.
- Premium users can save unlimited Kundlis.
- Premium generation has invisible abuse controls, for example
  `30 generated Kundlis/day` before cooldown/manual review.
- Kundli creation from chat, Kundli page, mobile form, and imports use the same
  entitlement check.
- Existing saved Kundlis are counted consistently.
- Blocked free users can still open existing saved Kundlis.
- Upgrade path appears exactly when attempting to save/create the fifth Kundli.

Green criteria:

- Free user can create/save four Kundlis.
- Fifth Kundli save/create is blocked with preserved draft data.
- Premium user can continue beyond four.
- Abuse throttle does not affect normal premium use.
- Web/mobile Kundli flows use one shared entitlement contract.

### PREDICTA_MONETIZATION_PHASE_6_PRODUCT_BANK_QUESTION_PACKS_REPORT_PACKS_AND_FAMILY_BANK

Add Melooha-inspired product-bank monetization with Predicta trust framing.

Required work:

- Define products:
  - `10 AI questions`
  - `25 AI questions`
  - `100 AI questions`
  - `single report`
  - `report bundle`
  - `Premium monthly`
  - `Premium yearly`
  - optional `Day Pass`
- Paid credits do not expire.
- Question credits are consumed only by successful AI chat answers.
- Report credits are consumed only by successful paid report generation.
- Family Bank can share purchased credits with Family Vault members when owner
  opts in.
- Shared credits do not expose private chat/report content.
- Checkout uses the existing Razorpay-ready payment workflow and never fakes
  success when Razorpay is disabled.

Green criteria:

- Product bank balances show correctly on account, chat, report, checkout, and
  Family Vault surfaces.
- Credits are non-expiring in the ledger.
- Family Bank sharing is explicit and reversible.
- Razorpay-disabled state is honest and non-throwing.
- No entitlement activates without verified payment or approved support/admin
  handoff.

### PREDICTA_MONETIZATION_PHASE_7_FAMILY_VAULT_ASSIGNMENT_AND_COMPARISON_LIMITS

Make Family Vault use saved Kundlis cleanly and enforce comparison min/max
limits.

Required work:

- Family Vault can assign any saved Kundli to a family member role.
- Free users use up to their `4` saved Kundlis.
- Premium users can assign from unlimited saved Kundlis.
- Family comparison accepts minimum `2` and maximum `4` selected Kundlis.
- If one Kundli is selected, prompt for at least one more.
- If more than four are selected, block and explain the four-chart focus limit.
- Comparison UI must be clean on desktop, tablet, and mobile.
- Predicta chat can explain comparison eligibility without AI credit.

Green criteria:

- `0-1` selected Kundlis cannot run comparison.
- `2-4` selected Kundlis can run comparison.
- `5+` selected Kundlis cannot run comparison.
- Blocked states preserve selections and explain next step.
- Web and mobile parity passes.

### PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION

Control AI bill while preserving paid value.

Required work:

- Free AI uses OpenAI mini only.
- Free AI answer length and output token budget are capped.
- Free AI history is aggressively trimmed.
- No Gemini validator for free.
- Premium chat uses premium model only when entitlement and intent justify it.
- Gemini validation only for paid premium reports/high-value report pipeline.
- Add per-feature budget thresholds.
- Add spend alerts and stop thresholds.
- Add IP/device rate limiting as abuse protection, not quota authority.
- Add cache tracking for repeated safe prompts.
- Ensure telemetry includes user plan, entitlement source, product credit source,
  model, provider, token usage, estimated cost, and cache hit.

Green criteria:

- Cost governance suite proves free path cannot use premium model.
- Gemini validator is not used for free.
- Premium report pipeline is gated by paid entitlement.
- Spend threshold simulation blocks unsafe provider usage.
- Release governance remains green.

### PREDICTA_MONETIZATION_PHASE_9_REPORT_AND_AI_CREDIT_ENTITLEMENT_PARITY

Make reports and AI credit usage consistent across all school lanes.

Required work:

- Vedic, KP, Nadi, Numerology, Signature, and Life Atlas report downloads use
  the same entitlement/credit contract.
- Free deterministic reports remain available where allowed.
- Premium AI-written reports require premium/report credit.
- Signature report still requires confirmed signature traits.
- Life Atlas optional signature layer does not block when signature is missing.
- Report page shows credit requirement before generation.
- Mobile report generation uses the same entitlement logic as web.

Green criteria:

- Every report lane has correct free/premium/paid-credit behavior.
- No school-specific report bypasses entitlement.
- No mobile lower-quality or lower-control path exists.
- Golden report artifacts prove report generation still works.

### PREDICTA_MONETIZATION_PHASE_10_LOCALIZATION_UI_UX_AND_TRUST_COPY_AUDIT

Make monetization feel trustworthy, not predatory.

Required work:

- All monetization copy comes from JSON translation files.
- English/Hindi/Gujarati copy is complete and not mixed.
- Credit balances are clear.
- Upgrade prompts appear after value or at entitlement boundary, not randomly.
- No scary/fatalistic upsell language.
- No confusing unlimited claims.
- Explain:
  - what is free
  - what uses AI credit
  - what does not use AI credit
  - what requires report credit
  - what Premium changes
  - what Family Bank shares
  - what remains private
- Desktop/tablet/mobile UI audit for pricing, chat paywall, report paywall,
  Family Bank, account, settings, checkout, and auth.

Green criteria:

- Localization zero-hardcoded-copy gate passes for monetization surfaces.
- UI text overflow and personal-space audits pass.
- Buyer rejection gate passes.
- No CTA collision, modal overflow, hidden price, or confusing paid state.

### PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE

Run complete end-to-end proof for the monetization model.

Required work:

- Web smoke:
  - sign in
  - use three free AI questions
  - attempt fourth AI question
  - buy or simulate question pack through approved non-fake test path
  - resume preserved question
  - create four Kundlis
  - attempt fifth Kundli
  - assign Family Vault
  - compare `2-4` Kundlis
  - block `5+` Kundlis
  - generate free deterministic report
  - generate paid/premium report where entitlement allows
- Mobile smoke with equivalent flows.
- Razorpay-disabled smoke remains honest if gateway is not wired.
- Razorpay-enabled sandbox smoke must pass once keys are added.

Green criteria:

- All core monetization flows work end to end.
- No fake payment success exists.
- No unmetered AI path remains.
- No deterministic action spends AI credit.
- Working tree is clean and committed.

### PREDICTA_MONETIZATION_PHASE_12_FINAL_PROFIT_SAFETY_RELEASE_AUDIT

Perform final ruthless audit before release.

Required work:

- Run full public greenlight.
- Run AI model governance.
- Run payment workflow tests.
- Run entitlement ledger tests.
- Run report golden artifacts.
- Run mobile tests.
- Run localization tests.
- Run UI/UX audits.
- Run live/deployed smoke if deployment is requested.
- Produce final issue ledger.

Green criteria:

- Zero Critical issues.
- Zero Major issues.
- No uncommitted work.
- No hidden unmetered AI call path.
- No client-only quota authority.
- No report entitlement bypass.
- No sign-in bypass for personalized actions.
- Release can be called monetization-green only after generated artifacts and
  runtime smoke prove it.

## Execution Sequence

Run phases exactly in this order:

1. `PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK`
2. `PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA`
3. `PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH`
4. `PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL`
5. `PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE`
6. `PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT`
7. `PREDICTA_MONETIZATION_PHASE_6_PRODUCT_BANK_QUESTION_PACKS_REPORT_PACKS_AND_FAMILY_BANK`
8. `PREDICTA_MONETIZATION_PHASE_7_FAMILY_VAULT_ASSIGNMENT_AND_COMPARISON_LIMITS`
9. `PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION`
10. `PREDICTA_MONETIZATION_PHASE_9_REPORT_AND_AI_CREDIT_ENTITLEMENT_PARITY`
11. `PREDICTA_MONETIZATION_PHASE_10_LOCALIZATION_UI_UX_AND_TRUST_COPY_AUDIT`
12. `PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE`
13. `PREDICTA_MONETIZATION_PHASE_12_FINAL_PROFIT_SAFETY_RELEASE_AUDIT`

## Definition Of Done

This monetization rebuild is green only when:

- All phases above are committed.
- Web and mobile share the same entitlement truth.
- Free users get meaningful deterministic value after AI credits are exhausted.
- AI provider calls are metered, capped, and profitable by design.
- Paid products are clear, transparent, and non-predatory.
- Family Bank works without leaking private content.
- Payment workflow is honest before Razorpay and ready after Razorpay.
- No broad UI, localization, report, or Predicta intelligence regression is
  introduced.
