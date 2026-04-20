from __future__ import annotations

import hashlib
import json
import os
from threading import RLock
import time
from dataclasses import dataclass
from typing import Dict, Optional

from .models import BirthDetails, KundliData


@dataclass
class CachedKundli:
    expires_at: float
    kundli: KundliData


_kundli_cache: Dict[str, CachedKundli] = {}
_kundli_cache_lock = RLock()


def kundli_cache_enabled() -> bool:
    return os.getenv("PREDICTA_KUNDLI_CACHE_ENABLED", "true").lower() not in {
        "0",
        "false",
        "no",
    }


def get_kundli_cache_ttl_seconds() -> int:
    return _env_int("PREDICTA_KUNDLI_CACHE_TTL_SECONDS", 60 * 60 * 24 * 30)


def get_kundli_cache_max_entries() -> int:
    return _env_int("PREDICTA_KUNDLI_CACHE_MAX_ENTRIES", 1000)


def build_kundli_cache_key(details: BirthDetails) -> str:
    return hashlib.sha256(
        json.dumps(
            details.model_dump(),
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    ).hexdigest()


def get_cached_kundli(details: BirthDetails) -> Optional[KundliData]:
    if not kundli_cache_enabled():
        return None

    cache_key = build_kundli_cache_key(details)

    with _kundli_cache_lock:
        cached = _kundli_cache.get(cache_key)
        if not cached:
            return None

        if cached.expires_at <= time.time():
            _kundli_cache.pop(cache_key, None)
            return None

        return cached.kundli


def set_cached_kundli(kundli: KundliData) -> None:
    if not kundli_cache_enabled():
        return

    with _kundli_cache_lock:
        _prune_cache_locked()
        _kundli_cache[build_kundli_cache_key(kundli.birthDetails)] = CachedKundli(
            expires_at=time.time() + get_kundli_cache_ttl_seconds(),
            kundli=kundli,
        )


def get_kundli_cache_size() -> int:
    with _kundli_cache_lock:
        _prune_cache_locked()
        return len(_kundli_cache)


def _prune_cache_locked() -> None:
    now = time.time()
    for key, cached in list(_kundli_cache.items()):
        if cached.expires_at <= now:
            _kundli_cache.pop(key, None)

    max_entries = get_kundli_cache_max_entries()
    if len(_kundli_cache) < max_entries:
        return

    oldest_keys = sorted(_kundli_cache, key=lambda key: _kundli_cache[key].expires_at)
    for key in oldest_keys[: max(1, len(_kundli_cache) - max_entries + 1)]:
        _kundli_cache.pop(key, None)


def _env_int(name: str, default: int) -> int:
    try:
        return max(int(os.getenv(name, str(default))), 1)
    except ValueError:
        return default
