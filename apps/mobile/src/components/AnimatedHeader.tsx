import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { FadeInView } from './FadeInView';
import { GradientText } from './GradientText';

const predictaLogo = require('../assets/predicta-logo.png');

type AnimatedHeaderProps = {
  eyebrow?: string;
  title: string;
  showLogo?: boolean;
};

export function AnimatedHeader({
  eyebrow,
  showLogo = true,
  title,
}: AnimatedHeaderProps): React.JSX.Element {
  return (
    <FadeInView style={styles.root}>
      <View style={styles.copy}>
        {eyebrow ? (
          <AppText tone="secondary" variant="caption">
            {eyebrow}
          </AppText>
        ) : null}
        <GradientText variant="title">{title}</GradientText>
      </View>
      {showLogo ? (
        <View style={styles.logoShell}>
          <Image
            accessibilityIgnoresInvertColors
            source={predictaLogo}
            style={styles.logo}
          />
        </View>
      ) : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
  },
  logo: {
    borderRadius: 12,
    height: 44,
    width: 44,
  },
  logoShell: {
    borderColor: colors.borderGlow,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 8,
    padding: 3,
    shadowColor: colors.gradient[0],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
  },
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
});
