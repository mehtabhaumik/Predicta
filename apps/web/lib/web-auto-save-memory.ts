'use client';

import type { SupportedLanguage } from '@pridicta/types';
import { getOrCreateWebGuestSession } from './web-guest-session';

const WEB_AUTO_SAVE_MEMORY_KEY = 'pridicta.webAutoSaveMemory.v1';
const WEB_ACCOUNT_MERGE_KEY = 'pridicta.webAccountMerge.v1';

export const WEB_AUTO_SAVE_MEMORY_UPDATED_EVENT =
  'pridicta:web-auto-save-memory-updated';

export type WebAutoSaveMemory = {
  chat?: {
    lastMessageAt?: string;
    messageCount: number;
  };
  guestProfileId: string;
  kp?: {
    handoffQuestion?: string;
    selectedCusp?: number;
    selectedEvent?: string;
    updatedAt: string;
  };
  language?: {
    selected: SupportedLanguage;
    updatedAt: string;
  };
  nadi?: {
    handoffQuestion?: string;
    selectedPatternId?: string;
    updatedAt: string;
  };
  report?: {
    builderMode?: 'EVERYTHING' | 'CUSTOM';
    mode: 'FREE' | 'PREMIUM';
    selectedReportId: string;
    selectedSectionKeys?: string[];
    updatedAt: string;
  };
  schemaVersion: 1;
  updatedAt: string;
};

type WebAutoSavePatch = Partial<
  Omit<WebAutoSaveMemory, 'guestProfileId' | 'schemaVersion' | 'updatedAt'>
>;

export function loadWebAutoSaveMemory(): WebAutoSaveMemory {
  const session = getOrCreateWebGuestSession();
  const stored = pickNewestMemory(
    readStoredMemory(),
    readAccountScopedMemory(readActiveAccountUserId()),
  );

  return {
    ...stored,
    guestProfileId: session.guestProfileId,
    schemaVersion: 1,
    updatedAt: stored?.updatedAt ?? new Date().toISOString(),
  };
}

export function saveWebAutoSaveMemory(patch: WebAutoSavePatch): WebAutoSaveMemory {
  const current = loadWebAutoSaveMemory();
  const next: WebAutoSaveMemory = {
    ...current,
    ...patch,
    guestProfileId: current.guestProfileId,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(WEB_AUTO_SAVE_MEMORY_KEY, JSON.stringify(next));
    writeAccountScopedMemory(readActiveAccountUserId(), next);
    window.dispatchEvent(new Event(WEB_AUTO_SAVE_MEMORY_UPDATED_EVENT));
  } catch {
    // Auto-save is best-effort in private browsing or restricted storage modes.
  }

  return next;
}

function pickNewestMemory(
  first?: WebAutoSaveMemory,
  second?: WebAutoSaveMemory,
): WebAutoSaveMemory | undefined {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return new Date(second.updatedAt).getTime() > new Date(first.updatedAt).getTime()
    ? second
    : first;
}

function readActiveAccountUserId(): string | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_ACCOUNT_MERGE_KEY);
    const state = raw
      ? (JSON.parse(raw) as { account?: { userId?: string } })
      : undefined;

    return state?.account?.userId;
  } catch {
    return undefined;
  }
}

function readAccountScopedMemory(uid?: string): WebAutoSaveMemory | undefined {
  if (!uid) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(
      `pridicta.account.${encodeURIComponent(uid)}.autoSaveMemory.v1`,
    );

    return raw ? (JSON.parse(raw) as WebAutoSaveMemory) : undefined;
  } catch {
    return undefined;
  }
}

function writeAccountScopedMemory(
  uid: string | undefined,
  memory: WebAutoSaveMemory,
): void {
  if (!uid) {
    return;
  }

  try {
    window.localStorage.setItem(
      `pridicta.account.${encodeURIComponent(uid)}.autoSaveMemory.v1`,
      JSON.stringify(memory),
    );
  } catch {
    // Account-scoped continuity is best effort when browser storage is limited.
  }
}

function readStoredMemory(): WebAutoSaveMemory | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_AUTO_SAVE_MEMORY_KEY);

    return raw ? (JSON.parse(raw) as WebAutoSaveMemory) : undefined;
  } catch {
    return undefined;
  }
}
