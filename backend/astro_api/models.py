from typing import Any, Dict, List, Literal, Optional
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
    kind: Literal["classical", "modern", "upagraha", "sensitive"] = "classical"
    simpleMeaning: Optional[str] = None
    calculationNote: Optional[str] = None


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


class BhavChalitCusp(BaseModel):
    house: int
    longitude: float
    sign: str
    degree: float
    signLord: str


class BhavChalitPlanetPlacement(BaseModel):
    planet: str
    rashiHouse: int
    bhavHouse: int
    rashiSign: str
    bhavCuspSign: str
    shifted: bool
    shiftDirection: Literal["previous", "same", "next", "other"]
    absoluteLongitude: float


class BhavChalitData(BaseModel):
    status: Literal["ready", "pending"]
    houseSystem: Literal["PLACIDUS"]
    ayanamsa: Literal["LAHIRI"]
    description: str
    cusps: List[BhavChalitCusp]
    planetPlacements: List[BhavChalitPlanetPlacement]
    shifts: List[BhavChalitPlanetPlacement]
    limitations: List[str] = Field(default_factory=list)


class ChalitCusp(BaseModel):
    house: int
    midpointLongitude: float
    startLongitude: float
    endLongitude: float
    sign: str
    degree: float


class ChalitPlanetPlacement(BaseModel):
    planet: str
    rashiHouse: int
    chalitHouse: int
    rashiSign: str
    shifted: bool
    shiftDirection: Literal["previous", "same", "next", "other"]
    absoluteLongitude: float


class ChalitData(BaseModel):
    status: Literal["ready", "pending"]
    houseSystem: Literal["EQUAL_BHAVA_FROM_LAGNA_DEGREE"]
    ayanamsa: Literal["LAHIRI"]
    ascendantDegree: float
    description: str
    cusps: List[ChalitCusp]
    planetPlacements: List[ChalitPlanetPlacement]
    shifts: List[ChalitPlanetPlacement]
    limitations: List[str] = Field(default_factory=list)


class KPLordChain(BaseModel):
    signLord: str
    starLord: str
    subLord: str
    subSubLord: str
    nakshatra: str


class KPCusp(BaseModel):
    house: int
    longitude: float
    sign: str
    degree: float
    lordChain: KPLordChain


class KPPlanet(BaseModel):
    planet: str
    longitude: float
    sign: str
    degree: float
    house: int
    retrograde: bool
    lordChain: KPLordChain


class KPSignificator(BaseModel):
    planet: str
    occupiedHouse: Optional[int] = None
    ownedHouses: List[int] = Field(default_factory=list)
    starLordHouses: List[int] = Field(default_factory=list)
    subLordHouses: List[int] = Field(default_factory=list)
    signifiesHouses: List[int] = Field(default_factory=list)
    strength: Literal["A", "B", "C", "D"]
    simpleMeaning: str


class KPRulingPlanets(BaseModel):
    dayLord: str
    moonSignLord: str
    moonStarLord: str
    moonSubLord: str
    lagnaSignLord: str
    lagnaStarLord: str
    lagnaSubLord: str


class KPSystemData(BaseModel):
    status: Literal["ready", "foundation", "pending"]
    method: Literal["KRISHNAMURTI_PADDHATI"]
    title: str
    description: str
    ayanamsa: Literal["KRISHNAMURTI"]
    houseSystem: Literal["PLACIDUS"]
    cusps: List[KPCusp]
    planets: List[KPPlanet]
    significators: List[KPSignificator]
    rulingPlanets: KPRulingPlanets
    horaryNote: str
    limitations: List[str] = Field(default_factory=list)


class YearlyHoroscopeData(BaseModel):
    status: Literal["ready", "foundation", "pending"]
    method: Literal["TAJIKA_SOLAR_RETURN_FOUNDATION"]
    yearLabel: str
    solarYearStart: str
    solarYearEnd: str
    solarReturnUtc: str
    varshaLagna: str
    munthaSign: str
    munthaHouse: int
    munthaLord: str
    yearAge: int
    planets: List[PlanetPosition]
    limitations: List[str] = Field(default_factory=list)


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
    chalit: Optional[ChalitData] = None
    bhavChalit: Optional[BhavChalitData] = None
    kp: Optional[KPSystemData] = None
    yearlyHoroscope: Optional[YearlyHoroscopeData] = None
    dasha: VimshottariDashaData
    ashtakavarga: AshtakavargaData
    yogas: List[YogaInsight]
    lifeTimeline: List[TimelineEvent] = Field(default_factory=list)
    transits: List[TransitInsight] = Field(default_factory=list)
    rectification: Optional[RectificationInsight] = None
    remedies: List[RemedyInsight] = Field(default_factory=list)
    calculationMeta: CalculationMeta


