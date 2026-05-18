'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CHART_REGISTRY,
  getChartTypesForAccess,
} from '@pridicta/astrology';
import type { ChartType, SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { Card } from './Card';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { WebBhavChalitPanel } from './WebBhavChalitPanel';
import { WebAdvancedJyotishPanel } from './WebAdvancedJyotishPanel';
import { WebKundliChart } from './WebKundliChart';

export function WebChartsExplorer({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  const [selectedChart, setSelectedChart] = useState<ChartType>('D1');
  const { language } = useLanguagePreference();
  const copy = CHART_EXPLORER_COPY[language];
  const { activeKundli: kundli } = useWebKundliLibrary();
  const chartTypes = getChartTypesForAccess(hasPremiumAccess);
  const groupedCharts = useMemo(
    () => ({
      advanced: chartTypes.filter(chartType => getChartCategory(chartType) === 'advanced'),
      core: chartTypes.filter(chartType => getChartCategory(chartType) === 'core'),
    }),
    [chartTypes],
  );

  if (!kundli) {
    return (
      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">{copy.emptyEyebrow}</div>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
          <Link className="button" href="/dashboard/kundli">
            {copy.createKundli}
          </Link>
        </div>
      </Card>
    );
  }

  const chart = kundli.charts[selectedChart] ?? kundli.charts.D1;
  const selectedConfig = CHART_REGISTRY.find(item => item.id === selectedChart);

  return (
    <div className="chart-explorer">
      <WebActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Charts"
        title={copy.activeTitle}
      />
      <Card className="chart-detail-card glass-panel">
        <div className="card-content spacious">
          <div className="chart-picker-inline">
            <div>
              <div className="section-title">{copy.selectChart}</div>
              <h2>{chart.name}</h2>
            </div>
            <label className="chart-picker-select">
              <span>{copy.selectChart}</span>
              <select
                aria-label={copy.selectChart}
                onChange={event => setSelectedChart(event.target.value as ChartType)}
                value={selectedChart}
              >
                <optgroup label={copy.coreCharts}>
                  {groupedCharts.core.map(chartType => (
                    <option key={chartType} value={chartType}>
                      {formatChartOption(chartType)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={copy.advancedCharts}>
                  {groupedCharts.advanced.map(chartType => (
                    <option key={chartType} value={chartType}>
                      {formatChartOption(chartType)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
          </div>
          {selectedConfig ? (
            <div className="selected-chart-summary" aria-live="polite">
              <span>{selectedConfig.id}</span>
              <strong>{selectedConfig.name}</strong>
              <p>{selectedConfig.purpose}</p>
            </div>
          ) : null}
          <WebKundliChart
            birthDetails={kundli.birthDetails}
            chart={chart}
            hasPremiumAccess={hasPremiumAccess}
            kundliId={kundli.id}
            ownerName={kundli.birthDetails.name}
          />
        </div>
      </Card>

      <WebBhavChalitPanel
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
      />

      <WebAdvancedJyotishPanel
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
      />

      <details className="chart-guide-drawer">
        <summary>
          <span>{copy.chartGuide}</span>
          <strong>{copy.openGuide}</strong>
        </summary>
        <div className="chart-guide-grid">
          {chartTypes.map(chartType => {
            const config = CHART_REGISTRY.find(item => item.id === chartType);

            return (
              <article
                className={
                  selectedChart === chartType
                    ? 'chart-guide-item active'
                    : 'chart-guide-item'
                }
                key={chartType}
              >
                <span>{chartType}</span>
                <strong>{config?.name ?? chartType}</strong>
                <p>{config?.purpose}</p>
              </article>
            );
          })}
        </div>
      </details>
    </div>
  );
}

function getChartCategory(chartType: ChartType): 'advanced' | 'core' {
  return (
    CHART_REGISTRY.find(item => item.id === chartType)?.category === 'advanced'
      ? 'advanced'
      : 'core'
  );
}

function formatChartOption(chartType: ChartType): string {
  const config = CHART_REGISTRY.find(item => item.id === chartType);

  return config ? `${chartType} · ${config.name}` : chartType;
}

const CHART_EXPLORER_COPY: Record<
  SupportedLanguage,
  {
    activeTitle: string;
    advancedCharts: string;
    chartGuide: string;
    coreCharts: string;
    createKundli: string;
    emptyBody: string;
    emptyEyebrow: string;
    emptyTitle: string;
    openGuide: string;
    selectChart: string;
  }
> = {
  en: {
    activeTitle: 'Chart Kundli',
    advancedCharts: 'Advanced charts',
    chartGuide: 'What each chart is for',
    coreCharts: 'Core charts',
    createKundli: 'Create Kundli',
    emptyBody:
      'Create your Kundli first. Then this page will show your North Indian chart and explain each house in plain language.',
    emptyEyebrow: 'CHART NEEDS YOUR KUNDLI',
    emptyTitle: 'Create your Kundli to see real chart proof.',
    openGuide: 'Open guide',
    selectChart: 'SELECT CHART',
  },
  hi: {
    activeTitle: 'चार्ट कुंडली',
    advancedCharts: 'उन्नत चार्ट',
    chartGuide: 'कौन-सा चार्ट क्या दिखाता है',
    coreCharts: 'मुख्य चार्ट',
    createKundli: 'कुंडली बनाएं',
    emptyBody:
      'पहले अपनी कुंडली बनाएं. उसके बाद यह पेज आपका उत्तर भारतीय चार्ट दिखाएगा और हर भाव सरल भाषा में समझाएगा.',
    emptyEyebrow: 'चार्ट के लिए कुंडली चाहिए',
    emptyTitle: 'सही चार्ट प्रमाण देखने के लिए कुंडली बनाएं.',
    openGuide: 'गाइड खोलें',
    selectChart: 'चार्ट चुनें',
  },
  gu: {
    activeTitle: 'ચાર્ટ કુંડળી',
    advancedCharts: 'ઉન્નત ચાર્ટ્સ',
    chartGuide: 'કયો ચાર્ટ શું બતાવે છે',
    coreCharts: 'મુખ્ય ચાર્ટ્સ',
    createKundli: 'કુંડળી બનાવો',
    emptyBody:
      'પહેલા તમારી કુંડળી બનાવો. ત્યાર પછી આ પેજ તમારો ઉત્તર ભારતીય ચાર્ટ બતાવશે અને દરેક ભાવ સરળ ભાષામાં સમજાવશે.',
    emptyEyebrow: 'ચાર્ટ માટે કુંડળી જોઈએ',
    emptyTitle: 'સાચો ચાર્ટ પુરાવો જોવા માટે કુંડળી બનાવો.',
    openGuide: 'ગાઈડ ખોલો',
    selectChart: 'ચાર્ટ પસંદ કરો',
  },
};
