import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  DailyBriefingCard,
  DestinyPassportCard,
  FadeInView,
  FloatingGlowOrb,
  GlowButton,
  GlowCard,
  GradientText,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { resolveAccess } from '@pridicta/access';
import { PREDICTA_JOURNEY_STEPS } from '@pridicta/config/predictaUx';
import {
  composeDailyBriefing,
  composeDestinyPassport,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
} from '@pridicta/astrology';
import { buildUsageDisplay } from '@pridicta/monetization';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { ChartContext } from '../types/astrology';

const predictaLogo = require('../assets/predicta-logo.png');

const quickActions = [
  {
    description: 'Work, momentum, timing',
    label: 'Career',
    section: 'Career',
  },
  {
    description: 'Partnership signals',
    label: 'Marriage',
    section: 'Marriage',
  },
  {
    description: 'Money flow and choices',
    label: 'Finance',
    section: 'Finance',
  },
  {
    description: 'Planetary phase view',
    label: 'Current Dasha',
    section: 'Current Dasha',
  },
] as const;

const toolLinks = [
  ['Create Kundli', routes.Kundli],
  ['Ask', routes.Chat],
  ['Decision', routes.DecisionOracle],
  ['Charts', routes.Charts],
  ['KP', routes.KpPredicta],
  ['Nadi', routes.NadiPredicta],
  ['Timeline', routes.LifeTimeline],
  ['Remedy', routes.RemedyCoach],
  ['Birth Time', routes.BirthTimeDetective],
  ['Relationship', routes.RelationshipMirror],
  ['Family', routes.FamilyKarmaMap],
  ['Wrapped', routes.PredictaWrapped],
  ['Report', routes.Report],
  ['Saved', routes.SavedKundlis],
  ['Premium', routes.Paywall],
  ['Redeem', routes.RedeemPassCode],
  ['Settings', routes.Settings],
  ['Legal', routes.Legal],
] as const;

