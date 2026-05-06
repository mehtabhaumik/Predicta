from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, Iterable, List, Optional

import httpx

from .models import (
    BirthDetailsAmbiguity,
    BirthDetailsDraft,
    BirthDetailsExtractionResult,
    BirthDetailsExtractionRequest,
    ChartContext,
    KundliData,
    PridictaChatRequest,
    PridictaChatResponse,
)
from .jyotish_analysis import build_jyotish_analysis

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
GEMINI_GENERATE_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)
FREE_REASONING_MODEL = os.getenv("PRIDICTA_OPENAI_FREE_MODEL", "gpt-5.4-mini")
PREMIUM_DEEP_MODEL = os.getenv("PRIDICTA_OPENAI_PREMIUM_MODEL", "gpt-5.5")
GEMINI_FLASH_MODEL = os.getenv("PRIDICTA_GEMINI_FREE_MODEL", "gemini-2.5-flash")
GEMINI_PRO_MODEL = os.getenv("PRIDICTA_GEMINI_PREMIUM_MODEL", "gemini-2.5-pro")
FREE_MAX_OUTPUT_TOKENS = int(os.getenv("PRIDICTA_FREE_MAX_OUTPUT_TOKENS", "620"))
PREMIUM_MAX_OUTPUT_TOKENS = int(
    os.getenv("PRIDICTA_PREMIUM_MAX_OUTPUT_TOKENS", "1100")
)
GEMINI_FREE_THINKING_BUDGET = int(
    os.getenv("PRIDICTA_GEMINI_FREE_THINKING_BUDGET", "0")
)
GEMINI_PREMIUM_THINKING_BUDGET = int(
    os.getenv("PRIDICTA_GEMINI_PREMIUM_THINKING_BUDGET", "512")
)
REQUEST_TIMEOUT_SECONDS = float(os.getenv("PRIDICTA_AI_TIMEOUT_SECONDS", "45"))
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

DEEP_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"predict",
        r"future",
        r"next\s+\d+\s+(years?|months?)",
        r"career.*marriage|marriage.*career",
        r"dasha",
        r"pdf|report",
        r"remed",
        r"compare|cross[-\s]?check",
        r"timing|when\b|period",
        r"yoga|dosha",
    ]
]


class AIConfigurationError(RuntimeError):
    pass


class AIProviderError(RuntimeError):
    pass


def ask_pridicta(request: PridictaChatRequest) -> PridictaChatResponse:
    intent = "deep" if request.deepAnalysis else detect_intent(
        request.message, request.chartContext
    )
    model = select_openai_model(intent, request.userPlan)
    max_output_tokens = (
        PREMIUM_MAX_OUTPUT_TOKENS
        if intent == "deep" and request.userPlan == "PREMIUM"
        else FREE_MAX_OUTPUT_TOKENS
    )
    jyotish_analysis = build_jyotish_analysis(
        request.kundli, request.message, request.chartContext
    )
    context = build_ai_context(
        request.kundli,
        request.chartContext,
        jyotish_analysis,
        request.language,
    )
    prompt = build_user_prompt(
        context,
        request.history,
        request.message,
        primary_area=jyotish_analysis.primaryArea,
        language=request.language,
    )
    text, provider, actual_model = create_ai_text_response(
        model=model,
        system_prompt=build_pridicta_system_prompt(),
        user_prompt=prompt,
        max_output_tokens=max_output_tokens,
        reasoning_effort="medium" if intent == "deep" else "low",
    )

    if not text.strip():
        raise AIProviderError("OpenAI returned an empty reading.")

    return PridictaChatResponse(
        text=text.strip(),
        provider=provider,
        model=actual_model,
        intent=intent,
        usedDeepModel=actual_model in {PREMIUM_DEEP_MODEL, GEMINI_PRO_MODEL}
        and intent == "deep",
        jyotishAnalysis=jyotish_analysis,
    )


