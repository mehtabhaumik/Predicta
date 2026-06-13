import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { WebEvidenceRoomDeferredSection } from './WebEvidenceRoomDeferredSection';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebJaiminiPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel:
      'Jaimini karaka, Arudha, Karakamsha, and destiny chapter evidence',
    handoffMode: 'room_safe',
    prompt: 'Read my current Jaimini destiny chapter and tell me what it means for my life now.',
    school: 'JAIMINI',
    sourceScreen: 'Jaimini Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="jaimini" />
      <WebEvidenceRoomDeferredSection room="jaimini" />
    </section>
  );
}
