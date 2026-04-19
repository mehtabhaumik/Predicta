import React, { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import {
  getAiLanguageInstruction,
  getLocalizedString,
  SUPPORTED_LOCALES,
} from '@pridicta/config';
import type { AppLocale } from '@pridicta/types';
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
  loadLanguagePreference,
  saveLanguagePreference,
} from '../services/storage/languagePreferenceStorage';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function SettingsScreen({
  navigation,
}: RootScreenProps<typeof routes.Settings>): React.JSX.Element {
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const auth = useAppStore(state => state.auth);
  const biometricsEnabled = useAppStore(state => state.biometricsEnabled);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const pinEnabled = useAppStore(state => state.pinEnabled);
  const securityEnabled = useAppStore(state => state.securityEnabled);
  const userPlan = useAppStore(state => state.userPlan);
  const monetization = useAppStore(state => state.monetization);
  const preferredLanguage = useAppStore(state => state.preferredLanguage);
  const redeemedGuestPass = useAppStore(state => state.redeemedGuestPass);
  const usage = useAppStore(state => state.usage);
  const setBiometricsEnabled = useAppStore(state => state.setBiometricsEnabled);
  const setChatSoundEnabled = useAppStore(state => state.setChatSoundEnabled);
  const setPinEnabled = useAppStore(state => state.setPinEnabled);
  const setPreferredLanguage = useAppStore(state => state.setPreferredLanguage);
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
      .then(preference => setPreferredLanguage(preference.locale))
      .catch(() => setPreferredLanguage('en'));
  }, [setAuth, setPreferredLanguage, setRedeemedGuestPass]);

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

  async function handleLanguageChange(locale: AppLocale) {
    setPreferredLanguage(locale);
    await saveLanguagePreference(locale).catch(() => {
      showGlassAlert({
        message: 'Your language preference could not be saved on this device.',
        title: 'Language preference',
      });
    });
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="PRIVATE DEFAULTS" title="Settings" />

      <GlassPanel style={styles.firstPanel} delay={100}>
        <View style={styles.settingsStack}>
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

      <GlowCard style={styles.panelSpacing} delay={220}>
        <AppText variant="subtitle">
          {getLocalizedString('settings.language.title', preferredLanguage)}
        </AppText>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          {getLocalizedString('settings.language.description', preferredLanguage)}
        </AppText>
        <View style={styles.languageGrid}>
          {SUPPORTED_LOCALES.map(option => (
            <Pressable
              accessibilityRole="button"
              key={option.code}
              onPress={() => handleLanguageChange(option.code)}
              style={[
                styles.languageOption,
                preferredLanguage === option.code
                  ? styles.languageOptionActive
                  : undefined,
              ]}
            >
              <AppText variant="subtitle">{option.nativeLabel}</AppText>
              <AppText tone="secondary" variant="caption">
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          {getAiLanguageInstruction(preferredLanguage)}
        </AppText>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          {getLocalizedString('settings.language.pdfHint', preferredLanguage)}
        </AppText>
      </GlowCard>

      <GlowCard style={styles.panelSpacing} delay={260}>
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

      <GlowCard style={styles.panelSpacing} delay={340}>
        <AppText variant="subtitle">{usageDisplay.statusText}</AppText>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          {usageDisplay.questionsText}. {usageDisplay.pdfText}.
        </AppText>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          {usageDisplay.deepReadingsText}
        </AppText>
        <View style={styles.actionBlock}>
          <GlowButton
            label={
              resolvedAccess.hasPremiumAccess
                ? 'Manage Premium'
                : 'View Premium Options'
            }
            onPress={() => navigation.navigate(routes.Paywall)}
          />
        </View>
        <View style={styles.secondaryActionBlock}>
          <GlowButton
            label="Redeem Guest Pass"
            onPress={() => navigation.navigate(routes.RedeemPassCode)}
          />
        </View>
        <View style={styles.secondaryActionBlock}>
          <GlowButton
            label="Open Life Timeline"
            onPress={() => navigation.navigate(routes.LifeTimeline)}
          />
        </View>
        {resolvedAccess.isAdmin ? (
          <View style={styles.secondaryActionBlock}>
            <GlowButton
              label="Admin Tools"
              onPress={() => navigation.navigate(routes.AdminAccess)}
            />
          </View>
        ) : null}
      </GlowCard>

      <GlowCard style={styles.panelSpacing} delay={420}>
        <AppText variant="subtitle">
          {auth.isLoggedIn ? 'Google connected' : 'Cloud sync is optional'}
        </AppText>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          {auth.isLoggedIn
            ? auth.email ?? 'Your Google account is connected.'
            : 'Your kundlis stay on this device unless you choose to save them to cloud.'}
        </AppText>
        <View style={styles.actionBlock}>
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

      <GlowCard style={styles.panelSpacing} delay={500}>
        <AppText variant="subtitle">About Predicta</AppText>
        <AppText style={styles.sectionCopy} tone="secondary" variant="caption">
          Read the founder story and the product vision behind Predicta.
        </AppText>
        <View style={styles.actionBlock}>
          <GlowButton
            label="Meet the Founder"
            onPress={() => navigation.navigate(routes.Founder)}
          />
        </View>
      </GlowCard>
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
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText style={styles.settingDescription} tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBlock: {
    marginTop: 22,
  },
  firstPanel: {
    marginTop: 32,
  },
  languageGrid: {
    gap: 12,
    marginTop: 18,
  },
  languageOption: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  languageOptionActive: {
    borderColor: colors.borderGlow,
  },
  panelSpacing: {
    marginTop: 24,
  },
  secondaryActionBlock: {
    marginTop: 14,
  },
  sectionCopy: {
    marginTop: 8,
  },
  settingControl: {
    alignItems: 'flex-end',
    minWidth: 62,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 14,
  },
  settingDescription: {
    marginTop: 8,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
  },
  settingsStack: {
    gap: 26,
  },
});
