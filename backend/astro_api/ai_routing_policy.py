from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Dict, Literal, Optional

from .ai_cost_governance import gemini_validator_allowed

AIProviderName = Literal["openai", "gemini", "deterministic", "cache"]
AIRoutingFeature = Literal[
    "chat",
    "birth_extraction",
    "precision_reading",
    "report_generation",
    "report_validator",
    "batch_qa",
]
AIEntitlementKind = Literal["free", "premium", "day_pass", "guest"]
AILatencySensitivity = Literal["interactive", "standard", "batch"]
AIQualityTier = Literal["free", "standard", "premium"]
AIProviderAvailability = Literal["primary_available", "primary_unavailable"]
AISafetyRisk = Literal["normal", "elevated", "blocked"]

APPROVED_AI_PROVIDERS: tuple[AIProviderName, ...] = (
    "openai",
    "gemini",
    "deterministic",
    "cache",
)


@dataclass(frozen=True)
class AIModelPins:
    free_reasoning: str
    premium_deep: str
    gemini_free: str
    gemini_premium: str


@dataclass(frozen=True)
class AIRoutingRequest:
    feature: AIRoutingFeature
    user_plan: Optional[str]
    active_school: str
    intent: Optional[str]
    report_type: Optional[str] = None
    latency_sensitivity: AILatencySensitivity = "interactive"
    quality_tier: AIQualityTier = "standard"
    provider_availability: AIProviderAvailability = "primary_available"
    safety_risk: AISafetyRisk = "normal"
    entitlement_kind: Optional[AIEntitlementKind] = None


@dataclass(frozen=True)
class AIRoutingDecision:
    primary_provider: AIProviderName
    primary_model: str
    fallback_provider: AIProviderName
    fallback_model: str
    validator_provider: Optional[AIProviderName]
    validator_model: Optional[str]
    multi_model_pipeline_allowed: bool
    validator_eligible: bool
    cost_guardrail: str
    approved_provider_order: tuple[AIProviderName, ...]
    policy_reason: str


def route_ai_request(request: AIRoutingRequest, pins: AIModelPins) -> AIRoutingDecision:
    if request.safety_risk == "blocked":
        return AIRoutingDecision(
            approved_provider_order=APPROVED_AI_PROVIDERS,
            cost_guardrail=cost_guardrail_for(request),
            fallback_model="predicta-safety-protocol-v1",
            fallback_provider="deterministic",
            multi_model_pipeline_allowed=False,
            policy_reason="blocked-safety-uses-deterministic-path",
            primary_model="predicta-safety-protocol-v1",
            primary_provider="deterministic",
            validator_eligible=False,
            validator_model=None,
            validator_provider=None,
        )

    if request.feature == "report_validator":
        premium_validator = request.user_plan == "PREMIUM" and request.quality_tier == "premium"
        validator_gate = gemini_validator_allowed(
            paid_premium_report=premium_validator,
            user_plan=request.user_plan or "FREE",
        )
        if not validator_gate.allowed:
            policy_reason = (
                validator_gate.reason
                or "gemini-validator-is-for-paid-premium-reports-only"
            )
            return AIRoutingDecision(
                approved_provider_order=APPROVED_AI_PROVIDERS,
                cost_guardrail=cost_guardrail_for(request),
                fallback_model="deterministic-validator-unavailable",
                fallback_provider="deterministic",
                multi_model_pipeline_allowed=False,
                policy_reason=policy_reason,
                primary_model="deterministic-validator-not-entitled",
                primary_provider="deterministic",
                validator_eligible=False,
                validator_model=None,
                validator_provider=None,
            )

        return AIRoutingDecision(
            approved_provider_order=APPROVED_AI_PROVIDERS,
            cost_guardrail=cost_guardrail_for(request),
            fallback_model="deterministic-validator-unavailable",
            fallback_provider="deterministic",
            multi_model_pipeline_allowed=premium_validator,
            policy_reason="premium-report-validator-uses-gemini-pro",
            primary_model=pins.gemini_premium,
            primary_provider="gemini",
            validator_eligible=premium_validator,
            validator_model=pins.gemini_premium,
            validator_provider="gemini",
        )

    if request.feature == "batch_qa":
        return AIRoutingDecision(
            approved_provider_order=APPROVED_AI_PROVIDERS,
            cost_guardrail=cost_guardrail_for(request),
            fallback_model="deterministic-batch-qa-local-runner",
            fallback_provider="deterministic",
            multi_model_pipeline_allowed=False,
            policy_reason="non-real-time-batch-qa-uses-gemini-flash-or-local-mock",
            primary_model=pins.gemini_free,
            primary_provider="gemini",
            validator_eligible=False,
            validator_model=None,
            validator_provider=None,
        )

    premium_deep = is_premium_deep(request)
    primary_model = pins.premium_deep if premium_deep else pins.free_reasoning
    fallback_model = pins.gemini_premium if premium_deep else pins.gemini_free
    validator_eligible = is_validator_eligible(request)

    return AIRoutingDecision(
        approved_provider_order=APPROVED_AI_PROVIDERS,
        cost_guardrail=cost_guardrail_for(request),
        fallback_model=fallback_model,
        fallback_provider="gemini",
        multi_model_pipeline_allowed=validator_eligible,
        policy_reason=policy_reason_for(request, premium_deep, validator_eligible),
        primary_model=primary_model,
        primary_provider="openai",
        validator_eligible=validator_eligible,
        validator_model=pins.gemini_premium if validator_eligible else None,
        validator_provider="gemini" if validator_eligible else None,
    )


