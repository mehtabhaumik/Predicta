import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  buildDailyIntelligence,
  buildDailyIntelligenceCacheKey,
  buildWeeklyIntelligence,
  buildWeeklyIntelligenceCacheKey,
} from '@pridicta/astrology';
import type { DailyIntelligence, WeeklyIntelligence } from '@pridicta/types';

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
import {
  buildUsageDisplay,
  getUsageAwareUpgradeMoment,
} from '@pridicta/monetization';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { ChartContext } from '../types/astrology';
import {
  loadCachedDailyIntelligence,
  loadCachedWeeklyIntelligence,
  saveCachedDailyIntelligence,
  saveCachedWeeklyIntelligence,
} from '../services/storage/localIntelligenceStorage';

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

const primaryActions = [
  {
    description: 'Start with verified birth details.',
    label: 'Kundli',
    route: routes.Kundli,
  },
  {
    description: 'Review saved local and cloud profiles.',
    label: 'Saved',
    route: routes.SavedKundlis,
  },
  {
    description: 'Create a polished horoscope PDF.',
    label: 'Report',
    route: routes.Report,
  },
  {
    description: 'Map life events to dasha timing.',
    label: 'Timeline',
    route: routes.LifeTimeline,
  },
  {
    description: 'Track moods and decisions privately.',
    label: 'Journal',
    route: routes.Journal,
  },
  {
    description: 'Compare two saved kundlis calmly.',
    label: 'Compatibility',
    route: routes.Compatibility,
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
  const [cachedDaily, setCachedDaily] = useState<DailyIntelligence>();
  const [cachedWeekly, setCachedWeekly] = useState<WeeklyIntelligence>();
  const sessionDate = useMemo(() => new Date(), []);
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
  const usageUpgradeMoment = getUsageAwareUpgradeMoment({
    monetization,
    resolvedAccess,
    usage,
    userPlan,
  });
  const hasWeeklyBriefingAccess = resolvedAccess.hasPremiumAccess;
  const generatedDaily = useMemo(
    () =>
      kundli
        ? buildDailyIntelligence({
            date: sessionDate,
            depth: hasWeeklyBriefingAccess ? 'EXPANDED' : 'FREE',
            kundli,
          })
        : undefined,
    [hasWeeklyBriefingAccess, kundli, sessionDate],
  );
  const generatedWeekly = useMemo(
    () =>
      kundli
        ? buildWeeklyIntelligence({
            date: sessionDate,
            depth: hasWeeklyBriefingAccess ? 'EXPANDED' : 'FREE',
            kundli,
          })
        : undefined,
    [hasWeeklyBriefingAccess, kundli, sessionDate],
  );
  const dailyInsight = cachedDaily ?? generatedDaily;
  const weeklyInsight = cachedWeekly ?? generatedWeekly;

  useEffect(() => {
    if (!kundli || !generatedDaily || !generatedWeekly) {
      return;
    }

    const dailyKey = buildDailyIntelligenceCacheKey(kundli, sessionDate);
    const weeklyKey = buildWeeklyIntelligenceCacheKey(kundli, sessionDate);

    loadCachedDailyIntelligence(dailyKey)
      .then(cached => {
        if (cached) {
          setCachedDaily(cached);
          return;
        }
        return saveCachedDailyIntelligence(generatedDaily);
      })
      .catch(() => undefined);

    loadCachedWeeklyIntelligence(weeklyKey)
      .then(cached => {
        if (cached) {
          setCachedWeekly(cached);
          return;
        }
        return saveCachedWeeklyIntelligence(generatedWeekly);
      })
      .catch(() => undefined);
  }, [generatedDaily, generatedWeekly, kundli, sessionDate]);

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
      <FadeInView style={styles.header}>
        <View style={styles.headerCopy}>
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
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(auth.isLoggedIn ? routes.Settings : routes.Login)
            }
            style={styles.accountButton}
          >
            <AppText style={styles.accountButtonText} variant="caption">
              {auth.isLoggedIn ? 'Account' : 'Sign in'}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityLabel="Open Settings"
            accessibilityRole="button"
            onPress={() => navigation.navigate(routes.Settings)}
            style={styles.logoShell}
          >
            <Image
              accessibilityIgnoresInvertColors
              source={predictaLogo}
              style={styles.logo}
            />
          </Pressable>
        </View>
      </FadeInView>

      <GlowCard contentStyle={styles.heroCard} style={styles.heroSpacing} delay={120}>
        <AppText tone="secondary" variant="caption">
          TODAY'S INTELLIGENCE
        </AppText>
        <GradientText style={styles.cardTitle} variant="title">
          {dailyInsight?.emotionalTone ?? 'Create your real kundli.'}
        </GradientText>
        <AppText style={styles.heroCopy} tone="secondary">
          {dailyInsight
            ? dailyInsight.chartBasisSummary
            : 'Verify birth details once, then Predicta can prepare a calm daily signal from your kundli and current dasha.'}
        </AppText>

        <View style={styles.signalRow}>
          <View style={styles.signalTile}>
            <AppText tone="secondary" variant="caption">
              Work
            </AppText>
            <AppText style={styles.signalValue} variant="subtitle">
              {dailyInsight?.workFocus ?? 'Pending'}
            </AppText>
          </View>
          <View style={styles.signalTile}>
            <AppText tone="secondary" variant="caption">
              Relationship
            </AppText>
            <AppText style={styles.signalValue} variant="subtitle">
              {dailyInsight?.relationshipTone ?? 'Pending'}
            </AppText>
          </View>
        </View>

        {dailyInsight ? (
          <View style={styles.dailyGuidanceBox}>
            <AppText tone="secondary" variant="caption">
              PRACTICAL ACTION
            </AppText>
            <AppText style={styles.dailyGuidanceText}>
              {dailyInsight.practicalAction}
            </AppText>
            <AppText style={styles.avoidText} tone="secondary" variant="caption">
              {dailyInsight.avoid}
            </AppText>
          </View>
        ) : null}

        <View style={styles.heroAction}>
          <GlowButton
            delay={220}
            label={kundli ? 'Ask Predicta' : 'Generate Kundli'}
            onPress={() =>
              kundli
                ? askFromHome({
                    selectedSection: 'Home overview',
                    sourceScreen: 'Home',
                  })
                : navigation.navigate(routes.Kundli)
            }
          />
        </View>
      </GlowCard>

      <GlowCard style={styles.sectionSpacing} delay={240}>
        <AppText tone="secondary" variant="caption">
          WEEKLY BRIEFING
        </AppText>
        <AppText style={styles.statusTitle} variant="subtitle">
          {hasWeeklyBriefingAccess
            ? weeklyInsight?.weeklyTheme ?? 'Preparing your week.'
            : 'Expanded weekly briefing'}
        </AppText>
        <AppText style={styles.statusCopy} tone="secondary">
          {hasWeeklyBriefingAccess && weeklyInsight
            ? weeklyInsight.careerFocus
            : 'Premium, guest, full access, and admin users get a deeper weekly briefing with timing windows and practical focus.'}
        </AppText>
        {hasWeeklyBriefingAccess && weeklyInsight ? (
          <View style={styles.weekWindowList}>
            {weeklyInsight.importantDateWindows.map(window => (
              <View key={`${window.startDate}-${window.focus}`} style={styles.weekWindow}>
                <AppText variant="caption">{window.startDate}</AppText>
                <AppText style={styles.weekWindowCopy} tone="secondary" variant="caption">
                  {window.focus}
                </AppText>
              </View>
            ))}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(routes.Paywall, {
                source: 'weekly_intelligence',
                title: 'Unlock weekly intelligence',
              })
            }
            style={styles.inlineLink}
          >
            <AppText style={styles.inlineLinkText}>
              Unlock weekly intelligence
            </AppText>
          </Pressable>
        )}
      </GlowCard>

      <View style={styles.primaryGrid}>
        {primaryActions.map(action => (
          <Pressable
            accessibilityRole="button"
            key={action.label}
            onPress={() => navigation.navigate(action.route)}
            style={styles.primaryActionCard}
          >
            <AppText variant="subtitle">{action.label}</AppText>
            <AppText style={styles.primaryActionCopy} tone="secondary" variant="caption">
              {action.description}
            </AppText>
            <View style={styles.primaryActionIndicator} />
          </Pressable>
        ))}
      </View>

      <GlowCard style={styles.sectionSpacing} delay={280}>
        <AppText tone="secondary" variant="caption">
          GUIDANCE ACCESS
        </AppText>
        <AppText style={styles.statusTitle} variant="subtitle">
          {usageDisplay.statusText}
        </AppText>
        <AppText style={styles.statusCopy} tone="secondary">
          {usageDisplay.questionsText}
        </AppText>
        <AppText tone="secondary">{usageDisplay.pdfText}</AppText>
        {!resolvedAccess.hasPremiumAccess ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(routes.Paywall, {
                source: 'usage_snapshot',
                suggestedProductId: usageUpgradeMoment?.productId,
                title: usageUpgradeMoment?.title,
              })
            }
            style={styles.inlineLink}
          >
            <AppText style={styles.inlineLinkText}>
              {usageUpgradeMoment?.primaryCta ?? 'View Premium options'}
            </AppText>
          </Pressable>
        ) : null}
      </GlowCard>

      <FadeInView delay={300} style={styles.sectionHeader}>
        <AppText variant="subtitle">Quick actions</AppText>
        <AppText tone="secondary" variant="caption">
          Focused entry points for common questions.
        </AppText>
      </FadeInView>

      <View style={styles.quickGrid}>
        {quickActions.map((action, index) => (
          <Pressable
            accessibilityRole="button"
            key={action.label}
            onPress={() =>
              askFromHome({
                selectedSection: action.section,
                sourceScreen: 'Home',
              })
            }
            style={styles.quickAction}
          >
            <GlowCard
              contentStyle={styles.quickActionCard}
              delay={360 + index * 80}
            >
              <AppText variant="subtitle">{action.label}</AppText>
              <AppText style={styles.quickActionCopy} tone="secondary" variant="caption">
                {action.description}
              </AppText>
              <View style={styles.quickActionRule} />
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
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  accountButton: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  accountButtonText: {
    color: colors.primaryText,
    fontWeight: '800',
  },
  cardTitle: {
    marginTop: 10,
  },
  avoidText: {
    marginTop: 12,
  },
  dailyGuidanceBox: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  dailyGuidanceText: {
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroAction: {
    marginTop: 24,
  },
  heroCard: {
    padding: 24,
  },
  heroCopy: {
    marginTop: 16,
  },
  heroSpacing: {
    marginTop: 32,
  },
  inlineLink: {
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  inlineLinkText: {
    color: colors.success,
    fontWeight: '800',
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
  primaryActionCard: {
    backgroundColor: colors.glass,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 118,
    overflow: 'hidden',
    padding: 20,
    width: '100%',
  },
  primaryActionCopy: {
    marginTop: 8,
  },
  primaryActionIndicator: {
    backgroundColor: colors.success,
    borderRadius: 999,
    height: 3,
    marginTop: 18,
    opacity: 0.8,
    width: 58,
  },
  primaryGrid: {
    gap: 14,
    marginTop: 18,
  },
  quickAction: {
    width: '47.8%',
  },
  quickActionCard: {
    minHeight: 136,
  },
  quickActionCopy: {
    marginTop: 8,
  },
  quickActionRule: {
    backgroundColor: colors.borderSoft,
    borderRadius: 999,
    height: 1,
    marginTop: 'auto',
    width: '100%',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 16,
  },
  sectionHeader: {
    gap: 6,
    marginTop: 32,
  },
  sectionSpacing: {
    marginTop: 28,
  },
  signalRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  signalTile: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  signalValue: {
    marginTop: 8,
  },
  statusCopy: {
    marginTop: 8,
  },
  statusTitle: {
    marginTop: 8,
  },
  weekWindow: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  weekWindowCopy: {
    marginTop: 6,
  },
  weekWindowList: {
    gap: 10,
    marginTop: 16,
  },
});
