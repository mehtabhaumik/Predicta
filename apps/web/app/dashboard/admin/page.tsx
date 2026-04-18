import { canSeeAdminRoute } from '@pridicta/access';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { demoAccess } from '../../../lib/demo-state';

export default function AdminPage(): React.JSX.Element {
  const allowed = canSeeAdminRoute(demoAccess);

  if (!allowed) {
    return (
      <section className="dashboard-page">
        <div className="page-heading compact">
          <StatusPill label="Hidden for non-admin users" tone="quiet" />
          <h1 className="gradient-text">Admin access required.</h1>
          <p>
            Guest pass creation, revocation, active-code lists, and usage
            summaries are available only to approved admin accounts.
          </p>
        </div>
        <Card className="glass-panel">
          <div className="card-content spacious">
            <h2>Admin tools are not available for this access level.</h2>
            <p>
              This area is reserved for approved Predicta administrators.
            </p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Admin access active" tone="premium" />
        <h1 className="gradient-text">Guest pass operations.</h1>
        <p>
          Create, revoke, list, and review guest passes from one private admin
          space.
        </p>
      </div>
      <Card className="glass-panel">
        <div className="card-content spacious">
          <h2>Admin shell ready</h2>
          <p>
            Admin actions should remain private, traceable, and easy to audit.
          </p>
        </div>
      </Card>
    </section>
  );
}
