from __future__ import annotations

import json
import os
import re
from datetime import date
from typing import Any, Dict, Iterable, List, Optional

import httpx

from .models import (
    BirthDetailsAmbiguity,
    BirthDetailsDraft,
    BirthDetailsExtractionResult,
    BirthDetailsExtractionRequest,
    ChartContext,
    JyotishAnalysis,
    KundliData,
    PridictaChatRequest,
    PridictaChatResponse,
)
from .jyotish_analysis import build_jyotish_analysis
from .safety_audit import maybe_record_ai_safety_audit
from .safety import (
    assess_chat_safety,
    blocked_safety_reply,
    enforce_high_stakes_boundary,
    merge_moderation_result,
    moderate_text_with_openai,
    output_safety_rewrite_note,
    privacy_preserving_safety_identifier,
    safety_response_categories,
    safety_protocol_prompt_line,
    unsafe_output_categories,
)

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
PREDICTA_CHAT_PROMPT_VERSION = os.getenv(
    "PREDICTA_CHAT_PROMPT_VERSION",
    "predicta-chat-system-v1",
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

SIGN_ORDER = [
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
]

NAKSHATRA_ORDER = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
]

WEEKDAY_LORDS = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]
WEEKDAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

DAY_LORD_FOCUS = {
    "Jupiter": "learning, guidance, dharma, children, and wise planning",
    "Mars": "courage, exercise, direct action, property, and clean boundaries",
    "Mercury": "study, writing, business, messages, and careful decisions",
    "Moon": "emotional steadiness, home rhythm, food, rest, and family care",
    "Saturn": "discipline, duty, patience, service, and finishing pending work",
    "Sun": "confidence, authority, father figures, leadership, and visibility",
    "Venus": "relationships, art, comfort, money habits, and graceful repair",
}

DAY_LORD_REMEDY = {
    "Jupiter": "Respect a teacher or elder, share useful knowledge, and keep one promise made for learning.",
    "Mars": "Move the body, speak directly without anger, and protect someone without dominating them.",
    "Mercury": "Clean up one message, document, or money detail before making a new commitment.",
    "Moon": "Hydrate well, keep food simple, and give care to mother, home, or someone emotionally unsettled.",
    "Saturn": "Do one difficult task on time and serve an elderly, struggling, or ignored person with humility.",
    "Sun": "Take morning light if possible, act honestly with authority, and avoid ego-driven speech.",
    "Venus": "Keep the environment clean, repair one relationship tone, and avoid indulgence that creates regret.",
}

DASHA_PLANET_THEMES = {
    "Jupiter": "wisdom, protection, teachers, children, growth, and long-term grace",
    "Ketu": "detachment, spiritual correction, past-life residue, and simplification",
    "Mars": "courage, conflict handling, property, discipline, and decisive action",
    "Mercury": "skills, speech, business, learning, analysis, and nervous-system pace",
    "Moon": "emotions, home, mother, mind, public support, and daily stability",
    "Rahu": "ambition, foreign influence, technology, unusual growth, and strong desires",
    "Saturn": "karma, duty, delay, endurance, structure, and mature responsibility",
    "Sun": "authority, father figures, visibility, confidence, and leadership",
    "Venus": "relationships, comfort, money habits, art, vehicles, and desire",
}

PLANET_KARMA_REMEDY_MAP = {
    "Sun": {
        "karmicLesson": "ego, father, authority, confidence, and righteous action",
        "higherExpression": "dignified leadership, courage, clarity, and dharma",
        "shadowPattern": "arrogance, pride, control, weak self-respect, or authority conflict",
        "simpleRemedy": "Respect father or mentor figures where safe, practice truthful leadership, and complete one visible duty before expecting praise.",
        "practicalAction": "Start the day with one honest responsibility completed.",
        "mantraDevotion": "Surya prayer, Aditya Hridayam, or morning gratitude.",
    },
    "Moon": {
        "karmicLesson": "emotions, mother, care, nourishment, and mental peace",
        "higherExpression": "nourishment, sensitivity, peace, and emotional intelligence",
        "shadowPattern": "mood swings, dependency, insecurity, or emotional confusion",
        "simpleRemedy": "Care for mother or caregivers where healthy, donate food or water support, and protect sleep.",
        "practicalAction": "Name one feeling plainly before making a sensitive decision.",
        "mantraDevotion": "Chandra mantra, Shiva prayer, or gratitude to the mother principle.",
    },
    "Mars": {
        "karmicLesson": "anger, courage, siblings, land, competition, and physical drive",
        "higherExpression": "courage, protection, stamina, and clean action",
        "shadowPattern": "anger, impatience, conflict, accidents, or forceful decisions",
        "simpleRemedy": "Use strength to protect, not dominate; turn anger into disciplined action.",
        "practicalAction": "Do one physical task fully before arguing or forcing an outcome.",
        "mantraDevotion": "Hanuman Chalisa, Mangal mantra, or prayer for courage with restraint.",
    },
    "Mercury": {
        "karmicLesson": "speech, learning, business, calculation, friendship, and nervous habits",
        "higherExpression": "intelligence, skill, humor, trade, and adaptable speech",
        "shadowPattern": "lying, overthinking, nervousness, scattered effort, or clever avoidance",
        "simpleRemedy": "Speak clearly, help students, donate learning tools, and avoid manipulation.",
        "practicalAction": "Correct one confusion in writing before it becomes a problem.",
        "mantraDevotion": "Budh mantra, Ganesha prayer, or a learning-focused practice.",
    },
    "Jupiter": {
        "karmicLesson": "guru, dharma, children, counsel, ethics, and blessings",
        "higherExpression": "wisdom, faith, children, teachers, generosity, and good judgment",
        "shadowPattern": "false confidence, poor judgment, disrespect for guidance, or moral laziness",
        "simpleRemedy": "Respect teachers and elders, support education or children, and practice generosity without superiority.",
        "practicalAction": "Study or teach one useful truth, then apply it in one action.",
        "mantraDevotion": "Guru mantra, Vishnu prayer, or gratitude to a teacher.",
    },
    "Venus": {
        "karmicLesson": "love, marriage, pleasure, attraction, luxury, art, and compromise",
        "higherExpression": "love, harmony, beauty, devotion, comfort, art, and diplomacy",
        "shadowPattern": "overindulgence, relationship imbalance, vanity, lust, or comfort addiction",
        "simpleRemedy": "Respect spouse, partners, and women; keep pleasure clean, balanced, and non-exploitative.",
        "practicalAction": "Make one relationship or living space cleaner and kinder.",
        "mantraDevotion": "Shukra mantra, Lakshmi prayer, or devotional gratitude through beauty.",
    },
    "Saturn": {
        "karmicLesson": "hard work, delay, humility, workers, old age, poverty, and responsibility",
        "higherExpression": "discipline, humility, patience, endurance, justice, and mature service",
        "shadowPattern": "fear, delay, laziness, harshness, resentment, loneliness, or class arrogance",
        "simpleRemedy": "Serve elderly, poor, disabled, ignored, or working-class people respectfully; be punctual and do honest work.",
        "practicalAction": "Finish one delayed responsibility before asking for easier results.",
        "mantraDevotion": "Shani mantra, Hanuman prayer, Shiva prayer, or silent service.",
    },
    "Rahu": {
        "karmicLesson": "desire, obsession, foreignness, confusion, ambition, and unconventional paths",
        "higherExpression": "innovation, worldly strategy, foreign links, research, and fearless adaptation",
        "shadowPattern": "obsession, illusion, shortcuts, addiction, scandal, or restless ambition",
        "simpleRemedy": "Declutter life, reduce addictive loops, serve outsiders respectfully, and truth-check decisions.",
        "practicalAction": "Before a desire-driven move, write the risk, proof, and motive clearly.",
        "mantraDevotion": "Rahu mantra, Durga or Bhairav prayer, or grounding protection practice.",
    },
    "Ketu": {
        "karmicLesson": "detachment, moksha, isolation, past-life residue, animals, and surrender",
        "higherExpression": "detachment, intuition, moksha, surrender, subtle perception, and release",
        "shadowPattern": "confusion, isolation, sudden disinterest, escapism, or spiritual ego",
        "simpleRemedy": "Feed or help dogs ethically where safe, practice humility, and release control over outcomes.",
        "practicalAction": "Do one good action without announcing it or expecting visible return.",
        "mantraDevotion": "Ketu mantra, Ganesha prayer, Shiva prayer, or quiet surrender practice.",
    },
}

DASHA_HOUSE_MEANINGS = {
    1: "identity, health, confidence, and personal direction",
    2: "money, speech, family values, and savings",
    3: "effort, courage, siblings, writing, and self-made growth",
    4: "home, property, mother, emotional peace, and education foundations",
    5: "children, creativity, intelligence, romance, and merit",
    6: "work pressure, debts, disease, service, competition, and discipline",
    7: "marriage, partnerships, contracts, clients, and public dealings",
    8: "sudden changes, research, inheritance, secrets, and transformation",
    9: "fortune, dharma, father, teachers, travel, and blessings",
    10: "career, status, authority, karma, and public responsibility",
    11: "income, gains, networks, elder siblings, and fulfillment of desires",
    12: "expenses, sleep, foreign lands, isolation, losses, and spiritual release",
}

SADE_SATI_PHASES = {
    12: {
        "label": "First phase",
        "summary": "Saturn is 12th from Moon, so Sade Sati has begun with release, expenses, sleep discipline, and inner cleanup.",
    },
    1: {
        "label": "Peak phase",
        "summary": "Saturn is over the Moon sign, so this is the central Sade Sati phase for emotional maturity and responsibility.",
    },
    2: {
        "label": "Final phase",
        "summary": "Saturn is 2nd from Moon, so Sade Sati is closing through family duties, speech, savings, and values.",
    },
}

GOCHAR_PLANET_MEANINGS = {
    "Jupiter": "growth, wisdom, mentors, children, faith, and long-term support",
    "Ketu": "detachment, simplification, spiritual correction, and release",
    "Mars": "energy, courage, conflict handling, property, and decisive action",
    "Mercury": "speech, business, study, analysis, writing, and nervous-system pace",
    "Moon": "mind, emotions, home rhythm, public response, and daily stability",
    "Rahu": "ambition, foreign influence, technology, disruption, and unusual growth",
    "Saturn": "discipline, responsibility, delay, endurance, karma, and structure",
    "Sun": "authority, confidence, father figures, visibility, and leadership",
    "Venus": "relationships, comfort, money habits, art, vehicles, and desire",
}

SIGN_ORDER = [
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
]

DEEP_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"predict",
        r"future",
        r"next\s+\d+\s+(years?|months?)",
        r"career.*marriage|marriage.*career",
        r"dasha",
        r"sade\s*sati|sadesati|saturn|shani",
        r"gochar|transit|planetary\s*weather",
        r"yearly\s*horoscope|annual\s*horoscope|varsha\s*phal|varshaphal|solar\s*return|muntha|tajika|this\s*year|next\s*year",
        r"advanced\s*jyotish|advanced\s*mode|ashtakavarga|nakshatra|birth\s*star|yoga|dosha|manglik|kaal\s*sarp|kemadruma|panchang|muhurta|prashna|horary|lal\s*kitab",
        r"chalit|bhav|kp|krishnamurti|paddhati|sub\s*lord|sublord|significator|nadi|naadi",
        r"pdf|report",
        r"remed",
        r"compare|cross[-\s]?check",
        r"timing|when\b|period",
        r"yoga|dosha",
    ]
]
FREE_BASE_CONTEXT_CHARTS = {"D1"}
PREMIUM_CONTEXT_CHARTS = {"D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12"}


class AIConfigurationError(RuntimeError):
    pass


class AIProviderError(RuntimeError):
    pass


def ask_pridicta(request: PridictaChatRequest) -> PridictaChatResponse:
    safety = assess_chat_safety(request.message)
    try:
        safety = merge_moderation_result(
            safety,
            moderate_text_with_openai(request.message),
        )
    except Exception:
        safety = merge_moderation_result(safety, None, moderation_error=True)

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
        request.kundli, request.message, request.chartContext, request.userPlan
    )
    context = build_ai_context(
        request.kundli,
        request.chartContext,
        jyotish_analysis,
        request.language,
        request.userPlan,
    )
    prompt = build_user_prompt(
        context,
        request.history,
        request.message,
        primary_area=jyotish_analysis.primaryArea,
        language=request.language,
        safety_line=safety_protocol_prompt_line(safety),
    )
    safety_identifier = privacy_preserving_safety_identifier(
        request.safetyIdentifier,
        [
            request.kundli.id,
            request.kundli.birthDetails.name,
            request.kundli.birthDetails.date,
        ],
    )

    if safety.blocked:
        blocked_categories = safety_response_categories(safety)
        maybe_record_ai_safety_audit(
            categories=blocked_categories,
            input_hash_parts=[
                request.kundli.id,
                request.kundli.birthDetails.name,
                request.kundli.birthDetails.date,
            ],
            model="predicta-safety-protocol-v1",
            provider="deterministic",
            route="/ask-pridicta",
            safety_identifier=safety_identifier,
        )
        return PridictaChatResponse(
            text=blocked_safety_reply(request.language, safety),
            provider="deterministic",
            model="predicta-safety-protocol-v1",
            intent=intent,
            usedDeepModel=False,
            jyotishAnalysis=jyotish_analysis,
            safetyCategories=blocked_categories,
            safetyBlocked=True,
        )

    try:
        text, provider, actual_model = create_ai_text_response(
            model=model,
            system_prompt=build_pridicta_system_prompt(),
            user_prompt=prompt,
            max_output_tokens=max_output_tokens,
            reasoning_effort="medium" if intent == "deep" else "low",
            safety_identifier=safety_identifier,
        )
    except (AIConfigurationError, AIProviderError):
        text = build_deterministic_chart_reply(request, jyotish_analysis)
        provider = "deterministic"
        actual_model = "jyotish-deterministic-v1"

    if not text.strip():
        raise AIProviderError("OpenAI returned an empty reading.")

    output_safety_categories = unsafe_output_categories(text)
    if output_safety_categories:
        text = "\n\n".join(
            [
                build_deterministic_chart_reply(request, jyotish_analysis),
                output_safety_rewrite_note(
                    request.language,
                    output_safety_categories,
                ),
            ]
        )

    text = enforce_high_stakes_boundary(text, request.language, safety)

    low_confidence_categories = (
        ["low-confidence"]
        if any(
            area.confidence == "low" for area in jyotish_analysis.areaAnalyses[:1]
        )
        else []
    )
    response_categories = list(
        dict.fromkeys(
            [
                *safety_response_categories(safety),
                *output_safety_categories,
                *low_confidence_categories,
            ]
        )
    )
    maybe_record_ai_safety_audit(
        categories=response_categories,
        input_hash_parts=[
            request.kundli.id,
            request.kundli.birthDetails.name,
            request.kundli.birthDetails.date,
        ],
        model=actual_model,
        provider=provider,
        route="/ask-pridicta",
        safety_identifier=safety_identifier,
    )

    return PridictaChatResponse(
        text=text.strip(),
        provider=provider,
        model=actual_model,
        intent=intent,
        usedDeepModel=actual_model in {PREMIUM_DEEP_MODEL, GEMINI_PRO_MODEL}
        and intent == "deep",
        jyotishAnalysis=jyotish_analysis,
        safetyCategories=response_categories,
        safetyBlocked=False,
    )


