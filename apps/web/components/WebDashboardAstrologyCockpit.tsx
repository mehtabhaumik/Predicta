'use client';

import Link from 'next/link';
import type {
  DailyBriefing,
  KundliData,
  PersonalPanchangLayer,
  PurusharthaLifeBalance,
  TransitGocharIntelligence,
  YearlyHoroscopeVarshaphal,
} from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { StatusPill } from './StatusPill';

type WebDashboardAstrologyCockpitProps = {
  dailyBriefing: DailyBriefing;
  gochar: TransitGocharIntelligence;
  kundli?: KundliData;
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
  label: string;
  score: number;
  planet: string;
};

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
  personalPanchang,
  purushartha,
  yearlyHoroscope,
}: WebDashboardAstrologyCockpitProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const weather = buildLifeWeather(kundli, dailyBriefing, gochar);
  const radar = buildRadarItems(gochar);
  const polygonPoints = radarPolygonPoints(radar);
  const dasha = buildDashaDisplay(kundli);
  const activeName = kundli?.birthDetails.name ?? 'Moment sky';

  return (
    <section className="astrology-cockpit glass-panel">
      <div className="cockpit-header">
        <div>
          <div className="section-title">TODAY'S ASTROLOGY COCKPIT</div>
          <h2>{activeName}</h2>
          <p>
            Life weather, current timing, Gochar, and chart focus in one glance.
          </p>
        </div>
        <StatusPill
          label={kundli ? 'Personal chart active' : 'Moment sky preview'}
          tone={kundli ? 'premium' : 'quiet'}
        />
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
            <strong>{gochar.dominantWeight}</strong>
          </div>
          <div className="gochar-radar-wrap">
            <svg className="gochar-radar" viewBox="0 0 220 220" role="img" aria-label="Gochar impact chart">
              <polygon className="gochar-radar-grid" points="110,18 198,82 164,186 56,186 22,82" />
              <polygon className="gochar-radar-grid inner" points="110,48 169,91 146,160 74,160 51,91" />
              <polygon className="gochar-radar-fill" points={polygonPoints} />
              {radar.map((item, index) => (
                <text
                  className="gochar-radar-label"
                  key={item.label}
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
            {radar.map(item => (
              <span key={item.label}>
                {t(item.label)}: {t(item.planet)}
              </span>
            ))}
          </div>
        </div>
      </div>

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
                    sourceScreen: 'Dashboard Personal Panchang',
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
                      sourceScreen: 'Dashboard Purushartha',
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
                      sourceScreen: 'Dashboard Chart Focus',
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
            sourceScreen: 'Dashboard',
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
    label,
    planet: insight?.planet ?? planet,
    score,
  };
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
