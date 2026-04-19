import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

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
          message: 'Please sign in before redeeming a guest pass.',
          title: 'Sign-in required',
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

      <GlassPanel style={styles.firstPanel} delay={100}>
        <AppText variant="subtitle">Enter your Predicta pass</AppText>
        <AppText style={styles.sectionCopy} tone="secondary">
          Guest passes unlock expanded guidance for a limited period. Redemption
          requires Google login so the pass stays protected and cannot be reused
          unexpectedly.
        </AppText>
        <View style={styles.fieldBlock}>
          <AppText style={styles.fieldLabel} tone="secondary" variant="caption">
            Pass code
          </AppText>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={setCode}
            placeholder="PRIDICTA-VIP-XXXX"
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
            value={code}
          />
        </View>
        <View style={styles.actionBlock}>
          <GlowButton
            label={loading ? 'Checking...' : 'Redeem Guest Pass'}
            loading={loading}
            onPress={redeem}
          />
        </View>
      </GlassPanel>

      <GlowCard style={styles.panelSpacing} delay={220}>
        <AppText variant="subtitle">Privacy by default</AppText>
        <AppText style={styles.sectionCopy} tone="secondary">
          Pass codes are checked by their secure hash. Predicta does not need to
          store your private code.
        </AppText>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionBlock: {
    marginTop: 22,
  },
  fieldBlock: {
    gap: 10,
    marginTop: 24,
  },
  fieldLabel: {
    textTransform: 'uppercase',
  },
  firstPanel: {
    marginTop: 32,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.primaryText,
    fontSize: 16,
    minHeight: 58,
    paddingHorizontal: 16,
  },
  panelSpacing: {
    marginTop: 24,
  },
  sectionCopy: {
    marginTop: 8,
  },
});
