'use client';

import type { AuthState, KundliData } from '@pridicta/types';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { getFirebaseWebDb } from './firebase/client';
import {
  loadWebAutoSaveMemory,
  type WebAutoSaveMemory,
} from './web-auto-save-memory';
import {
  loadWebKundliStore,
  type WebKundliStore,
} from './web-kundli-storage';
import {
  getOrCreateWebGuestSession,
  type WebGuestSession,
} from './web-guest-session';

const WEB_ACCOUNT_MERGE_KEY = 'pridicta.webAccountMerge.v1';

export const WEB_ACCOUNT_MERGED_EVENT = 'pridicta:web-account-merged';

export type WebAccountMergeUser = {
  displayName?: string | null;
  email?: string | null;
  providerId?: string | null;
  uid: string;
};

export type WebAccountMergeState = {
  account: AuthState;
  accountSyncError?: string;
  accountSyncStatus: 'LOCAL_MERGED' | 'ACCOUNT_SYNCED' | 'ACCOUNT_SYNC_FAILED';
  activeGuestProfileId: string;
  activeKundliId?: string;
  autoSaveMemory?: WebAutoSaveMemory;
  guestSession: WebGuestSession;
  kundliIds: string[];
  mergedAt: string;
  mergedGuestProfileIds: string[];
  savedKundliCount: number;
  schemaVersion: 1;
};

export function mergeGuestSessionIntoAccount(
  user: WebAccountMergeUser,
): WebAccountMergeState {
  const guestSession = getOrCreateWebGuestSession();
  const kundliStore = loadWebKundliStore();
  const autoSaveMemory = loadWebAutoSaveMemory();
  const previous = readWebAccountMergeState();
  const account: AuthState = {
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
    isLoggedIn: true,
    provider: normalizeProvider(user.providerId),
    userId: user.uid,
  };
  const savedKundlis = dedupeKundlis(kundliStore.savedKundlis);
  const state: WebAccountMergeState = {
    account,
    accountSyncStatus: 'LOCAL_MERGED',
    activeGuestProfileId: guestSession.guestProfileId,
    activeKundliId: kundliStore.activeKundliId,
    autoSaveMemory,
    guestSession,
    kundliIds: savedKundlis.map(kundli => kundli.id),
    mergedAt: new Date().toISOString(),
    mergedGuestProfileIds: dedupeStrings([
      ...(previous?.mergedGuestProfileIds ?? []),
      guestSession.guestProfileId,
    ]),
    savedKundliCount: savedKundlis.length,
    schemaVersion: 1,
  };

  writeAccountSnapshot(user.uid, {
    ...kundliStore,
    savedKundlis,
  });
  writeAccountAutoSaveSnapshot(user.uid, autoSaveMemory);
  writeWebAccountMergeState(state);
  void syncMergedGuestDataToAccount(user, state, {
    ...kundliStore,
    savedKundlis,
  });

  return state;
}

export function readWebAccountMergeState():
  | WebAccountMergeState
  | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_ACCOUNT_MERGE_KEY);

    return raw ? (JSON.parse(raw) as WebAccountMergeState) : undefined;
  } catch {
    return undefined;
  }
}

function writeWebAccountMergeState(state: WebAccountMergeState): void {
  try {
    window.localStorage.setItem(WEB_ACCOUNT_MERGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(WEB_ACCOUNT_MERGED_EVENT));
  } catch {
    // The signed-in account remains usable; merge metadata is best effort.
  }
}

function writeAccountSnapshot(uid: string, store: WebKundliStore): void {
  writeAccountScopedValue(uid, 'kundliStore', store);
}

function writeAccountAutoSaveSnapshot(
  uid: string,
  memory: WebAutoSaveMemory,
): void {
  writeAccountScopedValue(uid, 'autoSaveMemory', memory);
}

function writeAccountScopedValue(
  uid: string,
  name: string,
  value: unknown,
): void {
  try {
    window.localStorage.setItem(
      `pridicta.account.${encodeURIComponent(uid)}.${name}.v1`,
      JSON.stringify(value),
    );
  } catch {
    // Account snapshots are local continuity helpers until server sync is added.
  }
}

async function syncMergedGuestDataToAccount(
  user: WebAccountMergeUser,
  state: WebAccountMergeState,
  kundliStore: WebKundliStore,
): Promise<void> {
  try {
    const db = getFirebaseWebDb();
    const batch = writeBatch(db);

    batch.set(
      doc(db, 'users', user.uid),
      {
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        lastGuestProfileId: state.activeGuestProfileId,
        mergedGuestProfileIds: state.mergedGuestProfileIds,
        predictaWebMerge: {
          activeKundliId: state.activeKundliId ?? null,
          guestProfileId: state.activeGuestProfileId,
          mergedAt: state.mergedAt,
          savedKundliCount: state.savedKundliCount,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    for (const kundli of kundliStore.savedKundlis) {
      batch.set(
        doc(db, 'kundlis', kundli.id),
        {
          birthDetails: kundli.birthDetails,
          calculationMeta: kundli.calculationMeta,
          kundliData: kundli,
          localId: kundli.id,
          mergedFromGuestProfileId: state.activeGuestProfileId,
          resolvedBirthPlace: kundli.birthDetails.resolvedBirthPlace ?? null,
          summary: {
            birthDate: kundli.birthDetails.date,
            birthPlace: kundli.birthDetails.place,
            birthTime: kundli.birthDetails.time,
            lagna: kundli.lagna,
            moonSign: kundli.moonSign,
            nakshatra: kundli.nakshatra,
            name: kundli.birthDetails.name,
          },
          updatedAt: serverTimestamp(),
          userId: user.uid,
        },
        { merge: true },
      );
    }

    await batch.commit();
    await setDoc(
      doc(db, 'users', user.uid, 'predictaPrivate', 'webAutoSaveMemory'),
      {
        memory: state.autoSaveMemory ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    writeWebAccountMergeState({
      ...state,
      accountSyncStatus: 'ACCOUNT_SYNCED',
    });
  } catch (error) {
    writeWebAccountMergeState({
      ...state,
      accountSyncError:
        error instanceof Error ? error.message : 'Account sync did not complete.',
      accountSyncStatus: 'ACCOUNT_SYNC_FAILED',
    });
  }
}

function normalizeProvider(
  providerId?: string | null,
): AuthState['provider'] {
  if (providerId?.includes('google')) {
    return 'google';
  }
  if (providerId?.includes('apple')) {
    return 'apple';
  }
  if (providerId?.includes('microsoft')) {
    return 'microsoft';
  }
  if (providerId?.includes('password')) {
    return 'password';
  }

  return null;
}

function dedupeKundlis(kundlis: KundliData[]): KundliData[] {
  const seen = new Set<string>();
  const result: KundliData[] = [];

  for (const kundli of kundlis) {
    const key = kundli.id || kundli.calculationMeta?.inputHash;
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(kundli);
  }

  return result;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
