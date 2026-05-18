from __future__ import annotations

import hashlib
import json
import math
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

import swisseph as swe

from .constants import (
    ASHTAKAVARGA_RULES,
    DASHA_SEQUENCE,
    DASHA_YEARS,
    NAKSHATRAS,
    PLANET_ORDER,
    SIGN_LORDS,
    SIGNS,
    SUPPORTED_VARGAS,
)
from .models import BirthDetails, KundliData, PlanetPosition, YogaInsight
from .phase5_insights import build_phase5_insights

CHART_NAMES = {
    "D1": "Rashi Chart",
    "D2": "Hora Chart",
    "D3": "Drekkana Chart",
    "D4": "Chaturthamsha Chart",
    "D7": "Saptamsha Chart",
    "D9": "Navamsha Chart",
    "D10": "Dashamsha Chart",
    "D12": "Dwadashamsha Chart",
}

ALL_CHARTS = [
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
    "D6",
    "D7",
    "D8",
    "D9",
    "D10",
    "D11",
    "D12",
    "D13",
    "D15",
    "D16",
    "D17",
    "D18",
    "D19",
    "D20",
    "D21",
    "D22",
    "D23",
    "D24",
    "D25",
    "D26",
    "D27",
    "D28",
    "D29",
    "D30",
    "D31",
    "D32",
    "D33",
    "D34",
    "D40",
    "D45",
    "D60",
]

MODERN_PLANET_IDS = {
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
}

MICRO_POINT_MEANINGS = {
    "Uranus": "Modern refinement for sudden change, innovation, disruption, and unusual independence.",
    "Neptune": "Modern refinement for imagination, confusion, spirituality, and subtle sensitivity.",
    "Pluto": "Modern refinement for deep transformation, pressure, power, and rebirth patterns.",
    "Gulika": "Upagraha refinement used for karmic pressure, discipline, and sensitive house reading.",
    "Mandi": "Upagraha refinement used for difficult karmic residue and careful house judgement.",
    "Dhuma": "Solar sensitive point used as a subtle refinement for heat, pressure, and karmic smoke.",
    "Vyatipata": "Solar sensitive point used as a subtle refinement for reversal and imbalance.",
    "Parivesha": "Solar sensitive point used as a subtle refinement for enclosure and protection themes.",
    "Indrachapa": "Solar sensitive point used as a subtle refinement for desire, projection, and atmospheric signals.",
    "Upaketu": "Solar sensitive point used as a subtle refinement linked with Ketu-like detachment signals.",
}

UPAGRAHA_NOTE = (
    "Calculated as a sensitive Jyotish refinement. Classical planets, Lagna, dasha, and chart context remain primary."
)


def normalize_longitude(value: float) -> float:
    return value % 360.0


