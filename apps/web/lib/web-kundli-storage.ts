'use client';

import type { BirthDetails, KundliData } from '@pridicta/types';

const ACTIVE_KUNDLI_KEY = 'pridicta.activeKundli.v1';
const SAVED_KUNDLIS_KEY = 'pridicta.savedKundlis.v1';
export const WEB_KUNDLI_UPDATED_EVENT = 'pridicta:web-kundli-updated';

export async function generateKundliFromWeb(
  details: BirthDetails,
): Promise<KundliData> {
  const response = await fetch('/api/generate-kundli', {
    body: JSON.stringify(details),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const kundli = (await response.json()) as KundliData;
  saveWebKundli(kundli);

  return kundli;
}

export function loadWebKundli(): KundliData | undefined {
  try {
    const raw = localStorage.getItem(ACTIVE_KUNDLI_KEY);

    return raw ? (JSON.parse(raw) as KundliData) : undefined;
  } catch {
    return undefined;
  }
}

export function loadWebKundlis(): KundliData[] {
  try {
    const raw = localStorage.getItem(SAVED_KUNDLIS_KEY);

    return raw ? (JSON.parse(raw) as KundliData[]) : [];
  } catch {
    return [];
  }
}

export function saveWebKundli(kundli: KundliData): void {
  localStorage.setItem(ACTIVE_KUNDLI_KEY, JSON.stringify(kundli));
  const saved = loadWebKundlis();
  const next = [kundli, ...saved.filter(item => item.id !== kundli.id)];
  localStorage.setItem(SAVED_KUNDLIS_KEY, JSON.stringify(next));
  notifyWebKundliUpdated();
}

export function setActiveWebKundli(kundli: KundliData): void {
  localStorage.setItem(ACTIVE_KUNDLI_KEY, JSON.stringify(kundli));
  notifyWebKundliUpdated();
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };

    return typeof payload.detail === 'string'
      ? payload.detail
      : 'Kundli calculation failed. Please check the birth details.';
  } catch {
    return 'Kundli calculation failed. Please check the birth details.';
  }
}

function notifyWebKundliUpdated(): void {
  try {
    window.dispatchEvent(new Event(WEB_KUNDLI_UPDATED_EVENT));
  } catch {
    // Storage still succeeds if same-tab listeners cannot be notified.
  }
}
