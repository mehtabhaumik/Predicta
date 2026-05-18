import { WebRemedyCoach } from '../../../components/WebRemedyCoach';

export default function RemediesPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Remedies without fear.</h1>
        <details className="info-drawer">
          <summary>
            <span>How remedies work</span>
            <strong>Open</strong>
          </summary>
          <p>
            Small chart-backed practices with tracking, review points, and clear
            stop rules.
          </p>
        </details>
      </div>

      <WebRemedyCoach />
    </section>
  );
}
