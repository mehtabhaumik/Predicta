# Predicta Growth Phase Plan

This document stores the next feature roadmap, implementation phases, and reusable phase prompts for Predicta.

## Global Phase Rule

Whenever we are working on a multi-prompt or multi-phase system:

1. Finish the current phase completely before moving to the next phase.
2. Do not abandon an in-progress phase because a later prompt appears unless the user explicitly says to stop or reprioritize.
3. At the end of each completed phase, report:
   - what was implemented
   - what was verified
   - what could not be verified
   - what phase is next
   - the exact prompt keyword the user can send to start the next phase
4. Do not commit, push, or deploy unless explicitly asked.

## Product Direction

Predicta should not compete as only another AI astrology chat app. The stronger positioning is:

> A premium Vedic life intelligence system that understands the user's chart, remembers their context, maps life patterns, and gives calm, chart-aware guidance.

Core principles:

- Accurate real kundli data first.
- Trust over fear.
- Premium visual polish.
- Cost-controlled AI.
- User-owned local data with opt-in cloud sync.
- Admin-controlled access and guest passes.
- Reports and structured premium experiences as monetization anchors.

## Signature Surprise Element

### Predicta Life Timeline

Predicta Life Timeline is the signature feature.

The user enters important past life events, such as:

- career changes
- relationship milestones
- marriage
- business start
- relocation
- education milestones
- financial rise/fall
- health events, with careful disclaimers
- family turning points
- spiritual turning points

Predicta maps those events against:

- Vimshottari dasha
- antardasha
- relevant chart houses
- D1, D9, D10 focus
- selected transits if available
- chart strengths

Then it creates a beautiful "Life Pattern Map" that explains recurring timing patterns.

Example output direction:

> Your major career shifts repeatedly cluster around Mercury/Saturn and Saturn/Mercury periods, especially when 10th-house themes are active. Your chart appears to respond strongly to structured skill-building before visible growth.

Why this matters:

- It feels deeply personal.
- It builds trust because users compare the reading against real life.
- It is sticky because users can keep adding events.
- It is cost efficient because mapping is deterministic and AI is only used for synthesis.

Cost rules:

- Store events locally by default.
- Cloud sync only by explicit CTA.
- Cache timeline interpretation per kundli/event hash.
- Re-run only when events or calculation metadata changes.
- Free users get limited events.
- Premium users get full timeline.
- One-time product can unlock a Life Timeline Report.

## Monetization Strategy

### Existing Product Model To Preserve

FREE:

- 3 Predicta questions/day.
- Basic chart-aware guidance.
- 1 free PDF/month.
- Core D1, D9, D10 chart display.
- Local saved kundlis.
- Optional cloud sync when logged in.
- Premium-looking experience.

DAY PASS:

- 24-hour elevated access.
- 10 Predicta questions during pass.
- 3 deep readings during pass.
- 1 premium-depth PDF during pass.
- Advanced chart interpretation during pass.

PREMIUM:

- Higher daily guidance limit.
- Higher deep reading limit.
- Multiple premium PDFs/month.
- Advanced chart interpretation depth.
- Premium report depth.
- Priority deeper model access where appropriate.

ONE-TIME PRODUCTS:

- Five Questions Pack.
- Premium PDF.
- Detailed Kundli Report.
- Marriage Compatibility Report.
- New: Life Timeline Report.
- New: Annual Guidance Report.

### Recommended New Monetization Hooks

Life Timeline:

- Free: 3 life events, short pattern preview.
- Premium: full event map and interpretation.
- One-time: Life Timeline Report.

Decision Mirror:

- Free: limited lightweight decision answer.
- Premium: full pros/cautions/timing/next-step structure.
- One-time: not needed initially.

Weekly Briefing:

- Free: short weekly theme.
- Premium: full weekly chart-aware briefing.

Journal:

- Free: manual private notes.
- Premium: pattern insights across journal entries.

Compatibility:

- Free: basic matching preview.
- One-time: full compatibility report.
- Premium: expanded interpretation, but do not undercut one-time report value.

Report Studio:

- One-time purchase focused.
- Premium users receive monthly credits or discounted/free included reports depending on margin.

