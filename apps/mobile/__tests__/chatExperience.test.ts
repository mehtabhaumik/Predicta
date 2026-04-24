import {
  buildNoKundliResponse,
  buildLocalPredictaFallback,
  buildPredictaWaitingMessage,
  buildSmallTalkResponse,
  getRandomPredictaIntro,
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

    expect(response).toContain('Hello. I’m here.');
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
    expect(
      buildPredictaWaitingMessage('Please analyze my chart', undefined, {
        hasKundli: false,
      }),
    ).toBe('Getting clear on what you want to explore first...');
  });

  it('uses the small-talk path in the local fallback builder', () => {
    const response = buildLocalPredictaFallback('hello', kundli, chartContext);

    expect(response).toContain('Hello. I’m here.');
    expect(response).not.toContain('ashtakavarga');
  });

  it('does not fake a chart reading when no kundli exists', () => {
    const response = buildLocalPredictaFallback('Please analyze my chart');

    expect(response).toContain('I do not have your kundli yet');
    expect(response).not.toContain('I will begin from D10');
    expect(response).not.toContain('ashtakavarga');
  });

  it('returns varied safe intros', () => {
    const intro = getRandomPredictaIntro();

    expect(intro.length).toBeGreaterThan(20);
    expect(intro).not.toContain('Saturn / Mercury');
    expect(intro).not.toContain('D10');
  });

  it('guides the user to birth details when they ask for a chart without one', () => {
    const response = buildNoKundliResponse('You do not have my chart yet');

    expect(response).toContain('I do not have your kundli yet');
  });

  it('remembers partial birth details across turns', () => {
    const response = buildNoKundliResponse('Time: 06:30 am, Place: Petlad, India', {
      history: [{ role: 'user', text: 'DOB: 22/08/1980' }],
    });

    expect(response).toContain('I now have your');
    expect(response).toContain('date of birth 1980-08-22');
    expect(response).toContain('birth time 06:30');
    expect(response).toContain('birth place Petlad, India');
    expect(response).toContain('create your kundli');
  });

  it('asks only for what is still missing', () => {
    const response = buildNoKundliResponse('DOB: 22/08/1980');

    expect(response).toContain('I now have your date of birth 1980-08-22');
    expect(response).toContain('I still need your birth time and birth place');
  });
});
