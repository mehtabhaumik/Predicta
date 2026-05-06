from __future__ import annotations

import re
from typing import Dict, Iterable, List, Optional

from .constants import SIGN_LORDS, SIGNS
from .models import (
    ChartContext,
    JyotishAnalysis,
    JyotishAreaAnalysis,
    JyotishEvidence,
    KundliData,
    PlanetPosition,
)

BENEFICS = {"Jupiter", "Venus", "Mercury", "Moon"}
FUNCTIONAL_PRESSURE = {"Saturn", "Mars", "Rahu", "Ketu", "Sun"}
OWN_SIGNS = {
    "Sun": {"Leo"},
    "Moon": {"Cancer"},
    "Mars": {"Aries", "Scorpio"},
    "Mercury": {"Gemini", "Virgo"},
    "Jupiter": {"Sagittarius", "Pisces"},
    "Venus": {"Taurus", "Libra"},
    "Saturn": {"Capricorn", "Aquarius"},
}
EXALTATION_SIGNS = {
    "Sun": "Aries",
    "Moon": "Taurus",
    "Mars": "Capricorn",
    "Mercury": "Virgo",
    "Jupiter": "Cancer",
    "Venus": "Pisces",
    "Saturn": "Libra",
}
DEBILITATION_SIGNS = {
    "Sun": "Libra",
    "Moon": "Scorpio",
    "Mars": "Cancer",
    "Mercury": "Pisces",
    "Jupiter": "Capricorn",
    "Venus": "Virgo",
    "Saturn": "Aries",
}
AREA_KEYWORDS = {
    "career": re.compile(r"career|job|work|business|profession|promotion|d10", re.I),
    "relationship": re.compile(
        r"marriage|relationship|partner|spouse|love|divorce|d9", re.I
    ),
    "wealth": re.compile(r"money|wealth|finance|income|savings|property|d2", re.I),
    "wellbeing": re.compile(r"health|wellbeing|stress|sleep|disease|anxiety", re.I),
    "spirituality": re.compile(r"spiritual|mantra|remed|sadhana|dharma|d20", re.I),
    "timing": re.compile(r"when|timing|dasha|period|transit|future|next", re.I),
}
FORMAT_CONTRACT = [
    "Start with a direct answer in 2-4 sentences.",
    "Include a 'Chart evidence' section with 3-5 bullets grounded in deterministic evidence.",
    "Include 'Timing' when dasha or period evidence is relevant.",
    "End with practical guidance or remedies tied to the cited evidence.",
    "Call out mixed evidence instead of flattening it into certainty.",
]


def build_jyotish_analysis(
    kundli: KundliData,
    message: str,
    chart_context: Optional[ChartContext] = None,
    user_plan: str = "PREMIUM",
) -> JyotishAnalysis:
    primary_area = detect_primary_area(message, chart_context)
    evidence: List[JyotishEvidence] = []
    area_analyses: List[JyotishAreaAnalysis] = []

    for builder in [
        build_general_evidence,
        build_career_evidence,
        build_relationship_evidence,
        build_wealth_evidence,
        build_wellbeing_evidence,
        build_timing_evidence,
        build_spirituality_evidence,
    ]:
        evidence.extend(builder(kundli))

    evidence = filter_evidence_for_plan(evidence, user_plan)

    for area in [
        "career",
        "relationship",
        "wealth",
        "wellbeing",
        "timing",
        "spirituality",
        "general",
    ]:
        area_evidence = [item for item in evidence if item.area == area]
        area_analyses.append(build_area_analysis(area, area_evidence))

    limitations = []
    if kundli.birthDetails.isTimeApproximate:
        limitations.append(
            "Birth time is marked approximate, so house-sensitive readings and divisional charts need extra caution."
        )
    unsupported_focus = unsupported_chart_limitation(kundli, chart_context)
    if unsupported_focus:
        limitations.append(unsupported_focus)
    locked_focus = locked_chart_limitation(chart_context, user_plan)
    if locked_focus:
        limitations.append(locked_focus)
    if user_plan != "PREMIUM":
        limitations.append(
            "Free preview uses D1 houses, D1 planets, and dasha timing only. Premium unlocks divisional chart proof such as D2, D9, D10, and D12."
        )

    return JyotishAnalysis(
        primaryArea=primary_area,
        evidence=rank_evidence(evidence, primary_area),
        areaAnalyses=rank_area_analyses(area_analyses, primary_area),
        formattingContract=FORMAT_CONTRACT,
        limitations=limitations,
    )