### Cost Protection Rules

- Default to the small OpenAI model for simple/moderate answers.
- Use deep model only for premium/deep/report-grade analysis.
- Cache every report and timeline synthesis.
- Cache repeated AI answers per kundli/input hash.
- Do not consume quota on failed calls.
- Do not consume quota on cached responses.
- Do deterministic astrology and event mapping outside AI.
- Use AI for synthesis, wording, and emotional intelligence.
- Keep backend hard caps even for elevated guest access.
- Admin accounts can have unrestricted app access, but backend should keep emergency runaway protection.

## Admin Mode Strategy

Admin mode must control access and costs without relying only on client state.

Admin should support:

- Create email-bound guest passes.
- Revoke guest passes.
- List active passes.
- Inspect pass usage.
- Search users by email/user ID.
- Grant or remove manual access.
- View usage counters.
- View report/PDF credits.
- View AI cost-sensitive counters.
- Manage feature flags.
- Manage app announcements.
- View audit logs.

Security rules:

- Pass codes must be hashed.
- Raw pass codes must never be bundled into mobile or web apps.
- Redemption must require login.
- Email-restricted passes must require signed-in email match.
- Private/restricted code errors must be generic.
- No offline pass redemption.
- Admin actions must create audit log entries.
- Admin whitelist should be moved to Firebase/custom-claims authority for production.
- Full access users must never see admin tools.

## Phase 1 Prompt

Keyword:

`START ADMIN-CONTROL-CENTER`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
ADMIN-CONTROL-CENTER

IMPORTANT:
- Inspect the current codebase first.
- Preserve mobile and web behavior.
- Preserve existing monetization, access resolver, guest pass, Firebase, AI, chart, PDF, saved kundli, and security systems.
- Do not break existing free, premium, day pass, one-time purchase, or usage limit behavior.
- Do not expose admin controls to non-admin users.
- Do not expose raw pass codes in mobile or web bundles.
- Build production-grade TypeScript.

GOAL:
Build the admin foundation needed to control access, guest passes, user usage, feature flags, and audit logs across mobile and web.

SCOPE:
1. Create or refine shared admin/access contracts.
2. Create email-bound guest pass creation logic.
3. Create pass revocation logic.
4. Create pass listing and usage-summary contracts.
5. Create admin audit-log contracts.
6. Add web admin shell pages for pass management and user access inspection.
7. Keep mobile admin lightweight unless existing navigation supports more.
8. Ensure FULL_ACCESS users do not see admin tools.

REQUIREMENTS:
- Admin whitelist users get ADMIN access.
- Full-access whitelist users get FULL_ACCESS only.
- Admin status should be backend/Firebase-authoritative in production.
- Client whitelist may remain as local fallback/cache only.
- Guest passes can be restricted to allowedEmails.
- Redemption must require signed-in email to match allowedEmails when set.
- Store only pass hashes, never raw codes.
- Add rate-limit contract for failed redemption attempts.
- Add generic restricted-code failure copy.
- Add admin action audit events:
  - pass_created
  - pass_revoked
  - user_access_updated
  - feature_flag_updated
