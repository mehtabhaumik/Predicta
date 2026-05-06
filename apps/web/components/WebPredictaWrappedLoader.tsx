'use client';

import { useMemo } from 'react';
import { composePredictaWrapped } from '@pridicta/astrology';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { loadWebWrappedActivity } from '../lib/web-usage-summary';
import { WebPredictaWrapped } from './WebPredictaWrapped';

export function WebPredictaWrappedLoader(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();

  const wrapped = useMemo(
    () =>
      composePredictaWrapped({
        activity: loadWebWrappedActivity(),
        kundli: activeKundli,
      }),
    [activeKundli],
  );

  return <WebPredictaWrapped ctaHref="/dashboard/kundli" wrapped={wrapped} />;
}
