from fastapi.testclient import TestClient
import pytest

from backend.ai_api import providers
from backend.ai_api.providers import AIProviderError, AIProviderUnavailable
from backend.ai_api import routes as ai_routes
from backend.ai_api import response_cache
from backend.astro_api.calculations import generate_kundli
from backend.astro_api.main import app
from backend.astro_api.models import BirthDetails


VALID_BIRTH = {
    "name": "Aarav Mehta",
    "date": "1994-08-16",
    "time": "06:42",
    "place": "Mumbai, India",
    "latitude": 19.076,
    "longitude": 72.8777,
    "timezone": "Asia/Kolkata",
}


@pytest.fixture(autouse=True)
def disable_rate_limit_for_ai_tests(monkeypatch):
    monkeypatch.setenv("PREDICTA_RATE_LIMIT_ENABLED", "false")


def build_request(**overrides):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH)).model_dump()
    payload = {
        "message": "What does my D10 say about career timing?",
        "kundli": kundli,
        "chartContext": {
            "chartType": "D10",
            "chartName": "Dashamsha",
            "purpose": "Career and responsibility",
            "sourceScreen": "Charts",
        },
        "history": [{"role": "user", "text": "Please keep it concise."}],
        "userPlan": "PREMIUM",
    }
    payload.update(overrides)
    return payload


def test_ai_endpoint_uses_gemini_compaction_then_openai(monkeypatch):
    response_cache._response_cache.clear()
    captured = {}

    async def fake_compact_with_gemini(*, model, prompt):
        captured["gemini_model"] = model
        captured["gemini_prompt"] = prompt
        return "compact kundli context"

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        captured["openai_model"] = model
        captured["messages"] = list(messages)
        captured["max_output_tokens"] = max_output_tokens
        return "This is the server-side Predicta answer."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(deepAnalysis=True),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "openai"
    assert body["compactedWithGemini"] is True
    assert body["text"] == "This is the server-side Predicta answer."
    assert body["model"] == "gpt-5.2"
    assert captured["gemini_model"] == "gemini-2.5-flash"
    assert "compact kundli context" in captured["messages"][1]["content"]
    assert captured["max_output_tokens"] == 720


def test_ai_endpoint_continues_without_gemini_compaction(monkeypatch):
    response_cache._response_cache.clear()
    captured = {}

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        captured["messages"] = list(messages)
        return "OpenAI answer without Gemini compaction."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post("/ai/pridicta", json=build_request())

    assert response.status_code == 200
    assert response.json()["compactedWithGemini"] is False
    assert "birthSummary" in captured["messages"][1]["content"]


def test_ai_endpoint_falls_back_to_gemini_when_openai_is_unavailable(monkeypatch):
    response_cache._response_cache.clear()

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        raise AIProviderUnavailable("PREDICTA_OPENAI_API_KEY is not configured on the backend.")

    async def fake_generate_gemini_response(
        *, max_output_tokens, model, system_prompt, user_prompt
    ):
        assert "Predicta" in system_prompt
        assert "User question:" in user_prompt
        return "Gemini fallback answer."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)
    monkeypatch.setattr(ai_routes, "generate_gemini_response", fake_generate_gemini_response)

    response = TestClient(app).post("/ai/pridicta", json=build_request())

    assert response.status_code == 200
    body = response.json()
    assert body["model"] == "gemini-2.5-flash"
    assert body["provider"] == "gemini"
    assert body["text"] == "Gemini fallback answer."
    assert body["usedDeepModel"] is False


def test_ai_endpoint_falls_back_to_gemini_on_openai_billing_error(monkeypatch):
    response_cache._response_cache.clear()

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        raise AIProviderError(
            "OpenAI request failed.",
            provider="openai",
            response_body="billing hard limit reached",
            status_code=429,
        )

    async def fake_generate_gemini_response(
        *, max_output_tokens, model, system_prompt, user_prompt
    ):
        return "Billing fallback answer."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)
    monkeypatch.setattr(ai_routes, "generate_gemini_response", fake_generate_gemini_response)

    response = TestClient(app).post("/ai/pridicta", json=build_request())

    assert response.status_code == 200
    assert response.json()["provider"] == "gemini"
    assert response.json()["text"] == "Billing fallback answer."


