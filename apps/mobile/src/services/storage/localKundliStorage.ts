import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavedKundliRecord } from '../../types/astrology';

const SAVED_KUNDLIS_KEY = 'pridicta.savedKundlis.v1';

export async function loadLocalKundlis(): Promise<SavedKundliRecord[]> {
  const raw = await AsyncStorage.getItem(SAVED_KUNDLIS_KEY);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as SavedKundliRecord[];
}

export async function saveLocalKundlis(
  records: SavedKundliRecord[],
): Promise<void> {
  await AsyncStorage.setItem(SAVED_KUNDLIS_KEY, JSON.stringify(records));
}

export async function upsertLocalKundli(
  record: SavedKundliRecord,
): Promise<SavedKundliRecord[]> {
  const current = await loadLocalKundlis();
  const next = [
    record,
    ...current.filter(item => item.summary.id !== record.summary.id),
  ];
  await saveLocalKundlis(next);
  return next;
}

export async function deleteLocalKundli(
  kundliId: string,
): Promise<SavedKundliRecord[]> {
  const current = await loadLocalKundlis();
  const next = current.filter(item => item.summary.id !== kundliId);
  await saveLocalKundlis(next);
  return next;
}
