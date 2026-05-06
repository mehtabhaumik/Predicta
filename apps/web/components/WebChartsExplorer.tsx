'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CHART_REGISTRY } from '@pridicta/astrology';
import type { ChartType, KundliData } from '@pridicta/types';
import { loadWebKundli } from '../lib/web-kundli-storage';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { WebKundliChart } from './WebKundliChart';

const primaryCharts: ChartType[] = ['D1', 'D9', 'D10'];

export function WebChartsExplorer(): React.JSX.Element {
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [selectedChart, setSelectedChart] = useState<ChartType>('D1');

  useEffect(() => {
    setKundli(loadWebKundli());
  }, []);

  if (!kundli) {
    return (
      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">CHART NEEDS YOUR KUNDLI</div>
          <h2>No confusing sample chart here.</h2>
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

  const chart = kundli.charts[selectedChart];

  return (
    <div className="chart-explorer">
      <div className="chart-list">
        {primaryCharts.map(chartType => {
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
      <Card className="chart-detail-card">
        <div className="card-content spacious">
          <StatusPill label={`${kundli.birthDetails.name}'s chart`} tone="premium" />
          <WebKundliChart chart={chart} />
        </div>
      </Card>
    </div>
  );
}
