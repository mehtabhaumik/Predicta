'use client';

import type { ComponentType, SyntheticEvent } from 'react';
import { useState } from 'react';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';
import { useLanguagePreference } from '../lib/language-preference';
import { getEvidenceRoomGenericCopy } from '../lib/evidence-room-copy';

type EvidenceRoomDeferredId =
  | 'jaimini'
  | 'kp'
  | 'kundliKarma'
  | 'numerology'
  | 'signature'
  | 'vedic';

type WebEvidenceRoomDeferredSectionProps = {
  room: EvidenceRoomDeferredId;
};

export function WebEvidenceRoomDeferredSection({
  room,
}: WebEvidenceRoomDeferredSectionProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const [hasOpened, setHasOpened] = useState(false);
  const [DetailRoom, setDetailRoom] = useState<ComponentType | undefined>();

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>): void {
    if (!event.currentTarget.open) {
      return;
    }

    setHasOpened(true);

    if (!DetailRoom) {
      void loadDeferredRoom(room).then(nextRoom => {
        setDetailRoom(() => nextRoom);
      });
    }
  }

  return (
    <details
      className={`evidence-room-detail-loader evidence-room-detail-loader--${room}`}
      data-app-revival-deferred-evidence-room={room}
      onToggle={handleToggle}
    >
      <summary>
        <span>{getEvidenceRoomGenericCopy('openDetailedRoom', language)}</span>
        <strong>
          {getEvidenceRoomGenericCopy('openDetailedRoomHint', language)}
        </strong>
      </summary>
      {hasOpened ? (
        <div className="evidence-room-detail-loader-body">
          {DetailRoom ? (
            <DetailRoom />
          ) : (
            <SpecialistRoomPanelFallback room={getFallbackRoom(room)} />
          )}
        </div>
      ) : null}
    </details>
  );
}

async function loadDeferredRoom(
  room: EvidenceRoomDeferredId,
): Promise<ComponentType> {
  switch (room) {
    case 'jaimini':
      return (await import('./WebJaiminiPredictaLoader')).WebJaiminiPredictaLoader;
    case 'kp':
      return (await import('./WebKpPredictaLoader')).WebKpPredictaLoader;
    case 'kundliKarma':
      return (await import('./WebRemedyCoachLoader')).WebRemedyCoachLoader;
    case 'numerology':
      return (await import('./WebNumerologyPredictaLoader')).WebNumerologyPredictaLoader;
    case 'signature':
      return (await import('./WebSignatureAnalysisLoader')).WebSignatureAnalysisLoader;
    case 'vedic':
      return (await import('./WebVedicIntelligencePanelLoader')).WebVedicIntelligencePanelLoader;
    default:
      return (await import('./WebVedicIntelligencePanelLoader')).WebVedicIntelligencePanelLoader;
  }
}

function getFallbackRoom(
  room: EvidenceRoomDeferredId,
): React.ComponentProps<typeof SpecialistRoomPanelFallback>['room'] {
  return room === 'kundliKarma' ? 'generic' : room;
}
