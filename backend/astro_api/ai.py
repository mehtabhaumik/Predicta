from __future__ import annotations

import json
import os
import re
from contextvars import ContextVar
from datetime import date
from time import perf_counter
from typing import Any, Dict, Iterable, List, Optional

import httpx

from .ai_telemetry import (
    estimate_tokens,
    hash_ai_subject,
    latency_bucket,
    record_ai_telemetry_event,
)
from .ai_prompt_efficiency import (
    FREE_CHAT_INPUT_TOKEN_BUDGET,
    audit_prompt_budget,
    build_ordered_prompt,
    compact_predicta_context,
    prompt_cache_key,
    structured_output_format,
)
from .ai_routing_policy import (
    AIModelPins,
    select_gemini_fallback_model,
    select_primary_openai_model,
)
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
_CURRENT_PROVIDER_USAGE: ContextVar[Optional[Dict[str, Optional[int]]]] = ContextVar(
    "predicta_current_provider_usage",
    default=None,
)
PREDICTA_CHAT_PROMPT_VERSION = os.getenv(
    "PREDICTA_CHAT_PROMPT_VERSION",
    "predicta-chat-room-contract-v3",
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

MICRO_POINT_GUIDANCE = {
    "Uranus": "sudden change, innovation, disruption, independence, and unusual breaks from routine",
    "Neptune": "imagination, devotion, confusion, dreaminess, subtle sensitivity, and spiritual longing",
    "Pluto": "deep pressure, power, transformation, buried intensity, and rebirth after endings",
    "Gulika": "karmic pressure, discipline, difficult residue, and the house where extra maturity is needed",
    "Mandi": "sensitive karmic heaviness, delay, caution, and a house that should be handled with humility",
    "Dhuma": "heat, smoke, pressure, obscurity, and where clarity may need conscious effort",
    "Vyatipata": "reversal, imbalance, unexpected turns, and the need to avoid extremes",
    "Parivesha": "enclosure, protection, boundaries, and patterns that can feel contained or boxed in",
    "Indrachapa": "desire, projection, atmosphere, and where appearances can mislead unless grounded",
    "Upaketu": "Ketu-like detachment, separation, simplification, and subtle spiritual correction",
}

PADA_MEANINGS = {
    1: "first pada starts the nakshatra energy with initiative and visible expression",
    2: "second pada makes the nakshatra more practical, material, and stabilizing",
    3: "third pada makes the nakshatra communicative, adaptive, and relational",
    4: "fourth pada makes the nakshatra emotional, inward, and completion-oriented",
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

PREDICTA_APP_MEMORY_DIGEST = {
    "productStructure": [
        "Predicta is one product with five specialist rooms: Vedic Predicta, KP Predicta, Jaimini Predicta, Numerology Predicta, and Signature Predicta.",
        "Nadi was replaced by Jaimini; Nadi language may appear only as archived migration history, never as an active user-facing specialist room or live prediction lane.",
        "Shared Kundli/profile context can travel between rooms, but the active room decides the method.",
        "Reports are separated by school lanes; Predicta Life Atlas is the approved synthesis lane.",
    ],
    "coreUserFlows": [
        "create Kundli",
        "open saved Kundlis",
        "ask chat questions",
        "switch specialist rooms",
        "generate and download reports",
        "use remedies",
        "review birth-time confidence",
        "use family and relationship surfaces",
        "use pricing, payment, day-pass, and support flows",
    ],
    "appSurfaceAwareness": [
        "Login and account surfaces explain saved context and recovery calmly.",
        "Settings controls language, saved preferences, and account guidance.",
        "Family Center carries selected family/member context without blame language.",
        "Pricing and payment surfaces explain free, premium, day-pass, and report boundaries honestly.",
        "Payment must never claim paid access until a verified gateway payment or approved support handoff exists.",
        "Support can explain what happened and what data is missing without exposing private internals.",
    ],
    "astrologyCapabilityMap": [
        "Vedic covers D1, Moon, D9, D10, Chalit, full Varga library, Swamsa, Karakamsha, Mahadasha Phala, Panchang, Avakhada, Ghatak, favorable points, friendship, Ashtakavarga, Prastarashtakavarga, house evidence, and remedies.",
        "KP covers event questions with cusps, star lords, sub lords, sub-sub lords, significators, ruling planets, dasha support, timing readiness, confidence, and proof drawer.",
        "Jaimini covers Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, Chara Dasha, soul role, visible identity, and destiny chapters.",
        "Never claim Nadi leaf access, palm-leaf manuscript access, or hidden manuscript authority. Jaimini must stay grounded in calculated Jaimini indicators.",
        "Numerology covers number signature, name rhythm, birth code, personal cycles, missing/repeated patterns, compatibility, name refinement, and no fear guarantees.",
        "Signature covers confirmed visible traits only, privacy/no-storage, confidence, reflective expression guidance, and no forensic or diagnostic claims.",
        "Life Atlas is the approved all-school synthesis using Vedic, KP, Jaimini, Numerology, and optional confirmed Signature evidence.",
    ],
    "reportLanes": [
        "Vedic Reports stay Vedic.",
        "KP Reports stay KP.",
        "Jaimini Reports stay Jaimini.",
        "Numerology Reports stay Numerology unless an approved combination is requested.",
        "Signature Reports stay Signature unless an approved combination is requested.",
        "Synthesis Reports are clearly labeled and include Predicta Life Atlas.",
    ],
    "roomBoundaries": [
        "Vedic answers from Parashari/Vedic only.",
        "KP answers from KP only.",
        "Jaimini answers from Jaimini only.",
        "Numerology answers Numerology-only or explicitly requested Vedic-plus-Numerology.",
        "Signature answers Signature-only or explicitly requested Vedic-plus-Signature.",
        "Wrong-room method requests require a clean handoff instead of a mixed answer.",
    ],
    "deeperContextAwareness": [
        "Predicta may use deeper deterministic data supplied in context even if the immediate UI only shows a compact card.",
        "Predicta must name missing data or pending calculations instead of inventing them.",
        "Free answers stay useful; premium adds deeper evidence, timing, contradiction handling, reports, and practical depth.",
    ],
    "refreshRule": "When routes, pricing, reports, calculations, or specialist-room capabilities change, update this digest before calling the phase green.",
}

PREDICTA_REPORT_SECTION_MEMORY_CATALOG = [
    {
        "id": "moon-chart",
        "title": "Moon chart / Chandra Lagna chart",
        "schoolLane": "VEDIC",
        "calculationState": "available",
        "whatItMeans": "Shows the chart counted from the Moon so mind, emotional rhythm, and lived experience are understood.",
        "boundary": "Vedic-only chart context. Do not answer with KP cusp logic or Jaimini karaka logic.",
    },
    {
        "id": "mahadasha-phala",
        "title": "Mahadasha Phala and Meaning",
        "schoolLane": "VEDIC",
        "calculationState": "available",
        "whatItMeans": "Explains the major life chapter, active delivery channel, and fine timing layer while past periods stay summarized.",
        "boundary": "Vedic-only timing context. Past Mahadashas stay Mahadasha-level; current dasha can be layered.",
    },
    {
        "id": "chalit-table",
        "title": "Chalit table",
        "schoolLane": "VEDIC",
        "calculationState": "available",
        "whatItMeans": "Shows how house delivery can shift in Bhav Chalit even when the D1 sign remains anchored.",
        "boundary": "Vedic Chalit/Bhav Chalit delivery context. Keep it separate from KP cusp judgement.",
    },
    {
        "id": "planet-friendship-table",
        "title": "Planet friendship table",
        "schoolLane": "VEDIC",
        "calculationState": "available",
        "whatItMeans": "Shows how planets cooperate or create friction in the Kundli.",
        "boundary": "Vedic graha relationship table. Explain support and tension without fear language.",
    },
    {
        "id": "signature-traits",
        "title": "Confirmed signature traits",
        "schoolLane": "SIGNATURE",
        "calculationState": "optional",
        "whatItMeans": "Uses only confirmed visible traits from the current session for reflective self-expression guidance.",
        "boundary": "Never infer signature traits without a real uploaded or drawn sample and user confirmation.",
    },
    {
        "id": "life-atlas",
        "title": "Predicta Life Atlas",
        "schoolLane": "SYNTHESIS",
        "calculationState": "available",
        "whatItMeans": "Approved non-technical synthesis for life journey, soul purpose, current chapter, gifts, lessons, and next steps.",
        "boundary": "Use available Vedic, KP, Jaimini, Numerology, and optional confirmed Signature evidence without invented mystical sources.",
    },
]

PREDICTA_ROOM_CONTRACTS: Dict[str, Dict[str, Any]] = {
    "PARASHARI": {
        "roomName": "Vedic Predicta",
        "identity": "Holistic Vedic Jyotish room for Parashari-style chart guidance.",
        "allowedData": [
            "D1/Rashi",
            "Parashari Chalit",
            "supported varga charts",
            "Vimshottari dasha",
            "Gochar/transits",
            "Ashtakavarga",
            "Nakshatra and pada",
            "micro points as secondary support",
            "karma-based remedies",
            "holistic daily and report layers",
        ],
        "proofStyle": [
            "Start from the user question, then cite D1/house/planet/dasha/gochar evidence.",
            "Use KP, Jaimini, Numerology, or Signature only as a handoff unless the user explicitly asks for synthesis.",
            "Separate indication, timing, practical step, and safety boundary.",
        ],
        "safetyBehavior": [
            "No fatalistic certainty.",
            "No medical, legal, financial, or emergency certainty.",
            "Remedies are supportive practices, not guaranteed fixes.",
        ],
        "forbiddenMethods": [
            "KP cusp/sub-lord judgement as the main method",
            "Jaimini claims without calculated karaka, Arudha, Upapada, or Chara Dasha evidence",
            "Numerology-only conclusions",
            "Signature-analysis conclusions",
        ],
        "handoffInstruction": "If the user asks primarily for KP, Jaimini, Numerology, or Signature, answer briefly and offer the correct specialist room with context.",
        "responseShape": [
            "Warm acknowledgement",
            "Direct answer",
            "Chart evidence",
            "Timing or uncertainty",
            "Practical next step",
        ],
    },
    "KP": {
        "roomName": "KP Predicta",
        "identity": "Krishnamurti Paddhati specialist room for event judgement and timing.",
        "allowedData": [
            "KP ayanamsa",
            "Placidus cusps",
            "cusp star lord",
            "cusp sub lord",
            "sub-sub lord",
            "significators",
            "ruling planets",
            "dasha support",
            "event-house logic",
            "horary/prashna context when supplied",
        ],
        "proofStyle": [
            "Name the event question first.",
            "List relevant houses before judgement.",
            "Show cusp/sub-lord/significator proof before the conclusion.",
            "Use Parashari only as a clearly marked comparison if the user asks.",
        ],
        "safetyBehavior": [
            "Never promise a guaranteed event.",
            "State when exact timing needs a sharper event question or horary number.",
            "High-stakes decisions still need qualified human judgement.",
        ],
        "forbiddenMethods": [
            "Parashari yoga reading as the main method",
            "Jaimini karaka or Chara Dasha logic as the main method",
            "Numerology or Signature proof",
        ],
        "handoffInstruction": "If the user asks for broad life reading, suggest Vedic Predicta. If they ask Jaimini/Numerology/Signature, hand off cleanly.",
        "responseShape": [
            "Question understood",
            "Houses involved",
            "KP evidence",
            "Judgement with confidence",
            "Next clarifying step",
        ],
    },
    "JAIMINI": {
        "roomName": "Jaimini Predicta",
        "identity": "Classical Jaimini Jyotish room for soul role, visible identity, career dharma, relationship mirror, and destiny chapters.",
        "allowedData": [
            "Atmakaraka",
            "Amatyakaraka",
            "Darakaraka",
            "Karakamsha",
            "Swamsa",
            "Arudha Lagna",
            "Upapada Lagna",
            "Jaimini sign aspects",
            "Chara Dasha",
            "current destiny chapter",
        ],
        "proofStyle": [
            "Start with the user's soul role or destiny chapter in plain language.",
            "Use Jaimini evidence only when calculated data is available.",
            "Keep dense karaka and dasha details after the answer.",
            "Do not turn Jaimini into KP event judgement or Parashari-only proof.",
        ],
        "safetyBehavior": [
            "No fixed-fate certainty.",
            "No claims without calculated Jaimini evidence.",
            "Keep agency and practical guidance visible.",
        ],
        "forbiddenMethods": [
            "KP cusp/sub-lord judgement",
            "Parashari yoga reading as the main method",
            "Nadi manuscript or story-link claims",
            "Numerology or Signature proof",
        ],
        "handoffInstruction": "If the user asks for KP event timing or full Parashari synthesis, offer KP or Vedic Predicta with context.",
        "responseShape": [
            "Soul role or destiny direction",
            "Visible identity or relationship mirror",
            "Jaimini evidence when available",
            "Current focus",
            "Practical next step",
        ],
    },
    "NADI": {
        "roomName": "Jaimini Predicta",
        "identity": "Legacy Nadi route alias. Treat this as Jaimini Predicta and never present Nadi as an active specialist room.",
        "allowedData": [
            "Atmakaraka",
            "Amatyakaraka",
            "Darakaraka",
            "Karakamsha",
            "Swamsa",
            "Arudha",
            "Upapada",
            "Jaimini aspects",
            "Chara Dasha",
        ],
        "proofStyle": [
            "Start with soul role, visible identity, career dharma, relationship mirror, or destiny chapter in plain language.",
            "Use calculated Jaimini evidence only when available.",
            "Keep dense karaka and Chara Dasha detail after the answer.",
            "Explain that old Nadi routes now lead to Jaimini if the user asks.",
        ],
        "safetyBehavior": [
            "No Nadi leaf or palm-leaf manuscript claims.",
            "No ancient manuscript certainty.",
            "No destiny-lock language.",
        ],
        "forbiddenMethods": [
            "KP cusp/sub-lord judgement",
            "Parashari yoga reading as the main method",
            "Numerology or Signature proof",
        ],
        "handoffInstruction": "If the user asks for event timing by KP or full Vedic synthesis, offer KP or Vedic Predicta with context. If they ask for Nadi, explain that Predicta now uses Jaimini instead.",
        "responseShape": [
            "Soul role or destiny direction",
            "Visible identity or relationship mirror",
            "Jaimini evidence when available",
            "Current focus",
            "Practical next step",
        ],
    },
    "NUMEROLOGY": {
        "roomName": "Numerology Predicta",
        "identity": "Numerology specialist room for name and DOB number guidance.",
        "allowedData": [
            "name number",
            "birth number",
            "destiny/life-path number",
            "personal year",
            "personal month",
            "personal day",
            "name spelling rhythm",
            "current name versus candidate spelling comparison",
            "compatibility numbers when supplied",
        ],
        "proofStyle": [
            "Show the actual numbers used before interpreting.",
            "Separate name expression, birth instinct, destiny direction, and current cycle.",
            "For name correction, compare current spelling and candidate spelling before advising.",
            "For compatibility, calculate both people only when partner DOB is supplied; otherwise ask for it.",
            "Do not invent missing name variants or partner data.",
        ],
        "safetyBehavior": [
            "Treat numerology as reflective guidance.",
            "No guaranteed outcomes from number changes.",
            "No pressure to change legal names.",
        ],
        "forbiddenMethods": [
            "Parashari/KP/Nadi claims as the main proof",
            "Signature traits unless explicit synthesis is requested",
        ],
        "handoffInstruction": "If the user asks for chart timing, hand off to Vedic or KP. If they ask signature expression, hand off to Signature Predicta.",
        "responseShape": [
            "Numbers used",
            "What they mean",
            "Current cycle",
            "Practical guidance",
            "Optional synthesis offer",
        ],
    },
    "SIGNATURE": {
        "roomName": "Signature Predicta",
        "identity": "Signature analysis specialist room for reflective self-expression guidance.",
        "allowedData": [
            "uploaded or drawn signature",
            "user-confirmed visual traits",
            "baseline",
            "slant",
            "pressure",
            "readability",
            "spacing",
            "underline",
            "capital emphasis",
            "signature size",
            "writing rhythm",
            "confidence expression",
            "consistency pattern",
            "improvement plan",
            "optional numerology synthesis when requested",
        ],
        "proofStyle": [
            "Use only visible or user-confirmed signature traits.",
            "Explain each trait as a soft tendency, not a fixed truth.",
            "When traits are supplied, summarize rhythm, confidence expression, consistency, and one practical improvement.",
            "Give safe improvement suggestions without fear or shame.",
        ],
        "safetyBehavior": [
            "No identity verification.",
            "No handwriting forensics.",
            "No legal proof.",
            "No medical or mental-health diagnosis.",
            "No hiring or character-certainty claims.",
        ],
        "forbiddenMethods": [
            "Parashari/KP/Nadi chart proof as the main method",
            "Numerology unless explicit synthesis is requested",
        ],
        "handoffInstruction": "If the user asks for birth-chart timing, hand off to Vedic or KP. If they ask name numbers, hand off to Numerology Predicta.",
        "responseShape": [
            "Traits observed",
            "Reflective meaning",
            "Strengths",
            "Care points",
            "One practical improvement",
        ],
    },
}

PREDICTA_ROOM_ROUTES: Dict[str, str] = {
    "PARASHARI": "/dashboard/vedic/chat",
    "KP": "/dashboard/kp/chat",
    "JAIMINI": "/dashboard/jaimini/chat",
    "NADI": "/dashboard/nadi/chat",
    "NUMEROLOGY": "/dashboard/numerology/chat",
    "SIGNATURE": "/dashboard/signature/chat",
}

PREDICTA_ROOM_LABELS: Dict[str, str] = {
    "PARASHARI": "Vedic Predicta",
    "KP": "KP Predicta",
    "JAIMINI": "Jaimini Predicta",
    "NADI": "Nadi Predicta",
    "NUMEROLOGY": "Numerology Predicta",
    "SIGNATURE": "Signature Predicta",
}

DISCIPLINE_DETECTION_PATTERNS: Dict[str, List[re.Pattern[str]]] = {
    "KP": [
        re.compile(pattern, re.I)
        for pattern in [
            r"\bkp\b",
            r"krishnamurti|krishnamurthy|paddhati",
            r"cuspal\s*sub|sub\s*lord|sublord|significator|ruling\s*planet",
            r"\bhorary\b|\bprashna\b|\b249\b",
        ]
    ],
    "JAIMINI": [
        re.compile(pattern, re.I)
        for pattern in [
            r"\bjaimini\b",
            r"atmakaraka|amatyakaraka|darakaraka|karakamsha|swamsa",
            r"arudha|upapada|chara\s*dasha|jaimini\s*aspect",
        ]
    ],
    "NADI": [
        re.compile(pattern, re.I)
        for pattern in [
            r"\bnadi\b|\bnaadi\b",
            r"planet(?:ary)?\s*story|story\s*link|karaka\s*theme|karmic\s*axis",
            r"palm\s*leaf|agastya",
        ]
    ],
    "NUMEROLOGY": [
        re.compile(pattern, re.I)
        for pattern in [
            r"numerology|ank\s*jyotish|ankjyotish|ank\s*shastra",
            r"name\s*number|birth\s*number|destiny\s*number|life\s*path",
            r"personal\s*(year|month|day)|moolank|mulank|bhagyank|naam\s*ank",
            r"name\s*correction|name\s*vibration|number\s*reading",
        ]
    ],
    "SIGNATURE": [
        re.compile(pattern, re.I)
        for pattern in [
            r"signature|autograph|hastakshar|sahi",
            r"handwriting\s*signature|signature\s*analysis|signature\s*reading",
            r"signature\s*improvement|signature\s*change",
        ]
    ],
    "PARASHARI": [
        re.compile(pattern, re.I)
        for pattern in [
            r"\bvedic\b|parashari|parashara|jyotish",
            r"\bd1\b|rashi|kundli|horoscope|lagna|varga|d9|d10",
            r"mahadasha|antar\s*dasha|vimshottari|gochar|transit|sade\s*sati",
            r"yoga|dosha|nakshatra|pada|parashari\s*chalit|chart\s*proof",
        ]
    ],
}

DISCIPLINE_SYNTHESIS_PATTERN = re.compile(
    r"\b(compare|comparison|synthesis|synthesise|synthesize|combine|cross[-\s]?check|together|both|all\s+methods)\b",
    re.I,
)

DEVOTIONAL_SIGNAL_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"\bmahadev\b|\bbholenath\b|\bshiv\b|\bshiva\b|\bom\s+namah\s+shivaya\b",
        r"\bkrishna\b|\bradhe\b|\bradhe\s+radhe\b|\bjai\s+shree\s+ram\b|\bsita\s+ram\b",
        r"\bhanuman\b|\bbajrang\b|\bganesh\b|\bmata\s+rani\b|\bmaa\s+durga\b",
        r"\bpuja\b|\bpooja\b|\bmantra\b|\bjapa\b|\bjaap\b|\bprasad\b|\bmandir\b|\bvrat\b|\bupay\b|\bupaay\b",
        r"\bblessing\b|\bkripa\b|\bkrupa\b|\bdarshan\b",
    ]
]

