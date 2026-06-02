from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

from .ai_telemetry import estimate_cost_usd

FREE_AI_MODEL = "gpt-5.4-mini"
PREMIUM_AI_MODEL = "gpt-5.5"
GEMINI_FLASH_MODEL = "gemini-2.5-flash"
GEMINI_PRO_MODEL = "gemini-2.5-pro"

FREE_CHAT_MAX_OUTPUT_TOKENS = 420
PREMIUM_CHAT_MAX_OUTPUT_TOKENS = 720

AIEntitlementSource = Literal[
    "free_lifetime_ai_credit",
    "paid_question_pack",
    "family_bank",
    "day_pass",
    "premium_subscription",
    "deterministic_no_ai",
]

AIProductCreditSource = Literal["personal", "family_bank"]

AI_COST_THRESHOLDS_USD = {
    "free_chat_answer": {"alertAt": 0.003, "stopAt": 0.01},
    "paid_question_answer": {"alertAt": 0.02, "stopAt": 0.08},
    "premium_report_draft": {"alertAt": 0.35, "stopAt": 1.25},
    "premium_report_validator": {"alertAt": 0.12, "stopAt": 0.45},
    "batch_qa": {"alertAt": 0.08, "stopAt": 0.35},
}


@dataclass(frozen=True)
class AICostDecision:
    allowed: bool
    reason: str
    severity: Literal["allow", "alert", "stop"] = "allow"


def free_model_allowed(model: str) -> AICostDecision:
    if model == FREE_AI_MODEL:
        return AICostDecision(True, "free-ai-uses-openai-mini")
    return AICostDecision(
        False,
        "free-ai-cannot-use-premium-or-non-free-model",
        "stop",
    )


def gemini_validator_allowed(
    *, user_plan: str, paid_premium_report: bool
) -> AICostDecision:
    if user_plan == "PREMIUM" and paid_premium_report:
        return AICostDecision(True, "paid-premium-report-may-use-gemini-validator")
    return AICostDecision(
        False,
        "gemini-validator-is-for-paid-premium-reports-only",
        "stop",
    )


def evaluate_feature_spend(
    *,
    feature: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
) -> AICostDecision:
    threshold = AI_COST_THRESHOLDS_USD.get(feature)
    if not threshold:
        return AICostDecision(True, "feature-has-no-explicit-threshold")

    estimated = estimate_cost_usd(
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
    )
    if estimated is None:
        return AICostDecision(False, "missing-pricing-blocks-cost-blind-ai", "stop")

    if estimated >= threshold["stopAt"]:
        return AICostDecision(False, f"{feature}-spend-stop-threshold-exceeded", "stop")
    if estimated >= threshold["alertAt"]:
        return AICostDecision(True, f"{feature}-spend-alert-threshold-reached", "alert")
    return AICostDecision(True, f"{feature}-spend-within-budget")


def entitlement_source_for_chat(
    user_plan: str,
    ai_cost_governance: Optional[dict],
) -> AIEntitlementSource:
    raw = (ai_cost_governance or {}).get("entitlementSource")
    allowed = {
        "free_lifetime_ai_credit",
        "paid_question_pack",
        "family_bank",
        "day_pass",
        "premium_subscription",
        "deterministic_no_ai",
    }
    if isinstance(raw, str) and raw in allowed:
        return raw  # type: ignore[return-value]
    return "premium_subscription" if user_plan == "PREMIUM" else "free_lifetime_ai_credit"


def product_credit_source_for_chat(ai_cost_governance: Optional[dict]) -> Optional[str]:
    raw = (ai_cost_governance or {}).get("productCreditSource")
    if raw in {"personal", "family_bank"}:
        return raw
    return None
