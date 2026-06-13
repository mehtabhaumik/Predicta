import type { SupportedLanguage } from '@pridicta/types';
import pricingPageTranslations from './translations/pricingPage.json';

export type PricingPageCopy = typeof pricingPageTranslations.copy.en;
export type PricingPagePlanCopy =
  typeof pricingPageTranslations.plans.en.WEEKLY & {
    badge?: string;
    monthlyEquivalent?: string;
  };
export type PricingPageFeatureStory =
  (typeof pricingPageTranslations.premiumFeatureStory.en)[number];

const COPY = pricingPageTranslations.copy as Record<
  SupportedLanguage,
  PricingPageCopy
>;
const PLANS = pricingPageTranslations.plans as Record<
  SupportedLanguage,
  Record<string, PricingPagePlanCopy>
>;
const PREMIUM_FEATURE_STORY =
  pricingPageTranslations.premiumFeatureStory as Record<
    SupportedLanguage,
    PricingPageFeatureStory[]
  >;

export function getPricingPageCopy(
  language: SupportedLanguage = 'en',
): PricingPageCopy {
  return COPY[language] ?? COPY.en;
}

export function getPricingPagePlanCopy(
  id: string,
  language: SupportedLanguage = 'en',
): PricingPagePlanCopy {
  return PLANS[language]?.[id] ?? PLANS.en[id] ?? {
    billingCopy: '',
    label: id,
  };
}

export function getPricingPagePremiumFeatureStory(
  language: SupportedLanguage = 'en',
): PricingPageFeatureStory[] {
  return [...(PREMIUM_FEATURE_STORY[language] ?? PREMIUM_FEATURE_STORY.en)];
}
