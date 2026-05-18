import { WebBirthTimeDetective } from '../../../components/WebBirthTimeDetective';

export default function BirthTimePage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Know when the chart can be trusted.</h1>
        <details className="info-drawer">
          <summary>
            <span>When to use this</span>
            <strong>Open</strong>
          </summary>
          <p>
            Check birth-time confidence with simple life-event questions.
          </p>
        </details>
      </div>

      <WebBirthTimeDetective />
    </section>
  );
}
