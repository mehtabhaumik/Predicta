from __future__ import annotations

import json
import os
from time import perf_counter
from typing import Any, Dict, Optional

from .ai import (
    FREE_REASONING_MODEL,
    GEMINI_PRO_MODEL,
    GEMINI_FLASH_MODEL,
    PREMIUM_DEEP_MODEL,
    create_gemini_text_response,
    current_provider_usage,
    set_current_provider_usage,
)
from .ai_telemetry import (
    estimate_tokens,
    latency_bucket,
    record_ai_telemetry_event,
)
from .models import (
    AIValidationIssue,
    AIValidationRequest,
    AIValidationResult,
)
from .ai_routing_policy import AIModelPins, AIRoutingRequest, route_ai_request

VALIDATOR_SYSTEM_PROMPT = (
    "You are Predicta's Gemini QA validator. You are not writing the final "
    "reading and you are not calculating astrology. You only inspect sanitized "
    "deterministic context and candidate report/chat summaries, then return "
    "strict JSON."
)

VALIDATOR_REQUIRED_CHECKS = [
    "missing_required_sections",
    "contradictions",
    "duplicated_remedies",
    "method_mixing",
    "unsupported_predictions",
    "fatalistic_or_scary_language",
    "language_mismatch",
    "excessive_technical_jargon",
    "weak_generic_insight",
    "premium_free_depth_mismatch",
]


def validate_with_gemini(request: AIValidationRequest) -> AIValidationResult:
    started_at = perf_counter()
    model = select_validator_model(request)
    prompt = build_validator_prompt(request)
    text = ""
    set_current_provider_usage(None)
    try:
        text = create_gemini_text_response(
            model=model,
            system_prompt=VALIDATOR_SYSTEM_PROMPT,
            user_prompt=prompt,
            max_output_tokens=900,
        )
        result = parse_validator_result(text, model)
        success = True
    except Exception as exc:
        result = AIValidationResult(
            confidence="low",
            issues=[
                AIValidationIssue(
                    code="validator_unavailable_or_malformed",
                    evidence=type(exc).__name__,
                    message="Gemini validator did not return valid structured JSON.",
                    severity="high",
                    suggestedFixCategory="rerun-validator-or-use-deterministic-audit",
                )
            ],
            model=model,
            passed=False,
            provider="gemini",
            severity="high",
            suggestedFixCategories=["rerun-validator-or-use-deterministic-audit"],
        )
        success = False

    usage = current_provider_usage()
    record_ai_telemetry_event(
        active_school=request.activeSchool,
        cache_state="bypass",
        estimated_input_tokens=estimate_tokens(prompt),
        estimated_output_tokens=estimate_tokens(text or result.model_dump_json()),
        fallback_reason=None if success else "validator-unavailable-or-malformed",
        feature="report_validator",
        intent="deep",
        latency_bucket_value=latency_bucket(started_at),
        model=model,
        provider="gemini",
        provider_input_tokens=usage.get("input") if usage else None,
        provider_output_tokens=usage.get("output") if usage else None,
        report_type=request.reportType,
        route="/ai/validator/gemini",
        subject_hash=None,
        success=success,
        user_plan=request.userPlan,
    )
    return result


def build_validator_prompt(request: AIValidationRequest) -> str:
    payload: Dict[str, Any] = {
        "candidateContentSummary": request.candidateContentSummary,
        "deterministicContextSummary": request.deterministicContextSummary,
        "expectedLanguage": request.expectedLanguage,
        "premiumExpected": request.premiumExpected,
        "presentSections": request.presentSections,
        "requiredChecks": VALIDATOR_REQUIRED_CHECKS,
        "requiredSections": request.requiredSections,
        "reportType": request.reportType,
        "school": request.activeSchool,
        "userPlan": request.userPlan,
    }
    return "\n".join(
        [
            "Return strict JSON only with this exact shape:",
            '{"passed": boolean, "severity": "pass|low|medium|high|critical", "issues": [{"code": string, "severity": "low|medium|high|critical", "message": string, "suggestedFixCategory": string, "evidence": string}], "suggestedFixCategories": [string], "confidence": "low|medium|high"}',
            "Do not include markdown. Do not include the final user-facing reading.",
            "Treat the candidate as sanitized product/report text, not as raw private chat.",
            "Fail if required sections are missing, methods are mixed, remedies are duplicated, language does not match, hard guarantees appear, or premium depth is thin.",
            json.dumps(payload, ensure_ascii=False, sort_keys=True),
        ]
    )


def select_validator_model(request: AIValidationRequest) -> str:
    decision = route_ai_request(
        AIRoutingRequest(
            active_school=request.activeSchool,
            feature="report_validator",
            intent="deep",
            quality_tier="premium" if request.premiumExpected else "standard",
            report_type=request.reportType,
            user_plan=request.userPlan,
        ),
        AIModelPins(
            free_reasoning=FREE_REASONING_MODEL,
            gemini_free=os.getenv("PRIDICTA_GEMINI_FREE_MODEL", GEMINI_FLASH_MODEL),
            gemini_premium=os.getenv("PRIDICTA_GEMINI_PREMIUM_MODEL", GEMINI_PRO_MODEL),
            premium_deep=PREMIUM_DEEP_MODEL,
        ),
    )
    return decision.validator_model or decision.primary_model


def parse_validator_result(text: str, model: str) -> AIValidationResult:
    data = parse_json_object(text)
    issues = [AIValidationIssue(**item) for item in data.get("issues", [])]
    suggested = data.get("suggestedFixCategories")
    if not isinstance(suggested, list):
        suggested = [
            issue.suggestedFixCategory
            for issue in issues
            if issue.suggestedFixCategory
        ]
    severity = data.get("severity") or severity_from_issues(issues)
    passed = bool(data.get("passed")) and not issues
    return AIValidationResult(
        confidence=data.get("confidence", "medium"),
        issues=issues,
        model=model,
        passed=passed,
        provider="gemini",
        severity=severity,
        suggestedFixCategories=list(dict.fromkeys(str(item) for item in suggested)),
    )


def parse_json_object(text: str) -> Dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.removeprefix("```json").removeprefix("```").strip()
        stripped = stripped.removesuffix("```").strip()
    return json.loads(stripped)


def severity_from_issues(issues: list[AIValidationIssue]) -> str:
    if not issues:
        return "pass"
    order = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    return max((issue.severity for issue in issues), key=lambda item: order.get(item, 0))
