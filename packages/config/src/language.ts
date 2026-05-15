import type { SupportedLanguage } from '@pridicta/types';
import languageTranslations from './translations/language.json';

export const LANGUAGE_STORAGE_KEY = 'pridicta.languagePreference.v1';

export type LanguageLabels = {
  askPridicta: string;
  appLanguage: string;
  chartEvidence: string;
  chatLanguage: string;
  createKundli: string;
  confidence: string;
  currentLanguage: string;
  decisionWindows: string;
  evidenceTable: string;
  factor: string;
  free: string;
  implication: string;
  keySignal: string;
  language: string;
  languageHelper: string;
  observation: string;
  premium: string;
  reportDepth: string;
  reading: string;
  shareSafe: string;
};

export type LanguageOption = {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  aiInstruction: string;
};

export type AppShellLabels = {
  access: {
    freePreview: string;
    premiumDepthAvailable: string;
  };
  actions: {
    askPredicta: string;
    close: string;
    openMenu: string;
    closeMenu: string;
  };
  groups: {
    account: string;
    charts: string;
    guidance: string;
    owner: string;
    savedWork: string;
    start: string;
  };
  nav: {
    admin: string;
    accuracyMethod: string;
    allCharts: string;
    birthTime: string;
    chat: string;
    decision: string;
    family: string;
    founderVision: string;
    home: string;
    holisticAstrology: string;
    kpPredicta: string;
    kundli: string;
    legal: string;
    nadiPredicta: string;
    overview: string;
    premium: string;
    redeemPass: string;
    relationship: string;
    remedies: string;
    reports: string;
    safetyPromise: string;
    savedKundlis: string;
    settings: string;
    timeline: string;
    wrapped: string;
  };
  privateSave: {
    body: string;
    title: string;
  };
  topbarDescription: string;
};

type ConfidenceLabel = 'high' | 'low' | 'medium';

export const SUPPORTED_LANGUAGE_OPTIONS: LanguageOption[] =
  languageTranslations.languageOptions as LanguageOption[];

export const LANGUAGE_LABELS: Record<SupportedLanguage, LanguageLabels> =
  languageTranslations.languageLabels as Record<SupportedLanguage, LanguageLabels>;

const APP_SHELL_LABELS: Record<SupportedLanguage, AppShellLabels> =
  languageTranslations.appShellLabels as Record<SupportedLanguage, AppShellLabels>;

const CONFIDENCE_LABELS: Record<
  SupportedLanguage,
  Record<ConfidenceLabel, string>
> = languageTranslations.confidenceLabels as Record<
  SupportedLanguage,
  Record<ConfidenceLabel, string>
>;

export function getLanguageLabels(language: SupportedLanguage): LanguageLabels {
  return LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS.en;
}

export function getAppShellLabels(
  language: SupportedLanguage,
): AppShellLabels {
  return APP_SHELL_LABELS[language] ?? APP_SHELL_LABELS.en;
}

export function getLanguageOption(language: SupportedLanguage): LanguageOption {
  return (
    SUPPORTED_LANGUAGE_OPTIONS.find(option => option.code === language) ??
    SUPPORTED_LANGUAGE_OPTIONS[0]
  );
}

export function getConfidenceLabel(
  language: SupportedLanguage,
  confidence: ConfidenceLabel,
): string {
  return CONFIDENCE_LABELS[language]?.[confidence] ?? CONFIDENCE_LABELS.en[confidence];
}

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  return SUPPORTED_LANGUAGE_OPTIONS.some(option => option.code === value)
    ? (value as SupportedLanguage)
    : 'en';
}
