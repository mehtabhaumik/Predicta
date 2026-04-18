import { CHART_REGISTRY } from '@pridicta/astrology';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';

export default function ChartsPage(): React.JSX.Element {
  const primary = CHART_REGISTRY.filter(chart =>
    ['D1', 'D9', 'D10'].includes(chart.id),
  );
  const core = CHART_REGISTRY.filter(chart => chart.category === 'core');
  const advanced = CHART_REGISTRY.filter(chart => chart.category === 'advanced');
  const selected = primary[2] ?? primary[0];

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="D1 / D9 / D10" tone="premium" />
        <h1 className="gradient-text">A spacious chart explorer.</h1>
        <p>
          D1, D9, and D10 stay prominent while advanced charts remain grouped
          and progressively revealed instead of dumped into one dense grid.
        </p>
      </div>

      <div className="chart-explorer">
        <div className="chart-list">
          {primary.map(chart => (
            <Card className="glass-panel" key={chart.id}>
              <div className="card-content">
                <div className="section-title">{chart.id}</div>
                <h2>{chart.name}</h2>
                <p>{chart.purpose}</p>
                <Link className="button secondary" href="/dashboard/chat">
                  Ask Pridicta
                </Link>
              </div>
            </Card>
          ))}
        </div>
        <Card className="chart-detail-card">
          <div className="card-content spacious">
            <div className="section-title">DETAIL PREVIEW</div>
            <h2>{selected.name}</h2>
            <p>{selected.purpose}</p>
            <div className="chart-board" aria-label={`${selected.name} chart preview`}>
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <div className="action-row">
              <StatusPill label={`${core.length} core charts`} />
              <StatusPill label={`${advanced.length} advanced charts`} />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
