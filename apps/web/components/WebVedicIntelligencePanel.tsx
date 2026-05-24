'use client';

import { composeVedicIntelligenceContract } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { WebKundliChart } from './WebKundliChart';

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
  const visibleSections = [
    intelligence.houseWisePlacements,
    intelligence.friendshipTable,
    intelligence.beneficMalefic,
    intelligence.chalitTable,
    intelligence.panchang,
    intelligence.ashtakavarga,
    intelligence.mahadashaPhala,
    intelligence.samsa,
    intelligence.ghatakFavorable,
    intelligence.karakamsha,
    intelligence.prastarashtakavarga,
    intelligence.avakhadaChakra,
  ];

  return (
    <section className="vedic-intelligence-panel glass-panel">
      <div className="vedic-intelligence-heading">
        <div>
          <p className="section-title">VEDIC INTELLIGENCE</p>
          <h2>Shared Vedic intelligence contract</h2>
          <p>
            These sections are built from the same data model that web, mobile,
            reports, and PDFs consume. Pending modules stay honest instead of
            pretending a calculation exists.
          </p>
        </div>
        <div className="vedic-intelligence-snapshot">
          <span>{intelligence.ownerName}</span>
          <strong>
            {intelligence.snapshot.lagna} Lagna · {intelligence.snapshot.moonSign} Moon
          </strong>
          <p>{intelligence.snapshot.currentDasha}</p>
        </div>
      </div>

      <div className="vedic-chart-order">
        {intelligence.chartOrder.slice(0, 6).map(item => (
          <article key={item.id}>
            <span>{item.id}</span>
            <strong>{item.title}</strong>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>

      {kundli && intelligence.moonChart.chart ? (
        <div className="vedic-moon-chart-card">
          <div>
            <p className="section-title">CHANDRA LAGNA</p>
            <h3>{intelligence.moonChart.title}</h3>
            <p>{intelligence.moonChart.freeInsight}</p>
          </div>
          <WebKundliChart
            birthDetails={kundli.birthDetails}
            chart={intelligence.moonChart.chart}
            hasPremiumAccess={hasPremiumAccess}
            kundli={kundli}
            presentation="full"
          />
        </div>
      ) : null}

      <div className="vedic-intelligence-grid">
        {visibleSections.map(section => (
          <article
            className={`vedic-intelligence-card ${
              section.status === 'pending' ? 'is-pending' : ''
            }`}
            key={section.id}
          >
            <span>{section.status === 'ready' ? 'Ready' : 'Pending'}</span>
            <strong>{section.title}</strong>
            <p>{section.freeInsight}</p>
            {hasPremiumAccess ? <small>{section.premiumAnalysis}</small> : null}
            {section.limitations[0] ? <em>{section.limitations[0]}</em> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
