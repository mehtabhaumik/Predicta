'use client';

import { useEffect, useRef, useState } from 'react';
import {
  needsPredictaSchoolCalculation,
  type PredictaSchoolReadiness,
} from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { demoAccess } from '../lib/demo-state';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import {
  generateKundliFromWeb,
  setActiveWebKundli,
} from '../lib/web-kundli-storage';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { WebNadiPredictaPanel } from './WebNadiPredictaPanel';

export function WebNadiPredictaLoader(): React.JSX.Element {
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const [handoffQuestion, setHandoffQuestion] = useState<string>();
  const [requestedKundliId, setRequestedKundliId] = useState<string>();
  const activatedRequestRef = useRef<string | undefined>(undefined);
  const handoffKundli =
    savedKundlis.find(item => item.id === requestedKundliId) ?? activeKundli;
  const schoolReady = useSchoolReadyKundli(handoffKundli, 'NADI');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHandoffQuestion(params.get('handoffQuestion') ?? undefined);
    setRequestedKundliId(params.get('kundliId') ?? undefined);
  }, []);

  useEffect(() => {
    if (
      handoffKundli &&
      requestedKundliId === handoffKundli.id &&
      activatedRequestRef.current !== requestedKundliId
    ) {
      activatedRequestRef.current = requestedKundliId;
      setActiveWebKundli(handoffKundli);
    }
  }, [handoffKundli, requestedKundliId]);

  return (
    <>
      <WebActiveKundliActions
        compact
        kundli={schoolReady.kundli}
        sourceScreen="Nadi Predicta"
        title="Nadi reading Kundli"
      />
      <WebNadiPredictaPanel
        handoffQuestion={handoffQuestion}
        hasPremiumAccess={demoAccess.hasPremiumAccess}
        schoolCalculationStatus={schoolReady.status}
        kundli={schoolReady.kundli}
      />
    </>
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
