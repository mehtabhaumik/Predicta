'use client';

import type { AuthState } from '@pridicta/types';

const WEB_GUEST_SESSION_KEY = 'pridicta.webGuestSession.v1';
const LEGACY_WEB_USER_ID_KEY = 'pridicta.webUserId.v1';
const WEB_DEVICE_ID_KEY = 'pridicta.webDeviceId.v1';

export const WEB_GUEST_SESSION_UPDATED_EVENT =
  'pridicta:web-guest-session-updated';

export type WebGuestSession = {
  createdAt: string;
  deviceId: string;
  guestProfileId: string;
  lastSeenAt: string;
  schemaVersion: 1;
};

export function getOrCreateWebGuestSession(): WebGuestSession {
  const existing = readWebGuestSession();

  if (existing) {
    return touchWebGuestSession(existing);
  }

  const now = new Date().toISOString();
  const legacyUserId = readString(LEGACY_WEB_USER_ID_KEY);
  const session: WebGuestSession = {
    createdAt: now,
    deviceId: getOrCreateBrowserDeviceId(),
    guestProfileId: legacyUserId || createLocalId('guest'),
    lastSeenAt: now,
    schemaVersion: 1,
  };

  writeWebGuestSession(session);
  return session;
}

export function getWebGuestAuthState(): AuthState {
  const session = getOrCreateWebGuestSession();

  return {
    email: 'guest@predicta.local',
    isLoggedIn: false,
    provider: null,
    userId: session.guestProfileId,
  };
}

export function getWebGuestProfileId(): string {
  return getOrCreateWebGuestSession().guestProfileId;
}

export function getOrCreateBrowserDeviceId(): string {
  const existing = readString(WEB_DEVICE_ID_KEY);

  if (existing) {
    return existing;
  }

  const next = createLocalId('browser');
  writeString(WEB_DEVICE_ID_KEY, next);
  return next;
}

export function readWebGuestSession(): WebGuestSession | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_GUEST_SESSION_KEY);

    return raw ? (JSON.parse(raw) as WebGuestSession) : undefined;
  } catch {
    return undefined;
  }
}

function touchWebGuestSession(session: WebGuestSession): WebGuestSession {
  const next: WebGuestSession = {
    ...session,
    deviceId: session.deviceId || getOrCreateBrowserDeviceId(),
    lastSeenAt: new Date().toISOString(),
  };

  writeWebGuestSession(next);
  return next;
}

function writeWebGuestSession(session: WebGuestSession): void {
  try {
    window.localStorage.setItem(WEB_GUEST_SESSION_KEY, JSON.stringify(session));
    window.localStorage.setItem(LEGACY_WEB_USER_ID_KEY, session.guestProfileId);
    window.localStorage.setItem(WEB_DEVICE_ID_KEY, session.deviceId);
    window.dispatchEvent(new Event(WEB_GUEST_SESSION_UPDATED_EVENT));
  } catch {
    // Guest continuity is best-effort if browser storage is unavailable.
  }
}

function readString(key: string): string | undefined {
  try {
    return window.localStorage.getItem(key) || undefined;
  } catch {
    return undefined;
  }
}

function writeString(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Best-effort local identity only.
  }
}

function createLocalId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  return `${prefix}-${random}`;
}
