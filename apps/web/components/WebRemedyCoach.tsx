'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { composeRemedyCoach } from '@pridicta/astrology';
import { buildTrustProfile } from '@pridicta/config/trust';
import type { RemedyCoachItem, RemedyPracticeStatus } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { WebTrustProofPanel } from './WebTrustProofPanel';

const STORAGE_KEY = 'pridicta.remedyTracking.web.preview';

type TrackingMap = Record<string, RemedyPracticeStatus>;

export function WebRemedyCoach(): React.JSX.Element {
  const [tracking, setTracking] = useState<TrackingMap>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { activeKundli } = useWebKundliLibrary();
  const plan = useMemo(
    () => composeRemedyCoach(activeKundli, tracking),
    [activeKundli, tracking],
  );
  const selected =
    plan.items.find(item => item.id === selectedId) ?? plan.items[0];

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setTracking(JSON.parse(raw) as TrackingMap);
    }
  }, []);

  function markDone(item: RemedyCoachItem) {
    const now = new Date().toISOString();
    const dayKey = now.slice(0, 10);
    const previous = tracking[item.id];
    const next = {
      ...tracking,
      [item.id]: {
        completedDates: [
          ...new Set([...(previous?.completedDates ?? []), dayKey]),
        ].sort(),
        lastCompletedAt: now,
        remedyId: item.id,
      },
    };

    setTracking(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <section className="remedy-coach glass-panel">
      <div className="remedy-coach-header">
        <div>
          <div className="section-title">REMEDY COACH</div>
          <h2>{plan.title}</h2>
          <p>{plan.subtitle}</p>
        </div>
      </div>

      <div className="remedy-guardrails">
        {plan.guardrails.map(item => (
          <p key={item}>{item}</p>
        ))}
      </div>

      {plan.status === 'pending' ? (
        <Link className="button" href="/dashboard/kundli">
          Create Kundli
        </Link>
      ) : null}

      {plan.items.length ? (
        <div className="remedy-coach-grid">
          <div className="remedy-list">
            {plan.items.map(item => (
              <button
                className={`remedy-card ${selected?.id === item.id ? 'active' : ''}`}
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <span>{item.priority} priority · {item.tracking.status}</span>
                <strong>{item.title}</strong>
                <p>{item.practice}</p>
              </button>
            ))}
          </div>
          {selected ? (
            <div className="remedy-detail">
              <span>Why this remedy?</span>
              <h3>{selected.title}</h3>
              <p>{selected.rationale}</p>
              <div className="remedy-detail-grid">
                <DetailBlock
                  label="Expected inner shift"
                  text={selected.expectedInnerShift}
                />
                <DetailBlock
                  label="When to review"
                  text={selected.tracking.reviewAfter}
                />
              </div>
              <div className="remedy-caution">
                <span>When to stop or simplify</span>
                <p>
                  {selected.caution} {selected.tracking.nextReviewPrompt}
                </p>
              </div>
              <div className="remedy-tracking">
                <span>Tracking</span>
                <p>
                  {selected.tracking.completions} done · streak{' '}
                  {selected.tracking.currentStreak}
                </p>
              </div>
              <div className="remedy-evidence">
                <span>Chart evidence</span>
                <ul>
                  {selected.evidence.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <WebTrustProofPanel
                compact
                trust={buildTrustProfile({
                  evidence: selected.evidence,
                  limitations: [selected.caution],
                  query: selected.practice,
                  surface: 'remedy',
                })}
              />
              <div className="action-row">
                <button className="button" onClick={() => markDone(selected)} type="button">
                  Mark Practice Done
                </button>
                <Link
                  className="button secondary"
                  href={buildAskHref(selected, activeKundli?.id)}
                >
                  Ask why this remedy
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function DetailBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <div className="remedy-detail-block">
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function buildAskHref(item: RemedyCoachItem, kundliId?: string): string {
  return buildPredictaChatHref({
    kundliId,
    prompt: item.askPrompt,
    remedyId: item.id,
    remedyTitle: item.title,
    selectedSection: item.title,
    sourceScreen: 'Remedy Coach',
  });
}
