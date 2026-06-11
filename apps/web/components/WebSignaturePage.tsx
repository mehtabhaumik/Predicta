import { WebEvidenceRoomEntry } from './WebEvidenceRoomEntry';
import { WebSignatureAnalysisLoader } from './WebSignatureAnalysisLoader';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

export function WebSignaturePage(): React.JSX.Element {
  const askHref = buildPredictaChatHref({
    evidenceSourceLabel: 'Confirmed signature traits and reflective expression evidence',
    handoffMode: 'room_safe',
    prompt: 'Read my confirmed signature traits safely and explain what they reflect.',
    school: 'SIGNATURE',
    sourceScreen: 'Signature Evidence Room',
  });

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={askHref} room="signature" />
      <WebSignatureAnalysisLoader />
    </section>
  );
}
