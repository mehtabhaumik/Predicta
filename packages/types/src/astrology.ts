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

export type ChartViewMode = 'insight' | 'technical';

export type ChartViewHierarchyItem = {
  id: ChartViewMode;
  label: 'Insight View' | 'Technical View';
  description: string;
  default?: boolean;
};

export type ChartInsightDepth = 'free' | 'premium';

export type ChartInsightProfile =
  | 'default'
  | 'moon'
  | 'swamsa'
  | 'karakamsha'
  | 'chalit'
  | 'kp'
  | 'nadi';

export type ChartPremiumInsight = {
  headline: string;
  layeredInterpretation: string[];
  timingWindows: string[];
  contradictionSignals: string[];
  crossChartSynthesis: string[];
  practicalGuidance: string[];
  remedyDirection: string[];
  confidenceFraming: string;
};

export type ChartInsight = {
  title: string;
  eyebrow: string;
  governs: string;
  whatItSays: string;
  mainStrength: string;
  mainChallenge: string;
  lifeAreas: string[];
  currentGuidance: string;
  freeInsights: string[];
  premiumDeepDive: string[];
  technicalSummary: string;
  technicalDetails: string[];
  premiumInsight?: ChartPremiumInsight;
  premiumNudge?: string;
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
  timeConfidence?: 'entered' | 'approximate' | 'rectified';
  originalTime?: string;
  rectifiedAt?: string;
  rectificationMethod?: 'chat' | 'manual-yes-no';
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

export type KundliEditHistoryEntry = {
  id: string;
  editedAt: string;
  source: 'chat' | 'manual';
  mode: 'save-as-new' | 'update-existing';
  fieldsChanged: Array<'date' | 'name' | 'place' | 'time'>;
  before: BirthDetails;
  after: BirthDetails;
  note?: string;
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
  kind?: 'classical' | 'modern' | 'sensitive' | 'upagraha';
  simpleMeaning?: string;
  calculationNote?: string;
};

export type YogaInsight = {
  name: string;
  strength: 'mild' | 'moderate' | 'strong';
  meaning: string;
};

export type KundliKarmaModule =
  | 'DOSH'
  | 'SHRAP'
  | 'SUPPORTIVE_YOG'
  | 'CHALLENGING_YOG'
  | 'LAL_KITAB';

export type KundliKarmaItemStatus =
  | 'present'
  | 'weak'
  | 'cancelled'
  | 'not_present'
  | 'needs_data'
  | 'pending_evidence'
  | 'blocked_context';

export type KundliKarmaStrength = 'none' | 'low' | 'medium' | 'high' | 'very_high';

export type KundliKarmaConfidence = 'clear' | 'partial' | 'uncertain';

export type KundliKarmaDepth = 'free' | 'premium';

export type KundliKarmaEvidenceKind =
  | 'planet_house'
  | 'planet_sign'
  | 'planet_degree'
  | 'nakshatra_pada'
  | 'lordship'
  | 'aspect'
  | 'conjunction'
  | 'axis'
  | 'chart_support'
  | 'dasha_activation'
  | 'transit_activation'
  | 'lal_kitab_house'
  | 'missing_data'
  | 'context_boundary';

export type KundliKarmaEvidence = {
  id: string;
  kind: KundliKarmaEvidenceKind;
  description: string;
  chart?: ChartType | 'MOON' | 'CHALIT' | 'MATCHING';
  planet?: string;
  relatedPlanet?: string;
  house?: number;
  sign?: string;
  degree?: number;
  nakshatra?: string;
  pada?: number;
  weight: KundliKarmaStrength;
};

export type KundliKarmaActivation = {
  summary: string;
  dasha?: string;
  antardasha?: string;
  pratyantardasha?: string;
  transitTrigger?: string;
  ageWindow?: string;
  confidence: KundliKarmaConfidence;
};

export type KundliKarmaReduction = {
  id: string;
  description: string;
  evidenceIds: string[];
  confidence: KundliKarmaConfidence;
};

export type KundliKarmaRemedy = {
  id: string;
  depth: KundliKarmaDepth;
  title: string;
  description: string;
  tradition: 'karma_dharma' | 'vedic' | 'lal_kitab';
  safetyNote: string;
};

export type KundliKarmaCrossReference = {
  itemId: string;
  ruleId: string;
  module: KundliKarmaModule;
  relationship: 'same_condition' | 'supports' | 'reduces' | 'do_not_duplicate';
  note: string;
};

export type KundliKarmaItem = {
  id: string;
  ruleId: string;
  module: KundliKarmaModule;
  displayName: string;
  status: KundliKarmaItemStatus;
  strength: KundliKarmaStrength;
  confidence: KundliKarmaConfidence;
  summary: string;
  whyPresent: string;
  meaningForUser: string;
  evidence: KundliKarmaEvidence[];
  activation: KundliKarmaActivation;
  reductions: KundliKarmaReduction[];
  remedies: KundliKarmaRemedy[];
  crossReferences: KundliKarmaCrossReference[];
  sourceReferenceIds: string[];
};

export type KundliKarmaSourceReference = {
  id: string;
  title: string;
  url: string;
  usage: 'coverage_benchmark' | 'rule_context' | 'safety_context';
};

export type KundliKarmaRuleImplementationStatus =
  | 'implemented'
  | 'contract_fixture'
  | 'pending_engine'
  | 'needs_data'
  | 'blocked_context';

export type KundliKarmaRuleProvenance = {
  id: string;
  module: KundliKarmaModule;
  displayName: string;
  canonicalTerm: 'Dosh' | 'Shrap' | 'Yog' | 'Lal Kitab';
  sourceReferenceIds: string[];
  requiredInputs: KundliKarmaEvidenceKind[];
  fixtureIds: string[];
  implementationStatus: KundliKarmaRuleImplementationStatus;
  variationNotes: string[];
};

export type KundliKarmaDepthContract = {
  free: {
    maxVisibleItems: number;
    includesEvidenceSummary: boolean;
    includesDetailedRemedies: false;
  };
  premium: {
    maxVisibleItems: 'all';
    includesEvidenceSummary: true;
    includesDetailedRemedies: true;
  };
};

export type KundliKarmaIntelligence = {
  version: number;
  calculationStatus: 'ready' | 'partial' | 'needs_data';
  generatedBy: 'deterministic_contract';
  subjectName: string;
  summary: string;
  depthContract: KundliKarmaDepthContract;
  items: KundliKarmaItem[];
  topSignals: string[];
  noAiRequiredFor: string[];
  missingData: string[];
  safetyNotes: string[];
};

export type KundliKarmaRemedyPlanCategory =
  | 'free_karma_dharma_action'
  | 'premium_structured_remedy'
  | 'avoid_list'
  | 'timing_guidance';

export type KundliKarmaRankedCondition = {
  item: KundliKarmaItem;
  rank: number;
  score: number;
  whyThisRankedFirst: string;
  tooltip: string;
  dedupedWith: KundliKarmaCrossReference[];
};

export type KundliKarmaRemedyPlanItem = {
  id: string;
  category: KundliKarmaRemedyPlanCategory;
  depth: KundliKarmaDepth;
  title: string;
  description: string;
  timingGuidance: string;
  avoidList: string[];
  sourceItemIds: string[];
  sourceRuleIds: string[];
  tradition: KundliKarmaRemedy['tradition'];
  safetyNote: string;
};

export type KundliKarmaSnapshot = {
  version: number;
  calculationStatus: KundliKarmaIntelligence['calculationStatus'];
  generatedBy: 'deterministic_contract';
  subjectName: string;
  summary: string;
  strongestDosh?: KundliKarmaRankedCondition;
  strongestYog?: KundliKarmaRankedCondition;
  strongestShrapOrRin?: KundliKarmaRankedCondition;
  topRemedy?: KundliKarmaRemedyPlanItem;
  topThreeActiveConditions: KundliKarmaRankedCondition[];
  rankedConditions: KundliKarmaRankedCondition[];
  dedupedItemIds: string[];
  remedyPlan: KundliKarmaRemedyPlanItem[];
  noAiRequiredFor: string[];
  missingData: string[];
  safetyNotes: string[];
};

export type KundliKarmaFixture = {
  id: string;
  label: string;
  purpose:
    | 'clean_no_alert'
    | 'strong_dosh'
    | 'strong_shrap_indicator'
    | 'supportive_yog'
    | 'challenging_yog'
    | 'lal_kitab_rin_upay'
    | 'overlap_dedupe'
    | 'needs_data'
    | 'no_ai_local_memory';
  deterministic: true;
  expected: KundliKarmaIntelligence;
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

export type JaiminiCalculationStatus = 'partial' | 'pending' | 'ready';

export type JaiminiKarakaRole =
  | 'Atmakaraka'
  | 'Amatyakaraka'
  | 'Bhratrikaraka'
  | 'Matrikaraka'
  | 'Putrakaraka'
  | 'Gnatikaraka'
  | 'Darakaraka';

export type JaiminiCharaKaraka = {
  absoluteLongitude: number;
  chartContext: string;
  degree: number;
  dignity: 'debilitated' | 'exalted' | 'neutral';
  house: number;
  nakshatra: string;
  pada: number;
  planet: string;
  retrograde: boolean;
  role: JaiminiKarakaRole;
  sign: string;
};

export type JaiminiSoulChartReference = {
  ascendantSign?: string;
  calculationStatus: JaiminiCalculationStatus;
  chart?: ChartData;
  evidence: string[];
  source: string;
};

export type JaiminiPadaReference = {
  calculationStatus: JaiminiCalculationStatus;
  evidence: string[];
  padaHouse?: number;
  padaSign?: string;
  rule: string;
  sourceHouse: number;
  sourceLord?: string;
  sourceSign?: string;
};

export type JaiminiSignAspect = {
  aspectedPlanets: string[];
  aspectedSigns: string[];
  fromSign: string;
  planetsInSign: string[];
  signNature: 'dual' | 'fixed' | 'movable';
};

export type JaiminiCharaDashaPeriod = {
  calculationRule: string;
  endAge: number;
  evidence: string[];
  order: number;
  sign: string;
  signLord: string;
  startAge: number;
  years: number;
};

export type JaiminiPlan = {
  arudhaLagna: JaiminiPadaReference;
  atmakaraka?: JaiminiCharaKaraka;
  amatyakaraka?: JaiminiCharaKaraka;
  calculationStatus: JaiminiCalculationStatus;
  charaDashaTimeline: JaiminiCharaDashaPeriod[];
  charaKarakas: JaiminiCharaKaraka[];
  contractVersion: 'jaimini-phase-2-v1';
  currentCharaDasha?: JaiminiCharaDashaPeriod;
  darakaraka?: JaiminiCharaKaraka;
  evidenceWarnings: string[];
  freeInsight: string;
  jaiminiAspects: JaiminiSignAspect[];
  karakamsha: JaiminiSoulChartReference;
  premiumInsight: string;
  swamsa: JaiminiSoulChartReference;
  upapadaLagna: JaiminiPadaReference;
};

export type JaiminiInterpretationBlockId =
  | 'career-dharma-reading'
  | 'current-destiny-chapter'
  | 'premium-deepening'
  | 'relationship-mirror-reading'
  | 'soul-planet-reading'
  | 'technical-evidence'
  | 'visible-identity-reading'
  | 'what-to-focus-on-now';

export type JaiminiInterpretationBlock = {
  confidence: 'high' | 'medium' | 'pending';
  guidance: string;
  headline: string;
  id: JaiminiInterpretationBlockId;
  premiumOnly?: boolean;
  prediction: string;
  technicalEvidence: string[];
  title: string;
};

export type JaiminiInterpretation = {
  blocks: JaiminiInterpretationBlock[];
  calculationStatus: JaiminiCalculationStatus;
  freeBlocks: JaiminiInterpretationBlock[];
  guardrails: string[];
  premiumBlocks: JaiminiInterpretationBlock[];
  premiumSummary: string;
  summary: string;
  technicalEvidence: string[];
};

export type VedicIntelligenceStatus = 'pending' | 'ready';

export type VedicIntelligenceSectionId =
  | 'avakhada-chakra'
  | 'ashtakavarga'
  | 'benefic-malefic'
  | 'chalit-table'
  | 'friendship-table'
  | 'ghatak-favorable'
  | 'house-wise-placements'
  | 'karakamsha'
  | 'mahadasha-phala'
  | 'moon-chart'
  | 'panchang'
  | 'prastarashtakavarga'
  | 'samsa'
  | 'swamsa'
  | 'snapshot';

export type VedicIntelligenceEvidence = {
  source: string;
  observation: string;
};

export type VedicIntelligenceSection = {
  id: VedicIntelligenceSectionId;
  title: string;
  explanation: string;
  freeInsight: string;
  premiumAnalysis: string;
  evidence: VedicIntelligenceEvidence[];
  limitations: string[];
  status: VedicIntelligenceStatus;
};

export type VedicGrahaVisualToken =
  | 'benefic-soft'
  | 'lunar-disc-dark'
  | 'lunar-disc-full'
  | 'lunar-disc-unknown'
  | 'lunar-disc-waning'
  | 'lunar-disc-waxing'
  | 'node-shadow'
  | 'planet-fire'
  | 'planet-gold'
  | 'planet-green'
  | 'planet-silver'
  | 'planet-steel'
  | 'planet-water';

export type VedicGrahaVisualMetadata = {
  accessibleLabel: string;
  badgeToken: VedicGrahaVisualToken;
  displayLabel: string;
  graha: string;
  localizedDisplayLabel: Record<SupportedLanguage, string>;
  shadowNode: boolean;
  shortLabel: string;
};

export type VedicHouseWisePlanetPlacement = {
  combust: boolean;
  debilitated: boolean;
  degree: number;
  dignity: 'debilitated' | 'exalted' | 'neutral';
  exalted: boolean;
  house: number;
  nakshatra: string;
  pada: number;
  planet: string;
  retrograde: boolean;
  sign: string;
};

export type VedicFriendshipRelation =
  | 'enemy'
  | 'friend'
  | 'neutral'
  | 'pending';

export type VedicPlanetFriendshipRow = {
  compoundRelationship: VedicFriendshipRelation;
  compoundRelationships: Record<string, VedicFriendshipRelation>;
  fromPlanet: string;
  interpretation: string;
  naturalRelationships: Record<string, VedicFriendshipRelation>;
  temporaryRelationships: Record<string, VedicFriendshipRelation>;
};

export type VedicBeneficMaleficClassification = {
  functionalBenefics: string[];
  functionalMalefics: string[];
  naturalBenefics: string[];
  naturalMalefics: string[];
};

export type VedicChalitTableRow = {
  planet: string;
  rashiHouse: number;
  chalitHouse: number;
  rashiSign: string;
  shifted: boolean;
  shiftDirection: 'previous' | 'same' | 'next' | 'other';
};

export type VedicMahadashaPhalaBlock = {
  id: string;
  title: string;
  period: string;
  freeInsight: string;
  premiumAnalysis: string;
  evidence: VedicIntelligenceEvidence[];
  limitations: string[];
};

export type VedicMahadashaPhala = {
  pastMahadashas: VedicMahadashaPhalaBlock[];
  currentEntireMahadasha: VedicMahadashaPhalaBlock;
  currentMahadashaAntardasha: VedicMahadashaPhalaBlock;
  currentMahadashaAntardashaPratyantardasha: VedicMahadashaPhalaBlock;
  pratyantardashaCaution: string;
};

export type VedicIntelligenceContract = {
  ownerName: string;
  generatedAt: string;
  depth: 'FREE' | 'PREMIUM';
  snapshot: VedicIntelligenceSection & {
    lagna: string;
    moonSign: string;
    nakshatra: string;
    currentDasha: string;
    strongestHouses: number[];
    weakestHouses: number[];
  };
  chartOrder: Array<{
    id: 'D1' | 'MOON' | 'D9' | 'SWAMSA' | 'KARAKAMSHA' | 'CHALIT' | ChartType;
    title: string;
    chart?: ChartData;
    explanation: string;
  }>;
  moonChart: VedicIntelligenceSection & {
    chart?: ChartData;
  };
  swamsa: VedicIntelligenceSection & {
    chart?: ChartData;
  };
  grahaVisualMetadata: VedicGrahaVisualMetadata[];
  houseWisePlacements: VedicIntelligenceSection & {
    rows: VedicHouseWisePlanetPlacement[];
  };
  friendshipTable: VedicIntelligenceSection & {
    rows: VedicPlanetFriendshipRow[];
  };
  beneficMalefic: VedicIntelligenceSection & VedicBeneficMaleficClassification;
  chalitTable: VedicIntelligenceSection & {
    rows: VedicChalitTableRow[];
  };
  panchang: VedicIntelligenceSection;
  samsa: VedicIntelligenceSection;
  ghatakFavorable: VedicIntelligenceSection;
  karakamsha: VedicIntelligenceSection & {
    chart?: ChartData;
  };
  ashtakavarga: VedicIntelligenceSection;
  prastarashtakavarga: VedicIntelligenceSection;
  avakhadaChakra: VedicIntelligenceSection;
  mahadashaPhala: VedicIntelligenceSection & VedicMahadashaPhala;
  sections: VedicIntelligenceSection[];
  limitations: string[];
};

export type BhavChalitCusp = {
  house: number;
  longitude: number;
  sign: string;
  degree: number;
  signLord: string;
};

export type BhavChalitPlanetPlacement = {
  planet: string;
  rashiHouse: number;
  bhavHouse: number;
  rashiSign: string;
  bhavCuspSign: string;
  shifted: boolean;
  shiftDirection: 'previous' | 'same' | 'next' | 'other';
  absoluteLongitude: number;
};

export type BhavChalitData = {
  status: 'ready' | 'pending';
  houseSystem: 'PLACIDUS';
  ayanamsa: 'LAHIRI';
  description: string;
  cusps: BhavChalitCusp[];
  planetPlacements: BhavChalitPlanetPlacement[];
  shifts: BhavChalitPlanetPlacement[];
  limitations: string[];
};

export type ChalitCusp = {
  house: number;
  midpointLongitude: number;
  startLongitude: number;
  endLongitude: number;
  sign: string;
  degree: number;
};

export type ChalitPlanetPlacement = {
  planet: string;
  rashiHouse: number;
  chalitHouse: number;
  rashiSign: string;
  shifted: boolean;
  shiftDirection: 'previous' | 'same' | 'next' | 'other';
  absoluteLongitude: number;
};

export type ChalitData = {
  status: 'ready' | 'pending';
  houseSystem: 'EQUAL_BHAVA_FROM_LAGNA_DEGREE';
  ayanamsa: 'LAHIRI';
  ascendantDegree: number;
  description: string;
  cusps: ChalitCusp[];
  planetPlacements: ChalitPlanetPlacement[];
  shifts: ChalitPlanetPlacement[];
  limitations: string[];
};

export type KPLordChain = {
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
  nakshatra: string;
};

export type KPCusp = {
  house: number;
  longitude: number;
  sign: string;
  degree: number;
  lordChain: KPLordChain;
};

export type KPPlanet = {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
  lordChain: KPLordChain;
};

export type KPSignificator = {
  planet: string;
  occupiedHouse?: number;
  ownedHouses: number[];
  starLordHouses: number[];
  subLordHouses: number[];
  signifiesHouses: number[];
  strength: 'A' | 'B' | 'C' | 'D';
  simpleMeaning: string;
};

export type KPRulingPlanets = {
  dayLord: string;
  moonSignLord: string;
  moonStarLord: string;
  moonSubLord: string;
  lagnaSignLord: string;
  lagnaStarLord: string;
  lagnaSubLord: string;
};

export type KPSystemData = {
  status: 'ready' | 'foundation' | 'pending';
  method: 'KRISHNAMURTI_PADDHATI';
  title: string;
  description: string;
  ayanamsa: 'KRISHNAMURTI';
  houseSystem: 'PLACIDUS';
  cusps: KPCusp[];
  planets: KPPlanet[];
  significators: KPSignificator[];
  rulingPlanets: KPRulingPlanets;
  horaryNote: string;
  limitations: string[];
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

export type MahadashaInsightDepth = 'FREE' | 'PREMIUM';

export type DashaEvidenceWeight =
  | 'supportive'
  | 'challenging'
  | 'mixed'
  | 'neutral';

export type DashaEvidenceItem = {
  id: string;
  title: string;
  observation: string;
  interpretation: string;
  weight: DashaEvidenceWeight;
};

export type DashaWindowInsight = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'past' | 'current' | 'upcoming' | 'later';
  theme: string;
  timing: string;
  focusAreas: string[];
  practicalGuidance: string;
  evidence: DashaEvidenceItem[];
  premiumDetail?: string;
};

export type MahadashaCurrentInsight = {
  mahadasha: string;
  antardasha: string;
  startDate: string;
  endDate: string;
  theme: string;
  simpleMeaning: string;
  confidence: 'low' | 'medium' | 'high';
  freeInsight: string;
  premiumSynthesis?: string;
  evidence: DashaEvidenceItem[];
};

export type MahadashaIntelligence = {
  status: 'ready' | 'pending';
  ownerName: string;
  title: string;
  subtitle: string;
  depth: MahadashaInsightDepth;
  current: MahadashaCurrentInsight;
  mahadashas: DashaWindowInsight[];
  antardashas: DashaWindowInsight[];
  pratyantardashas: DashaWindowInsight[];
  timingWindows: DashaWindowInsight[];
  remedies: string[];
  limitations: string[];
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
};

export type SadeSatiInsightDepth = 'FREE' | 'PREMIUM';

export type SadeSatiPhase =
  | 'not-active'
  | 'first-phase'
  | 'peak-phase'
  | 'final-phase';

export type SadeSatiEvidenceItem = {
  id: string;
  title: string;
  observation: string;
  interpretation: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
};

export type SadeSatiWindow = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'past' | 'current' | 'upcoming' | 'later';
  summary: string;
  guidance: string;
  confidence: 'low' | 'medium' | 'high';
};

export type SadeSatiIntelligence = {
  status: 'ready' | 'pending';
  ownerName: string;
  title: string;
  subtitle: string;
  depth: SadeSatiInsightDepth;
  active: boolean;
  phase: SadeSatiPhase;
  phaseLabel: string;
  saturnSign: string;
  moonSign: string;
  houseFromMoon: number;
  houseFromLagna: number;
  summary: string;
  freeInsight: string;
  premiumSynthesis?: string;
  confidence: 'low' | 'medium' | 'high';
  evidence: SadeSatiEvidenceItem[];
  windows: SadeSatiWindow[];
  remedies: string[];
  limitations: string[];
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
};

export type TransitGocharInsightDepth = 'FREE' | 'PREMIUM';

export type TransitGocharEvidenceItem = {
  id: string;
  title: string;
  observation: string;
  interpretation: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
};

export type TransitGocharPlanetInsight = {
  id: string;
  planet: string;
  sign: string;
  degree: number;
  houseFromLagna: number;
  houseFromMoon: number;
  retrograde: boolean;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
  area: JyotishArea;
  headline: string;
  simpleMeaning: string;
  practicalGuidance: string;
  evidence: TransitGocharEvidenceItem[];
  premiumDetail?: string;
};

export type TransitGocharMonthlyCard = {
  id: string;
  monthLabel: string;
  title: string;
  summary: string;
  focusAreas: JyotishArea[];
  planets: string[];
  guidance: string;
  confidence: 'low' | 'medium' | 'high';
};

export type TransitGocharIntelligence = {
  status: 'ready' | 'pending';
  ownerName: string;
  title: string;
  subtitle: string;
  depth: TransitGocharInsightDepth;
  calculatedAt: string;
  snapshotSummary: string;
  dominantWeight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
  topOpportunities: TransitGocharPlanetInsight[];
  cautionSignals: TransitGocharPlanetInsight[];
  planetInsights: TransitGocharPlanetInsight[];
  monthlyCards: TransitGocharMonthlyCard[];
  dashaOverlay: string;
  evidence: TransitGocharEvidenceItem[];
  limitations: string[];
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
};

export type YearlyHoroscopeInsightDepth = 'FREE' | 'PREMIUM';

export type YearlyHoroscopeEvidenceItem = {
  id: string;
  title: string;
  observation: string;
  interpretation: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
};

export type YearlyHoroscopeMonthCard = {
  id: string;
  monthLabel: string;
  title: string;
  summary: string;
  focusAreas: JyotishArea[];
  guidance: string;
  confidence: 'low' | 'medium' | 'high';
};

export type YearlyHoroscopeData = {
  status: 'ready' | 'foundation' | 'pending';
  method: 'TAJIKA_SOLAR_RETURN_FOUNDATION';
  yearLabel: string;
  solarYearStart: string;
  solarYearEnd: string;
  solarReturnUtc: string;
  varshaLagna: string;
  munthaSign: string;
  munthaHouse: number;
  munthaLord: string;
  yearAge: number;
  planets: PlanetPosition[];
  limitations: string[];
};

export type YearlyHoroscopeVarshaphal = {
  status: 'ready' | 'pending';
  ownerName: string;
  title: string;
  subtitle: string;
  depth: YearlyHoroscopeInsightDepth;
  yearLabel: string;
  solarYearStart: string;
  solarYearEnd: string;
  solarReturnUtc?: string;
  varshaLagna: string;
  munthaSign: string;
  munthaHouse: number;
  munthaLord: string;
  yearTheme: string;
  freeInsight: string;
  premiumSynthesis?: string;
  focusAreas: JyotishArea[];
  supportSignals: YearlyHoroscopeEvidenceItem[];
  cautionSignals: YearlyHoroscopeEvidenceItem[];
  monthlyCards: YearlyHoroscopeMonthCard[];
  evidence: YearlyHoroscopeEvidenceItem[];
  dashaOverlay: string;
  gocharOverlay: string;
  limitations: string[];
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
};

export type AdvancedJyotishInsightDepth = 'FREE' | 'PREMIUM';

export type AdvancedJyotishModuleId =
  | 'yoga-dosha'
  | 'nakshatra'
  | 'micro-points'
  | 'ashtakavarga'
  | 'panchang-muhurta'
  | 'compatibility'
  | 'prashna'
  | 'safe-remedies'
  | 'advanced-mode';

export type AdvancedJyotishModulePolicy = {
  id: AdvancedJyotishModuleId;
  title: string;
  simpleName: string;
  freeAccess: string;
  premiumDepth: string;
  premiumOnly?: boolean;
};

export type AdvancedJyotishEvidenceItem = {
  id: string;
  title: string;
  observation: string;
  interpretation: string;
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
};

export type AdvancedYogaDoshaInsight = {
  id: string;
  name: string;
  kind: 'yoga' | 'care-pattern';
  strength: 'mild' | 'moderate' | 'strong';
  status: 'active' | 'softened' | 'needs-review';
  summary: string;
  cancellationFactors: string[];
  evidence: AdvancedJyotishEvidenceItem[];
};

export type AdvancedNakshatraInsight = {
  moonNakshatra: string;
  pada: number;
  lord: string;
  theme: string;
  simpleInsight: string;
  padaMeaning?: string;
  rule?: string;
  premiumSynthesis?: string;
  evidence: AdvancedJyotishEvidenceItem[];
};

export type AdvancedMicroPointInsight = {
  name: string;
  kind: 'modern' | 'sensitive' | 'upagraha';
  sign: string;
  house: number;
  degree: number;
  nakshatra: string;
  pada: number;
  padaMeaning?: string;
  simpleMeaning?: string;
  howToUse: string;
  calculationNote?: string;
};

export type AdvancedMicroPointIntelligence = {
  rule: string;
  freePolicy: string;
  premiumPolicy: string;
  points: AdvancedMicroPointInsight[];
};

export type AdvancedAshtakavargaHouse = {
  house: number;
  score: number;
  tone: 'supportive' | 'steady' | 'careful';
  theme: string;
  guidance: string;
};

export type AdvancedPanchangMuhurta = {
  date: string;
  weekday: string;
  tithi: string;
  moonNakshatra: string;
  favorableWindows: string[];
  avoidFor: string[];
  simpleGuidance: string;
  evidence: AdvancedJyotishEvidenceItem[];
};

export type AdvancedCompatibilityModel = {
  status: 'single-chart' | 'ready';
  summary: string;
  evidenceModel: string[];
  requiredSecondProfile: boolean;
};

export type AdvancedPrashnaPlan = {
  status: 'planned' | 'ready';
  summary: string;
  requiredInputs: string[];
  guardrails: string[];
};

export type AdvancedJyotishCoverage = {
  status: 'ready' | 'pending';
  ownerName: string;
  title: string;
  subtitle: string;
  depth: AdvancedJyotishInsightDepth;
  moduleRegistry: AdvancedJyotishModulePolicy[];
  freePolicy: string;
  premiumPolicy: string;
  yogaDoshaInsights: AdvancedYogaDoshaInsight[];
  nakshatraInsight: AdvancedNakshatraInsight;
  microPointIntelligence?: AdvancedMicroPointIntelligence;
  ashtakavargaDetail: AdvancedAshtakavargaHouse[];
  panchangMuhurta: AdvancedPanchangMuhurta;
  compatibility: AdvancedCompatibilityModel;
  prashna: AdvancedPrashnaPlan;
  advancedModeTables: Array<{
    id: string;
    title: string;
    summary: string;
    rows: Array<{
      label: string;
      value: string;
      note: string;
    }>;
  }>;
  safeRemedies: string[];
  limitations: string[];
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
};

export type NadiJyotishInsightDepth = 'FREE' | 'PREMIUM';

export type NadiJyotishPattern = {
  id: string;
  title: string;
  planets: string[];
  relation:
    | 'same-sign'
    | 'trine-link'
    | 'opposition-link'
    | 'sequence-link'
    | 'karaka-link'
    | 'rahu-ketu-axis';
  observation: string;
  meaning: string;
  lifeAreas: JyotishArea[];
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral';
  confidence: 'low' | 'medium' | 'high';
  freeInsight: string;
  premiumDetail?: string;
  evidence: string[];
};

export type NadiChartStoryLens = {
  strongestThread: string;
  repeatingPattern: string;
  activeLesson: string;
  stuckPoint: string;
  shiftThatHelps: string;
  validationBridge: string;
  activationSummary: string;
  hiddenPatternSentence: string;
  evidencePath: string[];
};

export type NadiRahuKetuAxis = {
  pullsForward: string;
  learningToRelease: string;
  becomesLouder: string;
  balancePractice: string;
};

export type NadiValidationStatus = 'confirmed' | 'partially-confirmed' | 'needs-validation';

export type NadiPredictaDigest = {
  activeKundliId?: string;
  activeStoryFocus: string;
  strongestStoryThread: string;
  giftInsidePattern: string;
  repeatingLesson: string;
  rahuKetuAxisSummary: string;
  validationQuestions: string[];
  validationStatus: NadiValidationStatus;
  activationWindows: string[];
  nextPractice: string;
  storyEvidenceAvailability: 'ready' | 'partial' | 'pending';
  depthAvailable: NadiJyotishInsightDepth;
  latestReportSummary: string;
};

export type NadiJyotishActivation = {
  id: string;
  title: string;
  trigger: string;
  timing: string;
  observation: string;
  guidance: string;
  premiumDetail?: string;
};

export type NadiJyotishPremiumPlan = {
  status: 'ready' | 'pending';
  ownerName: string;
  title: string;
  subtitle: string;
  depth: NadiJyotishInsightDepth;
  premiumOnly: true;
  schoolBoundary: string;
  methodSummary: string;
  handoffQuestion?: string;
  freePreview: string;
  premiumSynthesis?: string;
  storyLens: NadiChartStoryLens;
  rahuKetuAxis: NadiRahuKetuAxis;
  validationStatus: NadiValidationStatus;
  digest: NadiPredictaDigest;
  patterns: NadiJyotishPattern[];
  activations: NadiJyotishActivation[];
  validationQuestions: string[];
  guardrails: string[];
  limitations: string[];
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
};

export type ChalitBhavKpInsightDepth = 'FREE' | 'PREMIUM';

export type ChalitShiftMeaning = {
  planet: string;
  fromHouse: number;
  toHouse: number;
  fromArea: string;
  toArea: string;
  meaning: string;
  awareness: string;
};

export type KpEventJudgement = {
  verdictLabel:
    | 'Likely'
    | 'Delayed'
    | 'Mixed promise'
    | 'Needs more clarity'
    | 'Not enough proof';
  promise: string;
  decisionPoint: string;
  timingReadiness: string;
  mainBlock: string;
  confidence: 'clear' | 'partial' | 'uncertain';
  plainLanguage: string;
  nextQuestion: string;
  proofPath: string[];
  eventCarriers: Array<{
    planet: string;
    role: 'carrier' | 'supporter' | 'blocker';
    reason: string;
  }>;
  eventVerdictCompass: {
    promise: string;
    block: string;
    timing: string;
    confidence: string;
  };
  questionClarityState: 'ready' | 'needs-exact-question' | 'pending';
  questionToProofPath: string[];
  timingReadinessState: 'ready' | 'partial' | 'pending';
};

export type KpPredictaDigest = {
  activeKundliId?: string;
  selectedEventCategory: string;
  exactUserEventQuestion: string;
  questionClarityState: KpEventJudgement['questionClarityState'];
  currentVerdict: KpEventJudgement['verdictLabel'];
  promiseBlockTimingConfidenceSummary: string;
  relevantHouses: number[];
  mainCusps: number[];
  eventCarriers: KpEventJudgement['eventCarriers'];
  blockers: string[];
  timingReadiness: string;
  proofAvailability: 'ready' | 'partial' | 'pending';
  depthAvailable: ChalitBhavKpInsightDepth;
  latestReportSummary: string;
};

export type ChalitBhavKpFoundation = {
  status: 'ready' | 'partial' | 'pending';
  ownerName: string;
  depth: ChalitBhavKpInsightDepth;
  bhavChalit: {
    title: string;
    subtitle: string;
    whatChanges: string;
    activeLifeAreas: string[];
    practicalCorrection: string;
    shiftMeanings: ChalitShiftMeaning[];
    freeInsight: string;
    premiumSynthesis?: string;
    shifts: Array<BhavChalitPlanetPlacement | ChalitPlanetPlacement>;
    cusps: Array<BhavChalitCusp | ChalitCusp>;
    evidence: string[];
    limitations: string[];
  };
  kp: {
    title: string;
    subtitle: string;
    freeInsight: string;
    premiumSynthesis?: string;
    eventJudgement: KpEventJudgement;
    cusps: KPCusp[];
    planets: KPPlanet[];
    significators: KPSignificator[];
    rulingPlanets?: KPRulingPlanets;
    evidence: string[];
    limitations: string[];
    digest: KpPredictaDigest;
  };
  premiumUnlock: string;
  ctas: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  askPrompt: string;
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

export type PredictaStylePreference =
  | 'balanced'
  | 'devotional'
  | 'secular';

export type LanguagePreference = {
  appLanguage?: SupportedLanguage;
  chartLanguage?: SupportedLanguage;
  predictaReplyLanguage?: SupportedLanguage;
  predictaStylePreference?: PredictaStylePreference;
  reportLanguage?: SupportedLanguage;
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

export type HolisticDecisionTimingSignal = {
  id:
    | 'decision-state'
    | 'dasha'
    | 'gochar'
    | 'purushartha'
    | 'sadhana'
    | 'timeline'
    | 'safety';
  label: string;
  headline: string;
  body: string;
  tone: 'supportive' | 'steady' | 'careful';
  evidence: string[];
};

export type HolisticDecisionTimingSynthesis = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  question: string;
  area: DecisionArea;
  state: DecisionState;
  headline: string;
  timingWindow: string;
  decisionGuidance: string;
  practicalStep: string;
  riskBoundary: string;
  sadhanaSupport: string;
  purusharthaLens: string;
  dailyAnchor: string;
  signals: HolisticDecisionTimingSignal[];
  evidence: string[];
  guardrails: string[];
  askPrompt: string;
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
  | 'spouse'
  | 'partner'
  | 'fiance'
  | 'son'
  | 'daughter'
  | 'mother'
  | 'father'
  | 'brother'
  | 'sister'
  | 'cousin'
  | 'maternal-aunt'
  | 'paternal-aunt'
  | 'aunt'
  | 'maternal-uncle'
  | 'paternal-uncle'
  | 'uncle'
  | 'grandmother'
  | 'grandfather'
  | 'mother-in-law'
  | 'father-in-law'
  | 'sister-in-law'
  | 'brother-in-law'
  | 'aunt-in-law'
  | 'uncle-in-law'
  | 'niece'
  | 'nephew'
  | 'friend'
  | 'best-friend'
  | 'co-worker'
  | 'manager'
  | 'business-partner'
  | 'mentor'
  | 'student'
  | 'other';

export type FamilyRelationshipColorToken =
  | 'deep-gold'
  | 'rose-pink'
  | 'soft-peach'
  | 'calm-teal'
  | 'saffron'
  | 'slate-blue'
  | 'gentle-green'
  | 'sky-blue'
  | 'lavender-blue'
  | 'muted-steel'
  | 'mauve'
  | 'sand'
  | 'deep-indigo'
  | 'soft-plum'
  | 'sage'
  | 'warm-amber';

export type PairComparisonTone = 'supportive' | 'mixed' | 'careful';

export type PairComparisonHighlight = {
  id: string;
  title: string;
  summary: string;
  guidance: string;
  evidence: string[];
};

export type PairComparisonPremiumSection = {
  id:
    | 'emotional-rhythm'
    | 'communication-style'
    | 'duty-friction'
    | 'money-alignment'
    | 'responsibility-balance'
    | 'healing-potential'
    | 'timing-window';
  title: string;
  summary: string;
  guidance: string;
  evidence: string[];
};

export type PairComparison = {
  status: 'ready' | 'pending';
  firstProfile: FamilyMemberProfile;
  secondProfile: FamilyMemberProfile;
  relationshipContextLabel: string;
  headline: string;
  overview: string;
  overallTone: PairComparisonTone;
  harmonyAreas: string[];
  frictionAreas: string[];
  karmaTheme: string;
  dharmaLesson: string;
  practicalGuidance: string;
  freeHighlights: PairComparisonHighlight[];
  premiumSections: PairComparisonPremiumSection[];
  shareSummary: string;
  askPrompt: string;
};

export type FamilyMemberProfile = {
  id: string;
  name: string;
  relationship: FamilyRelationshipLabel;
  relationshipDisplayLabel: string;
  relationshipColorToken: FamilyRelationshipColorToken;
  isOwnerProfile: boolean;
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
  tone: PairComparisonTone;
  emotionalPattern: string;
  supportPattern: string;
  frictionPattern: string;
  dharmaSupport: string;
  careArea: string;
  practicalGuidance: string;
  evidence: string[];
};

export type FamilyInfluenceMatrixRow = {
  memberId: string;
  name: string;
  relationshipDisplayLabel: string;
  influence: string;
  supportNeed: string;
  influenceTone: PairComparisonTone;
  caregivingRole: string;
  authorityPattern: string;
  communicationRisk: string;
  healingKey: string;
};

export type FamilyKarmaMap = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  members: FamilyMemberProfile[];
  householdSummary: string;
  strongestSupportPair?: string;
  strongestFrictionPair?: string;
  repeatingKarmaPattern?: string;
  dharmaRepairPath?: string;
  repeatedThemes: FamilyKarmaTheme[];
  relationshipCards: FamilyRelationshipGuidance[];
  influenceMatrix: FamilyInfluenceMatrixRow[];
  householdEmotionalClimate: string;
  authorityDependencyPattern: string;
  caregivingBurdenMap: string;
  communicationFractureMap: string;
  ritualRoutineMoneyStressMap: string;
  whoCalmsTheHouse?: string;
  whoAmplifiesPressure?: string;
  whoNeedsGentlerHandling?: string;
  fastestHealingPair?: string;
  repeatedRoutineMoneyTension?: string;
  actionableHealingGuidance: string[];
  privacyNote: string;
  shareSummary: string;
  askPrompt: string;
};

export type MatchmakingDepth = 'FREE' | 'PREMIUM';

export type MatchmakingCategoryId =
  | 'traditional-foundation'
  | 'emotional-compatibility'
  | 'dharma-alignment'
  | 'family-adaptation'
  | 'conflict-recovery'
  | 'long-term-stability';

export type MatchmakingScoreBand =
  | 'unusually-strong'
  | 'strong-manageable'
  | 'mixed-workable'
  | 'difficult-serious-alignment'
  | 'structurally-strained';

export type MatchmakingScoreBreakdown = {
  id: MatchmakingCategoryId;
  title: string;
  score: number;
  maxScore: number;
  summary: string;
  evidence: string[];
};

export type MatchmakingDetailSection = {
  id: string;
  title: string;
  summary: string;
  guidance: string;
  evidence: string[];
};

export type MatchmakingAnalysis = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  boyName: string;
  girlName: string;
  overallScore: number;
  scoreBand: MatchmakingScoreBand;
  scoreBandLabel: string;
  scoreBandExplanation: string;
  overallConclusion: string;
  strengths: string[];
  cautionAreas: string[];
  traditionalBaseline: string;
  supportPotential: string;
  familyBlendingRisk: string;
  timingNote: string;
  practicalAdvice: string[];
  premiumUnlock: string;
  scoreBreakdown: MatchmakingScoreBreakdown[];
  premiumSections: MatchmakingDetailSection[];
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

export type HolisticAnswerPart =
  | 'prediction'
  | 'chart-proof'
  | 'timing'
  | 'karma-pattern'
  | 'remedy-direction'
  | 'practical-action'
  | 'safety-boundary';

export type PlanetKarmaRemedyProfile = {
  planet: string;
  karmicLesson: string;
  higherExpression: string;
  shadowPattern: string;
  remedyDirections: string[];
  conductCorrections: string[];
  sevaCharity: string[];
  mantraPrayer: string;
  fastingDiscipline: string;
  lifestylePractice: string;
  gemstoneCaution: string;
};

export type HolisticPlanetFocus = {
  planet: string;
  priority: 'low' | 'medium' | 'high';
  whyItMatters: string;
  chartEvidence: string[];
  karmicPattern: string;
  remedyDirection: string;
  simpleRemedy: string;
  mantraDevotion: string;
  practicalAction: string;
  safetyNote: string;
};

export type HolisticFoundationModel = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  answerParts: HolisticAnswerPart[];
  remedyPriority: string[];
  planetRemedyMap: PlanetKarmaRemedyProfile[];
  activePlanetFocus: HolisticPlanetFocus[];
  safetyRules: string[];
  askPrompt: string;
};

export type PurusharthaCategory = 'dharma' | 'artha' | 'kama' | 'moksha';

export type PurusharthaAxisInsight = {
  category: PurusharthaCategory;
  label: 'Dharma' | 'Artha' | 'Kama' | 'Moksha';
  score: number;
  tone: 'supportive' | 'steady' | 'careful';
  houses: number[];
  meaning: string;
  currentEmphasis: string;
  chartEvidence: string[];
  practicalGuidance: string;
};

export type PurusharthaLifeBalance = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  dominant: PurusharthaAxisInsight;
  needsCare: PurusharthaAxisInsight;
  axes: PurusharthaAxisInsight[];
  summary: string;
  askPrompt: string;
  limitations: string[];
};

