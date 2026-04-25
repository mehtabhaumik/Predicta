import {
  buildAstrologyReasoningContext,
  buildPredictaIntelligenceContext,
  buildPredictaUserPrompt,
  detectPredictaIntent,
  getConversationSummary,
  guardPredictaResponse,
  updateUserAstrologyMemory,
} from '@pridicta/ai';
import type { ConversationTurn, KundliData } from '../src/types/astrology';

const kundli = {
  id: 'kundli-1',
  birthDetails: {
    date: '1994-08-16',
    latitude: 19.076,
    longitude: 72.8777,
    name: 'Predicta Seeker',
    place: 'Mumbai, Maharashtra, India',
    time: '06:42',
    timezone: 'Asia/Kolkata',
  },
  lagna: 'Leo',
  moonSign: 'Taurus',
  nakshatra: 'Rohini',
  planets: [],
  houses: [],
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
  ashtakavarga: {
    bav: {},
    sav: [],
    totalScore: 344,
    strongestHouses: [10, 5, 9],
    weakestHouses: [6, 8, 12],
  },
  yogas: [],
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
} as KundliData;

describe('predicta intelligence architecture', () => {
  it('detects follow-up relationship timing intent from short prompt', () => {
    const history: ConversationTurn[] = [
      { role: 'user', text: 'Will I get married?' },
    ];
    const result = detectPredictaIntent({
      history,
      message: 'When?',
    });

    expect(result.isFollowUp).toBe(true);
    expect(result.primaryIntent).toBe('marriage');
  });

  it('updates memory from split birth details and summarizes conversation', () => {
    const history: ConversationTurn[] = [
      { role: 'user', text: 'DOB: 22/08/1980' },
      { role: 'user', text: 'Time: 06:30 am, Place: Petlad, India' },
      { role: 'pridicta', text: 'I have enough to move toward the chart step.' },
    ];

    const memory = updateUserAstrologyMemory({
      history,
      message: 'Will marriage be delayed for me?',
    });

    expect(memory.birthDetails?.date).toBe('22/08/1980');
    expect(memory.birthDetails?.time).toBe('06:30 am');
    expect(memory.birthDetails?.place).toBe('Petlad, India');
    expect(getConversationSummary(memory, history)).toContain('Current focus: marriage');
  });

  it('builds marriage reasoning with D1 and D9', () => {
    const reasoning = buildAstrologyReasoningContext({
      intentProfile: {
        citedSignals: ['marriage_keywords'],
        confidence: 0.8,
        emotionalTone: 'hopeful',
        isFollowUp: false,
        primaryIntent: 'marriage',
        secondaryIntents: ['prediction_timing'],
      },
    });

    expect(reasoning.primaryCharts).toContain('D1');
    expect(reasoning.primaryCharts).toContain('D9');
    expect(reasoning.shouldUseDasha).toBe(true);
  });

  it('builds a prompt bundle with memory, intent, and reasoning context', () => {
    const intelligenceContext = buildPredictaIntelligenceContext({
      history: [{ role: 'user', text: 'Will my career settle this year?' }],
      kundli,
      message: 'What timing do you see?',
    });

    const prompt = buildPredictaUserPrompt({
      compactContext: '{"birthSummary":"demo"}',
      history: [{ role: 'user', text: 'Will my career settle this year?' }],
      intelligenceContext,
      message: 'What timing do you see?',
    });

    expect(prompt).toContain('Predicta working memory:');
    expect(prompt).toContain('Intent and emotional reading:');
    expect(prompt).toContain('Astrology reasoning context:');
    expect(prompt).toContain('User question: What timing do you see?');
  });

  it('guards repeated robotic openings', () => {
    const text = guardPredictaResponse({
      history: [
        { role: 'pridicta', text: 'Based on your chart, this is a career-pressure phase.' },
      ],
      intentProfile: {
        citedSignals: [],
        confidence: 0.7,
        emotionalTone: 'anxious',
        isFollowUp: false,
        primaryIntent: 'career',
        secondaryIntents: [],
      },
      text: 'Based on your chart, this is a career-pressure phase.',
    });

    expect(text).not.toMatch(/^Based on your chart/i);
  });
});
