import React from 'react';
import { View } from 'react-native';

import { AnimatedHeader, AppText, GlowCard, Screen } from '../components';

export function AdminAccessScreen(): React.JSX.Element {
  return (
    <Screen>
      <AnimatedHeader eyebrow="OWNER TOOLS" title="Admin access" />

      <View className="mt-8 gap-4">
        <GlowCard delay={100}>
          <AppText variant="subtitle">Guest pass foundation</AppText>
          <AppText className="mt-2" tone="secondary">
            Create, revoke, list, and inspect guest pass codes through the
            private admin area. Full tools can be added once admin controls are
            finalized.
          </AppText>
        </GlowCard>
        <GlowCard delay={180}>
          <AppText variant="subtitle">Cost protection</AppText>
          <AppText className="mt-2" tone="secondary">
            Admin accounts have unrestricted app access, with safeguards kept
            available for unusual activity.
          </AppText>
        </GlowCard>
      </View>
    </Screen>
  );
}
