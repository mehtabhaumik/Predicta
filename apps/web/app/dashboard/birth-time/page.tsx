import { StatusPill } from '../../../components/StatusPill';
import { WebBirthTimeDetective } from '../../../components/WebBirthTimeDetective';

export default function BirthTimePage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Stable / Needs checking / Unreliable" tone="premium" />
        <h1 className="gradient-text">Know when the chart can be trusted.</h1>
        <p>
          Birth Time Detective explains confidence, asks simple life-event
          questions, and marks which chart judgments are safe or unsafe.
        </p>
      </div>

      <WebBirthTimeDetective />
    </section>
  );
}
