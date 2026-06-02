from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from time import perf_counter
from typing import Any, Dict, Iterable, List, Optional
from uuid import uuid4

from .models import (
    AIIntent,
    AITelemetryEvent,
    AITelemetrySummary,
    UserPlan,
)

_lock = RLock()

DEFAULT_AI_PRICING_USD_PER_MILLION: Dict[str, Dict[str, float]] = {
    # Governance budget rates. Override with PRIDICTA_AI_PRICING_JSON when
    # provider pricing changes, but never leave release governance cost-blind.
    "gpt-5.4-mini": {"inputPerMillion": 0.1, "outputPerMillion": 0.4},
    "gpt-5.5": {"inputPerMillion": 1.0, "outputPerMillion": 4.0},
    "gemini-2.5-flash": {"inputPerMillion": 0.1, "outputPerMillion": 0.4},
    "gemini-2.5-pro": {"inputPerMillion": 0.5, "outputPerMillion": 2.0},
    "birth-extraction-rules-v1": {"inputPerMillion": 0.0, "outputPerMillion": 0.0},
    "deterministic-batch-qa-local-runner": {
        "inputPerMillion": 0.0,
        "outputPerMillion": 0.0,
    },
    "jyotish-deterministic-v1": {"inputPerMillion": 0.0, "outputPerMillion": 0.0},
    "predicta-safety-protocol-v1": {"inputPerMillion": 0.0, "outputPerMillion": 0.0},
}


def ai_telemetry_store_path() -> Path:
    return Path(
        os.getenv("PRIDICTA_AI_TELEMETRY_STORE_PATH", "/tmp/predicta-ai-telemetry.json")
    )


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def latency_bucket(started_at: float) -> str:
    elapsed = max(0.0, perf_counter() - started_at)
    if elapsed < 1:
        return "lt_1s"
    if elapsed < 3:
        return "1_3s"
    if elapsed < 10:
        return "3_10s"
    if elapsed < 30:
        return "10_30s"
    return "over_30s"


def estimate_tokens(*parts: Optional[str]) -> int:
    text = "\n".join(part for part in parts if part)
    if not text:
        return 0
    return max(1, round(len(text) / 4))


def hash_ai_subject(parts: Iterable[str]) -> Optional[str]:
    raw = ":".join(part for part in parts if part)
    if not raw:
        return None
    digest = hashlib.sha256(f"predicta-ai-telemetry-v1:{raw}".encode("utf-8")).hexdigest()
    return f"ai_{digest[:48]}"


def pricing_config() -> Dict[str, Dict[str, float]]:
    config: Dict[str, Dict[str, float]] = {
        model: {
            "inputPerMillion": prices["inputPerMillion"],
            "outputPerMillion": prices["outputPerMillion"],
        }
        for model, prices in DEFAULT_AI_PRICING_USD_PER_MILLION.items()
    }
    raw = os.getenv("PRIDICTA_AI_PRICING_JSON")
    if not raw:
        return config
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    if not isinstance(parsed, dict):
        return {}

    for model, value in parsed.items():
        if not isinstance(model, str) or not isinstance(value, dict):
            continue
        input_price = value.get("inputPerMillion")
        output_price = value.get("outputPerMillion")
        if isinstance(input_price, (int, float)) and isinstance(output_price, (int, float)):
            config[model] = {
                "inputPerMillion": float(input_price),
                "outputPerMillion": float(output_price),
            }
    return config


def estimate_cost_usd(
    *,
    model: str,
    input_tokens: int,
    output_tokens: int,
) -> Optional[float]:
    prices = pricing_config().get(model)
    if not prices:
        return None

    cost = (
        (input_tokens / 1_000_000) * prices["inputPerMillion"]
        + (output_tokens / 1_000_000) * prices["outputPerMillion"]
    )
    return round(cost, 8)


