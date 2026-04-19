import type { DailyIntelligence, WeeklyIntelligence } from '@pridicta/types';
import firestore from '@react-native-firebase/firestore';

export async function saveDailyIntelligenceForUser({
  insight,
  userId,
}: {
  insight: DailyIntelligence;
  userId: string;
}): Promise<void> {
  await firestore()
    .collection('dailyIntelligence')
    .doc(`${insight.kundliId}_${insight.dateKey}`)
    .set(
      {
        ...insight,
        userId,
      },
      { merge: true },
    );
}

export async function saveWeeklyIntelligenceForUser({
  briefing,
  userId,
}: {
  briefing: WeeklyIntelligence;
  userId: string;
}): Promise<void> {
  await firestore()
    .collection('weeklyIntelligence')
    .doc(`${briefing.kundliId}_${briefing.weekKey}`)
    .set(
      {
        ...briefing,
        userId,
      },
      { merge: true },
    );
}
