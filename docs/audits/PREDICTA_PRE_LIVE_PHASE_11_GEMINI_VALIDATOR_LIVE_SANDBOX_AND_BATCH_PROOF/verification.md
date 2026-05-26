# PREDICTA_PRE_LIVE_PHASE_11_GEMINI_VALIDATOR_LIVE_SANDBOX_AND_BATCH_PROOF

## Verdict

GREEN after strict audit.

## Validator Coverage

- `contradiction-fixture` emitted `contradictions`.
- `duplicated-remedies-fixture` emitted `duplicated_remedies`.
- `language-mismatch-fixture` emitted `language_mismatch`.
- `method-mixing-fixture` emitted `method_mixing`.
- `missing-section-fixture` emitted `missing_required_sections`.
- `overclaim-fixture` emitted `unsupported_predictions`.

## Batch Proof

- Runner mode: `mock`.
- Provider: `deterministic`.
- Total jobs: `4`.
- Failed jobs by design: `4`.
- Artifact root: `docs/audits/PREDICTA_PRE_LIVE_PHASE_11_GEMINI_VALIDATOR_LIVE_SANDBOX_AND_BATCH_PROOF/batch`.

## Live Sandbox

- Status: `skipped`.
- Reason: `missing-allow-flag`.
- Raw private data used: `False`.

## Telemetry And Privacy

- Total telemetry events: `7`.
- Gemini validator events: `6`.
- Live sandbox telemetry events: `1`.
- Estimated cost total: `0.0018785`.
- Telemetry stores provider, model, feature, latency, estimated tokens, estimated cost, and fallback/skip reason.
- Telemetry does not store raw private prompts, birth details, or candidate report text.

## Advisory Boundary

- Gemini validation remains advisory. It returns issue codes and suggested fix categories only.
- Deterministic Predicta calculations and report data remain the source of truth.
