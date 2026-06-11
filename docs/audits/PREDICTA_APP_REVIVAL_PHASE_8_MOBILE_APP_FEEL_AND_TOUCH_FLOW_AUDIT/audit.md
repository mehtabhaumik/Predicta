# PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT

## Status

Green.

## Scope

This phase makes the revived Predicta experience feel more like a mobile
astrology app and less like a squeezed dashboard. The strict focus was the
first-screen Predicta input, touch-safe voice access, contained chips/actions,
evidence-room stacking, report action stacking, and no accidental horizontal
overflow.

## Changes

- Mobile landing now places the Predicta ask console before the hero copy.
- Mobile `/ask` now places the textarea first and the `Ask Predicta` /
  `Speak instead` actions immediately below it.
- Suggested questions are contained in a vertical in-card scroller on mobile so
  no chip or button extends outside the viewport.
- `/ask` voice now starts the chat with voice mode instead of only showing a
  notice.
- Added `test:app-revival-phase-8` and a browser-backed Phase 8 gate that
  checks 360px, 390px, 430px, 768px, 834px, 1024px, and desktop widths.
- The Phase 8 gate saves screenshot artifacts for landing, ask, dashboard,
  specialist worlds, and report routes.

## Evidence

- `node --check scripts/run-app-revival-phase-8-mobile-app-feel-gate.mjs`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3040 corepack pnpm test:app-revival-phase-8`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3040 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/report,/dashboard/kundli,/dashboard/redeem-pass,/pricing corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3040 corepack pnpm test:ui-personal-space`
- `PREDICTA_AUTOCOMPLETE_BASE_URL=http://127.0.0.1:3040 corepack pnpm test:birth-place-autocomplete`
- `corepack pnpm test:global-translation-coverage`
- `git diff --check`

## Artifact Proof

- Manifest:
  `docs/audits/PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT/mobile-app-feel-manifest.json`
- Screenshot directory:
  `docs/audits/PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT/screenshots`
- 63 route and viewport screenshots were generated.
- At 360px, the landing textarea starts at `164px` and the `/ask` textarea
  starts at `148px`.
- At 360px, landing and `/ask` voice buttons are visible, at least 44px tall,
  and do not overlap the viewport edge.

## Result

Predicta is now more action-first on mobile: the user sees the input and
Ask/Speak actions before the app starts explaining itself. The checked
dashboard, specialist-world, report, Kundli, pricing, and redeem-pass routes
have no audited text overflow, no horizontal overflow, no personal-space
violations, and no regression in the birth-place autocomplete selector.

## Supplemental Mobile Header And Action Rhythm Lock

Date: 2026-06-11

After the route runtime rebuild, the mobile shells were technically valid but
still carried a control-panel smell: dashboard/evidence/report pages placed the
menu button below the primary Ask Predicta CTA, and the `/ask` lean header could
wrap into a second row of navigation pills before the user reached the question
box.

### Changes

- Dashboard mobile topbar now keeps `Ask Predicta` and the menu button in one
  compact action row.
- The dashboard menu button uses the same touch target sizing as the primary
  mobile topbar row instead of dropping into a lonely second line.
- `/ask` mobile navigation now stays in one horizontal scroll row, preventing
  `Premium` from wrapping into a bulky extra row above the chat prompt.
- The first-screen hierarchy remains: question field, Ask/Speak actions,
  then explanation and suggested questions.

### Evidence

- `corepack pnpm build:web`: PASS.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS, 63 route and viewport screenshots regenerated.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, 32 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `git diff --check`: PASS.

### Visual Audit Notes

- `mobile-390-dashboard.png`: primary Ask Predicta CTA and menu are now aligned
  in one row inside the top card.
- `mobile-390-dashboard-report.png`: report page now keeps the CTA/menu row
  compact before the report chooser begins.
- `mobile-390-ask.png`: the top navigation stays one line high with horizontal
  scroll instead of wrapping into a second row before the chat prompt.

## Supplemental Ask Screen Directness Lock

Date: 2026-06-11

The `/ask` mobile screen still felt slightly too much like a product page because
navigation repeated the current `Ask Predicta` destination and the large
explanatory headline appeared before the suggested question prompts. This pass
moves the screen closer to a simple text/voice astrology app.

### Changes

