import type {
  BillingPeriod,
  OneTimeProduct,
  OneTimeProductType,
  PricingPlan,
} from '@pridicta/types';

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

export const PREMIUM_FEATURE_STORY = [
  {
    body: 'Premium answers show chart factors, confidence, and timing context.',
    title: 'Ask with proof',
  },
  {
    body: 'A month-by-month dasha and transit calendar.',
    title: 'Life Calendar',
  },
  {
    body: 'Store multiple family Kundlis and compare them privately.',
    title: 'Family Vault',
  },
  {
    body: 'Focused bundles for Kundli, Career, Marriage, Wealth, Child, and Remedies.',
    title: 'Premium report bundles',
  },
  {
    body: 'Reveal varga, dasha, transit, ashtakavarga, and evidence tables.',
    title: 'Astrologer-grade mode',
  },
] as const;

export type ReportMarketplaceProduct = {
  badge: string;
  bestFor: string;
  freeIncludes: string[];
  freeDepth: string;
  id:
    | 'KUNDLI'
    | 'CAREER'
    | 'MARRIAGE'
    | 'WEALTH'
    | 'SADESATI'
    | 'DASHA'
    | 'COMPATIBILITY'
    | 'REMEDIES';
  outcome: string;
  premiumIncludes: string[];
  premiumDepth: string;
  prompt: string;
  purchaseHint: string;
  title: string;
};

export type ReportPurchaseGuide = {
  body: string;
  cta: string;
  label: string;
  title: string;
};

