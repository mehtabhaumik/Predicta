'use client';

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
  buildChartRenderModel,
  buildChartSelectionPrompt,
  composeChartInsight,
  type ChartInsightProfile,
  type ChartPremiumInsight,
  type ChartRenderPresentation,
  getChartFocusLabel,
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
  const [viewMode, setViewMode] = useState<'insight' | 'technical'>('insight');
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
        <button
          aria-selected={viewMode === 'insight'}
          className={viewMode === 'insight' ? 'active' : ''}
          onClick={() => setViewMode('insight')}
          role="tab"
          type="button"
        >
          {translateUiText('Insight View', appLanguage)}
        </button>
        <button
          aria-selected={viewMode === 'technical'}
          className={viewMode === 'technical' ? 'active' : ''}
          onClick={() => setViewMode('technical')}
          role="tab"
          type="button"
        >
          {translateUiText('Technical View', appLanguage)}
        </button>
      </div>

      {viewMode === 'insight' ? (
        <div className="chart-insight-stack">
          <div className="chart-primary-insight">
            <div>
              <div className="section-title">{localizedInsight.eyebrow}</div>
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
    gu: 'ચાર્ટ ભાષા',
    hi: 'चार्ट भाषा',
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
      anchorRule: 'D1 आधार नियम',
      chartSpecificNote: 'चार्ट विशेष नोट',
      houseEvidence: 'भाव प्रमाण',
      planetCondition: 'ग्रह स्थिति',
    };
  }

  if (language === 'gu') {
    return {
      anchorRule: 'D1 આધાર નિયમ',
      chartSpecificNote: 'ચાર્ટ વિશેષ નોંધ',
      houseEvidence: 'ભાવ પુરાવો',
      planetCondition: 'ગ્રહ સ્થિતિ',
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
      ? `यह मुफ्त दृश्य ${localizedChartName ?? 'इस चार्ट'} का उद्देश्य और मुख्य ग्रह-स्थिति सरल रूप में दिखाता है.`
      : `આ મફત દૃશ્ય ${localizedChartName ?? 'આ ચાર્ટ'} નો હેતુ અને મુખ્ય ગ્રહ-સ્થિતિ સરળ રીતે બતાવે છે.`;
  }

  if (/^Premium depth reads .+ as a real synthesis layer: D1 anchor, varga placements, dasha activation, confidence, and practical next steps\.$/.test(value)) {
    return language === 'hi'
      ? `प्रीमियम ${localizedChartName ?? 'इस चार्ट'} को D1 आधार, वर्ग स्थिति, दशा सक्रियता, भरोसे और व्यावहारिक अगले कदमों के साथ गहराई से पढ़ता है.`
      : `પ્રીમિયમ ${localizedChartName ?? 'આ ચાર્ટ'} ને D1 આધાર, વર્ગ સ્થિતિ, દશા સક્રિયતા, વિશ્વાસ અને વ્યવહારુ આગળના પગલાં સાથે ઊંડાણથી વાંચે છે.`;
  }

  const focusMatch = value.match(/^(D\d+) focuses on (.+)\.$/);
  if (focusMatch) {
    const [, chartType, focus] = focusMatch;
    return language === 'hi'
      ? `${chartType} ${localizeFocusPhrase(focus, language)} पर ध्यान देता है.`
      : `${chartType} ${localizeFocusPhrase(focus, language)} પર ધ્યાન આપે છે.`;
  }

  const focusD1Match = value.match(/^(D\d+) focuses on (.+), and should be judged through D1 first\.$/);
  if (focusD1Match) {
    const [, chartType, focus] = focusD1Match;
    return language === 'hi'
      ? `${chartType} ${localizeFocusPhrase(focus, language)} पर ध्यान देता है और इसे पहले D1 के आधार से पढ़ना चाहिए.`
      : `${chartType} ${localizeFocusPhrase(focus, language)} પર ધ્યાન આપે છે અને તેને પહેલા D1 આધારથી વાંચવું જોઈએ.`;
  }

  const occupiedMatch = value.match(/^(\d+) houses have planet placements in this chart\.$/);
  if (occupiedMatch) {
    return language === 'hi'
      ? `इस चार्ट में ${occupiedMatch[1]} भावों में ग्रह स्थित हैं.`
      : `આ ચાર્ટમાં ${occupiedMatch[1]} ભાવોમાં ગ્રહો છે.`;
  }

  const usefulMatch = value.match(/^Useful starting points: (.+)\.$/);
  if (usefulMatch) {
    return language === 'hi'
      ? `शुरू करने के उपयोगी बिंदु: ${localizePlacementList(usefulMatch[1], language)}.`
      : `શરૂ કરવા માટે ઉપયોગી મુદ્દા: ${localizePlacementList(usefulMatch[1], language)}.`;
  }

  const clusterMatch = value.match(/^Detailed placement clusters: (.+)\.$/);
  if (clusterMatch) {
    return language === 'hi'
      ? `विस्तृत ग्रह समूह: ${localizePlacementList(clusterMatch[1], language)}.`
      : `વિગતવાર ગ્રહ સમૂહ: ${localizePlacementList(clusterMatch[1], language)}.`;
  }

  const ascendantMatch = value.match(/^Ascendant sign in this chart is (.+), setting the lens for this area\.$/);
  if (ascendantMatch) {
    return language === 'hi'
      ? `इस चार्ट में लग्न राशि ${localizeSignName(ascendantMatch[1], language)} है, इसलिए इसी से यह क्षेत्र पढ़ा जाता है.`
      : `આ ચાર્ટમાં લગ્ન રાશિ ${localizeSignName(ascendantMatch[1], language)} છે, એટલે આ ક્ષેત્ર એ આધારથી વાંચાય છે.`;
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
        ? `${chartType} भाव ${house}:`
        : `${chartType} ભાવ ${house}:`,
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
    return `भाव ${house} · ${displaySign}`;
  }

  if (language === 'gu') {
    return `ભાવ ${house} · ${displaySign}`;
  }

  return `House ${house} · ${displaySign}`;
}

