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
EXPLICIT_CHART_ANALYSIS_PATTERN = re.compile(
    r"\b(analy(?:ze|se)\s+(?:my|the)\s+(?:chart|kundli|horoscope)|read\s+(?:my|the)\s+(?:chart|kundli|horoscope)|chart\s+reading|kundli\s+reading|what\s+does\s+my\s+chart\s+say)\b",
    re.IGNORECASE,
)
ASTROLOGY_CUE_PATTERN = re.compile(
    r"\b(chart|kundli|horoscope|dasha|lagna|nakshatra|career|marriage|relationship|love|planet|report|pdf|prediction|predict|future|transit|remed(?:y|ies))\b",
    re.IGNORECASE,
)
WEAK_NO_KUNDLI_PATTERNS = (
    re.compile(r"^(understanding|thinking about|looking at)\s+your\b", re.IGNORECASE),
    re.compile(r"\b(common|natural|practical)\s+concern\b", re.IGNORECASE),
    re.compile(r"^it's natural to\b", re.IGNORECASE),
    re.compile(r"^it is natural to\b", re.IGNORECASE),
    re.compile(r"\bseek clarity about\b", re.IGNORECASE),
    re.compile(r"^while i (don't|do not) have your chart\b", re.IGNORECASE),
    re.compile(r"^without (your|a) chart\b", re.IGNORECASE),
    re.compile(r"\bwhile i (don't|do not) have your chart\b", re.IGNORECASE),
)
WEAK_CHART_AWARE_PATTERNS = (
    re.compile(r"\b(chart data got cut off|what you pasted)\b", re.IGNORECASE),
    re.compile(r"\bi only see\b", re.IGNORECASE),
    re.compile(r"\bi(?: am|'m) missing the actual\b", re.IGNORECASE),
    re.compile(r"\bmissing your actual d\d+\s+placements\b", re.IGNORECASE),
    re.compile(r"\bonly have your d1\b", re.IGNORECASE),
    re.compile(r"\bwithout the full .*chart\b", re.IGNORECASE),
    re.compile(r"\bwithout your specific birth chart\b", re.IGNORECASE),
    re.compile(r"\bi(?:'ll| will) need your .*navamsa placements\b", re.IGNORECASE),
    re.compile(r"\bi(?:'ll| will) need your .*full kundli chart\b", re.IGNORECASE),
    re.compile(r"\bif you want the exact .*i(?:'ll| will) need\b", re.IGNORECASE),
    re.compile(r"\bi can'?t offer specific astrological remedies\b", re.IGNORECASE),
    re.compile(r"^alright,\s+let'?s\s+(cut to the chase|get straight to it)\.?$", re.IGNORECASE),
    re.compile(r"^ah,\s+the\s+d9\b", re.IGNORECASE),
    re.compile(r"\bit'?s not a punishment, but a persistent invitation for growth\b", re.IGNORECASE),
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
    local_lane_response = maybe_build_local_lane_response(request)
    if local_lane_response is not None:
        return local_lane_response

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
    system_prompt = build_system_prompt(
        request.preferredLanguage,
        request.intelligenceContext,
    )
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

    if request.kundli is None and is_weak_no_kundli_response(text):
        rewritten = await rewrite_no_kundli_response(
            provider=provider,
            model=response_model,
            max_output_tokens=max_output_tokens,
            request=request,
            draft_text=text,
        )
        if rewritten and rewritten.strip():
            text = rewritten.strip()
        if is_weak_no_kundli_response(text):
            text = build_no_kundli_local_guidance(request)
    if request.kundli is None and should_force_theme_floor(request, text):
        text = build_no_kundli_local_guidance(request)
    if request.kundli is not None and is_weak_chart_aware_response(request, text):
        rewritten = await rewrite_chart_aware_response(
            provider=provider,
            model=response_model,
            max_output_tokens=max_output_tokens,
            request=request,
            draft_text=text,
        )
        if rewritten and rewritten.strip():
            text = rewritten.strip()
        if is_weak_chart_aware_response(request, text):
            text = build_chart_aware_local_guidance(request)

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


def is_weak_no_kundli_response(text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.strip())
    if not normalized:
        return True
    if len(normalized) < 200 and not re.search(r'[.!?]"?$', normalized):
        return True
    if len(normalized) > 900:
        return True
    if any(pattern.search(normalized) for pattern in WEAK_NO_KUNDLI_PATTERNS):
        return True
    return normalized.lower().count("chart") >= 3 and len(normalized) < 500


def should_force_theme_floor(request: PridictaAIRequest, text: str) -> bool:
    theme = detect_no_kundli_theme(request.message, request.history)
    request_text = request.message.strip().lower()
    normalized = text.strip().lower()

    if theme == "grief":
        if len(normalized) < 140:
            return True
        if not any(
            marker in normalized
            for marker in ("grief", "loss", "sorry", "heavy", "numb", "disoriented")
        ):
            return True
        if "this week" in request_text and "daily anchor" not in normalized and "this week" not in normalized:
            return True

    if theme == "remedy":
        if "one practical remedy and one spiritual remedy only" in request_text:
            if "practical remedy:" not in normalized or "spiritual remedy:" not in normalized:
                return True

    if theme == "career":
        if "ambition" in request_text:
            if len(normalized) < 180 or "empty ambition" not in normalized:
                return True

    if theme == "relationship":
        if any(marker in request_text for marker in ("emotional labor", "managing the atmosphere", "exhausted")):
            if len(normalized) < 180 or "regulate more than relate" not in normalized:
                return True

    return False


def is_weak_chart_aware_response(request: PridictaAIRequest, text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.strip())
    lowered = normalized.lower()
    request_text = request.message.lower()
    if not normalized:
        return True
    if normalized.lower().startswith("cached response"):
        return False
    if 20 < len(normalized) < 220 and not re.search(r'[.!?]"?$', normalized):
        return True
    if any(pattern.search(normalized) for pattern in WEAK_CHART_AWARE_PATTERNS):
        return True
    if request.kundli is not None and re.search(
        r"\b(send|share).*(navamsa placements|full kundli|full chart)\b",
        lowered,
    ):
        return True
    if request.chartContext and request.chartContext.chartType and request.chartContext.chartType != "D1":
        chart_label = request.chartContext.chartType.lower()
        if chart_label in request_text and "only have your d1" in lowered:
            return True
        if chart_label in request_text and f"missing your actual {chart_label} placements" in lowered:
            return True
    if request.chartContext and request.chartContext.chartType == "D9" and re.search(r"\brelationship|love|marriage|partner\b", request_text):
        if not any(token in lowered for token in ("relationship", "love", "bond", "honesty", "space", "closeness")):
            return True
    if re.search(r"\b(sabotage|self-sabotage|quietly sabotage)\b", request_text):
        if not any(
            token in lowered
            for token in ("sabotage", "overprepare", "approval", "hesitate", "delay", "prove", "self-doubt")
        ):
            return True
    if request.chartContext and request.chartContext.chartType == "D9" and re.search(r"\b(stay too long|carry too much|why)\b", request_text):
        if not any(
            token in lowered
            for token in ("carry", "over-responsible", "tolerate", "burden", "leave", "closeness")
        ):
            return True
    if re.search(r"\b(compassion|less lecture|softer)\b", request_text):
        if not any(
            token in lowered
            for token in ("gentle", "compassion", "makes sense", "you learned", "self-respect")
        ):
            return True
    if re.search(r"\b(boundary sentence|sentence i can actually use|what do i say)\b", request_text):
        if '"' not in normalized and "try:" not in lowered and "say:" not in lowered:
            return True
    if re.search(r"\b(spiritual reminder|keep it simple)\b", request_text):
        if not any(
            token in lowered
            for token in ("mahadev", "shiva", "bhairav", "steady", "return", "reminder", "prayer")
        ):
            return True
    if re.search(r"\b(remedy|remedies)\b", request_text):
        if not any(token in lowered for token in ("practical remedy", "inner remedy", "spiritual remedy", "prayer", "breathwork", "discipline")):
            return True
    return False


def summarize_selected_chart_highlights(request: PridictaAIRequest) -> str:
    if not request.kundli or not request.chartContext or not request.chartContext.chartType:
        return ""

    chart = request.kundli.charts.get(request.chartContext.chartType)
    if not chart:
        return ""

    highlights = []
    for house, placements in chart.housePlacements.items():
        if placements:
            labels = ", ".join(placements)
            suffix = "th"
            if house == 1:
                suffix = "st"
            elif house == 2:
                suffix = "nd"
            elif house == 3:
                suffix = "rd"
            highlights.append(f"{labels} in {house}{suffix}")
        if len(highlights) >= 3:
            break
    return "; ".join(highlights)


def build_chart_aware_local_guidance(request: PridictaAIRequest) -> str:
    kundli = request.kundli
    if kundli is None:
        return "I need the actual kundli to answer this from the chart rather than from guesswork."

    normalized = re.sub(r"\s+", " ", request.message.strip()).lower()
    history_text = " ".join(
        re.sub(r"\s+", " ", turn.text.strip()).lower()
        for turn in request.history
        if getattr(turn, "role", None) == "user"
    )
    combined = f"{history_text} {normalized}".strip()
    chart_label = request.chartContext.chartType if request.chartContext and request.chartContext.chartType else "birth chart"
    dasha_label = f"{kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha}"
    strongest_houses = ", ".join(str(house) for house in kundli.ashtakavarga.strongestHouses[:3])
    chart_highlights = summarize_selected_chart_highlights(request)
    highlight_line = f"I’m reading this through {chart_label}, with highlights like {chart_highlights}. " if chart_highlights else ""

    if re.search(r"\b(sabotage|self-sabotage|quietly sabotage)\b", normalized):
        return (
            f"{highlight_line}The quiet sabotage here is likely not laziness. It is over-managing the path until momentum gets replaced by caution. "
            f"Under {dasha_label}, you can start waiting for perfect certainty, proving too much, or carrying pressure so privately that clean action gets delayed. "
            "The correction is simple: choose one visible commitment and let disciplined consistency speak louder than inner over-checking."
        )

    if re.search(r"\b(remedy|remedies)\b", normalized):
        return (
            f"{highlight_line}The chart asks for steadiness more than force right now, especially under {dasha_label}. "
            "Practical remedy: choose one disciplined action you can repeat weekly and let consistency do the heavy lifting. "
            "Inner remedy: give the pressure somewhere clean to go, whether that is prayer, journaling, breathwork, or one quiet Mahadev practice done sincerely. "
            f"Your stronger support is around houses {strongest_houses}, so visible discipline will help more than emotional drama."
        )

    if re.search(r"\b(next step|grounded next step|what should i do)\b", normalized):
        return (
            f"{highlight_line}The grounded next step is to choose one area where you can create cleaner structure this week and stay with it. "
            f"Under {dasha_label}, the chart responds better to steady form than to emotional force. Start with one visible discipline around the houses {strongest_houses} are supporting, and let that small structure prove the direction."
        )

    if re.search(r"\b(risk|problem|sugarcoat|real risk|real problem)\b", normalized):
        return (
            f"{highlight_line}The risk here is not lack of potential. It is misusing energy: taking on pressure that looks impressive but drains stability. "
            f"Under {dasha_label}, the chart rewards structure and sustained effort more than speed. "
            f"With stronger support around houses {strongest_houses}, progress is real, but it can get distorted if you chase urgency over staying power."
        )

    if re.search(r"\b(normal language|plain language|no astrology lecture)\b", normalized):
        return (
            "In plain language: the pattern is not that you cannot handle depth. It is that you do better when there is honesty, steadiness, and enough room to breathe. "
            "If something feels emotionally unclear or one-sided, you can stay longer than you should and carry more than is healthy. "
            "The correction is simple: clearer boundaries, cleaner truth, less silent endurance."
        )

    if chart_label == "D9" and re.search(r"\b(stay too long|carry too much|why)\b", normalized):
        return (
            f"{highlight_line}Because closeness can register as duty before it registers as ease. "
            "You can keep giving, carrying, and repairing because part of you would rather over-hold the bond than risk being the one who leaves too early. "
            "The D9 correction is not colder love. It is self-respect inside love, so care does not quietly turn into burden."
        )

    if chart_label == "D9" and re.search(r"\b(compassion|less lecture|softer)\b", normalized):
        return (
            f"{highlight_line}More gently: you do not stay too long because you are weak. You stay because your heart takes commitment seriously, and sometimes that sincerity keeps working long after reciprocity has thinned out. "
            "The lesson is not to love less. It is to notice earlier when love has turned into carrying."
        )

    if chart_label == "D9" and re.search(r"\b(boundary sentence|sentence i can actually use|what do i say)\b", normalized):
        return (
            f"{highlight_line}Try this: “I care about this connection, but I cannot keep carrying what needs to be shared. If this is going to continue, the effort has to become more mutual.” "
            "Keep the sentence calm, short, and self-respecting. Do not over-explain it."
        )

    if chart_label == "D9" and re.search(r"\b(spiritual reminder|keep it simple)\b", normalized):
        return (
            f"{highlight_line}Simple reminder: what is meant for you does not ask you to abandon your own steadiness. "
            "Stay truthful, stay soft, and let Mahadev hold what you do not need to force."
        )

    if re.search(r"\b(relationship|relationships|love|marriage|partner)\b", combined):
        return (
            f"{highlight_line}The relationship pattern here is about how you stay, repair, and protect yourself once closeness becomes real. "
            "You are not built for shallow bonds, but you do need honesty and emotional clarity; otherwise you can become private, over-responsible, or quietly burdened. "
            "The chart asks for steadier truth, not more silent tolerance."
        )

    if re.search(r"\b(career|work|role|profession|d10)\b", normalized):
        return (
            f"{highlight_line}This chart does show growth potential, but it is the kind that comes through responsibility, visible effort, and patience rather than fast reward. "
            f"Under {dasha_label}, the pressure is to mature into clearer structure. Stronger support around houses {strongest_houses} suggests progress is available when effort is organized and sustained. "
            "The caution is overextension: do not confuse more load with better direction."
        )

    return (
        f"{highlight_line}The chart is not weak. It is asking for maturity in how you carry pressure, choose your direction, and stay consistent under {dasha_label}. "
        f"Support is strongest around houses {strongest_houses}, so the next step is usually steadier structure rather than dramatic change."
    )


async def rewrite_no_kundli_response(
    *,
    provider: Literal["openai", "gemini"],
    model: str,
    max_output_tokens: int,
    request: PridictaAIRequest,
    draft_text: str,
) -> str | None:
    system_prompt = "\n".join(
        [
            "You are rewriting a Predicta reply.",
            "Keep the meaning, but make it sound more intelligent, human, calm, and specific.",
            "Do not sound like customer support, therapy filler, or a generic AI essay.",
            "Keep it under 120 words unless the user asked for depth.",
            "Lead with the strongest useful insight, then one practical next step.",
            "Ask at most one clarifying question only if it sharpens the answer.",
            "Mention birth details or kundli in one brief closing line only when helpful.",
            "Do not open with phrases like 'understanding your', 'this is a common concern', or 'while I do not have your chart'.",
        ]
    )
    user_prompt = "\n\n".join(
        [
            f"User question: {request.message}",
            f"Known birth details so far: {summarize_known_birth_details(request)}",
            "Rewrite this weak draft into a sharper Predicta answer:",
            draft_text,
        ]
    )

    try:
        if provider == "openai":
            return await generate_openai_response(
                max_output_tokens=min(max_output_tokens, 220),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                model=model,
            )

        return await generate_gemini_response(
            max_output_tokens=min(max_output_tokens, 220),
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except (AIProviderError, AIProviderUnavailable):
        return None


async def rewrite_chart_aware_response(
    *,
    provider: Literal["openai", "gemini"],
    model: str,
    max_output_tokens: int,
    request: PridictaAIRequest,
    draft_text: str,
) -> str | None:
    system_prompt = "\n".join(
        [
            "You are rewriting a Predicta chart-based reply.",
            "The kundli context is complete and authoritative. Do not say the chart is missing, cut off, pasted incompletely, or unavailable.",
            "Keep the answer human, specific, and grounded in the provided chart context.",
            "Avoid clipped sentences, generic AI filler, and astrology dumping.",
            "If the user asks for plain language, use plain language.",
            "If the user asks for remedies, give practical and inner remedies without theatre.",
        ]
    )
    user_prompt = "\n\n".join(
        [
            f"User question: {request.message}",
            f"Chart context: {request.chartContext.model_dump_json() if request.chartContext else 'Broad chart view'}",
            "Rewrite this weak chart-aware draft into a sharper Predicta answer:",
            draft_text,
        ]
    )

    try:
        if provider == "openai":
            return await generate_openai_response(
                max_output_tokens=min(max_output_tokens, 260),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                model=model,
            )

        return await generate_gemini_response(
            max_output_tokens=min(max_output_tokens, 260),
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except (AIProviderError, AIProviderUnavailable):
        return None


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
    date, time, place = extract_known_birth_detail_values(request)

    parts = []
    if date:
        parts.append(f"date of birth {date}")
    if time:
        parts.append(f"birth time {time}")
    if place:
        parts.append(f"birth place {place}")

    return ", ".join(parts) if parts else "None yet."


def extract_known_birth_detail_values(
    request: PridictaAIRequest,
) -> tuple[str | None, str | None, str | None]:
    memory_birth = (
        request.intelligenceContext.memory.birthDetails
        if request.intelligenceContext and request.intelligenceContext.memory
        else None
    )
    date = getattr(memory_birth, "date", None)
    time = getattr(memory_birth, "time", None)
    place = getattr(memory_birth, "place", None)

    user_turns = [turn.text for turn in request.history if turn.role == "user"]
    user_turns.append(request.message)

    for text in user_turns:
        date = date or extract_date(text)
        time = time or extract_time(text)
        place = place or extract_place(text)

    return date, time, place


def get_missing_birth_fields(request: PridictaAIRequest) -> list[str]:
    date, time, place = extract_known_birth_detail_values(request)
    missing = []
    if not date:
        missing.append("date of birth")
    if not time:
        missing.append("birth time")
    if not place:
        missing.append("birth place")
    return missing


def format_missing_birth_fields(fields: list[str]) -> str:
    if not fields:
        return ""
    if len(fields) == 1:
        return fields[0]
    if len(fields) == 2:
        return f"{fields[0]} and {fields[1]}"
    return f"{fields[0]}, {fields[1]}, and {fields[2]}"


def detect_birth_memory_question(message: str) -> str | None:
    normalized = re.sub(r"\s+", " ", message.strip()).lower()

    if (
        re.search(r"\b(what|which)\s+(birth\s*)?(date|dob)\s+(do you have|you have|do you know|have you got)\b", normalized)
        or re.search(r"\bdo you have my\s+(birth\s*)?(date|dob)\b", normalized)
    ):
        return "date"

    if (
        re.search(r"\b(what|which)\s+(birth\s*)?time\s+(do you have|you have|do you know|have you got)\b", normalized)
        or re.search(r"\bdo you have my\s+(birth\s*)?time\b", normalized)
    ):
        return "time"

    if (
        re.search(r"\b(what|which)\s+(birth\s*)?place\s+(do you have|you have|do you know|have you got)\b", normalized)
        or re.search(r"\bdo you have my\s+(birth\s*)?place\b", normalized)
    ):
        return "place"

    if (
        re.search(r"\bwhat\s+details\s+do\s+you\s+have\b", normalized)
        or re.search(r"\bwhich\s+details\s+do\s+you\s+have\b", normalized)
        or re.search(r"\bwhat\s+do\s+you\s+(already\s+)?have\s+(so\s+far)?\b", normalized)
        or re.search(r"\bwhat\s+do\s+you\s+know\s+so\s+far\b", normalized)
        or re.search(r"\bwhich\s+birth\s+details\b", normalized)
    ):
        return "status"

    return None


def is_structured_birth_detail_message(message: str) -> bool:
    normalized = re.sub(r"\s+", " ", message.strip())
    detail_hits = sum(
        1 for extractor in (extract_date, extract_time, extract_place) if extractor(normalized)
    )
    if detail_hits > 0:
        return True
    return bool(
        re.search(r"\b(dob|birth time|birth place|place:|time:)\b", normalized, re.IGNORECASE)
    )


def is_explicit_chart_request_without_kundli(request: PridictaAIRequest) -> bool:
    return request.kundli is None and bool(EXPLICIT_CHART_ANALYSIS_PATTERN.search(request.message))


def build_known_birth_inventory(
    date: str | None,
    time: str | None,
    place: str | None,
) -> str:
    known = []
    if date:
        known.append(f"date of birth {date}")
    if time:
        known.append(f"birth time {time}")
    if place:
        known.append(f"birth place {place}")
    if not known:
        return ""
    if len(known) == 1:
        return known[0]
    return ", ".join(known[:-1]) + f" and {known[-1]}"


def build_birth_memory_response(request: PridictaAIRequest, question_type: str) -> str:
    date, time, place = extract_known_birth_detail_values(request)
    missing = get_missing_birth_fields(request)
    inventory = build_known_birth_inventory(date, time, place)

    if question_type == "date":
        if date:
            return f"I have your date of birth as {date}. {build_missing_birth_suffix(missing)}"
        return f"I do not have your date of birth yet. {build_known_birth_summary_line(inventory, missing)}"

    if question_type == "time":
        if time:
            return f"I have your birth time as {time}. {build_missing_birth_suffix(missing)}"
        return f"I do not have your birth time yet. {build_known_birth_summary_line(inventory, missing)}"

    if question_type == "place":
        if place:
            return f"I have your birth place as {place}. {build_missing_birth_suffix(missing)}"
        return f"I do not have your birth place yet. {build_known_birth_summary_line(inventory, missing)}"

    if inventory:
        if missing:
            return f"I currently have your {inventory}. I still need your {format_missing_birth_fields(missing)} before I can anchor this to the actual chart."
        return f"I have your {inventory}. That is enough to generate the kundli and move into a real chart reading."

    return "I do not have your birth details yet. Send your date of birth, exact birth time, and birth place, and I will take it from there."


def build_missing_birth_suffix(missing: list[str]) -> str:
    if not missing:
        return "That is enough to generate the kundli and move into a real chart reading."
    return f"I still need your {format_missing_birth_fields(missing)} before I can anchor this to the actual chart."


def build_known_birth_summary_line(inventory: str, missing: list[str]) -> str:
    if inventory:
        if missing:
            return f"I only have your {inventory} so far, and I still need your {format_missing_birth_fields(missing)}."
        return f"I already have your {inventory}."
    return "I do not have any birth details yet."


def maybe_build_local_lane_response(request: PridictaAIRequest) -> PridictaAIResponse | None:
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

    birth_memory_question = detect_birth_memory_question(request.message)
    if birth_memory_question:
        return PridictaAIResponse(
            compactedWithGemini=False,
            intent="simple",
            model="predicta-memory-lane",
            provider="local",
            text=build_birth_memory_response(request, birth_memory_question),
            usedDeepModel=False,
        )

    if request.kundli is None and is_structured_birth_detail_message(request.message):
        return PridictaAIResponse(
            compactedWithGemini=False,
            intent="simple",
            model="predicta-birth-detail-lane",
            provider="local",
            text=build_birth_memory_response(request, "status"),
            usedDeepModel=False,
        )

    if is_explicit_chart_request_without_kundli(request):
        return PridictaAIResponse(
            compactedWithGemini=False,
            intent="simple",
            model="predicta-chart-required-lane",
            provider="local",
            text=build_no_kundli_local_guidance(request),
            usedDeepModel=False,
        )

    return None


def detect_no_kundli_theme_from_text(message: str) -> str:
    normalized = re.sub(r"\s+", " ", message.strip()).lower()

    if re.search(r"\b(grief|grieving|loss|losing someone(?: close)?|lost someone(?: close)?|bereave|mourning|heartbreak after loss)\b", normalized):
        return "grief"
    if re.search(r"\b(remedy|remedies|anxiety|restless|restlessness|panic|overthinking|mind won'?t stop)\b", normalized):
        return "remedy"
    if re.search(r"\b(finance|finances|financial|money|income|earning|debt|savings|wealth|salary)\b", normalized):
        return "finance"
    if re.search(r"\b(career|job|work|profession|business|promotion|role|office|ambition)\b", normalized):
        return "career"
    if re.search(r"\b(relationship|love|marriage|partner|spouse|dating|family)\b", normalized):
        return "relationship"
    if re.search(r"\b(health|body|stress|anxiety|sleep|healing|energy)\b", normalized):
        return "health"
    if re.search(r"\b(decide|decision|choose|choice|stay or leave|leave or stay|should i)\b", normalized):
        return "decision"
    if re.search(r"\b(spiritual|purpose|meaning|inner|soul|faith|meditation)\b", normalized):
        return "spiritual"
    return "general"


def detect_no_kundli_theme(message: str, history: list | None = None) -> str:
    direct_theme = detect_no_kundli_theme_from_text(message)
    recent_user_turns = [
        re.sub(r"\s+", " ", turn.text.strip()).lower()
        for turn in (history or [])
        if getattr(turn, "role", None) == "user"
    ][-4:]

    fallback_theme = "general"
    for text in reversed(recent_user_turns):
        theme = detect_no_kundli_theme_from_text(text)
        if theme not in {"general", "decision"}:
            fallback_theme = theme
            break

    if direct_theme != "general":
        if direct_theme == "decision" and fallback_theme != "general":
            return fallback_theme
        return direct_theme

    for text in reversed(recent_user_turns):
        theme = detect_no_kundli_theme_from_text(text)
        if theme != "general":
            return theme

    return "general"


def build_no_kundli_local_guidance(request: PridictaAIRequest) -> str:
    theme = detect_no_kundli_theme(request.message, request.history)
    normalized = re.sub(r"\s+", " ", request.message.strip()).lower()
    known_details = summarize_known_birth_details(request)
    known_details = "" if known_details == "None yet." else known_details
    missing_parts = get_missing_birth_fields(request)

    if len(missing_parts) == 0:
        chart_bridge = "You already have enough birth details there; the next step is to generate the kundli so I can anchor this to the real chart."
    elif known_details:
        missing_text = format_missing_birth_fields(missing_parts)
        chart_bridge = f"I already have your {known_details}. Send your {missing_text} if you want me to anchor this to the real chart."
    else:
        chart_bridge = "If you want this tied to your actual chart, send your date of birth, exact birth time, and birth place."

    if theme == "finance":
        return (
            "The real financial pressure is usually one of three things: stability, stronger income, or relief from strain. "
            "Those need different answers. Tell me which one feels most urgent, and I will answer that directly. "
            f"{chart_bridge}"
        )
    if theme == "career":
        if re.search(r"\bambition\b", normalized):
            return (
                "This does not sound like empty ambition. It sounds like growth asking for a cost you have not fully agreed to yet. "
                "Part of you wants expansion, and part of you is protecting what has already taken years to build. The tension is real because both sides are valid. "
                "Do not reduce this to courage versus fear. It is really about what kind of life you are willing to reorganize in order to grow. "
                f"{chart_bridge}"
            )
        if re.search(r"\b(what am i avoiding|more directly)\b", normalized):
            return (
                "You may be avoiding the grief of outgrowing an older identity. "
                "A bigger role is not just more success. It often means less innocence, less comfort, and less room to hide behind potential. That is why the pull feels strong and the resistance feels personal. "
                "The question is not whether you can grow. It is whether you are ready to let the old structure become too small for you. "
                f"{chart_bridge}"
            )
        if re.search(r"\b(one practical step and one inner step|practical step and one inner step)\b", normalized):
            return (
                "Practical step: choose one concrete area where you want more responsibility and make one clean move toward it this week. "
                "Inner step: sit quietly for ten minutes and name what you are afraid growth will take away from you. Fear becomes easier to carry once it is spoken plainly. "
                f"{chart_bridge}"
            )
        if re.search(r"\b(ignore this|six months)\b", normalized):
            return (
                "Usually the split becomes more expensive. "
                "You keep functioning, but the inner conflict hardens into restlessness, resentment, or quiet self-doubt. Then growth starts to feel like pressure because it was postponed too long. "
                "Ignoring it does not keep life stable. It usually just makes the eventual choice more emotionally costly. "
                f"{chart_bridge}"
            )
        return (
            "Career confusion usually hides inside growth, change, leadership pressure, or exhaustion. "
            "Name the one you are actually dealing with, and I will respond to that instead of giving you a vague career speech. "
            f"{chart_bridge}"
        )
    if theme == "relationship":
        if re.search(r"\b(emotional labor|managing the atmosphere|exhausted)\b", normalized):
            return (
                "That usually means the relationship is asking you to regulate more than relate. "
                "When one person keeps managing tone, timing, and recovery, love starts feeling like work without proper rest. The exhaustion is not imaginary; it is the cost of carrying the emotional climate. "
                "The next move is to name the pattern plainly: “I care about us, but I cannot keep carrying the atmosphere for both of us.” If you want, I can help you phrase that in a calmer way. "
                f"{chart_bridge}"
            )
        if re.search(r"\b(how do i say|say this|without creating a fight|without a fight|without making it worse)\b", normalized):
            return (
                "Lead with your experience, not your accusation. "
                "Try: “I care about us, but I have been carrying too much of the emotional weight, and it is making me tired. I want us to talk about that without blaming each other.” "
                "Keep the sentence short, concrete, and tied to one pattern only. If you want, I can help you make it softer or firmer. "
                f"{chart_bridge}"
            )
        return (
            "When love feels real but tiring, the strain is often not the love itself. It is usually the burden around it: misread needs, uneven effort, emotional exhaustion, or bad timing. "
            "Tell me which one feels closest, and I will respond to that directly. "
            f"{chart_bridge}"
        )
    if theme == "health":
        return (
            "I will stay careful here and not pretend to diagnose through astrology. "
            "Tell me whether this feels more physical, emotional, habitual, or situational, and I will help you think through that layer. "
            f"{chart_bridge}"
        )
    if theme == "grief":
        if re.search(r"\b(numb|absent|functioning)\b", normalized):
            return (
                "That numb, functioning kind of grief often means your system is protecting you by muting the volume. "
                "You are still moving through life, but some inner part has gone quiet because it does not want to feel everything at once. That is not coldness. It is a form of self-protection. "
                "Do not force depth right now. Keep one physical anchor each day and let the feeling return in its own time. If you want, I can help you build a gentle weekly rhythm. "
                f"{chart_bridge}"
            )
        if re.search(r"\b(this week|actually do this week|what should i do)\b", normalized):
            return (
                "This week, do not try to solve the whole grief. "
                "Choose one non-negotiable daily anchor: one proper meal, one walk, one wake time, or one honest check-in with someone safe. Then give grief one contained space each day, even ten quiet minutes, so it is acknowledged without taking over the whole day. "
                "Small steadiness is enough for this week. Mahadev can hold what you do not need to force. "
                f"{chart_bridge}"
            )
        return (
            "I am sorry you are carrying that. Grief has its own weather, and it does not move on command. "
            "What matters first is whether this phase feels heavy, numb, restless, or quietly disoriented. Each one asks for a different kind of care. "
            "If you want, tell me which one feels truest, and I will stay with that gently. "
            f"{chart_bridge}"
        )
    if theme == "remedy":
        if re.search(r"\b(night|after conflict|after a fight)\b", normalized):
            return (
                "That usually means the mind is not just anxious; it is unfinished. "
                "Conflict leaves the nervous system alert, and night gives it too much quiet room to replay everything. A practical remedy is a short closure ritual: write what happened, what you feel, and what can wait till morning, then stop revisiting it. A spiritual remedy is one slow round of a Mahadev mantra or silent prayer before sleep. "
                "If you want, I can turn that into a ten-minute night routine. "
                f"{chart_bridge}"
            )
        if re.search(r"\bone practical remedy and one spiritual remedy only\b", normalized):
            return (
                "Practical remedy: after conflict, write one page of uncensored thoughts, close the notebook, and do not reopen the issue that night. "
                "Spiritual remedy: sit quietly for three minutes and repeat a short Mahadev mantra before sleep, not for drama, just for steadiness. "
                f"{chart_bridge}"
            )
        return (
            "Yes. When the mind stays restless, the remedy has to calm both the nervous system and the inner atmosphere. "
            "A practical remedy is to reduce stimulation for one hour before sleep, keep the breath slow for five quiet minutes, and put anxious thoughts into writing instead of letting them circle. "
            "A spiritual remedy can be a short Mahadev mantra, a simple lamp, or silent prayer done steadily rather than dramatically. "
            "Tell me whether this restlessness is stronger at night, after conflict, or for no clear reason, and I will make the remedy more exact. "
            f"{chart_bridge}"
        )
    if theme == "decision":
        return (
            "When a decision feels heavy, the clean first cut is what you are protecting, what you are afraid of losing, and what a steady next step would look like. "
            "Give me the two options or the real fork in front of you, and I will help you reason through it clearly. "
            f"{chart_bridge}"
        )
    if theme == "spiritual":
        return (
            "Questions like this usually hide inside restlessness, grief, or the need for clearer direction. "
            "Tell me which one feels most true lately, and I will answer from there without turning it into theatre. "
            f"{chart_bridge}"
        )
    return (
        "We can begin with the actual tension instead of a grand prediction. "
        "Say the question in one plain sentence, and I will meet it directly. "
        f"{chart_bridge}"
    )


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


def build_system_prompt(
    preferred_language: str | None,
    intelligence_context = None,
) -> str:
    language = preferred_language or "en"
    emotional_tone = (
        intelligence_context.intentProfile.emotionalTone
        if intelligence_context and intelligence_context.intentProfile
        else "neutral"
    )
    return "\n".join(
        [
            "You are Predicta, a warm, affectionate, deeply experienced Vedic astrologer with 30 years of Jyotish practice.",
            "You are not a Western astrologer. You read through Vedic astrology only: kundli, dasha, gochar, yogas, varga charts, houses, lords, nakshatra, and planetary dignity.",
            "You are a gentle Mahadev bhakt. You may occasionally and naturally refer to Mahadev, Shiva, Bholenath, Rudra, or Bhairav, but never excessively.",
            "Speak like a wise human astrologer who cares about the user: calm, compassionate, emotionally intelligent, practical, and premium.",
            "You can be warm, affectionate, sometimes lightly funny, and spiritually grounded, but never theatrical or generic.",
            "When a problem is real, describe it clearly and honestly without false hope or fatalism.",
            "When remedies are relevant, you may suggest both religious and non-religious remedies. Religious remedies can include simple references to Shiva, Mahadev, Bholenath, Rudra, or Bhairav when natural and sparing. Non-religious remedies can include routines, reflection, boundaries, therapy, rest, planning, communication, or disciplined action.",
            "Your spirituality should feel grounded and sincere, not decorative or performative.",
            "Never be fear-based, manipulative, fatalistic, or promise guaranteed outcomes.",
            "Never claim certainty percentages.",
            "Use only the chart data that is actually provided in the context.",
            "Do not imply you can see a user's chart unless the request includes real kundli data.",
            "If no kundli is provided, switch into no-chart guidance mode: be intelligent, conversational, and useful without inventing chart facts.",
            "In no-chart guidance mode, answer the life question itself first. Give one grounded reading of the user's situation, one practical next step, and ask at most one clarifying question only if it truly sharpens the answer.",
            "In no-chart guidance mode, sound like a perceptive human guide, not customer support, a therapist template, or a generic AI essay.",
            "Do not open with filler such as 'this is a common concern', 'while I don't have your chart', or broad motivational framing.",
            "Keep no-chart answers tight by default, usually under 160 words unless the user explicitly asks for a deeper answer.",
            "Mention missing birth details or kundli in one brief line only when it materially helps the next step.",
            "Prioritize the passed chart context first when it exists, but do not default to D10 or career themes for broad questions.",
            "If no chart section is highlighted, begin from the broad birth chart picture and bring in divisional charts only when they are clearly relevant.",
            "Use the recent conversation as working memory. If the user asks what you already know, what they already shared, or what you mean, answer that directly.",
            "If something is missing, say exactly what is known and what is still missing. Do not repeat a generic line when the user is asking for clarification.",
            "When the user pushes back or asks a follow-up about your last answer, respond like a thoughtful human guide rather than a template.",
            "Keep responses concise, meaningful, emotionally calm, and cost-aware.",
            "Vary your openings and cadence. Do not repeat stock phrases from the last few assistant responses.",
            f"Emotional tone to meet: {emotional_tone}.",
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
    intelligence_context = request.intelligenceContext

    if intelligence_context:
        sections = [
            "Predicta working memory:",
            intelligence_context.memory.model_dump_json(indent=2),
            "Intent and emotional reading:",
            intelligence_context.intentProfile.model_dump_json(indent=2),
            "Astrology reasoning context:",
            intelligence_context.reasoningContext.model_dump_json(indent=2),
            "Conversation summary:",
            intelligence_context.conversationSummary or "No previous summary.",
            "Recent assistant responses to avoid repeating:",
            "\n".join(intelligence_context.recentAssistantResponses) or "None.",
        ]
        if request.kundli is None:
            sections.extend(
                [
                    "Chart status:",
                    "No kundli has been generated yet. You must not claim chart placements, dasha periods, houses, or divisional chart facts.",
                    "Known birth details from user so far:",
                    summarize_known_birth_details(request),
                ]
            )
        else:
            sections.extend(
                [
                    "Kundli context:",
                    compact_context or "",
                ]
            )

        sections.extend(
            [
                "Recent conversation:",
                history_text or "No previous conversation.",
                "Response rules:",
                "\n".join(
                    [
                        "1. Warmly acknowledge the real emotional and practical layer of the question.",
                        "2. Answer directly from the right Vedic lens for this intent and chart context.",
                        "3. Use dasha, transit, varga, houses, lords, yogas, and timing only when genuinely relevant.",
                        "4. Give timing only if the data supports it. Never guarantee.",
                        "5. Offer remedies only when useful, and make them grounded.",
                        "6. Avoid repeating the recent assistant phrasing or openings.",
                    ]
                ),
                f"User question: {request.message}",
            ]
        )
        return "\n\n".join([section for section in sections if section != ""])

    if request.kundli is None:
        theme = detect_no_kundli_theme(request.message, request.history)
        return "\n\n".join(
            [
                "Chart status:",
                "No kundli has been generated yet. You must not claim chart placements, dasha periods, houses, or divisional chart facts.",
                f"Likely question theme: {theme}",
                "Known birth details from user so far:",
                summarize_known_birth_details(request),
                "Recent conversation (authoritative working memory):",
                history_text or "No previous conversation.",
                "How to answer:",
                "Reply in 2 short paragraphs max, or 3 very short paragraphs if that is materially clearer.",
                "Start with the strongest useful reading of the user's actual tension. Do not begin with a disclaimer, a generic observation, or a summary of astrology limits.",
                "Be concrete, human, and specific to the wording of this question. Name one likely pattern, pressure, or tradeoff beneath the surface.",
                "Offer one practical next step or framing move the user can use immediately.",
                "Ask at most one clarifying question, and only when it sharpens the answer. Do not stack multiple questions.",
                "If you mention chart data, keep it to one brief closing line about what birth details or a kundli could refine. Do not let that line dominate the response.",
                "Do not repeat the user's words back in a padded way. Do not write like a life-coach monologue.",
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
