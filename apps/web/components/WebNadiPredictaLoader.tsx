'use client';

import { useEffect, useState } from 'react';
import {
  needsPredictaSchoolCalculation,
  type PredictaSchoolReadiness,
} from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { demoAccess } from '../lib/demo-state';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { generateKundliFromWeb } from '../lib/web-kundli-storage';
import { WebNadiPredictaPanel } from './WebNadiPredictaPanel';

export function WebNadiPredictaLoader(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const [handoffQuestion, setHandoffQuestion] = useState<string>();
  const schoolReady = useSchoolReadyKundli(activeKundli, 'NADI');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHandoffQuestion(params.get('handoffQuestion') ?? undefined);
  }, []);

  return (
    <WebNadiPredictaPanel
      handoffQuestion={handoffQuestion}
      hasPremiumAccess={demoAccess.hasPremiumAccess}
      schoolCalculationStatus={schoolReady.status}
      kundli={schoolReady.kundli}
    />
  );
}

function useSchoolReadyKundli(
  activeKundli: KundliData | undefined,
  school: PredictaSchoolReadiness,
): {
  kundli: KundliData | undefined;
  status: 'idle' | 'calculating' | 'error';
} {
  const [kundli, setKundli] = useState<KundliData | undefined>(activeKundli);
  const [status, setStatus] = useState<'idle' | 'calculating' | 'error'>('idle');
  const needsCalculation = needsPredictaSchoolCalculation(activeKundli, school);

  useEffect(() => {
    let cancelled = false;

    setKundli(activeKundli);

    if (!activeKundli || !needsCalculation) {
      setStatus('idle');
      return () => {
        cancelled = true;
      };
    }

    setStatus('calculating');
    generateKundliFromWeb(activeKundli.birthDetails)
      .then(nextKundli => {
        if (cancelled) {
          return;
        }
        setKundli(nextKundli);
        setStatus('idle');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeKundli, needsCalculation, school]);

  return { kundli, status };
}
