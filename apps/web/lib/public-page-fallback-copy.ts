import type { SupportedLanguage } from '@pridicta/types';
import fallbackCopy from './public-page-fallback-copy.json';

export type PublicPageFallbackKey =
  | 'checkout'
  | 'feedback'
  | 'founder'
  | 'pricing'
  | 'safety';

export type PublicPageFallbackCopy = {
  body: string;
  ctaHref: string;
  ctaLabel: string;
  eyebrow: string;
  secondaryActions?: Array<{
    href: string;
    label: string;
  }>;
  title: string;
};

type LocalizedCopy = Omit<PublicPageFallbackCopy, 'ctaHref' | 'secondaryActions'> & {
  secondaryActions?: PublicPageFallbackCopy['secondaryActions'];
};

type PublicFallbackEntry = {
  ctaHref: string;
  en: LocalizedCopy;
  hi: LocalizedCopy;
  gu: LocalizedCopy;
};

const entries = fallbackCopy.entries as Record<
  PublicPageFallbackKey,
  PublicFallbackEntry
>;

export function getPublicPageFallbackCopy(
  key: PublicPageFallbackKey,
  language: SupportedLanguage,
): PublicPageFallbackCopy {
  const entry = entries[key];
  const localized = entry[language] ?? entry.en;

  return {
    ...localized,
    ctaHref: entry.ctaHref,
  };
}
