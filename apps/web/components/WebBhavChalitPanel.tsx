'use client';

import Link from 'next/link';
import { composeChalitBhavKpFoundation } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { Card } from './Card';

type WebBhavChalitPanelProps = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
};

export function WebBhavChalitPanel({
  hasPremiumAccess = false,
  kundli,
}: WebBhavChalitPanelProps): React.JSX.Element {
  const foundation = composeChalitBhavKpFoundation(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const bhav = foundation.bhavChalit;

  return (
    <Card className="glass-panel bhav-chalit-panel">
      <div className="card-content spacious">
        <div className="school-panel-hero">
          <div>
            <div className="section-title">PARASHARI HOUSE REFINEMENT</div>
            <h2>{bhav.title}</h2>
            <p>{bhav.subtitle}</p>
          </div>
          <span className="school-badge">Not KP</span>
        </div>

        <div className="school-explain-box">
          <strong>Simple meaning</strong>
          <p>{hasPremiumAccess ? bhav.premiumSynthesis ?? bhav.freeInsight : bhav.freeInsight}</p>
        </div>

        <div className="school-grid two">
          <div>
            <span>House shifts</span>
            <strong>{bhav.shifts.length}</strong>
            <p>
              Chalit only changes house emphasis. The planet sign stays from
              D1 Rashi.
            </p>
          </div>
          <div>
            <span>Cusps available</span>
            <strong>{bhav.cusps.length}</strong>
            <p>
              Exact cusp degrees help refine which life area receives the
              planet.
            </p>
          </div>
        </div>

        {bhav.shifts.length ? (
          <div className="school-table-wrap">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>D1 House</th>
                  <th>Bhav House</th>
                  <th>Direction</th>
                </tr>
              </thead>
              <tbody>
                {bhav.shifts.slice(0, hasPremiumAccess ? 9 : 4).map(item => (
                  <tr key={item.planet}>
                    <td>{item.planet}</td>
                    <td>{item.rashiHouse}</td>
                    <td>{item.bhavHouse}</td>
                    <td>{item.shiftDirection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="school-empty">
            No major Chalit shift is available in this Kundli yet.
          </div>
        )}

        <div className="action-row">
          <Link
            className="button secondary"
            href={`/dashboard/chat?prompt=${encodeURIComponent(
              'Explain my Bhav Chalit chart and house shifts. Do not mix it with KP.',
            )}`}
          >
            Ask Regular Predicta
          </Link>
          <Link className="button secondary" href="/dashboard/kp">
            Open KP Predicta
          </Link>
        </div>
      </div>
    </Card>
  );
}
