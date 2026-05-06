import Link from 'next/link';
import { StatusPill } from '../../../components/StatusPill';
import { WebDossierPreview } from '../../../components/WebDossierPreview';

export default function ReportPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Dossier 2.0 shared composition" tone="premium" />
        <h1 className="gradient-text">A serious personal intelligence file.</h1>
        <p>
          Free and premium previews use the same shared report schema. Premium
          adds evidence tables, decision windows, and deeper area intelligence.
        </p>
      </div>

      <WebDossierPreview />

      <div className="action-row">
        <Link className="button" href="/pricing">
          Unlock Premium PDF
        </Link>
        <Link className="button secondary" href="/dashboard/chat">
          Ask from report
        </Link>
      </div>
    </section>
  );
}
