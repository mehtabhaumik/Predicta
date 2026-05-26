from __future__ import annotations

import json
from time import perf_counter
from typing import Any, Dict, Iterable, Optional

from .ai import (
    FREE_REASONING_MODEL,
    GEMINI_FLASH_MODEL,
    GEMINI_PRO_MODEL,
    PREMIUM_DEEP_MODEL,
    create_openai_text_response,
    current_provider_usage,
    set_current_provider_usage,
)
from .ai_routing_policy import AIModelPins, AIRoutingRequest, route_ai_request
from .ai_telemetry import (
    estimate_tokens,
    hash_ai_subject,
    latency_bucket,
    record_ai_telemetry_event,
)
from .ai_validator import validate_with_gemini
from .models import (
    AIValidationRequest,
    AIValidationResult,
    PremiumReportPipelineAudit,
    PremiumReportPipelineRequest,
    PremiumReportPipelineResult,
    ReportQAPolicy,
)

REPORT_QA_POLICIES: Dict[str, ReportQAPolicy] = {
    "vedic": ReportQAPolicy(),
    "kp": ReportQAPolicy(),
    "nadi": ReportQAPolicy(),
    "numerology": ReportQAPolicy(),
    "signature": ReportQAPolicy(),
    "life_atlas": ReportQAPolicy(
        validatorRequired=True,
        validatorUnavailableBehavior="block",
    ),
}

PREMIUM_REPORT_WRITER_SYSTEM_PROMPT = (
    "You are Predicta's premium report writer. Use only deterministic Predicta "
    "data supplied in the prompt. Do not calculate astrology, invent missing "
    "data, mix schools, expose internal proof prompts, or make guaranteed "
    "predictions. Write polished, direct, user-facing report text."
)

PREMIUM_REPORT_FINALIZER_SYSTEM_PROMPT = (
    "You are Predicta's premium report finalizer. Revise the draft using only "
    "the deterministic context and validator issues. Fix missing sections, "
    "method mixing, repetition, language mismatch, weak generic insight, and "
    "overclaiming. Return final user-facing report text only."
)


def compose_premium_report_pipeline(
    request: PremiumReportPipelineRequest,
) -> PremiumReportPipelineResult:
    policy = policy_for_report(request)
    gate_passed = deterministic_artifact_gate_passed(request)

    if request.userPlan != "PREMIUM":
        return PremiumReportPipelineResult(
            artifactMetadata=artifact_metadata(
                request,
                gate_passed=gate_passed,
                pipeline_applied=False,
                validation=None,
            ),
            audit=PremiumReportPipelineAudit(
                deterministicArtifactGatePassed=gate_passed,
                pipelineApplied=False,
                validatorInvoked=False,
                finalizerInvoked=False,
                policy=policy,
            ),
            content=deterministic_free_report_content(request),
            validation=None,
        )

    if not gate_passed:
        return PremiumReportPipelineResult(
            artifactMetadata=artifact_metadata(
                request,
                gate_passed=False,
                pipeline_applied=False,
                validation=None,
            ),
            audit=PremiumReportPipelineAudit(
                blocked=True,
                deterministicArtifactGatePassed=False,
                pipelineApplied=False,
                validatorInvoked=False,
                finalizerInvoked=False,
                policy=policy,
            ),
            content="Premium report generation blocked because deterministic report data is incomplete.",
            validation=None,
        )

    premium_model = select_premium_report_model(request)
    draft = run_openai_report_stage(
        active_school=request.activeSchool,
        feature="premium_report_draft",
        model=premium_model,
        prompt=build_premium_draft_prompt(request),
        report_type=request.reportType,
        route="/ai/report/premium/draft",
        subject_key=request.subjectKey,
        system_prompt=PREMIUM_REPORT_WRITER_SYSTEM_PROMPT,
    )

    validation = validate_with_gemini(
        AIValidationRequest(
            activeSchool=request.activeSchool,
            candidateContentSummary=summarize_content(draft["content"]),
            deterministicContextSummary=request.deterministicContextSummary,
            expectedLanguage=request.expectedLanguage,
            premiumExpected=True,
            presentSections=request.presentSections,
            requiredSections=request.requiredSections,
            reportType=request.reportType,
            userPlan=request.userPlan,
        )
    )

    validator_unavailable = validation_is_unavailable(validation)
    if validator_unavailable and policy.validatorUnavailableBehavior == "block":
        return PremiumReportPipelineResult(
            artifactMetadata=artifact_metadata(
                request,
                gate_passed=True,
                pipeline_applied=True,
                validation=validation,
            ),
            audit=pipeline_audit(
                draft=draft,
                finalizer=None,
                gate_passed=True,
                policy=policy,
                validation=validation,
                validator_unavailable=True,
                blocked=True,
            ),
            content="Premium report generation blocked because the configured validator is unavailable.",
            validation=validation,
        )

    finalizer: Optional[Dict[str, Any]] = None
    final_content = draft["content"]
    if validation.issues and not validator_unavailable:
        finalizer = run_openai_report_stage(
            active_school=request.activeSchool,
            feature="premium_report_finalizer",
            model=premium_model,
            prompt=build_premium_finalizer_prompt(request, draft["content"], validation),
            report_type=request.reportType,
            route="/ai/report/premium/finalize",
            subject_key=request.subjectKey,
            system_prompt=PREMIUM_REPORT_FINALIZER_SYSTEM_PROMPT,
        )
        final_content = finalizer["content"]

    return PremiumReportPipelineResult(
        artifactMetadata=artifact_metadata(
            request,
            gate_passed=True,
            pipeline_applied=True,
            validation=validation,
        ),
        audit=pipeline_audit(
            draft=draft,
            finalizer=finalizer,
            gate_passed=True,
            policy=policy,
            validation=validation,
            validator_unavailable=validator_unavailable,
        ),
        content=final_content,
        validation=validation,
    )


