import type { ChartType, SupportedLanguage } from '@pridicta/types';

export type VedicFocusChartRole = 'D1' | 'MOON' | 'D9' | 'D10' | 'CHALIT';

export const VEDIC_FOCUS_CHART_ORDER = [
  'D1',
  'MOON',
  'D9',
  'D10',
  'CHALIT',
] as const satisfies readonly VedicFocusChartRole[];

const FOCUS_CHART_LABELS: Record<
  VedicFocusChartRole,
  Record<SupportedLanguage, string>
> = {
  CHALIT: {
    en: 'Chalit',
    gu: 'Chalit',
    hi: 'Chalit',
  },
  D1: {
    en: 'D1 / Rashi',
    gu: 'D1 / Rashi',
    hi: 'D1 / Rashi',
  },
  D10: {
    en: 'D10 / Dashamsa',
    gu: 'D10 / Dashamsa',
    hi: 'D10 / Dashamsa',
  },
  D9: {
    en: 'D9 / Navamsa',
    gu: 'D9 / Navamsa',
    hi: 'D9 / Navamsa',
  },
  MOON: {
    en: 'Moon / Chandra Lagna',
    gu: 'Moon / Chandra Lagna',
    hi: 'Moon / Chandra Lagna',
  },
};

const FOCUS_CHART_SHORT_LABELS: Record<VedicFocusChartRole, string> = {
  CHALIT: 'Chalit',
  D1: 'D1',
  D10: 'D10',
  D9: 'D9',
  MOON: 'Moon',
};

export function getVedicFocusChartLabel(
  role: VedicFocusChartRole,
  language: SupportedLanguage = 'en',
): string {
  return FOCUS_CHART_LABELS[role][language] ?? FOCUS_CHART_LABELS[role].en;
}

export function getVedicFocusChartShortLabel(role: VedicFocusChartRole): string {
  return FOCUS_CHART_SHORT_LABELS[role];
}

export function isSelectableVargaFocusRole(
  role: VedicFocusChartRole,
): role is Extract<VedicFocusChartRole, ChartType> {
  return role === 'D1' || role === 'D9' || role === 'D10';
}
