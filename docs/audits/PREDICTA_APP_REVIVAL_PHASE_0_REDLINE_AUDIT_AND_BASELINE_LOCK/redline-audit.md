# Phase 0 Redline Audit

Phase: `PREDICTA_APP_REVIVAL_PHASE_0_REDLINE_AUDIT_AND_BASELINE_LOCK`
Status: `GREEN - BASELINE LOCKED`
Date: 2026-06-10

## Verdict

Predicta is not failing because it lacks features. Predicta is failing the
intended product feeling because the current app architecture still behaves like
a dashboard-first SaaS surface.

The core product promise should be:

> Ask Predicta first. Let Predicta open charts, reports, evidence rooms,
> payments, saved Kundlis, and settings only when needed.

The current route model still says:

> Open dashboard first. Then choose between many control-panel routes.

## Current-State Evidence

### Landing Is Too Client-Heavy

Evidence:

- `apps/web/app/page.tsx:1` declares `'use client'`.
- `apps/web/app/page.tsx:3-13` imports config, header, hero, pricing,
  testimonial, growth, footer, and language preference into the landing route.
- `.next/app-build-manifest.json` currently maps `/page` to about `3480.3 KB`
  of JS assets before compression.

Impact:

The first user impression is too heavy. The app cannot feel like a fast,
simple astrology chat app if the public landing page hydrates a large product
brochure and shared app chunks before the user can ask Predicta anything.

Severity: Critical.

### Hero Sends The Main Action To Dashboard

Evidence:

- `apps/web/components/HeroSection.tsx:66` links the primary hero CTA to
  `/dashboard`.
- `apps/web/components/HeroSection.tsx:69` links the secondary CTA to
  `/dashboard/vedic/chat`.

Impact:

The homepage says Predicta is the product, but the action path sends users into
the dashboard/control-panel model. That is the exact friction the user
reported.

Severity: Critical.

### Chat Lives Inside Dashboard Shell

Evidence:

- `apps/web/app/dashboard/layout.tsx:10` wraps all dashboard children in
  `DashboardShell`.
- `apps/web/components/DashboardShell.tsx:432-433` treats `/dashboard/chat`
  and `/dashboard/*/chat` as chat routes, but they still exist inside the
  dashboard shell.
- `.next/app-build-manifest.json` maps `/dashboard/chat/page` to about
  `3476.0 KB` of JS assets before compression.

Impact:

Chat is technically present, but emotionally it is still inside the dashboard.
Users cannot feel that Predicta is the front door when the chat is nested
inside route chrome, dashboard groups, pass banners, and many app concerns.

Severity: Critical.

### Dashboard Navigation Still Creates A Maze

Evidence:

- `apps/web/components/DashboardShell.tsx:41-130` defines many top-level
  dashboard sections:
  - Ask Predicta
  - Dashboard
  - Vedic evidence
  - KP evidence
  - Jaimini evidence
  - Numerology evidence
  - Signature evidence
  - Reports
  - Library
  - Account
- Vedic alone exposes Kundli, charts, timeline, remedies, holistic,
  birth-time, and decision routes.

Impact:

The app still asks the user to navigate the machine. For a normal user, this is
too close to an admin/productivity dashboard and too far from an astrology
consultation.

Severity: Critical.

### Chat Handoff Contract Still Points To Dashboard Paths

Evidence:

- `apps/web/lib/predicta-chat-cta.ts:67` builds all Predicta chat hrefs.
- `apps/web/lib/predicta-chat-cta.ts:132+` currently routes:
  - main Predicta to `/dashboard/chat`
  - Parashari to `/dashboard/vedic/chat`
  - KP to `/dashboard/kp/chat`
  - Jaimini to `/dashboard/jaimini/chat`
  - Numerology to `/dashboard/numerology/chat`
  - Signature to `/dashboard/signature/chat`

Impact:

Even source-aware Ask Predicta CTAs are structurally bound to dashboard routes.
Phase 1 must change the chat path contract, not just button labels.

Severity: Critical.

### Dashboard Routes Share Heavy Chunks

Evidence:

From `.next/app-build-manifest.json`:

- `/dashboard/page`: about `3338.8 KB`
- `/dashboard/chat/page`: about `3476.0 KB`
- `/dashboard/report/page`: about `3671.5 KB`
- `/dashboard/vedic/page`: about `3376.9 KB`
- `/dashboard/kp/page`: about `3348.7 KB`
- `/dashboard/jaimini/page`: about `3320.2 KB`

Largest shared chunks:

- `static/chunks/4393-df6a2eb9a6e66d71.js`: about `1660.7 KB`
- `static/chunks/3404-12ce850ae8291163.js`: about `852.5 KB`

Impact:

This explains the user's "links open late" complaint. The app can be correct
and still feel unresponsive because critical routes all pull heavy shared
payloads.

Severity: Critical.

## No-Go Criteria For Revival

The app remains `NO-GO` for the intended product vision until all are true:

1. A top-level `/ask` or `/chat` route exists outside the dashboard maze.
2. Public hero, public header, footer, mobile nav, dashboard topbar, and
   specialist-world CTAs can send users directly to the top-level Predicta
   route.
3. The top-level Predicta route preserves source context, active Kundli,
   selected evidence, school, report section, and event question context.
4. The landing page primary action no longer goes to `/dashboard`.
5. Landing is no longer a client-heavy product brochure before the user can
   ask.
6. The dashboard is demoted to Library/My Astrology and no longer acts as the
   primary user journey.
7. Chat route payload is lower than dashboard route payload.
8. Landing and chat payloads are measured in a repeatable route-manifest gate.
9. Link-click latency is measured and becomes a release blocker.
10. Desktop, tablet, mobile, and narrow-mobile proof shows that Predicta is the
    focal point.

## Phase 0 Decision

Phase 0 is green because the redline baseline is now explicit and committed.
No product implementation was attempted in this phase.

The next phase must be:

`PREDICTA_APP_REVIVAL_PHASE_1_TOP_LEVEL_ASK_ROUTE_AND_DIRECT_CHAT_ENTRY`

