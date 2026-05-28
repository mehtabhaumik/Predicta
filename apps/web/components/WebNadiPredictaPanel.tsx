'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { composeNadiJyotishPlan, getLocalizedPlanetName } from '@pridicta/astrology';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { Card } from './Card';
import { PredictaWorldFrame } from './PredictaWorldFrame';

const NADI_WORLD_PROOF_CARDS = [
  {
    body:
      'Nadi Predicta reads planet-to-planet story links and karmic themes from the calculated chart.',
    title: 'Story links',
  },
  {
    body:
      'It asks validation questions before strong event-level statements, so the reading stays careful.',
    title: 'Validation first',
  },
  {
    body:
      'It never claims access to an ancient palm-leaf manuscript. The source is your calculated chart.',
    title: 'Clear source',
  },
] as const;

type WebNadiPredictaPanelProps = {
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function WebNadiPredictaPanel({
  handoffQuestion,
  hasPremiumAccess = false,
  kundli,
  schoolCalculationStatus = 'idle',
}: WebNadiPredictaPanelProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const plan = composeNadiJyotishPlan(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    handoffQuestion,
    language,
  });
  const didLoadSavedState = useRef(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(
    plan.patterns[0]?.id,
  );
  const selectedPattern =
    plan.patterns.find(pattern => pattern.id === selectedPatternId) ??
    plan.patterns[0];
  const selectedActivation = useMemo(
    () =>
      selectedPattern
        ? plan.activations.find(activation =>
            activation.observation.includes(selectedPattern.title) ||
            selectedPattern.planets.some(planet =>
              activation.trigger.includes(getLocalizedPlanetName(planet, language)),
            ),
          ) ?? plan.activations[0]
        : plan.activations[0],
    [language, plan.activations, selectedPattern],
  );
  const selectedPatternMeaning = useMemo(
    () =>
      buildNadiPatternMeaning({
        activation: selectedActivation,
        language,
        pattern: selectedPattern,
      }),
    [language, selectedActivation, selectedPattern],
  );
  const askHref = buildNadiAskHref({
    activation: selectedActivation,
    handoffQuestion,
    kundliId: kundli?.id,
    pattern: selectedPattern,
    planPrompt: plan.askPrompt,
  });

  useEffect(() => {
    const savedNadi = loadWebAutoSaveMemory().nadi;

    if (savedNadi?.selectedPatternId) {
      setSelectedPatternId(savedNadi.selectedPatternId);
    }

    didLoadSavedState.current = true;
  }, []);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    saveWebAutoSaveMemory({
      nadi: {
        handoffQuestion,
        selectedPatternId,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [handoffQuestion, selectedPatternId]);

  return (
    <div className="predicta-world-page predicta-world-page--nadi kp-page-stack">
      <PredictaWorldFrame
        badge={t('Nadi world')}
        body={t(
          'Nadi Predicta is its own premium world. It reads planetary story links, karaka themes, validation questions, and timing activations. It does not pretend to access original palm-leaf manuscripts.',
        )}
        chatHref={askHref}
        chatLabel={t('Chat with Nadi Predicta')}
        eyebrow={t('Nadi Predicta')}
        heroInteraction={
          <div
            className="specialist-hero-interaction nadi-story-thread-mini"
            data-audit1-phase6-hero-interaction="nadi"
          >
            <span>
              <strong>{t('Strongest story thread')}</strong>
              <small>{plan.storyLens.strongestThread}</small>
            </span>
            <span>
              <strong>{t('Hidden pattern')}</strong>
              <small>{plan.storyLens.hiddenPatternSentence}</small>
            </span>
            <span>
              <strong>{t('Next practice')}</strong>
              <small>{plan.rahuKetuAxis.balancePractice}</small>
            </span>
          </div>
        }
        localActions={[
          {
            href: '#nadi-story-links',
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.4efb702f65")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.5b5bfadcf8")
                  : 'Story links',
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.9aa8ec7546")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.b7c3c567c6")
                  : 'Pick the main story pattern from planet-to-planet links.',
          },
          {
            href: '#nadi-activations',
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.3fb9795530")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.c10d34398e")
                  : 'Activation windows',
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.ccc2967c3f")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.28eaacc395")
                  : 'See when the selected story is more likely to feel active.',
          },
          {
            href: '#nadi-validation',
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.ccee03accb")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.1a43a38677")
                  : 'Validation',
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.bc098cddc4")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.e60c58c1d3")
                  : 'Keep validation ahead of strong event-level claims.',
          },
          {
            href: '/dashboard/report',
            label: t('Build Nadi report'),
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.c598a416d7")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.8399a70a7f")
                  : 'Move into the report path when the pattern needs a structured reading.',
          },
        ]}
        localEyebrow={t('NADI METHOD')}
        localTitle={t('Separate from Parashari and KP.')}
        pillars={[
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.eb28ad3ea8")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.c4fa0f6e97")
                  : 'Source',
            value:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.1abbb9b898")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.bfbbf65644")
                  : 'Planet stories',
          },
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.cb4800046a")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.8c1ae6f5ea")
                  : 'Safety',
            value:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.40eb95717e")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.058153827e")
                  : 'Validation first',
          },
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.7457c45e9e")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.82e44a590f")
                  : 'Timing',
            value:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.045a445e95")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.d71734810c")
                  : 'Active windows',
          },
        ]}
        proofCards={NADI_WORLD_PROOF_CARDS.map(card => ({
          body: t(card.body),
          title: t(card.title),
        }))}
        proofLabel={t('Proof')}
        reportLabel={t('Build Nadi report')}
        reportNote={plan.schoolBoundary}
        theme="nadi"
        title={t('Premium Nadi reading room.')}
      />

      <Card className="glass-panel kp-school-panel">
        <div className="card-content spacious">
          <div className="school-explain-box">
            <strong>{plan.title}</strong>
            <p>{hasPremiumAccess ? plan.premiumSynthesis ?? plan.freePreview : plan.freePreview}</p>
          </div>

          <div className="school-explain-box">
            <strong>{t('HIDDEN PATTERN SENTENCE')}</strong>
            <p>{plan.storyLens.hiddenPatternSentence}</p>
          </div>

          <div className="school-grid significators" aria-label="Nadi karmic story map">
            <div>
              <span>{t('Strongest story thread')}</span>
              <strong>{plan.storyLens.strongestThread}</strong>
              <p>{plan.storyLens.repeatingPattern}</p>
            </div>
            <div>
              <span>{t('Active lesson')}</span>
              <strong>{t('What repeats')}</strong>
              <p>{plan.storyLens.activeLesson}</p>
            </div>
            <div>
              <span>{t('Shift that helps')}</span>
              <strong>{t('Conscious response')}</strong>
              <p>{plan.storyLens.shiftThatHelps}</p>
            </div>
          </div>

          <div className="school-grid significators" aria-label="Nadi past pattern current lesson next practice">
            <div>
              <span>{t('Past Pattern')}</span>
              <strong>{t('What keeps repeating')}</strong>
              <p>{plan.storyLens.repeatingPattern}</p>
            </div>
            <div>
              <span>{t('Current Lesson')}</span>
              <strong>{t('What Predicta is validating')}</strong>
              <p>{plan.storyLens.activeLesson}</p>
            </div>
            <div>
              <span>{t('Next Practice')}</span>
              <strong>{t('What helps now')}</strong>
              <p>{plan.rahuKetuAxis.balancePractice}</p>
            </div>
          </div>

          <div className="school-callout">{plan.schoolBoundary}</div>
          {handoffQuestion ? (
            <div className="school-callout active">
              {t('Question received')}: “{handoffQuestion}”.{' '}
              {t(
                'Nadi Predicta will keep this question with the active birth profile and read it only from Nadi-style planetary stories.',
              )}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <details className="info-drawer school-explain-box">
            <summary>
              <span>{t('Story evidence')}</span>
              <strong>{t('Nadi method and boundaries')}</strong>
            </summary>
            <div className="section-title">{t('NADI METHOD')}</div>
            <h2>{t('Separate from Parashari and KP.')}</h2>
            <p>{plan.methodSummary}</p>
            <div className="school-grid significators">
              {plan.guardrails.slice(0, 5).map(item => (
                <div key={item}>
                  <span>{t('Boundary')}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </details>
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">{t('RAHU-KETU AXIS CARD')}</div>
          <h2>{t('What pulls forward, and what asks to be released.')}</h2>
          <div className="school-grid significators">
            <div>
              <span>{t('What pulls you forward')}</span>
              <strong>{t('Rahu pull')}</strong>
              <p>{plan.rahuKetuAxis.pullsForward}</p>
            </div>
            <div>
              <span>{t('What you are learning to release')}</span>
              <strong>{t('Ketu release')}</strong>
              <p>{plan.rahuKetuAxis.learningToRelease}</p>
            </div>
            <div>
              <span>{t('Where the pattern becomes louder')}</span>
              <strong>{t('Activation')}</strong>
              <p>{plan.rahuKetuAxis.becomesLouder}</p>
            </div>
            <div>
              <span>{t('One practice for balance')}</span>
              <strong>{t('Practice')}</strong>
              <p>{plan.rahuKetuAxis.balancePractice}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel" id="nadi-story-links">
        <div className="card-content spacious">
          <div className="section-title">{t('STORY LINKS')}</div>
          <h2>{t('What the Nadi layer noticed.')}</h2>
          <div className="nadi-story-map">
            {plan.patterns.map((pattern, index) => (
              <button
                aria-pressed={selectedPattern?.id === pattern.id}
                className={selectedPattern?.id === pattern.id ? 'active' : ''}
                key={pattern.id}
                onClick={() => setSelectedPatternId(pattern.id)}
                style={{ ['--nadi-node-index' as string]: index } as CSSProperties}
                type="button"
              >
                <span>
                  {getNadiConfidenceLabel(pattern.confidence, language)} {t('confidence')}
                </span>
                <strong>{pattern.planets.join(' + ')}</strong>
                <small>{getNadiRelationLabel(pattern.relation, language)}</small>
              </button>
            ))}
          </div>
          {!plan.patterns.length ? (
            <p>
              {t(getNadiCalculationMessage(Boolean(kundli), schoolCalculationStatus))}
            </p>
          ) : null}
          {selectedPattern ? (
            <div className="nadi-pattern-detail">
              <div>
                <span>
                  {language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.e4b872a11d")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.ca5852cd5a")
                      : 'What this Nadi pattern is saying'}
                </span>
                <h3>{selectedPattern.title}</h3>
                <p>{selectedPatternMeaning.whatItSays}</p>
              </div>
              <div className="school-grid significators">
                <div>
                  <span>
                    {language === 'hi'
                      ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.49e81bc5f3")
                      : language === 'gu'
                        ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.411444a64e")
                        : 'Main gift'}
                  </span>
                  <strong>{selectedPatternMeaning.giftTitle}</strong>
                  <p>{selectedPatternMeaning.gift}</p>
                </div>
                <div>
                  <span>
                    {language === 'hi'
                      ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.136ef2d0e3")
                      : language === 'gu'
                        ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.abdcc45994")
                        : 'Main caution'}
                  </span>
                  <strong>{selectedPatternMeaning.cautionTitle}</strong>
                  <p>{selectedPatternMeaning.caution}</p>
                </div>
                <div>
                  <span>
                    {language === 'hi'
                      ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.7db067306d")
                      : language === 'gu'
                        ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.e2b6f1e905")
                        : 'Next guidance'}
                  </span>
                  <strong>{selectedPatternMeaning.guidanceTitle}</strong>
                  <p>{selectedPatternMeaning.guidance}</p>
                </div>
              </div>
              <div className="nadi-evidence-row">
                {selectedPattern.evidence.map(item => (
                  <small key={item}>{item}</small>
                ))}
              </div>
              <div className="nadi-area-row">
                {selectedPattern.lifeAreas.map(area => (
                  <strong key={area}>{getNadiLifeAreaLabel(area, language)}</strong>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel" id="nadi-activations">
        <div className="card-content spacious">
          <div className="section-title">{t('ACTIVATION WINDOWS')}</div>
          <h2>{t('When the story is more likely to feel active.')}</h2>
          <div className="nadi-activation-list">
            {plan.activations.map((activation, index) => (
              <div
                className={
                  selectedActivation?.id === activation.id ? 'active' : ''
                }
                key={activation.id}
                style={{ ['--nadi-node-index' as string]: index } as CSSProperties}
              >
                <span>{activation.trigger}</span>
                <strong>{activation.title}</strong>
                <p>{hasPremiumAccess ? activation.premiumDetail ?? activation.guidance : activation.guidance}</p>
                <small>{activation.timing}</small>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-panel" id="nadi-validation">
        <div className="card-content spacious">
          <div className="section-title">{t('Validation Bridge')}</div>
          <h2>{t('Predicta asks before going deep.')}</h2>
          <div className="nadi-validation-stack">
            {plan.validationQuestions.slice(0, 4).map((question, index) => (
              <div
                key={question}
                style={{ ['--nadi-node-index' as string]: index } as CSSProperties}
              >
                <span>{t('Validation question')}</span>
                <strong>{question}</strong>
              </div>
            ))}
          </div>
          <div className="action-row">
            <a
              className="button"
              href={askHref}
            >
              {t('Ask Nadi Predicta')}
            </a>
            <Link className="button secondary" href="/pricing">
              {t('See Premium Nadi')}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function buildNadiAskHref({
  activation,
  handoffQuestion,
  kundliId,
  pattern,
  planPrompt,
}: {
  activation?: { title: string; trigger: string };
  handoffQuestion?: string;
  kundliId?: string;
  pattern?: {
    title: string;
    planets: string[];
    relation: string;
    observation: string;
  };
  planPrompt: string;
}): string {
  const prompt = [
    handoffQuestion
      ? `Nadi Predicta question: ${handoffQuestion}.`
      : planPrompt,
    pattern
      ? `Read this through the selected Nadi story link: ${pattern.title}, planets ${pattern.planets.join(' and ')}, relation ${pattern.relation}. Evidence: ${pattern.observation}.`
      : '',
    activation
      ? `Use activation context: ${activation.title}, trigger ${activation.trigger}.`
      : '',
    'Stay in Nadi Predicta only. Do not mix Parashari or KP. Do not claim palm-leaf manuscript access. Ask validation questions before strong event-level statements.',
  ]
    .filter(Boolean)
    .join(' ');
  return buildPredictaChatHref({
    handoffQuestion,
    kundliId,
    prompt,
    school: 'NADI',
    selectedSection: pattern?.title ?? 'Nadi pattern reading',
    sourceScreen: 'Nadi Predicta',
  });
}

function getNadiCalculationMessage(
  hasKundli: boolean,
  status: 'idle' | 'calculating' | 'error',
): string {
  if (!hasKundli) {
    return 'Create a Kundli once, then Nadi Predicta will prepare its story links from those birth details.';
  }

  if (status === 'calculating') {
    return 'Preparing Nadi story links from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but the Nadi preparation could not complete right now. Please try again shortly.';
  }

  return 'Nadi Predicta is preparing this layer from the saved birth profile.';
}

function getNadiConfidenceLabel(
  confidence: 'high' | 'medium' | 'low',
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    if (confidence === 'high') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.f710a0185f");
    }
    if (confidence === 'medium') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.151a391fb1");
    }
    return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.424846591f");
  }

  if (language === 'gu') {
    if (confidence === 'high') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.ce9c14c0f1");
    }
    if (confidence === 'medium') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.fbb412035d");
    }
    return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.38d92beee2");
  }

  return confidence;
}

function getNadiRelationLabel(
  relation: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    if (relation === 'same-sign') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.5670906f40");
    }
    if (relation === 'trine-link') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.8b6d34b5ab");
    }
    if (relation === 'opposition-link') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.19485b7889");
    }
    if (relation === 'sequence-link') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.e12cbc0e90");
    }
    if (relation === 'rahu-ketu-axis') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.a053a1ea60");
    }
    return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.5559a543b3");
  }

  if (language === 'gu') {
    if (relation === 'same-sign') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.74e47c12d6");
    }
    if (relation === 'trine-link') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.07f57f7d14");
    }
    if (relation === 'opposition-link') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.0f9aea8a84");
    }
    if (relation === 'sequence-link') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.6652e87836");
    }
    if (relation === 'rahu-ketu-axis') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.5dca588e68");
    }
    return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.aba2d89499");
  }

  return relation.replaceAll('-', ' ');
}

