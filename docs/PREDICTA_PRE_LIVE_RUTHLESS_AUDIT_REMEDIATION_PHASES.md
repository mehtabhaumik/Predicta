# Predicta Pre-Live Ruthless Audit Remediation Phases

## Status

Predicta is **NO-GO for live** until every phase in this document is green.

This document converts the 2026-05-26 ruthless pre-live audit into an ordered,
strict, non-colliding remediation spine. It does not replace the specialist
phase files. It closes the launch blockers that remain after those phase files
were executed.

## Relationship To Existing Phase Files

This document builds on top of the existing roadmap documents. It must not
rename, collapse, or rewrite their product scope.

- `PREDICTA_PUBLIC_READINESS_REVIVAL_PLAN.md` remains the historical public
  readiness recovery roadmap, but its launch-ready claim is superseded by this
  newer pre-live audit until this document is green.
- `PREDICTA_PUBLIC_RELEASE_STOP_CONTRACT.md` remains the release-stop owner.
  This document adds a new hard release-stop dependency to that contract.
- `PREDICTA_REPORT_PDF_STRICT_PHASES.md` remains the report/PDF rendering,
  footer, watermark, chart-safe, and golden artifact owner.
- `PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md` remains the Kundli
  value, chart purity, prediction language, Mahadasha, Varga, and remedy
  streamlining owner.
- `PREDICTA_CHART_INSIGHT_REBUILD_PHASES.md` remains the chart insight,
  hierarchy, and animation-safe chart presentation owner.
- `PREDICTA_KP_NADI_PREDICTA_STRICT_PHASE.md` remains the KP/Nadi school
  boundary, event-answer, karmic-story, and report owner.
- `PREDICTA_NUMEROLOGY_PREDICTA_STRICT_PHASE.md` remains the Numerology room
  and report owner.
- `PREDICTA_SIGNATURE_PREDICTA_ULTRA_STRICT_PHASE.md` remains the Signature
  privacy, trait detection, confirmation, and safety owner.
- `PREDICTA_LIFE_ATLAS_REPORT_STRICT_CONTRACT.md` remains the only approved
  all-school synthesis report owner.
- `PREDICTA_AI_MODEL_ORCHESTRATION_ULTRA_STRICT_PHASES.md` remains the
  deterministic-first AI routing, OpenAI/Gemini, telemetry, validator, and
  cost-governance owner.
- `PREDICTA_SUPPORT_CONFIRMATION_SYSTEM_PHASES.md` remains the support and
  ticket-confirmation owner.

If this document finds a failure in one of those areas, implement the fix in
the relevant code path, but close it under the phase in this document so the
pre-live audit ledger remains complete.

## Non-Negotiable Rules

1. Do not collapse these phases into one broad patch.
2. Do not mark a phase green from code review alone.
3. Do not mark a phase green while its relevant automated gate is red.
4. Do not skip desktop, tablet, or mobile where the phase affects UI.
5. Do not use fixture-only proof when the finding was a live or runtime issue.
6. Do not create a fake payment success path before Razorpay is wired.
7. Do not let the payment workflow throw just because Razorpay is not wired yet.
8. Do not grant paid entitlement from mock billing in production mode.
9. Do not let Signature Predicta infer traits without a real visible signature
   sample and confirmed visible evidence.
10. Do not let mobile keep a lower-quality path than web for signature,
    reports, payments, chats, or astrology worlds.
11. Do not allow hardcoded user-facing translations in components, logic,
    services, reports, or model prompts when the copy belongs in dedicated
    translation JSON files.
12. Do not let Predicta answer like a generic chatbot. Predicta must know the
    active Kundli, active room, available deterministic data, report state,
    feature boundaries, and what the user just did.
13. Do not mix Vedic, KP, Nadi, Numerology, Signature, or Life Atlas methods
    unless the user is inside the approved synthesis flow.
14. Do not hide admin or owner surfaces behind copy alone. Use real route,
    navigation, and token/role controls.
15. Do not call placeholder tests sufficient where a package owns production
    behavior.
16. Do not mutate audit artifacts or generated timestamps during read-only QA
    unless the phase explicitly refreshes artifacts.
17. Every phase must write proof under
    `docs/audits/<PHASE_NAME>/verification.txt`.
18. Every phase must end with `git diff --check`.
19. Every phase completion must be committed with a detailed commit message
    before the next phase starts.
