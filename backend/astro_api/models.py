from typing import Dict, List, Literal, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, Field, field_validator


class BirthDetails(BaseModel):
    name: str = Field(min_length=1)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    place: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone: str
    isTimeApproximate: bool = False

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("timezone must be a valid IANA timezone") from exc
        return value


class PlanetPosition(BaseModel):
    name: str
    sign: str
    degree: float
    absoluteLongitude: float
    house: int
    nakshatra: str
    pada: int
    retrograde: bool


class HouseData(BaseModel):
    house: int
    sign: str
    lord: str
    planets: List[str]


class ChartData(BaseModel):
    chartType: str
    name: str
    ascendantSign: str
    signPlacements: Dict[str, List[str]]
    housePlacements: Dict[int, List[str]]
    planetDistribution: List[PlanetPosition]
    supported: bool
    unsupportedReason: Optional[str] = None


class VimshottariCurrent(BaseModel):
    mahadasha: str
    antardasha: str
    startDate: str
    endDate: str


class VimshottariAntardasha(BaseModel):
    antardasha: str
    startDate: str
    endDate: str


class VimshottariTimelineItem(BaseModel):
    mahadasha: str
    startDate: str
    endDate: str
    antardashas: List[VimshottariAntardasha]


class VimshottariDashaData(BaseModel):
    current: VimshottariCurrent
    timeline: List[VimshottariTimelineItem]


class AshtakavargaData(BaseModel):
    bav: Dict[str, List[int]]
    sav: List[int]
    totalScore: int
    strongestHouses: List[int]
    weakestHouses: List[int]


class YogaInsight(BaseModel):
    name: str
    strength: Literal["mild", "moderate", "strong"]
    meaning: str


class CalculationMeta(BaseModel):
    provider: Literal["swiss-ephemeris"]
    providerVersion: str
    ephemerisVersion: str
    zodiac: Literal["SIDEREAL"]
    ayanamsa: Literal["LAHIRI"]
    houseSystem: Literal["WHOLE_SIGN"]
    nodeType: Literal["TRUE_NODE", "MEAN_NODE"]
    calculatedAt: str
    inputHash: str
    utcDateTime: str


class KundliData(BaseModel):
    id: str
    birthDetails: BirthDetails
    lagna: str
    moonSign: str
    nakshatra: str
    planets: List[PlanetPosition]
    houses: List[HouseData]
    charts: Dict[str, ChartData]
    dasha: VimshottariDashaData
    ashtakavarga: AshtakavargaData
    yogas: List[YogaInsight]
    calculationMeta: CalculationMeta
