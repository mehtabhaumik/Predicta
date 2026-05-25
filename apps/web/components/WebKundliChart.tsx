'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import {
  type CSSProperties,
  useId,
  useMemo,
  useState,
} from 'react';
import {
  SUPPORTED_LANGUAGE_OPTIONS,
  getLanguageLabels,
  type LanguageOption,
} from '@pridicta/config/language';
import { translateUiText } from '@pridicta/config/uiTranslations';
import {
  CHART_VIEW_HIERARCHY,
  buildChartRenderModel,
  buildChartSelectionPrompt,
  composeChartInsight,
  type ChartInsightProfile,
  type ChartPremiumInsight,
  type ChartRenderPresentation,
  getChartFocusLabel,
  getDefaultChartViewMode,
  getChartReadingNote,
  getChartRole,
  getSpecialPointMeaning,
  NORTH_INDIAN_CHART_LINE_PATHS,
  NORTH_INDIAN_HOUSE_POLYGONS,
  shouldUseStandardHouseMeaning,
  type ChartInsight,
  type ChartRenderLegendItem,
  type ChartRenderPlanet,
  type ChartRenderSchool,
  type MoonNakshatraPadaInsight,
} from '@pridicta/astrology';
import type {
  BirthDetails,
  ChartData,
  ChartType,
  KundliData,
  PlanetPosition,
  SupportedLanguage,
  ChartViewMode,
} from '@pridicta/types';
import Link from 'next/link';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  getKundliAnimationStyle,
  getKundliAnimationSurfaceProps,
  type KundliAnimationSurface,
} from '../lib/kundli-animation-contract';
import { getChartThemeNote } from '../lib/chart-theme-copy';
import { useLanguagePreference } from '../lib/language-preference';
import { PlanetGlyph } from './PlanetGlyph';
import { StatusPill } from './StatusPill';

type WebKundliChartProps = {
  animationSurface?: KundliAnimationSurface;
  birthDetails?: BirthDetails;
  chart: ChartData;
  centerLabel?: string;
  chartRoleOverride?: string;
  hasPremiumAccess?: boolean;
  kundliId?: string;
  kundli?: KundliData;
  ownerName?: string;
  presentation?: ChartRenderPresentation;
  readingNoteOverride?: string;
  sectionTitle?: string;
  schoolOverride?: ChartRenderSchool;
  insightProfile?: ChartInsightProfile;
};

