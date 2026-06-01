# Predicta Monetization Phase 1 Auth Hard Gate Ledger

Phase: `PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA`

Audit date: 2026-06-02

Verdict: Google sign-in hard gate implemented for the personalized action layer.

## Scope

This phase makes signed-in account identity mandatory before meaningful personalized actions. It does not implement the server-side credit ledger, lifetime AI counter, four-Kundli quota, Razorpay settlement, or paid credit consumption. Those remain later monetization phases.

## Implemented Gates

| Surface | Phase 1 behavior |
|---|---|
| Web AI chat | Chat renders an account-required panel until Firebase auth is ready and a user is signed in. |
| Web AI API | `/api/ask-pridicta` requires a verified Firebase ID token before proxying to the backend. |
| Web birth extraction | `/api/extract-birth-details` requires a verified Firebase ID token before using deterministic or AI extraction. |
| Web Kundli generation | `/api/generate-kundli` requires a verified Firebase ID token, and web generation attaches the current user token. |
| Web Kundli saving | The web Kundli wizard blocks guests before creating/saving a Kundli. |
| Web report download | Download requires a signed-in user and sends the Firebase ID token to `/api/report/pdf`. |
| Web report API | `/api/report/pdf` requires a verified Firebase ID token before rendering a PDF. |
| Web Family Vault | Family Vault, Family Karma Map, and Pair Comparison render account-required panels for unsigned users. |
| Mobile chat | Mobile chat sends unsigned users to sign-in before AI or deterministic personalized chat handling. |
| Mobile Kundli creation | Mobile Kundli creation screen is blocked behind sign-in. |
| Mobile Kundli library | Mobile saved Kundli library is blocked behind sign-in. |
| Mobile reports | Mobile PDF generation blocks unsigned users and sends them to sign-in. |
| Mobile Family Vault | Mobile Family Karma Map is blocked behind sign-in and comparison input is capped to four profiles. |

## Google Sign-In QA

- Google remains the visually primary web and mobile account path.
- Web Google sign-in now attempts popup first and falls back to redirect when the popup is blocked or superseded.
- Web redirect completion is handled through `getRedirectResult`.
- Missing Firebase config still returns a friendly setup error instead of crashing the modal.
- Email/password remains intentionally supported as a secondary audited path, but Google stays first.

## API Security Baseline

The web API layer now verifies Firebase ID token signature, issuer, audience, expiration, and subject using Google's Firebase signing certificates. This is not the Phase 2 entitlement ledger, but it closes the Phase 0 unauthenticated personalized-action gap.

## Known Deferred Work

- Server-side credit balances and atomic consumption are Phase 2 and Phase 3.
- The exact 3 lifetime AI question rule is Phase 3.
- Zero-credit deterministic chat split is Phase 4.
- Four saved Kundlis for free signed-in users is Phase 5.
- Family Bank and paid shared credit wallet are later entitlement phases.
- Razorpay settlement remains Phase 7.

## Verification Evidence

- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm --filter @pridicta/mobile typecheck`
- `corepack pnpm test:monetization-phase-1`
- `corepack pnpm build:web`
- `corepack pnpm test:audit-server-preflight`
- `corepack pnpm test:ui-personal-space`
- Runtime unauthenticated smoke: `/api/ask-pridicta`, `/api/generate-kundli`, and `/api/report/pdf` all returned `401 AUTH_REQUIRED`.

## Green Decision

Phase 1 is green only if the gate confirms no unsigned user path can directly call the protected web APIs and the visible web/mobile personalized surfaces show sign-in requirements before action.