def is_premium_deep(request: AIRoutingRequest) -> bool:
    return request.intent == "deep" and (
        request.user_plan == "PREMIUM" or request.feature == "precision_reading"
    )


def is_validator_eligible(request: AIRoutingRequest) -> bool:
    return (
        request.feature == "report_generation"
        and request.user_plan == "PREMIUM"
        and request.quality_tier == "premium"
    )


def cost_guardrail_for(request: AIRoutingRequest) -> str:
    entitlement = request.entitlement_kind or (
        "premium" if request.user_plan == "PREMIUM" else "free"
    )
    if entitlement == "premium":
        return "premium-budget: deep OpenAI allowed; Gemini Pro only for premium fallback or validator QA"
    if entitlement == "day_pass":
        return "day-pass-budget: bounded deep calls and premium PDFs; no unmetered multi-model loop"
    if entitlement == "guest":
        return "guest-budget: use granted guest totals; avoid premium pipeline unless entitlement allows it"
    return "free-budget: deterministic first, OpenAI mini only, no premium multi-model pipeline"


def policy_reason_for(
    request: AIRoutingRequest,
    premium_deep: bool,
    validator_eligible: bool,
) -> str:
    if validator_eligible:
        return "premium-report-generation-is-eligible-for-gemini-validator"
    if request.feature == "report_generation":
        return "free-or-standard-report-generation-skips-premium-multi-model-pipeline"
    if request.feature == "precision_reading":
        return "paid-precision-reading-uses-entitled-premium-depth-without-report-validator"
    if premium_deep:
        return "premium-deep-intent-uses-openai-premium-with-gemini-pro-fallback"
    return "default-openai-mini-primary-with-gemini-flash-fallback"


def select_primary_openai_model(intent: str, user_plan: str, pins: AIModelPins) -> str:
    return route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="chat",
            intent=intent,
            quality_tier="premium" if user_plan == "PREMIUM" else "standard",
            user_plan=user_plan,
        ),
        pins,
    ).primary_model


def select_gemini_fallback_model(intent: str, user_plan: str, pins: AIModelPins) -> str:
    return route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="chat",
            intent=intent,
            provider_availability="primary_unavailable",
            quality_tier="premium" if user_plan == "PREMIUM" else "standard",
            user_plan=user_plan,
        ),
        pins,
    ).fallback_model


def configured_ai_providers() -> tuple[str, ...]:
    raw = os.getenv("PREDICTA_ALLOWED_AI_PROVIDERS", "")
    if not raw.strip():
        return APPROVED_AI_PROVIDERS
    return tuple(provider.strip().lower() for provider in raw.split(",") if provider.strip())


def evaluate_approved_provider_gate() -> list[str]:
    active = configured_ai_providers()
    approved = set(APPROVED_AI_PROVIDERS)
    failures = [
        f"provider active={provider} is not approved"
        for provider in active
        if provider not in approved
    ]
    if "claude" in active or "anthropic" in active:
        failures.append("Claude/Anthropic is not approved for Predicta runtime")
    return list(dict.fromkeys(failures))


def routing_policy_snapshot(pins: AIModelPins) -> Dict[str, object]:
    return {
        "approvedProviderOrder": list(APPROVED_AI_PROVIDERS),
        "freeChatPrimary": route_ai_request(
            AIRoutingRequest(
                active_school="PARASHARI",
                feature="chat",
                intent="simple",
                user_plan="FREE",
            ),
            pins,
        ).__dict__,
        "premiumDeepPrimary": route_ai_request(
            AIRoutingRequest(
                active_school="PARASHARI",
                feature="chat",
                intent="deep",
                quality_tier="premium",
                user_plan="PREMIUM",
            ),
            pins,
        ).__dict__,
        "precisionReading": route_ai_request(
            AIRoutingRequest(
                active_school="PRIMARY_PREDICTA",
                entitlement_kind="premium",
                feature="precision_reading",
                intent="deep",
                quality_tier="premium",
                user_plan="PREMIUM",
            ),
            pins,
        ).__dict__,
        "freeReport": route_ai_request(
            AIRoutingRequest(
                active_school="PARASHARI",
                feature="report_generation",
                intent="deep",
                quality_tier="free",
                report_type="vedic",
                user_plan="FREE",
            ),
            pins,
        ).__dict__,
        "premiumReport": route_ai_request(
            AIRoutingRequest(
                active_school="PARASHARI",
                feature="report_generation",
                intent="deep",
                quality_tier="premium",
                report_type="vedic",
                user_plan="PREMIUM",
            ),
            pins,
        ).__dict__,
    }