class SpecialistPredictaContextSnapshot(BaseModel):
    handoffFrom: Optional[str] = None
    handoffQuestion: Optional[str] = None
    kundliId: Optional[str] = None
    school: str
    selectedChart: Optional[str] = None
    selectedHouse: Optional[int] = None
    selectedPlanet: Optional[str] = None
    selectedSection: Optional[str] = None
    sourceScreen: Optional[str] = None
    updatedAt: str


class ChartContext(BaseModel):
    chartType: Optional[str] = None
    chartName: Optional[str] = None
    generatedReport: Optional[Dict[str, Any]] = None
    handoffBirthSummary: Optional[str] = None
    handoffFrom: Optional[str] = None
    handoffQuestion: Optional[str] = None
    predictaSchool: Optional[str] = None
    specialistContexts: List[SpecialistPredictaContextSnapshot] = Field(default_factory=list)
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
    reportAvailableSections: List[str] = Field(default_factory=list)
    reportFocus: Optional[str] = None
    reportGeneratedAt: Optional[str] = None
    reportMode: Optional[str] = None
    reportSchoolLane: Optional[str] = None
    reportSectionId: Optional[str] = None
    reportSectionPrompt: Optional[str] = None
    reportSectionTitle: Optional[str] = None
    reportSelectedSections: List[str] = Field(default_factory=list)
    reportSubjectName: Optional[str] = None
    reportType: Optional[str] = None
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
SupportTicketCategory = Literal[
    "feedback",
    "question",
    "complaint",
    "bug-report",
    "feature-request",
    "billing",
    "account",
    "report",
    "kundli",
    "signature",
    "premium-access",
    "refund",
    "safety-concern",
    "general-contact",
]
SupportTicketStatus = Literal[
    "NEW",
    "ACKNOWLEDGED",
    "IN_REVIEW",
    "WAITING_ON_USER",
    "RESOLVED",
    "ESCALATED",
    "CLOSED",
]
SupportTicketPriority = Literal["LOW", "NORMAL", "HIGH", "URGENT"]
SupportTicketMessageKind = Literal[
    "customer_inbound",
    "admin_outbound",
    "system_auto_reply",
    "internal_private_note",
]
SupportTicketMessageVisibility = Literal["customer_visible", "internal_only"]
SupportTicketAuditEventKind = Literal[
    "ticket_created",
    "message_added",
    "status_changed",
    "priority_changed",
    "assignment_changed",
    "delivery_recorded",
]


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
    allowedEmails: List[str] = Field(min_length=1)
    expiresAt: Optional[str] = None

    @field_validator("allowedEmails")
    @classmethod
    def validate_allowed_emails(cls, value: List[str]) -> List[str]:
        normalized = sorted(
            {
                email.strip().lower()
                for email in value
                if email.strip()
            }
        )

        if not normalized:
            raise ValueError("at least one allowed email is required")

        for email in normalized:
            if "@" not in email or email.startswith("@") or email.endswith("@"):
                raise ValueError("allowed emails must be valid email addresses")

        return normalized


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


class SupportTicketActor(BaseModel):
    role: Literal["customer", "admin", "system"]
    displayName: Optional[str] = None
    email: Optional[str] = None
    userId: Optional[str] = None


class SupportTicketRelatedContext(BaseModel):
    kundliId: Optional[str] = None
    purchaseId: Optional[str] = None
    reportId: Optional[str] = None
    reportType: Optional[str] = None


class SupportTicketRecord(BaseModel):
    id: str = Field(min_length=1)
    ticketNumber: str = Field(min_length=1)
    category: SupportTicketCategory
    status: SupportTicketStatus
    priority: SupportTicketPriority
    subject: str = Field(min_length=1)
    customerEmail: Optional[str] = None
    customerName: Optional[str] = None
    sourceSurface: Optional[str] = None
    route: Optional[str] = None
    language: Optional[str] = None
    userId: Optional[str] = None
    assignedTo: Optional[str] = None
    latestMessagePreview: Optional[str] = None
    latestCustomerReplyAt: Optional[str] = None
    latestAdminReplyAt: Optional[str] = None
    related: Optional[SupportTicketRelatedContext] = None
    createdAt: str
    updatedAt: str


