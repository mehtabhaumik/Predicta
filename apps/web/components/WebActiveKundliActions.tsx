'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { KundliData } from '@pridicta/types';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../lib/language-preference';
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
  showDelete?: boolean;
  sourceScreen: string;
  title?: string;
};

export function WebActiveKundliActions({
  chatContext = false,
  compact = false,
  kundli,
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
    router.push('/dashboard/saved-kundlis');
  }

  const askHref = buildPredictaChatHref({
    kundli,
    prompt: `Use ${kundli.birthDetails.name}'s active Kundli and tell me the best next reading.`,
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
        'यह कुंडली आपकी लाइब्रेरी से हट जाएगी. पुराने चैट या रिपोर्ट में इस प्रोफाइल का पूरा चार्ट संदर्भ उपलब्ध नहीं रह सकता.',
      cancelLabel: 'रहने दें',
      confirmLabel: 'कुंडली हटाएं',
      consequence:
        'अगर यही सक्रिय कुंडली है, तो Predicta अगली सेव कुंडली चुनेगी या नया चार्ट बनाने को कहेगी.',
      eyebrow: 'सावधानी से हटाएं',
      title: `${name} की कुंडली हटाएं?`,
    };
  }

  if (language === 'gu') {
    return {
      body:
        'આ કુંડળી તમારી લાઇબ્રેરીમાંથી દૂર થશે. જૂના ચેટ અથવા રિપોર્ટમાં આ પ્રોફાઇલનો સંપૂર્ણ ચાર્ટ સંદર્ભ ઉપલબ્ધ ન રહી શકે.',
      cancelLabel: 'રહવા દો',
      confirmLabel: 'કુંડળી કાઢી નાખો',
      consequence:
        'જો આ સક્રિય કુંડળી છે, તો Predicta આગળની સેવ કુંડળી પસંદ કરશે અથવા નવો ચાર્ટ બનાવવા કહેશે.',
      eyebrow: 'સાવચેતીથી કાઢો',
      title: `${name} ની કુંડળી કાઢી નાખો?`,
    };
  }

  return {
    body:
      'This removes this Kundli from your library. Old chats or reports may no longer have full chart context for this profile.',
    cancelLabel: 'Keep Kundli',
    confirmLabel: 'Delete Kundli',
    consequence:
      'If this is the active Kundli, Predicta will select the next saved Kundli or ask you to create a new chart.',
    eyebrow: 'Delete carefully',
    title: `Delete ${name}'s Kundli?`,
  };
}
