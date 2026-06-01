'use client';

import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { PredictaWorldFrame } from './PredictaWorldFrame';
import { PredictaButton } from './ui/DesignSystemPrimitives';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

const JAIMINI_PILLARS = [
  { label: 'Soul planet', value: 'Atmakaraka' },
  { label: 'Visible path', value: 'Arudha' },
  { label: 'Life chapter', value: 'Chara Dasha' },
] as const;

const JAIMINI_ACTIONS = [
  {
    href: '#jaimini-soul-role',
    label: 'Soul role',
    note: 'See what your chart is preparing you to master from within.',
  },
  {
    href: '#jaimini-visible-identity',
    label: 'Visible identity',
    note: 'Understand how your life direction is seen by the world.',
  },
  {
    href: '#jaimini-destiny-chapter',
    label: 'Destiny chapter',
    note: 'Prepare for the Chara Dasha timeline when the deterministic layer is green.',
  },
] as const;

const JAIMINI_PROOF_CARDS = [
  {
    title: 'Chara Karaka council',
    body:
      'Jaimini will read Atmakaraka, Amatyakaraka, Darakaraka, and the full karaka order after the shared data contract is implemented.',
  },
  {
    title: 'Karakamsha and Swamsa',
    body:
      'The soul-seat charts will become the technical proof behind the plain-language soul role reading.',
  },
  {
    title: 'Arudha and Upapada',
    body:
      'Visible identity and relationship mirrors will be explained through Jaimini evidence, not unsupported story language.',
  },
] as const;

export function WebJaiminiPredictaPanel(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const chatHref = buildPredictaChatHref({
    kundli: activeKundli,
    prompt:
      'Use Jaimini Predicta for my question. Focus on soul role, visible identity, career dharma, relationship mirror, and destiny chapter.',
    school: 'JAIMINI',
    sourceScreen: 'Jaimini Predicta',
  });

  return (
    <>
      <WebActiveKundliActions
        compact
        kundli={activeKundli}
        school="JAIMINI"
        sourceScreen="Jaimini Predicta"
        title="Jaimini reading Kundli"
      />
      <PredictaWorldFrame
        badge="Classical soul-destiny lens"
        body="Jaimini Predicta is being introduced as the classical specialist for soul role, visible identity, career dharma, relationship mirror, and destiny chapters. The screen stays calm now; the deterministic karaka and Chara Dasha layer is built in the next phase."
        chatAction={
          <PredictaButton href={chatHref} variant="secondary">
            Ask Jaimini Predicta
          </PredictaButton>
        }
        chatHref={chatHref}
        chatLabel="Ask Jaimini Predicta"
        eyebrow="JAIMINI PREDICTA"
        localActions={[...JAIMINI_ACTIONS]}
        localEyebrow="Calm destiny room"
        localTitle="What Jaimini will help you understand"
        pillars={[...JAIMINI_PILLARS]}
        proofCards={[...JAIMINI_PROOF_CARDS]}
        proofLabel="Jaimini evidence"
        reportHref="/dashboard/report#report-lane-jaimini"
        reportLabel="Build Jaimini report"
        reportNote="Jaimini reports are shown in the report marketplace now. Download generation unlocks only after the Jaimini report engine is audited."
        theme="jaimini"
        title="Your soul role and destiny chapter, without clutter."
      />
    </>
  );
}
