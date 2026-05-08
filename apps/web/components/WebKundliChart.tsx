'use client';

import { type CSSProperties, useMemo, useState } from 'react';
import {
  buildChartSelectionPrompt,
  buildNorthIndianChartCells,
  composeChartInsight,
  findHouseCell,
  findPlanetCell,
  getPlanetAbbreviation,
} from '@pridicta/astrology';
import type { ChartData, ChartType } from '@pridicta/types';
import Link from 'next/link';
import { StatusPill } from './StatusPill';

type WebKundliChartProps = {
  chart: ChartData;
  hasPremiumAccess?: boolean;
  ownerName?: string;
};

export function WebKundliChart({
  chart,
  hasPremiumAccess = false,
  ownerName,
}: WebKundliChartProps): React.JSX.Element {
  const [selectedHouse, setSelectedHouse] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<string | undefined>();
  const insight = useMemo(
    () => composeChartInsight({ chart, hasPremiumAccess }),
    [chart, hasPremiumAccess],
  );
  const cells = useMemo(() => buildNorthIndianChartCells(chart), [chart]);
  const activeCell =
    findPlanetCell(cells, selectedPlanet) ??
    findHouseCell(cells, selectedHouse) ??
    cells[0];
  const activeHouseMeaning = getHouseMeaning(activeCell?.house);
  const chartRole = getChartRole(chart.chartType);

  function selectHouse(house?: number) {
    if (!house) {
      return;
    }

    setSelectedHouse(house);
    setSelectedPlanet(undefined);
  }

  function selectPlanet(house: number | undefined, planet: string) {
    if (house) {
      setSelectedHouse(house);
    }
    setSelectedPlanet(planet);
  }

  if (!chart.supported) {
    return (
      <div className="jyotish-chart-shell">
        {ownerName ? (
          <StatusPill label={`${ownerName}'s chart`} tone="quiet" />
        ) : null}
        <div className="unsupported-chart-state">
          <div className="section-title">{insight.eyebrow}</div>
          <h2>{insight.title}</h2>
          <p>{insight.summary}</p>
          <ul>
            {insight.bullets.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="jyotish-chart-shell">
      {ownerName ? (
        <StatusPill label={`${ownerName}'s chart`} tone="quiet" />
      ) : null}
      <div className="jyotish-chart-toolbar">
        <div>
          <div className="section-title">NORTH INDIAN CHART</div>
          <h2>{chart.name}</h2>
          <p>
            Tap a house to understand that life area. Planet shortcuts are shown
            inside the house.
          </p>
        </div>
      </div>

      <div
        className="north-chart"
        aria-label={`${chart.name} North Indian chart`}
        key={chart.chartType}
      >
        {cells.map((cell, index) => (
          <button
            className={`north-house ${
              activeCell?.house === cell.house ? 'selected' : ''
            }`}
            aria-pressed={activeCell?.house === cell.house}
            key={cell.key}
            onClick={() => selectHouse(cell.house)}
            style={{
              ['--chart-cell-index' as string]: index,
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
            } as CSSProperties}
            type="button"
          >
            <span>
              House {cell.house} · {cell.signShort}
            </span>
            <small>
              {cell.planets.length
                ? cell.planets.map(getPlanetAbbreviation).join(' ')
                : 'Empty'}
            </small>
          </button>
        ))}
        <div className="north-chart-center">
          <span>{chart.chartType}</span>
          <strong>{chart.chartType === 'D1' ? 'Root chart' : 'D1 anchor'}</strong>
        </div>
      </div>

      <div className="chart-insight-panel">
        <div>
          <div className="section-title">{insight.eyebrow}</div>
          <h3>{insight.title}</h3>
          <p>{insight.summary}</p>
        </div>
        <ul>
          {insight.bullets.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {insight.premiumNudge ? (
          <div className="chart-premium-nudge">
            <span>{insight.premiumNudge}</span>
            <Link className="button secondary" href="/pricing">
              See Premium
            </Link>
          </div>
        ) : null}
      </div>

      {activeCell ? (
        <div
          className="chart-drilldown"
          key={`${chart.chartType}-${activeCell.house}-${selectedPlanet ?? 'house'}`}
        >
          <div>
            <div className="section-title">DRILLDOWN</div>
            <h3>
              House {activeCell.house} · {activeCell.sign}
            </h3>
            <p>
              {activeCell.planets.length
                ? `Planets here: ${activeCell.planets.join(', ')}.`
                : 'No planets occupy this sign in the preview chart.'}
            </p>
          </div>
          <div className="chart-drilldown-grid">
            <div>
              <span>Life area</span>
              <strong>{activeHouseMeaning}</strong>
            </div>
            <div>
              <span>Chart role</span>
              <strong>{chartRole}</strong>
            </div>
            <div>
              <span>Reading rule</span>
              <strong>
                {chart.chartType === 'D1'
                  ? 'Use as the root chart'
                  : `Read ${chart.chartType} with D1`}
              </strong>
            </div>
          </div>
          <div className="drilldown-actions">
            <StatusPill
              label={selectedPlanet ? `Planet: ${selectedPlanet}` : `House ${activeCell.house}`}
              tone="premium"
            />
            <Link
              className="button secondary"
              href={buildChartAskHref({
                chartName: chart.name,
                chartType: chart.chartType,
                house: activeCell.house,
                planet: selectedPlanet,
                purpose: insight.summary,
              })}
            >
              Ask Predicta
            </Link>
          </div>
          {activeCell.planets.length ? (
            <div className="planet-chip-row">
              {activeCell.planets.map(planet => (
                <button
                  className={selectedPlanet === planet ? 'active' : ''}
                  key={planet}
                  onClick={() => selectPlanet(activeCell.house, planet)}
                  type="button"
                >
                  {getPlanetAbbreviation(planet)} {planet}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function buildChartAskHref({
  chartName,
  chartType,
  house,
  planet,
  purpose,
}: {
  chartName: string;
  chartType: ChartType;
  house?: number;
  planet?: string;
  purpose: string;
}): string {
  const context = {
    chartName,
    chartType,
    purpose,
    selectedHouse: house,
    selectedPlanet: planet,
    sourceScreen: 'Charts',
  };
  const params = new URLSearchParams({
    chartName,
    chartType,
    prompt: buildChartSelectionPrompt(context),
    purpose,
    sourceScreen: 'Charts',
  });

  if (house) {
    params.set('selectedHouse', String(house));
  }
  if (planet) {
    params.set('selectedPlanet', planet);
  }

  return `/dashboard/chat?${params.toString()}`;
}

function getHouseMeaning(house?: number): string {
  const meanings: Record<number, string> = {
    1: 'self, body, identity',
    2: 'money, speech, family values',
    3: 'effort, courage, siblings',
    4: 'home, mother, emotional base',
    5: 'children, learning, merit',
    6: 'work pressure, health discipline',
    7: 'marriage, partners, contracts',
    8: 'change, secrets, transformation',
    9: 'fortune, dharma, teachers',
    10: 'career, status, responsibility',
    11: 'gains, network, ambitions',
    12: 'sleep, expense, release',
  };

  return house ? meanings[house] ?? 'selected life area' : 'selected life area';
}

function getChartRole(chartType: ChartType): string {
  if (chartType === 'D1') {
    return 'main life chart';
  }
  if (chartType === 'D9') {
    return 'marriage and maturity lens';
  }
  if (chartType === 'D10') {
    return 'career confirmation lens';
  }
  if (chartType === 'D2') {
    return 'wealth handling lens';
  }
  if (chartType === 'D12') {
    return 'family and lineage lens';
  }

  return 'supporting divisional lens';
}
