'use client';

import dynamic from 'next/dynamic';
import { PublicPageRuntimeFallback } from '../../components/PublicPageRuntimeFallback';
import { getPublicPageFallbackCopy } from '../../lib/public-page-fallback-copy';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

function FounderFallback(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();

  return (
    <PublicPageRuntimeFallback
      {...getPublicPageFallbackCopy('founder', language)}
    />
  );
}

const FounderPageClient = dynamic(
  () =>
    import('./FounderPageClient').then(module => ({
      default: module.FounderPageClient,
    })),
  {
    loading: FounderFallback,
    ssr: false,
  },
);

export function FounderPageLoader(): React.JSX.Element {
  return <FounderPageClient />;
}
