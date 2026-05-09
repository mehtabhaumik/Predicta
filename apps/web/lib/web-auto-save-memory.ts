'use client';

import type { SupportedLanguage } from '@pridicta/types';
import { getOrCreateWebGuestSession } from './web-guest-session';

const WEB_AUTO_SAVE_MEMORY_KEY = 'pridicta.webAutoSaveMemory.v1';

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
    mode: 'FREE' | 'PREMIUM';
    selectedReportId: string;
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
  const stored = readStoredMemory();

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
    window.dispatchEvent(new Event(WEB_AUTO_SAVE_MEMORY_UPDATED_EVENT));
  } catch {
    // Auto-save is best-effort in private browsing or restricted storage modes.
  }

  return next;
}

function readStoredMemory(): WebAutoSaveMemory | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_AUTO_SAVE_MEMORY_KEY);

    return raw ? (JSON.parse(raw) as WebAutoSaveMemory) : undefined;
  } catch {
    return undefined;
  }
}
