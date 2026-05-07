import { Suspense } from 'react';
import { StatusPill } from '../../../components/StatusPill';
import { WebPridictaChat } from '../../../components/WebPridictaChat';

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

      <Suspense fallback={<div className="card chat-panel" />}>
        <WebPridictaChat />
      </Suspense>
    </section>
  );
}
