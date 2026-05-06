import type { ChartType } from '@pridicta/types';
import { CHART_REGISTRY } from './chartRegistry';

export const ALL_VISIBLE_CHART_TYPES: ChartType[] = CHART_REGISTRY.map(
  chart => chart.id,
);

export const FEATURED_CHART_TYPES: ChartType[] = [
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
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
];

export function getChartTypesForAccess(
  _hasPremiumAccess: boolean,
): ChartType[] {
  return ALL_VISIBLE_CHART_TYPES;
}

export function getFeaturedChartTypesForAccess(
  _hasPremiumAccess: boolean,
): ChartType[] {
  return FEATURED_CHART_TYPES;
}

export function canAccessChartType(
  _chartType: ChartType,
  _hasPremiumAccess: boolean,
): boolean {
  return true;
}

export function getPremiumLockedChartTypes(): ChartType[] {
  return [];
}

export function getPremiumChartPreviewLabel(): string {
  return `${FEATURED_CHART_TYPES.filter(
    chartType => chartType !== 'D1',
  ).join(', ')} and the advanced varga vault`;
}
