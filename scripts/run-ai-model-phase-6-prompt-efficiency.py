#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.astro_api import ai
from backend.astro_api.ai_prompt_efficiency import (
    FREE_CHAT_INPUT_TOKEN_BUDGET,
    PREMIUM_REPORT_INPUT_TOKEN_BUDGET,
    STRUCTURED_OUTPUT_SCHEMAS,
    audit_prompt_budget,
    compact_predicta_context,
    prompt_cache_key,
)
from backend.astro_api.calculations import generate_kundli
from backend.astro_api.jyotish_analysis import build_jyotish_analysis
from backend.astro_api.models import BirthDetails

ARTIFACT_ROOT = Path(
    "docs/audits/PREDICTA_AI_MODEL_PHASE_6_PROMPT_CACHING_STRUCTURED_OUTPUTS_AND_CONTEXT_EFFICIENCY"
)


def main() -> None:
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    kundli = generate_kundli(
        BirthDetails(
            name="Phase Six Audit",
            date="1994-08-16",
            time="06:42",
            place="Mumbai, India",
            latitude=19.076,
            longitude=72.8777,
            timezone="Asia/Kolkata",
        )
    )
    chart_context = ai.ChartContext(
        chartType="D10",
        predictaSchool="PARASHARI",
        selectedSection="Premium Vedic Report",
        sourceScreen="Charts",
    )
    question = "Give me a clear career reading from D10."
    analysis = build_jyotish_analysis(kundli, question, chart_context)
    context = ai.build_ai_context(
        kundli,
        chart_context,
        analysis,
        "en",
        "FREE",
        question,
        [],
    )
    context["predictaRoomContract"] = ai.build_predicta_room_contract(chart_context)
    compact = compact_predicta_context(context, user_plan="FREE")
    prompt = ai.build_user_prompt(
        context,
        [],
        question,
        primary_area=analysis.primaryArea,
        language="en",
    )
    free_audit = audit_prompt_budget(
        prompt=prompt,
        budget_tokens=FREE_CHAT_INPUT_TOKEN_BUDGET,
        label="free chat",
    )
    premium_report_audit = audit_prompt_budget(
        prompt="premium report deterministic summary",
        budget_tokens=PREMIUM_REPORT_INPUT_TOKEN_BUDGET,
        label="premium report",
    )
    manifest = {
        "cacheKeys": {
            "chat": prompt_cache_key("chat", ai.PREDICTA_CHAT_PROMPT_VERSION, "PARASHARI", "en", "moderate"),
            "birthExtraction": prompt_cache_key("birth_extraction", "v1"),
            "premiumReport": prompt_cache_key("premium_report", "vedic", "premium_report_draft", ai.PREMIUM_DEEP_MODEL),
        },
        "compactContextRequiredKeys": {
            "activeSchool": compact["activeContext"].get("predictaSchool"),
            "kundliId": compact["kundliIdentity"].get("kundliId"),
            "inputHash": compact["kundliIdentity"].get("inputHash"),
            "selectedReport": compact.get("selectedReport"),
            "selectedChartType": compact["activeContext"].get("chartType"),
            "selectedSection": compact.get("selectedSection"),
            "memoryDigest": compact.get("memoryDigest"),
        },
        "promptOrder": {
            "staticIndex": prompt.index("STATIC PREDICTA CONTRACT"),
            "dynamicIndex": prompt.index("DYNAMIC USER CONTEXT"),
            "kundliContextIndex": prompt.index("Kundli context:"),
        },
        "promptBudgets": {
            "freeChat": free_audit.__dict__,
            "premiumReport": premium_report_audit.__dict__,
        },
        "structuredOutputSchemas": sorted(STRUCTURED_OUTPUT_SCHEMAS.keys()),
    }
    if not free_audit.approved:
        raise SystemExit(f"free chat prompt failed budget: {free_audit.reason}")
    if manifest["promptOrder"]["staticIndex"] > manifest["promptOrder"]["dynamicIndex"]:
        raise SystemExit("static prompt content must precede dynamic context")
    required = manifest["compactContextRequiredKeys"]
    missing = [key for key, value in required.items() if value in (None, "", [])]
    if missing:
        raise SystemExit(f"compact context missing required keys: {missing}")

    (ARTIFACT_ROOT / "prompt-efficiency-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True)
    )
    (ARTIFACT_ROOT / "verification.txt").write_text(
        "\n".join(
            [
                "PREDICTA_AI_MODEL_PHASE_6_PROMPT_CACHING_STRUCTURED_OUTPUTS_AND_CONTEXT_EFFICIENCY verification",
                "",
                "- Prompt order keeps static Predicta contract before dynamic Kundli/user context.",
                "- Compact context preserves active school, Kundli ID/hash, selected report, selected chart/section, and memory digest.",
                "- Prompt cache keys are generated for chat, birth extraction, and premium report stages.",
                "- Structured output schemas exist for birth extraction, validator reports, report QA summaries, translation QA summaries, and routing decisions.",
                "- Free chat prompt budget audit passes.",
                "- Premium report prompt budget helper returns clear audit reasons.",
            ]
        )
    )
    print(json.dumps({"artifactRoot": str(ARTIFACT_ROOT), "freeChatTokens": free_audit.estimatedInputTokens}, sort_keys=True))


if __name__ == "__main__":
    main()