export function WebKundliChart({
  animationSurface = 'standard',
  birthDetails,
  chart,
  centerLabel,
  chartRoleOverride,
  hasPremiumAccess = false,
  kundliId,
  kundli,
  ownerName,
  presentation = animationSurface === 'creation' ? 'creation' : 'main',
  readingNoteOverride,
  sectionTitle = 'NORTH INDIAN CHART',
  schoolOverride,
  insightProfile = 'default',
}: WebKundliChartProps): React.JSX.Element {
  const [selectedHouse, setSelectedHouse] = useState(1);
  const [hoveredHouse, setHoveredHouse] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<ChartViewMode>(getDefaultChartViewMode);
  const chartInstructionsId = useId();
  const { appLanguage, chartLanguage, setChartLanguage } = useLanguagePreference();
  const labels = getChartLanguageCopy(appLanguage);
  const insight = useMemo(
    () => composeChartInsight({ chart, hasPremiumAccess, kundli, profile: insightProfile }),
    [chart, hasPremiumAccess, kundli, insightProfile],
  );
  const renderModel = useMemo(
    () =>
      buildChartRenderModel({
        birthDetails,
        chart,
        language: chartLanguage,
        presentation,
        school: schoolOverride,
      }),
    [birthDetails, chart, chartLanguage, presentation, schoolOverride],
  );
  const cells = renderModel.cells;
  const localizedInsight = useMemo(
    () => localizeChartInsight(insight, chartLanguage),
    [insight, chartLanguage],
  );
  const chartThemeNote = useMemo(
    () =>
      getChartThemeNote({
        language: chartLanguage,
        theme: renderModel.theme,
        time: birthDetails?.time ?? kundli?.birthDetails.time,
      }),
    [birthDetails?.time, chartLanguage, kundli?.birthDetails.time, renderModel.theme],
  );
  const activeCell = cells.find(cell => cell.house === selectedHouse) ?? cells[0];
  const activeHouseMeaning = getChartFocusLabel(chart.chartType, activeCell?.house);
  const chartRole = chartRoleOverride ?? getChartRole(chart.chartType);
  const readingNote = readingNoteOverride ?? getChartReadingNote(chart.chartType);
  const isD1 = shouldUseStandardHouseMeaning(chart.chartType);
  const activeSupportingPoints = activeCell?.supportingPoints ?? [];
  const technicalLabels = getTechnicalViewLabels(chartLanguage);
  const technicalAnchorRule = formatTechnicalAnchorRule(chart.chartType, chartLanguage);
  const technicalHouseEvidence = activeCell
    ? formatTechnicalHouseEvidence(activeCell, chartLanguage)
    : '';
  const technicalConditionSummary = formatTechnicalConditionSummary(
    activeCell?.renderPlanets ?? [],
    chartLanguage,
  );

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
          <div className="section-title">{localizedInsight.eyebrow}</div>
          <h2>{localizedInsight.title}</h2>
          <p>{localizedInsight.whatItSays}</p>
          <ul>
            {localizedInsight.freeInsights.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {renderPremiumInsightPanel({
            appLanguage,
            hasPremiumAccess,
            insight: localizedInsight,
          })}
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
          <p id={chartInstructionsId}>
            {translateUiText(
              'Select a house to understand that life area. Keyboard users can tab through the houses and press Enter or Space to choose one.',
              appLanguage,
            )}
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
        data-chart-presentation={renderModel.presentation}
        data-chart-school={renderModel.school.toLowerCase()}
        data-chart-theme={renderModel.theme}
        {...getKundliAnimationSurfaceProps(animationSurface)}
        aria-label={`${renderModel.displayChartName} North Indian chart`}
        aria-describedby={chartInstructionsId}
        key={`${chart.chartType}-${animationSurface}`}
      >
        <NorthIndianChartLines surface={animationSurface} />
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
        <svg
          aria-label={translateUiText('House selection layer', appLanguage)}
          className="north-house-hit-layer"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {cells.map(cell => (
            <polygon
              aria-describedby={chartInstructionsId}
              aria-label={cell.ariaLabel}
              aria-pressed={activeCell?.house === cell.house}
              className={`north-house-target ${
                activeCell?.house === cell.house ? 'selected' : ''
              }`}
              key={`${cell.key}-target`}
              onBlur={() => setHoveredHouse(undefined)}
              onClick={() => selectHouse(cell.house)}
              onFocus={() => setHoveredHouse(cell.house)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectHouse(cell.house);
                }
              }}
              onMouseEnter={() => setHoveredHouse(cell.house)}
              onMouseLeave={() => setHoveredHouse(undefined)}
              points={getNorthHousePolygonPoints(cell.house)}
              role="button"
              tabIndex={0}
            />
          ))}
        </svg>
        {cells.map((cell, index) => {
          const visiblePlanets = cell.renderPlanets.slice(0, cell.maxVisiblePlanets);
          return (
          <div
            aria-hidden
            className={`north-house-label north-house-label-${cell.house} north-house-label-${cell.labelDensity} ${
              activeCell?.house === cell.house ? 'selected' : ''
            }`}
            data-density={cell.labelDensity}
            data-kundli-animation-part="signs"
            data-planet-count={cell.renderPlanets.length}
            key={`${cell.key}-label`}
            style={{
              ['--chart-cell-index' as string]: index,
              ...getKundliAnimationStyle(index, 'signs', animationSurface),
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
            {visiblePlanets.length ? (
              <small
                className="north-planet-stack"
                data-kundli-animation-part="planets"
              >
                {visiblePlanets.map((planet, planetIndex) => (
                  <PlanetGlyph
                    animationIndex={planetIndex}
                    animationSurface={animationSurface}
                    key={planet.key}
                    moonPhase={renderModel.moonPhase}
                    planet={planet}
                    showDegree={cell.showPlanetDegrees}
                    showSign={cell.showPlanetSign}
                    showStatusMarks={cell.showPlanetStatusMarks}
                    size={cell.planetGlyphSize}
                  />
                ))}
                {cell.hiddenPlanetCount ? (
                  <span className="chart-overflow-counter">+{cell.hiddenPlanetCount}</span>
                ) : null}
              </small>
            ) : null}
          </div>
          );
        })}
        <div className="north-chart-center">
          <span>{chart.chartType}</span>
          <strong>
            {centerLabel ??
              translateUiText(
                chart.chartType === 'D1' ? 'Root chart' : 'D1 anchored',
                chartLanguage,
              )}
          </strong>
        </div>
      </div>

      <ChartLegend
        animationSurface={animationSurface}
        items={renderModel.legend}
        language={appLanguage}
      />
      <div className="chart-theme-note" data-chart-theme={renderModel.theme}>
        <span>{chartThemeNote.eyebrow}</span>
        <strong>{chartThemeNote.title}</strong>
        <p>{chartThemeNote.body}</p>
      </div>
      <MoonNakshatraPadaStrip
        insight={renderModel.moonNakshatraPada}
        language={chartLanguage}
      />

      <div className="chart-view-switcher" role="tablist" aria-label={translateUiText('Chart reading mode', appLanguage)}>
        {CHART_VIEW_HIERARCHY.map(item => (
          <button
            aria-selected={viewMode === item.id}
            className={viewMode === item.id ? 'active' : ''}
            key={item.id}
            onClick={() => setViewMode(item.id)}
            role="tab"
            title={translateUiText(item.description, appLanguage)}
            type="button"
          >
            {translateUiText(item.label, appLanguage)}
          </button>
        ))}
      </div>

      {viewMode === 'insight' ? (
        <div className="chart-insight-stack">
          <div className="chart-primary-insight">
            <div>
              <div className="section-title">
                {translateUiText('What This Chart Is Saying', appLanguage)}
              </div>
              <div className="chart-insight-eyebrow">{localizedInsight.eyebrow}</div>
              <div className="chart-insight-focus">
                {translateUiText(
                  insightProfile === 'chalit'
                    ? 'Chalit focus: lived house delivery and practical correction.'
                    : insightProfile === 'kp'
                      ? 'KP focus: event promise, decision point, timing readiness, and proof path.'
                      : insightProfile === 'nadi'
                        ? 'Nadi focus: planetary story pattern, validation, activation, and conscious shift.'
                    : chart.chartType === 'D1'
                      ? 'D1 focus: life pattern, main weight, open opportunity, and maturity pressure.'
                      : `Varga focus: ${localizedInsight.governs}`,
                  appLanguage,
                )}
              </div>
              <h3>{localizedInsight.title}</h3>
              <p>{localizedInsight.whatItSays}</p>
            </div>
            <div className="chart-insight-grid">
              <article className="chart-insight-block">
                <span>{translateUiText('What this chart governs', appLanguage)}</span>
                <strong>{localizedInsight.governs}</strong>
              </article>
              <article className="chart-insight-block">
                <span>{translateUiText('Main strength', appLanguage)}</span>
                <strong>{localizedInsight.mainStrength}</strong>
              </article>
              <article className="chart-insight-block">
                <span>{translateUiText('Main challenge', appLanguage)}</span>
                <strong>{localizedInsight.mainChallenge}</strong>
              </article>
              <article className="chart-insight-block">
                <span>{translateUiText('Current guidance', appLanguage)}</span>
                <strong>{localizedInsight.currentGuidance}</strong>
              </article>
            </div>
          </div>

          <div className="chart-insight-panel">
            <div>
              <div className="section-title">
                {translateUiText('Life areas affected', appLanguage)}
              </div>
              <div className="chart-life-area-list">
                {localizedInsight.lifeAreas.map(area => (
                  <span key={area}>{area}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="section-title">
                {translateUiText('Free actionable reading', appLanguage)}
              </div>
              <ul>
                {localizedInsight.freeInsights.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="chart-insight-cta-row">
              <Link
                className="button secondary"
                href={buildChartAskHref({
                  chartName: chart.name,
                  chartType: chart.chartType,
                  house: activeCell?.house,
                  kundliId,
                  purpose: localizedInsight.whatItSays,
                })}
              >
                {translateUiText('Ask Predicta about this chart', appLanguage)}
              </Link>
              <span>
                {translateUiText(
                  'Switch to Technical View when you want the house-by-house proof layer.',
                  appLanguage,
                )}
              </span>
            </div>
            {renderPremiumInsightPanel({
              appLanguage,
              hasPremiumAccess,
              insight: localizedInsight,
            })}
          </div>
        </div>
      ) : activeCell ? (
        <div
          aria-live="polite"
          className="chart-technical-stack"
          key={`${chart.chartType}-${activeCell.house}`}
        >
          <div className="chart-insight-panel chart-insight-panel-technical">
            <div>
              <div className="section-title">
                {translateUiText('Technical details', appLanguage)}
              </div>
              <h3>{translateUiText('Evidence and drilldown', appLanguage)}</h3>
              <p>{localizedInsight.technicalSummary}</p>
            </div>
            <ul>
              {localizedInsight.technicalDetails.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="chart-technical-grid">
            <article className="chart-technical-block">
              <span>{technicalLabels.anchorRule}</span>
              <strong>{technicalAnchorRule}</strong>
            </article>
            <article className="chart-technical-block">
              <span>{technicalLabels.chartSpecificNote}</span>
              <strong>{localizeChartPhrase(readingNote, chartLanguage)}</strong>
            </article>
            <article className="chart-technical-block">
              <span>{technicalLabels.houseEvidence}</span>
              <strong>{technicalHouseEvidence}</strong>
            </article>
            <article className="chart-technical-block">
              <span>{technicalLabels.planetCondition}</span>
              <strong>{technicalConditionSummary}</strong>
            </article>
          </div>
          <div
            aria-live="polite"
            className="chart-drilldown"
            key={`${chart.chartType}-${activeCell.house}-technical`}
          >
            <div>
              <div className="section-title">
                {translateUiText('DRILLDOWN', appLanguage)}
              </div>
              <h3>
                {formatHouseHeading(
                  activeCell.house ?? selectedHouse,
                  activeCell.displaySign,
                  chartLanguage,
                )}
              </h3>
              <p>
                {activeCell.renderPlanets.length
                  ? formatPlanetsHere(activeCell, chartLanguage)
                  : activeSupportingPoints.length
                  ? translateUiText(
                      'No core grahas occupy this sign in the primary reading. Supporting refinements are available below.',
                      chartLanguage,
                    )
                  : translateUiText(
                      'No planets occupy this sign in the preview chart.',
                      chartLanguage,
                    )}
              </p>
            </div>
            <div className="chart-drilldown-grid">
              <div>
                <span>{translateUiText('Life area', appLanguage)}</span>
                <strong>
                  {isD1
                    ? localizeChartPhrase(activeHouseMeaning, chartLanguage)
                    : localizeChartPhrase(chartRole, chartLanguage)}
                </strong>
              </div>
              <div>
                <span>{translateUiText(isD1 ? 'Chart role' : 'Varga rule', appLanguage)}</span>
                <strong>
                  {isD1
                    ? localizeChartPhrase(chartRole, chartLanguage)
                    : translateUiText(
                        'Use its specific purpose, not D1 house meanings',
                        chartLanguage,
                      )}
                </strong>
              </div>
              <div>
                <span>{translateUiText('Reading rule', appLanguage)}</span>
                <strong>
                  {chart.chartType === 'D1'
                    ? translateUiText('Use as the root chart', chartLanguage)
                    : formatReadWithD1(chart.chartType, chartLanguage)}
                </strong>
              </div>
            </div>
            <div className="drilldown-actions">
              <StatusPill
                label={formatHouseLabel(activeCell.house ?? selectedHouse, chartLanguage)}
                tone="premium"
              />
              <Link
                className="button secondary"
                href={buildChartAskHref({
                  chartName: chart.name,
                  chartType: chart.chartType,
                  house: activeCell.house,
                  kundliId,
                  purpose: localizedInsight.whatItSays,
                })}
              >
                {translateUiText('Ask Predicta', appLanguage)}
              </Link>
            </div>
            {activeCell.renderPlanets.length ? (
              <div
                className="planet-chip-row planet-chip-row-static"
                aria-label={translateUiText('Planets in selected house', appLanguage)}
              >
                {activeCell.renderPlanets.map(planet => (
                  <span key={planet.key}>{planet.displayName}</span>
                ))}
              </div>
            ) : null}
            {activeCell.renderPlanets.length ? (
              <div className="chart-planet-detail-list">
                {activeCell.renderPlanets.map(planet => (
                  <article className="chart-planet-detail-card" key={`${planet.key}-detail`}>
                    <span>{planet.displayName}</span>
                    <strong>{formatPlanetTechnicalDetail(planet, chartLanguage)}</strong>
                    <small>{formatPlanetTechnicalCondition(planet, chartLanguage)}</small>
                  </article>
                ))}
              </div>
            ) : null}
            {activeSupportingPoints.length ? (
              <details className="chart-supporting-points-drawer">
                <summary>
                  <span>{translateUiText('Advanced refinements', appLanguage)}</span>
                  <strong>
                    {formatSupportingPointCount(
                      activeSupportingPoints.length,
                      appLanguage,
                    )}
                  </strong>
                </summary>
                <p>
                  {translateUiText(
                    'These secondary markers can refine the reading, but the primary Vedic view stays anchored in the core grahas first.',
                    chartLanguage,
                  )}
                </p>
                <ul>
                  {activeSupportingPoints.map(point => (
                    <li key={`${point.name}-${point.degree.toFixed(3)}`}>
                      <strong>{localizePlanetName(point.name, chartLanguage)}</strong>{' '}
                      <span>{localizeSupportingPointMeaning(point, chartLanguage)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            {!isD1 || readingNoteOverride ? (
              <p className="varga-reading-note">
                {localizeChartPhrase(readingNote, chartLanguage)}
              </p>
            ) : null}
          </div>
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
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.61f1e652e0"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.099ec5792c"),
  };

  return {
    title: titleByLanguage[language] ?? common.language,
  };
}

type TechnicalViewLabels = {
  anchorRule: string;
  chartSpecificNote: string;
  houseEvidence: string;
  planetCondition: string;
};

function getTechnicalViewLabels(language: SupportedLanguage): TechnicalViewLabels {
  if (language === 'hi') {
    return {
      anchorRule: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f19deea49e"),
      chartSpecificNote: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.dab0e99529"),
      houseEvidence: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.3f5f51a73c"),
      planetCondition: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.90d025f564"),
    };
  }

  if (language === 'gu') {
    return {
      anchorRule: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.532b79ebb2"),
      chartSpecificNote: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.1713459672"),
      houseEvidence: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.2ed3cb1b39"),
      planetCondition: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.0813cc745d"),
    };
  }

  return {
    anchorRule: 'D1 anchor rule',
    chartSpecificNote: 'Chart-specific note',
    houseEvidence: 'House evidence',
    planetCondition: 'Planet condition',
  };
}

function getChartLanguageLabel(
  option: LanguageOption,
  activeLanguage: SupportedLanguage,
): string {
  return activeLanguage === 'en' ? option.englishName : option.nativeName;
}

function localizeChartInsight(
  insight: ChartInsight,
  language: SupportedLanguage,
): ChartInsight {
  return {
    ...insight,
    currentGuidance: localizeChartPhrase(insight.currentGuidance, language),
    eyebrow: translateUiText(insight.eyebrow, language),
    freeInsights: insight.freeInsights.map(item => localizeChartPhrase(item, language)),
    governs: localizeChartPhrase(insight.governs, language),
    lifeAreas: insight.lifeAreas.map(item => localizeChartPhrase(item, language)),
    mainChallenge: localizeChartPhrase(insight.mainChallenge, language),
    mainStrength: localizeChartPhrase(insight.mainStrength, language),
    premiumDeepDive: insight.premiumDeepDive.map(item =>
      localizeChartPhrase(item, language),
    ),
    premiumInsight: insight.premiumInsight
      ? localizePremiumInsight(insight.premiumInsight, language)
      : undefined,
    premiumNudge: insight.premiumNudge
      ? localizeChartPhrase(insight.premiumNudge, language)
      : undefined,
    technicalDetails: insight.technicalDetails.map(item =>
      localizeChartPhrase(item, language),
    ),
    technicalSummary: localizeChartPhrase(insight.technicalSummary, language),
    title: localizeChartTitle(insight.title, language),
    whatItSays: localizeChartPhrase(insight.whatItSays, language),
  };
}

function localizePremiumInsight(
  insight: ChartPremiumInsight,
  language: SupportedLanguage,
): ChartPremiumInsight {
  return {
    confidenceFraming: localizeChartPhrase(insight.confidenceFraming, language),
    contradictionSignals: insight.contradictionSignals.map(item =>
      localizeChartPhrase(item, language),
    ),
    crossChartSynthesis: insight.crossChartSynthesis.map(item =>
      localizeChartPhrase(item, language),
    ),
    headline: localizeChartPhrase(insight.headline, language),
    layeredInterpretation: insight.layeredInterpretation.map(item =>
      localizeChartPhrase(item, language),
    ),
    practicalGuidance: insight.practicalGuidance.map(item =>
      localizeChartPhrase(item, language),
    ),
    remedyDirection: insight.remedyDirection.map(item =>
      localizeChartPhrase(item, language),
    ),
    timingWindows: insight.timingWindows.map(item =>
      localizeChartPhrase(item, language),
    ),
  };
}

function renderPremiumInsightPanel({
  appLanguage,
  hasPremiumAccess,
  insight,
}: {
  appLanguage: SupportedLanguage;
  hasPremiumAccess: boolean;
  insight: ChartInsight;
}): React.JSX.Element | null {
  if (hasPremiumAccess && insight.premiumInsight) {
    return (
      <div className="chart-premium-depth">
        <div>
          <strong>{translateUiText('Premium deep dive', appLanguage)}</strong>
          <p>{insight.premiumInsight.headline}</p>
        </div>
        <div className="chart-premium-grid">
          <article className="chart-premium-block chart-premium-block-wide">
            <span>{translateUiText('Layered interpretation', appLanguage)}</span>
            <ul>
              {insight.premiumInsight.layeredInterpretation.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="chart-premium-block">
            <span>{translateUiText('Timing windows', appLanguage)}</span>
            <ul>
              {insight.premiumInsight.timingWindows.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="chart-premium-block">
            <span>{translateUiText('Strength vs contradiction', appLanguage)}</span>
            <ul>
              {insight.premiumInsight.contradictionSignals.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="chart-premium-block">
            <span>{translateUiText('Cross-chart synthesis', appLanguage)}</span>
            <ul>
              {insight.premiumInsight.crossChartSynthesis.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="chart-premium-block">
            <span>{translateUiText('Practical guidance and remedies', appLanguage)}</span>
            <ul>
              {[
                ...insight.premiumInsight.practicalGuidance,
                ...insight.premiumInsight.remedyDirection,
              ].map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="chart-premium-depth-footer">
          <span>{translateUiText('Confidence framing', appLanguage)}</span>
          <p>{insight.premiumInsight.confidenceFraming}</p>
        </div>
      </div>
    );
  }

  if (insight.premiumNudge) {
    return (
      <div className="chart-premium-nudge">
        <div>
          <strong>{translateUiText('Premium deep dive', appLanguage)}</strong>
          <ul>
            {insight.premiumDeepDive.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="chart-premium-nudge-actions">
          <span>{insight.premiumNudge}</span>
          <Link className="button secondary" href="/pricing">
            {translateUiText('See Premium', appLanguage)}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

function localizeChartTitle(value: string, language: SupportedLanguage): string {
  if (language === 'en') {
    return value;
  }

  return CHART_TITLE_TRANSLATIONS[value]?.[language] ?? translateUiText(value, language);
}

function localizeChartPhrase(value: string, language: SupportedLanguage): string {
  if (language === 'en') {
    return value;
  }

  const direct = translateUiText(value, language);
  if (direct !== value) {
    return direct;
  }

  const chartName = Object.keys(CHART_TITLE_TRANSLATIONS).find(name =>
    value.includes(name),
  );
  const localizedChartName = chartName
    ? localizeChartTitle(chartName, language)
    : undefined;

  if (/^This free view gives the practical purpose of .+ and the main placement pattern without deep prediction\.$/.test(value)) {
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.bc8d3d636f", [localizedChartName ?? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.70f9384caa")])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.05d2705b81", [localizedChartName ?? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.fcb697dfc8")]);
  }

  if (/^Premium depth reads .+ as a real synthesis layer: D1 anchor, varga placements, dasha activation, confidence, and practical next steps\.$/.test(value)) {
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.622ff9b469", [localizedChartName ?? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.05a472f792")])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.817701e0f5", [localizedChartName ?? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.054eb085bd")]);
  }

  const focusMatch = value.match(/^(D\d+) focuses on (.+)\.$/);
  if (focusMatch) {
    const [, chartType, focus] = focusMatch;
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.05ff8a05f1", [chartType, localizeFocusPhrase(focus, language)])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.7e037c0a72", [chartType, localizeFocusPhrase(focus, language)]);
  }

  const focusD1Match = value.match(/^(D\d+) focuses on (.+), and should be judged through D1 first\.$/);
  if (focusD1Match) {
    const [, chartType, focus] = focusD1Match;
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.a838941b82", [chartType, localizeFocusPhrase(focus, language)])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.a3fcaecf58", [chartType, localizeFocusPhrase(focus, language)]);
  }

  const occupiedMatch = value.match(/^(\d+) houses have planet placements in this chart\.$/);
  if (occupiedMatch) {
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.96c15852f4", [occupiedMatch[1]])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.2cab2f6f8f", [occupiedMatch[1]]);
  }

  const usefulMatch = value.match(/^Useful starting points: (.+)\.$/);
  if (usefulMatch) {
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.2fe6dbb09d", [localizePlacementList(usefulMatch[1], language)])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.d8c0d76c53", [localizePlacementList(usefulMatch[1], language)]);
  }

  const clusterMatch = value.match(/^Detailed placement clusters: (.+)\.$/);
  if (clusterMatch) {
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.ca7230cfd9", [localizePlacementList(clusterMatch[1], language)])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.71e684e832", [localizePlacementList(clusterMatch[1], language)]);
  }

  const ascendantMatch = value.match(/^Ascendant sign in this chart is (.+), setting the lens for this area\.$/);
  if (ascendantMatch) {
    return language === 'hi'
      ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.74469055a1", [localizeSignName(ascendantMatch[1], language)])
      : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.ab4ee0729d", [localizeSignName(ascendantMatch[1], language)]);
  }

  const readWithD1Match = value.match(/^Read (D\d+) together with D1; never judge this area from the varga alone\.$/);
  if (readWithD1Match) {
    return formatReadWithD1Detail(readWithD1Match[1], language);
  }

  return CHART_PHRASE_TRANSLATIONS[value]?.[language] ?? value;
}

function localizeFocusPhrase(value: string, language: SupportedLanguage): string {
  return FOCUS_PHRASE_TRANSLATIONS[value]?.[language] ?? value;
}

function localizePlacementList(value: string, language: SupportedLanguage): string {
  return value
    .replace(/\b(D\d+) house (\d+):/g, (_match, chartType, house) =>
      language === 'hi'
        ? formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.d43ffa0ee8", [chartType, house])
        : formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.023d508447", [chartType, house]),
    )
    .replace(
      /\b(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Uranus|Neptune|Pluto|Gulika|Mandi|Dhuma|Vyatipata|Parivesha|Indrachapa|Upaketu)\b/g,
      planet => PLANET_NAME_TRANSLATIONS[planet]?.[language] ?? planet,
    );
}

function formatHouseHeading(
  house: number,
  displaySign: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.0850edc3d6", [house, displaySign]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.4ecbca2ba4", [house, displaySign]);
  }

  return `House ${house} · ${displaySign}`;
}

function formatHouseLabel(house: number, language: SupportedLanguage): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.20dd7ecbd1", [house]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.0cc8a4ad12", [house]);
  }

  return `House ${house}`;
}

