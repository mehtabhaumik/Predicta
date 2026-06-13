'use client';

import {
  PREDICTA_INTELLIGENCE_UI_RHYTHM,
  getPredictaSchoolIntelligencePattern,
  type PredictaIntelligenceSchool,
} from '@pridicta/astrology';
import { translateUiText } from '@pridicta/config/uiTranslations';
import Link from 'next/link';
import { useLanguagePreference } from '../lib/language-preference';
import {
  PredictaBadge,
  PredictaButton,
  PredictaPanel,
} from './ui/DesignSystemPrimitives';

type PredictaWorldTheme =
  | 'jaimini'
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

type PredictaWorldPrimaryGuidance = {
  body: string;
  eyebrow: string;
  title: string;
};

export function PredictaWorldFrame({
  badge,
  body,
  chatAction,
  chatHref,
  chatLabel,
  eyebrow,
  primaryGuidance,
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
  primaryGuidance?: PredictaWorldPrimaryGuidance;
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
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const pattern = getPredictaSchoolIntelligencePattern(themeToSchool(theme));
  const patternCopy = {
    action: pattern.action,
    evidence: pattern.evidence,
    prediction: pattern.prediction,
    safety: pattern.safety,
  };

  return (
    <section className={`predicta-world-frame predicta-world--${theme}`}>
      <PredictaPanel className="predicta-world-hero">
        <div className="predicta-world-hero-copy">
          <p className="section-title">{eyebrow}</p>
          <h1 className="gradient-text">{title}</h1>
          <div
            aria-label={t('Start this reading')}
            className="predicta-world-primary-actions"
          >
            {chatAction ?? (
              <PredictaButton href={chatHref} variant="primary">
                {chatLabel}
              </PredictaButton>
            )}
            {reportAction ?? (
              <PredictaButton href={reportHref} variant="secondary">
                {reportLabel}
              </PredictaButton>
            )}
          </div>
          {heroInteraction ? (
            <div className="predicta-world-hero-interaction">
              {heroInteraction}
            </div>
          ) : null}
          {primaryGuidance ? (
            <div
              className="predicta-world-primary-guidance"
              data-competitor-response-phase4-primary-guidance={theme}
            >
              <span>{t(primaryGuidance.eyebrow)}</span>
              <strong>{t(primaryGuidance.title)}</strong>
              <p>{t(primaryGuidance.body)}</p>
            </div>
          ) : null}
          <details
            className="predicta-world-context-note"
            data-app-revival-action-first-world-frame={theme}
          >
            <summary>
              <span>{t('What this room answers')}</span>
              <strong>{t('Read')}</strong>
            </summary>
            <p>{body}</p>
          </details>
        </div>
        <div className="predicta-world-aside">
          <PredictaBadge className="predicta-world-badge">{badge}</PredictaBadge>
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

      <details className="predicta-world-local-map glass-panel">
        <summary className="predicta-world-disclosure-summary">
          <div>
            <p className="section-title">{localEyebrow}</p>
            <h2>{localTitle}</h2>
          </div>
          <strong>{t('Open')}</strong>
        </summary>
        <div className="predicta-world-local-grid">
          {localActions.map(action => (
            <Link className="predicta-world-local-card" href={action.href} key={action.label}>
              <strong>{action.label}</strong>
              <p>{action.note}</p>
            </Link>
          ))}
        </div>
      </details>

      <details className="predicta-world-proof-disclosure glass-panel">
        <summary>
          <span>{proofLabel}</span>
          <strong>{t('Open evidence')}</strong>
        </summary>
        <section
          aria-label={t(`${pattern.label} intelligence rhythm`)}
          className="predicta-intelligence-pattern"
          data-audit1-phase7f-intelligence-pattern={theme}
        >
          {PREDICTA_INTELLIGENCE_UI_RHYTHM.map(step => (
            <article className="predicta-intelligence-step" key={step.id}>
              <span>{t(step.label)}</span>
              <strong>{t(patternCopy[step.id])}</strong>
            </article>
          ))}
        </section>
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

function themeToSchool(theme: PredictaWorldTheme): PredictaIntelligenceSchool {
  switch (theme) {
    case 'jaimini':
      return 'JAIMINI';
    case 'kp':
      return 'KP';
    case 'nadi':
      return 'JAIMINI';
    case 'numerology':
      return 'NUMEROLOGY';
    case 'signature':
      return 'SIGNATURE';
    case 'vedic':
      return 'VEDIC';
    default:
      return 'VEDIC';
  }
}
