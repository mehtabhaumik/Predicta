import type { ChartType } from '@pridicta/types';
import { CHART_REGISTRY } from './chartRegistry';

export const FREE_CHART_TYPES: ChartType[] = ['D1'];

export const PREMIUM_FEATURED_CHART_TYPES: ChartType[] = [
  'D1',
  'D2',
  'D9',
  'D10',
  'D12',
  'D20',
  'D60',
];

export const PREMIUM_CONTEXT_CHART_TYPES: ChartType[] = [
  'D1',
  'D2',
  'D7',
  'D9',
  'D10',
  'D12',
];

export function getChartTypesForAccess(
  hasPremiumAccess: boolean,
): ChartType[] {
  return hasPremiumAccess
    ? CHART_REGISTRY.map(chart => chart.id)
    : FREE_CHART_TYPES;
}

export function getFeaturedChartTypesForAccess(
  hasPremiumAccess: boolean,
): ChartType[] {
  return hasPremiumAccess ? PREMIUM_FEATURED_CHART_TYPES : FREE_CHART_TYPES;
}

export function canAccessChartType(
  chartType: ChartType,
  hasPremiumAccess: boolean,
): boolean {
  return hasPremiumAccess || FREE_CHART_TYPES.includes(chartType);
}

export function getPremiumLockedChartTypes(): ChartType[] {
  return CHART_REGISTRY.map(chart => chart.id).filter(
    chartType => !FREE_CHART_TYPES.includes(chartType),
  );
}

export function getPremiumChartPreviewLabel(): string {
  return `${PREMIUM_FEATURED_CHART_TYPES.filter(
    chartType => chartType !== 'D1',
  ).join(', ')} and the advanced varga vault`;
}