export type PersonalPanchangTone = 'supportive' | 'steady' | 'careful';

export type PersonalPanchangSignal = {
  id: string;
  label: string;
  value: string;
  meaning: string;
  tone: PersonalPanchangTone;
};

export type PersonalPanchangLayer = {
  status: 'ready' | 'pending';
  date: string;
  title: string;
  subtitle: string;
  weekday: string;
  weekdayLord: string;
  tithi: string;
  paksha: 'Shukla' | 'Krishna' | 'Unknown';
  moonSign: string;
  moonNakshatra: string;
  natalNakshatra?: string;
  todayFocus: string;
  bestFor: string[];
  avoidFor: string[];
  personalRemedy: string;
  signals: PersonalPanchangSignal[];
  evidence: string[];
  askPrompt: string;
  limitations: string[];
};

export type HolisticReadingRoomId =
  | 'today'
  | 'karma-remedies'
  | 'dharma'
  | 'artha'
  | 'kama'
  | 'moksha'
  | 'timing';

export type HolisticReadingRoom = {
  id: HolisticReadingRoomId;
  title: string;
  subtitle: string;
  tone: 'supportive' | 'steady' | 'careful';
  primaryFocus: string;
  proofChips: string[];
  evidence: string[];
  practice: string;
  remedy: string;
  bestQuestion: string;
  relatedPlanets: string[];
  relatedHouses: number[];
};

