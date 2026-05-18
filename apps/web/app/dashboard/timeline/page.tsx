import { WebLifeTimelineLoader } from '../../../components/WebLifeTimelineLoader';

export default function TimelinePage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">A simple map of chart timing.</h1>
        <details className="info-drawer">
          <summary>
            <span>What this includes</span>
            <strong>Open</strong>
          </summary>
          <p>
            Dasha, gochar, remedies, and timing notes in one readable view.
          </p>
        </details>
      </div>

      <WebLifeTimelineLoader />
    </section>
  );
}
