export const brandColors = {
  background: '#0A0A0F',
  border: '#252533',
  card: '#12121A',
  primaryText: '#FFFFFF',
  secondaryText: '#A0A0B2',
} as const;

export const brandGradient = ['#7B61FF', '#4DAFFF', '#FF4DA6'] as const;

export const radii = {
  button: 8,
  card: 16,
  panel: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const glow = {
  ambient: '0 0 80px rgba(123, 97, 255, 0.24)',
  border: '0 0 28px rgba(77, 175, 255, 0.22)',
  button: '0 18px 40px rgba(123, 97, 255, 0.28)',
} as const;

export const glass = {
  background: 'rgba(18, 18, 26, 0.66)',
  border: 'rgba(255, 255, 255, 0.12)',
  highlight: 'rgba(255, 255, 255, 0.18)',
  blur: '24px',
  shadow: '0 24px 80px rgba(0, 0, 0, 0.34)',
} as const;

export const layout = {
  contentMaxWidth: 1180,
  dashboardMaxWidth: 1280,
  sectionGap: 120,
  sectionGapMobile: 72,
} as const;

export const motion = {
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  fastMs: 160,
  normalMs: 280,
  slowMs: 520,
} as const;