class SupportTicketMessage(BaseModel):
    id: str = Field(min_length=1)
    ticketId: str = Field(min_length=1)
    ticketNumber: str = Field(min_length=1)
    kind: SupportTicketMessageKind
    visibility: SupportTicketMessageVisibility
    body: str = Field(min_length=1)
    sender: SupportTicketActor
    createdAt: str
    templateId: Optional[str] = None
    deliveryEligible: Optional[bool] = None

    @field_validator("deliveryEligible")
    @classmethod
    def validate_private_note_delivery(
        cls, value: Optional[bool], info: Any
    ) -> Optional[bool]:
        kind = info.data.get("kind") if hasattr(info, "data") else None
        if kind == "internal_private_note" and value:
            raise ValueError("internal_private_note cannot be delivery eligible")
        return value

    @field_validator("visibility")
    @classmethod
    def validate_private_note_visibility(
        cls, value: SupportTicketMessageVisibility, info: Any
    ) -> SupportTicketMessageVisibility:
        kind = info.data.get("kind") if hasattr(info, "data") else None
        if kind == "internal_private_note" and value != "internal_only":
            raise ValueError("internal_private_note must stay internal_only")
        return value


class SupportEmailDeliveryEvent(BaseModel):
    id: str = Field(min_length=1)
    ticketId: str = Field(min_length=1)
    ticketNumber: str = Field(min_length=1)
    provider: Literal["resend"]
    recipient: str = Field(min_length=1)
    status: Literal[
        "accepted",
        "sent",
        "delivered",
        "delivery_delayed",
        "bounced",
        "failed",
        "complained",
        "suppressed",
    ]
    statusCode: int
    templateId: str = Field(min_length=1)
    attemptedAt: str
    messageId: Optional[str] = None
    providerMessageId: Optional[str] = None
    error: Optional[str] = None


class SupportTicketAuditEvent(BaseModel):
    id: str = Field(min_length=1)
    ticketId: str = Field(min_length=1)
    ticketNumber: str = Field(min_length=1)
    kind: SupportTicketAuditEventKind
    actor: SupportTicketActor
    at: str
    messageId: Optional[str] = None
    fromValue: Optional[str] = Field(default=None, alias="from")
    to: Optional[str] = None


class SupportTicketThread(BaseModel):
    ticket: SupportTicketRecord
    messages: List[SupportTicketMessage] = Field(default_factory=list)
    deliveryEvents: List[SupportEmailDeliveryEvent] = Field(default_factory=list)
    auditEvents: List[SupportTicketAuditEvent] = Field(default_factory=list)


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
    predictaStylePreference: Literal["balanced", "devotional", "secular"] = (
        "balanced"
    )
    safetyIdentifier: Optional[str] = None
    aiCostGovernance: Optional[Dict[str, Any]] = None


class PridictaChatResponse(BaseModel):
    text: str
    provider: Literal["openai", "gemini", "deterministic"]
    model: str
    cached: bool = False
    intent: AIIntent
    usedDeepModel: bool = False
    jyotishAnalysis: Optional[JyotishAnalysis] = None
    safetyCategories: List[str] = Field(default_factory=list)
    safetyBlocked: bool = False


