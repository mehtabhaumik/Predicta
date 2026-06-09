import { Suspense } from 'react';
import { WebEventQuestionComposer } from '../../../components/WebEventQuestionComposer';
import { WebPridictaChat } from '../../../components/WebPridictaChat';

export default function ChatPage(): React.JSX.Element {
  return (
    <section className="dashboard-page predicta-chat-page">
      <WebEventQuestionComposer />
      <Suspense fallback={<div className="card chat-panel predicta-chat-loading" />}>
        <WebPridictaChat />
      </Suspense>
    </section>
  );
}
