import React, { type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type LockedPremiumOverlayProps = PropsWithChildren<{
  ctaLabel?: string;
  onUnlock: () => void;
}>;

export function LockedPremiumOverlay({
  children,
  ctaLabel = 'Unlock',
  onUnlock,
}: LockedPremiumOverlayProps): React.JSX.Element {
  return (
    <View style={styles.shell}>
      <View style={styles.preview}>{children}</View>
      <LinearGradient
        colors={['rgba(10,10,15,0.76)', 'rgba(18,18,26,0.94)']}
        style={styles.overlay}
      >
        <AppText variant="subtitle">Available in Premium</AppText>
        <AppText style={styles.description} tone="secondary" variant="caption">
          Deeper chart interpretation unlocks when you choose Premium.
        </AppText>
        <View style={styles.ctaWrap}>
          <GlowButton label={ctaLabel} onPress={onUnlock} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onUnlock}
          style={styles.linkButton}
        >
          <AppText style={styles.linkText} variant="caption">
            View Premium options
          </AppText>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    marginTop: 18,
    width: '100%',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  linkText: {
    color: colors.gradient[1],
  },
  overlay: {
    alignItems: 'center',
    borderColor: colors.borderGlow,
    borderRadius: 16,
    borderWidth: 1,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  preview: {
    opacity: 0.36,
  },
  shell: {
    minHeight: 170,
  },
});
