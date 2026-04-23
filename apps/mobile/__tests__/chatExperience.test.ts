import {
  buildLocalPredictaFallback,
  buildPredictaWaitingMessage,
  buildSmallTalkResponse,
  isSmallTalkPrompt,
} from '@pridicta/ai';
import type { ChartContext, KundliData } from '../src/types/astrology';

const chartContext: ChartContext = {
  chartName: 'Dashamsha',
  chartType: 'D10',
  purpose: 'Career and responsibility',
  sourceScreen: 'Chat',
};

const kundli: KundliData = {
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
    inputHash: 'demo-input-hash',
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
  id: 'demo-kundli',
  lagna: 'Leo',
  moonSign: 'Taurus',
  nakshatra: 'Rohini',
  planets: [],
  yogas: [],
};

describe('predicta chat experience helpers', () => {
  it('treats plain greetings as small talk', () => {
    expect(isSmallTalkPrompt('Hi Predicta')).toBe(true);
    expect(isSmallTalkPrompt('hello')).toBe(true);
    expect(isSmallTalkPrompt('Hi Predicta, what does my D10 show?')).toBe(false);
  });

  it('returns a non-astrology greeting response for small talk', () => {
    const response = buildSmallTalkResponse('Hi Predicta', {
      chartContext,
      hasKundli: true,
    });

    expect(response).toContain('Hello. I am here.');
    expect(response).toContain('D10');
  });

  it('builds prompt-aware waiting messages', () => {
    expect(buildPredictaWaitingMessage('Hi Predicta', chartContext)).toBe(
      'Listening...',
    );
    expect(
      buildPredictaWaitingMessage(
        'Should I accept a bigger role if it increases pressure?',
        chartContext,
      ),
    ).toBe('Weighing both sides of your question...');
    expect(
      buildPredictaWaitingMessage('What does my D10 show about career growth?', chartContext),
    ).toBe('Checking the D10 signals that matter most...');
  });

  it('uses the small-talk path in the local fallback builder', () => {
    const response = buildLocalPredictaFallback('hello', kundli, chartContext);

    expect(response).toContain('Hello. I am here.');
    expect(response).not.toContain('ashtakavarga');
  });
});