def build_deterministic_chart_reply(
    request: PridictaChatRequest,
    analysis: JyotishAnalysis,
) -> str:
    school = (
        request.chartContext.predictaSchool.upper()
        if request.chartContext and request.chartContext.predictaSchool
        else ""
    )
    if school == "KP":
        return build_deterministic_kp_reply(request)
    if school == "NADI":
        return build_deterministic_nadi_reply(request)

    current_date = date.today()
    one_year_later = add_one_year(current_date)
    area = analysis.areaAnalyses[0] if analysis.areaAnalyses else None
    evidence = analysis.evidence[:4]
    timing_needed = bool(re.search(r"\b(next|year|future|when|timing|after)\b", request.message, re.I))
    safety_needed = is_high_stakes_message(request.message)

    if request.language == "hi":
        intro = "Haan, main isse chart proof ke saath practical rakhungi."
        direct = localized_area_summary(area.area if area else "general", area.confidence if area else "medium", "hi")
        confidence = f"Confidence: {area.confidence if area else 'medium'}."
        timing = (
            f"Timing: next 1 year ka window {current_date.isoformat()} se {one_year_later.isoformat()} tak maana hai."
            if timing_needed
            else "Timing: exact month ke liye dasha aur transit overlap ko aur narrow karna padega."
        )
        safety = (
            "Safety: medical, legal, financial, ya emergency decision ke liye qualified professional ki salah zaroor lein."
            if safety_needed
            else ""
        )
        practical = area.practicalFocus[0] if area and area.practicalFocus else "Ek practical step chuniye aur us par steady action rakhiye."
        return "\n\n".join(
            [
                intro,
                direct,
                confidence,
                "Chart evidence:\n"
                + "\n".join(
                    f"- {item.title}: {item.interpretation}" for item in evidence
                ),
                timing,
                safety,
                f"Next step: {practical}",
            ]
        ).strip()

    if request.language == "gu":
        intro = "Haan, hu aa answer chart proof sathe practical rakhish."
        direct = localized_area_summary(area.area if area else "general", area.confidence if area else "medium", "gu")
        confidence = f"Confidence: {area.confidence if area else 'medium'}."
        timing = (
            f"Timing: next 1 year no window {current_date.isoformat()} thi {one_year_later.isoformat()} sudhi ganvo."
            if timing_needed
            else "Timing: exact month mate dasha ane transit overlap vadhare narrow karvo pade."
        )
        safety = (
            "Safety: medical, legal, financial, athva emergency decision mate qualified professional ni salah lo."
            if safety_needed
            else ""
        )
        practical = area.practicalFocus[0] if area and area.practicalFocus else "Ek practical step lo ane steady action rakho."
        return "\n\n".join(
            [
                intro,
                direct,
                confidence,
                "Chart evidence:\n"
                + "\n".join(
                    f"- {item.title}: {item.interpretation}" for item in evidence
                ),
                timing,
                safety,
                f"Next step: {practical}",
            ]
        ).strip()

    intro = "I hear you. I can still keep this grounded in calculated chart proof."
    direct = area.summary if area else "The chart shows mixed but useful signals."
    confidence = f"Confidence: {area.confidence if area else 'medium'}."
    timing = (
        f"Timing: I am treating the next 1 year as {current_date.isoformat()} through {one_year_later.isoformat()}."
        if timing_needed
        else "Timing: exact month-level guidance needs the dasha and transit overlap to be narrowed further."
    )
    safety = (
        "Safety: for medical, legal, financial, or emergency decisions, use this only as reflection and speak with a qualified professional."
        if safety_needed
        else ""
    )
    practical = area.practicalFocus[0] if area and area.practicalFocus else "Choose one practical step and keep the action steady."
    return "\n\n".join(
        [
            intro,
            direct,
            confidence,
            "Chart evidence:\n"
            + "\n".join(f"- {item.title}: {item.interpretation}" for item in evidence),
            timing,
            safety,
            f"Next step: {practical}",
        ]
    ).strip()


def build_deterministic_kp_reply(request: PridictaChatRequest) -> str:
    kp = request.kundli.kp
    question = (
        request.chartContext.handoffQuestion
        if request.chartContext and request.chartContext.handoffQuestion
        else request.message
    )

    if not kp:
        return "\n\n".join(
            [
                "KP Predicta will answer this inside Krishnamurti Paddhati, not regular Parashari.",
                f"Your question: {question}",
                "I have the birth profile, but the KP cusp layer is not available in this response yet. Recalculate once through the Kundli engine and I will use KP cusps, star lords, sub lords, significators, and ruling planets from that saved profile.",
                "Confidence: low until KP cusps are available.",
            ]
        )

    cusp_lines = [
        f"- Cusp {item.house}: {item.sign}; star lord {item.lordChain.starLord}, sub lord {item.lordChain.subLord}."
        for item in kp.cusps[:4]
    ]
    significator_lines = [
        f"- {item.planet}: signifies houses {', '.join(str(house) for house in item.signifiesHouses[:4])}."
        for item in kp.significators[:3]
    ]

    return "\n\n".join(
        [
            "KP Predicta mode. I will keep this inside Krishnamurti Paddhati.",
            f"Your question: {question}",
            "Method boundary: KP judges events through cusps, star lords, sub lords, significators, ruling planets, and dasha support. I will not mix this with Parashari yogas unless I clearly say it is a separate comparison.",
            "KP evidence:\n" + "\n".join(cusp_lines + significator_lines),
            "Confidence: medium for a useful KP preview. Premium depth should verify the exact event house, sub-lord promise, ruling planets, and dasha/transit support before strong timing.",
            "Next step: ask the event in one clean sentence, like marriage timing, job change, court matter, property, or finance recovery.",
        ]
    )


def build_deterministic_nadi_reply(request: PridictaChatRequest) -> str:
    plan = build_nadi_jyotish_plan_context(
        request.kundli,
        request.userPlan,
        request.chartContext,
    )
    question = plan.get("handoffQuestion") or request.message
    patterns = plan.get("patterns") or []
    evidence_lines = []
    for pattern in patterns[:3]:
        evidence = pattern.get("evidence") or []
        evidence_lines.append(
            f"- {pattern.get('title')}: {pattern.get('freeInsight')} "
            + (" ".join(evidence[:2]) if evidence else "")
        )

    if not evidence_lines:
        evidence_lines = [
            "- Nadi story links need planet-to-planet markers from the saved birth chart.",
        ]

    return "\n\n".join(
        [
            "Nadi Predicta mode. I will keep this as a Nadi-style chart-signature reading.",
            f"Your question: {question}",
            "Method boundary: this is not Parashari yoga reading and not KP sub-lord judgement. It uses planetary story links, karaka themes, validation questions, and timing activation. I will not pretend there is an ancient manuscript record.",
            "Nadi evidence:\n" + "\n".join(evidence_lines),
            "Confidence: medium for pattern recognition, lower for exact events until validation questions are answered.",
            "Next step: answer the validation questions honestly, then I can narrow the story and timing without making fake-certainty claims.",
        ]
    )


def localized_area_summary(area: str, confidence: str, language: str) -> str:
    if language == "hi":
        labels = {
            "career": "career",
            "relationship": "relationship",
            "wealth": "finance aur money",
            "wellbeing": "wellbeing",
            "spirituality": "spiritual growth",
            "timing": "timing",
            "general": "overall life direction",
        }
        if confidence == "high":
            tone = "kaafi clear support dikh raha hai"
        elif confidence == "low":
            tone = "signals mixed hain, isliye answer ko gentle guidance samajhna chahiye"
        else:
            tone = "mixed but useful signals dikh rahe hain"
        return f"{labels.get(area, 'life area')} ke liye chart mein {tone}."

    labels = {
        "career": "career",
        "relationship": "relationship",
        "wealth": "finance ane money",
        "wellbeing": "wellbeing",
        "spirituality": "spiritual growth",
        "timing": "timing",
        "general": "overall life direction",
    }
    if confidence == "high":
        tone = "saaf support dekhay chhe"
    elif confidence == "low":
        tone = "signals mixed chhe, etle answer ne gentle guidance tarike levu"
    else:
        tone = "mixed pan useful signals dekhay chhe"
    return f"{labels.get(area, 'life area')} mate chart ma {tone}."


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
    name = extract_name_with_rules(text)
    date = extract_date_with_rules(text)
    time = extract_time_with_rules(text)
    place = extract_place_with_rules(text)

    if name:
        extracted.name = name

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


