'use client';

import Link from 'next/link';
import { composeHolisticReadingRooms } from '@pridicta/astrology';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../../../lib/use-web-kundli-library';

export default function HolisticRoomsPage(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const rooms = composeHolisticReadingRooms(activeKundli);

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Holistic astrology rooms.</h1>
        <p>
          Today, karma remedies, life balance, and timing in simple holistic astrology rooms.
        </p>
      </div>

      <section className="holistic-rooms-hero glass-panel">
        <div>
          <div className="section-title">START ROOM</div>
          <h2>{rooms.featuredRoom.title}</h2>
          <p>{rooms.featuredRoom.primaryFocus}</p>
          <div className="holistic-proof-row">
            {rooms.featuredRoom.proofChips.map(chip => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>
        <div className="holistic-hero-practice">
          <span>Practice</span>
          <strong>{rooms.featuredRoom.practice}</strong>
          <small>{rooms.featuredRoom.remedy}</small>
          <Link
            className="button"
            href={
              activeKundli
                ? buildPredictaChatHref({
                    kundli: activeKundli,
                    prompt: rooms.featuredRoom.bestQuestion,
                    selectedSection: rooms.featuredRoom.title,
                    sourceScreen: 'Holistic Reading Rooms',
                  })
                : '/dashboard/kundli'
            }
          >
            Ask This Room
          </Link>
        </div>
      </section>

      <div className="holistic-room-grid">
        {rooms.rooms.map(room => (
          <Link
            className={`holistic-room-card ${room.tone}`}
            href={
              activeKundli
                ? buildPredictaChatHref({
                    kundli: activeKundli,
                    prompt: room.bestQuestion,
                    selectedSection: room.title,
                    sourceScreen: 'Holistic Reading Rooms',
                  })
                : '/dashboard/kundli'
            }
            key={room.id}
          >
            <div>
              <span>{room.subtitle}</span>
              <h2>{room.title}</h2>
              <p>{room.primaryFocus}</p>
            </div>
            <div className="holistic-proof-row compact">
              {room.proofChips.slice(0, 4).map(chip => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <div className="holistic-room-practice">
              <strong>{room.practice}</strong>
              <small>{room.remedy}</small>
            </div>
          </Link>
        ))}
      </div>

      <section className="holistic-guardrails glass-panel">
        <div>
          <div className="section-title">CLEAR BOUNDARIES</div>
          <h2>Grounded, not fatalistic.</h2>
        </div>
        <ul>
          {rooms.guardrails.map(rule => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
