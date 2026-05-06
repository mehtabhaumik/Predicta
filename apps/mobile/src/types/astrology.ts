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

export type SupportedLanguage = 'en' | 'hi' | 'gu';

export type LanguagePreference = {
  language: SupportedLanguage;
  updatedAt: string;
};

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type TrustSurface =
  | 'chat'
  | 'report'
  | 'decision'
  | 'remedy'
  | 'timeline'
  | 'chart'
  | 'general';

export type TrustSignal = {
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  evidence: string[];
};

export type TrustProfile = {
  surface: TrustSurface;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  summary: string;
  evidence: string[];
  limitations: string[];
  safetyNotes: string[];
  highStakes: boolean;
  auditTrace: string[];
};

export type TimelineEvent = {
  id: string;
  kind: 'dasha' | 'transit' | 'rectification' | 'remedy';
  title: string;
  startDate: string;
  endDate?: string;
  planets: string[];
  houses: number[];
  summary: string;
  confidence: 'low' | 'medium' | 'high';
};

export type LifeTimelineEventView = {
  id: string;
  kind: TimelineEvent['kind'];
  title: string;
  dateWindow: string;
  summary: string;
  confidence: TimelineEvent['confidence'];
  planets: string[];
  houses: number[];
  status: 'now' | 'next' | 'later';
  evidence: string[];
  action: string;
  askPrompt: string;
};

export type LifeTimelineSection = {
  id: 'now' | 'next' | 'later';
  title: string;
  description: string;
  events: LifeTimelineEventView[];
};

export type LifeTimelinePresentation = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  currentPeriod: string;
  upcomingPeriod: string;
  sections: LifeTimelineSection[];
  caution?: string;
};

export type DailyBriefingCue = {
  area: 'career' | 'money' | 'relationship';
  label: string;
  text: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
};

export type DailyBriefing = {
  status: 'ready' | 'pending';
  id: string;
  date: string;
  language: SupportedLanguage;
  labels: {
    eyebrow: string;
    theme: string;
    bestAction: string;
    avoidAction: string;
    emotionalWeather: string;
    remedy: string;
    proof: string;
  };
  title: string;
  subtitle: string;
  todayTheme: string;
  bestAction: string;
  avoidAction: string;
  emotionalWeather: string;
  cues: DailyBriefingCue[];
  remedyMicroAction: string;
  evidence: string[];
  askPrompt: string;
  notification: {
    title: string;
    body: string;
    deepLink: string;
  };
};

export type DecisionArea =
  | 'career'
  | 'relationship'
  | 'wealth'
  | 'education'
  | 'relocation'
  | 'wellbeing'
  | 'legal'
  | 'general';

export type DecisionState =
  | 'green'
  | 'yellow'
  | 'red'
  | 'wait'
  | 'needs-more-info';

export type DecisionEvidence = {
  id: string;
  title: string;
  observation: string;
  interpretation: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
  source: 'dasha' | 'transit' | 'ashtakavarga' | 'timeline' | 'remedy' | 'safety';
};

export type DecisionMemo = {
  status: 'ready' | 'pending';
  id: string;
  question: string;
  area: DecisionArea;
  state: DecisionState;
  headline: string;
  shortAnswer: string;
  timing: string;
  risk: string;
  nextAction: string;
  clarifyingQuestions: string[];
  evidence: DecisionEvidence[];
  remedies: string[];
  safetyNote?: string;
  aiPrompt: string;
};

export type TransitInsight = {
  planet: string;
  sign: string;
  degree: number;
  houseFromLagna: number;
  houseFromMoon: number;
  retrograde: boolean;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
  summary: string;
  calculatedAt: string;
};

export type RectificationInsight = {
  needsRectification: boolean;
  confidence: 'low' | 'medium' | 'high';
  ascendantDegree: number;
  reasons: string[];
  questions: string[];
};

export type BirthTimeConfidenceLabel = 'stable' | 'needs-checking' | 'unreliable';

export type BirthTimeAnswer = {
  questionId: string;
  answer: string;
  answeredAt: string;
};

export type BirthTimeQuestion = {
  id: string;
  question: string;
  helper: string;
  answer?: BirthTimeAnswer;
};

export type BirthTimeDetectiveReport = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  confidenceLabel: BirthTimeConfidenceLabel;
  confidenceScore: number;
  summary: string;
  reasons: string[];
  questions: BirthTimeQuestion[];
  answeredCount: number;
  safeJudgments: string[];
  cautiousJudgments: string[];
  unsafeJudgments: string[];
  nextAction: string;
  evidence: string[];
  askPrompt: string;
};

export type RelationshipMirrorArea =
  | 'emotional-style'
  | 'communication'
  | 'commitment'
  | 'conflict'
  | 'timing'
  | 'weekly-advice';

export type RelationshipMirrorEvidence = {
  id: string;
  person: 'first' | 'second' | 'both';
  title: string;
  observation: string;
  interpretation: string;
  weight: 'harmony' | 'growth' | 'friction' | 'neutral';
};