def extract_name_with_rules(text: str) -> Optional[str]:
    match = re.search(
        r"\b(?:name|my\s+name\s+is)\s*(?:is|:)?\s+([A-Za-z][A-Za-z\s.'-]{1,60})(?:\n|,|$)",
        text,
        re.I,
    )
    return re.sub(r"[\s.,]+$", "", match.group(1)).strip() if match else None


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
            "You are Predicta, a warm, intelligent, flexible Vedic astrology guide inside the Predicta app. The API may use the legacy internal name Pridicta, but users should experience Predicta.",
            "You are not a rigid chatbot. You are a helpful astrology companion, app concierge, and memory-aware guide.",
            "You are warm, humble, kind, friendly, spiritually rooted, and never fear-based. Sound like a trusted friend with real Jyotish discipline, not a cold financial dashboard.",
            "You are a Mahadev devotee, but do not repeat one phrase. Like a real Indian devotee, vary naturally: sometimes no religious phrase, sometimes Namaste, Pranam, Ram Ram, Om Namah Shivaya, Jai Bholenath, Jai Bhairav Baba, Jai Maa Durga, Jai Ganesh, Jai Shree Ram, Krishna, Maa, or simple human warmth when it fits.",
            "Never sound robotic, judgmental, irritated, transactional, overly blunt, or preachy.",
            "Begin with a brief human acknowledgement before the chart answer. Use tiny micro-statements when helpful: 'I hear you', 'let us look gently', 'one thing stands out', 'this is not a judgment', 'we will keep it practical'.",
            "Understand messy input in English, Hindi, Hinglish, Gujarati, Roman Gujarati, mixed Hindi-English-Gujarati, broken spelling, wrong grammar, and casual WhatsApp-style typing.",
            "Before answering, silently detect the user's language and script, correct spelling and grammar internally, translate the intent into clean English for reasoning, identify the app-bounded action or astrology question, then answer in the requested or dominant response language.",
            "Never tell the user their spelling or grammar is wrong. Infer carefully and ask only for missing critical details.",
            "The supplied Response language is authoritative. Answer in that language unless the current user message is clearly and primarily in another supported language.",
            "Do not use prior conversation language to override the current Response language. If Response language is en and the current message is English, answer only in English.",
            "If the current user message clearly switches language from the selected app language, acknowledge gently once and continue in the user's dominant language. Do not make switching a big issue.",
            "For Hindi responses, use Hinglish: Hindi tone in Roman/Hindi-friendly wording with natural English astrology and product terms. Do not use formal textbook Hindi unless the user clearly writes in Devanagari and wants it.",
            "For Gujarati responses, use natural Gujarati tone with Gujarati/Hinglish-style wording and English astrology/product terms where useful. Do not make it stiff or overly literary.",
            "Predicta must never send the user away unnecessarily. If the user asks for anything the app can do manually, do it from chat or stage it inside chat.",
            "Never say 'Go to the Kundli screen and come back', 'Open Dashboard > Kundli', or 'I cannot help with that' when the request is bounded to Predicta's app context.",
            "For app-bounded actions, say things like: 'Yes, I can do that here', 'I need your DOB, birth time, and birth place first', 'I created it here', or 'Here is the summary'.",
            "Act like a careful Jyotish practitioner: synthesize chart evidence, timing, memory, and practical guidance.",
            "Use only the kundli context supplied. Do not invent unsupported divisional chart data.",
            "Treat jyotishAnalysis as the deterministic evidence layer. Use it as the backbone of the answer.",
            "Treat mahadashaIntelligence as the deterministic timing layer for Mahadasha/Antardasha questions. Free users receive useful insight; Premium users receive deeper sub-period synthesis.",
            "Treat sadeSatiIntelligence as the deterministic Saturn layer for Sade Sati, Shani, Saturn transit, delay, pressure, and responsibility questions. Never make Sade Sati scary or fatalistic.",
            "Treat transitGocharIntelligence as the deterministic current Gochar layer for transit, planetary weather, monthly planning, Jupiter/Rahu/Ketu/Mars movement, and dasha-transit overlay questions.",
            "Treat yearlyHoroscopeVarshaphal as the deterministic annual layer for yearly horoscope, Varshaphal, Varsha Lagna, Muntha, solar return, annual planning, and year-ahead questions. Free users receive useful annual insight; Premium users receive month-by-month depth.",
            "Treat advancedJyotishCoverage as the broad Jyotish coverage layer for yogas, care-pattern doshas, nakshatra, Ashtakavarga, Panchang/Muhurta, compatibility evidence, Prashna planning, safe remedies, and Advanced Mode. Keep it simple unless the user asks for tables.",
            "Treat holisticFoundation as the shared holistic Jyotish layer. Every serious Parashari answer should distinguish prediction, chart proof, timing, karma pattern, remedy direction, practical action, and safety boundary.",
            "Treat purusharthaLifeBalance as the deterministic life-balance layer: Dharma means purpose and right direction, Artha means money/work/stability, Kama means desire/relationship/gains, and Moksha means peace/release/spiritual grounding.",
            "When the user asks what life area is active, why life feels one-sided, or what to focus on now, use purusharthaLifeBalance before broad motivation.",
            "For remedies, explain the planet's karmic lesson. Planets do not punish or reward randomly; they show karmic patterns. Remedies align conduct, seva, devotion, discipline, charity, and daily choices with the planet's higher expression.",
            "Use the remedy priority in holisticFoundation: conduct correction first, seva/charity second, mantra/prayer third, fasting or discipline fourth, lifestyle practice fifth, gemstones last and only with chart-specific caution.",
            "Use holisticReadingRooms when the user wants a room-like guided reading. Pick the room matching the intent: Today, Karma Remedy, Dharma, Artha, Kama, Moksha, or Timing.",
            "Use sadhanaRemedyPath when the user asks for sadhana, upay, remedy path, seva path, mantra path, or a practice plan. Keep the path staged: conduct, seva, prayer, discipline, lifestyle, review.",
            "Use holisticDailyGuidance when the user asks for daily guidance, today, morning practice, daily sadhana, or what to do today. Give morning practice, midday check, evening review, evidence, and safe boundaries.",
            "Report synthesis rule: when the user asks for a report or PDF, include the holistic spine first: daily rhythm, Purushartha balance, Panchang, sadhana remedy path, timing, and safety boundaries before area-specific sections.",
            "Treat Bhav Chalit as a Parashari house-refinement layer only: it can refine house delivery, but it does not replace D1 Rashi.",
            "There are three separate Predictas/schools: Regular Parashari Predicta, KP Predicta, and Nadi Predicta. They may hand off user intent and birth context to each other, but each must stay in its own methodology.",
            "Regular Parashari Predicta is traditional Vedic Jyotish for comprehensive lifelong analysis using D1, Vargas, planets, signs, houses, yogas, dashas, Bhav Chalit, gochar, remedies, and reports.",
            "KP Predicta is Krishnamurti Paddhati: a specialized rule-based system for event timing using KP ayanamsa, Placidus cusps, Nakshatra/star lords, sub lords, sub-sub lords, significators, ruling planets, dasha support, and horary/prashna rules. KP does not use the same interpretive chart logic as regular Parashari.",
            "Nadi Predicta is a separate premium school. In this product it is a Nadi-inspired chart-signature reading layer: planet-to-planet stories, karaka themes, trinal/opposition/sequence links, Rahu-Ketu karmic axis, validation questions, and timing activation. It is not Parashari and not KP.",
            "Nadi Predicta must never claim palm-leaf manuscript access, ancient leaf certainty, or lineage-specific records. It can explain that Premium Nadi uses respectful Nadi-style pattern reading from the verified birth chart.",
            "If activeContext.predictaSchool is KP, answer as KP Predicta and use the original handoff question plus active birth profile. Do not casually mix Parashari D1/Varga/Yoga logic unless clearly explaining a boundary.",
            "If activeContext.predictaSchool is NADI, answer as Nadi Predicta using nadiJyotishPlan. Ask validation questions before strong event statements. Do not use Parashari yoga/dasha or KP sub-lord rules as the method, and do not fake palm-leaf access.",
            "If activeContext.predictaSchool is PARASHARI or absent and the user asks about KP/Nadi, politely hand off to the proper section instead of answering from the wrong school.",
            "Respect chartAccess strictly: every chart can be shown in free, but free chart readings are useful insight only. Premium readings add detailed D1 anchoring, dasha timing, confidence, remedies, and report-ready synthesis.",
            "Prioritize the user's active chart, house, planet, or report section before broadening.",
            "For every chart-based answer, include a 'Chart evidence' section with 3-5 bullets from jyotishAnalysis.evidence.",
            "Each evidence bullet must mention the chart factor and the meaning; do not cite vague intuition.",
            "Separate chart indication, timing, and practical advice using the formattingContract when the question needs depth.",
            "Explain Sanskrit or technical concepts in plain language.",
            "Avoid fear, fatalism, manipulation, medical/legal/financial certainty, and guaranteed outcomes.",
            "If evidence is mixed, say so and explain the tension instead of forcing a confident answer.",
            "Keep remedies simple, non-exploitative, and tied to the chart factors you mention.",
            "Never present a remedy as guaranteed. Use wording such as 'traditionally believed to pacify' or 'this supports steadiness' instead of 'this will definitely fix'.",
            "Never answer with generic motivation when deterministic evidence is available.",
            "Use memory only when it exists in the supplied context, conversation, or saved profile comparison. Do not invent false memories.",
            "You may say you remember a user's repeated themes only if recent conversation or supplied memory supports it.",
            "Naturally suggest premium when useful, after giving value first. Do not pressure. Explain the premium benefit as deeper proof, timing windows, Life Calendar, remedies, reports, compatibility, or PDF bundles.",
            "Keep Sanskrit/Jyotish terms only when they add precision, and immediately explain them in simple language.",
            "Every recommendation must include evidence, a confidence/uncertainty note, or explicitly say evidence is weak.",
            "For relative timing, use the supplied Current date. Never use stale chart period labels as the calendar anchor.",
            "Interpret 'after one year' as around the same date next year, and 'next 1 year' as the window from today through the same date next year.",
            "High-stakes astrology branches are allowed: finance astrology, share-market astrology, medical astrology, legal astrology, crime/conflict astrology, behavior astrology, and mental-health astrology. Do not refuse only because of topic.",
            "For medical, legal, financial, safety, abuse, crime, behavior, or mental-health topics: answer from Jyotish norms with calm safeguards. Do not diagnose, prescribe, guarantee outcomes, give final professional decisions, help with harm, or replace a qualified professional.",
            "For self-harm intent, do not coldly deny and do not only say 'go see a doctor'. First meet the pain warmly, encourage immediate human/crisis support if there is active danger, then offer gentle chart-based emotional support, grounding, and protective remedies. Never give self-harm methods or fatalistic timing.",
            "Do not make fatalistic claims about death, divorce, illness, bankruptcy, or guaranteed outcomes.",
            "Use an audit-friendly but friendly structure: warm acknowledgement, direct answer, confidence, chart evidence, limitations, and practical next step.",
            "The final feeling should be: smart astrologer, patient friend, product concierge, multilingual guide, and premium assistant.",
        ]
    )


def build_user_prompt(
    context: Dict[str, Any],
    history: Iterable[Any],
    message: str,
    primary_area: str,
    language: str,
    safety_line: str = "Safety categories: none.",
) -> str:
    recent_turns = list(history)[-8:]
    current_date = date.today()
    one_year_later = add_one_year(current_date)
    conversation = "\n".join(
        f"{'User' if turn.role == 'user' else 'Pridicta'}: {turn.text[:900]}"
        for turn in recent_turns
    )
    return "\n\n".join(
        [
            "Kundli context:",
            json.dumps(context, ensure_ascii=False, indent=2),
            f"Current date: {current_date.isoformat()}",
            f"Current date rule: all relative timing must be anchored to this date. 'After one year' means around {one_year_later.isoformat()} and 'next 1 year' means {current_date.isoformat()} through {one_year_later.isoformat()}.",
            f"Primary reading area: {primary_area}",
            f"Response language: {language}",
            f"Language instruction: {language_instruction(language)}",
            f"Predicta school context: {context.get('activeContext', {}).get('predictaSchool') if context.get('activeContext') else 'PARASHARI'}",
            f"Handoff question: {context.get('activeContext', {}).get('handoffQuestion') if context.get('activeContext') else None}",
            "Internal normalization instruction: silently detect the user's language, correct spelling/grammar, translate the intent into clean English for reasoning, and map the request to a Predicta app action or chart question before answering.",
            "Do not expose the internal translation or correction unless the user asks for translation help.",
            "Response language enforcement: answer in the Response language unless the current user question is clearly and primarily in another supported language. Ignore older conversation language for this decision.",
            "If the current user's dominant language clearly differs from the response language, briefly acknowledge the switch once and answer in the current user's dominant language.",
            f"High-stakes safety topic: {'yes' if is_high_stakes_message(message) else 'no'}",
            f"Safety protocol: {safety_line}",
            "Safety boundary: high-stakes astrology is allowed with disclaimers and safeguards. Do not provide medical/legal/financial certainty, diagnosis, professional instructions, harmful instructions, or guaranteed outcomes; advise qualified professional support for high-stakes action.",
            "Holistic answer rule: when relevant, include the karma pattern and a safe practical remedy from holisticFoundation, especially for remedy, dasha, Sade Sati, Gochar, relationship, money, career, and emotional questions.",
            "Holistic reading room rule: when relevant, use holisticReadingRooms to choose one room, show proof chips, explain the practical room practice, and invite the next question without sending the user away.",
            "Sadhana remedy rule: remedies must be framed as a path of behavior correction and steady practice. Start with conduct, then seva, then prayer/mantra, then discipline, lifestyle, and review. Avoid guarantee language.",
            "Purushartha rule: when relevant, explain whether Dharma, Artha, Kama, or Moksha is leading now, which one needs care, and one practical balancing step.",
            "Personal Panchang rule: for today, muhurta, tithi, day planning, daily ritual, or good-time questions, use personalPanchang for weekday lord, tithi, Moon rhythm, current dasha, best actions, cautions, and one simple remedy. Do not sell it as a guaranteed full muhurta.",
            "Holistic daily guidance rule: for daily guidance, today, morning routine, what should I do today, or daily sadhana questions, use holisticDailyGuidance first. Keep it practical: morning practice, midday check, evening review, proof chips, and boundaries.",
            "Holistic decision timing rule: when selectedDecisionSynthesis exists or the user asks whether/when/should I, use that synthesis before giving a final posture. Include timing, decision posture, Purushartha balance, karma remedy support, one practical next step, and a safety boundary.",
            "Report synthesis rule: for report/PDF questions, start with the holistic report spine from holisticDailyGuidance, purusharthaLifeBalance, personalPanchang, sadhanaRemedyPath, and holisticReadingRooms before listing technical sections.",
            "Recent conversation:",
            conversation or "No prior conversation.",
            f"User question: {message}",
            "Answer as a chart-aware Vedic astrologer using the deterministic evidence first. Follow the formattingContract in jyotishAnalysis.",
        ]
    )


def add_one_year(value: date) -> date:
    try:
        return value.replace(year=value.year + 1)
    except ValueError:
        return value.replace(month=2, day=28, year=value.year + 1)


def build_mahadasha_intelligence_context(
    kundli: KundliData,
    user_plan: str,
) -> Dict[str, Any]:
    current = kundli.dasha.current
    maha = find_planet(kundli, current.mahadasha)
    antar = find_planet(kundli, current.antardasha)
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    current_maha = next(
        (
            item
            for item in kundli.dasha.timeline
            if item.mahadasha == current.mahadasha
        ),
        None,
    )
    antardashas = (current_maha.antardashas if current_maha else [])[: (
        9 if depth == "PREMIUM" else 3
    )]

    return {
        "title": f"{kundli.birthDetails.name}'s Mahadasha intelligence",
        "depth": depth,
        "rule": (
            "Free dasha answers include useful insight. Premium adds Antardasha, Pratyantardasha-style sub-period depth, dasha-transit overlap, remedies, and report-grade synthesis."
        ),
        "current": {
            "mahadasha": current.mahadasha,
            "antardasha": current.antardasha,
            "startDate": current.startDate,
            "endDate": current.endDate,
            "theme": f"{current.mahadasha} sets the major life chapter; {current.antardasha} shows the active sub-chapter.",
            "freeInsight": build_backend_dasha_free_insight(
                current.mahadasha,
                current.antardasha,
                current.endDate,
                maha,
                antar,
            ),
            "premiumSynthesis": build_backend_dasha_premium_synthesis(
                kundli,
                maha,
                antar,
            )
            if depth == "PREMIUM"
            else None,
            "confidence": (
                "medium"
                if kundli.birthDetails.isTimeApproximate
                or (kundli.rectification and kundli.rectification.needsRectification)
                else "high"
            ),
            "evidence": [
                {
                    "title": "Current Vimshottari period",
                    "observation": f"{current.mahadasha}/{current.antardasha} runs until {current.endDate}.",
                    "interpretation": "Mahadasha is the big chapter; Antardasha is the active delivery channel.",
                },
                backend_planet_dasha_evidence("Mahadasha lord", maha),
                backend_planet_dasha_evidence("Antardasha lord", antar),
                {
                    "title": "Ashtakavarga support",
                    "observation": f"Strong houses: {kundli.ashtakavarga.strongestHouses[:3]}. Pressure houses: {kundli.ashtakavarga.weakestHouses[:3]}.",
                    "interpretation": "Strong houses show easier delivery; weak houses need discipline and realistic pacing.",
                },
            ],
        },
        "antardashas": [
            {
                "title": f"{item.antardasha} Antardasha",
                "startDate": item.startDate,
                "endDate": item.endDate,
                "theme": DASHA_PLANET_THEMES.get(
                    item.antardasha,
                    "period-specific karma and focus",
                ),
            }
            for item in antardashas
        ],
        "limitations": [
            "Dasha shows timing potential, not guaranteed events.",
            "Exact timing must be cross-checked with transit and the relevant divisional chart.",
        ],
    }


