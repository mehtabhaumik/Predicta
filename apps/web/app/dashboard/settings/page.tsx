import Link from 'next/link';
import { buildUsageDisplay } from '@pridicta/monetization';
import { AuthDialog } from '../../../components/AuthDialog';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { WebLanguageSelector } from '../../../components/WebLanguageSelector';
import { demoAccess, demoMonetization } from '../../../lib/demo-state';

export default function SettingsPage(): React.JSX.Element {
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
      <div className="page-heading compact">
        <StatusPill label={usage.statusText} tone="quiet" />
        <h1 className="gradient-text">Settings that stay in your control.</h1>
        <p>
          Manage account access, private saving, sound, billing, and guest passes.
        </p>
      </div>

      <div className="settings-layout">
        <Card className="glass-panel settings-card">
          <div className="card-content spacious">
            <div className="section-title">ACCOUNT</div>
            <h2>Profile and sign-in</h2>
            <p>
              Use Predicta freely in this browser. Sign in when you want your
              saved charts available across devices.
            </p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>Google account</strong>
                  <span>Google, Apple, Microsoft, or email password.</span>
                </div>
                <AuthDialog />
              </div>
              <div className="setting-row">
                <div>
                  <strong>Private saving</strong>
                  <span>Your chart is saved for this browser profile.</span>
                </div>
                <button
                  className="toggle-control active"
                  aria-pressed="true"
                  type="button"
                >
                  On
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">ACCESS</div>
            <h2>{usage.statusText}</h2>
            <p>
              {usage.questionsText}. {usage.pdfText}. {usage.deepReadingsText}.
            </p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>Premium</strong>
                  <span>Review plans, restore, or manage access.</span>
                </div>
                <Link className="button secondary" href="/pricing">
                  View Premium
                </Link>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Guest pass</strong>
                  <span>Redeem a private invite or review access.</span>
                </div>
                <Link className="button" href="/dashboard/redeem-pass">
                  Redeem
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">PREFERENCES</div>
            <h2>Language, sound, and privacy</h2>
            <p>Keep Predicta understandable, calm, private, and comfortable for repeat use.</p>
            <div className="settings-stack">
              <div className="setting-row language-setting-row">
                <WebLanguageSelector />
              </div>
              <div className="setting-row">
                <div>
                  <strong>Reply chime</strong>
                  <span>A soft sound after Predicta finishes a response.</span>
                </div>
                <button
                  className="toggle-control active"
                  aria-pressed="true"
                  type="button"
                >
                  On
                </button>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Private mode</strong>
                  <span>Keep sensitive readings visually understated.</span>
                </div>
                <button
                  className="toggle-control active"
                  aria-pressed="true"
                  type="button"
                >
                  On
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">BILLING</div>
            <h2>Purchases and reports</h2>
            <p>
              Restore previous purchases, review Premium, or keep using the free
              experience.
            </p>
            <div className="action-row settings-actions">
              <button className="button secondary" type="button">
                Restore Purchases
              </button>
              <button className="button secondary" type="button">
                Manage Subscription
              </button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
