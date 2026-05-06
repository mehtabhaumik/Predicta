'use client';

import Link from 'next/link';
import { useState } from 'react';
import { composeDecisionMemo } from '@pridicta/astrology';
import { buildTrustProfile } from '@pridicta/config/trust';
import type { DecisionMemo } from '@pridicta/types';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { WebTrustProofPanel } from './WebTrustProofPanel';

const examples = [
  'Should I change jobs in the next 3 months?',
  'Should I move abroad this year?',
  'Is this a good time to commit to marriage?',
];

export function WebDecisionOracle(): React.JSX.Element {
  const [question, setQuestion] = useState('');
  const [memo, setMemo] = useState<DecisionMemo | undefined>();
  const { activeKundli } = useWebKundliLibrary();

  function runOracle(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();

    if (!cleanQuestion) {
      return;
    }

    setQuestion(cleanQuestion);
    setMemo(composeDecisionMemo({ kundli: activeKundli, question: cleanQuestion }));
  }

  return (
    <div className="decision-oracle-layout">
      <section className="decision-oracle-input glass-panel">
        <div className="section-title">DECISION ORACLE</div>
        <h2>Ask one real decision.</h2>
        <p>
          {activeKundli
            ? `Using ${activeKundli.birthDetails.name}'s active Kundli for timing, risk, evidence, and one next step.`
            : 'Create or select a Kundli first, then Predicta will use that active chart for timing, risk, evidence, and one next step.'}
        </p>
        <textarea
          aria-label="Decision question"
          onChange={event => setQuestion(event.target.value)}
          placeholder="Example: Should I change jobs in the next 3 months?"
          value={question}
        />
        <div className="action-row">
          <button
            className="button"
            disabled={!question.trim()}
            onClick={() => runOracle()}
            type="button"
          >
            Create Decision Memo
          </button>
          <Link className="button secondary" href="/dashboard/kundli">
            {activeKundli ? 'View Active Kundli' : 'Create Kundli'}
          </Link>
        </div>
        <div className="decision-examples">
          {examples.map(example => (
            <button key={example} onClick={() => runOracle(example)} type="button">
              {example}
            </button>
          ))}
        </div>
      </section>

      {memo ? <WebDecisionMemo memo={memo} /> : null}
    </div>
  );
}

function WebDecisionMemo({
  memo,
}: {
  memo: DecisionMemo;
}): React.JSX.Element {
  const [showEvidence, setShowEvidence] = useState(true);
  const trust = buildTrustProfile({
    evidence: memo.evidence.map(item => `${item.title}: ${item.observation}`),
    limitations: [
      memo.safetyNote ?? '',
      memo.state === 'needs-more-info'
        ? 'Clarifying information is required before trusting the memo.'
        : '',
    ].filter(Boolean),
    query: memo.question,
    surface: 'decision',
  });

  return (
    <section className={`decision-memo glass-panel state-${memo.state}`}>
      <div className="decision-memo-header">
        <div>
          <div className="section-title">DECISION MEMO</div>
          <h2>{memo.headline}</h2>
        </div>
        <div className="decision-state-badge">
          <span>State</span>
          <strong>{memo.state}</strong>
        </div>
      </div>

      <div className="decision-question">
        <span>Question</span>
        <p>{memo.question}</p>
      </div>

      <div className="decision-answer">
        <span>Short answer</span>
        <p>{memo.shortAnswer}</p>
      </div>

      <div className="decision-grid">
        <DecisionBlock label="Timing" text={memo.timing} />
        <DecisionBlock label="Risk" text={memo.risk} />
      </div>

      <div className="decision-next-action">
        <span>Next action</span>
        <p>{memo.nextAction}</p>
      </div>

      {memo.safetyNote ? (
        <div className="decision-safety">
          <span>Safety boundary</span>
          <p>{memo.safetyNote}</p>
        </div>
      ) : null}

      <WebTrustProofPanel compact trust={trust} />

      {memo.clarifyingQuestions.length ? (
        <div className="decision-clarify">
          <span>Answer these first</span>
          <ul>
            {memo.clarifyingQuestions.map(question => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="decision-memo-actions">
        <button
          className="button secondary"
          onClick={() => setShowEvidence(value => !value)}
          type="button"
        >
          {showEvidence ? 'Hide evidence' : 'Show evidence'}
        </button>
        <Link className="button" href={buildAskHref(memo)}>
          Ask Pridicta to explain
        </Link>
      </div>

      {showEvidence ? (
        <div className="decision-evidence">
          {memo.evidence.map(item => (
            <div key={item.id}>
              <span>
                {item.title} · {item.weight}
              </span>
              <p>{item.observation}</p>
              <p>{item.interpretation}</p>
            </div>
          ))}
        </div>
      ) : null}

      {memo.remedies.length ? (
        <div className="decision-remedies">
          <span>Supportive remedies</span>
          <ul>
            {memo.remedies.map(remedy => (
              <li key={remedy}>{remedy}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function DecisionBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <div className="decision-block">
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function buildAskHref(memo: DecisionMemo): string {
  const params = new URLSearchParams({
    decisionArea: memo.area,
    decisionQuestion: memo.question,
    decisionState: memo.state,
    prompt: memo.aiPrompt,
  });

  return `/dashboard/chat?${params.toString()}`;
}
