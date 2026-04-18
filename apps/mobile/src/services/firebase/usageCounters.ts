import type { UsageState, UserPlan } from '../../types/astrology';
import { serverTimestamp, userDocument } from './dbService';

export async function syncUsageCounters({
  plan,
  usage,
  userId,
}: {
  plan: UserPlan;
  usage: UsageState;
  userId: string;
}): Promise<void> {
  await userDocument(userId).set(
    {
      plan,
      usage,
      usageUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
