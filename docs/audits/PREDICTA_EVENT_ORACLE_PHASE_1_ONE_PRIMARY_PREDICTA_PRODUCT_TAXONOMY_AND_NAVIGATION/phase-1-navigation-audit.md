# PREDICTA_EVENT_ORACLE_PHASE_1_ONE_PRIMARY_PREDICTA_PRODUCT_TAXONOMY_AND_NAVIGATION

Status: GREEN after implementation and strict audit.

## Scope

Phase 1 reframes the app around one primary Predicta while preserving every
specialist world as an evidence/depth room.

This phase intentionally does not implement the event-question taxonomy,
multi-school evidence contract, timing engine, paid Precision Reading product,
human review, or prediction tracker. Those belong to later phases.

## Implementation Summary

- Added primary dashboard navigation section:
  - `href: /dashboard/chat`
  - `id: predicta`
  - `label: Ask Predicta`
- Kept `/dashboard` as Overview so the dashboard route does not get swallowed by
  the primary chat section.
- Renamed specialist-world master labels to evidence-room labels:
  - Vedic Evidence
  - KP Evidence
  - Jaimini Evidence
  - Numerology Evidence
  - Signature Evidence
- Removed specialist chat sublinks from the sidebar master lists so users are
  not nudged into five disconnected Predicta chats from navigation.
- Preserved all specialist room routes and page functionality.
- Added a dashboard primary Predicta panel that explains:
  - ask Predicta first
  - Predicta checks the right evidence rooms
  - methods are not mixed silently
  - evidence rooms remain available
- Added `Ask Predicta` to the public header navigation before specialist worlds.
- Changed the dashboard topbar Predicta CTA from secondary to primary.
- Moved footer and private-preview default chat routing from `/dashboard/vedic/chat`
  to `/dashboard/chat`.
- Added English, Hindi, and Gujarati app-shell evidence-room labels.
- Added English, Hindi, and Gujarati dashboard primary-Predicta copy in
  `competitorResponse.json`.
- Added mobile dashboard containment guards after visual audit caught a narrow
  viewport clipping risk:
  - topbar actions stack safely
  - dashboard panels can shrink inside the viewport
  - Kundli onboarding actions stack instead of pushing sideways
  - long headings wrap inside mobile bounds

## Strict Audit Findings

| Requirement | Result |
|---|---|
| Dashboard/home hero CTA: `Ask Predicta` | PASS |
| Main navigation hierarchy makes Predicta primary | PASS |
| Specialist worlds remain available | PASS |
| Specialist-world labels are evidence-room labels | PASS |
| Main Predicta entry from dashboard, header, topbar, and footer | PASS |
| Clear user-facing method-source disclosure | PASS |
| No active Nadi evidence room introduced | PASS |
| No English/Hindi/Gujarati translation gap introduced for new copy | PASS |
| 390px mobile dashboard avoids horizontal clipping after fix | PASS |

## Files Changed

- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/components/DashboardShell.tsx`
- `apps/web/components/WebFooter.tsx`
- `apps/web/components/WebHeader.tsx`
- `packages/config/src/language.ts`
- `packages/config/src/translations/competitorResponse.json`
- `packages/config/src/translations/language.json`
- `scripts/run-event-oracle-phase-1-gate.mjs`

## Browser Evidence

Required screenshots:

- `screenshots/desktop-dashboard.png`
- `screenshots/tablet-dashboard.png`
- `screenshots/mobile-dashboard.png`
- `screenshots/desktop-chat.png`
- `screenshots/mobile-menu.png`

## Phase 1 Verdict

GREEN.

Predicta is now the primary app focal point in taxonomy and navigation, while
Vedic, KP, Jaimini, Numerology, and Signature remain available as evidence
rooms.
