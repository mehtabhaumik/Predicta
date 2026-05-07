import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

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
  signInWithApple,
  signInWithEmailPassword,
  signInWithGoogle,
  signInWithMicrosoft,
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

      <GlassPanel className="mt-8" delay={100}>
        <AppText variant="subtitle">Choose how you want to continue</AppText>
        <AppText className="mt-2" tone="secondary">
          Sign in to restore online-saved kundlis, guest passes, purchases, and
          preferences. Local use remains available.
        </AppText>

        <View className="mt-6 gap-3">
          <ProviderButton
            icon={<GoogleIcon />}
            label={loading ? 'Please wait...' : 'Continue with Google'}
            onPress={() =>
              runAuth(() => signInWithGoogle(), 'Signed in with Google.')
            }
          />
          <ProviderButton
            icon={<AppleIcon />}
            label="Continue with Apple"
            onPress={() =>
              runAuth(() => signInWithApple(), 'Signed in with Apple.')
            }
          />
          <ProviderButton
            icon={<MicrosoftIcon />}
            label="Continue with Microsoft"
            onPress={() =>
              runAuth(() => signInWithMicrosoft(), 'Signed in with Microsoft.')
            }
          />
        </View>
      </GlassPanel>

      <GlassPanel className="mt-6" delay={180}>
        <View className="flex-row gap-3">
          <GlowButton label="Sign In" onPress={() => setMode('sign-in')} />
          <GlowButton label="Register" onPress={() => setMode('register')} />
        </View>

        <View className="mt-6">
          <AppText className="mb-2" tone="secondary" variant="caption">
            Email
          </AppText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            className="h-14 rounded-lg border border-[#252533] px-4 text-base text-text-primary"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.secondaryText}
            value={email}
          />
        </View>

        <View className="mt-5">
          <AppText className="mb-2" tone="secondary" variant="caption">
            Password
          </AppText>
          <TextInput
            autoComplete={mode === 'register' ? 'new-password' : 'password'}
            className="h-14 rounded-lg border border-[#252533] px-4 text-base text-text-primary"
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            value={password}
          />
        </View>

        <View className="mt-6 gap-3">
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
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center rounded-2xl border border-[#252533] bg-app-card px-4 py-4"
      onPress={onPress}
    >
      {icon}
      <AppText className="ml-3 font-bold">{label}</AppText>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.providerIcon}>
      <AppText className="font-black text-[#4DAFFF]">G</AppText>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.providerIcon}>
      <View style={styles.appleBody} />
      <View style={styles.appleLeaf} />
    </View>
  );
}

function MicrosoftIcon() {
  return (
    <View style={[styles.providerIcon, styles.microsoftGrid]}>
      <View style={[styles.microsoftSquare, { backgroundColor: '#f25022' }]} />
      <View style={[styles.microsoftSquare, { backgroundColor: '#7fba00' }]} />
      <View style={[styles.microsoftSquare, { backgroundColor: '#00a4ef' }]} />
      <View style={[styles.microsoftSquare, { backgroundColor: '#ffb900' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  appleBody: {
    backgroundColor: colors.primaryText,
    borderRadius: 8,
    height: 16,
    top: 9,
    width: 14,
  },
  appleLeaf: {
    backgroundColor: colors.primaryText,
    borderRadius: 5,
    height: 7,
    position: 'absolute',
    right: 8,
    top: 6,
    transform: [{ rotate: '-28deg' }],
    width: 8,
  },
  microsoftGrid: {
    alignContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 6,
  },
  microsoftSquare: {
    height: 8,
    width: 8,
  },
  providerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
