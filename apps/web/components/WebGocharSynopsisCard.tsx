'use client';

import Link from 'next/link';
import type { TransitGocharIntelligence } from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { Card } from './Card';

type WebGocharSynopsisCardProps = {
  intelligence: TransitGocharIntelligence;
};

export function WebGocharSynopsisCard({
  intelligence,
}: WebGocharSynopsisCardProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const sample = intelligence.status === 'pending';
  const primary =
    intelligence.topOpportunities[0] ??
    intelligence.cautionSignals[0] ??
    intelligence.planetInsights[0];

  return (
    <Card className="glass-panel gochar-synopsis-card">
      <div className="card-content spacious">
        <div className="gochar-synopsis-topline">
          <div>
            <div className="section-title">
              {sample ? t('MOMENT SKY PREVIEW') : t('CURRENT GOCHAR')}
            </div>
            <h2>
              {sample
                ? t('What the sky is doing right now.')
                : t('What current Gochar is bringing.')}
            </h2>
          </div>
          <span className={`gochar-badge ${intelligence.dominantWeight}`}>
            {intelligence.dominantWeight}
          </span>
        </div>
        <p>{intelligence.snapshotSummary}</p>
        {primary ? (
          <div
            className="gochar-synopsis-signal"
            data-competitor-response-phase4-answer-first="gochar"
          >
            <span>{primary.weight}</span>
            <strong>{primary.headline}</strong>
            <p>{primary.practicalGuidance}</p>
          </div>
        ) : null}
        <div className="action-row">
          <Link className="button" href="/dashboard/timeline">
            {t('Open Gochar Panel')}
          </Link>
          <Link
            className="button secondary"
            href={buildPredictaChatHref({
              prompt: intelligence.askPrompt,
              selectedSection: 'Current Gochar',
              sourceScreen: 'Gochar Synopsis',
            })}
          >
            {t('Ask Predicta')}
          </Link>
        </div>
      </div>
    </Card>
  );
}
