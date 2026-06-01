from fastapi.testclient import TestClient

from backend.astro_api.calculations import generate_kundli
from backend.astro_api.access_authority import reset_access_rate_limits
from backend.astro_api import ai as ai_module
from backend.astro_api import ai_batch_qa
from backend.astro_api import report_ai_pipeline
from backend.astro_api.ai_routing_policy import (
    AIModelPins,
    AIRoutingRequest,
    evaluate_approved_provider_gate,
    route_ai_request,
)
from backend.astro_api.ai_telemetry import list_ai_telemetry_events
from backend.astro_api import ai_prompt_efficiency
from backend.astro_api import ai_validator as validator_module
from backend.astro_api.ai_validator import validate_with_gemini
from backend.astro_api.jyotish_analysis import build_jyotish_analysis
from backend.astro_api.main import app
from backend.astro_api.models import (
    AIValidationIssue,
    AIValidationRequest,
    AIValidationResult,
    AIBatchQAJob,
    BirthDetails,
    PremiumReportPipelineRequest,
    ReportQAPolicy,
)


VALID_BIRTH = {
    "name": "Aarav Mehta",
    "date": "1994-08-16",
    "time": "06:42",
    "place": "Mumbai, India",
    "latitude": 19.076,
    "longitude": 72.8777,
    "timezone": "Asia/Kolkata",
}


MODEL_PINS = AIModelPins(
    free_reasoning=ai_module.FREE_REASONING_MODEL,
    gemini_free=ai_module.GEMINI_FLASH_MODEL,
    gemini_premium=ai_module.GEMINI_PRO_MODEL,
    premium_deep=ai_module.PREMIUM_DEEP_MODEL,
)


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
    assert len(kundli.planets) == 19
    assert {planet.name for planet in kundli.planets}.issuperset(
        {
            "Dhuma",
            "Gulika",
            "Indrachapa",
            "Mandi",
            "Neptune",
            "Parivesha",
            "Pluto",
            "Upaketu",
            "Uranus",
            "Vyatipata",
        }
    )
    assert all(
        planet.simpleMeaning
        for planet in kundli.planets
        if planet.kind in {"modern", "sensitive", "upagraha"}
    )
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


def test_ai_routing_policy_routes_free_simple_chat_to_openai_mini():
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="chat",
            intent="simple",
            user_plan="FREE",
        ),
        MODEL_PINS,
    )

    assert decision.primary_provider == "openai"
    assert decision.primary_model == ai_module.FREE_REASONING_MODEL
    assert decision.fallback_provider == "gemini"
    assert decision.fallback_model == ai_module.GEMINI_FLASH_MODEL
    assert decision.multi_model_pipeline_allowed is False
    assert "free-budget" in decision.cost_guardrail


def test_ai_routing_policy_routes_premium_deep_chat_to_openai_premium():
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="chat",
            intent="deep",
            quality_tier="premium",
            user_plan="PREMIUM",
        ),
        MODEL_PINS,
    )

    assert decision.primary_provider == "openai"
    assert decision.primary_model == ai_module.PREMIUM_DEEP_MODEL
    assert decision.fallback_provider == "gemini"
    assert decision.fallback_model == ai_module.GEMINI_PRO_MODEL
    assert decision.multi_model_pipeline_allowed is False
    assert "premium-budget" in decision.cost_guardrail


def test_ai_routing_policy_blocks_free_report_multi_model_pipeline():
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="report_generation",
            intent="deep",
            quality_tier="free",
            report_type="vedic",
            user_plan="FREE",
        ),
        MODEL_PINS,
    )

    assert decision.primary_model == ai_module.FREE_REASONING_MODEL
    assert decision.validator_provider is None
    assert decision.validator_model is None
    assert decision.validator_eligible is False
    assert decision.multi_model_pipeline_allowed is False
    assert "skips-premium-multi-model-pipeline" in decision.policy_reason


def test_ai_routing_policy_allows_premium_report_validator_pipeline():
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="report_generation",
            intent="deep",
            quality_tier="premium",
            report_type="life_atlas",
            user_plan="PREMIUM",
        ),
        MODEL_PINS,
    )

    assert decision.primary_provider == "openai"
    assert decision.primary_model == ai_module.PREMIUM_DEEP_MODEL
    assert decision.validator_provider == "gemini"
    assert decision.validator_model == ai_module.GEMINI_PRO_MODEL
    assert decision.validator_eligible is True
    assert decision.multi_model_pipeline_allowed is True


def test_ai_routing_policy_routes_report_validator_to_gemini_pro():
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PARASHARI",
            feature="report_validator",
            intent="deep",
            quality_tier="premium",
            report_type="vedic",
            user_plan="PREMIUM",
        ),
        MODEL_PINS,
    )

    assert decision.primary_provider == "gemini"
    assert decision.primary_model == ai_module.GEMINI_PRO_MODEL
    assert decision.validator_provider == "gemini"
    assert decision.validator_model == ai_module.GEMINI_PRO_MODEL


def test_ai_routing_policy_routes_batch_qa_to_gemini_flash():
    decision = route_ai_request(
        AIRoutingRequest(
            active_school="PREDICTA",
            feature="batch_qa",
            intent="moderate",
            latency_sensitivity="batch",
            quality_tier="standard",
            user_plan="FREE",
        ),
        MODEL_PINS,
    )

    assert decision.primary_provider == "gemini"
    assert decision.primary_model == ai_module.GEMINI_FLASH_MODEL
    assert decision.fallback_provider == "deterministic"
    assert decision.multi_model_pipeline_allowed is False


def test_ai_routing_policy_keeps_gemini_pro_premium_deep_only():
    free_decision = route_ai_request(
        AIRoutingRequest(
            active_school="KP",
            feature="chat",
            intent="moderate",
            provider_availability="primary_unavailable",
            user_plan="FREE",
        ),
        MODEL_PINS,
    )
    premium_decision = route_ai_request(
        AIRoutingRequest(
            active_school="KP",
            feature="chat",
            intent="deep",
            provider_availability="primary_unavailable",
            quality_tier="premium",
            user_plan="PREMIUM",
        ),
        MODEL_PINS,
    )

    assert free_decision.fallback_model == ai_module.GEMINI_FLASH_MODEL
    assert premium_decision.fallback_model == ai_module.GEMINI_PRO_MODEL


