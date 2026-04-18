import React, { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

type FloatingGlowOrbProps = {
  size?: number;
  style?: ViewStyle;
};

export function FloatingGlowOrb({
  size = 220,
  style,
}: FloatingGlowOrbProps): React.JSX.Element {
  const opacity = useSharedValue(0.38);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.58, { duration: 2600 }),
        withTiming(0.3, { duration: 2600 }),
      ),
      -1,
      true,
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3200 }),
        withTiming(8, { duration: 3200 }),
      ),
      -1,
      true,
    );
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        {
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        style,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={colors.gradientMuted}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orb: {
    overflow: 'hidden',
    position: 'absolute',
  },
});