20. The final phase must run the full launch gate from a clean server and a
    clean working tree.

## Severity Closure Standard

This document covers all findings from the 2026-05-26 ruthless audit:

- `Critical`: must be fixed first; no public launch while any are open.
- `Major`: must be fixed before live; no downgrade without evidence.
- `Medium`: must be fixed unless the final audit proves it cannot affect trust,
  runtime, payment, astrology credibility, translation, or Predicta intelligence.
- `Minor`: must be fixed if cheap, noisy, or likely to confuse future audits.

The target is not "better". The target is:

> A second ruthless audit finds zero Critical and zero Major issues.

## Audit Baseline Findings

| Severity | Finding | Owning Phase |
|---|---|---|
| Critical | Release governance blocks because `PRIDICTA_AI_PRICING_JSON` is missing and cost/profit metrics are null. | Phase 1 |
| Critical | `test:public-greenlight` can be confused by stale server, wrong port, redirect, or chunk state before product checks are trustworthy. | Phase 2 |
| Critical | `/dashboard/report` has mobile/tablet overflow and blocks public greenlight visual proof. | Phase 5 |
| Critical | Mobile Jest fails because `react-native-fs` Flow syntax leaks through PDF generation imports. | Phase 3 |
| Critical | `test:specialist-room-qa` fails because the discipline handoff temp artifact cannot resolve `@pridicta/config`. | Phase 4 |
| Critical | Signature web validates ink but assigns fixed traits from upload/draw mode instead of real geometry. | Phase 8 |
| Critical | Payments are not launch-ready; web is a handoff and mobile production billing can throw. | Phase 7 |
| Major | `test:animation-regression` fails the protected Kundli chart structure contract. | Phase 6 |
| Major | `test:buyer-rejection` fails missing `printReport()` and mobile report overflow. | Phase 5 |
| Major | Local server state can be stale or broken, with `3000`/`3009` confusion. | Phase 2 |
| Major | Mobile Signature has no real upload/draw capture. | Phase 8 |
| Major | Hardcoded UI copy and translation fallbacks remain outside dedicated JSON files. | Phase 9 |
| Major | Hindi/Gujarati checkout contains English support subject fallback text. | Phase 9 |
| Medium | Several package tests are placeholders and give false confidence. | Phase 10 |
| Medium | Gemini validator/batch proof is mostly deterministic/mock, not production-grade. | Phase 11 |
| Medium | Admin/owner UI routes are too reachable in public builds. | Phase 12 |
| Medium | Report page remains too dense on mobile even after overflow is fixed. | Phase 13 |
| Medium | PDF golden uses fixtures; a fresh real-user download smoke is still required. | Phase 14 |
| Minor | Audit scripts mutate generated artifact timestamps/IDs. | Phase 15 |
| Minor | Metro color warnings create audit noise. | Phase 15 |
| Minor | `localhost:3000` versus `3009` target confusion remains in audit execution. | Phase 2 |
| Minor | Developer runbook and read-only audit cleanup need deterministic documentation. | Phase 15 |
| Extra | Astrology worlds, reports, and Predicta intelligence need one dedicated no-dumb-Predicta gate. | Phase 16 |

## Approved Phase Order

