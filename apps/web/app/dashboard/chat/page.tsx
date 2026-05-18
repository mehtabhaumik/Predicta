import { Suspense } from 'react';
import { WebPridictaChat } from '../../../components/WebPridictaChat';

export default function ChatPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Ask Predicta with room to breathe.</h1>
        <details className="info-drawer">
          <summary>
            <span>What to ask</span>
            <strong>Open</strong>
          </summary>
          <p>
            A focused place for thoughtful questions, clear answers, and calm
            follow-up guidance.
          </p>
        </details>
      </div>

      <Suspense fallback={<div className="card chat-panel" />}>
        <WebPridictaChat />
      </Suspense>
    </section>
  );
}
