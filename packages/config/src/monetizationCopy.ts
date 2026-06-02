import type { SupportedLanguage } from '@pridicta/types';
import monetizationTranslations from './translations/monetization.json';

type LocalizedString = Record<SupportedLanguage, string>;

type PaywallCopy = {
  title: LocalizedString;
  message: LocalizedString;
  primaryCta: LocalizedString;
  secondaryCta: LocalizedString;
  suggestedProductId?: string;
};

type MonetizationTranslations = {
  paywall: Record<string, PaywallCopy>;
  products: Record<string, { label: LocalizedString; description: LocalizedString }>;
  reportCredits: Record<string, LocalizedString>;
  reportRequirement: Record<string, LocalizedString>;
  trust: Record<string, LocalizedString>;
  usage: Record<string, LocalizedString>;
};

export type MonetizationPaywallAction =
  | 'QUESTION_LIMIT_REACHED'
  | 'PDF_LIMIT_REACHED'
  | 'LOCKED_CHART_TAPPED'
  | 'ADVANCED_ANALYSIS_REQUESTED'
  | 'PREMIUM_REPORT_REQUESTED'
  | 'DEEP_AI_LIMIT_REACHED'
  | 'DAY_PASS_OFFER'
  | 'QUESTION_PACK_OFFER'
  | 'PREMIUM_PDF_OFFER';

export type MonetizationPaywallContext = {
  title: string;
  message: string;
  primaryCta: string;
  secondaryCta: string;
  suggestedProductId?: string;
};

export type MonetizationTrustCopy = {
  whatIsFree: string;
  whatUsesAi: string;
  whatDoesNotUseAi: string;
  familyPrivacy: string;
  noUnlimitedClaim: string;
};

export type MonetizationProductCopy = {
  description: string;
  label: string;
};

const MONETIZATION_TRANSLATIONS =
  monetizationTranslations as MonetizationTranslations;

export function getMonetizationPaywallContext(
  action: MonetizationPaywallAction,
  language: SupportedLanguage = 'en',
): MonetizationPaywallContext {
  const canonicalAction = mapPaywallAction(action);
  const entry =
    MONETIZATION_TRANSLATIONS.paywall[canonicalAction] ??
    MONETIZATION_TRANSLATIONS.paywall.DEFAULT;

  return {
    message: localize(entry.message, language),
    primaryCta: localize(entry.primaryCta, language),
    secondaryCta: localize(entry.secondaryCta, language),
    suggestedProductId: entry.suggestedProductId,
    title: localize(entry.title, language),
  };
}

export function getMonetizationUsageCopy(
  key: string,
  language: SupportedLanguage = 'en',
  values: Record<string, string | number> = {},
): string {
  return formatTemplate(
    localize(MONETIZATION_TRANSLATIONS.usage[key], language),
    values,
  );
}

export function getMonetizationReportRequirementCopy(
  key: string,
  language: SupportedLanguage = 'en',
  values: Record<string, string | number> = {},
): string {
  return formatTemplate(
    localize(MONETIZATION_TRANSLATIONS.reportRequirement[key], language),
    values,
  );
}

export function getMonetizationReportCreditLabel(
  reportType: string,
  language: SupportedLanguage = 'en',
): string {
  return localize(
    MONETIZATION_TRANSLATIONS.reportCredits[reportType] ??
      MONETIZATION_TRANSLATIONS.reportCredits.PREMIUM_PDF,
    language,
  );
}

export function getMonetizationProductCopy(
  productType: string,
  language: SupportedLanguage = 'en',
): MonetizationProductCopy {
  const entry = MONETIZATION_TRANSLATIONS.products[productType];

  if (!entry) {
    return { description: '', label: productType };
  }

  return {
    description: localize(entry.description, language),
    label: localize(entry.label, language),
  };
}

export function getMonetizationTrustCopy(
  language: SupportedLanguage = 'en',
): MonetizationTrustCopy {
  return {
    familyPrivacy: localize(MONETIZATION_TRANSLATIONS.trust.familyPrivacy, language),
    noUnlimitedClaim: localize(
      MONETIZATION_TRANSLATIONS.trust.noUnlimitedClaim,
      language,
    ),
    whatDoesNotUseAi: localize(
      MONETIZATION_TRANSLATIONS.trust.whatDoesNotUseAi,
      language,
    ),
    whatIsFree: localize(MONETIZATION_TRANSLATIONS.trust.whatIsFree, language),
    whatUsesAi: localize(MONETIZATION_TRANSLATIONS.trust.whatUsesAi, language),
  };
}

function mapPaywallAction(action: MonetizationPaywallAction): string {
  switch (action) {
    case 'PDF_LIMIT_REACHED':
      return 'PREMIUM_PDF_OFFER';
    case 'DEEP_AI_LIMIT_REACHED':
      return 'ADVANCED_ANALYSIS_REQUESTED';
    case 'LOCKED_CHART_TAPPED':
    case 'PREMIUM_REPORT_REQUESTED':
      return 'DEFAULT';
    default:
      return action;
  }
}

function localize(
  entry: LocalizedString | undefined,
  language: SupportedLanguage,
): string {
  if (!entry) {
    return '';
  }

  return entry[language]?.trim() || entry.en;
}

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)}/g, (_, key: string) =>
    values[key] == null ? '' : String(values[key]),
  );
}
