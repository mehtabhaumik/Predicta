import type {
  KundliData,
  PredictaWrapped,
  PredictaWrappedActivity,
  PredictaWrappedCard,
  TimelineEvent,
  TransitInsight,
} from '@pridicta/types';

type PredictaWrappedInput = {
  activity?: PredictaWrappedActivity;
  kundli?: KundliData;
  nowIso?: string;
  year?: number;
};

const HOUSE_AREAS: Record<number, string> = {
  1: 'identity and confidence',
  2: 'money, voice, and family values',
  3: 'courage, skills, and communication',
  4: 'home, inner peace, and belonging',
  5: 'creativity, study, and joy',
  6: 'health routines, service, and discipline',
  7: 'relationships and agreements',
  8: 'change, trust, and deep repair',
  9: 'faith, mentors, and long-range luck',
  10: 'career, responsibility, and visibility',
  11: 'friends, gains, and community',
  12: 'rest, retreat, and spiritual release',
};

export function composePredictaWrapped({
  activity,
  kundli,
  nowIso = new Date().toISOString(),
  year,
}: PredictaWrappedInput = {}): PredictaWrapped {
  const wrappedYear = year ?? new Date(nowIso).getFullYear();

  if (!kundli) {
    const pendingCards: PredictaWrappedCard[] = [
      {
        body:
          'Wrapped needs a calculated kundli before it can summarize your year from real dasha, transit, timeline, activity, and report evidence.',
        evidence: [
          'No kundli is loaded yet.',
          'Share output will exclude exact birth time and birth place.',
        ],
        eyebrow: 'YEARLY RECAP',
        guidance: 'Create a kundli, ask a few meaningful questions, then return for a personal recap.',
        id: 'pending-wrapped',
        kind: 'year-theme',
        shareLine: 'My Predicta Wrapped is waiting for a calculated kundli.',
        title: 'Your Wrapped is waiting',
        value: 'Pending kundli',
      },
    ];

    return {
      askPrompt:
        'Explain what Predicta Wrapped will show after a kundli exists, without requesting exact birth time or birth place in the share output.',
      bestWindow: 'Pending',
      cards: pendingCards,
      cautionWindow: 'Pending',
      growthArea: 'Pending',
      hardLesson: 'Pending',
      nextYearPreview: 'Pending',
      ownerName: 'Predicta Seeker',
      privacyCheck: privacyCheck(),
      shareText:
        'My Predicta Wrapped is waiting for a calculated kundli. Share cards stay private by default.',
      status: 'pending',
      subtitle:
        'Create a kundli to unlock a yearly recap from dasha, transit, timeline, activity, and report insights.',
      title: `${wrappedYear} Predicta Wrapped is waiting.`,
      year: wrappedYear,
      yearTheme: 'Pending',
    };
  }

  const ownerName = kundli.birthDetails.name;
  const events = eventsForYear(kundli.lifeTimeline ?? [], wrappedYear);
  const currentDasha = `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`;
  const strongestHouse = kundli.ashtakavarga.strongestHouses[0];
  const weakestHouse = kundli.ashtakavarga.weakestHouses[0];
  const bestEvent = pickBestEvent(events, kundli.transits);
  const cautionEvent = pickCautionEvent(events, kundli.transits);
  const nextDasha = dashaForYear(kundli, wrappedYear + 1);
  const yearTheme = `${kundli.dasha.current.mahadasha} year of ${houseArea(strongestHouse)} with a ${kundli.moonSign} Moon undertone`;
  const hardLesson = weakestHouse
    ? `learning steadiness around ${houseArea(weakestHouse)}`
    : `working carefully with ${kundli.dasha.current.antardasha} sub-period pressure`;
  const growthArea = strongestHouse
    ? `building from ${houseArea(strongestHouse)}`
    : `${kundli.nakshatra} patience and practical self-trust`;
  const bestWindow = bestEvent
    ? `${bestEvent.title}: ${formatWindow(bestEvent.startDate, bestEvent.endDate)}`
    : strongestHouse
      ? `When house ${strongestHouse} topics are active, choose the cleanest opportunity.`
      : 'Use supportive days for simple, visible progress.';
  const cautionWindow = cautionEvent
    ? `${cautionEvent.title}: ${formatWindow(cautionEvent.startDate, cautionEvent.endDate)}`
    : weakestHouse
      ? `When house ${weakestHouse} topics heat up, slow decisions and keep routines simple.`
      : 'Avoid overpromising during emotional or logistical pressure.';
  const nextYearPreview = nextDasha
    ? `${wrappedYear + 1} opens under ${nextDasha.mahadasha} themes. Prepare through ${houseArea(strongestHouse)}.`
    : `${wrappedYear + 1} asks for quieter integration of this year's lessons.`;
  const cards = buildCards({
    activity,
    bestWindow,
    cautionWindow,
    currentDasha,
    events,
    growthArea,
    hardLesson,
    kundli,
    nextYearPreview,
    ownerName,
    strongestHouse,
    weakestHouse,
    wrappedYear,
    yearTheme,
  });
  const shareText = buildShareText(wrappedYear, ownerName, cards);

  return {
    askPrompt: [
      `Explain my ${wrappedYear} Predicta Wrapped.`,
      'Use year theme, hard lesson, growth area, best window, caution window, next-year preview, user activity, and chart evidence.',
      'Keep it share-safe: no exact birth time, no birth place, no private question text unless I explicitly mention it.',
    ].join(' '),
    bestWindow,
    cards,
    cautionWindow,
    growthArea,
    hardLesson,
    nextYearPreview,
    ownerName,
    privacyCheck: privacyCheck(),
    shareText,
    status: 'ready',
    subtitle:
      'A share-safe yearly recap built from dasha, transits, timeline, activity, and report signals.',
    title: `${ownerName}'s ${wrappedYear} Predicta Wrapped`,
    year: wrappedYear,
    yearTheme,
  };
}

