# PREDICTA_APP_REVIVAL_PHASE_5_SPECIALIST_WORLDS_AS_EVIDENCE_ROOMS

Date: 2026-06-10
Status: GREEN

## Scope

Phase 5 converts specialist worlds from disconnected mini-app entrances into Predicta evidence rooms.

Rooms covered:

- Vedic
- KP
- Jaimini
- Numerology
- Signature
- Kundli Karma / Remedies

## Implementation Lock

- Added a shared `WebEvidenceRoomEntry` surface.
- Added translation-backed copy for English, Hindi, and Gujarati.
- Added a direct meaning, one next action, evidence drawer, and Ask Predicta handoff for each room.
- Preserved each specialist room's deeper existing panel below the new action-first entry.
- Kept technical evidence available, but no room now opens with schooling-first copy.

## Runtime Proof

Browser DOM verification on `http://127.0.0.1:3034` confirmed:

- `[data-app-revival-phase5-evidence-room]` exists on all six target routes.
- Each room renders a non-empty direct title and next action.
- Each room includes an evidence drawer.
- Each room includes an `/ask?...` handoff link with room context.
- No horizontal overflow was detected at the checked desktop runtime width.

Routes smoke tested with HTTP 200:

- `/dashboard/vedic`
- `/dashboard/kp`
- `/dashboard/jaimini`
- `/dashboard/numerology`
- `/dashboard/signature`
- `/dashboard/remedies`
- `/ask`

## Verification

- `node` translation audit: PASS, 29 evidence-room keys across `en`, `hi`, and `gu`.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3034 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/remedies corepack pnpm test:ui-text-overflow`: PASS, 24 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3034 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.

## Green Criteria Result

- Specialist rooms are calm, short, and action-first: PASS.
- User understands why each room exists before reading technical details: PASS.
- Predicta can receive room context through the Ask Predicta handoff: PASS.
- No text overflow or spacing regression was found in automated UI gates: PASS.

## Supplemental Vedic Room Duplicate-Action Collapse

Date: 2026-06-12

### Implemented

- Removed the duplicate visible `Build Vedic report` hero CTA so the Vedic
  room opens with one clear primary action: chat with Predicta.
- Converted the always-visible Vedic local tool grid into the shared
  `predicta-world-local-map` disclosure pattern used by other evidence rooms.
- Preserved `Open charts`, `Remedies`, `Check birth time`, and
  `Build Vedic report`, but moved them behind the closed local-map drawer.
- Converted the Vedic report/evidence focus panel into a closed proof drawer,
  preserving the same evidence cards without presenting another visible action
  row.
- Kept the deeper Vedic intelligence runtime below the entry section; this
  change only reduces the top-level room clutter and duplicate CTA pressure.

### Supplemental Verification

- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard,/ask corepack pnpm test:ui-text-overflow`: PASS, `28` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard,/ask corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `corepack pnpm test:app-revival-phase-6`: PASS; `/dashboard/vedic` stayed
  within the specialist route bundle budget.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, `15` scenarios.
- Headless Chrome check on `/dashboard/vedic`: PASS. The local-map drawer and
  Vedic proof drawer existed, both were closed, painted `0` nested cards while
  closed, exposed one hero action (`Chat with Vedic Predicta`), and had `0px`
  horizontal overflow.
- `corepack pnpm test:app-revival-phase-5` is not a configured package script;
  Phase 5 is documented by this audit file and covered by the route/browser
  gates above.
- `git diff --check`: PASS.

### Supplemental Result

Green. Vedic now behaves like the calmer specialist evidence rooms: answer/chat
first, local tools only when intentionally opened, and proof only when the user
asks for it.

## Supplemental Specialist Detailed-Room Deferral

Date: 2026-06-12

### Implemented

- Added one shared translated `Open detailed room` disclosure for Vedic, KP,
  Jaimini, Numerology, and Signature.
- Deferred each specialist room's heavier chart, proof, report, and tool panels
  until the user opens the detailed-room disclosure.
- Preserved all specialist capabilities. Nothing was deleted; the default room
  view is now answer-first and depth-on-demand.
- Corrected the Vedic outlier by placing the custom Vedic world frame and the
  Vedic intelligence panel behind the same detailed-room disclosure.
- Added dedicated English, Hindi, and Gujarati translation keys for the shared
  detailed-room copy and the touched Vedic fallback guidance.

### Supplemental Verification

- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `corepack pnpm test:app-revival-phase-6`: PASS. Specialist route
  page-specific bundles are now about `4 KB`; `/dashboard/vedic`,
  `/dashboard/kp`, `/dashboard/jaimini`, `/dashboard/numerology`, and
  `/dashboard/signature` all stayed within budget.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard,/ask corepack pnpm test:ui-text-overflow`: PASS, `28` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard,/ask corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS, `63` screenshot-backed checks.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, `15` scenarios.
- Visual audit of `mobile-390-dashboard-vedic.png`,
  `mobile-390-dashboard-kp.png`, `mobile-390-dashboard-jaimini.png`,
  `mobile-390-dashboard-numerology.png`, and
  `mobile-390-dashboard-signature.png`: PASS. Each room shows one calm Ask
  Predicta entry, one evidence-room card, and one detailed-room drawer without
  specialist panel clutter on the first screen.
- In-app browser check on `http://127.0.0.1:3009/dashboard/vedic`: PASS. The
  Vedic detailed-room drawer exists, is closed by default, the old Vedic world
  panel text is not visible before opening depth, and horizontal overflow is
  `0px`.
- `git diff --check`: PASS.

### Supplemental Result

Green. The specialist worlds now act as focused evidence rooms behind the main
Predicta experience: first screen gives the answer path, the proof path stays
available, and deeper specialist machinery waits until the user asks for it.