SECULAR_SIGNAL_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"\bsecular\b|\bpractical\s+only\b|\bno\s+religious\b|\bno\s+remedy\b|\bno\s+ritual\b",
        r"\bwithout\s+(god|religion|mantra|puja|ritual)\b",
        r"\bnon[-\s]?hindu\b|\bnot\s+hindu\b|\bi\s+am\s+(atheist|agnostic|christian|muslim|jain|sikh|buddhist|parsi)\b",
        r"\bdon['’]?t\s+use\s+(god|deity|religious|hindu)\b|\bkeep\s+it\s+non[-\s]?religious\b",
    ]
]

STRESS_SIGNAL_PATTERNS = [
    ("panic wording", re.compile(r"\b(panic|panicking|terrified|scared|fear|afraid|desperate|helpless|stressed|anxious|anxiety|worried|worry)\b", re.I)),
    ("urgency wording", re.compile(r"\b(urgent|asap|right now|immediately|please tell me now|today itself|abhi|jaldi)\b", re.I)),
    ("doom framing", re.compile(r"\b(ruined|finished|over for me|nothing will work|never happen|worst|hopeless|doomed)\b", re.I)),
    ("reassurance seeking", re.compile(r"\b(please tell me|be honest|say clearly|just tell me|again and again|still not|why me)\b", re.I)),
]

HUMOR_BAN_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"\b(grief|death|dying|terminal|cancer|hospital|surgery|suicide|self-harm|bankrupt|bankruptcy|divorce|separation|miscarriage|abuse|assault)\b",
        r"\b(financial distress|loan pressure|debt trap|court case|police case)\b",
    ]
]

DISAPPOINTMENT_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"\b(still no|still not|not happening|again failed|again rejected|you said|last time you said|but nothing changed)\b",
        r"\b(why not me|why is it not working|i thought it would|it did not happen)\b",
    ]
]


class AIConfigurationError(RuntimeError):
    pass


class AIProviderError(RuntimeError):
    pass


def normalize_predicta_school(chart_context: Optional[ChartContext]) -> str:
    if not chart_context or not chart_context.predictaSchool:
        return "PARASHARI"
    school = chart_context.predictaSchool.upper()
    if school in PREDICTA_ROOM_CONTRACTS:
        return school
    return "PARASHARI"


def build_predicta_room_contract(
    chart_context: Optional[ChartContext],
) -> Dict[str, Any]:
    school = normalize_predicta_school(chart_context)
    contract = PREDICTA_ROOM_CONTRACTS[school]
    return {
        **contract,
        "activeSchool": school,
        "contractRule": (
            "This room contract is authoritative for this answer. Use shared user "
            "profile and Kundli context, but keep method-specific reasoning inside "
            "the active room. If the user asks for another method, answer briefly "
            "and hand off instead of mixing methods."
        ),
    }


def detect_requested_predicta_school(message: str) -> Optional[str]:
    if not message or DISCIPLINE_SYNTHESIS_PATTERN.search(message):
        return None

    for school in ["KP", "JAIMINI", "NADI", "NUMEROLOGY", "SIGNATURE", "PARASHARI"]:
        if any(pattern.search(message) for pattern in DISCIPLINE_DETECTION_PATTERNS[school]):
            return school

    return None


def build_discipline_handoff_context(
    chart_context: Optional[ChartContext],
    message: str,
) -> Dict[str, Any]:
    active_school = normalize_predicta_school(chart_context)
    requested_school = detect_requested_predicta_school(message)
    original_question = (
        chart_context.handoffQuestion
        if chart_context and chart_context.handoffQuestion
        else message
    )
    requires_handoff = bool(
        requested_school and requested_school != active_school
    )

    target_school = requested_school if requires_handoff else active_school

    return {
        "activeSchool": active_school,
        "activeRoom": PREDICTA_ROOM_LABELS[active_school],
        "detectedRequestedSchool": requested_school,
        "requiresHandoff": requires_handoff,
        "targetSchool": target_school,
        "targetRoom": PREDICTA_ROOM_LABELS[target_school],
        "targetRoute": PREDICTA_ROOM_ROUTES[target_school],
        "originalQuestion": original_question,
        "rule": (
            "If requiresHandoff is true, do not answer with the active room's method. "
            "Give a short boundary, preserve the original question, and send the user "
            "to targetRoom with the same profile/Kundli context."
        ),
    }


def build_deterministic_discipline_handoff_reply(
    handoff: Dict[str, Any],
    language: str,
) -> str:
    if not handoff.get("requiresHandoff"):
        return ""

    active_room = handoff["activeRoom"]
    target_room = handoff["targetRoom"]
    route = handoff["targetRoute"]
    question = handoff["originalQuestion"]

    if language == "hi":
        return "\n\n".join(
            [
                f"यह प्रश्न {target_room} के लिए ज़्यादा सही है। इसे {active_room} के अंदर मिलाकर जवाब नहीं देना चाहिए।",
                f"मूल प्रश्न: {question}",
                f"{target_room} खोलें: {route}",
                "मैं वही Kundli और profile context साथ रखूंगी, लेकिन method अलग रहेगा।",
            ]
        )
    if language == "gu":
        return "\n\n".join(
            [
                f"આ પ્રશ્ન {target_room} માટે વધુ યોગ્ય છે। તેને {active_room} માં મિક્સ કરીને જવાબ આપવો યોગ્ય નથી.",
                f"મૂળ પ્રશ્ન: {question}",
                f"{target_room} ખોલો: {route}",
                "હું એ જ Kundli અને profile context સાથે રાખીશ, પરંતુ method અલગ રહેશે.",
            ]
        )

    return "\n\n".join(
        [
            f"This belongs in {target_room}, not inside {active_room}.",
            f"Original question: {question}",
            f"Open {target_room}: {route}",
            "I will carry the same Kundli/profile context, but the method will stay separate.",
        ]
    )


def build_predicta_tone_context(
    message: str,
    history: Iterable[Any],
    chart_context: Optional[ChartContext],
    style_preference: str = "balanced",
) -> Dict[str, Any]:
    recent_user_turns = [
        turn.text
        for turn in list(history)[-6:]
        if getattr(turn, "role", None) == "user" and getattr(turn, "text", None)
    ]
    combined_text = " ".join([*recent_user_turns, message]).strip()
    school = normalize_predicta_school(chart_context)
    stress_level, stress_signals = detect_predicta_stress_profile(
        message,
        recent_user_turns,
        combined_text,
    )
    support_style, support_reason = detect_predicta_support_style(
        combined_text,
        style_preference,
    )
    needs_consolation = any(
        pattern.search(combined_text) for pattern in DISAPPOINTMENT_PATTERNS
    )
    high_stakes = is_high_stakes_message(message)
    humor_policy = "avoid"
    if (
        stress_level == "low"
        and not high_stakes
        and not any(pattern.search(combined_text) for pattern in HUMOR_BAN_PATTERNS)
    ):
        humor_policy = "light-only"
    if stress_level == "high" or high_stakes:
        humor_policy = "avoid"
    room_tone = build_predicta_room_tone_profile(school)

    return {
        "answerCadence": "brief-grounded" if high_stakes else "human-grounded",
        "answerWarmth": "steady-comfort" if needs_consolation else "steady-clear",
        "confidenceFrame": "bounded" if high_stakes else "normal",
        "highStakesGuardrailMode": high_stakes,
        "highStakesModeReason": (
            "The user asked about a high-stakes topic, so the answer must be calmer, more bounded, and more practical."
            if high_stakes
            else "No high-stakes guardrail escalation was required."
        ),
        "stressLevel": stress_level,
        "stressSignals": stress_signals,
        "stylePreference": style_preference,
        "supportStyle": support_style,
        "supportStyleReason": support_reason,
        "allowDevotionalPhrasing": support_style == "devotional" and not high_stakes,
        "avoidDevotionalPhrasing": support_style == "secular" or high_stakes,
        "humorPolicy": humor_policy,
        "needsConsolation": needs_consolation,
        "headlineStyle": "short-first" if stress_level == "high" else "balanced",
        "gentleLandingNeeded": stress_level == "high" or needs_consolation,
        "remedyGuardrail": (
            "Prefer practical reflection, communication, professional support, and simple routine stabilizers before devotional or ritual remedies."
            if high_stakes
            else "Simple remedies are allowed when chart-grounded and culturally appropriate."
        ),
        "roomTone": room_tone,
        "historyPressurePattern": (
            "repeated-user-pressure"
            if len(recent_user_turns) >= 2 and stress_level in {"medium", "high"}
            else "single-turn"
        ),
    }


def detect_predicta_support_style(
    text: str,
    style_preference: str = "balanced",
) -> tuple[str, str]:
    if any(pattern.search(text) for pattern in SECULAR_SIGNAL_PATTERNS):
        return (
            "secular",
            "The user explicitly asked for practical or non-religious guidance.",
        )
    if any(pattern.search(text) for pattern in DEVOTIONAL_SIGNAL_PATTERNS):
        return (
            "devotional",
            "The user used devotional language or asked for Hindu-style remedies.",
        )
    if style_preference == "secular":
        return (
            "secular",
            "The user saved a secular Predicta style preference.",
        )
    if style_preference == "devotional":
        return (
            "devotional",
            "The user saved a devotional Predicta style preference.",
        )
    return (
        "warm-neutral",
        "No reliable devotional or secular preference signal was present, so Predicta should stay balanced and neutral.",
    )


def detect_predicta_stress_profile(
    message: str,
    recent_user_turns: List[str],
    combined_text: str,
) -> tuple[str, List[str]]:
    signals: List[str] = []
    for label, pattern in STRESS_SIGNAL_PATTERNS:
        if pattern.search(combined_text):
            signals.append(label)
    if message.count("?") >= 2:
        signals.append("repeated questions")
    if re.search(r"[!?]{2,}", message):
        signals.append("urgent punctuation")
    uppercase_chars = [char for char in message if char.isalpha() and char.isupper()]
    alpha_chars = [char for char in message if char.isalpha()]
    if alpha_chars and len(uppercase_chars) >= 6 and len(uppercase_chars) / len(alpha_chars) >= 0.45:
        signals.append("all-caps emphasis")
    if len(recent_user_turns) >= 2 and sum(turn.count("?") for turn in recent_user_turns[-2:]) >= 3:
        signals.append("looping follow-up pressure")

    unique_signals = list(dict.fromkeys(signals))
    if len(unique_signals) >= 3:
        return ("high", unique_signals)
    if len(unique_signals) >= 1:
        return ("medium", unique_signals)
    return ("low", [])


def build_predicta_room_tone_profile(school: str) -> Dict[str, str]:
    profiles = {
        "PARASHARI": {
            "identity": "Seasoned Vedic guide with karma, dharma, timing, and steady remedies.",
            "proofRule": "Lead with the chart judgement, then explain karma pattern, proof, timing, and one simple remedy.",
        },
        "KP": {
            "identity": "Calm KP specialist who keeps judgement crisp and event-focused.",
            "proofRule": "Lead with the event answer, then cusp, star lord, sub lord, significator, and timing caution.",
        },
        "JAIMINI": {
            "identity": "Calm Jaimini specialist who reads soul role, visible identity, and destiny chapters without crowding the user.",
            "proofRule": "Lead with the destiny guidance, then karaka, Arudha, Upapada, and Chara Dasha evidence when available.",
        },
        "NADI": {
            "identity": "Reflective Nadi guide who validates the planet story before strong claims.",
            "proofRule": "Lead with the story pattern, then show planetary links, validation questions, and one reflective practice.",
        },
        "NUMEROLOGY": {
            "identity": "Friendly numbers guide who explains what the numbers mean without mystical fog.",
            "proofRule": "Show the actual numbers first, then the meaning, current cycle, and one practical use.",
        },
        "SIGNATURE": {
            "identity": "Observant signature guide who stays reflective and non-forensic.",
            "proofRule": "Describe visible traits first, then meaning, care point, and one grounded improvement step.",
        },
    }
    return profiles.get(school, profiles["PARASHARI"])


