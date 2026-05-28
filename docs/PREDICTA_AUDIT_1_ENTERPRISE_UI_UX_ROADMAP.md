# Predicta Audit 1: Enterprise UI/UX Roadmap

Status: `NO-GO`
Audit date: 2026-05-28
Scope: whole-application UI/UX across web desktop, tablet, mobile, and native mobile source surfaces.

This is the dedicated roadmap for Audit 1 only. Do not merge it into report,
PDF, astrology-intelligence, payment, localization, or AI-model roadmaps. Those
roadmaps may depend on this one, but this file owns visual polish,
responsiveness, layout integrity, interaction quality, and enterprise-grade
product feel.

## Audit Evidence

Commands and runtime checks used:

- `PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:audit-server-preflight`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:ui-text-overflow`
- `PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:visual-proof`
- `PREDICTA_BUYER_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:buyer-rejection`
- Browser inspection of `http://127.0.0.1:3016/dashboard/kp`
- Static route inventory under `apps/web/app`
- Native screen inventory under `apps/mobile/src/screens` and `apps/mobile/src/components`

Artifacts:

- Visual screenshots: `/var/folders/6q/zkv5lgj53pb377912vyfx6200000gp/T/predicta-visual-proof-1779961650475`
- Contact sheets: `/tmp/predicta-audit1-contact-sheets`

Important audit limitation:

- The active `localhost:3009` target was unreachable.
- The available production-like local server was `http://127.0.0.1:3016`.
- That server rendered raw/unstyled pages and client-side app errors because
  `_next/static` assets returned `400 Bad Request`.
- Because the app shell itself is broken, many lower-level visual issues are
  necessarily secondary until CSS/JS delivery is repaired.

## Non-Negotiable UI/UX Rules

1. No phase can be called green from source review alone.
2. Every UI-facing phase requires desktop, tablet, mobile, and narrow-mobile
   runtime proof.
3. No route may render unstyled/raw HTML in any production-like server.
4. No route may depend on `overflow-x: hidden` to hide layout defects.
5. No visible text may clip, collide, or leak outside its container.
6. No chart, pill, badge, CTA, tab, dropdown, input, card, or modal may overflow
   at 360px, 390px, 834px, 1024px, 1440px, or ultrawide widths.
7. Touch targets must be at least 44px high/wide unless the element is purely
   decorative.
8. Primary CTAs must be visible in the same user context where the choice was
   made.
9. Actions must outrank paragraphs. If a screen explains more than it helps,
   it fails.
10. Report/download, signature, Kundli, chat, payment, and specialist-room
    flows must not feel like forms or toolkits.
11. Empty, loading, error, and success states must feel branded, calm, and
    helpful.
12. Visual proof must include screenshots or artifacts, not just pass/fail logs.

## Critical Findings

### C1. Production-Like Server Renders Broken/Unstyled UI

Issue:
The confirmed local server at `http://127.0.0.1:3016` serves page HTML, but
`/_next/static` JS/CSS asset requests return `400 Bad Request`. Browser
inspection of `/dashboard/kp` shows `Application error: a client-side exception
has occurred`.

Why it hurts:
This is a first-5-seconds failure. Users see raw links, default Times-like text,
unstyled buttons, broken layout hierarchy, and no premium Predicta experience.
Every polished component is effectively absent.

Severity: Critical.

Exact fix recommendation:
Repair production-like app serving before any visual phase can be trusted.
Audit `next start` host/asset config, App Hosting output, standalone/server
asset paths, build ID consistency, static asset rewrites, and host validation.
Add a preflight that fetches all CSS/JS assets referenced by `/` and at least
ten app routes.

Better UX alternative:
If assets fail, show a branded maintenance shell instead of raw/default browser
fallback.

### C2. `localhost:3009` Audit Target Is Down

Issue:
`corepack pnpm test:audit-server-preflight` failed with
`connect ECONNREFUSED 127.0.0.1:3009`.

Why it hurts:
QA cannot reliably reproduce the app state the scripts expect. The in-app
browser can show stale URLs while the actual audit target is dead.

Severity: Critical.

Exact fix recommendation:
Create one canonical local audit target and a single command that starts it,
waits for health, verifies assets, and prints the base URL. All scripts must use
that same base URL unless explicitly overridden.

Better UX alternative:
Developer QA should never depend on remembering whether the app is on `3000`,
`3009`, or `3016`.

### C3. `/dashboard/account` Fails Audit Server Preflight

Issue:
`PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:audit-server-preflight`
failed because `/dashboard/account` returned HTTP `404`.

Why it hurts:
Account is a core trust surface. A broken account deep link makes the app feel
unfinished and damages trust before payment/profile workflows.

Severity: Critical.

Exact fix recommendation:
Fix the production-like route generation/serving for `/dashboard/account` and
add it to visual, overflow, buyer, and smoke gates.

Better UX alternative:
If account is gated or unavailable, route to a branded account state with a
clear CTA, not a 404.

### C4. Mobile Landing Has Hard Horizontal Overflow

Issue:
Mobile `/` is `213px` wider than a `390px` viewport and `243px` wider than a
`360px` viewport. Wide elements include `.hero-chart-label-5`,
`.hero-sign-meta`, `.hero-sign-name`, `.hero-chart-planet-stack`, and the Moon
planet glyph.

Why it hurts:
The landing page is the first impression. Horizontal overflow makes Predicta
feel amateur and breaks mobile trust immediately.

Severity: Critical.

Exact fix recommendation:
Refactor the landing hero chart so labels are contained inside the chart
viewport, scale through CSS variables, and switch to a simplified mobile chart
presentation below `480px`. Add a dedicated mobile landing chart stress gate.

Better UX alternative:
Mobile hero should show a compact premium chart preview plus one clear CTA,
not a full desktop chart squeezed into a phone.

### C5. Safety Page Text Clips

Issue:
`/safety` clips the visible text `Bhaumik Mehta` on desktop and tablet.

Why it hurts:
Safety is a trust surface. Text clipping on a safety page quietly tells users
that the app is not careful.

Severity: Critical.

Exact fix recommendation:
Audit safety page cards, name-bearing components, and copy containers. Replace
fixed-width text containers with responsive wrapping rules and add a route-level
text clipping fixture.

