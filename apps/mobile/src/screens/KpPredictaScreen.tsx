import React, { useEffect, useState } from 'react';

import { AnimatedHeader, KpPredictaPanel, Screen } from '../components';
import {
  composeChalitBhavKpFoundation,
  needsPredictaSchoolCalculation,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { generateKundli } from '../services/astrology/astroEngine';
import {
  listSavedKundlis,
  saveGeneratedKundliLocally,
} from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import type { KundliData } from '../types/astrology';

export function KpPredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.KpPredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const schoolReady = useSchoolReadyKundli(
    kundli,
    setActiveKundli,
    setSavedKundlis,
  );
  const access = getResolvedAccess();
  const foundation = composeChalitBhavKpFoundation(schoolReady.kundli, {
    depth: access.hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });

  return (
    <Screen>
      <AnimatedHeader eyebrow="KP PREDICTA" title="KP Horoscope" />
      <KpPredictaPanel
        foundation={foundation}
        handoffQuestion={
          activeChartContext?.predictaSchool === 'KP'
            ? activeChartContext.handoffQuestion
            : undefined
        }
        hasPremiumAccess={access.hasPremiumAccess}
        schoolCalculationStatus={schoolReady.status}
        onAskKp={
          schoolReady.kundli
            ? prompt => {
                setActiveChartContext({
                  handoffFrom:
                    activeChartContext?.predictaSchool === 'KP'
                      ? activeChartContext.handoffFrom
                      : 'PARASHARI',
                  handoffQuestion:
                    activeChartContext?.predictaSchool === 'KP'
                      ? activeChartContext.handoffQuestion
                      : undefined,
                  predictaSchool: 'KP',
                  selectedSection: prompt,
                  sourceScreen: 'KP Predicta',
                });
                navigation.navigate(routes.Chat);
              }
            : undefined
        }
        onPremium={() => navigation.navigate(routes.Paywall)}
      />
    </Screen>
  );
}

function useSchoolReadyKundli(
  activeKundli: KundliData | undefined,
  setActiveKundli: (kundli: KundliData) => void,
  setSavedKundlis: ReturnType<typeof useAppStore.getState>['setSavedKundlis'],
): {
  kundli: KundliData | undefined;
  status: 'idle' | 'calculating' | 'error';
} {
  const [kundli, setKundli] = useState<KundliData | undefined>(activeKundli);
  const [status, setStatus] = useState<'idle' | 'calculating' | 'error'>('idle');
  const needsCalculation = needsPredictaSchoolCalculation(activeKundli, 'KP');

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
    generateKundli(activeKundli.birthDetails, { ignoreCache: true })
      .then(nextKundli => {
        if (cancelled) {
          return;
        }
        setKundli(nextKundli);
        setActiveKundli(nextKundli);
        return saveGeneratedKundliLocally(nextKundli);
      })
      .then(records => {
        if (!cancelled && records) {
          setSavedKundlis(records);
        }
        if (!cancelled) {
          setStatus('idle');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
        listSavedKundlis()
          .then(setSavedKundlis)
          .catch(() => undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeKundli,
    needsCalculation,
    setActiveKundli,
    setSavedKundlis,
  ]);

  return { kundli, status };
}
