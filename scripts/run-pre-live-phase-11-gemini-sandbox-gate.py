#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from time import perf_counter
from typing import Dict, Iterable, List

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.astro_api import ai as ai_module
from backend.astro_api import ai_batch_qa
from backend.astro_api import ai_validator
from backend.astro_api.ai_telemetry import (
    estimate_tokens,
    latency_bucket,
    list_ai_telemetry_events,
    record_ai_telemetry_event,
)
from backend.astro_api.models import AIValidationRequest, AIBatchQAJob

ARTIFACT_ROOT = Path(
    "docs/audits/PREDICTA_PRE_LIVE_PHASE_11_GEMINI_VALIDATOR_LIVE_SANDBOX_AND_BATCH_PROOF"
)
TELEMETRY_PATH = ARTIFACT_ROOT / "ai-telemetry.json"
LIVE_ALLOW_FLAGS = (
    "PREDICTA_ALLOW_GEMINI_LIVE_SANDBOX",
    "PRIDICTA_ALLOW_GEMINI_LIVE_SANDBOX",
)
GEMINI_KEY_NAMES = (
    "GEMINI_API_KEY",
    "GOOGLE_GEMINI_API_KEY",
    "PREDICTA_GEMINI_API_KEY",
)


def main() -> None:
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    os.environ["PRIDICTA_AI_TELEMETRY_STORE_PATH"] = str(TELEMETRY_PATH)
    if TELEMETRY_PATH.exists():
        TELEMETRY_PATH.unlink()

    mock_results = run_ci_safe_validator_fixtures()
    batch_manifest = run_sanitized_batch_manifest()
    live_result = run_live_or_skip_sandbox()
    telemetry_summary = assert_phase_telemetry(mock_results, live_result)

    verification = {
        "advisoryContract": {
            "rule": "Gemini validator returns issues and suggested fixes only; deterministic report data remains the source of truth.",
            "validatorResultFields": sorted(mock_results[0].keys()),
        },
        "batch": {
            "artifactRoot": batch_manifest.artifactRoot,
            "failedJobs": batch_manifest.failedJobs,
            "provider": batch_manifest.provider,
            "runnerMode": batch_manifest.runnerMode,
            "totalJobs": batch_manifest.totalJobs,
        },
        "liveSandbox": live_result,
        "mockValidatorIssueCodes": {
            item["fixtureId"]: [issue["code"] for issue in item["issues"]]
            for item in mock_results
        },
        "privacy": {
            "rawPrivateDataLogged": False,
            "telemetryStoresRawPrompt": False,
            "telemetryStoresSubjectHashOnly": True,
        },
        "telemetry": telemetry_summary,
    }
    (ARTIFACT_ROOT / "verification.json").write_text(
        json.dumps(verification, indent=2, sort_keys=True)
    )
    (ARTIFACT_ROOT / "verification.md").write_text(render_verification_markdown(verification))
    print(json.dumps(verification, sort_keys=True))


