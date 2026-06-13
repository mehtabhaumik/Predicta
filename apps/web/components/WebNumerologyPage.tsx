import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { WebEvidenceRoomDeferredSection } from './WebEvidenceRoomDeferredSection';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebNumerologyPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel:
      'Numerology name number, birth number, destiny number, and current cycle evidence',
    handoffMode: 'room_safe',
    prompt: 'Read what my name number, birth number, destiny number, and current cycle say now.',
    school: 'NUMEROLOGY',
    sourceScreen: 'Numerology Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="numerology" />
      <WebEvidenceRoomDeferredSection room="numerology" />
    </section>
  );
}
