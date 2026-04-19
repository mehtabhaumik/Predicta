import json
import logging

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.admin_api.observability import (
    LOGGER_NAME,
    ObservabilityMiddleware,
    classify_cost_event,
    get_outcome,
    hash_client_fingerprint,
)


def create_observed_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(ObservabilityMiddleware)

    @app.post("/generate-kundli")
    def generate_kundli():
        return {"ok": True}

    @app.post("/access/pass-codes/redeem")
    def redeem_pass():
        return {"detail": "Too many requests. Please wait a moment and try again."}, 429

    return app


def parse_observation(message: str) -> dict:
    payload = json.loads(message)
    assert payload["event"] == "backend_request"
    return payload


def test_cost_event_classification_marks_expensive_and_sensitive_paths():
    assert classify_cost_event("/generate-kundli").category == "kundli_calculation"
    assert classify_cost_event("/generate-kundli").cost_weight == 4
    assert classify_cost_event("/access/pass-codes/redeem").risk_level == "high"
    assert classify_cost_event("/admin/pass-codes").category == "admin_authority"
    assert classify_cost_event("/health").cost_weight == 0


def test_outcome_categories_are_stable():
    assert get_outcome(200) == "success"
    assert get_outcome(422) == "client_error"
    assert get_outcome(429) == "rate_limited"
    assert get_outcome(500) == "server_error"


def test_client_fingerprint_hash_is_stable_and_not_raw():
    hashed = hash_client_fingerprint("203.0.113.10")

    assert hashed == hash_client_fingerprint("203.0.113.10")
    assert hashed != "203.0.113.10"
    assert len(hashed) == 24


def test_observability_log_is_structured_and_redacted(caplog):
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)
    client = TestClient(create_observed_app())

    response = client.post(
        "/generate-kundli",
        headers={
            "authorization": "Bearer sensitive-token",
            "x-forwarded-for": "203.0.113.10",
            "x-request-id": "request-from-client",
        },
        json={
            "name": "Private Person",
            "place": "Mumbai",
            "rawPassCode": "PREDICTA-PRIVATE",
        },
    )

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "request-from-client"
    assert len(caplog.records) == 1

    logged_text = caplog.records[0].getMessage()
    observation = parse_observation(logged_text)
    assert observation["category"] == "kundli_calculation"
    assert observation["costWeight"] == 4
    assert observation["outcome"] == "success"
    assert observation["path"] == "/generate-kundli"
    assert observation["requestId"] == "request-from-client"

    assert "sensitive-token" not in logged_text
    assert "Private Person" not in logged_text
    assert "PREDICTA-PRIVATE" not in logged_text
    assert "203.0.113.10" not in logged_text


def test_observability_can_be_disabled(monkeypatch, caplog):
    monkeypatch.setenv("PREDICTA_OBSERVABILITY_ENABLED", "false")
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    client = TestClient(create_observed_app())
    response = client.post("/generate-kundli")

    assert response.status_code == 200
    assert caplog.records == []
