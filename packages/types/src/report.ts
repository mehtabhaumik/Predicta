import type { PDFMode, KundliData } from './astrology';
import type { AppLocale } from './locale';
import type { OneTimeProductType } from './subscription';

export type ReportProductType =
  | 'FREE_KUNDLI_SUMMARY'
  | 'PREMIUM_KUNDLI_REPORT'
  | 'DETAILED_KUNDLI_DOSSIER'
  | 'LIFE_TIMELINE_REPORT'
  | 'ANNUAL_GUIDANCE_REPORT'
  | 'COMPATIBILITY_REPORT';

export type ReportDepth = 'FREE' | 'PREMIUM' | 'DETAILED';

export type ReportProductCategory = 'KUNDLI' | 'TIMELINE' | 'FORECAST' | 'MATCHING';

export type ReportSectionKey =
  | 'birth_summary'
  | 'core_charts'
  | 'planetary_depth'
  | 'dasha'
  | 'ashtakavarga'
  | 'yogas'
  | 'predictions'
  | 'remedies'
  | 'timeline'
  | 'annual_guidance'
  | 'compatibility';

export type ReportProductConfig = {
  id: ReportProductType;
  title: string;
  subtitle: string;
  category: ReportProductCategory;
  mode: PDFMode;
  depth: ReportDepth;
  includedSections: ReportSectionKey[];
  premiumRequired: boolean;
  productType?: OneTimeProductType;
  estimatedMinutes: number;
  available: boolean;
  upgradeCopy?: string;
};

export type ReportEntitlementReason =
  | 'FREE_INCLUDED'
  | 'PREMIUM_ACCESS'
  | 'ONE_TIME_CREDIT'
  | 'LOCKED'
  | 'MISSING_KUNDLI'
  | 'UNSUPPORTED';

export type ReportEntitlementDecision = {
  canGenerate: boolean;
  reason: ReportEntitlementReason;
  mode: PDFMode;
  reportType: ReportProductType;
  productType?: OneTimeProductType;
  ctaLabel?: string;
  message: string;
};

export type ReportCacheInput = {
  kundli: Pick<KundliData, 'id' | 'birthDetails' | 'calculationMeta'>;
  mode: PDFMode;
  reportType: ReportProductType;
  language?: AppLocale;
};

export type GeneratedReportLibraryItem = {
  id: string;
  kundliId: string;
  reportType: ReportProductType;
  title: string;
  mode: PDFMode;
  filePath: string;
  cacheKey: string;
  generatedAt: string;
  language?: AppLocale;
  source: 'local' | 'cloud';
  productType?: OneTimeProductType;
};

export type ReportStudioState = {
  reports: GeneratedReportLibraryItem[];
};
