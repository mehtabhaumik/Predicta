'use client';

import Link from 'next/link';
import { useState } from 'react';
import type {
  DailyBriefing,
  KundliData,
  NumerologyFoundationProfile,
  NumerologyNumberInsight,
  PersonalPanchangLayer,
  PurusharthaLifeBalance,
  TransitGocharIntelligence,
  YearlyHoroscopeVarshaphal,
} from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

type WebDashboardAstrologyCockpitProps = {
  dailyBriefing: DailyBriefing;
  gochar: TransitGocharIntelligence;
  kundli?: KundliData;
  numerology?: NumerologyFoundationProfile;
  personalPanchang: PersonalPanchangLayer;
  purushartha: PurusharthaLifeBalance;
  yearlyHoroscope: YearlyHoroscopeVarshaphal;
};

type WeatherItem = {
  label: string;
  score: number;
  status: 'Supportive' | 'Mixed' | 'Needs care';
  tone: 'supportive' | 'mixed' | 'challenging';
  reason: string;
};

type RadarItem = {
  action: string;
  headline: string;
  label: string;
  score: number;
  planet: string;
  strength: 'Strong' | 'Moderate' | 'Low';
  summary: string;
};

type RadarRange = 'today' | 'month' | 'quarter' | 'major';

const radarRanges: Array<{
  description: string;
  label: string;
  value: RadarRange;
}> = [
  {
    description: 'Immediate pressure and support.',
    label: 'Today',
    value: 'today',
  },
  {
    description: 'Near-term rhythm for the current month.',
    label: 'This Month',
    value: 'month',
  },
  {
    description: 'Planning signal for the next 90 days.',
    label: 'Next 90 Days',
    value: 'quarter',
  },
  {
    description: 'Slow-moving transit atmosphere.',
    label: 'Major Transit',
    value: 'major',
  },
];

const focusCards = [
  {
    chart: 'D1 + D2',
    label: 'Money',
    proof: '2nd + 11th house',
    prompt: 'Read my money focus from 2nd house, 11th house, D1, D2, dasha, and Gochar.',
  },
  {
    chart: 'D1 + D10',
    label: 'Career',
    proof: '10th house + D10',
    prompt: 'Read my career focus from 10th house, D10, dasha, and Gochar.',
  },
  {
    chart: 'D1 + D9',
    label: 'Marriage',
    proof: '7th house + D9',
    prompt: 'Read my relationship focus from 7th house, D9, Venus, Jupiter, dasha, and Gochar.',
  },
  {
    chart: 'D1 + D20',
    label: 'Spirituality',
    proof: '9th house + D20',
    prompt: 'Read my spiritual focus from 9th house, D20, Jupiter, Ketu, and current dasha.',
  },
  {
    chart: 'D1 + D12',
    label: 'Family',
    proof: '4th house + D12',
    prompt: 'Read my family focus from 4th house, D12, Moon, and current dasha.',
  },
] as const;

