import React from 'react';
import { View } from 'react-native';

import { AppText, Card, GradientButton, Screen } from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

const points = [
  'Ask focused questions and continue from where you left off.',
  'Read holistic astrology through chart proof, timing, karma, and remedies.',
  'Review reports without leaving the dark workspace.',
];

export function OnboardingScreen({
  navigation,
}: RootScreenProps<typeof routes.Onboarding>): React.JSX.Element {
  const setOnboardingComplete = useAppStore(
    state => state.setOnboardingComplete,
  );

  function continueToSecurity() {
    setOnboardingComplete(true);
    navigation.replace(routes.SecuritySetup);
  }

  return (
    <Screen>
      <AppText variant="display">Start with holistic astrology.</AppText>
      <AppText className="mt-4" tone="secondary">
        Predicta keeps your chat, kundli, reports, and preferences in one calm
        space built for repeat daily guidance.
      </AppText>

      <View className="mt-8 gap-4">
        {points.map(point => (
          <Card key={point}>
            <AppText variant="subtitle">{point}</AppText>
          </Card>
        ))}
      </View>

      <View className="mt-8">
        <GradientButton label="Continue" onPress={continueToSecurity} />
      </View>
    </Screen>
  );
}
