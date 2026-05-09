'use client';

import Link from 'next/link';
import type { YearlyHoroscopeVarshaphal } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

type WebYearlyHoroscopePanelProps = {
  intelligence: YearlyHoroscopeVarshaphal;
};

export function WebYearlyHoroscopePanel({
  intelligence,
}: WebYearlyHoroscopePanelProps): React.JSX.Element {
  const signals = [
    ...intelligence.supportSignals.slice(0, 2),
    ...intelligence.cautionSignals.slice(0, 2),
  ];

  return (
    <section className="gochar-panel yearly-horoscope-panel glass-panel">
      <div className="gochar-hero">
        <div>
          <div className="section-title">YEARLY HOROSCOPE</div>
          <h2>{intelligence.title}</h2>
          <p>{intelligence.subtitle}</p>
        </div>
        <span className="gochar-badge supportive">
          {intelligence.depth === 'PREMIUM' ? 'Premium depth' : 'Free insight'}
        </span>
      </div>

      <div className="gochar-summary-grid">
        <div>
          <span>Solar year</span>
          <strong>{intelligence.yearLabel}</strong>
          <small>
            {formatDate(intelligence.solarYearStart)} to{' '}
            {formatDate(intelligence.solarYearEnd)}
          </small>
        </div>
        <p>{intelligence.yearTheme}</p>
      </div>

      {intelligence.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : (
        <>
          <div className="gochar-signal-grid yearly-horoscope-grid">
            <article className="gochar-signal-card">
              <span>Varsha Lagna</span>
              <strong>{intelligence.varshaLagna}</strong>
              <p>
                The yearly ascendant sets the visible tone of this annual map.
              </p>
            </article>
            <article className="gochar-signal-card">
              <span>Muntha focus</span>
              <strong>
                House {intelligence.munthaHouse} in {intelligence.munthaSign}
              </strong>
              <p>
                Ruled by {intelligence.munthaLord}. This is the area Predicta
                watches first for the year.
              </p>
            </article>
            {signals.map(signal => (
              <article className="gochar-signal-card" key={signal.id}>
                <span>{signal.weight}</span>
                <strong>{signal.title}</strong>
                <p>{signal.interpretation}</p>
              </article>
            ))}
          </div>

          <div className="gochar-month-list">
            <div>
              <span>Annual planning</span>
              <h3>Next yearly cards</h3>
            </div>
            {intelligence.monthlyCards.slice(0, 3).map(card => (
              <article className="gochar-month-card" key={card.id}>
                <div>
                  <strong>{card.monthLabel}</strong>
                  <small>{card.focusAreas.join(', ')}</small>
                </div>
                <p>{card.guidance}</p>
              </article>
            ))}
          </div>

          <div className="gochar-overlay-note">
            <span>Dasha + Gochar overlay</span>
            <p>{intelligence.dashaOverlay}</p>
            <p>{intelligence.gocharOverlay}</p>
          </div>

          <div className="gochar-cta-row">
            {intelligence.ctas.slice(0, 3).map(cta => (
              <Link
                className="button secondary"
                href={buildPredictaChatHref({
                  prompt: cta.prompt,
                  selectedSection: cta.label,
                  sourceScreen: 'Yearly Horoscope',
                })}
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
