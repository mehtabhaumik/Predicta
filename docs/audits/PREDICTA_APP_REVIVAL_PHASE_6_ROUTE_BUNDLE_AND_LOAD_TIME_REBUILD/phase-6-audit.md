# PREDICTA_APP_REVIVAL_PHASE_6_ROUTE_BUNDLE_AND_LOAD_TIME_REBUILD

Date: 2026-06-10
Status: GREEN

## Scope

Phase 6 removes heavy dashboard/report/chat imports from the public landing and
top-level Ask Predicta first screen so the product feels fast enough to trust.

## Implementation Lock

- Replaced the landing page's heavy `WebHeader` and `WebFooter` with lightweight
  landing-only header/footer components.
- Replaced broad `@pridicta/config` imports in landing and `/ask` first-screen
  client islands with lightweight JSON-backed copy helpers.
- Added a lightweight language preference hook for public/chat-first entry
  surfaces.
- Kept translations sourced from dedicated JSON files.
- Kept the full `WebPridictaChat` dynamically loaded only after chat starts.
- Added `test:app-revival-phase-6` to lock route bundle budgets.

## Bundle Evidence

Before this phase, recent build output showed:

- `/`: `599 kB` First Load JS.
- `/ask`: `464 kB` First Load JS.

After this phase:

- `/`: `125 kB` First Load JS.
- `/ask`: `125 kB` First Load JS.

Phase 6 budget gate:

- Landing page-specific JS: `84 KB` against `250 KB` budget.
- `/ask` page-specific JS: `81 KB` against `400 KB` budget.

## Runtime Proof

Production server: `http://127.0.0.1:3035`

- `/` returned HTTP 200.
- `/ask` returned HTTP 200.
- Landing first screen rendered the Ask Predicta textarea.
- `/ask` first screen rendered the lightweight text/voice shell.
- Full chat thread was not eagerly mounted before the user started chat.
- Mobile Gujarati language switch rendered Gujarati landing and `/ask` copy.
- Gujarati runtime smoke showed no English landing-title leak.
- Landing submit button navigated to `/ask` with the default prompt preserved.
- No horizontal overflow was detected in runtime smoke.

## Verification

- `node` JSON parse for `language.json` and `competitorResponse.json`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3035 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask corepack pnpm test:ui-text-overflow`: PASS, 8 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3035 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `curl` route smoke for `/` and `/ask`: PASS.

## Green Criteria Result

- Build manifest shows meaningful route payload reduction: PASS.
- Runtime smoke proves first render and click-to-chat are improved: PASS.
- No route loses translations or accessibility: PASS.
- Public landing does not eagerly import dashboard shell, auth dialog, report/PDF,
  or full chat code: PASS.

## Supplemental Dashboard Shell Rebuild

Date: 2026-06-11

The Library route was still inheriting the old dashboard/control-panel payload
after the first app-revival pass. The shell has now been split so `/dashboard`
loads as a lightweight saved-work surface instead of pulling full astrology,
Kundli storage refresh, footer, language, pass, and motion dependencies into the
first route payload.

Implementation lock:

- Removed `framer-motion` from dashboard shell/sidebar critical path.
- Replaced full dashboard language selector with the lightweight JSON-backed
  language selector.
- Replaced full `WebFooter` with a lightweight dashboard footer.
- Moved pass tracking banner into an async dashboard chunk.
- Replaced full Kundli library hook on `/dashboard` with a lightweight local
  snapshot for active name/place/count.
- Extended `test:app-revival-phase-6` to enforce `/dashboard` route budget and
  reject old heavy shell imports.

Performance evidence:

- Before supplemental rebuild: `/dashboard` First Load JS was `595 kB`.
- After supplemental rebuild: `/dashboard` First Load JS is `126 kB`.
- Updated Phase 6 gate: `/dashboard` page-specific JS is `87 kB` against a
  `180 kB` budget.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard,/dashboard/report corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm test:app-revival-phase-8`: PASS.
- Browser smoke on `/dashboard`: desktop Ask Predicta, language selector,
  footer, and mobile drawer all rendered with no horizontal overflow.

## Supplemental Specialist Room Deferred Runtime Rebuild

Date: 2026-06-11

After the public, Ask Predicta, and Library shells were lightened, the
specialist worlds still behaved like control-panel payloads. The room entry
surfaces now render quickly while the expensive evidence engines hydrate as
deferred runtime chunks.

Implementation lock:

- Deferred KP, Jaimini, Numerology, Signature, Kundli, and Vedic intelligence
  runtimes behind route-local dynamic loaders.
