import React from 'react';
import { Text, type TextProps } from 'react-native';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type { SupportedLanguage } from '@pridicta/types';
import { useAppStore } from '../store/useAppStore';

type AppTextProps = TextProps & {
  autoTranslate?: boolean;
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
  autoTranslate = true,
  children,
  className = '',
  tone = 'primary',
  variant = 'body',
  ...props
}: AppTextProps): React.JSX.Element {
  const language = useAppStore(state => state.languagePreference.language);
  const toneClassName =
    tone === 'primary' ? 'text-text-primary' : 'text-text-secondary';
  const translatedChildren = autoTranslate
    ? translateChildren(children, language)
    : children;

  return (
    <Text
      className={`${variantClassName[variant]} ${toneClassName} ${className}`}
      {...props}
    >
      {translatedChildren}
    </Text>
  );
}

function translateChildren(
  children: React.ReactNode,
  language: SupportedLanguage,
): React.ReactNode {
  if (language === 'en') {
    return children;
  }

  if (typeof children === 'string') {
    return translateUiText(children, language);
  }

  if (Array.isArray(children)) {
    return children.map(child =>
      typeof child === 'string' ? translateUiText(child, language) : child,
    );
  }

  return children;
}