def ask_pridicta(request: PridictaChatRequest) -> PridictaChatResponse:
    telemetry_started_at = perf_counter()
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
        request.message,
        request.history,
        request.predictaStylePreference,
    )
    room_contract = build_predicta_room_contract(request.chartContext)
    context["predictaRoomContract"] = room_contract
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
        blocked_text = blocked_safety_reply(request.language, safety)
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
        record_ai_telemetry_event(
            active_school=normalize_predicta_school(request.chartContext),
            cache_state="bypass",
            estimated_input_tokens=estimate_tokens(request.message),
            estimated_output_tokens=estimate_tokens(blocked_text),
            fallback_reason="safety-blocked",
            feature="chat",
            intent=intent,
            latency_bucket_value=latency_bucket(telemetry_started_at),
            model="predicta-safety-protocol-v1",
            provider="deterministic",
            route="/ask-pridicta",
            subject_hash=hash_ai_subject(
                [request.kundli.id, request.kundli.calculationMeta.inputHash]
            ),
            success=True,
            user_plan=request.userPlan,
        )
        return PridictaChatResponse(
            text=blocked_text,
            provider="deterministic",
            model="predicta-safety-protocol-v1",
            intent=intent,
            usedDeepModel=False,
            jyotishAnalysis=jyotish_analysis,
            safetyCategories=blocked_categories,
            safetyBlocked=True,
        )

    fallback_reason: Optional[str] = None
    chat_prompt_cache_key = prompt_cache_key(
        "chat",
        PREDICTA_CHAT_PROMPT_VERSION,
        normalize_predicta_school(request.chartContext),
        request.language,
        intent,
    )
    budget_audit = audit_prompt_budget(
        prompt=prompt,
        budget_tokens=FREE_CHAT_INPUT_TOKEN_BUDGET
        if request.userPlan == "FREE"
        else FREE_CHAT_INPUT_TOKEN_BUDGET * 2,
        label="free chat" if request.userPlan == "FREE" else "premium chat",
    )
    try:
        text, provider, actual_model = create_ai_text_response(
            model=model,
            system_prompt=build_pridicta_system_prompt(),
            user_prompt=prompt,
            max_output_tokens=max_output_tokens,
            reasoning_effort="medium" if intent == "deep" else "low",
            prompt_cache_key=chat_prompt_cache_key,
            safety_identifier=safety_identifier,
        )
        provider_usage = current_provider_usage()
    except (AIConfigurationError, AIProviderError):
        text = build_deterministic_chart_reply(request, jyotish_analysis)
        provider = "deterministic"
        actual_model = "jyotish-deterministic-v1"
        fallback_reason = "provider-unavailable-deterministic-fallback"
        provider_usage = None

    if not text.strip():
        text = build_deterministic_chart_reply(request, jyotish_analysis)
        provider = "deterministic"
        actual_model = "jyotish-deterministic-v1"
        fallback_reason = "empty-provider-output-deterministic-fallback"

    if provider == "gemini" and not fallback_reason:
        fallback_reason = "openai-unavailable-gemini-fallback"

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
        fallback_reason = "output-safety-rewrite"

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
    record_ai_telemetry_event(
        active_school=normalize_predicta_school(request.chartContext),
        cache_state=(
            "hit"
            if provider_usage and provider_usage.get("cached_input")
            else "miss"
        ),
        estimated_input_tokens=estimate_tokens(prompt),
        estimated_output_tokens=estimate_tokens(text),
        fallback_reason=fallback_reason,
        feature="chat",
        intent=intent,
        latency_bucket_value=latency_bucket(telemetry_started_at),
        model=actual_model,
        prompt_cache_key=chat_prompt_cache_key,
        provider_cached_input_tokens=(
            provider_usage.get("cached_input") if provider_usage else None
        ),
        provider_input_tokens=(
            provider_usage.get("input") if provider_usage else None
        ),
        provider_output_tokens=(
            provider_usage.get("output") if provider_usage else None
        ),
        provider=provider,
        route="/ask-pridicta",
        subject_hash=hash_ai_subject(
            [request.kundli.id, request.kundli.calculationMeta.inputHash]
        ),
        success=True,
        user_plan=request.userPlan,
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
    handoff = build_discipline_handoff_context(request.chartContext, request.message)
    if handoff.get("requiresHandoff"):
        return build_deterministic_discipline_handoff_reply(
            handoff,
            request.language,
        )

    school = (
        request.chartContext.predictaSchool.upper()
        if request.chartContext and request.chartContext.predictaSchool
        else ""
    )
    if school == "KP":
        return build_deterministic_kp_reply(request)
    if school == "NADI":
        return build_deterministic_nadi_reply(request)
    if school == "NUMEROLOGY":
        return build_deterministic_numerology_reply(request)
    if school == "SIGNATURE":
        return build_deterministic_signature_reply(request)

    current_date = date.today()
    one_year_later = add_one_year(current_date)
    area = analysis.areaAnalyses[0] if analysis.areaAnalyses else None
    evidence = analysis.evidence[:4]
    timing_needed = bool(re.search(r"\b(next|year|future|when|timing|after)\b", request.message, re.I))
    safety_needed = is_high_stakes_message(request.message)
    tone_context = build_predicta_tone_context(
        request.message,
        request.history,
        request.chartContext,
    )
    holistic = build_holistic_foundation_context(request.kundli)
    purushartha = build_purushartha_life_balance_context(request.kundli)
    top_focus = holistic["activePlanetFocus"][0] if holistic["activePlanetFocus"] else None

    if request.language == "hi":
        intro = "मैं सीधी बात पहले रखती हूं।"
        if tone_context["stressLevel"] == "high":
            intro = "मैं आपकी घबराहट समझ रही हूं, इसलिए सीधी बात पहले रखती हूं।"
        elif tone_context["supportStyle"] == "devotional":
            intro = "शांत मन से देखें, chart डर से ज़्यादा साफ बोलता है।"
        elif tone_context["supportStyle"] == "secular":
            intro = "मैं इसे शांत, तथ्य-आधारित और practical रखूंगी।"
        direct = localized_area_summary(area.area if area else "general", area.confidence if area else "medium", "hi")
        confidence = f"विश्वास स्तर: {area.confidence if area else 'medium'}."
        karma = (
            f"कर्म संकेत: {top_focus['karmicPattern']}"
            if top_focus
            else "कर्म संकेत: इस समय steady conduct और practical responsibility सबसे ज़्यादा सहारा देंगे।"
        )
        balance = f"पुरुषार्थ संकेत: {purushartha['summary']}"
        timing = (
            f"समय संकेत: अगले 1 साल की window {current_date.isoformat()} से {one_year_later.isoformat()} तक मानी है."
            if timing_needed
            else "समय संकेत: exact month के लिए dasha और transit overlap को और narrow करना पड़ेगा."
        )
        safety = (
            "Safety: medical, legal, financial या emergency decision के लिए qualified professional की सलाह ज़रूर लें."
            if safety_needed
            else ""
        )
        practical = area.practicalFocus[0] if area and area.practicalFocus else "एक practical step चुनिए और उस पर steady action रखिए."
        remedy = (
            f"सरल उपाय दिशा: {top_focus['simpleRemedy']}"
            if top_focus
            else "सरल उपाय दिशा: conduct correction, seva, और simple routine से शुरुआत करें।"
        )
        landing = (
            "यह उत्तर शायद मनचाहा नहीं लगे, लेकिन chart बंद रास्ता नहीं दिखा रहा; यह सिर्फ सही लय और धैर्य मांग रहा है।"
            if tone_context["gentleLandingNeeded"]
            else ""
        )
        return "\n\n".join(
            [
                intro,
                direct,
                confidence,
                karma,
                balance,
                "Chart proof:\n"
                + "\n".join(
                    f"- {item.title}: {item.interpretation}" for item in evidence
                ),
                timing,
                remedy,
                safety,
                f"अगला कदम: {practical}",
                landing,
            ]
        ).strip()

    if request.language == "gu":
        intro = "હું સીધી વાત પહેલા મૂકીશ."
        if tone_context["stressLevel"] == "high":
            intro = "હું તમારી ગભરામણ સમજી શકું છું, તેથી સીધી વાત પહેલા મૂકીશ."
        elif tone_context["supportStyle"] == "devotional":
            intro = "શાંતિથી જોઈએ, chart ડર કરતાં વધુ સ્પષ્ટ બોલે છે."
        elif tone_context["supportStyle"] == "secular":
            intro = "હું આને શાંત, તથ્ય આધારિત અને practical રાખીશ."
        direct = localized_area_summary(area.area if area else "general", area.confidence if area else "medium", "gu")
        confidence = f"વિશ્વાસ સ્તર: {area.confidence if area else 'medium'}."
        karma = (
            f"કર્મ સંકેત: {top_focus['karmicPattern']}"
            if top_focus
            else "કર્મ સંકેત: આ સમયમાં steady conduct અને practical responsibility સૌથી મોટો આધાર બનશે."
        )
        balance = f"પુરુષાર્થ સંકેત: {purushartha['summary']}"
        timing = (
            f"સમય સંકેત: આગામી 1 વર્ષની window {current_date.isoformat()} થી {one_year_later.isoformat()} સુધી ગણવી."
            if timing_needed
            else "સમય સંકેત: exact month માટે dasha અને transit overlap વધુ narrow કરવો પડશે."
        )
        safety = (
            "Safety: medical, legal, financial અથવા emergency decision માટે qualified professional ની સલાહ લો."
            if safety_needed
            else ""
        )
        practical = area.practicalFocus[0] if area and area.practicalFocus else "એક practical step લો અને steady action રાખો."
        remedy = (
            f"સરળ ઉપાય દિશા: {top_focus['simpleRemedy']}"
            if top_focus
            else "સરળ ઉપાય દિશા: conduct correction, seva અને simple routine થી શરૂઆત કરો."
        )
        landing = (
            "આ જવાબ કદાચ મનગમતો ન લાગે, પરંતુ chart બંધ દરવાજો બતાવતું નથી; તે ફક્ત યોગ્ય લય અને ધીરજ માંગે છે."
            if tone_context["gentleLandingNeeded"]
            else ""
        )
        return "\n\n".join(
            [
                intro,
                direct,
                confidence,
                karma,
                balance,
                "Chart proof:\n"
                + "\n".join(
                    f"- {item.title}: {item.interpretation}" for item in evidence
                ),
                timing,
                remedy,
                safety,
                f"આગલું પગલું: {practical}",
                landing,
            ]
        ).strip()

    intro = "I will give you the straight answer first and keep it chart-grounded."
    if tone_context["stressLevel"] == "high":
        intro = "I can hear the pressure, so let me give you the straight answer first."
    elif tone_context["supportStyle"] == "devotional":
        intro = "Let us read this steadily. The chart is clearer than the fear."
    elif tone_context["supportStyle"] == "secular":
        intro = "I hear the concern. I will keep this calm, factual, and practical."
    direct = area.summary if area else "The chart shows mixed but useful signals."
    confidence = f"Confidence: {area.confidence if area else 'medium'}."
    karma = (
        f"Karma pattern: {top_focus['karmicPattern']}"
        if top_focus
        else "Karma pattern: the chart is asking for steadier conduct, cleaner choices, and practical follow-through."
    )
    balance = f"Purushartha balance: {purushartha['summary']}"
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
    remedy = (
        f"Simple remedy direction: {top_focus['simpleRemedy']}"
        if top_focus
        else "Simple remedy direction: start with conduct correction, small service, and a steady routine."
    )
    landing = (
        "This may not be the answer you wanted, but it is not a hopeless chart signal. It asks for better timing and steadier effort, not panic."
        if tone_context["gentleLandingNeeded"]
        else ""
    )
    return "\n\n".join(
        [
            intro,
            direct,
            confidence,
            karma,
            balance,
            "Chart evidence:\n"
            + "\n".join(f"- {item.title}: {item.interpretation}" for item in evidence),
            timing,
            remedy,
            safety,
            f"Next step: {practical}",
            landing,
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


def build_deterministic_numerology_reply(request: PridictaChatRequest) -> str:
    question = (
        request.chartContext.handoffQuestion
        if request.chartContext and request.chartContext.handoffQuestion
        else request.message
    )
    profile = build_numerology_foundation_context(
        request.kundli,
        question,
        request.language,
    )
    question_context = profile.get("questionContext", {})
    proof = "\n".join(f"- {item}" for item in profile["evidence"][:3])
    strengths = ", ".join(profile["strengths"][:4])
    cautions = ", ".join(profile["cautions"][:3])
    focus = question_context.get("focus")

    if focus == "name-correction" and question_context.get("nameCorrection"):
        correction = question_context["nameCorrection"]
        if request.language == "hi":
            return "\n\n".join(
                [
                    "Numerology Predicta मोड। मैं इसे नाम-संख्या मार्गदर्शन तक रखूंगी, किसी पक्के जीवन-परिणाम के वादे की तरह नहीं।",
                    f"आपका प्रश्न: {question}",
                    (
                        f"वर्तमान नाम: {correction['currentName']} की नाम संख्या "
                        f"{correction['currentNameNumber']['root']} "
                        f"({correction['currentNameNumber']['label']}) है।"
                    ),
                    (
                        f"सुझाया गया नाम: {correction['candidateName']} की नाम संख्या "
                        f"{correction['candidateNameNumber']['root']} "
                        f"({correction['candidateNameNumber']['label']}) है।"
                    ),
                    f"वर्तमान नाम का स्वभाव: {correction['currentMeaning']}",
                    f"नए नाम का स्वभाव: {correction['candidateMeaning']}",
                    f"इसे कैसे समझें: {correction['recommendation']}",
                    "सुरक्षा सीमा: केवल numerology के आधार पर कानूनी नाम न बदलें। वर्तनी परिवर्तन को सहायक संकेत मानें और देखें कि वह व्यवहारिक जीवन में कैसा बैठता है।",
                    "Premium depth कई वर्तनी विकल्प, व्यक्तिगत वर्ष की टाइमिंग, और रिपोर्ट-योग्य नाम-लय मानचित्र दे सकती है।",
                ]
            ).strip()
        if request.language == "gu":
            return "\n\n".join(
                [
                    "Numerology Predicta મોડ। હું આને નામ-અંક માર્ગદર્શન સુધી જ રાખીશ, કોઈ ખાતરીવાળા જીવનપરિણામની રીતે નહીં।",
                    f"તમારો પ્રશ્ન: {question}",
                    (
                        f"હાલનું નામ: {correction['currentName']}નો નામ અંક "
                        f"{correction['currentNameNumber']['root']} "
                        f"({correction['currentNameNumber']['label']}) છે।"
                    ),
                    (
                        f"સૂચવાયેલ નામ: {correction['candidateName']}નો નામ અંક "
                        f"{correction['candidateNameNumber']['root']} "
                        f"({correction['candidateNameNumber']['label']}) છે।"
                    ),
                    f"હાલના નામનો સ્વભાવ: {correction['currentMeaning']}",
                    f"નવા નામનો સ્વભાવ: {correction['candidateMeaning']}",
                    f"આને કેવી રીતે વાપરવું: {correction['recommendation']}",
                    "સુરક્ષા સીમા: માત્ર numerology પરથી કાનૂની નામ ન બદલો. સ્પેલિંગ ફેરફારને સહાયક સંકેત માનો અને જુઓ કે તે વાસ્તવિક જીવનમાં કેટલો સુસંગત લાગે છે।",
                    "Premium depth અનેક સ્પેલિંગ વિકલ્પો, વ્યક્તિગત વર્ષની timing અને report-ready નામ લય નકશો આપી શકે છે।",
                ]
            ).strip()
        return "\n\n".join(
            [
                "Numerology Predicta mode. I will keep this as name-number guidance, not a guaranteed life fix.",
                f"Your question: {question}",
                (
                    f"Current name: {correction['currentName']} gives name number "
                    f"{correction['currentNameNumber']['root']} "
                    f"({correction['currentNameNumber']['label']})."
                ),
                (
                    f"Suggested spelling: {correction['candidateName']} gives name number "
                    f"{correction['candidateNameNumber']['root']} "
                    f"({correction['candidateNameNumber']['label']})."
                ),
                f"Current name tone: {correction['currentMeaning']}",
                f"Candidate name tone: {correction['candidateMeaning']}",
                f"How to use this: {correction['recommendation']}",
                "Safety: do not change legal names from numerology alone. Treat spelling changes as reflective support and test how the name feels in real life.",
                "Premium depth can compare several spellings, personal year timing, and a report-ready name rhythm map.",
            ]
        ).strip()

    if focus == "compatibility":
        compatibility = question_context.get("compatibility") or question_context
        if compatibility.get("status") == "needs_partner_data":
            if request.language == "hi":
                return "\n\n".join(
                    [
                        "Numerology Predicta मोड। मैं compatibility देख सकती हूं, लेकिन सामने वाले व्यक्ति का data मैं बना कर नहीं दूंगी।",
                        f"आपका प्रश्न: {question}",
                        (
                            f"आपके मूल अंक: नाम {profile['nameNumber']['root']}, "
                            f"जन्म {profile['birthNumber']['root']}, भाग्य {profile['destinyNumber']['root']}।"
                        ),
                        "दूसरे व्यक्ति का पूरा नाम और जन्म तिथि भेजें। तब मैं नाम संख्या, जन्म संख्या, भाग्य संख्या, और वर्तमान व्यक्तिगत टाइमिंग लय की तुलना कर सकती हूं।",
                        "सुरक्षा सीमा: compatibility numbers केवल pattern fit और friction points दिखाते हैं। वे अपने आप रिश्ते का अंतिम फैसला नहीं करते।",
                    ]
                ).strip()
            if request.language == "gu":
                return "\n\n".join(
                    [
                        "Numerology Predicta મોડ। હું compatibility જોઈ શકું છું, પણ બીજા વ્યક્તિનું data બનાવી નહીં દઉં।",
                        f"તમારો પ્રશ્ન: {question}",
                        (
                            f"તમારા મૂળ અંક: નામ {profile['nameNumber']['root']}, "
                            f"જન્મ {profile['birthNumber']['root']}, ભાગ્ય {profile['destinyNumber']['root']}।"
                        ),
                        "બીજા વ્યક્તિનું પૂરું નામ અને જન્મ તારીખ મોકલો. પછી હું નામ અંક, જન્મ અંક, ભાગ્ય અંક અને હાલની વ્યક્તિગત timing rhythm ની તુલના કરી શકું।",
                        "સુરક્ષા સીમા: compatibility numbers ફક્ત pattern fit અને friction points બતાવે છે. તેઓ એકલા સંબંધનો આખરી નિર્ણય કરતા નથી।",
                    ]
                ).strip()
            return "\n\n".join(
                [
                    "Numerology Predicta mode. I can do compatibility, but I will not invent the other person's data.",
                    f"Your question: {question}",
                    (
                        f"Your base numbers: name {profile['nameNumber']['root']}, "
                        f"birth {profile['birthNumber']['root']}, destiny {profile['destinyNumber']['root']}."
                    ),
                    "Send the other person's full name and date of birth. Then I can compare name number, birth number, destiny number, and the current personal timing rhythm.",
                    "Safety: compatibility numbers show pattern fit and friction points. They do not decide a relationship by themselves.",
                ]
            ).strip()
        partner = compatibility.get("partner", {})
        if request.language == "hi":
            return "\n\n".join(
                [
                    "Numerology Predicta मोड। मैं दिए गए अंकों की तुलना करूंगी और इसे pattern guidance तक रखूंगी।",
                    f"आपका प्रश्न: {question}",
                    (
                        f"आपके अंक: नाम {profile['nameNumber']['root']}, "
                        f"जन्म {profile['birthNumber']['root']}, भाग्य {profile['destinyNumber']['root']}।"
                    ),
                    (
                        f"{partner.get('name', 'Partner')}: "
                        f"जन्म {partner.get('birthNumber', {}).get('root')}, "
                        f"भाग्य {partner.get('destinyNumber', {}).get('root')}"
                        + (
                            f", नाम {partner.get('nameNumber', {}).get('root')}"
                            if partner.get("nameNumber")
                            else ""
                        )
                        + "।"
                    ),
                    f"मेल का स्वर: {compatibility.get('tone')}",
                    f"समर्थन बिंदु: {compatibility.get('support')}",
                    f"सावधानी बिंदु: {compatibility.get('care')}",
                    "अगला सही कदम: केवल अंकों के आधार पर भावनात्मक या पारिवारिक फैसला लेने से पहले संवाद की लय और समय-चक्र को भी साथ में देखें।",
                ]
            ).strip()
        if request.language == "gu":
            return "\n\n".join(
                [
                    "Numerology Predicta મોડ। હું આપવામાં આવેલા અંકોની તુલના કરીશ અને આને pattern guidance સુધી જ રાખીશ।",
                    f"તમારો પ્રશ્ન: {question}",
                    (
                        f"તમારા અંક: નામ {profile['nameNumber']['root']}, "
                        f"જન્મ {profile['birthNumber']['root']}, ભાગ્ય {profile['destinyNumber']['root']}।"
                    ),
                    (
                        f"{partner.get('name', 'Partner')}: "
                        f"જન્મ {partner.get('birthNumber', {}).get('root')}, "
                        f"ભાગ્ય {partner.get('destinyNumber', {}).get('root')}"
                        + (
                            f", નામ {partner.get('nameNumber', {}).get('root')}"
                            if partner.get("nameNumber")
                            else ""
                        )
                        + "।"
                    ),
                    f"મેળનો સ્વર: {compatibility.get('tone')}",
                    f"સમર્થન બિંદુ: {compatibility.get('support')}",
                    f"સાવચેતી બિંદુ: {compatibility.get('care')}",
                    "આગલું યોગ્ય પગલું: માત્ર અંકો પરથી લાગણીસભર કે કુટુંબ સંબંધિત નિર્ણય લેતા પહેલાં સંવાદની લય અને સમયચક્રને પણ સાથે જુઓ।",
                ]
            ).strip()
        return "\n\n".join(
            [
                "Numerology Predicta mode. I will compare the supplied numbers and keep this as pattern guidance.",
                f"Your question: {question}",
                (
                    f"Your numbers: name {profile['nameNumber']['root']}, "
                    f"birth {profile['birthNumber']['root']}, destiny {profile['destinyNumber']['root']}."
                ),
                (
                    f"{partner.get('name', 'Partner')}: "
                    f"birth {partner.get('birthNumber', {}).get('root')}, "
                    f"destiny {partner.get('destinyNumber', {}).get('root')}"
                    + (
                        f", name {partner.get('nameNumber', {}).get('root')}"
                        if partner.get("nameNumber")
                        else ""
                    )
                    + "."
                ),
                f"Compatibility tone: {compatibility.get('tone')}",
                f"Support: {compatibility.get('support')}",
                f"Care point: {compatibility.get('care')}",
                "Best next step: compare communication rhythm and timing before making emotional or family decisions from numbers alone.",
            ]
        ).strip()

    if request.language == "hi":
        return "\n\n".join(
            [
                "Numerology Predicta मोड। जब तक आप अलग पद्धति का संयुक्त पठन न मांगें, मैं इसे नाम और जन्मतिथि के अंकों के भीतर रखूंगी।",
                f"आपका प्रश्न: {question}",
                (
                    f"{profile['name']}: नाम संख्या {profile['nameNumber']['root']} "
                    f"({profile['nameNumber']['label']}), जन्म संख्या {profile['birthNumber']['root']} "
                    f"({profile['birthNumber']['label']}), भाग्य संख्या {profile['destinyNumber']['root']} "
                    f"({profile['destinyNumber']['label']})।"
                ),
                (
                    f"वर्तमान लय: व्यक्तिगत वर्ष {profile['personalYear']['root']}, "
                    f"माह {profile['personalMonth']['root']}, दिन {profile['personalDay']['root']}।"
                ),
                f"उपयोगी संकेत: {profile['summary']}",
                f"ताकतें: {strengths}" if strengths else "",
                f"ध्यान रखने योग्य बातें: {cautions}" if cautions else "",
                "अंक-आधार:\n" + proof if proof else "",
                "मुफ्त स्तर उपयोगी insight देता है। Premium depth वर्तनी तुलना, वार्षिक और मासिक timing, compatibility numbers, और polished numerology report जोड़ती है।",
            ]
        ).strip()
    if request.language == "gu":
        return "\n\n".join(
            [
                "Numerology Predicta મોડ। તમે અલગ પદ્ધતિનું સંયુક્ત વાંચન ન માંગો ત્યાં સુધી હું આને નામ અને જન્મતારીખના અંકોની અંદર જ રાખીશ।",
                f"તમારો પ્રશ્ન: {question}",
                (
                    f"{profile['name']}: નામ અંક {profile['nameNumber']['root']} "
                    f"({profile['nameNumber']['label']}), જન્મ અંક {profile['birthNumber']['root']} "
                    f"({profile['birthNumber']['label']}), ભાગ્ય અંક {profile['destinyNumber']['root']} "
                    f"({profile['destinyNumber']['label']})।"
                ),
                (
                    f"હાલની લય: વ્યક્તિગત વર્ષ {profile['personalYear']['root']}, "
                    f"મહિનો {profile['personalMonth']['root']}, દિવસ {profile['personalDay']['root']}।"
                ),
                f"ઉપયોગી સંકેત: {profile['summary']}",
                f"શક્તિઓ: {strengths}" if strengths else "",
                f"ધ્યાનમાં રાખવાના મુદ્દા: {cautions}" if cautions else "",
                "અંક આધાર:\n" + proof if proof else "",
                "મફત સ્તર ઉપયોગી insight આપે છે। Premium depth spelling comparison, yearly/monthly timing, compatibility numbers, અને polished numerology report ઉમેરે છે।",
            ]
        ).strip()
    return "\n\n".join(
        [
            "Numerology Predicta mode. I will keep this inside name and DOB numbers unless you ask for a cross-method synthesis.",
            f"Your question: {question}",
            (
                f"{profile['name']}: name number {profile['nameNumber']['root']} "
                f"({profile['nameNumber']['label']}), birth number {profile['birthNumber']['root']} "
                f"({profile['birthNumber']['label']}), destiny number {profile['destinyNumber']['root']} "
                f"({profile['destinyNumber']['label']})."
            ),
            (
                f"Current rhythm: personal year {profile['personalYear']['root']}, "
                f"month {profile['personalMonth']['root']}, day {profile['personalDay']['root']}."
            ),
            f"Useful insight: {profile['summary']}",
            f"Strengths: {strengths}" if strengths else "",
            f"Care points: {cautions}" if cautions else "",
            "Number proof:\n" + proof if proof else "",
            "Free depth gives useful insight. Premium depth adds spelling comparison, yearly/monthly timing, compatibility numbers, and a polished numerology report.",
        ]
    ).strip()


def build_deterministic_signature_reply(request: PridictaChatRequest) -> str:
    question = (
        request.chartContext.handoffQuestion
        if request.chartContext and request.chartContext.handoffQuestion
        else request.message
    )
    analysis = build_signature_analysis_context(question, request.language)
    if analysis["status"] == "ready":
        trait_line = ", ".join(
            f"{trait.get('displayLabel', trait['label'])} {trait.get('valueLabel', trait['value'])}"
            for trait in analysis["observedTraits"]
        )
        if request.language == "hi":
            return "\n\n".join(
                [
                    "हस्ताक्षर प्रेडिक्टा मोड। मैं केवल पुष्टि किए गए दिखने वाले संकेतों से पढ़ूंगी, छिपी पहचान या दस्तावेज़ की प्रामाणिकता का अनुमान नहीं लगाऊंगी।",
                    f"आपका प्रश्न: {question}",
                    f"देखे गए संकेत: {trait_line}।",
                    f"लिखावट की लय: {analysis['rhythm']['summary']}",
                    f"आत्म-अभिव्यक्ति का भरोसा: {analysis['confidenceExpression']['summary']}",
                    f"स्थिरता: {analysis['consistency']['summary']}",
                    "सुधार योजना:\n"
                    + "\n".join(
                        f"- {item}" for item in analysis["improvementPlan"][:4]
                    ),
                    f"वैकल्पिक संयुक्त सार: {analysis['synthesisReadiness']['rule']}",
                    "सुरक्षा सीमा: यह आत्म-अभिव्यक्ति पर आधारित चिंतन है। यह पहचान सत्यापन, हस्तलेखन जांच, कानूनी प्रमाण, चिकित्सा निदान, भर्ती सलाह या पक्की भविष्यवाणी नहीं है।",
                ]
            )
        if request.language == "gu":
            return "\n\n".join(
                [
                    "હસ્તાક્ષર પ્રેડિક્ટા મોડ। હું માત્ર પુષ્ટિ કરેલા દેખાતા સંકેતો પરથી વાંચીશ, છુપાયેલી ઓળખ કે દસ્તાવેજની અસલિયતનો અંદાજ નહીં લગાવું।",
                    f"તમારો પ્રશ્ન: {question}",
                    f"જોવાયેલા સંકેતો: {trait_line}।",
                    f"લખવાની લય: {analysis['rhythm']['summary']}",
                    f"આત્મ-અભિવ્યક્તિનો વિશ્વાસ: {analysis['confidenceExpression']['summary']}",
                    f"સ્થિરતા: {analysis['consistency']['summary']}",
                    "સુધાર યોજના:\n"
                    + "\n".join(
                        f"- {item}" for item in analysis["improvementPlan"][:4]
                    ),
                    f"વૈકલ્પિક સંયુક્ત સાર: {analysis['synthesisReadiness']['rule']}",
                    "સુરક્ષા સીમા: આ આત્મ-અભિવ્યક્તિ પર આધારિત પ્રતિબિંબ છે. આ ઓળખ ચકાસણી, હસ્તલેખન તપાસ, કાનૂની પુરાવો, તબીબી નિદાન, ભરતી સલાહ કે ખાતરીવાળી આગાહી નથી।",
                ]
            )
        return "\n\n".join(
            [
                "Signature Predicta mode. I will read only from confirmed visible signature traits, not hidden identity or document authenticity.",
                f"Your question: {question}",
                "Traits observed: " + trait_line + ".",
                f"Writing rhythm: {analysis['rhythm']['summary']}",
                f"Confidence expression: {analysis['confidenceExpression']['summary']}",
                f"Consistency: {analysis['consistency']['summary']}",
                "Improvement plan:\n"
                + "\n".join(f"- {item}" for item in analysis["improvementPlan"][:4]),
                f"Optional synthesis: {analysis['synthesisReadiness']['rule']}",
                "Safety: this is reflective self-expression guidance. It is not identity verification, handwriting forensics, legal proof, medical diagnosis, hiring advice, or a guaranteed prediction.",
            ]
        )

    return "\n\n".join(
        [
            (
                "हस्ताक्षर प्रेडिक्टा मोड। मैं इसे चिंतन-आधारित हस्ताक्षर विश्लेषण के भीतर रखूंगी।"
                if request.language == "hi"
                else "હસ્તાક્ષર પ્રેડિક્ટા મોડ। હું આને પ્રતિબિંબ આધારિત હસ્તાક્ષર વિશ્લેષણની અંદર રાખીશ।"
                if request.language == "gu"
                else "Signature Predicta mode. I will keep this inside reflective signature analysis."
            ),
            (
                f"आपका प्रश्न: {question}"
                if request.language == "hi"
                else f"તમારો પ્રશ્ન: {question}"
                if request.language == "gu"
                else f"Your question: {question}"
            ),
            (
                "विधि सीमा: हस्ताक्षर प्रेडिक्टा केवल अपलोड किए गए, बनाए गए या आपके द्वारा पुष्टि किए गए दिखने वाले संकेतों का उपयोग करती है। यह वैदिक चार्ट प्रमाण, कृष्णमूर्ति पद्धति का निर्णय, नाड़ी पठन, अंक ज्योतिष, पहचान सत्यापन, हस्तलेखन जांच, कानूनी प्रमाण, चिकित्सा निदान या भर्ती सलाह नहीं है।"
                if request.language == "hi"
                else "પદ્ધતિ સીમા: હસ્તાક્ષર પ્રેડિક્ટા માત્ર અપલોડ કરેલા, દોરેલા અથવા તમારી દ્વારા પુષ્ટિ કરેલા દેખાતા સંકેતોનો ઉપયોગ કરે છે. આ વૈદિક ચાર્ટ પુરાવો, કૃષ્ણમૂર્તિ પદ્ધતિનો નિર્ણય, નાડી વાંચન, અંક જ્યોતિષ, ઓળખ ચકાસણી, હસ્તલેખન તપાસ, કાનૂની પુરાવો, તબીબી નિદાન કે ભરતી સલાહ નથી।"
                if request.language == "gu"
                else "Method boundary: Signature Predicta uses only uploaded, drawn, or user-confirmed visual traits. It is not Vedic chart proof, KP judgement, Nadi pattern reading, numerology, identity verification, handwriting forensics, legal proof, medical diagnosis, or hiring advice."
            ),
            (
                "मुझे क्या चाहिए: साफ हस्ताक्षर छवि, बनाया गया हस्ताक्षर, या पुष्टि किए गए संकेत जैसे आधार रेखा, झुकाव, दबाव, पढ़ने की स्पष्टता, अंतर, अंडरलाइन, बड़े अक्षर का जोर और हस्ताक्षर का आकार।"
                if request.language == "hi"
                else "મને શું જોઈએ: સ્પષ્ટ સહી છબી, દોરેલી સહી, અથવા પુષ્ટિ કરેલા સંકેતો જેમ કે આધાર રેખા, ઝુકાવ, દબાણ, વાંચવાની સ્પષ્ટતા, અંતર, અંડરલાઇન, મોટા અક્ષરનો ભાર અને સહીનું કદ।"
                if request.language == "gu"
                else "What I need: a clear signature image, a drawn signature, or confirmed traits such as baseline, slant, pressure, readability, spacing, underline, capital emphasis, and signature size."
            ),
            (
                "अभी उपयोगी जवाब: मैं बता सकती हूं कि हर संकेत आमतौर पर क्या दिखाता है और कौन-सी सुरक्षित सुधार आदतें मदद करती हैं। मैं स्वभाव, भविष्य, स्वास्थ्य या कानूनी पहचान पर पक्के दावे नहीं करूंगी।"
                if request.language == "hi"
                else "હમણાં ઉપયોગી જવાબ: હું સમજાવી શકું છું કે દરેક સંકેત સામાન્ય રીતે શું બતાવે છે અને કઈ સુરક્ષિત સુધાર પ્રેક્ટિસ મદદ કરે છે. હું સ્વભાવ, ભવિષ્ય, આરોગ્ય કે કાનૂની ઓળખ વિશે પક્કા દાવા નહીં કરું।"
                if request.language == "gu"
                else "Useful answer now: I can explain what each trait usually reflects and suggest safe improvement practices. I will not make fixed claims about character, future events, health, or legal identity."
            ),
            (
                "अगला कदम: हाल का स्वाभाविक हस्ताक्षर अपलोड या बनाएं, या वे दिखने वाले संकेत बताएं जिन्हें आप मुझसे पढ़वाना चाहते हैं।"
                if request.language == "hi"
                else "આગલું પગલું: તાજી સ્વાભાવિક સહી અપલોડ કરો અથવા દોરો, અથવા કયા દેખાતા સંકેતો હું વાંચું તે જણાવો।"
                if request.language == "gu"
                else "Next step: upload or draw a recent natural signature, or tell me the visible traits you want me to read."
            ),
        ]
    )


SIGNATURE_TRAIT_RULES: Dict[str, Dict[str, Any]] = {
    "baseline": {
        "label": "Baseline",
        "values": {
            "upward": ("forward-moving public style", ["hope", "ambition", "momentum"], "Keep ambition practical."),
            "steady": ("grounded presentation and controlled pacing", ["stability", "follow-through"], "Stay flexible when life changes."),
            "mixed": ("changing confidence or uneven pacing", ["adaptability", "range"], "Ground important decisions."),
            "downward": ("cautious or emotionally loaded expression", ["sensitivity", "realism"], "Watch tired timing and finishing energy."),
        },
    },
    "capital emphasis": {
        "label": "Capital emphasis",
        "values": {
            "high": ("strong identity projection", ["presence", "confidence"], "Avoid dominance or over-control."),
            "medium": ("balanced public identity", ["balance", "measured confidence"], "Be direct when stakes are high."),
            "low": ("modest presentation or privacy", ["humility", "softness"], "Do not shrink your voice."),
        },
    },
    "flourish": {
        "label": "Flourish",
        "values": {
            "expansive": ("expressive image awareness", ["style", "charisma"], "Avoid over-decoration."),
            "moderate": ("controlled style and social polish", ["taste", "presentation skill"], "Keep the simple message visible."),
            "none": ("direct practical communication", ["clarity", "simplicity"], "Do not undersell strengths."),
        },
    },
    "legibility": {
        "label": "Legibility",
        "aliases": ["readability"],
        "values": {
            "clear": ("open and direct self-presentation", ["transparency", "directness"], "Keep healthy privacy."),
            "partial": ("a mix of openness and guardedness", ["discernment", "controlled openness"], "Clarify expectations."),
            "abstract": ("private shorthand or protected public self", ["privacy", "style"], "Make intent clear when trust matters."),
        },
    },
    "letter connection": {
        "label": "Letter connection",
        "aliases": ["connection", "letters"],
        "values": {
            "connected": ("continuity and relational thinking", ["flow", "relationship awareness"], "Pause before commitments."),
            "mixed": ("switching between flow and analysis", ["flexibility", "range"], "Set clear priorities."),
            "disconnected": ("independent thinking and boundaries", ["independence", "analysis"], "Avoid unnecessary isolation."),
        },
    },
    "space use": {
        "label": "Space use",
        "aliases": ["margin use", "margin"],
        "values": {
            "balanced": ("measured presence", ["proportion", "social awareness"], "Adapt to the setting."),
            "compact": ("restraint and economical self-expression", ["focus", "discipline"], "Do not become too invisible."),
            "expansive": ("larger presence and visible mark", ["presence", "boldness"], "Support visibility with follow-through."),
        },
    },
    "pressure": {
        "label": "Pressure",
        "values": {
            "heavy": ("intensity and strong effort", ["determination", "commitment"], "Use recovery time."),
            "medium": ("balanced energy and controlled effort", ["balance", "stamina"], "Stress can still shift expression."),
            "light": ("sensitivity and lower confrontation", ["gentleness", "adaptability"], "Use firmer boundaries when needed."),
        },
    },
    "signature size": {
        "label": "Signature size",
        "aliases": ["size"],
        "values": {
            "large": ("confidence and stronger public presence", ["visibility", "leadership"], "Keep confidence grounded."),
            "medium": ("balanced public presence", ["balance", "adaptability"], "Take a clear stand when needed."),
            "small": ("privacy and selective visibility", ["focus", "precision"], "Do not hide strengths."),
        },
    },
    "slant": {
        "label": "Slant",
        "values": {
            "right": ("outward expression and social movement", ["warmth", "initiative"], "Keep boundaries."),
            "steady": ("measured response and emotional control", ["control", "objectivity"], "Avoid suppression."),
            "mixed": ("different styles in different contexts", ["range", "adaptability"], "Slow down under pressure."),
            "left": ("reserved and reflective expression", ["reflection", "privacy"], "Accept support when needed."),
        },
    },
    "spacing": {
        "label": "Spacing",
        "values": {
            "balanced": ("healthy room between identity and connection", ["balance", "clear pacing"], "Support it with real boundaries."),
            "tight": ("urgency or compact thinking", ["focus", "speed"], "Add breathing room."),
            "wide": ("independence and personal room", ["perspective", "boundary awareness"], "Do not become distant."),
        },
    },
    "writing rhythm": {
        "label": "Writing rhythm",
        "aliases": ["speed", "rhythm"],
        "values": {
            "fast": ("quick response and fast thought", ["quickness", "initiative"], "Slow down for commitments."),
            "moderate": ("controlled pace and balanced response", ["pace control", "consistency"], "Rest when workload grows."),
            "slow": ("careful and deliberate action", ["patience", "precision"], "Avoid hesitation."),
        },
    },
    "underline": {
        "label": "Underline",
        "values": {
            "high": ("strong assertion and reinforced identity", ["assertion", "self-belief"], "Stay humble and clear."),
            "single": ("steady self-support and completion", ["focus", "completion"], "Let action support the mark."),
            "none": ("clean self-presentation", ["simplicity", "ease"], "Use visible confidence when needed."),
        },
    },
}


def build_signature_analysis_context(
    message: str,
    language: str = "en",
) -> Dict[str, Any]:
    traits = extract_signature_traits_from_text(message)
    if not traits:
        return {
            "status": "pending",
            "observedTraits": [],
            "prompt": pending_signature_prompt(language),
            "safetyBoundaries": signature_safety_boundaries(language),
        }

    localized_traits = localize_signature_traits(traits, language)
    rhythm = build_signature_rhythm(traits, language)
    confidence = build_signature_confidence_expression(traits, language)
    consistency = build_signature_consistency(traits, language)
    improvement_plan = build_signature_improvement_plan(
        traits,
        rhythm,
        confidence,
        consistency,
        language,
    )
    strengths = unique_ordered(
        strength
        for trait in traits
        for strength in trait["strengths"]
    )[:7]
    cautions = unique_ordered(
        trait.get("displayCaution", trait["caution"]) for trait in localized_traits
    )[:5]

    return {
        "cautions": cautions,
        "confidenceExpression": confidence,
        "consistency": consistency,
        "evidence": [
            build_signature_evidence_line(trait, language)
            for trait in localized_traits
        ],
        "improvementPlan": improvement_plan,
        "observedTraits": localized_traits,
        "rhythm": rhythm,
        "safetyBoundaries": signature_safety_boundaries(language),
        "status": "ready",
        "strengths": strengths,
        "summary": signature_ready_summary(len(traits), language),
        "synthesisReadiness": {
            "numerology": "available-on-request",
            "rule": signature_synthesis_rule(language),
        },
    }


def extract_signature_traits_from_text(message: str) -> List[Dict[str, Any]]:
    traits: List[Dict[str, Any]] = []
    normalized = message.lower()
    for key, rule in SIGNATURE_TRAIT_RULES.items():
        labels = [key] + rule.get("aliases", [])
        label_pattern = "|".join(re.escape(label).replace(r"\ ", r"\s+") for label in labels)
        for value, meaning in rule["values"].items():
            value_pattern = re.escape(value).replace(r"\ ", r"\s+")
            direct_pattern = rf"(?:{label_pattern})\s*[:=-]?\s*{value_pattern}\b"
            reverse_pattern = rf"{value_pattern}\s+(?:{label_pattern})\b"
            if re.search(direct_pattern, normalized, re.I) or re.search(reverse_pattern, normalized, re.I):
                traits.append(
                    {
                        "caution": meaning[2],
                        "key": key,
                        "label": rule["label"],
                        "meaning": meaning[0],
                        "strengths": meaning[1],
                        "value": value,
                    }
                )
                break
    return traits


def build_signature_rhythm(
    traits: List[Dict[str, Any]],
    language: str = "en",
) -> Dict[str, str]:
    speed = trait_value(traits, "writing rhythm")
    pressure = trait_value(traits, "pressure")
    slant = trait_value(traits, "slant")
    if speed == "fast" or pressure == "heavy":
        return {
            "care": signature_rhythm_care("fast", language),
            "pace": "fast",
            "summary": signature_rhythm_summary("fast", language),
        }
    if speed == "slow" or slant == "left":
        return {
            "care": signature_rhythm_care("calm", language),
            "pace": "calm",
            "summary": signature_rhythm_summary("calm", language),
        }
    if speed == "moderate" or pressure == "medium":
        return {
            "care": signature_rhythm_care("measured", language),
            "pace": "measured",
            "summary": signature_rhythm_summary("measured", language),
        }
    return {
        "care": signature_rhythm_care("variable", language),
        "pace": "variable",
        "summary": signature_rhythm_summary("variable", language),
    }


def build_signature_confidence_expression(
    traits: List[Dict[str, Any]],
    language: str = "en",
) -> Dict[str, str]:
    size = trait_value(traits, "signature size")
    capital = trait_value(traits, "capital emphasis")
    underline = trait_value(traits, "underline")
    flourish = trait_value(traits, "flourish")
    if size == "large" or capital == "high" or underline == "high" or flourish == "expansive":
        return {
            "care": signature_confidence_care("visible", language),
            "level": "visible",
            "summary": signature_confidence_summary("visible", language),
        }
    if size == "small" or capital == "low":
        return {
            "care": signature_confidence_care("reserved", language),
            "level": "reserved",
            "summary": signature_confidence_summary("reserved", language),
        }
    return {
        "care": signature_confidence_care("balanced", language),
        "level": "balanced",
        "summary": signature_confidence_summary("balanced", language),
    }


def build_signature_consistency(
    traits: List[Dict[str, Any]],
    language: str = "en",
) -> Dict[str, str]:
    baseline = trait_value(traits, "baseline")
    spacing = trait_value(traits, "spacing")
    connection = trait_value(traits, "letter connection")
    slant = trait_value(traits, "slant")
    if baseline == "steady" and spacing == "balanced" and connection != "mixed":
        return {
            "care": signature_consistency_care("steady", language),
            "level": "steady",
            "summary": signature_consistency_summary("steady", language),
        }
    if baseline == "mixed" or slant == "mixed" or connection == "mixed":
        return {
            "care": signature_consistency_care("variable", language),
            "level": "variable",
            "summary": signature_consistency_summary("variable", language),
        }
    return {
        "care": signature_consistency_care("flexible", language),
        "level": "flexible",
        "summary": signature_consistency_summary("flexible", language),
    }


def build_signature_improvement_plan(
    traits: List[Dict[str, Any]],
    rhythm: Dict[str, str],
    confidence: Dict[str, str],
    consistency: Dict[str, str],
    language: str = "en",
) -> List[str]:
    plan = [
        signature_plan_intro(language),
        rhythm["care"],
        confidence["care"],
        consistency["care"],
    ]
    if any(trait["key"] == "legibility" and trait["value"] != "clear" for trait in traits):
        plan.append(signature_legibility_plan(language))
    if any(trait["key"] == "spacing" and trait["value"] == "tight" for trait in traits):
        plan.append(signature_spacing_plan(language))
    if any(trait["key"] == "baseline" and trait["value"] == "downward" for trait in traits):
        plan.append(signature_baseline_plan(language))
    return unique_ordered(plan)[:6]


def trait_value(traits: List[Dict[str, Any]], key: str) -> Optional[str]:
    match = next((trait for trait in traits if trait["key"] == key), None)
    return match["value"] if match else None


def signature_safety_boundaries(language: str = "en") -> List[str]:
    if language == "hi":
        return [
            "हस्ताक्षर विश्लेषण केवल चिंतन और आत्म-समझ के लिए है।",
            "यह पहचान सत्यापन, हस्तलेखन जांच, कानूनी प्रमाण, भर्ती सलाह, चिकित्सा निदान या मानसिक स्वास्थ्य निदान नहीं है।",
            "हर व्याख्या को हल्की प्रवृत्ति की तरह लें, स्थायी चरित्र या भविष्य का पक्का सत्य नहीं।",
            "मजबूत सलाह देने से पहले पुष्टि किया गया व्यक्तिगत संदर्भ रखें, और शर्म, डर या पक्के दावे वाली भाषा से बचें।",
        ]
    if language == "gu":
        return [
            "હસ્તાક્ષર વિશ્લેષણ માત્ર પ્રતિબિંબ અને આત્મસમજ માટે છે।",
            "આ ઓળખ ચકાસણી, હસ્તલેખન તપાસ, કાનૂની પુરાવો, ભરતી સલાહ, તબીબી નિદાન અથવા માનસિક આરોગ્યનું નિદાન નથી।",
            "દરેક અર્થઘટનને હળવી વૃત્તિ સમજો, પક્કા સ્વભાવ અથવા ભવિષ્યના સત્ય તરીકે નહીં।",
            "મજબૂત માર્ગદર્શન આપતા પહેલાં પુષ્ટિ કરેલો વ્યક્તિગત સંદર્ભ રાખો, અને શરમ, ડર અથવા ખાતરીવાળા દાવાની ભાષાથી બચો।",
        ]
    return [
        "Signature analysis is for reflection and self-understanding only.",
        "It is not identity verification, handwriting forensics, legal proof, hiring advice, medical diagnosis, or mental-health diagnosis.",
        "Treat every interpretation as a soft tendency, not a fixed truth about character or future events.",
        "Use confirmed personal context before strong guidance, and avoid shame, fear, or certainty language.",
    ]


def pending_signature_prompt(language: str) -> str:
    if language == "hi":
        return "व्याख्या से पहले हस्ताक्षर छवि, बनाया गया हस्ताक्षर, या पुष्टि किए गए दिखने वाले संकेत मांगें।"
    if language == "gu":
        return "અર્થઘટન પહેલાં સહીની છબી, દોરેલી સહી અથવા પુષ્ટિ કરેલા દેખાતા સંકેતો માંગો।"
    return "Ask for a signature image, drawing, or confirmed visible traits before interpretation."


def signature_ready_summary(count: int, language: str) -> str:
    if language == "hi":
        return f"हस्ताक्षर वाचन {count} पुष्टि किए गए दिखने वाले संकेतों के साथ तैयार है।"
    if language == "gu":
        return f"હસ્તાક્ષર વાંચન {count} પુષ્ટિ કરેલા દેખાતા સંકેતો સાથે તૈયાર છે।"
    return f"Signature reading is ready from {count} confirmed visual trait{'s' if count != 1 else ''}."


def signature_synthesis_rule(language: str) -> str:
    if language == "hi":
        return "हस्ताक्षर और अंक ज्योतिष अलग रहते हैं, जब तक आप स्पष्ट रूप से संयुक्त सार न मांगें।"
    if language == "gu":
        return "હસ્તાક્ષર અને અંક જ્યોતિષ જુદા રહે છે, જ્યાં સુધી તમે સ્પષ્ટ રીતે સંયુક્ત સાર ન માંગો।"
    return "Signature and Numerology stay separate unless the user explicitly asks for synthesis."


def build_signature_evidence_line(trait: Dict[str, Any], language: str) -> str:
    label = trait.get("displayLabel", trait["label"])
    value = trait.get("valueLabel", trait["value"])
    if language == "hi":
        return f"{label}: {value}."
    if language == "gu":
        return f"{label}: {value}."
    return f"{label}: {value} ({trait['meaning']})."


def localize_signature_traits(
    traits: List[Dict[str, Any]],
    language: str,
) -> List[Dict[str, Any]]:
    if language == "en":
        return [dict(trait, valueLabel=trait["value"]) for trait in traits]

    localized: List[Dict[str, Any]] = []
    for trait in traits:
        localized.append(
            {
                **trait,
                "displayCaution": localize_signature_caution(
                    trait["key"],
                    trait["value"],
                    trait["caution"],
                    language,
                ),
                "displayLabel": localize_signature_label(trait["key"], language),
                "valueLabel": localize_signature_value(trait["value"], language),
            }
        )
    return localized


def localize_signature_label(key: str, language: str) -> str:
    labels = {
        "hi": {
            "baseline": "आधार रेखा",
            "capital emphasis": "बड़े अक्षर का जोर",
            "flourish": "अतिरिक्त शैली",
            "legibility": "पढ़ने की स्पष्टता",
            "letter connection": "अक्षरों का जुड़ाव",
            "margin use": "जगह का उपयोग",
            "pressure": "दबाव",
            "signature size": "हस्ताक्षर का आकार",
            "slant": "झुकाव",
            "spacing": "अंतर",
            "writing rhythm": "लिखावट की लय",
            "underline": "अंडरलाइन",
        },
        "gu": {
            "baseline": "આધાર રેખા",
            "capital emphasis": "મોટા અક્ષરનો ભાર",
            "flourish": "વધારાની શૈલી",
            "legibility": "વાંચવાની સ્પષ્ટતા",
            "letter connection": "અક્ષરોનો જોડાણ",
            "margin use": "જગ્યાનો ઉપયોગ",
            "pressure": "દબાણ",
            "signature size": "સહીનું કદ",
            "slant": "ઝુકાવ",
            "spacing": "અંતર",
            "writing rhythm": "લખવાની લય",
            "underline": "અંડરલાઇન",
        },
    }
    return labels.get(language, {}).get(key, key.title())


def localize_signature_value(value: str, language: str) -> str:
    values = {
        "hi": {
            "abstract": "बहुत अमूर्त",
            "balanced": "संतुलित",
            "clear": "साफ",
            "compact": "सघन",
            "connected": "जुड़ा हुआ",
            "disconnected": "अलग-अलग",
            "downward": "नीचे जाती",
            "expansive": "फैली हुई",
            "fast": "तेज़",
            "heavy": "भारी",
            "high": "मजबूत",
            "large": "बड़ा",
            "left": "बाएं",
            "light": "हल्का",
            "low": "कम",
            "medium": "मध्यम",
            "mixed": "मिला-जुला",
            "moderate": "मध्यम",
            "none": "नहीं",
            "partial": "थोड़ा पढ़ने योग्य",
            "right": "दाएं",
            "single": "एक रेखा",
            "small": "छोटा",
            "slow": "धीमा",
            "steady": "स्थिर",
            "tight": "कम अंतर",
            "upward": "ऊपर जाती",
            "wide": "ज्यादा अंतर",
        },
        "gu": {
            "abstract": "ખૂબ અમૂર્ત",
            "balanced": "સંતુલિત",
            "clear": "સ્પષ્ટ",
            "compact": "સઘન",
            "connected": "જોડાયેલ",
            "disconnected": "અલગ",
            "downward": "નીચે જતી",
            "expansive": "ફેલાયેલી",
            "fast": "ઝડપી",
            "heavy": "ભારે",
            "high": "મજબૂત",
            "large": "મોટી",
            "left": "ડાબી",
            "light": "હળવી",
            "low": "ઓછું",
            "medium": "મધ્યમ",
            "mixed": "મિશ્ર",
            "moderate": "મધ્યમ",
            "none": "નથી",
            "partial": "થોડી વાંચી શકાય તેવી",
            "right": "જમણી",
            "single": "એક રેખા",
            "small": "નાની",
            "slow": "ધીમી",
            "steady": "સ્થિર",
            "tight": "ઓછું અંતર",
            "upward": "ઉપર જતી",
            "wide": "વધુ અંતર",
        },
    }
    return values.get(language, {}).get(value, value)


def localize_signature_caution(
    key: str,
    value: str,
    default: str,
    language: str,
) -> str:
    cautions = {
        "hi": {
            ("baseline", "upward"): "उत्साह को व्यवहारिक तैयारी के साथ रखें।",
            ("baseline", "steady"): "स्थिरता के साथ लचीलापन भी बनाए रखें।",
            ("baseline", "mixed"): "मूड बदलने पर बड़े फैसलों को ज़मीन से जोड़कर रखें।",
            ("baseline", "downward"): "थकान और अधूरी छोड़ने की आदत पर ध्यान दें।",
            ("pressure", "heavy"): "तेज़ दबाव को तनाव में बदलने से पहले विराम दें।",
            ("pressure", "medium"): "संतुलित दबाव को भी समय-समय पर आराम चाहिए।",
            ("pressure", "light"): "जहां मजबूती चाहिए वहां सीमाएं साफ रखें।",
            ("legibility", "partial"): "गंभीर बातों में अपेक्षाएं साफ बोलें ताकि लोग गलत अर्थ न लें।",
            ("legibility", "clear"): "स्पष्टता के साथ निजता की सीमा भी रखें।",
            ("legibility", "abstract"): "जहां भरोसा जरूरी हो वहां थोड़ी अधिक स्पष्टता रखें।",
        },
        "gu": {
            ("baseline", "upward"): "ઉત્સાહને વ્યવહારિક તૈયારી સાથે રાખો।",
            ("baseline", "steady"): "સ્થિરતા સાથે લવચીકતા પણ જાળવો।",
            ("baseline", "mixed"): "મૂડ બદલાય ત્યારે મોટા નિર્ણયોને જમીન પર રાખો।",
            ("baseline", "downward"): "થાક અને અધૂરું છોડી દેવાની વૃત્તિ પર ધ્યાન આપો।",
            ("pressure", "heavy"): "તીવ્ર દબાણને તાણમાં બદલાય તે પહેલાં વિરામ આપો।",
            ("pressure", "medium"): "સંતુલિત દબાણને પણ સમયાંતરે આરામ જોઈએ।",
            ("pressure", "light"): "જ્યાં મજબૂતી જોઈએ ત્યાં સીમા સ્પષ્ટ રાખો।",
            ("legibility", "partial"): "ગંભીર વાતોમાં અપેક્ષા સ્પષ્ટ કહો જેથી લોકો ખોટો અર્થ ન કાઢે।",
            ("legibility", "clear"): "સ્પષ્ટતા સાથે ગોપનીયતાની સીમા પણ રાખો।",
            ("legibility", "abstract"): "જ્યાં વિશ્વાસ જરૂરી હોય ત્યાં થોડું વધુ સ્પષ્ટ રહો।",
        },
    }
    return cautions.get(language, {}).get((key, value), default)


def signature_rhythm_summary(level: str, language: str) -> str:
    if language == "hi":
        mapping = {
            "fast": "हस्ताक्षर की लय सक्रिय और तेज़ दिखती है; यह जल्दी प्रतिक्रिया और मजबूत प्रयास दिखा सकती है।",
            "calm": "हस्ताक्षर की लय सावधान और भीतर की ओर दिखती है; यह विचारशीलता और सुरक्षित अभिव्यक्ति दिखा सकती है।",
            "measured": "हस्ताक्षर की लय संतुलित दिखती है; यह नियंत्रित समय-बोध और स्थिर प्रयास दिखा सकती है।",
            "variable": "लय का संकेत अधूरा है; अधिक पुष्टि किए गए संकेतों से पढ़ाई और स्पष्ट होगी।",
        }
        return mapping[level]
    if language == "gu":
        mapping = {
            "fast": "હસ્તાક્ષરની લય સક્રિય અને દબાણવાળી લાગે છે; તે ઝડપી પ્રતિસાદ અને મજબૂત પ્રયત્ન બતાવી શકે છે।",
            "calm": "હસ્તાક્ષરની લય સાવધાન અને અંદરની તરફ લાગી શકે છે; તે વિચારપૂર્વકતા અને સુરક્ષિત અભિવ્યક્તિ બતાવી શકે છે।",
            "measured": "હસ્તાક્ષરની લય માપેલી લાગે છે; તે નિયંત્રિત સમયબોધ અને સ્થિર પ્રયત્ન બતાવી શકે છે।",
            "variable": "લયનો સંકેત અધૂરો છે; વધુ પુષ્ટિ કરેલા સંકેતો સાથે વાંચન વધુ સ્પષ્ટ બનશે।",
        }
        return mapping[level]
    mapping = {
        "fast": "The signature rhythm looks active and forceful; it can show quick response and strong effort.",
        "calm": "The signature rhythm looks careful and inward; it can show thoughtfulness and protected expression.",
        "measured": "The signature rhythm looks measured; it can show controlled timing and steady effort.",
        "variable": "The rhythm signal is incomplete; more confirmed traits are needed for a sharper reading.",
    }
    return mapping[level]


def signature_rhythm_care(level: str, language: str) -> str:
    if language == "hi":
        mapping = {
            "fast": "महत्वपूर्ण हस्ताक्षर, समझौते या भावनात्मक फैसलों से पहले रफ्तार धीमी करें ताकि गति दबाव न बने।",
            "calm": "सोच-समझकर चलने की ताकत रखें, लेकिन जरूरत के काम में देर न होने दें।",
            "measured": "दोहराए गए हस्ताक्षरों में वही लय रखें ताकि सार्वजनिक छाप स्थिर लगे।",
            "variable": "लय पर दावा करने से पहले गति, दबाव और झुकाव को हाल के स्वाभाविक हस्ताक्षर से पुष्टि करें।",
        }
        return mapping[level]
    if language == "gu":
        mapping = {
            "fast": "મહત્વપૂર્ણ સહી, સમજૂતી અથવા લાગણીસભર નિર્ણય પહેલાં ગતિ ધીમી કરો જેથી ઝડપ દબાણમાં ન ફેરવે।",
            "calm": "વિચારપૂર્વક ચાલવાની શક્તિ રાખો, પણ જરૂરી કાર્યમાં વધુ મોડું ન થવા દો।",
            "measured": "વારંવારની સહીમાં એકસરખી લય રાખો જેથી જાહેર છાપ સ્થિર લાગે।",
            "variable": "લય અંગે દાવો કરતા પહેલાં ગતિ, દબાણ અને ઝુકાવને તાજી સ્વાભાવિક સહીથી પુષ્ટિ કરો।",
        }
        return mapping[level]
    mapping = {
        "fast": "Slow down before important signatures, agreements, or emotional decisions.",
        "calm": "Use deliberate pace as a strength, but do not let caution delay necessary action.",
        "measured": "Keep the same rhythm across repeated signatures so the public mark feels stable.",
        "variable": "Confirm speed, pressure, and slant before making rhythm claims.",
    }
    return mapping[level]


def signature_confidence_summary(level: str, language: str) -> str:
    if language == "hi":
        mapping = {
            "visible": "हस्ताक्षर में दिखने वाला आत्मविश्वास और मजबूत सार्वजनिक छाप दिखाई देती है।",
            "reserved": "हस्ताक्षर का आत्मविश्वास अधिक निजी, संयमित और चुनिंदा दिखाई देता है।",
            "balanced": "आत्मविश्वास की अभिव्यक्ति संतुलित लगती है या अभी और संकेतों की जरूरत है।",
        }
        return mapping[level]
    if language == "gu":
        mapping = {
            "visible": "હસ્તાક્ષર સ્પષ્ટ આત્મવિશ્વાસ અને વધુ મજબૂત જાહેર છાપ બતાવે છે।",
            "reserved": "હસ્તાક્ષરનો આત્મવિશ્વાસ વધુ ખાનગી, સંયમિત અને પસંદગીપૂર્વક દેખાય છે।",
            "balanced": "આત્મવિશ્વાસની અભિવ્યક્તિ સંતુલિત લાગે છે અથવા હજુ વધુ સંકેતો જોઈએ।",
        }
        return mapping[level]
    mapping = {
        "visible": "The signature projects visible confidence and a stronger public mark.",
        "reserved": "The signature expresses confidence more privately, with restraint and selective visibility.",
        "balanced": "The confidence expression looks balanced or still needs more confirmed traits.",
    }
    return mapping[level]


def signature_confidence_care(level: str, language: str) -> str:
    if language == "hi":
        mapping = {
            "visible": "दिखने वाले आत्मविश्वास को स्पष्टता, विनम्रता और काम पूरा करने की आदत से सहारा दें।",
            "reserved": "जहां भरोसा और उपस्थिति जरूरी हो वहां थोड़ा अधिक साफ और दिखने वाला रूप अभ्यास करें।",
            "balanced": "ऐसा साफ और दोहराने योग्य रूप रखें जिससे आत्मविश्वास बनावटी न लगे।",
        }
        return mapping[level]
    if language == "gu":
        mapping = {
            "visible": "દેખાતા આત્મવિશ્વાસને સ્પષ્ટતા, વિનમ્રતા અને કાર્યપૂર્ણતા સાથે સહારો આપો।",
            "reserved": "જ્યાં વિશ્વાસ અને ઉપસ્થિતિ જરૂરી હોય ત્યાં થોડું વધુ સ્પષ્ટ અને દેખાતું સ્વરૂપ અભ્યાસ કરો।",
            "balanced": "એવું સ્વચ્છ અને ફરી કરી શકાય એવું સ્વરૂપ રાખો કે આત્મવિશ્વાસ બળજબરીનો ન લાગે।",
        }
        return mapping[level]
    mapping = {
        "visible": "Keep the visible confidence supported by follow-through, clarity, and humility.",
        "reserved": "Practice a slightly clearer and more visible version where trust and presence matter.",
        "balanced": "Use a clean, repeatable version so confidence feels natural rather than forced.",
    }
    return mapping[level]


def signature_consistency_summary(level: str, language: str) -> str:
    if language == "hi":
        mapping = {
            "steady": "हस्ताक्षर की रचना स्थिर दिखती है और दोहराने योग्य आत्म-प्रस्तुति दिखा सकती है।",
            "variable": "हस्ताक्षर बदलती लय दिखाता है, जो अनुकूलनशील तो लग सकता है पर असंगत भी बन सकता है।",
            "flexible": "स्थिरता का रूप लचीला है; यह बदल सकता है लेकिन पहचान योग्य रहना चाहिए।",
        }
        return mapping[level]
    if language == "gu":
        mapping = {
            "steady": "હસ્તાક્ષરની રચના સ્થિર લાગે છે અને ફરીથી દેખાડાય તેવી સ્વ-પ્રસ્તુતિ બતાવી શકે છે।",
            "variable": "હસ્તાક્ષર બદલાતી લય બતાવે છે, જે અનુકૂળ તો લાગે પણ અસંગત પણ બની શકે છે।",
            "flexible": "સ્થિરતાનો સ્વરૂપ લવચીક છે; તે બદલાઈ શકે છે પણ ઓળખાય તેવું રહેવું જોઈએ।",
        }
        return mapping[level]
    mapping = {
        "steady": "The signature has a stable structure and can show repeatable self-presentation.",
        "variable": "The signature shows changing rhythm, which can feel adaptable but inconsistent.",
        "flexible": "The consistency profile is flexible; it can adapt but should remain recognizable.",
    }
    return mapping[level]


def signature_consistency_care(level: str, language: str) -> str:
    if language == "hi":
        mapping = {
            "steady": "स्थिर प्रस्तुति के साथ बदलती परिस्थिति में लचीलापन भी रखें।",
            "variable": "महत्वपूर्ण दस्तावेज़ों और पेशेवर स्थितियों के लिए एक स्थिर अभ्यास रूप चुनें।",
            "flexible": "इतनी रचना रखें कि दोहराए जाने पर हस्ताक्षर पहचाना जा सके।",
        }
        return mapping[level]
    if language == "gu":
        mapping = {
            "steady": "સ્થિર રજૂઆત સાથે બદલાતી પરિસ્થિતિમાં લવચીકતા પણ રાખો।",
            "variable": "મહત્વપૂર્ણ દસ્તાવેજો અને વ્યાવસાયિક પરિસ્થિતિઓ માટે એક સ્થિર અભ્યાસ સ્વરૂપ પસંદ કરો।",
            "flexible": "એટલી રચના રાખો કે વારંવાર વપરાય ત્યારે હસ્તાક્ષર ઓળખાય।",
        }
        return mapping[level]
    mapping = {
        "steady": "Steady presentation still needs flexibility when the situation changes.",
        "variable": "Choose one consistent practice version for important documents and professional settings.",
        "flexible": "Keep enough structure that the signature remains recognizable across repeated use.",
    }
    return mapping[level]


def signature_plan_intro(language: str) -> str:
    if language == "hi":
        return "हस्ताक्षर को स्वाभाविक रखें; अचानक नया रूप जबरन न बनाएं।"
    if language == "gu":
        return "હસ્તાક્ષરને સ્વાભાવિક રાખો; અચાનક નવું સ્વરૂપ જબરદસ્તી ન બનાવો।"
    return "Keep the signature natural; do not force a new style suddenly."


def signature_legibility_plan(language: str) -> str:
    if language == "hi":
        return "एक पेशेवर रूप थोड़ा अधिक साफ रखें ताकि जरूरी लोग आपकी मंशा पढ़ सकें।"
    if language == "gu":
        return "એક વ્યાવસાયિક આવૃત્તિ થોડું વધુ સ્પષ્ટ રાખો જેથી જરૂરી લોકો તમારી ભાવના વાંચી શકે।"
    return "Make one professional version slightly clearer so important people can read your intent."


def signature_spacing_plan(language: str) -> str:
    if language == "hi":
        return "नाम के हिस्सों के बीच थोड़ा सांस लेने जैसा अंतर रखें ताकि दृश्य दबाव कम हो।"
    if language == "gu":
        return "નામના ભાગો વચ્ચે થોડું શ્વાસ જેવું અંતર રાખો જેથી દૃશ્ય દબાણ ઓછું થાય।"
    return "Add a little breathing room between name parts to reduce visual pressure."


def signature_baseline_plan(language: str) -> str:
    if language == "hi":
        return "एक हफ्ते तक अधिक स्थिर आधार रेखा का अभ्यास करें और देखें कि वह कैसा लगता है।"
    if language == "gu":
        return "એક અઠવાડિયા સુધી વધુ સ્થિર આધાર રેખાનો અભ્યાસ કરો અને જુઓ કે તે કેવી લાગે છે।"
    return "Practice a steadier baseline for one week and compare how it feels."


def build_numerology_foundation_context(
    kundli: KundliData,
    message: str = "",
    language: str = "en",
) -> Dict[str, Any]:
    birth = kundli.birthDetails
    target_date = date.today().isoformat()
    name_number = build_numerology_number(chaldean_name_total(birth.name), language)
    birth_number = build_numerology_number(
        int(re.sub(r"\D", "", birth.date[-2:] or "0")),
        language,
    )
    destiny_number = build_numerology_number(
        sum_digits(re.sub(r"\D", "", birth.date)),
        language,
    )
    cycles = build_numerology_cycles(birth.date, target_date, language)
    question_context = build_numerology_question_context(
        birth.name,
        birth.date,
        message,
        language,
    )
    strengths = unique_ordered(
        name_number["keywords"] + birth_number["keywords"] + destiny_number["keywords"]
    )[:6]
    cautions = unique_ordered(
        number_meanings(name_number["root"], language)["cautions"]
        + number_meanings(destiny_number["root"], language)["cautions"]
        + number_meanings(cycles["personalYear"]["root"], language)["cautions"]
    )[:5]

    return {
        "birthDate": birth.date,
        "birthNumber": birth_number,
        "cautions": cautions,
        "destinyNumber": destiny_number,
        "evidence": build_numerology_foundation_evidence(
            birth.name,
            birth.date,
            target_date,
            name_number,
            birth_number,
            destiny_number,
            language,
        ),
        "guidance": build_numerology_foundation_guidance(
            name_number,
            birth_number,
            destiny_number,
            language,
        ),
        "limitations": build_numerology_foundation_limitations(language),
        "method": {
            "birthNumber": "DAY_OF_MONTH_REDUCTION",
            "destinyNumber": "FULL_BIRTH_DATE_REDUCTION",
            "nameNumber": "CHALDEAN",
            "personalCycles": "DOB_PLUS_TARGET_DATE_REDUCTION",
        },
        "name": birth.name,
        "nameNumber": name_number,
        "normalizedName": re.sub(r"[^A-Z]", "", birth.name.upper()),
        "personalDay": cycles["personalDay"],
        "personalMonth": cycles["personalMonth"],
        "personalYear": cycles["personalYear"],
        "questionContext": question_context,
        "status": "ready",
        "strengths": strengths,
        "summary": build_numerology_foundation_summary(
            birth.name,
            name_number,
            birth_number,
            destiny_number,
            cycles["personalDay"],
            language,
        ),
        "targetDate": target_date,
    }


def build_numerology_question_context(
    current_name: str,
    current_birth_date: str,
    message: str,
    language: str = "en",
) -> Dict[str, Any]:
    clean_message = message.strip()
    if not clean_message:
        return {"focus": "profile", "status": "ready"}

    if is_numerology_compatibility_question(clean_message):
        return build_numerology_compatibility_context(
            current_name,
            current_birth_date,
            clean_message,
            language,
        )

    if is_name_correction_question(clean_message):
        candidate_name = extract_numerology_candidate_name(clean_message)
        if candidate_name:
            return {
                "focus": "name-correction",
                "status": "ready",
                "nameCorrection": build_name_correction_context(
                    current_name,
                    candidate_name,
                    language,
                ),
            }
        return {
            "focus": "name-correction",
            "status": "needs_candidate_name",
            "missing": "candidateName",
            "prompt": "Ask for the spelling or name variant the user wants to compare.",
        }

    if re.search(
        r"\b(personal\s+year|personal\s+month|personal\s+day|timing|cycle|today|this year|month)\b",
        clean_message,
        re.I,
    ):
        return {
            "focus": "timing",
            "status": "ready",
            "timingRule": "Use personalYear, personalMonth, and personalDay before broad advice.",
        }

    return {"focus": "profile", "status": "ready"}


def is_name_correction_question(message: str) -> bool:
    return bool(
        re.search(
            r"\b(name\s+correction|name\s+change|change\s+my\s+name|change\s+name|rename|spelling|spellings?|naam|name\s+number|lucky\s+name)\b",
            message,
            re.I,
        )
    )


def extract_numerology_candidate_name(message: str) -> Optional[str]:
    quoted = re.findall(r"[\"“']([A-Za-z][A-Za-z .'-]{1,80})[\"”']", message)
    if quoted:
        return clean_candidate_name(quoted[-1])

    patterns = [
        r"(?:change|rename|switch|update)\s+(?:my\s+)?name\s+(?:to|as)\s+([A-Za-z][A-Za-z .'-]{1,80})",
        r"(?:use|try|compare|check)\s+(?:the\s+)?(?:name|spelling)\s+([A-Za-z][A-Za-z .'-]{1,80})",
        r"(?:name|spelling|naam)\s*[:=]\s*([A-Za-z][A-Za-z .'-]{1,80})",
        r"(?:should\s+i\s+use|is)\s+([A-Za-z][A-Za-z .'-]{1,80})\s+(?:a\s+)?(?:good|better|lucky)\s+(?:name|spelling)",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.I)
        if match:
            return clean_candidate_name(match.group(1))
    return None


def clean_candidate_name(value: str) -> Optional[str]:
    candidate = re.split(
        r"\b(for|because|instead|please|pls|dob|date|birth|with|and|or)\b",
        value.strip(),
        flags=re.I,
    )[0].strip(" .,'\"")
    if len(re.sub(r"[^A-Za-z]", "", candidate)) < 2:
        return None
    return " ".join(candidate.split())


def build_name_correction_context(
    current_name: str,
    candidate_name: str,
    language: str = "en",
) -> Dict[str, Any]:
    current_number = build_numerology_number(
        chaldean_name_total(current_name),
        language,
    )
    candidate_number = build_numerology_number(
        chaldean_name_total(candidate_name),
        language,
    )
    current_meaning = number_meanings(current_number["root"], language)["meaning"]
    candidate_meaning = number_meanings(candidate_number["root"], language)["meaning"]
    same_number = current_number["root"] == candidate_number["root"]
    return {
        "candidateMeaning": candidate_meaning,
        "candidateName": candidate_name,
        "candidateNameNumber": candidate_number,
        "currentMeaning": current_meaning,
        "currentName": current_name,
        "currentNameNumber": current_number,
        "method": "CHALDEAN_NAME_COMPARISON",
        "recommendation": build_name_correction_recommendation(same_number, language),
        "safetyRule": build_name_correction_safety_rule(language),
    }


def is_numerology_compatibility_question(message: str) -> bool:
    return bool(
        re.search(
            r"\b(compatibility|compatible|match|matching|marriage|relationship|partner|couple|compare)\b",
            message,
            re.I,
        )
    )


def build_numerology_compatibility_context(
    current_name: str,
    current_birth_date: str,
    message: str,
    language: str = "en",
) -> Dict[str, Any]:
    partner_date = extract_partner_birth_date(message)
    partner_name = extract_partner_name(message, partner_date)
    if not partner_date:
        return {
            "focus": "compatibility",
            "status": "needs_partner_data",
            "missing": ["partnerBirthDate", "partnerNameOptional"],
            "prompt": "Ask for the other person's full name and date of birth before comparing compatibility.",
        }

    user_birth = build_numerology_number(
        int(re.sub(r"\D", "", current_birth_date[-2:] or "0")),
        language,
    )
    user_destiny = build_numerology_number(
        sum_digits(re.sub(r"\D", "", current_birth_date)),
        language,
    )
    partner_birth = build_numerology_number(
        int(re.sub(r"\D", "", partner_date[-2:] or "0")),
        language,
    )
    partner_destiny = build_numerology_number(
        sum_digits(re.sub(r"\D", "", partner_date)),
        language,
    )
    partner_name_number = (
        build_numerology_number(chaldean_name_total(partner_name), language)
        if partner_name
        else None
    )
    fit = numerology_relationship_fit(
        user_birth["root"],
        user_destiny["root"],
        partner_birth["root"],
        partner_destiny["root"],
        language,
    )
    return {
        "focus": "compatibility",
        "partner": {
            "birthDate": partner_date,
            "birthNumber": partner_birth,
            "destinyNumber": partner_destiny,
            "name": partner_name or "Partner",
            "nameNumber": partner_name_number,
        },
        "status": "ready",
        "support": fit["support"],
        "care": fit["care"],
        "tone": fit["tone"],
        "user": {
            "birthDate": current_birth_date,
            "birthNumber": user_birth,
            "destinyNumber": user_destiny,
            "name": current_name,
        },
    }


def extract_partner_birth_date(message: str) -> Optional[str]:
    iso = re.search(
        r"\b(19\d{2}|20\d{2})-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b",
        message,
    )
    if iso:
        return normalize_date_parts(
            int(iso.group(1)),
            int(iso.group(2)),
            int(iso.group(3)),
        )

    slash = re.search(
        r"\b(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](19\d{2}|20\d{2})\b",
        message,
    )
    if slash:
        return normalize_date_parts(
            int(slash.group(3)),
            int(slash.group(2)),
            int(slash.group(1)),
        )

    month_name = re.search(
        r"\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]{3,9})\s+(19\d{2}|20\d{2})\b",
        message,
        re.I,
    )
    if month_name:
        month = MONTHS.get(month_name.group(2).lower())
        if month:
            return normalize_date_parts(
                int(month_name.group(3)),
                int(month),
                int(month_name.group(1)),
            )

    return None


def normalize_date_parts(year: int, month: int, day: int) -> Optional[str]:
    try:
        parsed = date(year, month, day)
    except ValueError:
        return None
    return parsed.isoformat()


def extract_partner_name(message: str, partner_date: Optional[str]) -> Optional[str]:
    patterns = [
        r"(?:with|partner|spouse|wife|husband|boyfriend|girlfriend)\s+([A-Za-z][A-Za-z .'-]{1,60})",
        r"(?:compatibility\s+with|match\s+with|compare\s+with)\s+([A-Za-z][A-Za-z .'-]{1,60})",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.I)
        if match:
            name = clean_partner_name(match.group(1), partner_date)
            if name:
                return name
    quoted = re.findall(r"[\"“']([A-Za-z][A-Za-z .'-]{1,60})[\"”']", message)
    if quoted:
        return clean_partner_name(quoted[-1], partner_date)
    return None


def clean_partner_name(value: str, partner_date: Optional[str]) -> Optional[str]:
    candidate = value
    if partner_date:
        candidate = candidate.replace(partner_date, "")
    candidate = re.split(
        r"\b(dob|date|born|birth|on|and|for|compatibility|match|please|pls)\b",
        candidate.strip(),
        flags=re.I,
    )[0].strip(" .,'\"")
    candidate = " ".join(candidate.split())
    if len(re.sub(r"[^A-Za-z]", "", candidate)) < 2:
        return None
    return candidate


def numerology_relationship_fit(
    user_birth: int,
    user_destiny: int,
    partner_birth: int,
    partner_destiny: int,
    language: str = "en",
) -> Dict[str, str]:
    supportive_pairs = {
        tuple(sorted(pair))
        for pair in [
            (1, 3),
            (1, 5),
            (2, 6),
            (2, 9),
            (3, 6),
            (4, 8),
            (5, 7),
            (6, 9),
            (7, 9),
        ]
    }
    shared = user_birth == partner_birth or user_destiny == partner_destiny
    birth_pair = tuple(sorted((user_birth, partner_birth)))
    destiny_pair = tuple(sorted((user_destiny, partner_destiny)))
    support_count = (
        int(shared)
        + int(birth_pair in supportive_pairs)
        + int(destiny_pair in supportive_pairs)
    )

    if support_count >= 2:
        return build_numerology_fit_copy("strong", language)
    if support_count == 1:
        return build_numerology_fit_copy("mixed", language)
    return build_numerology_fit_copy("careful", language)


def build_numerology_cycles(
    birth_date: str,
    target_date: str,
    language: str = "en",
) -> Dict[str, Any]:
    birth_parts = [int(part) for part in birth_date.split("-")]
    target_parts = [int(part) for part in target_date.split("-")]
    personal_year = build_numerology_number(
        sum_digits(f"{birth_parts[1]}{birth_parts[2]}{target_parts[0]}"),
        language,
    )
    personal_month = build_numerology_number(
        personal_year["root"] + target_parts[1],
        language,
    )
    personal_day = build_numerology_number(
        personal_month["root"] + target_parts[2],
        language,
    )
    return {
        "personalDay": {**personal_day, "date": target_date, "period": "day"},
        "personalMonth": {**personal_month, "date": target_date, "period": "month"},
        "personalYear": {**personal_year, "date": target_date, "period": "year"},
    }


def chaldean_name_total(name: str) -> int:
    values = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5,
        "F": 8,
        "G": 3,
        "H": 5,
        "I": 1,
        "J": 1,
        "K": 2,
        "L": 3,
        "M": 4,
        "N": 5,
        "O": 7,
        "P": 8,
        "Q": 1,
        "R": 2,
        "S": 3,
        "T": 4,
        "U": 6,
        "V": 6,
        "W": 6,
        "X": 5,
        "Y": 1,
        "Z": 7,
    }
    return sum(values.get(letter, 0) for letter in re.sub(r"[^A-Z]", "", name.upper()))


def build_numerology_number(value: int, language: str = "en") -> Dict[str, Any]:
    compound = max(0, int(value))
    root = reduce_to_root(compound)
    meaning = number_meanings(root, language)
    return {
        "compound": compound,
        "keywords": meaning["keywords"],
        "label": meaning["label"],
        "root": root,
        "simpleMeaning": meaning["meaning"],
    }


def number_meanings(root: int, language: str = "en") -> Dict[str, Any]:
    meanings = localized_numerology_meanings(language)
    label, meaning, keywords, cautions = meanings.get(root, meanings[9])
    return {
        "cautions": cautions,
        "keywords": keywords,
        "label": label,
        "meaning": meaning,
    }


def reduce_to_root(value: int) -> int:
    current = abs(int(value))
    if current == 0:
        return 0
    while current > 9:
        current = sum_digits(str(current))
    return current


def sum_digits(value: str) -> int:
    return sum(int(digit) for digit in re.sub(r"\D", "", str(value)) or "0")


def unique_ordered(items: List[str]) -> List[str]:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def localized_numerology_meanings(language: str) -> Dict[int, Any]:
    if language == "hi":
        return {
            1: ("नेता", "स्वतंत्रता, पहल और आत्मविश्वास", ["नेतृत्व", "पहल", "पहचान"], ["अहं टकराव", "अधीरता"]),
            2: ("समन्वयक", "सहयोग, संवेदनशीलता और साझेदारी", ["संतुलन", "सहयोग", "भावना"], ["अति-संवेदनशीलता", "हिचकिचाहट"]),
            3: ("रचनाकार", "अभिव्यक्ति, रचनात्मकता और संवाद", ["अभिव्यक्ति", "रचनात्मकता", "आनंद"], ["बिखरा फोकस", "अधूरे विचार"]),
            4: ("निर्माता", "संरचना, अनुशासन और स्थिर नींव", ["संरचना", "अनुशासन", "नींव"], ["कठोरता", "अधिक काम"]),
            5: ("खोजी", "स्वतंत्रता, अनुकूलन और गति", ["स्वतंत्रता", "परिवर्तन", "गति"], ["बेचैनी", "जल्दबाजी वाला जोखिम"]),
            6: ("पालनकर्ता", "देखभाल, जिम्मेदारी और परिवार", ["देखभाल", "परिवार", "सौंदर्य"], ["अति-जिम्मेदारी", "लोगों को खुश करने की आदत"]),
            7: ("साधक", "खोज, निजता और आध्यात्मिक गहराई", ["अनुसंधान", "गहराई", "आध्यात्मिकता"], ["अलगाव", "अति-विश्लेषण"]),
            8: ("रणनीतिकार", "शक्ति, वित्त और कर्मिक जिम्मेदारी", ["शक्ति", "धन", "कर्म"], ["नियंत्रण की प्रवृत्ति", "धन का दबाव"]),
            9: ("मानवसेवी", "पूर्णता, करुणा और व्यापक बुद्धि", ["पूर्णता", "करुणा", "बुद्धि"], ["भावनात्मक अतिरेक", "उद्धारक प्रवृत्ति"]),
        }
    if language == "gu":
        return {
            1: ("નેતા", "સ્વતંત્રતા, પહેલ અને આત્મવિશ્વાસ", ["નેતૃત્વ", "પહેલ", "ઓળખ"], ["અહં અથડામણ", "અધીરાઈ"]),
            2: ("સમન્વયક", "સહકાર, સંવેદનશીલતા અને ભાગીદારી", ["સંતુલન", "સહકાર", "ભાવના"], ["અતિ-સંવેદનશીલતા", "હિચકિચાટ"]),
            3: ("સર્જક", "અભિવ્યક્તિ, સર્જનાત્મકતા અને સંવાદ", ["અભિવ્યક્તિ", "સર્જનાત્મકતા", "આનંદ"], ["વખરાયેલ ધ્યાન", "અધૂરા વિચાર"]),
            4: ("નિર્માતા", "રચના, શિસ્ત અને સ્થિર પાયો", ["રચના", "શિસ્ત", "પાયો"], ["કઠોરતા", "વધુ કામ"]),
            5: ("શોધક", "સ્વતંત્રતા, અનુકૂલન અને ગતિ", ["સ્વતંત્રતા", "પરિવર્તન", "ગતિ"], ["બેચેની", "ઉતાવળનો જોખમ"]),
            6: ("પાલનકર્તા", "કાળજી, જવાબદારી અને પરિવાર", ["કાળજી", "પરિવાર", "સૌંદર્ય"], ["અતિ-જવાબદારી", "બધાને ખુશ રાખવાની વૃત્તિ"]),
            7: ("સાધક", "શોધ, ગોપનીયતા અને આધ્યાત્મિક ઊંડાણ", ["શોધ", "ઊંડાણ", "આધ્યાત્મિકતા"], ["અલગાવ", "અતિ-વિશ્લેષણ"]),
            8: ("રણનીતિકાર", "શક્તિ, નાણાં અને કર્મિક જવાબદારી", ["શક્તિ", "નાણાં", "કર્મ"], ["નિયંત્રણની વૃત્તિ", "નાણાંનો દબાણ"]),
            9: ("માનવસેવી", "પૂર્ણતા, કરુણા અને વિસ્તૃત બુદ્ધિ", ["પૂર્ણતા", "કરુણા", "બુદ્ધિ"], ["ભાવનાત્મક અતિરેક", "ઉદ્ધારક વૃત્તિ"]),
        }
    return {
        1: ("Leader", "independence, initiative, and confidence", ["leadership", "initiative", "identity"], ["ego clashes", "impatience"]),
        2: ("Diplomat", "cooperation, sensitivity, and partnership", ["harmony", "support", "emotion"], ["over-sensitivity", "hesitation"]),
        3: ("Creator", "communication, creativity, and expression", ["expression", "creativity", "joy"], ["scattered focus", "unfinished ideas"]),
        4: ("Builder", "structure, discipline, and steady foundations", ["structure", "discipline", "foundation"], ["rigidity", "overwork"]),
        5: ("Explorer", "freedom, adaptability, and movement", ["freedom", "change", "movement"], ["restlessness", "risk-taking"]),
        6: ("Nurturer", "care, responsibility, and family", ["care", "family", "beauty"], ["over-responsibility", "people-pleasing"]),
        7: ("Seeker", "research, privacy, and spiritual depth", ["research", "depth", "spirituality"], ["isolation", "over-analysis"]),
        8: ("Strategist", "power, finance, and karmic responsibility", ["power", "money", "karma"], ["control issues", "money pressure"]),
        9: ("Humanitarian", "completion, compassion, and broad wisdom", ["completion", "compassion", "wisdom"], ["emotional extremes", "savior pattern"]),
    }


def build_numerology_foundation_evidence(
    name: str,
    birth_date: str,
    target_date: str,
    name_number: Dict[str, Any],
    birth_number: Dict[str, Any],
    destiny_number: Dict[str, Any],
    language: str,
) -> List[str]:
    if language == "hi":
        return [
            f"नाम संख्या {name_number['root']} {name} पर Chaldean letter values लगाने से निकलती है।",
            f"जन्म संख्या {birth_number['root']} जन्म दिन {birth_date} से निकलती है।",
            f"भाग्य संख्या {destiny_number['root']} पूरी जन्मतिथि {birth_date} से निकलती है।",
            f"व्यक्तिगत वर्ष, माह, और दिन की गणना {target_date} के लिए की गई है।",
        ]
    if language == "gu":
        return [
            f"નામ અંક {name_number['root']} {name} પર Chaldean letter values લાગુ કરતાં મળે છે।",
            f"જન્મ અંક {birth_number['root']} જન્મ તારીખના દિવસ {birth_date} પરથી મળે છે।",
            f"ભાગ્ય અંક {destiny_number['root']} સંપૂર્ણ જન્મતારીખ {birth_date} પરથી મળે છે।",
            f"વ્યક્તિગત વર્ષ, મહિનો અને દિવસની ગણતરી {target_date} માટે કરવામાં આવી છે।",
        ]
    return [
        f"Name number {name_number['root']} comes from Chaldean letter values applied to {name}.",
        f"Birth number {birth_number['root']} comes from the birth day in {birth_date}.",
        f"Destiny number {destiny_number['root']} comes from the full birth date {birth_date}.",
        f"Personal year/month/day are calculated for {target_date}.",
    ]


def build_numerology_foundation_guidance(
    name_number: Dict[str, Any],
    birth_number: Dict[str, Any],
    destiny_number: Dict[str, Any],
    language: str,
) -> str:
    if language == "hi":
        return (
            f"नाम संख्या {name_number['root']} बाहरी अभिव्यक्ति दिखाती है। "
            f"जन्म संख्या {birth_number['root']} स्वाभाविक शैली दिखाती है। "
            f"भाग्य संख्या {destiny_number['root']} लंबी जीवन-दिशा दिखाती है।"
        )
    if language == "gu":
        return (
            f"નામ અંક {name_number['root']} બહારની અભિવ્યક્તિ બતાવે છે। "
            f"જન્મ અંક {birth_number['root']} સ્વાભાવિક શૈલી બતાવે છે। "
            f"ભાગ્ય અંક {destiny_number['root']} લાંબી જીવનદિશા બતાવે છે।"
        )
    return (
        f"Name number {name_number['root']} shows outer expression. "
        f"Birth number {birth_number['root']} shows instinctive style. "
        f"Destiny number {destiny_number['root']} shows longer life direction."
    )


def build_numerology_foundation_limitations(language: str) -> List[str]:
    if language == "hi":
        return [
            "Numerology एक guidance layer है और इसे व्यवहारिक समझ के साथ पढ़ना चाहिए।",
            "नाम की वर्तनी मायने रखती है। कानूनी नाम, रोज़मर्रा का नाम, और आध्यात्मिक नाम अलग अंक दे सकते हैं।",
        ]
    if language == "gu":
        return [
            "Numerology એક guidance layer છે અને તેને વ્યવહારુ સમજ સાથે વાંચવી જોઈએ।",
            "નામની સ્પેલિંગ મહત્વ રાખે છે. કાનૂની નામ, રોજિંદું નામ અને આધ્યાત્મિક નામ જુદા અંક આપી શકે છે।",
        ]
    return [
        "Numerology is a guidance layer and should support practical judgement.",
        "Name spelling matters. Legal name, common name, and spiritual name can produce different numbers.",
    ]


def build_numerology_foundation_summary(
    name: str,
    name_number: Dict[str, Any],
    birth_number: Dict[str, Any],
    destiny_number: Dict[str, Any],
    personal_day: Dict[str, Any],
    language: str,
) -> str:
    if language == "hi":
        return (
            f"{name} की नाम संख्या {name_number['root']}, जन्म संख्या {birth_number['root']}, "
            f"और भाग्य संख्या {destiny_number['root']} है। आज व्यक्तिगत दिन {personal_day['root']} की लय सक्रिय है।"
        )
    if language == "gu":
        return (
            f"{name} નો નામ અંક {name_number['root']}, જન્મ અંક {birth_number['root']}, "
            f"અને ભાગ્ય અંક {destiny_number['root']} છે। આજે વ્યક્તિગત દિવસ {personal_day['root']} ની લય સક્રિય છે।"
        )
    return (
        f"{name} carries name number {name_number['root']}, birth number "
        f"{birth_number['root']}, and destiny number {destiny_number['root']}. "
        f"Today sits in a personal day {personal_day['root']} rhythm."
    )


def build_name_correction_recommendation(same_number: bool, language: str) -> str:
    if language == "hi":
        if same_number:
            return (
                "वर्तनी compound tone बदलती है लेकिन root वही रखती है। अंतिम नाम का निर्णय स्पष्टता, परिवार में उपयोग, कानूनी व्यवहारिकता, और आप उसे कितनी स्थिरता से इस्तेमाल करेंगे, इन आधारों पर करें।"
            )
        return (
            "वर्तनी root number बदलती है, इसलिए नया नाम आपकी वास्तविक जरूरत को सहारा देता है या नहीं, यह देखकर ही उसे सार्वजनिक रूप से अपनाएं।"
        )
    if language == "gu":
        if same_number:
            return (
                "સ્પેલિંગ compound tone બદલે છે પરંતુ root એ જ રાખે છે. અંતિમ નામનો નિર્ણય સ્પષ્ટતા, પરિવારના ઉપયોગ, કાનૂની વ્યવહારિકતા અને તમે તેને કેટલા સતત રીતે વાપરશો તેના આધાર પર કરો।"
            )
        return (
            "સ્પેલિંગ root number બદલે છે, તેથી નવું નામ તમારી વાસ્તવિક જરૂરિયાતને સહારો આપે છે કે નહીં તે જોઈને જ તેને જાહેર રીતે અપનાવો।"
        )
    if same_number:
        return (
            "The spelling changes the compound tone but keeps the same root. Judge the final name by clarity, family use, legal practicality, and how consistently you will use it."
        )
    return (
        "The spelling changes the root number, so compare whether the new expression supports the user's actual goal before using it publicly."
    )


def build_name_correction_safety_rule(language: str) -> str:
    if language == "hi":
        return "कोई guaranteed outcome नहीं, कानूनी नाम बदलने का दबाव नहीं, और डर पैदा करने वाली name advice नहीं।"
    if language == "gu":
        return "કોઈ guaranteed outcome નહીં, કાનૂની નામ બદલવાનો દબાણ નહીં, અને ડર પેદા કરતી name advice નહીં।"
    return "No guaranteed outcome, no pressure to change a legal name, and no fear-based name advice."


def build_numerology_fit_copy(level: str, language: str) -> Dict[str, str]:
    if language == "hi":
        options = {
            "strong": {
                "care": "फिर भी रोज़मर्रा के संवाद पर ध्यान रखें; अच्छा अंक-मेल परिपक्वता की जगह नहीं लेता।",
                "support": "जन्म और भाग्य अंकों में कम से कम दो जगह स्वाभाविक मेल दिख रहा है।",
                "tone": "सहायक",
            },
            "mixed": {
                "care": "एक परत मेल को सहारा देती है, जबकि दूसरी परत में धैर्य और साफ़ अपेक्षाओं की जरूरत है।",
                "support": "स्वभाव, भाग्य, या timing rhythm में कम से कम एक प्राकृतिक पुल मौजूद है।",
                "tone": "मिश्रित लेकिन संभव",
            },
            "careful": {
                "care": "इन अंकों में गति, अपेक्षाओं, और भावनात्मक भाषा पर सचेत मेहनत की जरूरत पड़ सकती है।",
                "support": "अलग अंक भी काम कर सकते हैं, अगर दोनों लोग एक-दूसरे की लय का सम्मान करें।",
                "tone": "सचेत प्रयास जरूरी",
            },
        }
        return options[level]
    if language == "gu":
        options = {
            "strong": {
                "care": "ત્યાં છતાં રોજિંદા સંવાદ પર ધ્યાન રાખો; સારો અંક મેળ પરિપક્વતાની જગ્યા લેતો નથી।",
                "support": "જન્મ અને ભાગ્ય અંકોમાં ઓછામાં ઓછા બે જગ્યાએ સ્વાભાવિક અનુરણન દેખાય છે।",
                "tone": "સમર્થક",
            },
            "mixed": {
                "care": "એક સ્તર મેળને સહારો આપે છે, જ્યારે બીજે ધીરજ અને સ્પષ્ટ અપેક્ષાની જરૂર પડી શકે છે।",
                "support": "સ્વભાવ, ભાગ્ય અથવા timing rhythm માં ઓછામાં ઓછો એક સ્વાભાવિક પુલ છે।",
                "tone": "મિશ્રિત પણ ચાલે એવો",
            },
            "careful": {
                "care": "આ અંકોમાં ગતિ, અપેક્ષા અને ભાવનાત્મક ભાષા અંગે સચેત પ્રયત્ન જરૂરી થઈ શકે છે।",
                "support": "અલગ અંકો પણ કામ કરી શકે છે જો બંને લોકો એકબીજાની લયનો માન રાખે।",
                "tone": "સચેત પ્રયત્ન જરૂરી",
            },
        }
        return options[level]
    options = {
        "strong": {
            "care": "Still watch daily communication style; good number fit does not replace maturity.",
            "support": "The birth and destiny numbers show natural resonance in at least two places.",
            "tone": "supportive",
        },
        "mixed": {
            "care": "One layer supports the match, while another may need patience and clear expectations.",
            "support": "There is at least one natural bridge between instinct, destiny, or timing rhythm.",
            "tone": "mixed but workable",
        },
        "careful": {
            "care": "The numbers may need conscious effort around pace, expectations, and emotional language.",
            "support": "Different numbers can still work when both people respect each other's rhythm.",
            "tone": "requires conscious effort",
        },
    }
    return options[level]


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
    telemetry_started_at = perf_counter()
    rules_result = extract_birth_details_with_rules(request.text)
    system_prompt = (
        "Extract Vedic astrology birth details as strict JSON. Do not guess. "
        "Return exactly these top-level keys: extracted, missingFields, "
        "ambiguities, confidence. Dates must be YYYY-MM-DD when clear. Times "
        "must be HH:mm in 24-hour format when clear. If a 12-hour time lacks "
        "AM/PM, include am_pm in missingFields and add an ambiguity."
    )
    extraction_cache_key = prompt_cache_key("birth_extraction", "v1", system_prompt)
    try:
        text, provider, actual_model = create_ai_text_response(
            model=FREE_REASONING_MODEL,
            system_prompt=system_prompt,
            user_prompt=request.text,
            max_output_tokens=500,
            reasoning_effort="low",
            prompt_cache_key=extraction_cache_key,
            structured_output_schema=structured_output_format("birth_extraction"),
        )
        provider_usage = current_provider_usage()
        payload = parse_json_object(text)
        ai_result = BirthDetailsExtractionResult.model_validate(payload)
    except (AIConfigurationError, AIProviderError, ValueError, json.JSONDecodeError):
        record_ai_telemetry_event(
            active_school="PARASHARI",
            cache_state="bypass",
            estimated_input_tokens=estimate_tokens(system_prompt, request.text),
            estimated_output_tokens=estimate_tokens(
                json.dumps(rules_result.model_dump())
            ),
            fallback_reason="birth-extraction-rules-fallback",
            feature="birth_extraction",
            intent="simple",
            latency_bucket_value=latency_bucket(telemetry_started_at),
            model="birth-extraction-rules-v1",
            provider="deterministic",
            route="/extract-birth-details",
            subject_hash=None,
            success=True,
            user_plan=None,
        )
        return rules_result

    record_ai_telemetry_event(
        active_school="PARASHARI",
        cache_state=(
            "hit"
            if provider_usage and provider_usage.get("cached_input")
            else "miss"
        ),
        estimated_input_tokens=estimate_tokens(system_prompt, request.text),
        estimated_output_tokens=estimate_tokens(text),
        fallback_reason=(
            "openai-unavailable-gemini-fallback" if provider == "gemini" else None
        ),
        feature="birth_extraction",
        intent="simple",
        latency_bucket_value=latency_bucket(telemetry_started_at),
            model=actual_model,
            prompt_cache_key=extraction_cache_key,
            provider_cached_input_tokens=(
                provider_usage.get("cached_input") if provider_usage else None
            ),
            provider_input_tokens=(
                provider_usage.get("input") if provider_usage else None
            ),
            provider_output_tokens=(
                provider_usage.get("output") if provider_usage else None
            ),
            provider=provider,
        route="/extract-birth-details",
        subject_hash=None,
        success=True,
        user_plan=None,
    )

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
    return select_primary_openai_model(intent, user_plan, current_model_pins())


def select_gemini_model(intent: str, user_plan: str) -> str:
    return select_gemini_fallback_model(intent, user_plan, current_model_pins())


def current_model_pins() -> AIModelPins:
    return AIModelPins(
        free_reasoning=FREE_REASONING_MODEL,
        gemini_free=GEMINI_FLASH_MODEL,
        gemini_premium=GEMINI_PRO_MODEL,
        premium_deep=PREMIUM_DEEP_MODEL,
    )


def build_pridicta_system_prompt() -> str:
    return "\n".join(
        [
            "You are Predicta, a warm, intelligent, flexible Vedic astrology guide inside the Predicta app. The API may use the legacy internal name Pridicta, but users should experience Predicta.",
            "You are not a rigid chatbot. You are a seasoned astrology guide, a careful app concierge, and a calm human-sounding reader with real method discipline.",
            "Sound warm, observant, culturally aware, and emotionally steady. Never sound robotic, theatrical, synthetic, transactional, or like a dashboard wrapper.",
            "Answer order usually matters: direct answer first, then why, then chart or system proof, then next step, then a gentle emotional landing if the truth is difficult.",
            "Use emotional intelligence without becoming fake. Notice panic, stress, disappointment, looping reassurance, or shame in the user's wording and adapt the first paragraph accordingly.",
            "When stress is high, shorten the opening, give the headline clearly, avoid jargon overload, acknowledge the pressure, and offer one stabilizing next step.",
            "When the answer is not what the user hoped for, do not lie, do not sugarcoat into fake hope, and do not become cold. Tell the truth carefully and show where timing, support, or improvement still exists.",
            "Devotional warmth is optional and signal-based. Use deity names, Hindu devotional phrases, or Hindu ritual remedies only when the user clearly welcomes that framing.",
            "Never infer religion from the user's name, language, country, or family role. If there is no clear signal, stay warm and neutral.",
            "If the user explicitly prefers practical, secular, non-religious, or non-Hindu framing, avoid deity names, avoid ritual prescriptions, and prefer reflection, discipline, charity, service, communication, boundaries, timing, and routine.",
            "A light joke is allowed only when it genuinely reduces low-stakes panic. Never joke during grief, death anxiety, illness fear, separation panic, abuse, self-harm, or financial distress.",
            "Never sound robotic, judgmental, irritated, transactional, overly blunt, or preachy.",
            "Begin with a brief human acknowledgement before the chart answer. Use tiny micro-statements when helpful: 'I hear you', 'let us look gently', 'one thing stands out', 'this is not a judgment', 'we will keep it practical'.",
            "Understand messy input in English, Hindi, Hinglish, Gujarati, Roman Gujarati, mixed Hindi-English-Gujarati, broken spelling, wrong grammar, and casual WhatsApp-style typing.",
            "Before answering, silently detect the user's language and script, correct spelling and grammar internally, translate the intent into clean English for reasoning, identify the app-bounded action or astrology question, then answer in the requested or dominant response language.",
            "Never tell the user their spelling or grammar is wrong. Infer carefully and ask only for missing critical details.",
            "The supplied Response language is authoritative. Answer in that language unless the current user message is clearly and primarily in another supported language.",
            "Do not use prior conversation language to override the current Response language. If Response language is en and the current message is English, answer only in English.",
            "If the current user message clearly switches language from the selected app language, acknowledge gently once and continue in the user's dominant language. Do not make switching a big issue.",
            "For Hindi responses, use natural Hindi in Devanagari script. Keep expected product/chart codes such as Predicta, D1, D9, KP, Nadi, PDF, Premium, and common Jyotish terms only where they are normal for users.",
            "For Gujarati responses, use natural Gujarati in Gujarati script. Keep expected product/chart codes such as Predicta, D1, D9, KP, Nadi, PDF, Premium, and common Jyotish terms only where they are normal for users.",
            "Do not answer Hindi or Gujarati in romanized Hinglish/Gujlish. Avoid half-translated lines that mix scripts unnecessarily.",
            "For Hindi and Gujarati specialist-room answers, translate ordinary English labels into the native script. Do not leave archetype labels such as Builder, Creator, Master Builder, profile, practical, system, or compatibility in English unless the user explicitly asks for English wording.",
            "When you mention Numerology number archetypes in Hindi or Gujarati, show the meaning in native script first and keep any optional English gloss secondary or omit it entirely.",
            "For Hindi and Gujarati Numerology answers, do not add English label echoes in parentheses after native-script labels. Prefer नाम संख्या, जन्म संख्या, भाग्य संख्या, વ્યક્તિગત વર્ષ, નામ અંક, જન્મ અંક, and ભાગ્ય અંક without Name Number or Birth Number repeats unless the user explicitly asks.",
            "For Signature Predicta in Hindi or Gujarati, do not leave labels such as Baseline upward, Pressure heavy, Legibility partial, Writing rhythm, Confidence expression, or Improvement plan in English. Use native-script trait labels and value labels first.",
            "When the response language is Hindi or Gujarati, greetings and connective phrases should also stay in native script. Do not start with romanized Namaste, Hinglish, or Gujlish.",
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
            "Treat advancedJyotishCoverage.microPointIntelligence as the explicit layer for Uranus, Neptune, Pluto, Gulika, Mandi, Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu, and similar refinements. These are supporting signals; do not let them override classical chart evidence.",
            "When the user asks about micro planets, upagrahas, sensitive points, nakshatra, or pada, explain the point in plain language, then connect it to sign, house, nakshatra, pada, dasha/gochar relevance, and practical meaning for that Kundli.",
            "Nakshatra and pada knowledge matters. Do not mention a nakshatra/pada as a decorative label; explain what that pada changes in the lived expression when the user asks for detail.",
            "Treat holisticFoundation as the shared holistic Jyotish layer. Every serious Parashari answer should distinguish prediction, chart proof, timing, karma pattern, remedy direction, practical action, and safety boundary.",
            "Treat purusharthaLifeBalance as the deterministic life-balance layer: Dharma means purpose and right direction, Artha means money/work/stability, Kama means desire/relationship/gains, and Moksha means peace/release/spiritual grounding.",
            "When the user asks what life area is active, why life feels one-sided, or what to focus on now, use purusharthaLifeBalance before broad motivation.",
            "For remedies, explain the planet's karmic lesson. Planets do not punish or reward randomly; they show karmic patterns. Remedies align conduct, seva, devotion, discipline, charity, and daily choices with the planet's higher expression.",
            "Use the remedy priority in holisticFoundation: conduct correction first, seva/charity second, mantra/prayer third, fasting or discipline fourth, lifestyle practice fifth, gemstones last and only with chart-specific caution.",
            "Use holisticReadingRooms when the user wants a room-like guided reading. Pick the room matching the intent: Today, Karma Remedy, Dharma, Artha, Kama, Moksha, or Timing.",
            "Use sadhanaRemedyPath when the user asks for sadhana, upay, remedy path, seva path, mantra path, or a practice plan. Keep the path staged: conduct, seva, prayer, discipline, lifestyle, review.",
            "Use holisticDailyGuidance when the user asks for daily guidance, today, morning practice, daily sadhana, or what to do today. Give morning practice, midday check, evening review, evidence, and safe boundaries.",
            "Report synthesis rule: when the user asks for a report or PDF, include the holistic spine first: daily rhythm, Purushartha balance, Panchang, sadhana remedy path, timing, and safety boundaries before area-specific sections.",
            "Treat Parashari Chalit as a house-delivery refinement layer only: it keeps the planet's D1 rashi sign but can shift the bhava receiving the result. Do not confuse it with KP cusp/sub-lord judgement.",
            "There are five Predicta specialist rooms: Vedic Predicta, KP Predicta, Jaimini Predicta, Numerology Predicta, and Signature Predicta. They may share user profile and handoff context, but each must stay in its own methodology.",
            "The active predictaRoomContract in Kundli context is authoritative. Follow its identity, allowedData, proofStyle, safetyBehavior, forbiddenMethods, handoffInstruction, and responseShape before any generic guidance.",
            "Vedic Predicta is traditional holistic Vedic Jyotish. It is the wisdom-rich Vedic room and should naturally connect karma, dharma, Purushartha balance, timing, remedy direction, and practical life guidance without sounding abstract.",
            "KP Predicta is Krishnamurti Paddhati: a specialized rule-based system for event timing using KP ayanamsa, Placidus cusps, Nakshatra/star lords, sub lords, sub-sub lords, significators, ruling planets, dasha support, and horary/prashna rules. KP does not use the same interpretive chart logic as regular Parashari.",
            "Jaimini Predicta is a separate classical Jyotish room for Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, Chara Dasha, soul role, visible identity, relationship mirror, career dharma, and destiny chapters.",
            "Numerology Predicta is a separate number-reading room. It uses name number, birth number, destiny number, personal year/month/day, name spelling rhythm, and compatibility numbers. It is not Parashari, KP, or Jaimini unless the user explicitly asks for a cross-method synthesis.",
            "Signature Predicta is a separate signature-analysis room. It uses confirmed visual signature traits, self-expression patterns, improvement suggestions, and optional explicit synthesis. It is not identity verification, handwriting forensics, legal proof, medical diagnosis, hiring advice, or a guaranteed prediction.",
            "Nadi was replaced by Jaimini. Never claim Nadi leaf access, palm-leaf manuscript access, ancient leaf certainty, or lineage-specific records.",
            "If activeContext.predictaSchool is KP, answer as KP Predicta and use the original handoff question plus active birth profile. Do not casually mix Parashari D1/Varga/Yoga logic unless clearly explaining a boundary.",
            "If activeContext.predictaSchool is JAIMINI or legacy NADI, answer as Jaimini Predicta using jaiminiPlan and jaiminiInterpretation. Give prediction and guidance first, then technical evidence. Do not use Parashari yoga/dasha or KP sub-lord rules as the method, and do not fake palm-leaf access.",
            "If activeContext.predictaSchool is NUMEROLOGY, answer as Numerology Predicta using numerologyFoundation and its questionContext first. For name correction, compare the supplied spelling against the current name number. For compatibility, use the supplied partner name/DOB or ask for missing partner data. Keep free answers useful and concise; Premium depth adds multiple spelling comparisons, yearly/monthly timing, compatibility numbers, and report-ready synthesis.",
            "If activeContext.predictaSchool is SIGNATURE, answer as Signature Predicta using signatureAnalysis first. If confirmed traits are present, include traits observed, writing rhythm, confidence expression, consistency, practical improvement plan, and safety boundary. Do not use Parashari, KP, Jaimini, or Numerology as the method unless the user explicitly asks for synthesis.",
            "If activeContext.predictaSchool is PARASHARI or absent and the user asks about KP/Jaimini/Numerology/Signature, politely hand off to the proper specialist room instead of answering from the wrong school.",
            "If the user is inside KP/Jaimini/Numerology/Signature and asks a Vedic/Parashari chart question, give a short boundary and offer Vedic Predicta with the same Kundli context instead of pretending the active room can do everything.",
            "The disciplineHandoff context is authoritative for cross-room requests. If disciplineHandoff.requiresHandoff is true, do not answer using the active room method. Preserve the original question, name the target room, and hand off cleanly.",
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
            "If predictaTone.allowDevotionalPhrasing is false, do not use deity names or ritual remedies unless the user explicitly asks for them in the same message.",
            "If predictaTone.allowDevotionalPhrasing is true, devotional language should still be occasional, natural, and culturally normal, never forced or repetitive.",
            "If predictaTone.humorPolicy is avoid, do not attempt humor.",
            "If predictaTone.highStakesGuardrailMode is true, become calmer, less mystical, and more bounded. Lead with what is knowable, name uncertainty plainly, and give one practical stabilizing next step.",
            "If predictaTone.remedyGuardrail asks for practical stabilizers first, do not jump straight into ritual remedies or deity references.",
            "If predictaTone.gentleLandingNeeded is true, end with one emotionally steady landing line after the practical next step.",
            "Use an audit-friendly but friendly structure: warm acknowledgement, direct answer, confidence, chart evidence, limitations, and practical next step.",
            "Evidence should support the answer without sounding clinical. Start human, then ground the answer naturally in chart or system proof.",
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
    compact_context = compact_predicta_context(
        context,
        user_plan=str(context.get("chartAccess", {}).get("userPlan", "FREE")),
    )
    conversation = "\n".join(
        f"{'User' if turn.role == 'user' else 'Pridicta'}: {turn.text[:900]}"
        for turn in recent_turns
    )
    return build_ordered_prompt(
        static_sections=[
            f"Current date: {current_date.isoformat()}",
            f"Current date rule: all relative timing must be anchored to this date. 'After one year' means around {one_year_later.isoformat()} and 'next 1 year' means {current_date.isoformat()} through {one_year_later.isoformat()}.",
            f"Primary reading area: {primary_area}",
            f"Response language: {language}",
            f"Language instruction: {language_instruction(language)}",
            f"Predicta school context: {context.get('activeContext', {}).get('predictaSchool') if context.get('activeContext') else 'PARASHARI'}",
            f"Handoff question: {context.get('activeContext', {}).get('handoffQuestion') if context.get('activeContext') else None}",
            "Active room contract:",
            json.dumps(context.get("predictaRoomContract"), ensure_ascii=False, indent=2),
            "Predicta app memory digest:",
            json.dumps(context.get("appMemoryDigest"), ensure_ascii=False, indent=2),
            "Generated report context:",
            json.dumps(context.get("generatedReportContext"), ensure_ascii=False, indent=2),
            "Report section memory:",
            json.dumps(context.get("reportSectionMemory"), ensure_ascii=False, indent=2),
            "Predicta tone context:",
            json.dumps(context.get("predictaTone"), ensure_ascii=False, indent=2),
            "Discipline handoff context:",
            json.dumps(context.get("disciplineHandoff"), ensure_ascii=False, indent=2),
            "Synced specialist room context:",
            json.dumps(context.get("specialistContextSync"), ensure_ascii=False, indent=2),
            "Room contract enforcement: obey the active room contract before answering. Use shared Kundli/profile context, but do not mix methods. If another method is needed, make a clean specialist-room handoff.",
            "Predicta memory enforcement: use appMemoryDigest as the product map for routes, reports, rooms, payment, settings, family, support, and free/premium boundaries. If a capability, payment, report, signature sample, or calculation is missing or pending, say that honestly instead of pretending it exists.",
            "Report memory enforcement: if generatedReportContext or reportSectionMemory is supplied, explain what that section means for this user, why it is included, and where premium/report depth changes. Do not merely define the technical area.",
            "Tone enforcement: use predictaTone for answer cadence, devotional-versus-secular framing, humor limits, and emotional landing. Never infer religion beyond the explicit tone signals already provided.",
            "Style preference enforcement: if predictaTone.stylePreference is devotional or secular, treat it as a saved tone preference unless the current user message explicitly asks for the opposite framing.",
            "Discipline handoff enforcement: if disciplineHandoff.requiresHandoff is true, do not provide the requested analysis in the active room. Hand off to disciplineHandoff.targetRoom and preserve disciplineHandoff.originalQuestion.",
            "Specialist context sync rule: use synced specialist room context only to preserve the user's last focus and handoff continuity. Do not borrow another room's method unless the user explicitly asks for synthesis.",
            "Internal normalization instruction: silently detect the user's language, correct spelling/grammar, translate the intent into clean English for reasoning, and map the request to a Predicta app action or chart question before answering.",
            "Do not expose the internal translation or correction unless the user asks for translation help.",
            "Response language enforcement: answer in the Response language unless the current user question is clearly and primarily in another supported language. Ignore older conversation language for this decision.",
            "If the current user's dominant language clearly differs from the response language, briefly acknowledge the switch once and answer in the current user's dominant language.",
            f"High-stakes safety topic: {'yes' if is_high_stakes_message(message) else 'no'}",
            f"Safety protocol: {safety_line}",
            "Safety boundary: high-stakes astrology is allowed with disclaimers and safeguards. Do not provide medical/legal/financial certainty, diagnosis, professional instructions, harmful instructions, or guaranteed outcomes; advise qualified professional support for high-stakes action.",
            "High-stakes delivery rule: for death fear, divorce certainty, child-loss fear, bankruptcy certainty, or terminal-health anxiety, keep the answer short-first, calm, bounded, and practical. No jokes, no ritual escalation, no certainty theater.",
            "Human answer order: direct answer first, then why, then chart or system proof, then next step, then a gentle landing if the answer is difficult.",
            "Holistic answer rule: when relevant, include the karma pattern and a safe practical remedy from holisticFoundation, especially for remedy, dasha, Sade Sati, Gochar, relationship, money, career, and emotional questions.",
            "Holistic reading room rule: when relevant, use holisticReadingRooms to choose one room, show proof chips, explain the practical room practice, and invite the next question without sending the user away.",
            "Sadhana remedy rule: remedies must be framed as a path of behavior correction and steady practice. Start with conduct, then seva, then prayer/mantra, then discipline, lifestyle, and review. Avoid guarantee language.",
            "Purushartha rule: when relevant, explain whether Dharma, Artha, Kama, or Moksha is leading now, which one needs care, and one practical balancing step.",
            "Personal Panchang rule: for today, muhurta, tithi, day planning, daily ritual, or good-time questions, use personalPanchang for weekday lord, tithi, Moon rhythm, current dasha, best actions, cautions, and one simple remedy. Do not sell it as a guaranteed full muhurta.",
            "Holistic daily guidance rule: for daily guidance, today, morning routine, what should I do today, or daily sadhana questions, use holisticDailyGuidance first. Keep it practical: morning practice, midday check, evening review, proof chips, and boundaries.",
            "Holistic decision timing rule: when selectedDecisionSynthesis exists or the user asks whether/when/should I, use that synthesis before giving a final posture. Include timing, decision posture, Purushartha balance, karma remedy support, one practical next step, and a safety boundary.",
            "Report synthesis rule: for report/PDF questions, start with the holistic report spine from holisticDailyGuidance, purusharthaLifeBalance, personalPanchang, sadhanaRemedyPath, and holisticReadingRooms before listing technical sections.",
        ],
        dynamic_sections=[
            "Kundli context:",
            json.dumps(compact_context, ensure_ascii=False, indent=2),
            "Recent conversation:",
            conversation or "No prior conversation.",
            f"User question: {message}",
            "Answer as the active Predicta room using the deterministic evidence first. Follow the active room contract and the formattingContract in jyotishAnalysis.",
        ],
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
    micro_points = [
        planet
        for planet in kundli.planets
        if getattr(planet, "kind", "classical") in {"modern", "sensitive", "upagraha"}
    ]
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
            "Micro planets and upagraha refinements",
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
            "padaMeaning": PADA_MEANINGS.get(moon.pada) if moon else None,
            "rule": "When asked about nakshatra or pada, explain the planet, nakshatra, pada, house, and sign in plain language. Do not give only a textbook keyword.",
        },
        "microPointIntelligence": {
            "rule": (
                "Micro planets, modern outer planets, upagrahas, and sensitive points are supporting refinements. "
                "Use them after classical evidence from Lagna, planets, houses, dasha, gochar, and vargas. "
                "If the user asks about them directly, explain them clearly and non-technically."
            ),
            "freePolicy": "Free readings may mention the most relevant micro point only when it directly helps the answer.",
            "premiumPolicy": "Premium readings can synthesize micro points with nakshatra, pada, dasha, house, and remedies.",
            "points": [
                {
                    "name": planet.name,
                    "kind": planet.kind,
                    "sign": planet.sign,
                    "house": planet.house,
                    "degree": planet.degree,
                    "nakshatra": planet.nakshatra,
                    "pada": planet.pada,
                    "padaMeaning": PADA_MEANINGS.get(planet.pada),
                    "simpleMeaning": planet.simpleMeaning
                    or MICRO_POINT_GUIDANCE.get(planet.name),
                    "howToUse": MICRO_POINT_GUIDANCE.get(
                        planet.name,
                        "Use this as a supporting refinement only.",
                    ),
                    "calculationNote": planet.calculationNote,
                }
                for planet in micro_points
            ],
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
    chalit = kundli.chalit
    kp = kundli.kp

    return {
        "status": "ready" if chalit and kp else "partial",
        "depth": depth,
        "schoolBoundary": (
            "Parashari Chalit belongs with Regular Predicta. KP belongs to KP Predicta: KP cusp/sub-lord judgement belongs to KP Predicta. Keep both separate unless explicitly comparing methods."
        ),
        "bhavChalit": {
            "title": "Parashari Chalit house refinement",
            "rule": "Chalit refines bhava delivery from the Lagna degree; it does not replace D1 Rashi or KP cusps.",
            "houseSystem": chalit.houseSystem if chalit else None,
            "shifts": [item.model_dump() for item in (chalit.shifts[:9] if chalit else [])],
            "cusps": [item.model_dump() for item in (chalit.cusps[:12] if chalit else [])],
            "limitations": chalit.limitations if chalit else ["Chalit pending."],
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


def build_jaimini_plan_context(kundli: KundliData) -> Dict[str, Any]:
    roles = [
        "Atmakaraka",
        "Amatyakaraka",
        "Bhratrikaraka",
        "Matrikaraka",
        "Putrakaraka",
        "Gnatikaraka",
        "Darakaraka",
    ]
    classical_planets = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}
    candidates = sorted(
        [planet for planet in kundli.planets if planet.name in classical_planets],
        key=lambda planet: getattr(planet, "degree", 0),
        reverse=True,
    )
    karakas = [
        {
            "role": roles[index],
            "planet": planet.name,
            "sign": planet.sign,
            "house": planet.house,
            "degree": round(planet.degree, 2),
            "nakshatra": planet.nakshatra,
            "pada": planet.pada,
        }
        for index, planet in enumerate(candidates[: len(roles)])
    ]
    atmakaraka = next((item for item in karakas if item["role"] == "Atmakaraka"), None)
    amatyakaraka = next((item for item in karakas if item["role"] == "Amatyakaraka"), None)
    darakaraka = next((item for item in karakas if item["role"] == "Darakaraka"), None)
    current_chapter = {
        "sign": kundli.lagna,
        "theme": f"{kundli.lagna} asks for cleaner self-direction, visible maturity, and steadier choices.",
        "calculationRule": "Backend Phase 6 compact context uses the Lagna sign as a safe current Jaimini chapter anchor until full Chara Dasha periods are supplied by the shared engine.",
    }

    return {
        "calculationStatus": "ready" if len(karakas) >= 7 else "partial",
        "atmakaraka": atmakaraka,
        "amatyakaraka": amatyakaraka,
        "darakaraka": darakaraka,
        "charaKarakas": karakas,
        "karakamsha": {
            "calculationStatus": "partial",
            "source": "Atmakaraka/Navamsa evidence",
            "evidence": [
                f"Atmakaraka: {atmakaraka['planet']} in {atmakaraka['sign']}." if atmakaraka else "Atmakaraka pending.",
            ],
        },
        "swamsa": {
            "calculationStatus": "partial",
            "source": "Lagna/Navamsa evidence",
            "evidence": ["Swamsa detail is supplied by the shared Jaimini engine when available."],
        },
        "arudhaLagna": {
            "calculationStatus": "partial",
            "padaSign": kundli.lagna,
            "rule": "Compact backend memory preserves Arudha as a visible-identity placeholder until the shared Arudha calculation is supplied.",
        },
        "upapadaLagna": {
            "calculationStatus": "partial",
            "rule": "Compact backend memory preserves Upapada as relationship-mirror context until the shared Upapada calculation is supplied.",
        },
        "jaiminiAspects": [],
        "currentCharaDasha": current_chapter,
        "freeInsight": (
            f"Jaimini points toward {atmakaraka['planet']} as the soul-role signal and {kundli.lagna} as the visible chapter anchor."
            if atmakaraka
            else "Jaimini soul-role evidence is pending."
        ),
        "premiumInsight": "Premium Jaimini connects karakas, Arudha, Upapada, Karakamsha, Swamsa, Jaimini aspects, and Chara Dasha into a deeper destiny reading.",
        "evidenceWarnings": [
            "Backend context is compact; full report-grade Jaimini proof comes from the shared deterministic Jaimini engine.",
        ],
    }


def build_jaimini_interpretation_context(kundli: KundliData) -> Dict[str, Any]:
    plan = build_jaimini_plan_context(kundli)
    atmakaraka = plan.get("atmakaraka")
    amatyakaraka = plan.get("amatyakaraka")
    darakaraka = plan.get("darakaraka")
    summary = (
        f"Jaimini reads {atmakaraka['planet']} as the soul-role signal: life keeps asking for maturity through {atmakaraka['sign']} qualities."
        if atmakaraka
        else "Jaimini reading is waiting for Atmakaraka evidence."
    )
    blocks = [
        {
            "title": "Soul Role",
            "headline": summary,
            "prediction": summary,
            "guidance": "Choose the steadier expression of the soul-role signal before chasing louder outcomes.",
            "technicalEvidence": [
                f"Atmakaraka: {atmakaraka['planet']} in {atmakaraka['sign']} house {atmakaraka['house']}."
                if atmakaraka
                else "Atmakaraka pending.",
            ],
        },
        {
            "title": "Career Dharma",
            "headline": (
                f"{amatyakaraka['planet']} shows the work channel."
                if amatyakaraka
                else "Career dharma evidence is pending."
            ),
            "prediction": (
                f"Work improves when {amatyakaraka['planet']} qualities become useful, visible, and consistent."
                if amatyakaraka
                else "Career guidance stays broad until Amatyakaraka is ready."
            ),
            "guidance": "Make one visible work lane stronger instead of scattering proof everywhere.",
            "technicalEvidence": [
                f"Amatyakaraka: {amatyakaraka['planet']} in {amatyakaraka['sign']} house {amatyakaraka['house']}."
                if amatyakaraka
                else "Amatyakaraka pending.",
            ],
        },
        {
            "title": "Relationship Mirror",
            "headline": (
                f"{darakaraka['planet']} shows the relationship mirror."
                if darakaraka
                else "Relationship mirror evidence is pending."
            ),
            "prediction": (
                f"Close relationships repeatedly ask you to mature the {darakaraka['planet']} lesson with cleaner boundaries and honesty."
                if darakaraka
                else "Relationship guidance stays broad until Darakaraka is ready."
            ),
            "guidance": "Respond slower, name expectations earlier, and do not turn intimacy into a test.",
            "technicalEvidence": [
                f"Darakaraka: {darakaraka['planet']} in {darakaraka['sign']} house {darakaraka['house']}."
                if darakaraka
                else "Darakaraka pending.",
            ],
        },
    ]

    return {
        "calculationStatus": plan["calculationStatus"],
        "summary": summary,
        "freeBlocks": blocks,
        "premiumBlocks": blocks,
        "premiumSummary": "Premium Jaimini deepens soul role, work role, visible identity, relationship mirror, and destiny timing.",
        "technicalEvidence": [
            evidence
            for block in blocks
            for evidence in block["technicalEvidence"]
        ],
        "guardrails": [
            "Give prediction and guidance first.",
            "Keep technical evidence after the answer.",
            "Never claim Nadi leaf or palm-leaf manuscript access.",
        ],
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
    message: str = "",
    history: Iterable[Any] = (),
    style_preference: str = "balanced",
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
    discipline_handoff = build_discipline_handoff_context(chart_context, message)
    generated_report_context = build_generated_report_memory_context(
        chart_context,
        kundli,
        user_plan,
    )
    report_section_memory = find_report_section_memory(chart_context)

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
        "kundliId": kundli.id,
        "activeContext": chart_context.model_dump() if chart_context else None,
        "appMemoryDigest": PREDICTA_APP_MEMORY_DIGEST,
        "generatedReportContext": generated_report_context,
        "reportSectionMemory": report_section_memory,
        "disciplineHandoff": discipline_handoff,
        "specialistContextSync": [
            item.model_dump()
            for item in (chart_context.specialistContexts if chart_context else [])
        ],
        "predictaTone": build_predicta_tone_context(
            message,
            history,
            chart_context,
            style_preference,
        ),
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
            "inputHash": kundli.calculationMeta.inputHash,
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
        "jaiminiPlan": build_jaimini_plan_context(kundli),
        "jaiminiInterpretation": build_jaimini_interpretation_context(kundli),
        "numerologyFoundation": build_numerology_foundation_context(
            kundli,
            message,
            language,
        ),
        "signatureAnalysis": build_signature_analysis_context(message, language),
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


def build_generated_report_memory_context(
    chart_context: Optional[ChartContext],
    kundli: KundliData,
    user_plan: str,
) -> Optional[Dict[str, Any]]:
    if not chart_context:
        return None
    if chart_context.generatedReport:
        return chart_context.generatedReport
    if not chart_context.reportFocus:
        return None

    return {
        "availableSections": chart_context.reportAvailableSections,
        "generatedAt": chart_context.reportGeneratedAt,
        "mode": chart_context.reportMode or ("PREMIUM" if user_plan == "PREMIUM" else "FREE"),
        "reportFocus": chart_context.reportFocus,
        "reportTitle": (
            chart_context.reportType
            or chart_context.reportSectionTitle
            or chart_context.selectedSection
            or "Predicta report"
        ),
        "schoolLane": chart_context.reportSchoolLane or "VEDIC",
        "selectedSections": chart_context.reportSelectedSections,
        "subjectName": chart_context.reportSubjectName or kundli.birthDetails.name,
    }


def find_report_section_memory(
    chart_context: Optional[ChartContext],
) -> Optional[Dict[str, Any]]:
    if not chart_context:
        return None

    query = (
        chart_context.reportSectionId
        or chart_context.reportSectionTitle
        or chart_context.reportSectionPrompt
        or chart_context.selectedSection
    )
    if not query:
        return None

    normalized_query = normalize_memory_query(query)
    for section in PREDICTA_REPORT_SECTION_MEMORY_CATALOG:
        candidates = [
            str(section.get("id", "")),
            str(section.get("title", "")),
            str(section.get("whatItMeans", "")),
        ]
        normalized_candidates = [normalize_memory_query(item) for item in candidates]
        if any(
            normalized_query in candidate
            or candidate in normalized_query
            or has_meaningful_token_overlap(candidate, normalized_query)
            for candidate in normalized_candidates
        ):
            return section
    return None


def normalize_memory_query(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def has_meaningful_token_overlap(candidate: str, query: str) -> bool:
    candidate_tokens = {token for token in candidate.split() if len(token) > 3}
    query_tokens = [token for token in query.split() if len(token) > 3]
    return sum(1 for token in query_tokens if token in candidate_tokens) >= 2


def language_instruction(language: str) -> str:
    if language == "hi":
        return (
            "हिंदी में देवनागरी लिपि का उपयोग करें। भाषा स्वाभाविक, गर्मजोशी भरी और बातचीत जैसी रहे। "
            "Predicta, D1, D9, KP, Nadi, PDF, Premium जैसे अपेक्षित product/chart terms रख सकते हैं, लेकिन romanized Hinglish में जवाब न दें। "
            "Greeting, transition, और archetype labels भी हिंदी में रखें; Builder, Creator, profile, practical, system जैसे साधारण अंग्रेजी शब्द न छोड़ें। "
            "Lagna, dasha, gochar/transit और nakshatra जैसे terms को आसान भाषा में समझाएं।"
        )
    if language == "gu":
        return (
            "ગુજરાતીમાં ગુજરાતી લિપિનો ઉપયોગ કરો। ભાષા સ્વાભાવિક, ઉષ્માભરી અને વાતચીત જેવી રહે। "
            "Predicta, D1, D9, KP, Nadi, PDF, Premium જેવા અપેક્ષિત product/chart terms રાખી શકો, પરંતુ romanized Gujlish માં જવાબ ન આપો। "
            "Greeting, transition અને archetype labels પણ ગુજરાતીમાં રાખો; Builder, Creator, profile, practical, system જેવા સામાન્ય અંગ્રેજી શબ્દો ન છોડો। "
            "Lagna, dasha, gochar/transit અને nakshatra જેવા terms સરળ રીતે સમજાવો."
        )
    return (
        "Answer in clear English. Explain terms like Lagna, dasha, transit, "
        "and nakshatra in plain language."
    )


def is_high_stakes_message(message: str) -> bool:
    return bool(
        re.search(
            r"\b(health|medical|medicine|doctor|hospital|terminal|cancer|disease|surgery|pregnancy|miscarriage|legal|court|lawsuit|contract|police|tax|finance|financial|invest|investing|investment|savings|stock|crypto|loan|debt|insurance|bankrupt|bankruptcy|paisa|paise|money|nana|dhan|karz|udhar|divorce|separation|self-harm|suicide|suicidal|violence|violent|abuse|assault|emergency|behavior|behaviour|criminal|crime|psychopath|mental illness|mental health|depression|anxiety|addiction|aggression|anger issue|grief|death|dying)\b",
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
    prompt_cache_key: Optional[str] = None,
    safety_identifier: Optional[str] = None,
    structured_output_schema: Optional[Dict[str, Any]] = None,
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
    if prompt_cache_key:
        payload["metadata"] = {"predicta_prompt_cache_key": prompt_cache_key}
    if structured_output_schema:
        payload["text"] = structured_output_schema

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

    payload = response.json()
    set_current_provider_usage(extract_openai_token_usage(payload))
    return extract_output_text(payload)


def create_ai_text_response(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int,
    reasoning_effort: str,
    prompt_cache_key: Optional[str] = None,
    safety_identifier: Optional[str] = None,
    structured_output_schema: Optional[Dict[str, Any]] = None,
) -> tuple[str, str, str]:
    openai_error: Optional[Exception] = None
    set_current_provider_usage(None)

    try:
        openai_text = create_openai_text_response(
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_output_tokens=max_output_tokens,
            reasoning_effort=reasoning_effort,
            prompt_cache_key=prompt_cache_key,
            safety_identifier=safety_identifier,
            structured_output_schema=structured_output_schema,
        )
        if openai_text.strip():
            return (openai_text, "openai", model)
        openai_error = AIProviderError("OpenAI returned an empty reading.")
    except (AIConfigurationError, AIProviderError) as exc:
        openai_error = exc

    gemini_model = select_gemini_model(
        "deep" if model == PREMIUM_DEEP_MODEL else "moderate",
        "PREMIUM" if model == PREMIUM_DEEP_MODEL else "FREE",
    )
    try:
        gemini_text = create_gemini_text_response(
            model=gemini_model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_output_tokens=max_output_tokens,
        )
        if gemini_text.strip():
            return (gemini_text, "gemini", gemini_model)
        raise AIProviderError("Gemini returned an empty reading.")
    except (AIConfigurationError, AIProviderError) as exc:
        if isinstance(openai_error, AIConfigurationError):
            if isinstance(exc, AIConfigurationError):
                raise AIConfigurationError(
                    "No AI provider is configured. Set OPENAI_API_KEY or GEMINI_API_KEY."
                ) from exc
            raise openai_error from exc
        raise exc


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

    payload = response.json()
    set_current_provider_usage(extract_gemini_token_usage(payload))
    return extract_gemini_output_text(payload)


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


def set_current_provider_usage(usage: Optional[Dict[str, Optional[int]]]) -> None:
    _CURRENT_PROVIDER_USAGE.set(usage)


def current_provider_usage() -> Optional[Dict[str, Optional[int]]]:
    return _CURRENT_PROVIDER_USAGE.get()


def extract_openai_token_usage(response: Dict[str, Any]) -> Optional[Dict[str, Optional[int]]]:
    usage = response.get("usage")
    if not isinstance(usage, dict):
        return None
    input_details = usage.get("input_tokens_details") or usage.get("prompt_tokens_details")
    cached_input = None
    if isinstance(input_details, dict):
        cached_input = coerce_int(input_details.get("cached_tokens"))
    return {
        "cached_input": cached_input,
        "input": coerce_int(
            usage.get("input_tokens")
            or usage.get("prompt_tokens")
            or usage.get("total_input_tokens")
        ),
        "output": coerce_int(
            usage.get("output_tokens")
            or usage.get("completion_tokens")
            or usage.get("total_output_tokens")
        ),
    }


def extract_gemini_token_usage(response: Dict[str, Any]) -> Optional[Dict[str, Optional[int]]]:
    usage = response.get("usageMetadata")
    if not isinstance(usage, dict):
        return None
    return {
        "input": coerce_int(usage.get("promptTokenCount")),
        "output": coerce_int(
            usage.get("candidatesTokenCount") or usage.get("outputTokenCount")
        ),
    }


def coerce_int(value: Any) -> Optional[int]:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return None


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
