# Predicta Signature Predicta Ultra Strict Phase

This document defines the strict rebuild phase for Signature Predicta input,
analysis, privacy, animation, web/mobile parity, report output, and Predicta
memory.

Signature Predicta must feel magical, fast, private, and safe. It must not feel
like a long form where users classify their own handwriting. It must never make
false certainty claims from a signature.

## Phase Name

`PREDICTA_SIGNATURE_PREDICTA_PHASE_1_PRIVACY_FIRST_SCAN_AND_TRAIT_MAP_REBUILD`

## Current Baseline Problems

The current implementation has blockers that must be treated as red until fixed:

- Web upload/draw result is visible lower on the page, so the user can miss what
  happened and must scroll to understand the result.
- Web upload button does not clearly become `Re-upload signature` after upload.
- Web draw action does not clearly become `Re-draw signature` after drawing.
- Web currently persists raw signature image data in `localStorage`, which means
  Predicta cannot honestly say `we never store your signature image`.
- Mobile currently lacks a real upload/draw Signature input flow and does not
  match web capability.
- The current trait confirmation flow asks the user to classify baseline,
  pressure, slant, spacing, and other traits manually, which feels cumbersome.
- Reports and chat must not use signature traits unless they are detected and
  confirmed from the current session or manually confirmed by the user.

## Non-Negotiable Rules

1. Do not store raw signature images in server storage.
2. Do not store raw signature images in `localStorage`.
3. Do not store raw signature images in `sessionStorage`.
4. Do not store raw signature images in IndexedDB.
5. Do not store raw signature images in app state intended for persistence or
   recovery.
6. Keep the raw signature image only in memory for the current interaction.
7. If the user closes the tab, leaves the session, reloads, or exits the screen,
   the user may need to re-upload or re-draw the signature.
8. This temporary-session behavior must be clearly explained at the point of
   action.
9. Store or pass only derived traits, confidence labels, and confirmed
   observations.
10. Do not embed the raw signature image in reports by default.
11. Do not send a raw signature image to a server for analysis unless a future
    approved privacy phase adds explicit consent, no-retention guarantees, and
    audit evidence.
12. Signature Predicta is reflective guidance only.
13. Signature Predicta is not forensic handwriting analysis.
14. Signature Predicta is not identity verification.
15. Signature Predicta is not a hiring, legal, medical, mental-health, fraud, or
    compatibility judgement tool.
16. Signature Predicta must not predict destiny, success, marriage, wealth,
    health, honesty, character, or future events from a signature.
17. Every trait must have visible evidence or be marked `not assessed`.
18. Every detected trait must have confidence: `clear`, `partial`, or
    `uncertain`.
19. Only confirmed traits may flow into chat, Signature reports, Life Atlas, or
    any PDF.
20. Every user action must produce an immediate in-place result where the action
    happened. Do not force users into a scroll hunt.
21. Web and mobile must reach feature parity for Signature input, scanning,
    confirmation, privacy copy, and report handoff.
22. Respect `prefers-reduced-motion` on web and platform reduced-motion settings
    on mobile.

## Required Privacy Copy

Full copy for web/mobile input surfaces:

```text
Predicta does not store your signature image. It stays only in this session so we can prepare your reading. If you close this tab or leave the session, you may need to re-upload or re-draw it.
```

Short copy for tight UI:

```text
Not stored by Predicta. If you close this session, you may need to re-upload or re-draw.
```

Report/PDF copy when signature data was used:

```text
Predicta did not store your signature image. This section uses only confirmed visible traits from your current session.
```

Safety copy required on all Signature surfaces:

```text
Signature Predicta is reflective guidance, not forensic handwriting analysis or a guaranteed prediction.
```

## Required Web UX

- The upload/draw card must show the result in the same card where the user
  acted.
- After upload, the primary upload button must change from `Upload signature` to
  `Re-upload signature`.
- After drawing, the drawing action must change from `Use this drawing` to
  `Re-draw signature`.
- The signature preview must appear immediately above the fold inside the active
  upload/draw panel.
- The active panel must show:
  - preview
  - scan status
  - detected trait map
  - confidence chips
  - `Looks right`
  - `Adjust traits`
  - privacy copy
  - next action
- The lower preview section may remain as a secondary review area, but it cannot
  be the first place where the result appears.
- Clearing the signature must remove raw image memory and confirmed traits.
- Navigating to chat/report must pass only confirmed traits and derived
  analysis context, not raw image data.
