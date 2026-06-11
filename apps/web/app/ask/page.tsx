import { Suspense } from 'react';
import { AskPredictaLeanHeader } from '../../components/AskPredictaLeanHeader';
import {
  AskPredictaLightShell,
  AskPredictaLoadingCard,
} from '../../components/AskPredictaLightShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AskPredictaPage(): React.JSX.Element {
  return (
    <>
      <AskPredictaLeanHeader />
      <main className="ask-predicta-main">
        <section className="predicta-chat-page ask-predicta-page">
          <Suspense fallback={<AskPredictaLoadingCard />}>
            <AskPredictaLightShell />
          </Suspense>
        </section>
      </main>
    </>
  );
}