- Add tests for:
  - admin resolution
  - full-access non-admin resolution
  - email-bound pass validation
  - private code generic failure
  - revocation
  - audit-log record creation
  - non-admin admin route blocking

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build/typecheck if shared packages change

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START LIFE-TIMELINE.
```

## Phase 2 Prompt

Keyword:

`START LIFE-TIMELINE`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
LIFE-TIMELINE

IMPORTANT:
- Finish and preserve ADMIN-CONTROL-CENTER behavior.
- Preserve mobile and web behavior.
- Preserve astrology calculation accuracy safeguards.
- Do not invent astrology data.
- Keep AI cost controlled.

GOAL:
Build Predicta Life Timeline, the signature surprise feature. Users can enter important life events, and Predicta maps those events against dasha/chart timing to reveal personal life patterns.

SCOPE:
1. Add shared LifeEvent and LifeTimeline types.
2. Add local-first life event storage.
3. Add optional cloud sync contract for events.
4. Add deterministic event-to-dasha mapping.
5. Add event hash/cache key builder.
6. Add AI synthesis prompt/context builder for timeline interpretation.
7. Add mobile Life Timeline screen or section.
8. Add web Life Timeline dashboard route.
9. Add premium gating:
   - Free: limited number of events and short preview.
   - Premium/Full/Admin/active Day Pass: full timeline.
   - One-time Life Timeline Report unlock hook.

DATA:
LifeEvent should include:
- id
- kundliId
- title
- category
- eventDate
- approximateDate boolean
- description optional
- emotionalTone optional
- createdAt
- updatedAt

Timeline output should include:
- mapped dasha period
- relevant chart factors
- recurring themes
- confidence label
- user-facing interpretation
- calculation metadata

COST RULES:
- Mapping is deterministic.
- AI synthesis is cached.
- Re-run only when events/kundli/calculation metadata changes.
- Cached timeline does not consume AI quota.
- Free preview uses small model and short output.
- Premium report uses deeper model only when needed.

UX:
- Tone must be calm and personal.
- Do not imply destiny is fixed.
- Do not use fear-based wording.
- Show "patterns" and "timing themes," not guaranteed predictions.

TESTS:
- event validation
- event hash stability
- dasha mapping
- cache invalidation
- free vs premium limits
- AI context shape
- local storage failure safety

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile Android build if mobile touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START DAILY-WEEKLY-INTELLIGENCE.
```

## Phase 3 Prompt

Keyword:

`START DAILY-WEEKLY-INTELLIGENCE`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
DAILY-WEEKLY-INTELLIGENCE

IMPORTANT:
- Preserve Life Timeline and admin behavior.
- Keep AI cost controlled.
- Do not add noisy notification spam.
- Do not create fear-based horoscope copy.

GOAL:
Add personalized Today and Weekly intelligence based on the user's kundli, current dasha, and selected transit/context data.

SCOPE:
1. Add shared daily/weekly insight types.
2. Add daily insight generator contract.
3. Add weekly briefing generator contract.
4. Add cache keys by kundli/calculation date/week.
5. Add mobile Home daily card refinement.
6. Add web dashboard Today and Weekly panels.
7. Add premium expansion:
   - Free: short Today card.
   - Premium/Full/Admin/Day Pass: expanded weekly briefing.

CONTENT:
Today card:
- emotional tone
- work focus
- relationship tone
- one practical action
- one thing to avoid

Weekly briefing:
- weekly theme
- important date windows
- career focus
- relationship focus
- spiritual/practical suggestion
- chart basis summary

COST RULES:
- Generate once per day/week per kundli.
- Cache results.
- Use templates or small model for free.
- Use deeper synthesis only for premium weekly briefing.
- Cached results do not consume quota.

UX:
- Calm.
- Useful.
- No fear.
- No guaranteed predictions.
- No excessive daily spam.

TESTS:
- cache key stability
- free/premium depth
- insight shape
- failed AI fallback
- cached insight does not consume quota

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build if touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START DECISION-MIRROR.
```

## Phase 4 Prompt

Keyword:

`START DECISION-MIRROR`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
DECISION-MIRROR

IMPORTANT:
- Preserve existing chat, AI routing, response cache, and usage limits.
- Do not make guaranteed yes/no claims.
- Keep the feature practical and emotionally calm.

GOAL:
Create Decision Mirror, a structured guidance mode for important user decisions.

SCOPE:
1. Add shared DecisionMirror types.
2. Add intent detection for decision questions.
3. Add structured AI response builder.
4. Add mobile chat decision-response layout.
5. Add web decision panel layout.
6. Add premium depth gating.

OUTPUT STRUCTURE:
- decision summary
- supportive chart factors
- caution factors
- timing windows
- practical next step
- emotional bias check
- what to revisit later
- disclaimer: guidance, not certainty

COST RULES:
- Use existing response cache.
- Use small model for simple decision mirror.
- Use premium model only for deep/multi-chart decisions.
- Failed calls do not consume quota.
- Cached responses do not consume quota.

UX:
- Do not answer with manipulative certainty.
- Do not scare users.
- Make it feel like calm structured thinking.

TESTS:
- decision intent detection
- response schema validation
- free/premium routing
- cache key includes kundli/chart context
- quota consumption only on successful non-cached response

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build if touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START REPORT-STUDIO.
```