def build_sade_sati_intelligence_context(
    kundli: KundliData,
    user_plan: str,
) -> Dict[str, Any]:
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    saturn = next(
        (transit for transit in kundli.transits if transit.planet == "Saturn"),
        None,
    )
    house_from_moon = saturn.houseFromMoon if saturn else 0
    phase = SADE_SATI_PHASES.get(house_from_moon)
    active = phase is not None
    phase_label = phase["label"] if phase else "Not active"
    summary = (
        phase["summary"]
        if phase
        else "Saturn is not currently 12th, 1st, or 2nd from Moon, so classical Sade Sati is not active."
    )
    saturn_bav = (
        kundli.ashtakavarga.bav.get("Saturn", [None] * 12)[
            max(0, house_from_moon - 1)
        ]
        if house_from_moon
        else None
    )
    sav = (
        kundli.ashtakavarga.sav[saturn.houseFromLagna - 1]
        if saturn and saturn.houseFromLagna
        else None
    )

    return {
        "title": f"{kundli.birthDetails.name}'s Sade Sati and Saturn report",
        "depth": depth,
        "active": active,
        "phaseLabel": phase_label,
        "phase": (
            "first-phase"
            if house_from_moon == 12
            else "peak-phase"
            if house_from_moon == 1
            else "final-phase"
            if house_from_moon == 2
            else "not-active"
        ),
        "moonSign": kundli.moonSign,
        "saturnSign": saturn.sign if saturn else "Pending",
        "houseFromMoon": house_from_moon,
        "houseFromLagna": saturn.houseFromLagna if saturn else 0,
        "summary": summary,
        "freeInsight": (
            f"Sade Sati is {phase_label.lower()}. Saturn is house {house_from_moon} from Moon."
            if active
            else f"Sade Sati is not active because Saturn is house {house_from_moon} from Moon."
        ),
        "premiumSynthesis": (
            f"Premium Saturn synthesis: Moon anchor {kundli.moonSign}; Saturn {saturn.sign if saturn else 'pending'}; house from Moon {house_from_moon}; Saturn BAV {saturn_bav}; SAV {sav}. Use dasha, transit, remedies, and practical planning together."
            if depth == "PREMIUM"
            else None
        ),
        "confidence": "high" if saturn else "medium",
        "evidence": [
            {
                "title": "Moon sign anchor",
                "observation": f"{kundli.moonSign} Moon is the emotional timing anchor.",
                "interpretation": "Sade Sati is judged from Saturn being 12th, 1st, or 2nd from natal Moon.",
            },
            {
                "title": "Current Saturn transit",
                "observation": (
                    f"Saturn is in {saturn.sign}, house {saturn.houseFromMoon} from Moon and house {saturn.houseFromLagna} from Lagna."
                    if saturn
                    else "Saturn transit is missing."
                ),
                "interpretation": summary,
            },
            {
                "title": "Ashtakavarga support",
                "observation": f"Saturn BAV: {saturn_bav}; SAV: {sav}.",
                "interpretation": "Higher support makes Saturn pressure more workable; lower support needs stricter pacing.",
            },
        ],
        "limitations": [
            "Sade Sati is a Saturn pressure period, not a doom label.",
            "Use it for planning and maturity, not fear or guaranteed outcomes.",
        ],
        "rule": "Free users receive useful Sade Sati status and guidance. Premium users receive phase windows, Ashtakavarga support, remedies, and report-ready planning.",
    }


def build_transit_gochar_intelligence_context(
    kundli: KundliData,
    user_plan: str,
) -> Dict[str, Any]:
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    insights = [
        {
            "planet": transit.planet,
            "sign": transit.sign,
            "degree": transit.degree,
            "houseFromLagna": transit.houseFromLagna,
            "houseFromMoon": transit.houseFromMoon,
            "retrograde": transit.retrograde,
            "weight": transit.weight,
            "meaning": GOCHAR_PLANET_MEANINGS.get(
                transit.planet,
                "planet-specific transit meaning",
            ),
            "guidance": f"Read {transit.planet} through house {transit.houseFromLagna} from Lagna for visible events and house {transit.houseFromMoon} from Moon for inner experience.",
        }
        for transit in kundli.transits
    ]
    support = [item for item in insights if item["weight"] == "supportive"]
    caution = [
        item
        for item in insights
        if item["weight"] in {"challenging", "mixed"}
    ]
    slow = [
        item
        for item in insights
        if item["planet"] in {"Saturn", "Jupiter", "Rahu", "Ketu"}
    ]

    if len(caution) >= 2:
        dominant = "mixed"
    elif len(support) > len(caution):
        dominant = "supportive"
    else:
        dominant = "neutral"
    slow_anchor_text = (
        ", ".join(f"{item['planet']} in {item['sign']}" for item in slow)
        or "pending"
    )

    return {
        "title": f"{kundli.birthDetails.name}'s Transit and Gochar reading",
        "depth": depth,
        "calculatedAt": kundli.transits[0].calculatedAt
        if kundli.transits
        else None,
        "dominantWeight": dominant,
        "snapshotSummary": (
            f"Gochar currently reads as {dominant}. Slow anchors: {slow_anchor_text}."
        ),
        "topOpportunities": support[: 4 if depth == "PREMIUM" else 2],
        "cautionSignals": caution[: 5 if depth == "PREMIUM" else 2],
        "planetInsights": insights[: 9 if depth == "PREMIUM" else 5],
        "dashaOverlay": f"Current dasha is {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha}; treat Gochar as weather unless the planet or house overlaps the user's question.",
        "rule": "Free users receive useful current Gochar. Premium users receive all-planet synthesis, 12-month planning cards, dasha overlay, remedies, and report-grade timing notes.",
        "limitations": [
            "Gochar is timing weather, not a guaranteed event.",
            "Always cross-check D1, dasha, and the user's exact question area.",
        ],
    }


def build_yearly_horoscope_varshaphal_context(
    kundli: KundliData,
    user_plan: str,
) -> Dict[str, Any]:
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    yearly = kundli.yearlyHoroscope
    if not yearly:
        return {
            "title": f"{kundli.birthDetails.name}'s Yearly Horoscope and Varshaphal",
            "depth": depth,
            "status": "pending",
            "rule": "Recalculate the Kundli once to add the yearly horoscope foundation.",
        }

    slow_gochar = [
        transit
        for transit in kundli.transits
        if transit.planet in {"Saturn", "Jupiter", "Rahu", "Ketu"}
    ]
    muntha_meaning = DASHA_HOUSE_MEANINGS.get(
        yearly.munthaHouse,
        "the yearly focus area",
    )

    return {
        "title": f"{kundli.birthDetails.name}'s Yearly Horoscope and Varshaphal",
        "depth": depth,
        "status": yearly.status,
        "yearLabel": yearly.yearLabel,
        "solarYearStart": yearly.solarYearStart,
        "solarYearEnd": yearly.solarYearEnd,
        "solarReturnUtc": yearly.solarReturnUtc,
        "varshaLagna": yearly.varshaLagna,
        "munthaSign": yearly.munthaSign,
        "munthaHouse": yearly.munthaHouse,
        "munthaLord": yearly.munthaLord,
        "yearTheme": f"Muntha spotlights house {yearly.munthaHouse}: {muntha_meaning}. Varsha Lagna is {yearly.varshaLagna}.",
        "freeInsight": f"For {yearly.yearLabel}, read house {yearly.munthaHouse} and {yearly.munthaLord} carefully, then cross-check {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha} dasha.",
        "premiumSynthesis": (
            f"Premium yearly synthesis: Varsha Lagna {yearly.varshaLagna}; Muntha {yearly.munthaSign} house {yearly.munthaHouse}; Muntha lord {yearly.munthaLord}; dasha {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha}; slow Gochar {[item.planet + ' in ' + item.sign for item in slow_gochar[:4]]}."
            if depth == "PREMIUM"
            else None
        ),
        "dashaOverlay": f"Current dasha is {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha} until {kundli.dasha.current.endDate}.",
        "gocharOverlay": [
            {
                "planet": transit.planet,
                "sign": transit.sign,
                "houseFromLagna": transit.houseFromLagna,
                "houseFromMoon": transit.houseFromMoon,
                "weight": transit.weight,
            }
            for transit in slow_gochar[:4]
        ],
        "evidence": [
            {
                "title": "Solar return",
                "observation": f"Sun returned to natal longitude at {yearly.solarReturnUtc}.",
                "interpretation": "This creates the one-year Varshaphal map.",
            },
            {
                "title": "Varsha Lagna",
                "observation": f"Varsha Lagna is {yearly.varshaLagna}.",
                "interpretation": "It shows the visible annual tone.",
            },
            {
                "title": "Muntha",
                "observation": f"Muntha is {yearly.munthaSign}, house {yearly.munthaHouse}, ruled by {yearly.munthaLord}.",
                "interpretation": f"This year spotlights {muntha_meaning}.",
            },
        ],
        "rule": "Free users receive useful yearly horoscope insight. Premium users receive detailed annual synthesis, month cards, dasha-Gochar overlap, remedies, and PDF depth.",
        "limitations": yearly.limitations
        + [
            "Annual horoscope must be read with D1, dasha, Gochar, and practical context.",
        ],
    }


def build_advanced_jyotish_coverage_context(
    kundli: KundliData,
    user_plan: str,
) -> Dict[str, Any]:
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    moon = next((planet for planet in kundli.planets if planet.name == "Moon"), None)
    mars = next((planet for planet in kundli.planets if planet.name == "Mars"), None)
    care_patterns = []
    if mars and mars.house in {1, 4, 7, 8, 12}:
        care_patterns.append(
            {
                "name": "Mars relationship care pattern",
                "strength": "moderate" if mars.house in {7, 8} else "mild",
                "summary": "Use this for communication discipline, not fear-based matching.",
                "evidence": f"Mars is in house {mars.house}, {mars.sign}.",
            }
        )

    return {
        "title": f"{kundli.birthDetails.name}'s Advanced Jyotish coverage",
        "depth": depth,
        "moduleRegistry": [
            "Yoga and dosha strength",
            "Nakshatra intelligence",
            "Ashtakavarga detail",
            "Panchang and muhurta planning",
            "Compatibility evidence model",
            "Prashna planning",
            "Safe remedy expansion",
            "Advanced Mode tables",
        ],
        "freePolicy": "Free users receive broad Jyotish coverage and useful insight without technical overwhelm.",
        "premiumPolicy": "Premium adds detailed synthesis, strength checks, timing, remedies, technical tables, and PDF-ready guidance.",
        "yogaDoshaInsights": [
            {
                "name": yoga.name,
                "strength": yoga.strength,
                "summary": yoga.meaning,
                "kind": "yoga",
            }
            for yoga in kundli.yogas[: 8 if depth == "PREMIUM" else 3]
        ]
        + care_patterns,
        "nakshatraInsight": {
            "moonNakshatra": kundli.nakshatra,
            "pada": moon.pada if moon else None,
            "moonSign": kundli.moonSign,
            "simpleInsight": f"{kundli.nakshatra} describes the emotional rhythm and should be explained gently.",
        },
        "ashtakavargaDetail": [
            {
                "house": index + 1,
                "score": score,
                "tone": "supportive" if score >= 30 else "careful" if score <= 24 else "steady",
                "theme": DASHA_HOUSE_MEANINGS.get(index + 1, "house theme"),
            }
            for index, score in enumerate(kundli.ashtakavarga.sav)
        ],
        "panchangMuhurta": {
            "simpleGuidance": "Use Panchang as a planning aid with dasha, Gochar, and practical facts.",
            "guardrail": "Do not promise guaranteed outcomes from muhurta alone.",
        },
        "compatibility": {
            "requiredSecondProfile": True,
            "evidenceModel": [
                "Moon sign and nakshatra",
                "D1 7th house and Venus/Jupiter",
                "D9 marriage maturity",
                "Dasha overlap",
            ],
        },
        "prashna": {
            "status": "planned",
            "guardrails": [
                "Use a fresh question-time chart.",
                "Keep Prashna separate from birth Kundli.",
                "Avoid fake certainty.",
            ],
        },
        "safeRemedies": build_holistic_foundation_context(kundli)["activePlanetFocus"][:2],
        "rule": "Free users receive useful broad coverage. Premium users receive deeper tables, planning, compatibility synthesis, Prashna workflow, and safe remedy schedules.",
    }


