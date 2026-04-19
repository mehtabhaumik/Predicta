from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from backend.admin_api.rate_limit import (
    FixedWindowRateLimiter,
    RateLimitMiddleware,
    RateLimitRule,
    get_client_fingerprint,
)


class MovingClock:
    def __init__(self) -> None:
        self.value = 1000.0

    def __call__(self) -> float:
        return self.value

    def advance(self, seconds: float) -> None:
        self.value += seconds


def create_rate_limited_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware)

    @app.post("/generate-kundli")
    def generate_kundli():
        return {"ok": True}

    @app.get("/health")
    def health():
        return {"ok": True}

    return app


def test_fixed_window_limiter_denies_until_window_resets():
    clock = MovingClock()
    limiter = FixedWindowRateLimiter(now=clock)
    rule = RateLimitRule(limit=2, window_seconds=60)

    first = limiter.check("client-a", rule)
    second = limiter.check("client-a", rule)
    third = limiter.check("client-a", rule)

    assert first.allowed is True
    assert second.allowed is True
    assert third.allowed is False
    assert third.retry_after_seconds == 60

    clock.advance(61)
    reset = limiter.check("client-a", rule)
    assert reset.allowed is True
    assert reset.remaining == 1


def test_generate_kundli_rate_limit_is_enforced_per_client(monkeypatch):
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_ENABLED", "true")
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_KUNDLI_PER_MINUTE", "2")
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_KUNDLI_PER_HOUR", "100")

    client = TestClient(create_rate_limited_app())
    headers = {"x-forwarded-for": "203.0.113.10"}

    assert client.post("/generate-kundli", headers=headers).status_code == 200
    assert client.post("/generate-kundli", headers=headers).status_code == 200

    limited = client.post("/generate-kundli", headers=headers)
    assert limited.status_code == 429
    assert limited.json()["detail"] == "Too many requests. Please wait a moment and try again."
    assert int(limited.headers["Retry-After"]) > 0

    other_client = client.post(
        "/generate-kundli",
        headers={"x-forwarded-for": "203.0.113.11"},
    )
    assert other_client.status_code == 200


def test_health_endpoint_is_not_rate_limited(monkeypatch):
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_ENABLED", "true")

    client = TestClient(create_rate_limited_app())

    for _ in range(25):
        assert client.get("/health").status_code == 200


def test_rate_limit_can_be_disabled_for_controlled_local_runs(monkeypatch):
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_ENABLED", "false")
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_KUNDLI_PER_MINUTE", "1")

    client = TestClient(create_rate_limited_app())

    assert client.post("/generate-kundli").status_code == 200
    assert client.post("/generate-kundli").status_code == 200


def test_client_fingerprint_prefers_first_forwarded_hop():
    app = create_rate_limited_app()

    @app.get("/fingerprint")
    def fingerprint(request: Request):
        return {"fingerprint": get_client_fingerprint(request)}

    client = TestClient(app)
    response = client.get(
        "/fingerprint",
        headers={"x-forwarded-for": "198.51.100.1, 10.0.0.1"},
    )

    assert response.json()["fingerprint"] == "198.51.100.1"
