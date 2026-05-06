import { StatusPill } from '../../../components/StatusPill';
import { WebKundliWizard } from '../../../components/WebKundliWizard';

export default function KundliPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Start here" tone="premium" />
        <h1 className="gradient-text">Create your Kundli first.</h1>
        <p>
          This is the front door. Enter birth details, generate the chart, then
          Predicta will unlock the summary, North Indian chart, timeline, chat,
          remedies, and reports in a clear order.
        </p>
      </div>

      <WebKundliWizard />
    </section>
  );
}