export type HolisticReadingRooms = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  featuredRoom: HolisticReadingRoom;
  rooms: HolisticReadingRoom[];
  guardrails: string[];
  askPrompt: string;
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

export type SadhanaRemedyStageId =
  | 'conduct'
  | 'seva'
  | 'mantra-prayer'
  | 'discipline'
  | 'lifestyle'
  | 'review';

export type SadhanaRemedyStage = {
  id: SadhanaRemedyStageId;
  label: string;
  sequence: number;
  status: 'not-started' | 'active' | 'done' | 'review';
  practice: string;
  whyItWorks: string;
  cadence: string;
  completionTarget: string;
  caution: string;
};

export type SadhanaRemedyPath = {
  status: 'ready' | 'pending';
  title: string;
  subtitle: string;
  planet?: string;
  planetReason: string;
  karmicTheme: string;
  weeklyIntention: string;
  stages: SadhanaRemedyStage[];
  progressSummary: string;
  reviewQuestions: string[];
  guardrails: string[];
  askPrompt: string;
};

export type HolisticDailyGuidanceBlock = {
  id: 'today-focus' | 'best-action' | 'avoid' | 'sadhana' | 'balance' | 'timing';
  label: string;
  headline: string;
  body: string;
  tone: 'supportive' | 'steady' | 'careful';
  proofChips: string[];
};