def extract_birth_details(
    request: BirthDetailsExtractionRequest,
) -> BirthDetailsExtractionResult:
    rules_result = extract_birth_details_with_rules(request.text)
    system_prompt = (
        "Extract Vedic astrology birth details as strict JSON. Do not guess. "
        "Return exactly these top-level keys: extracted, missingFields, "
        "ambiguities, confidence. Dates must be YYYY-MM-DD when clear. Times "
        "must be HH:mm in 24-hour format when clear. If a 12-hour time lacks "
        "AM/PM, include am_pm in missingFields and add an ambiguity."
    )
    try:
        text, _, _ = create_ai_text_response(
            model=FREE_REASONING_MODEL,
            system_prompt=system_prompt,
            user_prompt=request.text,
            max_output_tokens=500,
            reasoning_effort="low",
        )
        payload = parse_json_object(text)
        ai_result = BirthDetailsExtractionResult.model_validate(payload)
    except (AIConfigurationError, AIProviderError, ValueError, json.JSONDecodeError):
        return rules_result

    return merge_extraction_results(rules_result, ai_result)


def extract_birth_details_with_rules(text: str) -> BirthDetailsExtractionResult:
    extracted = BirthDetailsDraft()
    ambiguities: List[BirthDetailsAmbiguity] = []
    date = extract_date_with_rules(text)
    time = extract_time_with_rules(text)
    place = extract_place_with_rules(text)

    if date:
        extracted.date = date

    if time:
        extracted.time = time["time"]
        extracted.meridiem = time.get("meridiem")
        if time.get("needs_meridiem"):
            ambiguities.append(
                BirthDetailsAmbiguity(
                    field="time",
                    issue="The birth time needs AM or PM confirmation.",
                    options=[f"{time['original']} AM", f"{time['original']} PM"],
                )
            )

    if place:
        place_parts = [part.strip() for part in place.split(",") if part.strip()]
        extracted.placeText = place
        extracted.city = place_parts[0] if place_parts else place
        if len(place_parts) > 1:
            extracted.state = place_parts[1]
        if len(place_parts) > 2:
            extracted.country = place_parts[2]

    missing_fields: List[str] = []
    if not extracted.name:
        missing_fields.append("name")
    if not extracted.date:
        missing_fields.append("date")
    if not extracted.time:
        missing_fields.append("time")
    elif any(item.field == "time" for item in ambiguities):
        missing_fields.append("am_pm")
    if not extracted.placeText:
        missing_fields.append("birth_place")

    confidence = len(
        [value for value in [extracted.date, extracted.time, extracted.placeText] if value]
    ) / 3

    return BirthDetailsExtractionResult(
        extracted=extracted,
        missingFields=missing_fields,
        ambiguities=ambiguities,
        confidence=confidence,
    )


def extract_date_with_rules(text: str) -> Optional[str]:
    normalized = text.strip()
    iso = re.search(r"\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b", normalized)
    if iso:
        return format_date_parts(iso.group(1), iso.group(2), iso.group(3))

    numeric = re.search(
        r"\b(?:dob|date\s+of\s+birth|birth\s+date|born)?\s*:?\s*(\d{1,2})(?:st|nd|rd|th)?[-/.](\d{1,2})[-/.](\d{2,4})\b",
        normalized,
        re.I,
    )
    if numeric:
        first = int(numeric.group(1))
        second = int(numeric.group(2))
        year = normalize_year(numeric.group(3))
        if first > 12:
            return format_date_parts(year, numeric.group(2), numeric.group(1))
        if second > 12:
            return format_date_parts(year, numeric.group(1), numeric.group(2))
        return format_date_parts(year, numeric.group(2), numeric.group(1))

    day_month = re.search(
        r"\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+([A-Za-z]{3,9}),?\s+(\d{2,4})\b",
        normalized,
        re.I,
    )
    if day_month:
        month = MONTHS.get(day_month.group(2).lower())
        if month:
            return format_date_parts(normalize_year(day_month.group(3)), month, day_month.group(1))

    month_day = re.search(
        r"\b([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})\b",
        normalized,
        re.I,
    )
    if month_day:
        month = MONTHS.get(month_day.group(1).lower())
        if month:
            return format_date_parts(normalize_year(month_day.group(3)), month, month_day.group(2))

    compact = re.search(r"\b(\d{2})(\d{2})(\d{4})\b", normalized)
    if compact:
        first = int(compact.group(1))
        second = int(compact.group(2))
        if 1 <= first <= 31 and 1 <= second <= 12:
            return format_date_parts(compact.group(3), compact.group(2), compact.group(1))

    return None


