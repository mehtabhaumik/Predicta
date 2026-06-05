import type { SupportedLanguage } from '@pridicta/types';
import competitorResponseTranslations from './translations/competitorResponse.json';

export type CompetitorResponseCopy =
  typeof competitorResponseTranslations.copy.en;

const COPY: Record<SupportedLanguage, CompetitorResponseCopy> =
  competitorResponseTranslations.copy as Record<
    SupportedLanguage,
    CompetitorResponseCopy
  >;

export function getCompetitorResponseCopy(
  language: SupportedLanguage = 'en',
): CompetitorResponseCopy {
  return COPY[language] ?? COPY.en;
}
