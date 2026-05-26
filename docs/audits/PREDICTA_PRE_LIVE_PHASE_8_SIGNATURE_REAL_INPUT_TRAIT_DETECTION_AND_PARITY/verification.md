# PREDICTA_PRE_LIVE_PHASE_8_SIGNATURE_REAL_INPUT_TRAIT_DETECTION_AND_PARITY

Status: GREEN
Date: 2026-05-27

## Scope

This phase makes Signature Predicta impossible to run on empty or fake input, removes fixed upload/draw trait presets, keeps raw signatures ephemeral, and ensures mobile does not pretend to have a real capture pipeline before it is wired.

## Implemented

- Added deterministic visible-ink and geometry detection in `packages/astrology/src/signatureTraitDetector.ts`.
- Detector rejects blank images and tiny marks that do not have enough signature geometry.
- Detector derives traits from actual pixel evidence:
  - baseline
  - signature size
  - margin use
  - pressure/ink density
  - slant proxy
  - spacing
  - letter connection
  - speed/rhythm
  - flourish
  - underline when visible
  - capital emphasis when visible
  - legibility confidence when evidence exists
- Removed fixed web upload/draw trait presets.
- Web trait controls and chat/report handoff remain locked until detected traits exist and the user confirms or corrects them.
- Web stores only derived confirmed traits in the optional draft, never a raw data URL or raw image.
- Web storage calls are guarded so unavailable embedded-browser storage does not break the flow.
- Mobile no longer simulates upload/draw capture or manufactures traits from placeholder buttons.
- Mobile explicitly says signature capture is being connected and does not scan, infer traits, or prepare predictions until real visible input capture exists.

## Strict Audit Evidence

- `corepack pnpm --filter @pridicta/astrology test:signature`: PASS
- `corepack pnpm --filter @pridicta/astrology typecheck`: PASS
- `corepack pnpm --filter @pridicta/web typecheck`: PASS
- `corepack pnpm --filter @pridicta/mobile typecheck`: PASS
- `corepack pnpm test:specialist-room-qa`: PASS
- `corepack pnpm --filter @pridicta/astrology test:signature-room`: PASS
- `corepack pnpm test:signature-predicta`: PASS
- `corepack pnpm test:translation-trust`: PASS
- `corepack pnpm build:web`: PASS
- `corepack pnpm test:mobile`: PASS
- `corepack pnpm --filter @pridicta/mobile bundle:android`: PASS
- `git diff --check`: PASS

## Browser Smoke Evidence

Target: `http://localhost:3009/dashboard/signature`

Observed:

- Empty page load did not produce a ready signature summary.
- All `Chat with Signature Predicta` buttons were disabled on empty input.
- Trait controls were disabled on empty input.
- Missing/confirmation copy was visible.
- Upload input existed for web real capture.
- Local draft did not contain raw image data, `imageDataUrl`, or preview data.

Screenshot:

- `docs/audits/PREDICTA_PRE_LIVE_PHASE_8_SIGNATURE_REAL_INPUT_TRAIT_DETECTION_AND_PARITY/web-signature-empty-locked.png`

## Green Criteria

- Empty signature input cannot produce traits or predictions.
- Upload and draw traits are no longer mode presets; traits come from visible pixel geometry.
- Uncertain or unsupported traits are omitted or marked by the analysis model confidence rules.
- User can correct traits before analysis.
- Mobile is honest and disabled until real capture exists; it does not simulate predictions.
- Raw signatures are not stored in localStorage, sessionStorage, IndexedDB, app store, server storage, reports, or telemetry.
- Signature report safety copy remains present through the existing signature report/model gates.
