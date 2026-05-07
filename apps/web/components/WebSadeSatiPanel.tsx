'use client';

import Link from 'next/link';
import type { SadeSatiIntelligence } from '@pridicta/types';

type WebSadeSatiPanelProps = {
  intelligence: SadeSatiIntelligence;
};

export function WebSadeSatiPanel({
  intelligence,
}: WebSadeSatiPanelProps): React.JSX.Element {
  const windows = intelligence.windows
    .filter(item => item.status === 'current' || item.status === 'upcoming')
    .slice(0, intelligence.depth === 'PREMIUM' ? 3 : 1);

  return (
    <section className="sade-sati-panel glass-panel">
      <div className="sade-sati-hero">
        <div>
          <div className="section-title">SADE SATI + SATURN</div>
          <h2>{intelligence.title}</h2>
          <p>{intelligence.subtitle}</p>
        </div>
        <span className={intelligence.active ? 'saturn-badge active' : 'saturn-badge'}>
          {intelligence.phaseLabel}
        </span>
      </div>

      <div className="saturn-status-grid">
        <div>
          <span>Saturn from Moon</span>
          <strong>
            {intelligence.houseFromMoon ? `House ${intelligence.houseFromMoon}` : 'Pending'}
          </strong>
          <small>
            {intelligence.saturnSign} Saturn · {intelligence.moonSign} Moon
          </small>
        </div>
        <p>{intelligence.freeInsight}</p>
      </div>

      {intelligence.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : (
        <>
          <div className="saturn-proof-grid">
            {intelligence.evidence.slice(0, 4).map(item => (
              <article className="saturn-proof-card" key={item.id}>
                <span>{item.weight}</span>
                <strong>{item.title}</strong>
                <p>{item.observation}</p>
              </article>
            ))}
          </div>

          <div className="saturn-window-list">
            <div>
              <span>Saturn windows</span>
              <h3>{intelligence.active ? 'Current pressure map' : 'Next Saturn planning map'}</h3>
            </div>
            {windows.length ? (
              windows.map(window => (
                <article className="saturn-window-card" key={window.id}>
                  <div>
                    <strong>{window.title}</strong>
                    <small>
                      {formatDate(window.startDate)} to {formatDate(window.endDate)}
                    </small>
                  </div>
                  <p>{window.guidance}</p>
                </article>
              ))
            ) : (
              <div className="saturn-empty">Saturn windows will appear after transit data is available.</div>
            )}
          </div>

          <div className="saturn-remedy-note">
            <span>{intelligence.premiumSynthesis ? 'Premium synthesis' : 'Remedy tone'}</span>
            <p>{intelligence.premiumSynthesis ?? intelligence.remedies[0]}</p>
          </div>

          <div className="saturn-cta-row">
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
    month: 'short',
    year: 'numeric',
  });
}
