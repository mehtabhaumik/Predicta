from __future__ import annotations

import json
import re
from pathlib import Path
from time import perf_counter
from typing import Dict, Iterable, List, Optional
from uuid import uuid4

from .ai import (
    FREE_REASONING_MODEL,
    GEMINI_FLASH_MODEL,
    GEMINI_PRO_MODEL,
    PREMIUM_DEEP_MODEL,
    create_gemini_text_response,
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
from .ai_prompt_efficiency import prompt_cache_key
from .ai_cost_governance import evaluate_feature_spend
from .ai_validator import parse_json_object, severity_from_issues
from .models import (
    AIBatchQACheckType,
    AIBatchQAIssue,
    AIBatchQAJob,
    AIBatchQAResult,
    AIBatchQARunManifest,
    AIBatchQARunnerMode,
)

DEVANAGARI = re.compile(r"[\u0900-\u097F]")
GUJARATI = re.compile(r"[\u0A80-\u0AFF]")
LATIN_WORD = re.compile(r"[A-Za-z][A-Za-z0-9+.-]*")

BATCH_QA_SYSTEM_PROMPT = (
    "You are Predicta's non-real-time report QA worker. Inspect sanitized text "
    "summaries only. Return strict JSON with issues; do not rewrite the report "
    "and do not include raw private content."
)


def run_batch_qa_jobs(
    jobs: Iterable[AIBatchQAJob],
    *,
    artifact_root: str | Path,
    runner_mode: AIBatchQARunnerMode = "mock",
) -> AIBatchQARunManifest:
    root = Path(artifact_root)
    root.mkdir(parents=True, exist_ok=True)
    model = select_batch_qa_model()
    provider = "gemini" if runner_mode == "gemini_sync" else "deterministic"
    results: List[AIBatchQAResult] = []

    for job in jobs:
        result = run_batch_qa_job(job, runner_mode=runner_mode, model=model)
        artifact_path = root / f"{job.id}.json"
        result = result.model_copy(update={"auditArtifactPath": str(artifact_path)})
        artifact_path.write_text(
            json.dumps(sanitized_result_payload(result), indent=2, sort_keys=True)
        )
        results.append(result)

    manifest = AIBatchQARunManifest(
        artifactRoot=str(root),
        failedJobs=sum(1 for result in results if not result.passed),
        model=model,
        passedJobs=sum(1 for result in results if result.passed),
        provider=provider,
        results=results,
        runId=f"batch-qa-{uuid4().hex[:16]}",
        runnerMode=runner_mode,
        totalJobs=len(results),
    )
    (root / "batch-qa-manifest.json").write_text(
        json.dumps(manifest.model_dump(mode="json"), indent=2, sort_keys=True)
    )
    return manifest


def run_batch_qa_job(
    job: AIBatchQAJob,
    *,
    runner_mode: AIBatchQARunnerMode,
    model: Optional[str] = None,
) -> AIBatchQAResult:
    selected_model = model or select_batch_qa_model()
    if runner_mode == "gemini_sync":
        return run_gemini_sync_batch_qa_job(job, model=selected_model)
    return run_mock_batch_qa_job(job, model=selected_model)


def run_mock_batch_qa_job(job: AIBatchQAJob, *, model: str) -> AIBatchQAResult:
    issues = deterministic_issues_for_job(job)
    return AIBatchQAResult(
        blockUserFacingDownload=job.blockUserFacingDownload,
        checkType=job.checkType,
        contentHash=hash_ai_subject([job.id, job.contentSummary]),
        issues=issues,
        jobId=job.id,
        model="deterministic-batch-qa-local-runner",
        passed=not issues,
        provider="deterministic",
        runnerMode="mock",
        severity=severity_for_batch_issues(issues),
    )


def run_gemini_sync_batch_qa_job(job: AIBatchQAJob, *, model: str) -> AIBatchQAResult:
    started_at = perf_counter()
    prompt = build_batch_qa_prompt(job)
    batch_cache_key = prompt_cache_key("batch_qa", job.checkType, job.reportType)
    text = ""
    set_current_provider_usage(None)
    success = False
    try:
        spend_audit = evaluate_feature_spend(
            feature="batch_qa",
            input_tokens=estimate_tokens(BATCH_QA_SYSTEM_PROMPT, prompt),
            model=model,
            output_tokens=800,
        )
        if not spend_audit.allowed:
            raise RuntimeError(spend_audit.reason)
        text = create_gemini_text_response(
            max_output_tokens=800,
            model=model,
            system_prompt=BATCH_QA_SYSTEM_PROMPT,
            user_prompt=prompt,
        )
        issues = parse_batch_qa_issues(text)
        success = True
    finally:
        usage = current_provider_usage()
        record_ai_telemetry_event(
            active_school=job.activeSchool,
            cache_state="bypass",
            entitlement_source="deterministic_no_ai",
            estimated_input_tokens=estimate_tokens(BATCH_QA_SYSTEM_PROMPT, prompt),
            estimated_output_tokens=estimate_tokens(text),
            fallback_reason=None if success else "gemini-batch-qa-sync-failed",
            feature="batch_qa",
            intent="moderate",
            latency_bucket_value=latency_bucket(started_at),
            model=model,
            provider="gemini",
            prompt_cache_key=batch_cache_key,
            provider_input_tokens=usage.get("input") if usage else None,
            provider_output_tokens=usage.get("output") if usage else None,
            report_type=job.reportType,
            route="/ai/batch-qa/gemini-sync",
            subject_hash=hash_ai_subject([job.id, job.reportType, job.checkType]),
            success=success,
            user_plan="FREE",
        )

    return AIBatchQAResult(
        blockUserFacingDownload=job.blockUserFacingDownload,
        checkType=job.checkType,
        contentHash=hash_ai_subject([job.id, job.contentSummary]),
        issues=issues,
        jobId=job.id,
        model=model,
        passed=not issues,
        provider="gemini",
        runnerMode="gemini_sync",
        severity=severity_for_batch_issues(issues),
    )


def deterministic_issues_for_job(job: AIBatchQAJob) -> List[AIBatchQAIssue]:
    checks: Dict[AIBatchQACheckType, List[AIBatchQAIssue]] = {
        "translation_sweep": translation_issues(job),
        "report_redundancy_scan": redundancy_issues(job),
        "golden_pdf_text_audit": (
            redundancy_issues(job)
            + missing_section_issues(job)
            + overclaim_issues(job)
            + method_boundary_issues(job)
        ),
        "method_boundary_check": method_boundary_issues(job),
        "missing_section_check": missing_section_issues(job),
        "overclaim_safety_scan": overclaim_issues(job),
    }
    return checks[job.checkType]


def translation_issues(job: AIBatchQAJob) -> List[AIBatchQAIssue]:
    text = job.contentSummary
    issues: List[AIBatchQAIssue] = []
    if job.expectedLanguage == "en" and (DEVANAGARI.search(text) or GUJARATI.search(text)):
        issues.append(
            AIBatchQAIssue(
                code="mixed_language_defect",
                evidence="English surface contains Indic script",
                message="Expected English output contains Hindi/Gujarati script.",
                severity="high",
                suggestedFixCategory="fix-language-output",
            )
        )
    if job.expectedLanguage == "hi" and GUJARATI.search(text):
        issues.append(
            AIBatchQAIssue(
                code="mixed_language_defect",
                evidence="Hindi surface contains Gujarati script",
                message="Expected Hindi output contains Gujarati script.",
                severity="high",
                suggestedFixCategory="fix-language-output",
            )
        )
    if job.expectedLanguage == "gu" and DEVANAGARI.search(text):
        issues.append(
            AIBatchQAIssue(
                code="mixed_language_defect",
                evidence="Gujarati surface contains Devanagari script",
                message="Expected Gujarati output contains Hindi script.",
                severity="high",
                suggestedFixCategory="fix-language-output",
            )
        )
    return issues


def redundancy_issues(job: AIBatchQAJob) -> List[AIBatchQAIssue]:
    normalized = [
        normalize_sentence(sentence)
        for sentence in re.split(r"[.\n]+", job.contentSummary)
        if looks_like_remedy(sentence)
    ]
    counts: Dict[str, int] = {}
    for sentence in normalized:
        if sentence:
            counts[sentence] = counts.get(sentence, 0) + 1
    duplicates = [sentence for sentence, count in counts.items() if count > 1]
    if not duplicates:
        return []
    return [
        AIBatchQAIssue(
            code="duplicated_remedies",
            evidence=duplicates[0][:120],
            message="Remedy or action guidance repeats across report sections.",
            severity="medium",
            suggestedFixCategory="consolidate-remedies",
        )
    ]


def method_boundary_issues(job: AIBatchQAJob) -> List[AIBatchQAIssue]:
    text = job.contentSummary.lower()
    if job.activeSchool.lower() == "kp" or job.reportType.lower() == "kp":
        banned = ["parashari", "d1 yoga", "navamsa proof", "rashi yoga"]
        for phrase in banned:
            if phrase in text:
                return [
                    AIBatchQAIssue(
                        code="method_boundary_violation",
                        evidence=phrase,
                        message="KP report uses Vedic/Parashari proof language as primary evidence.",
                        severity="high",
                        suggestedFixCategory="restore-school-boundary",
                    )
                ]
    if job.activeSchool.lower() == "nadi" or job.reportType.lower() == "nadi":
        return [
            AIBatchQAIssue(
                code="legacy_school_alias",
                evidence="Legacy Nadi alias reached report QA",
                message="Legacy Nadi requests must be redirected or normalized to Jaimini before user-facing output.",
                severity="high",
                suggestedFixCategory="restore-school-boundary",
            )
        ]
    return []


def missing_section_issues(job: AIBatchQAJob) -> List[AIBatchQAIssue]:
    missing = sorted(set(job.requiredSections) - set(job.presentSections))
    if not missing:
        return []
    return [
        AIBatchQAIssue(
            code="missing_required_sections",
            evidence=", ".join(missing[:6]),
            message="The report artifact is missing required sections.",
            severity="high",
            suggestedFixCategory="add-missing-section",
        )
    ]


def overclaim_issues(job: AIBatchQAJob) -> List[AIBatchQAIssue]:
    text = job.contentSummary.lower()
    banned = ["will definitely", "guaranteed", "100% prediction", "certainly happen"]
    for phrase in banned:
        if phrase in text:
            return [
                AIBatchQAIssue(
                    code="unsupported_prediction",
                    evidence=phrase,
                    message="Report text uses hard guarantee or overclaim language.",
                    severity="critical",
                    suggestedFixCategory="remove-guarantee",
                )
            ]
    return []


def build_batch_qa_prompt(job: AIBatchQAJob) -> str:
    payload = {
        "activeSchool": job.activeSchool,
        "checkType": job.checkType,
        "contentSummary": job.contentSummary,
        "deterministicContextSummary": job.deterministicContextSummary,
        "expectedLanguage": job.expectedLanguage,
        "presentSections": job.presentSections,
        "reportType": job.reportType,
        "requiredSections": job.requiredSections,
    }
    return "\n".join(
        [
            "Return strict JSON only: {\"issues\":[{\"code\":string,\"severity\":\"low|medium|high|critical\",\"message\":string,\"evidence\":string,\"suggestedFixCategory\":string}]}",
            "Do not include raw private content beyond short evidence phrases.",
            json.dumps(payload, ensure_ascii=False, sort_keys=True),
        ]
    )


def parse_batch_qa_issues(text: str) -> List[AIBatchQAIssue]:
    data = parse_json_object(text)
    return [AIBatchQAIssue(**item) for item in data.get("issues", [])]


def select_batch_qa_model() -> str:
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PREDICTA",
            feature="batch_qa",
            intent="moderate",
            latency_sensitivity="batch",
            quality_tier="standard",
            user_plan="FREE",
        ),
        AIModelPins(
            free_reasoning=FREE_REASONING_MODEL,
            gemini_free=GEMINI_FLASH_MODEL,
            gemini_premium=GEMINI_PRO_MODEL,
            premium_deep=PREMIUM_DEEP_MODEL,
        ),
    )
    return decision.primary_model


def sanitized_result_payload(result: AIBatchQAResult) -> Dict[str, object]:
    return {
        "auditArtifactPath": result.auditArtifactPath,
        "blockUserFacingDownload": result.blockUserFacingDownload,
        "checkType": result.checkType,
        "contentHash": result.contentHash,
        "issues": [issue.model_dump(mode="json") for issue in result.issues],
        "jobId": result.jobId,
        "model": result.model,
        "passed": result.passed,
        "provider": result.provider,
        "runnerMode": result.runnerMode,
        "severity": result.severity,
    }


def severity_for_batch_issues(issues: List[AIBatchQAIssue]) -> str:
    if not issues:
        return "pass"
    return severity_from_issues(issues)  # type: ignore[arg-type]


def normalize_sentence(sentence: str) -> str:
    return " ".join(sentence.lower().strip().split())


def looks_like_remedy(sentence: str) -> bool:
    lowered = sentence.lower()
    return any(
        term in lowered
        for term in ["remedy", "mantra", "donate", "serve", "chant", "practice"]
    )
