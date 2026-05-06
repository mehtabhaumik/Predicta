import { StatusPill } from '../../../components/StatusPill';
import { WebChartsExplorer } from '../../../components/WebChartsExplorer';
import { demoAccess } from '../../../lib/demo-state';

export default function ChartsPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="North Indian chart style" tone="premium" />
        <h1 className="gradient-text">See your chart without getting lost.</h1>
        <p>
          Create your Kundli first. Free preview keeps you on D1. Premium opens
          the deeper varga vault one chart at a time, with unsupported formulas
          clearly marked instead of faked.
        </p>
      </div>

      <WebChartsExplorer hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