export type RelationshipMirrorSection = {
  area: RelationshipMirrorArea;
  title: string;
  summary: string;
  advice: string;
  evidenceIds: string[];
};

export type RelationshipMirror = {
  status: 'ready' | 'pending';
  firstName: string;
  secondName: string;
  headline: string;
  overview: string;
  sections: RelationshipMirrorSection[];
  evidence: RelationshipMirrorEvidence[];
  howToTalkThisWeek: string;
  timingOverlap: string;
  shareSummary: string;
  askPrompt: string;
};

export type FamilyRelationshipLabel =
  | 'self'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'partner'
  | 'grandparent'
  | 'relative'
  | 'friend'
  | 'other';

export type FamilyMemberProfile = {
  id: string;
  name: string;
  relationship: FamilyRelationshipLabel;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  currentDasha: string;
};

export type FamilyKarmaTheme = {
  id: string;
  title: string;
  summary: string;
  members: string[];
  evidence: string[];
  guidance: string;
};

export type FamilyRelationshipGuidance = {
  id: string;
  firstMemberId: string;
  secondMemberId: string;
  label: string;
  emotionalPattern: string;
  supportPattern: string;
  practicalGuidance: string;
  evidence: string[];
};

export type FamilyKarmaMap = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  members: FamilyMemberProfile[];
  repeatedThemes: FamilyKarmaTheme[];
  relationshipCards: FamilyRelationshipGuidance[];
  privacyNote: string;
  shareSummary: string;
  askPrompt: string;
};

export type PredictaWrappedCardKind =
  | 'year-theme'
  | 'hard-lesson'
  | 'growth-area'
  | 'best-window'
  | 'caution-window'
  | 'next-year-preview'
  | 'activity';

export type PredictaWrappedCard = {
  id: string;
  kind: PredictaWrappedCardKind;
  eyebrow: string;
  title: string;
  value: string;
  body: string;
  guidance: string;
  evidence: string[];
  shareLine: string;
};

export type PredictaWrappedActivity = {
  questionsAsked?: number;
  deepReadings?: number;
  reportsGenerated?: number;
  savedQuestions?: string[];
  reportInsights?: string[];
};

export type PredictaWrappedPrivacyCheck = {
  excludesExactBirthTime: boolean;
  excludesBirthPlace: boolean;
  consentRequired: boolean;
  note: string;
};

export type PredictaWrapped = {
  status: 'ready' | 'pending';
  year: number;
  title: string;
  subtitle: string;
  ownerName: string;
  yearTheme: string;
  hardLesson: string;
  growthArea: string;
  bestWindow: string;
  cautionWindow: string;
  nextYearPreview: string;
  cards: PredictaWrappedCard[];
  privacyCheck: PredictaWrappedPrivacyCheck;
  shareText: string;
  askPrompt: string;
};

export type RemedyInsight = {
  id: string;
  priority: 'low' | 'medium' | 'high';
  area: JyotishArea;
  title: string;
  practice: string;
  rationale: string;
  linkedPlanets: string[];
  linkedHouses: number[];
  cadence: string;
  caution: string;
};

export type RemedyPracticeStatus = {
  remedyId: string;
  completedDates: string[];
  lastCompletedAt?: string;
};

export type RemedyCoachTracking = {
  status: 'not-started' | 'due' | 'done-today' | 'consistent' | 'review-needed';
  completions: number;
  currentStreak: number;
  lastCompletedAt?: string;
  reviewAfter: string;
  nextReviewPrompt: string;
};

export type RemedyCoachItem = {
  id: string;
  priority: RemedyInsight['priority'];
  area: RemedyInsight['area'];
  title: string;
  practice: string;
  rationale: string;
  cadence: string;
  caution: string;
  linkedPlanets: string[];
  linkedHouses: number[];
  expectedInnerShift: string;
  evidence: string[];
  tracking: RemedyCoachTracking;
  askPrompt: string;
};

export type RemedyCoachPlan = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  guardrails: string[];
  items: RemedyCoachItem[];
  reviewQuestion: string;
};

export type DestinyPassport = {
  status: 'ready' | 'pending';
  name: string;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  currentDasha: string;
  strongestHouses: number[];
  weakestHouses: number[];
  lifeTheme: string;
  currentCaution: string;
  recommendedAction: string;
  birthTimeConfidence: {
    label: 'Stable' | 'Check Needed' | 'Unverified';
    confidence: 'low' | 'medium' | 'high';
    reason: string;
  };
  evidence: string[];
  shareSummary: string;
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
  lifeTimeline?: TimelineEvent[];
  transits?: TransitInsight[];
  rectification?: RectificationInsight;
  remedies?: RemedyInsight[];
  calculationMeta: CalculationMeta;
};

