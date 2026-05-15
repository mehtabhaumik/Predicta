import type { SupportedLanguage } from '@pridicta/types';
import accuracyMethodTranslations from './translations/accuracyMethod.json';

export type AccuracyMethodCopy = {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
  };
  pillars: Array<{
    title: string;
    body: string;
  }>;
  calculation: {
    eyebrow: string;
    title: string;
    body: string;
    items: Array<{
      label: string;
      value: string;
      detail: string;
    }>;
  };
  schools: {
    eyebrow: string;
    title: string;
    body: string;
    items: Array<{
      name: string;
      summary: string;
      proof: string[];
      caution: string;
    }>;
  };
  depth: {
    eyebrow: string;
    title: string;
    body: string;
    free: string[];
    premium: string[];
  };
  boundaries: {
    eyebrow: string;
    title: string;
    body: string;
    items: string[];
  };
  cta: {
    primary: string;
    secondary: string;
    note: string;
  };
};

const COPY: Record<SupportedLanguage, AccuracyMethodCopy> =
  accuracyMethodTranslations.copy as Record<SupportedLanguage, AccuracyMethodCopy>;

export function getAccuracyMethodCopy(
  language: SupportedLanguage,
): AccuracyMethodCopy {
  return COPY[language] ?? COPY.en;
}