function formatHouseLabel(house: number, language: SupportedLanguage): string {
  if (language === 'hi') {
    return `भाव ${house}`;
  }

  if (language === 'gu') {
    return `ભાવ ${house}`;
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
    return `${count} सहायक बिंदु`;
  }

  if (language === 'gu') {
    return `${count} સહાયક બિંદુ`;
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
      .replace('imagination, devotion, confusion, subtle sensitivity, and spiritual longing', 'कल्पना, भक्ति, भ्रम, सूक्ष्म संवेदनशीलता और आध्यात्मिक खिंचाव')
      .replace('deep pressure, power, transformation, buried intensity, and rebirth', 'गहरा दबाव, शक्ति, परिवर्तन, छिपी तीव्रता और पुनर्जन्म विषय')
      .replace('sudden change, innovation, disruption, independence, and unusual breaks', 'अचानक बदलाव, नवाचार, व्यवधान, स्वतंत्रता और असामान्य मोड़')
      .replace('detachment, simplification, separation, and subtle correction', 'विरक्ति, सरलता, अलगाव और सूक्ष्म सुधार')
      .replace('reversal, imbalance, unexpected turns, and avoiding extremes', 'उलटफेर, असंतुलन, अचानक मोड़ और अतियों से बचाव')
      .replace('enclosure, protection, boundaries, and contained patterns', 'घेरा, सुरक्षा, सीमाएं और सीमित पैटर्न')
      .replace('heat, smoke, pressure, obscurity, and hidden friction', 'गरमी, धुंध, दबाव, अस्पष्टता और छिपा घर्षण')
      .replace('desire, projection, atmosphere, and misleading appearances', 'इच्छा, प्रक्षेपण, माहौल और भ्रमित करने वाली छवि')
      .replace('karmic pressure, discipline, difficult residue, and extra maturity', 'कर्मिक दबाव, अनुशासन, कठिन अवशेष और अतिरिक्त परिपक्वता')
      .replace('karmic heaviness, delay, caution, and humility lessons', 'कर्मिक भारीपन, देरी, सावधानी और विनम्रता के पाठ');
  }

  if (language === 'gu') {
    return meaning
      .replace('imagination, devotion, confusion, subtle sensitivity, and spiritual longing', 'કલ્પના, ભક્તિ, ગૂંચવણ, સૂક્ષ્મ સંવેદનશીલતા અને આધ્યાત્મિક ખેંચાણ')
      .replace('deep pressure, power, transformation, buried intensity, and rebirth', 'ઊંડો દબાવ, શક્તિ, રૂપાંતર, દબાયેલી તીવ્રતા અને પુનર્જન્મના વિષયો')
      .replace('sudden change, innovation, disruption, independence, and unusual breaks', 'અચાનક ફેરફાર, નવીનતા, અવરોધ, સ્વતંત્રતા અને અસામાન્ય વળાંકો')
      .replace('detachment, simplification, separation, and subtle correction', 'અલિપ્તતા, સરળતા, અલગાવ અને સૂક્ષ્મ સુધારો')
      .replace('reversal, imbalance, unexpected turns, and avoiding extremes', 'ઉલટફેર, અસંતુલન, અચાનક વળાંકો અને અતિરેકથી બચવું')
      .replace('enclosure, protection, boundaries, and contained patterns', 'ઘેરાવ, સુરક્ષા, સીમાઓ અને બંધાયેલા પેટર્ન')
      .replace('heat, smoke, pressure, obscurity, and hidden friction', 'ગરમી, ધુમ્મસ, દબાવ, અસ્પષ્ટતા અને છુપાયેલું ઘર્ષણ')
      .replace('desire, projection, atmosphere, and misleading appearances', 'ઇચ્છા, પ્રક્ષેપણ, વાતાવરણ અને ભ્રમિત દેખાવ')
      .replace('karmic pressure, discipline, difficult residue, and extra maturity', 'કર્મદબાવ, શિસ્ત, કઠિન અવશેષ અને વધારાની પરિપક્વતા')
      .replace('karmic heaviness, delay, caution, and humility lessons', 'કર્મિક ભાર, વિલંબ, સાવચેતી અને વિનમ્રતાના પાઠ');
  }

  return meaning;
}

