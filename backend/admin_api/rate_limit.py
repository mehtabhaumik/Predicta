from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Callable, Dict, Iterable, Optional, Tuple

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


@dataclass(frozen=True)
class RateLimitRule:
    limit: int
    window_seconds: int


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    limit: int
    remaining: int
    reset_seconds: int
    retry_after_seconds: int = 0


class FixedWindowRateLimiter:
    """Small in-process fixed-window limiter for backend edge protection.

    This is intentionally dependency-free so the backend keeps running on Cloud
    Run without Redis. It protects each warm instance. For strict distributed
    enforcement, pair it with Cloud Armor, API Gateway, or a shared store.
    """

    def __init__(self, now: Callable[[], float] | None = None) -> None:
        self._now = now or time.monotonic
        self._buckets: Dict[str, Tuple[int, float]] = {}

    def check(self, key: str, rule: RateLimitRule) -> RateLimitDecision:
        current = self._now()
        bucket_key = f"{key}:{rule.window_seconds}"
        count, reset_at = self._buckets.get(
            bucket_key,
            (0, current + rule.window_seconds),
        )

        if current >= reset_at:
            count = 0
            reset_at = current + rule.window_seconds

        next_count = count + 1
        reset_seconds = max(int(reset_at - current), 1)

        if next_count > rule.limit:
            self._buckets[bucket_key] = (count, reset_at)
            return RateLimitDecision(
                allowed=False,
                limit=rule.limit,
                remaining=0,
                reset_seconds=reset_seconds,
                retry_after_seconds=reset_seconds,
            )

        self._buckets[bucket_key] = (next_count, reset_at)
        self._prune(current)
        return RateLimitDecision(
            allowed=True,
            limit=rule.limit,
            remaining=max(rule.limit - next_count, 0),
            reset_seconds=reset_seconds,
        )

    def check_many(
        self,
        key: str,
        rules: Iterable[RateLimitRule],
    ) -> RateLimitDecision:
        decisions = [self.check(key, rule) for rule in rules]
        denied = [decision for decision in decisions if not decision.allowed]
        if denied:
            return max(denied, key=lambda decision: decision.retry_after_seconds)
        return min(decisions, key=lambda decision: decision.remaining)

    def _prune(self, current: float) -> None:
        if len(self._buckets) < 5000:
            return
        expired = [
            bucket_key
            for bucket_key, (_, reset_at) in self._buckets.items()
            if current >= reset_at
        ]
        for bucket_key in expired:
            self._buckets.pop(bucket_key, None)


def _env_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        value = int(raw_value)
    except ValueError:
        return default
    return max(value, 1)


def rate_limit_enabled() -> bool:
    return os.getenv("PREDICTA_RATE_LIMIT_ENABLED", "true").strip().lower() not in {
        "0",
        "false",
        "no",
    }


def get_client_fingerprint(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        first_hop = forwarded_for.split(",", 1)[0].strip()
        if first_hop:
            return first_hop

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    if request.client and request.client.host:
        return request.client.host

    return "unknown-client"


def get_rate_limit_rules(path: str) -> Tuple[RateLimitRule, ...]:
    minute = _env_int("PREDICTA_RATE_LIMIT_MINUTE_WINDOW_SECONDS", 60)
    hour = _env_int("PREDICTA_RATE_LIMIT_HOUR_WINDOW_SECONDS", 3600)

    if path == "/health":
        return ()

    if path == "/generate-kundli":
        return (
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_KUNDLI_PER_MINUTE", 12),
                minute,
            ),
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_KUNDLI_PER_HOUR", 120),
                hour,
            ),
        )

    if path == "/access/pass-codes/redeem":
        return (
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_PASS_REDEEM_PER_MINUTE", 5),
                minute,
            ),
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_PASS_REDEEM_PER_HOUR", 24),
                hour,
            ),
        )

    if path.startswith("/admin/"):
        return (
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_ADMIN_PER_MINUTE", 30),
                minute,
            ),
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_ADMIN_PER_HOUR", 300),
                hour,
            ),
        )

    if path == "/billing/verify":
        return (
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_BILLING_PER_MINUTE", 20),
                minute,
            ),
            RateLimitRule(
                _env_int("PREDICTA_RATE_LIMIT_BILLING_PER_HOUR", 120),
                hour,
            ),
        )

    return (
        RateLimitRule(_env_int("PREDICTA_RATE_LIMIT_DEFAULT_PER_MINUTE", 90), minute),
        RateLimitRule(_env_int("PREDICTA_RATE_LIMIT_DEFAULT_PER_HOUR", 1200), hour),
    )


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limiter: Optional[FixedWindowRateLimiter] = None) -> None:
        super().__init__(app)
        self._limiter = limiter or FixedWindowRateLimiter()

    async def dispatch(self, request: Request, call_next) -> Response:
        if not rate_limit_enabled():
            return await call_next(request)

        rules = get_rate_limit_rules(request.url.path)
        if not rules:
            return await call_next(request)

        client_key = get_client_fingerprint(request)
        rate_key = f"{request.method}:{request.url.path}:{client_key}"
        decision = self._limiter.check_many(rate_key, rules)
        if not decision.allowed:
            return JSONResponse(
                content={
                    "detail": "Too many requests. Please wait a moment and try again."
                },
                headers={
                    "Retry-After": str(decision.retry_after_seconds),
                    "X-RateLimit-Limit": str(decision.limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(decision.reset_seconds),
                },
                status_code=429,
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(decision.limit)
        response.headers["X-RateLimit-Remaining"] = str(decision.remaining)
        response.headers["X-RateLimit-Reset"] = str(decision.reset_seconds)
        return response
