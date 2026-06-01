import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { composeJaiminiInterpretation, composeJaiminiPlan } from '@pridicta/astrology';
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

export function JaiminiPredictaScreen({
  navigation,
}: RootScreenProps<
  typeof routes.JaiminiPredicta | typeof routes.NadiPredicta
>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const jaiminiPlan = composeJaiminiPlan(kundli);
  const jaiminiInterpretation = composeJaiminiInterpretation(kundli);
  const pillars = [
    ['Soul planet', jaiminiPlan.atmakaraka?.planet ?? 'Pending'],
    ['Visible path', jaiminiPlan.arudhaLagna.padaSign ?? 'Pending'],
    ['Life chapter', jaiminiPlan.currentCharaDasha?.sign ?? 'Pending'],
  ] as const;

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
          Your Jaimini room is reading your destiny role.
        </AppText>
        <AppText className="mt-3" tone="secondary" variant="body">
          {jaiminiInterpretation.summary}
        </AppText>
        <View style={styles.readingStack}>
          {jaiminiInterpretation.freeBlocks.slice(0, 3).map(block => (
            <View key={block.id} style={styles.readingCard}>
              <AppText tone="secondary" variant="caption">
                {block.title.toUpperCase()}
              </AppText>
              <AppText className="mt-1" variant="body">
                {block.headline}
              </AppText>
              <AppText className="mt-1" tone="secondary" variant="body">
                {block.guidance}
              </AppText>
            </View>
          ))}
        </View>
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
              handoffQuestion: `Use Jaimini Predicta for my question. Start with this prediction: ${jaiminiInterpretation.summary} Calculated evidence: ${jaiminiInterpretation.technicalEvidence.slice(0, 4).join(' | ')}`,
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
  readingCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(189, 163, 106, 0.24)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  readingStack: {
    gap: 12,
    marginTop: 18,
  },
});