1. `PREDICTA_PRE_LIVE_PHASE_0_RUTHLESS_AUDIT_EVIDENCE_LOCK`
2. `PREDICTA_PRE_LIVE_PHASE_1_RELEASE_GOVERNANCE_COST_PROFIT_UNLOCK`
3. `PREDICTA_PRE_LIVE_PHASE_2_AUDIT_SERVER_AND_PUBLIC_GREENLIGHT_HARNESS`
4. `PREDICTA_PRE_LIVE_PHASE_3_MOBILE_JEST_AND_PDF_IMPORT_BOUNDARY`
5. `PREDICTA_PRE_LIVE_PHASE_4_SPECIALIST_ROOM_QA_AND_HANDOFF_RESOLUTION`
6. `PREDICTA_PRE_LIVE_PHASE_5_REPORT_MOBILE_BUYER_PRINT_DOWNLOAD_GATE`
7. `PREDICTA_PRE_LIVE_PHASE_6_CHART_ANIMATION_AND_KUNDLI_STRUCTURE_GATE`
8. `PREDICTA_PRE_LIVE_PHASE_7_PAYMENT_WORKFLOW_AND_RAZORPAY_READY_CONTRACT`
9. `PREDICTA_PRE_LIVE_PHASE_8_SIGNATURE_REAL_INPUT_TRAIT_DETECTION_AND_PARITY`
10. `PREDICTA_PRE_LIVE_PHASE_9_LOCALIZATION_ZERO_HARDCODED_COPY_SWEEP`
11. `PREDICTA_PRE_LIVE_PHASE_10_MEANINGFUL_TEST_COVERAGE_AND_PLACEHOLDER_RETIREMENT`
12. `PREDICTA_PRE_LIVE_PHASE_11_GEMINI_VALIDATOR_LIVE_SANDBOX_AND_BATCH_PROOF`
13. `PREDICTA_PRE_LIVE_PHASE_12_ADMIN_OWNER_SURFACE_HARDENING`
14. `PREDICTA_PRE_LIVE_PHASE_13_REPORT_PAGE_MOBILE_DENSITY_AND_COMPOSER_POLISH`
15. `PREDICTA_PRE_LIVE_PHASE_14_REAL_USER_REPORT_DOWNLOAD_AND_PDF_SMOKE`
16. `PREDICTA_PRE_LIVE_PHASE_15_AUDIT_NOISE_DETERMINISM_AND_DEVELOPER_RUNBOOK`
17. `PREDICTA_PRE_LIVE_PHASE_16_PREDICTA_INTELLIGENCE_ASTROLOGY_WORLD_MASTERY_GATE`
18. `PREDICTA_PRE_LIVE_PHASE_17_FINAL_NO_MAJOR_ISSUE_RELEASE_REAUDIT`

Do not rename these phases during implementation.

## Global Green Gate

Every phase is green only when:

- its phase-specific strict audit passes
- its `verification.txt` exists
- relevant tests are run and recorded
- relevant screenshots, PDFs, logs, transcripts, or runtime artifacts exist
- no Critical or Major regression is introduced
- `git diff --check` passes
- the working tree status is documented
- the phase is committed with a detailed commit message

If a queued phase is requested while the previous phase is not green, first do
the needful to make the previous phase green, audit it, commit it, and then
continue with the queued phase.

## Phase 0: `PREDICTA_PRE_LIVE_PHASE_0_RUTHLESS_AUDIT_EVIDENCE_LOCK`

### Goal

Freeze the new no-go baseline so the team cannot accidentally rely on older
"ready" documents.

### Required Work

- Create an audit folder for this phase.
- Record the full no-go findings grouped by Critical, Major, Medium, and Minor.
- Record the exact commands that failed and passed in the audit.
- Record the current branch, commit, and working-tree state.
- Update launch-readiness docs so the newer no-go audit supersedes older
  launch-ready wording.
- Link this remediation spine from `docs/README.md`.

### Strict Audit

This phase is green only when:

- the no-go baseline is stored under
  `docs/audits/PREDICTA_PRE_LIVE_PHASE_0_RUTHLESS_AUDIT_EVIDENCE_LOCK/`
- every audit finding is mapped to exactly one owning phase
- older readiness docs point to this document as the current release blocker
- `git diff --check` passes
- the phase is committed

## Phase 1: `PREDICTA_PRE_LIVE_PHASE_1_RELEASE_GOVERNANCE_COST_PROFIT_UNLOCK`

### Goal

Make release governance pass in a real default/live-like environment without
manual hidden environment hacks.

### Required Work

- Fix `PRIDICTA_AI_PRICING_JSON` handling so release governance has an approved
  production-safe pricing source.
- Keep cost/profit metrics non-null for release evaluation.
- Preserve privacy-safe telemetry.
- Prevent missing pricing config from becoming a silent pass.
- Document where pricing config comes from locally, in CI, and in deployment.
- Confirm approved OpenAI/Gemini model pins and premium/free routing still pass.

### Strict Audit

This phase is green only when:

- `python3 -m backend.astro_api.release_governance` returns `READY`
- `python3 -m pytest backend/tests/test_safety_red_team_evals.py -q` passes
- `python3 -m pytest backend/tests/test_astro_api.py -q` passes
- the generated release-governance report shows non-null cost/profit metrics
- no raw birth data, signature images, or private chat text are added to
  telemetry
- `git diff --check` passes
- the phase is committed

