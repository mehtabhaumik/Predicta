# Phase 8 Entitlement Audit

## Verdict

Green only after the gate proves the following contract:

- Free users receive a deterministic preview only.
- Free preview does not spend AI credits.
- Free preview does not use Gemini validator.
- Paid Precision Reading is a separate product.
- Follow-up pack is tied to the same prediction thread and is not unlimited chat.
- Report credits are not consumed for Precision Reading unless a PDF is generated separately.
- Day Pass access spends bounded deep-call allowance.
- Premium access unlocks paid depth through premium entitlement, not free unlimited fallback.
- Family Bank precision credits can cover the paid reading only when a shared precision balance exists.
- Cost telemetry can record feature, model, token counts, plan, and product identity.

## Redlines

- Do not map Precision Reading to `REPORT_SINGLE`, `PREMIUM_PDF`, or normal AI question credits.
- Do not let a Precision Reading purchase silently unlock unlimited chat.
- Do not let free preview call premium model or Gemini validator.
- Do not consume AI credits for deterministic question routing or free readiness preview.
- Do not hide the paid/free distinction from the user.

## Product Contract

`Predicta Precision Reading` is one paid event prediction for one important question. It includes timing window, likely trigger, contradiction scan, action plan, and evidence. It is not a full PDF report and it is not a generic AI chat pack.

`Precision Follow-up Pack` adds three follow-ups tied to the same prediction thread. It does not create new unrelated readings and does not unlock unlimited AI.
