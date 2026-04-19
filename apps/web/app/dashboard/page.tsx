import Link from 'next/link';
import {
  buildDailyIntelligence,
  buildWeeklyIntelligence,
} from '@pridicta/astrology';
import { buildUsageDisplay } from '@pridicta/monetization';
import { Card, MetricCard } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import {
  demoAccess,
  demoKundli,
  demoMonetization,
  kundliSummary,
} from '../../lib/demo-state';

export default function DashboardPage(): React.JSX.Element {
  const today = new Date('2026-04-18T00:00:00.000Z');
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
  const dailyInsight = buildDailyIntelligence({
    date: today,
    depth: 'FREE',
    kundli: demoKundli,
  });
  const weeklyBriefing = buildWeeklyIntelligence({
    date: today,
    depth: demoAccess.hasPremiumAccess ? 'EXPANDED' : 'FREE',
    kundli: demoKundli,
  });

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <h1 className="gradient-text">Welcome back to Predicta.</h1>
        <p>
          A quiet command center for kundli work, chart-aware chat, saved
          profiles, reports, cloud sync, and access status.
        </p>
      </div>

      <div className="dashboard-access-row">
        <StatusPill
          label={demoAccess.hasPremiumAccess ? 'Premium depth available' : 'Free access'}
          tone={demoAccess.hasPremiumAccess ? 'premium' : 'quiet'}
        />
      </div>

      <Card className="dashboard-topbar-card glass-panel">
        <div className="dashboard-topbar-content">
          <p>Spacious guidance, reports, charts, and saved kundlis.</p>
          <Link className="button secondary" href="/dashboard/chat">
            Ask Predicta
          </Link>
        </div>
      </Card>

      <div className="metric-row">
        <MetricCard
          detail={usage.statusText}
          label="Guidance"
          value={usage.questionsText}
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
            <div className="section-title">TODAY</div>
            <h2>{dailyInsight.emotionalTone}</h2>
            <p>{dailyInsight.chartBasisSummary}</p>
            <div className="insight-split-grid">
              <div>
                <span>Work</span>
                <strong>{dailyInsight.workFocus}</strong>
              </div>
              <div>
                <span>Relationship</span>
                <strong>{dailyInsight.relationshipTone}</strong>
              </div>
            </div>
            <p className="muted-copy">{dailyInsight.practicalAction}</p>
          </div>
        </Card>
        <Card>
          <div className="card-content spacious">
            <div className="section-title">WEEKLY BRIEFING</div>
            <h2>{weeklyBriefing.weeklyTheme}</h2>
            <p>
              {demoAccess.hasPremiumAccess
                ? weeklyBriefing.careerFocus
                : 'Expanded weekly timing windows are available for Premium, guest, full access, and admin users.'}
            </p>
            <div className="weekly-window-list">
              {weeklyBriefing.importantDateWindows.map(window => (
                <div className="weekly-window" key={window.startDate}>
                  <span>{window.startDate}</span>
                  <strong>{window.focus}</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>
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
                Ask Predicta
              </Link>
              <Link className="button secondary" href="/dashboard/charts">
                Browse Charts
              </Link>
              <Link className="button secondary" href="/dashboard/life-timeline">
                Life Timeline
              </Link>
              <Link className="button secondary" href="/dashboard/compatibility">
                Compatibility
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
