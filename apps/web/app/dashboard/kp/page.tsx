import { WebKpPredictaLoader } from '../../../components/WebKpPredictaLoader';
import { WebEvidenceRoomEntry } from '../../../components/WebEvidenceRoomEntry';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';

export default function KpPredictaPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel: 'KP cusp, sub-lord, significator, and timing evidence',
    handoffMode: 'room_safe',
    prompt: 'Help me ask one clear KP event question and read the timing evidence.',
    school: 'KP',
    sourceScreen: 'KP Evidence Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="kp" />
      <WebKpPredictaLoader />
    </section>
  );
}
