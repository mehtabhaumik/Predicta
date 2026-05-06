'use client';

import Link from 'next/link';
import { PREDICTA_JOURNEY_STEPS } from '@pridicta/config/predictaUx';
import { buildUsageDisplay } from '@pridicta/monetization';
import { composeDailyBriefing, composeDestinyPassport } from '@pridicta/astrology';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebDailyBriefingCard } from '../../components/WebDailyBriefingCard';
import { WebDestinyPassportCard } from '../../components/WebDestinyPassportCard';
import { demoAccess, demoMonetization } from '../../lib/demo-state';
import { useWebKundliLibrary } from '../../lib/use-web-kundli-library';

export default function DashboardPage(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
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
  const dailyBriefing = composeDailyBriefing(activeKundli);
  const destinyPassport = composeDestinyPassport(activeKundli);

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <StatusPill label={usage.statusText} tone="quiet" />
        <h1 className="gradient-text">Start with your Kundli.</h1>
        <p>
          Predicta works best in a simple order: create the chart, read the
          simple summary, then ask one question. Advanced tools are still here,
          but they no longer come before the basics.
        </p>
      </div>

      <div className="guided-journey-grid">
        {PREDICTA_JOURNEY_STEPS.map((step, index) => (
          <Card className={index === 0 ? 'glass-panel guided-step primary' : 'guided-step'} key={step.id}>
            <div className="card-content">
              <div className="section-title">{step.title}</div>
              <h2>{step.action}</h2>
              <p>{step.body}</p>
              <Link
                className={index === 0 ? 'button' : 'button secondary'}
                href={
                  step.id === 'create'
                    ? '/dashboard/kundli'
                    : step.id === 'summary'
                      ? '/dashboard/kundli'
                      : '/dashboard/chat'
                }
              >
                {step.action}
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <WebDailyBriefingCard
        briefing={dailyBriefing}
        ctaHref="/dashboard/kundli"
      />

      <WebDestinyPassportCard
        ctaHref="/dashboard/kundli"
        passport={destinyPassport}
      />

      <div className="dashboard-feature-grid">
        <Card className="glass-panel feature-card-large">
          <div className="card-content spacious">
            <div className="section-title">TOOLS</div>
            <h2>Pick one clear job.</h2>
            <p>
              After your Kundli is ready, use these tools by intent. You do not
              need to understand chart jargon first.
            </p>
            <div className="action-row">
              <Link className="button" href="/dashboard/kundli">
                {activeKundli ? 'View Kundli' : 'Create Kundli'}
              </Link>
              <Link className="button secondary" href="/dashboard/chat">
                Ask a Question
              </Link>
              <Link className="button secondary" href="/dashboard/decision">
                Make a Decision
              </Link>
              <Link className="button secondary" href="/dashboard/charts">
                See Chart
              </Link>
              <Link className="button secondary" href="/dashboard/timeline">
                Open Timeline
              </Link>
              <Link className="button secondary" href="/dashboard/remedies">
                Remedy Coach
              </Link>
              <Link className="button secondary" href="/dashboard/birth-time">
                Birth Time
              </Link>
              <Link className="button secondary" href="/dashboard/relationship">
                Relationship
              </Link>
              <Link className="button secondary" href="/dashboard/family">
                Family Map
              </Link>
              <Link className="button secondary" href="/dashboard/wrapped">
                Wrapped
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
