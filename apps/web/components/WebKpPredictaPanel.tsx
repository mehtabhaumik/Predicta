'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { composeChalitBhavKpFoundation } from '@pridicta/astrology';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type { KundliData } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { Card } from './Card';
import { PredictaWorldFrame } from './PredictaWorldFrame';

type KpEventFocus = 'career' | 'money' | 'marriage' | 'property' | 'education' | 'travel' | 'custom';
type KpQuestionMode = 'preset' | 'custom' | 'guide';

const KP_EVENT_FOCUS: Array<{
  id: KpEventFocus;
  title: string;
  houses: number[];
  prompt: string;
}> = [
  {
    houses: [2, 6, 10, 11],
    id: 'career',
    prompt:
      'Using KP only, judge career and job movement from houses 2, 6, 10, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Career and job',
  },
  {
    houses: [2, 5, 8, 11],
    id: 'money',
    prompt:
      'Using KP only, judge money gains and financial stability from houses 2, 5, 8, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Money and gains',
  },
  {
    houses: [2, 7, 11],
    id: 'marriage',
    prompt:
      'Using KP only, judge marriage and partnership promise from houses 2, 7, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Marriage and partner',
  },
  {
    houses: [4, 11, 12],
    id: 'property',
    prompt:
      'Using KP only, judge home, property, and relocation from houses 4, 11, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Home and property',
  },
  {
    houses: [4, 5, 9, 11],
    id: 'education',
    prompt:
      'Using KP only, judge education, exam, certification, and learning outcomes from houses 4, 5, 9, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Education and exams',
  },
  {
    houses: [3, 9, 12],
    id: 'travel',
    prompt:
      'Using KP only, judge travel, foreign movement, and relocation readiness from houses 3, 9, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Travel and relocation',
  },
  {
    houses: [1, 6, 10, 11],
    id: 'custom',
    prompt:
      'Using KP only, help refine the user custom event into an exact question with event type, time window, current situation, and desired outcome before judging cusps and significators.',
    title: 'Custom exact question',
  },
];

const KP_QUESTION_PRESETS: Array<{
  focus: KpEventFocus;
  id: string;
  question: string;
  title: string;
}> = [
  {
    focus: 'career',
    id: 'job-change',
    question: 'Should I seriously prepare for a job change in the next six months?',
    title: 'Job change',
  },
  {
    focus: 'career',
    id: 'promotion',
    question: 'Is this a supportive period to pursue promotion or stronger recognition at work?',
    title: 'Promotion',
  },
  {
    focus: 'money',
    id: 'money-decision',
    question: 'Should I move carefully or actively around this money decision over the next three months?',
    title: 'Money decision',
  },
  {
    focus: 'marriage',
    id: 'marriage-timing',
    question: 'Is this period supportive for serious marriage or partnership progress?',
    title: 'Marriage timing',
  },
  {
    focus: 'property',
    id: 'property-deal',
    question: 'Should I move forward with property or home-related decisions in the next 90 days?',
    title: 'Property decision',
  },
  {
    focus: 'education',
    id: 'exam',
    question: 'Is this a supportive period for exam, certification, admission, or learning outcome?',
    title: 'Exam or admission',
  },
  {
    focus: 'travel',
    id: 'travel',
    question: 'Is this a supportive period for travel, relocation, or foreign movement?',
    title: 'Travel or relocation',
  },
];

const KP_WORLD_PROOF_CARDS = [
  {
    body:
      'KP uses the event question and relevant houses underneath the answer so the user gets verdict first, proof second.',
    title: 'Verdict first, proof second',
  },
  {
    body:
      'Cusps, star lords, sub lords, ruling planets, significators, and dasha support stay inside KP and stay collapsed until needed.',
    title: 'KP proof path',
  },
  {
    body:
      'Career, money, marriage, and property questions get their own KP house logic.',
    title: 'Focused outcomes',
  },
] as const;

