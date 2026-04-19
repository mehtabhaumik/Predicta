import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildCompatibilityCacheKey,
  buildCompatibilityPairKey,
  buildCompatibilityReport,
  resolveCompatibilityAccess,
} from '@pridicta/astrology';
import { hasCompatibilityReportCredit } from '@pridicta/monetization';
import type { KundliData, OneTimeEntitlement } from '@pridicta/types';

import {
  loadCachedCompatibilityReport,
  saveCachedCompatibilityReport,
} from '../src/services/storage/localCompatibilityStorage';

function kundli(id: string, name: string, moonSign = 'Taurus'): KundliData {
  return {
    ashtakavarga: {
      bav: {},
      sav: [27, 31, 26, 29, 34, 22, 28, 24, 33, 35, 30, 25],
      strongestHouses: [10, 5, 9],
      totalScore: 344,
      weakestHouses: [6, 8, 12],
    },
    birthDetails: {
      date: '1994-08-16',
      latitude: 19.076,
      longitude: 72.8777,
      name,
      place: 'Mumbai, Maharashtra, India',
      time: '06:42',
      timezone: 'Asia/Kolkata',
    },
    calculationMeta: {
      ayanamsa: 'LAHIRI',
      calculatedAt: '2026-04-18T00:00:00.000Z',
      houseSystem: 'WHOLE_SIGN',
      inputHash: `${id}-input-hash`,
      nodeType: 'TRUE_NODE',
      provider: 'swiss-ephemeris',
      utcDateTime: '1994-08-16T01:12:00.000Z',
      zodiac: 'SIDEREAL',
    },
    charts: {} as KundliData['charts'],
    dasha: {
      current: {
        antardasha: 'Mercury',
        endDate: '2027-06-01',
        mahadasha: id === 'a' ? 'Saturn' : 'Rahu',
        startDate: '2024-01-01',
      },
      timeline: [],
    },
    houses: [],
    id,
    lagna: id === 'a' ? 'Leo' : 'Libra',
    moonSign,
    nakshatra: id === 'a' ? 'Rohini' : 'Pushya',
    planets: [],
    yogas: [],
  };
}

describe('Compatibility Intelligence', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem('predicta.compatibilityReports.v1');
  });

  it('builds stable pair and cache keys regardless of selection order', () => {
    const first = kundli('a', 'First');
    const second = kundli('b', 'Second', 'Cancer');

    expect(buildCompatibilityPairKey(first.id, second.id)).toBe(
      buildCompatibilityPairKey(second.id, first.id),
    );
    expect(buildCompatibilityCacheKey(first, second)).toBe(
      buildCompatibilityCacheKey(second, first),
    );
  });

  it('does not invent Ashtakoota scores when verified engine data is unavailable', () => {
    const report = buildCompatibilityReport({
      hasFullAccess: true,
      partnerKundli: kundli('b', 'Second', 'Cancer'),
      primaryKundli: kundli('a', 'First'),
    });

    expect(report.ashtakoota.available).toBe(false);
    expect(report.ashtakoota.totalScore).toBeUndefined();
    expect(report.ashtakoota.kootas.every(koota => !koota.available)).toBe(true);
  });

  it('gates full compatibility depth behind access', () => {
    expect(resolveCompatibilityAccess({ hasFullAccess: false })).toMatchObject({
      canViewFullReport: false,
      depth: 'FREE',
    });
    expect(resolveCompatibilityAccess({ hasFullAccess: true })).toMatchObject({
      canViewFullReport: true,
      depth: 'FULL',
    });
  });

  it('recognizes one-time compatibility report entitlement', () => {
    const entitlement: OneTimeEntitlement = {
      kundliId: 'a__b',
      productId: 'one_time_marriage_compatibility_report',
      productType: 'MARRIAGE_COMPATIBILITY_REPORT',
      purchasedAt: '2026-04-18T00:00:00.000Z',
      remainingUses: 1,
      source: 'mock',
    };

    expect(hasCompatibilityReportCredit([entitlement], 'a__b')).toBe(true);
    expect(hasCompatibilityReportCredit([entitlement], 'other')).toBe(false);
  });

  it('stores generated compatibility reports locally by cache key', async () => {
    const report = buildCompatibilityReport({
      hasFullAccess: false,
      partnerKundli: kundli('b', 'Second', 'Cancer'),
      primaryKundli: kundli('a', 'First'),
    });

    await saveCachedCompatibilityReport(report);

    expect(await loadCachedCompatibilityReport(report.cacheKey)).toMatchObject({
      cacheKey: report.cacheKey,
      depth: 'FREE',
    });
  });
});
