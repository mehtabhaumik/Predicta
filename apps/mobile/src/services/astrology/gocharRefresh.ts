import type { KundliData } from '../../types/astrology';
import { generateKundli } from './astroEngine';

const refreshes = new Map<string, Promise<KundliData>>();
const recentAttempts = new Map<string, number>();

export function isKundliGocharFreshToday(kundli?: KundliData): boolean {
  if (!kundli) {
    return true;
  }

  const calculatedAt =
    kundli.transits?.[0]?.calculatedAt ?? kundli.calculationMeta?.calculatedAt;

  return calculatedAt ? getLocalDateKey(calculatedAt) === getLocalDateKey() : false;
}

export async function refreshKundliGocharIfNeeded(
  kundli?: KundliData,
): Promise<KundliData | undefined> {
  if (!kundli || isKundliGocharFreshToday(kundli)) {
    return kundli;
  }

  const refreshKey = `${kundli.id}:${getLocalDateKey()}`;
  const existing = refreshes.get(refreshKey);

  if (existing) {
    return existing;
  }

  const recentAttempt = recentAttempts.get(refreshKey) ?? 0;

  if (Date.now() - recentAttempt < 5 * 60 * 1000) {
    return kundli;
  }

  const refresh = generateKundli(kundli.birthDetails, { ignoreCache: true })
    .then(nextKundli => {
      recentAttempts.set(refreshKey, Date.now());
      return nextKundli;
    })
    .catch(() => {
      recentAttempts.set(refreshKey, Date.now());
      return kundli;
    })
    .finally(() => {
      refreshes.delete(refreshKey);
    });

  refreshes.set(refreshKey, refresh);

  return refresh;
}

function getLocalDateKey(value?: string): string {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return getLocalDateKey();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
