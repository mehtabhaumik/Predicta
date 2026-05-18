import { WebPredictaWrappedLoader } from '../../../components/WebPredictaWrappedLoader';

export default function WrappedPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Your year, made beautiful.</h1>
        <details className="info-drawer">
          <summary>
            <span>What Wrapped is</span>
            <strong>Open</strong>
          </summary>
          <p>
            A private, share-safe view of your selected Kundli year.
          </p>
        </details>
      </div>

      <WebPredictaWrappedLoader />
    </section>
  );
}