def extract_time_with_rules(text: str) -> Optional[Dict[str, Any]]:
    match = re.search(
        r"\b(?:birth\s*time|time|born\s+at|at)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|morning|evening|night)?\b",
        text,
        re.I,
    )
    if not match or not re.search(r"\b(time|born\s+at|at|\d{1,2}:\d{2})\b", match.group(0), re.I):
        match = re.search(r"\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.|morning|evening|night)?\b", text, re.I)
    if not match:
        return None

    hour = int(match.group(1))
    minute = int(match.group(2) or "00")
    if hour > 23 or minute > 59:
        return None

    meridiem_text = (match.group(3) or "").lower().replace(".", "")
    meridiem = None
    if meridiem_text in {"am", "morning"}:
        meridiem = "AM"
    elif meridiem_text in {"pm", "evening", "night"}:
        meridiem = "PM"

    needs_meridiem = meridiem is None and hour <= 12
    if meridiem == "PM" and hour < 12:
        hour += 12
    if meridiem == "AM" and hour == 12:
        hour = 0

    return {
        "meridiem": meridiem,
        "needs_meridiem": needs_meridiem,
        "original": match.group(0).strip(),
        "time": f"{hour:02d}:{minute:02d}",
    }


def extract_place_with_rules(text: str) -> Optional[str]:
    match = re.search(
        r"\b(?:birth\s*place|birthplace|place|born\s+in|born\s+at|from)\s*(?:is|:)?\s+([A-Za-z][A-Za-z\s.,'-]{1,100})(?:\n|$)",
        text,
        re.I,
    )
    return re.sub(r"[.\s]+$", "", match.group(1)).strip() if match else None


def merge_extraction_results(
    rules_result: BirthDetailsExtractionResult,
    ai_result: BirthDetailsExtractionResult,
) -> BirthDetailsExtractionResult:
    extracted = rules_result.extracted.model_copy()
    for field, value in ai_result.extracted.model_dump().items():
        if value is not None:
            setattr(extracted, field, value)

    missing = set(ai_result.missingFields or rules_result.missingFields)
    if extracted.name:
        missing.discard("name")
    if extracted.date:
        missing.discard("date")
    if extracted.time:
        missing.discard("time")
    if extracted.placeText or extracted.city:
        missing.discard("birth_place")

    return BirthDetailsExtractionResult(
        extracted=extracted,
        missingFields=sorted(missing),
        ambiguities=[*rules_result.ambiguities, *ai_result.ambiguities],
        confidence=max(rules_result.confidence, ai_result.confidence),
    )


def format_date_parts(year: str, month: str, day: str) -> str:
    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"


def normalize_year(year: str) -> str:
    if len(year) == 4:
        return year
    numeric = int(year)
    return f"19{year}" if numeric > 30 else f"20{year}"


def detect_intent(user_question: str, chart_context: Optional[ChartContext]) -> str:
    normalized = user_question.strip()
    word_count = len([part for part in re.split(r"\s+", normalized) if part])

    if any(pattern.search(normalized) for pattern in DEEP_PATTERNS):
        return "deep"

    if chart_context and chart_context.selectedSection:
        if "report" in chart_context.selectedSection.lower():
            return "deep"

    if word_count <= 8 and not (chart_context and chart_context.chartType):
        return "simple"

    return "moderate"


def select_openai_model(intent: str, user_plan: str) -> str:
    if intent == "deep" and user_plan == "PREMIUM":
        return PREMIUM_DEEP_MODEL

    return FREE_REASONING_MODEL


