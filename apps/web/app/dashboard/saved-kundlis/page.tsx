import { WebSavedKundlis } from '../../../components/WebSavedKundlis';

export default function SavedKundlisPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Your Kundlis stay easy to find.</h1>
        <p>
          Predicta keeps this browser profile ready. Sign in when you want to
          keep your Kundlis across devices.
        </p>
      </div>
      <WebSavedKundlis />
    </section>
  );
}
