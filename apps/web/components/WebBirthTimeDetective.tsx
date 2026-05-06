'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { composeBirthTimeDetective } from '@pridicta/astrology';
import type { BirthTimeAnswer, BirthTimeQuestion } from '@pridicta/types';

const STORAGE_KEY = 'pridicta.birthTimeAnswers.web.preview';

type AnswerMap = Record<string, BirthTimeAnswer>;

export function WebBirthTimeDetective(): React.JSX.Element {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showEvidence, setShowEvidence] = useState(false);
  const report = useMemo(() => composeBirthTimeDetective(undefined, answers), [answers]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setAnswers(JSON.parse(raw) as AnswerMap);
    }
  }, []);

  function saveAnswer(question: BirthTimeQuestion) {
    const answer = (drafts[question.id] ?? question.answer?.answer ?? '').trim();

    if (!answer) {
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

      <div className="birth-time-questions">
        {report.questions.map(question => {
          const draft = drafts[question.id] ?? question.answer?.answer ?? '';

          return (
            <div className="birth-time-question" key={question.id}>
              <h3>{question.question}</h3>
              <p>{question.helper}</p>
              <textarea
                aria-label={question.question}
                onChange={event =>
                  setDrafts(current => ({
                    ...current,
                    [question.id]: event.target.value,
                  }))
                }
                placeholder="Write a simple answer with dates if possible."
                value={draft}
              />
              <button
                className="button"
                disabled={!draft.trim()}
                onClick={() => saveAnswer(question)}
                type="button"
              >
                {question.answer ? 'Update Answer' : 'Save Answer'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="birth-time-next">
        <span>Next action</span>
        <p>{report.nextAction}</p>
      </div>

      <div className="birth-time-actions">
        <button
          className="button secondary"
          onClick={() => setShowEvidence(value => !value)}
          type="button"
        >
          {showEvidence ? 'Hide evidence' : 'Show evidence'}
        </button>
        <Link className="button" href={buildAskHref(report.askPrompt)}>
          Ask about birth time
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

function buildAskHref(prompt: string): string {
  const params = new URLSearchParams({
    birthTimeDetective: 'true',
    prompt,
  });

  return `/dashboard/chat?${params.toString()}`;
}
