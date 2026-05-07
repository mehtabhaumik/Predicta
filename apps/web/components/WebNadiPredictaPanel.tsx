'use client';

import Link from 'next/link';
import { composeNadiJyotishPlan } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { Card } from './Card';

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
  const plan = composeNadiJyotishPlan(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    handoffQuestion,
  });

  return (
    <div className="kp-page-stack">
      <Card className="glass-panel kp-school-panel">
        <div className="card-content spacious">
          <div className="school-panel-hero">
            <div>
              <div className="section-title">NADI PREDICTA</div>
              <h1 className="gradient-text">Premium Nadi reading room.</h1>
              <p>
                Nadi Predicta is its own premium school. It reads planetary
                story links, karaka themes, validation questions, and timing
                activations. It does not pretend to access original palm-leaf
                manuscripts.
              </p>
            </div>
            <span className="school-badge premium">Premium Nadi</span>
          </div>

          <div className="school-explain-box">
            <strong>{plan.title}</strong>
            <p>{hasPremiumAccess ? plan.premiumSynthesis ?? plan.freePreview : plan.freePreview}</p>
          </div>

          <div className="school-callout">{plan.schoolBoundary}</div>
          {handoffQuestion ? (
            <div className="school-callout active">
              Question received: “{handoffQuestion}”. Nadi Predicta will keep
              this question with the active birth profile and read it only from
              Nadi-style planetary stories.
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">NADI METHOD</div>
          <h2>Separate from Parashari and KP.</h2>
          <p>{plan.methodSummary}</p>
          <div className="school-grid significators">
            {plan.guardrails.slice(0, 5).map(item => (
              <div key={item}>
                <span>Boundary</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">STORY LINKS</div>
          <h2>What the Nadi layer noticed.</h2>
          <div className="school-grid significators">
            {plan.patterns.map(pattern => (
              <div key={pattern.id}>
                <span>{pattern.confidence} confidence</span>
                <strong>{pattern.title}</strong>
                <p>{pattern.freeInsight}</p>
              </div>
            ))}
          </div>
          {!plan.patterns.length ? (
            <p>
              {getNadiCalculationMessage(Boolean(kundli), schoolCalculationStatus)}
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">VALIDATION</div>
          <h2>Predicta asks before going deep.</h2>
          <div className="school-grid ruling">
            {plan.validationQuestions.slice(0, 4).map(question => (
              <div key={question}>
                <span>Question</span>
                <strong>{question}</strong>
              </div>
            ))}
          </div>
          <div className="action-row">
            <a
              className="button"
              href={`/dashboard/chat?prompt=${encodeURIComponent(
                plan.askPrompt,
              )}&school=NADI&from=PARASHARI${
                handoffQuestion
                  ? `&handoffQuestion=${encodeURIComponent(handoffQuestion)}`
                  : ''
              }`}
            >
              Ask Nadi Predicta
            </a>
            <Link className="button secondary" href="/pricing">
              See Premium Nadi
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
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