export function WebDashboardAstrologyCockpit({
  dailyBriefing,
  gochar,
  kundli,
  numerology,
  personalPanchang,
  purushartha,
  yearlyHoroscope,
}: WebDashboardAstrologyCockpitProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const weather = buildLifeWeather(kundli, dailyBriefing, gochar);
  const radar = buildRadarItems(gochar);
  const [radarRange, setRadarRange] = useState<RadarRange>('today');
  const [activeRadarAxis, setActiveRadarAxis] = useState(radar[0]?.label ?? 'Growth');
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showChallengeNote, setShowChallengeNote] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const rangeRadar = applyRadarRange(radar, radarRange);
  const polygonPoints = radarPolygonPoints(rangeRadar);
  const natalSupportPoints = radarPolygonPoints(buildNatalSupportRadar(rangeRadar));
  const activeRadarItem =
    rangeRadar.find(item => item.label === activeRadarAxis) ?? rangeRadar[0];
  const actionPlan = buildGocharActionPlan(rangeRadar, activeRadarItem, gochar);
  const dasha = buildDashaDisplay(kundli);
  const activeName = kundli?.birthDetails.name ?? 'Moment sky';
  const activeRange = radarRanges.find(range => range.value === radarRange) ?? radarRanges[0];

  return (
    <section className="astrology-cockpit glass-panel">
      <div className="cockpit-header">
        <div>
          <div className="section-title">{t("TODAY'S READING MAP")}</div>
          <h2>{activeName}</h2>
          <p>
            Life weather, current timing, Gochar, and chart focus in one glance.
          </p>
        </div>
      </div>

      <div className="cockpit-grid">
        <div className="cockpit-panel life-weather-panel">
          <div className="cockpit-panel-title">
            <span>Life weather</span>
            <strong>{dailyBriefing.status === 'ready' ? 'Personal' : 'Preview'}</strong>
          </div>
          <div className="life-weather-list">
            {weather.map(item => (
              <div className="life-weather-row" key={item.label}>
                <div className="life-weather-copy">
                  <strong>{item.label}</strong>
                  <span>{item.status}</span>
                </div>
                <div className={`life-weather-track ${item.tone}`}>
                  <span style={{ width: `${item.score}%` }} />
                </div>
                <p>{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cockpit-panel dasha-timeline-panel">
          <div className="cockpit-panel-title">
            <span>Current dasha</span>
            <strong>{dasha.badge}</strong>
          </div>
          <div className="dasha-timeline-line">
            <span style={{ width: `${dasha.progress}%` }} />
          </div>
          <div className="dasha-timeline-copy">
            <h3>{dasha.title}</h3>
            <p>{dasha.subtitle}</p>
            <small>{dasha.window}</small>
          </div>
          <Link
            className="button secondary"
            href={kundli ? '/dashboard/timeline' : '/dashboard/kundli'}
          >
            {kundli ? 'Open Timeline' : 'Create Kundli'}
          </Link>
        </div>

        <div className="cockpit-panel gochar-radar-panel">
          <div className="cockpit-panel-title">
            <span>Gochar impact</span>
            <button
              className={`gochar-weight-button ${gochar.dominantWeight}`}
              onClick={() => setShowChallengeNote(current => !current)}
              type="button"
            >
              {gochar.dominantWeight}
            </button>
          </div>
          {showChallengeNote ? (
            <p className="gochar-challenge-note">
              {t(
                'This does not mean bad. It means the chart is asking for discipline, patience, and conscious choices.',
              )}
            </p>
          ) : null}
          <div className="gochar-range-toggle" role="group" aria-label={t('Gochar time range')}>
            {radarRanges.map(range => (
              <button
                className={radarRange === range.value ? 'active' : ''}
                key={range.value}
                onClick={() => setRadarRange(range.value)}
                type="button"
              >
                {t(range.label)}
              </button>
            ))}
          </div>
          <div className="gochar-radar-wrap">
            <svg className="gochar-radar" viewBox="0 0 220 220" role="img" aria-label="Gochar impact chart">
              <polygon className="gochar-radar-grid" points="110,18 198,82 164,186 56,186 22,82" />
              <polygon className="gochar-radar-grid inner" points="110,48 169,91 146,160 74,160 51,91" />
              {compareMode ? (
                <polygon className="gochar-radar-natal" points={natalSupportPoints} />
              ) : null}
              <polygon className="gochar-radar-fill" points={polygonPoints} />
              {rangeRadar.map((item, index) => (
                <text
                  className={
                    activeRadarItem?.label === item.label
                      ? 'gochar-radar-label active'
                      : 'gochar-radar-label'
                  }
                  key={item.label}
                  onClick={() => setActiveRadarAxis(item.label)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setActiveRadarAxis(item.label);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  x={radarLabelPoint(index).x}
                  y={radarLabelPoint(index).y}
                  textAnchor="middle"
                >
                  {t(item.label)}
                </text>
              ))}
            </svg>
          </div>
          <div className="gochar-radar-legend">
            {rangeRadar.map(item => (
              <button
                className={activeRadarItem?.label === item.label ? 'active' : ''}
                key={item.label}
                onClick={() => setActiveRadarAxis(item.label)}
                type="button"
              >
                {t(item.label)}: {t(item.planet)}
              </button>
            ))}
          </div>
          {activeRadarItem ? (
            <div className="gochar-radar-insight" aria-live="polite">
              <div>
                <span>{t(activeRange.label)} · {t(activeRadarItem.strength)}</span>
                <strong>
                  {t(activeRadarItem.label)}: {t(activeRadarItem.planet)}
                </strong>
              </div>
              <p>{t(activeRadarItem.summary)}</p>
              <small>{t(activeRadarItem.action)}</small>
            </div>
          ) : null}
          <div className="gochar-radar-actions">
            <button
              className="button secondary"
              onClick={() => setShowActionPlan(current => !current)}
              type="button"
            >
              {showActionPlan ? t('Hide action plan') : t('Show my action plan')}
            </button>
            <button
              className="button secondary"
              onClick={() => setCompareMode(current => !current)}
              type="button"
            >
              {compareMode ? t('Hide compare') : t('Compare with natal support')}
            </button>
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli,
                prompt: `Explain why my current Gochar feels ${gochar.dominantWeight}. Focus on ${activeRadarItem?.label ?? 'the strongest transit axis'} and give me practical next steps.`,
                school: 'PARASHARI',
                selectedSection: 'Current Gochar radar',
                sourceScreen: 'My Astrology Gochar Radar',
              })}
            >
              {t('Ask why this feels challenging')}
            </Link>
          </div>
          {showActionPlan ? (
            <ol className="gochar-action-plan">
              {actionPlan.map(action => (
                <li key={action}>{t(action)}</li>
              ))}
            </ol>
          ) : null}
          <p className="gochar-range-note">{t(activeRange.description)}</p>
        </div>
      </div>

      {numerology?.status === 'ready' ? (
        <div className="numerology-dashboard-panel">
          <div className="numerology-dashboard-copy">
            <span>{t('Numerology rhythm')}</span>
            <strong>
              {t('Name')} {numerology.nameNumber.root} · {t('Birth')}{' '}
              {numerology.birthNumber.root} · {t('Destiny')}{' '}
              {numerology.destinyNumber.root}
            </strong>
            <p>{t(numerology.guidance)}</p>
          </div>
          <div className="numerology-number-grid">
            {([
              ['Name', numerology.nameNumber],
              ['Birth', numerology.birthNumber],
              ['Destiny', numerology.destinyNumber],
              ['Today', numerology.personalDay],
            ] as Array<[string, NumerologyNumberInsight]>).map(([label, item]) => (
              <div className="numerology-number-card" key={String(label)}>
                <span>{t(String(label))}</span>
                <strong>{item.root}</strong>
                <small>{t(item.label)}</small>
              </div>
            ))}
          </div>
          <Link
            className="button secondary"
            href={buildPredictaChatHref({
              kundli,
              prompt:
                'Read my numerology profile with name number, birth number, destiny number, and current personal timing.',
              school: 'NUMEROLOGY',
              selectedSection: 'Numerology rhythm',
              sourceScreen: 'My Astrology Numerology',
            })}
          >
            {t('Ask Numerology Predicta')}
          </Link>
        </div>
      ) : null}

      <div className="personal-panchang-panel">
        <div className="personal-panchang-copy">
          <span>Personal Panchang</span>
          <strong>
            {t(personalPanchang.weekdayLord)} {t('day')}, {t(personalPanchang.tithi)}
          </strong>
          <p>{t(personalPanchang.todayFocus)}</p>
        </div>
        <div className="personal-panchang-signals">
          {personalPanchang.signals.slice(0, 4).map(signal => (
            <div className={`personal-panchang-signal ${signal.tone}`} key={signal.id}>
              <span>{signal.label}</span>
              <strong>{t(signal.value)}</strong>
              <small>{t(signal.meaning)}</small>
            </div>
          ))}
        </div>
        <div className="personal-panchang-actions">
          <div>
            <span>Best for</span>
            <strong>
              {personalPanchang.bestFor
                .slice(0, 2)
                .map(item => t(item))
                .join(', ')}
            </strong>
          </div>
          <Link
            className="button secondary"
            href={
              kundli
                ? buildPredictaChatHref({
                    kundli,
                    prompt: personalPanchang.askPrompt,
                    selectedSection: 'Personal Panchang',
                    sourceScreen: 'My Astrology Personal Panchang',
                  })
                : '/dashboard/kundli'
            }
          >
            Ask Panchang
          </Link>
        </div>
      </div>

      <div className="purushartha-panel">
        <div className="purushartha-copy">
          <span>Life balance</span>
          <strong>
            {t(purushartha.dominant.label)} {t('leads now')}
          </strong>
          <p>{t(purushartha.summary)}</p>
        </div>
        <div className="purushartha-axis-grid">
          {purushartha.axes.map(axis => (
            <Link
              className={`purushartha-axis-card ${axis.tone}`}
              href={
                kundli
                  ? buildPredictaChatHref({
                      kundli,
                      prompt: `Explain my ${axis.label} Purushartha balance with chart proof, timing, karmic pattern, and one practical step.`,
                      selectedSection: `${axis.label} Purushartha`,
                      sourceScreen: 'My Astrology Purushartha',
                    })
                  : '/dashboard/kundli'
              }
              key={axis.category}
            >
              <div>
                <span>{t(axis.label)}</span>
                <strong>{axis.score}%</strong>
              </div>
              <div className="purushartha-track">
                <span style={{ width: `${axis.score}%` }} />
              </div>
              <small>{t(axis.currentEmphasis)}</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="chart-focus-strip">
        <div className="chart-focus-intro">
          <span>Chart focus</span>
          <strong>{t('Tap one life area')}</strong>
        </div>
        <div className="chart-focus-grid">
          {focusCards.map(card => (
            <Link
              className="chart-focus-card"
              href={
                kundli
                  ? buildPredictaChatHref({
                      kundli,
                      prompt: card.prompt,
                      selectedSection: card.label,
                      sourceScreen: 'My Astrology Chart Focus',
                    })
                  : '/dashboard/kundli'
              }
              key={card.label}
            >
              <span>{card.chart}</span>
              <strong>{card.label}</strong>
              <small>{card.proof}</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="cockpit-bottom-row">
        <div>
          <span>Year signal</span>
          <strong>
            {yearlyHoroscope.status === 'ready'
              ? yearlyHoroscope.yearLabel
              : 'Waiting for Kundli'}
          </strong>
        </div>
        <Link
          className="button"
          href={buildPredictaChatHref({
            kundli,
            prompt: 'Read my selected Kundli and suggest the best next focus.',
            sourceScreen: 'My Astrology',
          })}
        >
          Ask Predicta
        </Link>
      </div>
    </section>
  );
}

function buildLifeWeather(
  kundli: KundliData | undefined,
  briefing: DailyBriefing,
  gochar: TransitGocharIntelligence,
): WeatherItem[] {
  const cues = new Map(briefing.cues.map(cue => [cue.area, cue]));
  const sav = kundli?.ashtakavarga.sav ?? [];
  const strongest = kundli?.ashtakavarga.strongestHouses ?? [];
  const weakest = kundli?.ashtakavarga.weakestHouses ?? [];
  const transitWeight = gochar.dominantWeight;

  return [
    buildWeatherItem({
      base: scoreHouse(sav, 2, strongest, weakest),
      cueWeight: cues.get('money')?.weight,
      label: 'Money',
      reason:
        cues.get('money')?.text ??
        'Create a Kundli to personalize money weather through 2nd and 11th houses.',
      transitWeight,
    }),
    buildWeatherItem({
      base: scoreHouse(sav, 10, strongest, weakest),
      cueWeight: cues.get('career')?.weight,
      label: 'Career',
      reason:
        cues.get('career')?.text ??
        'Career weather becomes personal after D1, D10, dasha, and Gochar are ready.',
      transitWeight,
    }),
    buildWeatherItem({
      base: scoreHouse(sav, 7, strongest, weakest),
      cueWeight: cues.get('relationship')?.weight,
      label: 'Relationship',
      reason:
        cues.get('relationship')?.text ??
        'Relationship weather reads the 7th house, D9, Venus, and Jupiter.',
      transitWeight,
    }),
    buildWeatherItem({
      base: scoreHouse(sav, 1, strongest, weakest),
      label: 'Energy',
      reason: kundli
        ? `${kundli.lagna} Lagna sets today’s body and pace baseline.`
        : 'Moment sky preview until your birth chart is saved.',
      transitWeight,
    }),
    buildWeatherItem({
      base: scoreHouse(sav, 4, strongest, weakest),
      label: 'Mind',
      reason: kundli
        ? `${kundli.moonSign} Moon and ${kundli.nakshatra} nakshatra shape emotional weather.`
        : 'Moon-based mind weather becomes personal after Kundli creation.',
      transitWeight,
    }),
  ];
}

function buildWeatherItem({
  base,
  cueWeight,
  label,
  reason,
  transitWeight,
}: {
  base: number;
  cueWeight?: WeatherItem['tone'] | 'neutral';
  label: string;
  reason: string;
  transitWeight: WeatherItem['tone'] | 'neutral';
}): WeatherItem {
  const cueAdjustment = weightAdjustment(cueWeight);
  const transitAdjustment = Math.round(weightAdjustment(transitWeight) / 2);
  const score = clamp(base + cueAdjustment + transitAdjustment, 18, 94);
  const tone: WeatherItem['tone'] =
    score >= 68 ? 'supportive' : score >= 42 ? 'mixed' : 'challenging';

  return {
    label,
    reason,
    score,
    status:
      tone === 'supportive'
        ? 'Supportive'
        : tone === 'mixed'
          ? 'Mixed'
          : 'Needs care',
    tone,
  };
}

function scoreHouse(
  sav: number[],
  house: number,
  strongest: number[],
  weakest: number[],
): number {
  if (strongest.includes(house)) {
    return 74;
  }
  if (weakest.includes(house)) {
    return 36;
  }

  const score = sav[house - 1];
  if (typeof score !== 'number') {
    return 56;
  }

  return clamp(Math.round((score / 40) * 100), 28, 84);
}

function weightAdjustment(weight?: 'supportive' | 'challenging' | 'mixed' | 'neutral'): number {
  if (weight === 'supportive') {
    return 12;
  }
  if (weight === 'challenging') {
    return -14;
  }
  if (weight === 'mixed') {
    return -2;
  }
  return 0;
}

function buildDashaDisplay(kundli?: KundliData): {
  badge: string;
  progress: number;
  subtitle: string;
  title: string;
  window: string;
} {
  if (!kundli) {
    return {
      badge: 'Pending',
      progress: 12,
      subtitle: 'Create a Kundli to see your personal life chapter.',
      title: 'Dasha timeline waiting',
      window: 'Birth date, time, and place needed',
    };
  }

  const current = kundli.dasha.current;
  const start = new Date(current.startDate).getTime();
  const end = new Date(current.endDate).getTime();
  const now = Date.now();
  const progress =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? clamp(Math.round(((now - start) / (end - start)) * 100), 4, 96)
      : 50;

  return {
    badge: 'Active now',
    progress,
    subtitle: `${current.mahadasha} sets the chapter. ${current.antardasha} shows the active sub-focus.`,
    title: `${current.mahadasha} → ${current.antardasha}`,
    window: `${formatShortDate(current.startDate)} to ${formatShortDate(current.endDate)}`,
  };
}

function buildRadarItems(gochar: TransitGocharIntelligence): RadarItem[] {
  const insights = gochar.planetInsights;

  return [
    radarItem('Growth', 'Jupiter', insights, 64),
    radarItem('Discipline', 'Saturn', insights, 58),
    radarItem('Change', 'Rahu', insights, 52),
    radarItem('Pressure', 'Ketu', insights, 44),
    radarItem('Support', 'Venus', insights, 60),
  ];
}

function radarItem(
  label: string,
  planet: string,
  insights: TransitGocharIntelligence['planetInsights'],
  fallback: number,
): RadarItem {
  const insight = insights.find(item => item.planet === planet);
  const score = insight
    ? clamp(58 + weightAdjustment(insight.weight), 28, 90)
    : fallback;

  return {
    action:
      insight?.practicalGuidance ??
      `${planet} asks for one steady action today. Keep the move practical, visible, and easy to repeat.`,
    headline: insight?.headline ?? `${planet} is shaping ${label.toLowerCase()}.`,
    label,
    planet: insight?.planet ?? planet,
    score,
    strength: score >= 68 ? 'Strong' : score >= 48 ? 'Moderate' : 'Low',
    summary:
      insight?.simpleMeaning ??
      `${planet} is the main carrier for this ${label.toLowerCase()} axis, so use it as a focused signal rather than a fixed prediction.`,
  };
}

function applyRadarRange(items: RadarItem[], range: RadarRange): RadarItem[] {
  const rangeConfig: Record<RadarRange, { label: string; shift: number }> = {
    major: { label: 'major transit pattern', shift: 8 },
    month: { label: 'monthly rhythm', shift: 4 },
    quarter: { label: '90-day planning rhythm', shift: 6 },
    today: { label: 'today', shift: 0 },
  };
  const config = rangeConfig[range];

  return items.map((item, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    const score = clamp(item.score + config.shift * direction, 24, 94);
    return {
      ...item,
      action: `${item.action} For ${config.label}, keep the next step smaller than the pressure.`,
      score,
      strength: score >= 68 ? 'Strong' : score >= 48 ? 'Moderate' : 'Low',
      summary:
        range === 'today'
          ? item.summary
          : `${item.summary} This view stretches the signal into the ${config.label}, so read it as planning weather rather than a one-day verdict.`,
    };
  });
}

function buildNatalSupportRadar(items: RadarItem[]): RadarItem[] {
  return items.map((item, index) => ({
    ...item,
    score: clamp(Math.round(item.score * 0.82 + 10 + index * 1.5), 30, 88),
  }));
}

function buildGocharActionPlan(
  items: RadarItem[],
  active: RadarItem | undefined,
  gochar: TransitGocharIntelligence,
): string[] {
  const strongest = [...items].sort((a, b) => b.score - a.score)[0];
  const lowest = [...items].sort((a, b) => a.score - b.score)[0];

  return [
    active
      ? `Use ${active.planet} for ${active.label.toLowerCase()}: ${active.action}`
      : gochar.snapshotSummary,
    strongest
      ? `Lean into ${strongest.label.toLowerCase()} while it is ${strongest.strength.toLowerCase()}; make one visible move and avoid over-expanding it.`
      : 'Choose one practical move and keep it observable today.',
    lowest
      ? `Protect the ${lowest.label.toLowerCase()} area; do not force decisions where the signal is still ${lowest.strength.toLowerCase()}.`
      : 'Keep the day simple if the transit evidence feels unclear.',
  ];
}

function radarPolygonPoints(items: RadarItem[]): string {
  return items
    .map((item, index) => {
      const point = radarPoint(index, item.score);
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

function radarPoint(index: number, score: number): { x: number; y: number } {
  const angle = -90 + index * 72;
  const radius = (score / 100) * 88;
  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.round(110 + Math.cos(radians) * radius),
    y: Math.round(110 + Math.sin(radians) * radius),
  };
}

function radarLabelPoint(index: number): { x: number; y: number } {
  const angle = -90 + index * 72;
  const radius = 104;
  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.round(110 + Math.cos(radians) * radius),
    y: Math.round(114 + Math.sin(radians) * radius),
  };
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
