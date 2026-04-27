from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from backend.astro_api.models import BirthDetails, KundliData, PlanetPosition, YogaInsight


class ChartContext(BaseModel):
    chartType: Optional[str] = None
    chartName: Optional[str] = None
    purpose: Optional[str] = None
    selectedPlanet: Optional[str] = None
    selectedHouse: Optional[int] = None
    selectedSection: Optional[str] = None
    sourceScreen: str


class ConversationTurn(BaseModel):
    role: Literal["user", "pridicta"]
    text: str = Field(min_length=1, max_length=2000)


class SelectedChartContext(BaseModel):
    chartType: str
    name: str
    purpose: str
    ascendantSign: str
    relevantPlacements: Dict[int, List[str]]


class AIContextPayload(BaseModel):
    birthSummary: str
    activeContext: Optional[ChartContext] = None
    selectedChart: Optional[SelectedChartContext] = None
    coreIdentity: Dict[str, str]
    currentDasha: Dict[str, str]
    keyPlanets: List[PlanetPosition]
    keyYogas: List[YogaInsight]
    ashtakavargaSummary: Dict[str, object]
    calculationMeta: Dict[str, str]


class AstrologyMemoryModel(BaseModel):
    userName: Optional[str] = None
    birthDetailsComplete: bool = False
    kundliReady: bool = False
    birthDetails: Optional[BirthDetails] = None
    activeKundliId: Optional[str] = None
    knownConcerns: List[str] = Field(default_factory=list)
    previousTopics: List[str] = Field(default_factory=list)
    previousGuidance: List[str] = Field(default_factory=list)
    emotionalTone: Optional[str] = None
    lastChartContext: Optional[ChartContext] = None
    conversationSummary: Optional[str] = None
    preferredLanguage: Optional[str] = None
    lastIntent: Optional[str] = None


class IntentDetectionResultModel(BaseModel):
    primaryIntent: str
    secondaryIntents: List[str] = Field(default_factory=list)
    emotionalTone: str = "neutral"
    isFollowUp: bool = False
    confidence: float = 0.5
    citedSignals: List[str] = Field(default_factory=list)


class AstrologyReasoningContextModel(BaseModel):
    userIntent: str
    emotionalTone: str
    primaryCharts: List[str] = Field(default_factory=list)
    secondaryCharts: List[str] = Field(default_factory=list)
    relevantFactors: List[str] = Field(default_factory=list)
    chartContext: Optional[ChartContext] = None
    shouldUseDasha: bool = False
    shouldUseTransit: bool = False
    shouldSuggestRemedy: bool = False


class PredictaIntelligenceContextModel(BaseModel):
    memory: AstrologyMemoryModel
    intentProfile: IntentDetectionResultModel
    reasoningContext: AstrologyReasoningContextModel
    conversationSummary: str = ""
    recentAssistantResponses: List[str] = Field(default_factory=list)


class PridictaAIRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    kundli: Optional[KundliData] = None
    chartContext: Optional[ChartContext] = None
    history: List[ConversationTurn] = Field(default_factory=list, max_length=16)
    userPlan: Literal["FREE", "PREMIUM"] = "FREE"
    deepAnalysis: bool = False
    preferredLanguage: Optional[str] = Field(default=None, max_length=32)
    intelligenceContext: Optional[PredictaIntelligenceContextModel] = None


class PridictaAIResponse(BaseModel):
    text: str
    provider: Literal["openai", "gemini", "local"]
    model: str
    intent: Literal["simple", "moderate", "deep"]
    usedDeepModel: bool
    compactedWithGemini: bool
