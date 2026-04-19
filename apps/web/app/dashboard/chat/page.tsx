import {
  buildDecisionMirrorResponse,
  validateDecisionMirrorResponse,
} from '@pridicta/ai';
import { Card } from '../../../components/Card';
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
        <Card className="chat-panel">
          <div className="chat-thread">
            <div className="message pridicta">
              <span>Predicta</span>
              <p>
                Tell me what you want to understand. I will keep the reading
                focused, steady, and easy to follow.
              </p>
            </div>
            <div className="message user">
              <span>You</span>
              <p>What does my D10 show about career growth?</p>
            </div>
            <div className="message pridicta glass-panel">
              <span>Predicta</span>
              <p>
                Your career chart points to responsibility, consistency, and
                patience with timing. Ask one specific follow-up and I will go
                deeper without overwhelming you.
              </p>
            </div>
          </div>
          <div className="chat-input-row">
            <input
              aria-label="Ask Predicta"
              placeholder="Ask Predicta anything about your chart..."
            />
            <button className="button" type="button">
              Ask
            </button>
          </div>
        </Card>
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
