'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguagePreference } from '../lib/language-preference';
import {
  getEvidenceRoomCopy,
  getEvidenceRoomGenericCopy,
} from '../lib/evidence-room-copy';

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
  const title = getEvidenceRoomCopy(room, 'title', language);
  const body = getEvidenceRoomCopy(room, 'body', language);
  const action = getEvidenceRoomCopy(room, 'action', language);
  const evidence = getEvidenceRoomCopy(room, 'evidence', language);

  function prefetchAsk(): void {
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
        <div className="section-title">
          {getEvidenceRoomGenericCopy('badge', language)}
        </div>
        <h1>{title}</h1>
      </div>

      <div className="evidence-room-entry-actions">
        <Link
          className="button"
          href={askHref}
          onFocus={prefetchAsk}
          onPointerEnter={prefetchAsk}
          onTouchStart={prefetchAsk}
        >
          {action}
        </Link>
        <details className="evidence-room-proof-drawer">
          <summary>
            <span>{getEvidenceRoomGenericCopy('openEvidence', language)}</span>
            <strong>{getEvidenceRoomGenericCopy('detailsBelow', language)}</strong>
          </summary>
          <p>{body}</p>
          <p>{evidence}</p>
        </details>
      </div>
    </section>
  );
}
