# PREDICTA_APP_REVIVAL_PHASE_7_LINK_CLICK_LATENCY_AND_NAVIGATION_RELIABILITY

## Goal

Make every major link feel immediate and trustworthy so Predicta behaves like a
simple chat-first astrology app instead of a maze of inert control-panel states.

## Fixes

- Replaced disabled active navigation spans with real links using
  `aria-current="page"` in public navigation, lightweight landing navigation,
  dashboard mobile drawer navigation, and dashboard sidebar navigation.
- Removed disabled-link styling from active navigation so current-page links do
  not look broken or unclickable.
- Added a direct `Create Kundli` action inside the report composer so report
  users have an obvious next step when the report needs birth data.
- Added a strict Phase 7 link reliability gate that checks route availability,
  required public/dashboard/report/pricing links, nested interactive elements,
  disabled-looking links, and critical click timing.

## Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `node --check scripts/run-app-revival-phase-7-link-reliability-gate.mjs`
- `corepack pnpm build:web`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3037 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3037 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature,/dashboard/report,/pricing,/dashboard/redeem-pass corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3037 corepack pnpm test:ui-personal-space`
- `corepack pnpm test:global-translation-coverage`

## Result

Green.

The Phase 7 gate verified all checked routes returned HTTP 200, no required
major link was missing, no active link was rendered as disabled, no nested
interactive element was detected, and critical clicks completed within the
1,800ms budget. The slowest checked click completed in 104ms.

## Supplemental Handoff Compactness Lock

- Removed duplicate report handoff prompt payloads from generated Predicta chat
  links when `prompt` and `reportSectionPrompt` are identical.
- Tightened report section list payloads to carry the first three meaningful
  section names plus a remaining-count marker instead of exposing a long
  report-builder payload in the URL.
- Tightened the Phase 7 default href-length budget from `1,800` to `900`
  characters so future CTAs cannot quietly reintroduce heavy control-panel
  plumbing URLs.

## Supplemental Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`
- `node --check scripts/run-app-revival-phase-7-link-reliability-gate.mjs`
- `git diff --check`

## Supplemental Result

Green.

Worst checked generated handoff URL dropped from `1,109` characters to `760`
characters, and the stricter `900` character href budget passed.

## Supplemental Specialist Handoff Voice Lock

- Removed KP internal method instructions from generated main-Predicta handoff
  prompts. KP now sends the user's refined event question as the prompt while
  preserving KP cusp, sub-lord, significator, and timing evidence as structured
  context metadata.
- Removed Jaimini calculated-evidence payloads from generated main-Predicta
  handoff prompts. Jaimini now sends a short destiny-chapter request while
  preserving Jaimini karaka, Arudha, Karakamsha, and destiny evidence as
  structured context metadata.
- Added localized UI translation entries for the new KP and Jaimini handoff
  prompt templates so these links do not create another hardcoded translation
  island.

## Supplemental Specialist Handoff Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`
- Browser smoke on `http://127.0.0.1:3009/dashboard/kp` and
  `http://127.0.0.1:3009/dashboard/jaimini` verified route-level Ask links do
  not carry internal evidence dumps.
- `node --check scripts/run-app-revival-phase-7-link-reliability-gate.mjs`
- `git diff --check`

## Supplemental Specialist Handoff Result

Green.

The KP generated handoff URL is now `342` characters and the Jaimini generated
handoff URL is no longer an oversized/internal-evidence offender. The Phase 7
manifest, Phase 9 journey manifest, UI overflow audit, and personal-space audit
all passed after the change.

## Supplemental Legacy Redirect Voice Lock

- Tightened legacy `/dashboard/*/chat` redirects so old room URLs land in
  Predicta with short, answer-first prompts instead of method-heavy classroom
  prompts.
- Updated Vedic and Jaimini evidence-room entry prompts to match the same
  direct-answer rhythm.
- Kept Nadi legacy compatibility URLs mapped to Jaimini context, but with a
  Jaimini destiny prompt rather than old Nadi/story-room language.