def test_ai_routing_policy_rejects_claude_anthropic_provider(monkeypatch):
    monkeypatch.setenv("PREDICTA_ALLOWED_AI_PROVIDERS", "openai,gemini,claude")

    failures = evaluate_approved_provider_gate()

    assert any("claude" in failure.lower() for failure in failures)
    assert any("Claude/Anthropic" in failure for failure in failures)


def test_gemini_validator_catches_missing_report_section(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )

    def fake_gemini_response(**kwargs):
        assert kwargs["model"] == ai_module.GEMINI_PRO_MODEL
        assert "missing_required_sections" in kwargs["user_prompt"]
        return """
        {
          "passed": false,
          "severity": "high",
          "issues": [
            {
              "code": "missing_required_sections",
              "severity": "high",
              "message": "Mahadasha Phala is required but absent.",
              "suggestedFixCategory": "add-missing-section",
              "evidence": "Mahadasha Phala"
            }
          ],
          "suggestedFixCategories": ["add-missing-section"],
          "confidence": "high"
        }
        """

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fake_gemini_response)

    result = validate_with_gemini(
        AIValidationRequest(
            activeSchool="PARASHARI",
            candidateContentSummary="D1 and D9 are present.",
            deterministicContextSummary="Required Vedic sections are known.",
            presentSections=["D1", "D9"],
            requiredSections=["D1", "D9", "Mahadasha Phala"],
            reportType="vedic",
            userPlan="PREMIUM",
        )
    )

    assert result.passed is False
    assert result.provider == "gemini"
    assert result.model == ai_module.GEMINI_PRO_MODEL
    assert result.issues[0].code == "missing_required_sections"
    assert list_ai_telemetry_events()[0].feature == "report_validator"


def test_gemini_validator_catches_duplicated_remedies(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )

    def fake_gemini_response(**kwargs):
        return """
        {
          "passed": false,
          "severity": "medium",
          "issues": [
            {
              "code": "duplicated_remedies",
              "severity": "medium",
              "message": "Remedy advice repeats in multiple chapters.",
              "suggestedFixCategory": "consolidate-remedies",
              "evidence": "same mantra appears three times"
            }
          ],
          "suggestedFixCategories": ["consolidate-remedies"],
          "confidence": "high"
        }
        """

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fake_gemini_response)

    result = validate_with_gemini(
        AIValidationRequest(
            candidateContentSummary="Remedy: serve elders. Remedy: serve elders.",
            requiredSections=["One Remedy Plan"],
            presentSections=["One Remedy Plan"],
            reportType="vedic",
        )
    )

    assert result.issues[0].code == "duplicated_remedies"
    assert result.suggestedFixCategories == ["consolidate-remedies"]


def test_gemini_validator_catches_kp_vedic_method_mixing(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )

    def fake_gemini_response(**kwargs):
        return """
        {
          "passed": false,
          "severity": "high",
          "issues": [
            {
              "code": "method_mixing",
              "severity": "high",
              "message": "KP report uses Parashari D1 yoga proof as the main judgement.",
              "suggestedFixCategory": "restore-school-boundary",
              "evidence": "D1 yoga proof in KP verdict"
            }
          ],
          "suggestedFixCategories": ["restore-school-boundary"],
          "confidence": "high"
        }
        """

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fake_gemini_response)

    result = validate_with_gemini(
        AIValidationRequest(
            activeSchool="KP",
            candidateContentSummary="KP event answer uses D1 yoga as proof.",
            reportType="kp",
        )
    )

    assert result.issues[0].code == "method_mixing"


def test_gemini_validator_catches_language_mismatch(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )

    def fake_gemini_response(**kwargs):
        return """
        {
          "passed": false,
          "severity": "medium",
          "issues": [
            {
              "code": "language_mismatch",
              "severity": "medium",
              "message": "English report contains Hindi text.",
              "suggestedFixCategory": "fix-language-output",
              "evidence": "यह chart"
            }
          ],
          "suggestedFixCategories": ["fix-language-output"],
          "confidence": "high"
        }
        """

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fake_gemini_response)

    result = validate_with_gemini(
        AIValidationRequest(
            candidateContentSummary="This report says: यह chart is powerful.",
            expectedLanguage="en",
            reportType="vedic",
        )
    )

    assert result.issues[0].code == "language_mismatch"


def test_gemini_validator_catches_hard_guarantee_language(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )

    def fake_gemini_response(**kwargs):
        return """
        {
          "passed": false,
          "severity": "critical",
          "issues": [
            {
              "code": "unsupported_predictions",
              "severity": "critical",
              "message": "The report guarantees an event.",
              "suggestedFixCategory": "remove-guarantee",
              "evidence": "will definitely happen"
            }
          ],
          "suggestedFixCategories": ["remove-guarantee"],
          "confidence": "high"
        }
        """

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fake_gemini_response)

    result = validate_with_gemini(
        AIValidationRequest(
            candidateContentSummary="Marriage will definitely happen in June.",
            reportType="vedic",
        )
    )

    assert result.severity == "critical"
    assert result.issues[0].code == "unsupported_predictions"


def test_gemini_validator_returns_structured_result_only(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )

    def fake_gemini_response(**kwargs):
        return """
        {
          "passed": true,
          "severity": "pass",
          "issues": [],
          "suggestedFixCategories": [],
          "confidence": "high"
        }
        """

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fake_gemini_response)

    result = validate_with_gemini(
        AIValidationRequest(
            candidateContentSummary="All required sections are present.",
            requiredSections=["D1"],
            presentSections=["D1"],
            reportType="vedic",
        )
    )

    assert result.passed is True
    assert result.model_dump()["provider"] == "gemini"
    assert isinstance(result.model_dump()["issues"], list)


