'use client';

import {
  type CSSProperties,
  useMemo,
  useState,
} from 'react';
import {
  SUPPORTED_LANGUAGE_OPTIONS,
  getLanguageLabels,
  type LanguageOption,
} from '@pridicta/config/language';
import {
  buildChartRenderModel,
  buildChartSelectionPrompt,
  composeChartInsight,
  getChartFocusLabel,
  getChartReadingNote,
  getChartRole,
  getSpecialPointMeaning,
  isSpecialPoint,
  NORTH_INDIAN_CHART_LINE_PATHS,
  NORTH_INDIAN_HOUSE_POLYGONS,
  shouldUseStandardHouseMeaning,
  type ChartRenderLegendItem,
  type ChartRenderSchool,
  type MoonNakshatraPadaInsight,
} from '@pridicta/astrology';
import type {
  BirthDetails,
  ChartData,
  ChartType,
  SupportedLanguage,
} from '@pridicta/types';
import Link from 'next/link';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { PlanetGlyph } from './PlanetGlyph';
import { StatusPill } from './StatusPill';

type WebKundliChartProps = {
  birthDetails?: BirthDetails;
  chart: ChartData;
  centerLabel?: string;
  chartRoleOverride?: string;
  hasPremiumAccess?: boolean;
  kundliId?: string;
  ownerName?: string;
  readingNoteOverride?: string;
  sectionTitle?: string;
  schoolOverride?: ChartRenderSchool;
};

