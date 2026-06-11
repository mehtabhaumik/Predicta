import { WebKpPredictaLoader } from './WebKpPredictaLoader';
import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebKpPage(): React.JSX.Element {
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
