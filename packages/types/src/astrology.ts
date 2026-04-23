import type { AppLocale } from './locale';

export type ChartType =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D5'
  | 'D6'
  | 'D7'
  | 'D8'
  | 'D9'
  | 'D10'
  | 'D11'
  | 'D12'
  | 'D13'
  | 'D15'
  | 'D16'
  | 'D17'
  | 'D18'
  | 'D19'
  | 'D20'
  | 'D21'
  | 'D22'
  | 'D23'
  | 'D24'
  | 'D25'
  | 'D26'
  | 'D27'
  | 'D28'
  | 'D29'
  | 'D30'
  | 'D31'
  | 'D32'
  | 'D33'
  | 'D34'
  | 'D40'
  | 'D45'
  | 'D60';

export type ChartConfig = {
  id: ChartType;
  name: string;
  purpose: string;
  category: 'core' | 'advanced';
};

export type BirthDetails = {
  name: string;
  date: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isTimeApproximate?: boolean;
  resolvedBirthPlace?: ResolvedBirthPlace;
  originalPlaceText?: string;
};

export type ResolvedBirthPlace = {
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: 'local-dataset' | 'geocoding-api' | 'manual-admin';
};

export type BirthDetailsDraft = {
  name?: string;
  date?: string;
  time?: string;
  meridiem?: 'AM' | 'PM';
  placeText?: string;
  country?: string;
  state?: string;
  city?: string;
  isTimeApproximate?: boolean;
};

export type BirthDetailsExtractionResult = {
  extracted: BirthDetailsDraft;
  missingFields: Array<
    | 'name'
    | 'date'
    | 'time'
    | 'am_pm'
    | 'birth_place'
    | 'country'
    | 'state'
    | 'city'
  >;
  ambiguities: Array<{
    field: string;
    issue: string;
    options?: string[];
  }>;
  confidence: number;
};

export type HouseData = {
  house: number;
  sign: string;
  lord: string;
  planets: string[];
};

export type PlanetPosition = {
  name: string;
  sign: string;
  degree: number;
  absoluteLongitude: number;
  house: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
};

export type YogaInsight = {
  name: string;
  strength: 'mild' | 'moderate' | 'strong';
  meaning: string;
};

export type ChartData = {
  chartType: ChartType;
  name: string;
  ascendantSign: string;
  signPlacements: Record<string, string[]>;
  housePlacements: Record<number, string[]>;
  planetDistribution: PlanetPosition[];
  supported: boolean;
  unsupportedReason?: string;
};

export type VimshottariDashaData = {
  current: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  timeline: Array<{
    mahadasha: string;
    startDate: string;
    endDate: string;
    antardashas: Array<{
      antardasha: string;
      startDate: string;
      endDate: string;
    }>;
  }>;
};

export type AshtakavargaData = {
  bav: Record<string, number[]>;
  sav: number[];
  totalScore: number;
  strongestHouses: number[];
  weakestHouses: number[];
};

export type CalculationMeta = {
  provider: 'swiss-ephemeris';
  providerVersion?: string;
  ephemerisVersion?: string;
  zodiac: 'SIDEREAL';
  ayanamsa: 'LAHIRI';
  houseSystem: 'WHOLE_SIGN';
  nodeType: 'TRUE_NODE' | 'MEAN_NODE';
  calculatedAt: string;
  inputHash: string;
  utcDateTime: string;
};

export type KundliData = {
  id: string;
  birthDetails: BirthDetails;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  planets: PlanetPosition[];
  houses: HouseData[];
  charts: Record<ChartType, ChartData>;
  dasha: VimshottariDashaData;
  ashtakavarga: AshtakavargaData;
  yogas: YogaInsight[];
  calculationMeta: CalculationMeta;
};

export type LifeEventCategory =
  | 'CAREER'
  | 'RELATIONSHIP'
  | 'MARRIAGE'
  | 'BUSINESS'
  | 'RELOCATION'
  | 'EDUCATION'
  | 'FINANCE'
  | 'HEALTH'
  | 'FAMILY'
  | 'SPIRITUAL'
  | 'OTHER';

export type LifeEvent = {
  id: string;
  kundliId: string;
  title: string;
  category: LifeEventCategory;
  eventDate: string;
  approximateDate: boolean;
  description?: string;
  emotionalTone?: 'calm' | 'happy' | 'stressful' | 'uncertain' | 'transformative';
  createdAt: string;
  updatedAt: string;
};

export type LifeTimelineMappedEvent = {
  event: LifeEvent;
  mahadasha?: string;
  antardasha?: string;
  dashaStartDate?: string;
  dashaEndDate?: string;
  relevantHouses: number[];
  relevantCharts: ChartType[];
  chartFactors: string[];
  confidence: 'low' | 'medium' | 'high';
};

export type LifeTimelineInsight = {
  kundliId: string;
  eventHash: string;
  generatedAt: string;
  mappedEvents: LifeTimelineMappedEvent[];
  recurringThemes: string[];
  previewText: string;
  premiumSynthesis?: string;
  calculationMeta: Pick<
    CalculationMeta,
    'ayanamsa' | 'houseSystem' | 'nodeType' | 'calculatedAt' | 'inputHash'
  >;
};

