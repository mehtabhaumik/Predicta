# Phase 10 Outcome Ledger Audit

## Verdict

Green only if the prediction tracker creates a trust loop without creating
privacy leakage or fake accuracy claims.

## Strict Contract

- Users can save prediction cards from the Event Oracle surface.
- Each saved card contains original question, answer, timing window, trigger,
  confidence, and evidence source labels.
- Outcome states are exactly: happened, partially happened, did not happen,
  pending, and too early to judge.
- Follow-up reminders are derived from the timing window, not invented.
- Prediction cards are private by default.
- Family Vault visibility only happens after explicit sharing.
- Admin analytics are grouped by event category, confidence band, and outcome.
- Pending and too-early cards are excluded from match-rate language.

## Redlines

- Do not expose private prediction outcomes to Family Vault.
- Do not claim global accuracy from mixed categories.
- Do not count pending or too-early outcomes as wins or losses.
- Do not store a prediction without its evidence source labels.
- Do not hide the original question that the user asked.
