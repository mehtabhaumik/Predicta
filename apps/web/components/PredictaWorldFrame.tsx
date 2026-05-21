'use client';

import Link from 'next/link';

type PredictaWorldTheme =
  | 'kp'
  | 'nadi'
  | 'numerology'
  | 'signature'
  | 'vedic';

type PredictaWorldAction = {
  href: string;
  label: string;
  note: string;
};

type PredictaWorldProofCard = {
  body: string;
  title: string;
};

type PredictaWorldPillar = {
  label: string;
  value: string;
};

export function PredictaWorldFrame({
  badge,
  body,
  chatAction,
  chatHref,
  chatLabel,
  eyebrow,
  localActions,
  localEyebrow,
  localTitle,
  pillars,
  proofCards,
  proofLabel,
  reportAction,
  reportHref = '/dashboard/report',
  reportLabel,
  reportNote,
  theme,
  title,
}: {
  badge: string;
  body: string;
  chatAction?: React.ReactNode;
  chatHref: string;
  chatLabel: string;
  eyebrow: string;
  localActions: PredictaWorldAction[];
  localEyebrow: string;
  localTitle: string;
  pillars: PredictaWorldPillar[];
  proofCards: PredictaWorldProofCard[];
  proofLabel: string;
  reportAction?: React.ReactNode;
  reportHref?: string;
  reportLabel: string;
  reportNote: string;
  theme: PredictaWorldTheme;
  title: string;
}): React.JSX.Element {
  return (
    <section className={`predicta-world-frame predicta-world--${theme}`}>
      <div className="glass-panel predicta-world-hero">
        <div className="predicta-world-hero-copy">
          <p className="section-title">{eyebrow}</p>
          <h1 className="gradient-text">{title}</h1>
          <p>{body}</p>
        </div>
        <div className="predicta-world-aside">
          <span className="predicta-world-badge">{badge}</span>
          <div className="predicta-world-actions">
            {chatAction ?? (
              <Link className="button primary" href={chatHref}>
                {chatLabel}
              </Link>
            )}
            {reportAction ?? (
              <Link className="button secondary" href={reportHref}>
                {reportLabel}
              </Link>
            )}
          </div>
          <p className="predicta-world-report-note">{reportNote}</p>
          <div className="predicta-world-pillars">
            {pillars.map(pillar => (
              <div className="predicta-world-pillar" key={`${pillar.label}-${pillar.value}`}>
                <span>{pillar.label}</span>
                <strong>{pillar.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="predicta-world-local-map glass-panel">
        <div className="predicta-world-local-heading">
          <div>
            <p className="section-title">{localEyebrow}</p>
            <h2>{localTitle}</h2>
          </div>
        </div>
        <div className="predicta-world-local-grid">
          {localActions.map(action => (
            <Link className="predicta-world-local-card" href={action.href} key={action.label}>
              <strong>{action.label}</strong>
              <p>{action.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="predicta-world-proof-grid">
        {proofCards.map(card => (
          <article className="glass-panel predicta-world-proof-card" key={card.title}>
            <span>{proofLabel}</span>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
