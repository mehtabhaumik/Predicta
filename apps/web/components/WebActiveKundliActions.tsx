'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { KundliData, PredictaSchool } from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../lib/language-preference';
import { announcePredictaNavigation } from '../lib/navigation-feedback';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  canCreateAdditionalWebKundli,
  deleteWebKundli,
} from '../lib/web-kundli-storage';
import { AuthDialog } from './AuthDialog';
import { BrandedDestructiveDialog } from './BrandedDestructiveDialog';

type WebActiveKundliActionsProps = {
  compact?: boolean;
  chatContext?: boolean;
  kundli?: KundliData;
  school?: PredictaSchool;
  showDelete?: boolean;
  sourceScreen: string;
  title?: string;
};

export function WebActiveKundliActions({
  chatContext = false,
  compact = false,
  kundli,
  school,
  showDelete = false,
  sourceScreen,
  title = 'Reading this Kundli',
}: WebActiveKundliActionsProps): React.JSX.Element | null {
  const router = useRouter();
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const deleteCopy = getActiveKundliDeleteCopy(language, kundli?.birthDetails.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!kundli) {
    return null;
  }

  function confirmDelete() {
    if (!kundli) {
      return;
    }

    deleteWebKundli(kundli.id);
    setDeleteDialogOpen(false);
    announcePredictaNavigation('/dashboard/saved-kundlis');
    router.push('/dashboard/saved-kundlis');
  }

  const askHref = buildPredictaChatHref({
    kundli,
    prompt: `Use ${kundli.birthDetails.name}'s active Kundli and tell me the best next reading.`,
    school,
    sourceScreen,
  });
  const canCreateMoreKundlis = canCreateAdditionalWebKundli().allowed;

  return (
    <section
      className={`active-kundli-actions glass-panel${compact ? ' compact' : ''}${
        chatContext ? ' chat-context' : ''
      }`}
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
        {chatContext ? null : canCreateMoreKundlis ? (
          <>
            <Link className="button secondary" href="/dashboard/kundli">
              {t('New')}
            </Link>
            <Link className="button" href={askHref}>
              {t('Ask Predicta')}
            </Link>
          </>
        ) : (
          <>
            <AuthDialog />
            <Link className="button" href={askHref}>
              {t('Ask Predicta')}
            </Link>
          </>
        )}
        {showDelete ? (
          <button
            className="button danger"
            onClick={() => setDeleteDialogOpen(true)}
            type="button"
          >
            {t('Delete')}
          </button>
        ) : null}
      </div>
      <BrandedDestructiveDialog
        body={deleteCopy.body}
        cancelLabel={deleteCopy.cancelLabel}
        confirmLabel={deleteCopy.confirmLabel}
        consequence={deleteCopy.consequence}
        eyebrow={deleteCopy.eyebrow}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        open={deleteDialogOpen}
        title={deleteCopy.title}
      />
    </section>
  );
}

function getActiveKundliDeleteCopy(
  language: 'en' | 'hi' | 'gu',
  name = 'this profile',
) {
  if (language === 'hi') {
    return {
      body:
        getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.abbd51ddb8"),
      cancelLabel: getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.4df0d0f76d"),
      confirmLabel: getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.4d0c32c905"),
      consequence:
        getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.c58b2a7b8b"),
      eyebrow: getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.5ec84fece1"),
      title: formatNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.3913ebaae3", [name]),
    };
  }

  if (language === 'gu') {
    return {
      body:
        getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.11bad785cd"),
      cancelLabel: getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.d8bd753ad9"),
      confirmLabel: getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.4811688cd2"),
      consequence:
        getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.12986e9966"),
      eyebrow: getNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.791a0b37d2"),
      title: formatNativeCopy("native.apps.web.components.WebActiveKundliActions.tsx.b4d456ea1a", [name]),
    };
  }

  return {
    body:
      'This removes this Kundli from My Kundlis. Old chats or reports may no longer have full chart context for this profile.',
    cancelLabel: 'Keep Kundli',
    confirmLabel: 'Delete Kundli',
    consequence:
      'If this is the active Kundli, Predicta will select the next saved Kundli or ask you to create a new chart.',
    eyebrow: 'Delete carefully',
    title: `Delete ${name}'s Kundli?`,
  };
}
