import { StatusPill } from '../../../components/StatusPill';
import { WebDecisionOracle } from '../../../components/WebDecisionOracle';

export default function DecisionPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Green / Yellow / Red / Wait" tone="premium" />
        <h1 className="gradient-text">A serious memo for real choices.</h1>
        <p>
          Decision Oracle turns a question into timing, risk, evidence, and one
          practical next step without fatalistic yes-or-no claims.
        </p>
      </div>

      <WebDecisionOracle />
    </section>
  );
}
