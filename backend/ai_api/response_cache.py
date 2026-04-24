from __future__ import annotations

import hashlib
import json
import os
from threading import RLock
import time
from dataclasses import dataclass
from typing import Dict, Optional

from .models import PridictaAIRequest, PridictaAIResponse


@dataclass
class CachedAIResponse:
    expires_at: float
    response: PridictaAIResponse


_response_cache: Dict[str, CachedAIResponse] = {}
_response_cache_lock = RLock()


def response_cache_enabled() -> bool:
    return os.getenv("PREDICTA_AI_RESPONSE_CACHE_ENABLED", "true").lower() not in {
        "0",
        "false",
        "no",
    }


def get_ai_response_cache_ttl_seconds() -> int:
    return _env_int("PREDICTA_AI_RESPONSE_CACHE_TTL_SECONDS", 60 * 60 * 24 * 7)


def get_ai_response_cache_max_entries() -> int:
    return _env_int("PREDICTA_AI_RESPONSE_CACHE_MAX_ENTRIES", 500)


def build_ai_response_cache_key(
    *,
    model: str,
    request: PridictaAIRequest,
) -> str:
    payload = {
        "chartContext": request.chartContext.model_dump() if request.chartContext else None,
        "deepAnalysis": request.deepAnalysis,
        "inputHash": request.kundli.calculationMeta.inputHash if request.kundli else None,
        "message": normalize_question(request.message),
        "model": model,
        "preferredLanguage": request.preferredLanguage,
        "userPlan": request.userPlan,
    }
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def can_use_ai_response_cache(request: PridictaAIRequest) -> bool:
    # Follow-ups can depend on recent conversation state. Cache only standalone
    # first questions where the chart, question, model, and input hash fully
    # describe the answer.
    return response_cache_enabled() and not request.history and request.kundli is not None


def get_cached_ai_response(cache_key: str) -> Optional[PridictaAIResponse]:
    with _response_cache_lock:
        cached = _response_cache.get(cache_key)
        if not cached:
            return None

        if cached.expires_at <= time.time():
            _response_cache.pop(cache_key, None)
            return None

        return cached.response


def set_cached_ai_response(cache_key: str, response: PridictaAIResponse) -> None:
    if not response_cache_enabled():
        return

    with _response_cache_lock:
        _prune_cache_locked()
        _response_cache[cache_key] = CachedAIResponse(
            expires_at=time.time() + get_ai_response_cache_ttl_seconds(),
            response=response,
        )


def get_ai_response_cache_size() -> int:
    with _response_cache_lock:
        _prune_cache_locked()
        return len(_response_cache)


def normalize_question(question: str) -> str:
    return " ".join(question.strip().lower().split())


def _prune_cache_locked() -> None:
    now = time.time()
    for key, cached in list(_response_cache.items()):
        if cached.expires_at <= now:
            _response_cache.pop(key, None)

    max_entries = get_ai_response_cache_max_entries()
    if len(_response_cache) < max_entries:
        return

    oldest_keys = sorted(_response_cache, key=lambda key: _response_cache[key].expires_at)
    for key in oldest_keys[: max(1, len(_response_cache) - max_entries + 1)]:
        _response_cache.pop(key, None)


def _env_int(name: str, default: int) -> int:
    try:
        return max(int(os.getenv(name, str(default))), 1)
    except ValueError:
        return default
