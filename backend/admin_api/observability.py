from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from dataclasses import asdict, dataclass
from typing import Callable, Optional
from uuid import uuid4

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from .rate_limit import get_client_fingerprint

LOGGER_NAME = "predicta.backend.observability"


@dataclass(frozen=True)
class CostEventClassification:
    category: str
    cost_weight: int
    risk_level: str


@dataclass(frozen=True)
class RequestObservation:
    category: str
    clientFingerprintHash: str
    costWeight: int
    durationMs: int
    method: str
    outcome: str
    path: str
    requestId: str
    riskLevel: str
    statusCode: int


def observability_enabled() -> bool:
    return os.getenv("PREDICTA_OBSERVABILITY_ENABLED", "true").strip().lower() not in {
        "0",
        "false",
        "no",
    }


def get_observability_logger() -> logging.Logger:
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(logging.INFO)
    return logger


def classify_cost_event(path: str) -> CostEventClassification:
    if path == "/generate-kundli":
        return CostEventClassification(
            category="kundli_calculation",
            cost_weight=4,
            risk_level="medium",
        )

    if path == "/access/pass-codes/redeem":
        return CostEventClassification(
            category="guest_pass_redemption",
            cost_weight=2,
            risk_level="high",
        )

    if path.startswith("/admin/"):
        return CostEventClassification(
            category="admin_authority",
            cost_weight=2,
            risk_level="high",
        )

    if path == "/billing/verify":
        return CostEventClassification(
            category="billing_verification",
            cost_weight=3,
            risk_level="high",
        )

    if path == "/health":
        return CostEventClassification(
            category="health",
            cost_weight=0,
            risk_level="low",
        )

    return CostEventClassification(
        category="general_backend",
        cost_weight=1,
        risk_level="low",
    )


def hash_client_fingerprint(fingerprint: str) -> str:
    salt = os.getenv("PREDICTA_OBSERVABILITY_HASH_SALT", "predicta-backend")
    digest = hashlib.sha256(f"{salt}:{fingerprint}".encode("utf-8")).hexdigest()
    return digest[:24]


def get_request_id(request: Request) -> str:
    explicit_id = request.headers.get("x-request-id")
    if explicit_id:
        return explicit_id.strip()[:80]

    cloud_trace = request.headers.get("x-cloud-trace-context")
    if cloud_trace:
        return cloud_trace.split("/", 1)[0].strip()[:80]

    return f"req_{uuid4().hex}"


def get_outcome(status_code: int) -> str:
    if status_code == 429:
        return "rate_limited"
    if status_code >= 500:
        return "server_error"
    if status_code >= 400:
        return "client_error"
    return "success"


def emit_request_observation(
    observation: RequestObservation,
    logger: Optional[logging.Logger] = None,
) -> None:
    target_logger = logger or get_observability_logger()
    payload = {
        "event": "backend_request",
        **asdict(observation),
    }
    serialized = json.dumps(payload, separators=(",", ":"), sort_keys=True)

    if observation.outcome == "server_error":
        target_logger.error(serialized)
    elif observation.outcome in {"client_error", "rate_limited"}:
        target_logger.warning(serialized)
    else:
        target_logger.info(serialized)


class ObservabilityMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        clock: Optional[Callable[[], float]] = None,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        super().__init__(app)
        self._clock = clock or time.perf_counter
        self._logger = logger or get_observability_logger()

    async def dispatch(self, request: Request, call_next) -> Response:
        if not observability_enabled():
            return await call_next(request)

        started_at = self._clock()
        request_id = get_request_id(request)
        classification = classify_cost_event(request.url.path)
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            duration_ms = int(max((self._clock() - started_at) * 1000, 0))
            observation = RequestObservation(
                category=classification.category,
                clientFingerprintHash=hash_client_fingerprint(
                    get_client_fingerprint(request)
                ),
                costWeight=classification.cost_weight,
                durationMs=duration_ms,
                method=request.method,
                outcome=get_outcome(status_code),
                path=request.url.path,
                requestId=request_id,
                riskLevel=classification.risk_level,
                statusCode=status_code,
            )
            emit_request_observation(observation, self._logger)
