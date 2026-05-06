from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List

import swisseph as swe

from .constants import SIGNS
from .models import BirthDetails, RectificationInsight, RemedyInsight, TimelineEvent, TransitInsight

TRANSIT_PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE,
}
PRESSURE_PLANETS = {"Saturn", "Mars", "Rahu", "Ketu", "Sun"}
SUPPORT_PLANETS = {"Jupiter", "Venus", "Mercury", "Moon"}


def build_phase5_insights(
    *,
    asc_longitude: float,
    ashtakavarga: Dict[str, object],
    birth_details: BirthDetails,
    dasha: Dict[str, object],
    lagna_sign_index: int,
    moon_sign_index: int,
) -> Dict[str, object]:
    transits = build_transits(lagna_sign_index, moon_sign_index)
    rectification = build_rectification(asc_longitude, birth_details)
    remedies = build_remedies(dasha, ashtakavarga, rectification)
    life_timeline = build_life_timeline(dasha, transits, rectification, remedies)

    return {
        "lifeTimeline": life_timeline,
        "transits": transits,
        "rectification": rectification,
        "remedies": remedies,
    }


def build_transits(
    lagna_sign_index: int,
    moon_sign_index: int,
    now: datetime | None = None,
) -> List[TransitInsight]:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    calculated_at = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    jd_ut = julian_day(calculated_at)
    insights: List[TransitInsight] = []

    for name, body_id in TRANSIT_PLANETS.items():
        result, _ = swe.calc_ut(jd_ut, body_id, flags)
        longitude = normalize_longitude(result[0])
        transit_sign_index = sign_index(longitude)
        house_from_lagna = house_from_lagna_index(transit_sign_index, lagna_sign_index)
        house_from_moon = house_from_lagna_index(transit_sign_index, moon_sign_index)
        insights.append(
            TransitInsight(
                planet=name,
                sign=sign_name(longitude),
                degree=round(longitude % 30, 4),
                houseFromLagna=house_from_lagna,
                houseFromMoon=house_from_moon,
                retrograde=result[3] < 0,
                weight=transit_weight(name, house_from_lagna, house_from_moon),
                summary=transit_summary(name, house_from_lagna, house_from_moon),
                calculatedAt=calculated_at.isoformat(),
            )
        )

    rahu_longitude = next(
        item.degree + SIGNS.index(item.sign) * 30
        for item in insights
        if item.planet == "Rahu"
    )
    ketu_longitude = normalize_longitude(rahu_longitude + 180)
    insights.append(
        TransitInsight(
            planet="Ketu",
            sign=sign_name(ketu_longitude),
            degree=round(ketu_longitude % 30, 4),
            houseFromLagna=house_from_lagna_index(
                sign_index(ketu_longitude), lagna_sign_index
            ),
            houseFromMoon=house_from_lagna_index(
                sign_index(ketu_longitude), moon_sign_index
            ),
            retrograde=True,
            weight="mixed",
            summary="Ketu transit highlights detachment, simplification, and release around the houses it crosses.",
            calculatedAt=calculated_at.isoformat(),
        )
    )

    return insights


def build_rectification(
    asc_longitude: float, birth_details: BirthDetails
) -> RectificationInsight:
    asc_degree = asc_longitude % 30
    distance_to_boundary = min(asc_degree, 30 - asc_degree)
    reasons = []
    questions = [
        "Was the recorded birth time taken from a document, hospital memory, or family recollection?",
        "Did major career responsibility arrive earlier, later, or exactly around expected dasha shifts?",
        "Do partnership events align more with sudden turning points or gradual commitments?",
    ]

    if birth_details.isTimeApproximate:
        reasons.append("Birth time is explicitly marked approximate.")
    if distance_to_boundary <= 2:
        reasons.append(
            f"Ascendant is {round(asc_degree, 2)} degrees into the sign, close enough to a sign boundary to merit checking."
        )
    if not reasons:
        reasons.append("Birth time is not marked approximate and ascendant is not near a sign boundary.")

    needs = birth_details.isTimeApproximate or distance_to_boundary <= 2
    return RectificationInsight(
        needsRectification=needs,
        confidence="low" if needs else "high",
        ascendantDegree=round(asc_degree, 4),
        reasons=reasons,
        questions=questions if needs else questions[:1],
    )


