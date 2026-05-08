import { StatusPill } from '../../../components/StatusPill';
import { WebKundliWizard } from '../../../components/WebKundliWizard';

export default function KundliPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Start here" tone="premium" />
        <h1 className="gradient-text">Create your Kundli first.</h1>
        <p>
          Enter birth details once. Predicta then opens your chart, summary,
          chat, timeline, remedies, and reports in order.
        </p>
      </div>

      <WebKundliWizard />
    </section>
  );
}
