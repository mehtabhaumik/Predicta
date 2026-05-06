'use client';

import { useMemo, useState } from 'react';
import {
  buildNorthIndianChartCells,
  findHouseCell,
  findPlanetCell,
  getPlanetAbbreviation,
} from '@pridicta/astrology';
import type { ChartData } from '@pridicta/types';
import Link from 'next/link';
import { StatusPill } from './StatusPill';

type WebKundliChartProps = {
  chart: ChartData;
};

export function WebKundliChart({
  chart,
}: WebKundliChartProps): React.JSX.Element {
  const [selectedHouse, setSelectedHouse] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<string | undefined>();
  const cells = useMemo(() => buildNorthIndianChartCells(chart), [chart]);
  const activeCell =
    findPlanetCell(cells, selectedPlanet) ??
    findHouseCell(cells, selectedHouse) ??
    cells[0];

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

  return (
    <div className="jyotish-chart-shell">
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

      <div className="north-chart" aria-label={`${chart.name} North Indian chart`}>
        {cells.map(cell => (
          <button
            className={`north-house ${
              activeCell?.house === cell.house ? 'selected' : ''
            }`}
            key={cell.key}
            onClick={() => selectHouse(cell.house)}
            style={{
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
            }}
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
          <strong>North style</strong>
        </div>
      </div>

      {activeCell ? (
        <div className="chart-drilldown">
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
          <div className="drilldown-actions">
            <StatusPill
              label={selectedPlanet ? `Planet: ${selectedPlanet}` : `House ${activeCell.house}`}
              tone="premium"
            />
            <Link className="button secondary" href="/dashboard/chat">
              Ask From Selection
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
