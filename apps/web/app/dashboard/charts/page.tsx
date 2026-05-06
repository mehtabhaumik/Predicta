import { StatusPill } from '../../../components/StatusPill';
import { WebChartsExplorer } from '../../../components/WebChartsExplorer';

export default function ChartsPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="North Indian chart style" tone="premium" />
        <h1 className="gradient-text">See your chart without getting lost.</h1>
        <p>
          Create your Kundli first. Then open D1, D9, or D10 one at a time and
          tap any house for a simple drilldown.
        </p>
      </div>

      <WebChartsExplorer />
    </section>
  );
}
