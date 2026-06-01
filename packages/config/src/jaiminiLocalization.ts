import type { SupportedLanguage } from '@pridicta/types';
import jaiminiTranslations from './translations/jaimini.json';

export type JaiminiLocalizationCopy = typeof jaiminiTranslations.copy.en;

const COPY = jaiminiTranslations.copy as Record<
  SupportedLanguage,
  JaiminiLocalizationCopy
>;

export const JAIMINI_CANONICAL_TERMS = jaiminiTranslations.canonicalTerms;

export function getJaiminiLocalizationCopy(
  language: SupportedLanguage,
): JaiminiLocalizationCopy {
  return COPY[language] ?? COPY.en;
}