def record_ai_telemetry_event(
    *,
    provider: str,
    model: str,
    feature: str,
    active_school: str,
    user_plan: Optional[UserPlan],
    intent: Optional[AIIntent],
    entitlement_source: Optional[str] = None,
    product_credit_source: Optional[str] = None,
    cache_state: str,
    fallback_reason: Optional[str],
    success: bool,
    latency_bucket_value: str,
    estimated_input_tokens: int,
    estimated_output_tokens: int,
    route: str,
    report_type: Optional[str] = None,
    prompt_cache_key: Optional[str] = None,
    provider_input_tokens: Optional[int] = None,
    provider_output_tokens: Optional[int] = None,
    provider_cached_input_tokens: Optional[int] = None,
    subject_hash: Optional[str] = None,
) -> AITelemetryEvent:
    provider_input = provider_input_tokens if provider_input_tokens is not None else None
    provider_output = provider_output_tokens if provider_output_tokens is not None else None
    cost_input = provider_input if provider_input is not None else estimated_input_tokens
    cost_output = provider_output if provider_output is not None else estimated_output_tokens

    event = AITelemetryEvent(
        activeSchool=active_school,
        cacheState=cache_state,  # type: ignore[arg-type]
        cacheHit=cache_state == "hit",
        createdAt=now_iso(),
        entitlementSource=entitlement_source,
        estimatedCostUsd=estimate_cost_usd(
            model=model,
            input_tokens=cost_input,
            output_tokens=cost_output,
        ),
        estimatedInputTokens=estimated_input_tokens,
        estimatedOutputTokens=estimated_output_tokens,
        fallbackReason=fallback_reason,
        feature=feature,
        id=f"ai-{uuid4().hex[:16]}",
        intent=intent,
        latencyBucket=latency_bucket_value,  # type: ignore[arg-type]
        model=model,
        productCreditSource=product_credit_source,
        promptCacheKey=prompt_cache_key,
        provider=provider,  # type: ignore[arg-type]
        providerCachedInputTokens=provider_cached_input_tokens,
        providerInputTokens=provider_input,
        providerOutputTokens=provider_output,
        reportType=report_type,
        route=route,
        subjectHash=subject_hash,
        success=success,
        userPlan=user_plan,
    )

    with _lock:
        store = load_ai_telemetry_store()
        store["events"].insert(0, event.model_dump())
        save_ai_telemetry_store(store)

    return event


def list_ai_telemetry_events() -> List[AITelemetryEvent]:
    with _lock:
        store = load_ai_telemetry_store()
        return [AITelemetryEvent(**item) for item in store["events"]]


def summarize_ai_telemetry(limit: int = 25) -> AITelemetrySummary:
    events = list_ai_telemetry_events()
    total_cost_values = [
        event.estimatedCostUsd for event in events if event.estimatedCostUsd is not None
    ]
    return AITelemetrySummary(
        byFeature=count_by(events, "feature"),
        byModel=count_by(events, "model"),
        byPlan=count_by_plan(events),
        byProvider=count_by(events, "provider"),
        estimatedCostUsdTotal=(
            round(sum(total_cost_values), 8) if total_cost_values else None
        ),
        failureEvents=sum(1 for event in events if not event.success),
        fallbackEvents=sum(1 for event in events if event.fallbackReason),
        generatedAt=now_iso(),
        latestEvents=events[:limit],
        totalEvents=len(events),
    )


def count_by(events: List[AITelemetryEvent], field: str) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for event in events:
        value = str(getattr(event, field))
        counts[value] = counts.get(value, 0) + 1
    return counts


def count_by_plan(events: List[AITelemetryEvent]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for event in events:
        value = event.userPlan or "unknown"
        counts[str(value)] = counts.get(str(value), 0) + 1
    return counts


def load_ai_telemetry_store() -> dict:
    path = ai_telemetry_store_path()
    if not path.exists():
        return {"events": []}
    try:
        raw = json.loads(path.read_text())
    except json.JSONDecodeError:
        return {"events": []}
    if not isinstance(raw, dict):
        return {"events": []}
    events = raw.get("events")
    if not isinstance(events, list):
        raw["events"] = []
    return raw


def save_ai_telemetry_store(store: dict) -> None:
    path = ai_telemetry_store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(store, indent=2, sort_keys=True))
