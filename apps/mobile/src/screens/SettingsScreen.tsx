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
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  getCurrentAuthState,
  signOutGoogle,
} from '../services/firebase/authService';
import { loadRedeemedGuestPassFromFirebase } from '../services/firebase/passCodePersistence';
import { resolveAccess } from '@pridicta/access';
import { isBiometrySupported } from '../services/security/secureStorage';
import { buildUsageDisplay } from '@pridicta/monetization';
import {
  getLanguageLabels,
  SUPPORTED_LANGUAGE_OPTIONS,
} from '@pridicta/config/language';
import {
  loadLanguagePreference,
  saveLanguagePreference,
} from '../services/preferences/languagePreferenceStorage';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { SupportedLanguage } from '../types/astrology';

export function SettingsScreen({
  navigation,
}: RootScreenProps<typeof routes.Settings>): React.JSX.Element {
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const auth = useAppStore(state => state.auth);
  const biometricsEnabled = useAppStore(state => state.biometricsEnabled);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const languagePreference = useAppStore(state => state.languagePreference);
  const pinEnabled = useAppStore(state => state.pinEnabled);
  const securityEnabled = useAppStore(state => state.securityEnabled);
  const userPlan = useAppStore(state => state.userPlan);
  const monetization = useAppStore(state => state.monetization);
  const redeemedGuestPass = useAppStore(state => state.redeemedGuestPass);
  const usage = useAppStore(state => state.usage);
  const setBiometricsEnabled = useAppStore(state => state.setBiometricsEnabled);
  const setChatSoundEnabled = useAppStore(state => state.setChatSoundEnabled);
  const setLanguagePreference = useAppStore(
    state => state.setLanguagePreference,
  );
  const setPinEnabled = useAppStore(state => state.setPinEnabled);
  const setSecurityEnabled = useAppStore(state => state.setSecurityEnabled);
  const setAuth = useAppStore(state => state.setAuth);
  const setRedeemedGuestPass = useAppStore(state => state.setRedeemedGuestPass);
  const { glassAlert, showGlassAlert } = useGlassAlert();
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
  const languageLabels = getLanguageLabels(languagePreference.language);

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
        }
      })
      .catch(() => undefined);
    loadLanguagePreference()
      .then(preference => setLanguagePreference(preference.language))
      .catch(() => undefined);
  }, [setAuth, setLanguagePreference, setRedeemedGuestPass]);

  async function chooseLanguage(language: SupportedLanguage) {
    setLanguagePreference(language);
    await saveLanguagePreference(language).catch(() => undefined);
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

      <GlassPanel className="mt-8" delay={100}>
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
            description="Store PIN material in the device keychain."
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
                ? 'Use device biometrics when available.'
                : 'Biometrics are not available on this device.'
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
          {languageLabels.currentLanguage}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {languageLabels.language}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {languageLabels.languageHelper}
        </AppText>
        <View className="mt-4 flex-row flex-wrap gap-2">
          {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
            <Pressable
              accessibilityRole="button"
              className={`rounded-full border px-3 py-2 ${
                languagePreference.language === option.code
                  ? 'border-[#4DAFFF] bg-[#172233]'
                  : 'border-[#252533] bg-[#191923]'
              }`}
              key={option.code}
              onPress={() => chooseLanguage(option.code)}
            >
              <AppText variant="caption">{option.nativeName}</AppText>
            </Pressable>
          ))}
        </View>
      </GlowCard>

      <GlowCard className="mt-6" delay={260}>
        <SettingRow
          description="A very soft local sound plays when Pridicta finishes a response."
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
        {resolvedAccess.isAdmin ? (
          <View className="mt-4">
            <GlowButton
              label="Admin Tools"
              onPress={() => navigation.navigate(routes.AdminAccess)}
            />
          </View>
        ) : null}
        <View className="mt-4">
          <GlowButton
            label="Legal, Privacy, and Refund Policy"
            onPress={() => navigation.navigate(routes.Legal)}
          />
        </View>
      </GlowCard>

      <GlowCard className="mt-6" delay={420}>
        <AppText variant="subtitle">
          {auth.isLoggedIn ? 'Google connected' : 'Cloud sync is optional'}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {auth.isLoggedIn
            ? auth.email ?? 'Your Google account is connected.'
            : 'Your kundlis stay on this device unless you choose to save them to cloud.'}
        </AppText>
        <View className="mt-5">
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
      </GlowCard>

      <GlassPanel className="mt-6" delay={500}>
        <AppText variant="subtitle">PRIDICTA</AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          Create your Kundli. Understand your life. Ask better questions. Get
          beautiful reports. Guidance is for reflection only, with clear safety
          boundaries.
        </AppText>
      </GlassPanel>
    </Screen>
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
    <View className="flex-row items-center justify-between gap-5">
      <View className="flex-1 pr-2">
        <AppText variant="subtitle">{title}</AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <View className="min-w-[56px] items-end">{children}</View>
    </View>
  );
}