- Removed the redundant `Ask Predicta` nav pill from the `/ask` lean header.
- Reordered mobile `/ask` content so the first-screen sequence is: textarea,
  Ask/Speak actions, suggested questions, practical hints, then the explanatory
  headline/copy below.
- Limited mobile suggested questions to three fully visible chips so no prompt is
  clipped or half-visible in the first viewport.
- Kept desktop/tablet suggested-question depth unchanged.

### Evidence

- `corepack pnpm build:web`: PASS.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS, 63 route and viewport screenshots regenerated.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, 32 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS.
- `corepack pnpm test:global-translation-coverage`: PASS.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `git diff --check`: PASS.

### Visual Audit Notes

- `mobile-390-ask.png`: the first viewport now shows Library/Reports/Premium,
  the question textarea, Ask/Speak actions, three full suggested questions, and
  no clipped fourth chip.
- The longer `Start with the question on your mind` copy remains available below
  the practical action area instead of competing with it.

## Supplemental Landing And Direct Ask Density Lock

Date: 2026-06-11

The landing and `/ask` first screens still had a small brochure-like residue:
the landing prompt list could create a cropped mini-scroll stack on mobile, and
the direct `/ask` route showed duplicate explanatory copy below the practical
input surface. This pass makes mobile feel more like a simple astrology text and
voice app.

### Changes

- Landing suggested prompts are limited to the four strongest prompts on
  desktop/tablet and three visible prompts on mobile.
- Removed the permanent landing voice instruction card so the first action area
  stays focused on asking or speaking the question.
- Removed the mobile landing chip mini-scroll region; no suggested prompt should
  be half-visible or cropped.
- Hid the duplicate `/ask` explanatory copy on mobile so the direct chat doorway
  opens with the textarea, Ask/Speak actions, suggested prompts, and Kundli
  hints only.
- Desktop landing and tablet `/ask` still keep the larger story copy where the
  screen has enough room for it.

### Evidence

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS, 63 route and viewport screenshots regenerated.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, 36 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, 15 scenario screenshots regenerated; runner required manual stop after writing the pass manifest.
- `corepack pnpm test:global-translation-coverage`: PASS.

### Visual Audit Notes

- `mobile-390-home.png`: first viewport is now the brand header plus the
  practical Ask/Speak console and three complete prompts; no cropped fourth
  prompt or instructional voice card remains.
- `mobile-390-ask.png`: direct Ask route now opens directly to the input,
  actions, prompts, and Kundli hints without the duplicate marketing headline
  peeking below the card.
- `desktop-1440-home.png`: desktop still preserves the premium positioning copy
  and a fuller prompt set because the available width supports it.

## Supplemental Desktop Navigation And World Rail Lock

Date: 2026-06-11

The landing header previously protected smaller screens by hiding the public nav
behind the menu too early. At normal desktop width, that made Predicta look more
like a mobile shell than a real astrology website. A direct attempt to show every
world in the header proved too crowded, so this pass uses a selective desktop nav
plus a quiet world rail below the primary Ask moment.

### Changes

- Desktop public header now exposes the core public navigation at 1440px:
  Vedic, KP, Jaimini, Reports, Premium, language selector, and Ask Predicta.
- Tablet, laptop, and mobile widths still keep the compact menu to avoid
  localized label crowding and logo collisions.
- Landing page now includes a translated specialist-world rail below the proof
  strip so Vedic, KP, Jaimini, Numerology, Signature, and Reports remain
  discoverable without crowding the first action row.
- Numerology and Signature links remain available to link-reliability audits
  without making the header feel like a control panel.

### Evidence

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_MOBILE_APP_FEEL_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-8`: PASS, 63 route and viewport screenshots regenerated.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`: PASS, 36 route and viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:ui-personal-space`: PASS, 56 route and viewport checks.
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`: PASS, 15 scenarios.
- `corepack pnpm test:global-translation-coverage`: PASS.

### Visual Audit Notes

- `desktop-1440-home.png`: logo, nav, language selector, and Ask Predicta CTA
  now have clear personal space; no nav text leaks into the logo/tagline.
- `tablet-834-home.png` and `mobile-390-home.png`: compact menu remains active
  where translated labels would crowd the header.
- The world rail appears below the chat-first proof strip, preserving the first
  screen as input-first while keeping all specialist rooms discoverable.
