import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';

const saved = [
  {
    cloud: true,
    lagna: 'Leo',
    name: 'Pridicta Seeker',
    place: 'Mumbai, Maharashtra, India',
  },
  {
    cloud: false,
    lagna: 'Virgo',
    name: 'Local Preview',
    place: 'Ahmedabad, Gujarat, India',
  },
];

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
      <div className="saved-kundli-grid">
        {saved.map(record => (
          <Card className={record.cloud ? 'glass-panel' : ''} key={record.name}>
            <div className="card-content spacious">
              <div className="section-title">
                {record.cloud ? 'Cloud synced' : 'Local only'}
              </div>
              <h2>{record.name}</h2>
              <p>
                {record.place} · {record.lagna} lagna
              </p>
              <div className="action-row">
                {record.cloud ? (
                  <StatusPill label="Available for restore" />
                ) : (
                  <StatusPill label="Saved on this device" tone="quiet" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