def test_ai_endpoint_reports_unavailable_when_both_final_providers_fail(monkeypatch):
    response_cache._response_cache.clear()

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        raise AIProviderUnavailable("PREDICTA_OPENAI_API_KEY is not configured on the backend.")

    async def fake_generate_gemini_response(
        *, max_output_tokens, model, system_prompt, user_prompt
    ):
        raise AIProviderUnavailable("Gemini is not configured on the backend.")

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)
    monkeypatch.setattr(ai_routes, "generate_gemini_response", fake_generate_gemini_response)

    response = TestClient(app).post("/ai/pridicta", json=build_request())

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "Predicta guidance is temporarily unavailable. Please try again shortly."
    )


def test_ai_endpoint_short_circuits_small_talk_without_provider_calls(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0, "gemini": 0}

    async def fake_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "Should not be used."

    async def fake_gemini_response(
        *, max_output_tokens, model, system_prompt, user_prompt
    ):
        calls["gemini"] += 1
        return "Should not be used."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_openai_response)
    monkeypatch.setattr(ai_routes, "generate_gemini_response", fake_gemini_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(message="Hi Predicta"),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "local"
    assert body["model"] == "predicta-small-talk"
    assert body["intent"] == "simple"
    assert "Hello. I am here." in body["text"]
    assert calls["openai"] == 0
    assert calls["gemini"] == 0


def test_ai_endpoint_caches_standalone_first_question(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return f"Cached response {calls['openai']}"

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    client = TestClient(app)
    payload = build_request(history=[])
    first = client.post("/ai/pridicta", json=payload)
    second = client.post("/ai/pridicta", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.headers["X-Predicta-Cache"] == "MISS"
    assert second.headers["X-Predicta-Cache"] == "HIT"
    assert first.json()["text"] == second.json()["text"]
    assert calls["openai"] == 1


def test_ai_endpoint_marks_followup_cache_bypass(monkeypatch):
    response_cache._response_cache.clear()

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        return "Follow-up answer."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post("/ai/pridicta", json=build_request())

    assert response.status_code == 200
    assert response.headers["X-Predicta-Cache"] == "BYPASS"


def test_ai_prompt_context_and_history_are_bounded(monkeypatch):
    monkeypatch.setattr(ai_routes, "MAX_CONTEXT_CHARS", 180)
    monkeypatch.setattr(ai_routes, "MAX_HISTORY_CHARS_PER_TURN", 48)
    captured = {}

    async def fake_compact_with_gemini(*, model, prompt):
        return "compact " + ("x" * 500)

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        captured["messages"] = list(messages)
        return "Bounded answer."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(
            history=[
                {"role": "user", "text": "Please review " + ("long history " * 40)}
            ]
        ),
    )

    assert response.status_code == 200
    user_prompt = captured["messages"][1]["content"]
    assert "[Trimmed for focus.]" in user_prompt
    assert len(user_prompt) < 1400


def test_provider_timeouts_are_env_configurable(monkeypatch):
    monkeypatch.setenv("PREDICTA_OPENAI_TIMEOUT_SECONDS", "2.5")
    monkeypatch.setenv("PREDICTA_GEMINI_TIMEOUT_SECONDS", "1.5")

    assert providers.get_openai_timeout_seconds() == 2.5
    assert providers.get_gemini_timeout_seconds() == 1.5


def test_provider_timeout_env_falls_back_safely(monkeypatch):
    monkeypatch.setenv("PREDICTA_OPENAI_TIMEOUT_SECONDS", "not-a-number")
    monkeypatch.setenv("PREDICTA_GEMINI_TIMEOUT_SECONDS", "0")

    assert providers.get_openai_timeout_seconds() == 30
    assert providers.get_gemini_timeout_seconds() == 0.1


def test_provider_extractors_handle_current_api_shapes():
    assert (
        providers.extract_openai_text({"output_text": "Direct response"}).strip()
        == "Direct response"
    )
    assert (
        providers.extract_openai_text(
            {"output": [{"content": [{"text": "Nested response"}]}]}
        ).strip()
        == "Nested response"
    )
    assert (
        providers.extract_gemini_text(
            {"candidates": [{"content": {"parts": [{"text": "Gemini summary"}]}}]}
        ).strip()
        == "Gemini summary"
    )