## Phase 2: `PREDICTA_PRE_LIVE_PHASE_2_AUDIT_SERVER_AND_PUBLIC_GREENLIGHT_HARNESS`

### Goal

Remove stale-server confusion and make the public greenlight harness reliable.

### Required Work

- Standardize the audit server target, including `3009` when the scripts require
  it.
- Add a preflight that detects stale dev chunks, wrong ports, redirect loops,
  404 app routes, and mismatched build/server state.
- Document how to start the exact server expected by public audit scripts.
- Make `localhost:3000` versus `localhost:3009` expectations explicit.
- Fix the public greenlight harness so failures identify the owning surface and
  do not hide behind stale-browser noise.

### Strict Audit

This phase is green only when:

- the audit server preflight passes from a clean start
- `/dashboard`, `/dashboard/report`, `/dashboard/signature`, `/dashboard/kp`,
  `/dashboard/nadi`, `/dashboard/numerology`, `/dashboard/settings`,
  `/dashboard/family`, and `/dashboard/account` resolve on the expected server
- no route returns a redirect loop
- no route returns stale `ChunkLoadError`
- `corepack pnpm test:public-greenlight` reaches real product checks without
  environment/server confusion
- `git diff --check` passes
- the phase is committed

## Phase 3: `PREDICTA_PRE_LIVE_PHASE_3_MOBILE_JEST_AND_PDF_IMPORT_BOUNDARY`

### Goal

Make the mobile test suite trustworthy by isolating native PDF/RNFS imports
from Jest.

### Required Work

- Fix the `react-native-fs` Flow-syntax failure in mobile tests.
- Introduce a Jest-safe boundary for mobile PDF generation.
- Do not remove mobile PDF functionality.
- Do not mock the entire report flow in a way that hides runtime bugs.
- Add focused tests for the PDF boundary, report download action, and failure
  path.

### Strict Audit

This phase is green only when:

- `corepack pnpm test` passes
- `corepack pnpm --filter @pridicta/mobile test` passes if available
- `corepack pnpm --filter @pridicta/mobile bundle:android` passes
- the mobile PDF service still exposes the production path outside Jest
- `git diff --check` passes
- the phase is committed

## Phase 4: `PREDICTA_PRE_LIVE_PHASE_4_SPECIALIST_ROOM_QA_AND_HANDOFF_RESOLUTION`

### Goal

Make specialist room safety gates green so Predicta cannot mix methods or fail
handoff resolution.

### Required Work

- Fix `test:discipline-handoff` module resolution for `@pridicta/config`.
- Make temp compiled artifacts resolve workspace packages predictably.
- Verify Vedic, KP, Nadi, Numerology, Signature, and Life Atlas boundaries.
- Verify handoff language when a user asks a question outside the current room.
- Verify active-room context stays intact across web and mobile.

### Strict Audit

This phase is green only when:

- `corepack pnpm test:specialist-room-qa` passes
- room-boundary transcripts exist for all five specialist rooms
- KP stays event-first and does not turn into generic Vedic
- Nadi stays karmic-story/validation-first and does not claim palm-leaf access
- Numerology stays number-led unless the user selects synthesis
- Signature uses only confirmed visible traits
- `git diff --check` passes
- the phase is committed

## Phase 5: `PREDICTA_PRE_LIVE_PHASE_5_REPORT_MOBILE_BUYER_PRINT_DOWNLOAD_GATE`

### Goal

Close report mobile overflow, buyer rejection, print, and download-action
failures.

### Required Work

- Fix `/dashboard/report` overflow at 390px and tablet widths.
- Restore or replace `printReport()` with a supported print/download action.
- Ensure report-card selection renders the download/composer action directly
  under the selected option.
- Ensure non-Vedic reports use inline selected-card action panels.
- Ensure Vedic reports use a low-friction report builder/composer without
  forcing users to scroll for the CTA.
- Preserve school-separated report lanes.
- Preserve PDF as the deep reading surface.

### Strict Audit

This phase is green only when:

- `corepack pnpm test:buyer-rejection` passes
- `corepack pnpm test:public-greenlight` passes the report route checks or only
  fails on a later unrelated phase already documented
- desktop, tablet, and 390px mobile screenshots prove no horizontal overflow
- selected report card renders its action surface immediately beneath itself
- the Vedic builder has a default `Recommended by Predicta` path plus optional
  customization
