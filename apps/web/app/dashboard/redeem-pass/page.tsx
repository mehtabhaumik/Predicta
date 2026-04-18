import { formatPassCode, normalizePassCode } from '@pridicta/access';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';

export default function RedeemPassPage(): React.JSX.Element {
  const example = formatPassCode(normalizePassCode('predicta vip example'));

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Private access" tone="premium" />
        <h1 className="gradient-text">Redeem a private Predicta pass.</h1>
        <p>
          Enter your private guest code to unlock elevated access. Restricted
          codes are checked quietly and securely.
        </p>
      </div>
      <Card className="glass-panel redeem-card">
        <div className="card-content spacious">
          <div className="field-stack">
            <label className="field-label" htmlFor="pass-code">
              Pass code
            </label>
            <input id="pass-code" placeholder={example} type="text" />
          </div>
          <p>
            If a code cannot be used, Predicta will explain the next step
            without exposing private pass details.
          </p>
          <button className="button" type="button">
            Redeem Pass
          </button>
        </div>
      </Card>
    </section>
  );
}
