export const brandColors = {
  background: '#0A0A0F',
  border: '#252533',
  card: '#12121A',
  cardElevated: '#161622',
  cardMuted: '#191923',
  primaryText: '#FFFFFF',
  secondaryText: '#A0A0B2',
  danger: '#FF4DA6',
  gold: '#FFC34D',
  success: '#4DAFFF',
  warning: '#FFB84D',
} as const;

export const brandGradient = ['#7B61FF', '#4DAFFF', '#FF4DA6'] as const;

export const semanticColors = {
  accentBlue: '#4DAFFF',
  accentCyan: '#53E0D2',
  accentGold: '#FFC34D',
  accentGreen: '#54E6A3',
  accentMagenta: '#FF4DA6',
  accentPurple: '#7B61FF',
  base: brandColors.background,
  baseRaised: brandColors.card,
  blue: '#4DAFFF',
  border: 'rgba(255, 255, 255, 0.12)',
  borderQuiet: 'rgba(255, 255, 255, 0.075)',
  danger: brandColors.danger,
  disabled: 'rgba(160, 160, 178, 0.42)',
  glass: 'rgba(18, 18, 26, 0.66)',
  glassStrong: 'rgba(24, 24, 34, 0.78)',
  gold: brandColors.gold,
  green: '#54E6A3',
  ink: brandColors.primaryText,
  magenta: brandColors.danger,
  muted: brandColors.secondaryText,
  porcelain: '#F6F5F0',
  raised: brandColors.cardElevated,
  success: brandColors.success,
  warning: brandColors.warning,
} as const;

export const radii = {
  button: 8,
  chip: 999,
  card: 16,
  chart: 20,
  input: 14,
  modal: 28,
  panel: 20,
  reportPlate: 24,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  cardPadding: 24,
  compactGap: 8,
  pageGutter: 24,
  pageGutterMobile: 16,
  rowGap: 16,
  section: 64,
  sectionGap: 64,
  sectionLarge: 96,
  touch: 44,
  touchSpacing: 44,
} as const;

export const glow = {
  ambient: '0 0 80px rgba(123, 97, 255, 0.24)',
  border: '0 0 28px rgba(77, 175, 255, 0.22)',
  button: '0 18px 40px rgba(123, 97, 255, 0.28)',
} as const;

export const glass = {
  background: semanticColors.glass,
  border: semanticColors.border,
  highlight: 'rgba(255, 255, 255, 0.18)',
  blur: '24px',
  shadow: '0 24px 80px rgba(0, 0, 0, 0.34)',
} as const;

export const layout = {
  contentMaxWidth: 1180,
  dashboardMaxWidth: 1280,
  narrowContentMaxWidth: 920,
  ultrawideMaxWidth: 1440,
  pageGutter: 24,
  pageGutterMobile: 16,
  sectionGap: 120,
  sectionGapMobile: 72,
} as const;

export const typography = {
  body: {
    fontSize: 16,
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.72,
  },
  button: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '0.02em',
    lineHeight: 1.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    lineHeight: 1.35,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  display: {
    fontSize: 64,
    fontWeight: 850,
    letterSpacing: '-0.055em',
    lineHeight: 0.94,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.08em',
    lineHeight: 1.2,
  },
  metadata: {
    fontSize: 11,
    fontWeight: 750,
    letterSpacing: '0.08em',
    lineHeight: 1.35,
  },
  pageTitle: {
    fontSize: 48,
    fontWeight: 850,
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  pill: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.04em',
    lineHeight: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 820,
    letterSpacing: '-0.025em',
    lineHeight: 1.1,
  },
  table: {
    fontSize: 13,
    fontWeight: 650,
    letterSpacing: '0em',
    lineHeight: 1.45,
  },
} as const;

export const motion = {
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  ambientMs: 1200,
  instantMs: 80,
  fastMs: 160,
  normalMs: 280,
  revealMs: 520,
  scanMs: 1600,
  slowMs: 520,
  standardMs: 280,
} as const;

export const elevation = {
  base: '0 18px 54px rgba(0, 0, 0, 0.24)',
  floating: '0 28px 90px rgba(0, 0, 0, 0.42)',
  modal: '0 36px 120px rgba(0, 0, 0, 0.56)',
  raised: '0 24px 80px rgba(0, 0, 0, 0.34)',
  toast: '0 18px 54px rgba(77, 175, 255, 0.18)',
} as const;

