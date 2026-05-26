from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional

from .ai_telemetry import estimate_tokens

FREE_CHAT_INPUT_TOKEN_BUDGET = 24000
PREMIUM_REPORT_INPUT_TOKEN_BUDGET = 36000
PROMPT_CACHE_KEY_VERSION = "predicta-prompt-cache-v1"

BIRTH_EXTRACTION_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["extracted", "missingFields", "ambiguities", "confidence"],
    "properties": {
        "extracted": {"type": "object"},
        "missingFields": {"type": "array", "items": {"type": "string"}},
        "ambiguities": {"type": "array", "items": {"type": "object"}},
        "confidence": {"type": "number"},
    },
}

VALIDATOR_REPORT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["passed", "severity", "issues", "suggestedFixCategories", "confidence"],
    "properties": {
        "passed": {"type": "boolean"},
        "severity": {"type": "string"},
        "issues": {"type": "array", "items": {"type": "object"}},
        "suggestedFixCategories": {"type": "array", "items": {"type": "string"}},
        "confidence": {"type": "string"},
    },
}

BATCH_QA_SUMMARY_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["issues"],
    "properties": {
        "issues": {"type": "array", "items": {"type": "object"}},
    },
}

TRANSLATION_QA_SUMMARY_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["language", "mixedLanguageDefects", "missingTranslations"],
    "properties": {
        "language": {"type": "string"},
        "mixedLanguageDefects": {"type": "array", "items": {"type": "object"}},
        "missingTranslations": {"type": "array", "items": {"type": "object"}},
    },
}

ROUTING_DECISION_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["feature", "primaryProvider", "primaryModel", "policyReason"],
    "properties": {
        "feature": {"type": "string"},
        "primaryProvider": {"type": "string"},
        "primaryModel": {"type": "string"},
        "policyReason": {"type": "string"},
    },
}

STRUCTURED_OUTPUT_SCHEMAS: Dict[str, Dict[str, Any]] = {
    "birth_extraction": BIRTH_EXTRACTION_SCHEMA,
    "validator_report": VALIDATOR_REPORT_SCHEMA,
    "report_qa_summary": BATCH_QA_SUMMARY_SCHEMA,
    "translation_qa_summary": TRANSLATION_QA_SUMMARY_SCHEMA,
    "routing_decision": ROUTING_DECISION_SCHEMA,
}


class StructuredOutputError(ValueError):
    pass


@dataclass(frozen=True)
class PromptBudgetAudit:
    approved: bool
    estimatedInputTokens: int
    budgetTokens: int
    reason: str


def structured_output_format(schema_name: str) -> Dict[str, Any]:
    schema = STRUCTURED_OUTPUT_SCHEMAS[schema_name]
    return {
        "format": {
            "type": "json_schema",
            "name": f"predicta_{schema_name}",
            "schema": schema,
            "strict": True,
        }
    }


def parse_structured_json(
    text: str,
    *,
    required_keys: Iterable[str],
    schema_name: str,
) -> Dict[str, Any]:
    try:
        parsed = json.loads(text.strip())
    except json.JSONDecodeError as exc:
        raise StructuredOutputError(f"{schema_name} returned malformed JSON") from exc
    if not isinstance(parsed, dict):
        raise StructuredOutputError(f"{schema_name} must return a JSON object")
    missing = [key for key in required_keys if key not in parsed]
    if missing:
        raise StructuredOutputError(
            f"{schema_name} missing required keys: {', '.join(missing)}"
        )
    return parsed


def build_ordered_prompt(
    *,
    static_sections: Iterable[str],
    dynamic_sections: Iterable[str],
) -> str:
    return "\n\n".join(
        [
            "STATIC PREDICTA CONTRACT",
            *[section for section in static_sections if section.strip()],
            "DYNAMIC USER CONTEXT",
            *[section for section in dynamic_sections if section.strip()],
        ]
    )


def prompt_cache_key(*parts: str) -> str:
    digest = hashlib.sha256(
        ":".join([PROMPT_CACHE_KEY_VERSION, *[part for part in parts if part]]).encode(
            "utf-8"
        )
    ).hexdigest()
    return f"pcache_{digest[:32]}"


