import { WebEvidenceRoomDeferredSection } from './WebEvidenceRoomDeferredSection';
import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebVedicWorldPage(): React.JSX.Element {
  const chatHref = buildPredictaChatHref({
    evidenceSourceLabel:
      'Vedic D1, Moon, D9, D10, Chalit, dasha, gochar, yog, Dosh, Shrap, Lal Kitab, and remedy evidence',
    handoffMode: 'room_safe',
    prompt:
      'Read my main Vedic guidance now. Give the direct answer first, then show the chart evidence only if needed.',
    school: 'PARASHARI',
    sourceScreen: 'Vedic Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={chatHref} room="vedic" />
      <WebEvidenceRoomDeferredSection room="vedic" />
    </section>
  );
}