- Browser reload or tab close must not recover the raw signature image.
- If the user returns after reload, show:

```text
Your previous signature image was not stored. Please re-upload or re-draw it to continue.
```

## Required Mobile UX

- Mobile must include a real upload/draw Signature input flow.
- Mobile must not remain an informational screen only.
- After upload or drawing, mobile must show an immediate in-place result card.
- Mobile must show a sticky mini confirmation:

```text
Signature ready · Not stored · Continue
```

- Mobile must show the short privacy copy near the action.
- Mobile must support `Re-upload signature` and `Re-draw signature`.
- Mobile must pass only confirmed traits to chat/report.
- Mobile must not persist raw signature images in app storage.
- Mobile must match web safety language and confidence labels.

## Analysis-First, Confirmation-Second Flow

The Signature flow must become analysis-first and confirmation-second:

1. User uploads or draws a signature.
2. Signature appears immediately in the same card.
3. Predicta runs a temporary in-session scan.
4. Predicta shows `Signature scanned`.
5. Predicta displays a detected trait map.
6. User taps `Looks right` or adjusts traits.
7. Only confirmed traits flow into chat/report.
8. Unclear traits are marked `Not sure` or `not assessed`.

Required instructional copy:

```text
Predicta detected these visible traits from your current signature. Please confirm or adjust anything that looks off.
```

## Required Detected Traits

The scan should attempt to detect these visible traits:

- baseline
- slant
- pressure or ink density
- size
- spacing
- legibility
- rhythm
- underline
- flourish
- consistency

Trait output must include:

- trait key
- detected value
- confidence: `clear`, `partial`, or `uncertain`
- evidence note
- user confirmation state

If the system cannot detect a trait confidently, it must show:

```text
Not sure
```

or:

```text
Not assessed
```

It must not guess silently.

## Trait Map Wow Moment

The trait map should feel polished and immediate. Example labels:

- `Baseline: gently upward`
- `Slant: mostly right`
- `Pressure: medium`
- `Rhythm: flowing`
- `Legibility: partial`
- `Flourish: moderate`
- `Spacing: balanced`

Every displayed label must be backed by detected or user-confirmed evidence.

## Scanning Animation

The scan animation is required for the wow moment.

Required animation flow:

1. User uploads or draws signature.
2. Signature appears immediately in the same card.
3. A polished scanning beam moves across the signature for approximately `1.5`
   to `2` seconds.
4. Small labels reveal one by one:
   - `Baseline detected`
   - `Slant measured`
   - `Rhythm mapped`
   - `Legibility checked`
   - `Flourish noted`
5. Result card appears:

```text
Signature traits ready. Please confirm what looks right.
```

6. Buttons change to `Re-upload signature` or `Re-draw signature`.

Visual style:

- dark glass card
- soft Predicta magenta, blue, and green scan glow
- thin champagne or teal scan line
- subtle particle shimmer
- trait chips with staggered fade or slide
- no cheesy sci-fi overload

Reduced-motion behavior:

- no moving scan beam
- show instant staged progress states
- no particle shimmer
- preserve the same information and result card

## Premium Enhancements

Premium/paid Signature Predicta may add:

- visual overlay on the signature during current session only
- baseline guide
- slant angle guide
- size envelope
- rhythm path
- spacing markers
- multi-sample comparison only when the user provides multiple samples in the
  current session or an approved future privacy-safe flow

Premium must still frame changes as expression/rhythm shifts, not fixed
personality truth.

Allowed premium copy:

```text
Your current signature appears more open and upward than the comparison sample.
```

Disallowed premium copy:

```text
This proves your personality changed.
```

## Analysis Safety Guardrails

Signature analysis must use reflective language:

- `may suggest`
- `can reflect`
- `often points to`
- `worth exploring`
- `visible expression pattern`
- `presentation rhythm`
- `confidence rhythm`
- `self-expression cue`

Signature analysis must not say:

- `proves`
- `guarantees`
- `you are definitely`
- `your destiny is`
- `your marriage will`
- `you are honest/dishonest`
- `you will be rich`
- `you will fail`
- `this diagnoses`
- `this verifies identity`

Required framing:

```text
Signature Predicta helps you reflect on self-expression, presentation, confidence rhythm, consistency, and improvement practices. It does not predict the future.
```

Reports must include a section:

```text
What this can and cannot tell you
```

That section must explain:

- it reads visible expression cues
- it is not forensic proof
- it is not identity verification
- it is not prediction
- it is not diagnosis
- it should support reflection, not replace judgment

