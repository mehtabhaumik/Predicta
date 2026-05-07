'use client';

import Link from 'next/link';
import type { TransitGocharIntelligence } from '@pridicta/types';

type WebTransitGocharPanelProps = {
  intelligence: TransitGocharIntelligence;
};

export function WebTransitGocharPanel({
  intelligence,
}: WebTransitGocharPanelProps): React.JSX.Element {
  const signals = [
    ...intelligence.topOpportunities.slice(0, 2),
    ...intelligence.cautionSignals.slice(0, 2),
  ];

  return (
    <section className="gochar-panel glass-panel">
      <div className="gochar-hero">
        <div>
          <div className="section-title">TRANSIT + GOCHAR</div>
          <h2>{intelligence.title}</h2>
          <p>{intelligence.subtitle}</p>
        </div>
        <span className={`gochar-badge ${intelligence.dominantWeight}`}>
          {intelligence.dominantWeight}
        </span>
      </div>

      <div className="gochar-summary-grid">
        <div>
          <span>Calculated</span>
          <strong>{formatDate(intelligence.calculatedAt)}</strong>
          <small>{intelligence.depth === 'PREMIUM' ? 'Premium depth' : 'Free insight'}</small>
        </div>
        <p>{intelligence.snapshotSummary}</p>
      </div>

      {intelligence.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : (
        <>
          <div className="gochar-signal-grid">
            {signals.map(signal => (
              <article className="gochar-signal-card" key={signal.id}>
                <span>{signal.weight}</span>
                <strong>{signal.headline}</strong>
                <p>{signal.practicalGuidance}</p>
              </article>
            ))}
          </div>

          <div className="gochar-month-list">
            <div>
              <span>Planning cards</span>
              <h3>Next transit moves</h3>
            </div>
            {intelligence.monthlyCards.slice(0, 3).map(card => (
              <article className="gochar-month-card" key={card.id}>
                <div>
                  <strong>{card.monthLabel}</strong>
                  <small>{card.planets.join(', ') || 'Gochar'}</small>
                </div>
                <p>{card.guidance}</p>
              </article>
            ))}
          </div>

          <div className="gochar-overlay-note">
            <span>Dasha overlay</span>
            <p>{intelligence.dashaOverlay}</p>
          </div>

          <div className="gochar-cta-row">
            {intelligence.ctas.slice(0, 3).map(cta => (
              <Link
                className="button secondary"
                href={`/dashboard/chat?prompt=${encodeURIComponent(cta.prompt)}`}
                key={cta.id}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function formatDate(value: string): string {
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