export function HomeScreen({
  navigation,
}: RootScreenProps<typeof routes.Home>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const auth = useAppStore(state => state.auth);
  const monetization = useAppStore(state => state.monetization);
  const redeemedGuestPass = useAppStore(state => state.redeemedGuestPass);
  const usage = useAppStore(state => state.usage);
  const userPlan = useAppStore(state => state.userPlan);
  const languagePreference = useAppStore(state => state.languagePreference);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const resolvedAccess = resolveAccess({
    auth,
    monetization,
    redeemedGuestPass,
  });
  const usageDisplay = buildUsageDisplay({
    monetization,
    resolvedAccess,
    usage,
    userPlan,
  });
  const dailyBriefing = composeDailyBriefing(kundli, {
    language: languagePreference.language,
  });
  const destinyPassport = composeDestinyPassport(kundli);
  const gochar = composeTransitGocharIntelligence(kundli, { depth: 'FREE' });
  const yearlyHoroscope = composeYearlyHoroscopeVarshaphal(kundli, {
    depth: 'FREE',
  });
  const gocharPrimarySignal =
    gochar.topOpportunities[0] ?? gochar.cautionSignals[0];

  function askFromHome(context: ChartContext) {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    setActiveChartContext(context);
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <FloatingGlowOrb size={260} style={styles.orb} />
      <FadeInView className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            Namaste{kundli ? `, ${kundli.birthDetails.name.split(' ')[0]}` : ''}
          </AppText>
          <GradientText variant="title">Welcome back</GradientText>
          {resolvedAccess.source !== 'free' ? (
            <View style={styles.accessBadge}>
              <AppText variant="caption">{usageDisplay.statusText}</AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.logoShell}>
          <Image
            accessibilityIgnoresInvertColors
            source={predictaLogo}
            style={styles.logo}
          />
        </View>
      </FadeInView>

      <GlowCard className="mt-8" delay={80}>
        <AppText tone="secondary" variant="caption">
          START HERE
        </AppText>
        <GradientText style={styles.cardTitle} variant="subtitle">
          3 simple steps
        </GradientText>
        <View className="mt-4 gap-3">
          {PREDICTA_JOURNEY_STEPS.map((step, index) => (
            <Pressable
              accessibilityRole="button"
              key={step.id}
              onPress={() => {
                if (step.id === 'create') {
                  navigation.navigate(routes.Kundli);
                } else if (step.id === 'ask') {
                  askFromHome({
                    selectedSection: 'Simple guided question',
                    sourceScreen: 'Home',
                  });
                }
              }}
              style={styles.journeyStep}
            >
              <View style={styles.stepNumber}>
                <AppText variant="caption">{index + 1}</AppText>
              </View>
              <View className="flex-1">
                <AppText variant="caption">{step.action}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {step.body}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      </GlowCard>

      <View className="mt-8">
        <DailyBriefingCard
          briefing={dailyBriefing}
          onAskToday={() =>
            askFromHome({
              selectedDailyBriefingDate: dailyBriefing.date,
              selectedSection: dailyBriefing.askPrompt,
              sourceScreen: 'Daily Briefing',
            })
          }
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>

      <GlowCard className="mt-8" delay={160}>
        <View style={styles.gocharTopline}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              {gochar.status === 'pending'
                ? 'MOMENT SKY PREVIEW'
                : 'CURRENT GOCHAR'}
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {gochar.status === 'pending'
                ? 'What the sky is doing right now'
                : 'What current Gochar is bringing'}
            </AppText>
          </View>
          <View style={styles.gocharBadge}>
            <AppText variant="caption">{gochar.dominantWeight}</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          {gochar.snapshotSummary}
        </AppText>
        {gocharPrimarySignal ? (
          <View style={styles.gocharSignal}>
            <AppText tone="secondary" variant="caption">
              {gocharPrimarySignal.weight}
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {gocharPrimarySignal.headline}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {gocharPrimarySignal.practicalGuidance}
            </AppText>
          </View>
        ) : null}
        <View className="mt-4">
          <GlowButton
            label="Open Gochar Panel"
            onPress={() => navigation.navigate(routes.LifeTimeline)}
          />
        </View>
      </GlowCard>

      <GlowCard className="mt-8" delay={180}>
        <View style={styles.gocharTopline}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              YEARLY HOROSCOPE
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {yearlyHoroscope.status === 'pending'
                ? 'Your personal year is waiting'
                : 'What this solar year is asking'}
            </AppText>
          </View>
          <View style={styles.gocharBadge}>
            <AppText variant="caption">{yearlyHoroscope.yearLabel}</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          {yearlyHoroscope.freeInsight}
        </AppText>
        {yearlyHoroscope.status === 'ready' ? (
          <View style={styles.gocharSignal}>
            <AppText tone="secondary" variant="caption">
              Muntha focus
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              House {yearlyHoroscope.munthaHouse} in{' '}
              {yearlyHoroscope.munthaSign}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {yearlyHoroscope.yearTheme}
            </AppText>
          </View>
        ) : null}
        <View className="mt-4">
          <GlowButton
            label="Open Yearly Panel"
            onPress={() => navigation.navigate(routes.LifeTimeline)}
          />
        </View>
      </GlowCard>

      <View className="mt-8">
        <DestinyPassportCard
          onPrimaryAction={() => navigation.navigate(routes.Kundli)}
          passport={destinyPassport}
        />
      </View>

      <View className="mt-7">
        <GlowButton
          delay={220}
          label={kundli ? 'Ask Predicta' : 'Create Kundli First'}
          onPress={() =>
            askFromHome({
              selectedSection: 'Home overview',
              sourceScreen: 'Home',
            })
          }
        />
      </View>

      <GlowCard className="mt-6" delay={260}>
        <AppText tone="secondary" variant="caption">
          CHOOSE ONE PATH
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          What do you want help with?
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          Create Kundli first for full readings. You can still open every
          reading path from here.
        </AppText>
        <View className="mt-4 flex-row flex-wrap gap-3">
          {toolLinks.map(([label, route]) => (
            <Pressable
              accessibilityRole="button"
              key={label}
              onPress={() => navigation.navigate(route as never)}
              style={styles.toolChip}
            >
              <AppText variant="caption">{label}</AppText>
            </Pressable>
          ))}
        </View>
      </GlowCard>

      <GlowCard className="mt-7" delay={420}>
        <AppText tone="secondary" variant="caption">
          GUIDANCE ACCESS
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {usageDisplay.statusText}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {usageDisplay.questionsText}
        </AppText>
        <AppText tone="secondary">{usageDisplay.pdfText}</AppText>
        {!resolvedAccess.hasPremiumAccess ? (
          <Pressable
            accessibilityRole="button"
            className="mt-4"
            onPress={() => navigation.navigate(routes.Paywall)}
          >
            <AppText className="font-bold text-[#4DAFFF]">
              View Premium options
            </AppText>
          </Pressable>
        ) : null}
      </GlowCard>

      <FadeInView className="mt-8" delay={440}>
        <AppText variant="subtitle">Quick actions</AppText>
      </FadeInView>

      <View className="mt-4 flex-row flex-wrap gap-4">
        {quickActions.map((action, index) => (
          <Pressable
            accessibilityRole="button"
            className="w-[47%]"
            key={action.label}
            onPress={() =>
              askFromHome({
                selectedSection: action.section,
                sourceScreen: 'Home',
              })
            }
          >
            <GlowCard contentClassName="min-h-[128px]" delay={460 + index * 80}>
              <AppText variant="subtitle">{action.label}</AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {action.description}
              </AppText>
              <AppText className="mt-auto text-xl" tone="secondary">
                {'>'}
              </AppText>
            </GlowCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  accessBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#191923',
    borderColor: colors.borderGlow,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardTitle: {
    marginTop: 8,
  },
  logo: {
    borderRadius: 14,
    height: 48,
    width: 48,
  },
  logoShell: {
    borderColor: colors.borderGlow,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
    padding: 3,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  orb: {
    right: -120,
    top: 52,
  },
  journeyStep: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 195, 77, 0.16)',
    borderColor: 'rgba(255, 195, 77, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  gocharBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  gocharSignal: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  gocharTopline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  toolChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    width: '47%',
  },
});
