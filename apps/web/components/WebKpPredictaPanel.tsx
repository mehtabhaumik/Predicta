'use client';

import Link from 'next/link';
import { composeChalitBhavKpFoundation } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { Card } from './Card';

type WebKpPredictaPanelProps = {
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function WebKpPredictaPanel({
  handoffQuestion,
  hasPremiumAccess = false,
  kundli,
  schoolCalculationStatus = 'idle',
}: WebKpPredictaPanelProps): React.JSX.Element {
  const foundation = composeChalitBhavKpFoundation(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const kp = foundation.kp;
  const ruling = kp.rulingPlanets;

  return (
    <div className="kp-page-stack">
      <Card className="glass-panel kp-school-panel">
        <div className="card-content spacious">
          <div className="school-panel-hero">
            <div>
              <div className="section-title">KP PREDICTA</div>
              <h1 className="gradient-text">A separate precision school.</h1>
              <p>
                KP Predicta stays inside Krishnamurti Paddhati: cusps, star
                lords, sub lords, significators, ruling planets, dasha support,
                and event-focused judgement. It does not casually mix with
                Parashari charts.
              </p>
            </div>
            <span className="school-badge premium">KP world</span>
          </div>

          <div className="school-explain-box">
            <strong>{kp.title}</strong>
            <p>{hasPremiumAccess ? kp.premiumSynthesis ?? kp.freeInsight : kp.freeInsight}</p>
          </div>

          {ruling ? (
            <div className="school-grid ruling">
              <div>
                <span>Day Lord</span>
                <strong>{ruling.dayLord}</strong>
              </div>
              <div>
                <span>Moon Star</span>
                <strong>{ruling.moonStarLord}</strong>
              </div>
              <div>
                <span>Moon Sub</span>
                <strong>{ruling.moonSubLord}</strong>
              </div>
              <div>
                <span>Lagna Sub</span>
                <strong>{ruling.lagnaSubLord}</strong>
              </div>
            </div>
          ) : null}

          <div className="school-callout">
            Regular Predicta handles Parashari, D1, vargas, Bhav Chalit, dasha,
            gochar, remedies, and reports. KP Predicta handles KP. Nadi Predicta
            handles premium Nadi-style planetary story reading separately.
          </div>
          {handoffQuestion ? (
            <div className="school-callout active">
              Question received: “{handoffQuestion}”. KP Predicta will carry this
              question with the active birth profile and answer from KP.
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">KP CUSPS</div>
          <h2>12 cusps with star and sub lords.</h2>
          <div className="school-table-wrap">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Cusp</th>
                  <th>Sign</th>
                  <th>Star Lord</th>
                  <th>Sub Lord</th>
                  <th>Sub-sub</th>
                </tr>
              </thead>
              <tbody>
                {kp.cusps.slice(0, 12).map(cusp => (
                  <tr key={cusp.house}>
                    <td>{cusp.house}</td>
                    <td>
                      {cusp.sign} {cusp.degree.toFixed(2)}°
                    </td>
                    <td>{cusp.lordChain.starLord}</td>
                    <td>{cusp.lordChain.subLord}</td>
                    <td>{cusp.lordChain.subSubLord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!kp.cusps.length ? (
            <p>{getKpCalculationMessage(Boolean(kundli), schoolCalculationStatus)}</p>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">KP SIGNIFICATORS</div>
          <h2>Event houses by planet.</h2>
          <div className="school-grid significators">
            {kp.significators.slice(0, hasPremiumAccess ? 9 : 5).map(item => (
              <div key={item.planet}>
                <span>{item.strength} significator</span>
                <strong>{item.planet}</strong>
                <p>Houses: {item.signifiesHouses.join(', ') || 'Not clear yet'}</p>
              </div>
            ))}
          </div>
          <div className="action-row">
            <a
              className="button"
              href={`/dashboard/chat?prompt=${encodeURIComponent(
                handoffQuestion
                  ? `KP Predicta handoff question: ${handoffQuestion}. Answer using KP cusps, star lords, sub lords, significators, ruling planets, and event-timing rules only.`
                  : 'I am in KP Predicta. Explain my KP horoscope using cusps, sub lords, significators, and ruling planets only.',
              )}&school=KP&from=PARASHARI${
                handoffQuestion
                  ? `&handoffQuestion=${encodeURIComponent(handoffQuestion)}`
                  : ''
              }`}
            >
              Ask KP Predicta
            </a>
            <Link className="button secondary" href="/pricing">
              See KP Premium Depth
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getKpCalculationMessage(
  hasKundli: boolean,
  status: 'idle' | 'calculating' | 'error',
): string {
  if (!hasKundli) {
    return 'Create a Kundli once, then KP Predicta will calculate the KP horoscope from those birth details.';
  }

  if (status === 'calculating') {
    return 'Calculating KP cusps, star lords, and sub lords from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but KP calculation could not complete right now. Please try again shortly.';
  }

  return 'KP Predicta is preparing this layer from the saved birth profile.';
}
