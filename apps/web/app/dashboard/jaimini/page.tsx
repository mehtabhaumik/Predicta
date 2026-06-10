import { WebEvidenceRoomEntry } from '../../../components/WebEvidenceRoomEntry';
import { WebJaiminiPredictaPanel } from '../../../components/WebJaiminiPredictaPanel';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';

export default function JaiminiPredictaPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel:
      'Jaimini karaka, Arudha, Karakamsha, and destiny chapter evidence',
    handoffMode: 'room_safe',
    prompt: 'Read my destiny direction, soul role, and current Jaimini life chapter.',
    school: 'JAIMINI',
    sourceScreen: 'Jaimini Evidence Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="jaimini" />
      <WebJaiminiPredictaPanel />
    </section>
  );
}
