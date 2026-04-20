import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

type SkeletonBlockProps = {
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
};

type SkeletonCardProps = {
  rows?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonLine({
  height = 14,
  radius = 999,
  style,
  width = '100%',
}: SkeletonBlockProps): React.JSX.Element {
  return (
    <SkeletonBlock
      height={height}
      radius={radius}
      style={style}
      width={width}
    />
  );
}

export function SkeletonCard({
  rows = 4,
  style,
}: SkeletonCardProps): React.JSX.Element {
  return (
    <View accessibilityLabel="Loading content" style={[styles.card, style]}>
      <SkeletonLine height={11} width="34%" />
      <SkeletonLine height={26} style={styles.titleLine} width="78%" />
      <View style={styles.rowStack}>
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonLine
            key={index}
            width={`${Math.max(42, 94 - index * 12)}%` as DimensionValue}
          />
        ))}
      </View>
    </View>
  );
}

export function SkeletonStack({
  rows = 3,
  style,
}: SkeletonCardProps): React.JSX.Element {
  return (
    <View style={[styles.stack, style]}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonCard key={index} rows={index === 0 ? 3 : 2} />
      ))}
    </View>
  );
}

function SkeletonBlock({
  height = 14,
  radius = 999,
  style,
  width = '100%',
}: SkeletonBlockProps): React.JSX.Element {
  const opacity = useSharedValue(0.58);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 820 }),
        withTiming(0.58, { duration: 820 }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        {
          borderRadius: radius,
          height,
          width,
        },
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.055)',
          'rgba(255,255,255,0.16)',
          'rgba(255,255,255,0.055)',
        ]}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    gap: 16,
    overflow: 'hidden',
    padding: 20,
  },
  rowStack: {
    gap: 12,
  },
  stack: {
    gap: 14,
  },
  titleLine: {
    marginTop: 2,
  },
});