Better UX alternative:
Safety content should use calm cards with spacious copy, not compressed text
blocks.

## Major Findings

### M1. App Shell and Navigation Collapse Into Raw Link Lists When Assets Fail

Issue:
Screenshots show the dashboard, reports, specialist rooms, and navigation as
unstyled vertical link stacks.

Why it hurts:
Even temporary asset failure exposes the information architecture as cluttered
and link-heavy.

Severity: Major.

Exact fix recommendation:
Create a resilient app shell with minimal critical CSS or server-rendered
fallback styling for nav, language switcher, CTA, and route title.

Better UX alternative:
Critical navigation should remain readable, branded, and touch-safe even before
client hydration.

### M2. Report Page Still Has Too Many Actions and Controls

Issue:
Buyer gate shows `/dashboard/report` has `33` visible buttons and `19` form
controls across desktop/tablet/mobile. Desktop/tablet first screen still shows
`18` actions.

Why it hurts:
Users want to download a report, not solve a dashboard puzzle. Too many controls
create analysis paralysis and lower conversion.

Severity: Major.

Exact fix recommendation:
Convert the report page into a school-lane composer with one selected-card
action panel, one primary CTA, progressive customization, and a sticky selected
report bar only after scrolling.

Better UX alternative:
Default to `Recommended by Predicta`; hide advanced include/exclude controls
behind `Customize`.

### M3. Signature Page Is Action Dense

Issue:
Buyer gate counts `40` buttons on `/dashboard/signature`.

Why it hurts:
Signature analysis should feel magical and immediate. Forty actions makes it
feel like a settings/debug surface.

Severity: Major.

Exact fix recommendation:
Collapse signature upload/draw, trait map, confirmation, privacy reassurance,
and report CTA into one staged panel. Secondary actions must be grouped under
`More options`.

Better UX alternative:
Use one hero action at a time: upload/draw -> scanning -> confirm traits ->
download/ask.

### M4. Landing Hero Chart Uses Desktop Geometry on Mobile

Issue:
Mobile overflow comes from hero chart labels and planet stacks, not from text
copy.

Why it hurts:
Charts are core to Predicta credibility. If a decorative hero chart breaks,
users will assume actual Kundli charts are unreliable.

Severity: Major.

Exact fix recommendation:
Create separate chart density modes for hero, app chart, chat mini-chart, and
PDF chart. The landing hero must not reuse full chart label density on mobile.

Better UX alternative:
Show a smaller symbolic chart plate on mobile and move details to the app.

### M5. Public Greenlight Cannot Run With Dirty Worktree

Issue:
`test:public-greenlight` refused to run because the working tree is dirty.

Why it hurts:
Launch audit cannot be trusted while local edits are mixed with release state.

Severity: Major.

Exact fix recommendation:
Create a release-audit routine that snapshots or parks current edits, runs
greenlight, then restores work. Never confuse in-progress implementation with
launch state.

Better UX alternative:
Audit scripts should print an exact safe command sequence for park/run/restore.

### M6. Static Audit Scripts Can Pass False Positives Against Error Pages

Issue:
The default visual/overflow gates passed against `3009` even though the server
was unreachable or stale, because they did not verify recognizable Predicta
content before measuring layout.

Why it hurts:
False green gates are worse than no gates because they teach the team to trust
bad evidence.

Severity: Major.

Exact fix recommendation:
Every browser audit route must assert HTTP status, absence of Next error
markers, visible Predicta content, and at least one expected route-specific
selector before measuring overflow.

Better UX alternative:
Gates should fail fast with `route is not a valid app screen`, not produce
misleading visual tables.

### M7. Native Mobile Layout Is High Risk for Density

Issue:
Native screens use many nested `Pressable`, `GlowButton`, `flex-row`, `gap`,
and long scroll stacks in `ReportScreen`, `SettingsScreen`, `SavedKundlisScreen`,
`PaywallScreen`, and specialist panels.

Why it hurts:
Without native screenshots and touch-target audits, mobile can pass TypeScript
while still feeling cramped, long, or hard to use.

Severity: Major.

Exact fix recommendation:
Add native screenshot/interaction audits for iPhone SE, iPhone 15, small
Android, tablet, and large tablet. Enforce touch target, no clipped text, safe
area, keyboard, modal, and scroll behavior.

Better UX alternative:
Native surfaces should use staged flows, not long stacked cards.

## Medium Findings

### ME1. Dashboard Specialist Rooms Risk Repeating the Same Layout Pattern

Issue:
Vedic, KP, Nadi, Numerology, and Signature routes share similar card stacks and
button-heavy room surfaces.

Why it hurts:
The five worlds can feel like renamed copies rather than specialist spaces.

Severity: Medium.

Exact fix recommendation:
Define per-room visual hierarchy: Vedic chart-first, KP question/verdict-first,
Nadi story-first, Numerology mandala-first, Signature scan-first.

Better UX alternative:
Keep shared navigation, but let each room have one distinct hero interaction.

### ME2. Account, Settings, Family, and Saved Kundlis Need Empty/Error State Review

Issue:
Audit evidence shows these routes exist and render, but the current automated
passes do not prove premium empty states, loading states, recovery states, or
error states.

Why it hurts:
Users judge reliability from recovery states as much as happy paths.

Severity: Medium.

Exact fix recommendation:
Create explicit state fixtures: no Kundli, one Kundli, many Kundlis, signed out,
signed in, premium inactive, payment pending, API error, offline.

Better UX alternative:
Each state should answer: what happened, why it matters, what to do next.

### ME3. Modal, Drawer, Dropdown, and Popover Coverage Is Insufficient

Issue:
The current gates count page-level overflow but do not deeply inspect modals,
drawers, dropdowns, report dialogs, signature scan states, or destructive
dialogs.

Why it hurts:
Enterprise UI often fails in overlays: z-index, focus trapping, scroll locking,
safe-area, and action placement.

Severity: Medium.

Exact fix recommendation:
Add overlay-specific tests for download dialog, report composer, signature
upload/draw, destructive dialog, language dropdown, account/payment states, and
mobile sheets.

Better UX alternative:
Overlays should have one clear title, one primary action, one secondary action,
and visible close/cancel.

