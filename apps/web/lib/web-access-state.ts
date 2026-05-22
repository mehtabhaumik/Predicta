'use client';

import { resolveAccess } from '@pridicta/access';
import { createInitialMonetizationState } from '@pridicta/monetization';
import type {
  AuthState,
  MonetizationState,
  RedeemedGuestPass,
  ResolvedAccess,
} from '@pridicta/types';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseWebDb } from './firebase/client';

export async function loadWebMonetizationState(
  userId: string,
): Promise<MonetizationState> {
  try {
    const snapshot = await getDoc(doc(getFirebaseWebDb(), 'users', userId));
    const data = snapshot.data();

    if (!data?.subscription) {
      return createInitialMonetizationState();
    }

    return {
      entitlement: data.subscription as MonetizationState['entitlement'],
      oneTimeEntitlements:
        (data.oneTimeEntitlements as MonetizationState['oneTimeEntitlements']) ??
        [],
    };
  } catch {
    return createInitialMonetizationState();
  }
}

export function loadWebRedeemedGuestPass():
  | RedeemedGuestPass
  | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem('pridicta.redeemedGuestPass.v1');
    return raw ? (JSON.parse(raw) as RedeemedGuestPass) : undefined;
  } catch {
    return undefined;
  }
}

export function resolveWebAccess({
  auth,
  monetization,
  redeemedGuestPass,
}: {
  auth: Pick<AuthState, 'email' | 'userId'>;
  monetization: MonetizationState;
  redeemedGuestPass?: RedeemedGuestPass;
}): ResolvedAccess {
  return resolveAccess({
    auth: {
      email: auth.email,
      userId: auth.userId,
    },
    monetization,
    redeemedGuestPass,
  });
}
