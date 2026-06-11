'use client';

import dynamic from 'next/dynamic';
import { PublicPageRuntimeFallback } from '../../components/PublicPageRuntimeFallback';
import { getPublicPageFallbackCopy } from '../../lib/public-page-fallback-copy';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

function PricingFallback(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();

  return (
    <PublicPageRuntimeFallback
      {...getPublicPageFallbackCopy('pricing', language)}
    />
  );
}

const PricingPageRuntime = dynamic(() => import('./PricingPageRuntime'), {
  loading: PricingFallback,
  ssr: false,
});

export function PricingPageLoader(): React.JSX.Element {
  return <PricingPageRuntime />;
}
