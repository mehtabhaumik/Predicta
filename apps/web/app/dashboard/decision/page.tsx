import { WebDecisionOracle } from '../../../components/WebDecisionOracle';

export default function DecisionPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">A serious memo for real choices.</h1>
        <details className="info-drawer">
          <summary>
            <span>How it helps</span>
            <strong>Open</strong>
          </summary>
          <p>
            Turn one question into timing, risk, chart proof, and a practical next
            step.
          </p>
        </details>
      </div>

      <WebDecisionOracle />
    </section>
  );
}