### ME4. Typography and Spacing Are Not Enforced by Tokens

Issue:
Source sweep shows many one-off `gap`, `px`, `py`, `text-*`, absolute
positioning, overflow rules, and route-specific CSS blocks.

Why it hurts:
One-off spacing makes surfaces drift and creates inconsistent premium feel.

Severity: Medium.

Exact fix recommendation:
Create strict layout tokens for page gutters, card padding, vertical rhythm,
button height, radius, shadow, and chart density. Ban route-level improvisation
unless documented.

Better UX alternative:
Use a small set of layout primitives: `PageShell`, `SectionStack`, `ActionRow`,
`ComposerPanel`, `DataTable`, `EmptyState`, `StateBanner`.

### ME5. Authentication and Payment Workflows Need UX State Proof

Issue:
Checkout, redeem pass, premium, login, account, and settings exist, but the
audit did not prove complete loading, success, pending, failure, retry, or
Razorpay-ready states.

Why it hurts:
Payment friction directly affects revenue and user trust.

Severity: Medium.

Exact fix recommendation:
Add payment workflow visual QA for free, premium, day-pass, report purchase,
Razorpay unavailable, Razorpay pending, success, failure, and retry.

Better UX alternative:
Payment should feel like a calm checkout, not a redirect mystery.

## Minor Findings

### MI1. Local QA Port Confusion Creates Wasted Audit Time

Issue:
`3009`, `3016`, and stale in-app browser URLs are all present.

Why it hurts:
Developers can unintentionally audit the wrong app state.

Severity: Minor.

Exact fix recommendation:
Add `pnpm audit:serve` and `pnpm audit:open` scripts that print the active base
URL and write it into a small runtime file consumed by all audit scripts.

Better UX alternative:
One URL, one command, one source of truth.

### MI2. Screenshot Artifacts Are Temporary and Easy To Lose

Issue:
Audit screenshots are stored in `/tmp` or macOS temp folders.

Why it hurts:
Findings become harder to reproduce later.

Severity: Minor.

Exact fix recommendation:
Copy Audit 1 screenshots and summary JSON into
`docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/`.

Better UX alternative:
Every audit run should produce a permanent artifact bundle.

## Audit 2 Addendum: Global Design System and Cross-Platform Coherence

Status: `NO-GO`
Audit date: 2026-05-28
Scope: systemic design consistency, responsiveness, visual language, media
quality, component behavior, cross-platform parity, and design-system
governance.

Audit 2 does not replace Audit 1. It strengthens this roadmap by identifying
why the UI keeps regressing: Predicta has strong individual components, but no
strict single source of truth for visual decisions across web, native mobile,
PDF, reports, specialist rooms, and public surfaces.

### Audit 2 Evidence

Runtime checks repeated:

- `PREDICTA_AUDIT_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:audit-server-preflight`
- `PREDICTA_UI_OVERFLOW_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:ui-text-overflow`
- `PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3016 corepack pnpm test:visual-proof`

Source/design-system measurements:

- Web has no obvious shared token package or theme source file.
- Web styling is concentrated in `apps/web/app/globals.css`.
- Native styling is split across NativeWind-like classes, StyleSheet blocks,
  inline styles, and component-specific values.
- Web CSS contains 64 unique hex colors, 474 unique rgba values, 157 unique px
  values, 123 unique font-size declarations, 23 border-radius variants, and 52
  box-shadow variants.
- Web CSS contains 58 unique grid-template values, 110 max-width values, 165
  padding declarations, 52 gap values, 61 animation declarations, and z-index
  values up to 10002.
- Native code contains 47 unique hex colors, 188 hardcoded class hex usages,
  66 rounded class variants, 114 gap class variants, 37 arbitrary text-size
  classes, 35 fixed-width patterns, and multiple absolute-positioned surfaces.

### Audit 2 Critical Findings

#### C6. Predicta Does Not Have a Real Single Source of Truth Design System

Issue:
There is no clear shared `@pridicta/ui` token system or cross-platform design
contract governing color, spacing, radius, shadow, typography, motion, layout,
cards, buttons, forms, modals, charts, tables, and report surfaces.

Why it damages UX/UI quality:
Without a source of truth, every page becomes a local styling decision. This
creates visual drift, inconsistent hierarchy, inconsistent button behavior,
random spacing, inconsistent premium feel, and repeated responsive regressions.

Affected devices/breakpoints:
All devices: mobile portrait, mobile landscape, tablets, laptops, desktops, and
ultrawide.

Severity: Critical.

Exact fix recommendation:
Create a strict shared design-token package used by web, native mobile, and PDF:
colors, semantic surfaces, typography scale, spacing scale, radius scale,
shadow/elevation scale, z-index scale, motion durations, breakpoints, chart
density modes, and component state tokens.

Systemic improvement:
All feature work must consume tokens and shared primitives. New hardcoded
visual values require an explicit exception.

#### C7. Global CSS Has Become an Uncontrolled Product-Wide Dumping Ground

Issue:
`apps/web/app/globals.css` is massive and contains hundreds of one-off values:
64 hex colors, 474 rgba values, 123 font-size declarations, 23 radii, 52
shadows, 58 grid templates, and 165 padding declarations.

Why it damages UX/UI quality:
One global file with many local exceptions makes order, specificity, and visual
intent hard to reason about. It encourages emergency overrides, `!important`,
and route-specific patching instead of systematic design.

Affected devices/breakpoints:
All web breakpoints, especially mobile and tablet where cascade conflicts show
up as overflow, cramped cards, or broken hierarchy.

Severity: Critical.

Exact fix recommendation:
Split global CSS into layered foundations: reset/base, tokens, layout
primitives, components, route exceptions, and legacy quarantine. Add a source
gate that fails if new route-specific design values are added outside approved
layers.

Systemic improvement:
Use global CSS for primitives and tokens only. Route styling must be either
component-scoped or consume shared primitives.

#### C8. Responsive Behavior Is Improvised Instead of Systematic

Issue:
The app uses many unrelated breakpoints and layout values: 36 media queries
with 15 unique breakpoint expressions, 110 max-width values, 58 grid templates,
and one-off fixed sizes.

