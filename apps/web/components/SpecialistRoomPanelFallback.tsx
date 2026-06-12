import {
  getSpecialistRoomFallbackRoomCopy,
  SPECIALIST_ROOM_FALLBACK_COPY,
  SPECIALIST_ROOM_FALLBACK_LANGUAGES,
  type SpecialistRoomFallbackKey,
  type SpecialistRoomFallbackLanguage,
} from '../lib/lightweight-specialist-room-fallback-copy';

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
  return (
    <section
      aria-busy="true"
      className="glass-panel specialist-room-panel-fallback"
    >
      <div className="section-title">
        {SPECIALIST_ROOM_FALLBACK_LANGUAGES.map(language => (
          <span className={`predicta-i18n predicta-i18n-${language}`} key={language}>
            {getSpecialistRoomFallbackRoomCopy(language, room).eyebrow}
          </span>
        ))}
      </div>
      <h1>
        {SPECIALIST_ROOM_FALLBACK_LANGUAGES.map(language => (
          <span className={`predicta-i18n predicta-i18n-${language}`} key={language}>
            {getSpecialistRoomFallbackRoomCopy(language, room).title}
          </span>
        ))}
      </h1>
      <p>
        {SPECIALIST_ROOM_FALLBACK_LANGUAGES.map(language => (
          <span className={`predicta-i18n predicta-i18n-${language}`} key={language}>
            {getSpecialistRoomFallbackRoomCopy(language, room).body}
          </span>
        ))}
      </p>
      <div className="specialist-room-fallback-actions">
        {SPECIALIST_ROOM_FALLBACK_LANGUAGES.map(language => {
          const copy = SPECIALIST_ROOM_FALLBACK_COPY[language];
          const roomCopy = getSpecialistRoomFallbackRoomCopy(language, room);

          return (
            <a
              className={`button predicta-i18n-link predicta-i18n-link-${language}`}
              href={buildFallbackAskHref(roomCopy, language)}
              key={language}
            >
              {copy.askCta}
            </a>
          );
        })}
        {room === 'report' ? (
          <a className="button secondary" href="/dashboard/kundli">
            {SPECIALIST_ROOM_FALLBACK_LANGUAGES.map(language => (
              <span className={`predicta-i18n predicta-i18n-${language}`} key={language}>
                {SPECIALIST_ROOM_FALLBACK_COPY[language].createKundliCta}
              </span>
            ))}
          </a>
        ) : null}
        <span aria-live="polite" className="specialist-room-fallback-status">
          {SPECIALIST_ROOM_FALLBACK_LANGUAGES.map(language => (
            <span className={`predicta-i18n predicta-i18n-${language}`} key={language}>
              {SPECIALIST_ROOM_FALLBACK_COPY[language].openingCta}
            </span>
          ))}
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