def test_gemini_validator_not_called_for_ordinary_free_chat(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    called = {"validator": False}

    def fail_if_validator_called(**kwargs):
        called["validator"] = True
        raise AssertionError("validator should not run for ordinary free chat")

    def fake_openai_response(**kwargs):
        return "Short free chat answer."

    monkeypatch.setattr(validator_module, "create_gemini_text_response", fail_if_validator_called)
    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Hello",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert called["validator"] is False


def premium_report_request(**overrides):
    data = {
        "activeSchool": "PARASHARI",
        "deterministicContextSummary": "D1, Moon, D9, D10, Chalit, and Mahadasha evidence are ready.",
        "deterministicReportData": {
            "birthSnapshot": "Aarav born in Mumbai with verified deterministic sections.",
            "sections": ["D1", "Moon", "D9", "D10", "Chalit", "Mahadasha Phala"],
        },
        "expectedLanguage": "en",
        "presentSections": ["D1", "Moon", "D9", "D10", "Chalit", "Mahadasha Phala"],
        "reportTitle": "Premium Vedic Report",
        "reportType": "vedic",
        "requiredSections": ["D1", "Moon", "D9", "D10", "Chalit", "Mahadasha Phala"],
        "subjectKey": "test-aarav",
        "userPlan": "PREMIUM",
    }
    data.update(overrides)
    return PremiumReportPipelineRequest(**data)


def validation_pass():
    return AIValidationResult(
        confidence="high",
        issues=[],
        model=ai_module.GEMINI_PRO_MODEL,
        passed=True,
        provider="gemini",
        severity="pass",
        suggestedFixCategories=[],
    )


def validation_issue():
    return AIValidationResult(
        confidence="high",
        issues=[
            AIValidationIssue(
                code="duplicated_remedies",
                evidence="same remedy appears twice",
                message="Remedies repeat across chapters.",
                severity="medium",
                suggestedFixCategory="consolidate-remedies",
            )
        ],
        model=ai_module.GEMINI_PRO_MODEL,
        passed=False,
        provider="gemini",
        severity="medium",
        suggestedFixCategories=["consolidate-remedies"],
    )


def validation_unavailable():
    return AIValidationResult(
        confidence="low",
        issues=[
            AIValidationIssue(
                code="validator_unavailable_or_malformed",
                evidence="AIConfigurationError",
                message="Gemini validator did not return valid structured JSON.",
                severity="high",
                suggestedFixCategory="rerun-validator-or-use-deterministic-audit",
            )
        ],
        model=ai_module.GEMINI_PRO_MODEL,
        passed=False,
        provider="gemini",
        severity="high",
        suggestedFixCategories=["rerun-validator-or-use-deterministic-audit"],
    )


def test_premium_report_pipeline_calls_draft_validator_and_finalizer(
    tmp_path, monkeypatch
):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    openai_calls = []
    validator_calls = []

    def fake_openai_response(**kwargs):
        openai_calls.append(kwargs)
        if len(openai_calls) == 1:
            return "Draft repeats remedies and needs cleanup."
        return "Final premium report with one consolidated remedy plan."

    def fake_validator(request):
        validator_calls.append(request)
        return validation_issue()

    monkeypatch.setattr(report_ai_pipeline, "create_openai_text_response", fake_openai_response)
    monkeypatch.setattr(report_ai_pipeline, "validate_with_gemini", fake_validator)

    result = report_ai_pipeline.compose_premium_report_pipeline(premium_report_request())

    assert result.content == "Final premium report with one consolidated remedy plan."
    assert len(openai_calls) == 2
    assert len(validator_calls) == 1
    assert result.audit.pipelineApplied is True
    assert result.audit.validatorInvoked is True
    assert result.audit.finalizerInvoked is True
    assert result.audit.validatorIssueCodes == ["duplicated_remedies"]
    assert {event.feature for event in list_ai_telemetry_events()} == {
        "premium_report_draft",
        "premium_report_finalizer",
    }


def test_free_report_pipeline_does_not_call_gemini_validator(monkeypatch):
    def fail_openai(**kwargs):
        raise AssertionError("free report should not call OpenAI premium draft")

    def fail_validator(request):
        raise AssertionError("free report should not call Gemini validator")

    monkeypatch.setattr(report_ai_pipeline, "create_openai_text_response", fail_openai)
    monkeypatch.setattr(report_ai_pipeline, "validate_with_gemini", fail_validator)

    result = report_ai_pipeline.compose_premium_report_pipeline(
        premium_report_request(
            deterministicReportData={"content": "Useful free deterministic report."},
            userPlan="FREE",
        )
    )

    assert result.content == "Useful free deterministic report."
    assert result.audit.pipelineApplied is False
    assert result.audit.validatorInvoked is False


def test_validator_pass_skips_premium_report_finalizer(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    openai_calls = []

    def fake_openai_response(**kwargs):
        openai_calls.append(kwargs)
        if len(openai_calls) > 1:
            raise AssertionError("finalizer should not run when validator passes")
        return "Validator-approved premium report."

    monkeypatch.setattr(report_ai_pipeline, "create_openai_text_response", fake_openai_response)
    monkeypatch.setattr(report_ai_pipeline, "validate_with_gemini", lambda request: validation_pass())

    result = report_ai_pipeline.compose_premium_report_pipeline(premium_report_request())

    assert result.content == "Validator-approved premium report."
    assert len(openai_calls) == 1
    assert result.audit.finalizerInvoked is False
    assert result.validation.passed is True


def test_missing_gemini_validator_continues_with_explicit_audit_flag(
    tmp_path, monkeypatch
):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    monkeypatch.setattr(
        report_ai_pipeline,
        "create_openai_text_response",
        lambda **kwargs: "Premium report draft kept with validator unavailable flag.",
    )
    monkeypatch.setattr(
        report_ai_pipeline,
        "validate_with_gemini",
        lambda request: validation_unavailable(),
    )

    result = report_ai_pipeline.compose_premium_report_pipeline(premium_report_request())

    assert result.audit.validatorUnavailable is True
    assert result.audit.blocked is False
    assert result.content == "Premium report draft kept with validator unavailable flag."
    assert result.audit.finalizerInvoked is False


def test_missing_gemini_validator_blocks_when_report_policy_requires(
    tmp_path, monkeypatch
):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    monkeypatch.setattr(
        report_ai_pipeline,
        "create_openai_text_response",
        lambda **kwargs: "Premium report draft should not be released.",
    )
    monkeypatch.setattr(
        report_ai_pipeline,
        "validate_with_gemini",
        lambda request: validation_unavailable(),
    )

    result = report_ai_pipeline.compose_premium_report_pipeline(
        premium_report_request(
            qaPolicy=ReportQAPolicy(
                validatorRequired=True,
                validatorUnavailableBehavior="block",
            )
        )
    )

    assert result.audit.validatorUnavailable is True
    assert result.audit.blocked is True
    assert "blocked" in result.content.lower()


def test_report_artifact_metadata_excludes_private_prompts(monkeypatch):
    monkeypatch.setattr(
        report_ai_pipeline,
        "create_openai_text_response",
        lambda **kwargs: "Clean premium report.",
    )
    monkeypatch.setattr(report_ai_pipeline, "validate_with_gemini", lambda request: validation_pass())

    result = report_ai_pipeline.compose_premium_report_pipeline(premium_report_request())
    metadata_json = str(result.artifactMetadata)

    assert result.artifactMetadata["validatorProvider"] == "gemini"
    assert result.artifactMetadata["validatorModel"] == ai_module.GEMINI_PRO_MODEL
    assert "Write the premium report draft" not in metadata_json
    assert "You are Predicta" not in metadata_json


def test_premium_report_pipeline_applies_to_required_report_types():
    assert set(report_ai_pipeline.supported_premium_pipeline_report_types()) == {
        "vedic",
        "kp",
        "jaimini",
        "nadi",
        "numerology",
        "signature",
        "life_atlas",
    }
    assert report_ai_pipeline.REPORT_QA_POLICIES["jaimini"].validatorRequired is False
    assert report_ai_pipeline.REPORT_QA_POLICIES["life_atlas"].validatorRequired is True
    assert (
        report_ai_pipeline.REPORT_QA_POLICIES["life_atlas"].validatorUnavailableBehavior
        == "block"
    )


def test_batch_translation_qa_flags_mixed_language_defect():
    result = ai_batch_qa.run_mock_batch_qa_job(
        AIBatchQAJob(
            checkType="translation_sweep",
            contentSummary="English selected, but the text says यह chart is active.",
            expectedLanguage="en",
            id="translation-mixed-language",
            reportType="vedic",
        ),
        model=ai_module.GEMINI_FLASH_MODEL,
    )

    assert result.passed is False
    assert result.issues[0].code == "mixed_language_defect"
    assert result.provider == "deterministic"


def test_batch_golden_report_qa_flags_duplicated_remedies():
    result = ai_batch_qa.run_mock_batch_qa_job(
        AIBatchQAJob(
            checkType="golden_pdf_text_audit",
            contentSummary=(
                "Remedy: serve elders on Saturday. "
                "Career insight. Remedy: serve elders on Saturday."
            ),
            id="golden-duplicated-remedies",
            presentSections=["D1", "Mahadasha Phala", "One Remedy Plan"],
            reportType="vedic",
            requiredSections=["D1", "Mahadasha Phala", "One Remedy Plan"],
        ),
        model=ai_module.GEMINI_FLASH_MODEL,
    )

    assert result.passed is False
    assert {issue.code for issue in result.issues} == {"duplicated_remedies"}


def test_batch_method_boundary_qa_flags_kp_vedic_mixing():
    result = ai_batch_qa.run_mock_batch_qa_job(
        AIBatchQAJob(
            activeSchool="KP",
            checkType="method_boundary_check",
            contentSummary="KP event answer uses D1 yoga as the primary proof.",
            id="kp-method-boundary",
            reportType="kp",
        ),
        model=ai_module.GEMINI_FLASH_MODEL,
    )

    assert result.passed is False
    assert result.issues[0].code == "method_boundary_violation"
    assert result.issues[0].suggestedFixCategory == "restore-school-boundary"


def test_batch_mock_output_writes_deterministic_audit_json(tmp_path):
    manifest = ai_batch_qa.run_batch_qa_jobs(
        [
            AIBatchQAJob(
                checkType="translation_sweep",
                contentSummary="English text says આ chart is mixed.",
                expectedLanguage="en",
                id="translation-json-output",
                reportType="vedic",
            )
        ],
        artifact_root=tmp_path,
        runner_mode="mock",
    )

    manifest_file = tmp_path / "batch-qa-manifest.json"
    job_file = tmp_path / "translation-json-output.json"
    assert manifest_file.exists()
    assert job_file.exists()
    job_payload = job_file.read_text()
    assert "mixed_language_defect" in job_payload
    assert "English text says" not in job_payload
    assert manifest.totalJobs == 1
    assert manifest.failedJobs == 1


def test_structured_output_parser_rejects_malformed_json():
    try:
        ai_prompt_efficiency.parse_structured_json(
            "not-json",
            required_keys=["issues"],
            schema_name="report_qa_summary",
        )
    except ai_prompt_efficiency.StructuredOutputError as exc:
        assert "malformed JSON" in str(exc)
    else:
        raise AssertionError("malformed structured output should be rejected")


def test_prompt_construction_keeps_static_content_before_dynamic_context():
    prompt = ai_prompt_efficiency.build_ordered_prompt(
        static_sections=["Stable room contract"],
        dynamic_sections=["Kundli context:", '{"activeContext":{}}'],
    )

    assert prompt.index("STATIC PREDICTA CONTRACT") < prompt.index(
        "Stable room contract"
    )
    assert prompt.index("Stable room contract") < prompt.index("DYNAMIC USER CONTEXT")
    assert prompt.index("DYNAMIC USER CONTEXT") < prompt.index("Kundli context:")


def test_compact_context_keeps_identity_selection_and_memory_digest():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    chart_context = ai_module.ChartContext(
        chartType="D9",
        predictaSchool="PARASHARI",
        selectedSection="Premium Vedic Report",
        sourceScreen="Charts",
        specialistContexts=[
            {
                "school": "KP",
                "kundliId": kundli.id,
                "selectedChart": "Chalit",
                "selectedSection": "Career event timing",
                "sourceScreen": "KP Predicta",
                "updatedAt": "2026-05-26T00:00:00Z",
            }
        ],
    )
    analysis = build_jyotish_analysis(kundli, "Explain my D9", chart_context)
    context = ai_module.build_ai_context(
        kundli,
        chart_context,
        analysis,
        "en",
        "FREE",
        "Explain my D9",
        [],
    )

    compact = ai_prompt_efficiency.compact_predicta_context(context, user_plan="FREE")

    assert compact["kundliIdentity"]["kundliId"] == kundli.id
    assert compact["kundliIdentity"]["inputHash"] == kundli.calculationMeta.inputHash
    assert compact["activeContext"]["predictaSchool"] == "PARASHARI"
    assert compact["activeContext"]["chartType"] == "D9"
    assert compact["selectedReport"] == "Premium Vedic Report"
    assert compact["selectedSection"] == "Premium Vedic Report"
    assert compact["memoryDigest"]["recentSpecialistRooms"][0]["school"] == "KP"


def test_free_chat_prompt_remains_under_approved_budget():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    chart_context = ai_module.ChartContext(
        chartType="D10",
        selectedSection="Career chart",
        sourceScreen="Charts",
    )
    analysis = build_jyotish_analysis(
        kundli,
        "Give me a clear career reading from D10.",
        chart_context,
    )
    context = ai_module.build_ai_context(
        kundli,
        chart_context,
        analysis,
        "en",
        "FREE",
        "Give me a clear career reading from D10.",
        [],
    )
    context["predictaRoomContract"] = ai_module.build_predicta_room_contract(chart_context)
    prompt = ai_module.build_user_prompt(
        context,
        [],
        "Give me a clear career reading from D10.",
        primary_area=analysis.primaryArea,
        language="en",
    )
    audit = ai_prompt_efficiency.audit_prompt_budget(
        prompt=prompt,
        budget_tokens=ai_prompt_efficiency.FREE_CHAT_INPUT_TOKEN_BUDGET,
        label="free chat",
    )

    assert audit.approved is True
    assert "STATIC PREDICTA CONTRACT" in prompt
    assert "DYNAMIC USER CONTEXT" in prompt
    assert '"memoryDigest"' in prompt


def test_premium_report_prompt_budget_fails_with_clear_audit_reason():
    prompt = "x " * (ai_prompt_efficiency.PREMIUM_REPORT_INPUT_TOKEN_BUDGET * 5)
    audit = ai_prompt_efficiency.audit_prompt_budget(
        prompt=prompt,
        budget_tokens=ai_prompt_efficiency.PREMIUM_REPORT_INPUT_TOKEN_BUDGET,
        label="premium report",
    )

    assert audit.approved is False
    assert "premium report prompt exceeds budget" in audit.reason


def test_openai_payload_carries_prompt_cache_key_and_structured_schema(monkeypatch):
    captured_payloads = []

    class FakeResponse:
        status_code = 200

        def json(self):
            return {
                "output_text": "{}",
                "usage": {
                    "input_tokens": 20,
                    "input_tokens_details": {"cached_tokens": 12},
                    "output_tokens": 2,
                },
            }

    def fake_post(url, **kwargs):
        captured_payloads.append(kwargs["json"])
        return FakeResponse()

    monkeypatch.setenv("PREDICTA_OPENAI_API_KEY", "predicta-openai-key")
    monkeypatch.setattr(ai_module.httpx, "post", fake_post)

    ai_module.create_openai_text_response(
        max_output_tokens=20,
        model=ai_module.FREE_REASONING_MODEL,
        prompt_cache_key="pcache_test",
        reasoning_effort="low",
        structured_output_schema=ai_prompt_efficiency.structured_output_format(
            "birth_extraction"
        ),
        system_prompt="system",
        user_prompt="user",
    )

    assert captured_payloads[0]["metadata"]["predicta_prompt_cache_key"] == "pcache_test"
    assert captured_payloads[0]["text"]["format"]["type"] == "json_schema"
    assert ai_module.current_provider_usage()["cached_input"] == 12


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
        assert "jaiminiPlan" in kwargs["user_prompt"]
        assert "jaiminiInterpretation" in kwargs["user_prompt"]
        assert "Jaimini covers Atmakaraka" in kwargs["user_prompt"]
        assert "Never claim Nadi leaf access" in kwargs["user_prompt"]
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


def test_predicta_tone_context_detects_devotional_high_stress_signal():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    analysis = build_jyotish_analysis(
        kundli,
        "Mahadev please tell me right now!! I am panicking about marriage timing.",
        None,
        "FREE",
    )

    context = ai_module.build_ai_context(
        kundli,
        None,
        analysis,
        "en",
        "FREE",
        "Mahadev please tell me right now!! I am panicking about marriage timing.",
        [],
    )

    tone = context["predictaTone"]
    assert tone["supportStyle"] == "devotional"
    assert tone["stressLevel"] == "high"
    assert tone["allowDevotionalPhrasing"] is True
    assert tone["humorPolicy"] == "avoid"
    assert tone["headlineStyle"] == "short-first"


def test_predicta_tone_context_detects_secular_preference():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    analysis = build_jyotish_analysis(
        kundli,
        "Keep it practical only. I am not Hindu and I do not want religious remedies.",
        None,
        "FREE",
    )

    context = ai_module.build_ai_context(
        kundli,
        None,
        analysis,
        "en",
        "FREE",
        "Keep it practical only. I am not Hindu and I do not want religious remedies.",
        [],
    )

    tone = context["predictaTone"]
    assert tone["supportStyle"] == "secular"
    assert tone["allowDevotionalPhrasing"] is False
    assert tone["avoidDevotionalPhrasing"] is True


def test_predicta_tone_context_uses_saved_style_preference_without_guessing_religion():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    analysis = build_jyotish_analysis(
        kundli,
        "Read my career direction clearly.",
        None,
        "FREE",
    )

    context = ai_module.build_ai_context(
        kundli,
        None,
        analysis,
        "en",
        "FREE",
        "Read my career direction clearly.",
        [],
        "devotional",
    )

    tone = context["predictaTone"]
    assert tone["stylePreference"] == "devotional"
    assert tone["supportStyle"] == "devotional"
    assert tone["supportStyleReason"] == "The user saved a devotional Predicta style preference."


def test_predicta_tone_context_high_stakes_forces_bounded_guardrail():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    analysis = build_jyotish_analysis(
        kundli,
        "Please tell me if this bankruptcy and hospital fear means total collapse.",
        None,
        "FREE",
    )

    context = ai_module.build_ai_context(
        kundli,
        None,
        analysis,
        "en",
        "FREE",
        "Please tell me if this bankruptcy and hospital fear means total collapse.",
        [],
        "devotional",
    )

    tone = context["predictaTone"]
    assert tone["highStakesGuardrailMode"] is True
    assert tone["confidenceFrame"] == "bounded"
    assert tone["allowDevotionalPhrasing"] is False
    assert tone["avoidDevotionalPhrasing"] is True
    assert tone["humorPolicy"] == "avoid"


def test_pridicta_system_prompt_uses_signal_based_devotional_mode():
    prompt = ai_module.build_pridicta_system_prompt()

    assert "Never infer religion from the user's name, language, country, or family role." in prompt
    assert "If the user explicitly prefers practical, secular, non-religious, or non-Hindu framing" in prompt
    assert "You are a Mahadev devotee" not in prompt


def test_deterministic_chart_reply_adds_karma_and_purushartha_guidance():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="Please just tell me clearly if career will improve soon. I am worried.",
        kundli=kundli,
        history=[],
        userPlan="FREE",
    )
    analysis = build_jyotish_analysis(
        kundli,
        request.message,
        request.chartContext,
        request.userPlan,
    )

    reply = ai_module.build_deterministic_chart_reply(request, analysis)

    assert "Karma pattern:" in reply
    assert "Purushartha balance:" in reply
    assert "Simple remedy direction:" in reply
    assert "straight answer first" in reply


def test_ask_pridicta_includes_room_contract_for_each_specialist(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    captured_prompts = []

    def fake_openai_response(**kwargs):
        captured_prompts.append(kwargs["user_prompt"])
        return "Direct answer\n\nEvidence\n- Room contract is present."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)

    expected = {
        "PARASHARI": ("Vedic Predicta", "D1/Rashi"),
        "KP": ("KP Predicta", "cusp sub lord"),
        "JAIMINI": ("Jaimini Predicta", "Chara Dasha"),
        "NUMEROLOGY": ("Numerology Predicta", "personal year"),
        "SIGNATURE": ("Signature Predicta", "No identity verification."),
    }

    for school, (room_name, method_marker) in expected.items():
        response = client.post(
            "/ask-pridicta",
            json={
                "message": f"Answer inside {room_name}.",
                "chartContext": {
                    "predictaSchool": school,
                    "sourceScreen": room_name,
                    "handoffQuestion": f"Answer inside {room_name}.",
                },
                "kundli": kundli.model_dump(mode="json"),
                "history": [],
                "userPlan": "FREE",
            },
        )
        assert response.status_code == 200

    joined_prompts = "\n\n".join(captured_prompts)
    for room_name, method_marker in expected.values():
        assert room_name in joined_prompts
        assert method_marker in joined_prompts
    assert "Active room contract:" in joined_prompts
    assert "Discipline handoff context:" in joined_prompts
    assert "do not mix methods" in joined_prompts
    assert '"requiresHandoff": false' in joined_prompts


def test_ask_pridicta_carries_discipline_handoff_context(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert '"activeSchool": "KP"' in prompt
        assert '"detectedRequestedSchool": "PARASHARI"' in prompt
        assert '"requiresHandoff": true' in prompt
        assert '"targetRoom": "Vedic Predicta"' in prompt
        assert '"targetRoute": "/dashboard/vedic/chat"' in prompt
        assert '"originalQuestion": "Show my D9 chart and mahadasha timing."' in prompt
        assert "do not provide the requested analysis in the active room" in prompt
        return "This belongs in Vedic Predicta, not inside KP Predicta."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Show my D9 chart and mahadasha timing.",
            "chartContext": {
                "predictaSchool": "KP",
                "sourceScreen": "KP Predicta",
                "handoffQuestion": "Show my D9 chart and mahadasha timing.",
            },
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert response.json()["text"].startswith("This belongs in Vedic Predicta")


def test_ask_pridicta_prompt_carries_predicta_tone_context(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert "Predicta tone context:" in prompt
        assert '"supportStyle": "secular"' in prompt
        assert '"allowDevotionalPhrasing": false' in prompt
        assert '"headlineStyle": "short-first"' in prompt
        assert "Tone enforcement: use predictaTone" in prompt
        return "Direct answer\n\nChart evidence\n- Tone context is present."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Please tell me right now. Keep it practical only. I am not Hindu and I do not want religious remedies!!",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"


def test_ask_pridicta_prompt_carries_saved_style_preference(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert '"stylePreference": "devotional"' in prompt
        assert "Style preference enforcement:" in prompt
        return "Direct answer\n\nChart evidence\n- Style preference is present."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Read my career direction clearly.",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "predictaStylePreference": "devotional",
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"


def test_numerology_predicta_prompt_carries_name_correction_context(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert '"focus": "name-correction"' in prompt
        assert '"currentName": "Aarav Mehta"' in prompt
        assert '"candidateName": "Arav Mehta"' in prompt
        assert '"currentNameNumber"' in prompt
        assert '"candidateNameNumber"' in prompt
        assert "compare current spelling and candidate spelling" in prompt
        return "Numbers used\n- Current and candidate spelling were compared."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": 'Should I change my name to "Arav Mehta"?',
            "chartContext": {
                "predictaSchool": "NUMEROLOGY",
                "sourceScreen": "Numerology Predicta",
                "handoffQuestion": 'Should I change my name to "Arav Mehta"?',
            },
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"


def test_numerology_predicta_prompt_localizes_foundation_for_hindi(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert '"requestedLanguage": "hi"' in prompt
        assert '"label": "रचनाकार"' in prompt
        assert '"label": "Builder"' not in prompt
        assert "Greeting, transition, और archetype labels" in prompt
        return "ठीक है।"

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "मेरी numerology profile पढ़ो।",
            "chartContext": {
                "predictaSchool": "NUMEROLOGY",
                "sourceScreen": "Numerology Predicta",
                "handoffQuestion": "मेरी numerology profile पढ़ो।",
            },
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
            "language": "hi",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"


def test_numerology_deterministic_name_correction_uses_candidate_numbers():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message='Should I change my name to "Arav Mehta"?',
        chartContext={
            "predictaSchool": "NUMEROLOGY",
            "sourceScreen": "Numerology Predicta",
            "handoffQuestion": 'Should I change my name to "Arav Mehta"?',
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
    )

    reply = ai_module.build_deterministic_numerology_reply(request)

    assert "Current name: Aarav Mehta gives name number" in reply
    assert "Suggested spelling: Arav Mehta gives name number" in reply
    assert "not a guaranteed life fix" in reply
    assert "do not change legal names from numerology alone" in reply


def test_numerology_deterministic_profile_localizes_hindi_reply():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="मेरी numerology profile पढ़ो।",
        chartContext={
            "predictaSchool": "NUMEROLOGY",
            "sourceScreen": "Numerology Predicta",
            "handoffQuestion": "मेरी numerology profile पढ़ो।",
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
        language="hi",
    )

    reply = ai_module.build_deterministic_numerology_reply(request)

    assert "नाम संख्या" in reply
    assert "रचनाकार" in reply
    assert "Builder" not in reply


def test_numerology_deterministic_compatibility_requires_partner_dob():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="Check my compatibility with Priya.",
        chartContext={
            "predictaSchool": "NUMEROLOGY",
            "sourceScreen": "Numerology Predicta",
            "handoffQuestion": "Check my compatibility with Priya.",
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
    )

    reply = ai_module.build_deterministic_numerology_reply(request)

    assert "I will not invent the other person's data" in reply
    assert "full name and date of birth" in reply


def test_numerology_deterministic_compatibility_calculates_supplied_partner():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="Check compatibility with Priya Shah born on 1996-02-24.",
        chartContext={
            "predictaSchool": "NUMEROLOGY",
            "sourceScreen": "Numerology Predicta",
            "handoffQuestion": "Check compatibility with Priya Shah born on 1996-02-24.",
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
    )

    reply = ai_module.build_deterministic_numerology_reply(request)

    assert "Your numbers: name" in reply
    assert "Priya Shah:" in reply
    assert "Compatibility tone:" in reply
    assert "Care point:" in reply


def test_numerology_empty_openai_reply_falls_back_to_deterministic(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        return ""

    def fake_gemini_response(**kwargs):
        raise ai_module.AIConfigurationError("GEMINI_API_KEY is not configured.")

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    monkeypatch.setattr(ai_module, "create_gemini_text_response", fake_gemini_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Read my numerology profile from name number, birth number, destiny number, and current personal timing.",
            "chartContext": {
                "predictaSchool": "NUMEROLOGY",
                "sourceScreen": "Numerology Predicta",
                "handoffQuestion": "Read my numerology profile from name number, birth number, destiny number, and current personal timing.",
            },
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "deterministic"
    assert "Numerology Predicta mode" in payload["text"]


def test_signature_predicta_has_safe_deterministic_boundary():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="Read my signature.",
        chartContext={
            "predictaSchool": "SIGNATURE",
            "sourceScreen": "Signature Predicta",
            "handoffQuestion": "Read my signature.",
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
    )
    analysis = build_jyotish_analysis(
        kundli,
        request.message,
        request.chartContext,
        request.userPlan,
    )

    reply = ai_module.build_deterministic_chart_reply(request, analysis)

    assert "Signature Predicta mode" in reply
    assert "identity verification" in reply
    assert "handwriting forensics" in reply
    assert "uploaded, drawn, or user-confirmed visual traits" in reply


def test_signature_predicta_uses_confirmed_traits_in_prompt(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert '"signatureAnalysis"' in prompt
        assert '"status": "ready"' in prompt
        assert '"label": "Baseline"' in prompt
        assert '"value": "upward"' in prompt
        assert '"label": "Pressure"' in prompt
        assert '"value": "heavy"' in prompt
        assert '"rhythm"' in prompt
        assert '"confidenceExpression"' in prompt
        assert '"improvementPlan"' in prompt
        assert "using signatureAnalysis first" in kwargs["system_prompt"]
        return "Traits observed\n- Baseline upward.\n\nImprovement plan\n- Keep it natural."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
            "chartContext": {
                "predictaSchool": "SIGNATURE",
                "sourceScreen": "Signature Predicta",
                "handoffQuestion": "Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
            },
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"


def test_signature_predicta_localizes_prompt_context_for_hindi(monkeypatch):
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        prompt = kwargs["user_prompt"]
        assert '"requestedLanguage": "hi"' in prompt
        assert '"displayLabel": "आधार रेखा"' in prompt
        assert '"valueLabel": "ऊपर जाती"' in prompt
        assert '"displayLabel": "दबाव"' in prompt
        assert '"valueLabel": "भारी"' in prompt
        return "ठीक है।"

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "मेरे हस्ताक्षर के संकेत पढ़ो। Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
            "chartContext": {
                "predictaSchool": "SIGNATURE",
                "sourceScreen": "Signature Predicta",
                "handoffQuestion": "मेरे हस्ताक्षर के संकेत पढ़ो। Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
            },
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
            "language": "hi",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"


def test_signature_predicta_deterministic_reply_reads_confirmed_traits():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
        chartContext={
            "predictaSchool": "SIGNATURE",
            "sourceScreen": "Signature Predicta",
            "handoffQuestion": "Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
    )

    reply = ai_module.build_deterministic_signature_reply(request)

    assert "Traits observed: Baseline upward, Legibility partial, Pressure heavy." in reply
    assert "Writing rhythm:" in reply
    assert "Confidence expression:" in reply
    assert "Consistency:" in reply
    assert "Improvement plan:" in reply
    assert "identity verification" in reply


def test_signature_predicta_deterministic_reply_localizes_hindi():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    request = ai_module.PridictaChatRequest(
        message="मेरे हस्ताक्षर के संकेत पढ़ो। Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
        chartContext={
            "predictaSchool": "SIGNATURE",
            "sourceScreen": "Signature Predicta",
            "handoffQuestion": "मेरे हस्ताक्षर के संकेत पढ़ो। Signature Predicta context: Observed traits: Baseline upward; Pressure heavy; Legibility partial.",
        },
        kundli=kundli,
        history=[],
        userPlan="FREE",
        language="hi",
    )

    reply = ai_module.build_deterministic_signature_reply(request)

    assert "हस्ताक्षर प्रेडिक्टा मोड" in reply
    assert "देखे गए संकेत: आधार रेखा ऊपर जाती" in reply
    assert "दबाव भारी" in reply
    assert "लिखावट की लय:" in reply


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


def test_ai_telemetry_records_openai_success_and_redacts_raw_content(
    tmp_path,
    monkeypatch,
):
    telemetry_path = tmp_path / "ai-telemetry.json"
    monkeypatch.setenv("PRIDICTA_AI_TELEMETRY_STORE_PATH", str(telemetry_path))
    monkeypatch.setenv(
        "PRIDICTA_AI_PRICING_JSON",
        '{"gpt-5.4-mini":{"inputPerMillion":0.1,"outputPerMillion":0.4}}',
    )
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    class FakeOpenAIResponse:
        status_code = 200

        def json(self):
            return {
                "output_text": "Chart evidence\n- D1 context is present.\n\nReading: use focus well.",
                "usage": {"input_tokens": 120, "output_tokens": 24},
            }

    def fake_post(url, **kwargs):
        return FakeOpenAIResponse()

    monkeypatch.setenv("OPENAI_API_KEY", "test-openai-key")
    monkeypatch.setattr(ai_module, "moderate_text_with_openai", lambda message: None)
    monkeypatch.setattr(ai_module.httpx, "post", fake_post)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "Please predict future focus for my secret raw question about Aarav Mehta.",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    events = list_ai_telemetry_events()
    assert len(events) == 1
    event = events[0]
    assert event.provider == "openai"
    assert event.model == ai_module.FREE_REASONING_MODEL
    assert event.feature == "chat"
    assert event.activeSchool == "PARASHARI"
    assert event.userPlan == "FREE"
    assert event.intent == "deep"
    assert event.cacheState == "miss"
    assert event.fallbackReason is None
    assert event.success is True
    assert event.estimatedInputTokens > 0
    assert event.estimatedOutputTokens > 0
    assert event.providerInputTokens == 120
    assert event.providerOutputTokens == 24
    assert event.estimatedCostUsd is not None
    assert event.subjectHash and event.subjectHash.startswith("ai_")

    raw_store = telemetry_path.read_text()
    assert "my secret raw question" not in raw_store.lower()
    assert "Aarav Mehta" not in raw_store
    assert VALID_BIRTH["date"] not in raw_store
    assert VALID_BIRTH["place"] not in raw_store


def test_ai_telemetry_records_gemini_fallback(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        raise ai_module.AIConfigurationError("OPENAI_API_KEY is not configured.")

    def fake_gemini_response(**kwargs):
        return "Gemini fallback reading."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)
    monkeypatch.setattr(ai_module, "create_gemini_text_response", fake_gemini_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "What should I focus on today?",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    events = list_ai_telemetry_events()
    assert events[0].provider == "gemini"
    assert events[0].model == ai_module.GEMINI_FLASH_MODEL
    assert events[0].feature == "chat"
    assert events[0].cacheState == "miss"
    assert events[0].fallbackReason == "openai-unavailable-gemini-fallback"
    assert events[0].userPlan == "FREE"


def test_ai_telemetry_records_deterministic_fallback(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fail_ai_response(**kwargs):
        raise ai_module.AIProviderError("provider unavailable")

    monkeypatch.setattr(ai_module, "create_ai_text_response", fail_ai_response)

    client = TestClient(app)
    response = client.post(
        "/ask-pridicta",
        json={
            "message": "What should I focus on today?",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )

    assert response.status_code == 200
    events = list_ai_telemetry_events()
    assert events[0].provider == "deterministic"
    assert events[0].model == "jyotish-deterministic-v1"
    assert events[0].fallbackReason == "provider-unavailable-deterministic-fallback"
    assert events[0].feature == "chat"
    assert events[0].success is True


def test_ai_telemetry_admin_summary_is_safe(tmp_path, monkeypatch):
    monkeypatch.setenv(
        "PRIDICTA_AI_TELEMETRY_STORE_PATH",
        str(tmp_path / "ai-telemetry.json"),
    )
    monkeypatch.setenv("PRIDICTA_ADMIN_API_TOKEN", "secret-admin")
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))

    def fake_openai_response(**kwargs):
        return "Short safe answer."

    monkeypatch.setattr(ai_module, "create_openai_text_response", fake_openai_response)

    client = TestClient(app)
    chat = client.post(
        "/ask-pridicta",
        json={
            "message": "Do not store this private chat sentence.",
            "kundli": kundli.model_dump(mode="json"),
            "history": [],
            "userPlan": "FREE",
        },
    )
    assert chat.status_code == 200

    summary = client.get(
        "/ai/admin/telemetry/summary",
        headers={"x-pridicta-admin-token": "secret-admin"},
    )

    assert summary.status_code == 200
    payload = summary.json()
    assert payload["totalEvents"] == 1
    assert payload["byProvider"]["openai"] == 1
    assert payload["latestEvents"][0]["feature"] == "chat"
    assert "Do not store this private chat sentence" not in summary.text


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