## Phase 5 Prompt

Keyword:

`START REPORT-STUDIO`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
REPORT-STUDIO

IMPORTANT:
- Preserve existing PDF generation and free/premium visual quality.
- Do not make free reports look cheap.
- Premium changes depth, not dignity.
- Keep report costs controlled through caching and one-time purchases.

GOAL:
Create Predicta Report Studio for multiple report products and monetization paths.

SCOPE:
1. Add shared report product types.
2. Add report entitlement checks.
3. Add report cache key builder.
4. Add report library model.
5. Add mobile report studio UI.
6. Add web report studio UI.
7. Add one-time product hooks:
   - Premium PDF
   - Detailed Kundli Report
   - Life Timeline Report
   - Annual Guidance Report
   - Compatibility Report structure

REPORT TYPES:
- Free Kundli Summary
- Premium Kundli Report
- Detailed Kundli Dossier
- Life Timeline Report
- Annual Guidance Report
- Compatibility Report

COST RULES:
- Cache generated content.
- Do not regenerate paid reports unless inputs changed.
- Preserve generated PDF after purchase.
- Consume credits only after successful generation.
- Failed generation does not consume credits.

UX:
- Beautiful report previews.
- Clear depth differences.
- Calm upgrade copy.
- No fear-based report selling.

TESTS:
- report entitlement decisions
- credit consumption
- failed generation safety
- cache key stability
- free vs premium section selection
- PDF composition smoke test

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile Android build if mobile PDF flow touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START JOURNAL-INSIGHTS.
```

## Phase 6 Prompt

Keyword:

`START JOURNAL-INSIGHTS`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
JOURNAL-INSIGHTS

IMPORTANT:
- Preserve privacy.
- Journal data is sensitive.
- Local-first storage is required.
- Cloud sync must be explicit.
- Do not use raw journal text in analytics.

GOAL:
Add a private Predicta Journal that helps users track moods, events, decisions, and outcomes against their chart periods.

SCOPE:
1. Add shared JournalEntry types.
2. Add local-first journal storage.
3. Add optional explicit cloud sync contract.
4. Add journal-to-dasha context mapping.
5. Add premium pattern insight generation.
6. Add mobile journal screen.
7. Add web journal route.

JOURNAL ENTRY:
- id
- kundliId
- date
- mood optional
- category
- note
- relatedDecision optional
- tags
- createdAt
- updatedAt

FREE:
- private journal entries
- basic date/dasha labels

PREMIUM:
- pattern summaries
- emotional cycle insights
- monthly reflection

COST RULES:
- Do not send every journal entry to AI.
- Summarize locally first.
- Use AI only for periodic summaries.
- Cache summaries by journal hash/month.

TESTS:
- local storage
- explicit cloud sync only
- journal hash
- premium insight gating
- no analytics leakage

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build if touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START COMPATIBILITY-INTELLIGENCE.
```

## Phase 7 Prompt

Keyword:

`START COMPATIBILITY-INTELLIGENCE`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
COMPATIBILITY-INTELLIGENCE

IMPORTANT:
- Preserve existing kundli storage and matching product structure.
- Do not create fear-based relationship copy.
- Do not reduce compatibility to only one score.

GOAL:
Build the compatibility intelligence foundation for two kundlis.

SCOPE:
1. Add shared CompatibilityInput and CompatibilityReport types.
2. Add two-kundli selection flow.
3. Add Ashtakoota/Guna Milan structure if available through existing astrology engine or backend.
4. Add deeper interpretation sections.
5. Add one-time Compatibility Report entitlement hook.
6. Add mobile compatibility entry point.
7. Add web compatibility report surface.

OUTPUT:
- summary
- guna/ashtakoota structure where available
- emotional compatibility
- communication pattern
- family life indicators
- timing considerations
- caution areas
- practical guidance

