import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { AnimatedHeader, RemedyCoachPanel, Screen } from '../components';
import { composeRemedyCoach } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  loadRemedyTracking,
  markRemedyDone,
  type StoredRemedyTracking,
} from '../services/remedies/remedyTrackingStorage';
import { useAppStore } from '../store/useAppStore';
import type { RemedyCoachItem } from '../types/astrology';

export function RemedyCoachScreen({
  navigation,
}: RootScreenProps<typeof routes.RemedyCoach>): React.JSX.Element {
  const [tracking, setTracking] = useState<StoredRemedyTracking>({});
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const plan = useMemo(
    () => composeRemedyCoach(kundli, tracking),
    [kundli, tracking],
  );

  useEffect(() => {
    loadRemedyTracking(kundli?.id)
      .then(setTracking)
      .catch(() => setTracking({}));
  }, [kundli?.id]);

  async function markDone(item: RemedyCoachItem) {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    const next = await markRemedyDone(kundli.id, item.id, tracking);
    setTracking(next);
  }

  function askFromRemedy(item: RemedyCoachItem) {
    setActiveChartContext({
      selectedRemedyId: item.id,
      selectedRemedyTitle: item.title,
      selectedSection: item.askPrompt,
      sourceScreen: 'Remedy Coach',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="REMEDY COACH" title="Practice tracker" />
      <View className="mt-7">
        <RemedyCoachPanel
          onAskRemedy={kundli ? askFromRemedy : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
          onMarkDone={markDone}
          plan={plan}
        />
      </View>
    </Screen>
  );
}
