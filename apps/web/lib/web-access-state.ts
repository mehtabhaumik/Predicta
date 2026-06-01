'use client';

import { resolveAccess } from '@pridicta/access';
import {
  createInitialMonetizationState,
  mapServerLedgerToMonetizationState,
  type ServerEntitlementLedger,
} from '@pridicta/monetization';
import type {
  AuthState,
  MonetizationState,
  RedeemedGuestPass,
  ResolvedAccess,
} from '@pridicta/types';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseWebDb } from './firebase/client';
import { getWebAuthHeaders } from './firebase/auth-token';
import { writeWebKundliEntitlementSnapshotFromLedger } from './web-kundli-entitlement-snapshot';

export async function loadWebMonetizationState(
  userId: string,
): Promise<MonetizationState> {
  const serverLedgerState = await loadWebServerLedgerState();
  if (serverLedgerState) {
    return serverLedgerState;
  }

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

export async function loadWebServerLedgerState(): Promise<MonetizationState | undefined> {
  try {
    const authHeaders = await getWebAuthHeaders();
    const response = await fetch('/api/entitlements/ledger', {
      headers: authHeaders,
      method: 'GET',
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { ledger?: ServerEntitlementLedger };
    if (payload.ledger) {
      writeWebKundliEntitlementSnapshotFromLedger(payload.ledger);
    }
    return payload.ledger
      ? mapServerLedgerToMonetizationState(payload.ledger)
      : undefined;
  } catch {
    return undefined;
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
