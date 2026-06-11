import React, { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlassPanel,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { env } from '../config/env';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  getCurrentAuthState,
  signOutGoogle,
} from '../services/firebase/authService';
import { loadRedeemedGuestPassFromFirebase } from '../services/firebase/passCodePersistence';
import { loadServerEntitlementLedgerFromFirebase } from '../services/firebase/serverEntitlementLedgerSync';
import { resolveAccess } from '@pridicta/access';
import { isBiometrySupported } from '../services/security/secureStorage';
import {
  buildUsageDisplay,
  FREE_AI_QUESTION_LIFETIME_LIMIT,
} from '@pridicta/monetization';
import { getMonetizationReportRequirementCopy } from '@pridicta/config';
import {
  getAppShellLabels,
  getLanguageOption,
  SUPPORTED_LANGUAGE_OPTIONS,
} from '@pridicta/config/language';
import {
  loadLanguagePreference,
  saveChartLanguagePreference,
  saveLanguagePreference,
  savePredictaReplyLanguagePreference,
  saveReportLanguagePreference,
} from '../services/preferences/languagePreferenceStorage';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { SupportedLanguage } from '../types/astrology';

export function SettingsScreen({
  navigation,
}: RootScreenProps<typeof routes.Settings>): React.JSX.Element {
  const [showSupportLinks, setShowSupportLinks] = useState(false);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [freeAiBalance, setFreeAiBalance] = useState<{
    remaining: number;
    total: number;
  }>();
  const auth = useAppStore(state => state.auth);
  const biometricsEnabled = useAppStore(state => state.biometricsEnabled);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const languagePreference = useAppStore(state => state.languagePreference);
  const pinEnabled = useAppStore(state => state.pinEnabled);
  const securityEnabled = useAppStore(state => state.securityEnabled);
  const userPlan = useAppStore(state => state.userPlan);
  const monetization = useAppStore(state => state.monetization);
  const redeemedGuestPass = useAppStore(state => state.redeemedGuestPass);
  const savedKundlis = useAppStore(state => state.savedKundlis);
  const usage = useAppStore(state => state.usage);
  const setBiometricsEnabled = useAppStore(state => state.setBiometricsEnabled);
  const setChatSoundEnabled = useAppStore(state => state.setChatSoundEnabled);
  const setChartLanguagePreference = useAppStore(
    state => state.setChartLanguagePreference,
  );
  const setLanguagePreference = useAppStore(
    state => state.setLanguagePreference,
  );
  const setPinEnabled = useAppStore(state => state.setPinEnabled);
  const setSecurityEnabled = useAppStore(state => state.setSecurityEnabled);
  const setPredictaReplyLanguage = useAppStore(
    state => state.setPredictaReplyLanguage,
  );
  const setReportLanguagePreference = useAppStore(
    state => state.setReportLanguagePreference,
  );
  const setAuth = useAppStore(state => state.setAuth);
  const setRedeemedGuestPass = useAppStore(state => state.setRedeemedGuestPass);
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const resolvedAccess = resolveAccess({
    auth,
    monetization,
    redeemedGuestPass,
  });
  const usageDisplay = buildUsageDisplay({
    language: languagePreference.language,
    monetization,
    resolvedAccess,
    usage,
    userPlan,
  });
  const shellLabels = getAppShellLabels(languagePreference.language);

  useEffect(() => {
    isBiometrySupported()
      .then(setBiometryAvailable)
      .catch(() => setBiometryAvailable(false));
    getCurrentAuthState()
      .then(async nextAuth => {
        setAuth(nextAuth);

        if (nextAuth.userId) {
          const guestPass = await loadRedeemedGuestPassFromFirebase(
            nextAuth.userId,
          );
          setRedeemedGuestPass(guestPass);
          const ledger = await loadServerEntitlementLedgerFromFirebase(
            nextAuth.userId,
          ).catch(() => undefined);
          if (ledger) {
            setFreeAiBalance({
              remaining: Math.max(
                0,
                FREE_AI_QUESTION_LIFETIME_LIMIT - ledger.freeAiCreditsUsed,
              ),
              total: FREE_AI_QUESTION_LIFETIME_LIMIT,
            });
          }
        }
      })
      .catch(() => undefined);
    loadLanguagePreference()
      .then(preference => {
        setLanguagePreference(preference.appLanguage ?? preference.language);
        setChartLanguagePreference(
          preference.chartLanguage ?? preference.appLanguage ?? preference.language,
        );
        setReportLanguagePreference(
          preference.reportLanguage ?? preference.appLanguage ?? preference.language,
        );
        setPredictaReplyLanguage(
          preference.predictaReplyLanguage ??
            preference.appLanguage ??
            preference.language,
        );
      })
      .catch(() => undefined);
  }, [
    setAuth,
    setChartLanguagePreference,
    setLanguagePreference,
    setPredictaReplyLanguage,
    setRedeemedGuestPass,
    setReportLanguagePreference,
  ]);

  async function chooseLanguage(language: SupportedLanguage) {
    setLanguagePreference(language);
    await saveLanguagePreference(language).catch(() => undefined);
  }

  async function chooseChartLanguage(language: SupportedLanguage) {
    setChartLanguagePreference(language);
    await saveChartLanguagePreference(language).catch(() => undefined);
  }

  async function chooseReportLanguage(language: SupportedLanguage) {
    setReportLanguagePreference(language);
    await saveReportLanguagePreference(language).catch(() => undefined);
  }

  async function choosePredictaReplyLanguage(language: SupportedLanguage) {
    setPredictaReplyLanguage(language);
    await savePredictaReplyLanguagePreference(language).catch(() => undefined);
  }

  async function handleAccountAccess() {
    if (!auth.isLoggedIn) {
      navigation.navigate(routes.Login);
      return;
    }

    try {
      setAuthLoading(true);
      const nextAuth = await signOutGoogle();
      setAuth(nextAuth);
      setRedeemedGuestPass(undefined);
    } catch (error) {
      showGlassAlert({
        message: error instanceof Error ? error.message : 'Sign-out failed.',
        title: 'Account access',
      });
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="PRIVATE DEFAULTS" title="Settings" />

      <GlowCard className="mt-8" delay={80}>
        <AppText tone="secondary" variant="caption">
          ACCOUNT
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {auth.isLoggedIn ? 'Signed in profile' : 'Guest profile'}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {auth.isLoggedIn
            ? auth.email ?? 'Your account is connected.'
            : 'You can keep one Kundli as a guest. Sign in to save multiple Kundlis and restore them later.'}
        </AppText>
        <View className="mt-5 gap-4">
          <SettingRow
            description={
              auth.isLoggedIn
                ? `${savedKundlis.length} saved Kundli${savedKundlis.length === 1 ? '' : 's'} in My Kundlis.`
                : 'Guest storage is limited to one Kundli on this device.'
            }
            title="Kundli storage"
          >
            <GlowButton
              label="Open My Kundlis"
              onPress={() => navigation.navigate(routes.SavedKundlis)}
            />
          </SettingRow>
          <SettingRow
            description={
              auth.isLoggedIn
                ? 'Multiple Predicta chats are available with your account.'
                : 'Guests use one active Predicta chat. Sign in for multiple saved chats.'
            }
            title="Predicta chats"
          >
            <GlowButton
              label="Open Chat"
              onPress={() => navigation.navigate(routes.Chat)}
            />
          </SettingRow>
          <SettingRow
            description={
              redeemedGuestPass
                ? 'Your private testing pass is active.'
                : 'Redeem a pass only after signing in with the approved email.'
            }
            title="Guest pass"
          >
            <GlowButton
              label="Redeem"
              onPress={() => navigation.navigate(routes.RedeemPassCode)}
            />
          </SettingRow>
          <SettingRow
            description={
              auth.isLoggedIn
                ? getMonetizationReportRequirementCopy(
                    'starterRemainingTemplate',
                    languagePreference.language,
                    {
                      remaining: freeAiBalance?.remaining ?? 0,
                      total: freeAiBalance?.total ?? FREE_AI_QUESTION_LIFETIME_LIMIT,
                    },
                  )
                : getMonetizationReportRequirementCopy(
                    'starterSignInBody',
                    languagePreference.language,
                  )
            }
            title={getMonetizationReportRequirementCopy(
              'starterAiLabel',
              languagePreference.language,
            )}
          >
            <GlowButton
              label="Open Chat"
              onPress={() => navigation.navigate(routes.Chat)}
            />
          </SettingRow>
          <View className="mt-1">
            <GlowButton
              label={
                authLoading
                  ? 'Please wait...'
                  : auth.isLoggedIn
                  ? 'Sign Out'
                  : 'Sign In or Register'
              }
              loading={authLoading}
              onPress={handleAccountAccess}
            />
          </View>
        </View>
      </GlowCard>

      <GlassPanel className="mt-6" delay={100}>
        <View className="gap-6">
          <SettingRow
            description="Require PIN or biometrics before opening sensitive chart data."
            title="Security lock"
          >
            <Switch
              onValueChange={setSecurityEnabled}
              thumbColor={colors.primaryText}
              trackColor={{
                false: colors.border,
                true: colors.gradient[0],
              }}
              value={securityEnabled}
            />
          </SettingRow>

          <SettingRow
            description="Keep your PIN protected on this device."
            title="PIN unlock"
          >
            <Switch
              onValueChange={setPinEnabled}
              thumbColor={colors.primaryText}
              trackColor={{
                false: colors.border,
                true: colors.gradient[1],
              }}
              value={pinEnabled}
            />
          </SettingRow>

          <SettingRow
            description={
              biometryAvailable
                ? 'Use face or fingerprint unlock when available.'
                : 'Face or fingerprint unlock is not available on this device.'
            }
            title="Touch ID / Face ID"
          >
            <Switch
              disabled={!biometryAvailable}
              onValueChange={setBiometricsEnabled}
              thumbColor={colors.primaryText}
              trackColor={{
                false: colors.border,
                true: colors.gradient[2],
              }}
              value={biometricsEnabled && biometryAvailable}
            />
          </SettingRow>
        </View>
      </GlassPanel>

      <GlowCard className="mt-6" delay={220}>
        <AppText tone="secondary" variant="caption">
          LANGUAGE
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          Language choices
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          App text, chart labels, report PDFs, and Predicta replies can each use their own language.
        </AppText>
        <View className="mt-5 gap-5">
          <LanguageChoiceRow
            description="Controls menus, buttons, and page text."
            onSelect={chooseLanguage}
            selected={languagePreference.language}
            title="App language"
          />
          <LanguageChoiceRow
            description="Controls labels inside Kundli and chart views."
            onSelect={chooseChartLanguage}
            selected={
              languagePreference.chartLanguage ?? languagePreference.language
            }
            title="Chart labels"
          />
          <LanguageChoiceRow
            description="Controls the language used when reports are created."
            onSelect={chooseReportLanguage}
            selected={
              languagePreference.reportLanguage ?? languagePreference.language
            }
            title="Report PDFs"
          />
          <LanguageChoiceRow
            description="Controls Predicta replies unless the chat clearly needs another language."
            onSelect={choosePredictaReplyLanguage}
            selected={
              languagePreference.predictaReplyLanguage ??
              languagePreference.language
            }
            title="Predicta replies"
          />
        </View>
      </GlowCard>

      <GlowCard className="mt-6" delay={260}>
        <SettingRow
          description="A very soft local sound plays when Predicta finishes a response."
          title="Reply chime"
        >
          <Switch
            onValueChange={setChatSoundEnabled}
            thumbColor={colors.primaryText}
            trackColor={{
              false: colors.border,
              true: colors.gradient[1],
            }}
            value={chatSoundEnabled}
          />
        </SettingRow>
      </GlowCard>

      <GlowCard className="mt-6" delay={340}>
        <AppText variant="subtitle">{usageDisplay.statusText}</AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {usageDisplay.questionsText}. {usageDisplay.pdfText}.
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {usageDisplay.deepReadingsText}
        </AppText>
        <View className="mt-5">
          <GlowButton
            label={
              resolvedAccess.hasPremiumAccess
                ? 'Manage Premium'
                : 'View Premium Options'
            }
            onPress={() => navigation.navigate(routes.Paywall)}
          />
        </View>
        <View className="mt-4">
          <GlowButton
            label="Redeem Guest Pass"
            onPress={() => navigation.navigate(routes.RedeemPassCode)}
          />
        </View>
        {env.enableOwnerTools && resolvedAccess.isAdmin ? (
          <View className="mt-4">
            <GlowButton
              label="Admin Tools"
              onPress={() => navigation.navigate(routes.AdminAccess)}
            />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showSupportLinks }}
          className="mt-4 min-h-[54px] justify-center rounded-[18px] border border-[#252533] bg-[#191923] px-4"
          onPress={() => setShowSupportLinks(current => !current)}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            {showSupportLinks ? 'Hide support links' : 'Show support links'}
          </AppText>
          <AppText tone="secondary" variant="caption">
            Legal, safety, founder vision, and method notes stay tucked away
            until needed.
          </AppText>
        </Pressable>
        {showSupportLinks ? (
          <View className="mt-4 gap-3">
            <GlowButton
              label="Legal, Privacy, and Refund Policy"
              onPress={() => navigation.navigate(routes.Legal)}
            />
            <GlowButton
              label={shellLabels.nav.accuracyMethod}
              onPress={() => navigation.navigate(routes.AccuracyMethod)}
            />
            <GlowButton
              label="Safety Promise"
              onPress={() => navigation.navigate(routes.SafetyPromise)}
            />
            <GlowButton
              label="Founder Vision"
              onPress={() => navigation.navigate(routes.FounderVision)}
            />
          </View>
        ) : null}
      </GlowCard>

      <GlassPanel className="mt-6" delay={500}>
        <AppText variant="subtitle">PREDICTA</AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          Create your Kundli. Understand your life. Ask better questions. Get
          beautiful reports. Guidance is for reflection only, with clear safety
          boundaries.
        </AppText>
      </GlassPanel>
    </Screen>
  );
}

function LanguageChoiceRow({
  description,
  onSelect,
  selected,
  title,
}: {
  description: string;
  onSelect: (language: SupportedLanguage) => void;
  selected: SupportedLanguage;
  title: string;
}) {
  const selectedOption = getLanguageOption(selected);

  return (
    <View className="gap-3">
      <View>
        <AppText variant="subtitle">{title}</AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {description}
        </AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          Current: {selectedOption.nativeName}
        </AppText>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selected === option.code }}
            className={`min-h-[44px] justify-center rounded-full border px-4 py-3 ${
              selected === option.code
                ? 'border-[#4DAFFF] bg-[#172233]'
                : 'border-[#252533] bg-[#191923]'
            }`}
            key={option.code}
            onPress={() => onSelect(option.code)}
          >
            <AppText variant="caption">{option.nativeName}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SettingRow({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <View className="gap-4">
      <View className="flex-1 pr-2">
        <AppText variant="subtitle">{title}</AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <View className="min-w-[56px] items-stretch">{children}</View>
    </View>
  );
}
