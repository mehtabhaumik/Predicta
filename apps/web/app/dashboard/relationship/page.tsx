import { WebRelationshipMirror } from '../../../components/WebRelationshipMirror';

export default function RelationshipPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">A mirror for real relationships.</h1>
        <p>
          Compare two Kundlis across emotion, communication, commitment,
          conflict, and timing.
        </p>
      </div>

      <WebRelationshipMirror />
    </section>
  );
}
