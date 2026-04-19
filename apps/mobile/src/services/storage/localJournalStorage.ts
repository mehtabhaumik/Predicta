import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalEntry, JournalInsight } from '@pridicta/types';

const JOURNAL_ENTRIES_KEY = 'predicta.journalEntries.v1';
const JOURNAL_INSIGHTS_KEY = 'predicta.journalInsights.v1';

type JournalEntryStore = Record<string, JournalEntry[]>;
type JournalInsightStore = Record<string, JournalInsight>;

export async function loadLocalJournalEntries(
  kundliId: string,
): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
  const store = raw ? (JSON.parse(raw) as JournalEntryStore) : {};

  return store[kundliId] ?? [];
}

export async function saveLocalJournalEntries(
  kundliId: string,
  entries: JournalEntry[],
): Promise<void> {
  const raw = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
  const store = raw ? (JSON.parse(raw) as JournalEntryStore) : {};

  await AsyncStorage.setItem(
    JOURNAL_ENTRIES_KEY,
    JSON.stringify({
      ...store,
      [kundliId]: entries,
    }),
  );
}

export async function upsertLocalJournalEntry(
  entry: JournalEntry,
): Promise<JournalEntry[]> {
  const current = await loadLocalJournalEntries(entry.kundliId);
  const next = [
    {
      ...entry,
      syncStatus: entry.syncStatus ?? 'LOCAL_ONLY',
    },
    ...current.filter(item => item.id !== entry.id),
  ].sort((a, b) => b.date.localeCompare(a.date));

  await saveLocalJournalEntries(entry.kundliId, next);
  return next;
}

export async function markJournalEntrySynced({
  cloudId,
  entryId,
  kundliId,
}: {
  cloudId?: string;
  entryId: string;
  kundliId: string;
}): Promise<JournalEntry[]> {
  const current = await loadLocalJournalEntries(kundliId);
  const next = current.map(entry =>
    entry.id === entryId
      ? {
          ...entry,
          cloudId: cloudId ?? entry.cloudId,
          syncStatus: 'CLOUD_SYNCED' as const,
        }
      : entry,
  );

  await saveLocalJournalEntries(kundliId, next);
  return next;
}

export async function loadLocalJournalInsight(
  kundliId: string,
  monthKey: string,
): Promise<JournalInsight | undefined> {
  const raw = await AsyncStorage.getItem(JOURNAL_INSIGHTS_KEY);
  const store = raw ? (JSON.parse(raw) as JournalInsightStore) : {};

  return store[`${kundliId}_${monthKey}`];
}

export async function saveLocalJournalInsight(
  insight: JournalInsight,
): Promise<void> {
  const raw = await AsyncStorage.getItem(JOURNAL_INSIGHTS_KEY);
  const store = raw ? (JSON.parse(raw) as JournalInsightStore) : {};

  await AsyncStorage.setItem(
    JOURNAL_INSIGHTS_KEY,
    JSON.stringify({
      ...store,
      [`${insight.kundliId}_${insight.monthKey}`]: insight,
    }),
  );
}

