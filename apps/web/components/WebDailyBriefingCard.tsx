'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { DailyBriefing, HolisticDailyGuidance } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

type WebDailyBriefingCardProps = {
  briefing: DailyBriefing;
  ctaHref?: string;
  holisticGuidance?: HolisticDailyGuidance;
};

export function WebDailyBriefingCard({
  briefing,
  ctaHref,
  holisticGuidance,
}: WebDailyBriefingCardProps): React.JSX.Element {
  const [showProof, setShowProof] = useState(false);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const ready = briefing.status === 'ready';
  const habitStorageKey = `predicta.dailyHabit.${briefing.language}`;
  const completedToday = completedDates.includes(briefing.date);
  const streak = useMemo(
    () => countCurrentStreak(completedDates, briefing.date),
    [briefing.date, completedDates],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(habitStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { dates?: unknown };
      if (Array.isArray(parsed.dates)) {
        setCompletedDates(
          parsed.dates.filter((item): item is string => typeof item === 'string'),
        );
      }
    } catch {
      setCompletedDates([]);
    }
  }, [habitStorageKey]);

  function markHabitDone() {
    const nextDates = Array.from(new Set([...completedDates, briefing.date])).sort();
    setCompletedDates(nextDates);
    try {
      window.localStorage.setItem(
        habitStorageKey,
        JSON.stringify({ dates: nextDates }),
      );
    } catch {
      // Local completion is a comfort feature; the reading still works without storage.
    }
  }

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

      <div className={`daily-habit-panel ${completedToday ? 'done' : ''}`}>
        <div className="daily-habit-copy">
          <span>DAILY HABIT</span>
          <h3>{completedToday ? 'Done today' : "Today's one clean action"}</h3>
          <p>{ready ? briefing.bestAction : 'Create your Kundli to make this personal.'}</p>
        </div>
        <div className="daily-habit-stats">
          <div>
            <span>Day streak</span>
            <strong>{streak}</strong>
          </div>
          <button
            className="button secondary"
            disabled={completedToday}
            onClick={markHabitDone}
            type="button"
          >
            {completedToday ? 'Completed today' : 'Mark done today'}
          </button>
        </div>
        {holisticGuidance ? (
          <div className="daily-habit-rhythm">
            <DailyGuidanceStep label="Morning" text={holisticGuidance.morningPractice} />
            <DailyGuidanceStep label="Midday" text={holisticGuidance.middayCheck} />
            <DailyGuidanceStep label="Evening" text={holisticGuidance.eveningReview} />
          </div>
        ) : null}
      </div>

      {holisticGuidance ? (
        <div className="daily-guidance-panel">
          <div className="daily-guidance-copy">
            <span>HOLISTIC DAILY GUIDANCE</span>
            <h3>{holisticGuidance.headline}</h3>
            <p>{holisticGuidance.dailyFocus}</p>
          </div>
          <div className="daily-guidance-rhythm">
            <DailyGuidanceStep label="Morning" text={holisticGuidance.morningPractice} />
            <DailyGuidanceStep label="Midday" text={holisticGuidance.middayCheck} />
            <DailyGuidanceStep label="Evening" text={holisticGuidance.eveningReview} />
          </div>
        </div>
      ) : null}

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
        {holisticGuidance?.status === 'ready' ? (
          <Link className="button secondary" href={buildGuidanceHref(holisticGuidance)}>
            Daily guidance
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

function DailyGuidanceStep({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <div className="daily-guidance-step">
      <span>{label}</span>
      <p>{text}</p>
    </div>
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
  return buildPredictaChatHref({
    prompt: briefing.askPrompt,
    selectedDailyBriefingDate: briefing.date,
    selectedSection: briefing.title,
    sourceScreen: 'Daily Briefing',
  });
}

function buildGuidanceHref(guidance: HolisticDailyGuidance): string {
  return buildPredictaChatHref({
    prompt: guidance.askPrompt,
    selectedDailyBriefingDate: guidance.date,
    selectedSection: 'Holistic Daily Guidance',
    sourceScreen: 'Holistic Daily Guidance',
  });
}

function countCurrentStreak(dates: string[], today: string): number {
  const completed = new Set(dates);
  let cursor = new Date(`${today}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime())) {
    return completed.has(today) ? 1 : 0;
  }

  let count = 0;
  while (completed.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }

  return count;
}
