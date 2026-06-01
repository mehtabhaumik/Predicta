# PREDICTA_MONETIZATION_PHASE_6_PRODUCT_BANK_QUESTION_PACKS_REPORT_PACKS_AND_FAMILY_BANK

## Green Criteria Audit

- Public one-time catalog now exposes `10 AI Questions`, `25 AI Questions`,
  `100 AI Questions`, `Single Report Credit`, and `Report Bundle`.
- Legacy `FIVE_QUESTIONS` and `PREMIUM_PDF` entitlements remain honored for
  existing users, but new checkout paths resolve to the Product Bank catalog.
- Paid AI question credits are non-expiring ledger balances and are consumed
  only after a successful OpenAI/Gemini answer.
- Premium report credits are non-expiring ledger balances and are consumed only
  after a paid PDF buffer is successfully rendered/generated.
- Family Bank balances are explicit on Family Vault and never expose private
  chat/report content.
- Account, chat, report, checkout, and Family Vault surfaces show Product Bank
  balance or Product Bank purchase rules.
- Razorpay-disabled checkout remains honest and does not activate access.

## Remaining Guardrail

Family Bank member linking remains owner-controlled through the ledger contract.
No UI in this phase shares private chat history, generated PDFs, or report
content across family members.
