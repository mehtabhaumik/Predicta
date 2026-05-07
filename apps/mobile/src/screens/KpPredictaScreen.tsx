import React from 'react';

import { AnimatedHeader, KpPredictaPanel, Screen } from '../components';
import { composeChalitBhavKpFoundation } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

export function KpPredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.KpPredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const access = getResolvedAccess();
  const foundation = composeChalitBhavKpFoundation(kundli, {
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
        onAskKp={
          kundli
            ? () => {
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
                  selectedSection:
                    activeChartContext?.predictaSchool === 'KP' &&
                    activeChartContext.handoffQuestion
                      ? `KP Predicta question: ${activeChartContext.handoffQuestion}. Answer using KP cusps, star lords, sub lords, significators, ruling planets, and event-timing rules only.`
                      : 'KP Predicta reading: answer using KP cusps, sub lords, significators, and ruling planets only.',
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
