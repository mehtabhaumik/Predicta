import { Card } from '../../../components/Card';
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

      <div className="chat-workspace">
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
      </div>
    </section>
  );
}
