#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.astro_api.ai_batch_qa import run_batch_qa_jobs
from backend.astro_api.models import AIBatchQAJob

ARTIFACT_ROOT = Path(
    "docs/audits/PREDICTA_AI_MODEL_PHASE_5_BATCH_AUDITS_TRANSLATION_AND_GOLDEN_REPORT_QA"
)


def main() -> None:
    jobs = [
        AIBatchQAJob(
            activeSchool="PARASHARI",
            checkType="translation_sweep",
            contentSummary="English report body accidentally says यह chart is strong.",
            expectedLanguage="en",
            id="translation-mixed-language",
            reportType="vedic",
        ),
        AIBatchQAJob(
            activeSchool="PARASHARI",
            checkType="golden_pdf_text_audit",
            contentSummary=(
                "Remedy: serve elders on Saturday. "
                "Career chapter text. Remedy: serve elders on Saturday."
            ),
            id="golden-duplicated-remedies",
            presentSections=["D1", "Mahadasha Phala", "One Remedy Plan"],
            reportType="vedic",
            requiredSections=["D1", "Mahadasha Phala", "One Remedy Plan"],
        ),
        AIBatchQAJob(
            activeSchool="KP",
            checkType="method_boundary_check",
            contentSummary="KP event answer uses D1 yoga and Navamsa proof as the main judgement.",
            id="kp-method-boundary",
            reportType="kp",
        ),
        AIBatchQAJob(
            activeSchool="PARASHARI",
            checkType="missing_section_check",
            contentSummary="Report has D1 and D9 only.",
            id="missing-section",
            presentSections=["D1", "D9"],
            reportType="vedic",
            requiredSections=["D1", "D9", "Moon", "Chalit", "Mahadasha Phala"],
        ),
        AIBatchQAJob(
            activeSchool="PARASHARI",
            checkType="overclaim_safety_scan",
            contentSummary="This will definitely happen in June.",
            id="overclaim-safety",
            reportType="vedic",
        ),
    ]

    manifest = run_batch_qa_jobs(jobs, artifact_root=ARTIFACT_ROOT, runner_mode="mock")
    expected_codes = {
        "translation-mixed-language": "mixed_language_defect",
        "golden-duplicated-remedies": "duplicated_remedies",
        "kp-method-boundary": "method_boundary_violation",
        "missing-section": "missing_required_sections",
        "overclaim-safety": "unsupported_prediction",
    }
    for result in manifest.results:
        codes = {issue.code for issue in result.issues}
        expected = expected_codes[result.jobId]
        if expected not in codes:
            raise SystemExit(f"{result.jobId} did not emit {expected}: {sorted(codes)}")

    (ARTIFACT_ROOT / "verification.txt").write_text(
        "\n".join(
            [
                "PREDICTA_AI_MODEL_PHASE_5_BATCH_AUDITS_TRANSLATION_AND_GOLDEN_REPORT_QA verification",
                "",
                "- Mock batch QA manifest generated: batch-qa-manifest.json.",
                "- Translation sweep fixture flags mixed-language defects.",
                "- Golden PDF text audit fixture flags duplicated remedy sections.",
                "- Method-boundary fixture flags KP/Vedic mixing.",
                "- Missing-section and overclaim fixtures are included for release-team local QA.",
                "- Artifacts store issue codes, short evidence phrases, content hashes, provider/model metadata, and no raw private prompts.",
            ]
        )
    )
    print(
        json.dumps(
            {
                "artifactRoot": str(ARTIFACT_ROOT),
                "failedJobs": manifest.failedJobs,
                "runnerMode": manifest.runnerMode,
                "totalJobs": manifest.totalJobs,
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
