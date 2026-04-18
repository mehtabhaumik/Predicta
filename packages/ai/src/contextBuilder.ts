import { getChartConfig } from '@pridicta/astrology';
import type {
  AIContextPayload,
  ChartContext,
  KundliData,
} from '@pridicta/types';

export function buildAIContext(
  kundliData: KundliData,
  chartContext?: ChartContext,
): AIContextPayload {
  const selectedChart =
    chartContext?.chartType && kundliData.charts[chartContext.chartType]
      ? kundliData.charts[chartContext.chartType]
      : undefined;
  const chartConfig = chartContext?.chartType
    ? getChartConfig(chartContext.chartType)
    : undefined;

  return {
    activeContext: chartContext,
    ashtakavargaSummary: {
      strongestHouses: kundliData.ashtakavarga.strongestHouses,
      totalScore: kundliData.ashtakavarga.totalScore,
      weakestHouses: kundliData.ashtakavarga.weakestHouses,
    },
    birthSummary: `${kundliData.birthDetails.name}, born ${kundliData.birthDetails.date} at ${kundliData.birthDetails.time} in ${kundliData.birthDetails.place}`,
    calculationMeta: {
      ayanamsa: kundliData.calculationMeta.ayanamsa,
      calculatedAt: kundliData.calculationMeta.calculatedAt,
      houseSystem: kundliData.calculationMeta.houseSystem,
      nodeType: kundliData.calculationMeta.nodeType,
    },
    coreIdentity: {
      lagna: kundliData.lagna,
      moonSign: kundliData.moonSign,
      nakshatra: kundliData.nakshatra,
    },
    currentDasha: kundliData.dasha.current,
    keyPlanets: kundliData.planets.slice(0, 9),
    keyYogas: kundliData.yogas.slice(0, 5),
    selectedChart:
      selectedChart && chartConfig
        ? {
            ascendantSign: selectedChart.ascendantSign,
            chartType: chartConfig.id,
            name: chartConfig.name,
            purpose: chartConfig.purpose,
            relevantPlacements: selectedChart.housePlacements,
          }
        : undefined,
  };
}
