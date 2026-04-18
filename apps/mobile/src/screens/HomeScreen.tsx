import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
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

export function HomeScreen({
  navigation,
}: RootScreenProps<typeof routes.Home>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const auth = useAppStore(state => state.auth);
  const monetization = useAppStore(state => state.monetization);
  const redeemedGuestPass = useAppStore(state => state.redeemedGuestPass);
  const usage = useAppStore(state => state.usage);
  const userPlan = useAppStore(state => state.userPlan);
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

      <GlowCard className="mt-8" delay={120}>
        <AppText tone="secondary" variant="caption">
          KUNDLI SIGNAL
        </AppText>
        <GradientText style={styles.cardTitle} variant="title">
          Your Kundli Overview
        </GradientText>
        <AppText className="mt-4" tone="secondary">
          {kundli
            ? `${kundli.lagna} lagna, ${kundli.moonSign} Moon, and ${kundli.nakshatra} nakshatra are ready from real Swiss Ephemeris calculation.`
            : 'Generate a real kundli from verified birth details before asking for chart-based guidance.'}
        </AppText>

        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-[#252533] bg-[#191923] p-4">
            <AppText tone="secondary" variant="caption">
              Moon
            </AppText>
            <AppText className="mt-2" variant="subtitle">
              {kundli?.moonSign ?? 'Pending'}
            </AppText>
          </View>
          <View className="flex-1 rounded-2xl border border-[#252533] bg-[#191923] p-4">
            <AppText tone="secondary" variant="caption">
              Focus
            </AppText>
            <AppText className="mt-2" variant="subtitle">
              {kundli
                ? `House ${kundli.ashtakavarga.strongestHouses[0]}`
                : 'Pending'}
            </AppText>
          </View>
        </View>
      </GlowCard>

      <View className="mt-7">
        <GlowButton
          delay={220}
          label="Ask Pridicta"
          onPress={() =>
            askFromHome({
              selectedSection: 'Home overview',
              sourceScreen: 'Home',
            })
          }
        />
      </View>

      <View className="mt-4">
        <GlowButton
          delay={260}
          label="Saved Kundlis"
          onPress={() => navigation.navigate(routes.SavedKundlis)}
        />
      </View>

      <GlowCard className="mt-7" delay={280}>
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

      <FadeInView className="mt-8" delay={300}>
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
            <GlowCard contentClassName="min-h-[128px]" delay={360 + index * 80}>
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
});
