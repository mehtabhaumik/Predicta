export const colors = {
  background: '#0A0A0F',
  card: '#12121A',
  cardElevated: '#161622',
  glass: 'rgba(18, 18, 26, 0.84)',
  glassStrong: 'rgba(24, 24, 34, 0.92)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',
  glassWash: 'rgba(255, 255, 255, 0.045)',
  gradient: ['#7B61FF', '#4DAFFF', '#FF4DA6'],
  gradientMuted: [
    'rgba(123, 97, 255, 0.24)',
    'rgba(77, 175, 255, 0.16)',
    'rgba(255, 77, 166, 0.18)',
  ],
  gradientSoft: [
    'rgba(123, 97, 255, 0.34)',
    'rgba(77, 175, 255, 0.22)',
    'rgba(255, 77, 166, 0.24)',
  ],
  primaryText: '#FFFFFF',
  secondaryText: '#A0A0B2',
  border: '#252533',
  borderSoft: 'rgba(255, 255, 255, 0.1)',
  borderGlow: 'rgba(123, 97, 255, 0.44)',
  bubbleUser: '#20202A',
  surfaceMuted: '#191923',
  success: '#4DAFFF',
  warning: '#FFB84D',
  danger: '#FF4DA6',
};

export type AppColor = keyof typeof colors;
