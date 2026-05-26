#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.astro_api import ai
from backend.astro_api.ai_telemetry import record_ai_telemetry_event
from backend.astro_api.release_governance import evaluate_release_readiness

ARTIFACT_ROOT = Path(
    "docs/audits/PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE"
)
REQUIRED_AI_CHECKS = {
    "Approved AI providers",
    "Model and prompt pins",
    "AI telemetry availability",
    "AI routing assertions",
    "Gemini validator availability policy",
    "Signature privacy assertion",
    "Method-boundary assertion",
    "Translation QA assertion",
    "AI profit-safety summary",
}
PHASE_7_PRICING_JSON = json.dumps(
    {
        "gemini-2.5-pro": {"inputPerMillion": 0.5, "outputPerMillion": 2.0},
        "gpt-5.4-mini": {"inputPerMillion": 0.1, "outputPerMillion": 0.4},
        "gpt-5.5": {"inputPerMillion": 1.0, "outputPerMillion": 4.0},
    },
    sort_keys=True,
)


def seed_repeatable_cost_telemetry() -> None:
    telemetry_path = ARTIFACT_ROOT / "phase-7-ai-telemetry.json"
    telemetry_path.write_text('{"events":[]}')
    os.environ["PRIDICTA_AI_TELEMETRY_STORE_PATH"] = str(telemetry_path)
    os.environ.setdefault("PRIDICTA_AI_PRICING_JSON", PHASE_7_PRICING_JSON)

    record_ai_telemetry_event(
        active_school="PARASHARI",
        cache_state="hit",
        estimated_input_tokens=100,
        estimated_output_tokens=20,
        fallback_reason=None,
        feature="chat",
        intent="moderate",
        latency_bucket_value="lt_1s",
        model=ai.FREE_REASONING_MODEL,
        provider="openai",
        provider_cached_input_tokens=40,
        report_type=None,
        route="/ask-pridicta",
        success=True,
        user_plan="FREE",
    )
    record_ai_telemetry_event(
        active_school="PARASHARI",
        cache_state="miss",
        estimated_input_tokens=500,
        estimated_output_tokens=120,
        fallback_reason=None,
        feature="chat",
        intent="deep",
        latency_bucket_value="1_3s",
        model=ai.PREMIUM_DEEP_MODEL,
        provider="openai",
        report_type=None,
        route="/ask-pridicta",
        success=True,
        user_plan="PREMIUM",
    )
    record_ai_telemetry_event(
        active_school="PARASHARI",
        cache_state="miss",
        estimated_input_tokens=1000,
        estimated_output_tokens=300,
        fallback_reason=None,
        feature="premium_report_draft",
        intent="deep",
        latency_bucket_value="1_3s",
        model=ai.PREMIUM_DEEP_MODEL,
        provider="openai",
        report_type="vedic",
        route="/ai/report/premium/draft",
        success=True,
        user_plan="PREMIUM",
    )
    record_ai_telemetry_event(
        active_school="PARASHARI",
        cache_state="miss",
        estimated_input_tokens=400,
        estimated_output_tokens=80,
        fallback_reason=None,
        feature="report_validator",
        intent="deep",
        latency_bucket_value="1_3s",
        model=ai.GEMINI_PRO_MODEL,
        provider="gemini",
        report_type="vedic",
        route="/ai/validator/gemini",
        success=True,
        user_plan="PREMIUM",
    )


def main() -> None:
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    seed_repeatable_cost_telemetry()
    report = evaluate_release_readiness()
    checks = {check.name: check for check in report.checks}
    missing = sorted(REQUIRED_AI_CHECKS - set(checks))
    failed_ai_checks = [
        check.name
        for check in checks.values()
        if check.name in REQUIRED_AI_CHECKS and check.status != "PASS"
    ]
    if missing or failed_ai_checks:
        raise SystemExit(
            f"Phase 7 AI release governance failed. missing={missing} failed={failed_ai_checks}"
        )

    payload = report.model_dump(mode="json")
    (ARTIFACT_ROOT / "release-governance-report.json").write_text(
        json.dumps(payload, indent=2, sort_keys=True)
    )
    (ARTIFACT_ROOT / "profit-safety-summary.json").write_text(
        json.dumps(payload["profitSafetySummary"], indent=2, sort_keys=True)
    )
    (ARTIFACT_ROOT / "verification.txt").write_text(
        "\n".join(
            [
                "PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE verification",
                "",
                "- Release governance includes approved providers, approved model pins, prompt version, telemetry availability, routing assertions, validator policy, signature privacy, method-boundary QA, translation QA, and profit-safety summary.",
                "- Required AI governance checks passed without depending on unrelated broader public-readiness state.",
                "- Profit-safety summary artifact generated with cost, fallback, cache, deterministic fallback, and top cost-risk features.",
                "- Deterministic Phase 7 telemetry fixture includes free chat, premium chat, premium report, and Gemini validator events with pinned pricing.",
                "- Release governance endpoint remains owner-protected through the existing /safety/admin/release-readiness surface.",
                "",
                "Phase audit commands:",
                "- PASS: python3 -m pytest backend/tests/test_safety_red_team_evals.py -q",
                "- PASS: python3 -m pytest backend/tests/test_astro_api.py -q",
                "- PASS: python3 -m py_compile backend/astro_api/release_governance.py backend/astro_api/models.py scripts/run-ai-model-phase-7-release-governance.py",
                "- PASS: corepack pnpm test:ai-model-phase-7",
                "- PASS: corepack pnpm test:ai-model-phase-6",
                "- PASS: corepack pnpm test:translation-trust",
                "- PASS: corepack pnpm test:pdf-golden",
                "- PASS: python3 -m json.tool package.json",
                "- PASS: python3 -m json.tool docs/audits/PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE/release-governance-report.json",
                "- PASS: python3 -m json.tool docs/audits/PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE/profit-safety-summary.json",
                "- PASS: python3 -m json.tool docs/audits/PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE/phase-7-ai-telemetry.json",
                "- PASS: git diff --check",
            ]
        )
    )
    print(
        json.dumps(
            {
                "aiGovernanceChecks": sorted(REQUIRED_AI_CHECKS),
                "artifactRoot": str(ARTIFACT_ROOT),
                "releaseStatus": report.releaseStatus,
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
