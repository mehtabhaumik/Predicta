import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { Screen } from '../components/Screen';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

const points = [
  'Ask focused questions and continue from where you left off.',
  'Build kundli insights with clean, private session state.',
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
      <AppText variant="display">Start with a clearer signal.</AppText>
      <AppText style={styles.introCopy} tone="secondary">
        Predicta keeps your chat, kundli, reports, and preferences in a focused
        dark interface built for repeat daily use.
      </AppText>

      <View style={styles.points}>
        {points.map(point => (
          <Card key={point}>
            <AppText variant="subtitle">{point}</AppText>
          </Card>
        ))}
      </View>

      <View style={styles.action}>
        <GradientButton label="Continue" onPress={continueToSecurity} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: 32,
  },
  introCopy: {
    marginTop: 16,
  },
  points: {
    gap: 16,
    marginTop: 32,
  },
});
