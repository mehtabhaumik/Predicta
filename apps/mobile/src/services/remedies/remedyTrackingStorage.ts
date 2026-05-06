import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RemedyPracticeStatus } from '../../types/astrology';

const REMEDY_TRACKING_KEY = 'pridicta.remedyTracking.v1';

export type StoredRemedyTracking = Record<string, RemedyPracticeStatus>;

export async function loadRemedyTracking(
  kundliId?: string,
): Promise<StoredRemedyTracking> {
  if (!kundliId) {
    return {};
  }

  const raw = await AsyncStorage.getItem(`${REMEDY_TRACKING_KEY}.${kundliId}`);
  return raw ? (JSON.parse(raw) as StoredRemedyTracking) : {};
}

export async function saveRemedyTracking(
  kundliId: string,
  tracking: StoredRemedyTracking,
): Promise<void> {
  await AsyncStorage.setItem(
    `${REMEDY_TRACKING_KEY}.${kundliId}`,
    JSON.stringify(tracking),
  );
}

export async function markRemedyDone(
  kundliId: string,
  remedyId: string,
  current: StoredRemedyTracking,
  completedAt = new Date().toISOString(),
): Promise<StoredRemedyTracking> {
  const dayKey = completedAt.slice(0, 10);
  const previous = current[remedyId];
  const completedDates = [
    ...new Set([...(previous?.completedDates ?? []), dayKey]),
  ].sort();
  const next = {
    ...current,
    [remedyId]: {
      completedDates,
      lastCompletedAt: completedAt,
      remedyId,
    },
  };

  await saveRemedyTracking(kundliId, next);
  return next;
}
