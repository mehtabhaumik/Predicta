import React from 'react';
import { StyleSheet, Text, type TextStyle, type TextProps } from 'react-native';

import { colors } from '../theme/colors';

type AppTextProps = TextProps & {
  tone?: 'primary' | 'secondary';
  variant?: 'display' | 'title' | 'subtitle' | 'body' | 'caption';
};

export function AppText({
  children,
  className = '',
  style,
  tone = 'primary',
  variant = 'body',
  ...props
}: AppTextProps): React.JSX.Element {
  return (
    <Text
      className={className}
      style={[
        styles.base,
        variantStyles[variant],
        tone === 'primary' ? styles.primary : styles.secondary,
        getUtilityFallbackStyle(className),
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

function getUtilityFallbackStyle(className: string): TextStyle | undefined {
  if (!className) {
    return undefined;
  }

  const fallbackStyle: TextStyle = {};

  if (className.includes('text-[#4DAFFF]')) {
    fallbackStyle.color = colors.success;
  }

  if (className.includes('text-center')) {
    fallbackStyle.textAlign = 'center';
  }

  if (className.includes('font-bold')) {
    fallbackStyle.fontWeight = '800';
  }

  if (className.includes('text-xl')) {
    fallbackStyle.fontSize = 20;
    fallbackStyle.lineHeight = 26;
  }

  if (className.includes('mt-1')) {
    fallbackStyle.marginTop = 4;
  } else if (className.includes('mt-2')) {
    fallbackStyle.marginTop = 8;
  } else if (className.includes('mt-3')) {
    fallbackStyle.marginTop = 12;
  } else if (className.includes('mt-4')) {
    fallbackStyle.marginTop = 16;
  }

  if (className.includes('mb-2')) {
    fallbackStyle.marginBottom = 8;
  }

  return Object.keys(fallbackStyle).length ? fallbackStyle : undefined;
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
  },
  primary: {
    color: colors.primaryText,
  },
  secondary: {
    color: colors.secondaryText,
  },
});

const variantStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    lineHeight: 19,
  },
  display: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
});
