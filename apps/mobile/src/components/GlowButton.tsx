import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';
import { FadeInView } from './FadeInView';

type GlowButtonProps = PressableProps & {
  delay?: number;
  label: string;
  loading?: boolean;
};

export function GlowButton({
  delay = 0,
  disabled,
  label,
  loading = false,
  onPressIn,
  onPressOut,
  ...props
}: GlowButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <FadeInView delay={delay}>
      <Animated.View style={[styles.glow, animatedStyle]}>
        <Pressable
          accessibilityRole="button"
          disabled={isDisabled}
          onPressIn={event => {
            scale.value = withTiming(0.96, { duration: 120 });
            onPressIn?.(event);
          }}
          onPressOut={event => {
            scale.value = withTiming(1, { duration: 160 });
            onPressOut?.(event);
          }}
          style={isDisabled ? styles.disabled : undefined}
          {...props}
        >
          <LinearGradient
            colors={colors.gradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.button}
          >
            <View style={styles.highlight} />
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text className="text-base font-extrabold text-text-primary">
                {label}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  glow: {
    borderRadius: 16,
    elevation: 14,
    shadowColor: colors.gradient[2],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  highlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    height: 1,
    left: 18,
    position: 'absolute',
    right: 18,
    top: 1,
  },
});
