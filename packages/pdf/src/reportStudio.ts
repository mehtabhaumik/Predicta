import type {
  GeneratedReportLibraryItem,
  KundliData,
  OneTimeEntitlement,
  PDFMode,
  ReportCacheInput,
  ReportEntitlementDecision,
  ReportProductConfig,
  ReportProductType,
} from '@pridicta/types';

const REPORT_CACHE_VERSION = 'report-studio-v1';

export const REPORT_PRODUCTS: ReportProductConfig[] = [
  {
    available: true,
    category: 'KUNDLI',
    depth: 'FREE',
    estimatedMinutes: 2,
    id: 'FREE_KUNDLI_SUMMARY',
    includedSections: [
      'birth_summary',
      'core_charts',
      'dasha',
      'ashtakavarga',
      'predictions',
      'remedies',
    ],
    mode: 'FREE',
    premiumRequired: false,
    subtitle: 'A polished overview with D1, D9, D10, current dasha, and basic guidance.',
    title: 'Free Kundli Summary',
  },
  {
    available: true,
    category: 'KUNDLI',
    depth: 'PREMIUM',
    estimatedMinutes: 4,
    id: 'PREMIUM_KUNDLI_REPORT',
    includedSections: [
      'birth_summary',
      'core_charts',
      'planetary_depth',
      'dasha',
      'ashtakavarga',
      'yogas',
      'predictions',
      'remedies',
    ],
    mode: 'PREMIUM',
    premiumRequired: true,
    productType: 'PREMIUM_PDF',
    subtitle: 'A deeper version of the core report with richer chart and dasha coverage.',
    title: 'Premium Kundli Report',
    upgradeCopy: 'Premium report depth keeps the same visual quality and expands the reading.',
  },
  {
    available: true,
    category: 'KUNDLI',
    depth: 'DETAILED',
    estimatedMinutes: 6,
    id: 'DETAILED_KUNDLI_DOSSIER',
    includedSections: [
      'birth_summary',
      'core_charts',
      'planetary_depth',
      'dasha',
      'ashtakavarga',
      'yogas',
      'predictions',
      'remedies',
    ],
    mode: 'PREMIUM',
    premiumRequired: true,
    productType: 'DETAILED_KUNDLI_REPORT',
    subtitle: 'A handbook-style dossier for users who want more complete chart coverage.',
    title: 'Detailed Kundli Dossier',
    upgradeCopy: 'Best for one-time users who want a deeper kundli handbook without subscribing.',
  },
  {
    available: true,
    category: 'TIMELINE',
    depth: 'DETAILED',
    estimatedMinutes: 5,
    id: 'LIFE_TIMELINE_REPORT',
    includedSections: ['timeline', 'dasha', 'annual_guidance', 'remedies'],
    mode: 'PREMIUM',
    premiumRequired: true,
    productType: 'LIFE_TIMELINE_REPORT',
    subtitle: 'Maps key life events against dasha periods and repeating chart themes.',
    title: 'Life Timeline Report',
    upgradeCopy: 'Useful for personal reflection and investor demos because it feels distinct from a plain PDF.',
  },
  {
    available: true,
    category: 'FORECAST',
    depth: 'DETAILED',
    estimatedMinutes: 5,
    id: 'ANNUAL_GUIDANCE_REPORT',
    includedSections: ['annual_guidance', 'dasha', 'predictions', 'remedies'],
    mode: 'PREMIUM',
    premiumRequired: true,
    productType: 'ANNUAL_GUIDANCE_REPORT',
    subtitle: 'A 12-month calm guidance report based on current dasha and chart emphasis.',
    title: 'Annual Guidance Report',
    upgradeCopy: 'A focused yearly report creates a strong paid path without repeated AI calls.',
  },
  {
    available: false,
    category: 'MATCHING',
    depth: 'DETAILED',
    estimatedMinutes: 6,
    id: 'COMPATIBILITY_REPORT',
    includedSections: ['compatibility', 'dasha', 'remedies'],
    mode: 'PREMIUM',
    premiumRequired: true,
    productType: 'MARRIAGE_COMPATIBILITY_REPORT',
    subtitle: 'Compatibility structure is ready for the future matching flow.',
    title: 'Compatibility Report',
    upgradeCopy: 'Coming after the matching workflow is ready.',
  },
];

