import Link from 'next/link';
import { WebAdminGuestPassPanel } from '../../../components/WebAdminGuestPassPanel';
import { isOwnerConsoleEnabled } from '../../../lib/owner-surface';

export default function AdminPage(): React.JSX.Element {
  if (!isOwnerConsoleEnabled()) {
    return (
      <section className="dashboard-page">
        <div className="page-heading compact">
          <span className="section-title">PRIVATE OWNER AREA</span>
          <h1 className="gradient-text">Owner tools are not available here.</h1>
          <p>
            This public build keeps internal Predicta tools hidden. If you are
            part of the owner team, open the protected owner environment instead.
          </p>
          <Link className="button secondary" href="/dashboard">
            Return to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Guest pass operations.</h1>
        <details className="info-drawer">
          <summary>
            <span>Guest pass tools</span>
            <strong>Open</strong>
          </summary>
          <p>
            Create, revoke, list, and review private guest passes.
          </p>
        </details>
      </div>
      <WebAdminGuestPassPanel />
    </section>
  );
}
