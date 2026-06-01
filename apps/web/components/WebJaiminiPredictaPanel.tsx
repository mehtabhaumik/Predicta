'use client';

import { getJaiminiLocalizationCopy } from '@pridicta/config';
import { composeJaiminiInterpretation, composeJaiminiPlan } from '@pridicta/astrology';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import {
  PredictaBadge,
  PredictaButton,
  PredictaPanel,
} from './ui/DesignSystemPrimitives';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

export function WebJaiminiPredictaPanel(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getJaiminiLocalizationCopy(language);
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
      `${copy.chatPrompt} Start with this prediction: ${jaiminiInterpretation.summary} Calculated evidence: ${jaiminiInterpretation.technicalEvidence.slice(0, 4).join(' | ')}`,
    school: 'JAIMINI',
    sourceScreen: copy.heroEyebrow,
  });
  const compassItems = [
    {
      label: copy.soulPlanet,
      value: jaiminiPlan.atmakaraka?.planet ?? copy.pending,
    },
    {
      label: copy.careerDharma,
      value: jaiminiPlan.amatyakaraka?.planet ?? copy.pending,
    },
    {
      label: copy.visiblePath,
      value: jaiminiPlan.arudhaLagna.padaSign ?? copy.pending,
    },
    {
      label: copy.lifeChapter,
      value: jaiminiPlan.currentCharaDasha?.sign ?? copy.pending,
    },
  ];
  const readingCards = [
    {
      anchor: 'jaimini-soul-role',
      block: soulBlock,
      eyebrow: copy.soulRole,
      fallback: copy.fallbackSoul,
    },
    {
      anchor: 'jaimini-visible-identity',
      block: visibleBlock,
      eyebrow: copy.visibleIdentity,
      fallback: copy.fallbackVisible,
    },
    {
      anchor: 'jaimini-career-dharma',
      block: careerBlock,
      eyebrow: copy.careerDharma,
      fallback: copy.fallbackCareer,
    },
    {
      anchor: 'jaimini-relationship-mirror',
      block: relationshipBlock,
      eyebrow: copy.relationshipMirror,
      fallback: copy.fallbackRelationship,
    },
    {
      anchor: 'jaimini-destiny-chapter',
      block: destinyBlock,
      eyebrow: copy.charaDashaChapter,
      fallback: copy.fallbackTiming,
    },
    {
      anchor: 'jaimini-focus-now',
      block: focusBlock,
      eyebrow: copy.focusNow,
      fallback: copy.fallbackFocus,
    },
  ];
  const karakaPreview = jaiminiPlan.charaKarakas.slice(0, 7);

  return (
    <section className="jaimini-room-frame predicta-world--jaimini" data-jaimini-phase4-room>
      <WebActiveKundliActions
        compact
        kundli={activeKundli}
        school="JAIMINI"
        sourceScreen={copy.heroEyebrow}
        title={copy.readingKundliTitle}
      />
      <PredictaPanel className="jaimini-room-hero">
        <div className="jaimini-room-hero-copy">
          <p className="section-title">{copy.heroEyebrow.toUpperCase()}</p>
          <h1>{copy.destinyRoleTitle}</h1>
          <p>{jaiminiInterpretation.summary}</p>
          <div className="jaimini-room-cta-row" aria-label={copy.primaryActionsAria}>
            <PredictaButton href={chatHref} size="lg" variant="primary">
              {copy.askCta}
            </PredictaButton>
            <PredictaButton href="/dashboard/report#report-lane-jaimini" size="lg" variant="secondary">
              {copy.downloadCta}
            </PredictaButton>
          </div>
        </div>
        <aside className="jaimini-soul-compass-card" aria-label={copy.compassAria}>
          <PredictaBadge className="jaimini-room-badge">
            {copy.lensBadge}
          </PredictaBadge>
          <div className="jaimini-compass-orbit" aria-hidden="true">
            <span>{copy.compassSoul}</span>
            <span>{copy.compassWork}</span>
            <span>{copy.compassImage}</span>
            <span>{copy.compassNow}</span>
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

      <section className="jaimini-reading-grid" aria-label={copy.readingAria}>
        <article className="jaimini-karaka-preview-card">
          <div>
            <p className="section-title">{copy.karakaCouncilEyebrow.toUpperCase()}</p>
            <h2>{copy.karakaCouncilTitle}</h2>
            <p>{copy.karakaPreviewBody}</p>
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
                <strong>{copy.karakaCouncilPending}</strong>
                <em>{copy.karakaCouncilEmpty}</em>
              </span>
            )}
          </div>
        </article>

        {readingCards.map(card => (
          <article className="jaimini-reading-card" id={card.anchor} key={card.anchor}>
            <span>{card.eyebrow}</span>
            <h2>{card.block?.headline ?? card.fallback}</h2>
            <p>{card.block?.guidance ?? copy.fallbackGeneric}</p>
          </article>
        ))}
      </section>

      <section className="jaimini-premium-summary" aria-label={copy.premiumEyebrow}>
        <div>
          <p className="section-title">{copy.premiumEyebrow.toUpperCase()}</p>
          <h2>{premiumBlock?.headline ?? copy.premiumFallback}</h2>
          <p>{premiumBlock?.guidance ?? jaiminiInterpretation.premiumSummary}</p>
        </div>
        <PredictaButton href="/dashboard/report#report-lane-jaimini" variant="secondary">
          {copy.downloadFullCta}
        </PredictaButton>
      </section>

      <details className="jaimini-technical-drawer">
        <summary>
          <span>{copy.evidenceTitle}</span>
          <strong>{copy.proofLine}</strong>
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