def build_remedies(
    dasha: Dict[str, object],
    ashtakavarga: Dict[str, object],
    rectification: RectificationInsight,
) -> List[RemedyInsight]:
    current = dasha["current"]
    weak_houses = list(ashtakavarga["weakestHouses"])[:2]
    remedies = [
        RemedyInsight(
            id="dasha-lord-discipline",
            priority="high",
            area="timing",
            title=f"Work consciously with {current['mahadasha']}",
            practice=f"Keep one weekly discipline dedicated to {current['mahadasha']}: a simple prayer, mantra, study, or service act done without bargaining for results.",
            rationale=f"{current['mahadasha']} Mahadasha is the active life chapter, so remedies should stabilize that planet's expression rather than chase quick fixes.",
            linkedPlanets=[current["mahadasha"], current["antardasha"]],
            linkedHouses=[],
            cadence="Weekly, same day and time if possible",
            caution="Do not use remedies as a substitute for practical decisions or professional help.",
        ),
        RemedyInsight(
            id="weak-house-correction",
            priority="medium",
            area="general",
            title="Protect weaker ashtakavarga houses",
            practice=f"Audit choices connected to houses {', '.join(str(item) for item in weak_houses)} every Sunday evening and remove one avoidable source of strain.",
            rationale="Weak ashtakavarga houses need disciplined correction, not fear-based rituals.",
            linkedPlanets=[],
            linkedHouses=weak_houses,
            cadence="Weekly review",
            caution="Keep the practice small enough that it becomes consistent.",
        ),
    ]

    if rectification.needsRectification:
        remedies.append(
            RemedyInsight(
                id="rectification-journal",
                priority="high",
                area="general",
                title="Rectification event journal",
                practice="Record 12-15 dated life events across education, career, residence, relationships, health, and family before trusting fine divisional timing.",
                rationale="Approximate or boundary-sensitive birth times can shift houses and divisional charts.",
                linkedPlanets=[],
                linkedHouses=[],
                cadence="One-time preparation, then review during readings",
                caution="Do not over-interpret D9/D10/D60 timing until the birth time is checked.",
            )
        )

    return remedies


def build_life_timeline(
    dasha: Dict[str, object],
    transits: List[TransitInsight],
    rectification: RectificationInsight,
    remedies: List[RemedyInsight],
) -> List[TimelineEvent]:
    events: List[TimelineEvent] = []
    today = datetime.now(timezone.utc).date().isoformat()
    current = dasha["current"]
    events.append(
        TimelineEvent(
            id="current-dasha",
            kind="dasha",
            title=f"{current['mahadasha']}/{current['antardasha']}",
            startDate=current["startDate"],
            endDate=current["endDate"],
            planets=[current["mahadasha"], current["antardasha"]],
            summary="Active Vimshottari period delivering current life themes.",
            confidence="high",
        )
    )

    for maha in list(dasha["timeline"])[:3]:
        events.append(
            TimelineEvent(
                id=f"mahadasha-{maha['mahadasha'].lower()}",
                kind="dasha",
                title=f"{maha['mahadasha']} Mahadasha",
                startDate=maha["startDate"],
                endDate=maha["endDate"],
                planets=[maha["mahadasha"]],
                summary="Major life chapter for long-range planning.",
                confidence="high",
            )
        )

    for transit in transits:
        if transit.planet in {"Saturn", "Jupiter", "Rahu", "Ketu"}:
            events.append(
                TimelineEvent(
                    id=f"transit-{transit.planet.lower()}",
                    kind="transit",
                    title=f"{transit.planet} in {transit.sign}",
                    startDate=today,
                    planets=[transit.planet],
                    houses=[transit.houseFromLagna, transit.houseFromMoon],
                    summary=transit.summary,
                    confidence="medium",
                )
            )

    if rectification.needsRectification:
        events.append(
            TimelineEvent(
                id="birth-time-rectification",
                kind="rectification",
                title="Birth time check recommended",
                startDate=today,
                summary=rectification.reasons[0],
                confidence=rectification.confidence,
            )
        )

    for remedy in remedies[:2]:
        events.append(
            TimelineEvent(
                id=f"remedy-{remedy.id}",
                kind="remedy",
                title=remedy.title,
                startDate=today,
                planets=remedy.linkedPlanets,
                houses=remedy.linkedHouses,
                summary=remedy.practice,
                confidence="medium",
            )
        )

    return events


def normalize_longitude(value: float) -> float:
    return value % 360.0


def sign_index(longitude: float) -> int:
    return int(normalize_longitude(longitude) // 30)


def sign_name(longitude: float) -> str:
    return SIGNS[sign_index(longitude)]


def julian_day(utc_dt: datetime) -> float:
    decimal_hour = (
        utc_dt.hour
        + utc_dt.minute / 60
        + utc_dt.second / 3600
        + utc_dt.microsecond / 3_600_000_000
    )
    return swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, decimal_hour)


def house_from_lagna_index(planet_sign_index: int, lagna_sign_index: int) -> int:
    return ((planet_sign_index - lagna_sign_index) % 12) + 1


def transit_weight(planet: str, from_lagna: int, from_moon: int) -> str:
    if planet in SUPPORT_PLANETS and from_lagna in {1, 2, 5, 9, 10, 11}:
        return "supportive"
    if planet in PRESSURE_PLANETS and (from_lagna in {6, 8, 12} or from_moon in {6, 8, 12}):
        return "challenging"
    if planet in {"Saturn", "Rahu", "Ketu"}:
        return "mixed"
    return "neutral"


def transit_summary(planet: str, from_lagna: int, from_moon: int) -> str:
    return (
        f"{planet} is transiting house {from_lagna} from Lagna and house "
        f"{from_moon} from Moon, so read both external events and inner experience."
    )
