# Predicta Monetization Phase 0 Baseline Ledger

Phase: `PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK`

Audit date: 2026-06-02

Verdict: baseline locked, not implementation-green for monetization. This ledger records current behavior before entitlement changes begin.

## Phase Boundary

This phase is evidence-only. It does not implement Google sign-in hard gates, server-side credits, Kundli quotas, report purchase enforcement, Family Vault changes, or Razorpay wiring. Those changes must start only after this baseline is committed.

## Current Contract Being Locked

- Personalized Predicta actions must become signed-in flows.
- Free signed-in users must receive exactly 3 lifetime Predicta AI questions.
- Free signed-in users must be limited to 4 saved Kundlis total.
- Premium users may generate unlimited Kundlis with abuse protection.
- Family comparisons must accept minimum 2 and maximum 4 Kundlis.
- Zero-credit Predicta chat must still support deterministic actions without AI spend.
- Server-side Firebase UID entitlement state must become the source of truth.
- Local storage, app state, and client-only counters must not remain quota authority.
- Razorpay-disabled checkout must be honest and non-throwing until Razorpay is wired.

## Baseline Surface Matrix

| Surface | Current behavior | Phase 0 classification |
|---|---|---|
| Web auth | Google popup sign-in exists, with email/password fallback. Personalized routes are not hard-gated. | Needs Phase 1 hard gate and popup/redirect QA. |
| Mobile auth | Google sign-in exists through native auth service. Personalized actions can still run through local state flows. | Needs Phase 1 hard gate and mobile auth QA. |
| Web AI budget | `localStorage` daily/free counters in `web-pass-cost-guardrails.ts`. | Not acceptable as authority. |
| Mobile AI budget | Async/local store usage counters and daily reset language. | Not acceptable as authority. |
| Web chat birth intake | Burns `question` budget before birth extraction. | Must be split so deterministic creation costs zero AI credits. |
| Mobile chat deterministic layer | Rule-based action reply is checked before AI quota. | Good direction, but quota remains client-side. |
| Web Kundlis | Guests get 1 local Kundli. Signed-in users are effectively unlimited. | Missing 4 saved Kundli free-user limit. |
| Mobile Kundlis | Guests get 1 local Kundli. Signed-in users are effectively unlimited. | Missing 4 saved Kundli free-user limit. |
| Web reports | Client preview gates premium/signature, but PDF API has no auth/entitlement enforcement. | Server enforcement required. |
| Mobile reports | Local plan/credit checks gate premium and PDF counts. | Server enforcement required. |
| Family Vault | Web family views are usable without sign-in, and Karma Map can exceed 4 profiles. | Needs sign-in and min/max comparison rules. |
| Checkout | Web shows `gateway_disabled` when Razorpay flag is off. Mobile uses disabled provider outside dev mock. | Honest fallback exists, but no real payment settlement yet. |

## Critical Findings

1. Server-side entitlement authority does not exist for AI credits, saved Kundli count, report credits, or Family Vault comparison limits. Current enforcement depends on localStorage, AsyncStorage, local Zustand state, or client-only UI checks.

2. Personalized generation is not sign-in hard-gated. Web APIs such as `/api/ask-pridicta`, `/api/generate-kundli`, and `/api/report/pdf` can be called without Firebase UID verification.

3. Free AI quota is not the required 3 lifetime questions. Web has a local daily model with 4 total question actions plus a deep-reading allowance, while shared/mobile config uses 3 questions per day.

4. Web chat can spend AI budget before deterministic birth-detail extraction and Kundli creation. This violates the zero-credit mode rule and risks charging users for actions Predicta can perform without AI.

5. Report entitlement enforcement is mostly cosmetic on web. `WebDossierPreview` blocks some flows in the UI, but `/api/report/pdf` does not enforce signed-in user, report credit, premium state, or Firebase UID ownership.

6. Kundli quotas are not the intended product model. Free signed-in users are not limited to 4 saved Kundlis, and guests can still create local Kundli records.

## Major Findings

1. Family comparison behavior is not aligned with the new contract. Pair comparison is exactly two, while Family Karma Map can select more than four profiles and does not enforce sign-in.

2. Product-bank behavior exists partially through one-time entitlements, but it is not a server-side shared credit ledger and does not support Family Bank semantics.

3. Mobile purchase state can be granted locally in dev/mock flows and synced only when a user id exists. Future paid entitlements must be server-confirmed before premium access is trusted.

4. Google sign-in is primary but web uses popup-only flow. There is no redirect fallback for popup blockers, embedded browser restrictions, or strict browser privacy modes.

5. Entitlement reads can fail closed to free state without surfacing an operational health issue. That is safe from overgranting but risky for paid-user support and launch diagnostics.

6. User-facing usage copy still describes daily free guidance resets, which conflicts with the planned lifetime starter credits.

