'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState } from 'react';
import { buildTrustProfile } from '@pridicta/config/trust';
import type {
  LifeTimelineEventView,
  LifeTimelinePresentation,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';
import { WebTrustProofPanel } from './WebTrustProofPanel';

type WebLifeTimelinePanelProps = {
  ctaHref?: string;
  presentation: LifeTimelinePresentation;
};

export function WebLifeTimelinePanel({
  ctaHref,
  presentation,
}: WebLifeTimelinePanelProps): React.JSX.Element {
  const allEvents = useMemo(
    () => presentation.sections.flatMap(section => section.events),
    [presentation.sections],
  );
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(
    allEvents[0]?.id,
  );
  const selectedEvent =
    allEvents.find(event => event.id === selectedEventId) ?? allEvents[0];

  return (
    <section className="life-timeline glass-panel">
      <div className="life-timeline-header">
        <div>
          <div className="section-title">LIFE TIMELINE</div>
          <h2>{presentation.title}</h2>
          <TimelineInfoButton
            body={presentation.subtitle}
            eyebrow="How to read this"
            title="Life Timeline"
          />
        </div>
      </div>

      <div className="life-timeline-metrics">
        <TimelineMetric label="Now" value={presentation.currentPeriod} />
        <TimelineMetric label="Next" value={presentation.upcomingPeriod} />
      </div>

      {presentation.caution ? (
        <div className="life-timeline-caution">
          <span>Timing note</span>
          <p>{presentation.caution}</p>
        </div>
      ) : null}

      {presentation.status === 'pending' && ctaHref ? (
        <Link className="button" href={ctaHref}>
          Create Kundli
        </Link>
      ) : null}

      <div className="life-timeline-grid">
        {presentation.sections.map(section => (
          <div className="life-timeline-section" key={section.id}>
            <div className="life-timeline-section-heading">
              <h3>{section.title}</h3>
              <TimelineInfoButton
                body={section.description}
                eyebrow="Meaning"
                title={section.title}
              />
            </div>
            <div className="life-timeline-events">
              {section.events.length ? (
                section.events.map(event => (
                  <button
                    className={`timeline-event-card ${
                      event.id === selectedEvent?.id ? 'active' : ''
                    }`}
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    type="button"
                  >
                    <span>{event.kind}</span>
                    <strong>{event.title}</strong>
                    <small>
                      {event.dateWindow} · {event.confidence} confidence
                    </small>
                    <p>{event.summary}</p>
                  </button>
                ))
              ) : (
                <div className="timeline-empty">No {section.title.toLowerCase()} events yet.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedEvent ? (
        <div className="life-timeline-drilldown">
          <div>
            <span>Chart proof</span>
            <h3>{selectedEvent.title}</h3>
          </div>
          <ul>
            {selectedEvent.evidence.slice(0, 3).map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="life-timeline-action">
            <span>Action</span>
            <p>{selectedEvent.action}</p>
          </div>
          <WebTrustProofPanel
            compact
            trust={buildTrustProfile({
              evidence: selectedEvent.evidence,
              limitations:
                selectedEvent.confidence === 'low'
                  ? ['This event has low confidence, so use it for broad reflection only.']
                  : [],
              query: selectedEvent.askPrompt,
              surface: 'timeline',
            })}
          />
          <Link className="button" href={buildAskHref(selectedEvent)}>
            Ask from this event
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function TimelineInfoButton({
  body,
  eyebrow,
  title,
}: {
  body: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusTrap(dialogRef, {
    active: open,
    initialFocusRef: closeButtonRef,
    onClose: () => setOpen(false),
  });

  return (
    <>
      <button
        aria-controls={open ? `${dialogId}-dialog` : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="info-help-button"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span aria-hidden>?</span>
        <span className="sr-only">{eyebrow}</span>
      </button>
      {open ? (
        <div
          className="info-dialog-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            aria-describedby={`${dialogId}-body`}
            aria-labelledby={`${dialogId}-title`}
            aria-modal="true"
            className="info-dialog"
            id={`${dialogId}-dialog`}
            onClick={event => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
          >
            <div className="info-dialog-header">
              <span>{eyebrow}</span>
              <button
                aria-label="Close explanation"
                className="dialog-close"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
                type="button"
              >
                Close
              </button>
            </div>
            <h3 id={`${dialogId}-title`}>{title}</h3>
            <p id={`${dialogId}-body`}>{body}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TimelineMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="life-timeline-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildAskHref(event: LifeTimelineEventView): string {
  return buildPredictaChatHref({
    prompt: event.askPrompt,
    selectedSection: event.title,
    selectedTimelineEventId: event.id,
    selectedTimelineEventKind: event.kind,
    selectedTimelineEventTitle: event.title,
    selectedTimelineEventWindow: event.dateWindow,
    sourceScreen: 'Life Timeline',
  });
}