- Kept each specialist route's Ask Predicta handoff and evidence-room entry
  visible before the heavy analysis panel loads.
- Kept the Kundli wizard behavior intact while moving it out of first-load JS.
- Replaced the Vedic page's eager full Kundli library and Vedic intelligence
  imports with a lightweight shell plus deferred Vedic intelligence runtime.
- Extended `test:app-revival-phase-6` to include specialist route budgets and
  prevent reintroducing eager panel imports.

Performance evidence from `corepack pnpm build:web`:

- `/dashboard/kundli`: `849 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/kp`: `843 kB` before this pass -> `248 kB` First Load JS.
- `/dashboard/jaimini`: `835 kB` before this pass -> `248 kB` First Load JS.
- `/dashboard/numerology`: `832 kB` before this pass -> `248 kB` First Load JS.
- `/dashboard/signature`: `707 kB` before this pass -> `248 kB` First Load JS.
- `/dashboard/vedic`: `849 kB` before this pass -> `400 kB` First Load JS.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS with specialist budgets.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS.
- `node scripts/run-birth-place-autocomplete-gate.mjs`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `git diff --check`: PASS.

## Supplemental Ask Predicta Intent Preload Lock

Date: 2026-06-12

The `/ask` route stayed lightweight, but the full chat runtime was only fetched
after the user submitted a prompt or opened a seeded Ask link. That preserved
initial load, but it could still make the first real chat action feel delayed.

Implementation lock:

- Kept `WebPridictaChat` out of initial server rendering and first paint.
- Added a deduped module loader for the full Predicta chat runtime.
- Preloads the full chat runtime when the user shows intent by focusing,
  hovering, touching the Ask console or prompt chips, starting voice capture, or
  landing with incoming Ask context.
- Starts the same preload immediately when a prompt is submitted so the dynamic
  chat render and module fetch share the same promise.

Performance evidence from `corepack pnpm build:web`:

