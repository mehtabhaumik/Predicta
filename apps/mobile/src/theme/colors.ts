import { brandColors, brandGradient, semanticColors } from '@pridicta/ui-tokens';

export const colors = {
  background: brandColors.background,
  card: brandColors.card,
  cardElevated: brandColors.cardElevated,
  gradient: [...brandGradient],
  gradientMuted: [
    'rgba(123, 97, 255, 0.24)',
    'rgba(77, 175, 255, 0.16)',
    'rgba(255, 77, 166, 0.18)',
  ],
  primaryText: brandColors.primaryText,
  secondaryText: brandColors.secondaryText,
  border: brandColors.border,
  borderGlow: 'rgba(123, 97, 255, 0.44)',
  bubbleUser: '#20202A',
  surfaceMuted: brandColors.cardMuted,
  success: semanticColors.success,
  warning: semanticColors.warning,
  danger: semanticColors.danger,
};

export type AppColor = keyof typeof colors;