- Added a shared UI translation entry for the simplified Vedic life-meaning
  prompt used by the Vedic evidence-room Ask CTA.

## Supplemental Legacy Redirect Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`
- `node --check scripts/run-app-revival-phase-7-link-reliability-gate.mjs`
- `node --check scripts/run-app-revival-phase-9-full-user-journey-gate.mjs`
- `git diff --check`

## Supplemental Legacy Redirect Result

Green.

Phase 7 route results verify legacy Vedic, KP, Jaimini, Nadi, Numerology, and
Signature chat URLs redirect to `/ask` with compact room-safe prompts. The
fastest app path remains the direct `/ask` route, while stale room URLs no
longer reintroduce the control-panel/toolkit voice.

## Supplemental No-Dead-Ask-Link Lock

- Converted landing and `/ask` suggested question chips from hydrated-only
  button handlers into real `/ask?...` links so first interactions work even
  while client hydration is still settling.
- Replaced hard `window.location.assign(...)` transitions for landing Ask,
  Signature-to-Predicta, and internal chat suggestion handoffs with app-router
  navigation where the destination is internal.
- Preserved external URL fallback behavior for chat suggestions that may point
  outside the app.
- Kept chip touch sizing, focus states, wrapping, and overflow styling identical
  for button and link chip variants.

## Supplemental No-Dead-Ask-Link Audit Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- Fresh production-like server on `http://127.0.0.1:3027`
- Browser DOM audit on `http://127.0.0.1:3027/ask`: 4 prompt links, 0 prompt
  buttons, voice CTA has a real `/ask?...&inputMode=voice` href, no horizontal
  overflow.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3027 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3027 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3027 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard,/dashboard/report,/dashboard/vedic,/dashboard/kp,/dashboard/jaimini,/dashboard/numerology,/dashboard/signature corepack pnpm test:ui-personal-space`
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3027 corepack pnpm test:app-revival-phase-9`
- `git diff --check`

## Supplemental No-Dead-Ask-Link Result

Green. The public landing and direct `/ask` doorway now expose suggested
questions as real links instead of fragile button-only JavaScript handoffs,
which directly reduces the "link click is not working / opens late" feeling.

## Supplemental Report And Pricing Direct Action Lock

- Added always-visible report-page actions for `Create Kundli` and
  `Ask Predicta` before the dynamic report composer hydrates, so report users
  are not trapped waiting for the builder before they can start.
- Added a first-screen Pricing CTA for the `10 AI Questions` pack at
  `/checkout?productId=pridicta_10_questions`, keeping the purchase path
  visible and clickable on mobile without requiring a long scroll.
- Kept these labels localized through the report-page translation JSON and
  existing product-copy helpers.

## Supplemental Report And Pricing Audit Evidence

