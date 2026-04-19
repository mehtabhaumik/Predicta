import type {
  ChartType,
  KundliData,
  LifeEvent,
  LifeEventCategory,
  LifeTimelineAccess,
  LifeTimelineInsight,
  LifeTimelineMappedEvent,
} from '@pridicta/types';
import { sha256 } from '@pridicta/utils/sha256';

export const FREE_LIFE_TIMELINE_EVENT_LIMIT = 3;

const categoryFocus: Record<
  LifeEventCategory,
  { charts: ChartType[]; houses: number[]; themes: string[] }
> = {
  BUSINESS: {
    charts: ['D1', 'D10'],
    houses: [1, 7, 10, 11],
    themes: ['initiative', 'partnership', 'public work', 'gains'],
  },
  CAREER: {
    charts: ['D1', 'D10'],
    houses: [2, 6, 10, 11],
    themes: ['work', 'service', 'recognition', 'income'],
  },
  EDUCATION: {
    charts: ['D1', 'D9', 'D24'],
    houses: [4, 5, 9],
    themes: ['learning', 'mentors', 'discipline'],
  },
  FAMILY: {
    charts: ['D1', 'D4', 'D12'],
    houses: [2, 4, 9],
    themes: ['family', 'home', 'lineage'],
  },
  FINANCE: {
    charts: ['D1', 'D2', 'D10'],
    houses: [2, 8, 11],
    themes: ['resources', 'shared assets', 'gains'],
  },
  HEALTH: {
    charts: ['D1', 'D6', 'D30'],
    houses: [1, 6, 8, 12],
    themes: ['body', 'recovery', 'pressure', 'rest'],
  },
  MARRIAGE: {
    charts: ['D1', 'D7', 'D9'],
    houses: [1, 2, 7, 11],
    themes: ['commitment', 'family growth', 'partnership'],
  },
  OTHER: {
    charts: ['D1', 'D9'],
    houses: [1, 5, 9, 10],
    themes: ['identity', 'meaning', 'growth'],
  },
  RELOCATION: {
    charts: ['D1', 'D4', 'D9'],
    houses: [3, 4, 9, 12],
    themes: ['movement', 'home', 'distance', 'release'],
  },
  RELATIONSHIP: {
    charts: ['D1', 'D7', 'D9'],
    houses: [5, 7, 11],
    themes: ['affection', 'partnership', 'social support'],
  },
  SPIRITUAL: {
    charts: ['D1', 'D9', 'D20'],
    houses: [5, 9, 12],
    themes: ['devotion', 'teachers', 'inner release'],
  },
};

export function buildLifeEventHash(
  kundli: KundliData,
  events: LifeEvent[],
): string {
  const stableEvents = [...events]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(event => ({
      approximateDate: event.approximateDate,
      category: event.category,
      description: event.description ?? '',
      emotionalTone: event.emotionalTone ?? '',
      eventDate: event.eventDate,
      id: event.id,
      title: event.title.trim(),
    }));

  return sha256(
    JSON.stringify({
      calculationInputHash: kundli.calculationMeta.inputHash,
      events: stableEvents,
      kundliId: kundli.id,
    }),
  );
}

export function resolveLifeTimelineAccess({
  eventCount,
  hasPremiumAccess,
}: {
  eventCount: number;
  hasPremiumAccess: boolean;
}): LifeTimelineAccess {
  const remainingFreeEvents = Math.max(
    FREE_LIFE_TIMELINE_EVENT_LIMIT - eventCount,
    0,
  );

  return {
    canAddMoreEvents: hasPremiumAccess || remainingFreeEvents > 0,
    canViewFullTimeline: hasPremiumAccess,
    maxFreeEvents: FREE_LIFE_TIMELINE_EVENT_LIMIT,
    remainingFreeEvents,
    requiresUpgrade:
      !hasPremiumAccess && eventCount >= FREE_LIFE_TIMELINE_EVENT_LIMIT,
  };
}

export function buildLifeTimelineInsight({
  events,
  generatedAt = new Date().toISOString(),
  kundli,
  premiumSynthesis,
}: {
  events: LifeEvent[];
  generatedAt?: string;
  kundli: KundliData;
  premiumSynthesis?: string;
}): LifeTimelineInsight {
  const mappedEvents = [...events]
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .map(event => mapLifeEventToDasha(kundli, event));

  const recurringThemes = findRecurringThemes(mappedEvents);
  const previewText = buildPreviewText(mappedEvents, recurringThemes);

  return {
    calculationMeta: {
      ayanamsa: kundli.calculationMeta.ayanamsa,
      calculatedAt: kundli.calculationMeta.calculatedAt,
      houseSystem: kundli.calculationMeta.houseSystem,
      inputHash: kundli.calculationMeta.inputHash,
      nodeType: kundli.calculationMeta.nodeType,
    },
    eventHash: buildLifeEventHash(kundli, events),
    generatedAt,
    kundliId: kundli.id,
    mappedEvents,
    premiumSynthesis,
    previewText,
    recurringThemes,
  };
}

export function mapLifeEventToDasha(
  kundli: KundliData,
  event: LifeEvent,
): LifeTimelineMappedEvent {
  const focus = categoryFocus[event.category];
  const eventTime = new Date(event.eventDate).getTime();
  const dasha = kundli.dasha.timeline.find(
    item =>
      new Date(item.startDate).getTime() <= eventTime &&
      eventTime <= new Date(item.endDate).getTime(),
  );
  const antardasha = dasha?.antardashas.find(
    item =>
      new Date(item.startDate).getTime() <= eventTime &&
      eventTime <= new Date(item.endDate).getTime(),
  );

  const chartFactors = buildChartFactors(kundli, focus.houses, focus.themes);

  return {
    antardasha: antardasha?.antardasha,
    chartFactors,
    confidence:
      dasha && antardasha && !event.approximateDate
        ? 'high'
        : dasha
        ? 'medium'
        : 'low',
    dashaEndDate: antardasha?.endDate ?? dasha?.endDate,
    dashaStartDate: antardasha?.startDate ?? dasha?.startDate,
    event,
    mahadasha: dasha?.mahadasha,
    relevantCharts: focus.charts,
    relevantHouses: focus.houses,
  };
}

function buildChartFactors(
  kundli: KundliData,
  houses: number[],
  themes: string[],
): string[] {
  return houses.slice(0, 4).map((house, index) => {
    const houseData = kundli.houses.find(item => item.house === house);
    const planetText = houseData?.planets.length
      ? `with ${houseData.planets.join(', ')}`
      : 'with no direct planet cluster';

    return `House ${house} ${planetText}; focus theme: ${
      themes[index] ?? themes[0]
    }.`;
  });
}

function findRecurringThemes(events: LifeTimelineMappedEvent[]): string[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    for (const item of [
      event.mahadasha,
      event.antardasha,
      ...event.relevantHouses.map(house => `House ${house}`),
      ...event.relevantCharts,
    ]) {
      if (!item) {
        continue;
      }
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([theme]) => theme);
}

function buildPreviewText(
  events: LifeTimelineMappedEvent[],
  recurringThemes: string[],
): string {
  if (!events.length) {
    return 'Add a few important life events and Predicta will map them against dasha timing and chart themes.';
  }

  const dashaText = recurringThemes.length
    ? `The first pattern hints are ${recurringThemes.slice(0, 3).join(', ')}.`
    : 'The first events are ready for pattern mapping.';

  return `${events.length} life event${
    events.length === 1 ? '' : 's'
  } mapped. ${dashaText} Treat this as a timing pattern, not a fixed prediction.`;
}