def filter_evidence_for_plan(
    evidence_items: List[JyotishEvidence], user_plan: str
) -> List[JyotishEvidence]:
    if user_plan == "PREMIUM":
        return evidence_items

    return [
        item
        for item in evidence_items
        if re.match(r"^D1(\s|$)", item.source)
        or item.source == "Vimshottari dasha"
    ]


def locked_chart_limitation(
    chart_context: Optional[ChartContext], user_plan: str
) -> Optional[str]:
    if user_plan == "PREMIUM" or not chart_context or not chart_context.chartType:
        return None
    if chart_context.chartType != "D1":
        return f"{chart_context.chartType} is a Premium chart in Predicta, so free answers should not use it as chart proof."
    return None


def detect_primary_area(
    message: str, chart_context: Optional[ChartContext]
) -> str:
    context_text = " ".join(
        part
        for part in [
            chart_context.chartType if chart_context else None,
            chart_context.chartName if chart_context else None,
            chart_context.purpose if chart_context else None,
            chart_context.selectedSection if chart_context else None,
            message,
        ]
        if part
    )

    for area, pattern in AREA_KEYWORDS.items():
        if pattern.search(context_text):
            return area

    return "general"


def build_general_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    lagna_lord = SIGN_LORDS[kundli.lagna]
    moon = planet(kundli, "Moon")
    lagna_lord_planet = planet(kundli, lagna_lord)
    items = [
        evidence(
            "general-lagna",
            "general",
            "Lagna and chart orientation",
            f"{kundli.lagna} lagna with {lagna_lord} as lagna lord.",
            f"The reading should begin from {kundli.lagna} themes and the condition of {lagna_lord}.",
            weight_for_planet(lagna_lord_planet),
            "D1 lagna",
        ),
        evidence(
            "general-moon",
            "general",
            "Moon sign and nakshatra",
            f"Moon is in {kundli.moonSign}, {kundli.nakshatra} nakshatra.",
            "The Moon shows emotional patterning and how timing is experienced internally.",
            weight_for_planet(moon),
            "D1 Moon",
        ),
    ]
    return items


def build_career_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    tenth = house(kundli, 10)
    sixth = house(kundli, 6)
    eleventh = house(kundli, 11)
    d10 = kundli.charts.get("D10")
    items = [
        house_evidence(
            kundli,
            "career-10th-house",
            "career",
            10,
            "10th house of karma and public work",
            "The 10th house sets the public role, authority pattern, and visible contribution.",
        ),
        house_evidence(
            kundli,
            "career-6th-house",
            "career",
            6,
            "6th house of service and competition",
            "The 6th house shows work pressure, discipline, daily service, and ability to handle competition.",
        ),
        house_evidence(
            kundli,
            "career-11th-house",
            "career",
            11,
            "11th house of gains and networks",
            "The 11th house shows whether effort converts into recognition, income, and helpful circles.",
        ),
    ]
    if d10 and d10.supported:
        items.append(
            evidence(
                "career-d10",
                "career",
                "D10 career divisional chart",
                f"D10 ascendant is {d10.ascendantSign}; occupied D10 houses: {occupied_houses(d10.housePlacements)}.",
                "D10 verifies whether the career promise can mature in public work and responsibility.",
                "supportive"
                if has_benefic(d10.housePlacements.get(10, []))
                else "mixed",
                "D10",
            )
        )
    for body in ["Saturn", "Sun", "Mercury", "Jupiter"]:
        position = planet(kundli, body)
        if position:
            items.append(
                planet_evidence(
                    f"career-{body.lower()}",
                    "career",
                    position,
                    f"{body} career significator",
                    career_planet_interpretation(position),
                )
            )
    return items


