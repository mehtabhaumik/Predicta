from fastapi.testclient import TestClient

from backend.astro_api.calculations import generate_kundli
from backend.astro_api.access_authority import reset_access_rate_limits
from backend.astro_api import ai as ai_module
from backend.astro_api.jyotish_analysis import build_jyotish_analysis
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


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_generate_kundli_shape_and_metadata():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    assert kundli.lagna in {
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    }
    assert len(kundli.planets) == 9
    assert len(kundli.houses) == 12
    assert kundli.charts["D1"].supported is True
    assert kundli.charts["D9"].supported is True
    assert kundli.charts["D10"].supported is True
    assert kundli.charts["D60"].supported is False
    assert kundli.calculationMeta.ayanamsa == "LAHIRI"
    assert len(kundli.lifeTimeline) > 0
    assert len(kundli.transits) >= 9
    assert kundli.bhavChalit is not None
    assert kundli.bhavChalit.houseSystem == "PLACIDUS"
    assert len(kundli.bhavChalit.cusps) == 12
    assert kundli.kp is not None
    assert kundli.kp.method == "KRISHNAMURTI_PADDHATI"
    assert len(kundli.kp.cusps) == 12
    assert len(kundli.kp.significators) >= 9
    assert kundli.yearlyHoroscope is not None
    assert kundli.yearlyHoroscope.method == "TAJIKA_SOLAR_RETURN_FOUNDATION"
    assert kundli.yearlyHoroscope.varshaLagna
    assert kundli.yearlyHoroscope.munthaHouse >= 1
    assert len(kundli.yearlyHoroscope.planets) == 9
    assert kundli.rectification is not None
    assert len(kundli.remedies) >= 2


def test_ashtakavarga_totals_are_self_checking():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    expected_totals = {
        "Sun": 48,
        "Moon": 49,
        "Mars": 39,
        "Mercury": 54,
        "Jupiter": 56,
        "Venus": 52,
        "Saturn": 39,
    }
    for planet, total in expected_totals.items():
        assert sum(kundli.ashtakavarga.bav[planet]) == total
    assert sum(kundli.ashtakavarga.sav) == 337
    assert kundli.ashtakavarga.totalScore == 337


def test_api_rejects_invalid_timezone():
    client = TestClient(app)
    response = client.post(
        "/generate-kundli",
        json={**VALID_BIRTH, "timezone": "Not/AZone"},
    )
    assert response.status_code == 422


