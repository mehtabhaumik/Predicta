'use client';

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
        localActions={[
          {
            href: '#nadi-story-links',
            label:
              language === 'hi'
                ? 'कथा संबंध'
                : language === 'gu'
                  ? 'કથા સંબંધ'
                  : 'Story links',
            note:
              language === 'hi'
                ? 'ग्रह-से-ग्रह संबंध से कक्षा की मुख्य कथा चुनें.'
                : language === 'gu'
                  ? 'ગ્રહથી ગ્રહ સંબંધમાંથી મુખ્ય કથા પસંદ કરો.'
                  : 'Pick the main story pattern from planet-to-planet links.',
          },
          {
            href: '#nadi-activations',
            label:
              language === 'hi'
                ? 'सक्रिय समय'
                : language === 'gu'
                  ? 'સક્રિય સમય'
                  : 'Activation windows',
            note:
              language === 'hi'
                ? 'कथा कब अधिक चलती है, यह समय परत से देखें.'
                : language === 'gu'
                  ? 'કથા ક્યારે વધુ સક્રિય બને છે, તે સમય સ્તરથી જુઓ.'
                  : 'See when the selected story is more likely to feel active.',
          },
          {
            href: '#nadi-validation',
            label:
              language === 'hi'
                ? 'पुष्टि प्रश्न'
                : language === 'gu'
                  ? 'પુષ્ટિ પ્રશ્નો'
                  : 'Validation',
            note:
              language === 'hi'
                ? 'मजबूत घटना स्तर उत्तर से पहले पुष्टि प्रश्न रखें.'
                : language === 'gu'
                  ? 'મજબૂત ઘટના સ્તરના જવાબ પહેલાં પુષ્ટિ પ્રશ્નો રાખો.'
                  : 'Keep validation ahead of strong event-level claims.',
          },
          {
            href: '/dashboard/report',
            label: t('Build Nadi report'),
            note:
              language === 'hi'
                ? 'जब कथा को क्रमबद्ध रिपोर्ट में बदलना हो, रिपोर्ट मार्ग लें.'
                : language === 'gu'
                  ? 'જ્યારે કથાને ગોઠવેલ રિપોર્ટમાં ફેરવવી હોય, ત્યારે રિપોર્ટ માર્ગ લો.'
                  : 'Move into the report path when the pattern needs a structured reading.',
          },
        ]}
        localEyebrow={t('NADI METHOD')}
        localTitle={t('Separate from Parashari and KP.')}
        pillars={[
          {
            label:
              language === 'hi'
                ? 'मुख्य स्रोत'
                : language === 'gu'
                  ? 'મુખ્ય સ્ત્રોત'
                  : 'Source',
            value:
              language === 'hi'
                ? 'ग्रह कथा'
                : language === 'gu'
                  ? 'ગ્રહ કથા'
                  : 'Planet stories',
          },
          {
            label:
              language === 'hi'
                ? 'सुरक्षा'
                : language === 'gu'
                  ? 'સુરક્ષા'
                  : 'Safety',
            value:
              language === 'hi'
                ? 'पहले पुष्टि'
                : language === 'gu'
                  ? 'પહેલાં પુષ્ટિ'
                  : 'Validation first',
          },
          {
            label:
              language === 'hi'
                ? 'समय'
                : language === 'gu'
                  ? 'સમય'
                  : 'Timing',
            value:
              language === 'hi'
                ? 'सक्रिय खिड़कियां'
                : language === 'gu'
                  ? 'સક્રિય ખિડકીઓ'
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
                <span>{t('Selected story')}</span>
                <h3>{selectedPattern.title}</h3>
                <p>{hasPremiumAccess ? selectedPattern.premiumDetail ?? selectedPattern.meaning : selectedPattern.freeInsight}</p>
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
          <div className="section-title">{t('VALIDATION')}</div>
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
      return 'उच्च';
    }
    if (confidence === 'medium') {
      return 'मध्यम';
    }
    return 'कम';
  }

  if (language === 'gu') {
    if (confidence === 'high') {
      return 'ઉચ્ચ';
    }
    if (confidence === 'medium') {
      return 'મધ્યમ';
    }
    return 'ઓછું';
  }

  return confidence;
}

function getNadiRelationLabel(
  relation: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    if (relation === 'same-sign') {
      return 'समान राशि संबंध';
    }
    if (relation === 'trine-link') {
      return 'त्रिकोण कथा संबंध';
    }
    if (relation === 'opposition-link') {
      return 'विपरीत कथा संबंध';
    }
    if (relation === 'sequence-link') {
      return 'क्रम संबंध';
    }
    if (relation === 'rahu-ketu-axis') {
      return 'राहु-केतु कर्म अक्ष';
    }
    return 'कारक संबंध';
  }

  if (language === 'gu') {
    if (relation === 'same-sign') {
      return 'એક જ રાશિ સંબંધ';
    }
    if (relation === 'trine-link') {
      return 'ત્રિકોણ કથા સંબંધ';
    }
    if (relation === 'opposition-link') {
      return 'વિરોધ કથા સંબંધ';
    }
    if (relation === 'sequence-link') {
      return 'ક્રમ સંબંધ';
    }
    if (relation === 'rahu-ketu-axis') {
      return 'રાહુ-કેતુ કર્મ અક્ષ';
    }
    return 'કારક સંબંધ';
  }

  return relation.replaceAll('-', ' ');
}

function getNadiLifeAreaLabel(
  area: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    if (area === 'career') {
      return 'करियर';
    }
    if (area === 'wealth') {
      return 'धन';
    }
    if (area === 'relationship') {
      return 'संबंध';
    }
    if (area === 'wellbeing') {
      return 'स्वास्थ्य';
    }
    if (area === 'spirituality') {
      return 'आध्यात्मिकता';
    }
    return 'सामान्य';
  }

  if (language === 'gu') {
    if (area === 'career') {
      return 'કારકિર્દી';
    }
    if (area === 'wealth') {
      return 'ધન';
    }
    if (area === 'relationship') {
      return 'સંબંધ';
    }
    if (area === 'wellbeing') {
      return 'સ્વાસ્થ્ય';
    }
    if (area === 'spirituality') {
      return 'આધ્યાત્મિકતા';
    }
    return 'સામાન્ય';
  }

  if (area === 'wellbeing') {
    return 'wellbeing';
  }

  return area;
}