export function WebKundliChart({
  birthDetails,
  chart,
  centerLabel,
  chartRoleOverride,
  hasPremiumAccess = false,
  kundliId,
  ownerName,
  readingNoteOverride,
  sectionTitle = 'NORTH INDIAN CHART',
  schoolOverride,
}: WebKundliChartProps): React.JSX.Element {
  const [selectedHouse, setSelectedHouse] = useState(1);
  const [hoveredHouse, setHoveredHouse] = useState<number | undefined>();
  const { appLanguage, chartLanguage, setChartLanguage } = useLanguagePreference();
  const labels = getChartLanguageCopy(appLanguage);
  const insight = useMemo(
    () => composeChartInsight({ chart, hasPremiumAccess }),
    [chart, hasPremiumAccess],
  );
  const renderModel = useMemo(
    () =>
      buildChartRenderModel({
        birthDetails,
        chart,
        language: chartLanguage,
        school: schoolOverride,
      }),
    [birthDetails, chart, chartLanguage, schoolOverride],
  );
  const cells = renderModel.cells;
  const activeCell = cells.find(cell => cell.house === selectedHouse) ?? cells[0];
  const activeHouseMeaning = getChartFocusLabel(chart.chartType, activeCell?.house);
  const chartRole = chartRoleOverride ?? getChartRole(chart.chartType);
  const readingNote = readingNoteOverride ?? getChartReadingNote(chart.chartType);
  const isD1 = shouldUseStandardHouseMeaning(chart.chartType);
  const activeSpecialPoints = activeCell?.planetPositions.filter(isSpecialPoint) ?? [];

  function selectHouse(house?: number) {
    if (!house) {
      return;
    }

    setSelectedHouse(house);
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
          <div className="section-title">{sectionTitle}</div>
          <h2>{renderModel.displayChartName}</h2>
          <p>
            Tap a house to understand that life area. Planet names, signs, and
            degrees stay inside their house.
          </p>
        </div>
        <ChartLanguageSelector
          activeLanguage={chartLanguage}
          labels={labels}
          onChange={setChartLanguage}
        />
      </div>

      <div
        className="north-chart"
        data-chart-school={renderModel.school.toLowerCase()}
        data-chart-theme={renderModel.theme}
        aria-label={`${renderModel.displayChartName} North Indian chart`}
        key={chart.chartType}
      >
        <NorthIndianChartLines />
        <svg
          aria-hidden
          className="north-house-state-map"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {cells.map(cell => (
            <polygon
              className={`north-house-state ${
                hoveredHouse === cell.house ? 'hovered' : ''
              } ${activeCell?.house === cell.house ? 'selected' : ''}`}
              key={`${cell.key}-state`}
              points={getNorthHousePolygonPoints(cell.house)}
            />
          ))}
        </svg>
        {cells.map(cell => (
          <button
            aria-label={cell.ariaLabel}
            aria-pressed={activeCell?.house === cell.house}
            className={`north-house north-house-${cell.house} ${
              activeCell?.house === cell.house ? 'selected' : ''
            }`}
            key={`${cell.key}-target`}
            onBlur={() => setHoveredHouse(undefined)}
            onClick={() => selectHouse(cell.house)}
            onFocus={() => setHoveredHouse(cell.house)}
            onMouseEnter={() => setHoveredHouse(cell.house)}
            onMouseLeave={() => setHoveredHouse(undefined)}
            type="button"
          >
            <span className="sr-only">{cell.ariaLabel}</span>
          </button>
        ))}
        {cells.map((cell, index) => (
          <div
            aria-hidden
            className={`north-house-label north-house-label-${cell.house} north-house-label-${cell.labelDensity} ${
              activeCell?.house === cell.house ? 'selected' : ''
            }`}
            data-planet-count={cell.renderPlanets.length}
            key={`${cell.key}-label`}
            style={{
              ['--chart-cell-index' as string]: index,
              ['--house-x' as string]: `${cell.x}%`,
              ['--house-y' as string]: `${cell.y}%`,
            } as CSSProperties}
          >
            <span className="north-house-meta">
              <span className="north-house-number">{cell.house}</span>
              <span className="north-sign-name">{cell.displaySign}</span>
              <span className="north-sign-symbol">
                {cell.signGlyph}
              </span>
              <span className="north-sign-number">{cell.signNumber}</span>
            </span>
            {cell.renderPlanets.length ? (
              <small className="north-planet-stack">
                {cell.renderPlanets.map(planet => (
                  <PlanetGlyph
                    key={planet.key}
                    moonPhase={renderModel.moonPhase}
                    planet={planet}
                    showDegree
                    showSign={false}
                    size={cell.renderPlanets.length >= 4 ? 'compact' : 'full'}
                  />
                ))}
              </small>
            ) : null}
          </div>
        ))}
        <div className="north-chart-center">
          <span>{chart.chartType}</span>
          <strong>{centerLabel ?? (chart.chartType === 'D1' ? 'Root chart' : 'D1 anchored')}</strong>
        </div>
      </div>

      <ChartLegend items={renderModel.legend} />
      <MoonNakshatraPadaStrip insight={renderModel.moonNakshatraPada} />

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
          key={`${chart.chartType}-${activeCell.house}`}
        >
          <div>
            <div className="section-title">DRILLDOWN</div>
            <h3>
              House {activeCell.house} · {activeCell.displaySign}
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
              <strong>{isD1 ? activeHouseMeaning : chartRole}</strong>
            </div>
            <div>
              <span>{isD1 ? 'Chart role' : 'Varga rule'}</span>
              <strong>{isD1 ? chartRole : 'Use its specific purpose, not D1 house meanings'}</strong>
            </div>
            <div>
              <span>Reading rule</span>
              <strong>
                {chart.chartType === 'D1'
                  ? 'Use as the root chart'
                  : `Read ${chart.chartType} with D1`}
              </strong>
            </div>
            {activeSpecialPoints.length ? (
              <div>
                <span>Subtle points</span>
                <strong>
                  {activeSpecialPoints
                    .map(point => `${point.name}: ${getSpecialPointMeaning(point)}`)
                    .join('; ')}
                </strong>
              </div>
            ) : null}
          </div>
          <div className="drilldown-actions">
            <StatusPill
              label={`House ${activeCell.house}`}
              tone="premium"
            />
            <Link
              className="button secondary"
              href={buildChartAskHref({
                chartName: chart.name,
                chartType: chart.chartType,
                house: activeCell.house,
                kundliId,
                purpose: insight.summary,
              })}
            >
              Ask Predicta
            </Link>
          </div>
          {activeCell.planets.length ? (
            <div className="planet-chip-row planet-chip-row-static" aria-label="Planets in selected house">
              {activeCell.renderPlanets.map(planet => (
                <span key={planet.key}>{planet.displayName}</span>
              ))}
            </div>
          ) : null}
          {!isD1 || readingNoteOverride ? (
            <p className="varga-reading-note">{readingNote}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChartLanguageSelector({
  activeLanguage,
  labels,
  onChange,
}: {
  activeLanguage: SupportedLanguage;
  labels: ChartLanguageCopy;
  onChange: (language: SupportedLanguage) => void;
}): React.JSX.Element {
  return (
    <div className="chart-language-selector" role="group" aria-label={labels.title}>
      <span>{labels.title}</span>
      <div>
        {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
          <button
            aria-pressed={option.code === activeLanguage}
            className={option.code === activeLanguage ? 'active' : ''}
            key={option.code}
            onClick={() => onChange(option.code)}
            type="button"
          >
            {getChartLanguageLabel(option, activeLanguage)}
          </button>
        ))}
      </div>
    </div>
  );
}

type ChartLanguageCopy = {
  title: string;
};

function getChartLanguageCopy(language: SupportedLanguage): ChartLanguageCopy {
  const common = getLanguageLabels(language);
  const titleByLanguage: Record<SupportedLanguage, string> = {
    en: 'Chart language',
    gu: 'ચાર્ટ ભાષા',
    hi: 'चार्ट भाषा',
  };

  return {
    title: titleByLanguage[language] ?? common.language,
  };
}

function getChartLanguageLabel(
  option: LanguageOption,
  activeLanguage: SupportedLanguage,
): string {
  return activeLanguage === 'en' ? option.englishName : option.nativeName;
}

function getNorthHousePolygonPoints(house?: number): string {
  return house
    ? (NORTH_INDIAN_HOUSE_POLYGONS[house] ?? [])
        .map(([x, y]) => `${x},${y}`)
        .join(' ')
    : '';
}

export function NorthIndianChartLines(): React.JSX.Element {
  return (
    <svg
      className="north-chart-lines"
      aria-hidden
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {NORTH_INDIAN_CHART_LINE_PATHS.map(path => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}

function MoonNakshatraPadaStrip({
  insight,
}: {
  insight?: MoonNakshatraPadaInsight;
}): React.JSX.Element | null {
  if (!insight) {
    return null;
  }

  return (
    <div className="moon-nakshatra-strip">
      <div>
        <span>Moon rhythm</span>
        <strong>{insight.moonPhaseLabel}</strong>
        <small>{insight.moonPhaseMeaning}</small>
      </div>
      <div>
        <span>Birth star</span>
        <strong>
          {insight.moonNakshatra}
          {insight.pada ? ` pada ${insight.pada}` : ''}
        </strong>
        {insight.padaMeaning ? <small>{insight.padaMeaning}</small> : null}
      </div>
    </div>
  );
}

export function ChartLegend({
  compact = false,
  items,
}: {
  compact?: boolean;
  items: ChartRenderLegendItem[];
}): React.JSX.Element | null {
  if (!items.length) {
    return null;
  }

  return (
    <div
      className={`chart-legend ${compact ? 'compact' : ''}`}
      aria-label="Chart legend"
    >
      {items.map(item => (
        <span className={`chart-legend-item ${item.tone}`} key={item.code}>
          <b>{item.code}</b>
          <span>{item.description}</span>
        </span>
      ))}
    </div>
  );
}

function buildChartAskHref({
  chartName,
  chartType,
  house,
  kundliId,
  purpose,
}: {
  chartName: string;
  chartType: ChartType;
  house?: number;
  kundliId?: string;
  purpose: string;
}): string {
  const context = {
    chartName,
    chartType,
    purpose,
    selectedHouse: house,
    sourceScreen: 'Charts',
  };
  return buildPredictaChatHref({
    chartName,
    chartType,
    kundliId,
    prompt: buildChartSelectionPrompt(context),
    purpose,
    selectedHouse: house,
    sourceScreen: 'Charts',
  });
}
