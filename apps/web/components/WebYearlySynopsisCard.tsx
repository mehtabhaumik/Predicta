'use client';

import Link from 'next/link';
import type { YearlyHoroscopeVarshaphal } from '@pridicta/types';
import { Card } from './Card';

type WebYearlySynopsisCardProps = {
  intelligence: YearlyHoroscopeVarshaphal;
};

export function WebYearlySynopsisCard({
  intelligence,
}: WebYearlySynopsisCardProps): React.JSX.Element {
  return (
    <Card className="glass-panel gochar-synopsis-card yearly-synopsis-card">
      <div className="card-content spacious">
        <div className="gochar-synopsis-topline">
          <div>
            <div className="section-title">YEARLY HOROSCOPE</div>
            <h2>
              {intelligence.status === 'pending'
                ? 'Your personal year is waiting.'
                : 'What this solar year is asking from you.'}
            </h2>
          </div>
          <span className="gochar-badge supportive">
            {intelligence.yearLabel}
          </span>
        </div>
        <p>{intelligence.freeInsight}</p>
        {intelligence.status === 'ready' ? (
          <div className="gochar-synopsis-signal">
            <span>Muntha focus</span>
            <strong>
              House {intelligence.munthaHouse} in {intelligence.munthaSign}
            </strong>
            <p>{intelligence.yearTheme}</p>
          </div>
        ) : null}
        <div className="action-row">
          <Link className="button" href="/dashboard/timeline">
            Open Yearly Panel
          </Link>
          <Link
            className="button secondary"
            href={`/dashboard/chat?prompt=${encodeURIComponent(
              intelligence.askPrompt,
            )}`}
          >
            Ask Predicta
          </Link>
        </div>
      </div>
    </Card>
  );
}
