import { WebAdminGuestPassPanel } from '../../../components/WebAdminGuestPassPanel';

export default function AdminPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Guest pass operations.</h1>
        <p>
          Create, revoke, list, and review private guest passes.
        </p>
      </div>
      <WebAdminGuestPassPanel />
    </section>
  );
}
