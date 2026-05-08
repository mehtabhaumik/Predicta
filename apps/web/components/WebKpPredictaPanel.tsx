'use client';

import Link from 'next/link';
import { type CSSProperties, useMemo, useState } from 'react';
import { composeChalitBhavKpFoundation } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { Card } from './Card';

type KpEventFocus = 'career' | 'money' | 'marriage' | 'property';

const KP_EVENT_FOCUS: Array<{
  id: KpEventFocus;
  title: string;
  houses: number[];
  prompt: string;
}> = [
  {
    houses: [2, 6, 10, 11],
    id: 'career',
    prompt:
      'Using KP only, judge career and job movement from houses 2, 6, 10, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Career and job',
  },
  {
    houses: [2, 5, 8, 11],
    id: 'money',
    prompt:
      'Using KP only, judge money gains and financial stability from houses 2, 5, 8, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Money and gains',
  },
  {
    houses: [2, 7, 11],
    id: 'marriage',
    prompt:
      'Using KP only, judge marriage and partnership promise from houses 2, 7, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Marriage and partner',
  },
  {
    houses: [4, 11, 12],
    id: 'property',
    prompt:
      'Using KP only, judge home, property, and relocation from houses 4, 11, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Home and property',
  },
];

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
  const [selectedEvent, setSelectedEvent] = useState<KpEventFocus>('career');
  const selectedFocus =
    KP_EVENT_FOCUS.find(item => item.id === selectedEvent) ?? KP_EVENT_FOCUS[0];
  const [selectedCusp, setSelectedCusp] = useState<number>(
    selectedFocus.houses.at(-2) ?? selectedFocus.houses[0],
  );
  const selectedCuspData = kp.cusps.find(cusp => cusp.house === selectedCusp);
  const eventSignificators = useMemo(
    () =>
      kp.significators
        .filter(item =>
          item.signifiesHouses.some(house => selectedFocus.houses.includes(house)),
        )
        .slice(0, hasPremiumAccess ? 6 : 4),
    [hasPremiumAccess, kp.significators, selectedFocus.houses],
  );
  const askHref = buildKpAskHref({
    cusp: selectedCuspData,
    focus: selectedFocus,
    handoffQuestion,
  });

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

      <Card className="glass-panel kp-judgement-card">
        <div className="card-content spacious">
          <div className="school-panel-hero compact">
            <div>
              <div className="section-title">KP JUDGEMENT PATH</div>
              <h2>{selectedFocus.title}</h2>
              <p>
                Pick the event first. KP then checks the relevant houses, cusp
                sub lord, significators, ruling planets, and dasha support.
              </p>
            </div>
            <span className="school-badge premium">Event first</span>
          </div>

          <div className="kp-event-row" aria-label="KP event focus">
            {KP_EVENT_FOCUS.map(item => (
              <button
                aria-pressed={selectedEvent === item.id}
                className={selectedEvent === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => {
                  setSelectedEvent(item.id);
                  setSelectedCusp(item.houses.at(-2) ?? item.houses[0]);
                }}
                type="button"
              >
                <span>{item.title}</span>
                <small>Houses {item.houses.join(', ')}</small>
              </button>
            ))}
          </div>

          <div className="kp-proof-path">
            <div>
              <span>1. Houses</span>
              <strong>{selectedFocus.houses.join(' / ')}</strong>
              <p>These houses define the KP promise for this event.</p>
            </div>
            <div>
              <span>2. Cusp sub lord</span>
              <strong>
                {selectedCuspData
                  ? `${selectedCuspData.house}: ${selectedCuspData.lordChain.subLord}`
                  : 'Pending'}
              </strong>
              <p>
                The selected cusp becomes the main judgement point before timing.
              </p>
            </div>
            <div>
              <span>3. Significators</span>
              <strong>{eventSignificators.length || 'Pending'}</strong>
              <p>Planets connecting to these houses become event carriers.</p>
            </div>
            <div>
              <span>4. Timing</span>
              <strong>Ruling planets + dasha</strong>
              <p>Premium depth checks period support and event windows.</p>
            </div>
          </div>
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
                {kp.cusps.slice(0, 12).map((cusp, index) => (
                  <tr
                    className={
                      selectedCusp === cusp.house ||
                      selectedFocus.houses.includes(cusp.house)
                        ? 'kp-relevant-row'
                        : ''
                    }
                    key={cusp.house}
                    onClick={() => setSelectedCusp(cusp.house)}
                    style={{ ['--kp-row-index' as string]: index } as CSSProperties}
                  >
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
          <div className="kp-significator-map">
            {eventSignificators.map((item, index) => (
              <div
                className="kp-significator-node"
                key={item.planet}
                style={{ ['--kp-row-index' as string]: index } as CSSProperties}
              >
                <span>{item.strength}</span>
                <strong>{item.planet}</strong>
                <p>{item.simpleMeaning}</p>
                <div>
                  {item.signifiesHouses
                    .filter(house => selectedFocus.houses.includes(house))
                    .map(house => (
                      <small key={`${item.planet}-${house}`}>H{house}</small>
                    ))}
                </div>
              </div>
            ))}
          </div>
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
              href={askHref}
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

function buildKpAskHref({
  cusp,
  focus,
  handoffQuestion,
}: {
  cusp?: { house: number; lordChain: { starLord: string; subLord: string; subSubLord: string } };
  focus: (typeof KP_EVENT_FOCUS)[number];
  handoffQuestion?: string;
}): string {
  const prompt = handoffQuestion
    ? `KP Predicta handoff question: ${handoffQuestion}. ${focus.prompt}`
    : `${focus.prompt}${cusp ? ` Selected cusp ${cusp.house} has star lord ${cusp.lordChain.starLord}, sub lord ${cusp.lordChain.subLord}, and sub-sub lord ${cusp.lordChain.subSubLord}.` : ''}`;
  const params = new URLSearchParams({
    from: 'PARASHARI',
    prompt,
    school: 'KP',
  });

  if (handoffQuestion) {
    params.set('handoffQuestion', handoffQuestion);
  }

  return `/dashboard/chat?${params.toString()}`;
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
