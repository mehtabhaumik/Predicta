'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  applyManualBirthTimeEstimate,
  composeBirthTimeDetective,
  estimateManualBirthTimeRectification,
  MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS,
  type ManualBirthTimeRectificationAnswer,
} from '@pridicta/astrology';
import type { BirthTimeAnswer, BirthTimeQuestion } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  generateKundliFromWeb,
  saveWebKundli,
} from '../lib/web-kundli-storage';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

const STORAGE_KEY = 'pridicta.birthTimeAnswers.web.v1';

type AnswerMap = Record<string, BirthTimeAnswer>;
type ApplyStatus = 'idle' | 'applying' | 'saved' | 'error';

export function WebBirthTimeDetective(): React.JSX.Element {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showEvidence, setShowEvidence] = useState(false);
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { activeKundli } = useWebKundliLibrary();
  const report = useMemo(
    () => composeBirthTimeDetective(activeKundli, answers),
    [activeKundli, answers],
  );
  const rectificationAnswers = useMemo(
    () => toRectificationAnswers(report.questions, answers),
    [answers, report.questions],
  );
  const rectificationEstimate = useMemo(
    () =>
      activeKundli
        ? estimateManualBirthTimeRectification({
            answers: rectificationAnswers,
            birthDetails: activeKundli.birthDetails,
          })
        : undefined,
    [activeKundli, rectificationAnswers],
  );
  const isComplete =
    report.questions.length > 0 &&
    report.answeredCount === MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length;
  const isRectified = activeKundli?.birthDetails.timeConfidence === 'rectified';

  useEffect(() => {
    if (!activeKundli?.id) {
      setAnswers({});
      return;
    }

    const raw = window.localStorage.getItem(getStorageKey(activeKundli.id));
    setAnswers(raw ? (JSON.parse(raw) as AnswerMap) : {});
  }, [activeKundli?.id]);

  function saveAnswer(
    question: BirthTimeQuestion,
    answer: ManualBirthTimeRectificationAnswer,
  ) {
    if (!activeKundli?.id) {
      return;
    }

    const next = {
      ...answers,
      [question.id]: {
        answer,
        answeredAt: new Date().toISOString(),
        questionId: question.id,
      },
    };

    setAnswers(next);
    setApplyStatus('idle');
    setStatusMessage('');
    window.localStorage.setItem(getStorageKey(activeKundli.id), JSON.stringify(next));
  }

  async function keepEnteredTime() {
    if (!activeKundli) {
      return;
    }

    const enteredTime =
      activeKundli.birthDetails.originalTime ?? activeKundli.birthDetails.time;
    const finalDetails = {
      ...activeKundli.birthDetails,
      isTimeApproximate: false,
      originalTime: undefined,
      rectificationMethod: undefined,
      rectifiedAt: undefined,
      time: enteredTime,
      timeConfidence: 'entered' as const,
    };

    setApplyStatus('applying');
    setStatusMessage('Confirming the entered birth time...');

    try {
      const nextKundli =
        enteredTime !== activeKundli.birthDetails.time
          ? await generateKundliFromWeb(finalDetails)
          : {
              ...activeKundli,
              birthDetails: finalDetails,
            };

      if (enteredTime === activeKundli.birthDetails.time) {
        saveWebKundli(nextKundli);
      }
      setApplyStatus('saved');
      setStatusMessage(
        `Entered birth time ${enteredTime} is now confirmed for this Kundli.`,
      );
    } catch (error) {
      setApplyStatus('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'The confirmation failed. Please try again shortly.',
      );
    }
  }

  async function useProbableTime() {
    if (!activeKundli || !rectificationEstimate || !isComplete) {
      return;
    }

    setApplyStatus('applying');
    setStatusMessage('Recalculating the Kundli with the probable rectified time...');

    try {
      const finalDetails = applyManualBirthTimeEstimate(
        activeKundli.birthDetails,
        rectificationEstimate,
      );
      const nextKundli = await generateKundliFromWeb(finalDetails);
      setApplyStatus('saved');
      setStatusMessage(
        `Kundli recalculated with probable rectified time ${nextKundli.birthDetails.time}. Original entered time: ${
          nextKundli.birthDetails.originalTime ?? activeKundli.birthDetails.time
        }.`,
      );
    } catch (error) {
      setApplyStatus('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'The recalculation failed. Please verify the birth details and try again.',
      );
    }
  }

  return (
    <section className="birth-time-detective glass-panel">
      <div className="birth-time-header">
        <div>
          <div className="section-title">BIRTH TIME DETECTIVE</div>
          <h2>{report.title}</h2>
          <p>{report.subtitle}</p>
        </div>
        <div className="birth-time-score">
          <span>Score</span>
          <strong>{report.confidenceScore}/100</strong>
        </div>
      </div>

      <div className="birth-time-summary">
        <span>Confidence</span>
        <strong>{report.confidenceLabel}</strong>
        <p>{report.summary}</p>
        {isRectified ? (
          <p className="birth-time-rectified-note">
            Rectified time is active: {activeKundli?.birthDetails.time}. Original
            entered time: {activeKundli?.birthDetails.originalTime ?? 'not recorded'}.
          </p>
        ) : null}
      </div>

      <div className="birth-time-impact-grid">
        <ImpactBlock label="Safe" items={report.safeJudgments} />
        <ImpactBlock label="Cautious" items={report.cautiousJudgments} />
        <ImpactBlock label="Unsafe" items={report.unsafeJudgments} />
      </div>

      {report.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : null}

      {activeKundli ? (
        <div className="birth-time-next">
          <span>Before Predicta uses fine timing</span>
          <p>
            Confirm the entered birth time, or answer the yes/no questions so
            Predicta can estimate a probable corrected time and recalculate the
            Kundli.
          </p>
          <button
            className="button secondary"
            disabled={applyStatus === 'applying'}
            onClick={() => {
              void keepEnteredTime();
            }}
            type="button"
          >
            {applyStatus === 'applying'
              ? 'Confirming...'
              : 'My entered time is correct'}
          </button>
        </div>
      ) : null}

      <div className="birth-time-questions">
        {report.questions.map(question => {
          const currentAnswer = answers[question.id]?.answer;

          return (
            <div className="birth-time-question" key={question.id}>
              <h3>{question.question}</h3>
              <p>{question.helper}</p>
              <div className="birth-time-choice-row">
                {(['yes', 'no'] as const).map(answer => (
                  <button
                    className={`birth-time-choice ${
                      currentAnswer === answer ? 'selected' : ''
                    }`}
                    key={answer}
                    onClick={() => saveAnswer(question, answer)}
                    type="button"
                  >
                    {answer === 'yes' ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {rectificationEstimate && activeKundli ? (
        <div className="birth-time-next">
          <span>Probable time estimate</span>
          <strong>{rectificationEstimate.probableTime}</strong>
          <p>{rectificationEstimate.summary}</p>
          <div className="birth-time-evidence compact">
            {rectificationEstimate.evidence.map(item => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <button
            className="button"
            disabled={!isComplete || applyStatus === 'applying'}
            onClick={() => {
              void useProbableTime();
            }}
            type="button"
          >
            {applyStatus === 'applying'
              ? 'Recalculating...'
              : 'Use probable time and recalculate Kundli'}
          </button>
          {!isComplete ? (
            <p className="birth-time-helper">
              Answer all yes/no questions before applying a probable time.
            </p>
          ) : null}
        </div>
      ) : null}

      {statusMessage ? (
        <div className={`birth-time-status ${applyStatus}`}>{statusMessage}</div>
      ) : null}

      <div className="birth-time-actions">
        <button
          className="button secondary"
          onClick={() => setShowEvidence(value => !value)}
          type="button"
        >
          {showEvidence ? 'Hide evidence' : 'Show evidence'}
        </button>
        <Link
          className="button"
          href={buildAskHref(report.askPrompt, activeKundli?.id)}
        >
          Ask Predicta about this
        </Link>
      </div>

      {showEvidence ? (
        <div className="birth-time-evidence">
          {[...report.evidence, ...report.reasons].map(item => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ImpactBlock({
  items,
  label,
}: {
  items: string[];
  label: string;
}): React.JSX.Element {
  return (
    <div className="birth-time-impact">
      <span>{label}</span>
      <ul>
        {items.slice(0, 3).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function buildAskHref(prompt: string, kundliId?: string): string {
  return buildPredictaChatHref({
    birthTimeDetective: true,
    kundliId,
    prompt,
    selectedSection: 'Birth time confidence',
    sourceScreen: 'Birth Time Detective',
  });
}

function getStorageKey(kundliId: string): string {
  return `${STORAGE_KEY}.${kundliId}`;
}

function toRectificationAnswers(
  questions: BirthTimeQuestion[],
  answers: AnswerMap,
): Record<string, ManualBirthTimeRectificationAnswer | undefined> {
  return questions.reduce<Record<string, ManualBirthTimeRectificationAnswer | undefined>>(
    (result, question) => {
      const answer = answers[question.id]?.answer;
      result[question.id] = answer === 'yes' || answer === 'no' ? answer : undefined;
      return result;
    },
    {},
  );
}
