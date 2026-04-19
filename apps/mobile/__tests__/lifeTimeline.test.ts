import {
  buildLifeEventHash,
  buildLifeTimelineInsight,
  resolveLifeTimelineAccess,
} from '@pridicta/astrology';
import type { KundliData, LifeEvent } from '@pridicta/types';

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
      inputHash: 'stable-input-hash',
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
      timeline: [
        {
          antardashas: [
            {
              antardasha: 'Venus',
              endDate: '2015-12-31',
              startDate: '2013-01-01',
            },
          ],
          endDate: '2017-12-31',
          mahadasha: 'Jupiter',
          startDate: '2013-01-01',
        },
        {
          antardashas: [
            {
              antardasha: 'Saturn',
              endDate: '2020-12-31',
              startDate: '2018-01-01',
            },
            {
              antardasha: 'Mercury',
              endDate: '2027-06-01',
              startDate: '2021-01-01',
            },
          ],
          endDate: '2037-12-31',
          mahadasha: 'Saturn',
          startDate: '2018-01-01',
        },
      ],
    },
    houses: Array.from({ length: 12 }, (_, index) => ({
      house: index + 1,
      lord: 'Sun',
      planets: index === 9 ? ['Saturn'] : [],
      sign: 'Leo',
    })),
    id: 'test-kundli',
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Rohini',
    planets: [],
    yogas: [],
  };
}

const events: LifeEvent[] = [
  {
    approximateDate: false,
    category: 'CAREER',
    createdAt: '2026-04-18T00:00:00.000Z',
    eventDate: '2021-06-15',
    id: 'career',
    kundliId: 'test-kundli',
    title: 'Career direction shifted',
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
  {
    approximateDate: true,
    category: 'RELOCATION',
    createdAt: '2026-04-18T00:00:00.000Z',
    eventDate: '2024-03-01',
    id: 'relocation',
    kundliId: 'test-kundli',
    title: 'Important relocation',
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
];

describe('life timeline', () => {
  it('maps life events to dasha periods and chart focus', () => {
    const insight = buildLifeTimelineInsight({
      events,
      generatedAt: '2026-04-18T00:00:00.000Z',
      kundli: kundli(),
    });

    expect(insight.mappedEvents).toHaveLength(2);
    expect(insight.mappedEvents[0]).toMatchObject({
      antardasha: 'Mercury',
      confidence: 'high',
      mahadasha: 'Saturn',
      relevantCharts: ['D1', 'D10'],
    });
    expect(insight.previewText).toContain('2 life events mapped');
  });

  it('builds a stable event hash independent of input order', () => {
    const chart = kundli();
    expect(buildLifeEventHash(chart, events)).toBe(
      buildLifeEventHash(chart, [...events].reverse()),
    );
  });

  it('enforces free timeline preview limits', () => {
    expect(
      resolveLifeTimelineAccess({
        eventCount: 3,
        hasPremiumAccess: false,
      }),
    ).toMatchObject({
      canAddMoreEvents: false,
      canViewFullTimeline: false,
      requiresUpgrade: true,
    });
    expect(
      resolveLifeTimelineAccess({
        eventCount: 10,
        hasPremiumAccess: true,
      }),
    ).toMatchObject({
      canAddMoreEvents: true,
      canViewFullTimeline: true,
      requiresUpgrade: false,
    });
  });
});