def select_gemini_model(intent: str, user_plan: str) -> str:
    if intent == "deep" and user_plan == "PREMIUM":
        return GEMINI_PRO_MODEL

    return GEMINI_FLASH_MODEL


def build_pridicta_system_prompt() -> str:
    return "\n".join(
        [
            "You are Predicta, a warm, human, premium Vedic astrology guide. The API may use the legacy internal name Pridicta, but users should experience Predicta.",
            "You are spiritually rooted like a humble Mahadev devotee: grounded, compassionate, truthful, protective, and never fear-based.",
            "Do not say 'Har Har Mahadev' every time. Like a real Indian devotee, vary naturally: sometimes no religious phrase, sometimes Namaste, Pranam, Ram Ram, Om Namah Shivaya, Jai Bholenath, Jai Bhairav Baba, Jai Maa Durga, Jai Ganesh, Jai Shree Ram, or another gentle dharmic expression when it fits.",
            "Talk like a wise friend sitting with the user, not a report generator. Begin with a brief acknowledgement of the user's feeling or question before giving the answer.",
            "Use tiny human micro-statements when helpful: 'I hear you', 'let us look gently', 'one thing stands out', 'this is not a judgment', 'we will keep it practical'.",
            "Act like a careful Jyotish practitioner: synthesize chart evidence, timing, and practical guidance.",
            "Use only the kundli context supplied. Do not invent unsupported divisional chart data.",
            "Treat jyotishAnalysis as the deterministic evidence layer. Use it as the backbone of the answer.",
            "Prioritize the user's active chart, house, planet, or report section before broadening.",
            "For every chart-based answer, include a 'Chart evidence' section with 3-5 bullets from jyotishAnalysis.evidence.",
            "Each evidence bullet must mention the chart factor and the meaning; do not cite vague intuition.",
            "Separate chart indication, timing, and practical advice using the formattingContract when the question needs depth.",
            "Explain Sanskrit or technical concepts in plain language.",
            "Avoid fear, fatalism, manipulation, medical/legal/financial certainty, and guaranteed outcomes.",
            "If evidence is mixed, say so and explain the tension instead of forcing a confident answer.",
            "Keep remedies simple, non-exploitative, and tied to the chart factors you mention.",
            "Never answer with generic motivation when deterministic evidence is available.",
            "Honor the requested language: en for English, hi for natural Hindi in Devanagari, gu for natural Gujarati in Gujarati script.",
            "Keep Sanskrit/Jyotish terms only when they add precision, and immediately explain them in simple language.",
            "Every recommendation must include evidence, a confidence/uncertainty note, or explicitly say evidence is weak.",
            "For medical, legal, financial, safety, abuse, or self-harm topics: do not diagnose, prescribe, predict certainty, or replace a qualified professional.",
            "Do not make fatalistic claims about death, divorce, illness, bankruptcy, or guaranteed outcomes.",
            "Use an audit-friendly but friendly structure: warm acknowledgement, direct answer, confidence, chart evidence, limitations, and practical next step.",
            "Do not sound abrupt, robotic, transactional, or overly concise. Still stay focused and avoid long sermons.",
        ]
    )


def build_user_prompt(
    context: Dict[str, Any],
    history: Iterable[Any],
    message: str,
    primary_area: str,
    language: str,
) -> str:
    recent_turns = list(history)[-8:]
    conversation = "\n".join(
        f"{'User' if turn.role == 'user' else 'Pridicta'}: {turn.text[:900]}"
        for turn in recent_turns
    )
    return "\n\n".join(
        [
            "Kundli context:",
            json.dumps(context, ensure_ascii=False, indent=2),
            f"Primary reading area: {primary_area}",
            f"Response language: {language}",
            f"Language instruction: {language_instruction(language)}",
            f"High-stakes safety topic: {'yes' if is_high_stakes_message(message) else 'no'}",
            "Safety boundary: do not provide medical/legal/financial certainty; advise qualified professional support for high-stakes action.",
            "Recent conversation:",
            conversation or "No prior conversation.",
            f"User question: {message}",
            "Answer as a chart-aware Vedic astrologer using the deterministic evidence first. Follow the formattingContract in jyotishAnalysis.",
        ]
    )


