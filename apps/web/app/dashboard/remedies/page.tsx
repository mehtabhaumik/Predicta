import { WebEvidenceRoomEntry } from '../../../components/WebEvidenceRoomEntry';
import { WebRemedyCoachLoader } from '../../../components/WebRemedyCoachLoader';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';

export default function RemediesPage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel: 'Kundli Karma Dosh, Shrap, Yog, and Lal Kitab evidence',
    handoffMode: 'room_safe',
    prompt:
      'Read the active Dosh, Shrap, Yog, Lal Kitab pressure, support, and safest remedy plan.',
    sourceScreen: 'Kundli Karma Evidence Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="kundliKarma" />
      <WebRemedyCoachLoader />
    </section>
  );
}