def policy_for_report(request: PremiumReportPipelineRequest) -> ReportQAPolicy:
    if request.qaPolicy:
        return request.qaPolicy
    return REPORT_QA_POLICIES.get(request.reportType.lower(), ReportQAPolicy())


def select_premium_report_model(request: PremiumReportPipelineRequest) -> str:
    decision = route_ai_request(
        AIRoutingRequest(
            active_school=request.activeSchool,
            feature="report_generation",
            intent="deep",
            quality_tier="premium",
            report_type=request.reportType,
            user_plan=request.userPlan,
        ),
        AIModelPins(
            free_reasoning=FREE_REASONING_MODEL,
            gemini_free=GEMINI_FLASH_MODEL,
            gemini_premium=GEMINI_PRO_MODEL,
            premium_deep=PREMIUM_DEEP_MODEL,
        ),
    )
    return decision.primary_model


def deterministic_artifact_gate_passed(request: PremiumReportPipelineRequest) -> bool:
    missing_sections = sorted(set(request.requiredSections) - set(request.presentSections))
    if missing_sections:
        return False
    if request.reportType.lower() == "signature" and not request.confirmedSignatureTraitsOnly:
        return False
    return True


def run_openai_report_stage(
    *,
    active_school: str,
    feature: str,
    model: str,
    prompt: str,
    report_type: str,
    route: str,
    subject_key: Optional[str],
    system_prompt: str,
) -> Dict[str, Any]:
    started_at = perf_counter()
    set_current_provider_usage(None)
    success = False
    text = ""
    try:
        text = create_openai_text_response(
            max_output_tokens=2600,
            model=model,
            reasoning_effort="medium",
            safety_identifier=subject_key,
            system_prompt=system_prompt,
            user_prompt=prompt,
        )
        success = True
        return {"content": text, "model": model, "provider": "openai"}
    finally:
        usage = current_provider_usage()
        record_ai_telemetry_event(
            active_school=active_school,
            cache_state="bypass",
            estimated_input_tokens=estimate_tokens(system_prompt, prompt),
            estimated_output_tokens=estimate_tokens(text),
            fallback_reason=None if success else "openai-report-stage-failed",
            feature=feature,
            intent="deep",
            latency_bucket_value=latency_bucket(started_at),
            model=model,
            provider="openai",
            provider_input_tokens=usage.get("input") if usage else None,
            provider_output_tokens=usage.get("output") if usage else None,
            report_type=report_type,
            route=route,
            subject_hash=hash_ai_subject([subject_key or "", report_type, feature]),
            success=success,
            user_plan="PREMIUM",
        )


def build_premium_draft_prompt(request: PremiumReportPipelineRequest) -> str:
    payload = sanitized_report_payload(request)
    return "\n".join(
        [
            "Write the premium report draft from deterministic data only.",
            "Required sections must appear in the final answer.",
            "For Signature reports, use confirmed visible traits only.",
            json.dumps(payload, ensure_ascii=False, sort_keys=True),
        ]
    )


