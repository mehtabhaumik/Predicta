import type {
  KundliData,
  SavedKundliRecord,
  SavedKundliSummary,
} from '../../types/astrology';
import { saveKundliForUser } from '../firebase/kundliPersistence';
import {
  deleteLocalKundli,
  loadLocalKundlis,
  upsertLocalKundli,
} from '../storage/localKundliStorage';

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
): Promise<SavedKundliRecord[]> {
  return upsertLocalKundli(buildSavedKundliRecord(kundli));
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
