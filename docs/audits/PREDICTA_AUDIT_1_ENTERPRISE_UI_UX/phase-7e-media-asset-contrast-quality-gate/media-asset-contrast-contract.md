# Predicta Media Asset And Contrast Quality Contract

Phase ID: `PREDICTA_AUDIT_1_PHASE_7E_MEDIA_ASSET_AND_CONTRAST_QUALITY_GATE`

This contract makes images, logos, watermarks, thumbnails, previews, and core
text/surface contrast auditable before release.

## Approved Media Assets

- Product logo: `/predicta-logo.png`
- Report/page watermark seal: `/predicta-seal-watermark.png`
- Founder legacy fallback: `/founder-bhaumik-mehta.png`

The founder fallback is not a founder photograph. It exists only so old links
or crawlers receive a controlled branded image instead of a broken response.

## Media Primitive Rules

Web product media must use `PredictaMediaAsset` or a documented route-specific
exception. The primitive wraps `next/image` with:

- required `alt` text
- tokenized media frame classes
- max-width safety
- object-fit containment
- fixed logo/watermark roles
- predictable aspect ratio behavior

Raw `<img>` is only allowed for user-provided ephemeral signature previews
because those images are generated in-session, never stored by Predicta, and
cannot be routed through static asset optimization.

## Asset Runtime Rules

- Visible static image URLs must return `2xx`.
- Missing assets must use a controlled fallback, never an uncaught broken image.
- Logos must not stretch, crop, blur, or overflow their frame.
- Watermarks must remain faint enough to support brand presence without hurting
  reading contrast.
- PDF/report assets must use the same approved logo/seal asset family.

## Contrast Rules

Contrast must be checked for:

- primary text
- muted text
- disabled text
- primary and secondary CTAs
- badges and pills
- cards and panels
- form inputs
- tables
- modals
- report preview surfaces

Minimum thresholds:

- Primary and normal UI text: `4.5:1` or higher.
- Large/bold headline and CTA text: `3:1` or higher.
- Disabled state copy: `3:1` or higher, because disabled affordances still need
  to be understandable.

## Hard Failure Rules

- `/founder-bhaumik-mehta.png` cannot return HTTP `400`.
- Any visible product image URL returning non-`2xx` fails the phase.
- Any media frame creating horizontal overflow fails the phase.
- Any required contrast sample below threshold fails the phase.
- Screenshots for desktop, tablet, mobile, and PDF-preview surfaces must be
  saved before the phase can be green.