- `corepack pnpm test:global-translation-coverage`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/dashboard,/dashboard/report,/pricing,/dashboard/kundli,/dashboard/saved-kundlis,/ask,/ corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/dashboard,/dashboard/report,/pricing,/dashboard/kundli,/dashboard/saved-kundlis,/ask,/ corepack pnpm test:ui-personal-space`
- `PREDICTA_FULL_JOURNEY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-9`
- `git diff --check`

## Supplemental Report And Pricing Result

Green. Phase 7 now verifies `/dashboard/report` includes `/dashboard/kundli`,
`/pricing` includes `/checkout?productId=pridicta_10_questions`, and the
mobile Pricing checkout click completes in `105ms`.

## Supplemental Public Copy And Email Link Chat-First Lock

- Removed stale `Dashboard`, `Kundli Library`, `your library`, and dead
  `/dashboard/library` wording from public feedback surfaces, web/mobile chat
  handoffs, active-Kundli delete flows, support email templates, shared growth
  copy, and translation catalogs.
- Replaced those labels with `Ask Predicta`, `Open Predicta`, and `My Kundlis`
  while leaving legitimate internal route names untouched.
- Repointed stale support email CTAs from `/dashboard/library` to
  `/dashboard/saved-kundlis` and routed welcome/premium email CTAs toward
  `/ask` where appropriate.

## Supplemental Public Copy Audit Evidence

- `rg -n "Open Dashboard|Open dashboard|/dashboard/library|Open Kundli library|from your dashboard|your dashboard|Dashboard kholo|dashboard khol|dashboard kholo|dashboard ખોલ|ડેશબોર્ડ ખોલો|डैशबोर्ड खोलें|Kundli Library|Kundli library|your library|ki Kundli library|કુંડળી લાઇબ્રેરી|कुंडली लाइब्रेरी" apps/web apps/mobile packages/config/src/translations -g '*.{ts,tsx,json}'` returned no stale user-facing matches.
- `node -e "const fs=require('fs'); for (const f of ['packages/config/src/translations/webGrowthAdvantage.json','packages/config/src/translations/nativeCopy.json','packages/config/src/translations/ui.json','apps/web/lib/email/support-email-template-catalog.json']) { JSON.parse(fs.readFileSync(f,'utf8')); console.log(f + ' ok'); }"` passed.
- `corepack pnpm test:global-translation-coverage`
- `corepack pnpm --filter @pridicta/mobile typecheck`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm build:web`
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3033 corepack pnpm test:app-revival-phase-7`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3033 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/feedback,/dashboard,/dashboard/kundli,/dashboard/saved-kundlis,/dashboard/report,/pricing corepack pnpm test:ui-text-overflow`
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3033 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/feedback,/dashboard,/dashboard/kundli,/dashboard/saved-kundlis,/dashboard/report,/pricing corepack pnpm test:ui-personal-space`
- `git diff --check`

## Supplemental Public Copy Result

Green. The app no longer exposes stale `Kundli Library` or old dashboard copy in
the audited user-facing web/mobile/report-support surfaces, and all touched
copy remains registered in dedicated translation JSON.

## Supplemental Direct Predicta Entry-Door Lock

- Repointed generic public `Enter Predicta`, `Begin with Predicta`, and
  feedback `Open Predicta` CTAs from `/dashboard` to `/ask`.
- Repointed support email `Open Predicta` CTAs from the marketing home or
  `/dashboard` to `/ask` so email users land in the primary Predicta chat
  experience.
- Replaced the Kundli-created `Today for me` secondary link destination from
  `/dashboard` to a focused Predicta chat handoff for today's guidance.
- Kept specific saved-work links such as `My Kundlis`, admin fallback, reports,
  account, and specialist-room destinations unchanged.

## Supplemental Direct Entry Audit Evidence

- `rg --pcre2 -n '"label": "Open Predicta", "url": "\\{\\{appUrl\\}\\}(?!/ask)|href="/dashboard"|Today for me' apps/web/app apps/web/components apps/web/lib/email/support-email-template-catalog.json -g '*.{tsx,json}'` returned only specific My Kundlis/admin links plus the expected `Today for me` label.
- `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('apps/web/lib/email/support-email-template-catalog.json','utf8')); console.log('support-email-template-catalog.json ok');"` passed.
- `corepack pnpm test:global-translation-coverage` passed.
- `corepack pnpm --filter @pridicta/web typecheck` passed.
- `corepack pnpm build:web` passed.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3034 corepack pnpm test:app-revival-phase-7` passed.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3034 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/founder,/feedback,/dashboard,/dashboard/kundli,/dashboard/saved-kundlis,/dashboard/report,/pricing corepack pnpm test:ui-text-overflow` passed.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3034 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/founder,/feedback,/dashboard,/dashboard/kundli,/dashboard/saved-kundlis,/dashboard/report,/pricing corepack pnpm test:ui-personal-space` passed.

## Supplemental Direct Entry Result

Green. Generic "open Predicta" user journeys now land in the primary chat
surface, while `/dashboard` remains a deliberate My Kundlis/saved-work area
instead of the default app doorway.

## Supplemental Public Header Compactness Lock

- Simplified public desktop headers around the primary Predicta experience:
  `Predicta Worlds`, `Reports`, and `Premium`, with `Ask Predicta` remaining
  the clear primary CTA.
- Preserved all specialist-world entry points in the landing world strip and
  mobile drawer so Vedic, KP, Jaimini, Numerology, and Signature remain
  discoverable without crowding the brand lockup.
- Added the `predicta-worlds` anchor to the landing specialist-world strip so
  the compact header can route users to the full world list.
- Split mobile drawer groups into primary navigation, Predicta Worlds, and
  Support so world links do not appear under the wrong heading.

## Supplemental Public Header Audit Evidence

- `corepack pnpm test:global-translation-coverage` passed.
- `corepack pnpm --filter @pridicta/web typecheck` passed.
- `corepack pnpm build:web` passed.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3035 corepack pnpm test:app-revival-phase-7` passed.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3035 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/founder,/feedback,/dashboard,/dashboard/kundli,/dashboard/saved-kundlis,/dashboard/report,/pricing corepack pnpm test:ui-text-overflow` passed.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3035 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/founder,/feedback,/dashboard,/dashboard/kundli,/dashboard/saved-kundlis,/dashboard/report,/pricing corepack pnpm test:ui-personal-space` passed.
- Gujarati rendered-header CDP smoke on `http://127.0.0.1:3035/` passed:
  brand-to-nav gap `49px`, nav-to-actions gap `49px`, no horizontal overflow,
  screenshot saved at `/tmp/predicta-gujarati-header-1440.png`.

