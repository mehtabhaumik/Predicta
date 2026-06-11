import { WebEvidenceRoomEntry } from '../../../components/WebEvidenceRoomEntry';
import { WebNumerologyPredictaLoader } from '../../../components/WebNumerologyPredictaLoader';
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
      <WebNumerologyPredictaLoader />
    </section>
  );
}
