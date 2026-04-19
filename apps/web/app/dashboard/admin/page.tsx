import { buildAdminMonetizationSummary } from '@pridicta/monetization';
import { AdminControlCenterClient } from '../../../components/AdminControlCenterClient';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { demoAdminAccess, demoMonetization } from '../../../lib/demo-state';

const adminCapabilities = [
  'Create email-bound guest passes',
  'Revoke active or abused passes',
  'Inspect pass usage and redemptions',
  'Grant approved admin or full-access accounts',
  'Review audit logs for admin actions',
  'Protect guidance and report capacity',
];

export default function AdminPage(): React.JSX.Element {
  const monetizationSummary = buildAdminMonetizationSummary({
    analyticsCounts: {
      paywall_viewed: 18,
      product_selected: 7,
      purchase_completed: 3,
      report_generated: 9,
    },
    monetization: demoMonetization,
    resolvedAccess: demoAdminAccess,
    usage: {
      dayKey: '2026-04-18',
      deepCallsToday: 1,
      monthKey: '2026-04',
      pdfsThisMonth: 2,
      questionsToday: 6,
    },
    userPlan: 'FREE',
  });

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Admin control" tone="premium" />
        <h1 className="gradient-text">Admin control center.</h1>
        <p>
          Create email-bound passes, revoke access, grant admin/full access, and
          keep privileged changes protected.
        </p>
      </div>

      <div className="admin-panel-grid">
        <Card className="glass-panel">
          <div className="card-content spacious">
            <div className="section-title">Monetization snapshot</div>
            <h2>{monetizationSummary.accessStatus}</h2>
            <div className="admin-summary-grid">
              <span>{monetizationSummary.conversionSignals.paywallViews} paywall views</span>
              <span>{monetizationSummary.conversionSignals.productSelections} product selections</span>
              <span>{monetizationSummary.conversionSignals.purchasesCompleted} completed purchases</span>
              <span>{monetizationSummary.conversionSignals.reportsGenerated} reports generated</span>
            </div>
          </div>
        </Card>
        <Card className="glass-panel">
          <div className="card-content spacious">
            <div className="section-title">Cost posture</div>
            <h2>{monetizationSummary.costPosture.replace('_', ' ')}</h2>
            <p>{monetizationSummary.recommendedActions[0]}</p>
          </div>
        </Card>
      </div>

      <AdminControlCenterClient />

      <Card className="glass-panel">
        <div className="card-content spacious">
          <h2>Admin safeguards</h2>
          <div className="admin-capability-list">
            {adminCapabilities.map(capability => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