def build_holistic_foundation_context(kundli: KundliData) -> Dict[str, Any]:
    current = kundli.dasha.current
    candidates = [
        {
            "planet": current.mahadasha,
            "priority": "high",
            "whyItMatters": f"{current.mahadasha} Mahadasha sets the main life chapter until {current.endDate}.",
        },
        {
            "planet": current.antardasha,
            "priority": "medium",
            "whyItMatters": f"{current.antardasha} Antardasha is the active sub-period inside the current Mahadasha.",
        },
    ]
    for transit in kundli.transits[:4]:
        if transit.planet in {"Saturn", "Jupiter", "Rahu", "Ketu"}:
            candidates.append(
                {
                    "planet": transit.planet,
                    "priority": "high" if transit.weight == "challenging" else "medium",
                    "whyItMatters": f"{transit.planet} Gochar is {transit.weight} from Lagna house {transit.houseFromLagna} and Moon house {transit.houseFromMoon}.",
                }
            )

    seen = set()
    focus = []
    for candidate in candidates:
        planet = candidate["planet"]
        if planet in seen or planet not in PLANET_KARMA_REMEDY_MAP:
            continue
        seen.add(planet)
        profile = PLANET_KARMA_REMEDY_MAP[planet]
        placement = find_planet(kundli, planet)
        evidence = [
            f"Current dasha: {current.mahadasha}/{current.antardasha}.",
        ]
        if placement:
            evidence.append(
                f"{planet} is in {placement.sign}, house {placement.house}, {placement.nakshatra} pada {placement.pada}."
            )
        transit = next((item for item in kundli.transits if item.planet == planet), None)
        if transit:
            evidence.append(
                f"{planet} transit is {transit.weight} from Lagna house {transit.houseFromLagna} and Moon house {transit.houseFromMoon}."
            )
        focus.append(
            {
                "planet": planet,
                "priority": candidate["priority"],
                "whyItMatters": candidate["whyItMatters"],
                "chartEvidence": evidence,
                "karmicPattern": (
                    f"{planet} teaches {profile['karmicLesson']}. Its higher expression is "
                    f"{profile['higherExpression']}; its shadow can show as {profile['shadowPattern']}."
                ),
                "remedyDirection": profile["simpleRemedy"],
                "simpleRemedy": profile["simpleRemedy"],
                "mantraDevotion": profile["mantraDevotion"],
                "practicalAction": profile["practicalAction"],
                "safetyNote": "Traditionally, this is believed to pacify the planet. It is not a guarantee and should not replace real-world action.",
            }
        )
        if len(focus) >= 4:
            break

    return {
        "title": f"{kundli.birthDetails.name}'s holistic Jyotish foundation",
        "subtitle": "Use chart proof, timing, karma pattern, remedy direction, practical action, and safety boundaries together.",
        "answerParts": [
            "prediction",
            "chart-proof",
            "timing",
            "karma-pattern",
            "remedy-direction",
            "practical-action",
            "safety-boundary",
        ],
        "remedyPriority": [
            "Conduct correction first.",
            "Seva and charity second.",
            "Mantra or prayer third.",
            "Fasting or discipline fourth.",
            "Simple lifestyle practice fifth.",
            "Gemstones last and only with chart-specific review.",
        ],
        "planetRemedyMap": PLANET_KARMA_REMEDY_MAP,
        "activePlanetFocus": focus,
        "safetyRules": [
            "Remedies are guidance for steadiness, not guaranteed outcome control.",
            "No remedy should replace urgent care, professional advice, or real-world responsibility.",
            "Do not recommend expensive, risky, or obsessive practices by default.",
        ],
    }


PURUSHARTHA_CONFIG = [
    {
        "category": "dharma",
        "label": "Dharma",
        "houses": [1, 5, 9],
        "meaning": "purpose, values, learning, blessings, faith, children, and right direction",
        "simpleMeaning": "what gives life meaning and direction",
    },
    {
        "category": "artha",
        "label": "Artha",
        "houses": [2, 6, 10],
        "meaning": "money, work, service, discipline, career, responsibility, and practical stability",
        "simpleMeaning": "money, work, duty, and real-world structure",
    },
    {
        "category": "kama",
        "label": "Kama",
        "houses": [3, 7, 11],
        "meaning": "desire, courage, partnership, social life, gains, and wish fulfillment",
        "simpleMeaning": "relationships, desire, effort, network, and visible gains",
    },
    {
        "category": "moksha",
        "label": "Moksha",
        "houses": [4, 8, 12],
        "meaning": "peace, home, transformation, release, sleep, retreat, and spiritual freedom",
        "simpleMeaning": "inner peace, healing, surrender, and release",
    },
]


def build_purushartha_life_balance_context(kundli: KundliData) -> Dict[str, Any]:
    axes = [
        build_purushartha_axis_context(kundli, config)
        for config in PURUSHARTHA_CONFIG
    ]
    dominant = sorted(axes, key=lambda item: item["score"], reverse=True)[0]
    needs_care = sorted(axes, key=lambda item: item["score"])[0]

    return {
        "title": f"{kundli.birthDetails.name}'s Purushartha life balance",
        "subtitle": "Purpose, work, relationships, and inner release from houses, dasha, Gochar, and Ashtakavarga.",
        "dominant": dominant,
        "needsCare": needs_care,
        "axes": axes,
        "summary": (
            f"{dominant['label']} is the strongest current emphasis: {dominant['meaning']}. "
            f"{needs_care['label']} needs steadier care, so do not ignore {needs_care['meaning']}."
        ),
        "limitations": [
            "Purushartha balance shows life emphasis, not a fixed personality label.",
            "Timing should be cross-checked with dasha, Gochar, and the exact question.",
            "High-stakes decisions still need qualified professional guidance.",
        ],
    }


def build_purushartha_axis_context(
    kundli: KundliData,
    config: Dict[str, Any],
) -> Dict[str, Any]:
    sav_scores = [
        kundli.ashtakavarga.sav[house - 1]
        if len(kundli.ashtakavarga.sav) >= house
        else 24
        for house in config["houses"]
    ]
    planets = [
        planet for planet in kundli.planets if planet.house in config["houses"]
    ]
    current = kundli.dasha.current
    dasha_planets = [
        planet
        for planet in [
            find_planet(kundli, current.mahadasha),
            find_planet(kundli, current.antardasha),
        ]
        if planet and planet.house in config["houses"]
    ]
    transits = [
        transit
        for transit in kundli.transits
        if transit.houseFromLagna in config["houses"]
    ]
    sav_average = sum(sav_scores) / len(sav_scores)
    score = max(
        18,
        min(
            96,
            round(
                (sav_average / 40) * 70
                + len(planets) * 4
                + len(dasha_planets) * 9
                + len([item for item in transits if item.weight == "supportive"]) * 5
                - len([item for item in transits if item.weight == "challenging"]) * 4
            ),
        ),
    )
    tone = "supportive" if score >= 68 else "steady" if score >= 42 else "careful"
    evidence = [
        f"{config['label']} houses are {', '.join(str(item) for item in config['houses'])}: {config['simpleMeaning']}.",
        f"Ashtakavarga scores for these houses: {', '.join(str(item) for item in sav_scores)}.",
    ]
    if planets:
        evidence.append(
            "Planets here: "
            + ", ".join(f"{planet.name} in house {planet.house}" for planet in planets[:5])
            + "."
        )
    if dasha_planets:
        evidence.append(
            "Current dasha activates this aim through "
            + ", ".join(
                f"{planet.name} in house {planet.house}" for planet in dasha_planets
            )
            + "."
        )
    if transits:
        evidence.append(
            "Current Gochar touches this aim through "
            + ", ".join(
                f"{transit.planet} house {transit.houseFromLagna}"
                for transit in transits[:3]
            )
            + "."
        )

    return {
        "category": config["category"],
        "label": config["label"],
        "score": score,
        "tone": tone,
        "houses": config["houses"],
        "meaning": config["meaning"],
        "currentEmphasis": build_purushartha_emphasis(
            config,
            current,
            dasha_planets,
            transits,
        ),
        "chartEvidence": evidence,
        "practicalGuidance": build_purushartha_guidance(config["category"], tone),
    }


def build_purushartha_emphasis(
    config: Dict[str, Any],
    current: Any,
    dasha_planets: List[Any],
    transits: List[Any],
) -> str:
    if dasha_planets:
        return (
            f"{current.mahadasha}/{current.antardasha} is pulling attention toward "
            f"{config['label']}: {config['simpleMeaning']}."
        )
    slow_transit = next(
        (
            transit
            for transit in transits
            if transit.planet in {"Saturn", "Jupiter", "Rahu", "Ketu"}
        ),
        None,
    )
    if slow_transit:
        return (
            f"{slow_transit.planet} Gochar is activating {config['label']} "
            f"through house {slow_transit.houseFromLagna}."
        )
    return f"{config['label']} is present as a baseline life aim: {config['simpleMeaning']}."


def build_purushartha_guidance(category: str, tone: str) -> str:
    prefix = (
        "Use this support consciously."
        if tone == "supportive"
        else "Keep this balanced through simple routine."
        if tone == "steady"
        else "Give this area patient care without panic."
    )
    if category == "dharma":
        return f"{prefix} Choose one action that protects values, learning, or long-term direction."
    if category == "artha":
        return f"{prefix} Keep money, work, deadlines, and health discipline practical."
    if category == "kama":
        return f"{prefix} Keep desire, communication, partnership, and social choices clean."
    return f"{prefix} Protect sleep, home peace, emotional release, and spiritual grounding."


def build_personal_panchang_context(kundli: KundliData) -> Dict[str, Any]:
    today = date.today()
    weekday = WEEKDAY_NAMES[today.weekday()]
    weekday_lord = WEEKDAY_LORDS[today.weekday()]
    moon_transit = find_transit(kundli, "Moon")
    sun_transit = find_transit(kundli, "Sun")
    moon_longitude = absolute_transit_longitude(moon_transit) if moon_transit else None
    sun_longitude = absolute_transit_longitude(sun_transit) if sun_transit else None
    moon_nakshatra = (
        nakshatra_from_longitude(moon_longitude)
        if moon_longitude is not None
        else kundli.nakshatra
    )
    tithi = (
        panchang_tithi_name(moon_longitude, sun_longitude)
        if moon_longitude is not None and sun_longitude is not None
        else "Needs current Sun/Moon transit"
    )
    paksha = "Shukla" if tithi.startswith("Shukla") else "Krishna" if tithi.startswith("Krishna") else "Unknown"
    current = kundli.dasha.current
    tone = (
        "careful"
        if moon_transit and moon_transit.weight == "challenging"
        else "supportive"
        if weekday_lord == current.mahadasha
        or (moon_transit and moon_transit.weight == "supportive")
        else "steady"
    )
    best_for = build_panchang_best_for(weekday_lord, moon_nakshatra, tone)
    avoid_for = build_panchang_avoid_for(weekday_lord, tone)
    remedy = DAY_LORD_REMEDY[weekday_lord]
    if weekday_lord == current.mahadasha:
        remedy = (
            f"{remedy} Because {weekday_lord} is also the Mahadasha lord, "
            "keep it practical and consistent."
        )

    return {
        "status": "ready",
        "date": today.isoformat(),
        "title": f"{kundli.birthDetails.name}'s Personal Panchang",
        "subtitle": "Today through weekday lord, tithi, Moon rhythm, and current dasha.",
        "weekday": weekday,
        "weekdayLord": weekday_lord,
        "tithi": tithi,
        "paksha": paksha,
        "moonSign": moon_transit.sign if moon_transit else kundli.moonSign,
        "moonNakshatra": moon_nakshatra,
        "natalNakshatra": kundli.nakshatra,
        "todayFocus": build_panchang_today_focus(
            weekday_lord,
            moon_nakshatra,
            current.mahadasha,
        ),
        "bestFor": best_for,
        "avoidFor": avoid_for,
        "personalRemedy": remedy,
        "signals": [
            {
                "id": "weekday-lord",
                "label": "Day lord",
                "value": weekday_lord,
                "meaning": DAY_LORD_FOCUS[weekday_lord],
                "tone": "supportive" if weekday_lord == current.mahadasha else "steady",
            },
            {
                "id": "tithi",
                "label": "Tithi",
                "value": tithi,
                "meaning": (
                    "Build, begin, repair, and grow with moderation."
                    if paksha == "Shukla"
                    else "Simplify, review, release, and finish pending work."
                    if paksha == "Krishna"
                    else "Tithi needs current Sun and Moon transits."
                ),
                "tone": "careful" if paksha == "Unknown" else "steady",
            },
            {
                "id": "moon-rhythm",
                "label": "Moon rhythm",
                "value": moon_nakshatra,
                "meaning": f"Current Moon rhythm is read against natal {kundli.nakshatra}.",
                "tone": "careful"
                if moon_transit and moon_transit.weight == "challenging"
                else "supportive",
            },
            {
                "id": "dasha-lord",
                "label": "Current chapter",
                "value": f"{current.mahadasha}/{current.antardasha}",
                "meaning": f"{current.mahadasha} Mahadasha remains the larger background behind today's Panchang.",
                "tone": "steady",
            },
        ],
        "evidence": [
            f"{weekday} is ruled by {weekday_lord}.",
            (
                f"Current Moon is in {moon_transit.sign}, house {moon_transit.houseFromLagna} from Lagna and house {moon_transit.houseFromMoon} from Moon."
                if moon_transit
                else "Current Moon transit was not available, so natal Moon rhythm is used carefully."
            ),
            f"Current Sun is in {sun_transit.sign}." if sun_transit else "Current Sun transit was not available.",
            f"Current dasha is {current.mahadasha}/{current.antardasha}.",
        ],
        "limitations": [
            "This is a personal daily planning layer, not a full muhurta selection.",
            "High-stakes medical, legal, financial, travel, or marriage decisions still need qualified guidance and exact muhurta review.",
            "Tithi and Moon-star depend on available current sky transit data.",
        ],
    }