COST RULES:
- Deterministic scoring where possible.
- Cache report by both kundli IDs and calculation metadata.
- Use AI only for final interpretation.
- One-time report purchase unlocks full depth.

TESTS:
- two-kundli selection
- cache key ordering stability
- entitlement check
- no fake matching data if engine unavailable
- report generation failure safety

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build if touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START MULTILINGUAL-POLISH.
```

## Phase 8 Prompt

Keyword:

`START MULTILINGUAL-POLISH`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
MULTILINGUAL-POLISH

IMPORTANT:
- Preserve all current behavior.
- Do not create broad translation debt.
- Keep language support modular.
- Do not translate sacred/technical terms incorrectly without fallbacks.

GOAL:
Prepare Predicta for English, Hindi, and Gujarati user experiences.

SCOPE:
1. Add shared locale types.
2. Add user language preference.
3. Add i18n structure for static UI strings.
4. Add AI response language preference.
5. Add PDF language preference hook.
6. Add mobile language setting.
7. Add web language setting.

LANGUAGES:
- English
- Hindi
- Gujarati

RULES:
- Keep core astrology terms consistent.
- Allow Sanskrit/Vedic terms with short explanations.
- Do not over-translate technical chart labels where clarity suffers.
- AI must respond in selected language when safe.

COST RULES:
- Static UI translations do not use AI.
- AI language preference is included in prompt context.
- Report translation/regeneration should be premium or credit-based if costly.

TESTS:
- language preference persistence
- UI string loading
- AI prompt language flag
- PDF language flag
- fallback to English

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build if touched

FINAL:
Report completed work, verification, and the next phase keyword.
Next phase keyword should be START MONETIZATION-OPTIMIZATION.
```

## Phase 9 Prompt

Keyword:

`START MONETIZATION-OPTIMIZATION`

Prompt:

```text
You are enhancing the existing Predicta monorepo.

PHASE:
MONETIZATION-OPTIMIZATION

IMPORTANT:
- Preserve trust.
- No aggressive paywalls.
- No fake urgency.
- No fear-based conversion.
- Free users must still feel respected.

GOAL:
Tune monetization across Premium, Day Pass, one-time products, reports, Life Timeline, compatibility, and admin/grant access.

SCOPE:
1. Review pricing config.
2. Review feature gating.
3. Add product-specific upgrade prompts.
4. Add usage-aware upgrade moments.
5. Add report product purchase flow hooks.
6. Add Life Timeline Report pricing hook.
7. Add Annual Guidance Report pricing hook.
8. Add analytics events without sensitive data.
9. Add admin visibility into conversion and usage summaries.

MONETIZATION RULES:
- Do not say unlimited unless implementation and fair-use policy support it.
- Premium unlocks depth, higher limits, and convenience.
- One-time purchases unlock specific outcomes.
- Day Pass remains a low-friction trial.
- Free app remains useful and premium-looking.

ANALYTICS:
Track:
- paywall_viewed
- product_selected
- purchase_started
- purchase_completed
- purchase_failed
- report_generated
- life_timeline_previewed
- life_timeline_report_unlocked
- compatibility_report_unlocked

Do not track:
- raw birth details
- raw kundli payload
- raw chat text
- raw journal text
- private remedies/predictions

TESTS:
- gating logic
- product selection
- one-time credit consumption
- premium access resolution
- analytics failure safety
- admin summary shape

VERIFY:
- pnpm typecheck
- pnpm lint
- pnpm test
- web build
- mobile build if touched

FINAL:
Report completed work, verification, and recommended next roadmap phase.
```

## Recommended Execution Order

1. `START ADMIN-CONTROL-CENTER`
2. `START LIFE-TIMELINE`
3. `START DAILY-WEEKLY-INTELLIGENCE`
4. `START DECISION-MIRROR`
5. `START REPORT-STUDIO`
6. `START JOURNAL-INSIGHTS`
7. `START COMPATIBILITY-INTELLIGENCE`
8. `START MULTILINGUAL-POLISH`
9. `START MONETIZATION-OPTIMIZATION`
10. `START RELEASE-HARDENING`
11. `START FIREBASE-RULES-BACKEND-AUTHORITY`
12. `START BACKEND-ADMIN-FUNCTIONS`
13. `START CLIENT-ADMIN-BACKEND-WIRING`
14. `START BACKEND-DEPLOYMENT-ENV-WIRING`