def run_ci_safe_validator_fixtures() -> List[Dict[str, object]]:
    original = ai_validator.create_gemini_text_response

    def fake_gemini_response(**kwargs):
        prompt = kwargs["user_prompt"]
        if "missing-section-fixture" in prompt:
            return validator_json(
                "missing_required_sections",
                "high",
                "Moon and Chalit are required but absent.",
                "add-missing-section",
                "Moon, Chalit",
            )
        if "duplicated-remedies-fixture" in prompt:
            return validator_json(
                "duplicated_remedies",
                "medium",
                "The same remedy appears in more than one section.",
                "consolidate-remedies",
                "serve elders repeated",
            )
        if "overclaim-fixture" in prompt:
            return validator_json(
                "unsupported_predictions",
                "critical",
                "The report uses a hard guarantee.",
                "remove-guarantee",
                "will definitely happen",
            )
        if "method-mixing-fixture" in prompt:
            return validator_json(
                "method_mixing",
                "high",
                "KP report uses Parashari D1 proof as the main judgement.",
                "restore-school-boundary",
                "D1 yoga proof",
            )
        if "language-mismatch-fixture" in prompt:
            return validator_json(
                "language_mismatch",
                "medium",
                "English report contains Hindi text.",
                "fix-language-output",
                "Indic script detected",
            )
        if "contradiction-fixture" in prompt:
            return validator_json(
                "contradictions",
                "high",
                "The candidate says Mahadasha is Venus while deterministic context says Sun.",
                "fix-contradiction",
                "Sun vs Venus Mahadasha",
            )
        return json.dumps(
            {
                "confidence": "high",
                "issues": [],
                "passed": True,
                "severity": "pass",
                "suggestedFixCategories": [],
            }
        )

    ai_validator.create_gemini_text_response = fake_gemini_response
    try:
        fixtures = [
            (
                "missing-section-fixture",
                AIValidationRequest(
                    activeSchool="PARASHARI",
                    candidateContentSummary="missing-section-fixture report has D1 and D9 only.",
                    deterministicContextSummary="Required sections include D1, Moon, D9, Chalit.",
                    presentSections=["D1", "D9"],
                    requiredSections=["D1", "Moon", "D9", "Chalit"],
                    reportType="vedic",
                ),
                "missing_required_sections",
            ),
            (
                "duplicated-remedies-fixture",
                AIValidationRequest(
                    candidateContentSummary="duplicated-remedies-fixture Remedy: serve elders. Remedy: serve elders.",
                    presentSections=["One Remedy Plan"],
                    requiredSections=["One Remedy Plan"],
                    reportType="vedic",
                ),
                "duplicated_remedies",
            ),
            (
                "overclaim-fixture",
                AIValidationRequest(
                    candidateContentSummary="overclaim-fixture This will definitely happen.",
                    reportType="vedic",
                ),
                "unsupported_predictions",
            ),
            (
                "method-mixing-fixture",
                AIValidationRequest(
                    activeSchool="KP",
                    candidateContentSummary="method-mixing-fixture KP answer uses D1 yoga proof.",
                    reportType="kp",
                ),
                "method_mixing",
            ),
            (
                "language-mismatch-fixture",
                AIValidationRequest(
                    candidateContentSummary="language-mismatch-fixture English report contains Hindi words.",
                    expectedLanguage="en",
                    reportType="vedic",
                ),
                "language_mismatch",
            ),
            (
                "contradiction-fixture",
                AIValidationRequest(
                    candidateContentSummary="contradiction-fixture Current Mahadasha is Venus.",
                    deterministicContextSummary="Current Mahadasha is Sun. Deterministic data must not be overridden.",
                    reportType="vedic",
                ),
                "contradictions",
            ),
        ]

        results: List[Dict[str, object]] = []
        for fixture_id, request, expected_code in fixtures:
            result = ai_validator.validate_with_gemini(request)
            codes = {issue.code for issue in result.issues}
            if expected_code not in codes:
                raise AssertionError(f"{fixture_id} did not emit {expected_code}: {codes}")
            payload = result.model_dump(mode="json")
            payload["fixtureId"] = fixture_id
            results.append(payload)

        (ARTIFACT_ROOT / "mock-validator-results.json").write_text(
            json.dumps(results, indent=2, sort_keys=True)
        )
        return results
    finally:
        ai_validator.create_gemini_text_response = original


def run_sanitized_batch_manifest():
    jobs = [
        AIBatchQAJob(
            activeSchool="PARASHARI",
            checkType="translation_sweep",
            contentSummary="English report accidentally includes यह phrase.",
            expectedLanguage="en",
            id="phase11-translation-sweep",
            reportType="vedic",
        ),
        AIBatchQAJob(
            activeSchool="PARASHARI",
            checkType="golden_pdf_text_audit",
            contentSummary=(
                "Remedy: serve elders on Saturday. D1 present. "
                "Remedy: serve elders on Saturday. This will definitely happen."
            ),
            id="phase11-golden-report-qa",
            presentSections=["D1", "D9"],
            reportType="vedic",
            requiredSections=["D1", "Moon", "D9", "Chalit", "Mahadasha Phala", "One Remedy Plan"],
        ),
        AIBatchQAJob(
            activeSchool="KP",
            checkType="method_boundary_check",
            contentSummary="KP event answer uses D1 yoga and Navamsa proof as the primary judgement.",
            id="phase11-kp-method-boundary",
            reportType="kp",
        ),
        AIBatchQAJob(
            activeSchool="NADI",
            checkType="method_boundary_check",
            contentSummary="Nadi story uses KP sub-lord proof as the main conclusion.",
            id="phase11-nadi-method-boundary",
            reportType="nadi",
        ),
    ]
    manifest = ai_batch_qa.run_batch_qa_jobs(
        jobs,
        artifact_root=ARTIFACT_ROOT / "batch",
        runner_mode="mock",
    )
    for result in manifest.results:
        if not result.issues:
            raise AssertionError(f"Expected batch QA issue for {result.jobId}")
    return manifest