export const zIndex = {
  base: 0,
  raised: 1,
  sticky: 20,
  overlay: 40,
  modal: 60,
  toast: 80,
  critical: 100,
} as const;

export const breakpoints = {
  mobile320: 320,
  mobile360: 360,
  mobile390: 390,
  mobile430: 430,
  landscape568: 568,
  tablet768: 768,
  tablet834: 834,
  laptop1024: 1024,
  desktop1280: 1280,
  desktop1440: 1440,
  ultrawide1728: 1728,
} as const;

export const primitiveClasses = {
  actionRow: 'predicta-action-row',
  card: 'predicta-card',
  emptyState: 'predicta-empty-state',
  form: 'predicta-form',
  loadingState: 'predicta-loading-state',
  modal: 'predicta-modal',
  pageShell: 'predicta-page-shell',
  sectionStack: 'predicta-section-stack',
  stickyCta: 'predicta-sticky-cta',
  table: 'predicta-table',
  tabs: 'predicta-tabs',
} as const;

export const routeSpecificCssExceptionAllowlist = [
  'kundli-chart',
  'signature',
  'report',
  'dashboard-shell',
  'landing-intro',
] as const;

export const cssCustomProperties = {
  '--predicta-bg': semanticColors.base,
  '--predicta-border': semanticColors.border,
  '--predicta-color-blue': semanticColors.accentBlue,
  '--predicta-color-cyan': semanticColors.accentCyan,
  '--predicta-color-gold': semanticColors.accentGold,
  '--predicta-color-magenta': semanticColors.accentMagenta,
  '--predicta-color-purple': semanticColors.accentPurple,
  '--predicta-glass': semanticColors.glass,
  '--predicta-glass-strong': semanticColors.glassStrong,
  '--predicta-max-content': `${layout.contentMaxWidth}px`,
  '--predicta-max-dashboard': `${layout.dashboardMaxWidth}px`,
  '--predicta-muted': semanticColors.muted,
  '--predicta-panel': semanticColors.baseRaised,
  '--predicta-radius-card': `${radii.card}px`,
  '--predicta-radius-chip': `${radii.chip}px`,
  '--predicta-radius-panel': `${radii.panel}px`,
  '--predicta-shadow-soft': elevation.raised,
  '--predicta-text': semanticColors.ink,
} as const;

export const nativeThemeTokens = {
  background: semanticColors.base,
  border: brandColors.border,
  borderGlow: 'rgba(123, 97, 255, 0.44)',
  bubbleUser: '#20202A',
  card: semanticColors.baseRaised,
  cardElevated: semanticColors.raised,
  danger: semanticColors.danger,
  gradient: brandGradient,
  gradientMuted: [
    'rgba(123, 97, 255, 0.24)',
    'rgba(77, 175, 255, 0.16)',
    'rgba(255, 77, 166, 0.18)',
  ],
  muted: semanticColors.muted,
  primaryText: semanticColors.ink,
  success: semanticColors.success,
  surfaceMuted: brandColors.cardMuted,
  warning: semanticColors.warning,
} as const;

export const pdfThemeTokens = {
  cover: {
    background: '#07101F',
    blueGlow: semanticColors.blue,
    greenGlow: semanticColors.green,
    magentaGlow: semanticColors.magenta,
  },
  interior: {
    background: semanticColors.porcelain,
    border: '#D9D1BF',
    ink: '#151925',
    muted: '#5B6677',
    panel: '#FDFCF8',
  },
} as const;

export const predictaDesignTokens = {
  breakpoints,
  colors: semanticColors,
  cssCustomProperties,
  elevation,
  glass,
  glow,
  layout,
  motion,
  nativeThemeTokens,
  pdfThemeTokens,
  primitiveClasses,
  radii,
  routeSpecificCssExceptionAllowlist,
  spacing,
  typography,
  zIndex,
} as const;

export type PredictaDesignTokens = typeof predictaDesignTokens;
export type PredictaPrimitiveClass = keyof typeof primitiveClasses;
