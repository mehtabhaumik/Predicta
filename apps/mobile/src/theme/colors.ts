import { nativeThemeTokens } from '@pridicta/ui-tokens';

export const colors = {
  background: nativeThemeTokens.background,
  card: nativeThemeTokens.card,
  cardElevated: nativeThemeTokens.cardElevated,
  gradient: [...nativeThemeTokens.gradient],
  gradientMuted: [...nativeThemeTokens.gradientMuted],
  primaryText: nativeThemeTokens.primaryText,
  secondaryText: nativeThemeTokens.muted,
  border: nativeThemeTokens.border,
  borderGlow: nativeThemeTokens.borderGlow,
  bubbleUser: nativeThemeTokens.bubbleUser,
  surfaceMuted: nativeThemeTokens.surfaceMuted,
  success: nativeThemeTokens.success,
  warning: nativeThemeTokens.warning,
  danger: nativeThemeTokens.danger,
};

export type AppColor = keyof typeof colors;
