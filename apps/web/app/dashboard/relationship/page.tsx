import { WebRelationshipMirror } from '../../../components/WebRelationshipMirror';

export default function RelationshipPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">A mirror for real relationships.</h1>
        <details className="info-drawer">
          <summary>
            <span>What Predicta compares</span>
            <strong>Open</strong>
          </summary>
          <p>
            Compare two Kundlis across emotion, communication, commitment,
            conflict, and timing.
          </p>
        </details>
      </div>

      <WebRelationshipMirror />
    </section>
  );
}
