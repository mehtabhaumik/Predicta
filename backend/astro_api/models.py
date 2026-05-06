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


SupportedLanguage = Literal["en", "hi", "gu"]
JyotishArea = Literal[
    "career",
    "relationship",
    "wealth",
    "wellbeing",
    "timing",
    "spirituality",
    "general",
]


class TimelineEvent(BaseModel):
    id: str
    kind: Literal["dasha", "transit", "rectification", "remedy"]
    title: str
    startDate: str
    endDate: Optional[str] = None
    planets: List[str] = Field(default_factory=list)
    houses: List[int] = Field(default_factory=list)
    summary: str
    confidence: Literal["low", "medium", "high"]


class TransitInsight(BaseModel):
    planet: str
    sign: str
    degree: float
    houseFromLagna: int
    houseFromMoon: int
    retrograde: bool
    weight: Literal["supportive", "challenging", "mixed", "neutral"]
    summary: str
    calculatedAt: str


class RectificationInsight(BaseModel):
    needsRectification: bool
    confidence: Literal["low", "medium", "high"]
    ascendantDegree: float
    reasons: List[str]
    questions: List[str]


class RemedyInsight(BaseModel):
    id: str
    priority: Literal["low", "medium", "high"]
    area: JyotishArea
    title: str
    practice: str
    rationale: str
    linkedPlanets: List[str] = Field(default_factory=list)
    linkedHouses: List[int] = Field(default_factory=list)
    cadence: str
    caution: str


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
    lifeTimeline: List[TimelineEvent] = Field(default_factory=list)
    transits: List[TransitInsight] = Field(default_factory=list)
    rectification: Optional[RectificationInsight] = None
    remedies: List[RemedyInsight] = Field(default_factory=list)
    calculationMeta: CalculationMeta


class ChartContext(BaseModel):
    chartType: Optional[str] = None
    chartName: Optional[str] = None
    purpose: Optional[str] = None
    selectedPlanet: Optional[str] = None
    selectedHouse: Optional[int] = None
    selectedSection: Optional[str] = None
    selectedTimelineEventId: Optional[str] = None
    selectedTimelineEventTitle: Optional[str] = None
    selectedTimelineEventKind: Optional[str] = None
    selectedTimelineEventWindow: Optional[str] = None
    selectedDailyBriefingDate: Optional[str] = None
    selectedDecisionQuestion: Optional[str] = None
    selectedDecisionArea: Optional[str] = None
    selectedDecisionState: Optional[str] = None
    selectedRemedyId: Optional[str] = None
    selectedRemedyTitle: Optional[str] = None
    selectedBirthTimeDetective: Optional[bool] = None
    selectedRelationshipMirror: Optional[bool] = None
    selectedRelationshipNames: Optional[str] = None
    selectedFamilyKarmaMap: Optional[bool] = None
    selectedFamilyMemberCount: Optional[int] = None
    selectedPredictaWrapped: Optional[bool] = None
    selectedPredictaWrappedYear: Optional[int] = None
    sourceScreen: str


class ConversationTurn(BaseModel):
    role: Literal["user", "pridicta"]
    text: str


AIIntent = Literal["simple", "moderate", "deep"]
UserPlan = Literal["FREE", "PREMIUM"]
AccessLevel = Literal["FREE", "GUEST", "VIP_GUEST", "FULL_ACCESS", "ADMIN"]
PassCodeType = Literal[
    "GUEST_TRIAL",
    "VIP_REVIEW",
    "INVESTOR_PASS",
    "FAMILY_PASS",
    "INTERNAL_TEST",
]
GuestQuotaKind = Literal["question", "deep_reading", "premium_pdf"]


class GuestUsageLimits(BaseModel):
    questionsTotal: int
    deepReadingsTotal: int
    premiumPdfsTotal: int


class GuestPassCode(BaseModel):
    codeId: str
    codeHash: str
    label: str
    type: PassCodeType
    accessLevel: Literal["GUEST", "VIP_GUEST", "FULL_ACCESS"]
    maxRedemptions: int
    redeemedByUserIds: List[str] = Field(default_factory=list)
    redeemedDeviceIds: List[str] = Field(default_factory=list)
    allowedEmails: Optional[List[str]] = None
    expiresAt: str
    usageLimits: GuestUsageLimits
    deviceLimit: int
    isActive: bool
    createdBy: str
    createdAt: str
    revokedAt: Optional[str] = None
    revokeReason: Optional[str] = None