function buildCards({
  activity,
  bestWindow,
  cautionWindow,
  currentDasha,
  events,
  growthArea,
  hardLesson,
  kundli,
  nextYearPreview,
  ownerName,
  strongestHouse,
  weakestHouse,
  wrappedYear,
  yearTheme,
}: {
  activity?: PredictaWrappedActivity;
  bestWindow: string;
  cautionWindow: string;
  currentDasha: string;
  events: TimelineEvent[];
  growthArea: string;
  hardLesson: string;
  kundli: KundliData;
  nextYearPreview: string;
  ownerName: string;
  strongestHouse?: number;
  weakestHouse?: number;
  wrappedYear: number;
  yearTheme: string;
}): PredictaWrappedCard[] {
  const activityLine = activity
    ? `${activity.questionsAsked ?? 0} questions, ${activity.deepReadings ?? 0} deep reads, ${activity.reportsGenerated ?? 0} reports`
    : 'Activity unlocks as you ask, save, and generate reports.';

  return [
    {
      body: `${ownerName}'s chart kept returning to ${yearTheme}. This is a theme, not a label.`,
      evidence: [
        `Current dasha: ${currentDasha}.`,
        `${kundli.moonSign} Moon and ${kundli.nakshatra} nakshatra shape the emotional undertone.`,
        strongestHouse ? `Strongest ashtakavarga house: ${strongestHouse}.` : 'Strongest house pending.',
      ],
      eyebrow: `${wrappedYear} THEME`,
      guidance: 'Choose one theme word for the year and let decisions pass through it.',
      id: 'year-theme',
      kind: 'year-theme',
      shareLine: `My ${wrappedYear} theme: ${yearTheme}.`,
      title: 'The year had a signature',
      value: yearTheme,
    },
    {
      body: `The hard lesson was ${hardLesson}. It asked for patience, structure, and fewer reactive choices.`,
      evidence: [
        weakestHouse ? `Care house from ashtakavarga: ${weakestHouse}.` : 'Care house pending.',
        kundli.rectification?.needsRectification
          ? 'Birth time confidence asks for conservative fine timing.'
          : 'Birth time confidence does not require extra caution for broad themes.',
      ],
      eyebrow: 'HARD LESSON',
      guidance: 'Do not treat the lesson as punishment. Treat it as a place to simplify.',
      id: 'hard-lesson',
      kind: 'hard-lesson',
      shareLine: `Hard lesson: ${hardLesson}.`,
      title: 'What made you stronger',
      value: hardLesson,
    },
    {
      body: `The growth area was ${growthArea}. This is where the chart showed a steadier support path.`,
      evidence: [
        strongestHouse ? `Support house from ashtakavarga: ${strongestHouse}.` : 'Support house pending.',
        `Lagna: ${kundli.lagna}.`,
      ],
      eyebrow: 'GROWTH AREA',
      guidance: 'Put your best routines here first. Growth becomes visible when it is repeated.',
      id: 'growth-area',
      kind: 'growth-area',
      shareLine: `Growth area: ${growthArea}.`,
      title: 'Where you levelled up',
      value: growthArea,
    },
    {
      body: bestWindow,
      evidence: eventEvidence(events, 'supportive', kundli),
      eyebrow: 'BEST WINDOW',
      guidance: 'Use this window for cleaner launches, asks, repairs, and visible commitments.',
      id: 'best-window',
      kind: 'best-window',
      shareLine: `Best window: ${bestWindow}.`,
      title: 'Your green-light chapter',
      value: bestWindow,
    },
    {
      body: cautionWindow,
      evidence: eventEvidence(events, 'challenging', kundli),
      eyebrow: 'CAUTION WINDOW',
      guidance: 'Slow the pace here. Confirm facts, sleep before decisions, and keep promises small.',
      id: 'caution-window',
      kind: 'caution-window',
      shareLine: `Caution window: ${cautionWindow}.`,
      title: 'Where the year asked for care',
      value: cautionWindow,
    },
    {
      body: nextYearPreview,
      evidence: [
        `Next-year preview uses dasha timeline and current chart support zones.`,
        `Current timeline events found for ${wrappedYear}: ${events.length}.`,
      ],
      eyebrow: `${wrappedYear + 1} PREVIEW`,
      guidance: 'Carry one lesson forward, not the whole weight of the year.',
      id: 'next-year-preview',
      kind: 'next-year-preview',
      shareLine: `Next year preview: ${nextYearPreview}.`,
      title: 'What opens next',
      value: nextYearPreview,
    },
    {
      body: activityLine,
      evidence: [
        `Questions asked: ${activity?.questionsAsked ?? 0}.`,
        `Deep readings: ${activity?.deepReadings ?? 0}.`,
        `Reports generated: ${activity?.reportsGenerated ?? 0}.`,
      ],
      eyebrow: 'PREDICTA ACTIVITY',
      guidance:
        activity?.savedQuestions?.length
          ? 'Review your saved questions before making the next big choice.'
          : 'Save meaningful questions next year to make Wrapped even more personal.',
      id: 'activity',
      kind: 'activity',
      shareLine: `Predicta activity: ${activityLine}.`,
      title: 'How you used guidance',
      value: activityLine,
    },
  ];
}