export function getReportProducts(): ReportProductConfig[] {
  return REPORT_PRODUCTS;
}

export function getReportProduct(
  reportType: ReportProductType,
): ReportProductConfig {
  const product = REPORT_PRODUCTS.find(report => report.id === reportType);

  if (!product) {
    throw new Error(`Unknown report type: ${reportType}`);
  }

  return product;
}

export function buildReportCacheKey(input: ReportCacheInput): string {
  return stableHash(
    JSON.stringify({
      birthDate: input.kundli.birthDetails.date,
      birthPlace: input.kundli.birthDetails.place,
      birthTime: input.kundli.birthDetails.time,
      inputHash: input.kundli.calculationMeta.inputHash,
      kundliId: input.kundli.id,
      language: input.language ?? 'en',
      mode: input.mode,
      reportType: input.reportType,
      version: REPORT_CACHE_VERSION,
    }),
  );
}

export function decideReportEntitlement({
  hasPremiumAccess,
  kundli,
  oneTimeEntitlements,
  reportType,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData | null;
  oneTimeEntitlements: OneTimeEntitlement[];
  reportType: ReportProductType;
}): ReportEntitlementDecision {
  const product = getReportProduct(reportType);

  if (!kundli) {
    return {
      canGenerate: false,
      message: 'Generate or open a valid kundli before creating this report.',
      mode: product.mode,
      productType: product.productType,
      reason: 'MISSING_KUNDLI',
      reportType,
    };
  }

  if (!product.available) {
    return {
      canGenerate: false,
      message: 'This report format is prepared but not available yet.',
      mode: product.mode,
      productType: product.productType,
      reason: 'UNSUPPORTED',
      reportType,
    };
  }

  if (!product.premiumRequired) {
    return {
      canGenerate: true,
      message: 'Included with the free Predicta experience.',
      mode: product.mode,
      reason: 'FREE_INCLUDED',
      reportType,
    };
  }

  if (hasPremiumAccess) {
    return {
      canGenerate: true,
      message: 'Included with your active Premium access.',
      mode: product.mode,
      productType: product.productType,
      reason: 'PREMIUM_ACCESS',
      reportType,
    };
  }

  if (
    product.productType &&
    hasReportCredit(oneTimeEntitlements, product.productType, kundli.id)
  ) {
    return {
      canGenerate: true,
      message: 'A one-time report credit is available for this kundli.',
      mode: product.mode,
      productType: product.productType,
      reason: 'ONE_TIME_CREDIT',
      reportType,
    };
  }

  return {
    canGenerate: false,
    ctaLabel: product.productType ? 'Unlock this report' : 'View options',
    message:
      product.upgradeCopy ??
      'This report needs Premium access or a one-time report credit.',
    mode: product.mode,
    productType: product.productType,
    reason: 'LOCKED',
    reportType,
  };
}

export function createReportLibraryItem({
  filePath,
  generatedAt = new Date().toISOString(),
  kundli,
  language,
  mode,
  reportType,
  source = 'local',
}: {
  filePath: string;
  generatedAt?: string;
  kundli: KundliData;
  language?: GeneratedReportLibraryItem['language'];
  mode: PDFMode;
  reportType: ReportProductType;
  source?: 'local' | 'cloud';
}): GeneratedReportLibraryItem {
  const product = getReportProduct(reportType);
  const reportLanguage = language ?? 'en';
  const cacheKey = buildReportCacheKey({
    kundli,
    language: reportLanguage,
    mode,
    reportType,
  });

  return {
    cacheKey,
    filePath,
    generatedAt,
    id: `${cacheKey}-${generatedAt.slice(0, 10)}`,
    kundliId: kundli.id,
    language: reportLanguage,
    mode,
    productType: product.productType,
    reportType,
    source,
    title: product.title,
  };
}

export function hasReportCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  productType: NonNullable<ReportProductConfig['productType']>,
  kundliId?: string,
): boolean {
  return oneTimeEntitlements.some(
    item =>
      item.productType === productType &&
      (item.remainingUses ?? 0) > 0 &&
      (!kundliId || !item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
  );
}

function isExpired(expiresAt?: string, now = new Date()): boolean {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= now.getTime();
}

function stableHash(value: string): string {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 2147483647;
  }

  return `rs${hash}`;
}