def build_ai_context(
    kundli: KundliData,
    chart_context: Optional[ChartContext],
    jyotish_analysis: Any,
    language: str,
) -> Dict[str, Any]:
    selected_chart = None
    selected_house_focus = None
    selected_planet_focus = None
    selected_timeline_event = None
    selected_decision = None
    selected_remedy = None
    birth_time_detective = None
    selected_relationship_mirror = None
    selected_family_karma_map = None
    selected_predicta_wrapped = None

    if chart_context and chart_context.chartType:
        selected_chart_data = kundli.charts.get(chart_context.chartType)
        if selected_chart_data:
            selected_chart = compact_chart(selected_chart_data.model_dump())
            if chart_context.selectedHouse:
                selected_house_focus = build_house_focus(
                    selected_chart_data.model_dump(), chart_context.selectedHouse
                )

    if chart_context and chart_context.selectedPlanet:
        selected_planet_focus = build_planet_focus(
            kundli.model_dump(), chart_context.selectedPlanet
        )

    if chart_context and chart_context.selectedTimelineEventId:
        selected_timeline_event = next(
            (
                item.model_dump()
                for item in kundli.lifeTimeline
                if item.id == chart_context.selectedTimelineEventId
            ),
            None,
        )

    if chart_context and chart_context.selectedDecisionQuestion:
        selected_decision = {
            "question": chart_context.selectedDecisionQuestion,
            "area": chart_context.selectedDecisionArea,
            "state": chart_context.selectedDecisionState,
        }

    if chart_context and chart_context.selectedRemedyId:
        selected_remedy = next(
            (
                item.model_dump()
                for item in kundli.remedies
                if item.id == chart_context.selectedRemedyId
            ),
            None,
        )

    if chart_context and chart_context.selectedBirthTimeDetective:
        birth_time_detective = {
            "rectification": kundli.rectification.model_dump()
            if kundli.rectification
            else None,
            "isTimeApproximate": kundli.birthDetails.isTimeApproximate,
            "safeSummary": "Use D1 and broad dasha themes more confidently than fine divisional timing.",
        }

    if chart_context and chart_context.selectedRelationshipMirror:
        selected_relationship_mirror = {
            "names": chart_context.selectedRelationshipNames,
            "safeSummary": "Relationship Mirror should explain patterns and advice without deterministic relationship claims.",
        }

    if chart_context and chart_context.selectedFamilyKarmaMap:
        selected_family_karma_map = {
            "memberCount": chart_context.selectedFamilyMemberCount,
            "safeSummary": "Family Karma Map should explain repeated family patterns, support zones, and practical relationship guidance without blame language.",
            "privacyRule": "Do not assign fear labels or make one family member responsible for another person's life.",
        }

    if chart_context and chart_context.selectedPredictaWrapped:
        selected_predicta_wrapped = {
            "year": chart_context.selectedPredictaWrappedYear,
            "safeSummary": "Predicta Wrapped should explain year theme, hard lesson, growth area, best window, caution window, and next-year preview.",
            "privacyRule": "Do not include exact birth time, birth place, or private saved question text unless the user explicitly writes it in the chat.",
        }

    return {
        "activeContext": chart_context.model_dump() if chart_context else None,
        "requestedLanguage": language,
        "birthSummary": {
            "name": kundli.birthDetails.name,
            "date": kundli.birthDetails.date,
            "time": kundli.birthDetails.time,
            "place": kundli.birthDetails.place,
            "timezone": kundli.birthDetails.timezone,
            "isTimeApproximate": kundli.birthDetails.isTimeApproximate,
        },
        "birthTimeDetective": birth_time_detective,
        "calculationMeta": {
            "ayanamsa": kundli.calculationMeta.ayanamsa,
            "houseSystem": kundli.calculationMeta.houseSystem,
            "nodeType": kundli.calculationMeta.nodeType,
            "zodiac": kundli.calculationMeta.zodiac,
            "utcDateTime": kundli.calculationMeta.utcDateTime,
        },
        "coreIdentity": {
            "lagna": kundli.lagna,
            "moonSign": kundli.moonSign,
            "nakshatra": kundli.nakshatra,
        },
        "planets": [planet.model_dump() for planet in kundli.planets],
        "houses": [house.model_dump() for house in kundli.houses],
        "currentDasha": kundli.dasha.current.model_dump(),
        "dashaTimeline": [
            item.model_dump() for item in kundli.dasha.timeline[:4]
        ],
        "ashtakavarga": kundli.ashtakavarga.model_dump(),
        "yogas": [yoga.model_dump() for yoga in kundli.yogas],
        "selectedChart": selected_chart,
        "selectedHouseFocus": selected_house_focus,
        "selectedPlanetFocus": selected_planet_focus,
        "selectedTimelineEvent": selected_timeline_event,
        "selectedDecision": selected_decision,
        "selectedRemedy": selected_remedy,
        "selectedFamilyKarmaMap": selected_family_karma_map,
        "selectedPredictaWrapped": selected_predicta_wrapped,
        "selectedRelationshipMirror": selected_relationship_mirror,
        "coreCharts": {
            chart_type: compact_chart(chart.model_dump())
            for chart_type, chart in kundli.charts.items()
            if chart_type in {"D1", "D2", "D7", "D9", "D10", "D12"}
        },
        "chartAvailability": {
            "supported": [
                chart_type
                for chart_type, chart in kundli.charts.items()
                if chart.supported
            ],
            "unsupported": [
                chart_type
                for chart_type, chart in kundli.charts.items()
                if not chart.supported
            ],
        },
        "lifeTimeline": [item.model_dump() for item in kundli.lifeTimeline],
        "transits": [item.model_dump() for item in kundli.transits],
        "rectification": kundli.rectification.model_dump()
        if kundli.rectification
        else None,
        "remedies": [item.model_dump() for item in kundli.remedies],
        "jyotishAnalysis": jyotish_analysis.model_dump(),
    }