type WebKpPredictaPanelProps = {
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function WebKpPredictaPanel({
  handoffQuestion,
  hasPremiumAccess = false,
  kundli,
  schoolCalculationStatus = 'idle',
}: WebKpPredictaPanelProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const foundation = composeChalitBhavKpFoundation(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const kp = foundation.kp;
  const ruling = kp.rulingPlanets;
  const didLoadSavedState = useRef(false);
  const [selectedEvent, setSelectedEvent] = useState<KpEventFocus>('career');
  const [questionMode, setQuestionMode] = useState<KpQuestionMode>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState(KP_QUESTION_PRESETS[0]?.id ?? '');
  const [customQuestion, setCustomQuestion] = useState('');
  const selectedFocus =
    KP_EVENT_FOCUS.find(item => item.id === selectedEvent) ?? KP_EVENT_FOCUS[0];
  const selectedPreset =
    KP_QUESTION_PRESETS.find(item => item.id === selectedPresetId) ??
    KP_QUESTION_PRESETS.find(item => item.focus === selectedEvent) ??
    KP_QUESTION_PRESETS[0];
  const kpQuestionDraft = useMemo(
    () =>
      buildKpQuestionDraft({
        customQuestion,
        focus: selectedFocus,
        mode: questionMode,
        presetQuestion: selectedPreset?.question,
      }),
    [customQuestion, questionMode, selectedFocus, selectedPreset?.question],
  );
  const [selectedCusp, setSelectedCusp] = useState<number>(
    selectedFocus.houses.at(-2) ?? selectedFocus.houses[0],
  );
  const selectedCuspData = kp.cusps.find(cusp => cusp.house === selectedCusp);
  const eventSignificators = useMemo(
    () =>
      kp.significators
        .filter(item =>
          item.signifiesHouses.some(house => selectedFocus.houses.includes(house)),
        )
        .slice(0, hasPremiumAccess ? 6 : 4),
    [hasPremiumAccess, kp.significators, selectedFocus.houses],
  );
  const focusMeaning = useMemo(
    () =>
      buildKpFocusMeaning({
        cusp: selectedCuspData,
        focus: selectedFocus,
        language,
        ruling,
        significators: eventSignificators,
      }),
    [eventSignificators, language, ruling, selectedCuspData, selectedFocus],
  );
  const askHref = buildKpAskHref({
    cusp: selectedCuspData,
    focus: selectedFocus,
    handoffQuestion,
    questionDraft: kpQuestionDraft,
    kundliId: kundli?.id,
  });

  useEffect(() => {
    const savedKp = loadWebAutoSaveMemory().kp;

    if (isKpEventFocus(savedKp?.selectedEvent)) {
      setSelectedEvent(savedKp.selectedEvent);
    }
    if (savedKp?.selectedCusp) {
      setSelectedCusp(savedKp.selectedCusp);
    }
    if (savedKp?.questionMode === 'preset' || savedKp?.questionMode === 'custom' || savedKp?.questionMode === 'guide') {
      setQuestionMode(savedKp.questionMode);
    }
    if (savedKp?.selectedPresetId) {
      setSelectedPresetId(savedKp.selectedPresetId);
    }
    if (savedKp?.customQuestion) {
      setCustomQuestion(savedKp.customQuestion);
    }

    didLoadSavedState.current = true;
  }, []);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    saveWebAutoSaveMemory({
      kp: {
        handoffQuestion,
        customQuestion,
        questionMode,
        selectedCusp,
        selectedEvent,
        selectedPresetId,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [customQuestion, handoffQuestion, questionMode, selectedCusp, selectedEvent, selectedPresetId]);

  return (
    <div className="predicta-world-page predicta-world-page--kp kp-page-stack">
      <PredictaWorldFrame
        badge={t('KP world')}
        body={t(
          'KP Predicta answers one practical event or life outcome at a time. It shows the likely direction, what may delay it, timing readiness, and the next useful move before showing the proof chain.',
        )}
        chatHref={askHref}
        chatLabel={t('Chat with KP Predicta')}
        eyebrow={t('KP PREDICTA')}
        heroInteraction={
          <div
            className="specialist-hero-interaction kp-event-compass-mini"
            data-audit1-phase6-hero-interaction="kp"
          >
            <span>
              <strong>{t(kp.eventJudgement.verdictLabel)}</strong>
              <small>{t('Current KP answer')}</small>
            </span>
            <span>
              <strong>{kp.eventJudgement.eventVerdictCompass.promise}</strong>
              <small>{t('Promise')}</small>
            </span>
            <span>
              <strong>{kp.eventJudgement.eventVerdictCompass.block}</strong>
              <small>{t('Block')}</small>
            </span>
            <span>
              <strong>{t(kp.eventJudgement.confidence)}</strong>
              <small>{t('Timing readiness')}</small>
            </span>
          </div>
        }
        localActions={[
          {
            href: '#kp-judgement',
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.bde0f8a88a")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.db0b9d9f38")
                  : 'Judgement path',
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.fe50c2547a")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.b33624985c")
                  : 'Start from the event, houses, cusp sub lord, and timing support.',
          },
          {
            href: '#kp-cusps',
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.537e460b1e")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.20df417cf2")
                  : '12 cusps',
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.847e8e1ded")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.8086a5e48d")
                  : 'Inspect the full cusp table with star and sub lords.',
          },
          {
            href: '#kp-significators',
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.10afdbe036")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.a66a370488")
                  : 'Significators',
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.2d599780ac")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.1e47f411c9")
                  : 'See which planets actually carry the event promise.',
          },
          {
            href: '/dashboard/report',
            label: t('Build KP report'),
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.9cea8c0abf")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.ba540326e6")
                  : 'Move into the KP report path when the judgement needs a formal write-up.',
          },
        ]}
        primaryGuidance={{
          body: t(
            'Choose a ready question, write your own, or pick “guide me.” Predicta will refine vague wording into a KP-friendly question, then answer with verdict, support/block, timing readiness, and one next step.',
          ),
          eyebrow: t('START HERE'),
          title: t('Ask the event. Get the answer before the KP proof.'),
        }}
        localEyebrow={t('KP method')}
        localTitle={t('A dedicated KP precision world.')}
        pillars={[
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.ef1d697a27")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.d379463006")
                  : 'Start',
            value:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.d6a448e134")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.1decbaa667")
                  : 'Event first',
          },
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.ddd3c38e4e")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7d39d099a5")
                  : 'Core proof',
            value:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7fa427e159")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.6fac5620e9")
                  : 'Cusps + sub lords',
          },
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7457c45e9e")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.82e44a590f")
                  : 'Timing',
            value:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.bb788bb24a")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.e6d8fc24e6")
                  : 'Ruling planets + dasha',
          },
        ]}
        proofCards={KP_WORLD_PROOF_CARDS.map(card => ({
          body: t(card.body),
          title: t(card.title),
        }))}
        proofLabel={t('KP proof')}
        reportLabel={t('Build KP report')}
        reportNote={t('Career, money, marriage, and property questions get their own KP house logic.')}
        theme="kp"
        title={t('A dedicated KP precision world.')}
      />

      <Card className="glass-panel kp-school-panel">
        <div className="card-content spacious">
          <details className="info-drawer school-explain-box">
            <summary>
              <span>{t('Current KP reading')}</span>
              <strong>{kp.title}</strong>
            </summary>
            <strong>{kp.title}</strong>
            <p>{hasPremiumAccess ? kp.premiumSynthesis ?? kp.freeInsight : kp.freeInsight}</p>
          </details>

          {ruling ? (
            <div className="school-grid ruling">
              <div>
                <span>{t('Day Lord')}</span>
                <strong>{ruling.dayLord}</strong>
              </div>
              <div>
                <span>{t('Moon Star')}</span>
                <strong>{ruling.moonStarLord}</strong>
              </div>
              <div>
                <span>{t('Moon Sub')}</span>
                <strong>{ruling.moonSubLord}</strong>
              </div>
              <div>
                <span>{t('Lagna Sub')}</span>
                <strong>{ruling.lagnaSubLord}</strong>
              </div>
            </div>
          ) : null}

          <details className="info-drawer school-callout">
            <summary>
              <span>{t('World boundary')}</span>
              <strong>{t('Open')}</strong>
            </summary>
            <p>
              {t(
                'Regular Predicta handles Parashari, D1, vargas, Chalit, dasha, gochar, remedies, and reports. KP Predicta handles KP. Jaimini Predicta handles soul role, visible identity, relationship mirror, and destiny chapters separately.',
              )}
            </p>
          </details>
          {handoffQuestion ? (
            <div className="school-callout active">
              {t('Question received')}: “{handoffQuestion}”.{' '}
              {t('KP Predicta will carry this question with the active birth profile and answer from KP.')}
            </div>
          ) : null}

          <div className="school-grid significators" aria-label="KP event verdict compass">
            <div>
              <span>{t('EVENT VERDICT COMPASS')}</span>
              <strong>{t(kp.eventJudgement.verdictLabel)}</strong>
              <p>{kp.eventJudgement.plainLanguage}</p>
            </div>
            <div>
              <span>{t('Promise')}</span>
              <strong>{kp.eventJudgement.eventVerdictCompass.promise}</strong>
              <p>{kp.eventJudgement.promise}</p>
            </div>
            <div>
              <span>{t('Block')}</span>
              <strong>{kp.eventJudgement.eventVerdictCompass.block}</strong>
              <p>{kp.eventJudgement.mainBlock}</p>
            </div>
            <div>
              <span>{t('Timing readiness')}</span>
              <strong>{t(kp.eventJudgement.confidence)}</strong>
              <p>{kp.eventJudgement.timingReadiness}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel kp-judgement-card" id="kp-judgement">
        <div className="card-content spacious">
          <div className="school-panel-hero compact">
            <div>
              <div className="section-title">{t('KP JUDGEMENT PATH')}</div>
              <h2>{t(selectedFocus.title)}</h2>
              <details className="info-drawer">
                <summary>
                  <span>{t('How KP judges this')}</span>
                  <strong>{t('Open')}</strong>
                </summary>
                <p>
                  {t(
                    'Pick the event first. KP then checks the relevant houses, cusp sub lord, significators, ruling planets, and dasha support.',
                  )}
                </p>
              </details>
            </div>
            <span className="school-badge premium">{t('Event first')}</span>
          </div>

          <div className="school-explain-box">
            <strong>
              {localizeKp(
                language,
                'What are you asking?',
                getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.9982bf713c"),
                getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.99c963fc2f"),
              )}
            </strong>
            <p>{t('Choose the event first. KP works best with an exact question, a time window, the current situation, and the outcome you want to judge.')}</p>
          </div>

          <div
            className="school-explain-box school-answer-first"
            data-competitor-response-phase4-answer-first="kp"
          >
            <strong>{t('KP current answer')}</strong>
            <p>{focusMeaning.whatItSays}</p>
            <div className="action-row">
              <Link className="button primary" href={askHref}>
                {t('Ask this KP question')}
              </Link>
              <Link className="button secondary" href="/dashboard/report#report-lane-kp">
                {t('Build KP report')}
              </Link>
            </div>
          </div>

          <div className="school-grid significators">
            <div>
              <span>
                {localizeKp(
                  language,
                  'Main event carrier',
                  getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.242aa9d432"),
                  getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.b73b5969a8"),
                )}
              </span>
              <strong>{focusMeaning.mainCarrier}</strong>
              <p>{focusMeaning.strength}</p>
            </div>
            <div>
              <span>
                {localizeKp(
                  language,
                  'Main caution',
                  getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.136ef2d0e3"),
                  getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.abdcc45994"),
                )}
              </span>
              <strong>{focusMeaning.cautionTitle}</strong>
              <p>{focusMeaning.caution}</p>
            </div>
            <div>
              <span>
                {localizeKp(
                  language,
                  'Next guidance',
                  getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7db067306d"),
                  getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.e2b6f1e905"),
                )}
              </span>
              <strong>{focusMeaning.guidanceTitle}</strong>
              <p>{focusMeaning.guidance}</p>
            </div>
          </div>

          <div className="kp-event-row" aria-label="KP event focus">
            {KP_EVENT_FOCUS.map(item => (
              <button
                aria-pressed={selectedEvent === item.id}
                className={selectedEvent === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => {
                  setSelectedEvent(item.id);
                  setSelectedCusp(item.houses.at(-2) ?? item.houses[0]);
                  const nextPreset = KP_QUESTION_PRESETS.find(preset => preset.focus === item.id);
                  if (nextPreset) {
                    setSelectedPresetId(nextPreset.id);
                  }
                }}
                type="button"
              >
                <span>{t(item.title)}</span>
                <small>{t('Houses')} {item.houses.join(', ')}</small>
              </button>
            ))}
          </div>

          <div className="kp-question-composer" aria-label="Ask KP question">
            <div className="school-panel-hero compact">
              <div>
                <div className="section-title">{t('ASK KP QUESTION')}</div>
                <h3>{t('Tell Predicta what decision you want help with.')}</h3>
                <p>
                  {t(
                    'Pick a ready question, write your own in normal words, or choose guide me if you are unsure. Predicta will refine vague questions before answering.',
                  )}
                </p>
              </div>
              <span className="school-badge">{t('Plain language')}</span>
            </div>

            <div className="kp-question-mode-row">
              {[
                ['preset', 'Use a ready question'],
                ['custom', 'Write my own'],
                ['guide', 'I have no question, guide me'],
              ].map(([mode, label]) => (
                <button
                  aria-pressed={questionMode === mode}
                  className={questionMode === mode ? 'active' : ''}
                  key={mode}
                  onClick={() => setQuestionMode(mode as KpQuestionMode)}
                  type="button"
                >
                  {t(label)}
                </button>
              ))}
            </div>

            {questionMode === 'preset' ? (
              <div className="kp-question-preset-grid">
                {KP_QUESTION_PRESETS.filter(
                  item => item.focus === selectedEvent || selectedEvent === 'custom',
                ).map(item => (
                  <button
                    aria-pressed={selectedPresetId === item.id}
                    className={selectedPresetId === item.id ? 'active' : ''}
                    key={item.id}
                    onClick={() => {
                      setSelectedPresetId(item.id);
                      setSelectedEvent(item.focus);
                    }}
                    type="button"
                  >
                    <strong>{t(item.title)}</strong>
                    <span>{t(item.question)}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {questionMode === 'custom' ? (
              <label className="kp-question-input">
                <span>{t('Write naturally. Predicta will refine it.')}</span>
                <textarea
                  onChange={event => setCustomQuestion(event.target.value)}
                  placeholder={t('Example: I am confused about changing my job soon. What should I watch?')}
                  rows={4}
                  value={customQuestion}
                />
              </label>
            ) : null}

            <div className="kp-question-refined-card">
              <span>{t(kpQuestionDraft.label)}</span>
              <strong>{t(kpQuestionDraft.refinedQuestion)}</strong>
              <p>{t(kpQuestionDraft.guidance)}</p>
              <a className="button" href={askHref}>
                {t('Ask KP Predicta')}
              </a>
            </div>
          </div>

          <div className="kp-proof-path">
            {kp.eventJudgement.questionToProofPath.map((step, index) => (
              <div key={step}>
                <span>{index + 1}. {t('Question-To-Proof Path')}</span>
                <strong>{t(step)}</strong>
                <p>{kp.eventJudgement.proofPath[index] ?? step}</p>
              </div>
            ))}
          </div>

          <div className="school-explain-box">
            <strong>{t('Ask Exact Question Wizard')}</strong>
            <p>{kp.eventJudgement.nextQuestion}</p>
          </div>
        </div>
      </Card>

      <Card className="glass-panel" id="kp-cusps">
        <div className="card-content spacious">
          <details className="info-drawer school-explain-box">
            <summary>
              <span>{t('Proof drawer')}</span>
              <strong>{t('KP cusps, star lords, sub lords')}</strong>
            </summary>
            <div className="section-title">{t('KP CUSPS')}</div>
            <h2>{t('12 cusps with star and sub lords.')}</h2>
            <div className="school-table-wrap">
              <table className="school-table">
                <thead>
                  <tr>
                    <th>{t('Cusp')}</th>
                    <th>{t('Sign')}</th>
                    <th>{t('Star Lord')}</th>
                    <th>{t('Sub Lord')}</th>
                    <th>{t('Sub-sub')}</th>
                  </tr>
                </thead>
                <tbody>
                  {kp.cusps.slice(0, 12).map((cusp, index) => (
                    <tr
                      className={
                        selectedCusp === cusp.house ||
                        selectedFocus.houses.includes(cusp.house)
                          ? 'kp-relevant-row'
                          : ''
                      }
                      key={cusp.house}
                      onClick={() => setSelectedCusp(cusp.house)}
                      style={{ ['--kp-row-index' as string]: index } as CSSProperties}
                    >
                      <td>{cusp.house}</td>
                      <td>
                        {cusp.sign} {cusp.degree.toFixed(2)}°
                      </td>
                      <td>{cusp.lordChain.starLord}</td>
                      <td>{cusp.lordChain.subLord}</td>
                      <td>{cusp.lordChain.subSubLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!kp.cusps.length ? (
              <p>{t(getKpCalculationMessage(Boolean(kundli), schoolCalculationStatus))}</p>
            ) : null}
          </details>
        </div>
      </Card>

      <Card className="glass-panel" id="kp-significators">
        <div className="card-content spacious">
          <div className="section-title">{t('KP SIGNIFICATORS')}</div>
          <h2>{t('Event houses by planet.')}</h2>
          <div className="kp-significator-map">
            {eventSignificators.map((item, index) => (
              <div
                className="kp-significator-node"
                key={item.planet}
                style={{ ['--kp-row-index' as string]: index } as CSSProperties}
              >
                <span>{item.strength}</span>
                <strong>{item.planet}</strong>
                <p>{item.simpleMeaning}</p>
                <div>
                  {item.signifiesHouses
                    .filter(house => selectedFocus.houses.includes(house))
                    .map(house => (
                      <small key={`${item.planet}-${house}`}>H{house}</small>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="school-grid significators">
            {kp.significators.slice(0, hasPremiumAccess ? 9 : 5).map(item => (
              <div key={item.planet}>
                <span>{item.strength} significator</span>
                <strong>{item.planet}</strong>
                <p>
                  {t('Houses')}: {item.signifiesHouses.join(', ') || t('Not clear yet')}
                </p>
              </div>
            ))}
          </div>
          <div className="action-row">
            <a
              className="button"
              href={askHref}
            >
              {t('Ask KP Predicta')}
            </a>
            <Link className="button secondary" href="/pricing">
              {t('See KP Premium Depth')}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function isKpEventFocus(value: unknown): value is KpEventFocus {
  return KP_EVENT_FOCUS.some(item => item.id === value);
}

function buildKpAskHref({
  cusp,
  focus,
  handoffQuestion,
  kundliId,
  questionDraft,
}: {
  cusp?: { house: number; lordChain: { starLord: string; subLord: string; subSubLord: string } };
  focus: (typeof KP_EVENT_FOCUS)[number];
  handoffQuestion?: string;
  kundliId?: string;
  questionDraft: KpQuestionDraft;
}): string {
  const prompt = handoffQuestion
    ? `KP Predicta handoff question: ${handoffQuestion}. ${questionDraft.prompt}. ${focus.prompt}`
    : `${questionDraft.prompt}. ${focus.prompt}${cusp ? ` Selected event-support area ${cusp.house} has star lord ${cusp.lordChain.starLord}, sub lord ${cusp.lordChain.subLord}, and sub-sub lord ${cusp.lordChain.subSubLord}.` : ''}`;
  return buildPredictaChatHref({
    handoffQuestion,
    kundliId,
    prompt,
    school: 'KP',
    selectedHouse: cusp?.house,
    selectedSection: focus.title,
    sourceScreen: 'KP Predicta',
  });
}

type KpQuestionDraft = {
  guidance: string;
  label: string;
  prompt: string;
  refinedQuestion: string;
};

function buildKpQuestionDraft({
  customQuestion,
  focus,
  mode,
  presetQuestion,
}: {
  customQuestion: string;
  focus: (typeof KP_EVENT_FOCUS)[number];
  mode: KpQuestionMode;
  presetQuestion?: string;
}): KpQuestionDraft {
  if (mode === 'guide') {
    return {
      guidance:
        'Predicta will start with practical readiness: where to be patient, where to prepare, and which decisions need more real-world clarity.',
      label: 'Guide mode',
      prompt:
        `I do not have a specific KP question. Using KP only, guide me through ${focus.title} decision readiness in plain language. Do not overclaim certainty; give practical timing caution, preparation, and next steps.`,
      refinedQuestion:
        `I do not have a specific question. What should I understand about ${focus.title} decisions right now?`,
    };
  }

  if (mode === 'custom') {
    const raw = customQuestion.trim();
    const refined = refineKpCustomQuestion(raw, focus.title);

    return {
      guidance:
        raw.length < 18
          ? 'Your question is still broad, so Predicta will first refine it and then answer carefully.'
          : 'Predicta will keep your intent, make the question clearer, and answer without forcing false certainty.',
      label: raw.length < 18 ? 'Refined from broad question' : 'Refined question',
      prompt:
        `The user wrote: "${raw || 'I am not sure what to ask.'}" Refine this into a clear KP decision question first, then answer using KP only in plain language. Refined question: ${refined}`,
      refinedQuestion: refined,
    };
  }

  const question = presetQuestion ?? `What should I understand about ${focus.title} decisions right now?`;

  return {
    guidance:
      'This ready question is already written in normal language. Predicta will answer it as decision support, not as a scary prediction.',
    label: 'Ready question',
    prompt: `Using KP only, answer this practical user question in plain language: ${question}`,
    refinedQuestion: question,
  };
}

function refineKpCustomQuestion(rawQuestion: string, focusTitle: string): string {
  const question = rawQuestion.trim().replace(/\s+/g, ' ');

  if (!question) {
    return `What should I understand about ${focusTitle} decisions right now?`;
  }

  const lower = question.toLowerCase();
  const hasTiming = /\b(today|tomorrow|week|month|year|days|months|years|soon|next|by|before|after|when|202\d|203\d)\b/.test(lower);
  const hasDecisionWord = /\b(should|will|can|whether|if|move|change|buy|sell|marry|job|offer|exam|travel|relocation|property|money)\b/.test(lower);
  const suffix = hasTiming ? '' : ' over the next 3 to 6 months';
  const decisionPrefix = hasDecisionWord ? '' : 'Should I move forward, wait, or prepare around ';

  return `${decisionPrefix}${question}${suffix}?`.replace(/\?+$/, '?');
}

function getKpCalculationMessage(
  hasKundli: boolean,
  status: 'idle' | 'calculating' | 'error',
): string {
  if (!hasKundli) {
    return 'Create a Kundli once, then KP Predicta will calculate the KP horoscope from those birth details.';
  }

  if (status === 'calculating') {
    return 'Calculating KP cusps, star lords, and sub lords from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but KP calculation could not complete right now. Please try again shortly.';
  }

  return 'KP Predicta is preparing this layer from the saved birth profile.';
}

function buildKpFocusMeaning({
  cusp,
  focus,
  language,
  ruling,
  significators,
}: {
  cusp?: {
    house: number;
    lordChain: { starLord: string; subLord: string; subSubLord: string };
  };
  focus: (typeof KP_EVENT_FOCUS)[number];
  language: string;
  ruling?: { dayLord: string; moonSubLord: string };
  significators: Array<{ planet: string; simpleMeaning: string; signifiesHouses: number[] }>;
}): {
  caution: string;
  cautionTitle: string;
  guidance: string;
  guidanceTitle: string;
  mainCarrier: string;
  strength: string;
  whatItSays: string;
} {
  const areas = focus.houses.map(house => getKpHouseArea(house, language)).join(', ');
  const carrier = significators[0];
  const carrierName = carrier?.planet ?? localizeKp(language, 'Pending', getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.0ab46976f5"), getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.577270f404"));
  const cuspSummary = cusp
    ? localizeKp(
        language,
        `Cusp ${cusp.house} is being judged through sub lord ${cusp.lordChain.subLord}.`,
        formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.77bc952542", [cusp.house, cusp.lordChain.subLord]),
        formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.c34b99cb8a", [cusp.house, cusp.lordChain.subLord]),
      )
    : localizeKp(
        language,
        'The main cusp is still being prepared.',
        getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.194212fd03"),
        getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.5005ad0685"),
      );
  const rulingSummary = ruling
    ? localizeKp(
        language,
        `Timing stays grounded through day lord ${ruling.dayLord} and Moon sub ${ruling.moonSubLord}.`,
        formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.8247fd7c06", [ruling.dayLord, ruling.moonSubLord]),
        formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.47c1757069", [ruling.dayLord, ruling.moonSubLord]),
      )
    : localizeKp(
        language,
        'Timing will become sharper once ruling planets are ready.',
        getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.4deae2e4aa"),
        getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.f416ac2d06"),
      );

  return {
    caution: localizeKp(
      language,
      'Do not treat KP like a personality reading. It becomes accurate when the question is specific and event-based.',
      getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.b1c91a0afd"),
      getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.abac67cba0"),
    ),
    cautionTitle: localizeKp(language, 'Ask one exact question', getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.c91439a8ab"), getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.0625a88268")),
    guidance: localizeKp(
      language,
      `Start with ${focus.title.toLowerCase()}, let KP judge ${areas}, and then use timing only after the event carriers are clear.`,
      formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.417e758d23", [focus.title, areas]),
      formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.8d48b41932", [focus.title, areas]),
    ),
    guidanceTitle: localizeKp(language, 'Event before timing', getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.268ca3dbee"), getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7371e19ec6")),
    mainCarrier: carrierName,
    strength: carrier
      ? localizeKp(
          language,
          `${carrier.planet} is carrying the clearest event promise right now through ${carrier.signifiesHouses.map(house => getKpHouseArea(house, language)).slice(0, 2).join(', ')}.`,
          formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.87b447c9d9", [carrier.planet, carrier.signifiesHouses.map(house => getKpHouseArea(house, language)).slice(0, 2).join(', ')]),
          formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.1c54750858", [carrier.planet, carrier.signifiesHouses.map(house => getKpHouseArea(house, language)).slice(0, 2).join(', ')]),
        )
      : localizeKp(
          language,
          'The event carriers will become clear once significators are ready.',
          getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.a0468afcba"),
          getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.593f34f72a"),
        ),
    whatItSays: localizeKp(
      language,
      `KP is saying this question should be judged through ${areas}. ${cuspSummary} ${rulingSummary}`,
      formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.4e72c8f478", [areas, cuspSummary, rulingSummary]),
      formatNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.45aa9bc698", [areas, cuspSummary, rulingSummary]),
    ),
  };
}

function getKpHouseArea(house: number, language: string): string {
  const map =
    language === 'hi'
      ? KP_HOUSE_LABELS_HI
      : language === 'gu'
        ? KP_HOUSE_LABELS_GU
        : KP_HOUSE_LABELS_EN;

  return map[house] ?? `H${house}`;
}

function localizeKp(
  language: string,
  en: string,
  hi: string,
  gu: string,
): string {
  if (language === 'hi') {
    return hi;
  }
  if (language === 'gu') {
    return gu;
  }
  return en;
}

const KP_HOUSE_LABELS_EN: Record<number, string> = {
  1: 'self and direction',
  2: 'money and family',
  3: 'effort and movement',
  4: 'home and property',
  5: 'creativity and speculation',
  6: 'work and struggle',
  7: 'marriage and partnership',
  8: 'change and hidden pressure',
  9: 'fortune and blessings',
  10: 'career and public role',
  11: 'gains and fulfilment',
  12: 'expense and release',
};

const KP_HOUSE_LABELS_HI: Record<number, string> = {
  1: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.51f243501b"),
  2: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7f4fb1e401"),
  3: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.e4616a7d65"),
  4: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.f90d1bac21"),
  5: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.e2950f8428"),
  6: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.77b7ffca60"),
  7: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.355c4ab12b"),
  8: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.96a61c7d83"),
  9: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.a37f31ed70"),
  10: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7f2193efb9"),
  11: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.7e5590f133"),
  12: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.d1a302583f"),
};

const KP_HOUSE_LABELS_GU: Record<number, string> = {
  1: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.d54fd48796"),
  2: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.90d7bd7f8f"),
  3: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.26abf63af0"),
  4: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.6f431df66f"),
  5: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.6dbb7c5434"),
  6: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.f9c1cb9cf9"),
  7: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.e08fc97426"),
  8: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.876f82b789"),
  9: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.ef10750fd6"),
  10: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.562ff83d51"),
  11: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.bba9869001"),
  12: getNativeCopy("native.apps.web.components.WebKpPredictaPanel.tsx.763f0c9e92"),
};
