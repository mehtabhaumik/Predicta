import { WebHolisticRoomsLoader } from '../../../components/WebHolisticRoomsLoader';

export default function HolisticRoomsPage(): React.JSX.Element {
  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Holistic astrology rooms.</h1>
        <details className="info-drawer">
          <summary>
            <span>What these rooms do</span>
            <strong>Open</strong>
          </summary>
          <p>
            Today, karma remedies, life balance, and timing in simple holistic astrology rooms.
          </p>
        </details>
      </div>

      <WebHolisticRoomsLoader />
    </section>
  );
}