def build_relationship_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    d9 = kundli.charts.get("D9")
    items = [
        house_evidence(
            kundli,
            "relationship-7th-house",
            "relationship",
            7,
            "7th house of partnership",
            "The 7th house shows commitment style, spouse/partner dynamics, and negotiation patterns.",
        ),
        planet_evidence(
            "relationship-venus",
            "relationship",
            planet(kundli, "Venus"),
            "Venus relationship significator",
            "Venus shows affection, attraction, harmony, and the ability to receive partnership gracefully.",
        ),
        planet_evidence(
            "relationship-jupiter",
            "relationship",
            planet(kundli, "Jupiter"),
            "Jupiter guidance and commitment significator",
            "Jupiter shows wisdom, protection, counsel, and maturity in long-term bonds.",
        ),
    ]
    if d9 and d9.supported:
        items.append(
            evidence(
                "relationship-d9",
                "relationship",
                "D9 Navamsha verification",
                f"D9 ascendant is {d9.ascendantSign}; occupied D9 houses: {occupied_houses(d9.housePlacements)}.",
                "D9 is essential for marriage, dharma, and the deeper strength of planets after maturity.",
                "supportive"
                if has_benefic(d9.housePlacements.get(7, []))
                else "mixed",
                "D9",
            )
        )
    return [item for item in items if item is not None]


def build_wealth_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    d2 = kundli.charts.get("D2")
    items = [
        house_evidence(
            kundli,
            "wealth-2nd-house",
            "wealth",
            2,
            "2nd house of savings and family resources",
            "The 2nd house shows stored wealth, speech, food, family support, and money habits.",
        ),
        house_evidence(
            kundli,
            "wealth-11th-house",
            "wealth",
            11,
            "11th house of income and gains",
            "The 11th house shows gains, networks, repeat income, and fulfillment of ambitions.",
        ),
        house_evidence(
            kundli,
            "wealth-9th-house",
            "wealth",
            9,
            "9th house of fortune and guidance",
            "The 9th house shows luck, counsel, ethics, teachers, and the grace behind prosperity.",
        ),
        planet_evidence(
            "wealth-jupiter",
            "wealth",
            planet(kundli, "Jupiter"),
            "Jupiter wealth significator",
            "Jupiter shows expansion, judgment, protection, and ability to grow resources wisely.",
        ),
        planet_evidence(
            "wealth-venus",
            "wealth",
            planet(kundli, "Venus"),
            "Venus comfort and asset significator",
            "Venus shows comfort, liquidity, enjoyment, and material refinement.",
        ),
    ]
    if d2 and d2.supported:
        items.append(
            evidence(
                "wealth-d2",
                "wealth",
                "D2 Hora wealth chart",
                f"D2 ascendant is {d2.ascendantSign}; occupied D2 houses: {occupied_houses(d2.housePlacements)}.",
                "D2 helps verify how resources are handled and whether wealth support is steady or uneven.",
                "supportive"
                if has_benefic(d2.housePlacements.get(2, []))
                else "mixed",
                "D2",
            )
        )
    return [item for item in items if item is not None]