## Notes For Future Implementation

- Admin mode should be implemented before expanding guest access, investor previews, or special passes.
- Predicta Life Timeline should be treated as the signature feature and polished heavily.
- Report Studio should become the strongest one-time monetization path.
- Journal and weekly intelligence should increase retention.
- Compatibility should be added after report infrastructure is solid.
- Multilingual support should be added after core flows stabilize.
- Monetization should be refined after real usage data is available.

---

## Phase 10 Prompt: START RELEASE-HARDENING

```text
You are hardening the existing Predicta monorepo for release readiness.

IMPORTANT:
- Inspect the current monorepo first.
- Preserve all mobile and web product behavior.
- Do NOT change UI, product logic, monetization, guest access, Firebase data models, AI routing, astrology, or PDF behavior unless fixing a release risk.
- Do NOT commit, push, or deploy unless explicitly asked.
- Keep changes practical and verifiable.

GOAL:
Create a repeatable release gate and document the release checklist for mobile, web, Firebase, AI security, billing, privacy, guest access, and analytics.

SCOPE:
1. Review root scripts, app scripts, Firebase config, env examples, and release docs.
2. Add a release-check script if missing.
3. Ensure the release-check script runs typecheck, lint, tests, web build, and Android bundle.
4. Add a full release-check mode that also runs Android debug build.
5. Add release hardening documentation.
6. Add README links to the release gate.
7. Keep mock billing and mock AI flags guarded for release checks.
8. Preserve all existing behavior.

VERIFY:
- corepack pnpm release:check
- corepack pnpm release:check:full if native verification is needed

FINAL:
Report files changed, checks run, release risks remaining, and the next recommended phase keyword.
```

---

## Phase 11 Prompt: START FIREBASE-RULES-BACKEND-AUTHORITY

```text
You are hardening Predicta Firebase access for production.

IMPORTANT:
- Inspect current Firebase services, collections, storage paths, and shared Firebase contracts first.
- Preserve mobile and web behavior.
- Do NOT deploy rules unless explicitly asked.
- Do NOT move app logic to backend in this phase unless there is already a backend foundation ready.
- Keep client apps working locally while documenting production authority requirements.

GOAL:
Add explicit Firestore and Storage security rules, indexes, Firebase config wiring, and backend-authority documentation so mobile and web can share one Firebase database safely.

SCOPE:
1. Add Firestore rules for user-owned documents.
2. Add Storage rules for user-owned PDF uploads.
3. Add Firestore index config for current queries.
4. Wire rules into firebase.json.
5. Keep pass-code/admin writes backend/custom-claim authoritative.
6. Document which writes may be client-owned and which require backend authority.
7. Preserve all existing app behavior.

VERIFY:
- corepack pnpm typecheck
- corepack pnpm lint
- corepack pnpm test
- corepack pnpm release:check

FINAL:
Report rules added, authority model, verification, deploy status, and next recommended phase keyword.
```

---

## Phase 12 Prompt: START BACKEND-ADMIN-FUNCTIONS

