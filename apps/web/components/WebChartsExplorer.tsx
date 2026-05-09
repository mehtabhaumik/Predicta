'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CHART_REGISTRY,
  getChartTypesForAccess,
} from '@pridicta/astrology';
import type { ChartType } from '@pridicta/types';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { Card } from './Card';
import { WebBhavChalitPanel } from './WebBhavChalitPanel';
import { WebAdvancedJyotishPanel } from './WebAdvancedJyotishPanel';
import { WebKundliChart } from './WebKundliChart';

export function WebChartsExplorer({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  const [selectedChart, setSelectedChart] = useState<ChartType>('D1');
  const { activeKundli: kundli } = useWebKundliLibrary();
  const chartTypes = getChartTypesForAccess(hasPremiumAccess);

  if (!kundli) {
    return (
      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">CHART NEEDS YOUR KUNDLI</div>
          <h2>No confusing fake chart here.</h2>
          <p>
            Create your Kundli first. Then this page will show your North
            Indian chart and explain each house in plain language.
          </p>
          <Link className="button" href="/dashboard/kundli">
            Create Kundli
          </Link>
        </div>
      </Card>
    );
  }

  const chart = kundli.charts[selectedChart] ?? kundli.charts.D1;

  return (
    <div className="chart-explorer">
      <Card className="chart-detail-card glass-panel">
        <div className="card-content spacious">
          <div className="chart-picker-inline">
            <div>
              <div className="section-title">SELECT CHART</div>
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
                  Open Chart
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
