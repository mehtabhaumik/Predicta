import { StatusPill } from '../../../components/StatusPill';
import { WebLifeTimelineLoader } from '../../../components/WebLifeTimelineLoader';

export default function TimelinePage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Now / Next / Later" tone="premium" />
        <h1 className="gradient-text">A simple map of chart timing.</h1>
        <p>
          Dasha, gochar, remedies, and timing notes in one readable view.
        </p>
      </div>

      <WebLifeTimelineLoader />
    </section>
  );
}
