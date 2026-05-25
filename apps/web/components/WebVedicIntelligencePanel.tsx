'use client';

import Link from 'next/link';
import {
  buildParashariChalitChart,
  composeChartInsight,
  composeVedicIntelligenceContract,
} from '@pridicta/astrology';
import type {
  ChartData,
  ChartInsightProfile,
  KundliData,
  VedicIntelligenceSection,
} from '@pridicta/types';
import { WebKundliChart } from './WebKundliChart';

type ProgressiveChartCard = {
  chart?: ChartData;
  id: string;
  profile?: ChartInsightProfile;
  title: string;
};

export function WebVedicIntelligencePanel({
  hasPremiumAccess,
  kundli,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
}): React.JSX.Element {
  const intelligence = composeVedicIntelligenceContract({
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    kundli,
  });
  const focusChartCards: ProgressiveChartCard[] = [
    { chart: kundli?.charts.D1, id: 'D1', title: 'D1 / Rashi' },
    {
      chart: intelligence.moonChart.chart,
      id: 'MOON',
      profile: 'moon',
      title: 'Moon / Chandra Lagna',
    },
    { chart: kundli?.charts.D9, id: 'D9', title: 'D9 / Navamsa' },
    { chart: kundli?.charts.D10, id: 'D10', title: 'D10 / Dashamsa' },
    {
      chart: kundli ? buildParashariChalitChart(kundli) : undefined,
      id: 'CHALIT',
      profile: 'chalit',
      title: 'Chalit',
    },
  ];
  const birthSnapshotSections = [
    intelligence.panchang,
    intelligence.avakhadaChakra,
    intelligence.ghatakFavorable,
  ];
  const classicalSections = [
    intelligence.houseWisePlacements,
    intelligence.friendshipTable,
    intelligence.beneficMalefic,
    intelligence.chalitTable,
    intelligence.samsa,
    intelligence.ashtakavarga,
    intelligence.prastarashtakavarga,
  ];

  return (
    <section className="vedic-intelligence-panel glass-panel">
      <div className="vedic-intelligence-heading">
        <div>
          <p className="section-title">PREDICTA VEDIC</p>
          <h2>Clean Vedic snapshot, not a 56-page wall</h2>
          <p>
            Start with the essentials, open advanced tables only when you want
            proof, and use the PDF as the full deep reading surface.
          </p>
        </div>
        <div className="vedic-intelligence-snapshot">
          <span>Birth Snapshot</span>
          <strong>
            {intelligence.snapshot.lagna} Lagna · {intelligence.snapshot.moonSign} Moon
          </strong>
          <p>{intelligence.snapshot.currentDasha}</p>
        </div>
      </div>

      <ProgressiveGroup
        eyebrow="BIRTH SNAPSHOT"
        title="Panchang, Avakhada, Ghatak and favorable points"
        body="These are the quick context cards. They tell the user what matters now without forcing them into dense tables."
      >
        <div className="vedic-intelligence-grid compact">
          {birthSnapshotSections.map(section => (
            <SectionCard
              hasPremiumAccess={hasPremiumAccess}
              key={section.id}
              section={section}
            />
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="CHARTS"
        title="Focus charts first, full library deliberately"
        body="The default flow stays simple: D1, Moon, D9, D10, and Chalit first. The complete varga library is still one click away."
        action={
          <Link className="button secondary" href="/dashboard/charts">
            Open full chart library
          </Link>
        }
      >
        <div className="vedic-chart-order">
          {focusChartCards.map(card => (
            <article key={card.id}>
              <span>{card.id}</span>
              <strong>{card.title}</strong>
              <p>
                {card.chart?.supported
                  ? 'Ready for a plain-language prediction.'
                  : 'Pending evidence; Predicta will not invent this chart.'}
              </p>
            </article>
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="WHAT THIS MEANS"
        title="Short predictive cards per focus chart"
        body="Free users get one useful chart prediction. Premium users see a deeper but still compact signal on-screen."
      >
        <div className="vedic-intelligence-grid">
          {focusChartCards.map(card => (
            <ChartMeaningCard
              card={card}
              hasPremiumAccess={hasPremiumAccess}
              key={card.id}
              kundli={kundli}
            />
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="CURRENT TIMING"
        title="Mahadasha Phala without clutter"
        body="Timing has one focused card here. The PDF carries the complete Mahadasha, Antardasha, and Pratyantardasha structure."
      >
        <SectionCard
          hasPremiumAccess={hasPremiumAccess}
          section={intelligence.mahadashaPhala}
        />
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="CLASSICAL TABLES"
        title="Open proof only when needed"
        body="Friendship, house-wise evidence, Chalit table, Ashtakavarga, Prastara, Samsa, and related proof stay accessible but collapsed by default."
      >
        <div className="vedic-classical-stack">
          {classicalSections.map(section => (
            <details className="vedic-disclosure" key={section.id}>
              <summary>
                <span>{section.status === 'ready' ? 'Ready' : 'Pending'}</span>
                <strong>{section.title}</strong>
              </summary>
              <p>{section.freeInsight}</p>
              {hasPremiumAccess ? <small>{section.premiumAnalysis}</small> : null}
              {section.limitations[0] ? <em>{section.limitations[0]}</em> : null}
            </details>
          ))}
        </div>
      </ProgressiveGroup>

      <details className="vedic-disclosure vedic-soul-disclosure">
        <summary>
          <span>SOUL CHARTS</span>
          <strong>Swamsa and Karakamsha chart previews</strong>
        </summary>
        <div className="vedic-soul-chart-grid">
          {kundli && intelligence.swamsa.chart ? (
            <div className="vedic-moon-chart-card">
              <div>
                <p className="section-title">SWAMSA</p>
                <h3>{intelligence.swamsa.title}</h3>
                <p>{intelligence.swamsa.freeInsight}</p>
              </div>
              <WebKundliChart
                birthDetails={kundli.birthDetails}
                chart={intelligence.swamsa.chart}
                hasPremiumAccess={hasPremiumAccess}
                insightProfile="swamsa"
                kundli={kundli}
                presentation="full"
                centerLabel="Swamsa"
                sectionTitle="Swamsa Chart"
              />
            </div>
          ) : null}

          {kundli && intelligence.karakamsha.chart ? (
            <div className="vedic-moon-chart-card">
              <div>
                <p className="section-title">KARAKAMSHA</p>
                <h3>{intelligence.karakamsha.title}</h3>
                <p>{intelligence.karakamsha.freeInsight}</p>
              </div>
              <WebKundliChart
                birthDetails={kundli.birthDetails}
                chart={intelligence.karakamsha.chart}
                hasPremiumAccess={hasPremiumAccess}
                insightProfile="karakamsha"
                kundli={kundli}
                presentation="full"
                centerLabel="Karakamsha"
                sectionTitle="Karakamsha Chart"
              />
            </div>
          ) : null}
        </div>
      </details>

      <div className="vedic-action-band">
        <div>
          <span>ASK PREDICTA</span>
          <strong>Ask from the section you are reading</strong>
          <p>
            Predicta can explain Panchang, a focus chart, Mahadasha Phala, or
            any classical table without changing the screen into a report wall.
          </p>
        </div>
        <div className="report-download-actions">
          <Link className="button secondary" href="/dashboard/chat">
            Ask Predicta
          </Link>
          <Link className="button primary" href="/dashboard/report">
            Download Full Report
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProgressiveGroup({
  action,
  body,
  children,
  eyebrow,
  title,
}: {
  action?: React.ReactNode;
  body: string;
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <div className="vedic-progressive-group">
      <div className="vedic-progressive-heading">
        <div>
          <span>{eyebrow}</span>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SectionCard({
  hasPremiumAccess,
  section,
}: {
  hasPremiumAccess: boolean;
  section: VedicIntelligenceSection;
}): React.JSX.Element {
  return (
    <article
      className={`vedic-intelligence-card ${
        section.status === 'pending' ? 'is-pending' : ''
      }`}
    >
      <span>{section.status === 'ready' ? 'Ready' : 'Pending'}</span>
      <strong>{section.title}</strong>
      <p>{section.freeInsight}</p>
      {hasPremiumAccess ? <small>{section.premiumAnalysis}</small> : null}
      {section.limitations[0] ? <em>{section.limitations[0]}</em> : null}
    </article>
  );
}

function ChartMeaningCard({
  card,
  hasPremiumAccess,
  kundli,
}: {
  card: ProgressiveChartCard;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
}): React.JSX.Element {
  const insight = card.chart?.supported
    ? composeChartInsight({
        chart: card.chart,
        hasPremiumAccess,
        kundli,
        profile: card.profile,
      })
    : undefined;

  return (
    <article className="vedic-intelligence-card">
      <span>{card.id}</span>
      <strong>{card.title}</strong>
      <p>
        {insight
          ? insight.whatItSays
          : 'This chart is pending evidence, so Predicta keeps it honest instead of inventing a reading.'}
      </p>
      {insight ? <small>{insight.currentGuidance}</small> : null}
      {hasPremiumAccess && insight?.premiumInsight ? (
        <em>{insight.premiumInsight.headline}</em>
      ) : null}
    </article>
  );
}
