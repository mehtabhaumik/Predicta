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

## Supplemental Started-State Compactness Lock

Date: 2026-06-11

### Implemented

- Once `/ask` has incoming context or the user starts a question, the lightweight
  Ask shell now turns into a compact prompt bar instead of keeping the full
  landing-style prompt wrapper above the chat.
- Started chat state hides the hero copy, suggestion chips, support paragraph,
  hint cards, and voice note so the active experience feels like Predicta chat
  first, not a control-panel preface.
- Desktop keeps the prompt bar sticky for quick follow-up entry; mobile keeps it
  static to avoid viewport and safe-area friction.

### Supplemental Verification

- `corepack pnpm --filter @pridicta/web typecheck`: PASS after rerunning
  sequentially to avoid the known `.next/types` generation race.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, `36` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- Browser DOM audit of `/ask?sourceScreen=Audit&prompt=Will+my+career+improve%3F&autoSend=true`: PASS. The page had `ask-light-shell-started`, a mounted chat panel, hidden copy/chips/hints/support blocks, no horizontal overflow, and a compact prompt textarea.
- `git diff --check`: PASS.

## Supplemental Loading Receipt Lock

Date: 2026-06-11

### Implemented

- Replaced empty `/ask` and evidence-room chat loading fallbacks with a
  localized Predicta loading receipt.
- Added English, Hindi, and Gujarati loading copy in the dedicated translation
  JSON instead of hardcoding customer-facing loading text in components.
- Styled the loading state with a responsive Predicta orb, concise message, and
  skeleton lines so route handoffs feel alive instead of blank while the full
  chat runtime loads.

### Supplemental Verification

- `node -e "JSON.parse(require('fs').readFileSync('packages/config/src/translations/competitorResponse.json','utf8')); console.log('competitorResponse translations valid')"`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3028 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3028 corepack pnpm test:app-revival-phase-9`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3028 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/kundli,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, `40` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3028 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/kundli,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

### Supplemental Result

Green. Ask Predicta handoffs no longer present a dead empty panel during lazy
chat loading, and the loading copy remains localization-auditable.

## Supplemental Real Voice Capture Lock

Date: 2026-06-12

### Implemented

- Replaced the first-screen `Speak instead` link behavior with real browser
  speech-to-text capture on both the landing Ask console and `/ask`.
- Added a lightweight speech hook that uses browser `SpeechRecognition` /
  `webkitSpeechRecognition` only after the user taps the voice button, keeping
  the first screen dependency-free and within route budget.
- Captured voice now fills the question textarea and shows a localized receipt
  before the user sends the question to Predicta.
- Unsupported browsers get a localized fallback message and can continue typing
  without dead-end behavior.
- Voice copy for English, Hindi, and Gujarati lives in
  `competitorResponse.json`, not in component logic.

### Supplemental Verification

- `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('packages/config/src/translations/competitorResponse.json','utf8')); console.log('competitorResponse json ok')"`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm build:web`: PASS. `/` and `/ask` remain at about `129 kB`
  First Load JS.
- `corepack pnpm test:app-revival-phase-6`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/vedic,/dashboard/report,/dashboard/kundli corepack pnpm test:ui-text-overflow`: PASS.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS.
- Targeted Chrome voice smoke with fake `SpeechRecognition`: PASS. Clicking
  `/ask` `Speak instead` filled the textarea with
  `Will I get a better job opportunity soon?` and showed
  `Voice captured. Review the question, then ask Predicta.`
- `git diff --check`: PASS.

### Supplemental Result

Green. The revived first screen now behaves like an actual text-and-voice
astrology doorway instead of a placeholder voice mode.
