import React from 'react';
import { View } from 'react-native';

import {
  AnimatedHeader,
  LifeTimelinePanel,
  MahadashaIntelligencePanel,
  SadeSatiPanel,
  Screen,
  TransitGocharPanel,
  YearlyHoroscopePanel,
} from '../components';
import {
  composeLifeTimeline,
  composeMahadashaIntelligence,
  composeSadeSatiIntelligence,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import { refreshKundliGocharIfNeeded } from '../services/astrology/gocharRefresh';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import type { LifeTimelineEventView } from '../types/astrology';

export function LifeTimelineScreen({
  navigation,
}: RootScreenProps<typeof routes.LifeTimeline>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const presentation = composeLifeTimeline(kundli);
  const mahadasha = composeMahadashaIntelligence(kundli, { depth: 'FREE' });
  const sadeSati = composeSadeSatiIntelligence(kundli, { depth: 'FREE' });
  const gochar = composeTransitGocharIntelligence(kundli, { depth: 'FREE' });
  const yearlyHoroscope = composeYearlyHoroscopeVarshaphal(kundli, {
    depth: 'FREE',
  });

  function askFromEvent(event: LifeTimelineEventView) {
    setActiveChartContext({
      selectedSection: event.askPrompt,
      selectedTimelineEventId: event.id,
      selectedTimelineEventKind: event.kind,
      selectedTimelineEventTitle: event.title,
      selectedTimelineEventWindow: event.dateWindow,
      sourceScreen: 'Life Timeline',
    });
    navigation.navigate(routes.Chat);
  }

  function askFromMahadasha(prompt: string) {
    setActiveChartContext({
      selectedSection: prompt,
      sourceScreen: 'Mahadasha Intelligence',
    });
    navigation.navigate(routes.Chat);
  }

  function askFromSadeSati(prompt: string) {
    setActiveChartContext({
      selectedSection: prompt,
      sourceScreen: 'Sade Sati Saturn Layer',
    });
    navigation.navigate(routes.Chat);
  }

  function askFromGochar(prompt: string) {
    setActiveChartContext({
      selectedSection: prompt,
      sourceScreen: 'Transit Gochar Engine',
    });
    navigation.navigate(routes.Chat);
  }

  function askFromYearly(prompt: string) {
    setActiveChartContext({
      selectedSection: prompt,
      sourceScreen: 'Yearly Horoscope',
    });
    navigation.navigate(routes.Chat);
  }

  React.useEffect(() => {
    let cancelled = false;

    refreshKundliGocharIfNeeded(kundli).then(nextKundli => {
      if (
        !cancelled &&
        nextKundli &&
        nextKundli.transits?.[0]?.calculatedAt !==
          kundli?.transits?.[0]?.calculatedAt
      ) {
        setActiveKundli(nextKundli);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [kundli, setActiveKundli]);

  return (
    <Screen>
      <AnimatedHeader eyebrow="TIMING MAP" title="Life timeline" />
      <View className="mt-7">
        <MahadashaIntelligencePanel
          intelligence={mahadasha}
          onAskPrompt={kundli ? askFromMahadasha : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
      <View className="mt-5">
        <SadeSatiPanel
          intelligence={sadeSati}
          onAskPrompt={kundli ? askFromSadeSati : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
      <View className="mt-5">
        <TransitGocharPanel
          intelligence={gochar}
          onAskPrompt={kundli ? askFromGochar : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
      <View className="mt-5">
        <YearlyHoroscopePanel
          intelligence={yearlyHoroscope}
          onAskPrompt={kundli ? askFromYearly : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
      <View className="mt-5">
        <LifeTimelinePanel
          onAskEvent={kundli ? askFromEvent : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
          presentation={presentation}
        />
      </View>
    </Screen>
  );
}