- print/download actions do not throw
- `git diff --check` passes
- the phase is committed

## Phase 6: `PREDICTA_PRE_LIVE_PHASE_6_CHART_ANIMATION_AND_KUNDLI_STRUCTURE_GATE`

### Goal

Restore the protected Kundli chart structure while preserving the newer chart
quality work.

### Required Work

- Fix the animation regression failure around protected chart structure.
- Preserve chart-safe rendering, focus chart order, full Varga library, Moon
  chart, Chalit, Swamsa, and Karakamsha requirements.
- Confirm chart selectors render distinct chart data where supported.
- Confirm planet degrees render consistently, not only for one planet.
- Confirm the chart app screen avoids empty dead space when content can stack.

### Strict Audit

This phase is green only when:

- `corepack pnpm test:animation-regression` passes
- chart structure tests confirm the protected North Indian house contract
- focus charts render in the fixed order: D1, Moon, D9, D10, Chalit
- full Varga selector remains available and no supported chart is removed
- all rendered planets show degree data where deterministic data exists
- desktop and mobile screenshots exist for the chart page
- `git diff --check` passes
- the phase is committed

## Phase 7: `PREDICTA_PRE_LIVE_PHASE_7_PAYMENT_WORKFLOW_AND_RAZORPAY_READY_CONTRACT`

### Goal

Make the payment workflow safe, non-throwing, honest, and Razorpay-ready.

Razorpay is not wired yet. The app still must behave professionally today.

### Required Work

- Define a shared payment workflow contract for web and mobile.
- Add a gateway state model:
  - `gateway_ready`
  - `gateway_disabled`
  - `payment_pending`
  - `payment_cancelled`
  - `payment_failed`
  - `manual_support_requested`
  - `entitlement_active`
- When Razorpay is disabled, show a graceful pending/manual-support flow.
- Do not throw on web checkout or mobile paywall in production mode.
- Do not grant entitlement from mock billing in production mode.
- Do not show fake payment success.
- Preserve clear copy that Razorpay/secure checkout is being connected if the
  gateway is disabled.
- Add support-ticket handoff for users who want access before gateway launch.
- Prepare interfaces for Razorpay order creation, signature verification,
  idempotency, payment status, entitlement activation, and cancellation.
- Ensure mobile has a safe restore/manage path that does not throw.

### Strict Audit

This phase is green only when:

- web checkout does not throw with Razorpay disabled
- mobile paywall does not throw with production billing disabled
- mock billing cannot activate paid access in production mode
- disabled-gateway flow is honest and localized
- payment intent/status state is recorded without storing card/payment secrets
- tests cover disabled, pending, cancelled, failed, and success-interface states
- once Razorpay keys are later added, the same contract can wire create order,
  verify signature, activate entitlement, and handle retries
- `git diff --check` passes
- the phase is committed

## Phase 8: `PREDICTA_PRE_LIVE_PHASE_8_SIGNATURE_REAL_INPUT_TRAIT_DETECTION_AND_PARITY`

### Goal

Make Signature Predicta real, privacy-safe, and impossible to run on empty or
fake input.

### Required Work

- Block empty upload/draw submissions.
- Require visible ink/geometry before trait analysis.
- Replace fixed upload/draw trait presets with real visible-trait detection.
- Show confidence per detected trait.
- Require user confirmation/correction before deeper analysis.
- Implement mobile upload/draw capture parity or disable the path honestly until
  it is real.
- Preserve no-storage privacy copy and no raw signature persistence.
- Keep scanning animation as a UI moment, not as fake evidence.

### Strict Audit

This phase is green only when:

- empty signature input cannot produce traits or predictions
- upload and draw paths produce different traits only when the visible evidence
  supports it
- uncertain traits are marked uncertain or not assessed
- user can correct traits before analysis
- web and mobile behavior match in capability or explicitly honest limitation
- no raw signature is stored in localStorage, sessionStorage, IndexedDB, app
  store, server storage, reports, or telemetry
- Signature report copy includes what it can and cannot tell the user
- `corepack pnpm test:specialist-room-qa` remains green
- `git diff --check` passes
- the phase is committed

## Phase 9: `PREDICTA_PRE_LIVE_PHASE_9_LOCALIZATION_ZERO_HARDCODED_COPY_SWEEP`

### Goal

Remove mixed-language defects and hardcoded public UI copy from the entire app.

