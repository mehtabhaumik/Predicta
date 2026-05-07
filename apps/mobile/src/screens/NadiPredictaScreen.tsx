import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { composeNadiJyotishPlan } from '@pridicta/astrology';

import { AnimatedHeader, AppText, GlowCard, Screen } from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function NadiPredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.NadiPredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const access = getResolvedAccess();
  const handoffQuestion =
    activeChartContext?.predictaSchool === 'NADI'
      ? activeChartContext.handoffQuestion
      : undefined;
  const plan = composeNadiJyotishPlan(kundli, {
    depth: access.hasPremiumAccess ? 'PREMIUM' : 'FREE',
    handoffQuestion,
  });

  return (
    <Screen>
      <AnimatedHeader eyebrow="NADI PREDICTA" title="Premium Nadi" />
      <View className="gap-5">
        <GlowCard delay={100}>
          <View style={styles.header}>
            <View className="flex-1">
              <AppText tone="secondary" variant="caption">
                NADI PREDICTA
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                Premium Nadi reading room
              </AppText>
            </View>
            <View style={styles.badge}>
              <AppText variant="caption">Premium</AppText>
            </View>
          </View>
          <AppText className="mt-3" tone="secondary">
            Nadi Predicta reads planetary story links, karaka themes,
            validation questions, and timing activations. It does not claim
            original palm-leaf access.
          </AppText>
          <View style={styles.explainBox}>
            <AppText variant="caption">{plan.title}</AppText>
            <AppText className="mt-2" tone="secondary">
              {access.hasPremiumAccess
                ? plan.premiumSynthesis ?? plan.freePreview
                : plan.freePreview}
            </AppText>
          </View>
          {handoffQuestion ? (
            <View style={styles.handoffBox}>
              <AppText variant="caption">QUESTION RECEIVED</AppText>
              <AppText className="mt-2" tone="secondary">
                {handoffQuestion}
              </AppText>
            </View>
          ) : null}
        </GlowCard>

        <GlowCard delay={140}>
          <AppText tone="secondary" variant="caption">
            SCHOOL BOUNDARY
          </AppText>
          <AppText className="mt-2" tone="secondary">
            {plan.schoolBoundary}
          </AppText>
          <View className="mt-4 gap-2">
            {plan.guardrails.slice(0, 4).map(item => (
              <View key={item} style={styles.row}>
                <AppText variant="caption">{item}</AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={180}>
          <AppText tone="secondary" variant="caption">
            STORY LINKS
          </AppText>
          <View className="mt-4 gap-2">
            {plan.patterns.map(pattern => (
              <View key={pattern.id} style={styles.row}>
                <AppText variant="caption">{pattern.title}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {pattern.freeInsight}
                </AppText>
              </View>
            ))}
            {!plan.patterns.length ? (
              <AppText tone="secondary">
                Create or refresh a Kundli to show Nadi story links.
              </AppText>
            ) : null}
          </View>
        </GlowCard>

        <GlowCard delay={220}>
          <AppText tone="secondary" variant="caption">
            VALIDATION
          </AppText>
          <View className="mt-4 gap-2">
            {plan.validationQuestions.slice(0, 4).map(question => (
              <View key={question} style={styles.row}>
                <AppText tone="secondary" variant="caption">
                  {question}
                </AppText>
              </View>
            ))}
          </View>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setActiveChartContext({
                  handoffFrom:
                    activeChartContext?.predictaSchool === 'NADI'
                      ? activeChartContext.handoffFrom
                      : 'PARASHARI',
                  handoffQuestion,
                  predictaSchool: 'NADI',
                  selectedSection: handoffQuestion
                    ? `Nadi Predicta question: ${handoffQuestion}. Answer from Nadi-style planetary story links, validation questions, and timing activation only. Do not mix Parashari or KP. Do not claim palm-leaf access.`
                    : 'Nadi Predicta reading: answer from Nadi-style planetary story links, validation questions, and timing activation only. Do not mix Parashari or KP. Do not claim palm-leaf access.',
                  sourceScreen: 'Nadi Predicta',
                });
                navigation.navigate(routes.Chat);
              }}
              style={styles.cta}
            >
              <AppText variant="caption">Ask Nadi Predicta</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate(routes.Paywall)}
              style={styles.cta}
            >
              <AppText variant="caption">Premium Nadi</AppText>
            </Pressable>
          </View>
        </GlowCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.34)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cta: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  explainBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  handoffBox: {
    backgroundColor: 'rgba(116,125,255,0.12)',
    borderColor: 'rgba(116,125,255,0.34)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  row: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
});
