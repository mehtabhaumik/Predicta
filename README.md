<p align="center">
  <img src="./apps/web/public/predicta-logo.png" alt="Predicta logo" width="156" />
</p>

<h1 align="center">Predicta</h1>

<p align="center">
  <strong>Premium Vedic astrology intelligence for mobile and web.</strong>
</p>

<p align="center">
  A dark, glass-finished product system for kundli creation, chart-aware guidance,
  premium reports, saved profiles, monetization, access control, and a modern web dashboard.
</p>

<p align="center">
  <strong>Copyright © 2026 Bhaumik Mehta. All rights reserved.</strong>
</p>

---

## Product Vision

Predicta is built to feel calm, futuristic, spiritually grounded, and premium.
It combines a React Native mobile app, a Next.js web app, and shared product
logic in a single monorepo so mobile and web can evolve together without
duplicating the business brain.

The experience is intentionally:

- Dark-first and visually rich.
- Spacious, glass-finished, and uncluttered.
- Chart-aware without exposing internal implementation details to users.
- Local-first for sensitive kundli data, with cloud save only when chosen.
- Ready for real subscription, guest access, and report monetization flows.

---

## Current Platform Map

| Area | Technology | Purpose |
| --- | --- | --- |
| Mobile | React Native CLI, TypeScript | iOS and Android app experience |
| Web | Next.js App Router, TypeScript | Desktop-first dashboard and landing experience |
| Workspace | pnpm workspaces, Turborepo | Shared development, build, and package orchestration |
| Shared Logic | `packages/*` | Types, pricing, access, astrology, AI, PDF, Firebase contracts, tokens, utilities |
| Backend | FastAPI + Swiss Ephemeris + Firebase Admin | Real kundli calculation and trusted admin/access authority |

---

## Repository Structure

```text
apps/
  mobile/        React Native CLI mobile app
  web/           Next.js web app

packages/
  access/        Access resolver, whitelists, guest-pass logic
  ai/            AI routing, prompts, context builders, token controls
  astrology/     Chart registry and astrology contracts
  config/        Pricing, model names, limits, feature flags
  firebase/      Shared collection names and data contracts
  monetization/  Entitlements, usage limits, paywall helpers
  pdf/           Report composition and Free/Premium depth rules
  types/         Shared product DTOs and domain types
  ui-tokens/     Brand colors, gradients, spacing, glow, motion
  utils/         Hashing, serialization, dates, formatting

backend/         Astrology and admin authority service foundation
```

Shared packages hold product rules and contracts. Platform-specific UI and
native/web adapters stay inside the app that owns that platform.

---

## Documentation

Start here for the main internal reference surfaces:

- [`docs/PREDICTA_AI_AGENT_INGEST.md`](./docs/PREDICTA_AI_AGENT_INGEST.md)
  Detailed source-of-truth brief for AI agents, internal assistants, and
  documentation tooling. Use this when an agent must understand Predicta's
  product scope, differentiators, implementation reality, AI behavior, access
  rules, and answer guardrails.
- [`docs/README.md`](./docs/README.md)
  Documentation index for backend authority, deployment, release hardening, and
  product roadmap documents.

---

## Product Capabilities

### Mobile App

- Premium dark glow React Native experience.
- App lock foundation with PIN and biometric support.
- Kundli creation with resolved birth place data.
- Saved kundlis, local-first storage, and optional cloud save.
- Chart-aware Pridicta chat.
- Premium PDF/report generation flows.
- Free, Premium, Day Pass, one-time credits, guest passes, and admin access logic.
- Glass-finished dialogs and user-facing settings.

### Web App

- Cinematic landing page with prominent Predicta branding.
- Desktop-first dashboard shell.
- Chat, kundli, charts, report, saved kundlis, settings, pricing, redeem pass, and admin shells.
- Glass-finished sign-in dialog with Google, Apple, Microsoft, email/password,
  registration, and password reset.
- Shared pricing, access, guest-pass, report, chart, and token logic.

### Shared Product Brain

- Single source for pricing and usage rules.
- Shared access priority:
  1. Admin whitelist
  2. Full-access whitelist
  3. Paid subscription
  4. Day Pass
  5. Guest pass
  6. One-time credits
  7. Free plan
- Shared DTOs for kundli, chart context, reports, monetization, and access.
- Shared UI tokens so mobile and web keep one brand DNA without sharing screen layouts.

---

## Development Commands

Use pnpm through Corepack:

```sh
corepack pnpm install
corepack pnpm dev:web
corepack pnpm dev:mobile
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build:web
corepack pnpm build:mobile
```

Focused commands:

```sh
corepack pnpm --filter @pridicta/web typecheck
corepack pnpm --filter @pridicta/web build
corepack pnpm --filter @pridicta/mobile exec tsc --noEmit
corepack pnpm --filter @pridicta/mobile bundle:android
```

---

## Environment Setup

Start from `.env.example`.

Important rules:

- Do not commit private `.env` files.
- Do not expose OpenAI or Gemini secrets in browser bundles.
- Web public config must use only safe `NEXT_PUBLIC_*` values.
- Raw guest pass codes must never be committed.
- Kundli data and private readings must not be logged into analytics.

---

## Security And Privacy Principles

Predicta handles sensitive birth data, spiritual guidance, and personal reports.
The product must remain privacy-first.

- Kundlis save locally by default.
- Cloud save is opt-in only.
- No automatic upload after login.
- Guest pass redemption is server/cloud-authoritative.
- Admin access must not rely on local client state in production.
- AI provider keys belong behind secure backend or server-side boundaries.
- Raw chat text, raw birth details, full kundli payloads, and private remedies
  must not be sent as analytics events.

---

## Design Standard

Predicta uses a premium dark visual language:

- Apple-style glass surfaces where useful.
- Generous spacing and uncluttered layouts.
- Brand gradient: violet → blue → pink.
- Calm motion and soft depth.
- High readability for chart, report, and settings surfaces.

Mobile remains compact and calm. Web is more spacious, editorial, and dashboard-native.

---

## Ownership, Copyright, And License

This repository and all associated source code, product concepts, designs,
copy, architecture, branding, assets, documentation, prompts, generated reports,
and implementation details are proprietary and confidential.

**Copyright © 2026 Bhaumik Mehta. All rights reserved.**

No license is granted by default.

You may not copy, reproduce, modify, publish, distribute, sublicense, sell,
commercialize, reverse engineer, train models on, disclose, or create derivative
works from this repository or any part of the Predicta product without prior
written permission from Bhaumik Mehta.

Access to this repository does not grant ownership, usage rights, redistribution
rights, commercial rights, or intellectual property rights.

See [`LICENSE.md`](./LICENSE.md) for the full proprietary license notice.

---

## Maintainer

**Bhaumik Mehta**  
Founder and owner of Predicta.
