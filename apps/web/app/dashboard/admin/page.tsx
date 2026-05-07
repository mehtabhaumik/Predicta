import { StatusPill } from '../../../components/StatusPill';
import { WebAdminGuestPassPanel } from '../../../components/WebAdminGuestPassPanel';

export default function AdminPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Owner access required" tone="premium" />
        <h1 className="gradient-text">Guest pass operations.</h1>
        <p>
          Create, revoke, list, and review guest passes through Predicta's
          secure owner service. Private access rules are always checked by the
          owner service.
        </p>
      </div>
      <WebAdminGuestPassPanel />
    </section>
  );
}