def compact_predicta_context(
    context: Dict[str, Any],
    *,
    user_plan: str,
) -> Dict[str, Any]:
    active = context.get("activeContext") or {}
    calculation_meta = context.get("calculationMeta") or {}
    chart_access = context.get("chartAccess") or {}
    jyotish = context.get("jyotishAnalysis") or {}
    selected_report = active.get("selectedSection") if isinstance(active, dict) else None
    memory_digest = build_memory_digest(context)
    compact: Dict[str, Any] = {
        "promptEfficiency": {
            "mode": "compact",
            "rule": "Rich app memory stays available through digests and selected context; full app universe is not sent to every turn.",
            "userPlan": user_plan,
        },
        "kundliIdentity": {
            "kundliId": context.get("kundliId"),
            "inputHash": calculation_meta.get("inputHash"),
            "ayanamsa": calculation_meta.get("ayanamsa"),
            "houseSystem": calculation_meta.get("houseSystem"),
        },
        "activeContext": compact_active_context(active),
        "selectedReport": selected_report,
        "selectedChart": compact_prompt_chart(context.get("selectedChart")),
        "selectedSection": selected_report,
        "memoryDigest": memory_digest,
        "disciplineHandoff": context.get("disciplineHandoff"),
        "specialistContextSync": context.get("specialistContextSync", [])[:3],
        "predictaRoomContract": context.get("predictaRoomContract"),
        "predictaTone": context.get("predictaTone"),
        "requestedLanguage": context.get("requestedLanguage"),
        "chartAccess": {
            "userPlan": chart_access.get("userPlan"),
            "allowedChartTypes": chart_access.get("allowedChartTypes", [])[:18],
            "rule": chart_access.get("rule"),
        },
        "birthSummary": context.get("birthSummary"),
        "coreIdentity": context.get("coreIdentity"),
        "currentDasha": context.get("currentDasha"),
        "jyotishAnalysis": compact_jyotish_analysis(jyotish),
        "mahadashaIntelligence": context.get("mahadashaIntelligence"),
        "sadeSatiIntelligence": context.get("sadeSatiIntelligence"),
        "transitGocharIntelligence": context.get("transitGocharIntelligence"),
        "yearlyHoroscopeVarshaphal": context.get("yearlyHoroscopeVarshaphal"),
        "advancedJyotishCoverage": summarize_large_layer(
            context.get("advancedJyotishCoverage")
        ),
        "nadiJyotishPlan": summarize_large_layer(context.get("nadiJyotishPlan")),
        "numerologyFoundation": context.get("numerologyFoundation"),
        "signatureAnalysis": context.get("signatureAnalysis"),
        "chalitBhavKpFoundation": summarize_large_layer(
            context.get("chalitBhavKpFoundation")
        ),
        "holisticFoundation": summarize_large_layer(context.get("holisticFoundation")),
        "holisticReadingRooms": summarize_large_layer(context.get("holisticReadingRooms")),
        "sadhanaRemedyPath": summarize_large_layer(context.get("sadhanaRemedyPath")),
        "holisticDailyGuidance": summarize_large_layer(
            context.get("holisticDailyGuidance")
        ),
        "purusharthaLifeBalance": context.get("purusharthaLifeBalance"),
        "personalPanchang": context.get("personalPanchang"),
        "selectedHouseFocus": context.get("selectedHouseFocus"),
        "selectedPlanetFocus": context.get("selectedPlanetFocus"),
        "selectedTimelineEvent": context.get("selectedTimelineEvent"),
        "selectedDecision": context.get("selectedDecision"),
        "selectedDecisionSynthesis": summarize_large_layer(
            context.get("selectedDecisionSynthesis")
        ),
        "selectedRemedy": context.get("selectedRemedy"),
        "selectedFamilyKarmaMap": context.get("selectedFamilyKarmaMap"),
        "selectedPredictaWrapped": context.get("selectedPredictaWrapped"),
        "selectedRelationshipMirror": context.get("selectedRelationshipMirror"),
        "coreCharts": {
            key: compact_prompt_chart(value)
            for key, value in (context.get("coreCharts") or {}).items()
        },
        "chartAvailability": context.get("chartAvailability"),
    }
    compact["coveragePolicyAliases"] = {
        "advancedJyotishCoverage": "Free users receive useful broad coverage",
        "nadiJyotishPlan": "No fake palm-leaf claim",
    }
    if user_plan == "PREMIUM":
        compact["ashtakavarga"] = context.get("ashtakavarga")
        compact["yogas"] = (context.get("yogas") or [])[:8]
    return compact


