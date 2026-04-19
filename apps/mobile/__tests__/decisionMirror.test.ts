import {
  buildDecisionMirrorCacheKey,
  buildDecisionMirrorResponse,
  detectDecisionIntent,
  getDecisionMirrorDepth,
  selectDecisionMirrorPlan,
  validateDecisionMirrorResponse,
} from '@pridicta/ai';
import type { ChartContext, KundliData } from '@pridicta/types';

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
      inputHash: 'decision-input-hash',
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
    id: 'decision-kundli',
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Rohini',
    planets: [],
    yogas: [],
  };
}

const chartContext: ChartContext = {
  chartType: 'D10',
  sourceScreen: 'Charts',
};

describe('Decision Mirror', () => {
  it('detects decision questions without treating every question as a decision', () => {
    expect(
      detectDecisionIntent('Should I accept this job offer?', chartContext),
    ).toMatchObject({
      isDecisionQuestion: true,
      suggestedDepth: 'EXPANDED',
    });
    expect(detectDecisionIntent('What is my moon sign?')).toMatchObject({
      isDecisionQuestion: false,
    });
  });

  it('builds a valid non-certain response schema', () => {
    const response = buildDecisionMirrorResponse({
      chartContext,
      depth: 'EXPANDED',
      generatedAt: '2026-04-18T00:00:00.000Z',
      kundli: kundli(),
      question: 'Should I accept this bigger role?',
    });

    expect(validateDecisionMirrorResponse(response)).toBe(true);
    expect(response.supportiveChartFactors.length).toBeGreaterThan(2);
    expect(response.disclaimer).toContain('not certainty');
    expect(response.decisionSummary).not.toContain('guaranteed');
  });

  it('gates expanded depth behind premium access', () => {
    expect(
      getDecisionMirrorDepth({
        chartContext,
        hasPremiumAccess: false,
        question: 'Should I relocate for my career?',
      }),
    ).toBe('FREE');
    expect(
      getDecisionMirrorDepth({
        chartContext,
        hasPremiumAccess: true,
        question: 'Should I relocate for my career?',
      }),
    ).toBe('EXPANDED');
    expect(selectDecisionMirrorPlan({ depth: 'FREE', userPlan: 'PREMIUM' })).toBe(
      'FREE',
    );
  });

  it('includes kundli and chart context in the decision cache key', () => {
    const chart = kundli();
    const first = buildDecisionMirrorCacheKey({
      chartContext,
      depth: 'FREE',
      kundli: chart,
      question: 'Should I accept this offer?',
    });
    const second = buildDecisionMirrorCacheKey({
      chartContext: { chartType: 'D9', sourceScreen: 'Charts' },
      depth: 'FREE',
      kundli: chart,
      question: 'Should I accept this offer?',
    });

    expect(first).toBe(
      buildDecisionMirrorCacheKey({
        chartContext,
        depth: 'FREE',
        kundli: chart,
        question: ' should i accept this offer? ',
      }),
    );
    expect(first).not.toBe(second);
  });
});