function formatPlanetsHere(
  cell: { renderPlanets: { displayName: string }[] },
  language: SupportedLanguage,
): string {
  const names = cell.renderPlanets.map(planet => planet.displayName).join(', ');
  const prefix = translateUiText('Planets here:', language);
  return `${prefix} ${names}.`;
}

function formatSupportingPointCount(
  count: number,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.38ce047162", [count]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.1825f32893", [count]);
  }

  return `${count} refinement${count === 1 ? '' : 's'}`;
}

function localizePlanetName(
  name: string,
  language: SupportedLanguage,
): string {
  return PLANET_NAME_TRANSLATIONS[name]?.[language] ?? name;
}

function localizeSupportingPointMeaning(
  point: PlanetPosition,
  language: SupportedLanguage,
): string {
  const meaning = point.simpleMeaning ?? getSpecialPointMeaning(point);

  if (language === 'hi') {
    return meaning
      .replace('imagination, devotion, confusion, subtle sensitivity, and spiritual longing', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9714ec11d2"))
      .replace('deep pressure, power, transformation, buried intensity, and rebirth', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.89750d700d"))
      .replace('sudden change, innovation, disruption, independence, and unusual breaks', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.cb703041cb"))
      .replace('detachment, simplification, separation, and subtle correction', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.3e3dd5a375"))
      .replace('reversal, imbalance, unexpected turns, and avoiding extremes', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.35592da8dc"))
      .replace('enclosure, protection, boundaries, and contained patterns', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.60dc4f4e9b"))
      .replace('heat, smoke, pressure, obscurity, and hidden friction', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.eb8fc26655"))
      .replace('desire, projection, atmosphere, and misleading appearances', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.bb57c703a1"))
      .replace('karmic pressure, discipline, difficult residue, and extra maturity', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.15ba3c071c"))
      .replace('karmic heaviness, delay, caution, and humility lessons', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.246ffd72d0"));
  }

  if (language === 'gu') {
    return meaning
      .replace('imagination, devotion, confusion, subtle sensitivity, and spiritual longing', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.bdd7515253"))
      .replace('deep pressure, power, transformation, buried intensity, and rebirth', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.7b9c12bd08"))
      .replace('sudden change, innovation, disruption, independence, and unusual breaks', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b952cec437"))
      .replace('detachment, simplification, separation, and subtle correction', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6cc216826d"))
      .replace('reversal, imbalance, unexpected turns, and avoiding extremes', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a2291e821f"))
      .replace('enclosure, protection, boundaries, and contained patterns', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f76499c543"))
      .replace('heat, smoke, pressure, obscurity, and hidden friction', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.2b21fc31fa"))
      .replace('desire, projection, atmosphere, and misleading appearances', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6031421aad"))
      .replace('karmic pressure, discipline, difficult residue, and extra maturity', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.e3fcc838cc"))
      .replace('karmic heaviness, delay, caution, and humility lessons', getNativeCopy("native.apps.web.components.WebKundliChart.tsx.30f402706e"));
  }

  return meaning;
}

function formatReadWithD1(chartType: ChartType, language: SupportedLanguage): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.73d63ccc32", [chartType]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.0b69432ef4", [chartType]);
  }

  return `Read ${chartType} with D1`;
}

function formatReadWithD1Detail(chartType: string, language: SupportedLanguage): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.a24836c010", [chartType]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.a53c55b8a3", [chartType]);
  }

  return `Read ${chartType} together with D1; never judge this area from the varga alone.`;
}

function formatTechnicalAnchorRule(
  chartType: ChartType,
  language: SupportedLanguage,
): string {
  if (chartType === 'D1') {
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.components.WebKundliChart.tsx.5f90f13e3d");
    }

    if (language === 'gu') {
      return getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b594002853");
    }

    return 'D1 is the root chart. Every other chart must be verified against it.';
  }

  return formatReadWithD1Detail(chartType, language);
}

function formatTechnicalHouseEvidence(
  cell: {
    displaySign: string;
    house?: number;
    renderPlanets: ChartRenderPlanet[];
    supportingPoints: PlanetPosition[];
  },
  language: SupportedLanguage,
): string {
  const houseLabel = formatHouseLabel(cell.house ?? 1, language);
  const coreCount = cell.renderPlanets.length;
  const supportCount = cell.supportingPoints.length;

  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.e9b8813f98", [
      houseLabel,
      cell.displaySign,
      coreCount,
      supportCount
        ? formatNativeCopy(
            'native.apps.web.components.WebKundliChart.supportingHint.hi',
            [supportCount],
          )
        : '',
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.a8b9567d00", [
      houseLabel,
      cell.displaySign,
      coreCount,
      supportCount
        ? formatNativeCopy(
            'native.apps.web.components.WebKundliChart.supportingHint.gu',
            [supportCount],
          )
        : '',
    ]);
  }

  return `${houseLabel} · ${cell.displaySign}. ${coreCount} core graha${coreCount === 1 ? '' : 's'}${supportCount ? ` and ${supportCount} supporting refinement${supportCount === 1 ? '' : 's'}` : ''}.`;
}

function formatTechnicalConditionSummary(
  planets: ChartRenderPlanet[],
  language: SupportedLanguage,
): string {
  if (!planets.length) {
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.components.WebKundliChart.tsx.21681c64c5");
    }

    if (language === 'gu') {
      return getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ff53cd62da");
    }

    return 'No core graha occupy this house; read the sign, chart role, and supporting refinements.';
  }

  const exalted = planets.filter(planet => planet.status.exalted).length;
  const debilitated = planets.filter(planet => planet.status.debilitated).length;
  const combust = planets.filter(planet => planet.status.combust).length;
  const retrograde = planets.filter(planet => planet.status.retrograde).length;

  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.d66f170d76", [exalted, debilitated, combust, retrograde]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.57d93671aa", [exalted, debilitated, combust, retrograde]);
  }

  return `Exalted ${exalted}, debilitated ${debilitated}, combust ${combust}, retrograde ${retrograde}.`;
}

function formatPlanetTechnicalDetail(
  planet: ChartRenderPlanet,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.f897d9efc2", [planet.displaySign, planet.degreeLabel, planet.nakshatra, planet.pada]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.470345e1be", [planet.displaySign, planet.degreeLabel, planet.nakshatra, planet.pada]);
  }

  return `${planet.displaySign} · ${planet.degreeLabel} · ${planet.nakshatra} pada ${planet.pada}`;
}

function formatPlanetTechnicalCondition(
  planet: ChartRenderPlanet,
  language: SupportedLanguage,
): string {
  const states: string[] = [];

  if (planet.status.exalted) {
    states.push(language === 'hi' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f710a0185f") : language === 'gu' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ce9c14c0f1") : 'Exalted');
  }

  if (planet.status.debilitated) {
    states.push(language === 'hi' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.311c331b37") : language === 'gu' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.28de395740") : 'Debilitated');
  }

  if (planet.status.combust) {
    states.push(language === 'hi' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.5472273c2e") : language === 'gu' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a90482b9f1") : 'Combust');
  }

  if (planet.status.retrograde) {
    states.push(language === 'hi' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.886d2a37c5") : language === 'gu' ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.49f722a423") : 'Retrograde');
  }

  if (!states.length) {
    return language === 'hi'
      ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.46d91af4a8")
      : language === 'gu'
      ? getNativeCopy("native.apps.web.components.WebKundliChart.tsx.01914d7110")
      : 'Condition steady';
  }

  return states.join(language === 'en' ? ' · ' : ' · ');
}

