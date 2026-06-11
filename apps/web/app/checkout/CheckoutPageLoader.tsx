'use client';

import dynamic from 'next/dynamic';
import { PublicPageRuntimeFallback } from '../../components/PublicPageRuntimeFallback';
import { getPublicPageFallbackCopy } from '../../lib/public-page-fallback-copy';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

function CheckoutFallback(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();

  return (
    <PublicPageRuntimeFallback
      {...getPublicPageFallbackCopy('checkout', language)}
    />
  );
}

const CheckoutPageRuntime = dynamic(() => import('./CheckoutPageRuntime'), {
  loading: CheckoutFallback,
  ssr: false,
});

export function CheckoutPageLoader(): React.JSX.Element {
  return <CheckoutPageRuntime />;
}