function formatReadWithD1(chartType: ChartType, language: SupportedLanguage): string {
  if (language === 'hi') {
    return `${chartType} को D1 के साथ पढ़ें`;
  }

  if (language === 'gu') {
    return `${chartType} ને D1 સાથે વાંચો`;
  }

  return `Read ${chartType} with D1`;
}

function formatReadWithD1Detail(chartType: string, language: SupportedLanguage): string {
  if (language === 'hi') {
    return `${chartType} को D1 के साथ पढ़ें; केवल वर्ग देखकर निर्णय न करें.`;
  }

  if (language === 'gu') {
    return `${chartType} ને D1 સાથે વાંચો; માત્ર વર્ગ જોઈને નિર્ણય ન કરો.`;
  }

  return `Read ${chartType} together with D1; never judge this area from the varga alone.`;
}

function formatTechnicalAnchorRule(
  chartType: ChartType,
  language: SupportedLanguage,
): string {
  if (chartType === 'D1') {
    if (language === 'hi') {
      return 'D1 मूल चार्ट है. बाकी सभी चार्ट इसी आधार पर सत्यापित होते हैं.';
    }

    if (language === 'gu') {
      return 'D1 મૂળ ચાર્ટ છે. બાકીના બધા ચાર્ટો આ આધાર પર જ ચકાસાય છે.';
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
    return `${houseLabel} · ${cell.displaySign}. ${coreCount} मुख्य ग्रह${supportCount ? ` और ${supportCount} सहायक संकेत` : ''}.`;
  }

  if (language === 'gu') {
    return `${houseLabel} · ${cell.displaySign}. ${coreCount} મુખ્ય ગ્રહ${supportCount ? ` અને ${supportCount} સહાયક સંકેત` : ''}.`;
  }

  return `${houseLabel} · ${cell.displaySign}. ${coreCount} core graha${coreCount === 1 ? '' : 's'}${supportCount ? ` and ${supportCount} supporting refinement${supportCount === 1 ? '' : 's'}` : ''}.`;
}

function formatTechnicalConditionSummary(
  planets: ChartRenderPlanet[],
  language: SupportedLanguage,
): string {
  if (!planets.length) {
    if (language === 'hi') {
      return 'इस भाव में कोई मुख्य ग्रह नहीं है; साइन, भूमिका और सहायक बिंदुओं से पढ़ें.';
    }

    if (language === 'gu') {
      return 'આ ભાવમાં કોઈ મુખ્ય ગ્રહ નથી; રાશિ, ભૂમિકા અને સહાયક બિંદુઓથી વાંચો.';
    }

    return 'No core graha occupy this house; read the sign, chart role, and supporting refinements.';
  }

  const exalted = planets.filter(planet => planet.status.exalted).length;
  const debilitated = planets.filter(planet => planet.status.debilitated).length;
  const combust = planets.filter(planet => planet.status.combust).length;
  const retrograde = planets.filter(planet => planet.status.retrograde).length;

  if (language === 'hi') {
    return `उच्च ${exalted}, नीच ${debilitated}, अस्त ${combust}, वक्री ${retrograde}.`;
  }

  if (language === 'gu') {
    return `ઉચ્ચ ${exalted}, નીચ ${debilitated}, અસ્ત ${combust}, વક્રી ${retrograde}.`;
  }

  return `Exalted ${exalted}, debilitated ${debilitated}, combust ${combust}, retrograde ${retrograde}.`;
}

function formatPlanetTechnicalDetail(
  planet: ChartRenderPlanet,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return `${planet.displaySign} · ${planet.degreeLabel} · ${planet.nakshatra} पाद ${planet.pada}`;
  }

  if (language === 'gu') {
    return `${planet.displaySign} · ${planet.degreeLabel} · ${planet.nakshatra} પાદ ${planet.pada}`;
  }

  return `${planet.displaySign} · ${planet.degreeLabel} · ${planet.nakshatra} pada ${planet.pada}`;
}

