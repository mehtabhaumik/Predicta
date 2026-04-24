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
    generate_gemini_response,
    generate_openai_response,
    should_fallback_from_openai,
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
GEMINI_FALLBACK_MODEL = os.getenv(
    "PREDICTA_GEMINI_FALLBACK_MODEL",
    GEMINI_HELPER_MODEL,
)
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

SMALL_TALK_ONLY_PATTERN = re.compile(
    r"^(?:hi|hello|hey|hey there|hello there|hi there|yo|namaste|good morning|good afternoon|good evening|good night|how are you|how are you doing|are you there|thanks|thank you|ok|okay|cool|nice)(?:\s+(?:predicta|pridicta))?[!?.\s]*$",
    re.IGNORECASE,
)
ASTROLOGY_CUE_PATTERN = re.compile(
    r"\b(chart|kundli|horoscope|dasha|lagna|nakshatra|career|marriage|relationship|love|planet|report|pdf|prediction|predict|future|transit|remed(?:y|ies))\b",
    re.IGNORECASE,
)

MONTHS = {
    "jan": "01",
    "january": "01",
    "feb": "02",
    "february": "02",
    "mar": "03",
    "march": "03",
    "apr": "04",
    "april": "04",
    "may": "05",
    "jun": "06",
    "june": "06",
    "jul": "07",
    "july": "07",
    "aug": "08",
    "august": "08",
    "sep": "09",
    "sept": "09",
    "september": "09",
    "oct": "10",
    "october": "10",
    "nov": "11",
    "november": "11",
    "dec": "12",
    "december": "12",
}


