import React from 'react';
import { View } from 'react-native';

import { AnimatedHeader, LifeTimelinePanel, Screen } from '../components';
import { composeLifeTimeline } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
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
  const presentation = composeLifeTimeline(kundli);

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

  return (
    <Screen>
      <AnimatedHeader eyebrow="TIMING MAP" title="Life timeline" />
      <View className="mt-7">
        <LifeTimelinePanel
          onAskEvent={kundli ? askFromEvent : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
          presentation={presentation}
        />
      </View>
    </Screen>
  );
}
