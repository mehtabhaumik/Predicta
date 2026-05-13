import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlassPanel,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { formatPassCode } from '@pridicta/access';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { getInstallDeviceId } from '../services/device/deviceIdentity';
import {
  getCurrentAuthState,
  signInWithGoogle,
} from '../services/firebase/authService';
import { redeemPassCodeWithFirebase } from '../services/firebase/passCodePersistence';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function RedeemPassCodeScreen(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAppStore(state => state.auth);
  const setAuth = useAppStore(state => state.setAuth);
  const setRedeemedGuestPass = useAppStore(state => state.setRedeemedGuestPass);
  const { glassAlert, showGlassAlert } = useGlassAlert();

  async function ensureSignedIn() {
    const current = await getCurrentAuthState();

    if (current.isLoggedIn) {
      setAuth(current);
      return current;
    }

    const next = await signInWithGoogle();
    setAuth(next);
    return next;
  }

  async function redeem() {
    const displayCode = formatPassCode(code);

    if (!displayCode) {
      showGlassAlert({
        message: 'Enter the guest pass code you received.',
        title: 'Guest pass',
      });
      return;
    }

    try {
      setLoading(true);
      const signedInAuth = auth.isLoggedIn ? auth : await ensureSignedIn();

      if (!signedInAuth.userId) {
        showGlassAlert({
          message:
            'Please sign in before redeeming a guest pass. Use the same email that was approved when the pass was created.',
          title: 'Sign-in required',
        });
        return;
      }

      if (!signedInAuth.email) {
        showGlassAlert({
          message:
            'This pass needs an email on your account. Sign in with the approved pass email, then try again.',
          title: 'Approved email required',
        });
        return;
      }

      const result = await redeemPassCodeWithFirebase({
        code,
        deviceId: await getInstallDeviceId(),
        email: signedInAuth.email,
        userId: signedInAuth.userId,
      });

      if (result.status !== 'SUCCESS') {
        showGlassAlert({ message: result.message, title: 'Guest pass' });
        return;
      }

      setRedeemedGuestPass(result.redeemedPass);
      trackAnalyticsEvent({
        eventName: 'guest_pass_redeemed',
        metadata: {
          passCodeId: result.redeemedPass.passCodeId,
          type: result.redeemedPass.type,
        },
        userId: signedInAuth.userId,
      });
      showGlassAlert({
        message: `${result.redeemedPass.label} is now active on this account.`,
        title: 'Guest access active',
      });
      setCode('');
    } catch (error) {
      showGlassAlert({
        message:
          error instanceof Error
            ? error.message
            : 'This guest pass could not be redeemed right now.',
        title: 'Guest pass',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="PRIVATE INVITE" title="Redeem guest pass" />

      <GlassPanel className="mt-8" delay={100}>
        <AppText variant="subtitle">Enter your Predicta pass</AppText>
        <AppText className="mt-2" tone="secondary">
          Guest passes unlock expanded guidance for a limited period. Sign in
          with the same email that was approved for your pass, then enter the
          code. If the email does not match, the pass will stay locked.
        </AppText>
        <View className="mt-6">
          <AppText className="mb-2" tone="secondary" variant="caption">
            Pass code
          </AppText>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            className="rounded-2xl border border-[#252533] bg-app-card p-4 text-base text-text-primary"
            onChangeText={setCode}
            placeholder="PREDICTA-VIP-XXXX"
            placeholderTextColor={colors.secondaryText}
            value={code}
          />
        </View>
        <View className="mt-5">
          <GlowButton
            label={loading ? 'Checking...' : 'Redeem Guest Pass'}
            loading={loading}
            onPress={redeem}
          />
        </View>
      </GlassPanel>

      <GlowCard className="mt-6" delay={220}>
        <AppText variant="subtitle">Privacy by default</AppText>
        <AppText className="mt-2" tone="secondary">
          Pass codes are checked by their secure hash. Predicta does not need to
          store your private code.
        </AppText>
      </GlowCard>
    </Screen>
  );
}