def build_wellbeing_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    return [
        house_evidence(
            kundli,
            "wellbeing-1st-house",
            "wellbeing",
            1,
            "1st house of body and vitality",
            "The 1st house shows constitution, stamina, and how life force is carried.",
        ),
        house_evidence(
            kundli,
            "wellbeing-6th-house",
            "wellbeing",
            6,
            "6th house of imbalance and recovery",
            "The 6th house shows disease patterns, routines, and the capacity to correct imbalance.",
        ),
        house_evidence(
            kundli,
            "wellbeing-8th-house",
            "wellbeing",
            8,
            "8th house of hidden stress",
            "The 8th house shows sudden pressure, vulnerability, and deep transformation patterns.",
        ),
        planet_evidence(
            "wellbeing-moon",
            "wellbeing",
            planet(kundli, "Moon"),
            "Moon mental steadiness",
            "Moon indicates emotional regulation, sleep rhythm, and subjective stress response.",
        ),
        planet_evidence(
            "wellbeing-saturn",
            "wellbeing",
            planet(kundli, "Saturn"),
            "Saturn chronic pressure pattern",
            "Saturn shows endurance, depletion risk, structure, and the need for disciplined recovery.",
        ),
    ]


def build_timing_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    current = kundli.dasha.current
    maha = planet(kundli, current.mahadasha)
    antar = planet(kundli, current.antardasha)
    next_period = None
    for timeline in kundli.dasha.timeline:
        for item in timeline.antardashas:
            if item.startDate > current.endDate:
                next_period = item
                break
        if next_period:
            break

    items = [
        evidence(
            "timing-current-dasha",
            "timing",
            "Current Vimshottari period",
            f"{current.mahadasha} Mahadasha / {current.antardasha} Antardasha from {current.startDate} to {current.endDate}.",
            "Current dasha shows which planets are actively delivering results now.",
            combine_weights(weight_for_planet(maha), weight_for_planet(antar)),
            "Vimshottari dasha",
        )
    ]
    if maha:
        items.append(
            planet_evidence(
                "timing-mahadasha-lord",
                "timing",
                maha,
                f"{current.mahadasha} Mahadasha lord",
                "The Mahadasha lord sets the wider life chapter and the type of karma currently ripening.",
            )
        )
    if antar:
        items.append(
            planet_evidence(
                "timing-antardasha-lord",
                "timing",
                antar,
                f"{current.antardasha} Antardasha lord",
                "The Antardasha lord shows the active sub-theme and near-term trigger.",
            )
        )
    return items


def build_spirituality_evidence(kundli: KundliData) -> List[JyotishEvidence]:
    d20 = kundli.charts.get("D20")
    items = [
        house_evidence(
            kundli,
            "spirituality-9th-house",
            "spirituality",
            9,
            "9th house of dharma and teachers",
            "The 9th house shows faith, blessings, teachers, pilgrimage, and higher principles.",
        ),
        house_evidence(
            kundli,
            "spirituality-12th-house",
            "spirituality",
            12,
            "12th house of surrender and retreat",
            "The 12th house shows silence, release, sleep, retreat, foreign lands, and moksha orientation.",
        ),
        planet_evidence(
            "spirituality-jupiter",
            "spirituality",
            planet(kundli, "Jupiter"),
            "Jupiter dharma significator",
            "Jupiter indicates wisdom, gurus, scriptures, faith, and protection through right counsel.",
        ),
    ]
    if d20 and d20.supported:
        items.append(
            evidence(
                "spirituality-d20",
                "spirituality",
                "D20 spiritual practice chart",
                f"D20 ascendant is {d20.ascendantSign}; occupied D20 houses: {occupied_houses(d20.housePlacements)}.",
                "D20 verifies spiritual practice, devotion, mantra discipline, and inner blessings.",
                "mixed",
                "D20",
            )
        )
    return [item for item in items if item is not None]


