'use client';

import Link from 'next/link';
import {
  PredictaBadge,
  PredictaButton,
  PredictaPanel,
} from './ui/DesignSystemPrimitives';

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
  heroInteraction,
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
  heroInteraction?: React.ReactNode;
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
      <PredictaPanel className="predicta-world-hero">
        <div className="predicta-world-hero-copy">
          <p className="section-title">{eyebrow}</p>
          <h1 className="gradient-text">{title}</h1>
          <p>{body}</p>
          {heroInteraction ? (
            <div className="predicta-world-hero-interaction">
              {heroInteraction}
            </div>
          ) : null}
        </div>
        <div className="predicta-world-aside">
          <PredictaBadge className="predicta-world-badge">{badge}</PredictaBadge>
          <div className="predicta-world-actions">
            {reportAction ?? (
              <PredictaButton href={reportHref} variant="primary">
                {reportLabel}
              </PredictaButton>
            )}
            {chatAction ?? (
              <PredictaButton href={chatHref} variant="secondary">
                {chatLabel}
              </PredictaButton>
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
      </PredictaPanel>

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

      <details className="predicta-world-proof-disclosure glass-panel">
        <summary>
          <span>{proofLabel}</span>
          <strong>{proofLabel}</strong>
        </summary>
        <section className="predicta-world-proof-grid">
          {proofCards.map(card => (
            <article className="predicta-world-proof-card" key={card.title}>
              <span>{proofLabel}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </section>
      </details>
    </section>
  );
}
