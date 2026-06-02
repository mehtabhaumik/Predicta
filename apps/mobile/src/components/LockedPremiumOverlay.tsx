import React, { type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  getMonetizationPaywallContext,
  getMonetizationReportRequirementCopy,
} from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';

import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type LockedPremiumOverlayProps = PropsWithChildren<{
  ctaLabel?: string;
  language?: SupportedLanguage;
  onUnlock: () => void;
}>;

export function LockedPremiumOverlay({
  children,
  ctaLabel,
  language = 'en',
  onUnlock,
}: LockedPremiumOverlayProps): React.JSX.Element {
  const copy = getMonetizationPaywallContext('LOCKED_CHART_TAPPED', language);

  return (
    <View style={styles.shell}>
      <View style={styles.preview}>{children}</View>
      <LinearGradient
        colors={['rgba(10,10,15,0.76)', 'rgba(18,18,26,0.94)']}
        style={styles.overlay}
      >
        <AppText variant="subtitle">{copy.title}</AppText>
        <AppText
          className="mt-2 text-center"
          tone="secondary"
          variant="caption"
        >
          {copy.message}
        </AppText>
        <View className="mt-4 w-full">
          <GlowButton label={ctaLabel ?? copy.primaryCta} onPress={onUnlock} />
        </View>
        <Pressable
          accessibilityRole="button"
          className="mt-3"
          onPress={onUnlock}
        >
          <AppText className="text-[#4DAFFF]" variant="caption">
            {getMonetizationReportRequirementCopy('premiumOptions', language)}
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