function formatPlanetTechnicalCondition(
  planet: ChartRenderPlanet,
  language: SupportedLanguage,
): string {
  const states: string[] = [];

  if (planet.status.exalted) {
    states.push(language === 'hi' ? 'उच्च' : language === 'gu' ? 'ઉચ્ચ' : 'Exalted');
  }

  if (planet.status.debilitated) {
    states.push(language === 'hi' ? 'नीच' : language === 'gu' ? 'નીચ' : 'Debilitated');
  }

  if (planet.status.combust) {
    states.push(language === 'hi' ? 'अस्त' : language === 'gu' ? 'અસ્ત' : 'Combust');
  }

  if (planet.status.retrograde) {
    states.push(language === 'hi' ? 'वक्री' : language === 'gu' ? 'વક્રી' : 'Retrograde');
  }

  if (!states.length) {
    return language === 'hi'
      ? 'स्थिति सामान्य'
      : language === 'gu'
      ? 'સ્થિતિ સામાન્ય'
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
  'Rashi Chart': { gu: 'રાશિ ચાર્ટ', hi: 'राशि चार्ट' },
  'Hora Chart': { gu: 'હોરા ચાર્ટ', hi: 'होरा चार्ट' },
  'Drekkana Chart': { gu: 'દ્રેક્કાણ ચાર્ટ', hi: 'द्रेष्काण चार्ट' },
  'Chaturthamsha Chart': { gu: 'ચતુર્થાંશ ચાર્ટ', hi: 'चतुर्थांश चार्ट' },
  'Navamsha Chart': { gu: 'નવાંશ ચાર્ટ', hi: 'नवांश चार्ट' },
  'Dashamsha Chart': { gu: 'દશાંશ ચાર્ટ', hi: 'दशांश चार्ट' },
};

const SIGN_NAME_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  Aries: { gu: 'મેષ', hi: 'मेष' },
  Taurus: { gu: 'વૃષભ', hi: 'वृषभ' },
  Gemini: { gu: 'મિથુન', hi: 'मिथुन' },
  Cancer: { gu: 'કર્ક', hi: 'कर्क' },
  Leo: { gu: 'સિંહ', hi: 'सिंह' },
  Virgo: { gu: 'કન્યા', hi: 'कन्या' },
  Libra: { gu: 'તુલા', hi: 'तुला' },
  Scorpio: { gu: 'વૃશ્ચિક', hi: 'वृश्चिक' },
  Sagittarius: { gu: 'ધનુ', hi: 'धनु' },
  Capricorn: { gu: 'મકર', hi: 'मकर' },
  Aquarius: { gu: 'કુંભ', hi: 'कुंभ' },
  Pisces: { gu: 'મીન', hi: 'मीन' },
};

