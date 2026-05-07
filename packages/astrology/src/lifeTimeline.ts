import type {
  KundliData,
  LifeTimelineEventView,
  LifeTimelinePresentation,
  TimelineEvent,
} from '@pridicta/types';

type TimelineStatus = LifeTimelineEventView['status'];

const SECTION_COPY: Record<
  TimelineStatus,
  { description: string; title: string }
> = {
  later: {
    description: 'Longer chapters and support actions to keep on the radar.',
    title: 'Later',
  },
  next: {
    description: 'The next timing signals to prepare for calmly.',
    title: 'Next',
  },
  now: {
    description: 'The chapter currently shaping decisions and attention.',
    title: 'Now',
  },
};

export function composeLifeTimeline(
  kundli?: KundliData,
  nowIso = new Date().toISOString(),
): LifeTimelinePresentation {
  if (!kundli) {
    return {
      currentPeriod: 'Pending',
      sections: buildSections([]),
      status: 'pending',
      subtitle:
        'Create a kundli to unlock a real timeline from dasha, transit, rectification, and remedy evidence.',
      title: 'Your life timeline is waiting.',
      upcomingPeriod: 'Pending',
    };
  }

  const events = buildEventViews(kundli, nowIso);
  const current = kundli.dasha.current;
  const upcoming = findUpcomingDasha(kundli, current.endDate);

  return {
    caution: kundli.rectification?.needsRectification
      ? 'Birth time needs checking, so fine timing should stay conservative.'
      : undefined,
    currentPeriod: `${current.mahadasha}/${current.antardasha}`,
    sections: buildSections(events),
    status: 'ready',
    subtitle:
      'A simple map of now, next, and later using verified chart timing.',
    title: `${kundli.birthDetails.name}'s life timeline`,
    upcomingPeriod: upcoming
      ? `${upcoming.mahadasha} from ${formatDate(upcoming.startDate)}`
      : 'No upcoming dasha chapter available',
  };
}

function buildEventViews(
  kundli: KundliData,
  nowIso: string,
): LifeTimelineEventView[] {
  const sourceEvents = collectEvents(kundli);
  const nowTime = parseTime(nowIso);

  return sourceEvents
    .map(event => {
      const status = resolveStatus(event, nowTime);
      const dateWindow = formatWindow(event.startDate, event.endDate);
      const evidence = buildEvidence(event, kundli, status);

      return {
        action: buildAction(event, status),
        askPrompt: buildAskPrompt(event, dateWindow),
        confidence: event.confidence,
        dateWindow,
        evidence,
        houses: event.houses,
        id: event.id,
        kind: event.kind,
        planets: event.planets,
        status,
        summary: event.summary,
        title: event.title,
      };
    })
    .sort((a, b) => eventSort(a, b));
}

function collectEvents(kundli: KundliData): TimelineEvent[] {
  const seen = new Set<string>();
  const events: TimelineEvent[] = [];

  for (const event of kundli.lifeTimeline ?? []) {
    if (!seen.has(event.id)) {
      seen.add(event.id);
      events.push(event);
    }
  }

  for (const dasha of kundli.dasha.timeline.slice(0, 5)) {
    const id = `dasha-${dasha.mahadasha.toLowerCase()}`;
    if (!seen.has(id)) {
      seen.add(id);
      events.push({
        confidence: 'high',
        endDate: dasha.endDate,
        houses: [],
        id,
        kind: 'dasha',
        planets: [dasha.mahadasha],
        startDate: dasha.startDate,
        summary: 'Major Vimshottari chapter for long-range planning.',
        title: `${dasha.mahadasha} Mahadasha`,
      });
    }
  }

  return events;
}

function buildSections(
  events: LifeTimelineEventView[],
): LifeTimelinePresentation['sections'] {
  return (['now', 'next', 'later'] as const).map(sectionId => ({
    description: SECTION_COPY[sectionId].description,
    events: events.filter(event => event.status === sectionId).slice(0, 6),
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
  }));
}

function resolveStatus(event: TimelineEvent, nowTime: number): TimelineStatus {
  const startTime = parseTime(event.startDate);
  const endTime = event.endDate ? parseTime(event.endDate) : startTime;

  if (startTime <= nowTime && endTime >= nowTime) {
    return 'now';
  }

  if (startTime > nowTime) {
    return 'next';
  }

  return event.kind === 'remedy' || event.kind === 'transit' ? 'now' : 'later';
}

function buildEvidence(
  event: TimelineEvent,
  kundli: KundliData,
  status: TimelineStatus,
): string[] {
  const evidence = [
    `${labelKind(event.kind)} timing: ${formatWindow(event.startDate, event.endDate)}.`,
  ];

  if (event.planets.length) {
    evidence.push(`Linked planet${event.planets.length > 1 ? 's' : ''}: ${event.planets.join(', ')}.`);
  }

  if (event.houses.length) {
    evidence.push(`Relevant house${event.houses.length > 1 ? 's' : ''}: ${event.houses.join(', ')}.`);
  }

  if (event.kind === 'dasha') {
    evidence.push(
      `Current dasha baseline: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
    );
  }

  if (event.kind === 'transit') {
    evidence.push(
      `${kundli.lagna} Lagna and ${kundli.moonSign} Moon are both used for transit house context.`,
    );
  }

  if (event.kind === 'rectification') {
    evidence.push(
      kundli.rectification?.reasons[0] ??
        'Birth time confidence changes how fine timing should be read.',
    );
  }

  if (event.kind === 'remedy') {
    const remedy = kundli.remedies?.find(item => event.id.endsWith(item.id));
    evidence.push(remedy?.rationale ?? 'Remedy is linked to chart pressure and timing.');
  }

  if (status === 'next') {
    evidence.push('This is marked next because its start date is ahead of today.');
  }

  return evidence.slice(0, 4);
}

function buildAction(event: TimelineEvent, status: TimelineStatus): string {
  if (event.kind === 'remedy') {
    return event.summary;
  }

  if (event.kind === 'rectification') {
    return 'Answer the birth-time check questions before relying on fine timing.';
  }

  if (event.kind === 'transit') {
    return 'Use this as weather: plan steadily, then verify decisions through your dasha.';
  }

  if (status === 'next') {
    return 'Prepare gently; do not rush choices before this chapter actually begins.';
  }

  return 'Choose one practical focus for this chapter and review it weekly.';
}

function buildAskPrompt(event: TimelineEvent, dateWindow: string): string {
  return `Explain my ${event.title} timeline event (${dateWindow}) with chart evidence, practical timing, risks, and one next action.`;
}

function eventSort(
  a: LifeTimelineEventView,
  b: LifeTimelineEventView,
): number {
  const statusOrder: Record<TimelineStatus, number> = {
    now: 0,
    next: 1,
    later: 2,
  };

  const statusDelta = statusOrder[a.status] - statusOrder[b.status];

  if (statusDelta !== 0) {
    return statusDelta;
  }

  return a.dateWindow.localeCompare(b.dateWindow);
}

function findUpcomingDasha(kundli: KundliData, currentEndDate: string) {
  const currentEndTime = parseTime(currentEndDate);

  return kundli.dasha.timeline.find(item => parseTime(item.startDate) > currentEndTime);
}

function formatWindow(startDate: string, endDate?: string): string {
  const start = formatDate(startDate);

  if (!endDate || endDate === startDate) {
    return start;
  }

  return `${start} to ${formatDate(endDate)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function parseTime(value: string): number {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function labelKind(kind: TimelineEvent['kind']): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}
