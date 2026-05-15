import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  composeNadiJyotishPlan,
  needsPredictaSchoolCalculation,
} from '@pridicta/astrology';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  FadeInView,
  GlowCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { generateKundli } from '../services/astrology/astroEngine';
import {
  listSavedKundlis,
  saveGeneratedKundliLocally,
} from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { KundliData } from '../types/astrology';

export function NadiPredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.NadiPredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const schoolReady = useSchoolReadyKundli(
    kundli,
    setActiveKundli,
    setSavedKundlis,
  );
  const access = getResolvedAccess();
  const handoffQuestion =
    activeChartContext?.predictaSchool === 'NADI'
      ? activeChartContext.handoffQuestion
      : undefined;
  const plan = composeNadiJyotishPlan(schoolReady.kundli, {
    depth: access.hasPremiumAccess ? 'PREMIUM' : 'FREE',
    handoffQuestion,
  });
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(
    plan.patterns[0]?.id,
  );
  const selectedPattern =
    plan.patterns.find(pattern => pattern.id === selectedPatternId) ??
    plan.patterns[0];
  const selectedActivation = useMemo(
    () =>
      selectedPattern
        ? plan.activations.find(activation =>
            activation.observation.includes(selectedPattern.title) ||
            selectedPattern.planets.some(planet =>
              activation.trigger.includes(planet),
            ),
          ) ?? plan.activations[0]
        : plan.activations[0],
    [plan.activations, selectedPattern],
  );
  const askPrompt = [
    handoffQuestion
      ? `Nadi Predicta question: ${handoffQuestion}.`
      : plan.askPrompt,
    selectedPattern
      ? `Read this through the selected Nadi story link: ${selectedPattern.title}, planets ${selectedPattern.planets.join(' and ')}, relation ${selectedPattern.relation}. Evidence: ${selectedPattern.observation}.`
      : '',
    selectedActivation
      ? `Use activation context: ${selectedActivation.title}, trigger ${selectedActivation.trigger}.`
      : '',
    'Stay in Nadi Predicta only. Do not mix Parashari or KP. Do not claim palm-leaf manuscript access. Ask validation questions before strong event-level statements.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Screen>
      <AnimatedHeader eyebrow="NADI PREDICTA" title="Premium Nadi" />
      <ActiveKundliActions
        compact
        kundli={schoolReady.kundli}
        sourceScreen="Nadi Predicta"
        title="Nadi reading Kundli"
      />
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
          <View style={styles.storyGrid}>
            {plan.patterns.map((pattern, index) => (
              <FadeInView delay={80 + index * 42} duration={320} key={pattern.id}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectedPatternId(pattern.id)}
                  style={[
                    styles.storyNode,
                    selectedPattern?.id === pattern.id
                      ? styles.activeStoryNode
                      : undefined,
                  ]}
                >
                  <AppText tone="secondary" variant="caption">
                    {pattern.confidence} confidence
                  </AppText>
                  <AppText className="mt-1" variant="caption">
                    {pattern.planets.join(' + ')}
                  </AppText>
                  <AppText className="mt-1" tone="secondary" variant="caption">
                    {pattern.relation.replaceAll('-', ' ')}
                  </AppText>
                </Pressable>
              </FadeInView>
            ))}
            {!plan.patterns.length ? (
              <AppText tone="secondary">
                {getNadiCalculationMessage(schoolReady.status)}
              </AppText>
            ) : null}
          </View>
          {selectedPattern ? (
            <View style={styles.patternDetail}>
              <AppText tone="secondary" variant="caption">
                SELECTED STORY
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                {selectedPattern.title}
              </AppText>
              <AppText className="mt-2" tone="secondary">
                {access.hasPremiumAccess
                  ? selectedPattern.premiumDetail ?? selectedPattern.meaning
                  : selectedPattern.freeInsight}
              </AppText>
              <View style={styles.chipRow}>
                {selectedPattern.lifeAreas.map(area => (
                  <View key={area} style={styles.chip}>
                    <AppText variant="caption">{area}</AppText>
                  </View>
                ))}
              </View>
              <View className="mt-3 gap-2">
                {selectedPattern.evidence.map(item => (
                  <AppText key={item} tone="secondary" variant="caption">
                    {item}
                  </AppText>
                ))}
              </View>
            </View>
          ) : null}
        </GlowCard>

        <GlowCard delay={200}>
          <AppText tone="secondary" variant="caption">
            ACTIVATION WINDOWS
          </AppText>
          <View className="mt-4 gap-2">
            {plan.activations.map((activation, index) => (
              <FadeInView delay={80 + index * 40} duration={320} key={activation.id}>
                <View
                  style={[
                    styles.activationCard,
                    selectedActivation?.id === activation.id
                      ? styles.activeActivationCard
                      : undefined,
                  ]}
                >
                  <AppText tone="secondary" variant="caption">
                    {activation.trigger}
                  </AppText>
                  <AppText className="mt-1" variant="caption">
                    {activation.title}
                  </AppText>
                  <AppText className="mt-1" tone="secondary" variant="caption">
                    {access.hasPremiumAccess
                      ? activation.premiumDetail ?? activation.guidance
                      : activation.guidance}
                  </AppText>
                  <AppText className="mt-2" tone="secondary" variant="caption">
                    {activation.timing}
                  </AppText>
                </View>
              </FadeInView>
            ))}
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
                  selectedSection: askPrompt,
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

function useSchoolReadyKundli(
  activeKundli: KundliData | undefined,
  setActiveKundli: (kundli: KundliData) => void,
  setSavedKundlis: ReturnType<typeof useAppStore.getState>['setSavedKundlis'],
): {
  kundli: KundliData | undefined;
  status: 'idle' | 'calculating' | 'error';
} {
  const [kundli, setKundli] = useState<KundliData | undefined>(activeKundli);
  const [status, setStatus] = useState<'idle' | 'calculating' | 'error'>('idle');
  const needsCalculation = needsPredictaSchoolCalculation(activeKundli, 'NADI');

  useEffect(() => {
    let cancelled = false;

    setKundli(activeKundli);

    if (!activeKundli || !needsCalculation) {
      setStatus('idle');
      return () => {
        cancelled = true;
      };
    }

    setStatus('calculating');
    generateKundli(activeKundli.birthDetails, { ignoreCache: true })
      .then(nextKundli => {
        if (cancelled) {
          return;
        }
        setKundli(nextKundli);
        setActiveKundli(nextKundli);
        return saveGeneratedKundliLocally(nextKundli);
      })
      .then(records => {
        if (!cancelled && records) {
          setSavedKundlis(records);
        }
        if (!cancelled) {
          setStatus('idle');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
        listSavedKundlis()
          .then(setSavedKundlis)
          .catch(() => undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeKundli,
    needsCalculation,
    setActiveKundli,
    setSavedKundlis,
  ]);

  return { kundli, status };
}

function getNadiCalculationMessage(
  status: 'idle' | 'calculating' | 'error',
): string {
  if (status === 'calculating') {
    return 'Preparing Nadi story links from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but the Nadi preparation could not complete right now. Please try again shortly.';
  }

  return 'Nadi Predicta is preparing this layer from the saved birth profile.';
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
  activationCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  activeActivationCard: {
    backgroundColor: 'rgba(255,195,77,0.08)',
    borderColor: 'rgba(255,195,77,0.28)',
  },
  activeStoryNode: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.36)',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
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
  patternDetail: {
    backgroundColor: 'rgba(255,195,77,0.07)',
    borderColor: 'rgba(255,195,77,0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  storyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  storyNode: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 96,
    minWidth: 142,
    padding: 12,
  },
});
