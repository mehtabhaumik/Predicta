import React, { useMemo } from 'react';
import { View } from 'react-native';

import { AnimatedHeader, PredictaWrappedCarousel, Screen } from '../components';
import { composePredictaWrapped } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

export function PredictaWrappedScreen({
  navigation,
}: RootScreenProps<typeof routes.PredictaWrapped>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const usage = useAppStore(state => state.usage);
  const conversation = useAppStore(state => state.getActiveConversation());
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const wrapped = useMemo(
    () =>
      composePredictaWrapped({
        activity: {
          deepReadings: usage.deepCallsToday,
          questionsAsked: conversation.filter(message => message.role === 'user')
            .length,
          reportsGenerated: usage.pdfsThisMonth,
          savedQuestions: conversation
            .filter(message => message.role === 'user')
            .slice(-3)
            .map(message => message.text),
        },
        kundli,
      }),
    [conversation, kundli, usage.deepCallsToday, usage.pdfsThisMonth],
  );

  function askWrapped() {
    setActiveChartContext({
      selectedPredictaWrapped: true,
      selectedPredictaWrappedYear: wrapped.year,
      selectedSection: wrapped.askPrompt,
      sourceScreen: 'Predicta Wrapped',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="PREDICTA WRAPPED" title="Your yearly recap" />
      <View className="mt-7">
        <PredictaWrappedCarousel
          onAskWrapped={wrapped.status === 'ready' ? askWrapped : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
          wrapped={wrapped}
        />
      </View>
    </Screen>
  );
}
