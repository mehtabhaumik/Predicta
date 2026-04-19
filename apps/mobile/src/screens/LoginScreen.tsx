import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlassPanel,
  GlowButton,
  Screen,
  useGlassAlert,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  registerWithEmailPassword,
  sendPasswordReset,
  signInWithEmailPassword,
  signInWithGoogle,
} from '../services/firebase/authService';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { AuthState } from '../types/astrology';

export function LoginScreen({
  navigation,
}: RootScreenProps<typeof routes.Login>): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'register'>('sign-in');
  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore(state => state.setAuth);
  const { glassAlert, showGlassAlert } = useGlassAlert();

  async function runAuth(action: () => Promise<unknown>, success: string) {
    try {
      setLoading(true);
      const result = await action();
      if (result && typeof result === 'object' && 'isLoggedIn' in result) {
        setAuth(result as AuthState);
      }
      showGlassAlert({
        actions: [{ label: 'Continue', onPress: () => navigation.goBack() }],
        message: success,
        title: 'Account ready',
      });
    } catch (error) {
      showGlassAlert({
        message:
          error instanceof Error
            ? cleanAuthMessage(error.message)
            : 'Sign-in could not be completed. Please try again.',
        title: 'Sign-in',
      });
    } finally {
      setLoading(false);
    }
  }

  function submitEmail() {
    if (!email.trim() || !password) {
      showGlassAlert({
        message: 'Enter your email and password first.',
        title: 'Email sign-in',
      });
      return;
    }

    runAuth(
      () =>
        mode === 'register'
          ? registerWithEmailPassword({ email, password })
          : signInWithEmailPassword({ email, password }),
      mode === 'register' ? 'Your account has been created.' : 'Signed in.',
    );
  }

  function reset() {
    if (!email.trim()) {
      showGlassAlert({
        message: 'Enter your email before requesting a reset link.',
        title: 'Reset password',
      });
      return;
    }

    runAuth(
      () => sendPasswordReset(email),
      'A password reset link has been sent if this email is registered.',
    );
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="ACCOUNT ACCESS" title="Sign in to Predicta" />

      <GlassPanel style={styles.panelSpacing} delay={100}>
        <AppText variant="subtitle">Choose how you want to continue</AppText>
        <AppText style={styles.sectionCopy} tone="secondary">
          Sign in to restore online-saved kundlis, guest passes, purchases, and
          preferences. Local use remains available.
        </AppText>

        <View style={styles.providerStack}>
          <ProviderButton
            icon={<GoogleIcon />}
            label={loading ? 'Please wait...' : 'Continue with Google'}
            onPress={() =>
              runAuth(() => signInWithGoogle(), 'Signed in with Google.')
            }
          />
          <ProviderButton
            disabled
            icon={<AppleIcon />}
            label="Continue with Apple"
            statusLabel="Coming soon"
            onPress={() => undefined}
          />
          <ProviderButton
            disabled
            icon={<MicrosoftIcon />}
            label="Continue with Microsoft"
            statusLabel="Coming soon"
            onPress={() => undefined}
          />
        </View>
      </GlassPanel>

      <GlassPanel style={styles.formPanel} delay={180}>
        <View style={styles.modeTabs}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('sign-in')}
            style={[styles.modeTab, mode === 'sign-in' ? styles.modeTabActive : null]}
          >
            <AppText
              style={mode === 'sign-in' ? styles.modeTabTextActive : styles.modeTabText}
              variant="caption"
            >
              Sign in
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('register')}
            style={[styles.modeTab, mode === 'register' ? styles.modeTabActive : null]}
          >
            <AppText
              style={mode === 'register' ? styles.modeTabTextActive : styles.modeTabText}
              variant="caption"
            >
              Register
            </AppText>
          </Pressable>
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.fieldLabel} tone="secondary" variant="caption">
            Email
          </AppText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.fieldLabel} tone="secondary" variant="caption">
            Password
          </AppText>
          <TextInput
            autoComplete={mode === 'register' ? 'new-password' : 'password'}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        <View style={styles.formActions}>
          <GlowButton
            label={
              loading
                ? 'Please wait...'
                : mode === 'register'
                ? 'Create Account'
                : 'Sign In'
            }
            loading={loading}
            onPress={submitEmail}
          />
          <GlowButton label="Reset Password" onPress={reset} />
        </View>
      </GlassPanel>
    </Screen>
  );
}

function cleanAuthMessage(message: string): string {
  return message
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\(auth\/.*\)\.?$/, '.');
}

function ProviderButton({
  disabled = false,
  icon,
  label,
  onPress,
  statusLabel,
}: {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  statusLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.providerButton, disabled ? styles.disabledProviderButton : null]}
    >
      {icon}
      <View style={styles.providerCopy}>
        <AppText style={styles.providerLabel}>{label}</AppText>
        {statusLabel ? (
          <View style={styles.comingSoonPill}>
            <AppText style={styles.comingSoonText}>{statusLabel}</AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.providerIconShell}>
      <Text style={[styles.providerIconLetter, styles.googleLetter]}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.providerIconShell}>
      <Text style={styles.providerIconLetter}>A</Text>
    </View>
  );
}

function MicrosoftIcon() {
  return (
    <View style={styles.providerIconShell}>
      <View style={styles.microsoftGrid}>
        <View style={[styles.microsoftSquare, styles.microsoftRed]} />
        <View style={[styles.microsoftSquare, styles.microsoftGreen]} />
        <View style={[styles.microsoftSquare, styles.microsoftBlue]} />
        <View style={[styles.microsoftSquare, styles.microsoftYellow]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comingSoonPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  comingSoonText: {
    color: colors.secondaryText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  disabledProviderButton: {
    opacity: 0.72,
  },
  fieldBlock: {
    marginTop: 22,
  },
  fieldLabel: {
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  formActions: {
    gap: 12,
    marginTop: 24,
  },
  formPanel: {
    marginTop: 24,
  },
  googleLetter: {
    color: '#4285F4',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.primaryText,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  microsoftGrid: {
    alignContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    height: 27,
    width: 27,
  },
  microsoftSquare: {
    borderRadius: 2,
    height: 12,
    width: 12,
  },
  modeTab: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: colors.borderSoft,
    borderWidth: 1,
  },
  modeTabs: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 5,
  },
  modeTabText: {
    color: colors.secondaryText,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modeTabTextActive: {
    color: colors.primaryText,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelSpacing: {
    marginTop: 32,
  },
  providerButton: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  providerCopy: {
    flex: 1,
    marginLeft: 14,
  },
  providerIconLetter: {
    color: colors.primaryText,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 26,
  },
  providerIconShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    width: 46,
  },
  providerLabel: {
    fontWeight: '800',
  },
  providerStack: {
    gap: 12,
    marginTop: 24,
  },
  sectionCopy: {
    marginTop: 8,
  },
  microsoftBlue: {
    backgroundColor: '#00A4EF',
  },
  microsoftGreen: {
    backgroundColor: '#7FBA00',
  },
  microsoftRed: {
    backgroundColor: '#F25022',
  },
  microsoftYellow: {
    backgroundColor: '#FFB900',
  },
});
