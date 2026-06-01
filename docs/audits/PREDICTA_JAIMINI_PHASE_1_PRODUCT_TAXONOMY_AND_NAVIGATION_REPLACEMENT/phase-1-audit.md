# PREDICTA_JAIMINI_PHASE_1_PRODUCT_TAXONOMY_AND_NAVIGATION_REPLACEMENT

Status: GREEN

Date: 2026-06-01

## Scope

This phase replaces the active product taxonomy from Nadi to Jaimini across
navigation, report-lane entry points, app shell copy, safety/accuracy copy,
Predicta memory, and mobile route exposure.

This phase does not implement deterministic Jaimini calculations or Jaimini PDF
generation. Those are explicitly owned by later Jaimini phases. To prevent fake
readings, the Jaimini report lane is visible but guarded until the report engine
is audited.

## Implemented

- Added web routes:
  - `/dashboard/jaimini`
  - `/dashboard/jaimini/chat`
- Converted legacy web routes into controlled redirects:
  - `/dashboard/nadi` -> `/dashboard/jaimini`
  - `/dashboard/nadi/chat` -> `/dashboard/jaimini/chat`
- Added `JaiminiPredictaScreen` on mobile and exposed it through mobile
  navigation.
- Replaced active navigation labels with `Jaimini` / `Jaimini Predicta` in
  English, Hindi, and Gujarati app-shell translations.
- Added Jaimini to shared school/report lane types.
- Added Jaimini to report marketplace products and blocked download/preview
  generation until the Jaimini report engine is implemented in a later phase.
- Updated public trust, safety, accuracy, founder, Vedic, pricing/redeem, chat
  CTA, and Predicta memory copy from Nadi to Jaimini where user-facing.
- Updated QA scripts and route-readiness scripts to treat Jaimini as the active
  specialist room.

## Strict Audit Results

### Static Taxonomy Sweep

Command:

```sh
rg -n "Nadi|nadi|NADI|नाड़ी|નાડી" apps/web/app apps/web/components/DashboardShell.tsx apps/web/components/WebHeader.tsx apps/web/components/WebDossierPreview.tsx apps/web/components/WebJaiminiPredictaPanel.tsx apps/web/components/ClientServicesProvider.tsx apps/web/lib/predicta-chat-cta.ts apps/mobile/src/screens/HomeScreen.tsx apps/mobile/src/screens/JaiminiPredictaScreen.tsx apps/mobile/src/screens/ReportScreen.tsx apps/mobile/src/screens/SafetyPromiseScreen.tsx apps/mobile/src/screens/FounderVisionScreen.tsx apps/mobile/src/screens/ChartsScreen.tsx apps/mobile/src/navigation apps/mobile/src/store/useAppStore.ts packages/config/src/translations/testimonialTrust.json packages/config/src/translations/webGrowthAdvantage.json packages/config/src/predictaMemory.ts packages/config/src/pricing.ts scripts/run-nav-and-new-rooms-qa-gate.mjs scripts/run-mobile-tablet-visual-proof-gate.mjs scripts/lib/predicta-audit-page-readiness.mjs
```

Result: no active user-facing Nadi labels remain in the Jaimini/navigation/report
taxonomy surfaces.

Allowed remaining hits:

- legacy redirect route files under `/dashboard/nadi`
- legacy mobile route compatibility entries
- internal `NADI` type compatibility while later data-contract phases replace
  old internals
- old CSS selectors for retired/dead Nadi components
- the lowercase matchmaking/koota term `nadi`, which is not the removed
  specialist room

### Compile And Type Gates

Passed:

- `corepack pnpm --filter @pridicta/types typecheck`
- `corepack pnpm --filter @pridicta/config typecheck`
- `corepack pnpm --filter @pridicta/astrology typecheck`
- `corepack pnpm --filter @pridicta/pdf typecheck`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm --filter @pridicta/mobile typecheck`
- `corepack pnpm build:web`
- `git diff --check`

### Navigation QA Gate

Passed:

```sh
corepack pnpm test:nav-new-rooms
```

Result:

```text
Nav and new rooms QA gate passed: Vedic, KP, Jaimini, Numerology, and Signature routes are present across web, mobile, nav, and QA coverage.
```

### Runtime Audit Server

Passed:

```sh
corepack pnpm test:audit-server-preflight
```

Key route evidence:

- `/dashboard/jaimini`: 200
- `/dashboard/report`: 200
- `/dashboard/kp`: 200
- `/dashboard/numerology`: 200
- `/dashboard/signature`: 200

### Legacy Route Migration

Passed:

```sh
curl -sS -I http://127.0.0.1:3009/dashboard/nadi
curl -sS -I http://127.0.0.1:3009/dashboard/nadi/chat
curl -sS -L -o /dev/null -w '%{url_effective} %{http_code}\n' http://127.0.0.1:3009/dashboard/nadi
curl -sS -L -o /dev/null -w '%{url_effective} %{http_code}\n' http://127.0.0.1:3009/dashboard/nadi/chat
```

Result:

- `/dashboard/nadi` returns `307` with `location: /dashboard/jaimini`, then
  resolves to `200`.
- `/dashboard/nadi/chat` returns `307` with
  `location: /dashboard/jaimini/chat`, then resolves to `200`.

### Desktop / Tablet / Mobile Visual Proof

Passed:

```sh
PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3009 PREDICTA_VISUAL_OUTPUT_DIR=/Users/bmehta/Downloads/Predicta/docs/audits/PREDICTA_JAIMINI_PHASE_1_PRODUCT_TAXONOMY_AND_NAVIGATION_REPLACEMENT/screenshots corepack pnpm test:visual-proof
```

Result:

- 33 route and viewport screenshots captured.
- 0 clipped text findings.
- 0 horizontal overflow findings.
- 0 wide element findings.

Required Jaimini screenshots:

- `screenshots/desktop-dashboard-jaimini.png`
- `screenshots/tablet-dashboard-jaimini.png`
- `screenshots/mobile-dashboard-jaimini.png`
- `screenshots/desktop-dashboard-report.png`
- `screenshots/tablet-dashboard-report.png`
- `screenshots/mobile-dashboard-report.png`

Manual review:

- desktop Jaimini page renders as `Jaimini`, not Nadi.
- tablet Jaimini page keeps the Jaimini hero, CTAs, and pillar cards readable.
- mobile Jaimini page stacks safely with no clipping or horizontal overflow.
- report page no longer exposes a Nadi report lane; Jaimini preview is present.

## Green Decision

Phase 1 is green because the active product taxonomy and navigation now expose
Jaimini instead of Nadi across web, mobile, report marketplace, app shell,
Predicta memory, and QA route coverage.

The remaining `NADI` references are intentionally preserved only as legacy
compatibility or old internal implementation surfaces that are explicitly
scheduled for later Jaimini data-contract and report phases. They are not active
user-facing room labels in this phase.