## Report And PDF Requirements

If signature data was used in a Signature report:

- include confirmed traits only
- include confidence per trait
- include privacy copy
- include `What this can and cannot tell you`
- do not include raw signature image by default
- do not imply Predicta stored the signature image
- do not make hard fixed-personality claims

If signature data was used in `Predicta Life Atlas`:

- treat it as optional outer-expression enrichment only
- include the report/PDF privacy copy
- do not show signature traits if they were not confirmed
- if no signature exists, use the missing-signature note from the Life Atlas
  contract

## Predicta Memory Requirements

Predicta must know:

- raw signature images are not stored
- the user may need to re-upload or re-draw after closing the session
- only confirmed visible traits may be used
- unclear traits are `not assessed`
- Signature Predicta is reflective guidance only
- Signature Predicta is not forensic handwriting analysis
- Signature Predicta is not identity verification
- Signature Predicta is not a prediction engine
- signature data can enrich Life Atlas only when confirmed traits exist
- missing signature data must not be invented

Predicta must be able to answer:

- `Do you store my signature?`
- `Why do I need to re-upload my signature?`
- `What did you detect in my signature?`
- `Can I correct the detected traits?`
- `What does Signature Predicta not do?`
- `Can this predict my future?`
- `Can this verify my identity?`
- `Why is signature missing from my Life Atlas?`

## App-Wide Immediate Action Receipt Rule

This phase establishes a broader UX rule for Predicta:

Every meaningful user action must show its result in-place, near the point of
action, before asking the user to navigate, scroll, or hunt through the page.

Examples:

- upload shows preview and status immediately
- drawing shows readiness immediately
- report preparation shows download dialog immediately
- trait detection shows the trait map immediately
- missing data shows the exact pending state immediately

Do not hide the result below the fold, behind a drawer, or on another route
unless the user explicitly chooses to continue there.

## Strict Audit

This phase is green only when:

- web no longer stores raw signature image data in `localStorage`
- web no longer stores raw signature image data in `sessionStorage`
- web no longer stores raw signature image data in IndexedDB
- web no longer stores raw signature image data in persistent app state
- mobile does not store raw signature image data in persistent app storage
- raw signature images are kept only in current in-memory interaction state
- upload button changes to `Re-upload signature` after upload
- draw action changes to `Re-draw signature` after drawing
- web shows preview, scan status, privacy copy, trait map, confidence chips, and
  next action in the same panel where upload/draw happened
- mobile shows preview, scan status, privacy copy, trait map, confidence chips,
  and next action in the same screen area where upload/draw happened
- mobile has sticky confirmation: `Signature ready · Not stored · Continue`
- web and mobile show the full or short privacy copy at the point of action
- browser reload proves raw signature image is not restored
- app restart proves raw signature image is not restored on mobile
- report/chat handoff contains only confirmed traits and derived observations,
  not raw image data
- Signature report/PDF includes privacy copy when signature data was used
- Life Atlas report/PDF includes privacy copy when signature enrichment was used
- missing signature data does not block Life Atlas generation
- missing signature data is not invented
- detected traits include confidence values: `clear`, `partial`, or `uncertain`
- uncertain traits are shown as `Not sure` or `not assessed`
- user can confirm or adjust detected traits before deeper analysis
- unconfirmed traits do not flow into chat/report/PDF
- scanning animation runs for upload and draw flows
- reduced-motion mode replaces scanning motion with non-motion progress states
- Signature report includes `What this can and cannot tell you`
- no Signature output claims forensic proof, identity verification, diagnosis,
  hiring judgement, legal judgement, compatibility certainty, or guaranteed
  prediction
- no output says signature traits prove personality, destiny, honesty, success,
  marriage, health, wealth, or character
- generated Signature sample report is visually inspected
- generated Life Atlas sample with signature enrichment is visually inspected
- generated Life Atlas sample without signature is visually inspected and uses
  the approved missing-signature note
- desktop screenshots capture upload, scan, ready, confirm, and clear states
- mobile screenshots capture upload/draw, scan, ready, confirm, sticky
  confirmation, and clear states
- automated tests or deterministic fixtures cover trait confidence,
  confirmation gating, privacy copy, and no raw image persistence
- `corepack pnpm build:web` passes
- mobile typecheck/build impact is audited and either green or explicitly
  blocked by known unrelated failures
- `corepack pnpm --filter @pridicta/pdf build` passes
