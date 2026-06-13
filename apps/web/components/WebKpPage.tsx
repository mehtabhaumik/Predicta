import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { WebEvidenceRoomDeferredSection } from './WebEvidenceRoomDeferredSection';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebKpPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel: 'KP cusp, sub-lord, significator, and timing evidence',
    handoffMode: 'room_safe',
    prompt: 'Help me ask one clear KP event question and read the timing evidence.',
    school: 'KP',
    sourceScreen: 'KP Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="kp" />
      <WebEvidenceRoomDeferredSection room="kp" />
    </section>
  );
}
