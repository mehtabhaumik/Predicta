import { WebChartsExplorer } from '../../../components/WebChartsExplorer';
import { demoAccess } from '../../../lib/demo-state';

export default function ChartsPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">See your chart without getting lost.</h1>
        <details className="info-drawer">
          <summary>
            <span>How chart depth works</span>
            <strong>Open</strong>
          </summary>
          <p>
            Free users can open every chart with useful insight. Premium adds
            deeper analysis, timing, and report-ready synthesis.
          </p>
        </details>
      </div>

      <WebChartsExplorer hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
