import React from 'react';
import { Text, type TextProps } from 'react-native';

type AppTextProps = TextProps & {
  tone?: 'primary' | 'secondary';
  variant?: 'display' | 'title' | 'subtitle' | 'body' | 'caption';
};

const variantClassName: Record<NonNullable<AppTextProps['variant']>, string> = {
  display: 'text-4xl font-black leading-tight',
  title: 'text-2xl font-extrabold leading-tight',
  subtitle: 'text-lg font-bold leading-6',
  body: 'text-base leading-6',
  caption: 'text-sm leading-5',
};

export function AppText({
  children,
  className = '',
  tone = 'primary',
  variant = 'body',
  ...props
}: AppTextProps): React.JSX.Element {
  const toneClassName =
    tone === 'primary' ? 'text-text-primary' : 'text-text-secondary';

  return (
    <Text
      className={`${variantClassName[variant]} ${toneClassName} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
