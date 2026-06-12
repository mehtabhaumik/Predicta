'use client';

import { translateUiKey } from '@pridicta/config/uiTranslations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { preloadAskPredictaRuntime } from '../lib/predicta-chat-runtime-preload';

type EvidenceRoomId =
  | 'jaimini'
  | 'kp'
  | 'kundliKarma'
  | 'numerology'
  | 'signature'
  | 'vedic';

type WebEvidenceRoomEntryProps = {
  askHref: string;
  room: EvidenceRoomId;
};

export function WebEvidenceRoomEntry({
  askHref,
  room,
}: WebEvidenceRoomEntryProps): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguagePreference();
  const t = (key: string) => translateUiKey(key, language);
  const title = getRoomCopy(room, 'title', language);
  const body = getRoomCopy(room, 'body', language);
  const action = getRoomCopy(room, 'action', language);
  const evidence = getRoomCopy(room, 'evidence', language);

  function prewarmAsk(): void {
    preloadAskPredictaRuntime();
    router.prefetch(askHref);
  }

  useEffect(() => {
    router.prefetch('/ask');
    router.prefetch(askHref);
  }, [askHref, router]);

  return (
    <section
      className={`evidence-room-entry evidence-room-entry--${room}`}
      data-app-revival-phase5-evidence-room={room}
    >
      <div className="evidence-room-entry-copy">
        <div className="section-title">{t('ui.evidenceRoom.generic.badge')}</div>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="evidence-room-next-action">
          <span>{t('ui.evidenceRoom.generic.startHere')}</span>
          <strong>{action}</strong>
        </div>
      </div>

      <div className="evidence-room-entry-actions">
        <Link
          className="button"
          href={askHref}
          onFocus={prewarmAsk}
          onPointerEnter={prewarmAsk}
          onTouchStart={prewarmAsk}
        >
          {t('ui.evidenceRoom.generic.askPredicta')}
        </Link>
        <details className="evidence-room-proof-drawer">
          <summary>
            <span>{t('ui.evidenceRoom.generic.openEvidence')}</span>
            <strong>{t('ui.evidenceRoom.generic.detailsBelow')}</strong>
          </summary>
          <p>{evidence}</p>
        </details>
      </div>
    </section>
  );
}

function getRoomCopy(
  room: EvidenceRoomId,
  field: 'action' | 'body' | 'evidence' | 'title',
  language: SupportedLanguage,
): string {
  return translateUiKey(`ui.evidenceRoom.${room}.${field}`, language);
}
