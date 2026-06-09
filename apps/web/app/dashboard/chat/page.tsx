import { Suspense } from 'react';
import { WebEventQuestionComposer } from '../../../components/WebEventQuestionComposer';
import { WebPridictaChat } from '../../../components/WebPridictaChat';

export default function ChatPage(): React.JSX.Element {
  return (
    <section className="dashboard-page predicta-chat-page">
      <Suspense fallback={<div className="glass-panel event-question-composer" />}>
        <WebEventQuestionComposer />
      </Suspense>
      <Suspense fallback={<div className="card chat-panel predicta-chat-loading" />}>
        <WebPridictaChat />
      </Suspense>
    </section>
  );
}