- `/ask`: `9.33 kB` page size and `130 kB` First Load JS after the preload
  change, keeping the route lightweight.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, `15` scenarios.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/ask,/ corepack pnpm test:ui-text-overflow`: PASS, `8` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/ask,/ corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

Supplemental result:

Green. `/ask` still loads as a lightweight text/voice entry page, but the first
real chat action now warms the full Predicta runtime on intent instead of
waiting until after the user has committed.

## Supplemental Static Entry Route Lock

Date: 2026-06-12

The public landing page and top-level Ask Predicta route were still explicitly
marked as dynamic even after their heavy first-screen imports had been removed.
Both pages now render as lightweight static shells with client islands, so
keeping `force-dynamic` only made the two most important entry routes slower
than needed.

Implementation lock:

- Removed forced dynamic rendering from `/`.
- Removed forced dynamic rendering from `/ask`.
- Kept both pages translation-backed and client-hydrated for interactive chat
  entry.
- Did not move personalized account, Kundli, entitlement, or report data into
  static HTML.

Performance evidence from `corepack pnpm build:web`:

- `/`: static prerendered route (`○`) with `3.01 kB` route size and `131 kB`
  First Load JS.
- `/ask`: static prerendered route (`○`) with `9.26 kB` route size and `130 kB`
  First Load JS.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.

## Supplemental Family, Matchmaking, And Redeem Runtime Split

Date: 2026-06-11

Family Vault, pair comparison, family karma map, matchmaking, and redeem pass
still behaved like slow dashboard panels because their route boundaries pulled
auth, Kundli library, product bank, relationship, and matching runtimes into
first-load JS. These routes now use lightweight page loaders first and defer the
heavier interactive panels until after first paint.

Implementation lock:

- Moved Family Vault, Pair Comparison, Family Karma Map, Matchmaking, and Redeem
  Pass route bodies into deferred component-level page runtimes.
- Added route-level loaders with `SpecialistRoomPanelFallback` and `ssr: false`
  for the heavy relationship and pass redemption surfaces.
- Removed eager `demoAccess` imports from family comparison and matchmaking
  route shells so access/monetization code does not inflate navigation.
- Added Family, Pair Comparison, Family Karma Map, Matchmaking, and Redeem Pass
  to the Phase 6 route-budget gate at `80 KB`.
- Replaced Family Vault Hindi/Gujarati fallback strings for assignment, auth,
  Family Bank, balance, profile summary, and ARIA copy with dedicated native
  translation JSON entries.

Performance evidence from `corepack pnpm build:web`:

- `/dashboard/family`: heavy first-load route before this pass -> `104 kB` First Load JS.
- `/dashboard/family/compare`: `593 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/family/karma-map`: `593 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/matchmaking`: `467 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/redeem-pass`: heavy first-load route before this pass -> `104 kB` First Load JS.

Updated Phase 6 gate evidence:

- `/dashboard/family` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/family/compare` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/family/karma-map` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/matchmaking` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/redeem-pass` page-specific JS: `4 KB` against `80 KB` budget.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS with Family/Matchmaking/Redeem budgets.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/family,/dashboard/family/compare,/dashboard/family/karma-map,/dashboard/matchmaking,/dashboard/redeem-pass corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- In-app browser hydration check on the fresh local production build: Family,
  Pair Comparison, and Family Karma Map rendered account-required prompts;
  Matchmaking and Redeem Pass hydrated their content; no horizontal overflow was
  present on the inspected routes.
- `git diff --check`: PASS.

## Supplemental Secondary Dashboard Deferred Runtime Rebuild

Date: 2026-06-11

After the specialist rooms were deferred, several secondary dashboard routes
still loaded expensive calculation/runtime dependencies on first paint. These
routes now render lightweight entry pages and hydrate the deeper tool/runtime
only after the shell is visible.

Implementation lock:

- Deferred Birth Time Detective, Charts Explorer, Decision Oracle, Holistic
  Rooms, Saved Kundlis, Timeline, Wrapped, Matchmaking, Family Compare, Family
  Karma Map, and Remedy Coach behind route-local dynamic loaders.
- Moved Timeline, Wrapped, and Holistic calculation/UI composition into runtime
  components so route entry files stay light.
- Extended `test:app-revival-phase-6` with secondary dashboard route budgets
  and eager-import guards so these pages cannot quietly regress into
  control-panel payloads.

Performance evidence from `corepack pnpm build:web`:

- `/dashboard/birth-time`: `823 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/charts`: `846 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/decision`: `824 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/holistic`: `821 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/saved-kundlis`: `847 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/timeline`: `832 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/wrapped`: `822 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/remedies`: `826 kB` before this pass -> `248 kB` First Load JS.

Updated Phase 6 gate evidence:

- `/dashboard/birth-time` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/charts` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/decision` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/holistic` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/saved-kundlis` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/timeline` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/wrapped` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/remedies` page-specific JS: `555 KB` against `600 KB` budget.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS with secondary dashboard budgets.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/birth-time,/dashboard/charts,/dashboard/decision,/dashboard/holistic,/dashboard/remedies,/dashboard/saved-kundlis,/dashboard/timeline,/dashboard/wrapped corepack pnpm test:ui-text-overflow`: PASS, 32 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `node scripts/run-birth-place-autocomplete-gate.mjs`: PASS.
- `git diff --check`: PASS.

## Supplemental Public Trust And Commerce Runtime Rebuild

Date: 2026-06-11

The public trust and commerce pages still carried the old full public shell and
heavy page runtimes, making simple policy, pricing, checkout, founder, and
feedback visits feel like control-panel routes. These routes now use the
lightweight Predicta public shell first and defer their deeper runtime content.

Implementation lock:

- Replaced the old `WebHeader` and `WebFooter` on public/trust/commerce pages
  with `LandingLightHeader` and `LandingLightFooter`.
- Moved Safety, Pricing, Checkout, Feedback, and Founder content behind
  client-side deferred runtime loaders.
- Added a compact public fallback shell so first paint is useful and
  action-oriented while detailed content hydrates.
- Moved the fallback shell copy into a dedicated JSON-backed adapter so Hindi
  and Gujarati first-paint states do not regress into English-only placeholders.
- Extended `test:app-revival-phase-6` with public route budgets for
  Accuracy Method, Checkout, Feedback, Founder, Legal, Pricing, and Safety.
- Tightened the Kundli birth-place autocomplete so the exact Petlad case
  resolves to `Petlad, Gujarat, India` without leaving the suggestion or
  `Searching places...` status stuck on screen.

Performance evidence from `corepack pnpm build:web`:

- `/accuracy-method`: `603 kB` before this pass -> `136 kB` First Load JS.
- `/checkout`: `607 kB` before this pass -> `130 kB` First Load JS.
- `/feedback`: `606 kB` before this pass -> `130 kB` First Load JS.
- `/founder`: `604 kB` before this pass -> `130 kB` First Load JS.
- `/legal`: `602 kB` before this pass -> `126 kB` First Load JS.
- `/pricing`: `605 kB` before this pass -> `130 kB` First Load JS.
- `/safety`: `605 kB` before this pass -> `130 kB` First Load JS.

Updated Phase 6 gate evidence:

- `/accuracy-method` page-specific JS: `116 KB` against `140 KB` budget.
- `/checkout` page-specific JS: `93 KB` against `140 KB` budget.
- `/feedback` page-specific JS: `93 KB` against `140 KB` budget.
- `/founder` page-specific JS: `93 KB` against `140 KB` budget.
- `/legal` page-specific JS: `83 KB` against `140 KB` budget.
- `/pricing` page-specific JS: `93 KB` against `140 KB` budget.
- `/safety` page-specific JS: `93 KB` against `140 KB` budget.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS with public route budgets.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/accuracy-method,/checkout,/feedback,/founder,/legal,/pricing,/safety,/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- Browser runtime check on `/dashboard/kundli`: typing `Petlad` auto-resolved
  the field to `Petlad, Gujarat, India`; no suggestions remained visible and
  `Searching places...` was absent.
- `git diff --check`: PASS.

## Supplemental Account And Settings Runtime Split

Date: 2026-06-11

Account and Settings were still importing the full `WebProfileSettings`
runtime directly at the route boundary. That pulled Firebase/auth/account state
into first-load JS for simple account/settings visits. Both routes now use a
shared deferred loader with the specialist-room fallback shell, so the page
entry stays light while the account runtime hydrates only when needed.

Implementation lock:

- Added `WebProfileSettingsLoader` as a client-side dynamic import wrapper.
- Updated `/dashboard/account` and `/dashboard/settings` to render the loader
  instead of importing `WebProfileSettings` directly.
- Extended `test:app-revival-phase-6` with hard budgets for account and
  settings.
- Added the loader to the forbidden eager-import guard so the routes cannot
  silently regress to the old heavy import path.

Performance evidence from `corepack pnpm build:web`:

- `/dashboard/account`: `608 kB` before this pass -> `104 kB` First Load JS.
- `/dashboard/settings`: `608 kB` before this pass -> `104 kB` First Load JS.

Updated Phase 6 gate evidence:

- `/dashboard/account` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/settings` page-specific JS: `4 KB` against `80 KB` budget.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS with account/settings budgets.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/account,/dashboard/settings corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `git diff --check`: PASS.

