'use client';

import { composeJaiminiInterpretation, composeJaiminiPlan } from '@pridicta/astrology';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import {
  PredictaBadge,
  PredictaButton,
  PredictaPanel,
} from './ui/DesignSystemPrimitives';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

export function WebJaiminiPredictaPanel(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const jaiminiPlan = composeJaiminiPlan(activeKundli);
  const jaiminiInterpretation = composeJaiminiInterpretation(activeKundli);
  const blockById = Object.fromEntries(
    jaiminiInterpretation.blocks.map(block => [block.id, block]),
  );
  const soulBlock = blockById['soul-planet-reading'];
  const careerBlock = blockById['career-dharma-reading'];
  const relationshipBlock = blockById['relationship-mirror-reading'];
  const visibleBlock = blockById['visible-identity-reading'];
  const destinyBlock = blockById['current-destiny-chapter'];
  const focusBlock = blockById['what-to-focus-on-now'];
  const premiumBlock = blockById['premium-deepening'];
  const chatHref = buildPredictaChatHref({
    kundli: activeKundli,
    prompt:
      `Use Jaimini Predicta for my question. Start with this prediction: ${jaiminiInterpretation.summary} Calculated evidence: ${jaiminiInterpretation.technicalEvidence.slice(0, 4).join(' | ')}`,
    school: 'JAIMINI',
    sourceScreen: 'Jaimini Predicta',
  });
  const compassItems = [
    {
      label: 'Soul planet',
      value: jaiminiPlan.atmakaraka?.planet ?? 'Pending',
    },
    {
      label: 'Career dharma',
      value: jaiminiPlan.amatyakaraka?.planet ?? 'Pending',
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
  const readingCards = [
    {
      anchor: 'jaimini-soul-role',
      block: soulBlock,
      eyebrow: 'Soul compass',
      fallback: 'Your deeper role is waiting for verified karaka evidence.',
    },
    {
      anchor: 'jaimini-visible-identity',
      block: visibleBlock,
      eyebrow: 'Visible identity',
      fallback: 'Your public image signal is waiting for Arudha evidence.',
    },
    {
      anchor: 'jaimini-career-dharma',
      block: careerBlock,
      eyebrow: 'Career dharma',
      fallback: 'Your work direction is waiting for the career-karaka evidence.',
    },
    {
      anchor: 'jaimini-relationship-mirror',
      block: relationshipBlock,
      eyebrow: 'Relationship mirror',
      fallback: 'Your relationship mirror is waiting for Darakaraka evidence.',
    },
    {
      anchor: 'jaimini-destiny-chapter',
      block: destinyBlock,
      eyebrow: 'Current Chara Dasha chapter',
      fallback: 'Your current Jaimini timing chapter is still pending.',
    },
    {
      anchor: 'jaimini-focus-now',
      block: focusBlock,
      eyebrow: 'What to focus on now',
      fallback: 'Your next focus is waiting for enough Jaimini evidence.',
    },
  ];
  const karakaPreview = jaiminiPlan.charaKarakas.slice(0, 7);

  return (
    <section className="jaimini-room-frame predicta-world--jaimini" data-jaimini-phase4-room>
      <WebActiveKundliActions
        compact
        kundli={activeKundli}
        school="JAIMINI"
        sourceScreen="Jaimini Predicta"
        title="Jaimini reading Kundli"
      />
      <PredictaPanel className="jaimini-room-hero">
        <div className="jaimini-room-hero-copy">
          <p className="section-title">JAIMINI PREDICTA</p>
          <h1>Your destiny role is being prepared from your chart</h1>
          <p>{jaiminiInterpretation.summary}</p>
          <div className="jaimini-room-cta-row" aria-label="Jaimini primary actions">
            <PredictaButton href={chatHref} size="lg" variant="primary">
              Ask Jaimini Predicta
            </PredictaButton>
            <PredictaButton href="/dashboard/report#report-lane-jaimini" size="lg" variant="secondary">
              Download Jaimini Report
            </PredictaButton>
          </div>
        </div>
        <aside className="jaimini-soul-compass-card" aria-label="Jaimini soul compass card">
          <PredictaBadge className="jaimini-room-badge">
            Classical soul-destiny lens
          </PredictaBadge>
          <div className="jaimini-compass-orbit" aria-hidden="true">
            <span>Soul</span>
            <span>Work</span>
            <span>Image</span>
            <span>Now</span>
          </div>
          <div className="jaimini-compass-grid">
            {compassItems.map(item => (
              <div className="jaimini-compass-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </PredictaPanel>

      <section className="jaimini-reading-grid" aria-label="Jaimini prediction cards">
        <article className="jaimini-karaka-preview-card">
          <div>
            <p className="section-title">KARAKA COUNCIL PREVIEW</p>
            <h2>Who is carrying the main life signals?</h2>
            <p>
              Predicta keeps this preview light: the council is here as evidence,
              while the reading cards tell you what the signals are asking from you.
            </p>
          </div>
          <div className="jaimini-karaka-list">
            {karakaPreview.length ? (
              karakaPreview.map(karaka => (
                <span key={`${karaka.role}-${karaka.planet}`}>
                  <strong>{karaka.role}</strong>
                  <em>{karaka.planet}</em>
                </span>
              ))
            ) : (
              <span>
                <strong>Pending</strong>
                <em>Select a Kundli to calculate the council.</em>
              </span>
            )}
          </div>
        </article>

        {readingCards.map(card => (
          <article className="jaimini-reading-card" id={card.anchor} key={card.anchor}>
            <span>{card.eyebrow}</span>
            <h2>{card.block?.headline ?? card.fallback}</h2>
            <p>{card.block?.guidance ?? 'Select a valid Kundli so Predicta can prepare this reading.'}</p>
          </article>
        ))}
      </section>

      <section className="jaimini-premium-summary" aria-label="Jaimini premium summary">
        <div>
          <p className="section-title">PREMIUM DEEPENING</p>
          <h2>{premiumBlock?.headline ?? 'Premium turns the signals into a sharper life-direction map.'}</h2>
          <p>{premiumBlock?.guidance ?? jaiminiInterpretation.premiumSummary}</p>
        </div>
        <PredictaButton href="/dashboard/report#report-lane-jaimini" variant="secondary">
          Download full Jaimini report
        </PredictaButton>
      </section>

      <details className="jaimini-technical-drawer">
        <summary>
          <span>Technical Evidence</span>
          <strong>Karaka, Arudha, Upapada, Swamsa, Karakamsha, and Chara Dasha proof</strong>
        </summary>
        <div className="jaimini-evidence-list">
          {jaiminiInterpretation.technicalEvidence.map(item => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </details>
    </section>
  );
}
