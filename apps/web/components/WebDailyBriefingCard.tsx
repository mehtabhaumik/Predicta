'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { DailyBriefing } from '@pridicta/types';

type WebDailyBriefingCardProps = {
  briefing: DailyBriefing;
  ctaHref?: string;
};

export function WebDailyBriefingCard({
  briefing,
  ctaHref,
}: WebDailyBriefingCardProps): React.JSX.Element {
  const [showProof, setShowProof] = useState(false);
  const ready = briefing.status === 'ready';

  return (
    <section className={`daily-briefing glass-panel ${ready ? 'ready' : 'pending'}`}>
      <div className="daily-briefing-header">
        <div>
          <div className="section-title">{briefing.labels.eyebrow}</div>
          <h2>{briefing.title}</h2>
          <p>{briefing.subtitle}</p>
        </div>
        <div className="daily-briefing-date">
          <span>Today</span>
          <strong>{briefing.date}</strong>
        </div>
      </div>

      <div className="daily-briefing-theme">
        <span>{briefing.labels.theme}</span>
        <p>{briefing.todayTheme}</p>
      </div>

      <div className="daily-briefing-actions-grid">
        <BriefingPanel label={briefing.labels.bestAction} text={briefing.bestAction} />
        <BriefingPanel label={briefing.labels.avoidAction} text={briefing.avoidAction} />
      </div>

      <div className="daily-briefing-weather">
        <span>{briefing.labels.emotionalWeather}</span>
        <p>{briefing.emotionalWeather}</p>
      </div>

      <div className="daily-briefing-cues">
        {briefing.cues.map(cue => (
          <div className="daily-briefing-cue" key={cue.area}>
            <span>
              {cue.label} · {cue.weight}
            </span>
            <p>{cue.text}</p>
          </div>
        ))}
      </div>

      <div className="daily-briefing-remedy">
        <span>{briefing.labels.remedy}</span>
        <p>{briefing.remedyMicroAction}</p>
      </div>

      <div className="daily-briefing-actions">
        {ready ? (
          <Link className="button" href={buildAskHref(briefing)}>
            Ask about today
          </Link>
        ) : ctaHref ? (
          <Link className="button" href={ctaHref}>
            Create Kundli
          </Link>
        ) : null}
        <button
          className="button secondary"
          onClick={() => setShowProof(value => !value)}
          type="button"
        >
          {showProof ? 'Hide chart proof' : 'Why? Show chart proof'}
        </button>
      </div>

      {showProof ? (
        <div className="daily-briefing-proof">
          <span>{briefing.labels.proof}</span>
          <ul>
            {briefing.evidence.slice(0, 4).map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function BriefingPanel({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <div className="daily-briefing-panel">
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function buildAskHref(briefing: DailyBriefing): string {
  const params = new URLSearchParams({
    briefingDate: briefing.date,
    prompt: briefing.askPrompt,
  });

  return `/dashboard/chat?${params.toString()}`;
}
