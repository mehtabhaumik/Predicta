# Predicta Chat Enhancements

## Phase

`EXECUTE_CHATGPT_STYLE_PREDICTA_CHAT_SHELL`

## Goal

Make every Predicta chat room feel like a serious ChatGPT-style workspace, not a cramped dashboard section.

This applies to all current and future Predicta chat surfaces:

- `/dashboard/chat`
- Vedic Predicta chat
- KP Predicta chat
- Nadi Predicta chat
- Numerology Predicta chat
- Signature Predicta chat

Do not treat this as one route only. Build the shared chat shell so every Predicta room gets the same premium chat experience.

## Hard Rules

1. All Predicta chat rooms use the same large chat shell.
2. Do not change Predicta intelligence, prompts, safety logic, or specialist context in this phase.
3. Do not remove existing chat features.
4. Do not break copy, export, helper CTAs, proof cards, chart cards, Kundli previews, or feedback controls.
5. Do not add a new competing chat UI.
6. Extend the existing chat surface into a proper full-height layout.
7. No footer on Predicta chat pages.
8. No two-column chat layout on tablet or mobile.
9. No large action buttons crowding the message thread.
10. No chart squeezed into a tiny message card.

## Required Layout

Create a dedicated Predicta chat layout mode.

Structure:

- Top: sticky app/header/nav bar remains available.
- Middle: scrollable chat thread owns the screen.
- Bottom: sticky composer/input area.
- Footer: hidden on all Predicta chat routes.

### Desktop

- Chat thread max width around 960px-1100px.
- Center the conversation.
- Rich answers, proof chips, Kundli previews, and charts must have enough width and height.
- No footer visible below the chat.

### Tablet

- Full width with safe side padding.
- Single-column layout.
- Composer remains visible at bottom.
- Chart cards stay readable.

### Mobile

- Full width.
- Single-column layout.
- Composer fixed/sticky at bottom.
- No sidebar.
- No footer.
- No horizontal chart scrolling unless absolutely unavoidable.
- Message content must not hide behind the composer.

## Composer Requirements

- Composer stays sticky at bottom like ChatGPT.
- Textarea grows upward up to a sensible limit.
- Send button always remains visible.
- Helper CTAs appear after the latest Predicta reply, not inside or over the composer.
- Large buttons like Copy full chat, Save chat PDF, New chat must move into a compact menu or compact toolbar.
- These controls must not sit as oversized buttons near the active conversation.

## Message Action Requirements

- Copy Predicta reply action appears below each Predicta reply.
- Thumbs up/down feedback appears below each Predicta reply.
- User message copy action appears below the user bubble if supported.
- No reply action should float awkwardly, overlap, or appear above the wrong message.
- No exceptions.

## Chart/Kundli Rendering Inside Chat

- Chart cards inside Predicta replies must render full-width within the message column.
- Chart card minimum height must be increased.
- Kundli previews must not be cramped.
- Legend sits below chart in compact rows.
- Proof/explanation sits below chart, not squeezed beside it.
- On mobile, chart remains readable and contained.
- Do not degrade chart house selection, chart context handoff, proof cards, or existing chart styles.

## Footer Rule

- Public pages: footer visible.
- Dashboard non-chat pages: compact footer allowed.
- All Predicta chat rooms: footer hidden.
- This rule must be implemented centrally so future Vedic/KP/Nadi/Numerology/Signature chat rooms inherit it automatically.

## Room-Aware Future Contract

- All future specialist rooms use this same shell.
- Room identity appears as a small header chip/title only.
- The chat layout stays consistent.
- Only specialist context, proof cards, and tools change by room.
- Do not create five visually inconsistent chat layouts.

## Accessibility

- Composer must be keyboard accessible.
- Send button must have clear label.
- Compact menu must be keyboard accessible.
- Focus states must be visible.
- Sticky composer must not trap focus.
- Escape/menu behavior must work correctly.
- Mobile screen readers must read chat order correctly.

## Responsive QA

Verify at minimum:

- Desktop: 1440px wide
- Tablet: 768px wide
- Mobile: 390px wide

For each viewport verify:

- Footer hidden on chat.
- Composer visible at bottom.
- Thread scrolls correctly.
- Last message is not hidden behind composer.
- Chart card is readable.
- Helper CTAs do not push composer off-screen.
- Copy/export/new-chat controls do not crowd the thread.
- No horizontal overflow.
- No clipped text.
- No overlapping UI.

## Routes To Smoke

- `/dashboard/chat`
- existing KP/Nadi/Numerology/Signature chat entry points if present
- any CTA that opens Predicta chat with context
- chat with Kundli preview
- chat with chart card
- chat with helper CTAs
- chat on mobile viewport

## Verification Required

- Typecheck passes.
- Production build passes.
- Browser smoke passes on desktop/tablet/mobile.
- Confirm no footer is visible on Predicta chat pages.
- Confirm no existing chat feature was removed.
- Commit with detailed message.
- Push and deploy only when explicitly instructed, unless current project rule requires immediate push/deploy.

## Definition Of Done

The Predicta chat page feels like the main workspace of the product: large, calm, focused, readable, and persistent.

It must no longer feel like a dashboard widget trapped above a footer.
