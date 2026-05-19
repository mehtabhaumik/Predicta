import React from 'react';
import { StyleSheet, View } from 'react-native';
import { composeNumerologyFoundationModel } from '@pridicta/astrology';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function NumerologyPredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.NumerologyPredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const profile = composeNumerologyFoundationModel(kundli?.birthDetails);
  const hasProfile = profile.status === 'ready';

  return (
    <Screen>
      <AnimatedHeader
        eyebrow="NUMEROLOGY PREDICTA"
        title="Number reading room"
      />
      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Numerology Predicta"
        title="Numerology reading profile"
      />
      <View className="gap-5">
        <GlowCard delay={100}>
          <AppText tone="secondary" variant="caption">
            NUMEROLOGY PREDICTA
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            {hasProfile ? profile.name : 'Create a Kundli first'}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {hasProfile
              ? profile.summary
              : 'Numerology needs a saved name and birth date. Create or select a Kundli, then this room can read name rhythm and personal timing.'}
          </AppText>
        </GlowCard>

        <View style={styles.grid}>
          {[
            {
              label: 'Name number',
              value: hasProfile ? String(profile.nameNumber.root) : 'Pending',
            },
            {
              label: 'Birth number',
              value: hasProfile ? String(profile.birthNumber.root) : 'Pending',
            },
            {
              label: 'Destiny number',
              value: hasProfile ? String(profile.destinyNumber.root) : 'Pending',
            },
            {
              label: 'Personal year',
              value: hasProfile ? String(profile.personalYear.root) : 'Pending',
            },
          ].map(item => (
            <GlowCard delay={130} key={item.label} style={styles.metricCard}>
              <AppText tone="secondary" variant="caption">
                {item.label}
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                {item.value}
              </AppText>
            </GlowCard>
          ))}
        </View>

        <GlowCard delay={180}>
          <AppText tone="secondary" variant="caption">
            ROOM BOUNDARY
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Numerology Predicta answers with number logic first. If the question
            needs Vedic, KP, Nadi, or Signature analysis, Predicta should hand
            you to that room instead of mixing methods casually.
          </AppText>
          <View className="mt-5">
            <GlowButton
              label="Chat with Numerology Predicta"
              onPress={() => {
                setActiveChartContext({
                  handoffFrom: 'PARASHARI',
                  handoffQuestion:
                    'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
                  predictaSchool: 'NUMEROLOGY',
                  selectedSection:
                    'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
                  sourceScreen: 'Numerology Predicta',
                });
                navigation.navigate(routes.Chat);
              }}
            />
          </View>
        </GlowCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: colors.surfaceMuted,
    flexBasis: '47%',
    flexGrow: 1,
  },
});
