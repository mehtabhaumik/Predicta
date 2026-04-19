import {
  buildJournalAnalyticsPayload,
  buildJournalHash,
  buildJournalInsight,
  resolveJournalInsightAccess,
} from '@pridicta/astrology';
import Link from 'next/link';
import { Card, MetricCard } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { demoAccess, demoJournalEntries, demoKundli } from '../../../lib/demo-state';

export default function JournalPage(): React.JSX.Element {
  const access = resolveJournalInsightAccess({
    hasPremiumAccess: demoAccess.hasPremiumAccess,
  });
  const insight = buildJournalInsight({
    entries: demoJournalEntries,
    generatedAt: '2026-04-18T00:00:00.000Z',
    hasPremiumAccess: access.canViewPremiumPatterns,
    kundli: demoKundli,
    monthKey: '2026-04',
  });
  const analyticsPayload = buildJournalAnalyticsPayload({
    entries: demoJournalEntries,
    monthKey: '2026-04',
  });
  const journalHash = buildJournalHash(demoKundli, demoJournalEntries, '2026-04');
  const summaryStatus = journalHash ? 'Ready' : 'Pending';

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Private journal" tone="premium" />
        <h1 className="gradient-text">Your private reflection layer.</h1>
        <p>
          Journal moods, decisions, and outcomes with calm monthly reflection.
          Predicta helps you notice patterns without making the space feel heavy.
        </p>
      </div>

      <div className="metric-row">
        <MetricCard
          detail="Saved on this device unless you choose otherwise."
          label="Entries this month"
          value={String(insight.summary.entryCount)}
        />
        <MetricCard
          detail={access.message}
          label="Pattern depth"
          value={access.depth}
        />
        <MetricCard
          detail="Monthly reflections refresh only when your journal pattern changes."
          label="Insight summary"
          value={summaryStatus}
        />
      </div>

      <div className="journal-dashboard-layout">
        <Card className="glass-panel">
          <div className="card-content spacious">
            <div className="section-title">MONTHLY REFLECTION</div>
            <h2>{insight.basicReflection}</h2>
            <p>
              Premium adds emotional cycle insight and monthly reflection.
              Free users still keep private entries and dasha labels.
            </p>
            <div className="journal-entry-list">
              {demoJournalEntries.map(entry => (
                <div className="journal-entry-row" key={entry.id}>
                  <div>
                    <strong>{entry.category}</strong>
                    <span>
                      {entry.date} · {entry.mood?.replace('_', ' ') ?? 'No mood'}
                    </span>
                  </div>
                  <span>{entry.tags.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="report-section-list">
          <Card>
            <div className="card-content">
              <div className="section-title">DASHA CONTEXT</div>
              <h2>Mapped with care</h2>
              <p>
                {insight.summary.dashaContexts.length} journal labels are ready
                for dasha-aware reflection when you want a calmer monthly view.
              </p>
            </div>
          </Card>
          <Card>
            <div className="card-content">
              <div className="section-title">MONTHLY VIEW</div>
              <h2>{analyticsPayload.entryCount} entries</h2>
              <p>
                See the month by mood, theme, and timing so your reflections
                stay useful without becoming overwhelming.
              </p>
            </div>
          </Card>
          <div className="action-row">
            <Link className="button" href="/dashboard/chat">
              Ask from journal
            </Link>
            <Link className="button secondary" href="/pricing">
              Unlock patterns
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
