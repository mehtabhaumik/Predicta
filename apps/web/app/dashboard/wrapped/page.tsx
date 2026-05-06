import { StatusPill } from '../../../components/StatusPill';
import { WebPredictaWrappedLoader } from '../../../components/WebPredictaWrappedLoader';

export default function WrappedPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Share-safe preview artifact" tone="premium" />
        <h1 className="gradient-text">Your year, made beautiful.</h1>
        <p>
          Wrapped uses your active Kundli, stays private by default, and
          excludes exact birth time and birth place from share text.
        </p>
      </div>

      <WebPredictaWrappedLoader />
    </section>
  );
}
