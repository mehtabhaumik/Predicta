import type {
  KundliData,
  SavedKundliRecord,
  SavedKundliSummary,
} from '../../types/astrology';
import { saveKundliForUser } from '../firebase/kundliPersistence';
import {
  deleteLocalKundli,
  loadLocalKundlis,
  saveLocalKundlis,
  upsertLocalKundli,
} from '../storage/localKundliStorage';

export const GUEST_KUNDLI_LIMIT = 1;

export class KundliStorageLimitError extends Error {
  constructor() {
    super(
      'You can keep one Kundli without signing in. Sign in before adding another Kundli so your saved charts stay protected.',
    );
    this.name = 'KundliStorageLimitError';
  }
}

export function buildSavedKundliRecord(
  kundli: KundliData,
  syncStatus: SavedKundliSummary['syncStatus'] = 'LOCAL_ONLY',
): SavedKundliRecord {
  const now = new Date().toISOString();

  return {
    kundliData: kundli,
    summary: {
      birthDate: kundli.birthDetails.date,
      birthPlace: kundli.birthDetails.place,
      birthTime: kundli.birthDetails.time,
      createdAt: now,
      id: kundli.id,
      lagna: kundli.lagna,
      moonSign: kundli.moonSign,
      nakshatra: kundli.nakshatra,
      name: kundli.birthDetails.name,
      syncStatus,
      updatedAt: now,
    },
  };
}

export async function saveGeneratedKundliLocally(
  kundli: KundliData,
  options: {
    isLoggedIn?: boolean;
    isUpdate?: boolean;
  } = {},
): Promise<SavedKundliRecord[]> {
  const current = await loadLocalKundlis();
  const existing = current.find(
    record =>
      record.summary.id === kundli.id ||
      haveSameBirthSignature(record.kundliData, kundli),
  );

  if (
    !options.isLoggedIn &&
    !options.isUpdate &&
    !existing &&
    current.length >= GUEST_KUNDLI_LIMIT
  ) {
    throw new KundliStorageLimitError();
  }

  const record = buildSavedKundliRecord(
    existing && existing.summary.id !== kundli.id
      ? {
          ...kundli,
          editHistory: kundli.editHistory ?? existing.kundliData.editHistory,
          id: existing.summary.id,
        }
      : kundli,
    existing?.summary.syncStatus ?? 'LOCAL_ONLY',
  );

  if (existing) {
    const next = [
      record,
      ...current.filter(item => item.summary.id !== existing.summary.id),
    ];
    await saveLocalKundlis(next);
    return next;
  }

  return upsertLocalKundli(record);
}

export async function listSavedKundlis(): Promise<SavedKundliRecord[]> {
  return loadLocalKundlis();
}

export async function deleteSavedKundli(
  kundliId: string,
): Promise<SavedKundliRecord[]> {
  return deleteLocalKundli(kundliId);
}

export async function saveKundliToCloud(
  userId: string,
  kundli: KundliData,
): Promise<SavedKundliRecord[]> {
  const cloudRecord = await saveKundliForUser({ uid: userId }, kundli);
  return upsertLocalKundli(
    buildSavedKundliRecord(cloudRecord.kundliData, 'CLOUD_SYNCED'),
  );
}

function haveSameBirthSignature(first: KundliData, second: KundliData): boolean {
  return birthSignature(first) === birthSignature(second);
}

function birthSignature(kundli: KundliData): string {
  const details = kundli.birthDetails;

  return [
    details.name.trim().toLowerCase(),
    details.date,
    details.time,
    details.place.trim().toLowerCase(),
    details.timezone,
  ].join('|');
}
