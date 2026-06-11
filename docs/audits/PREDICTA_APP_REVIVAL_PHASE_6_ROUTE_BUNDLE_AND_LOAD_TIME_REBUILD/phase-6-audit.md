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
