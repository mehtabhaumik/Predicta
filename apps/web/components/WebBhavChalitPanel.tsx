'use client';

import Link from 'next/link';
import {
  buildParashariChalitChart,
  composeChalitBhavKpFoundation,
} from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { Card } from './Card';
import { WebKundliChart } from './WebKundliChart';

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
  const chalitChart = buildParashariChalitChart(kundli);

  return (
    <Card className="glass-panel bhav-chalit-panel">
      <div className="card-content spacious">
        <div className="school-panel-hero">
          <div>
            <div className="section-title">PARASHARI CHALIT</div>
            <h2>{bhav.title}</h2>
            <details className="info-drawer">
              <summary>
                <span>What Chalit means</span>
                <strong>Open</strong>
              </summary>
              <p>{bhav.subtitle}</p>
            </details>
          </div>
        </div>

        {chalitChart ? (
          <WebKundliChart
            birthDetails={kundli?.birthDetails}
            centerLabel="Chalit"
            chart={chalitChart}
            chartRoleOverride="Parashari house-delivery refinement"
            hasPremiumAccess={hasPremiumAccess}
            kundliId={kundli?.id}
            ownerName={kundli?.birthDetails.name}
            readingNoteOverride="Parashari Chalit keeps each planet's rashi sign from D1, but places the planet in the bhava where it delivers results. This is separate from KP cusp/sub-lord judgement."
            sectionTitle="PARASHARI CHALIT CHART"
          />
        ) : (
          <div className="school-empty">
            Chalit chart will appear after this Kundli is calculated with the
            updated Chalit method.
          </div>
        )}

        <details className="info-drawer school-explain-box">
          <summary>
            <span>Simple meaning</span>
            <strong>Open</strong>
          </summary>
          <strong>Simple meaning</strong>
          <p>{hasPremiumAccess ? bhav.premiumSynthesis ?? bhav.freeInsight : bhav.freeInsight}</p>
        </details>

        <div className="school-grid two">
          <div>
            <span>House shifts</span>
            <strong>{bhav.shifts.length}</strong>
            <p>
              Chalit changes house delivery. The planet sign stays from D1
              Rashi.
            </p>
          </div>
          <div>
            <span>Cusps available</span>
            <strong>{bhav.cusps.length}</strong>
            <p>
              Lagna-degree bhava boundaries refine which house receives the
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
                  <th>Chalit House</th>
                  <th>Direction</th>
                </tr>
              </thead>
              <tbody>
                {bhav.shifts.slice(0, hasPremiumAccess ? 9 : 4).map(item => (
                  <tr key={item.planet}>
                    <td>{item.planet}</td>
                    <td>{item.rashiHouse}</td>
                    <td>{'chalitHouse' in item ? item.chalitHouse : item.bhavHouse}</td>
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
            href={buildPredictaChatHref({
              kundli,
              prompt: 'Explain my Parashari Chalit chart and house shifts. Do not mix it with KP.',
              selectedSection: 'Chalit Chart',
              sourceScreen: 'Chalit Chart',
            })}
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
