import { Card, MetricCard } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { kundliSummary } from '../../../lib/demo-state';

export default function KundliPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Birth place resolved internally" tone="premium" />
        <h1 className="gradient-text">Birth profile and calculation details.</h1>
        <p>
          Enter birth details naturally or choose place details step by step.
          Pridicta handles the calculation details quietly.
        </p>
      </div>
      <div className="metric-row">
        <MetricCard
          detail="Whole-sign Vedic chart"
          label="Lagna"
          value={kundliSummary.lagna}
        />
        <MetricCard
          detail={kundliSummary.nakshatra}
          label="Moon"
          value={kundliSummary.moonSign}
        />
        <MetricCard
          detail={kundliSummary.calculatedAt}
          label="Calculation"
          value="Verified"
        />
      </div>
      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">BIRTH DETAIL INTAKE</div>
          <h2>Structured when needed. Conversational when natural.</h2>
          <p>
            Country, state, and city selection can resolve timezone and
            location details internally. Natural language intake still asks for
            missing AM/PM, unclear city names, and confirmation before calculation.
          </p>
        </div>
      </Card>
    </section>
  );
}