SafetyReviewStatus = Literal["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]


class SafetyReportRequest(BaseModel):
    safetyIdentifier: Optional[str] = None
    safetyCategories: List[str] = Field(default_factory=list)
    provider: Optional[str] = None
    model: Optional[str] = None
    route: str = Field(default="/dashboard/chat", min_length=1)
    sourceSurface: str = Field(default="chat", min_length=1)
    reportKind: Literal[
        "USER_REPORTED",
        "HIGH_STAKES",
        "BLOCKED",
        "LOW_CONFIDENCE",
        "OUTPUT_REWRITTEN",
    ] = "USER_REPORTED"


class SafetyAuditEvent(BaseModel):
    id: str
    createdAt: str
    safetyIdentifierHash: str
    safetyCategories: List[str] = Field(default_factory=list)
    provider: str
    model: str
    route: str
    sourceSurface: str
    reportKind: Literal[
        "USER_REPORTED",
        "HIGH_STAKES",
        "BLOCKED",
        "LOW_CONFIDENCE",
        "OUTPUT_REWRITTEN",
    ]
    reviewStatus: SafetyReviewStatus
    reviewedAt: Optional[str] = None
    reviewedBy: Optional[str] = None
    reviewNote: Optional[str] = None


AITelemetryProvider = Literal["openai", "gemini", "deterministic", "cache"]
AITelemetryCacheState = Literal["hit", "miss", "bypass", "unavailable"]
AITelemetryLatencyBucket = Literal[
    "lt_1s",
    "1_3s",
    "3_10s",
    "10_30s",
    "over_30s",
]


class AITelemetryEvent(BaseModel):
    id: str
    createdAt: str
    provider: AITelemetryProvider
    model: str
    feature: str
    activeSchool: str
    reportType: Optional[str] = None
    userPlan: Optional[UserPlan] = None
    entitlementSource: Optional[str] = None
    productCreditSource: Optional[str] = None
    intent: Optional[AIIntent] = None
    cacheState: AITelemetryCacheState
    cacheHit: bool = False
    fallbackReason: Optional[str] = None
    success: bool
    latencyBucket: AITelemetryLatencyBucket
    estimatedInputTokens: int = 0
    estimatedOutputTokens: int = 0
    providerInputTokens: Optional[int] = None
    providerOutputTokens: Optional[int] = None
    providerCachedInputTokens: Optional[int] = None
    estimatedCostUsd: Optional[float] = None
    promptCacheKey: Optional[str] = None
    subjectHash: Optional[str] = None
    route: str


class AITelemetrySummary(BaseModel):
    generatedAt: str
    totalEvents: int
    byProvider: Dict[str, int]
    byModel: Dict[str, int]
    byFeature: Dict[str, int]
    byPlan: Dict[str, int]
    fallbackEvents: int
    failureEvents: int
    estimatedCostUsdTotal: Optional[float] = None
    latestEvents: List[AITelemetryEvent] = Field(default_factory=list)


AIValidationSeverity = Literal["pass", "low", "medium", "high", "critical"]
AIValidationConfidence = Literal["low", "medium", "high"]


class AIValidationIssue(BaseModel):
    code: str = Field(min_length=1)
    severity: AIValidationSeverity
    message: str = Field(min_length=1)
    suggestedFixCategory: str = Field(min_length=1)
    evidence: Optional[str] = None


class AIValidationRequest(BaseModel):
    feature: Literal["report_validator"] = "report_validator"
    activeSchool: str = Field(default="PARASHARI", min_length=1)
    reportType: str = Field(default="unknown", min_length=1)
    userPlan: UserPlan = "PREMIUM"
    expectedLanguage: SupportedLanguage = "en"
    requiredSections: List[str] = Field(default_factory=list)
    presentSections: List[str] = Field(default_factory=list)
    deterministicContextSummary: str = Field(default="", max_length=8000)
    candidateContentSummary: str = Field(default="", max_length=12000)
    premiumExpected: bool = True


class AIValidationResult(BaseModel):
    passed: bool
    severity: AIValidationSeverity
    issues: List[AIValidationIssue] = Field(default_factory=list)
    suggestedFixCategories: List[str] = Field(default_factory=list)
    confidence: AIValidationConfidence
    provider: AITelemetryProvider
    model: str


ReportPipelineValidatorUnavailableBehavior = Literal["continue_with_flag", "block"]


class ReportQAPolicy(BaseModel):
    validatorRequired: bool = False
    validatorUnavailableBehavior: ReportPipelineValidatorUnavailableBehavior = (
        "continue_with_flag"
    )


class PremiumReportPipelineRequest(BaseModel):
    activeSchool: str = Field(default="PARASHARI", min_length=1)
    reportType: str = Field(default="vedic", min_length=1)
    userPlan: UserPlan = "FREE"
    expectedLanguage: SupportedLanguage = "en"
    reportTitle: str = Field(default="Predicta Report", min_length=1)
    subjectKey: Optional[str] = Field(default=None, max_length=200)
    deterministicReportData: Dict[str, Any] = Field(default_factory=dict)
    deterministicContextSummary: str = Field(default="", max_length=8000)
    requiredSections: List[str] = Field(default_factory=list)
    presentSections: List[str] = Field(default_factory=list)
    confirmedSignatureTraitsOnly: bool = True
    qaPolicy: Optional[ReportQAPolicy] = None


class PremiumReportPipelineAudit(BaseModel):
    pipelineApplied: bool
    deterministicArtifactGatePassed: bool
    validatorInvoked: bool
    finalizerInvoked: bool
    validatorUnavailable: bool = False
    blocked: bool = False
    draftProvider: Optional[AITelemetryProvider] = None
    draftModel: Optional[str] = None
    validatorProvider: Optional[AITelemetryProvider] = None
    validatorModel: Optional[str] = None
    finalizerProvider: Optional[AITelemetryProvider] = None
    finalizerModel: Optional[str] = None
    validatorIssueCodes: List[str] = Field(default_factory=list)
    policy: ReportQAPolicy = Field(default_factory=ReportQAPolicy)


class PremiumReportPipelineResult(BaseModel):
    content: str
    audit: PremiumReportPipelineAudit
    validation: Optional[AIValidationResult] = None
    artifactMetadata: Dict[str, Any] = Field(default_factory=dict)


AIBatchQACheckType = Literal[
    "translation_sweep",
    "report_redundancy_scan",
    "golden_pdf_text_audit",
    "method_boundary_check",
    "missing_section_check",
    "overclaim_safety_scan",
]
AIBatchQARunnerMode = Literal["mock", "gemini_sync"]


class AIBatchQAJob(BaseModel):
    id: str = Field(min_length=1)
    checkType: AIBatchQACheckType
    activeSchool: str = Field(default="PARASHARI", min_length=1)
    reportType: str = Field(default="unknown", min_length=1)
    expectedLanguage: SupportedLanguage = "en"
    requiredSections: List[str] = Field(default_factory=list)
    presentSections: List[str] = Field(default_factory=list)
    contentSummary: str = Field(default="", max_length=12000)
    deterministicContextSummary: str = Field(default="", max_length=8000)
    blockUserFacingDownload: bool = False


class AIBatchQAIssue(BaseModel):
    code: str = Field(min_length=1)
    severity: AIValidationSeverity
    message: str = Field(min_length=1)
    evidence: Optional[str] = None
    suggestedFixCategory: str = Field(min_length=1)


class AIBatchQAResult(BaseModel):
    jobId: str
    checkType: AIBatchQACheckType
    passed: bool
    severity: AIValidationSeverity
    issues: List[AIBatchQAIssue] = Field(default_factory=list)
    provider: AITelemetryProvider
    model: str
    runnerMode: AIBatchQARunnerMode
    auditArtifactPath: Optional[str] = None
    contentHash: Optional[str] = None
    blockUserFacingDownload: bool = False


class AIBatchQARunManifest(BaseModel):
    runId: str
    runnerMode: AIBatchQARunnerMode
    provider: AITelemetryProvider
    model: str
    totalJobs: int
    passedJobs: int
    failedJobs: int
    artifactRoot: str
    results: List[AIBatchQAResult] = Field(default_factory=list)


class SafetyReviewRequest(BaseModel):
    reviewStatus: SafetyReviewStatus
    reviewNote: Optional[str] = Field(default=None, max_length=500)
    reviewedBy: Optional[str] = Field(default=None, max_length=120)


class ReleaseReadinessCheck(BaseModel):
    name: str
    status: Literal["PASS", "FAIL"]
    details: str


class AIProfitSafetySummary(BaseModel):
    estimatedAverageFreeChatCostUsd: Optional[float] = None
    estimatedAveragePremiumChatCostUsd: Optional[float] = None
    estimatedAveragePremiumReportCostUsd: Optional[float] = None
    estimatedGeminiValidatorCostUsd: Optional[float] = None
    fallbackRate: float = 0
    cacheHitRate: float = 0
    deterministicFallbackRate: float = 0
    topCostRiskFeatures: List[str] = Field(default_factory=list)
    telemetryEventCount: int = 0
    pricingConfigured: bool = False


class ReleaseReadinessReport(BaseModel):
    generatedAt: str
    releaseStatus: Literal["READY", "BLOCKED"]
    checks: List[ReleaseReadinessCheck]
    blockers: List[str] = Field(default_factory=list)
    profitSafetySummary: Optional[AIProfitSafetySummary] = None
    safetySLOs: Dict[str, str]
    approvedModelPins: Dict[str, str]
    requiredCommands: List[str]
    launchCriteria: List[str]
    rollbackSteps: List[str]


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
