import type { SupportedLanguage } from '@pridicta/types';
import kundliKarmaTranslations from './translations/kundliKarma.json';

export type KundliKarmaCanonicalTermKey =
  keyof typeof kundliKarmaTranslations.canonicalTerms;
export type KundliKarmaCopy = typeof kundliKarmaTranslations.copy.en;

const COPY = kundliKarmaTranslations.copy as Record<
  SupportedLanguage,
  KundliKarmaCopy
>;

export const KUNDLI_KARMA_CANONICAL_TERMS =
  kundliKarmaTranslations.canonicalTerms;
export const KUNDLI_KARMA_BLOCKED_PHRASES =
  kundliKarmaTranslations.blockedPhrases;
export const KUNDLI_KARMA_APPROVED_PHRASES =
  kundliKarmaTranslations.approvedPhrases;
export const KUNDLI_KARMA_ROOM_BOUNDARIES =
  kundliKarmaTranslations.roomBoundaries;
export const KUNDLI_KARMA_ALIAS_RULES =
  kundliKarmaTranslations.aliasRules;

export function getKundliKarmaCopy(language: SupportedLanguage): KundliKarmaCopy {
  return COPY[language] ?? COPY.en;
}

export function getKundliKarmaTerm(
  key: KundliKarmaCanonicalTermKey,
  language: SupportedLanguage,
): string {
  return KUNDLI_KARMA_CANONICAL_TERMS[key][language];
}