def language_instruction(language: str) -> str:
    if language == "hi":
        return (
            "Answer in culturally natural Hindi using Devanagari. "
            "Explain terms like Lagna, dasha, gochar, and nakshatra in simple Hindi."
        )
    if language == "gu":
        return (
            "Answer in culturally natural Gujarati using Gujarati script. "
            "Explain terms like Lagna, dasha, gochar, and nakshatra in simple Gujarati."
        )
    return (
        "Answer in clear English. Explain terms like Lagna, dasha, transit, "
        "and nakshatra in plain language."
    )


def is_high_stakes_message(message: str) -> bool:
    return bool(
        re.search(
            r"\b(health|medical|medicine|doctor|surgery|pregnancy|disease|legal|court|lawsuit|contract|police|tax|finance|financial|investment|stock|crypto|loan|debt|insurance|self-harm|suicide|violence|abuse|emergency)\b",
            message,
            re.IGNORECASE,
        )
    )


def compact_chart(chart: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "chartType": chart["chartType"],
        "name": chart["name"],
        "supported": chart["supported"],
        "unsupportedReason": chart.get("unsupportedReason"),
        "ascendantSign": chart["ascendantSign"],
        "housePlacements": chart["housePlacements"],
        "signPlacements": chart["signPlacements"],
        "planetDistribution": chart.get("planetDistribution", []),
    }


def build_house_focus(chart: Dict[str, Any], house: int) -> Dict[str, Any]:
    return {
        "chartType": chart["chartType"],
        "house": house,
        "planets": chart.get("housePlacements", {}).get(house, []),
        "ascendantSign": chart["ascendantSign"],
    }