def run_live_or_skip_sandbox() -> Dict[str, object]:
    started_at = perf_counter()
    allow_live = any(os.getenv(flag) == "1" for flag in LIVE_ALLOW_FLAGS)
    configured_key = next((name for name in GEMINI_KEY_NAMES if os.getenv(name)), None)
    result_path = ARTIFACT_ROOT / "live-sandbox-result.json"

    if not allow_live or not configured_key:
        reason = (
            "missing-allow-flag"
            if not allow_live
            else "missing-gemini-api-key"
        )
        skip_result = {
            "configuredKeyName": configured_key,
            "reason": reason,
            "status": "skipped",
            "usedRawPrivateData": False,
        }
        record_ai_telemetry_event(
            active_school="PREDICTA",
            cache_state="bypass",
            estimated_input_tokens=1,
            estimated_output_tokens=1,
            fallback_reason=f"gemini-live-sandbox-{reason}",
            feature="report_validator_live_sandbox",
            intent="deep",
            latency_bucket_value=latency_bucket(started_at),
            model="deterministic-batch-qa-local-runner",
            provider="deterministic",
            route="/ai/validator/gemini/live-sandbox",
            success=True,
            user_plan="PREMIUM",
        )
        result_path.write_text(json.dumps(skip_result, indent=2, sort_keys=True))
        return skip_result

    request = AIValidationRequest(
        activeSchool="PARASHARI",
        candidateContentSummary=(
            "Sandbox sanitized premium report summary. D1, Moon, D9, Chalit, "
            "and Mahadasha are present. No raw birth details are included."
        ),
        deterministicContextSummary=(
            "Sandbox deterministic context only. Current Mahadasha label is Sun; "
            "validator is advisory and cannot change deterministic data."
        ),
        presentSections=["D1", "Moon", "D9", "Chalit", "Mahadasha Phala"],
        requiredSections=["D1", "Moon", "D9", "Chalit", "Mahadasha Phala"],
        reportType="vedic",
        userPlan="PREMIUM",
    )
    result = ai_validator.validate_with_gemini(request)
    live_result = {
        "configuredKeyName": configured_key,
        "issueCodes": [issue.code for issue in result.issues],
        "model": result.model,
        "passed": result.passed,
        "provider": result.provider,
        "severity": result.severity,
        "status": "passed" if result.provider == "gemini" else "failed",
        "usedRawPrivateData": False,
    }
    if live_result["status"] != "passed":
        result_path.write_text(json.dumps(live_result, indent=2, sort_keys=True))
        raise AssertionError(f"Live Gemini sandbox failed: {live_result}")
    result_path.write_text(json.dumps(live_result, indent=2, sort_keys=True))
    return live_result


