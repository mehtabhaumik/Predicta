'use client';

import Link from 'next/link';
import { PREDICTA_JOURNEY_STEPS } from '@pridicta/config/predictaUx';
import { buildUsageDisplay } from '@pridicta/monetization';
import {
  composeDailyBriefing,
  composeDestinyPassport,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
} from '@pridicta/astrology';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebDailyBriefingCard } from '../../components/WebDailyBriefingCard';
import { WebDestinyPassportCard } from '../../components/WebDestinyPassportCard';
import { WebGocharSynopsisCard } from '../../components/WebGocharSynopsisCard';
import { WebYearlySynopsisCard } from '../../components/WebYearlySynopsisCard';
import { demoAccess, demoMonetization } from '../../lib/demo-state';
import { useWebKundliLibrary } from '../../lib/use-web-kundli-library';

const quickActions = [
  {
    body: 'Start or review the birth chart.',
    href: '/dashboard/kundli',
    label: 'Kundli',
    primary: true,
  },
  {
    body: 'Ask naturally and get chart proof.',
    href: '/dashboard/chat',
    label: 'Ask Predicta',
  },
  {
    body: 'Choose between real-life options.',
    href: '/dashboard/decision',
    label: 'Decision',
  },
  {
    body: 'Open every chart with simple insight.',
    href: '/dashboard/charts',
    label: 'Charts',
  },
  {
    body: 'Event timing with KP rules.',
    href: '/dashboard/kp',
    label: 'KP',
  },
  {
    body: 'Premium Nadi reading room with story links and validation.',
    href: '/dashboard/nadi',
    label: 'Nadi',
  },
  {
    body: 'See dasha, gochar, and windows.',
    href: '/dashboard/timeline',
    label: 'Timeline',
  },
  {
    body: 'Simple practices tied to your chart.',
    href: '/dashboard/remedies',
    label: 'Remedies',
  },
  {
    body: 'Check confidence in birth time.',
    href: '/dashboard/birth-time',
    label: 'Birth Time',
  },
  {
    body: 'Marriage and partner patterns.',
    href: '/dashboard/relationship',
    label: 'Relationship',
  },
  {
    body: 'Save and compare family Kundlis.',
    href: '/dashboard/family',
    label: 'Family',
  },
  {
    body: 'Create beautiful PDF readings.',
    href: '/dashboard/report',
    label: 'Reports',
  },
];

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
  const gochar = composeTransitGocharIntelligence(activeKundli, {
    depth: 'FREE',
  });
  const yearlyHoroscope = composeYearlyHoroscopeVarshaphal(activeKundli, {
    depth: 'FREE',
  });

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <StatusPill label={usage.statusText} tone="quiet" />
        <h1 className="gradient-text">Start with your Kundli.</h1>
        <p>
          Predicta works best in a simple order: create the chart, read the
          simple summary, then ask one question. Deeper readings are still here,
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

      <WebGocharSynopsisCard intelligence={gochar} />

      <WebYearlySynopsisCard intelligence={yearlyHoroscope} />

      <WebDestinyPassportCard
        ctaHref="/dashboard/kundli"
        passport={destinyPassport}
      />

      <div className="dashboard-feature-grid">
        <Card className="glass-panel quick-actions-panel">
          <div className="card-content spacious">
            <div className="section-title">START HERE</div>
            <h2>Choose what you want to do.</h2>
            <p>
              Each option opens one clear reading path. Predicta keeps the
              astrology simple on the surface and detailed underneath.
            </p>
            <div className="quick-action-grid">
              {quickActions.map(action => (
                <Link
                  className={action.primary ? 'quick-action primary' : 'quick-action'}
                  href={action.href}
                  key={action.href}
                >
                  <strong>
                    {action.href === '/dashboard/kundli' && activeKundli
                      ? 'View Kundli'
                      : action.label}
                  </strong>
                  <span>{action.body}</span>
                </Link>
              ))}
            </div>
          </div>
        </Card>
        <Card className="save-restore-card">
          <div className="card-content spacious">
            <div className="section-title">SAVE AND RESTORE</div>
            <h2>Your Kundlis stay under your control.</h2>
            <p>
              Work stays private on this browser unless you choose account save.
              Sign in later to restore Kundlis and reports on another device.
            </p>
            <div className="save-restore-list">
              <div>
                <span>Private by default</span>
                <strong>Local first</strong>
              </div>
              <div>
                <span>When you sign in</span>
                <strong>Restore anywhere</strong>
              </div>
              <div>
                <span>Family ready</span>
                <strong>Multiple Kundlis</strong>
              </div>
            </div>
            <div className="action-row compact">
              <Link className="button secondary" href="/dashboard/saved-kundlis">
                Saved Kundlis
              </Link>
              <Link className="button secondary" href="/dashboard/settings">
                Privacy Settings
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