function localizeSignName(sign: string, language: SupportedLanguage): string {
  return SIGN_NAME_TRANSLATIONS[sign]?.[language] ?? sign;
}

const CHART_TITLE_TRANSLATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  'Rashi Chart': { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f689aaad0d"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ca2a577128") },
  'Hora Chart': { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.929fc27e79"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c992bda0de") },
  'Drekkana Chart': { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c19f646afa"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.90d5fc923b") },
  'Chaturthamsha Chart': { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.3a3092e7fc"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.1567808453") },
  'Navamsha Chart': { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.0c65a1e8b4"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9378b6d412") },
  'Dashamsha Chart': { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9ea8d55b43"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c8507bd795") },
};

const SIGN_NAME_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  Aries: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f800c7a7fd"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.d0dc38337c") },
  Taurus: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.32a5dc415e"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.46c13ac334") },
  Gemini: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.e7606cff4c"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6e4aa0522b") },
  Cancer: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.eca5bc33ba"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6ca2aec5ed") },
  Leo: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.78091d77e7"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.69a4330681") },
  Virgo: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9cbd01ebe5"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.bb3330123e") },
  Libra: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.83554f40e6"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b4fddac1a5") },
  Scorpio: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.034d53679c"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ebe7bb360f") },
  Sagittarius: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6f8eca9b34"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.53e2e69514") },
  Capricorn: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.fe7a2e292e"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6b818972e3") },
  Aquarius: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.50172db085"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f3ef823bbc") },
  Pisces: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.dae6bb0928"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.797c695cf4") },
};