export type HolisticDailyGuidance = {
  status: 'ready' | 'pending';
  date: string;
  title: string;
  subtitle: string;
  headline: string;
  dailyFocus: string;
  morningPractice: string;
  middayCheck: string;
  eveningReview: string;
  bestAction: string;
  avoidAction: string;
  sadhanaStep: string;
  purusharthaFocus: string;
  timingNote: string;
  remedy: string;
  blocks: HolisticDailyGuidanceBlock[];
  evidence: string[];
  guardrails: string[];
  askPrompt: string;
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
  planetInvolved?: string;
  karmicPattern?: string;
  remedyDirection?: string;
  simpleRemedy?: string;
  mantraDevotion?: string;
  practicalAction?: string;
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
  sadhanaPath?: SadhanaRemedyPath;
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

export type NumerologyNameMethod = 'CHALDEAN' | 'PYTHAGOREAN';

export type NumerologyNumberInsight = {
  root: number;
  compound: number;
  label: string;
  keywords: string[];
  simpleMeaning: string;
};

export type NumerologyCycleInsight = NumerologyNumberInsight & {
  period: 'year' | 'month' | 'day';
  date: string;
};

export type NumerologyPatternTone =
  | 'balanced'
  | 'missing'
  | 'repeated'
  | 'strong';

export type NumerologyFrequencyCell = {
  number: number;
  count: number;
  tone: NumerologyPatternTone;
  keyword: string;
  insight: string;
};

export type NumerologyMandalaNode = {
  id:
    | 'birth'
    | 'destiny'
    | 'name'
    | 'personal-day'
    | 'personal-month'
    | 'personal-year';
  label: string;
  number: number;
  colorToken: string;
  keyword: string;
  shortMeaning: string;
  accessibleLabel: string;
};

export type NumerologyNameScannerStep = {
  letter: string;
  value: number;
};

export type NumerologyYearTimelineMonth = {
  monthLabel: string;
  cycleNumber: number;
  keyword: string;
  guidance: string;
};

export type NumerologyNameFitScore = {
  score: number;
  confidence: 'high' | 'low' | 'medium';
  expression: number;
  stability: number;
  publicRhythm: number;
  destinySupport: number;
  summary: string;
  limitations: string[];
};

export type NumerologyCompatibilityLens = {
  status: 'pending' | 'ready';
  supportZones: string[];
  frictionZones: string[];
  howToWorkBetter: string;
  confidence: 'high' | 'low' | 'medium';
  limitations: string[];
};

export type NumerologySupportiveToolkit = {
  colors: string[];
  days: string[];
  numbers: number[];
  affirmation: string;
  habits: string[];
  framing: string;
};

export type NumerologyNameRefinement = {
  status: 'pending' | 'ready';
  currentNameFit: NumerologyNameFitScore;
  comparisonNote: string;
  suggestedInputs: string[];
  limitations: string[];
};

export type NumerologyIdentityDashboard = {
  lifeThemeSentence: string;
  bestUseOfCurrentCycle: string;
  currentCycleLeanInto: string;
  currentCycleAvoid: string;
  maturityDirection: string;
  firstLetterInfluence: string;
  nameStrength: string;
  missingNumbers: number[];
  repeatedNumbers: number[];
  strongNumbers: number[];
  frequencyMap: NumerologyFrequencyCell[];
  mandalaNodes: NumerologyMandalaNode[];
  nameScanner: {
    method: NumerologyNameMethod;
    normalizedName: string;
    steps: NumerologyNameScannerStep[];
    compound: number;
    root: number;
    reducedExpression: string;
  };
  personalYearTimeline: NumerologyYearTimelineMonth[];
  supportiveToolkit: NumerologySupportiveToolkit;
  nameRefinement: NumerologyNameRefinement;
  compatibilityLens: NumerologyCompatibilityLens;
  freeInsight: string;
  premiumDetail: string;
  calculationNote: string;
  reportSummary: string;
};

export type NumerologyFoundationProfile = {
  status: 'ready' | 'pending';
  method: {
    nameNumber: NumerologyNameMethod;
    birthNumber: 'DAY_OF_MONTH_REDUCTION';
    destinyNumber: 'FULL_BIRTH_DATE_REDUCTION';
    personalCycles: 'DOB_PLUS_TARGET_DATE_REDUCTION';
  };
  name: string;
  birthDate: string;
  targetDate: string;
  normalizedName: string;
  nameNumber: NumerologyNumberInsight;
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  personalYear: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalDay: NumerologyCycleInsight;
  summary: string;
  strengths: string[];
  cautions: string[];
  guidance: string;
  identityDashboard: NumerologyIdentityDashboard;
  evidence: string[];
  limitations: string[];
};

export type SignatureInputSource =
  | 'drawn-signature'
  | 'manual-observation'
  | 'uploaded-image';

export type SignatureTraitKey =
  | 'baseline'
  | 'capital-emphasis'
  | 'flourish'
  | 'legibility'
  | 'letter-connection'
  | 'margin-use'
  | 'pressure'
  | 'signature-size'
  | 'slant'
  | 'spacing'
  | 'speed'
  | 'underline';

export type SignatureTraitValue =
  | 'abstract'
  | 'balanced'
  | 'clear'
  | 'compact'
  | 'connected'
  | 'disconnected'
  | 'downward'
  | 'expansive'
  | 'fast'
  | 'heavy'
  | 'high'
  | 'large'
  | 'left'
  | 'light'
  | 'low'
  | 'medium'
  | 'mixed'
  | 'moderate'
  | 'none'
  | 'partial'
  | 'right'
  | 'single'
  | 'small'
  | 'slow'
  | 'steady'
  | 'tight'
  | 'upward'
  | 'wide';

export type SignatureTraitObservation = {
  confidence: 'clear' | 'partial' | 'uncertain';
  evidence: string;
  key: SignatureTraitKey;
  label: string;
  confirmationState: 'confirmed' | 'not-assessed' | 'unconfirmed';
  value: SignatureTraitValue;
};

export type SignatureInterpretationCard = {
  caution: string;
  evidence: string[];
  key: SignatureTraitKey;
  plainMeaning: string;
  title: string;
};

export type SignatureAnalysisModel = {
  status: 'pending' | 'ready';
  method: {
    extraction: 'USER_CONFIRMED_VISUAL_TRAITS';
    interpretation: 'REFLECTIVE_SIGNATURE_ANALYSIS_RULES';
    safety: 'NO_FORENSIC_IDENTITY_OR_DIAGNOSIS';
  };
  inputSource: SignatureInputSource;
  observedTraits: SignatureTraitObservation[];
  interpretationCards: SignatureInterpretationCard[];
  confidenceExpression: {
    care: string;
    level: 'reserved' | 'balanced' | 'visible';
    summary: string;
  };
  consistency: {
    care: string;
    level: 'flexible' | 'steady' | 'variable';
    summary: string;
  };
  summary: string;
  strengths: string[];
  cautions: string[];
  improvementPlan: string[];
  practicePrompts: string[];
  rhythm: {
    care: string;
    pace: 'calm' | 'fast' | 'measured' | 'variable';
    summary: string;
  };
  synthesisReadiness: {
    numerology: 'available-on-request' | 'needs-name-and-dob';
    rule: string;
  };
  privacy: {
    storage: 'raw-image-not-stored';
    sessionBehavior: string;
    reportCopy: string;
  };
  canAndCannotTellYou: string[];
  suggestedQuestions: string[];
  evidence: string[];
  limitations: string[];
  safetyBoundaries: string[];
};

export type LifeAtlasDepth = 'FREE' | 'PREMIUM';

export type LifeAtlasEvidenceLayerId =
  | 'vedic'
  | 'kp'
  | 'jaimini'
  | 'numerology'
  | 'signature';

export type LifeAtlasEvidenceLayer = {
  id: LifeAtlasEvidenceLayerId;
  label: string;
  role: string;
  status: 'ready' | 'missing' | 'optional';
  summary: string;
  technicalEvidence?: string[];
};

export type LifeAtlasSectionId =
  | 'personal-snapshot'
  | 'opening-soul-portrait'
  | 'strategic-life-abstract'
  | 'jaimini-destiny-thread'
  | 'why-you-came-here'
  | 'life-journey-arc'
  | 'destiny-pattern'
  | 'current-life-chapter'
  | 'gifts-you-carry'
  | 'karmic-lessons'
  | 'love-work-money-purpose'
  | 'relationship-mirror'
  | 'work-money-mission-blueprint'
  | 'hidden-thread'
  | 'what-is-intended'
  | 'next-12-24-months'
  | 'shadow-to-gift-map'
  | 'soul-practices'
  | 'integration-plan'
  | 'final-letter'
  | 'how-predicta-built-this-reading';

export type LifeAtlasReportSection = {
  id: LifeAtlasSectionId;
  title: string;
  body: string;
  bullets: string[];
  evidence: string[];
  tier: 'free' | 'premium';
};

export type LifeAtlasReport = {
  name: 'Predicta Life Atlas';
  depth: LifeAtlasDepth;
  ownerName: string;
  status: 'ready' | 'pending';
  positioning: string;
  synthesisFraming: string;
  signatureNote: string;
  lifeThemeSentence: string;
  hiddenThread: string;
  currentFocus: string;
  freePromise: string;
  premiumPromise: string;
  evidenceLayers: LifeAtlasEvidenceLayer[];
  sections: LifeAtlasReportSection[];
  memoryDigest: {
    activeKundliId?: string;
    dataPoweredBy: string[];
    omittedData: string[];
    reportBoundary: string;
    userCanAsk: string[];
  };
  guardrails: string[];
  limitations: string[];
};

export type KundliData = {
  id: string;
  birthDetails: BirthDetails;
  editHistory?: KundliEditHistoryEntry[];
  relationshipToOwner?: FamilyRelationshipLabel;
  relationshipDisplayLabel?: string;
  relationshipColorToken?: FamilyRelationshipColorToken;
  isOwnerProfile?: boolean;
  familyVaultEligible?: boolean;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  planets: PlanetPosition[];
  houses: HouseData[];
  charts: Record<ChartType, ChartData>;
  chalit?: ChalitData;
  bhavChalit?: BhavChalitData;
  kp?: KPSystemData;
  yearlyHoroscope?: YearlyHoroscopeData;
  dasha: VimshottariDashaData;
  ashtakavarga: AshtakavargaData;
  yogas: YogaInsight[];
  lifeTimeline?: TimelineEvent[];
  transits?: TransitInsight[];
  rectification?: RectificationInsight;
  remedies?: RemedyInsight[];
  holisticFoundation?: HolisticFoundationModel;
  purusharthaLifeBalance?: PurusharthaLifeBalance;
  personalPanchang?: PersonalPanchangLayer;
  holisticReadingRooms?: HolisticReadingRooms;
  jaiminiPlan?: JaiminiPlan;
  sadhanaRemedyPath?: SadhanaRemedyPath;
  holisticDailyGuidance?: HolisticDailyGuidance;
  numerology?: NumerologyFoundationProfile;
  calculationMeta: CalculationMeta;
};

export type ChartContext = {
  chartType?: ChartType;
  chartName?: string;
  generatedReport?: GeneratedReportContext;
  handoffBirthSummary?: string;
  handoffFrom?: PredictaSchool;
  handoffQuestion?: string;
  kundliId?: string;
  predictaSchool?: PredictaSchool;
  specialistContexts?: SpecialistPredictaContextSnapshot[];
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
  reportAvailableSections?: string[];
  reportFocus?: string;
  reportGeneratedAt?: string;
  reportMode?: ReportMemoryDepth;
  reportSchoolLane?: ReportSchoolLaneId;
  reportSectionId?: string;
  reportSectionPrompt?: string;
  reportSectionTitle?: string;
  reportSelectedSections?: string[];
  reportSubjectName?: string;
  reportType?: string;
  selectedFamilyKarmaMap?: boolean;
  selectedFamilyMemberCount?: number;
  selectedKundliKarmaItemId?: string;
  selectedKundliKarmaModule?: KundliKarmaModule;
  selectedKundliKarmaRuleId?: string;
  selectedPredictaWrapped?: boolean;
  selectedPredictaWrappedYear?: number;
  sourceScreen: string;
};

export type SpecialistPredictaContextSnapshot = {
  handoffFrom?: PredictaSchool;
  handoffQuestion?: string;
  kundliId?: string;
  school: PredictaSchool;
  selectedChart?: string;
  selectedHouse?: number;
  selectedPlanet?: string;
  selectedSection?: string;
  reportFocus?: string;
  reportMode?: ReportMemoryDepth;
  reportSchoolLane?: ReportSchoolLaneId;
  reportSectionTitle?: string;
  reportSubjectName?: string;
  reportType?: string;
  sourceScreen?: string;
  updatedAt: string;
};

export type ChatRole = 'user' | 'pridicta';

export type PredictaSchool =
  | 'PARASHARI'
  | 'KP'
  | 'JAIMINI'
  | 'NADI'
  | 'NUMEROLOGY'
  | 'SIGNATURE';

export type ReportSchoolLaneId =
  | 'KP'
  | 'JAIMINI'
  | 'NADI'
  | 'NUMEROLOGY'
  | 'SIGNATURE'
  | 'SYNTHESIS'
  | 'VEDIC';

export type ReportMemoryDepth = 'FREE' | 'PREMIUM';

export type GeneratedReportContext = {
  architectureStages?: string[];
  availableSections: string[];
  chatMasteryRule?: string;
  compactPreviewRule?: string;
  depthContract?: string;
  freePaidDepthRule?: string;
  generatedAt?: string;
  mode: ReportMemoryDepth;
  reportFocus: string;
  reportTitle: string;
  schoolLane: ReportSchoolLaneId;
  selectedSections?: string[];
  schoolBoundaryRule?: string;
  subjectName?: string;
};

export type PredictaReportSectionMemory = {
  id: string;
  title: string;
  schoolLane: ReportSchoolLaneId;
  whatItMeans: string;
  calculationState: 'available' | 'pending' | 'optional';
  freeDepth: string;
  premiumDepth: string;
  handoffPrompt: string;
  boundary: string;
};

export type PredictaAppMemoryDigest = {
  productStructure: string[];
  coreUserFlows: string[];
  featureCatalog: string[];
  appSurfaceAwareness: string[];
  astrologyCapabilityMap: string[];
  reportLanes: string[];
  roomBoundaries: string[];
  deeperContextAwareness: string[];
  missingDataHonestyRules: string[];
  userGuidanceRules: string[];
  refreshRule: string;
};

export type ChatChartInsight = ChartInsight;

export type ChatChartCta = {
  id: string;
  label: string;
  prompt: string;
};

export type ChatChartReportHierarchy = {
  meaning: string;
  keyInsight: string;
  freeUnderstanding: string;
  premiumDepth: string;
  technicalAppendix: string;
};

export type ChatSuggestedCta = {
  context?: ChartContext;
  href?: string;
  id: string;
  label: string;
  targetScreen?: string;
  prompt: string;
};

export type ChatSafetyMeta = {
  body: string;
  categories?: string[];
  kind: 'high-stakes' | 'blocked' | 'crisis';
  reportHref: string;
  reportLabel: string;
  title: string;
};

export type SafetyReviewStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED';

export type SafetyReportRequest = {
  model?: string;
  provider?: string;
  reportKind?:
    | 'USER_REPORTED'
    | 'HIGH_STAKES'
    | 'BLOCKED'
    | 'LOW_CONFIDENCE'
    | 'OUTPUT_REWRITTEN';
  route?: string;
  safetyCategories?: string[];
  safetyIdentifier?: string;
  sourceSurface?: string;
};

export type SafetyAuditEvent = {
  createdAt: string;
  id: string;
  model: string;
  provider: string;
  reportKind: NonNullable<SafetyReportRequest['reportKind']>;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewStatus: SafetyReviewStatus;
  route: string;
  safetyCategories: string[];
  safetyIdentifierHash: string;
  sourceSurface: string;
};

export type SafetyReviewRequest = {
  reviewNote?: string;
  reviewStatus: SafetyReviewStatus;
  reviewedBy?: string;
};

export type ReleaseReadinessCheck = {
  details: string;
  name: string;
  status: 'PASS' | 'FAIL';
};

export type ReleaseReadinessReport = {
  approvedModelPins: Record<string, string>;
  blockers: string[];
  checks: ReleaseReadinessCheck[];
  generatedAt: string;
  launchCriteria: string[];
  releaseStatus: 'READY' | 'BLOCKED';
  requiredCommands: string[];
  rollbackSteps: string[];
  safetySLOs: Record<string, string>;
};

export type ChatChartBlock = {
  type: 'chart';
  chartType: ChartType;
  chartName: string;
  ownerName: string;
  purpose: string;
  supported: boolean;
  unsupportedReason?: string;
  chart: ChartData;
  insight: ChatChartInsight;
  reportHierarchy: ChatChartReportHierarchy;
  evidenceChips: string[];
  ctas: ChatChartCta[];
};

export type ChatMessageBlock = ChatChartBlock;

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  context?: ChartContext;
  blocks?: ChatMessageBlock[];
  safety?: ChatSafetyMeta;
  suggestions?: ChatSuggestedCta[];
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
  clientRequestId?: string;
  history: ConversationTurn[];
  userPlan: UserPlan;
  deepAnalysis?: boolean;
  language?: SupportedLanguage;
  predictaStylePreference?: PredictaStylePreference;
  safetyIdentifier?: string;
  aiCostGovernance?: {
    entitlementSource:
      | 'free_lifetime_ai_credit'
      | 'paid_question_pack'
      | 'family_bank'
      | 'day_pass'
      | 'premium_subscription'
      | 'deterministic_no_ai';
    productCreditSource?: 'personal' | 'family_bank' | null;
  };
};

