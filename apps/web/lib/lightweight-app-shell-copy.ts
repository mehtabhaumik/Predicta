import {
  getAppShellLabels,
  getLanguageLabels,
  SUPPORTED_LANGUAGE_OPTIONS,
  type AppShellLabels,
  type LanguageLabels,
  type LanguageOption,
} from '../../../packages/config/src/language';
import type { SupportedLanguage } from '@pridicta/types';

export type LightweightAppShellLabels = AppShellLabels;

export type LightweightLanguageLabels = LanguageLabels;

export const LIGHTWEIGHT_LANGUAGE_OPTIONS =
  SUPPORTED_LANGUAGE_OPTIONS as LanguageOption[];

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
