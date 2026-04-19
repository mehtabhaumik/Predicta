import {
  getOneTimeProduct,
  getRecommendedPricingPlan,
} from '@pridicta/config/pricing';
import { getUsageLimits } from '@pridicta/config/usageLimits';
import type {
  GeneratedReportLibraryItem,
  MonetizationState,
  OneTimeProductType,
  ResolvedAccess,
  UsageState,
  UserPlan,
} from '@pridicta/types';
import {
  getPaidQuestionCredits,
  hasActiveDayPass,
  hasPremiumAccess,
} from './entitlementService';
import { buildUsageDisplay } from './usageDisplayService';

export type UpgradeSurface =
  | 'CHAT_LIMIT'
  | 'REPORT_STUDIO'
  | 'PDF_LIMIT'
  | 'LIFE_TIMELINE'
  | 'ANNUAL_GUIDANCE'
  | 'COMPATIBILITY'
  | 'ADVANCED_ANALYSIS';

export type ProductUpgradePrompt = {
  productType?: OneTimeProductType;
  productId?: string;
  title: string;
  message: string;
  primaryCta: string;
  secondaryCta: string;
  analyticsName:
    | 'paywall_viewed'
    | 'product_selected'
    | 'life_timeline_report_unlocked'
    | 'compatibility_report_unlocked';
};

export type MonetizationAnalyticsCounts = Partial<
  Record<
    | 'paywall_viewed'
    | 'product_selected'
    | 'purchase_completed'
    | 'purchase_failed'
    | 'report_generated'
    | 'life_timeline_previewed'
    | 'life_timeline_report_unlocked'
    | 'compatibility_report_unlocked',
    number
  >
>;

export type AdminMonetizationSummary = {
  accessStatus: string;
  activeProductId?: string;
  premiumActive: boolean;
  activeDayPass: boolean;
  paidQuestionCredits: number;
  reportCredits: Array<{
    productType: OneTimeProductType;
    remainingUses: number;
    expiresAt?: string;
  }>;
  usage: {
    questionsToday: number;
    questionsLimit: number | 'unrestricted';
    deepCallsToday: number;
    deepCallsLimit: number | 'unrestricted';
    pdfsThisMonth: number;
    pdfsLimit: number | 'unrestricted';
  };
  conversionSignals: {
    generatedReports: number;
    paywallViews: number;
    productSelections: number;
    purchasesCompleted: number;
    reportsGenerated: number;
  };
  costPosture: 'unrestricted_admin' | 'controlled' | 'watch';
  recommendedActions: string[];
};

const productCopy: Record<
  OneTimeProductType,
  Pick<ProductUpgradePrompt, 'title' | 'message' | 'primaryCta'>
> = {
  ANNUAL_GUIDANCE_REPORT: {
    message:
      'Unlock one focused 12-month guidance report for this kundli without starting a subscription.',
    primaryCta: 'Unlock Annual Guidance',
    title: 'Go deeper into the year ahead.',
  },
  DAY_PASS: {
    message:
      'Try Premium depth for 24 hours without starting a subscription.',
    primaryCta: 'Try Premium for 24 hours',
    title: 'Try Premium today.',
  },
  DETAILED_KUNDLI_REPORT: {
    message:
      'Unlock a handbook-style kundli dossier for this chart without subscribing.',
    primaryCta: 'Unlock Detailed Report',
    title: 'Create a deeper kundli dossier.',
  },
  FIVE_QUESTIONS: {
    message:
      'Add a few Pridicta questions without starting a subscription.',
    primaryCta: 'Add 5 Questions',
    title: 'Need a few more questions?',
  },
  LIFE_TIMELINE_REPORT: {
    message:
      'Unlock deeper event mapping across dasha periods and repeating chart patterns.',
    primaryCta: 'Unlock Life Timeline',
    title: 'Map more of your life timeline.',
  },
  MARRIAGE_COMPATIBILITY_REPORT: {
    message:
      'Unlock one compatibility report for this pair with deeper timing, caution, and practical guidance.',
    primaryCta: 'Unlock Compatibility Report',
    title: 'Go deeper into this connection.',
  },
  PREMIUM_PDF: {
    message:
      'Your free report remains available. Premium PDF depth adds richer divisional chart, dasha, and guidance sections.',
    primaryCta: 'Unlock Premium PDF',
    title: 'Go deeper with this report.',
  },
};

export function getProductUpgradePrompt(
  productType: OneTimeProductType,
): ProductUpgradePrompt {
  const product = getOneTimeProduct(productType);
  const copy = productCopy[productType];

  return {
    analyticsName:
      productType === 'LIFE_TIMELINE_REPORT'
        ? 'life_timeline_report_unlocked'
        : productType === 'MARRIAGE_COMPATIBILITY_REPORT'
        ? 'compatibility_report_unlocked'
        : 'product_selected',
    message: `${copy.message} ${product.label} is ${product.displayPrice}.`,
    primaryCta: `${copy.primaryCta} - ${product.displayPrice}`,
    productId: product.productId,
    productType,
    secondaryCta: 'Continue Free',
    title: copy.title,
  };
}