export type PridictaChatResponse = {
  text: string;
  provider: 'openai' | 'gemini' | 'cache' | 'deterministic';
  model: string;
  cached?: boolean;
  freeAiCreditsRemaining?: number;
  freeAiCreditsTotal?: number;
  freeAiUpsell?: {
    blocked: boolean;
    preservedQuestion: string;
    purchaseOptions: Array<'10 questions' | '25 questions' | '100 questions' | 'Premium'>;
  };
  intent?: AIIntent;
  usedDeepModel?: boolean;
  jyotishAnalysis?: JyotishAnalysis;
  safetyBlocked?: boolean;
  safetyCategories?: string[];
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
  appMemoryDigest?: PredictaAppMemoryDigest;
  generatedReportContext?: GeneratedReportContext;
  reportSectionMemory?: PredictaReportSectionMemory;
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
  selectedDecisionSynthesis?: Pick<
    HolisticDecisionTimingSynthesis,
    | 'title'
    | 'subtitle'
    | 'question'
    | 'area'
    | 'state'
    | 'headline'
    | 'timingWindow'
    | 'decisionGuidance'
    | 'practicalStep'
    | 'riskBoundary'
    | 'sadhanaSupport'
    | 'purusharthaLens'
    | 'dailyAnchor'
    | 'signals'
    | 'evidence'
    | 'guardrails'
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
    moonPada?: number;
    moonPadaMeaning?: string;
    moonPhase?: 'dark' | 'full' | 'unknown' | 'waning' | 'waxing';
    moonPhaseLabel?: string;
    moonPhaseMeaning?: string;
    moonSign: string;
    nakshatra: string;
  };
  currentDasha: KundliData['dasha']['current'];
  dashaTimeline: KundliData['dasha']['timeline'];
  mahadashaIntelligence?: Pick<
    MahadashaIntelligence,
    | 'title'
    | 'subtitle'
    | 'depth'
    | 'current'
    | 'timingWindows'
    | 'remedies'
    | 'limitations'
    | 'premiumUnlock'
  >;
  sadeSatiIntelligence?: Pick<
    SadeSatiIntelligence,
    | 'title'
    | 'subtitle'
    | 'depth'
    | 'active'
    | 'phase'
    | 'phaseLabel'
    | 'saturnSign'
    | 'moonSign'
    | 'houseFromMoon'
    | 'summary'
    | 'freeInsight'
    | 'premiumSynthesis'
    | 'confidence'
    | 'evidence'
    | 'windows'
    | 'remedies'
    | 'limitations'
    | 'premiumUnlock'
  >;
  transitGocharIntelligence?: Pick<
    TransitGocharIntelligence,
    | 'title'
    | 'subtitle'
    | 'depth'
    | 'calculatedAt'
    | 'snapshotSummary'
    | 'dominantWeight'
    | 'topOpportunities'
    | 'cautionSignals'
    | 'planetInsights'
    | 'monthlyCards'
    | 'dashaOverlay'
    | 'evidence'
    | 'limitations'
    | 'premiumUnlock'
  >;
  yearlyHoroscopeVarshaphal?: Pick<
    YearlyHoroscopeVarshaphal,
    | 'title'
    | 'subtitle'
    | 'depth'
    | 'yearLabel'
    | 'solarYearStart'
    | 'solarYearEnd'
    | 'solarReturnUtc'
    | 'varshaLagna'
    | 'munthaSign'
    | 'munthaHouse'
    | 'munthaLord'
    | 'yearTheme'
    | 'freeInsight'
    | 'premiumSynthesis'
    | 'focusAreas'
    | 'supportSignals'
    | 'cautionSignals'
    | 'monthlyCards'
    | 'evidence'
    | 'dashaOverlay'
    | 'gocharOverlay'
    | 'limitations'
    | 'premiumUnlock'
  >;
  advancedJyotishCoverage?: Pick<
    AdvancedJyotishCoverage,
    | 'title'
    | 'subtitle'
    | 'depth'
    | 'moduleRegistry'
    | 'freePolicy'
    | 'premiumPolicy'
    | 'yogaDoshaInsights'
    | 'nakshatraInsight'
    | 'microPointIntelligence'
    | 'ashtakavargaDetail'
    | 'panchangMuhurta'
    | 'compatibility'
    | 'prashna'
    | 'safeRemedies'
    | 'limitations'
    | 'premiumUnlock'
  >;
  kundliKarmaIntelligence?: Pick<
    KundliKarmaIntelligence,
    | 'calculationStatus'
    | 'generatedBy'
    | 'items'
    | 'missingData'
    | 'noAiRequiredFor'
    | 'safetyNotes'
    | 'summary'
    | 'topSignals'
    | 'version'
  >;
  jaiminiPlan?: Pick<
    JaiminiPlan,
    | 'arudhaLagna'
    | 'atmakaraka'
    | 'amatyakaraka'
    | 'calculationStatus'
    | 'charaDashaTimeline'
    | 'charaKarakas'
    | 'contractVersion'
    | 'currentCharaDasha'
    | 'darakaraka'
    | 'evidenceWarnings'
    | 'freeInsight'
    | 'jaiminiAspects'
    | 'karakamsha'
    | 'premiumInsight'
    | 'swamsa'
    | 'upapadaLagna'
  >;
  jaiminiInterpretation?: Pick<
    JaiminiInterpretation,
    | 'calculationStatus'
    | 'freeBlocks'
    | 'guardrails'
    | 'premiumBlocks'
    | 'premiumSummary'
    | 'summary'
    | 'technicalEvidence'
  >;
  numerologyFoundation?: Pick<
    NumerologyFoundationProfile,
    | 'birthDate'
    | 'birthNumber'
    | 'cautions'
    | 'destinyNumber'
    | 'evidence'
    | 'guidance'
    | 'identityDashboard'
    | 'limitations'
    | 'method'
    | 'name'
    | 'nameNumber'
    | 'normalizedName'
    | 'personalDay'
    | 'personalMonth'
    | 'personalYear'
    | 'status'
    | 'strengths'
    | 'summary'
    | 'targetDate'
  >;
  chalitBhavKpFoundation?: Pick<
    ChalitBhavKpFoundation,
    | 'status'
    | 'depth'
    | 'bhavChalit'
    | 'kp'
    | 'premiumUnlock'
    | 'ctas'
    | 'askPrompt'
  >;
  lifeAtlasReport?: Pick<
    LifeAtlasReport,
    | 'name'
    | 'depth'
    | 'status'
    | 'positioning'
    | 'synthesisFraming'
    | 'signatureNote'
    | 'lifeThemeSentence'
    | 'hiddenThread'
    | 'currentFocus'
    | 'freePromise'
    | 'premiumPromise'
    | 'evidenceLayers'
    | 'memoryDigest'
    | 'guardrails'
    | 'limitations'
  >;
  holisticFoundation?: Pick<
    HolisticFoundationModel,
    | 'title'
    | 'subtitle'
    | 'answerParts'
    | 'remedyPriority'
    | 'planetRemedyMap'
    | 'activePlanetFocus'
    | 'safetyRules'
  >;
  purusharthaLifeBalance?: Pick<
    PurusharthaLifeBalance,
    | 'title'
    | 'subtitle'
    | 'dominant'
    | 'needsCare'
    | 'axes'
    | 'summary'
    | 'limitations'
  >;
  personalPanchang?: Pick<
    PersonalPanchangLayer,
    | 'title'
    | 'subtitle'
    | 'date'
    | 'weekday'
    | 'weekdayLord'
    | 'tithi'
    | 'paksha'
    | 'moonSign'
    | 'moonNakshatra'
    | 'natalNakshatra'
    | 'todayFocus'
    | 'bestFor'
    | 'avoidFor'
    | 'personalRemedy'
    | 'signals'
    | 'evidence'
    | 'limitations'
  >;
  holisticReadingRooms?: Pick<
    HolisticReadingRooms,
    'title' | 'subtitle' | 'featuredRoom' | 'rooms' | 'guardrails'
  >;
  sadhanaRemedyPath?: Pick<
    SadhanaRemedyPath,
    | 'title'
    | 'subtitle'
    | 'planet'
    | 'planetReason'
    | 'karmicTheme'
    | 'weeklyIntention'
    | 'stages'
    | 'progressSummary'
    | 'reviewQuestions'
    | 'guardrails'
  >;
  holisticDailyGuidance?: Pick<
    HolisticDailyGuidance,
    | 'title'
    | 'subtitle'
    | 'date'
    | 'headline'
    | 'dailyFocus'
    | 'morningPractice'
    | 'middayCheck'
    | 'eveningReview'
    | 'bestAction'
    | 'avoidAction'
    | 'sadhanaStep'
    | 'purusharthaFocus'
    | 'timingNote'
    | 'remedy'
    | 'blocks'
    | 'evidence'
    | 'guardrails'
  >;
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
