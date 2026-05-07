'use client';

import Link from 'next/link';
import {
  composeAdvancedJyotishCoverage,
} from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';

type WebAdvancedJyotishPanelProps = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
};

export function WebAdvancedJyotishPanel({
  hasPremiumAccess = false,
  kundli,
}: WebAdvancedJyotishPanelProps): React.JSX.Element {
  const coverage = composeAdvancedJyotishCoverage(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const pattern = coverage.yogaDoshaInsights[0];
  const ashtaka = coverage.ashtakavargaDetail.slice(0, 3);

  return (
    <section className="gochar-panel advanced-jyotish-panel glass-panel">
      <div className="gochar-hero">
        <div>
          <div className="section-title">ADVANCED JYOTISH</div>
          <h2>{coverage.title}</h2>
          <p>{coverage.subtitle}</p>
        </div>
        <span className="gochar-badge supportive">
          {coverage.depth === 'PREMIUM' ? 'Premium depth' : 'Free insight'}
        </span>
      </div>

      <div className="gochar-summary-grid">
        <div>
          <span>Coverage</span>
          <strong>{coverage.moduleRegistry.length} modules</strong>
          <small>Simple outside, serious inside</small>
        </div>
        <p>{coverage.freePolicy}</p>
      </div>

      {coverage.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : (
        <>
          <div className="gochar-signal-grid">
            <article className="gochar-signal-card">
              <span>Birth star</span>
              <strong>
                {coverage.nakshatraInsight.moonNakshatra} pada{' '}
                {coverage.nakshatraInsight.pada || '-'}
              </strong>
              <p>{coverage.nakshatraInsight.simpleInsight}</p>
            </article>
            {pattern ? (
              <article className="gochar-signal-card">
                <span>{pattern.kind === 'yoga' ? 'Yoga' : 'Care pattern'}</span>
                <strong>{pattern.name}</strong>
                <p>{pattern.summary}</p>
              </article>
            ) : null}
            <article className="gochar-signal-card">
              <span>Panchang</span>
              <strong>{coverage.panchangMuhurta.tithi}</strong>
              <p>{coverage.panchangMuhurta.simpleGuidance}</p>
            </article>
          </div>

          <div className="gochar-month-list">
            <div>
              <span>Strength map</span>
              <h3>Ashtakavarga highlights</h3>
            </div>
            {ashtaka.map(item => (
              <article className="gochar-month-card" key={item.house}>
                <div>
                  <strong>House {item.house}</strong>
                  <small>
                    {item.score} bindus · {item.tone}
                  </small>
                </div>
                <p>{item.guidance}</p>
              </article>
            ))}
          </div>

          <div className="gochar-signal-grid">
            {coverage.moduleRegistry.slice(0, 8).map(module => (
              <article className="gochar-signal-card" key={module.id}>
                <span>{module.premiumOnly ? 'Premium only' : 'Free + Premium'}</span>
                <strong>{module.simpleName}</strong>
                <p>{module.freeAccess}</p>
              </article>
            ))}
          </div>

          <div className="gochar-overlay-note">
            <span>Premium depth</span>
            <p>{coverage.premiumPolicy}</p>
            <p>{coverage.premiumUnlock}</p>
          </div>

          <div className="gochar-cta-row">
            {coverage.ctas.slice(0, 3).map(cta => (
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
