import { StatusPill } from '../../../components/StatusPill';
import { WebSavedKundlis } from '../../../components/WebSavedKundlis';

export default function SavedKundlisPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Cloud save is optional" tone="premium" />
        <h1 className="gradient-text">Local and cloud records in one library.</h1>
        <p>
          Cloud-synced kundlis are marked clearly. Local-only records never
          upload unless the user chooses that action.
        </p>
      </div>
      <WebSavedKundlis />
    </section>
  );
}
