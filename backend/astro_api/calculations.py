from __future__ import annotations

import hashlib
import json
import math
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple
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


def calculate_planets(jd_ut: float, lagna_sign_index: int) -> List[PlanetPosition]:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
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
        nakshatra, pada, _, _ = nakshatra_for(longitude)
        planets.append(
            PlanetPosition(
                name=name,
                sign=sign_name(longitude),
                degree=round(longitude % 30, 4),
                absoluteLongitude=round(longitude, 6),
                house=house_from_lagna(sign_index(longitude), lagna_sign_index),
                nakshatra=nakshatra,
                pada=pada,
                retrograde=result[3] < 0,
            )
        )

    rahu_longitude = next(p.absoluteLongitude for p in planets if p.name == "Rahu")
    ketu_longitude = normalize_longitude(rahu_longitude + 180)
    ketu_nakshatra, ketu_pada, _, _ = nakshatra_for(ketu_longitude)
    planets.append(
        PlanetPosition(
            name="Ketu",
            sign=sign_name(ketu_longitude),
            degree=round(ketu_longitude % 30, 4),
            absoluteLongitude=round(ketu_longitude, 6),
            house=house_from_lagna(sign_index(ketu_longitude), lagna_sign_index),
            nakshatra=ketu_nakshatra,
            pada=ketu_pada,
            retrograde=True,
        )
    )

    return planets


def calculate_lagna(jd_ut: float, latitude: float, longitude: float) -> float:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    _, ascmc = swe.houses_ex(
        jd_ut,
        latitude,
        longitude,
        b"P",
        swe.FLG_SWIEPH | swe.FLG_SIDEREAL,
    )
    return normalize_longitude(ascmc[0])


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
            "unsupportedReason": "This divisional chart formula is intentionally not enabled until it is verified.",
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


def generate_kundli(details: BirthDetails) -> KundliData:
    utc_dt = birth_to_utc(details)
    jd_ut = julian_day(utc_dt)
    asc_longitude = calculate_lagna(jd_ut, details.latitude, details.longitude)
    lagna_sign_index = sign_index(asc_longitude)
    planets = calculate_planets(jd_ut, lagna_sign_index)
    moon = next(planet for planet in planets if planet.name == "Moon")
    charts = {
        chart_type: build_chart(chart_type, planets, asc_longitude)
        for chart_type in ALL_CHARTS
    }
    input_hash = build_input_hash(details)

    return KundliData(
        id=input_hash[:16],
        birthDetails=details,
        lagna=SIGNS[lagna_sign_index],
        moonSign=moon.sign,
        nakshatra=moon.nakshatra,
        planets=planets,
        houses=build_houses(planets, lagna_sign_index),
        charts=charts,
        dasha=build_dasha(moon.absoluteLongitude, utc_dt),
        ashtakavarga=build_ashtakavarga(planets, lagna_sign_index),
        yogas=infer_yogas(planets),
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