const PLANET_NAME_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  Dhuma: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9c0df42525"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c95fdb63fb") },
  Gulika: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a8bbe5b052"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a796629d37") },
  Indrachapa: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c80d9e6362"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6b6e06f106") },
  Jupiter: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.0b4f0d81dd"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.fed71b7fad") },
  Ketu: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.08b2d07348"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b2e59a556b") },
  Mandi: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.257967b1f9"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b32178ae34") },
  Mars: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.36fcde7d5d"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.394bdcfe82") },
  Mercury: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6f554fd42f"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.57589c204d") },
  Moon: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c1ba41ab4e"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b2254985ce") },
  Neptune: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ff903ad1e4"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c8d2c800a4") },
  Parivesha: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.5771d9a524"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.8e15d53f5c") },
  Pluto: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.2d5c3169c8"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.7b9f0e4ee5") },
  Rahu: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f08d431a96"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f7d54a79e0") },
  Saturn: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.4b0976b0f5"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.76e8e9058e") },
  Sun: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.5525333802"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.10ecf3a7a0") },
  Upaketu: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c64775dfb0"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.4365b00da5") },
  Uranus: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.e2a3e35cdc"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9efb413451") },
  Venus: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.0bffb88e1c"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b2e75355d1") },
  Vyatipata: { gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.e9fd6a3e73"), hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c14d5e361f") },
};

