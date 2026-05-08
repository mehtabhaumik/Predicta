import { StatusPill } from '../../../components/StatusPill';
import { WebBirthTimeDetective } from '../../../components/WebBirthTimeDetective';

export default function BirthTimePage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Stable / Needs checking / Unreliable" tone="premium" />
        <h1 className="gradient-text">Know when the chart can be trusted.</h1>
        <p>
          Check birth-time confidence with simple life-event questions.
        </p>
      </div>

      <WebBirthTimeDetective />
    </section>
  );
}