def sign_index(longitude: float) -> int:
    return int(normalize_longitude(longitude) // 30)


def sign_name(longitude: float) -> str:
    return SIGNS[sign_index(longitude)]


def nakshatra_for(longitude: float) -> Tuple[str, int, int, float]:
    span = 360 / 27
    pada_span = span / 4
    normalized = normalize_longitude(longitude)
    index = int(normalized // span)
    within = normalized - index * span
    pada = int(within // pada_span) + 1
    return NAKSHATRAS[index], pada, index, within / span


def birth_to_utc(details: BirthDetails) -> datetime:
    year, month, day = [int(part) for part in details.date.split("-")]
    hour, minute = [int(part) for part in details.time.split(":")]
    local_dt = datetime(
        year,
        month,
        day,
        hour,
        minute,
        tzinfo=ZoneInfo(details.timezone),
    )
    return local_dt.astimezone(timezone.utc)


def julian_day(utc_dt: datetime) -> float:
    decimal_hour = (
        utc_dt.hour
        + utc_dt.minute / 60
        + utc_dt.second / 3600
        + utc_dt.microsecond / 3_600_000_000
    )
    return swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, decimal_hour)


def datetime_from_julian_day(jd_ut: float) -> datetime:
    year, month, day, decimal_hour = swe.revjul(jd_ut)
    hour = int(decimal_hour)
    minute_float = (decimal_hour - hour) * 60
    minute = int(minute_float)
    second_float = (minute_float - minute) * 60
    second = int(second_float)
    microsecond = int(round((second_float - second) * 1_000_000))
    if microsecond >= 1_000_000:
        second += 1
        microsecond -= 1_000_000
    return datetime(
        year,
        month,
        day,
        hour,
        minute,
        second,
        microsecond,
        tzinfo=timezone.utc,
    )


def build_input_hash(details: BirthDetails) -> str:
    payload = details.model_dump()
    payload.update(
        {
            "ayanamsa": "LAHIRI",
            "engine": "swiss-ephemeris-2.10.03",
            "houseSystem": "WHOLE_SIGN",
            "nodeType": "TRUE_NODE",
            "zodiac": "SIDEREAL",
        }
    )
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    return digest


def house_from_lagna(planet_sign_index: int, lagna_sign_index: int) -> int:
    return ((planet_sign_index - lagna_sign_index) % 12) + 1


def build_planet_position(
    name: str,
    longitude: float,
    lagna_sign_index: int,
    retrograde: bool = False,
    kind: str = "classical",
    simple_meaning: Optional[str] = None,
    calculation_note: Optional[str] = None,
) -> PlanetPosition:
    normalized = normalize_longitude(longitude)
    nakshatra, pada, _, _ = nakshatra_for(normalized)
    return PlanetPosition(
        name=name,
        sign=sign_name(normalized),
        degree=round(normalized % 30, 4),
        absoluteLongitude=round(normalized, 6),
        house=house_from_lagna(sign_index(normalized), lagna_sign_index),
        nakshatra=nakshatra,
        pada=pada,
        retrograde=retrograde,
        kind=kind,  # type: ignore[arg-type]
        simpleMeaning=simple_meaning,
        calculationNote=calculation_note,
    )


def calculate_planets(
    jd_ut: float,
    lagna_sign_index: int,
    sid_mode: int = swe.SIDM_LAHIRI,
) -> List[PlanetPosition]:
    swe.set_sid_mode(sid_mode)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    planet_ids = {
        "Sun": swe.SUN,
        "Moon": swe.MOON,
        "Mars": swe.MARS,
        "Mercury": swe.MERCURY,
        "Jupiter": swe.JUPITER,
        "Venus": swe.VENUS,
        "Saturn": swe.SATURN,
        "Rahu": swe.TRUE_NODE,
    }
    planets: List[PlanetPosition] = []

    for name, body_id in planet_ids.items():
        result, _ = swe.calc_ut(jd_ut, body_id, flags)
        longitude = normalize_longitude(result[0])
        planets.append(
            build_planet_position(
                name=name,
                retrograde=result[3] < 0,
                longitude=longitude,
                lagna_sign_index=lagna_sign_index,
            )
        )

    rahu_longitude = next(p.absoluteLongitude for p in planets if p.name == "Rahu")
    ketu_longitude = normalize_longitude(rahu_longitude + 180)
    planets.append(
        build_planet_position(
            name="Ketu",
            retrograde=True,
            longitude=ketu_longitude,
            lagna_sign_index=lagna_sign_index,
        )
    )

    return planets


def calculate_modern_planets(
    jd_ut: float,
    lagna_sign_index: int,
    sid_mode: int = swe.SIDM_LAHIRI,
) -> List[PlanetPosition]:
    swe.set_sid_mode(sid_mode)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    planets: List[PlanetPosition] = []

    for name, body_id in MODERN_PLANET_IDS.items():
        result, _ = swe.calc_ut(jd_ut, body_id, flags)
        planets.append(
            build_planet_position(
                name=name,
                longitude=result[0],
                lagna_sign_index=lagna_sign_index,
                retrograde=result[3] < 0,
                kind="modern",
                simple_meaning=MICRO_POINT_MEANINGS[name],
                calculation_note=(
                    "Calculated with Swiss Ephemeris as a modern outer-planet refinement. "
                    "Use as supporting context, not as the main Vedic judgement."
                ),
            )
        )

    return planets


def calculate_solar_sensitive_points(
    sun_longitude: float,
    lagna_sign_index: int,
) -> List[PlanetPosition]:
    dhuma = normalize_longitude(sun_longitude + 133 + 20 / 60)
    vyatipata = normalize_longitude(360 - dhuma)
    parivesha = normalize_longitude(vyatipata + 180)
    indrachapa = normalize_longitude(360 - parivesha)
    upaketu = normalize_longitude(indrachapa + 16 + 40 / 60)
    points = {
        "Dhuma": dhuma,
        "Vyatipata": vyatipata,
        "Parivesha": parivesha,
        "Indrachapa": indrachapa,
        "Upaketu": upaketu,
    }

    return [
        build_planet_position(
            name=name,
            longitude=longitude,
            lagna_sign_index=lagna_sign_index,
            kind="sensitive",
            simple_meaning=MICRO_POINT_MEANINGS[name],
            calculation_note=(
                f"{name} is derived from the sidereal Sun longitude. {UPAGRAHA_NOTE}"
            ),
        )
        for name, longitude in points.items()
    ]


def sun_event_jd(
    start_jd_ut: float,
    event_flag: int,
    latitude: float,
    longitude: float,
) -> Optional[float]:
    try:
        result, values = swe.rise_trans(
            start_jd_ut,
            swe.SUN,
            event_flag,
            (longitude, latitude, 0.0),
            flags=swe.FLG_SWIEPH,
        )
    except swe.Error:
        return None

    if result != 0:
        return None

    return values[0]


def local_date_julian_day(details: BirthDetails) -> float:
    local_birth = birth_to_utc(details).astimezone(ZoneInfo(details.timezone))
    local_midnight = local_birth.replace(hour=0, minute=0, second=0, microsecond=0)
    return julian_day(local_midnight.astimezone(timezone.utc))


def gulika_segment_index(local_weekday: int) -> int:
    # Monday is 0 in Python. This maps the Saturn-ruled eighth-part segment
    # used for Gulika/Mandi calculations: Sun=6, Mon=5, Tue=4, Wed=3,
    # Thu=2, Fri=1, Sat=0.
    return {6: 6, 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 0}[local_weekday]


def calculate_gulika_mandi(
    jd_ut: float,
    details: BirthDetails,
    lagna_sign_index: int,
) -> List[PlanetPosition]:
    local_day_jd = local_date_julian_day(details)
    sunrise = sun_event_jd(
        local_day_jd - 0.25,
        swe.CALC_RISE,
        details.latitude,
        details.longitude,
    )
    sunset = sun_event_jd(
        local_day_jd - 0.25,
        swe.CALC_SET,
        details.latitude,
        details.longitude,
    )
    next_sunrise = sun_event_jd(
        local_day_jd + 0.5,
        swe.CALC_RISE,
        details.latitude,
        details.longitude,
    )
    previous_sunset = sun_event_jd(
        local_day_jd - 1.0,
        swe.CALC_SET,
        details.latitude,
        details.longitude,
    )

    if sunrise is None or sunset is None:
        return []

    if sunrise <= jd_ut < sunset:
        arc_start = sunrise
        arc_end = sunset
    elif jd_ut < sunrise and previous_sunset is not None:
        arc_start = previous_sunset
        arc_end = sunrise
    elif next_sunrise is not None:
        arc_start = sunset
        arc_end = next_sunrise
    else:
        return []

    arc_start_local = datetime_from_julian_day(arc_start).astimezone(
        ZoneInfo(details.timezone)
    )
    segment = (arc_end - arc_start) / 8
    saturn_segment = gulika_segment_index(arc_start_local.weekday())
    gulika_jd = arc_start + segment * (saturn_segment + 1)
    mandi_jd = arc_start + segment * saturn_segment
    sensitive_points = {
        "Gulika": calculate_lagna(gulika_jd, details.latitude, details.longitude),
        "Mandi": calculate_lagna(mandi_jd, details.latitude, details.longitude),
    }

    return [
        build_planet_position(
            name=name,
            longitude=longitude,
            lagna_sign_index=lagna_sign_index,
            kind="upagraha",
            simple_meaning=MICRO_POINT_MEANINGS[name],
            calculation_note=(
                f"{name} is calculated from the Saturn segment boundary of the local day/night. "
                f"{UPAGRAHA_NOTE}"
            ),
        )
        for name, longitude in sensitive_points.items()
    ]


def calculate_micro_points(
    jd_ut: float,
    details: BirthDetails,
    lagna_sign_index: int,
    sun_longitude: float,
) -> List[PlanetPosition]:
    return [
        *calculate_modern_planets(jd_ut, lagna_sign_index),
        *calculate_solar_sensitive_points(sun_longitude, lagna_sign_index),
        *calculate_gulika_mandi(jd_ut, details, lagna_sign_index),
    ]


def calculate_lagna(
    jd_ut: float,
    latitude: float,
    longitude: float,
    sid_mode: int = swe.SIDM_LAHIRI,
) -> float:
    swe.set_sid_mode(sid_mode)
    _, ascmc = swe.houses_ex(
        jd_ut,
        latitude,
        longitude,
        b"P",
        swe.FLG_SWIEPH | swe.FLG_SIDEREAL,
    )
    return normalize_longitude(ascmc[0])


def calculate_sun_longitude(jd_ut: float) -> float:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    result, _ = swe.calc_ut(jd_ut, swe.SUN, flags)
    return normalize_longitude(result[0])


def signed_longitude_delta(current: float, target: float) -> float:
    return ((normalize_longitude(current - target) + 180) % 360) - 180


def calculate_house_cusps(
    jd_ut: float,
    latitude: float,
    longitude: float,
    sid_mode: int,
) -> List[float]:
    swe.set_sid_mode(sid_mode)
    cusps, _ = swe.houses_ex(
        jd_ut,
        latitude,
        longitude,
        b"P",
        swe.FLG_SWIEPH | swe.FLG_SIDEREAL,
    )
    return [normalize_longitude(cusp) for cusp in cusps]


def longitude_in_arc(longitude: float, start: float, end: float) -> bool:
    value = normalize_longitude(longitude)
    start = normalize_longitude(start)
    end = normalize_longitude(end)

    if start <= end:
        return start <= value < end

    return value >= start or value < end


def house_from_cusps(longitude: float, cusps: List[float]) -> int:
    for index, start in enumerate(cusps):
        end = cusps[(index + 1) % len(cusps)]
        if longitude_in_arc(longitude, start, end):
            return index + 1

    return 1


def build_cusp_items(cusps: List[float]):
    return [
        {
            "house": index + 1,
            "longitude": round(cusp, 6),
            "sign": sign_name(cusp),
            "degree": round(cusp % 30, 4),
            "signLord": SIGN_LORDS[sign_name(cusp)],
        }
        for index, cusp in enumerate(cusps)
    ]


def shift_direction(rashi_house: int, bhav_house: int) -> str:
    diff = (bhav_house - rashi_house) % 12
    if diff == 0:
        return "same"
    if diff == 1:
        return "next"
    if diff == 11:
        return "previous"
    return "other"


def build_bhav_chalit(
    jd_ut: float,
    details: BirthDetails,
    planets: List[PlanetPosition],
):
    cusps = calculate_house_cusps(
        jd_ut,
        details.latitude,
        details.longitude,
        swe.SIDM_LAHIRI,
    )
    cusp_items = build_cusp_items(cusps)
    planet_placements = []

    for planet in planets:
        bhav_house = house_from_cusps(planet.absoluteLongitude, cusps)
        cusp = cusp_items[bhav_house - 1]
        shifted = bhav_house != planet.house
        planet_placements.append(
            {
                "planet": planet.name,
                "rashiHouse": planet.house,
                "bhavHouse": bhav_house,
                "rashiSign": planet.sign,
                "bhavCuspSign": cusp["sign"],
                "shifted": shifted,
                "shiftDirection": shift_direction(planet.house, bhav_house),
                "absoluteLongitude": round(planet.absoluteLongitude, 6),
            }
        )

    return {
        "status": "ready",
        "houseSystem": "PLACIDUS",
        "ayanamsa": "LAHIRI",
        "description": "KP Bhava/cusp data uses Placidus-style cusps for star-lord, sub-lord, significator, and event-timing judgement.",
        "cusps": cusp_items,
        "planetPlacements": planet_placements,
        "shifts": [item for item in planet_placements if item["shifted"]],
        "limitations": [
            "This KP cusp layer is separate from Parashari Chalit.",
            "Use it for KP cusp, star-lord, sub-lord, significator, and ruling-planet judgement.",
        ],
    }


def build_parashari_chalit(
    asc_longitude: float,
    planets: List[PlanetPosition],
):
    ascendant_degree = round(asc_longitude % 30, 4)
    first_house_start = normalize_longitude(asc_longitude - 15)
    cusps = []
    planet_placements = []

    for house in range(1, 13):
        midpoint = normalize_longitude(asc_longitude + (house - 1) * 30)
        start = normalize_longitude(midpoint - 15)
        end = normalize_longitude(midpoint + 15)
        cusps.append(
            {
                "house": house,
                "midpointLongitude": round(midpoint, 6),
                "startLongitude": round(start, 6),
                "endLongitude": round(end, 6),
                "sign": sign_name(midpoint),
                "degree": round(midpoint % 30, 4),
            }
        )

    for planet in planets:
        offset = normalize_longitude(planet.absoluteLongitude - first_house_start)
        chalit_house = int(offset // 30) + 1
        shifted = chalit_house != planet.house
        planet_placements.append(
            {
                "planet": planet.name,
                "rashiHouse": planet.house,
                "chalitHouse": chalit_house,
                "rashiSign": planet.sign,
                "shifted": shifted,
                "shiftDirection": shift_direction(planet.house, chalit_house),
                "absoluteLongitude": round(planet.absoluteLongitude, 6),
            }
        )

    return {
        "status": "ready",
        "houseSystem": "EQUAL_BHAVA_FROM_LAGNA_DEGREE",
        "ayanamsa": "LAHIRI",
        "ascendantDegree": ascendant_degree,
        "description": "Parashari Chalit keeps the planet's rashi sign from D1, but refines house delivery using the Lagna degree as the midpoint of the first bhava.",
        "cusps": cusps,
        "planetPlacements": planet_placements,
        "shifts": [item for item in planet_placements if item["shifted"]],
        "limitations": [
            "Chalit refines house delivery; it does not change the planet's sign.",
            "D1 Rashi remains the root chart. Chalit is used to refine which bhava receives the result.",
            "Very small birth-time changes can shift planets near bhava boundaries.",
        ],
    }


def rotated_dasha_sequence(start_lord: str) -> List[str]:
    start_index = DASHA_SEQUENCE.index(start_lord)
    return DASHA_SEQUENCE[start_index:] + DASHA_SEQUENCE[:start_index]


def lord_segment_at(start_lord: str, span: float, offset: float) -> Tuple[str, float, float]:
    cursor = 0.0
    sequence = rotated_dasha_sequence(start_lord)
    for index, lord in enumerate(sequence):
        segment = span * DASHA_YEARS[lord] / 120
        if offset <= cursor + segment or index == len(sequence) - 1:
            return lord, cursor, segment
        cursor += segment

    return sequence[-1], cursor, span - cursor


def kp_lord_chain(longitude: float):
    nakshatra_span = 360 / 27
    normalized = normalize_longitude(longitude)
    nakshatra, _, nak_index, _ = nakshatra_for(normalized)
    within_star = normalized - nak_index * nakshatra_span
    star_lord = DASHA_SEQUENCE[nak_index % 9]
    sub_lord, sub_start, sub_span = lord_segment_at(
        star_lord,
        nakshatra_span,
        within_star,
    )
    sub_sub_lord, _, _ = lord_segment_at(
        sub_lord,
        sub_span,
        max(within_star - sub_start, 0),
    )

    return {
        "signLord": SIGN_LORDS[sign_name(normalized)],
        "starLord": star_lord,
        "subLord": sub_lord,
        "subSubLord": sub_sub_lord,
        "nakshatra": nakshatra,
    }


def calculate_kp_planets(jd_ut: float, kp_cusps: List[float]):
    swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    planet_ids = {
        "Sun": swe.SUN,
        "Moon": swe.MOON,
        "Mars": swe.MARS,
        "Mercury": swe.MERCURY,
        "Jupiter": swe.JUPITER,
        "Venus": swe.VENUS,
        "Saturn": swe.SATURN,
        "Rahu": swe.TRUE_NODE,
    }
    planets = []

    for name, body_id in planet_ids.items():
        result, _ = swe.calc_ut(jd_ut, body_id, flags)
        longitude = normalize_longitude(result[0])
        planets.append(
            {
                "planet": name,
                "longitude": round(longitude, 6),
                "sign": sign_name(longitude),
                "degree": round(longitude % 30, 4),
                "house": house_from_cusps(longitude, kp_cusps),
                "retrograde": result[3] < 0,
                "lordChain": kp_lord_chain(longitude),
            }
        )

    rahu_longitude = next(item["longitude"] for item in planets if item["planet"] == "Rahu")
    ketu_longitude = normalize_longitude(rahu_longitude + 180)
    planets.append(
        {
            "planet": "Ketu",
            "longitude": round(ketu_longitude, 6),
            "sign": sign_name(ketu_longitude),
            "degree": round(ketu_longitude % 30, 4),
            "house": house_from_cusps(ketu_longitude, kp_cusps),
            "retrograde": True,
            "lordChain": kp_lord_chain(ketu_longitude),
        }
    )

    return planets


def unique_houses(values: List[int]) -> List[int]:
    return sorted({value for value in values if value})


def houses_owned_by(planet: str, cusps: List[dict]) -> List[int]:
    if planet in {"Rahu", "Ketu"}:
        return []

    return [cusp["house"] for cusp in cusps if cusp["lordChain"]["signLord"] == planet]


def houses_for_planet_role(planet: str, kp_planets: List[dict], cusps: List[dict]) -> List[int]:
    kp_planet = next((item for item in kp_planets if item["planet"] == planet), None)
    occupied = [kp_planet["house"]] if kp_planet else []
    return unique_houses(occupied + houses_owned_by(planet, cusps))


def build_kp_significators(kp_planets: List[dict], cusps: List[dict]):
    significators = []

    for planet in kp_planets:
        star_houses = houses_for_planet_role(
            planet["lordChain"]["starLord"],
            kp_planets,
            cusps,
        )
        sub_houses = houses_for_planet_role(
            planet["lordChain"]["subLord"],
            kp_planets,
            cusps,
        )
        owned_houses = houses_owned_by(planet["planet"], cusps)
        combined = unique_houses([planet["house"]] + owned_houses + star_houses + sub_houses)
        strength = "A" if star_houses else "B" if sub_houses else "C" if owned_houses else "D"
        significators.append(
            {
                "planet": planet["planet"],
                "occupiedHouse": planet["house"],
                "ownedHouses": owned_houses,
                "starLordHouses": star_houses,
                "subLordHouses": sub_houses,
                "signifiesHouses": combined,
                "strength": strength,
                "simpleMeaning": (
                    f"{planet['planet']} connects KP event judgment to houses "
                    f"{', '.join(str(house) for house in combined) or 'pending'} "
                    f"through occupation, sign lordship, star lord, and sub lord links."
                ),
            }
        )

    return significators


def build_kp_system(jd_ut: float, birth_utc: datetime, details: BirthDetails):
    kp_cusps = calculate_house_cusps(
        jd_ut,
        details.latitude,
        details.longitude,
        swe.SIDM_KRISHNAMURTI,
    )
    cusps = [
        {
            "house": index + 1,
            "longitude": round(cusp, 6),
            "sign": sign_name(cusp),
            "degree": round(cusp % 30, 4),
            "lordChain": kp_lord_chain(cusp),
        }
        for index, cusp in enumerate(kp_cusps)
    ]
    planets = calculate_kp_planets(jd_ut, kp_cusps)
    moon = next(planet for planet in planets if planet["planet"] == "Moon")
    lagna_chain = kp_lord_chain(kp_cusps[0])
    weekday_lords = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]

    return {
        "status": "foundation",
        "method": "KRISHNAMURTI_PADDHATI",
        "title": "KP Horoscope Foundation",
        "description": "KP is treated as a separate stellar astrology school using Placidus cusps, Krishnamurti ayanamsa, star lords, sub lords, significators, and ruling-planet logic.",
        "ayanamsa": "KRISHNAMURTI",
        "houseSystem": "PLACIDUS",
        "cusps": cusps,
        "planets": planets,
        "significators": build_kp_significators(planets, cusps),
        "rulingPlanets": {
            "dayLord": weekday_lords[birth_utc.astimezone(ZoneInfo(details.timezone)).weekday()],
            "moonSignLord": moon["lordChain"]["signLord"],
            "moonStarLord": moon["lordChain"]["starLord"],
            "moonSubLord": moon["lordChain"]["subLord"],
            "lagnaSignLord": lagna_chain["signLord"],
            "lagnaStarLord": lagna_chain["starLord"],
            "lagnaSubLord": lagna_chain["subLord"],
        },
        "horaryNote": "KP Horary/Prashna uses question-time cusps, ruling planets, and often a 1-249 number. This natal KP horoscope stays separate from Parashari so event timing is not blended casually.",
        "limitations": [
            "Use this KP layer for cusp, star-lord, sub-lord, significator, and ruling-planet evidence.",
            "Event prediction needs cusp-specific sub-lord judgment, dasha support, ruling planets, and the exact question.",
            "KP should remain separate from Parashari/D1 interpretation instead of being blended casually.",
        ],
    }


def build_houses(planets: List[PlanetPosition], lagna_sign_index: int):
    houses = []
    for house in range(1, 13):
        sign = SIGNS[(lagna_sign_index + house - 1) % 12]
        houses.append(
            {
                "house": house,
                "sign": sign,
                "lord": SIGN_LORDS[sign],
                "planets": [planet.name for planet in planets if planet.house == house],
            }
        )
    return houses


def varga_sign(chart_type: str, longitude: float) -> int | None:
    sign = sign_index(longitude)
    degree = longitude % 30

    if chart_type == "D1":
        return sign
    if chart_type == "D2":
        first_half = degree < 15
        odd = sign % 2 == 0
        return 4 if (first_half and odd) or (not first_half and not odd) else 3
    if chart_type == "D3":
        part = int(degree // 10)
        return (sign + part * 4) % 12
    if chart_type == "D4":
        part = int(degree // 7.5)
        return (sign + part * 3) % 12
    if chart_type == "D7":
        part = min(int(degree // (30 / 7)), 6)
        start = sign if sign % 2 == 0 else (sign + 6) % 12
        return (start + part) % 12
    if chart_type == "D9":
        part = min(int(degree // (30 / 9)), 8)
        if sign in {0, 3, 6, 9}:
            start = sign
        elif sign in {1, 4, 7, 10}:
            start = (sign + 8) % 12
        else:
            start = (sign + 4) % 12
        return (start + part) % 12
    if chart_type == "D10":
        part = min(int(degree // 3), 9)
        start = sign if sign % 2 == 0 else (sign + 8) % 12
        return (start + part) % 12
    if chart_type == "D12":
        part = min(int(degree // 2.5), 11)
        return (sign + part) % 12
    return None


def build_chart(chart_type: str, planets: List[PlanetPosition], asc_longitude: float):
    if chart_type not in SUPPORTED_VARGAS:
        return {
            "chartType": chart_type,
            "name": CHART_NAMES.get(chart_type, chart_type),
            "ascendantSign": sign_name(asc_longitude),
            "signPlacements": {sign: [] for sign in SIGNS},
            "housePlacements": {house: [] for house in range(1, 13)},
            "planetDistribution": [],
            "supported": False,
            "unsupportedReason": "Predicta is still reviewing this chart before using it for guidance.",
        }

    asc_sign = varga_sign(chart_type, asc_longitude)
    assert asc_sign is not None
    planet_distribution = []
    sign_placements = {sign: [] for sign in SIGNS}
    house_placements = {house: [] for house in range(1, 13)}

    for planet in planets:
        planet_varga_sign = varga_sign(chart_type, planet.absoluteLongitude)
        assert planet_varga_sign is not None
        planet_sign = SIGNS[planet_varga_sign]
        planet_house = house_from_lagna(planet_varga_sign, asc_sign)
        sign_placements[planet_sign].append(planet.name)
        house_placements[planet_house].append(planet.name)
        planet_distribution.append(
            planet.model_copy(update={"sign": planet_sign, "house": planet_house})
        )

    return {
        "chartType": chart_type,
        "name": CHART_NAMES.get(chart_type, chart_type),
        "ascendantSign": SIGNS[asc_sign],
        "signPlacements": sign_placements,
        "housePlacements": house_placements,
        "planetDistribution": planet_distribution,
        "supported": True,
    }


def build_dasha(moon_longitude: float, birth_utc: datetime):
    _, _, nak_index, nak_fraction = nakshatra_for(moon_longitude)
    ruler = DASHA_SEQUENCE[nak_index % 9]
    elapsed_years = DASHA_YEARS[ruler] * nak_fraction
    start = birth_utc - timedelta(days=elapsed_years * 365.2425)
    sequence_index = DASHA_SEQUENCE.index(ruler)
    today = datetime.now(timezone.utc)
    timeline = []
    cursor = start
    current = None

    for offset in range(10):
        maha = DASHA_SEQUENCE[(sequence_index + offset) % len(DASHA_SEQUENCE)]
        maha_days = DASHA_YEARS[maha] * 365.2425
        maha_start = cursor
        maha_end = maha_start + timedelta(days=maha_days)
        antardashas = []
        antar_cursor = maha_start

        for antar_offset in range(9):
            antar = DASHA_SEQUENCE[
                (DASHA_SEQUENCE.index(maha) + antar_offset) % len(DASHA_SEQUENCE)
            ]
            antar_days = maha_days * DASHA_YEARS[antar] / 120
            antar_start = antar_cursor
            antar_end = antar_start + timedelta(days=antar_days)
            item = {
                "antardasha": antar,
                "startDate": antar_start.date().isoformat(),
                "endDate": antar_end.date().isoformat(),
            }
            antardashas.append(item)
            if maha_start <= today <= maha_end and antar_start <= today <= antar_end:
                current = {
                    "mahadasha": maha,
                    "antardasha": antar,
                    "startDate": item["startDate"],
                    "endDate": item["endDate"],
                }
            antar_cursor = antar_end

        timeline.append(
            {
                "mahadasha": maha,
                "startDate": maha_start.date().isoformat(),
                "endDate": maha_end.date().isoformat(),
                "antardashas": antardashas,
            }
        )
        cursor = maha_end

    if current is None:
        first = timeline[0]["antardashas"][0]
        current = {
            "mahadasha": timeline[0]["mahadasha"],
            "antardasha": first["antardasha"],
            "startDate": first["startDate"],
            "endDate": first["endDate"],
        }

    return {"current": current, "timeline": timeline}


def build_ashtakavarga(planets: List[PlanetPosition], lagna_sign_index: int):
    reference_signs = {
        planet.name: sign_index(planet.absoluteLongitude)
        for planet in planets
        if planet.name in PLANET_ORDER
    }
    reference_signs["Lagna"] = lagna_sign_index
    bav: Dict[str, List[int]] = {}

    for target, source_rules in ASHTAKAVARGA_RULES.items():
        scores = [0] * 12
        for source, places in source_rules.items():
            source_sign = reference_signs[source]
            for place in places:
                scores[(source_sign + place - 1) % 12] += 1
        bav[target] = scores

    sav = [sum(bav[planet][index] for planet in PLANET_ORDER) for index in range(12)]
    ranked_signs = sorted(range(12), key=lambda index: sav[index], reverse=True)
    weakest_signs = sorted(range(12), key=lambda index: sav[index])

    return {
        "bav": bav,
        "sav": sav,
        "totalScore": sum(sav),
        "strongestHouses": [
            house_from_lagna(sign, lagna_sign_index) for sign in ranked_signs[:3]
        ],
        "weakestHouses": [
            house_from_lagna(sign, lagna_sign_index) for sign in weakest_signs[:3]
        ],
    }


def infer_yogas(planets: List[PlanetPosition]) -> List[YogaInsight]:
    by_name = {planet.name: planet for planet in planets}
    yogas: List[YogaInsight] = []
    if by_name["Sun"].house == by_name["Mercury"].house:
        yogas.append(
            YogaInsight(
                name="Budha-Aditya Yoga",
                strength="moderate",
                meaning="Sun and Mercury share a house, supporting intelligent expression when ego and analysis stay balanced.",
            )
        )
    if by_name["Saturn"].sign in {"Capricorn", "Aquarius", "Libra"}:
        yogas.append(
            YogaInsight(
                name="Shani Strength Pattern",
                strength="strong",
                meaning="Saturn carries structural strength, rewarding discipline, patience, and responsibility.",
            )
        )
    if not yogas:
        yogas.append(
            YogaInsight(
                name="Steady Dharma Pattern",
                strength="mild",
                meaning="The chart benefits from consistent effort and clear intention more than dramatic remedies.",
            )
        )
    return yogas


def safe_birthday(year: int, month: int, day: int) -> datetime:
    try:
        return datetime(year, month, day, tzinfo=timezone.utc)
    except ValueError:
        return datetime(year, 2, 28, tzinfo=timezone.utc)


def birthday_local_datetime(details: BirthDetails, year: int) -> datetime:
    month, day = [int(part) for part in details.date.split("-")[1:]]
    hour, minute = [int(part) for part in details.time.split(":")]
    try:
        return datetime(
            year,
            month,
            day,
            hour,
            minute,
            tzinfo=ZoneInfo(details.timezone),
        )
    except ValueError:
        return datetime(
            year,
            2,
            28,
            hour,
            minute,
            tzinfo=ZoneInfo(details.timezone),
        )


def find_solar_return_jd(natal_sun_longitude: float, center_utc: datetime) -> float:
    center_jd = julian_day(center_utc)
    start_jd = center_jd - 4
    end_jd = center_jd + 4
    best_jd = center_jd
    best_abs_delta = abs(
        signed_longitude_delta(calculate_sun_longitude(center_jd), natal_sun_longitude)
    )
    previous_jd = start_jd
    previous_delta = signed_longitude_delta(
        calculate_sun_longitude(previous_jd),
        natal_sun_longitude,
    )
    bracket = None

    for step in range(1, 193):
        current_jd = start_jd + (end_jd - start_jd) * step / 192
        current_delta = signed_longitude_delta(
            calculate_sun_longitude(current_jd),
            natal_sun_longitude,
        )
        abs_delta = abs(current_delta)
        if abs_delta < best_abs_delta:
            best_abs_delta = abs_delta
            best_jd = current_jd
        if previous_delta == 0 or current_delta == 0 or (
            previous_delta < 0 < current_delta
        ) or (previous_delta > 0 > current_delta):
            bracket = (previous_jd, current_jd)
            break
        previous_jd = current_jd
        previous_delta = current_delta

    if bracket is None:
        return best_jd

    low, high = bracket
    low_delta = signed_longitude_delta(
        calculate_sun_longitude(low),
        natal_sun_longitude,
    )
    for _ in range(64):
        mid = (low + high) / 2
        mid_delta = signed_longitude_delta(
            calculate_sun_longitude(mid),
            natal_sun_longitude,
        )
        if abs(mid_delta) < 0.000001:
            return mid
        if (low_delta < 0 < mid_delta) or (low_delta > 0 > mid_delta):
            high = mid
        else:
            low = mid
            low_delta = mid_delta

    return (low + high) / 2


def build_yearly_horoscope(
    details: BirthDetails,
    asc_longitude: float,
    natal_sun_longitude: float,
) -> Dict:
    birth_year = int(details.date.split("-")[0])
    birth_month = int(details.date.split("-")[1])
    birth_day = int(details.date.split("-")[2])
    local_now = datetime.now(ZoneInfo(details.timezone))
    birthday_this_year = safe_birthday(
        local_now.year,
        birth_month,
        birth_day,
    ).replace(tzinfo=ZoneInfo(details.timezone))
    year_start = local_now.year if local_now >= birthday_this_year else local_now.year - 1
    center_utc = birthday_local_datetime(details, year_start).astimezone(timezone.utc)
    next_center_utc = birthday_local_datetime(details, year_start + 1).astimezone(timezone.utc)
    solar_return_jd = find_solar_return_jd(natal_sun_longitude, center_utc)
    next_solar_return_jd = find_solar_return_jd(natal_sun_longitude, next_center_utc)
    solar_return_utc = datetime_from_julian_day(solar_return_jd)
    next_solar_return_utc = datetime_from_julian_day(next_solar_return_jd)
    varsha_asc_longitude = calculate_lagna(
        solar_return_jd,
        details.latitude,
        details.longitude,
    )
    varsha_lagna_index = sign_index(varsha_asc_longitude)
    natal_lagna_index = sign_index(asc_longitude)
    completed_age = max(0, year_start - birth_year)
    muntha_index = (natal_lagna_index + completed_age) % 12
    varsha_planets = calculate_planets(solar_return_jd, varsha_lagna_index)

    return {
        "status": "foundation",
        "method": "TAJIKA_SOLAR_RETURN_FOUNDATION",
        "yearLabel": f"{year_start}-{year_start + 1}",
        "solarYearStart": solar_return_utc.date().isoformat(),
        "solarYearEnd": next_solar_return_utc.date().isoformat(),
        "solarReturnUtc": solar_return_utc.isoformat(),
        "varshaLagna": SIGNS[varsha_lagna_index],
        "munthaSign": SIGNS[muntha_index],
        "munthaHouse": house_from_lagna(muntha_index, natal_lagna_index),
        "munthaLord": SIGN_LORDS[SIGNS[muntha_index]],
        "yearAge": completed_age,
        "planets": varsha_planets,
        "limitations": [
            "This yearly reading uses solar return, Muntha, dasha, and current Gochar.",
            "Advanced Tajika yogas, Sahams, and Muntha strength scoring belong in the detailed yearly reading.",
        ],
    }


def generate_kundli(details: BirthDetails) -> KundliData:
    utc_dt = birth_to_utc(details)
    jd_ut = julian_day(utc_dt)
    asc_longitude = calculate_lagna(jd_ut, details.latitude, details.longitude)
    lagna_sign_index = sign_index(asc_longitude)
    planets = calculate_planets(jd_ut, lagna_sign_index)
    moon = next(planet for planet in planets if planet.name == "Moon")
    sun = next(planet for planet in planets if planet.name == "Sun")
    planets = [
        *planets,
        *calculate_micro_points(
            jd_ut,
            details,
            lagna_sign_index,
            sun.absoluteLongitude,
        ),
    ]
    charts = {
        chart_type: build_chart(chart_type, planets, asc_longitude)
        for chart_type in ALL_CHARTS
    }
    input_hash = build_input_hash(details)
    dasha = build_dasha(moon.absoluteLongitude, utc_dt)
    ashtakavarga = build_ashtakavarga(planets, lagna_sign_index)
    phase5 = build_phase5_insights(
        asc_longitude=asc_longitude,
        ashtakavarga=ashtakavarga,
        birth_details=details,
        dasha=dasha,
        lagna_sign_index=lagna_sign_index,
        moon_sign_index=sign_index(moon.absoluteLongitude),
    )

    return KundliData(
        id=input_hash[:16],
        birthDetails=details,
        lagna=SIGNS[lagna_sign_index],
        moonSign=moon.sign,
        nakshatra=moon.nakshatra,
        planets=planets,
        houses=build_houses(planets, lagna_sign_index),
        charts=charts,
        chalit=build_parashari_chalit(asc_longitude, planets),
        bhavChalit=build_bhav_chalit(jd_ut, details, planets),
        kp=build_kp_system(jd_ut, utc_dt, details),
        yearlyHoroscope=build_yearly_horoscope(
            details,
            asc_longitude,
            sun.absoluteLongitude,
        ),
        dasha=dasha,
        ashtakavarga=ashtakavarga,
        yogas=infer_yogas(planets),
        lifeTimeline=phase5["lifeTimeline"],
        transits=phase5["transits"],
        rectification=phase5["rectification"],
        remedies=phase5["remedies"],
        calculationMeta={
            "provider": "swiss-ephemeris",
            "providerVersion": swe.version,
            "ephemerisVersion": swe.version,
            "zodiac": "SIDEREAL",
            "ayanamsa": "LAHIRI",
            "houseSystem": "WHOLE_SIGN",
            "nodeType": "TRUE_NODE",
            "calculatedAt": datetime.now(timezone.utc).isoformat(),
            "inputHash": input_hash,
            "utcDateTime": utc_dt.isoformat(),
        },
    )