## Supplemental Public Header Result

Green. The Gujarati public header no longer crowds the logo with a long list of
specialist room links, while the full world list remains available through the
worlds anchor, landing strip, dashboard navigation, and mobile drawer.

## Supplemental Public Header Hitbox Lock

Date: 2026-06-12

The public header brand link was visually compact but its actual click target
could stretch across the header grid at compact desktop/tablet widths. That made
nearby navigation feel unreliable because the logo/home link occupied far more
space than the visible logo and tagline.

### Changes

- Constrained `.brand-lockup` to a real content-sized hitbox instead of letting
  the grid item stretch across the header.
- Kept the brand text truncated safely on mobile without allowing the home link
  to overlap the menu button.

### Evidence

- Browser DOM audit on `http://127.0.0.1:3009/` at `1280px`: brand hitbox is
  `340px`, menu hitbox is `44px`, `brandOverlapsMenu=false`, horizontal overflow
  is `0`.
- Browser DOM audit on `http://127.0.0.1:3009/` at `390px`: brand hitbox is
  `260px`, menu hitbox is `44px`, `brandOverlapsMenu=false`, horizontal overflow
  is `0`.
- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/ask,/dashboard corepack pnpm test:ui-text-overflow`: PASS, `12` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/,/ask,/dashboard corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.

## Supplemental Generic Entry CTA Lock

Date: 2026-06-12

The landing page final CTA used the generic `Enter Predicta` label but routed to
`/pricing`. That made the final entry point behave like a monetization doorway
instead of opening the primary Ask Predicta experience.

### Changes

- Routed the landing final `Enter Predicta` CTA to the same `/ask` seeded prompt
  flow used by the main Ask Predicta entry points.
- Re-audited founder and feedback generic entry CTAs; both already route to
  `/ask`, so they were left unchanged.

### Evidence

- `corepack pnpm --filter @pridicta/web typecheck`: PASS.
- `corepack pnpm build:web`: PASS.
- `PREDICTA_LINK_RELIABILITY_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:app-revival-phase-7`: PASS.
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3009 PREDICTA_UI_OVERFLOW_ROUTES=/,/founder,/feedback,/pricing corepack pnpm test:ui-text-overflow`: PASS, `16` route/viewport checks.
- `PREDICTA_PERSONAL_SPACE_BASE_URL=http://127.0.0.1:3009 PREDICTA_PERSONAL_SPACE_ROUTES=/,/founder,/feedback,/pricing corepack pnpm test:ui-personal-space`: PASS, `56` route/viewport checks.