### Required Work

- Sweep web, mobile, reports, services, prompts, checkout, pricing, settings,
  auth, family, account, all five worlds, and report surfaces.
- Move user-facing translations into dedicated JSON files.
- Remove hardcoded Hindi/Gujarati/English fallbacks from components and logic.
- Fix checkout support subject fallback for Hindi/Gujarati.
- Ensure English mode does not show Hindi/Gujarati except approved Sanskrit or
  Jyotish terms.
- Ensure Hindi/Gujarati mode does not leak English helper copy unless an
  approved untranslated technical brand term is documented.
- Add static checks for hardcoded public strings where practical.

### Strict Audit

This phase is green only when:

- site-wide hardcoded-copy sweep passes
- route screenshots or text dumps exist for English, Hindi, and Gujarati
- checkout/pricing/support/payment copy is localized
- all report download and PDF-visible labels use translation sources
- language switch does not leave stale mixed-language content
- no translations live directly inside business logic or astrology logic
- `corepack pnpm test:translation-trust` passes if available
- `corepack pnpm test:public-greenlight` localization checks pass
- `git diff --check` passes
- the phase is committed

## Phase 10: `PREDICTA_PRE_LIVE_PHASE_10_MEANINGFUL_TEST_COVERAGE_AND_PLACEHOLDER_RETIREMENT`

### Goal

Stop placeholder package tests from creating false confidence.

### Required Work

- Inventory every `echo no package-local tests` or equivalent placeholder.
- For packages that own production behavior, add meaningful smoke/unit tests.
- For packages that are pure types or config, add schema/export/import tests.
- Update `turbo test` so it cannot claim broad confidence from empty packages.
- Document any package that intentionally remains testless and why.

### Strict Audit

This phase is green only when:

- placeholder tests are retired or justified in the audit folder
- config, access, AI, PDF, core, firebase, monetization, types, utils, and UI
  tokens have meaningful checks or documented non-runtime justification
- `corepack pnpm test` passes
- `corepack pnpm turbo test` passes if available
- `git diff --check` passes
- the phase is committed

## Phase 11: `PREDICTA_PRE_LIVE_PHASE_11_GEMINI_VALIDATOR_LIVE_SANDBOX_AND_BATCH_PROOF`

### Goal

Prove Gemini validator and batch QA are production-shaped, not mock-only.

### Required Work

- Keep deterministic/mock tests for CI.
- Add a live/sandbox Gemini validation path that runs only when keys and allow
  flags are present.
- Record skip-safe behavior when keys are absent.
- Validate missing sections, duplicated remedies, overclaiming, mixed methods,
  language mismatch, and contradiction checks.
- Log cost, latency, provider, model, and fallback/skip reason.
- Ensure Gemini output remains advisory and cannot override deterministic data.

### Strict Audit

This phase is green only when:

- CI-safe mock validator tests pass
- live/sandbox validator smoke passes when keys are available, or cleanly skips
  with explicit reason when keys are absent
- batch manifest artifacts exist for translation and report QA
- premium report validator telemetry includes cost and latency estimates
- no raw private data is logged
- `python3 -m backend.astro_api.release_governance` remains `READY`
- `git diff --check` passes
- the phase is committed

## Phase 12: `PREDICTA_PRE_LIVE_PHASE_12_ADMIN_OWNER_SURFACE_HARDENING`

### Goal

Prevent owner/admin surfaces from feeling publicly reachable or accidentally
discoverable.

### Required Work

- Inventory admin, owner, audit, support, debug, and internal routes.
- Hide owner tools from public navigation unless explicitly in owner/admin mode.
- Enforce token/role checks server-side where applicable.
- Add public-build route guards for internal pages.
- Ensure unauthorized users get calm, localized, non-leaky responses.
- Confirm admin tools do not expose private user data in public builds.

### Strict Audit

This phase is green only when:

- route inventory exists
- public navigation exposes no owner/internal surfaces
- direct route access is guarded
- backend token/role checks still pass
- screenshots/text dumps prove unauthorized states
- `corepack pnpm test:public-greenlight` remains green or documents only later
  phase blockers
- `git diff --check` passes
- the phase is committed

## Phase 13: `PREDICTA_PRE_LIVE_PHASE_13_REPORT_PAGE_MOBILE_DENSITY_AND_COMPOSER_POLISH`

### Goal

