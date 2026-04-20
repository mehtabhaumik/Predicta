from __future__ import annotations

import json
import os
import re
from typing import Literal

from fastapi import APIRouter, HTTPException, Response

from .models import AIContextPayload, PridictaAIRequest, PridictaAIResponse
from .providers import (
    AIProviderError,
    AIProviderUnavailable,
    compact_with_gemini,
    generate_openai_response,
)
from .response_cache import (
    build_ai_response_cache_key,
    can_use_ai_response_cache,
    get_cached_ai_response,
    set_cached_ai_response,
)

ai_router = APIRouter(prefix="/ai", tags=["ai"])


def _env_int(name: str, default: int) -> int:
    try:
        return max(int(os.getenv(name, str(default))), 1)
    except ValueError:
        return default


FREE_MODEL = os.getenv("PREDICTA_OPENAI_FREE_MODEL", "gpt-5.4-mini")
DEEP_MODEL = os.getenv("PREDICTA_OPENAI_DEEP_MODEL", "gpt-5.2")
GEMINI_HELPER_MODEL = os.getenv("PREDICTA_GEMINI_HELPER_MODEL", "gemini-2.5-flash")
FREE_MAX_OUTPUT_TOKENS = _env_int("PREDICTA_AI_FREE_MAX_OUTPUT_TOKENS", 420)
PREMIUM_MAX_OUTPUT_TOKENS = _env_int("PREDICTA_AI_PREMIUM_MAX_OUTPUT_TOKENS", 720)
MAX_HISTORY_TURNS = _env_int("PREDICTA_AI_MAX_HISTORY_TURNS", 8)
MAX_CONTEXT_CHARS = _env_int("PREDICTA_AI_MAX_CONTEXT_CHARS", 14000)
MAX_HISTORY_CHARS_PER_TURN = _env_int("PREDICTA_AI_MAX_HISTORY_CHARS_PER_TURN", 700)

DEEP_PATTERNS = (
    re.compile(r"predict", re.IGNORECASE),
    re.compile(r"future", re.IGNORECASE),
    re.compile(r"next\s+\d+\s+(years?|months?)", re.IGNORECASE),
    re.compile(r"career.*marriage|marriage.*career", re.IGNORECASE),
    re.compile(r"dasha", re.IGNORECASE),
    re.compile(r"pdf|report", re.IGNORECASE),
    re.compile(r"remed", re.IGNORECASE),
    re.compile(r"compare|cross[-\s]?check", re.IGNORECASE),
)


@ai_router.post("/pridicta", response_model=PridictaAIResponse)
async def ask_pridicta(request: PridictaAIRequest, response: Response):
    intent = "deep" if request.deepAnalysis else detect_intent(request)
    model = select_openai_model(intent=intent, user_plan=request.userPlan)
    cache_key = build_ai_response_cache_key(model=model, request=request)

    if can_use_ai_response_cache(request):
        cached = get_cached_ai_response(cache_key)
        if cached:
            response.headers["X-Predicta-Cache"] = "HIT"
            return cached
    else:
        response.headers["X-Predicta-Cache"] = "BYPASS"

    optimized_context = build_ai_context(request)
    serialized_context = optimized_context.model_dump_json(indent=2)
    compact_context = await compact_with_gemini(
        model=GEMINI_HELPER_MODEL,
        prompt="\n\n".join(
            [
                "Compact this Vedic kundli context for a downstream OpenAI astrologer.",
                "Keep factual chart context only. Do not create final user guidance or persona.",
                serialized_context,
            ]
        ),
    )
    final_context = bound_text(compact_context or serialized_context, MAX_CONTEXT_CHARS)

    try:
        text = await generate_openai_response(
            max_output_tokens=get_max_output_tokens(
                intent=intent,
                user_plan=request.userPlan,
            ),
            messages=[
                {
                    "role": "system",
                    "content": build_system_prompt(request.preferredLanguage),
                },
                {
                    "role": "user",
                    "content": build_user_prompt(request, final_context),
                },
            ],
            model=model,
        )
    except AIProviderUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIProviderError as exc:
        raise HTTPException(
            status_code=502,
            detail="Predicta guidance is temporarily unavailable. Please try again shortly.",
        ) from exc

    ai_response = PridictaAIResponse(
        compactedWithGemini=bool(compact_context),
        intent=intent,
        model=model,
        provider="openai",
        text=text,
        usedDeepModel=intent == "deep" and model == DEEP_MODEL,
    )
    if can_use_ai_response_cache(request):
        set_cached_ai_response(cache_key, ai_response)
        response.headers["X-Predicta-Cache"] = "MISS"

    return ai_response