## Medium Findings

1. Checkout is honest when Razorpay is disabled, but it is still a support-handoff/payment-intent placeholder rather than an end-to-end payment flow.

2. Premium "unlimited Kundlis" has no visible abuse-protection contract yet. Rate limits and cooldown policy need server implementation before launch.

3. AI provider telemetry exists elsewhere in the app, but monetization cost accounting is not tied to credit consumption or per-feature budget enforcement.

4. Guest pass and local redeemed-pass concepts remain useful for demos, but they must not become authority for paid products, lifetime AI credits, or report credits.

5. Report credits are not consistently modeled per school. Generic PDF credits and Jaimini report credits exist, but the new marketplace needs explicit school/report-pack mapping.

## Minor Findings

1. Some internal identifiers still use legacy `pridicta` spelling in storage keys. This is not user-facing but makes audits harder.

2. Jaimini credit compatibility still recognizes legacy Nadi report identifiers. This should be removed only after migration safety is confirmed.

3. Auth copy implies saved continuity, but some web Kundli storage is still browser-local until explicit account sync is used.

4. Development billing/mock behavior is helpful for QA, but production documentation must clearly state it is not live Razorpay settlement.

## Client-Side Quota Authority Ledger

| File | Current authority problem |
|---|---|
| `apps/web/lib/web-pass-cost-guardrails.ts` | Stores free and pass usage in localStorage. |
| `apps/web/lib/web-kundli-storage.ts` | Stores Kundli library and guest limits in localStorage. |
| `apps/mobile/src/store/useAppStore.ts` | Uses local store counters for questions, PDF generation, and paid credits. |
| `apps/mobile/src/services/subscription/entitlementService.ts` | Persists monetization state in AsyncStorage. |
| `packages/monetization/src/entitlementService.ts` | Calculates entitlements from passed client state. |
| `packages/access/src/accessResolver.ts` | Resolves access from local monetization, guest pass, and whitelist state. |

## Deterministic Chat Blocked By AI Budget

| Flow | Current evidence | Required future behavior |
|---|---|---|
| Web birth-detail extraction from chat | `handleBirthIntake()` calls `consumeWebAiBudget('question')` before `extractBirthDetailsFromWeb(text)`. | Try deterministic/rule extraction and Kundli creation first; consume AI only for model-needed reasoning. |
| Web open-ended chat | `askWithProof()` consumes web AI budget before API call. | Correct for true AI answers, but must be server-led and lifetime-credit aware. |
| Mobile deterministic actions | `buildPredictaActionReply()` runs before quota checks. | Preserve this as the zero-credit model, then move quota authority server-side. |

## AI Provider Call Path Ledger

| Path | Current behavior |
|---|---|
| `apps/web/app/api/ask-pridicta/route.ts` | Proxies to backend without Firebase UID entitlement verification. |
| `apps/web/app/api/generate-kundli/route.ts` | Proxies deterministic Kundli generation without signed-in quota enforcement. |
| `apps/web/app/api/report/pdf/route.ts` | Generates PDFs without report entitlement enforcement, except signature readiness payload check. |
| `apps/web/lib/pridicta-ai.ts` | Web client posts chat, birth extraction, and Kundli payloads without a server credit ledger. |
| `apps/mobile/src/screens/ChatScreen.tsx` | Uses deterministic action reply before AI, then local quota/credit checks for AI requests. |

## Report Entitlement Baseline

- Free reports can still be produced from client paths without server-side signed-in enforcement.
- Premium report gating is mostly UI-side on web and local-state-side on mobile.
- Signature report download is blocked more strictly than other report types, but the rule is payload readiness, not a full entitlement contract.
- Future implementation must enforce report type, school, plan, credit, Firebase UID, and paid entitlement server-side before PDF generation.

## Family Vault Baseline

- Family pages can operate from local saved Kundli profiles without requiring Google sign-in.
- Pair comparison is limited to two people by UI shape.
- Karma Map selection can exceed the future four-person maximum.
- There is no shared Family Bank credit model yet.

## Razorpay-Disabled Checkout Baseline

- Web checkout reads `NEXT_PUBLIC_PREDICTA_RAZORPAY_ENABLED`.
- When disabled, web records a `gateway_disabled` intent and guides users to support instead of pretending payment succeeded.
- Mobile production billing uses a disabled provider unless native billing is wired.
- This is safe as a placeholder, but not a complete purchase workflow.

## No Entitlement Implementation Started

Phase 0 intentionally makes no runtime entitlement changes. The next phase must use this ledger as the locked baseline and then begin with auth hard-gating.

## Phase 0 Green Evidence Required

- This ledger is committed under `docs/audits/`.
- A repeatable Phase 0 gate verifies the ledger and the current source evidence.
- Working tree is clean after the audit commit.
- No entitlement implementation is included in the Phase 0 commit.