## Supplemental Report, Premium, World, And Birth-Place Overlay Lock

Date: 2026-06-11

Report, Premium, Vedic, KP, Jaimini, Numerology, Signature, and Remedies still
carried expensive report/pricing/specialist runtimes at the route boundary. The
birth-place selector also had a race where a selected city could leave the
suggestion/status overlay visible in front of the form.

Implementation lock:

- Moved Report, Premium, Vedic, KP, Jaimini, Numerology, Signature, and Remedies
  route bodies into deferred component-level page runtimes.
- Updated each route entry to render a lightweight page loader with
  `SpecialistRoomPanelFallback` and `ssr: false` for the heavy runtime surface.
- Tightened Phase 6 budgets for Report, Premium, Vedic, KP, Jaimini,
  Numerology, Signature, and Remedies to prevent these routes from silently
  regressing.
- Made a selected birth place authoritative in `WebKundliWizard`: once a place
  is accepted, suggestions/status cannot render until the user edits the field,
  and the input blurs after selection.

Performance evidence from `corepack pnpm build:web`:

- `/dashboard/report`: old heavy report route -> `104 kB` First Load JS.
- `/dashboard/premium`: old heavy premium route -> `104 kB` First Load JS.
- `/dashboard/vedic`: old heavy Vedic route -> `104 kB` First Load JS.
- `/dashboard/kp`: old heavy KP route -> `104 kB` First Load JS.
- `/dashboard/jaimini`: old heavy Jaimini route -> `104 kB` First Load JS.
- `/dashboard/numerology`: old heavy Numerology route -> `104 kB` First Load JS.
- `/dashboard/signature`: old heavy Signature route -> `104 kB` First Load JS.
- `/dashboard/remedies`: old heavy Remedies route -> `104 kB` First Load JS.

Updated Phase 6 gate evidence:

- `/dashboard/report` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/premium` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/vedic` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/kp` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/jaimini` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/numerology` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/signature` page-specific JS: `4 KB` against `80 KB` budget.
- `/dashboard/remedies` page-specific JS: `4 KB` against `80 KB` budget.

Supplemental verification:

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `PREDICTA_BIRTH_PLACE_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3009 node scripts/run-birth-place-autocomplete-gate.mjs`: PASS; Petlad resolves to `Petlad, Gujarat, India`, suggestions unmount, `Searching places...` is absent, refocus stays closed.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/report,/dashboard/premium,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/remedies,/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS, 36 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `git diff --check`: PASS.
