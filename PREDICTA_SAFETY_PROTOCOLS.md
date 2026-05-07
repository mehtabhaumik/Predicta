# Predicta Safety Protocol Phases

Sources:
- OpenAI Safety Best Practices: https://developers.openai.com/api/docs/guides/safety-best-practices
- OpenAI Moderation Guide: https://developers.openai.com/api/docs/guides/moderation

Core rule: Predicta answers Jyotish questions liberally, including finance astrology, medical astrology, share-market astrology, legal astrology, crime/conflict astrology, behavior astrology, and mental-health astrology. Safety is a safeguard layer, not a refusal layer. Predicta must not replace qualified professionals, give harmful instructions, guarantee outcomes, or use astrology to delay urgent help.

## Phase 1: Runtime Safety Gate

Keyword: `EXECUTE_SAFETY_RUNTIME_GATE`

Strict prompt to Codex:

Implement a backend-first safety gate before any AI response is generated. Use local deterministic safety checks and OpenAI Moderation when an OpenAI key is available. Block self-harm methods/instructions, sexual content involving minors, violent/illicit instructions, and overly long prompt payloads. Do not block self-harm feelings, medical astrology, legal astrology, financial astrology, behavior astrology, crime/conflict astrology, or mental-health astrology solely because of topic. For high-stakes questions, answer from Jyotish norms with a clear professional-help boundary. Add privacy-preserving safety identifiers to OpenAI API calls. Never expose internal safety labels to the user except through calm safety language.

Status: Implemented.

## Phase 2: Safety-Aware Chat UX

Keyword: `EXECUTE_SAFETY_CHAT_UX`

Strict prompt to Codex:

Add visible but gentle safety affordances in chat: report issue, safety boundary near high-stakes answers, and crisis-support wording for self-harm situations. The UI must feel calm, not legalistic. It must work on web and mobile. Predicta must never scare the user, claim certainty, use astrology to delay urgent support, or refuse normal astrology branches just because the topic is serious.

Status: Implemented with chat safety cards, crisis-support replies, high-stakes boundary cards, and issue reporting on web and mobile.

## Phase 3: Adversarial Eval Suite

Keyword: `EXECUTE_SAFETY_RED_TEAM_EVALS`

Strict prompt to Codex:

Create a repeatable red-team eval suite with representative and adversarial prompts. Include prompt injection, language-mixed high-stakes questions, self-harm feelings, self-harm instruction requests, medical/legal/financial certainty requests, fatalistic astrology prompts, KP/Nadi handoff confusion, and child/family-sensitive prompts. The suite must fail if Predicta gives certainty, unsafe instructions, or ignores school boundaries. It must also fail if normal high-stakes astrology topics are unnecessarily blocked.

Status: Implemented with a repeatable backend red-team suite covering prompt injection, mixed-language high-stakes requests, self-harm, unsafe instructions, medical/legal/financial certainty, fatalistic outputs, KP/Nadi boundary confusion, fake Nadi leaf claims, and child/family-sensitive fatalism. The suite now also verifies output rewriting when a provider returns unsafe certainty.

## Phase 4: Human Review And Audit Log

Keyword: `EXECUTE_SAFETY_HITL_AUDIT`

Strict prompt to Codex:

Create a human-review workflow for safety reports, low-confidence outputs, blocked outputs, and high-stakes questions. Store only privacy-minimized metadata: timestamp, hashed safety identifier, safety category, provider, model, route, and review status. Do not store exact birth data or full chat unless explicitly needed and legally approved.

Status: Implemented with privacy-minimized safety reports, automatic audit capture for blocked/high-stakes/rewritten answers, owner-token protected review endpoints, and web/mobile owner review queues. Stored records include timestamp, protected safety identifier hash, safety categories, answer source, route, source surface, report kind, and review status; they do not store exact birth data or full chat text.

## Phase 5: Release Readiness And Rollback

Keyword: `EXECUTE_SAFETY_RELEASE_GOVERNANCE`

Strict prompt to Codex:

Define production safety SLOs, regression thresholds, model/version pinning, rollback steps, and launch criteria. Any model, prompt, Jyotish engine, KP, or Nadi change must pass safety evals before deployment. Public release is blocked if fatalistic, high-stakes, or prompt-injection tests fail.

Status: Implemented with enforceable release readiness checks, safety SLOs, approved model/prompt pins, launch criteria, rollback steps, owner-token protected readiness endpoint, web/mobile admin launch-gate visibility, and `python3 -m backend.astro_api.release_governance` as a local release gate. Public release is blocked when red-team evals fail, model/prompt pins drift without review, or prompt safety contracts lose required KP/Nadi/high-stakes boundaries.
