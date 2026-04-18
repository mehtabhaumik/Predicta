import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { AppText, FadeInView, GradientText, Screen } from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { bootstrapSession } from '../services/sessionService';
import { colors } from '../theme/colors';

const predictaLogo = require('../assets/predicta-logo.png');

export function SplashScreen({
  navigation,
}: RootScreenProps<typeof routes.Splash>): React.JSX.Element {
  useEffect(() => {
    let mounted = true;

    async function boot() {
      const session = await bootstrapSession();

      setTimeout(() => {
        if (!mounted) {
          return;
        }

        if (!session.onboardingComplete) {
          navigation.replace(routes.Onboarding);
          return;
        }

        navigation.replace(
          session.securityEnabled ? routes.Home : routes.SecuritySetup,
        );
      }, 900);
    }

    boot();

    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-center">
        <FadeInView
          className="items-center justify-center"
          duration={800}
          style={styles.logoFrame}
        >
          <LinearGradient
            colors={colors.gradient}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={styles.glowOrbLarge}
          />
          <LinearGradient
            colors={colors.gradient}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={styles.glowOrb}
          />
          <Image
            accessibilityIgnoresInvertColors
            source={predictaLogo}
            style={styles.logo}
          />
        </FadeInView>

        <FadeInView className="mt-8 items-center" delay={120} duration={800}>
          <GradientText variant="display">Predicta</GradientText>
          <AppText className="mt-3 text-center" tone="secondary">
            Calm spiritual intelligence for the decisions that need a clearer
            signal.
          </AppText>
        </FadeInView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    borderRadius: 110,
    height: 220,
    opacity: 0.2,
    position: 'absolute',
    transform: [{ scale: 1.05 }],
    width: 220,
  },
  glowOrbLarge: {
    borderRadius: 145,
    height: 290,
    opacity: 0.12,
    position: 'absolute',
    transform: [{ rotate: '18deg' }],
    width: 290,
  },
  logo: {
    borderRadius: 28,
    height: 176,
    width: 176,
  },
  logoFrame: {
    elevation: 18,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 34,
  },
});
