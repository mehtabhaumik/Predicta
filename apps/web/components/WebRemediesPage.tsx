import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { WebRemedyCoachLoader } from './WebRemedyCoachLoader';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebRemediesPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel: 'Kundli Karma Dosh, Shrap, Yog, and Lal Kitab evidence',
    handoffMode: 'room_safe',
    prompt:
      'Read the active Dosh, Shrap, Yog, Lal Kitab pressure, support, and safest remedy plan.',
    sourceScreen: 'Kundli Karma Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="kundliKarma" />
      <WebRemedyCoachLoader />
    </section>
  );
}
