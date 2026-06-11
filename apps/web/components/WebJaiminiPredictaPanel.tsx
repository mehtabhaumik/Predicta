'use client';

import { getJaiminiLocalizationCopy } from '@pridicta/config';
import { translateUiText } from '@pridicta/config/uiTranslations';
import {
  PREDICTA_INTELLIGENCE_UI_RHYTHM,
  composeJaiminiInterpretation,
  composeJaiminiPlan,
  getPredictaSchoolIntelligencePattern,
} from '@pridicta/astrology';
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
  const t = (value: string) => translateUiText(value, language);
  const { activeKundli } = useWebKundliLibrary();
  const jaiminiPlan = composeJaiminiPlan(activeKundli);
  const jaiminiInterpretation = composeJaiminiInterpretation(activeKundli);
  const intelligencePattern = getPredictaSchoolIntelligencePattern('JAIMINI');
  const intelligencePatternCopy = {
    action: intelligencePattern.action,
    evidence: intelligencePattern.evidence,
    prediction: intelligencePattern.prediction,
    safety: intelligencePattern.safety,
  };
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
  const shouldUseGeneratedJaiminiText = language === 'en';
  const chatHref = buildPredictaChatHref({
    carriedContextLabel: t('Current destiny chapter'),
    eventOracleHandoff: true,
    evidenceSourceLabel: t(
      'Jaimini karaka, Arudha, Karakamsha, and destiny chapter evidence',
    ),
    handoffMode: 'room_safe',
    kundli: activeKundli,
    prompt:
      t('Read my current Jaimini destiny chapter and tell me what it means for my life now.'),
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
      <PredictaPanel className="jaimini-room-hero predicta-world-hero">
        <div className="jaimini-room-hero-copy predicta-world-hero-copy">
          <p className="section-title">{copy.heroEyebrow.toUpperCase()}</p>
          <h1>{copy.destinyRoleTitle}</h1>
          <p>
            {shouldUseGeneratedJaiminiText
              ? jaiminiInterpretation.summary
              : copy.karakaPreviewBody}
          </p>
          <div
            className="predicta-world-primary-guidance"
            data-competitor-response-phase4-primary-guidance="jaimini"
          >
            <span>{t('START HERE')}</span>
            <strong>{t('Your soul-role answer comes before the karaka proof.')}</strong>
            <p>
              {copy.downloadCta} · {copy.askCta}
            </p>
          </div>
          <div
            aria-label={copy.primaryActionsAria}
            className="jaimini-room-cta-row predicta-world-actions"
            data-audit1-phase6-hero-interaction="jaimini"
          >
            <PredictaButton href="/dashboard/report#report-lane-jaimini" size="lg" variant="primary">
              {copy.downloadCta}
            </PredictaButton>
            <PredictaButton href={chatHref} size="lg" variant="secondary">
              {copy.askCta}
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

      <details className="predicta-world-proof-disclosure glass-panel">
        <summary>
          <span>{copy.evidenceTitle}</span>
          <strong>{t('Open evidence')}</strong>
        </summary>
        <section
          aria-label={t(`${intelligencePattern.label} intelligence rhythm`)}
          className="predicta-intelligence-pattern"
          data-audit1-phase7f-intelligence-pattern="jaimini"
        >
          {PREDICTA_INTELLIGENCE_UI_RHYTHM.map(step => (
            <article className="predicta-intelligence-step" key={step.id}>
              <span>{t(step.label)}</span>
              <strong>{t(intelligencePatternCopy[step.id])}</strong>
            </article>
          ))}
        </section>
      </details>

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
            <h2>
              {shouldUseGeneratedJaiminiText
                ? card.block?.headline ?? card.fallback
                : card.fallback}
            </h2>
            <p>
              {shouldUseGeneratedJaiminiText
                ? card.block?.guidance ?? copy.fallbackGeneric
                : copy.fallbackGeneric}
            </p>
          </article>
        ))}
      </section>

      <section className="jaimini-premium-summary" aria-label={copy.premiumEyebrow}>
        <div>
          <p className="section-title">{copy.premiumEyebrow.toUpperCase()}</p>
          <h2>
            {shouldUseGeneratedJaiminiText
              ? premiumBlock?.headline ?? copy.premiumFallback
              : copy.premiumFallback}
          </h2>
          <p>
            {shouldUseGeneratedJaiminiText
              ? premiumBlock?.guidance ?? jaiminiInterpretation.premiumSummary
              : copy.chatBody}
          </p>
        </div>
        <PredictaButton href="/dashboard/report#report-lane-jaimini" variant="secondary">
          {copy.downloadFullCta}
        </PredictaButton>
      </section>

      <details className="jaimini-technical-drawer predicta-world-proof-disclosure">
        <summary>
          <span>{copy.evidenceTitle}</span>
          <strong>{copy.proofLine}</strong>
        </summary>
        <div className="jaimini-evidence-list predicta-world-proof-grid">
          {shouldUseGeneratedJaiminiText ? (
            jaiminiInterpretation.technicalEvidence.map(item => (
              <p key={item}>{item}</p>
            ))
          ) : (
            <p>{copy.proofLine}</p>
          )}
        </div>
      </details>
    </section>
  );
}
