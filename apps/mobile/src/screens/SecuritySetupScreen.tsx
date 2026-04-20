import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { Screen } from '../components/Screen';
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
      <AppText style={styles.introCopy} tone="secondary">
        Keep personal readings, chart notes, and chat history behind a security
        step before entering the app.
      </AppText>

      <Card style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <AppText variant="subtitle">Security lock</AppText>
            <AppText style={styles.settingDescription} tone="secondary" variant="caption">
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

      <View style={styles.action}>
        <GradientButton label="Enter Predicta" onPress={finishSetup} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: 32,
  },
  card: {
    marginTop: 32,
  },
  introCopy: {
    marginTop: 12,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 14,
  },
  settingDescription: {
    marginTop: 8,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
});
