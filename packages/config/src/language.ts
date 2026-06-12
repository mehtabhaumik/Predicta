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
    askDockBody: string;
    askDockCta: string;
    askDockEyebrow: string;
    askDockPrompt: string;
    askDockTitle: string;
    close: string;
    openMenu: string;
    closeMenu: string;
  };
  groups: {
    account: string;
    charts: string;
    common: string;
    guidance: string;
    owner: string;
    predicta: string;
    savedWork: string;
    sections: string;
    schools: string;
    start: string;
    support: string;
    thisSection: string;
    trust: string;
    worlds: string;
  };
  nav: {
    admin: string;
    accuracyMethod: string;
    allCharts: string;
    account: string;
    birthTime: string;
    chat: string;
    dashboard: string;
    decision: string;
    family: string;
    feedback: string;
    founderVision: string;
    home: string;
    holisticAstrology: string;
    jaimini: string;
    jaiminiEvidence: string;
    jaiminiPredicta: string;
    kp: string;
    kpEvidence: string;
    kpPredicta: string;
    kundli: string;
    library: string;
    legal: string;
    nadi: string;
    nadiPredicta: string;
    numerology: string;
    numerologyEvidence: string;
    numerologyPredicta: string;
    overview: string;
    premium: string;
    redeemPass: string;
    relationship: string;
    remedies: string;
    reports: string;
    safetyPromise: string;
    savedKundlis: string;
    settings: string;
    signature: string;
    signatureEvidence: string;
    signaturePredicta: string;
    timeline: string;
    vedic: string;
    vedicEvidence: string;
    vedicPredicta: string;
    wrapped: string;
  };
  privateSave: {
    body: string;
    title: string;
  };
  passBanner: {
    active: string;
    aiRemainingLabel: string;
    bodyCareful: string;
    bodySteady: string;
    deepReadingsLabel: string;
    pdfsLabel: string;
    manage: string;
    questionsLabel: string;
  };
  publicDisclaimer: string;
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
