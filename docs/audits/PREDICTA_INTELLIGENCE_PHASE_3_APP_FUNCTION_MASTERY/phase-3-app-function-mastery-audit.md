# PREDICTA_INTELLIGENCE_PHASE_3_APP_FUNCTION_MASTERY

## Verdict

Green after strict audit.

Phase 3 upgrades Predicta from text-only deterministic replies to app-function
mastery with structured handoffs. Predicta can now recognize core app operation
requests, answer without provider calls, preserve draft user intent, and expose
route/target metadata for web and mobile follow-up CTAs.

## Implemented

- Added shared `PredictaAppFunctionHandoff` to `PredictaActionReply`.
- Added app-action detection for:
  - create Kundli
  - edit/switch saved Kundli
  - report composer
  - Signature upload/draw readiness
  - pass redemption and AI credit limits
  - account/settings/sign-in
  - support/help/feedback
  - Family Vault assignment and 2-to-4 comparison rules
- Added no-AI deterministic replies for app-operation requests.
- Added handoff routes and target screens:
  - `/dashboard/kundli` -> `Kundli`
  - `/dashboard/saved-kundlis` -> `SavedKundlis`
  - `/dashboard/report` -> `Report`
  - `/dashboard/signature` -> `SignaturePredicta`
  - `/dashboard/redeem-pass` -> `RedeemPassCode`
  - `/dashboard/account` -> `Settings`
  - `/dashboard/family` -> `FamilyKarmaMap`
  - `/feedback` -> `SafetyPromise`
- Added app-action follow-up CTAs in the shared follow-up builder.
- Preserved original user intent in handoff URLs and context.
- Kept deterministic app functions outside provider spend.

## Strict Findings Fixed During Audit

- Kundli creation was not marked as sign-in-recommended even though monetization
  policy treats it as a meaningful account action. Fixed.
- Generic chart routing stole `open saved Kundlis` intent. Saved-Kundli intent
  now wins before generic chart display.
- Family Vault no-Kundli guidance was unreachable because the generic Kundli
  guard ran first. Fixed with a Family Vault pre-guard branch.
- Support/report bug CTA was incorrectly routed to report composer. Support
  intent now wins before report intent.
- Signature handoff copy did not explicitly mention upload/draw readiness.
  Fixed with clearer Signature readiness language.

## Green Criteria Evidence

- Golden app-action transcripts pass.
- Links and handoffs carry:
  - original question
  - route
  - target screen
  - action id
  - sign-in/entitlement/Kundli requirement metadata
- Deterministic app actions do not call OpenAI/Gemini.
- Web/mobile shared follow-up CTA builder carries app-action context.

## Boundary

Mobile suggestion chips currently submit prompts; the shared `targetScreen` and
`href` metadata is now present for navigation wiring. Web already honors `href`
suggestions. This phase locks the intelligence contract; any richer mobile
navigation behavior must consume this same contract instead of creating a second
route system.
