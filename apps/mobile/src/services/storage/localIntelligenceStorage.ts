import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyIntelligence, WeeklyIntelligence } from '@pridicta/types';

const DAILY_KEY = 'predicta.dailyIntelligence.v1';
const WEEKLY_KEY = 'predicta.weeklyIntelligence.v1';

type DailyStore = Record<string, DailyIntelligence>;
type WeeklyStore = Record<string, WeeklyIntelligence>;

export async function loadCachedDailyIntelligence(
  cacheKey: string,
): Promise<DailyIntelligence | undefined> {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  const store = raw ? (JSON.parse(raw) as DailyStore) : {};

  return store[cacheKey];
}

export async function saveCachedDailyIntelligence(
  insight: DailyIntelligence,
): Promise<void> {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  const store = raw ? (JSON.parse(raw) as DailyStore) : {};

  await AsyncStorage.setItem(
    DAILY_KEY,
    JSON.stringify({
      ...store,
      [insight.cacheKey]: insight,
    }),
  );
}

export async function loadCachedWeeklyIntelligence(
  cacheKey: string,
): Promise<WeeklyIntelligence | undefined> {
  const raw = await AsyncStorage.getItem(WEEKLY_KEY);
  const store = raw ? (JSON.parse(raw) as WeeklyStore) : {};

  return store[cacheKey];
}

export async function saveCachedWeeklyIntelligence(
  insight: WeeklyIntelligence,
): Promise<void> {
  const raw = await AsyncStorage.getItem(WEEKLY_KEY);
  const store = raw ? (JSON.parse(raw) as WeeklyStore) : {};

  await AsyncStorage.setItem(
    WEEKLY_KEY,
    JSON.stringify({
      ...store,
      [insight.cacheKey]: insight,
    }),
  );
}
