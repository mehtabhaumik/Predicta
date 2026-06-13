import {
  getCompetitorResponseCopy,
  type CompetitorResponseCopy,
} from '../../../packages/config/src/competitorResponse';
import {
  getAppShellLabels,
  getLanguageLabels,
  SUPPORTED_LANGUAGE_OPTIONS,
  type AppShellLabels,
  type LanguageLabels,
  type LanguageOption,
} from '../../../packages/config/src/language';
import type { SupportedLanguage } from '@pridicta/types';
export {
  LIGHTWEIGHT_LANGUAGE_STORAGE_KEY,
  normalizeLightweightLanguage,
} from './lightweight-language-core';

export type LightweightCompetitorCopy = CompetitorResponseCopy;

export type LightweightAppShellLabels = AppShellLabels;

export type LightweightLanguageLabels = LanguageLabels;

export const LIGHTWEIGHT_LANGUAGE_OPTIONS =
  SUPPORTED_LANGUAGE_OPTIONS as LanguageOption[];

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
