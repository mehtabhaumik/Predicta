import { composeReportSections } from '@pridicta/pdf';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';

export default function ReportPage(): React.JSX.Element {
  const report = composeReportSections({ mode: 'FREE' });

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Free visual quality preserved" tone="premium" />
        <h1 className="gradient-text">A refined dossier preview.</h1>
        <p>
          Every report should feel considered and personal. Premium changes
          depth, not the care taken with presentation.
        </p>
      </div>

      <div className="report-dashboard-layout">
        <Card className="report-dossier glass-panel">
          <div className="report-watermark">PREDICTA</div>
          <div className="card-content spacious">
            <div className="section-title">PERSONAL HANDBOOK</div>
            <h2>Kundli Overview · Dasha · Guidance</h2>
            <p>{report.footer}</p>
            <div className="report-lines" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>
        </Card>
        <div className="report-section-list">
          {report.sections.map(section => (
            <Card key={section.title}>
              <div className="card-content">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </Card>
          ))}
          <div className="action-row">
            <Link className="button" href="/pricing">
              Unlock Premium PDF
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