Make `/dashboard/report` joyful instead of exhausting on mobile.

### Required Work

- Reduce visible button/form density at first contact.
- Use school report lanes without mixing methods.
- Render inline selected-card actions directly under the selected report.
- Use a Vedic report builder with a default recommended bundle.
- Use progressive disclosure for advanced sections.
- Add a sticky mini download bar only after the user scrolls away from the
  selected report composer.
- Preserve free versus premium clarity without making free feel cheap.

### Strict Audit

This phase is green only when:

- buyer audit no longer reports excessive first-screen button/control density
- mobile first screen has one obvious next action
- Vedic custom selection is understandable without a tutorial
- non-Vedic selected reports show immediate download action in place
- `corepack pnpm test:buyer-rejection` passes
- desktop, tablet, and mobile screenshots exist
- `git diff --check` passes
- the phase is committed

## Phase 14: `PREDICTA_PRE_LIVE_PHASE_14_REAL_USER_REPORT_DOWNLOAD_AND_PDF_SMOKE`

### Goal

Prove the report download path works with real user-like app data, not only PDF
fixtures.

### Required Work

- Generate fresh downloads from the app flow for:
  - Vedic free
  - Vedic premium
  - KP
  - Nadi
  - Numerology
  - Signature with confirmed traits
  - Life Atlas
- Render PDF page previews for each.
- Confirm watermark, cover, footer, page numbers, chart safety, translations,
  report sections, and no duplicate remedy spam.
- Confirm no PDF chart uses `+1`, `+2`, `+3`, or hidden overflow counters.

### Strict Audit

This phase is green only when:

- app-generated PDFs are stored under the phase audit folder
- rendered previews exist for cover, chart page, table page, and final page
- PDF footer reads exactly `Prepared by Predicta @2026`, subject name, and
  real `{page number} / {total pages}`
- focus charts are ordered D1, Moon, D9, D10, Chalit
- Chalit, Swamsa, and Karakamsha rules remain intact
- PDF output is language-clean for English, Hindi, and Gujarati samples
- `corepack pnpm test:pdf-golden` passes
- `git diff --check` passes
- the phase is committed

## Phase 15: `PREDICTA_PRE_LIVE_PHASE_15_AUDIT_NOISE_DETERMINISM_AND_DEVELOPER_RUNBOOK`

### Goal

Remove audit noise so future red signals are real red signals.

### Required Work

- Make audit scripts deterministic where possible.
- Prevent read-only audits from mutating generated timestamps or IDs.
- Normalize or silence harmless Metro color warnings.
- Add a developer runbook for the exact local launch-audit sequence.
- Document expected ports, env files, server commands, and cleanup commands.
- Add a clean-working-tree preflight to launch gates.

### Strict Audit

This phase is green only when:

- running read-only audit scripts twice does not dirty the working tree
- harmless warnings are removed or explicitly documented
- runbook includes exact commands for server start, audit gates, and cleanup
- local port expectations are unambiguous
- `git status --short` is clean after read-only QA
- `git diff --check` passes
- the phase is committed

## Phase 16: `PREDICTA_PRE_LIVE_PHASE_16_PREDICTA_INTELLIGENCE_ASTROLOGY_WORLD_MASTERY_GATE`

### Goal

Make Predicta feel like the main character of the app: context-aware, astrology
aware, report-aware, and never dumb.

This is the extra phase required for the app's most important product promise.
If Predicta feels generic, the app fails even if the screens work.

### Required Work

- Build or refine the Predicta Intelligence Digest so Predicta knows:
  - active user profile and Kundli
  - active family/member context
  - active language
  - active room/world
  - current selected chart or report
  - available deterministic data
  - data that is missing or pending
  - free versus premium boundaries
  - reports generated or downloaded
  - what the user just did on screen
  - what deeper data exists but is not visible on the current screen
- Audit Vedic Predicta:
  - D1, Moon, D9, D10, Chalit, Varga library, Swamsa, Karakamsha, Mahadasha,
    Panchang, Avakhada, Ghatak, favorable points, friendship, Ashtakavarga,
    Prastarashtakavarga, house-wise evidence, remedies, and report sections
  - answer in Vedic only unless user selects Life Atlas or asks for handoff
- Audit KP Predicta:
  - event question, relevant houses, cusps, sub-lords, significators, ruling
    planets, dasha support, timing readiness, confidence, and proof drawer
  - answer event-first and do not become generic Vedic