def audit_prompt_budget(
    *,
    prompt: str,
    budget_tokens: int,
    label: str,
) -> PromptBudgetAudit:
    estimated = estimate_tokens(prompt)
    if estimated <= budget_tokens:
        return PromptBudgetAudit(
            approved=True,
            budgetTokens=budget_tokens,
            estimatedInputTokens=estimated,
            reason=f"{label} prompt is within budget",
        )
    return PromptBudgetAudit(
        approved=False,
        budgetTokens=budget_tokens,
        estimatedInputTokens=estimated,
        reason=f"{label} prompt exceeds budget by {estimated - budget_tokens} estimated tokens",
    )


def compact_active_context(active: Any) -> Dict[str, Any]:
    if not isinstance(active, dict):
        return {}
    keys = [
        "predictaSchool",
        "chartType",
        "chartName",
        "selectedHouse",
        "selectedPlanet",
        "selectedSection",
        "sourceScreen",
        "handoffFrom",
        "handoffQuestion",
        "purpose",
    ]
    return {key: active.get(key) for key in keys if active.get(key) is not None}


def compact_jyotish_analysis(jyotish: Any) -> Any:
    if not isinstance(jyotish, dict):
        return jyotish
    return {
        "primaryArea": jyotish.get("primaryArea"),
        "confidence": jyotish.get("confidence"),
        "evidence": (jyotish.get("evidence") or [])[:6],
        "areaAnalyses": (jyotish.get("areaAnalyses") or [])[:3],
        "formattingContract": jyotish.get("formattingContract"),
    }


def summarize_large_layer(value: Any, *, depth: int = 0) -> Any:
    if depth > 3:
        return "[compact]"
    if isinstance(value, str):
        return value if len(value) <= 700 else f"{value[:700].rstrip()}..."
    if isinstance(value, list):
        return [summarize_large_layer(item, depth=depth + 1) for item in value[:3]]
    if not isinstance(value, dict):
        return value
    summary: Dict[str, Any] = {}
    for key, child in list(value.items())[:12]:
        if isinstance(child, list):
            summary[key] = [
                summarize_large_layer(item, depth=depth + 1) for item in child[:3]
            ]
        elif isinstance(child, dict):
            summary[key] = summarize_large_layer(child, depth=depth + 1)
        else:
            summary[key] = summarize_large_layer(child, depth=depth + 1)
    return summary


def compact_prompt_chart(value: Any) -> Any:
    if not isinstance(value, dict):
        return value
    return {
        "chartType": value.get("chartType"),
        "name": value.get("name"),
        "supported": value.get("supported"),
        "ascendantSign": value.get("ascendantSign"),
        "housePlacements": value.get("housePlacements"),
        "planetDistribution": (value.get("planetDistribution") or [])[:10],
    }


def build_memory_digest(context: Dict[str, Any]) -> Dict[str, Any]:
    active = context.get("activeContext") or {}
    sync = context.get("specialistContextSync") or []
    digest: Dict[str, Any] = {
        "activeSchool": active.get("predictaSchool") if isinstance(active, dict) else None,
        "selectedChart": active.get("chartType") if isinstance(active, dict) else None,
        "selectedSection": active.get("selectedSection") if isinstance(active, dict) else None,
        "recentSpecialistRooms": [
            {
                "school": item.get("school"),
                "selectedChart": item.get("selectedChart"),
                "selectedSection": item.get("selectedSection"),
            }
            for item in sync[:3]
            if isinstance(item, dict)
        ],
        "rule": "Use saved/synced memory only when supplied here; do not invent memory.",
    }
    return digest
