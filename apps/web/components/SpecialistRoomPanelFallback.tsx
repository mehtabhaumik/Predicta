'use client';

import Link from 'next/link';
import {
  getSpecialistRoomFallbackRoomCopy,
  SPECIALIST_ROOM_FALLBACK_COPY,
  type SpecialistRoomFallbackKey,
  type SpecialistRoomFallbackLanguage,
} from '../lib/lightweight-specialist-room-fallback-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';

type SpecialistRoomPanelFallbackProps = {
  room?: SpecialistRoomFallbackKey;
};

function buildFallbackAskHref(
  copy: {
    prompt: string;
    school?: string;
    sourceScreen: string;
  },
  language: SpecialistRoomFallbackLanguage,
): string {
  const params = new URLSearchParams({
    autoSend: 'true',
    prompt: copy.prompt,
    selectedLanguage: language,
    sourceScreen: copy.sourceScreen,
  });

  if (copy.school) {
    params.set('school', copy.school);
    params.set('from', copy.school);
    params.set('handoffMode', 'main_synthesis');
  }

  return `/ask?${params.toString()}`;
}

export function SpecialistRoomPanelFallback({
  room = 'generic',
}: SpecialistRoomPanelFallbackProps): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();
  const fallbackLanguage = language as SpecialistRoomFallbackLanguage;
  const copy = SPECIALIST_ROOM_FALLBACK_COPY[fallbackLanguage];
  const roomCopy = getSpecialistRoomFallbackRoomCopy(fallbackLanguage, room);

  return (
    <section
      aria-busy="true"
      className="glass-panel specialist-room-panel-fallback"
    >
      <div className="section-title">
        <span>{roomCopy.eyebrow}</span>
      </div>
      <h1>{roomCopy.title}</h1>
      <p>{roomCopy.body}</p>
      <div className="specialist-room-fallback-actions">
        <Link className="button" href={buildFallbackAskHref(roomCopy, fallbackLanguage)}>
          {copy.askCta}
        </Link>
        {room === 'report' ? (
          <Link className="button secondary" href="/dashboard/kundli">
            {copy.createKundliCta}
          </Link>
        ) : null}
        <span aria-live="polite" className="specialist-room-fallback-status">
          {copy.openingCta}
        </span>
      </div>
      <div className="specialist-room-fallback-skeleton">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