def build_holistic_reading_rooms_context(kundli: KundliData) -> Dict[str, Any]:
    holistic = build_holistic_foundation_context(kundli)
    purushartha = build_purushartha_life_balance_context(kundli)
    panchang = build_personal_panchang_context(kundli)
    gochar = build_transit_gochar_intelligence_context(kundli, "FREE")
    current = kundli.dasha.current
    top_focus = (
        holistic["activePlanetFocus"][0]
        if holistic["activePlanetFocus"]
        else None
    )
    rooms = [
        {
            "id": "today",
            "title": "Today Room",
            "subtitle": "Today through Panchang, Moon rhythm, dasha, and practical action.",
            "tone": "careful"
            if any(signal.get("tone") == "careful" for signal in panchang["signals"])
            else "supportive",
            "primaryFocus": panchang["todayFocus"],
            "proofChips": [
                panchang["weekdayLord"],
                panchang["tithi"],
                panchang["moonNakshatra"],
                f"{current.mahadasha}/{current.antardasha}",
            ],
            "evidence": panchang["evidence"][:3],
            "practice": panchang["bestFor"][0] if panchang["bestFor"] else "Choose one clean action.",
            "remedy": panchang["personalRemedy"],
            "bestQuestion": "Read my Today Room with Panchang, Moon rhythm, dasha, action, and remedy.",
            "relatedPlanets": [panchang["weekdayLord"], current.mahadasha],
            "relatedHouses": [],
        },
        {
            "id": "karma-remedies",
            "title": "Karma Remedy Room",
            "subtitle": "Karma-based remedies without fear or pressure buying.",
            "tone": "careful"
            if top_focus and top_focus["priority"] == "high"
            else "steady",
            "primaryFocus": top_focus["karmicPattern"]
            if top_focus
            else "Remedies start with conduct, seva, prayer, discipline, and practical action.",
            "proofChips": [
                top_focus["planet"] if top_focus else "Conduct",
                top_focus["priority"] if top_focus else "Seva",
                current.mahadasha,
                current.antardasha,
            ],
            "evidence": top_focus["chartEvidence"] if top_focus else holistic["remedyPriority"][:3],
            "practice": top_focus["practicalAction"] if top_focus else "Choose one conduct correction.",
            "remedy": top_focus["simpleRemedy"] if top_focus else holistic["remedyPriority"][0],
            "bestQuestion": "Explain my Karma Remedy Room with planet, karma pattern, proof, practice, and safety.",
            "relatedPlanets": [top_focus["planet"]] if top_focus else [],
            "relatedHouses": extract_houses_from_evidence(top_focus["chartEvidence"] if top_focus else []),
        },
    ]
    for axis in purushartha["axes"]:
        rooms.append(build_purushartha_room_context(axis, current))
    rooms.append(
        {
            "id": "timing",
            "title": "Timing Room",
            "subtitle": "Dasha, Gochar, and today’s Panchang in one practical room.",
            "tone": "careful" if gochar["dominantWeight"] == "challenging" else "steady",
            "primaryFocus": (
                f"The main timing background is {current.mahadasha}/{current.antardasha}; "
                f"current Gochar is {gochar['dominantWeight']}."
            ),
            "proofChips": [
                f"{current.mahadasha}/{current.antardasha}",
                gochar["dominantWeight"],
                panchang["weekdayLord"],
            ],
            "evidence": [
                f"Current dasha: {current.mahadasha}/{current.antardasha} until {current.endDate}.",
                gochar["snapshotSummary"],
            ],
            "practice": "Use timing as a planning lens: choose one realistic action and one thing to postpone.",
            "remedy": panchang["personalRemedy"],
            "bestQuestion": "Read my Timing Room with dasha, Gochar, today signal, and safe next step.",
            "relatedPlanets": [
                item["planet"] for item in gochar["planetInsights"][:4]
            ],
            "relatedHouses": [
                item["houseFromLagna"] for item in gochar["planetInsights"][:3]
            ],
        }
    )

    return {
        "status": "ready",
        "title": f"{kundli.birthDetails.name}'s holistic reading rooms",
        "subtitle": "Simple rooms for today, karma remedies, life balance, and timing from the same active Kundli.",
        "featuredRoom": rooms[0],
        "rooms": rooms,
        "guardrails": [
            "Rooms combine chart proof, timing, karma pattern, remedy, practical action, and safety boundaries.",
            "No room gives guaranteed outcomes or replaces qualified professional help.",
            "KP and Nadi remain separate schools; these rooms are Parashari holistic rooms.",
        ],
    }


def build_sadhana_remedy_path_context(kundli: KundliData) -> Dict[str, Any]:
    holistic = build_holistic_foundation_context(kundli)
    current = kundli.dasha.current
    focus = (
        holistic["activePlanetFocus"][0]
        if holistic["activePlanetFocus"]
        else None
    )
    planet = focus["planet"] if focus else current.mahadasha
    profile = PLANET_KARMA_REMEDY_MAP.get(planet)
    stages = build_sadhana_stages(focus, profile, 0)

    return {
        "status": "ready",
        "title": f"{kundli.birthDetails.name}'s Sadhana Remedy Path",
        "subtitle": "A staged practice path: conduct, seva, prayer, discipline, lifestyle, and review.",
        "planet": planet,
        "planetReason": focus["whyItMatters"]
        if focus
        else f"{current.mahadasha}/{current.antardasha} is the active timing background.",
        "karmicTheme": focus["karmicPattern"]
        if focus
        else "The active planet shows the karma pattern; the remedy path turns that into daily conduct.",
        "weeklyIntention": (
            f"This week, express {planet} through {profile['higherExpression']}, not {profile['shadowPattern']}."
            if profile
            else f"This week, keep {planet} practical and repeatable."
        ),
        "stages": stages,
        "progressSummary": "Start with Conduct: keep the remedy practical before adding more steps.",
        "reviewQuestions": [
            "Did this practice make my choices calmer or more fearful?",
            "Did I act with more responsibility, humility, and steadiness?",
            "Is this remedy still simple enough to continue without obsession?",
            "Do I need to reduce the practice and focus only on conduct this week?",
        ],
        "guardrails": [
            "Conduct correction comes before mantra count, gemstones, or paid rituals.",
            "Seva should be respectful, affordable, and safe for everyone involved.",
            "Prayer is optional and should fit the user’s devotion style without pressure.",
            "Stop or simplify if the practice increases fear, guilt, obsession, or avoidance.",
            "High-stakes medical, legal, financial, or safety situations still need qualified help.",
        ],
    }


def build_holistic_daily_guidance_context(kundli: KundliData) -> Dict[str, Any]:
    today = date.today()
    panchang = build_personal_panchang_context(kundli)
    sadhana = build_sadhana_remedy_path_context(kundli)
    purushartha = build_purushartha_life_balance_context(kundli)
    gochar = build_transit_gochar_intelligence_context(kundli, "FREE")
    holistic = build_holistic_foundation_context(kundli)
    current = kundli.dasha.current
    active_stage = next(
        (
            stage
            for stage in sadhana["stages"]
            if stage["status"] in ["active", "review"]
        ),
        sadhana["stages"][0] if sadhana["stages"] else None,
    )
    top_focus = (
        holistic["activePlanetFocus"][0]
        if holistic["activePlanetFocus"]
        else None
    )
    primary_gochar = (
        gochar["topOpportunities"][0]
        if gochar["topOpportunities"]
        else gochar["cautionSignals"][0]
        if gochar["cautionSignals"]
        else gochar["planetInsights"][0]
        if gochar["planetInsights"]
        else None
    )
    timing_note = (
        f"{current.mahadasha}/{current.antardasha} is the larger timing background. "
        + (
            f"{primary_gochar['planet']} Gochar is {primary_gochar['weight']} for {primary_gochar.get('meaning', 'current timing')}."
            if primary_gochar
            else gochar["snapshotSummary"]
        )
    )
    sadhana_step = (
        active_stage["practice"]
        if active_stage
        else top_focus["practicalAction"]
        if top_focus
        else "Choose one clean action and keep the practice small."
    )
    remedy = top_focus["simpleRemedy"] if top_focus else panchang["personalRemedy"]

    return {
        "status": "ready",
        "date": today.isoformat(),
        "title": f"{kundli.birthDetails.name}'s holistic daily guidance",
        "subtitle": "A practical daily rhythm from Panchang, dasha, Gochar, Purushartha, and karma-based remedies.",
        "headline": f"Today: {panchang['weekdayLord']} day with {purushartha['dominant']['label']} emphasis.",
        "dailyFocus": panchang["todayFocus"],
        "morningPractice": panchang["personalRemedy"],
        "middayCheck": panchang["bestFor"][0]
        if panchang["bestFor"]
        else "Check whether today's main action is still simple, useful, and realistic.",
        "eveningReview": sadhana["reviewQuestions"][0]
        if sadhana["reviewQuestions"]
        else "Before sleep, ask whether the day made your choices calmer, cleaner, and more responsible.",
        "bestAction": panchang["bestFor"][0]
        if panchang["bestFor"]
        else "Choose one useful task and complete it cleanly.",
        "avoidAction": panchang["avoidFor"][0]
        if panchang["avoidFor"]
        else "Avoid turning timing into fear.",
        "sadhanaStep": sadhana_step,
        "purusharthaFocus": f"{purushartha['dominant']['label']}: {purushartha['dominant']['practicalGuidance']}",
        "timingNote": timing_note,
        "remedy": remedy,
        "blocks": [
            {
                "id": "today-focus",
                "label": "Today focus",
                "headline": f"{panchang['weekdayLord']} sets the daily tone.",
                "body": panchang["todayFocus"],
                "tone": "careful"
                if any(signal["tone"] == "careful" for signal in panchang["signals"])
                else "steady",
                "proofChips": [
                    panchang["weekdayLord"],
                    panchang["tithi"],
                    panchang["moonNakshatra"],
                ],
            },
            {
                "id": "sadhana",
                "label": "Sadhana",
                "headline": f"{active_stage['label']} is the active practice."
                if active_stage
                else "Practice stays practical.",
                "body": sadhana_step,
                "tone": "steady",
                "proofChips": [
                    sadhana.get("planet") or current.mahadasha,
                    "Karma remedy",
                ],
            },
            {
                "id": "balance",
                "label": "Life balance",
                "headline": f"{purushartha['dominant']['label']} leads, {purushartha['needsCare']['label']} needs care.",
                "body": purushartha["summary"],
                "tone": purushartha["dominant"]["tone"],
                "proofChips": [
                    f"{purushartha['dominant']['label']} {purushartha['dominant']['score']}%",
                    f"{purushartha['needsCare']['label']} {purushartha['needsCare']['score']}%",
                ],
            },
            {
                "id": "timing",
                "label": "Timing",
                "headline": "Use timing as planning, not fear.",
                "body": timing_note,
                "tone": "careful"
                if gochar["dominantWeight"] == "challenging"
                else "steady",
                "proofChips": [
                    f"{current.mahadasha}/{current.antardasha}",
                    gochar["dominantWeight"],
                ],
            },
        ],
        "evidence": [
            f"{panchang['weekday']} is ruled by {panchang['weekdayLord']}.",
            f"Personal Panchang: {panchang['tithi']}, Moon rhythm {panchang['moonNakshatra']}.",
            f"Current dasha: {current.mahadasha}/{current.antardasha}.",
            f"Purushartha: {purushartha['dominant']['label']} leads; {purushartha['needsCare']['label']} needs care.",
            (
                f"Gochar: {primary_gochar['planet']} is {primary_gochar['weight']} from Lagna house {primary_gochar['houseFromLagna']}."
                if primary_gochar
                else gochar["snapshotSummary"]
            ),
        ],
        "guardrails": [
            "Use this as daily reflection and planning, not a guaranteed outcome.",
            "High-stakes medical, legal, financial, travel, or safety decisions still need qualified human guidance.",
            "Remedies should stay respectful, affordable, and practical.",
        ],
    }


def build_holistic_decision_timing_context(
    kundli: KundliData,
    chart_context: Optional[ChartContext],
) -> Optional[Dict[str, Any]]:
    if not chart_context or not chart_context.selectedDecisionQuestion:
        return None

    question = chart_context.selectedDecisionQuestion
    area = chart_context.selectedDecisionArea or "general"
    state = chart_context.selectedDecisionState or "wait"
    current = kundli.dasha.current
    gochar = build_transit_gochar_intelligence_context(kundli, "FREE")
    purushartha = build_purushartha_life_balance_context(kundli)
    sadhana = build_sadhana_remedy_path_context(kundli)
    daily = build_holistic_daily_guidance_context(kundli)
    active_stage = next(
        (
            stage
            for stage in sadhana["stages"]
            if stage["status"] in ["active", "review"]
        ),
        sadhana["stages"][0] if sadhana["stages"] else None,
    )
    primary_gochar = (
        gochar["topOpportunities"][0]
        if gochar["topOpportunities"]
        else gochar["cautionSignals"][0]
        if gochar["cautionSignals"]
        else gochar["planetInsights"][0]
        if gochar["planetInsights"]
        else None
    )
    timing_window = (
        f"{str(area).title()} decisions should be tested inside the current "
        f"{current.mahadasha}/{current.antardasha} period, ending {current.endDate}."
    )
    decision_guidance = decision_guidance_for_state(str(state))
    sadhana_support = (
        f"{active_stage['label']}: {active_stage['practice']}"
        if active_stage
        else sadhana["weeklyIntention"]
    )
    purushartha_lens = (
        f"{purushartha['dominant']['label']} leads now. "
        f"{purushartha['needsCare']['label']} needs steadier care."
    )
    risk_boundary = (
        "Use chart timing as planning support, not as a forced outcome. "
        "High-stakes choices need qualified human guidance."
    )
    signals = [
        {
            "id": "decision-state",
            "label": "Decision posture",
            "headline": str(state).replace("-", " ").title(),
            "body": decision_guidance,
            "tone": "careful"
            if state in ["red", "wait", "needs-more-info"]
            else "steady",
            "evidence": [f"Question: {question}", f"Area: {area}"],
        },
        {
            "id": "dasha",
            "label": "Dasha timing",
            "headline": f"{current.mahadasha}/{current.antardasha}",
            "body": timing_window,
            "tone": "steady",
            "evidence": [
                f"Current dasha runs from {current.startDate} to {current.endDate}."
            ],
        },
        {
            "id": "gochar",
            "label": "Gochar weather",
            "headline": (
                f"{primary_gochar['planet']} Gochar is {primary_gochar['weight']}"
                if primary_gochar
                else "Current Gochar snapshot"
            ),
            "body": primary_gochar["practicalGuidance"]
            if primary_gochar
            else gochar["snapshotSummary"],
            "tone": "careful"
            if gochar["dominantWeight"] == "challenging"
            else "steady",
            "evidence": [item["observation"] for item in gochar["evidence"][:2]],
        },
        {
            "id": "purushartha",
            "label": "Life balance",
            "headline": purushartha_lens,
            "body": purushartha["summary"],
            "tone": purushartha["dominant"]["tone"],
            "evidence": purushartha["dominant"]["chartEvidence"][:2],
        },
        {
            "id": "sadhana",
            "label": "Karma remedy",
            "headline": sadhana_support,
            "body": sadhana["karmicTheme"],
            "tone": "steady",
            "evidence": [sadhana["planetReason"], sadhana["weeklyIntention"]],
        },
    ]

    return {
        "status": "ready",
        "title": f"{kundli.birthDetails.name}'s decision timing synthesis",
        "subtitle": "Decision Oracle combined with dasha, Gochar, Purushartha, daily rhythm, and karma-based remedy support.",
        "question": question,
        "area": area,
        "state": state,
        "headline": f"{str(area).title()} timing: use chart proof before the final call.",
        "timingWindow": timing_window,
        "decisionGuidance": decision_guidance,
        "practicalStep": "Take one small reversible step, then review the result.",
        "riskBoundary": risk_boundary,
        "sadhanaSupport": sadhana_support,
        "purusharthaLens": purushartha_lens,
        "dailyAnchor": f"Today: {daily['bestAction']} Avoid: {daily['avoidAction']}",
        "signals": signals,
        "evidence": [
            f"Dasha: {current.mahadasha}/{current.antardasha} until {current.endDate}.",
            gochar["snapshotSummary"],
            f"Purushartha: {purushartha['dominant']['label']} leads; {purushartha['needsCare']['label']} needs care.",
            f"Sadhana: {sadhana['weeklyIntention']}",
        ],
        "guardrails": [
            "Use this as reflective timing and planning support, not a guaranteed outcome.",
            "High-stakes medical, legal, financial, safety, abuse, or emergency choices need qualified human guidance.",
            "Prefer small reversible steps before irreversible commitments.",
            "Remedies should stay respectful, affordable, and practical.",
        ],
    }