const FOCUS_PHRASE_TRANSLATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  'body, identity, life direction, houses, and visible karma': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.988a3c24c0"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.6060bcec94"),
  },
  'wealth handling, resources, and money temperament': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.7306d3e315"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.7a4e7aa802"),
  },
  'courage, siblings, effort, and practical stamina': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ac0c004d19"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.4ec11c32c8"),
  },
  'home, property, fixed assets, and inner stability': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.630252f49d"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.854ffb5654"),
  },
  'marriage, dharma, maturity, and deeper planet strength': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.bb317501e3"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.8330cb075f"),
  },
  'career, public work, authority, and contribution': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.fb0b1cf126"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.4e655f8c2b"),
  },
};

const CHART_PHRASE_TRANSLATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  'No planet-heavy house stands out in this chart preview.': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a56533d71f"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.18ed35202c"),
  },
  'D1 remains the root chart for all predictions.': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a9feeca0ad"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.dbccf5c9a9"),
  },
  'Premium turns this into detailed chart synthesis with D1 anchoring, dasha timing, strength checks, and report-ready guidance.': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.82e53111be"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.646a6ca857"),
  },
  'D1 is the root chart. Houses can be read with standard house meanings, then refined by dasha, gochar, strength, and divisional support.': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.93f05a6cc4"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.becec1d0e9"),
  },
  'This varga is a focused divisional confirmation chart. Read it through its specific purpose and D1 anchor, not as a standalone general Kundli.': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b3b1216e85"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.802ab06d8c"),
  },
  'main life chart': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.dc42ef9d4b"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.699d3ba032"),
  },
  'focused divisional lens': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.f29a26142a"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.680ba85a9c"),
  },
  'self, body, identity': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c532cb7374"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.43217d12ed"),
  },
  'money, speech, family values': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.dbc2cfb1f3"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.a167de3df5"),
  },
  'effort, courage, siblings': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c6ca8db6f8"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b5b9038744"),
  },
  'home, mother, emotional base': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.2710b372c1"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9a42f522b3"),
  },
  'children, learning, merit': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.e993a1db6c"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.78d35152fc"),
  },
  'work pressure, health discipline': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.8f053fbce5"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b6ee7a5748"),
  },
  'marriage, partners, contracts': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.b079e87195"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.ed6e0520c5"),
  },
  'change, secrets, transformation': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.9c864e600e"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.12ca292b15"),
  },
  'fortune, dharma, teachers': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.e01ec9aa11"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.26c68c26ad"),
  },
  'career, status, responsibility': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.c79ef0d697"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.d0f0868de3"),
  },
  'gains, network, ambitions': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.78aa609b98"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.95539f2248"),
  },
  'sleep, expense, release': {
    gu: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.1c719c656b"),
    hi: getNativeCopy("native.apps.web.components.WebKundliChart.tsx.bc4c2d5ec9"),
  },
};