class RedeemedGuestPass(BaseModel):
    passCodeId: str
    type: PassCodeType
    accessLevel: Literal["GUEST", "VIP_GUEST", "FULL_ACCESS"]
    label: str
    redeemedAt: str
    expiresAt: str
    questionsUsed: int
    deepReadingsUsed: int
    premiumPdfsUsed: int
    usageLimits: GuestUsageLimits


class PassRedemptionRequest(BaseModel):
    code: str = Field(min_length=1)
    userId: str = Field(min_length=1)
    email: Optional[str] = None
    deviceId: str = Field(min_length=1)


class PassRedemptionResult(BaseModel):
    redeemedPass: Optional[RedeemedGuestPass] = None
    status: Literal[
        "SUCCESS",
        "INVALID",
        "INACTIVE",
        "EXPIRED",
        "MAX_REDEMPTIONS",
        "EMAIL_NOT_ALLOWED",
        "ALREADY_REDEEMED",
        "DEVICE_LIMIT",
        "RATE_LIMITED",
        "NETWORK_ERROR",
    ]
    message: Optional[str] = None
    updatedPassCode: Optional[GuestPassCode] = None


class AdminGuestPassCreateRequest(BaseModel):
    code: str = Field(min_length=8)
    codeId: str = Field(min_length=1)
    label: str = Field(min_length=1)
    type: PassCodeType
    accessLevel: Literal["GUEST", "VIP_GUEST", "FULL_ACCESS"]
    maxRedemptions: int = Field(ge=1, le=500)
    allowedEmails: List[str] = Field(default_factory=list)
    expiresAt: Optional[str] = None


class AdminGuestPassRevokeRequest(BaseModel):
    reason: str = Field(min_length=1)


class AccessResolveRequest(BaseModel):
    email: Optional[str] = None
    userId: Optional[str] = None


class ResolvedAccessResponse(BaseModel):
    accessLevel: AccessLevel
    isAdmin: bool
    hasPremiumAccess: bool
    hasUnrestrictedAppAccess: bool
    source: Literal[
        "admin_backend",
        "full_access_backend",
        "guest_pass",
        "free",
    ]
    activeGuestPass: Optional[RedeemedGuestPass] = None


class JyotishEvidence(BaseModel):
    id: str
    area: JyotishArea
    title: str
    observation: str
    interpretation: str
    weight: Literal["supportive", "challenging", "mixed", "neutral"]
    source: str


class JyotishAreaAnalysis(BaseModel):
    area: JyotishArea
    summary: str
    confidence: Literal["low", "medium", "high"]
    evidenceIds: List[str]
    practicalFocus: List[str]


class JyotishAnalysis(BaseModel):
    primaryArea: JyotishArea
    evidence: List[JyotishEvidence]
    areaAnalyses: List[JyotishAreaAnalysis]
    formattingContract: List[str]
    limitations: List[str] = Field(default_factory=list)


class PridictaChatRequest(BaseModel):
    message: str = Field(min_length=1)
    kundli: KundliData
    chartContext: Optional[ChartContext] = None
    history: List[ConversationTurn] = Field(default_factory=list)
    userPlan: UserPlan
    deepAnalysis: bool = False
    language: SupportedLanguage = "en"


class PridictaChatResponse(BaseModel):
    text: str
    provider: Literal["openai", "gemini"]
    model: str
    cached: bool = False
    intent: AIIntent
    usedDeepModel: bool = False
    jyotishAnalysis: Optional[JyotishAnalysis] = None


class BirthDetailsDraft(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    meridiem: Optional[Literal["AM", "PM"]] = None
    placeText: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    isTimeApproximate: Optional[bool] = None


class BirthDetailsAmbiguity(BaseModel):
    field: str
    issue: str
    options: Optional[List[str]] = None


class BirthDetailsExtractionRequest(BaseModel):
    text: str = Field(min_length=1)


class BirthDetailsExtractionResult(BaseModel):
    extracted: BirthDetailsDraft = Field(default_factory=BirthDetailsDraft)
    missingFields: List[
        Literal[
            "name",
            "date",
            "time",
            "am_pm",
            "birth_place",
            "country",
            "state",
            "city",
        ]
    ] = Field(default_factory=list)
    ambiguities: List[BirthDetailsAmbiguity] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)