Why it damages UX/UI quality:
Responsive layouts may work in one viewport and fail in another. This creates
awkward tablet layouts, hidden mobile overflow, oversized desktop containers,
undersized tap zones, and inconsistent column behavior.

Affected devices/breakpoints:
Mobile portrait, narrow mobile, mobile landscape, small tablet, large tablet,
laptop, desktop, ultrawide.

Severity: Critical.

Exact fix recommendation:
Define universal breakpoints and layout rules:
`320`, `360`, `390`, `430`, `568 landscape`, `768`, `834`, `1024`, `1280`,
`1440`, `1728`, and ultrawide. Every major route must declare how it stacks,
columns, gutters, max widths, sticky regions, and CTAs behave at these widths.

Systemic improvement:
Build a responsive matrix gate that screenshots and measures every core route
at the full breakpoint set, not just 390/834/1440.

#### C9. Cross-Platform Visual Language Is Not Locked

Issue:
Web, native mobile, and PDF use overlapping but separate styles. Native has
hardcoded colors and class values, web has global CSS, and PDF has its own
template system.

Why it damages UX/UI quality:
Predicta can feel like three products: web app, mobile app, and report engine.
Users lose trust when the same feature has different spacing, hierarchy,
colors, or interaction behavior across platforms.

Affected devices/breakpoints:
Web desktop/tablet/mobile, native iOS/Android, and PDFs.

Severity: Critical.

Exact fix recommendation:
Create a cross-platform visual contract with shared semantic names:
`surface.base`, `surface.raised`, `surface.glass`, `text.primary`,
`text.muted`, `accent.blue`, `accent.magenta`, `accent.green`, `accent.gold`,
`radius.card`, `shadow.panel`, `motion.fast`, `motion.reveal`, etc.

Systemic improvement:
Every component must map to the same semantic design tokens even if the
implementation differs by platform.

### Audit 2 Major Findings

#### M8. Button, Card, Pill, Badge, Form, and Modal Styles Are Not Normalized

Issue:
Source search shows many local button, card, panel, pill, badge, input, dialog,
table, and nav implementations across web and native.

Why it damages UX/UI quality:
Users cannot build muscle memory if CTAs, cards, forms, and overlays behave or
look different from route to route.

Affected devices/breakpoints:
All web and native surfaces.

Severity: Major.

Exact fix recommendation:
Create canonical primitives:
`PredictaButton`, `PredictaCard`, `PredictaPanel`, `PredictaPill`,
`PredictaBadge`, `PredictaInput`, `PredictaSelect`, `PredictaTabs`,
`PredictaModal`, `PredictaDrawer`, `PredictaTable`, `PredictaEmptyState`, and
`PredictaStateBanner`.

Systemic improvement:
Ban new route-local button/card/form styles unless they wrap the canonical
primitive.

#### M9. Motion and Interaction States Are Inconsistent

Issue:
Web CSS contains 61 unique animation declarations and 21 transition patterns.
Hover/focus/active behaviors are spread across route-specific selectors.

Why it damages UX/UI quality:
Motion feels random. Some surfaces feel alive, others feel dead, and some may
animate too much. This weakens premium polish and accessibility.

Affected devices/breakpoints:
All web routes, with higher risk on mobile and reduced-motion users.

Severity: Major.

Exact fix recommendation:
Define a motion system: `instant`, `fast`, `standard`, `slow`, `stagger`, and
`ambient`. Add a reduced-motion contract and a source gate that rejects
unapproved animation durations/keyframes.

Systemic improvement:
Every animation must have a purpose: reveal, feedback, progress, scan,
selection, or ambient. Decorative motion cannot block readability.

#### M10. Z-Index and Overlay Layering Are Not Governed

Issue:
Web CSS uses z-index values including `80`, `100`, `1000`, `10000`, `10001`,
and `10002`.

Why it damages UX/UI quality:
Uncontrolled z-index creates overlay bugs: modals behind sticky nav, dropdowns
under cards, drawers trapping clicks, and impossible-to-debug layering.

Affected devices/breakpoints:
Desktop/tablet/mobile, especially modals, drawers, sticky CTAs, chat, report
download, signature scan, account/payment flows.

Severity: Major.

Exact fix recommendation:
Create a z-index scale: `base`, `raised`, `sticky`, `overlay`, `modal`,
`toast`, `critical`. Replace raw z-index values with tokens.

Systemic improvement:
Add an overlay visual gate that opens every overlay type and verifies layering,
focus, scroll lock, and escape/cancel behavior.

#### M11. Media and Asset Styling Is Inconsistent

Issue:
Logo and media handling is split across `next/image`, normal `img`, CSS
background images, mobile `Image`, PDF image embedding, and downloadable
signature preview images. Audit also found an internal link to
`/founder-bhaumik-mehta.png` returning HTTP `400`.

Why it damages UX/UI quality:
Broken images, inconsistent crops, distorted aspect ratios, and failed media
links reduce trust immediately.

Affected devices/breakpoints:
Public pages, founder/safety/about surfaces, signature upload/draw, PDFs,
native splash/home/chat.

Severity: Major.

Exact fix recommendation:
Create a media asset contract: approved logo assets, aspect ratios, crop
positions, object-fit, max sizes, lazy/eager rules, alt text, and broken-asset
fallbacks. Add a media link checker that follows all visible image URLs.

Systemic improvement:
All product images must use one of the approved media primitives.

#### M12. Design Quality Cannot Be Proven While Asset Runtime Is Broken

Issue:
The production-like server still serves raw/unstyled UI and asset requests
return `400`.

Why it damages UX/UI quality:
Systemic design audits are partially blocked because screenshots are not
representing the intended styled product.

Affected devices/breakpoints:
All browser breakpoints.

Severity: Major.

Exact fix recommendation:
Treat Audit 1 Phase 1 as a hard dependency for every visual design-system phase.
No design system phase can be green until styled screenshots are captured from
the canonical audit server.

Systemic improvement:
Every visual gate must fail if CSS/JS assets are unhealthy.

### Audit 2 Medium Findings

#### ME6. Typography Scale Is Too Fragmented

Issue:
Web CSS contains 123 unique `font-size` declarations and many small text sizes
like `11px` and `12px`.

