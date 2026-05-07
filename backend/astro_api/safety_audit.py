from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Iterable, List, Optional
from uuid import uuid4

from .models import SafetyAuditEvent, SafetyReportRequest, SafetyReviewRequest

_lock = RLock()


def safety_audit_store_path() -> Path:
    return Path(
        os.getenv("PRIDICTA_SAFETY_AUDIT_STORE_PATH", "/tmp/pridicta-safety-audit.json")
    )


def create_safety_audit_event(
    request: SafetyReportRequest,
    fallback_identifier_parts: Iterable[str],
) -> SafetyAuditEvent:
    with _lock:
        store = load_safety_audit_store()
        event = SafetyAuditEvent(
            createdAt=now_iso(),
            id=f"safety-{uuid4().hex[:16]}",
            model=request.model or "unknown",
            provider=request.provider or "unknown",
            reportKind=request.reportKind,
            reviewStatus="OPEN",
            route=request.route,
            safetyCategories=normalize_categories(request.safetyCategories),
            safetyIdentifierHash=hash_safety_identifier(
                request.safetyIdentifier,
                fallback_identifier_parts,
            ),
            sourceSurface=request.sourceSurface,
        )
        store["events"].insert(0, event.model_dump())
        save_safety_audit_store(store)
        return event


def list_safety_audit_events() -> List[SafetyAuditEvent]:
    with _lock:
        store = load_safety_audit_store()
        return [SafetyAuditEvent(**item) for item in store["events"]]


def review_safety_audit_event(
    event_id: str,
    request: SafetyReviewRequest,
) -> SafetyAuditEvent:
    with _lock:
        store = load_safety_audit_store()
        for index, raw_event in enumerate(store["events"]):
            if raw_event.get("id") != event_id:
                continue

            event = SafetyAuditEvent(**raw_event)
            event.reviewStatus = request.reviewStatus
            event.reviewedAt = now_iso()
            event.reviewedBy = request.reviewedBy or "owner-review"
            event.reviewNote = request.reviewNote
            store["events"][index] = event.model_dump()
            save_safety_audit_store(store)
            return event

    raise KeyError(event_id)


def maybe_record_ai_safety_audit(
    *,
    categories: List[str],
    input_hash_parts: Iterable[str],
    model: str,
    provider: str,
    route: str,
    safety_identifier: Optional[str],
) -> Optional[SafetyAuditEvent]:
    report_kind = classify_report_kind(categories)

    if not report_kind:
        return None

    return create_safety_audit_event(
        SafetyReportRequest(
            model=model,
            provider=provider,
            reportKind=report_kind,
            route=route,
            safetyCategories=categories,
            safetyIdentifier=safety_identifier,
            sourceSurface="ai-response",
        ),
        input_hash_parts,
    )


def classify_report_kind(categories: List[str]) -> Optional[str]:
    if any(category in {"self-harm", "illicit-violent", "sexual-minors", "input-length"} for category in categories):
        return "BLOCKED"
    if any(
        category
        in {
            "fatalistic-certainty",
            "professional-certainty",
            "unsafe-instructions",
            "fake-nadi-claim",
        }
        for category in categories
    ):
        return "OUTPUT_REWRITTEN"
    if any(category.startswith("high-stakes:") for category in categories):
        return "HIGH_STAKES"
    if "low-confidence" in categories:
        return "LOW_CONFIDENCE"
    return None


def normalize_categories(categories: List[str]) -> List[str]:
    return list(dict.fromkeys(category.strip() for category in categories if category.strip()))


def hash_safety_identifier(
    raw_identifier: Optional[str],
    fallback_parts: Iterable[str],
) -> str:
    raw = raw_identifier or ":".join(part for part in fallback_parts if part)
    digest = hashlib.sha256(f"predicta-hitl-v1:{raw}".encode("utf-8")).hexdigest()
    return f"hitl_{digest[:48]}"


def load_safety_audit_store() -> dict:
    path = safety_audit_store_path()

    if not path.exists():
        return {"events": []}

    try:
        raw = json.loads(path.read_text())
    except json.JSONDecodeError:
        return {"events": []}

    if not isinstance(raw.get("events"), list):
        raw["events"] = []
    return raw


def save_safety_audit_store(store: dict) -> None:
    path = safety_audit_store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(store, indent=2, sort_keys=True))


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
