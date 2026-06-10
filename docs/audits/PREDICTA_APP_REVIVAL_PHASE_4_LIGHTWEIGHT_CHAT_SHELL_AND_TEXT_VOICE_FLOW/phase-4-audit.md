# PREDICTA_APP_REVIVAL_PHASE_4_LIGHTWEIGHT_CHAT_SHELL_AND_TEXT_VOICE_FLOW Audit

Status: GREEN for Phase 4 scope.
Date: 2026-06-10

## Implemented

- Replaced eager `/ask` imports of the full public header, footer, event composer, and `WebPridictaChat` with a lightweight chat-first shell.
- Added a lean `/ask` header focused on Predicta, Library, Reports, and Premium.
- Added a direct text-first Ask Predicta console with event question chips and a voice affordance placeholder.
- Lazy-loads the full `WebPridictaChat` only after an incoming context exists or the user starts a question.
- Added `autoSend=true` handling so the new front-door shell can preserve and submit a user's question instead of merely filling the chat input.
- Existing deep links with `prompt`, `sourceScreen`, `kundliId`, school, chart, report, or evidence context still mount the full chat experience.

## Payload Evidence

Latest `corepack pnpm build:web` route table:

- `/ask`: `4 kB`, `461 kB First Load JS`.
- `/dashboard`: `4.02 kB`, `590 kB First Load JS`.
- `/dashboard/chat`: `6.04 kB`, `878 kB First Load JS`.
- `/dashboard/report`: `81.9 kB`, `927 kB First Load JS`.

Previous Phase 3 build evidence had `/ask` around `888 kB First Load JS`; this phase reduces the direct chat front door by roughly `427 kB`.

## Browser Proof

Local production server: `http://127.0.0.1:3033`.

Initial `/ask` state:

- Lean header present.
- Full public header absent.
- Lightweight shell present.
- Textarea visible.
- Event chips visible: `4`.
- Voice button visible.
- Full chat panel not mounted before user action.

Submit handoff proof:

- Clicking the foreign travel/relocation chip changed URL to `/ask?prompt=...&sourceScreen=Ask+Predicta&autoSend=true`.
- User question was preserved in the page state.
- Unsigned local browser correctly showed inline `ACCOUNT REQUIRED` gate without navigating away.
- This preserves the current monetization/auth contract while making the direct chat entry immediate.

Voice affordance proof:

- Clicking `Speak instead` shows the voice note.
- The input is seeded with the Kundli-first prompt.
- The UI does not falsely claim live voice capture is complete.

## Verification

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- Route smoke: PASS for `/ask`, `/ask?prompt=Will+I+go+abroad%3F&sourceScreen=Smoke&autoSend=true`, `/dashboard/chat`, `/dashboard`.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3033 PREDICTA_UI_OVERFLOW_ROUTES=/ask corepack pnpm test:ui-text-overflow`: PASS, `4` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3033 corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

## Notes

- The full signed-in chat answer path is still governed by the current Google sign-in monetization rule. Phase 4 does not remove that contract.
- The next major performance target is Phase 6: shared chunk and dashboard route bundle reduction.
