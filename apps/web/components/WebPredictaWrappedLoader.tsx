'use client';

import { useEffect, useMemo, useState } from 'react';
import { composePredictaWrapped } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { loadWebKundli } from '../lib/web-kundli-storage';
import { WebPredictaWrapped } from './WebPredictaWrapped';

export function WebPredictaWrappedLoader(): React.JSX.Element {
  const [kundli, setKundli] = useState<KundliData | undefined>();

  useEffect(() => {
    setKundli(loadWebKundli());
  }, []);

  const wrapped = useMemo(
    () =>
      composePredictaWrapped({
        activity: {
          deepReadings: 0,
          questionsAsked: 0,
          reportsGenerated: 0,
          savedQuestions: [],
        },
        kundli,
      }),
    [kundli],
  );

  return <WebPredictaWrapped ctaHref="/dashboard/kundli" wrapped={wrapped} />;
}
