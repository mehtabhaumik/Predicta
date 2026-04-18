import React from 'react';
import { Switch, View } from 'react-native';

import { AppText, Card, GradientButton, Screen } from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function SecuritySetupScreen({
  navigation,
}: RootScreenProps<typeof routes.SecuritySetup>): React.JSX.Element {
  const securityEnabled = useAppStore(state => state.securityEnabled);
  const setSecurityEnabled = useAppStore(state => state.setSecurityEnabled);

  function finishSetup() {
    setSecurityEnabled(true);
    navigation.replace(routes.Home);
  }

  return (
    <Screen>
      <AppText variant="title">Protect your workspace.</AppText>
      <AppText className="mt-3" tone="secondary">
        Keep personal readings, chart notes, and chat history behind a security
        step before entering the app.
      </AppText>

      <Card className="mt-8">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <AppText variant="subtitle">Security lock</AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              Keep sensitive chart details behind an extra device-level step.
            </AppText>
          </View>
          <Switch
            onValueChange={setSecurityEnabled}
            thumbColor={colors.primaryText}
            trackColor={{
              false: colors.border,
              true: colors.gradient[0],
            }}
            value={securityEnabled}
          />
        </View>
      </Card>

      <View className="mt-8">
        <GradientButton label="Enter Pridicta" onPress={finishSetup} />
      </View>
    </Screen>
  );
}
