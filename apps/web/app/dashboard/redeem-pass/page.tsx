import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { WebRedeemPassForm } from '../../../components/WebRedeemPassForm';

export default function RedeemPassPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Private access" tone="premium" />
        <h1 className="gradient-text">Redeem a private Predicta pass.</h1>
        <p>
          Enter your private guest code to unlock elevated access.
        </p>
      </div>
      <Card className="glass-panel redeem-card">
        <WebRedeemPassForm />
      </Card>
    </section>
  );
}
