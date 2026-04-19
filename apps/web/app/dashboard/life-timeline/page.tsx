import { buildLifeTimelineInsight } from '@pridicta/astrology';
import { buildLifeTimelineAIContext } from '@pridicta/ai';
import { getLifeTimelineReportProduct } from '@pridicta/config/pricing';
import Link from 'next/link';
import { Card, MetricCard } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { demoKundli, demoLifeEvents } from '../../../lib/demo-state';

export default function LifeTimelinePage(): React.JSX.Element {
  const insight = buildLifeTimelineInsight({
    events: demoLifeEvents,
    generatedAt: '2026-04-18T00:00:00.000Z',
    kundli: demoKundli,
  });
  const aiContext = buildLifeTimelineAIContext(insight);
  const product = getLifeTimelineReportProduct();

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Signature feature" tone="premium" />
        <h1 className="gradient-text">Your Life Pattern Map.</h1>
        <p>
          Add real turning points and Predicta maps them against dasha timing,
          chart houses, and divisional chart focus without treating the future
          as fixed.
        </p>
      </div>

      <div className="metric-row">
        <MetricCard
          detail="Free users can preview the first three events."
          label="Events mapped"
          value={String(insight.mappedEvents.length)}
        />
        <MetricCard
          detail={insight.recurringThemes.slice(0, 3).join(', ') || 'Pending'}
          label="Pattern hints"
          value="Dasha + houses"
        />
        <MetricCard
          detail={`${product.label} ${product.displayPrice}`}
          label="Report hook"
          value="One-time"
        />
      </div>

      <div className="life-timeline-layout">
        <Card className="glass-panel">
          <div className="card-content spacious">
            <div className="section-title">TIMELINE PREVIEW</div>
            <h2>{insight.previewText}</h2>
            <p>
              Add meaningful life events and Predicta will keep the reflection
              focused on patterns, timing, and practical next steps.
            </p>
            <div className="timeline-event-list">
              {insight.mappedEvents.map(item => (
                <div className="timeline-event-row" key={item.event.id}>
                  <div>
                    <strong>{item.event.title}</strong>
                    <span>
                      {item.event.eventDate} · {item.event.category}
                    </span>
                  </div>
                  <span>
                    {item.mahadasha ?? 'Unmapped'} /{' '}
                    {item.antardasha ?? 'period'}
                  </span>
                  <span>{item.confidence}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="report-section-list">
          <Card>
            <div className="card-content">
              <div className="section-title">REFLECTION VIEW</div>
              <h2>Focused by design</h2>
              <p>
                {aiContext.mappedEventCount} mapped events and{' '}
                {aiContext.recurringThemes.length} recurring themes are ready
                for a calm, chart-aware reflection.
              </p>
            </div>
          </Card>
          <Card>
            <div className="card-content">
              <div className="section-title">DEEPER REPORT</div>
              <h2>{product.displayPrice}</h2>
              <p>
                Unlock a deeper Life Timeline Report when you want a fuller
                reading without changing your plan.
              </p>
            </div>
          </Card>
          <div className="action-row">
            <Link className="button" href="/dashboard/chat">
              Ask from timeline
            </Link>
            <Link className="button secondary" href="/pricing">
              Unlock report
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
