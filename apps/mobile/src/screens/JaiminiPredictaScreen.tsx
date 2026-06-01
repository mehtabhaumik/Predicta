import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

const pillars = [
  ['Soul planet', 'Atmakaraka'],
  ['Visible path', 'Arudha'],
  ['Life chapter', 'Chara Dasha'],
] as const;

export function JaiminiPredictaScreen({
  navigation,
}: RootScreenProps<
  typeof routes.JaiminiPredicta | typeof routes.NadiPredicta
>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );

  return (
    <Screen>
      <AnimatedHeader eyebrow="JAIMINI PREDICTA" title="Soul role and destiny" />
      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Jaimini Predicta"
        title="Jaimini reading Kundli"
      />
      <GlowCard delay={90}>
        <AppText tone="secondary" variant="caption">
          CLASSICAL SOUL-DESTINY LENS
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Your Jaimini room is being prepared carefully.
        </AppText>
        <AppText className="mt-3" tone="secondary" variant="body">
          Jaimini Predicta will read soul role, visible identity, career dharma,
          relationship mirror, and destiny chapters from calculated Jaimini
          evidence. The screen stays calm now; the deterministic karaka and
          Chara Dasha layer arrives in the next phase.
        </AppText>
        <View style={styles.pillarGrid}>
          {pillars.map(([label, value]) => (
            <View key={label} style={styles.pillar}>
              <AppText tone="secondary" variant="caption">
                {label}
              </AppText>
              <AppText variant="body">{value}</AppText>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.cta}
          onPress={() => {
            setActiveChartContext({
              handoffFrom: 'PARASHARI',
              handoffQuestion:
                'Use Jaimini Predicta for my question. Focus on soul role, visible identity, career dharma, relationship mirror, and destiny chapter.',
              predictaSchool: 'JAIMINI',
              selectedSection: 'Jaimini soul role',
              sourceScreen: 'Jaimini Predicta',
            });
            navigation.navigate(routes.Chat);
          }}
        >
          <AppText variant="body">Ask Jaimini Predicta</AppText>
        </Pressable>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: {
    alignItems: 'center',
    backgroundColor: 'rgba(189, 163, 106, 0.18)',
    borderColor: 'rgba(189, 163, 106, 0.42)',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  pillar: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minWidth: 130,
    padding: 14,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
});
