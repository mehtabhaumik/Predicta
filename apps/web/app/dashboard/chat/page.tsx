import { Suspense } from 'react';
import { WebPridictaChat } from '../../../components/WebPridictaChat';

export default function ChatPage(): React.JSX.Element {
  return (
    <section className="dashboard-page predicta-chat-page">
      <Suspense fallback={<div className="card chat-panel predicta-chat-loading" />}>
        <WebPridictaChat />
      </Suspense>
    </section>
  );
}
