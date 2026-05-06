import { StatusPill } from '../../../components/StatusPill';
import { WebRelationshipMirror } from '../../../components/WebRelationshipMirror';

export default function RelationshipPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Two-chart comparison" tone="premium" />
        <h1 className="gradient-text">A mirror for real relationships.</h1>
        <p>
          Compare two kundlis across emotional style, communication,
          commitment, conflict, and timing without turning love into a shallow
          score.
        </p>
      </div>

      <WebRelationshipMirror />
    </section>
  );
}