def test_ask_pridicta_uses_backend_ai_boundary(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        assert kwargs["model"] == ai_module.FREE_REASONING_MODEL
        assert "Chart evidence" in kwargs["system_prompt"]
        assert "Kundli context" in kwargs["user_prompt"]
        assert "jyotishAnalysis" in kwargs["user_prompt"]
        assert "mahadashaIntelligence" in kwargs["user_prompt"]
        assert "Free dasha answers include useful insight" in kwargs["user_prompt"]
        assert "sadeSatiIntelligence" in kwargs["user_prompt"]
        assert "Free users receive useful Sade Sati status" in kwargs["user_prompt"]
        assert "transitGocharIntelligence" in kwargs["user_prompt"]
        assert "Free users receive useful current Gochar" in kwargs["user_prompt"]
        assert "yearlyHoroscopeVarshaphal" in kwargs["user_prompt"]
        assert "Free users receive useful yearly horoscope insight" in kwargs["user_prompt"]
        assert "advancedJyotishCoverage" in kwargs["user_prompt"]
        assert "Free users receive useful broad coverage" in kwargs["user_prompt"]
        assert "nadiJyotishPlan" in kwargs["user_prompt"]
        assert "Nadi Predicta uses planet-to-planet story links" in kwargs["user_prompt"]
        assert "No fake palm-leaf claim" in kwargs["user_prompt"]
        assert "chalitBhavKpFoundation" in kwargs["user_prompt"]
        assert "KP belongs to KP Predicta" in kwargs["user_prompt"]
        assert "formattingContract" in kwargs["user_prompt"]
        return "Chart evidence\n- D1 context is present.\n\nReading: stay focused."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "What should I focus on?",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "openai"
    assert payload["text"].startswith("Chart evidence")
    assert payload["jyotishAnalysis"]["primaryArea"] == "general"
    assert len(payload["jyotishAnalysis"]["evidence"]) >= 5


def test_ask_pridicta_falls_back_to_gemini_when_openai_unavailable(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        raise ai_module.AIConfigurationError("OPENAI_API_KEY is not configured.")

    def fake_gemini_response(**kwargs):
        assert kwargs["model"] == ai_module.GEMINI_FLASH_MODEL
        assert "Kundli context" in kwargs["user_prompt"]
        return "Direct answer: I can read this from Gemini fallback."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    monkeypatch.setattr(ai_module, "create_gemini_text_response", fake_gemini_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Hi, what should I focus on today?",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "gemini"
    assert payload["model"] == ai_module.GEMINI_FLASH_MODEL


def test_ai_provider_keys_accept_predicta_secret_env_names(monkeypatch):
    captured_headers = []
    captured_payloads = []

    class FakeResponse:
        status_code = 200

        def json(self):
            return {"output_text": "OpenAI alias works."}

    def fake_post(url, **kwargs):
        captured_headers.append(kwargs["headers"])
        captured_payloads.append(kwargs["json"])
        return FakeResponse()

    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("PREDICTA_OPENAI_API_KEY", "predicta-openai-key")
    monkeypatch.setattr(ai_module.httpx, "post", fake_post)

    text = ai_module.create_openai_text_response(
        model=ai_module.FREE_REASONING_MODEL,
        system_prompt="system",
        user_prompt="user",
        max_output_tokens=20,
        reasoning_effort="low",
        safety_identifier="predicta_safe_id",
    )

    assert text == "OpenAI alias works."
    assert captured_headers[0]["Authorization"] == "Bearer predicta-openai-key"
    assert captured_payloads[0]["safety_identifier"] == "predicta_safe_id"


def test_gemini_key_accepts_predicta_secret_env_name(monkeypatch):
    class FakeResponse:
        status_code = 200

        def json(self):
            return {
                "candidates": [
                    {"content": {"parts": [{"text": "Gemini alias works."}]}}
                ]
            }

    def fake_post(url, **kwargs):
        assert kwargs["params"]["key"] == "predicta-gemini-key"
        return FakeResponse()

    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("PREDICTA_GEMINI_API_KEY", "predicta-gemini-key")
    monkeypatch.setattr(ai_module.httpx, "post", fake_post)

    text = ai_module.create_gemini_text_response(
        model=ai_module.GEMINI_FLASH_MODEL,
        system_prompt="system",
        user_prompt="user",
        max_output_tokens=20,
    )

    assert text == "Gemini alias works."


def test_ask_pridicta_marks_high_stakes_safety(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        assert "High-stakes area: medical" in kwargs["user_prompt"]
        assert "High-stakes astrology topics are allowed with safeguards" in kwargs["user_prompt"]
        assert "Do not diagnose, prescribe, guarantee outcomes" in kwargs["system_prompt"]
        return "Confidence: low\n\nChart evidence\n- Evidence is limited.\n\nSafety: consult a professional."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Should I take this medical treatment?",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert "Confidence" in response.json()["text"]
    assert "Safety" in response.json()["text"]


def test_ask_pridicta_answers_self_harm_intent_with_care_boundary(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        assert "Safety categories: self-harm" in kwargs["user_prompt"]
        assert "For self-harm intent, respond compassionately" in kwargs["user_prompt"]
        return (
            "I am taking this seriously. Your chart can be read for emotional pressure "
            "and support, but this moment needs human support too.\n\n"
            "Confidence: low\n\nChart evidence\n- Evidence is limited."
        )

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "I want to kill myself. What does my chart say?",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["safetyBlocked"] is False
    assert "self-harm" in payload["safetyCategories"]
    assert "Care note" in payload["text"]


def test_openai_moderation_block_is_respected(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_moderation(message):
        return {
            "results": [
                {
                    "flagged": True,
                    "categories": {
                        "self-harm/instructions": True,
                    },
                }
            ]
        }

    def fake_openai_response(**kwargs):
        raise AssertionError("Moderation-blocked requests must not call AI.")

    monkeypatch.setattr(ai_module, "moderate_text_with_openai", fake_moderation)
    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Tell me unsafe instructions",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
            "safetyIdentifier": "session-123",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["safetyBlocked"] is True
    assert "self-harm/instructions" in payload["safetyCategories"]


def test_jyotish_analysis_prioritizes_career_evidence():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    analysis = build_jyotish_analysis(
        kundli,
        "What does my D10 show about career growth?",
        None,
    )

    assert analysis.primaryArea == "career"
    assert analysis.areaAnalyses[0].area == "career"
    assert analysis.evidence[0].area == "career"
    assert any(item.id == "career-d10" for item in analysis.evidence)
    assert "Chart evidence" in " ".join(analysis.formattingContract)


def test_extract_birth_details_uses_backend_ai_boundary(monkeypatch):
    def fake_openai_response(**kwargs):
        assert kwargs["model"] == ai_module.FREE_REASONING_MODEL
        return """
        {
          "extracted": {
            "date": "1994-08-16",
            "time": "06:42",
            "city": "Mumbai"
          },
          "missingFields": ["name"],
          "ambiguities": [],
          "confidence": 0.75
        }
        """

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    response = client.post(
        "/extract-birth-details",
        json={"text": "16 August 1994 6:42 AM Mumbai"},
    )

    assert response.status_code == 200
    assert response.json()["extracted"]["city"] == "Mumbai"


def test_extract_birth_details_accepts_dob_only_without_ai(monkeypatch):
    def fail_ai_response(**kwargs):
        raise ai_module.AIProviderError("provider unavailable")

    monkeypatch.setattr(ai_module, "create_ai_text_response", fail_ai_response)

    client = TestClient(app)
    response = client.post(
        "/extract-birth-details",
        json={"text": "DOB: 22/08/1980"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["extracted"]["date"] == "1980-08-22"
    assert "time" in payload["missingFields"]
    assert "birth_place" in payload["missingFields"]


def test_extract_birth_details_keeps_rule_based_name_when_ai_is_weak(monkeypatch):
    def weak_ai_response(**kwargs):
        return """
        {
          "extracted": {},
          "missingFields": ["name", "date", "time", "birth_place"],
          "ambiguities": [],
          "confidence": 0.1
        }
        """

    monkeypatch.setattr(ai_module, "create_ai_text_response", weak_ai_response)

    client = TestClient(app)
    response = client.post(
        "/extract-birth-details",
        json={
            "text": "Name: Aarav Mehta\nDOB: 1994-08-16\nTime: 06:42 am\nPlace: Petlad, Gujarat, India"
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["extracted"]["name"] == "Aarav Mehta"
    assert payload["extracted"]["date"] == "1994-08-16"
    assert payload["extracted"]["time"] == "06:42"
    assert payload["extracted"]["city"] == "Petlad"
    assert "name" not in payload["missingFields"]
    assert "birth_place" not in payload["missingFields"]


def test_guest_pass_redemption_is_backend_authoritative(tmp_path, monkeypatch):
    monkeypatch.setenv("PRIDICTA_ACCESS_STORE_PATH", str(tmp_path / "access.json"))
    monkeypatch.delenv("PRIDICTA_ADMIN_API_TOKEN", raising=False)
    reset_access_rate_limits()
    client = TestClient(app)

    create = client.post(
        "/access/admin/guest-passes",
        json={
            "accessLevel": "VIP_GUEST",
            "code": "PRIVATE-BETA-2026",
            "codeId": "beta-2026",
            "label": "Private beta pass",
            "maxRedemptions": 1,
            "type": "VIP_REVIEW",
        },
    )
    assert create.status_code == 503

    monkeypatch.setenv("PRIDICTA_ADMIN_API_TOKEN", "secret-admin-token")
    create = client.post(
        "/access/admin/guest-passes",
        headers={"x-pridicta-admin-token": "secret-admin-token"},
        json={
            "accessLevel": "VIP_GUEST",
            "code": "PRIVATE-BETA-2026",
            "codeId": "beta-2026",
            "label": "Private beta pass",
            "maxRedemptions": 1,
            "type": "VIP_REVIEW",
        },
    )
    assert create.status_code == 200
    assert create.json()["codeHash"] != "PRIVATE-BETA-2026"

    redemption = client.post(
        "/access/guest-pass/redeem",
        json={
            "code": "PRIVATE-BETA-2026",
            "deviceId": "device-1",
            "email": "beta@example.com",
            "userId": "user-1",
        },
    )
    assert redemption.status_code == 200
    assert redemption.json()["status"] == "SUCCESS"
    assert redemption.json()["redeemedPass"]["accessLevel"] == "VIP_GUEST"

    second = client.post(
        "/access/guest-pass/redeem",
        json={
            "code": "PRIVATE-BETA-2026",
            "deviceId": "device-2",
            "email": "other@example.com",
            "userId": "user-2",
        },
    )
    assert second.status_code == 200
    assert second.json()["status"] == "MAX_REDEMPTIONS"


def test_backend_resolves_admin_without_client_whitelist(tmp_path, monkeypatch):
    monkeypatch.setenv("PRIDICTA_ACCESS_STORE_PATH", str(tmp_path / "access.json"))
    monkeypatch.setenv("PRIDICTA_ADMIN_EMAILS", "founder@example.com")
    client = TestClient(app)

    response = client.post(
        "/access/resolve",
        json={"email": "Founder@Example.com", "userId": "admin-user"},
    )

    assert response.status_code == 200
    assert response.json()["isAdmin"] is True
    assert response.json()["source"] == "admin_backend"