def build_area_analysis(area: str, evidence_items: List[JyotishEvidence]) -> JyotishAreaAnalysis:
    supportive = sum(1 for item in evidence_items if item.weight == "supportive")
    challenging = sum(1 for item in evidence_items if item.weight == "challenging")
    mixed = sum(1 for item in evidence_items if item.weight == "mixed")
    confidence = "high" if len(evidence_items) >= 5 else "medium"
    if mixed >= 2 or abs(supportive - challenging) <= 1:
        confidence = "medium"
    if len(evidence_items) < 3:
        confidence = "low"

    if supportive > challenging and supportive >= mixed:
        summary = f"{area.title()} has more supportive than difficult chart factors, but timing still matters."
    elif challenging > supportive:
        summary = f"{area.title()} needs disciplined handling because pressure factors are prominent."
    else:
        summary = f"{area.title()} shows mixed evidence, so the answer should preserve nuance."

    return JyotishAreaAnalysis(
        area=area,
        summary=summary,
        confidence=confidence,
        evidenceIds=[item.id for item in evidence_items[:5]],
        practicalFocus=practical_focus_for(area, supportive, challenging, mixed),
    )


def house_evidence(
    kundli: KundliData,
    item_id: str,
    area: str,
    house_number: int,
    title: str,
    interpretation: str,
) -> JyotishEvidence:
    house_data = house(kundli, house_number)
    planets = house_data.planets if house_data else []
    lord = house_data.lord if house_data else "Unknown"
    sign = house_data.sign if house_data else "Unknown"
    score = ashtakavarga_house_score(kundli, house_number)
    score_text = f"; SAV score {score}" if score is not None else ""
    weight = weight_for_house(planets, score)
    return evidence(
        item_id,
        area,
        title,
        f"House {house_number} is {sign}, ruled by {lord}, with {format_planets(planets)}{score_text}.",
        interpretation,
        weight,
        f"D1 house {house_number}",
    )


def planet_evidence(
    item_id: str,
    area: str,
    position: Optional[PlanetPosition],
    title: str,
    interpretation: str,
) -> Optional[JyotishEvidence]:
    if not position:
        return None
    dignity = dignity_for(position)
    retrograde = " retrograde" if position.retrograde else ""
    return evidence(
        item_id,
        area,
        title,
        f"{position.name} is in {position.sign} house {position.house}, {position.nakshatra} pada {position.pada}{retrograde}; dignity: {dignity}.",
        interpretation,
        weight_for_planet(position),
        f"D1 {position.name}",
    )


def evidence(
    item_id: str,
    area: str,
    title: str,
    observation: str,
    interpretation: str,
    weight: str,
    source: str,
) -> JyotishEvidence:
    return JyotishEvidence(
        id=item_id,
        area=area,
        title=title,
        observation=observation,
        interpretation=interpretation,
        weight=weight,
        source=source,
    )


def rank_evidence(items: List[JyotishEvidence], primary_area: str) -> List[JyotishEvidence]:
    def score(item: JyotishEvidence) -> int:
        area_score = 0 if item.area == primary_area else 1
        weight_score = {"mixed": 0, "supportive": 1, "challenging": 1, "neutral": 2}[
            item.weight
        ]
        return area_score * 10 + weight_score

    return sorted(items, key=score)


def rank_area_analyses(
    items: List[JyotishAreaAnalysis], primary_area: str
) -> List[JyotishAreaAnalysis]:
    return sorted(items, key=lambda item: 0 if item.area == primary_area else 1)


def practical_focus_for(
    area: str, supportive: int, challenging: int, mixed: int
) -> List[str]:
    base = {
        "career": ["Prioritize consistent output", "Choose visible responsibility"],
        "relationship": ["Use direct communication", "Move slowly around commitment timing"],
        "wealth": ["Keep money decisions documented", "Favor steady accumulation over speculation"],
        "wellbeing": ["Protect sleep and routine", "Reduce avoidable overload"],
        "timing": ["Act with the current dasha lord, not against it", "Review commitments near dasha transitions"],
        "spirituality": ["Keep practice simple and repeatable", "Use devotion as discipline, not escape"],
        "general": ["Make one clean decision at a time", "Prefer evidence over anxiety"],
    }[area]

    if challenging > supportive:
        return [base[0], "Reduce risk before increasing speed"]
    if mixed:
        return [base[0], "Test before making permanent commitments"]
    return base


