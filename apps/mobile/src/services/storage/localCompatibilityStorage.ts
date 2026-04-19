import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CompatibilityReport } from '@pridicta/types';

const COMPATIBILITY_REPORTS_KEY = 'predicta.compatibilityReports.v1';

type CompatibilityReportStore = Record<string, CompatibilityReport>;

export async function loadCachedCompatibilityReport(
  cacheKey: string,
): Promise<CompatibilityReport | undefined> {
  const raw = await AsyncStorage.getItem(COMPATIBILITY_REPORTS_KEY);
  const store = raw ? (JSON.parse(raw) as CompatibilityReportStore) : {};

  return store[cacheKey];
}

export async function saveCachedCompatibilityReport(
  report: CompatibilityReport,
): Promise<void> {
  const raw = await AsyncStorage.getItem(COMPATIBILITY_REPORTS_KEY);
  const store = raw ? (JSON.parse(raw) as CompatibilityReportStore) : {};

  await AsyncStorage.setItem(
    COMPATIBILITY_REPORTS_KEY,
    JSON.stringify({
      ...store,
      [report.cacheKey]: report,
    }),
  );
}