Why it damages UX/UI quality:
Readability and hierarchy vary across surfaces. Dense pages can become hard to
scan, while premium pages can feel visually weak.

Affected devices/breakpoints:
All web routes and especially mobile/tablet.

Severity: Medium.

Exact fix recommendation:
Define a type scale for display, page title, section title, card title, body,
caption, metadata, pill, table, and form labels. Enforce line heights and max
line lengths.

Systemic improvement:
Use type roles, not arbitrary font sizes.

#### ME7. Color and Contrast Require a Formal Accessibility Audit

Issue:
The app uses many translucent whites/blues/golds and glass surfaces. Without
tokenized contrast rules, some text/surface combinations can become washed out
or visually dead.

Why it damages UX/UI quality:
Weak contrast lowers readability, premium feel, and accessibility compliance.

Affected devices/breakpoints:
All screens, especially dark/glass panels, badges, pills, disabled states,
secondary CTAs, and PDF-like previews.

Severity: Medium.

Exact fix recommendation:
Create contrast tokens and run automated contrast checks for primary text,
muted text, CTAs, badges, form fields, table text, and disabled states.

Systemic improvement:
No component can choose arbitrary translucent text over arbitrary glass.

#### ME8. Native Mobile Design Is Too Locally Styled

Issue:
Native mobile contains hardcoded colors, arbitrary class names, StyleSheet
values, and local layout decisions across many screens.

Why it damages UX/UI quality:
Native can diverge from web quickly even when feature parity exists.

Affected devices/breakpoints:
iOS/Android small phones, modern phones, tablets.

Severity: Medium.

Exact fix recommendation:
Create native equivalents of the web design primitives and migrate screens
gradually by product area.

Systemic improvement:
Native screens should not invent spacing/color/card/button values.

#### ME9. Prediction/Intelligence Behavior Needs UI Consistency Rules

Issue:
The audit scope includes inconsistent prediction, function, feature, and
intelligence behavior. UI currently has no visible contract ensuring that Vedic,
KP, Nadi, Numerology, Signature, and Life Atlas use consistent guidance
patterns while preserving school boundaries.

Why it damages UX/UI quality:
If one room predicts, another teaches, and another shows proof first, the app
feels incoherent even if each route technically works.

Affected devices/breakpoints:
All specialist rooms, reports, chats, and mobile equivalents.

Severity: Medium.

Exact fix recommendation:
Create a shared `Predicta Intelligence UI Pattern`: prediction first, evidence
second, action third, safety last. Each school gets its own hero interaction,
but the reading rhythm stays consistent.

Systemic improvement:
Predicta should feel like one intelligent product with specialist rooms, not
separate feature islands.

### Audit 2 Minor Findings

#### MI3. Current Audit Coverage Misses Mobile Landscape, Ultrawide, and Styled Screens

Issue:
Current visual proof covers 390, 834, and 1440, but Audit 2 requires mobile
landscape, small/large tablets, laptops, desktops, and ultrawide.

Why it damages UX/UI quality:
Layouts can pass the current gates and still fail on landscape phones, iPad
split view, 1024 laptops, or ultrawide monitors.

Affected devices/breakpoints:
568x320 landscape, 768, 1024, 1280, 1728, ultrawide.

Severity: Minor now, Major before release.

Exact fix recommendation:
Expand visual proof gates to the full breakpoint matrix once asset runtime is
fixed.

Systemic improvement:
Responsive QA must match real device classes, not only three convenient widths.

#### MI4. Design-System Metrics Are Not Persisted As Audit Artifacts

Issue:
The token drift counts were generated during this audit but are not yet
automatically saved by a script.

Why it damages UX/UI quality:
Without a repeatable metric, design drift can return silently.

Affected devices/breakpoints:
All platforms.

Severity: Minor.

Exact fix recommendation:
Add a `test:design-system-drift` script that outputs token counts, arbitrary
value counts, component primitive usage, and route exceptions.

Systemic improvement:
Make visual consistency measurable.

## Strict Fix Phases

### PREDICTA_AUDIT_1_PHASE_0_EVIDENCE_LOCK_AND_AUDIT_SERVER_TRUTH

Goal:
Lock the exact audit evidence, canonical server URL, route list, screenshot
artifacts, and failure logs before implementation.

Must fix:

- `3009` unreachable ambiguity.
- `3016` asset/client error evidence.
- Temporary screenshot artifact preservation.
- False-positive visual/overflow script behavior against error pages.

Green criteria:

- Audit artifact folder exists under `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/`.
- Canonical audit base URL is documented.
- Every browser audit validates HTTP status, visible Predicta content, and
  route-specific selectors before measuring layout.
- `audit1:phase0:evidence` captures canonical `3009` and observed `3016`
  failure logs into the audit artifact folder.
- `test:audit1-phase-0` verifies the artifact bundle, route list, server
  contract, and browser readiness guards.
- Phase commit exists before Phase 1 starts.

### PREDICTA_AUDIT_1_PHASE_1_STATIC_ASSET_AND_APP_SHELL_RECOVERY

Goal:
Make the production-like web app load styled, hydrated, and branded on the
canonical audit server.

Must fix:

- `_next/static` CSS/JS returning `400`.
- Client-side exception on `/dashboard/kp`.
- Raw HTML/unstyled dashboard screenshots.
- `/dashboard/account` returning `404`.

Green criteria:

- `audit:build` produces a valid production build with `BUILD_ID`.
- `audit:serve` starts the canonical production-like local server on
  `http://127.0.0.1:3009`.
- `test:audit-server-preflight` passes on canonical audit URL.
- Browser route inspection shows no client-side exception.
- All referenced CSS/JS assets return `2xx`.
- Screenshots show styled Predicta UI across landing, dashboard, report, KP,
  Nadi, Numerology, Signature, settings, account, and family.
- `test:audit1-phase-1` writes Phase 1 screenshot and manifest artifacts.
- Phase commit exists before Phase 2 starts.

### PREDICTA_AUDIT_1_PHASE_2_LANDING_MOBILE_HERO_AND_CHART_OVERFLOW_LOCK

Goal:
Remove mobile landing overflow and make the first impression premium.

Must fix:

- 213px overflow at 390px.
- 243px overflow at 360px.
- `.hero-chart-label-5`, sign metadata, planet stack, Moon glyph leakage.
- Any use of global `overflow-x: hidden` as the primary fix.

Green criteria:

- Mobile landing has zero horizontal overflow at 320, 360, 390, 430, 768, 834,
  1024, 1440.
- Hero chart has a dedicated mobile density mode.
- Landing CTA remains visible above the fold.
- Visual artifact before/after is saved.
- Phase commit exists before Phase 3 starts.

Audit command:

```bash
corepack pnpm test:audit1-phase-2
```

Evidence:

- `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-2-landing-mobile-hero-overflow-lock/`
  contains before/after screenshots and manifest output.
- The Phase 2 gate fails if the CTA is merely present but covered by a blocking
  overlay.

### PREDICTA_AUDIT_1_PHASE_3_SAFETY_ACCOUNT_AND_TRUST_SURFACE_REPAIR

Goal:
Repair trust-critical surfaces and remove clipping/404 failures.

Must fix:

- `/safety` clipped `Bhaumik Mehta` text on desktop/tablet.
- `/dashboard/account` 404.
- Account, safety, legal, feedback, pricing, checkout visual hierarchy.
- Empty/error states on account and settings.

Green criteria:

- `test:ui-text-overflow` has zero clipping on all included routes.
- Account route returns `2xx` and has a branded signed-in/signed-out state.
- Safety page has no clipped/truncated text at desktop/tablet/mobile.
- Phase commit exists before Phase 4 starts.

Audit commands:

```bash
corepack pnpm test:audit1-phase-3
corepack pnpm test:ui-text-overflow
```

Evidence:

- `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-3-safety-account-trust-surface-repair/`
  contains trust-surface screenshots and manifest output.

### PREDICTA_AUDIT_1_PHASE_4_REPORT_COMPOSER_ACTION_DENSITY_REBUILD

Goal:
Make reports easy to buy/download without hunting, scrolling, or reading a
control panel.

Must fix:

- `/dashboard/report` 33 visible buttons.
- 19 report form controls.
- 18 first-screen actions on desktop/tablet.
- Vedic custom builder complexity.
- School lane discoverability and CTA placement.

Green criteria:

- Report page uses horizontal sub-nav on desktop/tablet and stacked full-width
  tabs on mobile.
- Selecting any report expands an inline action panel directly under the
  selected card.
- Vedic uses `Recommended by Predicta` with collapsed customization.
- First screen action limits: desktop <= 10, tablet <= 8, mobile <= 6.
- `test:audit1-phase-4`, `test:pre-live-phase-13`, buyer gate, visual proof,
  and overflow gate pass.
- Phase commit exists before Phase 5 starts.

### PREDICTA_AUDIT_1_PHASE_5_SIGNATURE_SCAN_FLOW_AND_ACTION_DENSITY_REBUILD

Goal:
Make Signature Predicta feel immediate, magical, safe, and not button-heavy.

Must fix:

- `/dashboard/signature` 40 visible buttons.
- Upload/draw/confirm/report actions spread across too much UI.
- Privacy assurance placement.
- Mobile and web parity for signature action receipt.

Green criteria:

- Signature page uses one staged scan panel.
- Visible buttons <= 12 desktop/tablet and <= 8 mobile.
- Empty, uploading, scanning, ready, confirm, error, and report-blocked states
  all have visual artifacts.
- Signature report download remains blocked without confirmed traits.
- `test:audit1-phase-5`, `test:signature-predicta`, buyer gate, visual proof,
  and overflow gate pass.
- Phase commit exists before Phase 6 starts.

### PREDICTA_AUDIT_1_PHASE_6_SPECIALIST_ROOM_VISUAL_IDENTITY_AND_PROGRESSIVE_DISCLOSURE

Goal:
Make Vedic, KP, Nadi, Numerology, and Signature visually distinct, readable,
and action-led without clutter.

Must fix:

- Repeated card-stack feel across rooms.
- KP must feel event/verdict-first.
- Nadi must feel story/validation-first.
- Numerology must feel mandala/cycle-first.
- Signature must feel scan/trait-first.
- Vedic must feel chart/prediction-first.

Green criteria:

- Each specialist room has one unique hero interaction and one primary CTA.
- Technical/proof details are collapsed or staged after prediction/guidance.
- Desktop/tablet/mobile screenshots are saved for each room.
- Predicta chat entry remains visible but not dominant.
- `test:audit1-phase-6`, specialist-room QA, buyer gate, visual proof, and
  overflow gate pass.
- Phase commit exists before Phase 7 starts.

### PREDICTA_AUDIT_1_PHASE_7_GLOBAL_LAYOUT_TOKEN_AND_COMPONENT_SYSTEM_LOCK

Goal:
Stop visual drift by enforcing shared layout primitives and tokens. Audit 2
upgrades this phase from a layout cleanup into a mandatory design-system
foundation phase.

Must fix:

- One-off spacing and route-specific CSS drift.
- Inconsistent card padding, radius, shadow, grid gaps, widths, and typography.
- Inconsistent button, pill, badge, table, form, and modal sizing.
- Lack of a single shared source of truth for web, native mobile, and PDF.
- Uncontrolled `apps/web/app/globals.css` growth.
- Hardcoded web/native colors, radii, shadows, widths, z-index, typography, and
  animation values.

Green criteria:

- Shared primitives exist for page shell, section stack, cards, action rows,
  tabs, tables, forms, empty states, loading states, modals, and sticky CTAs.
- Token usage is enforced by a source gate.
- Route-specific CSS exceptions are documented and limited.
- Audit 2 design-system drift metrics are saved as an artifact.
- No phase can be green from visual review alone; source-level token drift must
  also pass.
- `test:audit1-phase-7`, UI token typecheck, web typecheck, mobile typecheck,
  visual proof, and overflow gate pass.
- Phase commit exists before Phase 8 starts.

### PREDICTA_AUDIT_1_PHASE_7A_DESIGN_TOKEN_SINGLE_SOURCE_OF_TRUTH

Goal:
Create the authoritative Predicta design-token contract used by web, native
mobile, PDF, reports, and specialist-room surfaces.

