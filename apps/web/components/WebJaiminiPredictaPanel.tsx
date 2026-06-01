'use client';

import { composeJaiminiPlan } from '@pridicta/astrology';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { PredictaWorldFrame } from './PredictaWorldFrame';
import { PredictaButton } from './ui/DesignSystemPrimitives';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

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
    note: 'See the current baseline Chara Dasha chapter when birth evidence is available.',
  },
] as const;

export function WebJaiminiPredictaPanel(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const jaiminiPlan = composeJaiminiPlan(activeKundli);
  const chatHref = buildPredictaChatHref({
    kundli: activeKundli,
    prompt:
      `Use Jaimini Predicta for my question. Calculated evidence: ${jaiminiPlan.freeInsight}`,
    school: 'JAIMINI',
    sourceScreen: 'Jaimini Predicta',
  });
  const pillars = [
    {
      label: 'Soul planet',
      value: jaiminiPlan.atmakaraka?.planet ?? 'Pending',
    },
    {
      label: 'Visible path',
      value: jaiminiPlan.arudhaLagna.padaSign ?? 'Pending',
    },
    {
      label: 'Life chapter',
      value: jaiminiPlan.currentCharaDasha?.sign ?? 'Pending',
    },
  ];
  const proofCards = [
    {
      title: 'Chara Karaka council',
      body: jaiminiPlan.charaKarakas.length
        ? jaiminiPlan.charaKarakas
            .map(item => `${item.role}: ${item.planet}`)
            .join(' · ')
        : 'Create or select a Kundli so Predicta can calculate the Chara Karaka order.',
    },
    {
      title: 'Karakamsha and Swamsa',
      body: `Karakamsha: ${jaiminiPlan.karakamsha.ascendantSign ?? 'pending'} · Swamsa: ${jaiminiPlan.swamsa.ascendantSign ?? 'pending'}.`,
    },
    {
      title: 'Arudha and Upapada',
      body: `Arudha Lagna: ${jaiminiPlan.arudhaLagna.padaSign ?? 'pending'} · Upapada: ${jaiminiPlan.upapadaLagna.padaSign ?? 'pending'}.`,
    },
  ];

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
        body={jaiminiPlan.freeInsight}
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
        pillars={pillars}
        proofCards={proofCards}
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
