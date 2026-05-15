import type { SupportedLanguage } from '@pridicta/types';
import testimonialTrustTranslations from './translations/testimonialTrust.json';

export type TestimonialTrustCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  signals: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  testerLoop: {
    title: string;
    body: string;
    steps: Array<{
      title: string;
      body: string;
    }>;
  };
  testimonialWall: {
    title: string;
    body: string;
    placeholders: Array<{
      role: string;
      quote: string;
    }>;
  };
  cta: {
    primary: string;
    secondary: string;
    note: string;
  };
};

const COPY: Record<SupportedLanguage, TestimonialTrustCopy> =
  testimonialTrustTranslations.copy as Record<SupportedLanguage, TestimonialTrustCopy>;

export function getTestimonialTrustCopy(
  language: SupportedLanguage,
): TestimonialTrustCopy {
  return COPY[language] ?? COPY.en;
}