```text
You are implementing Predicta backend authority functions for admin access, guest passes, and future billing verification.

IMPORTANT:
- Inspect the current FastAPI backend, Firebase rules, shared access types, and pass-code helpers first.
- Preserve all mobile and web behavior.
- Do NOT deploy unless explicitly asked.
- Do NOT grant Premium from client-only state.
- Do NOT store raw guest pass codes.
- Keep Firebase Admin credentials server-only.

GOAL:
Add backend/server authority routes so admin/full-access claims, guest pass creation, guest pass revocation, guest pass redemption, audit logs, and billing verification stubs can move behind trusted server logic.

SCOPE:
1. Add Firebase Admin SDK dependency to the backend.
2. Add lazy Firebase Admin initialization with service-account or default credential support.
3. Add Firebase ID-token authentication guard.
4. Add admin authorization guard using custom claims with bootstrap email fallback for first setup only.
5. Add endpoint to set ADMIN/FULL_ACCESS/FREE custom claims.
6. Add endpoint to create guest pass codes and store only hashes.
7. Add endpoint to list sanitized guest pass summaries.
8. Add endpoint to revoke guest pass codes.
9. Add endpoint to redeem guest pass codes with email/device/redemption validation.
10. Add immutable audit log writes for admin actions.
11. Add non-permissive billing verification endpoint stub for future Play/App Store receipt validation.
12. Document backend deployment and authority requirements.

SECURITY:
- Raw pass codes are returned only once and never persisted.
- Restricted pass failures must use generic copy.
- New pass redemption must not work offline.
- Admin operations require Firebase ID token.
- Production admin status must rely on backend/Firebase authority, not client state.

VERIFY:
- python3 -m pytest backend/tests
- corepack pnpm release:check

FINAL:
Report backend routes added, security posture, verification, deployment status, and the next recommended phase keyword.
```

---

## Phase 13 Prompt: START CLIENT-ADMIN-BACKEND-WIRING

```text
You are wiring Predicta mobile and web admin/access clients to the backend authority routes.

IMPORTANT:
- Inspect the current mobile/web admin screens, redeem-pass screens, Firebase auth services, and backend authority routes first.
- Preserve existing mobile and web UI behavior.
- Do NOT deploy unless explicitly asked.
- Do NOT reintroduce client-side guest pass creation or redemption as production authority.
- Do NOT expose Firebase Admin credentials or backend secrets to browser/mobile bundles.

GOAL:
Connect admin access grants, guest pass creation, pass listing, revocation, and redemption to the backend FastAPI authority layer using Firebase ID tokens.

SCOPE:
1. Add shared backend authority client contracts.
2. Add mobile backend authority URL config.
3. Add web public backend URL config for static export.
4. Add Firebase ID-token retrieval for mobile and web.
5. Update mobile guest pass redemption to call backend redemption.
6. Update mobile admin helper methods to call backend routes.
7. Update web redeem-pass page to call backend redemption.
8. Update web admin page to create/list/revoke passes and set access grants through backend routes.
9. Add backend CORS config for approved web origins.
10. Keep client-side Firestore reads only where they are non-authoritative.
11. Document required environment variables.

VERIFY:
- python3 -m pytest backend/tests
- corepack pnpm typecheck
- corepack pnpm lint
- corepack pnpm test
- corepack pnpm release:check

FINAL:
Report client/backend wiring, remaining deployment requirements, verification, and the next recommended phase keyword.
```

---

## Phase 14 Prompt: START BACKEND-DEPLOYMENT-ENV-WIRING

```text
You are preparing Predicta backend deployment and environment wiring.

IMPORTANT:
- Inspect current backend, Firebase Hosting config, client backend URL config, and docs first.
- Do NOT deploy unless explicitly asked.
- Do NOT commit service-account JSON, raw pass codes, or private env files.
- Preserve mobile, web, backend, Firebase rules, and shared package behavior.
- Keep deployment practical for the current Firebase/Google Cloud project.

GOAL:
Make the FastAPI backend deployable as the trusted Cloud Run authority and document exactly how web/mobile point to the deployed backend.

SCOPE:
1. Add backend Dockerfile and dockerignore.
2. Add Cloud Run deployment script with dry-run mode.
3. Add Cloud Run service template or equivalent deployment reference.
4. Document required Google Cloud APIs.
5. Document backend service account and least-privilege IAM roles.
6. Document CORS origins for predicta.rudraix.com and Firebase Hosting.
7. Document web build-time backend URL wiring.
8. Document mobile production backend URL wiring.
9. Add root scripts for backend dev and deploy dry run.
10. Keep Firebase Admin credentials server-only.
11. Keep bootstrap admin emails temporary and documented.

VERIFY:
- ./scripts/deploy-backend-cloud-run.sh with DRY_RUN=true
- python3 -m pytest backend/tests
- corepack pnpm release:check

FINAL:
Report deployment artifacts, environment variables, verification, deploy status, and the next recommended phase keyword.
```