- Audit Nadi Predicta:
  - strongest story thread, Rahu/Ketu axis, karmic links, validation questions,
    activation windows, practices, and no false palm-leaf claims
- Audit Numerology Predicta:
  - number signature, name rhythm, birth code, personal cycles, missing/repeated
    patterns, compatibility, name refinement, and no fear-based guarantees
- Audit Signature Predicta:
  - only confirmed visible traits, confidence, privacy/no-storage, reflective
    language, and no prediction/diagnosis/forensic claims
- Audit Life Atlas:
  - approved synthesis only, non-technical life-language, available-data
    hierarchy, signature optional enrichment, and no invented sources
- Audit Reports:
  - Predicta can explain any generated report section, what it means, why it is
    included, and where to download deeper analysis
- Audit Account, Settings, Family, Login, Pricing, Payment, Support:
  - Predicta can guide users calmly through app features without sounding lost
  - Predicta explains missing data or disabled payment gateway honestly

### Strict Audit

This phase is green only when:

- transcript fixtures exist for Vedic, KP, Nadi, Numerology, Signature, Life
  Atlas, Reports, Family, Account, Settings, Pricing, Payment, and Support
- each transcript proves active-room context awareness
- each transcript proves Predicta knows at least one deeper calculated fact not
  visible in the immediate UI when the digest makes it available
- Predicta refuses or redirects method mixing correctly
- Predicta never pretends a pending calculation, report, payment, signature, or
  premium-only detail exists
- Predicta explains free versus premium boundaries without insulting free users
- Predicta answers in the selected language without mixed-language leaks
- `corepack pnpm test:specialist-room-qa` passes
- `python3 -m backend.astro_api.release_governance` remains `READY`
- `git diff --check` passes
- the phase is committed

## Phase 17: `PREDICTA_PRE_LIVE_PHASE_17_FINAL_NO_MAJOR_ISSUE_RELEASE_REAUDIT`

### Goal

Run the final launch audit as if the app is trying to fail.

### Required Work

- Start from a clean working tree.
- Start the exact production-like local server required by the audit harness.
- Run the full command matrix.
- Perform desktop, tablet, and mobile browser walkthroughs.
- Smoke live/deployed surfaces if deployment is part of the release attempt.
- Re-audit every area the user named:
  - UI
  - UX
  - features
  - Predicta intelligence
  - chats
  - Vedic
  - KP
  - Nadi
  - Numerology
  - Signature
  - Reports
  - login
  - settings
  - family center
  - account
  - pricing and payment workflow
  - support
  - web
  - mobile
  - PDFs
  - localization
  - release governance

### Required Command Matrix

At minimum, the final gate must run:

```bash
python3 -m backend.astro_api.release_governance
python3 -m pytest backend/tests/test_astro_api.py -q
python3 -m pytest backend/tests/test_safety_red_team_evals.py -q
corepack pnpm build:web
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/pdf typecheck
corepack pnpm --filter @pridicta/mobile bundle:android
corepack pnpm test
corepack pnpm test:specialist-room-qa
corepack pnpm test:buyer-rejection
corepack pnpm test:animation-regression
corepack pnpm test:public-greenlight
corepack pnpm test:pdf-golden
git diff --check
```

If the repo adds stricter gates before this phase runs, include them too.

### Strict Audit

This phase is green only when:

- every required command passes
- final screenshots exist for critical desktop, tablet, and mobile routes
- final PDFs exist for all report families
- payment workflow does not throw with Razorpay disabled
- release governance returns `READY`
- no Critical issue remains
- no Major issue remains
- any Medium issue is either fixed or explicitly proven non-launch-impacting
- all Minor audit-noise items are either fixed or documented
- working tree is clean after read-only gates
- the phase is committed

## Final Release Rule

Predicta may not be called launch-ready until Phase 17 is green.

The app is not live-safe merely because older phase files are complete. It is
live-safe only when this pre-live remediation spine proves:

- no Critical issues
- no Major issues
- payment flow is safe before Razorpay and ready for Razorpay
- Predicta intelligence feels context-aware across all worlds
- reports are valuable, downloadable, and artifact-audited
- web and mobile are both credible
- localization is clean
- release governance is `READY`
- the second ruthless audit cannot find a major loose nut or bolt
