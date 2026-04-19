import {
  buildReportCacheKey,
  composeReportSections,
  decideReportEntitlement,
  getReportProduct,
  getReportProducts,
} from '@pridicta/pdf';
import type { KundliData } from '@pridicta/types';

function kundli(inputHash = 'report-input-hash'): KundliData {
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
      name: 'Predicta Seeker',
      place: 'Mumbai, Maharashtra, India',
      time: '06:42',
      timezone: 'Asia/Kolkata',
    },
    calculationMeta: {
      ayanamsa: 'LAHIRI',
      calculatedAt: '2026-04-18T00:00:00.000Z',
      houseSystem: 'WHOLE_SIGN',
      inputHash,
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
        mahadasha: 'Saturn',
        startDate: '2024-01-01',
      },
      timeline: [],
    },
    houses: [],
    id: 'report-kundli',
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Rohini',
    planets: [],
    yogas: [],
  };
}

describe('Report Studio', () => {
  it('exposes available report products without enabling compatibility early', () => {
    expect(getReportProducts().map(product => product.id)).toEqual(
      expect.arrayContaining([
        'FREE_KUNDLI_SUMMARY',
        'PREMIUM_KUNDLI_REPORT',
        'DETAILED_KUNDLI_DOSSIER',
        'LIFE_TIMELINE_REPORT',
        'ANNUAL_GUIDANCE_REPORT',
        'COMPATIBILITY_REPORT',
      ]),
    );
    expect(getReportProduct('COMPATIBILITY_REPORT')).toMatchObject({
      available: false,
    });
  });

  it('keeps free reports included and premium reports locked without access', () => {
    expect(
      decideReportEntitlement({
        hasPremiumAccess: false,
        kundli: kundli(),
        oneTimeEntitlements: [],
        reportType: 'FREE_KUNDLI_SUMMARY',
      }),
    ).toMatchObject({ canGenerate: true, reason: 'FREE_INCLUDED' });
    expect(
      decideReportEntitlement({
        hasPremiumAccess: false,
        kundli: kundli(),
        oneTimeEntitlements: [],
        reportType: 'ANNUAL_GUIDANCE_REPORT',
      }),
    ).toMatchObject({ canGenerate: false, reason: 'LOCKED' });
  });

  it('allows paid report generation with a matching one-time credit', () => {
    expect(
      decideReportEntitlement({
        hasPremiumAccess: false,
        kundli: kundli(),
        oneTimeEntitlements: [
          {
            productId: 'pridicta_annual_guidance_report',
            productType: 'ANNUAL_GUIDANCE_REPORT',
            purchasedAt: '2026-04-18T00:00:00.000Z',
            remainingUses: 1,
            source: 'mock',
          },
        ],
        reportType: 'ANNUAL_GUIDANCE_REPORT',
      }),
    ).toMatchObject({ canGenerate: true, reason: 'ONE_TIME_CREDIT' });
  });

  it('uses kundli input and report type in stable report cache keys', () => {
    const first = buildReportCacheKey({
      kundli: kundli('hash-a'),
      mode: 'PREMIUM',
      reportType: 'PREMIUM_KUNDLI_REPORT',
    });
    const second = buildReportCacheKey({
      kundli: kundli('hash-b'),
      mode: 'PREMIUM',
      reportType: 'PREMIUM_KUNDLI_REPORT',
    });
    const third = buildReportCacheKey({
      kundli: kundli('hash-a'),
      mode: 'PREMIUM',
      reportType: 'ANNUAL_GUIDANCE_REPORT',
    });

    expect(first).toBe(
      buildReportCacheKey({
        kundli: kundli('hash-a'),
        mode: 'PREMIUM',
        reportType: 'PREMIUM_KUNDLI_REPORT',
      }),
    );
    expect(first).not.toBe(second);
    expect(first).not.toBe(third);
  });

  it('composes free and premium sections with the same design promise', () => {
    const free = composeReportSections({
      kundli: kundli(),
      mode: 'FREE',
      reportType: 'FREE_KUNDLI_SUMMARY',
    });
    const premium = composeReportSections({
      kundli: kundli(),
      mode: 'PREMIUM',
      reportType: 'DETAILED_KUNDLI_DOSSIER',
    });

    expect(free.sections.at(-1)?.title).toBe('Design Promise');
    expect(premium.sections.length).toBeGreaterThan(free.sections.length);
    expect(premium.sections.at(-1)?.body).toContain(
      'premium visual quality',
    );
  });
});
