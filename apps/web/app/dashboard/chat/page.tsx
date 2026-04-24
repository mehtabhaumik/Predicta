import { Card } from '../../../components/Card';
import { PredictaChatClient } from '../../../components/PredictaChatClient';
import { StatusPill } from '../../../components/StatusPill';

export default function ChatPage(): React.JSX.Element {
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
        <PredictaChatClient />
        <Card className="decision-mirror-panel glass-panel">
          <div className="card-content spacious">
            <div className="section-title">HOW TO BEGIN</div>
            <h2>Real guidance starts from a real question.</h2>
            <p>
              Predicta should not pretend to know your chart before it has one.
              Start with a focused life question, or generate your kundli first
              for chart-specific guidance.
            </p>
            <div className="decision-mirror-stack">
              <div>
                <span>Good opening questions</span>
                <strong>What pattern keeps repeating in my work life?</strong>
                <strong>What should I focus on in this phase?</strong>
              </div>
              <div>
                <span>For a real chart reading</span>
                <strong>Birth date</strong>
                <strong>Exact birth time</strong>
                <strong>Birth place</strong>
              </div>
              <div>
                <span>What Predicta can do</span>
                <strong>Chart interpretation</strong>
                <strong>Timing guidance</strong>
                <strong>Report clarity</strong>
              </div>
            </div>
            <p className="muted-copy">
              Once your kundli is ready, Predicta can stay anchored to actual
              placements, dasha, and chart context instead of guessing.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
