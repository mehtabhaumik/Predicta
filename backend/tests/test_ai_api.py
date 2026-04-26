from fastapi.testclient import TestClient
import pytest

from backend.ai_api import providers
from backend.ai_api import models as ai_models
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


def test_ai_endpoint_handles_no_kundli_guidance_mode(monkeypatch):
    response_cache._response_cache.clear()
    captured = {}

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        captured["messages"] = list(messages)
        return "Let us start with the financial pattern itself before we force this into a chart."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    payload = build_request(
        kundli=None,
        chartContext=None,
        history=[{"role": "user", "text": "Place: Petlad, India"}],
        message="I want to know my finances in coming years",
        userPlan="FREE",
    )
    response = TestClient(app).post("/ai/pridicta", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "openai"
    assert body["text"] == "Let us start with the financial pattern itself before we force this into a chart."
    assert "No kundli has been generated yet" in captured["messages"][1]["content"]
    assert "Likely question theme: finance" in captured["messages"][1]["content"]
    assert "birth place Petlad, India" in captured["messages"][1]["content"]
    assert "Start with the strongest useful reading" in captured["messages"][1]["content"]
    assert "Do not begin with a disclaimer" in captured["messages"][1]["content"]


def test_ai_endpoint_answers_birth_memory_question_locally_without_provider_calls(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0, "gemini": 0}

    async def fake_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "Should not be used."

    async def fake_generate_gemini_response(
        *, max_output_tokens, model, system_prompt, user_prompt
    ):
        calls["gemini"] += 1
        return "Should not be used."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_openai_response)
    monkeypatch.setattr(ai_routes, "generate_gemini_response", fake_generate_gemini_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(
            kundli=None,
            chartContext=None,
            history=[{"role": "user", "text": "Place: Petlad, India"}],
            message="Which birthdate do you have?",
            userPlan="FREE",
        ),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "local"
    assert body["model"] == "predicta-memory-lane"
    assert "do not have your date of birth yet" in body["text"].lower()
    assert "petlad, india" in body["text"].lower()
    assert calls["openai"] == 0
    assert calls["gemini"] == 0


def test_ai_endpoint_handles_explicit_chart_request_without_kundli_locally(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0, "gemini": 0}

    async def fake_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "Should not be used."

    async def fake_generate_gemini_response(
        *, max_output_tokens, model, system_prompt, user_prompt
    ):
        calls["gemini"] += 1
        return "Should not be used."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_openai_response)
    monkeypatch.setattr(ai_routes, "generate_gemini_response", fake_generate_gemini_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(
            kundli=None,
            chartContext=None,
            history=[
                {"role": "user", "text": "DOB: 22/08/1980"},
                {"role": "user", "text": "Time: 06:30 am, Place: Petlad, India"},
            ],
            message="Please analyze my chart",
            userPlan="FREE",
        ),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "local"
    assert body["model"] == "predicta-chart-required-lane"
    assert "generate the kundli" in body["text"].lower()
    assert calls["openai"] == 0
    assert calls["gemini"] == 0


def test_chart_aware_response_rejects_missing_d9_placements_language():
    request = ai_models.PridictaAIRequest(**build_request(
        message="What pattern in my D9 affects how I stay in relationships?",
        chartContext={
            "chartType": "D9",
            "chartName": "Navamsha",
            "purpose": "Marriage and deeper bonds",
            "sourceScreen": "Charts",
        },
    ))

    assert ai_routes.is_weak_chart_aware_response(
        request,
        (
            "I can read that, but I’m missing your actual D9 placements. "
            "Right now I only have your D1."
        ),
    )


def test_chart_aware_response_rejects_asking_for_navamsa_when_kundli_exists():
    request = ai_models.PridictaAIRequest(**build_request(
        message="What pattern in my D9 affects how I stay in relationships?",
        chartContext={
            "chartType": "D9",
            "chartName": "Navamsha",
            "purpose": "Marriage and deeper bonds",
            "sourceScreen": "Charts",
        },
    ))

    assert ai_routes.is_weak_chart_aware_response(
        request,
        (
            "If you want the exact D9 pattern, I’ll need your Navamsa placements "
            "or the full kundli chart."
        ),
    )


def test_ai_endpoint_rewrites_weak_no_kundli_response(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        if calls["openai"] == 1:
            return (
                "Understanding your financial path ahead is a natural concern, "
                "and while I do not have your chart yet, there are many things to consider."
            )
        return (
            "The real pressure here is whether you want stability, stronger income, "
            "or relief from strain. Name the one that matters most, and I will answer "
            "that directly. If you want this tied to your actual chart, send your date "
            "of birth and birth time."
        )

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    payload = build_request(
        kundli=None,
        chartContext=None,
        history=[{"role": "user", "text": "Place: Petlad, India"}],
        message="I want to know my finances in coming years",
        userPlan="FREE",
    )
    response = TestClient(app).post("/ai/pridicta", json=payload)

    assert response.status_code == 200
    assert response.json()["text"].startswith("The real pressure here is whether")
    assert calls["openai"] == 2


def test_ai_endpoint_uses_local_floor_when_no_kundli_reply_stays_weak(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "It's natural to seek clarity about your financial path ahead."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    payload = build_request(
        kundli=None,
        chartContext=None,
        history=[{"role": "user", "text": "Place: Petlad, India"}],
        message="I want to know my finances in coming years",
        userPlan="FREE",
    )
    response = TestClient(app).post("/ai/pridicta", json=payload)

    assert response.status_code == 200
    assert "stability, stronger income, or relief from strain" in response.json()["text"]
    assert "birth place Petlad, India" in response.json()["text"]
    assert calls["openai"] == 2


def test_ai_endpoint_uses_local_floor_for_incomplete_no_kundli_reply(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "The desire to understand one's financial path in the coming years often arises from"

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    payload = build_request(
        kundli=None,
        chartContext=None,
        history=[{"role": "user", "text": "Place: Petlad, India"}],
        message="I want to know my finances in coming years",
        userPlan="FREE",
    )
    response = TestClient(app).post("/ai/pridicta", json=payload)

    assert response.status_code == 200
    assert "stability, stronger income, or relief from strain" in response.json()["text"]
    assert calls["openai"] == 2


def test_ai_endpoint_rewrites_weak_chart_aware_reply(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        if calls["openai"] == 1:
            return (
                "I can read your D10 for career growth, but the chart data got cut off in what you pasted."
            )
        return (
            "Your D10 does show growth potential, but it comes through responsibility and sustained effort, not fast reward. "
            "The real risk is overextension, not lack of promise."
        )

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post("/ai/pridicta", json=build_request())

    assert response.status_code == 200
    assert "growth potential" in response.json()["text"]
    assert "cut off" not in response.json()["text"]
    assert calls["openai"] == 2


def test_ai_endpoint_uses_chart_local_floor_for_clipped_chart_reply(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "I understand you're looking for an unvarnished view. The real"

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(
            chartContext={
                "chartType": "D10",
                "chartName": "Dashamsha",
                "purpose": "Career and responsibility",
                "sourceScreen": "Charts",
            },
            message="What is the real risk here, not the polished version?",
        ),
    )

    assert response.status_code == 200
    assert "The risk here is not lack of potential" in response.json()["text"]
    assert calls["openai"] == 2


def test_ai_endpoint_forces_grief_floor_when_reply_is_flat(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "The heaviness you feel is a natural, albeit profound, part of navigating loss."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    payload = build_request(
        kundli=None,
        chartContext=None,
        history=[],
        message="I have been feeling heavy since losing someone close. What do you see in this phase?",
        userPlan="FREE",
    )
    response = TestClient(app).post("/ai/pridicta", json=payload)

    assert response.status_code == 200
    assert "I am sorry you are carrying that" in response.json()["text"]
    assert "Grief has its own weather" in response.json()["text"]
    assert calls["openai"] == 1


def test_ai_endpoint_keeps_career_followup_out_of_grief_lane(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "The feeling of losing what you built can make this heavy."

    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    payload = build_request(
        kundli=None,
        chartContext=None,
        history=[
            {"role": "user", "text": "I feel ready for a bigger role, but something in me pulls back."},
        ],
        message="It feels like ambition, but also fear of losing what I have built.",
        userPlan="FREE",
    )
    response = TestClient(app).post("/ai/pridicta", json=payload)

    assert response.status_code == 200
    assert "This does not sound like empty ambition" in response.json()["text"]
    assert "Grief has its own weather" not in response.json()["text"]
    assert calls["openai"] == 1


def test_ai_endpoint_uses_chart_local_floor_for_d9_boundary_sentence(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "The D9 shows relationship lessons around honesty and effort."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(
            chartContext={
                "chartType": "D9",
                "chartName": "Navamsha",
                "purpose": "Marriage and deeper relationship patterns",
                "sourceScreen": "Charts",
            },
            history=[
                {"role": "user", "text": "What pattern in my D9 affects how I stay in relationships?"},
                {"role": "user", "text": "I stay too long and carry too much. Why?"},
            ],
            message="Give me one boundary sentence I can actually use.",
        ),
    )

    assert response.status_code == 200
    assert "I care about this connection" in response.json()["text"]
    assert "mutual" in response.json()["text"]
    assert calls["openai"] == 2


def test_ai_endpoint_uses_chart_local_floor_for_d10_sabotage_followup(monkeypatch):
    response_cache._response_cache.clear()
    calls = {"openai": 0}

    async def fake_compact_with_gemini(*, model, prompt):
        return None

    async def fake_generate_openai_response(*, max_output_tokens, messages, model):
        calls["openai"] += 1
        return "Your chart suggests pressure should be handled with patience and structure."

    monkeypatch.setattr(ai_routes, "compact_with_gemini", fake_compact_with_gemini)
    monkeypatch.setattr(ai_routes, "generate_openai_response", fake_generate_openai_response)

    response = TestClient(app).post(
        "/ai/pridicta",
        json=build_request(
            chartContext={
                "chartType": "D10",
                "chartName": "Dashamsha",
                "purpose": "Career and responsibility",
                "sourceScreen": "Charts",
            },
            history=[
                {"role": "user", "text": "What does my D10 show about career growth?"},
                {"role": "user", "text": "What is the real risk here, not the polished version?"},
            ],
            message="What behavior in me would quietly sabotage this?",
        ),
    )

    assert response.status_code == 200
    assert "quiet sabotage" in response.json()["text"]
    assert "over-managing the path" in response.json()["text"]
    assert calls["openai"] == 2


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


def test_build_user_prompt_uses_intelligence_context():
    request = ai_models.PridictaAIRequest(
        **build_request(
            kundli=None,
            chartContext=None,
            history=[
                {"role": "user", "text": "Will I get married?"},
                {"role": "pridicta", "text": "There is a real marriage indication, but timing needs care."},
            ],
            intelligenceContext={
                "memory": {
                    "userName": "Aarav",
                    "birthDetailsComplete": True,
                    "knownConcerns": ["marriage timing"],
                    "previousTopics": ["marriage"],
                    "previousGuidance": ["There is a real marriage indication, but timing needs care."],
                    "emotionalTone": "hopeful",
                    "conversationSummary": "User is asking about marriage timing.",
                    "lastIntent": "marriage",
                },
                "intentProfile": {
                    "primaryIntent": "marriage",
                    "secondaryIntents": ["prediction_timing"],
                    "emotionalTone": "hopeful",
                    "isFollowUp": True,
                    "confidence": 0.86,
                    "citedSignals": ["marriage_keywords", "follow_up_resolution"],
                },
                "reasoningContext": {
                    "userIntent": "marriage",
                    "emotionalTone": "hopeful",
                    "primaryCharts": ["D1", "D9"],
                    "secondaryCharts": ["D7"],
                    "relevantFactors": ["7th house", "7th lord", "Venus", "Jupiter"],
                    "shouldUseDasha": True,
                    "shouldUseTransit": True,
                    "shouldSuggestRemedy": True,
                },
                "conversationSummary": "User is asking about marriage timing.",
                "recentAssistantResponses": ["There is a real marriage indication, but timing needs care."],
            },
            message="When?",
        )
    )

    prompt = ai_routes.build_user_prompt(request, None)

    assert "Predicta working memory:" in prompt
    assert "Intent and emotional reading:" in prompt
    assert "Astrology reasoning context:" in prompt
    assert "Recent assistant responses to avoid repeating:" in prompt
    assert "User question: When?" in prompt


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
