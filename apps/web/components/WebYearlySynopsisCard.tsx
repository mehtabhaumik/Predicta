'use client';

import Link from 'next/link';
import type { YearlyHoroscopeVarshaphal } from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { Card } from './Card';

type WebYearlySynopsisCardProps = {
  intelligence: YearlyHoroscopeVarshaphal;
};

export function WebYearlySynopsisCard({
  intelligence,
}: WebYearlySynopsisCardProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);

  return (
    <Card className="glass-panel gochar-synopsis-card yearly-synopsis-card">
      <div className="card-content spacious">
        <div className="gochar-synopsis-topline">
          <div>
            <div className="section-title">{t('YEARLY HOROSCOPE')}</div>
            <h2>
              {intelligence.status === 'pending'
                ? t('Your personal year is waiting.')
                : t('What this solar year is asking from you.')}
            </h2>
          </div>
          <span className="gochar-badge supportive">
            {intelligence.yearLabel}
          </span>
        </div>
        <p>{intelligence.freeInsight}</p>
        {intelligence.status === 'ready' ? (
          <div className="gochar-synopsis-signal">
            <span>{t('Muntha focus')}</span>
            <strong>
              House {intelligence.munthaHouse} in {intelligence.munthaSign}
            </strong>
            <p>{intelligence.yearTheme}</p>
          </div>
        ) : null}
        <div className="action-row">
          <Link className="button" href="/dashboard/timeline">
            {t('Open Yearly Panel')}
          </Link>
          <Link
            className="button secondary"
            href={buildPredictaChatHref({
              prompt: intelligence.askPrompt,
              selectedSection: intelligence.yearLabel,
              sourceScreen: 'Yearly Horoscope',
            })}
          >
            {t('Ask Predicta')}
          </Link>
        </div>
      </div>
    </Card>
  );
}