function getNorthHousePolygonPoints(house?: number): string {
  return house
    ? (NORTH_INDIAN_HOUSE_POLYGONS[house] ?? [])
        .map(([x, y]) => `${x},${y}`)
        .join(' ')
    : '';
}

export function NorthIndianChartLines({
  surface = 'standard',
}: {
  surface?: KundliAnimationSurface;
}): React.JSX.Element {
  return (
    <svg
      className="north-chart-lines"
      aria-hidden
      data-kundli-animation-part="lines"
      data-kundli-animation-surface={surface}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {NORTH_INDIAN_CHART_LINE_PATHS.map((path, index) => (
        <path
          d={path}
          key={path}
          style={getKundliAnimationStyle(index, 'lines', surface)}
        />
      ))}
    </svg>
  );
}

function MoonNakshatraPadaStrip({
  insight,
  language = 'en',
}: {
  insight?: MoonNakshatraPadaInsight;
  language?: SupportedLanguage;
}): React.JSX.Element | null {
  if (!insight) {
    return null;
  }

  return (
    <div className="moon-nakshatra-strip">
      <div>
        <span>{translateUiText('Moon rhythm', language)}</span>
        <strong>{insight.moonPhaseLabel}</strong>
        <small>{insight.moonPhaseMeaning}</small>
      </div>
      <div>
        <span>{translateUiText('Birth star', language)}</span>
        <strong>
          {insight.moonNakshatra}
          {insight.pada ? formatPadaLabel(insight.pada, language) : ''}
        </strong>
        {insight.padaMeaning ? <small>{insight.padaMeaning}</small> : null}
      </div>
    </div>
  );
}

export function ChartLegend({
  animationSurface = 'standard',
  compact = false,
  items,
  language = 'en',
}: {
  animationSurface?: KundliAnimationSurface;
  compact?: boolean;
  items: ChartRenderLegendItem[];
  language?: SupportedLanguage;
}): React.JSX.Element | null {
  if (!items.length) {
    return null;
  }

  return (
    <div
      className={`chart-legend ${compact ? 'compact' : ''}`}
      aria-label={translateUiText('Chart legend', language)}
      data-kundli-animation-part="legend"
      data-kundli-animation-surface={animationSurface}
      style={getKundliAnimationSurfaceProps(animationSurface).style}
    >
      {items.map((item, index) => (
        <span
          className={`chart-legend-item ${item.tone}`}
          key={`${item.code}-${item.description}-${index}`}
        >
          <b>{item.code}</b>
          <span>{item.description}</span>
        </span>
      ))}
    </div>
  );
}

function formatPadaLabel(pada: number, language: SupportedLanguage): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.2766e49a02", [pada]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebKundliChart.tsx.cb9c29c82f", [pada]);
  }

  return ` pada ${pada}`;
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
