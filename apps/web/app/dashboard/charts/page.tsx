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
          Free users can open every chart with useful insight. Premium adds
          deeper analysis, timing, and report-ready synthesis.
        </p>
      </div>

      <WebChartsExplorer hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
