import { WebEvidenceRoomEntry } from '../../../components/WebEvidenceRoomEntry';
import { WebNumerologyPredictaPanel } from '../../../components/WebNumerologyPredictaPanel';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';

export default function NumerologyPredictaPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel:
      'Numerology name number, birth number, destiny number, and current cycle evidence',
    handoffMode: 'room_safe',
    prompt: 'Read what my name number, birth number, destiny number, and current cycle say now.',
    school: 'NUMEROLOGY',
    sourceScreen: 'Numerology Evidence Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="numerology" />
      <WebNumerologyPredictaPanel />
    </section>
  );
}
