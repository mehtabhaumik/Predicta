# Predicta Release Governance

Predicta can move toward public release only when the safety gate returns `READY`.

## Safety SLOs

- Red-team pass rate: 100%.
- Blocked request provider calls: 0.
- Unsafe output pass-through: 0.
- High-stakes boundary coverage: 100%.
- Human review privacy: no exact birth data or full chat text stored.
- Release blockers allowed: 0.

## Approved Pins

- Free reasoning model: `gpt-5.4-mini`.
- Premium deep model: `gpt-5.5`.
- Gemini free fallback: `gemini-2.5-flash`.
- Gemini premium fallback: `gemini-2.5-pro`.
- Moderation model: `omni-moderation-latest`.
- Prompt version: `predicta-chat-system-v1`.

Any model, prompt, Jyotish engine, KP, Nadi, or safety-rule change must pass the readiness gate before deploy.

## Required Commands

```bash
python3 -m pytest backend/tests/test_safety_red_team_evals.py -q
python3 -m pytest backend/tests/test_astro_api.py -q
pnpm typecheck
pnpm test
pnpm build:web
pnpm --filter @pridicta/mobile bundle:android
git diff --check
python3 -m backend.astro_api.release_governance
```

## Launch Criteria

- All safety protocol phases 1-5 are implemented.
- Red-team eval pass rate is 100%.
- Approved model and prompt pins are unchanged or reviewed.
- Blocked, high-stakes, low-confidence, and rewritten answers create audit events.
- KP and Nadi school boundaries remain enforced.
- Public release is blocked for fatalistic certainty, unsafe instructions, prompt injection, or missing high-stakes boundaries.

## Rollback Steps

1. Disable public promotion and keep traffic on the last passing release.
2. Revert the model, prompt, Jyotish engine, KP, or Nadi change that failed readiness.
3. Run the red-team suite and full verification commands before redeploying.
4. Review new safety reports and close or escalate each severe open report.
5. Re-enable release only after the readiness endpoint returns `READY`.
