'use client';

import dynamic from 'next/dynamic';
import { PublicPageRuntimeFallback } from '../../components/PublicPageRuntimeFallback';
import { getPublicPageFallbackCopy } from '../../lib/public-page-fallback-copy';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

function SafetyFallback(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();

  return (
    <PublicPageRuntimeFallback
      {...getPublicPageFallbackCopy('safety', language)}
    />
  );
}

const SafetyPageRuntime = dynamic(() => import('./SafetyPageRuntime'), {
  loading: SafetyFallback,
  ssr: false,
});

export function SafetyPageLoader(): React.JSX.Element {
  return <SafetyPageRuntime />;
}
