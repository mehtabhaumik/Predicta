'use client';

import dynamic from 'next/dynamic';
import { PublicPageRuntimeFallback } from '../../components/PublicPageRuntimeFallback';
import { getPublicPageFallbackCopy } from '../../lib/public-page-fallback-copy';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

function AccuracyMethodFallback(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();

  return (
    <PublicPageRuntimeFallback
      {...getPublicPageFallbackCopy('accuracyMethod', language)}
    />
  );
}

const AccuracyMethodPageClient = dynamic(
  () =>
    import('./AccuracyMethodPageClient').then(module => ({
      default: module.AccuracyMethodPageClient,
    })),
  {
    loading: AccuracyMethodFallback,
    ssr: false,
  },
);

export function AccuracyMethodPageLoader(): React.JSX.Element {
  return <AccuracyMethodPageClient />;
}
