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
        <AppText
          className="mt-2 text-center"
          tone="secondary"
          variant="caption"
        >
          Deeper chart interpretation unlocks when you choose Premium.
        </AppText>
        <View className="mt-4 w-full">
          <GlowButton label={ctaLabel} onPress={onUnlock} />
        </View>
        <Pressable
          accessibilityRole="button"
          className="mt-3"
          onPress={onUnlock}
        >
          <AppText className="text-[#4DAFFF]" variant="caption">
            View Premium options
          </AppText>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
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