@ai_router.post("/pridicta", response_model=PridictaAIResponse)
async def ask_pridicta(request: PridictaAIRequest, response: Response):
    if is_small_talk_prompt(request.message):
        return PridictaAIResponse(
            compactedWithGemini=False,
            intent="simple",
            model="predicta-small-talk",
            provider="local",
            text=build_small_talk_response(
                request.message,
                has_kundli=bool(request.kundli),
                chart_type=request.chartContext.chartType if request.chartContext else None,
            ),
            usedDeepModel=False,
        )

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

    compact_context = None
    final_context = None
    if request.kundli:
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

    max_output_tokens = get_max_output_tokens(
        intent=intent,
        user_plan=request.userPlan,
    )
    system_prompt = build_system_prompt(request.preferredLanguage)
    user_prompt = build_user_prompt(request, final_context)

    provider: Literal["openai", "gemini"] = "openai"
    response_model = model
    used_deep_model = intent == "deep" and model == DEEP_MODEL

    try:
        text = await generate_openai_response(
            max_output_tokens=max_output_tokens,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            model=model,
        )
    except AIProviderError as exc:
        if not should_fallback_from_openai(exc):
            raise HTTPException(
                status_code=502,
                detail="Predicta guidance is temporarily unavailable. Please try again shortly.",
            ) from exc

        text, provider, response_model, used_deep_model = await generate_gemini_fallback(
            original_error=exc,
            max_output_tokens=max_output_tokens,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except AIProviderUnavailable as exc:
        text, provider, response_model, used_deep_model = await generate_gemini_fallback(
            original_error=exc,
            max_output_tokens=max_output_tokens,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

    ai_response = PridictaAIResponse(
        compactedWithGemini=bool(compact_context),
        intent=intent,
        model=response_model,
        provider=provider,
        text=text,
        usedDeepModel=used_deep_model,
    )
    if can_use_ai_response_cache(request):
        set_cached_ai_response(cache_key, ai_response)
        response.headers["X-Predicta-Cache"] = "MISS"

    return ai_response


async def generate_gemini_fallback(
    *,
    original_error: BaseException,
    max_output_tokens: int,
    system_prompt: str,
    user_prompt: str,
) -> tuple[str, Literal["gemini"], str, bool]:
    try:
        text = await generate_gemini_response(
            max_output_tokens=max_output_tokens,
            model=GEMINI_FALLBACK_MODEL,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except (AIProviderError, AIProviderUnavailable) as fallback_exc:
        raise HTTPException(
            status_code=503,
            detail="Predicta guidance is temporarily unavailable. Please try again shortly.",
        ) from fallback_exc
    return text, "gemini", GEMINI_FALLBACK_MODEL, False


def detect_intent(request: PridictaAIRequest) -> Literal["simple", "moderate", "deep"]:
    message = request.message.strip()
    words = [word for word in re.split(r"\s+", message) if word]

    if is_small_talk_prompt(message):
        return "simple"

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


def normalize_year(year: str) -> str:
    if len(year) == 4:
        return year
    return f"19{year}" if int(year) > 30 else f"20{year}"


def format_date_parts(year: str, month: str, day: str) -> str:
    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"


def extract_date(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", text.strip())
    iso = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", normalized)
    if iso:
        return format_date_parts(iso.group(1), iso.group(2), iso.group(3))

    numeric = re.search(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b", normalized)
    if numeric:
        return format_date_parts(
            normalize_year(numeric.group(3)),
            numeric.group(2),
            numeric.group(1),
        )

    named = re.search(r"\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})\b", normalized, re.IGNORECASE)
    if named:
        month = MONTHS.get(named.group(2).lower())
        if month:
            return format_date_parts(normalize_year(named.group(3)), month, named.group(1))

    return None


def extract_time(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", text.strip())
    match = re.search(
        r"\b(?:time|born at|birth time is|at)\s*:?\s*(\d{1,2})(?::(\d{2}))?\s*(?:in the\s+)?(am|pm|morning|evening|night)?\b",
        normalized,
        re.IGNORECASE,
    ) or re.search(r"\b(\d{1,2}):(\d{2})\s*(am|pm|morning|evening|night)?\b", normalized, re.IGNORECASE)

    if not match:
        return None

    hours = int(match.group(1))
    minutes = int(match.group(2) or "00")
    meridiem_text = (match.group(3) or "").lower()

    if meridiem_text in {"pm", "evening", "night"} and hours < 12:
        hours += 12
    elif meridiem_text in {"am", "morning"} and hours == 12:
        hours = 0

    if hours > 23 or minutes > 59:
        return None

    return f"{hours:02d}:{minutes:02d}"


def extract_place(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", text.strip())
    labeled = re.search(
        r"\b(?:birth place|birthplace|place)\s*(?:is|:)?\s*([A-Za-z][A-Za-z\s.-]+(?:,\s*[A-Za-z][A-Za-z\s.-]+){0,2})\b",
        normalized,
        re.IGNORECASE,
    )
    if labeled and labeled.group(1):
        return labeled.group(1).strip()

    born_in = re.search(
        r"\b(?:born in|from)\s+([A-Za-z][A-Za-z\s.-]+(?:,\s*[A-Za-z][A-Za-z\s.-]+){0,2})\b",
        normalized,
        re.IGNORECASE,
    )
    if born_in and born_in.group(1):
        return born_in.group(1).strip()

    return None


def summarize_known_birth_details(request: PridictaAIRequest) -> str:
    date = None
    time = None
    place = None

    user_turns = [turn.text for turn in request.history if turn.role == "user"]
    user_turns.append(request.message)

    for text in user_turns:
        date = date or extract_date(text)
        time = time or extract_time(text)
        place = place or extract_place(text)

    parts = []
    if date:
        parts.append(f"date of birth {date}")
    if time:
        parts.append(f"birth time {time}")
    if place:
        parts.append(f"birth place {place}")

    return ", ".join(parts) if parts else "None yet."


def build_ai_context(request: PridictaAIRequest) -> AIContextPayload:
    kundli = request.kundli
    if kundli is None:
        raise ValueError("build_ai_context requires kundli data")
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
            "Use only the chart data that is actually provided in the context.",
            "Do not imply you can see a user's chart unless the request includes real kundli data.",
            "If no kundli is provided, switch into no-chart guidance mode: be intelligent, conversational, and useful without inventing chart facts.",
            "In no-chart guidance mode, answer the life question thoughtfully first. You may mention what chart data could add, but do not make the whole answer a request for birth details.",
            "Prioritize the passed chart context first when it exists, but do not default to D10 or career themes for broad questions.",
            "If no chart section is highlighted, begin from the broad birth chart picture and bring in divisional charts only when they are clearly relevant.",
            "Use the recent conversation as working memory. If the user asks what you already know, what they already shared, or what you mean, answer that directly.",
            "If something is missing, say exactly what is known and what is still missing. Do not repeat a generic line when the user is asking for clarification.",
            "When the user pushes back or asks a follow-up about your last answer, respond like a thoughtful human guide rather than a template.",
            "Keep responses concise, meaningful, emotionally calm, and cost-aware.",
            f"Respond in this language/locale when practical: {language}.",
        ]
    )


def is_small_talk_prompt(message: str) -> bool:
    normalized = re.sub(r"\s+", " ", message.strip())
    if not normalized:
        return False
    if ASTROLOGY_CUE_PATTERN.search(normalized):
        return False
    return bool(SMALL_TALK_ONLY_PATTERN.match(normalized))


def build_small_talk_response(
    message: str,
    *,
    has_kundli: bool,
    chart_type: str | None,
) -> str:
    normalized = re.sub(r"\s+", " ", message.strip()).lower()

    if has_kundli:
        guidance_hint = (
            f"If you want, we can look at {chart_type} or any life question you want to explore."
            if chart_type
            else "If you want, we can look at your chart or any life question you want to explore."
        )
    else:
        guidance_hint = (
            "If you want, tell me your birth details or ask a focused life question and I will guide you from there."
        )

    if "how are you" in normalized:
        return f"I am here and ready with you. {guidance_hint}"

    if "thank" in normalized:
        return "Always. Take your time, and ask when you are ready."

    return f"Hello. I am here. {guidance_hint}"


def build_user_prompt(request: PridictaAIRequest, compact_context: str | None) -> str:
    recent_history = request.history[-MAX_HISTORY_TURNS:]
    history_text = "\n".join(
        f"{'User' if turn.role == 'user' else 'Predicta'}: {bound_text(turn.text, MAX_HISTORY_CHARS_PER_TURN)}"
        for turn in recent_history
    )

    if request.kundli is None:
        return "\n\n".join(
            [
                "Chart status:",
                "No kundli has been generated yet. You must not claim chart placements, dasha periods, houses, or divisional chart facts.",
                "Known birth details from user so far:",
                summarize_known_birth_details(request),
                "Recent conversation (authoritative working memory):",
                history_text or "No previous conversation.",
                "How to answer:",
                "Give thoughtful no-chart guidance that directly addresses the user's question. Be specific, human, and useful. Ask at most one clarifying question if it genuinely sharpens the answer. Briefly mention what birth details or kundli could add, but do not make that the whole reply.",
                f"User question: {request.message}",
            ]
        )

    return "\n\n".join(
        [
            "Kundli context:",
            compact_context or "",
            "Recent conversation (authoritative working memory):",
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