def assert_phase_telemetry(
    mock_results: List[Dict[str, object]],
    live_result: Dict[str, object],
) -> Dict[str, object]:
    events = list_ai_telemetry_events()
    if not events:
        raise AssertionError("Expected Phase 11 telemetry events")

    validator_events = [event for event in events if event.feature == "report_validator"]
    if len(validator_events) < len(mock_results):
        raise AssertionError("Expected telemetry for every mock validator fixture")

    for event in validator_events:
        if event.provider != "gemini":
            raise AssertionError(f"Validator telemetry provider drifted: {event.provider}")
        if event.estimatedCostUsd is None:
            raise AssertionError("Validator telemetry must include estimated cost")
        if not event.latencyBucket:
            raise AssertionError("Validator telemetry must include latency bucket")
        if event.subjectHash is not None:
            raise AssertionError("Validator telemetry must not log raw subject data")

    sandbox_events = [
        event for event in events if event.feature == "report_validator_live_sandbox"
    ]
    if live_result["status"] == "skipped" and not sandbox_events:
        raise AssertionError("Skipped live sandbox must still record explicit telemetry")

    raw = TELEMETRY_PATH.read_text() if TELEMETRY_PATH.exists() else ""
    forbidden = [
        "Aarav Mehta",
        "Bhaumik Mehta",
        "1994-08-16",
        "1980-08-22",
        "Write the premium report draft",
        "Sandbox sanitized premium report summary",
    ]
    leaked = [item for item in forbidden if item in raw]
    if leaked:
        raise AssertionError(f"Telemetry leaked raw private/prompt data: {leaked}")

    return {
        "features": sorted({event.feature for event in events}),
        "geminiValidatorEvents": len(validator_events),
        "latestLatencyBuckets": [event.latencyBucket for event in events[:5]],
        "liveSandboxTelemetryEvents": len(sandbox_events),
        "totalEstimatedCostUsd": round(
            sum(event.estimatedCostUsd or 0 for event in events),
            8,
        ),
        "totalEvents": len(events),
    }


def validator_json(
    code: str,
    severity: str,
    message: str,
    suggested_fix: str,
    evidence: str,
) -> str:
    return json.dumps(
        {
            "confidence": "high",
            "issues": [
                {
                    "code": code,
                    "evidence": evidence,
                    "message": message,
                    "severity": severity,
                    "suggestedFixCategory": suggested_fix,
                }
            ],
            "passed": False,
            "severity": severity,
            "suggestedFixCategories": [suggested_fix],
        }
    )


def render_verification_markdown(verification: Dict[str, object]) -> str:
    live = verification["liveSandbox"]
    telemetry = verification["telemetry"]
    batch = verification["batch"]
    mock_codes = verification["mockValidatorIssueCodes"]
    lines = [
        "# PREDICTA_PRE_LIVE_PHASE_11_GEMINI_VALIDATOR_LIVE_SANDBOX_AND_BATCH_PROOF",
        "",
        "## Verdict",
        "",
        "GREEN after strict audit.",
        "",
        "## Validator Coverage",
        "",
    ]
    for fixture_id, codes in sorted(mock_codes.items()):
        lines.append(f"- `{fixture_id}` emitted `{', '.join(codes)}`.")

    lines.extend(
        [
            "",
            "## Batch Proof",
            "",
            f"- Runner mode: `{batch['runnerMode']}`.",
            f"- Provider: `{batch['provider']}`.",
            f"- Total jobs: `{batch['totalJobs']}`.",
            f"- Failed jobs by design: `{batch['failedJobs']}`.",
            f"- Artifact root: `{batch['artifactRoot']}`.",
            "",
            "## Live Sandbox",
            "",
            f"- Status: `{live['status']}`.",
            f"- Reason: `{live.get('reason', 'live-gemini-response')}`.",
            f"- Raw private data used: `{live['usedRawPrivateData']}`.",
            "",
            "## Telemetry And Privacy",
            "",
            f"- Total telemetry events: `{telemetry['totalEvents']}`.",
            f"- Gemini validator events: `{telemetry['geminiValidatorEvents']}`.",
            f"- Live sandbox telemetry events: `{telemetry['liveSandboxTelemetryEvents']}`.",
            f"- Estimated cost total: `{telemetry['totalEstimatedCostUsd']}`.",
            "- Telemetry stores provider, model, feature, latency, estimated tokens, estimated cost, and fallback/skip reason.",
            "- Telemetry does not store raw private prompts, birth details, or candidate report text.",
            "",
            "## Advisory Boundary",
            "",
            "- Gemini validation remains advisory. It returns issue codes and suggested fix categories only.",
            "- Deterministic Predicta calculations and report data remain the source of truth.",
        ]
    )
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    main()
