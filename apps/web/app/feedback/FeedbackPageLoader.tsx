'use client';

import dynamic from 'next/dynamic';
import { PublicPageRuntimeFallback } from '../../components/PublicPageRuntimeFallback';
import { getPublicPageFallbackCopy } from '../../lib/public-page-fallback-copy';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

function FeedbackFallback(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();

  return (
    <PublicPageRuntimeFallback
      {...getPublicPageFallbackCopy('feedback', language)}
    />
  );
}

const FeedbackPageRuntime = dynamic(() => import('./FeedbackPageRuntime'), {
  loading: FeedbackFallback,
  ssr: false,
});

export function FeedbackPageLoader(): React.JSX.Element {
  return <FeedbackPageRuntime />;
}
