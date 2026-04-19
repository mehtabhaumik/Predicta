import type { CalculationMeta, KundliData } from './astrology';

export type JournalMood =
  | 'VERY_LOW'
  | 'LOW'
  | 'NEUTRAL'
  | 'GOOD'
  | 'VERY_GOOD';

export type JournalCategory =
  | 'MOOD'
  | 'DECISION'
  | 'CAREER'
  | 'RELATIONSHIP'
  | 'FAMILY'
  | 'FINANCE'
  | 'HEALTH'
  | 'SPIRITUAL'
  | 'EVENT'
  | 'OTHER';

export type JournalEntry = {
  id: string;
  kundliId: string;
  date: string;
  mood?: JournalMood;
  category: JournalCategory;
  note: string;
  relatedDecision?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  cloudId?: string;
  syncStatus?: 'LOCAL_ONLY' | 'CLOUD_SYNCED' | 'CLOUD_PENDING' | 'CLOUD_ERROR';
};

export type JournalDashaContext = {
  entryId: string;
  date: string;
  mahadasha?: string;
  antardasha?: string;
  dashaStartDate?: string;
  dashaEndDate?: string;
  category: JournalCategory;
  mood?: JournalMood;
};

export type JournalLocalSummary = {
  kundliId: string;
  entryCount: number;
  monthKey: string;
  journalHash: string;
  categoryCounts: Partial<Record<JournalCategory, number>>;
  moodCounts: Partial<Record<JournalMood, number>>;
  topTags: string[];
  dashaContexts: JournalDashaContext[];
  calculationMeta: Pick<
    CalculationMeta,
    'ayanamsa' | 'houseSystem' | 'nodeType' | 'calculatedAt' | 'inputHash'
  >;
};

export type JournalInsightDepth = 'FREE' | 'PREMIUM';

export type JournalInsight = {
  kundliId: string;
  monthKey: string;
  journalHash: string;
  generatedAt: string;
  depth: JournalInsightDepth;
  summary: JournalLocalSummary;
  basicReflection: string;
  premiumPatternSummary?: string;
  emotionalCycleInsight?: string;
  monthlyReflection?: string;
};

export type JournalInsightAccess = {
  canViewPremiumPatterns: boolean;
  depth: JournalInsightDepth;
  message: string;
};

export type JournalAnalyticsPayload = {
  entryCount: number;
  category?: JournalCategory;
  mood?: JournalMood;
  monthKey: string;
};

export type JournalCloudSyncPayload = {
  userId: string;
  entry: JournalEntry;
  explicitUserAction: true;
};

export type JournalInsightInput = {
  kundli: KundliData;
  entries: JournalEntry[];
  hasPremiumAccess: boolean;
  monthKey?: string;
  generatedAt?: string;
};

