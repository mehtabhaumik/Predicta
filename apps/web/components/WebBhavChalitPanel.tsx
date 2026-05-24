'use client';

import Link from 'next/link';
import {
  buildParashariChalitChart,
  composeChalitBhavKpFoundation,
  getChalitReadingNote,
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
            <p>{bhav.whatChanges}</p>
            <details className="info-drawer">
              <summary>
                <span>What Chalit means</span>
                <strong>Open</strong>
              </summary>
              <p>
                Chalit shows where results actually land in daily life after
                bhava boundaries refine the D1 chart. It keeps the rashi signs
                from D1, but it can shift the house that receives the result.
              </p>
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
            insightProfile="chalit"
            kundli={kundli}
            kundliId={kundli?.id}
            ownerName={kundli?.birthDetails.name}
            presentation="charts"
            readingNoteOverride={`${getChalitReadingNote()} This is separate from KP cusp/sub-lord judgement.`}
            sectionTitle="PARASHARI CHALIT CHART"
          />
        ) : (
          <div className="school-empty">
            Chalit chart will appear after this Kundli is calculated with the
            updated Chalit method.
          </div>
        )}

        <div className="chalit-meaning-panel">
          <div>
            <span>What changes in lived experience</span>
            <strong>{bhav.whatChanges}</strong>
          </div>
          <div>
            <span>Practical correction</span>
            <strong>{bhav.practicalCorrection}</strong>
          </div>
          <div>
            <span>Plain-language insight</span>
            <p>
              {hasPremiumAccess
                ? bhav.premiumSynthesis ?? bhav.freeInsight
                : bhav.freeInsight}
            </p>
          </div>
        </div>

        <div className="school-grid two">
          <div>
            <span>Real-life shift areas</span>
            <strong>{bhav.activeLifeAreas.length || bhav.shifts.length}</strong>
            <p>
              {bhav.activeLifeAreas.length
                ? bhav.activeLifeAreas.join(' · ')
                : 'No major house-delivery shift is active, so D1 remains the main lived story.'}
            </p>
          </div>
          <div>
            <span>Bhava cusps ready</span>
            <strong>{bhav.cusps.length}</strong>
            <p>
              Cusps refine where the planet delivers results in practice. This
              is house delivery, not a change of sign.
            </p>
          </div>
        </div>

        {bhav.shiftMeanings.length ? (
          <div className="school-table-wrap">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>From D1 Meaning</th>
                  <th>Lived Chalit Meaning</th>
                  <th>Awareness</th>
                </tr>
              </thead>
              <tbody>
                {bhav.shiftMeanings.slice(0, hasPremiumAccess ? 9 : 4).map(item => (
                  <tr key={item.planet}>
                    <td>{item.planet}</td>
                    <td>
                      House {item.fromHouse}: {item.fromArea}
                    </td>
                    <td>
                      House {item.toHouse}: {item.toArea}
                    </td>
                    <td>{item.awareness}</td>
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
              prompt:
                'Explain what my Parashari Chalit chart is actually changing in real life. Do not mix it with KP.',
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
