'use client';

import Link from 'next/link';
import type { MahadashaIntelligence } from '@pridicta/types';

type WebMahadashaIntelligencePanelProps = {
  intelligence: MahadashaIntelligence;
};

export function WebMahadashaIntelligencePanel({
  intelligence,
}: WebMahadashaIntelligencePanelProps): React.JSX.Element {
  const current = intelligence.current;
  const activeWindows = intelligence.timingWindows.slice(
    0,
    intelligence.depth === 'PREMIUM' ? 4 : 2,
  );

  return (
    <section className="mahadasha-intelligence glass-panel">
      <div className="mahadasha-hero">
        <div>
          <div className="section-title">MAHADASHA INTELLIGENCE</div>
          <h2>{intelligence.title}</h2>
          <p>{intelligence.subtitle}</p>
        </div>
        <span className="depth-badge">
          {intelligence.depth === 'PREMIUM' ? 'Premium depth' : 'Free insight'}
        </span>
      </div>

      <div className="mahadasha-current">
        <div>
          <span>Current chapter</span>
          <strong>
            {current.mahadasha}/{current.antardasha}
          </strong>
          <small>
            {current.startDate && current.endDate
              ? `${formatDate(current.startDate)} to ${formatDate(current.endDate)}`
              : 'Waiting for Kundli'}
          </small>
        </div>
        <p>{current.freeInsight}</p>
      </div>

      {intelligence.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : (
        <>
          <div className="mahadasha-proof-grid">
            {current.evidence.slice(0, 4).map(item => (
              <article className="mahadasha-proof-card" key={item.id}>
                <span>{item.weight}</span>
                <strong>{item.title}</strong>
                <p>{item.observation}</p>
              </article>
            ))}
          </div>

          <div className="mahadasha-window-list">
            <div>
              <span>Timing windows</span>
              <h3>What to watch now</h3>
            </div>
            {activeWindows.map(window => (
              <article className="mahadasha-window-card" key={window.id}>
                <div>
                  <strong>{window.title}</strong>
                  <small>{window.timing}</small>
                </div>
                <p>{window.practicalGuidance}</p>
              </article>
            ))}
          </div>

          {current.premiumSynthesis ? (
            <div className="mahadasha-premium-note">
              <span>Premium synthesis</span>
              <p>{current.premiumSynthesis}</p>
            </div>
          ) : (
            <div className="mahadasha-premium-note">
              <span>Premium unlock</span>
              <p>{intelligence.premiumUnlock}</p>
            </div>
          )}

          <div className="mahadasha-cta-row">
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
