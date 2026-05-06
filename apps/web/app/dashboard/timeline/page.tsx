import { composeLifeTimeline } from '@pridicta/astrology';
import { StatusPill } from '../../../components/StatusPill';
import { WebLifeTimelinePanel } from '../../../components/WebLifeTimelinePanel';

export default function TimelinePage(): React.JSX.Element {
  const presentation = composeLifeTimeline();

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Now / Next / Later" tone="premium" />
        <h1 className="gradient-text">A simple map of chart timing.</h1>
        <p>
          Dasha chapters, transit weather, remedies, and rectification notes
          become one readable timeline with visible proof.
        </p>
      </div>

      <WebLifeTimelinePanel
        ctaHref="/dashboard/kundli"
        presentation={presentation}
      />
    </section>
  );
}
