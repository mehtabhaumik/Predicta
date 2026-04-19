import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';

type GradientButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
};

export function GradientButton({
  disabled,
  label,
  loading = false,
  ...props
}: GradientButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={isDisabled ? styles.disabled : undefined}
      {...props}
    >
      <LinearGradient
        colors={colors.gradient}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 21,
    textAlign: 'center',
  },
});
