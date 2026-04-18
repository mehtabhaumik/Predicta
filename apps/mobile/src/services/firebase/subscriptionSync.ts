import type { MonetizationState } from '../../types/subscription';
import { serverTimestamp, userDocument } from './dbService';

export async function syncEntitlementToFirebase(
  userId: string,
  state: MonetizationState,
): Promise<void> {
  await userDocument(userId).set(
    {
      oneTimeEntitlements: state.oneTimeEntitlements,
      subscription: {
        ...state.entitlement,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true },
  );
}

export async function loadEntitlementFromFirebase(
  userId: string,
): Promise<MonetizationState | null> {
  const snapshot = await userDocument(userId).get();
  const data = snapshot.data();

  if (!data?.subscription) {
    return null;
  }

  return {
    entitlement: data.subscription as MonetizationState['entitlement'],
    oneTimeEntitlements:
      (data.oneTimeEntitlements as MonetizationState['oneTimeEntitlements']) ??
      [],
  };
}
