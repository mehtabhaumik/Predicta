import type { LifeEvent, LifeTimelineInsight } from '@pridicta/types';
import firestore from '@react-native-firebase/firestore';

export async function saveLifeEventForUser({
  event,
  userId,
}: {
  event: LifeEvent;
  userId: string;
}): Promise<void> {
  await firestore().collection('lifeEvents').doc(event.id).set(
    {
      ...event,
      userId,
    },
    { merge: true },
  );
}

export async function saveLifeTimelineInsightForUser({
  insight,
  userId,
}: {
  insight: LifeTimelineInsight;
  userId: string;
}): Promise<void> {
  await firestore().collection('lifeTimelineInsights').doc(insight.kundliId).set(
    {
      ...insight,
      userId,
    },
    { merge: true },
  );
}
