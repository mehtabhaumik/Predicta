import Link from 'next/link';
import { WebAdminHumanReviewPanel } from '../../../components/WebAdminHumanReviewPanel';
import { WebAdminGuestPassPanel } from '../../../components/WebAdminGuestPassPanel';
import { WebAdminSupportInboxPanel } from '../../../components/WebAdminSupportInboxPanel';
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
            Return to My Astrology
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Predicta owner operations.</h1>
        <details className="info-drawer">
          <summary>
            <span>Owner tools</span>
            <strong>Open</strong>
          </summary>
          <p>
            Review support threads, create private passes, and check owner-only
            safety signals from one protected workspace.
          </p>
        </details>
      </div>
      <WebAdminHumanReviewPanel />
      <WebAdminSupportInboxPanel />
      <WebAdminGuestPassPanel />
    </section>
  );
}