const PLANET_NAME_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  Dhuma: { gu: 'ધૂમ', hi: 'धूम' },
  Gulika: { gu: 'ગુલિક', hi: 'गुलिक' },
  Indrachapa: { gu: 'ઇન્દ્રચાપ', hi: 'इन्द्रचाप' },
  Jupiter: { gu: 'ગુરુ', hi: 'गुरु' },
  Ketu: { gu: 'કેતુ', hi: 'केतु' },
  Mandi: { gu: 'માંડી', hi: 'मांडी' },
  Mars: { gu: 'મંગળ', hi: 'मंगल' },
  Mercury: { gu: 'બુધ', hi: 'बुध' },
  Moon: { gu: 'ચંદ્ર', hi: 'चंद्र' },
  Neptune: { gu: 'નેપચ્યુન', hi: 'नेप्च्यून' },
  Parivesha: { gu: 'પરિવેષ', hi: 'परिवेष' },
  Pluto: { gu: 'પ્લૂટો', hi: 'प्लूटो' },
  Rahu: { gu: 'રાહુ', hi: 'राहु' },
  Saturn: { gu: 'શનિ', hi: 'शनि' },
  Sun: { gu: 'સૂર્ય', hi: 'सूर्य' },
  Upaketu: { gu: 'ઉપકેતુ', hi: 'उपकेतु' },
  Uranus: { gu: 'યુરેનસ', hi: 'यूरेनस' },
  Venus: { gu: 'શુક્ર', hi: 'शुक्र' },
  Vyatipata: { gu: 'વ્યતિપાત', hi: 'व्यतीपात' },
};

const FOCUS_PHRASE_TRANSLATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  'body, identity, life direction, houses, and visible karma': {
    gu: 'શરીર, ઓળખ, જીવન દિશા, ભાવો અને દેખાતું કર્મ',
    hi: 'शरीर, पहचान, जीवन दिशा, भाव और दिखने वाला कर्म',
  },
  'wealth handling, resources, and money temperament': {
    gu: 'ધન વ્યવહાર, સંસાધન અને પૈસાનું સ્વભાવ',
    hi: 'धन संभाल, संसाधन और पैसे का स्वभाव',
  },
  'courage, siblings, effort, and practical stamina': {
    gu: 'હિંમત, ભાઈ-બહેન, પ્રયત્ન અને વ્યવહારુ સહનશક્તિ',
    hi: 'साहस, भाई-बहन, प्रयास और व्यावहारिक सहनशक्ति',
  },
  'home, property, fixed assets, and inner stability': {
    gu: 'ઘર, મિલકત, સ્થિર સંપત્તિ અને આંતરિક સ્થિરતા',
    hi: 'घर, संपत्ति, स्थिर संपत्ति और अंदरूनी स्थिरता',
  },
  'marriage, dharma, maturity, and deeper planet strength': {
    gu: 'લગ્ન, ધર્મ, પરિપક્વતા અને ગ્રહોની ઊંડી શક્તિ',
    hi: 'विवाह, धर्म, परिपक्वता और ग्रहों की गहरी शक्ति',
  },
  'career, public work, authority, and contribution': {
    gu: 'કારકિર્દી, જાહેર કાર્ય, અધિકાર અને યોગદાન',
    hi: 'करियर, सार्वजनिक काम, अधिकार और योगदान',
  },
};