export function getUsageAwareUpgradeMoment({
  monetization,
  resolvedAccess,
  usage,
  userPlan,
}: {
  monetization: MonetizationState;
  resolvedAccess?: ResolvedAccess;
  usage: UsageState;
  userPlan: UserPlan;
}): ProductUpgradePrompt | null {
  if (resolvedAccess?.hasUnrestrictedAppAccess) {
    return null;
  }

  const display = buildUsageDisplay({
    monetization,
    resolvedAccess,
    usage,
    userPlan,
  });
  const paidCredits = getPaidQuestionCredits(monetization.oneTimeEntitlements);

  if (paidCredits > 0 || hasPremiumAccess(monetization)) {
    return null;
  }

  if (display.questionsText.startsWith('0 guidance')) {
    return getProductUpgradePrompt('FIVE_QUESTIONS');
  }

  if (display.pdfText.startsWith('0 premium')) {
    return getProductUpgradePrompt('PREMIUM_PDF');
  }

  return null;
}

export function buildAdminMonetizationSummary({
  analyticsCounts = {},
  generatedReports = [],
  monetization,
  resolvedAccess,
  usage,
  userPlan,
}: {
  analyticsCounts?: MonetizationAnalyticsCounts;
  generatedReports?: GeneratedReportLibraryItem[];
  monetization: MonetizationState;
  resolvedAccess?: ResolvedAccess;
  usage: UsageState;
  userPlan: UserPlan;
}): AdminMonetizationSummary {
  const unrestricted = Boolean(resolvedAccess?.hasUnrestrictedAppAccess);
  const plan = hasPremiumAccess(monetization) ? 'PREMIUM' : userPlan;
  const limits = getUsageLimits(plan);
  const activeDayPass = hasActiveDayPass(monetization.oneTimeEntitlements);
  const paidQuestionCredits = getPaidQuestionCredits(
    monetization.oneTimeEntitlements,
  );
  const reportCredits = monetization.oneTimeEntitlements
    .filter(item => item.productType !== 'DAY_PASS' && item.productType !== 'FIVE_QUESTIONS')
    .map(item => ({
      expiresAt: item.expiresAt,
      productType: item.productType,
      remainingUses: Math.max(0, item.remainingUses ?? 0),
    }));
  const purchasesCompleted = analyticsCounts.purchase_completed ?? 0;
  const purchaseFailures = analyticsCounts.purchase_failed ?? 0;

  return {
    accessStatus:
      resolvedAccess?.source === 'admin_whitelist'
        ? 'Admin access active'
        : resolvedAccess?.source === 'full_access_whitelist'
        ? 'Full access active'
        : activeDayPass
        ? 'Day Pass active'
        : plan === 'PREMIUM'
        ? 'Premium active'
        : 'Free access',
    activeDayPass,
    activeProductId: monetization.entitlement.activeProductId,
    conversionSignals: {
      generatedReports: generatedReports.length,
      paywallViews: analyticsCounts.paywall_viewed ?? 0,
      productSelections: analyticsCounts.product_selected ?? 0,
      purchasesCompleted,
      reportsGenerated: analyticsCounts.report_generated ?? generatedReports.length,
    },
    costPosture: unrestricted
      ? 'unrestricted_admin'
      : purchaseFailures > purchasesCompleted && purchaseFailures >= 3
      ? 'watch'
      : 'controlled',
    paidQuestionCredits,
    premiumActive: hasPremiumAccess(monetization),
    recommendedActions: buildRecommendedActions({
      paidQuestionCredits,
      purchasesCompleted,
      reportCredits: reportCredits.length,
      unrestricted,
    }),
    reportCredits,
    usage: {
      deepCallsLimit: unrestricted ? 'unrestricted' : limits.deepCallsPerDay,
      deepCallsToday: usage.deepCallsToday,
      pdfsLimit: unrestricted ? 'unrestricted' : limits.pdfsPerMonth,
      pdfsThisMonth: usage.pdfsThisMonth,
      questionsLimit: unrestricted ? 'unrestricted' : limits.questionsPerDay,
      questionsToday: usage.questionsToday,
    },
  };
}

function buildRecommendedActions({
  paidQuestionCredits,
  purchasesCompleted,
  reportCredits,
  unrestricted,
}: {
  paidQuestionCredits: number;
  purchasesCompleted: number;
  reportCredits: number;
  unrestricted: boolean;
}): string[] {
  const actions = [
    'Keep free prompts calm and contextual.',
    `Highlight yearly Premium as ${getRecommendedPricingPlan().displayPrice} founder pricing where allowed.`,
  ];

  if (!unrestricted && paidQuestionCredits === 0) {
    actions.push('Offer 5-question packs only when users hit a real chat limit.');
  }

  if (reportCredits === 0) {
    actions.push('Use report-specific offers in Report Studio, Timeline, and Compatibility.');
  }

  if (purchasesCompleted === 0) {
    actions.push('Prefer Day Pass and one-time reports before pushing subscriptions.');
  }

  return actions;
}