def detect_intent(request: PridictaAIRequest) -> Literal["simple", "moderate", "deep"]:
    message = request.message.strip()
    words = [word for word in re.split(r"\s+", message) if word]

    if any(pattern.search(message) for pattern in DEEP_PATTERNS):
        return "deep"

    if request.chartContext and request.chartContext.selectedSection:
        if "report" in request.chartContext.selectedSection.lower():
            return "deep"

    if len(words) <= 8 and not (request.chartContext and request.chartContext.chartType):
        return "simple"

    return "moderate"


def select_openai_model(*, intent: str, user_plan: str) -> str:
    if intent == "deep" and user_plan == "PREMIUM":
        return DEEP_MODEL
    return FREE_MODEL


def get_max_output_tokens(*, intent: str, user_plan: str) -> int:
    if intent == "deep" and user_plan == "PREMIUM":
        return PREMIUM_MAX_OUTPUT_TOKENS
    if intent == "simple":
        return min(260, FREE_MAX_OUTPUT_TOKENS)
    return FREE_MAX_OUTPUT_TOKENS


def build_ai_context(request: PridictaAIRequest) -> AIContextPayload:
    kundli = request.kundli
    chart_context = request.chartContext
    selected_chart = None

    if chart_context and chart_context.chartType:
        chart = kundli.charts.get(chart_context.chartType)
        if chart:
            selected_chart = {
                "chartType": chart.chartType,
                "name": chart.name,
                "purpose": chart_context.purpose or chart.name,
                "ascendantSign": chart.ascendantSign,
                "relevantPlacements": chart.housePlacements,
            }

    return AIContextPayload(
        activeContext=chart_context,
        ashtakavargaSummary={
            "strongestHouses": kundli.ashtakavarga.strongestHouses,
            "totalScore": kundli.ashtakavarga.totalScore,
            "weakestHouses": kundli.ashtakavarga.weakestHouses,
        },
        birthSummary=(
            f"{kundli.birthDetails.name}, born {kundli.birthDetails.date} "
            f"at {kundli.birthDetails.time} in {kundli.birthDetails.place}"
        ),
        calculationMeta={
            "ayanamsa": kundli.calculationMeta.ayanamsa,
            "calculatedAt": kundli.calculationMeta.calculatedAt,
            "houseSystem": kundli.calculationMeta.houseSystem,
            "nodeType": kundli.calculationMeta.nodeType,
        },
        coreIdentity={
            "lagna": kundli.lagna,
            "moonSign": kundli.moonSign,
            "nakshatra": kundli.nakshatra,
        },
        currentDasha=kundli.dasha.current.model_dump(),
        keyPlanets=kundli.planets[:9],
        keyYogas=kundli.yogas[:5],
        selectedChart=selected_chart,
    )


def build_system_prompt(preferred_language: str | None) -> str:
    language = preferred_language or "en"
    return "\n".join(
        [
            "You are Predicta, a premium text-based Vedic astrology guide.",
            "You are a highly experienced Jyotish practitioner with classical Vedic astrology expertise.",
            "Use Vedic concepts, divisional charts, dashas, yogas, nakshatras, and ashtakavarga only when helpful.",
            "Speak calmly, wisely, compassionately, and practically.",
            "Never be fear-based, manipulative, fatalistic, or promise guaranteed outcomes.",
            "Never claim certainty percentages.",
            "Prioritize the passed chart context first.",
            "Keep responses concise, meaningful, emotionally calm, and cost-aware.",
            f"Respond in this language/locale when practical: {language}.",
        ]
    )


def build_user_prompt(request: PridictaAIRequest, compact_context: str) -> str:
    recent_history = request.history[-MAX_HISTORY_TURNS:]
    history_text = "\n".join(
        f"{'User' if turn.role == 'user' else 'Predicta'}: {bound_text(turn.text, MAX_HISTORY_CHARS_PER_TURN)}"
        for turn in recent_history
    )

    return "\n\n".join(
        [
            "Kundli context:",
            compact_context,
            "Recent conversation:",
            history_text or "No previous conversation.",
            f"User question: {request.message}",
        ]
    )


def bound_text(value: str, max_chars: int) -> str:
    if len(value) <= max_chars:
        return value
    suffix = "\n[Trimmed for focus.]"
    if max_chars <= len(suffix):
        return value[:max_chars]
    return f"{value[: max_chars - len(suffix)].rstrip()}{suffix}"
