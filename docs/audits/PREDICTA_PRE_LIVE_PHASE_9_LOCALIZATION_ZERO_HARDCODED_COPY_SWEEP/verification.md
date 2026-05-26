# PREDICTA_PRE_LIVE_PHASE_9_LOCALIZATION_ZERO_HARDCODED_COPY_SWEEP

Status: GREEN
Date: 2026-05-27

## Scope

This phase removes mixed-language trust leaks, locks critical user-facing copy behind JSON-backed localization adapters, and adds a static gate so checkout, pricing, report download, settings, signature, mobile, and PDF-visible labels cannot quietly fall back to raw keys or hardcoded Hindi/Gujarati strings.

## Implemented

- Added `scripts/run-pre-live-phase-9-localization-sweep-gate.mjs`.
- Added `corepack pnpm test:pre-live-phase-9`.
- Added route text-dump artifact generator `scripts/write-phase-9-localization-route-dumps.mjs`.
- Fixed mixed Hindi/Gujarati checkout payment copy that still contained English fragments like `checkout`, `payment`, `support`, `handoff`, `paid`, `access`, and `active`.
- Fixed mobile Signature limitation copy that still contained English fragments like `upload`, `draw`, `capture`, `input`, `scan`, `traits`, `prediction`, and `web Signature room`.
- Added the missing Gujarati checkout gateway-state key so the app does not render the raw native-copy key.
- Preserved brand/method meaning through native wording instead of mixed-language helper text.

## Static Sweep Coverage

The Phase 9 gate audits these user-facing surfaces:

- Web checkout
- Web pricing
- Web report page
- Web report download composer
- Web profile/settings copy
- Web Signature flow
- Mobile report screen
- Mobile settings screen
- Mobile Signature screen
- PDF report document labels

The gate checks:

- Every `getNativeCopy` and `formatNativeCopy` key used by audited surfaces exists.
- Template calls point to template entries.
- Text calls point to text entries.
- Audited source files do not contain hardcoded Hindi/Gujarati script.
- Components do not import translation JSON directly.
- Checkout disabled-gateway and support-subject copy comes from native JSON.
- Pricing, report download, and PDF-visible labels use JSON-backed translation sources.
- Hindi/Gujarati critical payment and Signature strings do not contain the known mixed English fragments.

## Route Text Dumps And Screenshots

Generated route text dumps exist for English, Hindi, and Gujarati:

- `en-checkout.txt`, `hi-checkout.txt`, `gu-checkout.txt`
- `en-pricing.txt`, `hi-pricing.txt`, `gu-pricing.txt`
- `en-report.txt`, `hi-report.txt`, `gu-report.txt`
- `en-signature.txt`, `hi-signature.txt`, `gu-signature.txt`
- `en-settings.txt`, `hi-settings.txt`, `gu-settings.txt`

Browser smoke artifacts also exist for default English routes:

- `browser-en-pricing.txt`
- `browser-en-checkout.txt`
- `browser-en-checkout.png`
- `browser-en-report.txt`
- `browser-en-report.png`
- `browser-en-signature.txt`

The embedded browser automation environment does not expose `localStorage`, so Hindi/Gujarati route dumps are generated directly from the same JSON-backed route keys rather than pretending browser language switching was possible in that environment.

## Strict Audit Evidence

- `corepack pnpm test:pre-live-phase-9`: PASS
- `corepack pnpm test:localization-architecture`: PASS
- `corepack pnpm test:translation-trust`: PASS
- `corepack pnpm test:native-script-chat`: PASS
- `corepack pnpm test:graha-names`: PASS
- `corepack pnpm --filter @pridicta/config typecheck`: PASS
- `corepack pnpm --filter @pridicta/web typecheck`: PASS
- `corepack pnpm build:web`: PASS
- `PREDICTA_GREENLIGHT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:public-greenlight`: PASS
- `git diff --check`: PASS

Public greenlight passed in 283.9s against `http://127.0.0.1:3009`, including:

- Web typecheck
- PDF package typecheck
- North Indian chart and stress suite
- Predicta context reliability suite
- PDF report golden output gate
- Mobile and tablet visual proof gate: 33 route/viewport checks
- End-to-end buyer rejection gate: 51 live route checks
- Git diff hygiene

## Green Criteria

- Site-wide practical hardcoded-copy sweep passes.
- Route text dumps exist for English, Hindi, and Gujarati.
- Checkout, pricing, support, payment, reports, Signature, settings, and PDF labels are JSON-backed on audited surfaces.
- English browser smoke does not show Hindi/Gujarati script.
- Hindi/Gujarati critical strings are native-script and avoid mixed English helper fragments.
- Translation JSON imports remain behind dedicated adapters.
- Business logic and astrology logic do not contain hardcoded Hindi/Gujarati UI translations.