function buildShareText(
  year: number,
  ownerName: string,
  cards: PredictaWrappedCard[],
): string {
  const lines = cards
    .filter(card => card.kind !== 'activity')
    .map(card => card.shareLine);

  return [
    `${ownerName}'s ${year} Predicta Wrapped`,
    ...lines.slice(0, 6),
    'Share-safe: exact birth time and birth place are not included.',
  ].join('\n');
}

function eventsForYear(events: TimelineEvent[], year: number): TimelineEvent[] {
  return events
    .filter(event => overlapsYear(event, year))
    .sort((a, b) => parseTime(a.startDate) - parseTime(b.startDate))
    .slice(0, 12);
}

function pickBestEvent(
  events: TimelineEvent[],
  transits: TransitInsight[] = [],
): TimelineEvent | undefined {
  const supportiveTransit = transits.find(transit => transit.weight === 'supportive');

  return (
    events.find(event => event.confidence === 'high' && event.kind !== 'rectification') ??
    (supportiveTransit
      ? {
          confidence: 'medium',
          houses: [supportiveTransit.houseFromLagna],
          id: `transit-${supportiveTransit.planet.toLowerCase()}-support`,
          kind: 'transit',
          planets: [supportiveTransit.planet],
          startDate: supportiveTransit.calculatedAt,
          summary: supportiveTransit.summary,
          title: `${supportiveTransit.planet} support`,
        }
      : undefined)
  );
}

