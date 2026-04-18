export const colors = {
  background: '#0A0A0F',
  card: '#12121A',
  cardElevated: '#161622',
  gradient: ['#7B61FF', '#4DAFFF', '#FF4DA6'],
  gradientMuted: [
    'rgba(123, 97, 255, 0.24)',
    'rgba(77, 175, 255, 0.16)',
    'rgba(255, 77, 166, 0.18)',
  ],
  primaryText: '#FFFFFF',
  secondaryText: '#A0A0B2',
  border: '#252533',
  borderGlow: 'rgba(123, 97, 255, 0.44)',
  bubbleUser: '#20202A',
  surfaceMuted: '#191923',
  success: '#4DAFFF',
  warning: '#FFB84D',
  danger: '#FF4DA6',
};

export type AppColor = keyof typeof colors;