Must fix:

- No shared semantic design-token package.
- 64 web hex colors, 474 rgba values, 23 radii, 52 shadows, 123 font-size
  declarations, and 157 px values without a strict source of truth.
- Native mobile hardcoded colors, class values, and local screen styling.
- PDF template colors and layout values drifting away from app surfaces.

Required token families:

- Semantic colors: base, raised, glass, porcelain, ink, muted, disabled,
  magenta, blue, green, gold, danger, warning, success.
- Typography: display, page title, section title, card title, body, caption,
  metadata, table, form label, pill.
- Spacing: page gutters, section gap, card padding, row gap, compact gap,
  touch spacing.
- Radius: card, panel, chip, input, modal, chart, report plate.
- Shadow/elevation: base, raised, floating, modal, toast.
- Motion: instant, fast, standard, slow, reveal, scan, ambient.
- Z-index: base, raised, sticky, overlay, modal, toast, critical.
- Breakpoints: 320, 360, 390, 430, 568 landscape, 768, 834, 1024, 1280, 1440,
  1728, ultrawide.

Green criteria:

- Shared token files exist and are imported by web, native mobile, and PDF
  where technically feasible.
- Raw color/radius/shadow/font-size/z-index additions fail a design-token gate
  unless explicitly allowlisted.
- `apps/web/app/globals.css` starts consuming token aliases instead of adding
  new arbitrary visual values.
- A before/after design-token drift report is saved under the Audit 1 artifact
  folder.
- `test:audit1-phase-7a`, `test:audit1-phase-7`, UI token typecheck,
  web/mobile/PDF typechecks, visual proof, and overflow gate pass.
- Phase commit exists before Phase 7B starts.

### PREDICTA_AUDIT_1_PHASE_7B_COMPONENT_PRIMITIVE_NORMALIZATION

Goal:
Normalize the components users touch most so the product feels like one premium
system instead of route-specific UI islands.

Must fix:

- Local button, card, pill, badge, input, select, tab, modal, drawer, table, and
  empty-state implementations.
- Inconsistent hover, active, focus, disabled, loading, selected, and error
  states.
- Route-local button/card/form styling that does not wrap shared primitives.
- Mobile screens inventing their own card and button rhythm.

Required primitives:

- `PredictaButton`
- `PredictaCard`
- `PredictaPanel`
- `PredictaPill`
- `PredictaBadge`
- `PredictaInput`
- `PredictaSelect`
- `PredictaTabs`
- `PredictaModal`
- `PredictaDrawer`
- `PredictaTable`
- `PredictaEmptyState`
- `PredictaStateBanner`
- `PredictaStickyAction`

Green criteria:

- Every audited route uses the shared primitives for primary interactions.
- All primitives have desktop, tablet, mobile, disabled, loading, focus,
  hover, active, selected, and error-state examples.
- Touch targets are at least 44px where the interaction is tappable.
- Component screenshots are saved for light/dark or available theme states.
- `test:audit1-phase-7b`, `test:audit1-phase-7a`, `test:audit1-phase-7`,
  UI token typecheck, web typecheck, visual proof, and overflow gate pass.
- Phase 7B artifacts are saved under
  `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7b-component-primitive-normalization/`.
- Phase commit exists before Phase 7C starts.

### PREDICTA_AUDIT_1_PHASE_7C_RESPONSIVE_BREAKPOINT_MATRIX_AND_LAYOUT_CONTRACT

Goal:
Replace improvised responsiveness with a full device-class contract.

Must fix:

- 36 media queries with 15 unique breakpoint expressions.
- 110 max-width values and 58 grid-template values.
- Mobile portrait-only testing that misses landscape, tablet, laptop, desktop,
  and ultrawide failure modes.
- Oversized desktop containers, cramped mobile cards, unsafe sticky regions,
  and inconsistent column behavior.

Required route matrix:

- Public home, safety, founder/about, pricing, checkout, login.
- Dashboard home, Kundli, Vedic, KP, Nadi, Numerology, Signature, Reports,
  Life Atlas, family, settings, account.
- Modals, drawers, dropdowns, tabs, tables, empty states, loading states,
  errors, success states.

Required breakpoints:

- 320x568
- 360x740
- 390x844
- 430x932
- 568x320 landscape
- 768x1024
- 834x1194
- 1024x768
- 1280x800
- 1440x900
- 1728x1117
- ultrawide 1920x1080 or wider

Green criteria:

- A responsive matrix script captures screenshots and overflow metrics for all
  required routes and breakpoints.
- No accidental horizontal scroll, clipped text, invisible CTA, edge collision,
  or broken sticky behavior exists.
- Each major layout documents its column/gutter/max-width behavior.
- `test:audit1-phase-7c`, `test:audit1-phase-7b`, `test:audit1-phase-7a`,
  `test:audit1-phase-7`, web typecheck, visual proof, and overflow gate pass.
- Phase 7C artifacts are saved under
  `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7c-responsive-breakpoint-matrix-layout-contract/`.
- Phase commit exists before Phase 7D starts.

### PREDICTA_AUDIT_1_PHASE_7D_MOTION_LAYERING_AND_INTERACTION_STATE_SYSTEM

Goal:
Make motion, layering, feedback, and overlay behavior predictable and premium.

Must fix:

- 61 animation declarations and 21 transition patterns without a motion system.
- Raw z-index values including 10000, 10001, and 10002.
- Random hover/focus/active behavior.
- Overlay layering, scroll lock, focus trap, and escape/cancel inconsistency.

Required motion contract:

- Reveal motion for page/section entry.
- Feedback motion for taps, selections, toggles, and uploads.
- Progress motion for loading/scanning/report preparation.
- Ambient motion only where it does not reduce readability.
- `prefers-reduced-motion` support for every animation.

Green criteria:

- Motion tokens replace arbitrary durations and keyframes.
- Z-index tokens replace raw layering values.
- `test:audit1-phase-7d`, `test:audit1-phase-7c`,
  `test:audit1-phase-7b`, `test:audit1-phase-7a`,
  `test:audit1-phase-7`, web typecheck, visual proof, and overflow gate pass.
- Overlay QA proves modals, drawers, dropdowns, sticky CTAs, chat, signature
  scan, report composer, and payment states layer correctly.
