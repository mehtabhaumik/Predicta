import type { SupportedLanguage } from '@pridicta/types';
import competitorResponseTranslations from '../../../packages/config/src/translations/competitorResponse.json';
import languageTranslations from '../../../packages/config/src/translations/language.json';

export const LIGHTWEIGHT_LANGUAGE_STORAGE_KEY = 'pridicta.languagePreference.v1';

export type LightweightCompetitorCopy =
  typeof competitorResponseTranslations.copy.en;

export type LightweightAppShellLabels =
  typeof languageTranslations.appShellLabels.en;

export type LightweightLanguageLabels =
  typeof languageTranslations.languageLabels.en;

export const LIGHTWEIGHT_LANGUAGE_OPTIONS =
  languageTranslations.languageOptions as Array<{
    aiInstruction: string;
    code: SupportedLanguage;
    englishName: string;
    nativeName: string;
  }>;

const COMPETITOR_COPY = competitorResponseTranslations.copy as Record<
  SupportedLanguage,
  LightweightCompetitorCopy
>;

const APP_SHELL_LABELS = languageTranslations.appShellLabels as Record<
  SupportedLanguage,
  LightweightAppShellLabels
>;

const LANGUAGE_LABELS = languageTranslations.languageLabels as Record<
  SupportedLanguage,
  LightweightLanguageLabels
>;

export function normalizeLightweightLanguage(
  value?: string | null,
): SupportedLanguage {
  return LIGHTWEIGHT_LANGUAGE_OPTIONS.some(option => option.code === value)
    ? (value as SupportedLanguage)
    : 'en';
}

export function getLightweightCompetitorResponseCopy(
  language: SupportedLanguage,
): LightweightCompetitorCopy {
  return COMPETITOR_COPY[language] ?? COMPETITOR_COPY.en;
}

export function getLightweightAppShellLabels(
  language: SupportedLanguage,
): LightweightAppShellLabels {
  return APP_SHELL_LABELS[language] ?? APP_SHELL_LABELS.en;
}

export function getLightweightLanguageLabels(
  language: SupportedLanguage,
): LightweightLanguageLabels {
  return LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS.en;
}