def decision_guidance_for_state(state: str) -> str:
    if state == "green":
        return "The timing supports a careful move, but keep it testable first."
    if state == "yellow":
        return "Explore through one small step, then review the result before expanding."
    if state == "red":
        return "Pause, reduce downside, and redesign the choice before acting."
    if state == "needs-more-info":
        return "One missing detail must be clarified before the timing can be trusted."
    return "Do not rush this. Let facts, timing, and qualified guidance become clearer first."


def build_sadhana_stages(
    focus: Optional[Dict[str, Any]],
    profile: Optional[Dict[str, Any]],
    completion_count: int,
) -> List[Dict[str, Any]]:
    conduct = (
        profile.get("simpleRemedy")
        if profile
        else focus["simpleRemedy"]
        if focus
        else "Correct one behavior before adding a ritual."
    )
    seva = (
        "Do one respectful act of service connected to this planet."
        if not profile
        else "Serve the people, beings, or causes connected to this planet respectfully."
    )
    prayer = (
        profile.get("mantraDevotion")
        if profile
        else focus["mantraDevotion"]
        if focus
        else "Use a simple prayer or quiet reflection without fear."
    )
    lifestyle = (
        profile.get("practicalAction")
        if profile
        else focus["practicalAction"]
        if focus
        else "Choose one visible practical action and repeat it."
    )
    stage_inputs = [
        (
            "conduct",
            "Conduct",
            conduct,
            "Jyotish remedies become grounded when the planet’s shadow behavior is corrected first.",
            "Daily",
            "Do this once today before any mantra or ritual.",
            "Do not use remedy to avoid apologizing, correcting behavior, or taking practical responsibility.",
            0,
        ),
        (
            "seva",
            "Seva",
            seva,
            "Seva redirects the planet’s pressure into humility, gratitude, and useful action.",
            "Weekly",
            "Do one clean seva act this week.",
            "Do not humiliate, exploit, or inconvenience the person or being you are serving.",
            1,
        ),
        (
            "mantra-prayer",
            "Prayer",
            prayer,
            "Prayer or mantra steadies attention so the remedy becomes a lived discipline, not superstition.",
            "Weekly",
            "Keep it short and repeatable for 7 days.",
            "No fear chanting, no extreme counts, no pressure to perform devotion in one fixed style.",
            2,
        ),
        (
            "discipline",
            "Discipline",
            "Keep one simple weekly restraint that does not harm health or duty.",
            "Discipline gives the planet a clean channel through routine and restraint.",
            "Weekly",
            "Choose one harmless weekly restraint.",
            "Avoid fasting or austerity if it affects health, medication, pregnancy, work safety, or mental steadiness.",
            3,
        ),
        (
            "lifestyle",
            "Lifestyle",
            lifestyle,
            "A remedy should show up in ordinary life, not only during ritual time.",
            "Weekly",
            "Repeat one habit until the next review.",
            "Keep the habit small enough that it does not become guilt or performance.",
            4,
        ),
        (
            "review",
            "Review",
            "Review whether the practice made choices cleaner, kinder, steadier, and more responsible.",
            "A remedy path needs review so it remains helpful instead of becoming mechanical.",
            "After 4 completions or 30 days",
            "Review after 4 completions or 30 days.",
            "Pause or simplify if the practice increases fear, obsession, or avoidance of real action.",
            4,
        ),
    ]
    stages = []
    for sequence, item in enumerate(stage_inputs, start=1):
        (
            stage_id,
            label,
            practice,
            why_it_works,
            cadence,
            completion_target,
            caution,
            threshold,
        ) = item
        status = (
            "review"
            if stage_id == "review" and completion_count >= threshold
            else "done"
            if completion_count > threshold
            else "active"
            if completion_count == threshold
            else "not-started"
        )
        stages.append(
            {
                "id": stage_id,
                "label": label,
                "sequence": sequence,
                "status": status,
                "practice": practice,
                "whyItWorks": why_it_works,
                "cadence": cadence,
                "completionTarget": completion_target,
                "caution": caution,
            }
        )
    return stages


def build_purushartha_room_context(axis: Dict[str, Any], current: Any) -> Dict[str, Any]:
    return {
        "id": axis["category"],
        "title": f"{axis['label']} Room",
        "subtitle": axis["meaning"],
        "tone": axis["tone"],
        "primaryFocus": axis["currentEmphasis"],
        "proofChips": [
            axis["label"],
            f"{axis['score']}%",
            "Houses " + "/".join(str(item) for item in axis["houses"]),
            f"{current.mahadasha}/{current.antardasha}",
        ],
        "evidence": axis["chartEvidence"][:4],
        "practice": axis["practicalGuidance"],
        "remedy": purushartha_room_remedy(axis["category"]),
        "bestQuestion": f"Explain my {axis['label']} room with chart proof, timing, karma pattern, remedy, and one practical action.",
        "relatedPlanets": [current.mahadasha, current.antardasha],
        "relatedHouses": axis["houses"],
    }


def purushartha_room_remedy(category: str) -> str:
    if category == "dharma":
        return "Respect guidance, study one useful truth, and act according to values."
    if category == "artha":
        return "Keep one money, work, or health responsibility clean and on time."
    if category == "kama":
        return "Keep desire, speech, partnership, and social choices honest."
    return "Protect sleep, silence, home peace, and one release practice."


def extract_houses_from_evidence(evidence: List[str]) -> List[int]:
    houses: List[int] = []
    for line in evidence:
        for match in re.finditer(r"\bhouse\s+(\d{1,2})\b", line, re.IGNORECASE):
            house = int(match.group(1))
            if 1 <= house <= 12 and house not in houses:
                houses.append(house)
    return houses


def build_panchang_today_focus(
    weekday_lord: str,
    moon_nakshatra: str,
    dasha_lord: str,
) -> str:
    if weekday_lord == dasha_lord:
        return (
            f"{weekday_lord} is both day lord and Mahadasha lord, so keep the day focused on "
            f"{DAY_LORD_FOCUS[weekday_lord]}."
        )
    return (
        f"{weekday_lord} sets the daily tone for {DAY_LORD_FOCUS[weekday_lord]}, "
        f"while {dasha_lord} remains the larger life chapter. Moon in {moon_nakshatra} colors the mental rhythm."
    )


def build_panchang_best_for(
    weekday_lord: str,
    moon_nakshatra: str,
    tone: str,
) -> List[str]:
    baseline = [
        " and ".join(DAY_LORD_FOCUS[weekday_lord].split(", ")[:2]),
        f"Moon rhythm work around {moon_nakshatra}",
        "Small commitments you can complete today",
    ]
    if tone == "supportive":
        return ["Starting one clear task", *baseline][:4]
    if tone == "careful":
        return ["Review before action", "Repair and simplify", *baseline][:4]
    return baseline


def build_panchang_avoid_for(weekday_lord: str, tone: str) -> List[str]:
    baseline = [
        "Fear-based prediction",
        "High-stakes decisions without real-world review",
    ]
    if weekday_lord == "Mars":
        baseline.insert(0, "Angry replies and impulsive confrontation")
    elif weekday_lord == "Saturn":
        baseline.insert(0, "Skipping duty, deadlines, or humility")
    else:
        baseline.insert(0, "Overcommitting before checking details")
    if tone == "careful":
        baseline.insert(0, "Rushing because the mind feels pressured")
    return baseline[:4]


def find_transit(kundli: KundliData, planet: str) -> Optional[Any]:
    return next(
        (
            transit
            for transit in kundli.transits
            if transit.planet.lower() == planet.lower()
        ),
        None,
    )


def absolute_transit_longitude(transit: Any) -> float:
    return normalize_degrees(sign_offset(transit.sign) + transit.degree)


def sign_offset(sign: str) -> int:
    try:
        return SIGN_ORDER.index(sign) * 30
    except ValueError:
        return 0


def nakshatra_from_longitude(longitude: float) -> str:
    index = int(normalize_degrees(longitude) / (360 / 27))
    return NAKSHATRA_ORDER[max(0, min(index, len(NAKSHATRA_ORDER) - 1))]


def panchang_tithi_name(moon_longitude: float, sun_longitude: float) -> str:
    elongation = normalize_degrees(moon_longitude - sun_longitude)
    tithi_number = int(elongation / 12) + 1
    names = [
        "Pratipada",
        "Dwitiya",
        "Tritiya",
        "Chaturthi",
        "Panchami",
        "Shashthi",
        "Saptami",
        "Ashtami",
        "Navami",
        "Dashami",
        "Ekadashi",
        "Dwadashi",
        "Trayodashi",
        "Chaturdashi",
        "Purnima",
    ]
    paksha = "Shukla" if tithi_number <= 15 else "Krishna"
    name = (
        names[tithi_number - 1]
        if tithi_number <= 15
        else "Amavasya"
        if tithi_number == 30
        else names[min(13, tithi_number - 16)]
    )
    return f"{paksha} {name}"


def normalize_degrees(value: float) -> float:
    return ((value % 360) + 360) % 360


def build_chalit_bhav_kp_context(
    kundli: KundliData,
    user_plan: str,
) -> Dict[str, Any]:
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    bhav = kundli.bhavChalit
    kp = kundli.kp

    return {
        "status": "ready" if bhav and kp else "partial",
        "depth": depth,
        "schoolBoundary": (
            "Bhav Chalit belongs with Parashari house refinement. KP belongs to KP Predicta and must stay separate unless the user is in KP Predicta context."
        ),
        "bhavChalit": {
            "title": "Bhav Chalit house refinement",
            "rule": "Chalit refines house placement; it does not replace D1 Rashi.",
            "houseSystem": bhav.houseSystem if bhav else None,
            "shifts": [item.model_dump() for item in (bhav.shifts[:9] if bhav else [])],
            "cusps": [item.model_dump() for item in (bhav.cusps[:12] if bhav else [])],
            "limitations": bhav.limitations if bhav else ["Bhav Chalit pending."],
        },
        "kp": {
            "title": "KP Predicta foundation",
            "rule": "KP is a separate Krishnamurti Paddhati school: cusps, star lords, sub lords, significators, ruling planets, and event judgement.",
            "method": kp.method if kp else None,
            "ayanamsa": kp.ayanamsa if kp else None,
            "houseSystem": kp.houseSystem if kp else None,
            "cusps": [item.model_dump() for item in (kp.cusps[:12] if kp else [])],
            "significators": [
                item.model_dump()
                for item in (kp.significators[:9] if kp else [])
            ],
            "rulingPlanets": kp.rulingPlanets.model_dump()
            if kp and kp.rulingPlanets
            else None,
            "horaryNote": kp.horaryNote if kp else None,
            "limitations": kp.limitations if kp else ["KP foundation pending."],
        },
    }