export type ChartContext = {
  chartType?: ChartType;
  chartName?: string;
  purpose?: string;
  selectedPlanet?: string;
  selectedHouse?: number;
  selectedSection?: string;
  selectedTimelineEventId?: string;
  selectedTimelineEventTitle?: string;
  selectedTimelineEventKind?: TimelineEvent['kind'];
  selectedTimelineEventWindow?: string;
  selectedDailyBriefingDate?: string;
  selectedDecisionQuestion?: string;
  selectedDecisionArea?: DecisionArea;
  selectedDecisionState?: DecisionState;
  selectedRemedyId?: string;
  selectedRemedyTitle?: string;
  selectedBirthTimeDetective?: boolean;
  selectedRelationshipMirror?: boolean;
  selectedRelationshipNames?: string;
  selectedFamilyKarmaMap?: boolean;
  selectedFamilyMemberCount?: number;
  selectedPredictaWrapped?: boolean;
  selectedPredictaWrappedYear?: number;
  sourceScreen: string;
};

export type ChatRole = 'user' | 'pridicta';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  context?: ChartContext;
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
export type JyotishArea =
  | 'career'
  | 'relationship'
  | 'wealth'
  | 'wellbeing'
  | 'timing'
  | 'spirituality'
  | 'general';

export type JyotishEvidence = {
  id: string;
  area: JyotishArea;
  title: string;
  observation: string;
  interpretation: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
  source: string;
};

export type JyotishAreaAnalysis = {
  area: JyotishArea;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
  evidenceIds: string[];
  practicalFocus: string[];
};

export type JyotishAnalysis = {
  primaryArea: JyotishArea;
  evidence: JyotishEvidence[];
  areaAnalyses: JyotishAreaAnalysis[];
  formattingContract: string[];
  limitations: string[];
};

export type PridictaChatRequest = {
  message: string;
  kundli: KundliData;
  chartContext?: ChartContext;
  history: ConversationTurn[];
  userPlan: UserPlan;
  deepAnalysis?: boolean;
  language?: SupportedLanguage;
};

export type PridictaChatResponse = {
  text: string;
  provider: 'openai' | 'gemini' | 'cache';
  model: string;
  cached?: boolean;
  intent?: AIIntent;
  usedDeepModel?: boolean;
  jyotishAnalysis?: JyotishAnalysis;
};

export type AIContextPayload = {
  requestedLanguage: SupportedLanguage;
  birthSummary: {
    name: string;
    date: string;
    time: string;
    place: string;
    timezone: string;
    isTimeApproximate?: boolean;
  };
  activeContext?: ChartContext;
  selectedChart?: {
    chartType: ChartType;
    name: string;
    purpose: string;
    ascendantSign: string;
    relevantPlacements: Record<number, string[]>;
    signPlacements: Record<string, string[]>;
    planetDistribution: PlanetPosition[];
  };
  selectedHouseFocus?: {
    chartType: ChartType;
    house: number;
    planets: string[];
    houseSign?: string;
    houseLord?: string;
  };
  selectedPlanetFocus?: {
    planet: string;
    d1?: PlanetPosition;
    vargaPlacements: Partial<Record<ChartType, PlanetPosition | undefined>>;
  };
  selectedTimelineEvent?: TimelineEvent;
  dailyBriefing?: DailyBriefing;
  selectedDecision?: Pick<
    DecisionMemo,
    'area' | 'question' | 'state' | 'headline' | 'shortAnswer' | 'timing' | 'risk' | 'nextAction'
  >;
  selectedRemedy?: RemedyCoachItem;
  birthTimeDetective?: BirthTimeDetectiveReport;
  selectedRelationshipMirror?: Pick<
    RelationshipMirror,
    'firstName' | 'secondName' | 'headline' | 'overview' | 'howToTalkThisWeek' | 'timingOverlap'
  >;
  selectedFamilyKarmaMap?: Pick<
    FamilyKarmaMap,
    'title' | 'subtitle' | 'privacyNote' | 'shareSummary'
  > & {
    memberCount: number;
    themeTitles: string[];
    relationshipCardCount: number;
  };
  selectedPredictaWrapped?: Pick<
    PredictaWrapped,
    | 'year'
    | 'title'
    | 'yearTheme'
    | 'hardLesson'
    | 'growthArea'
    | 'bestWindow'
    | 'cautionWindow'
    | 'nextYearPreview'
    | 'shareText'
  >;
  coreIdentity: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
  };
  currentDasha: KundliData['dasha']['current'];
  dashaTimeline: KundliData['dasha']['timeline'];
  lifeTimeline?: TimelineEvent[];
  planets: PlanetPosition[];
  houses: HouseData[];
  transits?: TransitInsight[];
  rectification?: RectificationInsight;
  remedies?: RemedyInsight[];
  yogas: YogaInsight[];
  ashtakavarga: AshtakavargaData;
  coreCharts: Partial<Record<ChartType, ChartData>>;
  chartAccess?: {
    userPlan: UserPlan;
    allowedChartTypes: ChartType[];
    premiumLockedChartTypes: ChartType[];
    rule: string;
  };
  chartAvailability: {
    supported: ChartType[];
    unsupported: ChartType[];
    premiumLockedSupported?: ChartType[];
  };
  calculationMeta: Pick<
    CalculationMeta,
    'ayanamsa' | 'houseSystem' | 'nodeType' | 'zodiac' | 'utcDateTime'
  >;
  jyotishAnalysis?: JyotishAnalysis;
};