const REPORT_MARKETPLACE_PRODUCTS: ReportMarketplaceProduct[] = [
  {
    badge: 'Foundation',
    bestFor: 'A clean starting point for the whole chart.',
    freeIncludes: ['All visible charts', 'Kundli summary', 'Current dasha', 'Useful remedies'],
    freeDepth: 'Kundli, all visible charts, and useful chart signals.',
    id: 'KUNDLI',
    outcome: 'Understand the whole chart without getting lost.',
    premiumIncludes: ['Full chart synthesis', 'Dasha and Gochar timing', 'Yogas and strengths', 'Premium PDF structure'],
    premiumDepth: 'Full synthesis across charts, dasha, gochar, yogas, and remedies.',
    prompt:
      'Create a complete Kundli report preview with useful insights first, then show what a detailed premium PDF would add.',
    purchaseHint: 'Best first report when you want one complete life overview.',
    title: 'Kundli Report',
  },
  {
    badge: 'Work',
    bestFor: 'Career direction, job timing, and professional pressure points.',
    freeIncludes: ['Career houses', 'D10 signal', 'Current work pressure', 'One practical action'],
    freeDepth: 'Simple career focus from the 10th house, D10, dasha, and gochar.',
    id: 'CAREER',
    outcome: 'See work direction, timing pressure, and better next moves.',
    premiumIncludes: ['Role fit', 'Promotion/change windows', 'D1 plus D10 synthesis', 'Monthly action plan'],
    premiumDepth: 'Detailed career timing, role fit, promotion windows, and action plan.',
    prompt:
      'Create my career report using D1, D10, 10th house, dasha, gochar, and clear timing evidence.',
    purchaseHint: 'Best when the question is job change, promotion, business, or career direction.',
    title: 'Career Report',
  },
  {
    badge: 'Marriage',
    bestFor: 'Marriage prospects, relationship maturity, and spouse patterns.',
    freeIncludes: ['D1 relationship signal', 'D9 preview', 'Venus/Jupiter tone', 'Gentle caution'],
    freeDepth: 'Useful D1 and D9 relationship signals with confidence.',
    id: 'MARRIAGE',
    outcome: 'Understand relationship maturity, timing, and partner patterns.',
    premiumIncludes: ['D1 plus D9 synthesis', 'Timing windows', 'Compatibility cautions', 'Relationship remedies'],
    premiumDepth: 'Deep D1 plus D9 synthesis, timing windows, remedies, and red flags gently.',
    prompt:
      'Create my marriage report using D1, D9, 7th house, Venus, Jupiter, dasha, and transit timing.',
    purchaseHint: 'Best for marriage timing, partner nature, delay, or family discussion.',
    title: 'Marriage Report',
  },
  {
    badge: 'Money',
    bestFor: 'Income, savings, wealth habits, and financial timing.',
    freeIncludes: ['2nd/11th house signal', 'Dasha money tone', 'Savings caution', 'One grounded habit'],
    freeDepth: 'Money houses, current dasha tone, and practical guidance.',
    id: 'WEALTH',
    outcome: 'Read money flow, saving habits, and better financial timing.',
    premiumIncludes: ['D2 wealth synthesis', 'Income and gains windows', 'Monthly planning', 'Risk and discipline map'],
    premiumDepth: 'D2, 2nd and 11th house synthesis, timing windows, and monthly plan.',
    prompt:
      'Create my wealth report using D1, D2, 2nd house, 11th house, dasha, gochar, and savings guidance.',
    purchaseHint: 'Best when you ask about income, savings, investment timing, or debt pressure.',
    title: 'Wealth Report',
  },
  {
    badge: 'Saturn',
    bestFor: 'Sade Sati phase, pressure windows, discipline, and support.',
    freeIncludes: ['Current phase', 'Saturn theme', 'Simple caution', 'Saturn karma remedy'],
    freeDepth: 'Current Sade Sati status, phase, and simple guidance.',
    id: 'SADESATI',
    outcome: 'Understand Saturn pressure without fear.',
    premiumIncludes: ['Exact phase reading', 'Saturn dates', 'Ashtakavarga support', 'Remedy and discipline plan'],
    premiumDepth: 'Exact phase reading, Saturn transit dates, Ashtakavarga support, and remedies.',
    prompt:
      'Create my Sade Sati report with current phase, Saturn transit, Moon chart impact, Ashtakavarga support, and remedies.',
    purchaseHint: 'Best when you feel pressure, delay, responsibility, or Saturn-related fear.',
    title: 'Sade Sati Report',
  },
  {
    badge: 'Timing',
    bestFor: 'Life periods, turning points, and what is active now.',
    freeIncludes: ['Current Mahadasha', 'Current Antardasha', 'Life theme', 'Next timing cue'],
    freeDepth: 'Current Mahadasha and Antardasha theme in simple words.',
    id: 'DASHA',
    outcome: 'See what life chapter is active now and what comes next.',
    premiumIncludes: ['Dasha tree', 'Pratyantardasha detail', 'Activation timing', 'Life map with windows'],
    premiumDepth: 'Mahadasha, Antardasha, Pratyantardasha, activation, and timing map.',
    prompt:
      'Create my Dasha Life Map with Mahadasha, Antardasha, Pratyantardasha, active themes, and practical timing.',
    purchaseHint: 'Best when you ask “why now?” or want a life timing map.',
    title: 'Dasha Life Map',
  },
  {
    badge: 'Match',
    bestFor: 'Marriage matching, family discussion, and compatibility clarity.',
    freeIncludes: ['Compatibility tone', 'Major support points', 'Major caution points', 'Gentle summary'],
    freeDepth: 'Simple compatibility tone and major caution areas.',
    id: 'COMPATIBILITY',
    outcome: 'Make compatibility easier to discuss with family.',
    premiumIncludes: ['Ashtakoota', 'Manglik check', 'D1/D9 comparison', 'Timing and practical guidance'],
    premiumDepth: 'Ashtakoota, Manglik, D1/D9 cross-check, timing, and relationship guidance.',
    prompt:
      'Create a compatibility report with Ashtakoota, Manglik, D1 and D9 comparison, timing, and gentle guidance.',
    purchaseHint: 'Best for a focused marriage or family compatibility conversation.',
    title: 'Compatibility Report',
  },
  {
    badge: 'Care',
    bestFor: 'Remedies, habits, spiritual discipline, and grounded support.',
    freeIncludes: ['Planet focus', 'Safe simple remedy', 'Karma lesson', 'Weekly practice'],
    freeDepth: 'Simple safe remedies and reflection practices.',
    id: 'REMEDIES',
    outcome: 'Turn chart pressure into karma-based action.',
    premiumIncludes: ['Planet-specific path', 'Mantra/seva/discipline', 'Tracking rhythm', 'Safety and stop rules'],
    premiumDepth: 'Planet-specific remedies, timing, consistency tracker, and safety notes.',
    prompt:
      'Create my remedies report with safe practical remedies, planet focus, timing, and a simple consistency plan.',
    purchaseHint: 'Best when you want what to do, not only what may happen.',
    title: 'Remedies Report',
  },
];

export function getReportMarketplaceProducts(): ReportMarketplaceProduct[] {
  return REPORT_MARKETPLACE_PRODUCTS.map(product => ({
    ...product,
    freeIncludes: [...product.freeIncludes],
    premiumIncludes: [...product.premiumIncludes],
  }));
}

export function getReportPurchaseGuide(): ReportPurchaseGuide[] {
  return [
    {
      body: 'Pick this when you want one polished PDF for a clear life question.',
      cta: 'Choose one report',
      label: 'One-time report',
      title: 'I need one answer prepared well',
    },
    {
      body: 'Pick this when you want ongoing timing, deeper chat, remedies, and monthly planning.',
      cta: 'See Premium',
      label: 'Subscription',
      title: 'I want guidance every month',
    },
    {
      body: 'Pick this when you want to try the full experience before committing.',
      cta: 'Try Day Pass',
      label: 'Day Pass',
      title: 'I want to test everything today',
    },
  ];
}

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
      description: 'Add 5 Predicta questions when you need more guidance.',
      displayPrice: formatInr(ONE_TIME_PRICING.fiveQuestions),
      id: 'FIVE_QUESTIONS',
      label: '5 Predicta Questions',
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
      description: 'Focused two-chart relationship and marriage timing report.',
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
