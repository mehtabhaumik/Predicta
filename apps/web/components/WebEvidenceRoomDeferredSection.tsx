'use client';

import type { ReactNode, SyntheticEvent } from 'react';
import { useState } from 'react';
import { translateUiKey } from '@pridicta/config/uiTranslations';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';

type EvidenceRoomDeferredId =
  | 'jaimini'
  | 'kp'
  | 'kundliKarma'
  | 'numerology'
  | 'signature'
  | 'vedic';

type WebEvidenceRoomDeferredSectionProps = {
  children: ReactNode;
  room: EvidenceRoomDeferredId;
};

export function WebEvidenceRoomDeferredSection({
  children,
  room,
}: WebEvidenceRoomDeferredSectionProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const [hasOpened, setHasOpened] = useState(false);
  const t = (key: string) => translateUiKey(key, language as SupportedLanguage);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>): void {
    if (event.currentTarget.open) {
      setHasOpened(true);
    }
  }

  return (
    <details
      className={`evidence-room-detail-loader evidence-room-detail-loader--${room}`}
      data-app-revival-deferred-evidence-room={room}
      onToggle={handleToggle}
    >
      <summary>
        <span>{t('ui.evidenceRoom.generic.openDetailedRoom')}</span>
        <strong>{t('ui.evidenceRoom.generic.openDetailedRoomHint')}</strong>
      </summary>
      {hasOpened ? (
        <div className="evidence-room-detail-loader-body">{children}</div>
      ) : null}
    </details>
  );
}
