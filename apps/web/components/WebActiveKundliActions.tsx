'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { KundliData } from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { deleteWebKundli } from '../lib/web-kundli-storage';

type WebActiveKundliActionsProps = {
  compact?: boolean;
  kundli?: KundliData;
  showDelete?: boolean;
  sourceScreen: string;
  title?: string;
};

export function WebActiveKundliActions({
  compact = false,
  kundli,
  showDelete = false,
  sourceScreen,
  title = 'Reading this Kundli',
}: WebActiveKundliActionsProps): React.JSX.Element | null {
  const router = useRouter();
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);

  if (!kundli) {
    return null;
  }

  function handleDelete() {
    if (!kundli) {
      return;
    }

    const confirmed = window.confirm(
      `${t('Delete')} ${kundli.birthDetails.name}'s ${t('Kundli')}?\n\n${t(
        'This removes this Kundli from your library. Old chats or reports may no longer have full chart context for this profile.',
      )}`,
    );

    if (!confirmed) {
      return;
    }

    deleteWebKundli(kundli.id);
    router.push('/dashboard/saved-kundlis');
  }

  const askHref = buildPredictaChatHref({
    kundli,
    prompt: `Use ${kundli.birthDetails.name}'s active Kundli and tell me the best next reading.`,
    sourceScreen,
  });

  return (
    <section
      className={`active-kundli-actions glass-panel${compact ? ' compact' : ''}`}
    >
      <div className="active-kundli-copy">
        <div className="section-title">{t(title)}</div>
        <h2>{kundli.birthDetails.name}</h2>
        <p>
          {kundli.birthDetails.date} · {kundli.birthDetails.time} ·{' '}
          {kundli.birthDetails.place}
        </p>
      </div>
      <div className="active-kundli-action-row" aria-label="Kundli actions">
        <Link className="button secondary" href="/dashboard/saved-kundlis">
          {t('Switch')}
        </Link>
        <Link
          className="button secondary"
          href={`/dashboard/kundli?editKundliId=${encodeURIComponent(kundli.id)}`}
        >
          {t('Edit')}
        </Link>
        <Link className="button secondary" href="/dashboard/kundli">
          {t('New')}
        </Link>
        <Link className="button" href={askHref}>
          {t('Ask Predicta')}
        </Link>
        {showDelete ? (
          <button className="button danger" onClick={handleDelete} type="button">
            {t('Delete')}
          </button>
        ) : null}
      </div>
    </section>
  );
}
