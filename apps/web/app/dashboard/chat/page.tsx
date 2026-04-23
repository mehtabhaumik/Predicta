import {
  buildDecisionMirrorResponse,
  validateDecisionMirrorResponse,
} from '@pridicta/ai';
import { Card } from '../../../components/Card';
import { PredictaChatClient } from '../../../components/PredictaChatClient';
import { StatusPill } from '../../../components/StatusPill';
import { demoKundli } from '../../../lib/demo-state';

export default function ChatPage(): React.JSX.Element {
  const decisionMirror = buildDecisionMirrorResponse({
    depth: 'FREE',
    generatedAt: '2026-04-18T00:00:00.000Z',
    kundli: demoKundli,
    question: 'Should I accept a bigger role if it increases pressure?',
  });
  const isValidMirror = validateDecisionMirrorResponse(decisionMirror);

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Private guidance" tone="premium" />
        <h1 className="gradient-text">Ask Predicta with room to breathe.</h1>
        <p>
          A focused place for thoughtful questions, clear answers, and calm
          follow-up guidance.
        </p>
      </div>

      <div className="chat-decision-layout">
        <PredictaChatClient kundli={demoKundli} />
        <Card className="decision-mirror-panel glass-panel">
          <div className="card-content spacious">
            <div className="section-title">DECISION MIRROR</div>
            <h2>Structured guidance, not certainty.</h2>
            <p>{decisionMirror.decisionSummary}</p>
            <div className="decision-mirror-stack">
              <div>
                <span>Supportive factors</span>
                {decisionMirror.supportiveChartFactors.map(item => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
              <div>
                <span>Caution factors</span>
                {decisionMirror.cautionFactors.map(item => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
              <div>
                <span>Next step</span>
                <strong>{decisionMirror.practicalNextStep}</strong>
              </div>
            </div>
            <p className="muted-copy">
              {isValidMirror
                ? decisionMirror.disclaimer
                : 'Decision Mirror is unavailable for this question.'}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
