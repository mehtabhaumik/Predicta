import { StatusPill } from '../../../components/StatusPill';
import { WebAdminGuestPassPanel } from '../../../components/WebAdminGuestPassPanel';

export default function AdminPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Owner access required" tone="premium" />
        <h1 className="gradient-text">Guest pass operations.</h1>
        <p>
          Create, revoke, list, and review private guest passes.
        </p>
      </div>
      <WebAdminGuestPassPanel />
    </section>
  );
}
