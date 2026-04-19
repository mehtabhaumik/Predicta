import {
  buildDailyIntelligence,
  buildDailyIntelligenceCacheKey,
  buildWeeklyIntelligence,
  buildWeeklyIntelligenceCacheKey,
  shouldConsumeIntelligenceQuota,
} from '@pridicta/astrology';
import { buildDailyWeeklyAIContext } from '@pridicta/ai';
import type { KundliData } from '@pridicta/types';

function kundli(): KundliData {
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
      inputHash: 'daily-weekly-input-hash',
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
    houses: Array.from({ length: 12 }, (_, index) => ({
      house: index + 1,
      lord: 'Sun',
      planets: index === 9 ? ['Saturn'] : [],
      sign: 'Leo',
    })),
    id: 'daily-weekly-kundli',
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Rohini',
    planets: [],
    yogas: [],
  };
}

describe('daily and weekly intelligence', () => {
  it('builds stable daily and weekly cache keys', () => {
    const chart = kundli();
    const date = new Date('2026-04-18T00:00:00.000Z');

    expect(buildDailyIntelligenceCacheKey(chart, date)).toBe(
      buildDailyIntelligenceCacheKey(chart, date),
    );
    expect(buildWeeklyIntelligenceCacheKey(chart, date)).toBe(
      buildWeeklyIntelligenceCacheKey(chart, new Date('2026-04-19T00:00:00.000Z')),
    );
  });

  it('returns the expected Today shape without live AI', () => {
    const daily = buildDailyIntelligence({
      date: new Date('2026-04-18T00:00:00.000Z'),
      generatedAt: '2026-04-18T00:00:00.000Z',
      kundli: kundli(),
    });

    expect(daily).toMatchObject({
      dateKey: '2026-04-18',
      depth: 'FREE',
      kundliId: 'daily-weekly-kundli',
    });
    expect(daily.practicalAction.length).toBeGreaterThan(20);
    expect(daily.avoid).not.toContain('guarantee');
  });

  it('gates weekly depth while keeping deterministic fallback content', () => {
    const free = buildWeeklyIntelligence({
      date: new Date('2026-04-18T00:00:00.000Z'),
      kundli: kundli(),
    });
    const expanded = buildWeeklyIntelligence({
      date: new Date('2026-04-18T00:00:00.000Z'),
      depth: 'EXPANDED',
      kundli: kundli(),
    });

    expect(free.premiumSynthesis).toBeUndefined();
    expect(expanded.premiumSynthesis).toContain('patient progress');
    expect(expanded.importantDateWindows).toHaveLength(3);
  });

  it('keeps cached/template intelligence out of usage quota', () => {
    expect(
      shouldConsumeIntelligenceQuota({
        cacheHit: true,
        generationMode: 'ai',
      }),
    ).toMatchObject({ consumesQuota: false, reason: 'cache_hit' });
    expect(
      shouldConsumeIntelligenceQuota({
        cacheHit: false,
        generationMode: 'template',
      }),
    ).toMatchObject({ consumesQuota: false, reason: 'template_generated' });
    expect(
      shouldConsumeIntelligenceQuota({
        cacheHit: false,
        generationMode: 'ai',
      }),
    ).toMatchObject({ consumesQuota: true, reason: 'ai_generated' });
  });

  it('builds compact AI context for future premium synthesis', () => {
    const daily = buildDailyIntelligence({ kundli: kundli() });
    const weekly = buildWeeklyIntelligence({
      depth: 'EXPANDED',
      kundli: kundli(),
    });
    const context = buildDailyWeeklyAIContext({ daily, weekly });

    expect(context.daily.chartBasisSummary).toContain('Saturn/Mercury');
    expect(context.weekly?.importantDateWindows).toHaveLength(3);
    expect(JSON.stringify(context)).not.toContain('charts');
  });
});
