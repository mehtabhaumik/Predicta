import Link from 'next/link';
import { buildUsageDisplay } from '@pridicta/monetization';
import { Card, MetricCard } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { demoAccess, demoMonetization, kundliSummary } from '../../lib/demo-state';

export default function DashboardPage(): React.JSX.Element {
  const usage = buildUsageDisplay({
    monetization: demoMonetization,
    resolvedAccess: demoAccess,
    usage: {
      dayKey: '2026-04-18',
      deepCallsToday: 0,
      monthKey: '2026-04',
      pdfsThisMonth: 0,
      questionsToday: 0,
    },
    userPlan: 'FREE',
  });

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <StatusPill label={usage.statusText} tone="quiet" />
        <h1 className="gradient-text">Welcome back to Pridicta.</h1>
        <p>
          A quiet command center for kundli work, chart-aware chat, saved
          profiles, reports, cloud sync, and access status.
        </p>
      </div>

      <div className="metric-row">
        <MetricCard
          detail={usage.questionsText}
          label="Access"
          value={usage.statusText}
        />
        <MetricCard
          detail={kundliSummary.birthPlace}
          label="Birth Profile"
          value={kundliSummary.name}
        />
        <MetricCard
          detail={kundliSummary.nakshatra}
          label="Moon + Dasha"
          value={kundliSummary.dasha}
        />
      </div>

      <div className="dashboard-feature-grid">
        <Card className="glass-panel feature-card-large">
          <div className="card-content spacious">
            <div className="section-title">SHORTCUTS</div>
            <h2>Continue from the right place.</h2>
            <p>
              Open chart-aware chat, review saved kundlis, or generate a
              premium-looking report whenever you are ready.
            </p>
            <div className="action-row">
              <Link className="button" href="/dashboard/chat">
                Ask Pridicta
              </Link>
              <Link className="button secondary" href="/dashboard/charts">
                Browse Charts
              </Link>
              <Link className="button secondary" href="/dashboard/report">
                Open Report
              </Link>
            </div>
          </div>
        </Card>
        <Card>
          <div className="card-content spacious">
            <div className="section-title">CLOUD SAVE</div>
            <h2>Your saved work can travel with you.</h2>
            <p>
              Sign in to restore online-saved kundlis and reports across your
              devices. Nothing uploads unless you choose cloud save.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
