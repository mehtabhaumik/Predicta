import type {
  BillingPeriod,
  OneTimeProduct,
  OneTimeProductType,
  PricingPlan,
} from '../types/subscription';

export const SUBSCRIPTION_PRICING = {
  monthly: 299,
  quarterly: 799,
  weekly: 99,
  yearly: 1999,
  yearlyRegular: 2999,
} as const;

export const ONE_TIME_PRICING = {
  dayPass: 49,
  detailedKundliReport: 399,
  fiveQuestions: 149,
  marriageCompatibilityReport: 499,
  premiumPdf: 249,
} as const;

const subscriptionProductIds: Record<BillingPeriod, string> = {
  MONTHLY: 'pridicta_premium_monthly',
  QUARTERLY: 'pridicta_premium_quarterly',
  WEEKLY: 'pridicta_premium_weekly',
  YEARLY: 'pridicta_premium_yearly_founder',
};

const oneTimeProductIds: Record<OneTimeProductType, string> = {
  DAY_PASS: 'pridicta_day_pass_24h',
  DETAILED_KUNDLI_REPORT: 'pridicta_detailed_kundli_report',
  FIVE_QUESTIONS: 'pridicta_five_questions',
  MARRIAGE_COMPATIBILITY_REPORT: 'pridicta_marriage_compatibility_report',
  PREMIUM_PDF: 'pridicta_premium_pdf',
};

export function formatInr(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
}

export function getPricingPlans(): PricingPlan[] {
  return [
    {
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.weekly)} / week`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.weekly),
      id: 'WEEKLY',
      label: 'Weekly',
      priceInr: SUBSCRIPTION_PRICING.weekly,
      productId: subscriptionProductIds.WEEKLY,
    },
    {
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.monthly)} / month`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.monthly),
      id: 'MONTHLY',
      label: 'Monthly',
      priceInr: SUBSCRIPTION_PRICING.monthly,
      productId: subscriptionProductIds.MONTHLY,
      recommended: false,
    },
    {
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.quarterly)} / 3 months`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.quarterly),
      id: 'QUARTERLY',
      label: 'Quarterly',
      monthlyEquivalent: `${formatInr(
        Math.round(SUBSCRIPTION_PRICING.quarterly / 3),
      )}/mo`,
      priceInr: SUBSCRIPTION_PRICING.quarterly,
      productId: subscriptionProductIds.QUARTERLY,
    },
    {
      badge: 'Founder price',
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.yearly)} / year`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.yearly),
      id: 'YEARLY',
      label: 'Yearly',
      monthlyEquivalent: `${formatInr(
        Math.round(SUBSCRIPTION_PRICING.yearly / 12),
      )}/mo`,
      priceInr: SUBSCRIPTION_PRICING.yearly,
      productId: subscriptionProductIds.YEARLY,
      recommended: true,
      regularPriceInr: SUBSCRIPTION_PRICING.yearlyRegular,
    },
  ];
}

export function getOneTimeProducts(): OneTimeProduct[] {
  return [
    {
      badge: '24 hours',
      description: 'Try Premium depth for one day without a subscription.',
      displayPrice: formatInr(ONE_TIME_PRICING.dayPass),
      id: 'DAY_PASS',
      label: 'Day Pass',
      priceInr: ONE_TIME_PRICING.dayPass,
      productId: oneTimeProductIds.DAY_PASS,
    },
    {
      description: 'Add 5 Pridicta questions when you need more guidance.',
      displayPrice: formatInr(ONE_TIME_PRICING.fiveQuestions),
      id: 'FIVE_QUESTIONS',
      label: '5 Pridicta Questions',
      priceInr: ONE_TIME_PRICING.fiveQuestions,
      productId: oneTimeProductIds.FIVE_QUESTIONS,
    },
    {
      description: 'Unlock one premium-depth PDF for the active kundli.',
      displayPrice: formatInr(ONE_TIME_PRICING.premiumPdf),
      id: 'PREMIUM_PDF',
      label: 'Premium PDF',
      priceInr: ONE_TIME_PRICING.premiumPdf,
      productId: oneTimeProductIds.PREMIUM_PDF,
    },
    {
      description: 'Generate one deeper kundli dossier for the active kundli.',
      displayPrice: formatInr(ONE_TIME_PRICING.detailedKundliReport),
      id: 'DETAILED_KUNDLI_REPORT',
      label: 'Detailed Kundli Report',
      priceInr: ONE_TIME_PRICING.detailedKundliReport,
      productId: oneTimeProductIds.DETAILED_KUNDLI_REPORT,
    },
    {
      description: 'Future compatibility report purchase hook.',
      displayPrice: formatInr(ONE_TIME_PRICING.marriageCompatibilityReport),
      id: 'MARRIAGE_COMPATIBILITY_REPORT',
      label: 'Marriage Compatibility Report',
      priceInr: ONE_TIME_PRICING.marriageCompatibilityReport,
      productId: oneTimeProductIds.MARRIAGE_COMPATIBILITY_REPORT,
    },
  ];
}

export function getRecommendedPricingPlan(): PricingPlan {
  return (
    getPricingPlans().find(plan => plan.recommended) ?? getPricingPlans()[1]
  );
}

export function getDayPassProduct(): OneTimeProduct {
  return getOneTimeProduct('DAY_PASS');
}

export function getPremiumPdfProduct(): OneTimeProduct {
  return getOneTimeProduct('PREMIUM_PDF');
}

export function getOneTimeProduct(
  productType: OneTimeProductType,
): OneTimeProduct {
  const product = getOneTimeProducts().find(item => item.id === productType);

  if (!product) {
    throw new Error(`Unknown one-time product: ${productType}`);
  }

  return product;
}