export type LifeTimelineAccess = {
  canAddMoreEvents: boolean;
  canViewFullTimeline: boolean;
  maxFreeEvents: number;
  remainingFreeEvents: number;
  requiresUpgrade: boolean;
};

export type IntelligenceDepth = 'FREE' | 'EXPANDED';

export type DailyIntelligence = {
  kundliId: string;
  dateKey: string;
  cacheKey: string;
  depth: IntelligenceDepth;
  emotionalTone: string;
  workFocus: string;
  relationshipTone: string;
  practicalAction: string;
  avoid: string;
  chartBasisSummary: string;
  generatedAt: string;
};

export type WeeklyDateWindow = {
  startDate: string;
  endDate: string;
  focus: string;
  tone: string;
};

export type WeeklyIntelligence = {
  kundliId: string;
  weekKey: string;
  cacheKey: string;
  depth: IntelligenceDepth;
  weeklyTheme: string;
  importantDateWindows: WeeklyDateWindow[];
  careerFocus: string;
  relationshipFocus: string;
  spiritualSuggestion: string;
  chartBasisSummary: string;
  premiumSynthesis?: string;
  generatedAt: string;
};

export type IntelligenceQuotaDecision = {
  consumesQuota: boolean;
  reason: 'cache_hit' | 'template_generated' | 'ai_generated';
};

export type DecisionMirrorDepth = 'FREE' | 'EXPANDED';

export type DecisionTimingWindow = {
  label: string;
  startDate?: string;
  endDate?: string;
  focus: string;
};

export type DecisionMirrorResponse = {
  decisionSummary: string;
  supportiveChartFactors: string[];
  cautionFactors: string[];
  timingWindows: DecisionTimingWindow[];
  practicalNextStep: string;
  emotionalBiasCheck: string;
  revisitLater: string;
  disclaimer: string;
  depth: DecisionMirrorDepth;
  cacheKey: string;
  generatedAt: string;
};

export type DecisionIntentResult = {
  isDecisionQuestion: boolean;
  confidence: number;
  suggestedDepth: DecisionMirrorDepth;
  reasons: string[];
};

export type ChartContext = {
  chartType?: ChartType;
  chartName?: string;
  purpose?: string;
  selectedPlanet?: string;
  selectedHouse?: number;
  selectedSection?: string;
  sourceScreen: string;
};

export type ChatRole = 'user' | 'pridicta';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  context?: ChartContext;
  decisionMirror?: DecisionMirrorResponse;
};

export type ConversationTurn = {
  role: ChatRole;
  text: string;
};

export type UserPlan = 'FREE' | 'PREMIUM';

export type PDFMode = UserPlan;

export type AuthState = {
  userId?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider: 'google' | 'apple' | 'microsoft' | 'password' | null;
  isLoggedIn: boolean;
};

export type KundliSaveLocation = 'LOCAL' | 'CLOUD';

export type KundliSyncStatus =
  | 'LOCAL_ONLY'
  | 'CLOUD_SYNCED'
  | 'CLOUD_PENDING'
  | 'CLOUD_ERROR';

export type SavedKundliSummary = {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: KundliSyncStatus;
  cloudId?: string;
};

export type SavedKundliRecord = {
  summary: SavedKundliSummary;
  kundliData: KundliData;
};

export type UsageState = {
  dayKey: string;
  monthKey: string;
  deepCallsToday: number;
  questionsToday: number;
  pdfsThisMonth: number;
  dayPassQuestionsUsed?: number;
  dayPassDeepCallsUsed?: number;
  dayPassPdfsUsed?: number;
};

export type AIIntent = 'simple' | 'moderate' | 'deep';

export type PridictaChatRequest = {
  message: string;
  kundli: KundliData;
  chartContext?: ChartContext;
  history: ConversationTurn[];
  userPlan: UserPlan;
  deepAnalysis?: boolean;
  preferredLanguage?: AppLocale;
};

export type PridictaChatResponse = {
  text: string;
  provider: 'openai' | 'gemini' | 'local' | 'cache';
  model: string;
  cached?: boolean;
  decisionMirror?: DecisionMirrorResponse;
  intent?: AIIntent;
  usedDeepModel?: boolean;
};

export type AIContextPayload = {
  birthSummary: string;
  activeContext?: ChartContext;
  selectedChart?: {
    chartType: ChartType;
    name: string;
    purpose: string;
    ascendantSign: string;
    relevantPlacements: Record<number, string[]>;
  };
  coreIdentity: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
  };
  currentDasha: KundliData['dasha']['current'];
  keyPlanets: PlanetPosition[];
  keyYogas: YogaInsight[];
  ashtakavargaSummary: {
    strongestHouses: number[];
    weakestHouses: number[];
    totalScore: number;
  };
  calculationMeta: Pick<
    CalculationMeta,
    'ayanamsa' | 'houseSystem' | 'nodeType' | 'calculatedAt'
  >;
};