function getNadiLifeAreaLabel(
  area: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    if (area === 'career') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.3968c1424c");
    }
    if (area === 'wealth') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.4a727823f0");
    }
    if (area === 'relationship') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.9d4cd64169");
    }
    if (area === 'wellbeing') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.c6ed8f708a");
    }
    if (area === 'spirituality') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.b2637a1b95");
    }
    return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.4b5c7ff538");
  }

  if (language === 'gu') {
    if (area === 'career') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.0de6a39828");
    }
    if (area === 'wealth') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.a0cf33e8c0");
    }
    if (area === 'relationship') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.a870d9ae3e");
    }
    if (area === 'wellbeing') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.8648ceb3b0");
    }
    if (area === 'spirituality') {
      return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.43589e1d94");
    }
    return getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.20b6231dd7");
  }

  if (area === 'wellbeing') {
    return 'wellbeing';
  }

  return area;
}

function buildNadiPatternMeaning({
  activation,
  language,
  pattern,
}: {
  activation?: { guidance: string; title: string; trigger: string };
  language: SupportedLanguage;
  pattern?: {
    freeInsight: string;
    lifeAreas: string[];
    meaning: string;
    observation: string;
    premiumDetail?: string;
    title: string;
    weight: 'supportive' | 'mixed' | 'challenging' | 'neutral';
  };
}): {
  caution: string;
  cautionTitle: string;
  gift: string;
  giftTitle: string;
  guidance: string;
  guidanceTitle: string;
  whatItSays: string;
} {
  if (!pattern) {
    return {
      caution:
        language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.f4c9fbf7ea")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.a1f2e5f60e")
            : 'Let the story pattern prepare first.',
      cautionTitle:
        language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.c402d3eea9")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.8beea29c17")
            : 'Still preparing',
      gift:
        language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.973929493d")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.16cd2e5bb2")
            : 'The life themes will become clearer once the Nadi story is ready.',
      giftTitle:
        language === 'hi' ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.85c1667cde") : language === 'gu' ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.7e92e105c0") : 'Story pending',
      guidance:
        language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.fec68472ed")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.63eadc31ac")
            : 'Keep the birth profile saved, then reopen the Nadi path.',
      guidanceTitle:
        language === 'hi' ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.723d5c159a") : language === 'gu' ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.7b316efad6") : 'Next step',
      whatItSays:
        language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.5974001088")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.4ff6b38f17")
            : 'The Nadi layer is still selecting the first story.',
    };
  }

  const areaText = pattern.lifeAreas
    .map(area => getNadiLifeAreaLabel(area, language))
    .join(', ');
  const cautionTitle =
      pattern.weight === 'challenging'
        ? language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.bde372aab5")
          : language === 'gu'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.e50334ec5f")
          : 'Heavier pattern'
      : language === 'hi'
        ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.48f51d1ae9")
        : language === 'gu'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.44694a620e")
          : 'Mixed pattern';

  return {
    caution:
      pattern.weight === 'challenging'
        ? language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.f35fb26028")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.b02e551869")
            : 'Do not read this like fixed fate. Validate it first, then move into event-level guidance.'
        : language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.2f1918321f")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.fbebb443ab")
            : 'This story links one life area to another, so avoid rushing into conclusions.',
    cautionTitle,
    gift:
      language === 'hi'
        ? formatNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.d850817a6a", [areaText])
        : language === 'gu'
          ? formatNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.bb64ddaed2", [areaText])
          : `This story helps you spot repeating links across ${areaText}.`,
    giftTitle:
      language === 'hi'
        ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.d37e68f146")
        : language === 'gu'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.f73c51ae0b")
          : 'Repeating signal',
    guidance:
      activation
        ? activation.guidance
        : language === 'hi'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.c13b368031")
          : language === 'gu'
            ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.18d750053d")
            : 'Find the real-life examples first, then go deeper into the story.',
    guidanceTitle:
      activation?.title ??
      (language === 'hi'
        ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.723d5c159a")
        : language === 'gu'
          ? getNativeCopy("native.apps.web.components.WebNadiPredictaPanel.tsx.7b316efad6")
          : 'Next step'),
    whatItSays:
      activation
        ? `${pattern.meaning} ${activation.trigger}. ${activation.guidance}`
        : pattern.meaning,
  };
}
