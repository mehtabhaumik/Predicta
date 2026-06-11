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
