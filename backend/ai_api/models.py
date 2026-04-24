from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from backend.astro_api.models import KundliData, PlanetPosition, YogaInsight


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


class PridictaAIRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    kundli: Optional[KundliData] = None
    chartContext: Optional[ChartContext] = None
    history: List[ConversationTurn] = Field(default_factory=list, max_length=16)
    userPlan: Literal["FREE", "PREMIUM"] = "FREE"
    deepAnalysis: bool = False
    preferredLanguage: Optional[str] = Field(default=None, max_length=32)


class PridictaAIResponse(BaseModel):
    text: str
    provider: Literal["openai", "gemini", "local"]
    model: str
    intent: Literal["simple", "moderate", "deep"]
    usedDeepModel: bool
    compactedWithGemini: bool
