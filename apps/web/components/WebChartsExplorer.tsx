'use client';

import { getNativeCopy } from '@pridicta/config';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CHART_REGISTRY,
  composeChartInsight,
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
  const selectedCategory = getChartCategory(selectedChart);
  const selectedInsight = composeChartInsight({
    chart,
    hasPremiumAccess,
    kundli,
  });

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
              <div className="section-title">{copy.activeChart}</div>
              <h2>{chart.name}</h2>
            </div>
            <label className="chart-picker-select">
              <span>{copy.chooseChart}</span>
              <select
                aria-label={copy.chooseChart}
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
              <div className="selected-chart-summary-meta">
                <span>{copy.whyItMatters}</span>
                <em>
                  {selectedCategory === 'advanced'
                    ? copy.advancedLibrary
                    : copy.coreLibrary}
                </em>
              </div>
              <strong>{selectedConfig.name}</strong>
              <p>{selectedInsight.whatItSays}</p>
              <div className="selected-chart-insight-grid">
                <span>
                  <em>{copy.mainStrength}</em>
                  {selectedInsight.mainStrength}
                </span>
                <span>
                  <em>{copy.mainChallenge}</em>
                  {selectedInsight.mainChallenge}
                </span>
                <span>
                  <em>{copy.currentGuidance}</em>
                  {selectedInsight.currentGuidance}
                </span>
              </div>
              <small>
                {selectedCategory === 'advanced'
                  ? copy.advancedChartHint
                  : copy.defaultInsightView}
              </small>
            </div>
          ) : null}
          <WebKundliChart
            birthDetails={kundli.birthDetails}
            chart={chart}
            hasPremiumAccess={hasPremiumAccess}
            kundliId={kundli.id}
            kundli={kundli}
            ownerName={kundli.birthDetails.name}
            presentation="charts"
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
    activeChart: string;
    activeTitle: string;
    advancedCharts: string;
    advancedChartHint: string;
    advancedLibrary: string;
    chartGuide: string;
    chooseChart: string;
    coreLibrary: string;
    coreCharts: string;
    createKundli: string;
    currentGuidance: string;
    emptyBody: string;
    emptyEyebrow: string;
    emptyTitle: string;
    defaultInsightView: string;
    mainChallenge: string;
    mainStrength: string;
    openGuide: string;
    selectChart: string;
    whyItMatters: string;
  }
> = {
  en: {
    activeChart: 'ACTIVE CHART',
    activeTitle: 'Chart Kundli',
    advancedChartHint:
      'Advanced charts stay meaning-first, but always read them through D1 and use Technical View for the evidence layer.',
    advancedCharts: 'Advanced charts',
    advancedLibrary: 'Advanced chart library',
    chartGuide: 'What each chart is for',
    chooseChart: 'Choose chart',
    coreLibrary: 'Core chart library',
    coreCharts: 'Core charts',
    createKundli: 'Create Kundli',
    currentGuidance: 'Current guidance',
    defaultInsightView:
      'Every chart now opens in Insight View first, so you see meaning before technical detail.',
    emptyBody:
      'Create your Kundli first. Then this page will show your North Indian chart and explain each house in plain language.',
    emptyEyebrow: 'CHART NEEDS YOUR KUNDLI',
    emptyTitle: 'Create your Kundli to see real chart proof.',
    mainChallenge: 'Main challenge',
    mainStrength: 'Main strength',
    openGuide: 'Open guide',
    selectChart: 'SELECT CHART',
    whyItMatters: 'WHY THIS CHART MATTERS',
  },
  hi: {
    activeChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.38f152e355"),
    activeTitle: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.7d9c703582"),
    advancedChartHint:
      getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.1a1204a845"),
    advancedCharts: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.4091b58389"),
    advancedLibrary: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.7d0f28c79c"),
    chartGuide: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.5aba1648b9"),
    chooseChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.063c748eab"),
    coreLibrary: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.3f456bda41"),
    coreCharts: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.d53c86ffa7"),
    createKundli: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.7cacfebde9"),
    currentGuidance: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.b501db236d"),
    defaultInsightView:
      getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.23ec4a4ae0"),
    emptyBody:
      getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.18b03cd483"),
    emptyEyebrow: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.845d2668e2"),
    emptyTitle: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.eb0aef11a6"),
    mainChallenge: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.e5589ed86a"),
    mainStrength: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.f81259160d"),
    openGuide: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.181f8ba049"),
    selectChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.063c748eab"),
    whyItMatters: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.f217e49e3c"),
  },
  gu: {
    activeChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.5beb8c828a"),
    activeTitle: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.a6985181e4"),
    advancedChartHint:
      getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.ac6886211d"),
    advancedCharts: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.51db0be2b5"),
    advancedLibrary: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.c7a6b07df2"),
    chartGuide: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.5ac3479f3b"),
    chooseChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.33bb40198a"),
    coreLibrary: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.d11fb7a307"),
    coreCharts: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.c3f18bb1f5"),
    createKundli: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.c0e4dc5abd"),
    currentGuidance: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.8f168e102d"),
    defaultInsightView:
      getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.dc29081647"),
    emptyBody:
      getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.59f8ba512e"),
    emptyEyebrow: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.5fedbbe5ce"),
    emptyTitle: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.110d92d453"),
    mainChallenge: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.b7dc7f2bdb"),
    mainStrength: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.66e9b3720a"),
    openGuide: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.87e083f018"),
    selectChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.33bb40198a"),
    whyItMatters: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.f2e417dd98"),
  },
};
