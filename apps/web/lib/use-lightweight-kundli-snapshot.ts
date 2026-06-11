'use client';

import { useEffect, useState } from 'react';

type LightweightKundliSnapshot = {
  activeKundli?: {
    birthDetails: {
      name: string;
      place: string;
    };
    id?: string;
  };
  savedCount: number;
};

const WEB_KUNDLI_STORE_KEY = 'pridicta.webKundliStore.v1';
const LEGACY_ACTIVE_KUNDLI_KEY = 'pridicta.activeKundli.v1';
const LEGACY_SAVED_KUNDLIS_KEY = 'pridicta.savedKundlis.v1';
const WEB_KUNDLI_UPDATED_EVENT = 'pridicta:web-kundli-updated';

export function useLightweightKundliSnapshot(): LightweightKundliSnapshot {
  const [snapshot, setSnapshot] = useState<LightweightKundliSnapshot>({
    activeKundli: undefined,
    savedCount: 0,
  });

  useEffect(() => {
    function refresh() {
      setSnapshot(readLightweightKundliSnapshot());
    }

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(WEB_KUNDLI_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(WEB_KUNDLI_UPDATED_EVENT, refresh);
    };
  }, []);

  return snapshot;
}

function readLightweightKundliSnapshot(): LightweightKundliSnapshot {
  try {
    const storeRaw = window.localStorage.getItem(WEB_KUNDLI_STORE_KEY);

    if (storeRaw) {
      const store = JSON.parse(storeRaw) as {
        activeKundli?: LightweightKundliSnapshot['activeKundli'];
        activeKundliId?: string;
        savedKundlis?: Array<LightweightKundliSnapshot['activeKundli']>;
      };
      const savedKundlis = (store.savedKundlis ?? []).filter(Boolean);
      const activeKundli =
        savedKundlis.find(item => item?.id === store.activeKundliId) ??
        store.activeKundli ??
        savedKundlis[0];

      return {
        activeKundli: normalizeKundli(activeKundli),
        savedCount: dedupeCount([
          ...savedKundlis,
          ...(store.activeKundli ? [store.activeKundli] : []),
        ]),
      };
    }

    const activeRaw = window.localStorage.getItem(LEGACY_ACTIVE_KUNDLI_KEY);
    const savedRaw = window.localStorage.getItem(LEGACY_SAVED_KUNDLIS_KEY);
    const activeKundli = activeRaw
      ? normalizeKundli(JSON.parse(activeRaw))
      : undefined;
    const savedKundlis = savedRaw ? (JSON.parse(savedRaw) as unknown[]) : [];

    return {
      activeKundli,
      savedCount: dedupeCount([
        ...savedKundlis,
        ...(activeKundli ? [activeKundli] : []),
      ]),
    };
  } catch {
    return {
      activeKundli: undefined,
      savedCount: 0,
    };
  }
}

function normalizeKundli(
  value: unknown,
): LightweightKundliSnapshot['activeKundli'] | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const kundli = value as {
    birthDetails?: {
      name?: unknown;
      place?: unknown;
    };
    id?: unknown;
  };
  const name = typeof kundli.birthDetails?.name === 'string'
    ? kundli.birthDetails.name
    : '';
  const place = typeof kundli.birthDetails?.place === 'string'
    ? kundli.birthDetails.place
    : '';

  if (!name && !place) {
    return undefined;
  }

  return {
    birthDetails: {
      name,
      place,
    },
    id: typeof kundli.id === 'string' ? kundli.id : undefined,
  };
}

function dedupeCount(values: unknown[]): number {
  const seen = new Set<string>();

  for (const value of values) {
    const kundli = normalizeKundli(value);

    if (!kundli) {
      continue;
    }

    seen.add(kundli.id ?? `${kundli.birthDetails.name}|${kundli.birthDetails.place}`);
  }

  return seen.size;
}
