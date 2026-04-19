import { Card } from '../../../components/Card';
import { RedeemPassCodeClient } from '../../../components/RedeemPassCodeClient';
import { StatusPill } from '../../../components/StatusPill';

export default function RedeemPassPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Invitation access" tone="premium" />
        <h1 className="gradient-text">Redeem your Predicta invitation.</h1>
        <p>
          Enter the invitation code you received. If anything else is needed,
          Predicta will guide you with a clear next step.
        </p>
      </div>
      <Card className="glass-panel redeem-card">
        <RedeemPassCodeClient />
      </Card>
    </section>
  );
}