def build_planet_focus(kundli: Dict[str, Any], planet_name: str) -> Dict[str, Any]:
    focus: Dict[str, Any] = {
        "planet": planet_name,
        "d1": next(
            (
                planet
                for planet in kundli["planets"]
                if planet["name"].lower() == planet_name.lower()
            ),
            None,
        ),
        "vargaPlacements": {},
    }

    for chart_type in ["D1", "D2", "D7", "D9", "D10", "D12"]:
        chart = kundli["charts"].get(chart_type)
        if not chart or not chart.get("supported"):
            continue
        focus["vargaPlacements"][chart_type] = next(
            (
                planet
                for planet in chart.get("planetDistribution", [])
                if planet["name"].lower() == planet_name.lower()
            ),
            None,
        )

    return focus


def create_openai_text_response(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int,
    reasoning_effort: str,
) -> str:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("PREDICTA_OPENAI_API_KEY")

    if not api_key:
        raise AIConfigurationError("OPENAI_API_KEY is not configured.")

    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_output_tokens": max_output_tokens,
        "reasoning": {"effort": reasoning_effort},
    }

    try:
        response = httpx.post(
            OPENAI_RESPONSES_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as exc:
        raise AIProviderError("Could not reach OpenAI.") from exc

    if response.status_code >= 400:
        raise AIProviderError(f"OpenAI request failed with {response.status_code}.")

    return extract_output_text(response.json())


def create_ai_text_response(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int,
    reasoning_effort: str,
) -> tuple[str, str, str]:
    openai_error: Optional[Exception] = None

    try:
        return (
            create_openai_text_response(
                model=model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                max_output_tokens=max_output_tokens,
                reasoning_effort=reasoning_effort,
            ),
            "openai",
            model,
        )
    except (AIConfigurationError, AIProviderError) as exc:
        openai_error = exc

    gemini_model = select_gemini_model(
        "deep" if model == PREMIUM_DEEP_MODEL else "moderate",
        "PREMIUM" if model == PREMIUM_DEEP_MODEL else "FREE",
    )
    try:
        return (
            create_gemini_text_response(
                model=gemini_model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                max_output_tokens=max_output_tokens,
            ),
            "gemini",
            gemini_model,
        )
    except AIConfigurationError as exc:
        if isinstance(openai_error, AIConfigurationError):
            raise AIConfigurationError(
                "No AI provider is configured. Set OPENAI_API_KEY or GEMINI_API_KEY."
            ) from exc
        raise


def create_gemini_text_response(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int,
) -> str:
    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_GEMINI_API_KEY")
        or os.getenv("PREDICTA_GEMINI_API_KEY")
    )

    if not api_key:
        raise AIConfigurationError("GEMINI_API_KEY is not configured.")

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "maxOutputTokens": max_output_tokens + gemini_thinking_budget(model),
            "thinkingConfig": {
                "thinkingBudget": gemini_thinking_budget(model),
            },
            "temperature": 0.45,
        },
    }

    try:
        response = httpx.post(
            GEMINI_GENERATE_URL.format(model=model),
            params={"key": api_key},
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as exc:
        raise AIProviderError("Could not reach Gemini.") from exc

    if response.status_code >= 400:
        raise AIProviderError(f"Gemini request failed with {response.status_code}.")

    return extract_gemini_output_text(response.json())


def gemini_thinking_budget(model: str) -> int:
    if "pro" in model.lower():
        return GEMINI_PREMIUM_THINKING_BUDGET

    return GEMINI_FREE_THINKING_BUDGET


def extract_output_text(response: Dict[str, Any]) -> str:
    if response.get("output_text"):
        return str(response["output_text"])

    chunks: List[str] = []
    for item in response.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")
            if text:
                chunks.append(str(text))

    return "\n".join(chunks).strip()


def extract_gemini_output_text(response: Dict[str, Any]) -> str:
    chunks: List[str] = []
    for candidate in response.get("candidates", []):
        content = candidate.get("content", {})
        for part in content.get("parts", []):
            text = part.get("text")
            if text:
                chunks.append(str(text))

    return "\n".join(chunks).strip()


def parse_json_object(text: str) -> Dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, re.S)
        if not match:
            raise AIProviderError("OpenAI did not return JSON.")
        return json.loads(match.group(0))