- Keyboard and reduced-motion proof artifacts are saved.
- No forbidden global raw z-index values such as `10000`, `10001`, `10002`,
  `1000`, `1100`, `1200`, `1201`, `1400`, or `110` remain.
- Phase 7D artifacts are saved under
  `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7d-motion-layering-interaction-state-system/`.
- Phase commit exists before Phase 7E starts.

### PREDICTA_AUDIT_1_PHASE_7E_MEDIA_ASSET_AND_CONTRAST_QUALITY_GATE

Goal:
Eliminate broken media, weak contrast, blurry assets, bad crops, and
low-trust visual presentation.

Must fix:

- `/founder-bhaumik-mehta.png` returning HTTP `400`.
- Mixed `next/image`, `img`, CSS background, native `Image`, PDF image, and
  signature-preview handling with no common asset contract.
- Washed-out glass surfaces and translucent text without contrast guarantees.
- Inconsistent logo, watermark, thumbnail, crop, aspect ratio, and alt-text
  behavior.

Green criteria:

- All visible image and media URLs return `2xx` or a controlled fallback.
- Media primitives define aspect ratio, crop, object-fit, loading behavior,
  max dimensions, and alt text.
- Contrast checks pass for primary text, muted text, disabled states, CTAs,
  badges, cards, forms, tables, modals, and report previews.
- `test:audit1-phase-7e`, `test:audit1-phase-7d`,
  `test:audit1-phase-7c`, `test:audit1-phase-7b`,
  `test:audit1-phase-7a`, `test:audit1-phase-7`, web typecheck, visual proof,
  and overflow gate pass.
- Screenshots prove image quality on mobile, tablet, desktop, and PDF previews.
- Phase 7E artifacts are saved under
  `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7e-media-asset-contrast-quality-gate/`.
- Phase commit exists before Phase 7F starts.

### PREDICTA_AUDIT_1_PHASE_7F_CROSS_PLATFORM_VISUAL_PARITY_AND_INTELLIGENCE_UI_PATTERN

Goal:
Make web, native mobile, PDF, reports, and Predicta intelligence feel like one
coherent product while preserving specialist-room boundaries.

Must fix:

- Web, mobile, and PDF feeling like separate products.
- Specialist rooms using different reading rhythms.
- Prediction behavior drifting between teaching, toolkit language, proof-first
  language, and actual guidance.
- Technical evidence appearing before user value in reports and app surfaces.

Required intelligence UI rhythm:

- Prediction first.
- Evidence second.
- Action/guidance third.
- Safety/limits last.

School-specific rule:

- Vedic starts with charts, graha/house evidence, then direct life prediction.
- KP starts with the user question or refined event, verdict, timing, and proof.
- Nadi starts with karmic story, validation, activation, and practice.
- Numerology starts with number identity, cycle, rhythm, and practical guidance.
- Signature starts with confirmed visible traits, reflective guidance, and
  safety boundaries.
- Life Atlas starts with life journey, destiny pattern, current chapter, and
  soul-purpose synthesis.

Green criteria:

- Web and mobile screenshots prove parity for each specialist room.
- Report samples prove the same visual identity and prediction rhythm.
- Predicta chat context can explain what the user sees without mixing schools.
- No school report reads like an internal system document or astrology lesson.
- `test:audit1-phase-7f`, `test:audit1-phase-7e`,
  `test:audit1-phase-7d`, web typecheck, mobile typecheck, PDF typecheck,
  visual proof, UI text overflow, and PDF golden pass.
- Phase 7F artifacts are saved under
  `docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7f-cross-platform-visual-parity-intelligence-pattern/`.
- Phase commit exists before Phase 8 starts.

### PREDICTA_AUDIT_1_PHASE_8_OVERLAY_FORM_AND_ACCESSIBILITY_GATE

Goal:
Make every modal, drawer, dropdown, form, tab, and popover accessible and
predictable.

Must fix:

- Modal focus trap and escape behavior.
- Scroll lock and z-index layering.
- Dropdown arrow spacing and menu alignment.
- Labels, inputs, radio/checkbox alignment.
- Touch targets below 44px.
- Focus/hover/active states.

Green criteria:

- Overlay audit covers report dialog, destructive dialog, language selector,
  signature panels, account/payment overlays, and mobile sheets.
- Keyboard navigation proof exists.
- Touch target audit passes web and native.
- `corepack pnpm test:audit1-phase-8` passes and saves desktop/tablet/mobile
  screenshots plus an overlay/form accessibility manifest.
- Phase commit exists before Phase 9 starts.

### PREDICTA_AUDIT_1_PHASE_9_NATIVE_MOBILE_UI_UX_PARITY_AUDIT_AND_FIX

Goal:
Bring native mobile screens to the same UI/UX standard as web.

Must fix:

- Long stacked native screens.
- ReportScreen action density.
- SettingsScreen density.
- SavedKundlisScreen action stacks.
- Paywall checkout clarity.
- Keyboard/safe-area behavior on login, forms, feedback, and report builder.

Green criteria:

- Native screenshots for iPhone SE, iPhone 15, small Android, tablet, and
  large tablet are saved.
- `corepack pnpm test:audit1-phase-9` passes and records the device manifest.
- Touch targets, safe areas, keyboard avoidance, loading/error/empty states, and
  overflow are verified.
- Web/mobile UX parity exceptions are documented.
- Phase commit exists before Phase 10 starts.

### PREDICTA_AUDIT_1_PHASE_10_FULL_ENTERPRISE_REAUDIT_AND_NO_MAJOR_ISSUE_GATE

Goal:
Rerun Audit 1 after all fixes and prove no Critical or Major UI/UX issues
remain.

Must pass:

- Audit server preflight.
- UI text overflow audit.
- Mobile/tablet visual proof.
- Buyer rejection gate.
- Public greenlight, after clean working tree is restored.
- Native mobile visual/touch audit.
- Manual review of desktop, tablet, mobile, and narrow mobile screenshots.

Green criteria:

- Zero Critical issues.
- Zero Major issues.
- Medium issues have explicit owners or are fixed.
- Screenshot/contact-sheet bundle is committed.
- Final phase commit exists.