def build_nadi_jyotish_plan_context(
    kundli: KundliData,
    user_plan: str,
    chart_context: Optional[ChartContext] = None,
) -> Dict[str, Any]:
    depth = "PREMIUM" if user_plan == "PREMIUM" else "FREE"
    handoff_question = (
        chart_context.handoffQuestion
        if chart_context and chart_context.handoffQuestion
        else None
    )
    planets = [
        planet
        for planet in kundli.planets
        if planet.name in DASHA_PLANET_THEMES
    ]
    patterns: List[Dict[str, Any]] = []

    for index, first in enumerate(planets):
        for second in planets[index + 1 :]:
            relation = nadi_relation(first, second)
            if not relation:
                continue
            patterns.append(
                {
                    "title": f"{first.name}-{second.name} story link",
                    "planets": [first.name, second.name],
                    "relation": relation,
                    "observation": f"{first.name} in {first.sign} house {first.house} links with {second.name} in {second.sign} house {second.house}.",
                    "meaning": f"{first.name}: {DASHA_PLANET_THEMES.get(first.name)}. {second.name}: {DASHA_PLANET_THEMES.get(second.name)}.",
                    "confidence": "high" if relation == "same-sign" else "medium",
                    "freeInsight": "Useful Nadi-style story marker. Premium is needed for full sequencing, validation, and timing.",
                    "premiumDetail": "Premium Nadi checks this story through validation questions, slow-transit activation, and practical remedy discipline.",
                    "evidence": [
                        f"{first.name}: {first.sign}, house {first.house}, {first.nakshatra}.",
                        f"{second.name}: {second.sign}, house {second.house}, {second.nakshatra}.",
                    ],
                }
            )

    rahu = find_planet(kundli, "Rahu")
    ketu = find_planet(kundli, "Ketu")
    if rahu and ketu:
        patterns.append(
            {
                "title": "Rahu-Ketu karmic axis",
                "planets": ["Rahu", "Ketu"],
                "relation": "rahu-ketu-axis",
                "observation": f"Rahu is house {rahu.house}; Ketu is house {ketu.house}.",
                "meaning": f"Rahu pulls toward {DASHA_HOUSE_MEANINGS.get(rahu.house)} while Ketu asks release around {DASHA_HOUSE_MEANINGS.get(ketu.house)}.",
                "confidence": "medium",
                "freeInsight": "Rahu and Ketu show appetite and release themes.",
                "premiumDetail": "Premium Nadi reads this as a karmic story with transit activation and user validation.",
                "evidence": [
                    f"Rahu: {rahu.sign}, house {rahu.house}.",
                    f"Ketu: {ketu.sign}, house {ketu.house}.",
                ],
            }
        )

    patterns = sorted(
        patterns,
        key=lambda item: {
            "same-sign": 0,
            "rahu-ketu-axis": 1,
            "trine-link": 2,
            "opposition-link": 3,
            "sequence-link": 4,
            "karaka-link": 5,
        }.get(item["relation"], 9),
    )[: 8 if depth == "PREMIUM" else 4]

    current = kundli.dasha.current
    active_pattern = next(
        (
            pattern
            for pattern in patterns
            if current.mahadasha in pattern["planets"]
            or current.antardasha in pattern["planets"]
        ),
        None,
    )
    activations: List[Dict[str, Any]] = []
    if active_pattern:
        activations.append(
            {
                "title": "Current timing touches a Nadi story",
                "trigger": f"{current.mahadasha}/{current.antardasha}",
                "timing": f"{current.startDate} to {current.endDate}",
                "observation": f"Current dasha touches {', '.join(active_pattern['planets'])}.",
                "guidance": "Validate the real-life theme before going into event-level detail.",
            }
        )

    for transit in [
        item
        for item in kundli.transits
        if item.planet in {"Saturn", "Jupiter", "Rahu", "Ketu"}
    ][: 4 if depth == "PREMIUM" else 2]:
        activations.append(
            {
                "title": f"{transit.planet} activation",
                "trigger": f"{transit.planet} in {transit.sign}",
                "timing": transit.calculatedAt,
                "observation": f"{transit.planet} is moving through {transit.sign}, house {transit.houseFromLagna} from Lagna.",
                "guidance": "Use this as timing weather, not a guaranteed event.",
            }
        )

    return {
        "status": "ready",
        "title": f"{kundli.birthDetails.name}'s Nadi Predicta plan",
        "depth": depth,
        "premiumOnly": True,
        "handoffQuestion": handoff_question,
        "schoolBoundary": "Regular Predicta reads Parashari. KP Predicta reads KP. Nadi Predicta reads Nadi-style planetary stories and validation patterns only.",
        "methodSummary": "Nadi Predicta uses planet-to-planet story links, karakas, trinal/opposition/sequence links, Rahu-Ketu axis, validation questions, and timing activation.",
        "freePreview": (
            f"Nadi preview: {patterns[0]['title']} stands out."
            if patterns
            else "Nadi Predicta is ready after Kundli calculation."
        ),
        "premiumSynthesis": (
            f"Premium Nadi sequences {', '.join(item['title'] for item in patterns[:3])} and checks activation before event guidance."
            if depth == "PREMIUM" and patterns
            else None
        ),
        "patterns": patterns,
        "activations": activations,
        "validationQuestions": [
            "Does this theme repeat in cycles rather than as one isolated event?",
            "Is the question mainly about an event, relationship pattern, career/money movement, or spiritual direction?",
            "Which planet story feels true in real life before Predicta goes deeper?",
        ],
        "guardrails": [
            "No fake palm-leaf claim.",
            "No ancient manuscript certainty.",
            "Do not mix Nadi with Parashari or KP in the same answer.",
            "Ask validation questions before strong event statements.",
        ],
        "premiumUnlock": "Premium Nadi unlocks full chart-signature reading, validation questions, karmic story sequencing, transit activation windows, remedies, and a separate Nadi report.",
    }


def nadi_relation(first: Any, second: Any) -> Optional[str]:
    try:
        distance = (SIGN_ORDER.index(second.sign) - SIGN_ORDER.index(first.sign)) % 12
    except ValueError:
        return None
    if distance == 0:
        return "same-sign"
    if distance in {4, 8}:
        return "trine-link"
    if distance == 6:
        return "opposition-link"
    if distance in {1, 11}:
        return "sequence-link"
    if first.house == second.house:
        return "karaka-link"
    return None


def find_planet(kundli: KundliData, name: str) -> Optional[Any]:
    return next(
        (
            planet
            for planet in kundli.planets
            if planet.name.lower() == name.lower()
        ),
        None,
    )


def backend_planet_dasha_evidence(label: str, planet: Optional[Any]) -> Dict[str, str]:
    if not planet:
        return {
            "title": label,
            "observation": "Planet placement unavailable in the compact backend context.",
            "interpretation": "Keep this part broad until placement evidence is available.",
        }

    return {
        "title": label,
        "observation": f"{planet.name} is in {planet.sign}, house {planet.house}, {planet.nakshatra} pada {planet.pada}.",
        "interpretation": f"This activates house {planet.house}: {DASHA_HOUSE_MEANINGS.get(planet.house, 'the linked life area')}.",
    }


def build_backend_dasha_free_insight(
    mahadasha: str,
    antardasha: str,
    end_date: str,
    maha: Optional[Any],
    antar: Optional[Any],
) -> str:
    maha_area = (
        DASHA_HOUSE_MEANINGS.get(maha.house)
        if maha
        else DASHA_PLANET_THEMES.get(mahadasha)
    )
    antar_area = (
        DASHA_HOUSE_MEANINGS.get(antar.house)
        if antar
        else DASHA_PLANET_THEMES.get(antardasha)
    )
    return (
        f"This {mahadasha}/{antardasha} period makes {maha_area} the larger chapter, "
        f"while {antar_area} becomes the active focus until {end_date}."
    )


def build_backend_dasha_premium_synthesis(
    kundli: KundliData,
    maha: Optional[Any],
    antar: Optional[Any],
) -> str:
    maha_line = (
        f"{maha.name} in house {maha.house}, {maha.sign}, {maha.nakshatra}"
        if maha
        else "Mahadasha lord placement unavailable"
    )
    antar_line = (
        f"{antar.name} in house {antar.house}, {antar.sign}, {antar.nakshatra}"
        if antar
        else "Antardasha lord placement unavailable"
    )
    return (
        f"Read {maha_line} as the chapter lord and {antar_line} as the active delivery lord. "
        f"Strong houses {kundli.ashtakavarga.strongestHouses[:3]} can deliver with less friction; "
        f"pressure houses {kundli.ashtakavarga.weakestHouses[:3]} need structure and realistic timing."
    )


def build_ai_context(
    kundli: KundliData,
    chart_context: Optional[ChartContext],
    jyotish_analysis: Any,
    language: str,
    user_plan: str,
) -> Dict[str, Any]:
    allowed_charts = allowed_context_charts(user_plan, chart_context)
    selected_chart = None
    selected_house_focus = None
    selected_planet_focus = None
    selected_timeline_event = None
    selected_decision = None
    selected_decision_synthesis = None
    selected_remedy = None
    birth_time_detective = None
    selected_relationship_mirror = None
    selected_family_karma_map = None
    selected_predicta_wrapped = None

    if (
        chart_context
        and chart_context.chartType
        and chart_context.chartType in allowed_charts
    ):
        selected_chart_data = kundli.charts.get(chart_context.chartType)
        if selected_chart_data:
            selected_chart = compact_chart(selected_chart_data.model_dump())
            if chart_context.selectedHouse:
                selected_house_focus = build_house_focus(
                    selected_chart_data.model_dump(), chart_context.selectedHouse
                )

    if chart_context and chart_context.selectedPlanet:
        selected_planet_focus = build_planet_focus(
            kundli.model_dump(), chart_context.selectedPlanet, allowed_charts
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
        selected_decision_synthesis = build_holistic_decision_timing_context(
            kundli,
            chart_context,
        )

    if chart_context and chart_context.selectedRemedyId:
        selected_remedy = next(
            (
                item.model_dump()
                for item in kundli.remedies
                if item.id == chart_context.selectedRemedyId
            ),
            None,
        )
        if (
            not selected_remedy
            and chart_context.selectedRemedyId.startswith("karmic-")
        ):
            planet = chart_context.selectedRemedyId.replace("karmic-", "").title()
            focus = next(
                (
                    item
                    for item in build_holistic_foundation_context(kundli)[
                        "activePlanetFocus"
                    ]
                    if item["planet"].lower() == planet.lower()
                ),
                None,
            )
            if focus:
                selected_remedy = {
                    "id": chart_context.selectedRemedyId,
                    "title": f"{focus['planet']} karmic remedy",
                    "practice": focus["simpleRemedy"],
                    "rationale": focus["karmicPattern"],
                    "linkedPlanets": [focus["planet"]],
                    "caution": focus["safetyNote"],
                }

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
        "chartAccess": {
            "userPlan": user_plan,
            "allowedChartTypes": sorted(allowed_charts),
            "premiumLockedChartTypes": [],
            "rule": (
                "Premium users receive detailed chart synthesis with D1 anchoring, dasha timing, confidence, remedies, and report-grade depth."
                if user_plan == "PREMIUM"
                else "Free users may open every chart and receive useful insight. Keep the reading concise and avoid premium-level synthesis."
            ),
        },
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
        "mahadashaIntelligence": build_mahadasha_intelligence_context(
            kundli,
            user_plan,
        ),
        "sadeSatiIntelligence": build_sade_sati_intelligence_context(
            kundli,
            user_plan,
        ),
        "transitGocharIntelligence": build_transit_gochar_intelligence_context(
            kundli,
            user_plan,
        ),
        "yearlyHoroscopeVarshaphal": build_yearly_horoscope_varshaphal_context(
            kundli,
            user_plan,
        ),
        "advancedJyotishCoverage": build_advanced_jyotish_coverage_context(
            kundli,
            user_plan,
        ),
        "nadiJyotishPlan": build_nadi_jyotish_plan_context(
            kundli,
            user_plan,
            chart_context,
        ),
        "chalitBhavKpFoundation": build_chalit_bhav_kp_context(
            kundli,
            user_plan,
        ),
        "holisticFoundation": build_holistic_foundation_context(kundli),
        "holisticReadingRooms": build_holistic_reading_rooms_context(kundli),
        "sadhanaRemedyPath": build_sadhana_remedy_path_context(kundli),
        "holisticDailyGuidance": build_holistic_daily_guidance_context(kundli),
        "purusharthaLifeBalance": build_purushartha_life_balance_context(kundli),
        "personalPanchang": build_personal_panchang_context(kundli),
        "ashtakavarga": kundli.ashtakavarga.model_dump(),
        "yogas": [yoga.model_dump() for yoga in kundli.yogas],
        "selectedChart": selected_chart,
        "selectedHouseFocus": selected_house_focus,
        "selectedPlanetFocus": selected_planet_focus,
        "selectedTimelineEvent": selected_timeline_event,
        "selectedDecision": selected_decision,
        "selectedDecisionSynthesis": selected_decision_synthesis,
        "selectedRemedy": selected_remedy,
        "selectedFamilyKarmaMap": selected_family_karma_map,
        "selectedPredictaWrapped": selected_predicta_wrapped,
        "selectedRelationshipMirror": selected_relationship_mirror,
        "coreCharts": {
            chart_type: compact_chart(chart.model_dump())
            for chart_type, chart in kundli.charts.items()
            if chart_type in allowed_charts and chart.supported
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
            "premiumLockedSupported": [],
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
            "Answer in Hinglish with a Hindi tone: Roman/Hindi-friendly wording, natural English Jyotish/product terms, warm and conversational. "
            "Explain terms like Lagna, dasha, gochar/transit, and nakshatra simply."
        )
    if language == "gu":
        return (
            "Answer in natural Gujarati tone with Gujarati/Hinglish-style wording and useful English Jyotish/product terms. "
            "Explain terms like Lagna, dasha, gochar/transit, and nakshatra simply."
        )
    return (
        "Answer in clear English. Explain terms like Lagna, dasha, transit, "
        "and nakshatra in plain language."
    )


def is_high_stakes_message(message: str) -> bool:
    return bool(
        re.search(
            r"\b(health|medical|medicine|doctor|surgery|pregnancy|disease|legal|court|lawsuit|contract|police|tax|finance|financial|invest|investing|investment|savings|stock|crypto|loan|debt|insurance|paisa|paise|money|nana|dhan|karz|udhar|self-harm|suicide|suicidal|violence|violent|abuse|emergency|behavior|behaviour|criminal|crime|psychopath|mental illness|mental health|depression|anxiety|addiction|aggression|anger issue)\b",
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


def build_planet_focus(
    kundli: Dict[str, Any], planet_name: str, allowed_charts: Iterable[str]
) -> Dict[str, Any]:
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
        if chart_type not in allowed_charts:
            continue
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


def allowed_context_charts(
    user_plan: str, chart_context: Optional[ChartContext]
) -> set[str]:
    if user_plan == "PREMIUM":
        return PREMIUM_CONTEXT_CHARTS

    charts = set(FREE_BASE_CONTEXT_CHARTS)
    if chart_context and chart_context.chartType:
        charts.add(chart_context.chartType)
    return charts


def create_openai_text_response(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int,
    reasoning_effort: str,
    safety_identifier: Optional[str] = None,
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
    if safety_identifier:
        payload["safety_identifier"] = safety_identifier

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
    safety_identifier: Optional[str] = None,
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
                safety_identifier=safety_identifier,
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
