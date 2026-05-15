import { WebSavedKundlis } from '../../../components/WebSavedKundlis';

export default function SavedKundlisPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Kundli Library</h1>
        <p>
          This is your saved Kundli storage. Choose the active profile for
          Predicta, then use Family Vault when you want family patterns and
          shared-profile workflows.
        </p>
      </div>
      <WebSavedKundlis />
    </section>
  );
}
