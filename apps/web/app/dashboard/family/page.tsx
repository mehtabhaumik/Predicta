import { WebFamilyKarmaMap } from '../../../components/WebFamilyKarmaMap';

export default function FamilyPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Turn family patterns into care.</h1>
        <details className="info-drawer">
          <summary>
            <span>What this shows</span>
            <strong>Open</strong>
          </summary>
          <p>
            Compare saved Kundlis for repeated themes, support zones, and care.
          </p>
        </details>
      </div>

      <WebFamilyKarmaMap />
    </section>
  );
}
