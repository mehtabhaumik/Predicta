import {
  getCompetitorResponseCopy,
  type CompetitorResponseCopy,
} from '../../../packages/config/src/competitorResponse';
import {
  getAppShellLabels,
  getLanguageLabels,
  normalizeLanguage,
  SUPPORTED_LANGUAGE_OPTIONS,
  type AppShellLabels,
  type LanguageLabels,
  type LanguageOption,
} from '../../../packages/config/src/language';
import type { SupportedLanguage } from '@pridicta/types';

export const LIGHTWEIGHT_LANGUAGE_STORAGE_KEY = 'pridicta.languagePreference.v1';

export type LightweightCompetitorCopy = CompetitorResponseCopy;

export type LightweightAppShellLabels = AppShellLabels;

export type LightweightLanguageLabels = LanguageLabels;

export const LIGHTWEIGHT_LANGUAGE_OPTIONS =
  SUPPORTED_LANGUAGE_OPTIONS as LanguageOption[];

export function normalizeLightweightLanguage(
  value?: string | null,
): SupportedLanguage {
  return normalizeLanguage(value);
}

export function getLightweightCompetitorResponseCopy(
  language: SupportedLanguage,
): LightweightCompetitorCopy {
  return getCompetitorResponseCopy(language);
}

export function getLightweightAppShellLabels(
  language: SupportedLanguage,
): LightweightAppShellLabels {
  return getAppShellLabels(language);
}

export function getLightweightLanguageLabels(
  language: SupportedLanguage,
): LightweightLanguageLabels {
  return getLanguageLabels(language);
}