const CHART_PHRASE_TRANSLATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  'No planet-heavy house stands out in this chart preview.': {
    gu: 'આ ચાર્ટ પૂર્વદર્શનામાં કોઈ ભાવમાં ભારે ગ્રહ સમૂહ દેખાતો નથી.',
    hi: 'इस चार्ट पूर्वावलोकन में कोई भाव ग्रहों से बहुत भारी नहीं दिखता.',
  },
  'D1 remains the root chart for all predictions.': {
    gu: 'દરેક આગાહી માટે D1 મૂળ ચાર્ટ રહે છે.',
    hi: 'हर prediction के लिए D1 मूल चार्ट रहता है.',
  },
  'Premium turns this into detailed chart synthesis with D1 anchoring, dasha timing, strength checks, and report-ready guidance.': {
    gu: 'પ્રીમિયમ તેને D1 આધાર, દશા સમય, શક્તિ તપાસ અને રિપોર્ટ માટે તૈયાર માર્ગદર્શન સાથે ઊંડા ચાર્ટ વાંચનમાં ફેરવે છે.',
    hi: 'प्रीमियम इसे D1 आधार, दशा समय, शक्ति जांच और रिपोर्ट के लिए तैयार मार्गदर्शन के साथ गहरी चार्ट रीडिंग में बदलता है.',
  },
  'D1 is the root chart. Houses can be read with standard house meanings, then refined by dasha, gochar, strength, and divisional support.': {
    gu: 'D1 મૂળ ચાર્ટ છે. ભાવો સામાન્ય ભાવ અર્થથી વાંચાય છે, પછી દશા, ગોચર, શક્તિ અને વિભાગીય સહારે સુધારાય છે.',
    hi: 'D1 मूल चार्ट है. भावों को सामान्य भाव अर्थ से पढ़ा जाता है, फिर दशा, गोचर, शक्ति और वर्गीय सहारे से सुधारा जाता है.',
  },
  'This varga is a focused divisional confirmation chart. Read it through its specific purpose and D1 anchor, not as a standalone general Kundli.': {
    gu: 'આ વર્ગ ખાસ વિષય માટેનું પુષ્ટિ ચાર્ટ છે. તેને તેના હેતુ અને D1 આધારથી વાંચો, અલગ સામાન્ય કુંડળીની જેમ નહીં.',
    hi: 'यह वर्ग खास विषय के लिए पुष्टि चार्ट है. इसे इसके उद्देश्य और D1 आधार से पढ़ें, अलग सामान्य कुंडली की तरह नहीं.',
  },
  'main life chart': {
    gu: 'મુખ્ય જીવન ચાર્ટ',
    hi: 'मुख्य जीवन चार्ट',
  },
  'focused divisional lens': {
    gu: 'કેન્દ્રિત વર્ગીય દૃષ્ટિ',
    hi: 'केंद्रित वर्गीय lens',
  },
  'self, body, identity': {
    gu: 'સ્વ, શરીર, ઓળખ',
    hi: 'स्वयं, शरीर, पहचान',
  },
  'money, speech, family values': {
    gu: 'પૈસા, વાણી, પરિવારના મૂલ્યો',
    hi: 'धन, वाणी, पारिवारिक मूल्य',
  },
  'effort, courage, siblings': {
    gu: 'પ્રયત્ન, હિંમત, ભાઈ-બહેન',
    hi: 'प्रयास, साहस, भाई-बहन',
  },
  'home, mother, emotional base': {
    gu: 'ઘર, માતા, ભાવનાત્મક આધાર',
    hi: 'घर, माता, भावनात्मक आधार',
  },
  'children, learning, merit': {
    gu: 'સંતાન, શિક્ષણ, પુણ્ય',
    hi: 'संतान, सीखना, पुण्य',
  },
  'work pressure, health discipline': {
    gu: 'કામનો દબાવ, આરોગ્ય શિસ્ત',
    hi: 'काम का दबाव, स्वास्थ्य अनुशासन',
  },
  'marriage, partners, contracts': {
    gu: 'લગ્ન, ભાગીદાર, કરાર',
    hi: 'विवाह, साथी, समझौते',
  },
  'change, secrets, transformation': {
    gu: 'બદલાવ, રહસ્ય, પરિવર્તન',
    hi: 'बदलाव, रहस्य, परिवर्तन',
  },
  'fortune, dharma, teachers': {
    gu: 'ભાગ્ય, ધર્મ, ગુરુ',
    hi: 'भाग्य, धर्म, गुरु',
  },
  'career, status, responsibility': {
    gu: 'કારકિર્દી, સ્થાન, જવાબદારી',
    hi: 'करियर, पद, जिम्मेदारी',
  },
  'gains, network, ambitions': {
    gu: 'લાભ, નેટવર્ક, મહત્ત્વાકાંક્ષા',
    hi: 'लाभ, नेटवर्क, महत्वाकांक्षा',
  },
  'sleep, expense, release': {
    gu: 'નિંદ્રા, ખર્ચ, મુક્તિ',
    hi: 'नींद, खर्च, मुक्ति',
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
    return ` पाद ${pada}`;
  }

  if (language === 'gu') {
    return ` પાદ ${pada}`;
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
