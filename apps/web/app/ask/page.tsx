import { Suspense } from 'react';
import { AskPredictaLeanHeader } from '../../components/AskPredictaLeanHeader';
import { AskPredictaLightShell } from '../../components/AskPredictaLightShell';

export default function AskPredictaPage(): React.JSX.Element {
  return (
    <>
      <AskPredictaLeanHeader />
      <main className="ask-predicta-main">
        <section className="predicta-chat-page ask-predicta-page">
          <Suspense fallback={<div className="glass-panel ask-light-console" />}>
            <AskPredictaLightShell />
          </Suspense>
        </section>
      </main>
    </>
  );
}
