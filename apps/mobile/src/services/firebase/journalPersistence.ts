import type { JournalCloudSyncPayload, JournalEntry, JournalInsight } from '@pridicta/types';
import firestore from '@react-native-firebase/firestore';

export async function saveJournalEntryForUser({
  entry,
  explicitUserAction,
  userId,
}: JournalCloudSyncPayload): Promise<{ cloudId: string }> {
  if (!explicitUserAction) {
    throw new Error('Journal cloud sync requires explicit user action.');
  }

  await firestore().collection('journalEntries').doc(entry.id).set(
    {
      ...entry,
      userId,
    },
    { merge: true },
  );

  return { cloudId: entry.id };
}

export async function saveJournalInsightForUser({
  insight,
  userId,
}: {
  insight: JournalInsight;
  userId: string;
}): Promise<void> {
  await firestore()
    .collection('journalInsights')
    .doc(`${insight.kundliId}_${insight.monthKey}`)
    .set(
      {
        ...insight,
        userId,
      },
      { merge: true },
    );
}

export function buildJournalAnalyticsEvent(
  entry: JournalEntry,
): Pick<JournalEntry, 'category' | 'mood' | 'kundliId'> {
  return {
    category: entry.category,
    kundliId: entry.kundliId,
    mood: entry.mood,
  };
}

