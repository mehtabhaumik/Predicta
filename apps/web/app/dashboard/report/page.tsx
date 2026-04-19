import {
  buildReportCacheKey,
  composeReportSections,
  decideReportEntitlement,
  getReportProducts,
} from '@pridicta/pdf';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { demoAccess, demoKundli, demoMonetization } from '../../../lib/demo-state';

export default function ReportPage(): React.JSX.Element {
  const reportProducts = getReportProducts();
  const featuredReport = reportProducts.find(
    product => product.id === 'DETAILED_KUNDLI_DOSSIER',
  );
  const report = composeReportSections({
    kundli: demoKundli,
    mode: featuredReport?.mode ?? 'FREE',
    reportType: featuredReport?.id,
  });
  const reportDecisions = reportProducts.map(product => ({
    cacheKey: buildReportCacheKey({
      kundli: demoKundli,
      mode: product.mode,
      reportType: product.id,
    }),
    decision: decideReportEntitlement({
      hasPremiumAccess: demoAccess.hasPremiumAccess,
      kundli: demoKundli,
      oneTimeEntitlements: demoMonetization.oneTimeEntitlements,
      reportType: product.id,
    }),
    product,
  }));

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Report Studio" tone="premium" />
        <h1 className="gradient-text">Premium reports without clutter.</h1>
        <p>
          Choose a polished free summary, a deeper kundli dossier, a timeline
          map, or a yearly guidance report. Premium changes depth, not dignity.
        </p>
      </div>

      <div className="report-dashboard-layout">
        <Card className="report-dossier glass-panel">
          <div className="report-watermark">PREDICTA</div>
          <div className="card-content spacious">
            <div className="section-title">PERSONAL HANDBOOK</div>
            <h2>{featuredReport?.title ?? 'Kundli Overview'}</h2>
            <p>{report.footer}</p>
            <p className="muted-copy">
              Your report stays consistent unless birth details or calculation
              settings change.
            </p>
            <div className="report-lines" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>
        </Card>
        <div className="report-section-list">
          {reportDecisions.map(({ decision, product }) => (
            <Card key={product.id}>
              <div className="card-content">
                <div className="section-title">{product.category}</div>
                <h2>{product.title}</h2>
                <p>{product.subtitle}</p>
                <div className="report-studio-meta">
                  <span>{product.depth}</span>
                  <span>{product.estimatedMinutes} min</span>
                  <span>
                    {decision.canGenerate ? 'Ready' : decision.ctaLabel ?? 'Locked'}
                  </span>
                </div>
                <p className="muted-copy">{decision.message}</p>
              </div>
            </Card>
          ))}
          <Card className="glass-panel">
            <div className="card-content">
              <div className="section-title">PREVIEW SECTIONS</div>
              {report.sections.slice(0, 5).map(section => (
                <div className="report-preview-row" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="action-row">
            <Link className="button" href="/pricing">
              View Report Options
            </Link>
            <Link className="button secondary" href="/dashboard/chat">
              Ask from report
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
