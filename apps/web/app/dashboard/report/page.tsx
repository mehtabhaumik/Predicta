import Link from 'next/link';
import { StatusPill } from '../../../components/StatusPill';
import { WebDossierPreview } from '../../../components/WebDossierPreview';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';

export default function ReportPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Report marketplace" tone="premium" />
        <h1 className="gradient-text">Pick the report you actually need.</h1>
        <p>
          Start with a useful free preview. Go deeper only when you want
          timing, remedies, chart proof, or a polished PDF.
        </p>
      </div>

      <WebDossierPreview />

      <div className="action-row">
        <Link className="button" href="/pricing">
          See deeper report options
        </Link>
        <Link
          className="button secondary"
          href={buildPredictaChatHref({
            prompt: 'Help me choose the right report from my selected Kundli.',
            sourceScreen: 'Report Marketplace',
          })}
        >
          Ask from report
        </Link>
      </div>
    </section>
  );
}
