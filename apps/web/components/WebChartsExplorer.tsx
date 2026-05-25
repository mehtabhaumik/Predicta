'use client';

import { getNativeCopy } from '@pridicta/config';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  buildParashariChalitChart,
  CHART_REGISTRY,
  composeChartInsight,
  composeVedicIntelligenceContract,
  getChartTypesForAccess,
  getVedicFocusChartLabel,
  getVedicFocusChartShortLabel,
  VEDIC_FOCUS_CHART_ORDER,
} from '@pridicta/astrology';
import type {
  ChartConfig,
  ChartData,
  ChartInsightProfile,
  ChartType,
  KundliData,
  SupportedLanguage,
  VedicIntelligenceContract,
} from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { Card } from './Card';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { WebBhavChalitPanel } from './WebBhavChalitPanel';
import { WebAdvancedJyotishPanel } from './WebAdvancedJyotishPanel';
import { WebKundliChart } from './WebKundliChart';

type ChartExplorerSelection = ChartType | 'MOON' | 'CHALIT';

export function WebChartsExplorer({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  const [selectedChart, setSelectedChart] = useState<ChartExplorerSelection>('D1');
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

  const intelligence = composeVedicIntelligenceContract({
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    kundli,
  });
  const selectedConfig = getChartConfigForSelection(selectedChart);
  const chart = resolveSelectedChart({
    intelligence,
    kundli,
    selectedChart,
    selectedConfig,
  });
  const selectedCategory = getChartCategoryForSelection(selectedChart);
  const selectedInsightProfile = getInsightProfileForSelection(selectedChart);
  const selectedInsight = composeChartInsight({
    chart,
    hasPremiumAccess,
    kundli,
    profile: selectedInsightProfile,
  });
  const focusOrderItems = VEDIC_FOCUS_CHART_ORDER.map((role, index) => ({
    active: selectedChart === role,
    available: getFocusChartAvailability(kundli, role),
    index,
    label: getVedicFocusChartLabel(role, language),
    role,
    shortLabel: getVedicFocusChartShortLabel(role),
  }));

  return (
    <div className="chart-explorer">
      <WebActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Charts"
        title={copy.activeTitle}
      />
      <Card className="glass-panel vedic-focus-order-card">
        <div className="card-content compact">
          <div className="section-title">Required Vedic focus order</div>
          <div
            aria-label="Required Vedic focus chart order: D1/Rashi, Moon/Chandra Lagna, D9/Navamsa, D10/Dashamsa, Chalit"
            className="vedic-focus-order-rail"
          >
            {focusOrderItems.map(item => (
              <button
                className={[
                  item.active ? 'active' : '',
                  item.available ? 'available' : 'pending',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={item.role}
                onClick={() => setSelectedChart(item.role)}
                type="button"
              >
                <span>{item.index + 1}</span>
                <strong>{item.shortLabel}</strong>
                <em>{item.label}</em>
              </button>
            ))}
          </div>
          <p className="vedic-focus-order-note">
            These are the focus charts. The full Varga library remains available below.
          </p>
        </div>
      </Card>
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
                onChange={event => setSelectedChart(event.target.value as ChartExplorerSelection)}
                value={selectedChart}
              >
                <optgroup label={copy.focusCharts}>
                  <option value="MOON">Moon · Chandra Lagna Chart</option>
                  <option value="CHALIT">Chalit · Bhav Chalit Chart</option>
                </optgroup>
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
          <WebKundliChart
            birthDetails={kundli.birthDetails}
            chart={chart}
            hasPremiumAccess={hasPremiumAccess}
            kundliId={kundli.id}
            kundli={kundli}
            insightProfile={selectedInsightProfile}
            ownerName={kundli.birthDetails.name}
            presentation="charts"
            centerLabel={
              selectedChart === 'MOON'
                ? 'Chandra Lagna'
                : selectedChart === 'CHALIT'
                  ? 'Bhav Chalit'
                  : undefined
            }
            sectionTitle={
              selectedChart === 'MOON'
                ? 'Moon / Chandra Lagna Chart'
                : selectedChart === 'CHALIT'
                  ? 'Chalit Chart'
                  : undefined
            }
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

function getFocusChartAvailability(
  kundli: KundliData,
  role: (typeof VEDIC_FOCUS_CHART_ORDER)[number],
): boolean {
  if (role === 'MOON') {
    return Boolean(kundli.moonSign);
  }

  if (role === 'CHALIT') {
    return Boolean(kundli.chalit?.status === 'ready' || kundli.bhavChalit?.status === 'ready');
  }

  return Boolean(kundli.charts[role]?.supported);
}

function getChartCategory(chartType: ChartType): 'advanced' | 'core' {
  return (
    CHART_REGISTRY.find(item => item.id === chartType)?.category === 'advanced'
      ? 'advanced'
      : 'core'
  );
}

function getChartConfig(chartType: ChartType): ChartConfig {
  const config = CHART_REGISTRY.find(item => item.id === chartType);

  if (!config) {
    throw new Error(`Unknown chart type ${chartType}`);
  }

  return config;
}

function getChartConfigForSelection(selection: ChartExplorerSelection): ChartConfig {
  if (selection === 'MOON') {
    return {
      category: 'core',
      id: 'D1',
      name: 'Moon Chart / Chandra Lagna Chart',
      purpose:
        'Mind, emotional rhythm, lived response patterns, and how the same Kundli feels from the Moon.',
    };
  }

  if (selection === 'CHALIT') {
    return {
      category: 'core',
      id: 'D1',
      name: 'Chalit Chart',
      purpose:
        'Real-life house delivery, bhava shifts, and where D1 promise actually lands in lived experience.',
    };
  }

  return getChartConfig(selection);
}

function getChartCategoryForSelection(
  selection: ChartExplorerSelection,
): 'advanced' | 'core' {
  if (selection === 'MOON' || selection === 'CHALIT') {
    return 'core';
  }

  return getChartCategory(selection);
}

function getInsightProfileForSelection(
  selection: ChartExplorerSelection,
): ChartInsightProfile {
  if (selection === 'MOON') {
    return 'moon';
  }

  if (selection === 'CHALIT') {
    return 'chalit';
  }

  return 'default';
}

function resolveSelectedChart({
  intelligence,
  kundli,
  selectedChart,
  selectedConfig,
}: {
  intelligence: VedicIntelligenceContract;
  kundli: KundliData;
  selectedChart: ChartExplorerSelection;
  selectedConfig: ChartConfig;
}): ChartData {
  if (selectedChart === 'MOON') {
    return (
      intelligence.moonChart.chart ??
      buildMissingSpecialChartPlaceholder(
        selectedConfig,
        kundli,
        'Moon chart needs a calculated Moon sign before it can be read safely.',
      )
    );
  }

  if (selectedChart === 'CHALIT') {
    return (
      buildParashariChalitChart(kundli) ??
      buildMissingSpecialChartPlaceholder(
        selectedConfig,
        kundli,
        'Chalit chart needs calculated bhava shifts before it can be read safely.',
      )
    );
  }

  return (
    kundli.charts[selectedChart] ??
    buildMissingChartPlaceholder(selectedChart, selectedConfig, kundli)
  );
}

function formatChartOption(chartType: ChartType): string {
  const config = CHART_REGISTRY.find(item => item.id === chartType);

  return config ? `${chartType} · ${config.name}` : chartType;
}

function buildMissingChartPlaceholder(
  chartType: ChartType,
  config: ChartConfig,
  kundli: KundliData,
): ChartData {
  const d1 = kundli.charts.D1;

  return {
    ascendantSign: d1?.ascendantSign ?? kundli.lagna ?? 'Aries',
    chartType,
    housePlacements: {},
    name: config.name,
    planetDistribution: [],
    signPlacements: {},
    supported: false,
    unsupportedReason:
      `${config.name} is selected, but this Kundli does not include calculated placements for it yet. ` +
      'Predicta will not fall back to D1 or show a repeated chart as if it were calculated.',
  };
}

function buildMissingSpecialChartPlaceholder(
  config: ChartConfig,
  kundli: KundliData,
  unsupportedReason: string,
): ChartData {
  const d1 = kundli.charts.D1;

  return {
    ascendantSign: d1?.ascendantSign ?? kundli.lagna ?? 'Aries',
    chartType: 'D1',
    housePlacements: {},
    name: config.name,
    planetDistribution: [],
    signPlacements: {},
    supported: false,
    unsupportedReason,
  };
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
    focusCharts: string;
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
    focusCharts: 'Focus charts',
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
    focusCharts: 'Focus charts',
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
    focusCharts: 'Focus charts',
    mainChallenge: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.b7dc7f2bdb"),
    mainStrength: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.66e9b3720a"),
    openGuide: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.87e083f018"),
    selectChart: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.33bb40198a"),
    whyItMatters: getNativeCopy("native.apps.web.components.WebChartsExplorer.tsx.f2e417dd98"),
  },
};
