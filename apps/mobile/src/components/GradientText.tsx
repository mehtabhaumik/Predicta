import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';

type GradientTextProps = TextProps & {
  variant?: 'display' | 'title' | 'subtitle';
};

const variantStyle = StyleSheet.create({
  display: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
});

export function GradientText({
  children,
  style,
  variant = 'title',
  ...props
}: GradientTextProps): React.JSX.Element {
  const textStyle = [variantStyle[variant], style];

  return (
    <MaskedView
      maskElement={
        <Text {...props} style={textStyle}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors.gradient}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
      >
        <Text {...props} style={[textStyle, styles.hiddenText]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  hiddenText: {
    opacity: 0,
  },
});
