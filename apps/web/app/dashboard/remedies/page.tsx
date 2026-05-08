import { StatusPill } from '../../../components/StatusPill';
import { WebRemedyCoach } from '../../../components/WebRemedyCoach';

export default function RemediesPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Local-first practice tracking" tone="premium" />
        <h1 className="gradient-text">Remedies without fear.</h1>
        <p>
          Small chart-backed practices with tracking, review points, and clear
          stop rules.
        </p>
      </div>

      <WebRemedyCoach />
    </section>
  );
}
