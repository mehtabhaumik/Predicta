import { Suspense } from 'react';
import { WebEventQuestionComposer } from '../../components/WebEventQuestionComposer';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { WebPridictaChat } from '../../components/WebPridictaChat';

export default function AskPredictaPage(): React.JSX.Element {
  return (
    <>
      <WebHeader />
      <main className="ask-predicta-main">
        <section className="predicta-chat-page ask-predicta-page">
          <Suspense fallback={<div className="glass-panel event-question-composer" />}>
            <WebEventQuestionComposer />
          </Suspense>
          <Suspense fallback={<div className="card chat-panel predicta-chat-loading" />}>
            <WebPridictaChat />
          </Suspense>
        </section>
      </main>
      <WebFooter className="ask-predicta-footer" />
    </>
  );
}

