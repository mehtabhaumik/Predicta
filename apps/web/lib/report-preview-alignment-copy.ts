import {
  getReportPreviewAlignment,
  type ReportMarketplaceProduct,
} from '@pridicta/config/pricing';
import type { SupportedLanguage } from '@pridicta/types';
import reportPreviewAlignmentTranslations from '../../../packages/config/src/translations/reportPreviewAlignment.json';

export type LocalizedReportPreviewAlignment = {
  compactPromise: string;
  downloadNudge: string;
  focusLine: string;
  previewBullets: string[];
};

export type LocalizedReportLaneCopy = {
  bestFor: string;
  boundary: string;
  freeDepth: string;
  navTitle: string;
  premiumDepth: string;
  promise: string;
  readinessRequirement: string;
  title: string;
};

export type LocalizedReportMarketplaceCopy = {
  changeWorldHide: string;
  changeWorldShow: string;
  focusedReportPreview: string;
  freeBasic: string;
  headingBody: string;
  headingEyebrow: string;
  headingTitle: string;
  lifeAtlasGuidanceBody: string;
  lifeAtlasGuidanceTitle: string;
  methodBoundary: string;
  moreSectionsSuffix: string;
  needsKundli: string;
  needsProfile: string;
  needsSignature: string;
  premiumPaid: string;
  premiumValueLabel: string;
  profileReady: string;
  ready: string;
  readySynthesis: string;
  readinessKpReadyDetail: string;
  readinessNumerologyNeedsProfileDetail: string;
  readinessNumerologyReadyDetail: string;
  readinessPendingPrefix: string;
  readinessSignatureNeedsProfileDetail: string;
  readinessSignatureNeedsSignatureDetail: string;
  readinessSignatureReadyDetail: string;
  readinessVedicReadyDetail: string;
  recommendedBody: string;
  recommendedByPredicta: string;
  requiredInput: string;
  selectorBody: string;
  selectorTitle: string;
  selectLifeAtlas: string;
  selectedVedicSections: string;
  startHere: string;
  subnavAria: string;
  synthesisBoundary: string;
  viewLifeAtlasOptions: string;
  whatYouWillLearn: string;
};

type ReportLaneInput = {
  bestFor: string;
  boundary: string;
  freeDepth: string;
  id: ReportMarketplaceProduct['school'];
  premiumDepth: string;
  promise: string;
  readinessRequirement: string;
  title: string;
};

const REPORT_PREVIEW_ALIGNMENT_COPY =
  reportPreviewAlignmentTranslations.copy as Record<
    SupportedLanguage,
    Partial<Record<ReportMarketplaceProduct['id'], LocalizedReportPreviewAlignment>>
  >;

const REPORT_MARKETPLACE_COPY =
  reportPreviewAlignmentTranslations.marketplace as Record<
    SupportedLanguage,
    LocalizedReportMarketplaceCopy
  >;

const REPORT_LANE_COPY = reportPreviewAlignmentTranslations.lanes as Record<
  SupportedLanguage,
  Partial<Record<ReportMarketplaceProduct['school'], LocalizedReportLaneCopy>>
>;

export function getLocalizedReportPreviewAlignment(
  reportId: ReportMarketplaceProduct['id'],
  language: SupportedLanguage,
): LocalizedReportPreviewAlignment {
  return (
    REPORT_PREVIEW_ALIGNMENT_COPY[language]?.[reportId] ??
    REPORT_PREVIEW_ALIGNMENT_COPY.en?.[reportId] ??
    getReportPreviewAlignment(reportId)
  );
}

export function getFallbackReportLaneCopy(
  lane: ReportLaneInput,
): LocalizedReportLaneCopy {
  return {
    bestFor: lane.bestFor,
    boundary: lane.boundary,
    freeDepth: lane.freeDepth,
    navTitle:
      lane.id === 'VEDIC' ? 'Vedic' : lane.title.replace(' Reports', ''),
    premiumDepth: lane.premiumDepth,
    promise: lane.promise,
    readinessRequirement: lane.readinessRequirement,
    title: lane.title,
  };
}

export function getLocalizedReportLaneCopy(
  lane: ReportLaneInput,
  language: SupportedLanguage,
): LocalizedReportLaneCopy {
  return (
    REPORT_LANE_COPY[language]?.[lane.id] ??
    REPORT_LANE_COPY.en?.[lane.id] ??
    getFallbackReportLaneCopy(lane)
  );
}

export function getLocalizedReportMarketplaceCopy(
  language: SupportedLanguage,
): LocalizedReportMarketplaceCopy {
  return REPORT_MARKETPLACE_COPY[language] ?? REPORT_MARKETPLACE_COPY.en;
}
