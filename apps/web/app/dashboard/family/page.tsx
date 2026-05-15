import { WebFamilyKarmaMap } from '../../../components/WebFamilyKarmaMap';

export default function FamilyPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Turn family patterns into care.</h1>
        <p>
          Compare saved Kundlis for repeated themes, support zones, and care.
        </p>
      </div>

      <WebFamilyKarmaMap />
    </section>
  );
}
