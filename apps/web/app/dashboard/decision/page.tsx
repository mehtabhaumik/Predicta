import { WebDecisionOracle } from '../../../components/WebDecisionOracle';

export default function DecisionPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">A serious memo for real choices.</h1>
        <p>
          Turn one question into timing, risk, chart proof, and a practical next
          step.
        </p>
      </div>

      <WebDecisionOracle />
    </section>
  );
}