function pickCautionEvent(
  events: TimelineEvent[],
  transits: TransitInsight[] = [],
): TimelineEvent | undefined {
  const challengingTransit = transits.find(
    transit => transit.weight === 'challenging' || transit.weight === 'mixed',
  );

  return (
    events.find(
      event => event.kind === 'rectification' || event.confidence === 'low',
    ) ??
    (challengingTransit
      ? {
          confidence: 'medium',
          houses: [challengingTransit.houseFromLagna],
          id: `transit-${challengingTransit.planet.toLowerCase()}-care`,
          kind: 'transit',
          planets: [challengingTransit.planet],
          startDate: challengingTransit.calculatedAt,
          summary: challengingTransit.summary,
          title: `${challengingTransit.planet} care window`,
        }
      : undefined)
  );
}

function eventEvidence(
  events: TimelineEvent[],
  mode: 'supportive' | 'challenging',
  kundli: KundliData,
): string[] {
  const event =
    mode === 'supportive'
      ? events.find(item => item.confidence === 'high')
      : events.find(item => item.kind === 'rectification' || item.confidence === 'low');

  if (!event) {
    return [
      `Current dasha baseline: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
      `${mode === 'supportive' ? 'Support' : 'Care'} guidance falls back to ashtakavarga and timeline evidence.`,
    ];
  }

  return [
    `${event.title}: ${formatWindow(event.startDate, event.endDate)}.`,
    event.planets.length ? `Linked planets: ${event.planets.join(', ')}.` : 'No linked planet list available.',
    event.houses.length ? `Linked houses: ${event.houses.join(', ')}.` : 'No linked house list available.',
  ];
}

function dashaForYear(kundli: KundliData, year: number) {
  const yearStart = parseTime(`${year}-01-01`);

  return kundli.dasha.timeline.find(item => {
    const start = parseTime(item.startDate);
    const end = parseTime(item.endDate);

    return start <= yearStart && end >= yearStart;
  });
}

function overlapsYear(event: TimelineEvent, year: number): boolean {
  const start = parseTime(event.startDate);
  const end = parseTime(event.endDate ?? event.startDate);
  const yearStart = parseTime(`${year}-01-01`);
  const yearEnd = parseTime(`${year}-12-31`);

  return start <= yearEnd && end >= yearStart;
}

function privacyCheck() {
  return {
    consentRequired: true,
    excludesBirthPlace: true,
    excludesExactBirthTime: true,
    note:
      'Wrapped share output excludes exact birth time and birth place. Sharing should be user-consented.',
  };
}

function houseArea(house?: number): string {
  return house ? HOUSE_AREAS[house] ?? `house ${house}` : 'the chart support zone';
}

function formatWindow(startDate: string, endDate?: string): string {
  const start = formatDate(startDate);

  if (!endDate || endDate === startDate) {
    return start;
  }

  return `${start} to ${formatDate(endDate)}`;
}

function formatDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en', {
    month: 'short',
    year: 'numeric',
  });
}

function parseTime(value: string): number {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}
