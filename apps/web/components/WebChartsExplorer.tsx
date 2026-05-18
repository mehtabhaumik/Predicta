'use client';

import { useState } from 'react';
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
            <div className="chart-picker-row" aria-label="Chart selector">
              {chartTypes.map(chartType => (
                <button
                  className={selectedChart === chartType ? 'active' : ''}
                  key={chartType}
                  onClick={() => setSelectedChart(chartType)}
                  type="button"
                >
                  {chartType}
                </button>
              ))}
            </div>
          </div>
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

      <div className="chart-list">
        {chartTypes.map(chartType => {
          const config = CHART_REGISTRY.find(item => item.id === chartType);

          return (
            <Card
              className={selectedChart === chartType ? 'glass-panel active-tool-card' : 'glass-panel'}
              key={chartType}
            >
              <div className="card-content">
                <div className="section-title">{chartType}</div>
                <h2>{config?.name ?? chartType}</h2>
                <p>{config?.purpose}</p>
                <button
                  className="button secondary"
                  onClick={() => setSelectedChart(chartType)}
                  type="button"
                >
                  {copy.openChart}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const CHART_EXPLORER_COPY: Record<
  SupportedLanguage,
  {
    activeTitle: string;
    createKundli: string;
    emptyBody: string;
    emptyEyebrow: string;
    emptyTitle: string;
    openChart: string;
    selectChart: string;
  }
> = {
  en: {
    activeTitle: 'Chart Kundli',
    createKundli: 'Create Kundli',
    emptyBody:
      'Create your Kundli first. Then this page will show your North Indian chart and explain each house in plain language.',
    emptyEyebrow: 'CHART NEEDS YOUR KUNDLI',
    emptyTitle: 'Create your Kundli to see real chart proof.',
    openChart: 'Open Chart',
    selectChart: 'SELECT CHART',
  },
  hi: {
    activeTitle: 'चार्ट कुंडली',
    createKundli: 'कुंडली बनाएं',
    emptyBody:
      'पहले अपनी कुंडली बनाएं. उसके बाद यह पेज आपका उत्तर भारतीय चार्ट दिखाएगा और हर भाव सरल भाषा में समझाएगा.',
    emptyEyebrow: 'चार्ट के लिए कुंडली चाहिए',
    emptyTitle: 'सही चार्ट प्रमाण देखने के लिए कुंडली बनाएं.',
    openChart: 'चार्ट खोलें',
    selectChart: 'चार्ट चुनें',
  },
  gu: {
    activeTitle: 'ચાર્ટ કુંડળી',
    createKundli: 'કુંડળી બનાવો',
    emptyBody:
      'પહેલા તમારી કુંડળી બનાવો. ત્યાર પછી આ પેજ તમારો ઉત્તર ભારતીય ચાર્ટ બતાવશે અને દરેક ભાવ સરળ ભાષામાં સમજાવશે.',
    emptyEyebrow: 'ચાર્ટ માટે કુંડળી જોઈએ',
    emptyTitle: 'સાચો ચાર્ટ પુરાવો જોવા માટે કુંડળી બનાવો.',
    openChart: 'ચાર્ટ ખોલો',
    selectChart: 'ચાર્ટ પસંદ કરો',
  },
};