def build_premium_finalizer_prompt(
    request: PremiumReportPipelineRequest,
    draft: str,
    validation: AIValidationResult,
) -> str:
    payload = {
        "draftReportText": draft,
        "issueSummary": [
            {
                "code": issue.code,
                "message": issue.message,
                "severity": issue.severity,
                "suggestedFixCategory": issue.suggestedFixCategory,
            }
            for issue in validation.issues
        ],
        "report": sanitized_report_payload(request),
    }
    return "\n".join(
        [
            "Revise the draft so every validator issue is fixed.",
            "Return final report text only.",
            json.dumps(payload, ensure_ascii=False, sort_keys=True),
        ]
    )


def sanitized_report_payload(request: PremiumReportPipelineRequest) -> Dict[str, Any]:
    return {
        "activeSchool": request.activeSchool,
        "confirmedSignatureTraitsOnly": request.confirmedSignatureTraitsOnly,
        "deterministicContextSummary": request.deterministicContextSummary,
        "deterministicReportData": request.deterministicReportData,
        "expectedLanguage": request.expectedLanguage,
        "presentSections": request.presentSections,
        "reportTitle": request.reportTitle,
        "reportType": request.reportType,
        "requiredSections": request.requiredSections,
        "userPlan": request.userPlan,
    }


def deterministic_free_report_content(request: PremiumReportPipelineRequest) -> str:
    content = request.deterministicReportData.get("content")
    if isinstance(content, str) and content.strip():
        return content.strip()
    if request.deterministicContextSummary.strip():
        return request.deterministicContextSummary.strip()
    return f"{request.reportTitle} is ready from deterministic Predicta data."


def validation_is_unavailable(validation: AIValidationResult) -> bool:
    return any(issue.code == "validator_unavailable_or_malformed" for issue in validation.issues)


def summarize_content(content: str, limit: int = 6000) -> str:
    compact = " ".join(content.split())
    if len(compact) <= limit:
        return compact
    return f"{compact[:limit].rstrip()}..."


def pipeline_audit(
    *,
    draft: Dict[str, Any],
    finalizer: Optional[Dict[str, Any]],
    gate_passed: bool,
    policy: ReportQAPolicy,
    validation: AIValidationResult,
    validator_unavailable: bool,
    blocked: bool = False,
) -> PremiumReportPipelineAudit:
    return PremiumReportPipelineAudit(
        blocked=blocked,
        deterministicArtifactGatePassed=gate_passed,
        draftModel=draft["model"],
        draftProvider=draft["provider"],
        finalizerInvoked=finalizer is not None,
        finalizerModel=finalizer["model"] if finalizer else None,
        finalizerProvider=finalizer["provider"] if finalizer else None,
        pipelineApplied=True,
        policy=policy,
        validatorInvoked=True,
        validatorIssueCodes=[issue.code for issue in validation.issues],
        validatorModel=validation.model,
        validatorProvider=validation.provider,
        validatorUnavailable=validator_unavailable,
    )


def artifact_metadata(
    request: PremiumReportPipelineRequest,
    *,
    gate_passed: bool,
    pipeline_applied: bool,
    validation: Optional[AIValidationResult],
) -> Dict[str, Any]:
    issue_codes: Iterable[str] = []
    validator_model: Optional[str] = None
    validator_provider: Optional[str] = None
    validator_passed: Optional[bool] = None
    if validation:
        issue_codes = [issue.code for issue in validation.issues]
        validator_model = validation.model
        validator_provider = validation.provider
        validator_passed = validation.passed

    return {
        "deterministicArtifactGatePassed": gate_passed,
        "expectedLanguage": request.expectedLanguage,
        "pipelineApplied": pipeline_applied,
        "presentSectionCount": len(request.presentSections),
        "reportType": request.reportType,
        "requiredSectionCount": len(request.requiredSections),
        "subjectHash": hash_ai_subject([request.subjectKey or "", request.reportType]),
        "userPlan": request.userPlan,
        "validatorIssueCodes": list(issue_codes),
        "validatorModel": validator_model,
        "validatorPassed": validator_passed,
        "validatorProvider": validator_provider,
    }


def supported_premium_pipeline_report_types() -> tuple[str, ...]:
    return tuple(REPORT_QA_POLICIES.keys())