def unsupported_chart_limitation(
    kundli: KundliData, chart_context: Optional[ChartContext]
) -> Optional[str]:
    if not chart_context or not chart_context.chartType:
        return None
    chart = kundli.charts.get(chart_context.chartType)
    if chart and not chart.supported:
        return f"{chart_context.chartType} is not verified in the calculation engine, so it should not be used as evidence."
    return None


def planet(kundli: KundliData, name: str) -> Optional[PlanetPosition]:
    return next((item for item in kundli.planets if item.name == name), None)


def house(kundli: KundliData, number: int):
    return next((item for item in kundli.houses if item.house == number), None)


def ashtakavarga_house_score(kundli: KundliData, house_number: int) -> Optional[int]:
    house_data = house(kundli, house_number)
    if not house_data:
        return None
    try:
        return kundli.ashtakavarga.sav[SIGNS.index(house_data.sign)]
    except (ValueError, IndexError):
        return None


def dignity_for(position: PlanetPosition) -> str:
    if EXALTATION_SIGNS.get(position.name) == position.sign:
        return "exalted"
    if DEBILITATION_SIGNS.get(position.name) == position.sign:
        return "debilitated"
    if position.sign in OWN_SIGNS.get(position.name, set()):
        return "own sign"
    return "ordinary"


def weight_for_planet(position: Optional[PlanetPosition]) -> str:
    if not position:
        return "neutral"
    dignity = dignity_for(position)
    if dignity in {"exalted", "own sign"}:
        return "supportive"
    if dignity == "debilitated":
        return "challenging"
    if position.retrograde:
        return "mixed"
    if position.name in BENEFICS and position.house in {1, 2, 4, 5, 7, 9, 10, 11}:
        return "supportive"
    if position.name in FUNCTIONAL_PRESSURE and position.house in {6, 8, 12}:
        return "challenging"
    return "mixed"


def weight_for_house(planets: Iterable[str], score: Optional[int]) -> str:
    planet_set = set(planets)
    benefic_count = len(planet_set & BENEFICS)
    pressure_count = len(planet_set & FUNCTIONAL_PRESSURE)

    if score is not None:
        if score >= 32 and pressure_count == 0:
            return "supportive"
        if score <= 24 or pressure_count > benefic_count + 1:
            return "challenging"

    if benefic_count > pressure_count:
        return "supportive"
    if pressure_count > benefic_count:
        return "mixed"
    return "neutral"


def combine_weights(first: str, second: str) -> str:
    if "challenging" in {first, second} and "supportive" in {first, second}:
        return "mixed"
    if first == second:
        return first
    if "mixed" in {first, second}:
        return "mixed"
    if "challenging" in {first, second}:
        return "challenging"
    if "supportive" in {first, second}:
        return "supportive"
    return "neutral"


def has_benefic(planets: Iterable[str]) -> bool:
    return bool(set(planets) & BENEFICS)


def occupied_houses(house_placements: Dict[int, List[str]]) -> str:
    occupied = [
        f"{house}: {format_planets(planets)}"
        for house, planets in house_placements.items()
        if planets
    ]
    return "; ".join(occupied) if occupied else "none"


def format_planets(planets: Iterable[str]) -> str:
    planet_list = list(planets)
    return ", ".join(planet_list) if planet_list else "no planets"


def career_planet_interpretation(position: PlanetPosition) -> str:
    meanings = {
        "Saturn": "Saturn shows discipline, endurance, responsibility, structure, and slow professional consolidation.",
        "Sun": "Sun shows authority, leadership, visibility, recognition, and relationship with power.",
        "Mercury": "Mercury shows analysis, communication, trade, skill, writing, and adaptability.",
        "Jupiter": "Jupiter shows judgment, teaching, counsel, ethics, growth, and professional protection.",
    }
    return meanings.get(position.name, "This planet contributes to career expression.")
