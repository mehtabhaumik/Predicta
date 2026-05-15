import { Card } from '../../../components/Card';
import { WebRedeemPassForm } from '../../../components/WebRedeemPassForm';

export default function RedeemPassPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Private access starts here.</h1>
        <p>
          Your pass works only with the email used when it was created. If you
          remember that email, sign in with it. If you are not sure, contact the
          Predicta admin or the person who invited you.
        </p>
      </div>

      <section className="redeem-preview-steps">
        <article>
          <span>1</span>
          <h2>Use the pass email.</h2>
          <p>Google sign-in or email sign-up both work. Predicta checks the email automatically.</p>
        </article>
        <article>
          <span>2</span>
          <h2>Redeem the pass.</h2>
          <p>Enter the code exactly as shared. Predicta will confirm the active pass.</p>
        </article>
        <article>
          <span>3</span>
          <h2>Start with Kundli.</h2>
          <p>Create your chart, then try chat, Gochar, reports, KP, or Nadi.</p>
        </article>
      </section>

      <Card className="glass-panel redeem-card">
        <WebRedeemPassForm />
      </Card>
    </section>
  );
}
