import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LifeEvent, LifeTimelineInsight } from '@pridicta/types';

const LIFE_EVENTS_KEY = 'predicta.lifeEvents.v1';
const LIFE_INSIGHTS_KEY = 'predicta.lifeTimelineInsights.v1';

type LifeEventStore = Record<string, LifeEvent[]>;
type LifeInsightStore = Record<string, LifeTimelineInsight>;

export async function loadLocalLifeEvents(
  kundliId: string,
): Promise<LifeEvent[]> {
  const raw = await AsyncStorage.getItem(LIFE_EVENTS_KEY);
  const store = raw ? (JSON.parse(raw) as LifeEventStore) : {};

  return store[kundliId] ?? [];
}

export async function saveLocalLifeEvents(
  kundliId: string,
  events: LifeEvent[],
): Promise<void> {
  const raw = await AsyncStorage.getItem(LIFE_EVENTS_KEY);
  const store = raw ? (JSON.parse(raw) as LifeEventStore) : {};

  await AsyncStorage.setItem(
    LIFE_EVENTS_KEY,
    JSON.stringify({
      ...store,
      [kundliId]: events,
    }),
  );
}

export async function upsertLocalLifeEvent(
  event: LifeEvent,
): Promise<LifeEvent[]> {
  const current = await loadLocalLifeEvents(event.kundliId);
  const next = [
    event,
    ...current.filter(item => item.id !== event.id),
  ].sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  await saveLocalLifeEvents(event.kundliId, next);
  return next;
}

export async function removeLocalLifeEvent({
  eventId,
  kundliId,
}: {
  eventId: string;
  kundliId: string;
}): Promise<LifeEvent[]> {
  const current = await loadLocalLifeEvents(kundliId);
  const next = current.filter(item => item.id !== eventId);
  await saveLocalLifeEvents(kundliId, next);
  return next;
}

export async function loadLocalLifeTimelineInsight(
  kundliId: string,
): Promise<LifeTimelineInsight | undefined> {
  const raw = await AsyncStorage.getItem(LIFE_INSIGHTS_KEY);
  const store = raw ? (JSON.parse(raw) as LifeInsightStore) : {};

  return store[kundliId];
}

export async function saveLocalLifeTimelineInsight(
  insight: LifeTimelineInsight,
): Promise<void> {
  const raw = await AsyncStorage.getItem(LIFE_INSIGHTS_KEY);
  const store = raw ? (JSON.parse(raw) as LifeInsightStore) : {};

  await AsyncStorage.setItem(
    LIFE_INSIGHTS_KEY,
    JSON.stringify({
      ...store,
      [insight.kundliId]: insight,
    }),
  );
}
