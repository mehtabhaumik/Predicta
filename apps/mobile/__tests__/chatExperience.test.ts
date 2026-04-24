import {
  buildNoKundliResponse,
  buildLocalPredictaFallback,
  buildPredictaWaitingMessage,
  buildSmallTalkResponse,
  getRandomPredictaIntro,
  isSmallTalkPrompt,
  shouldUseLocalNoKundliResponse,
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

    expect(response).toContain('Hello. I’m here, and we can take this one clear step at a time.');
    expect(response).toContain('D10');
  });

  it('builds prompt-aware waiting messages', () => {
    expect(buildPredictaWaitingMessage('Hi Predicta', chartContext)).toBe(
      'Listening...',
    );
    expect(buildPredictaWaitingMessage('Which birthdate do you have?', undefined, {
      hasKundli: false,
    })).toBe('Checking what I already have from you...');
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

    expect(response).toContain('Hello. I’m here, and we can take this one clear step at a time.');
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

  it('gives useful no-kundli guidance for a real life question', () => {
    const response = buildNoKundliResponse('I want to know my finances in coming years');

    expect(response).toContain('We can begin without pretending I already have your chart');
    expect(response).toContain('stability');
    expect(response).toContain('stronger income');
    expect(response).toContain('If you later want this anchored to your actual chart');
  });

  it('responds to grief with more emotional intelligence', () => {
    const response = buildNoKundliResponse(
      'I have been feeling heavy since losing someone close. What do you see in this phase?',
    );

    expect(response).toContain('I am sorry you are carrying that');
    expect(response).toContain('Grief has its own weather');
    expect(response).toContain('heavy, numb, restless, or quietly disoriented');
  });

  it('offers both practical and spiritual remedies when asked', () => {
    const response = buildNoKundliResponse(
      'Give me a remedy for recurring anxiety and mental restlessness.',
    );

    expect(response).toContain('calm both the nervous system and the inner atmosphere');
    expect(response).toContain('reduce stimulation for one hour before sleep');
    expect(response).toContain('Mahadev mantra');
  });

  it('keeps relationship follow-ups inside the same theme', () => {
    const response = buildNoKundliResponse(
      'It is emotional labor. I keep managing the atmosphere and I am exhausted.',
      {
        history: [
          {
            role: 'user',
            text: 'My relationship feels loving but tiring. What am I missing?',
          },
        ],
      },
    );

    expect(response).toContain('the relationship is asking you to regulate more than relate');
    expect(response).toContain('carrying the atmosphere for both of us');
  });

  it('deepens a relationship follow-up instead of restarting', () => {
    const response = buildNoKundliResponse(
      'How do I say this without creating a fight?',
      {
        history: [
          {
            role: 'user',
            text: 'My relationship feels loving but tiring. What am I missing?',
          },
          {
            role: 'user',
            text: 'It is emotional labor. I keep managing the atmosphere and I am exhausted.',
          },
        ],
      },
    );

    expect(response).toContain('Lead with your experience, not your accusation');
    expect(response).toContain('I care about us, but I have been carrying too much of the emotional weight');
  });

  it('deepens grief follow-ups instead of repeating the opener', () => {
    const response = buildNoKundliResponse(
      'It feels more numb than dramatic. I am functioning, but something in me is absent.',
      {
        history: [
          {
            role: 'user',
            text: 'I have been feeling heavy since losing someone close. What do you see in this phase?',
          },
        ],
      },
    );

    expect(response).toContain('That numb, functioning kind of grief often means your system is protecting you');
    expect(response).toContain('one physical anchor each day');
  });

  it('keeps grief weekly follow-ups in the grief lane, not decision mode', () => {
    const response = buildNoKundliResponse('What should I actually do this week?', {
      history: [
        {
          role: 'user',
          text: 'I have been feeling heavy since losing someone close. What do you see in this phase?',
        },
        {
          role: 'user',
          text: 'It feels more numb than dramatic. I am functioning, but something in me is absent.',
        },
      ],
    });

    expect(response).toContain('This week, do not try to solve the whole grief');
    expect(response).toContain('one contained space each day');
  });

  it('keeps a narrowed remedy request precise on follow-up', () => {
    const response = buildNoKundliResponse('Give me one practical remedy and one spiritual remedy only.', {
      history: [
        {
          role: 'user',
          text: 'Give me a remedy for recurring anxiety and mental restlessness.',
        },
        {
          role: 'user',
          text: 'It gets worse at night after conflict.',
        },
      ],
    });

    expect(response).toContain('Practical remedy: after conflict, write one page');
    expect(response).toContain('Spiritual remedy: sit quietly for three minutes');
  });

  it('gives precise follow-up remedies when the user narrows the ask', () => {
    const response = buildNoKundliResponse(
      'Give me one practical remedy and one spiritual remedy only.',
      {
        history: [
          {
            role: 'user',
            text: 'Give me a remedy for recurring anxiety and mental restlessness.',
          },
          {
            role: 'user',
            text: 'It gets worse at night after conflict.',
          },
        ],
      },
    );

    expect(response).toContain('Practical remedy: after conflict, write one page');
    expect(response).toContain('Spiritual remedy: sit quietly for three minutes');
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

  it('answers direct memory questions instead of repeating the same intake line', () => {
    const response = buildNoKundliResponse('Which birthdate do you have?', {
      history: [{ role: 'user', text: 'Place: Petlad, India' }],
    });

    expect(response).toContain('I do not have your date of birth yet');
    expect(response).toContain('birth place Petlad, India');
    expect(response).not.toContain('I can help with a focused life question right away');
  });

  it('trusts only user turns for remembered birth details', () => {
    const response = buildNoKundliResponse('What details do you have?', {
      history: [
        { role: 'pridicta', text: 'I have your birth place as Mumbai.' },
        { role: 'user', text: 'DOB: 22/08/1980' },
      ],
    });

    expect(response).toContain('date of birth 22-08-1980');
    expect(response).not.toContain('Mumbai');
  });

  it('handles the screenshot flow without bluffing or looping', () => {
    const step1 = buildNoKundliResponse('I want to know my finances in coming years');
    const step2 = buildNoKundliResponse('Place: Petlad, India', {
      history: [{ role: 'user', text: 'I want to know my finances in coming years' }],
    });
    const step3 = buildNoKundliResponse('Which birthdate do you have?', {
      history: [
        { role: 'user', text: 'I want to know my finances in coming years' },
        { role: 'user', text: 'Place: Petlad, India' },
      ],
    });
    const step4 = buildNoKundliResponse('DOB: 22/08/1980', {
      history: [
        { role: 'user', text: 'I want to know my finances in coming years' },
        { role: 'user', text: 'Place: Petlad, India' },
        { role: 'user', text: 'Which birthdate do you have?' },
      ],
    });
    const step5 = buildNoKundliResponse('What details do you have?', {
      history: [
        { role: 'user', text: 'I want to know my finances in coming years' },
        { role: 'user', text: 'Place: Petlad, India' },
        { role: 'user', text: 'Which birthdate do you have?' },
        { role: 'user', text: 'DOB: 22/08/1980' },
      ],
    });

    expect(step1).toContain('We can begin without pretending I already have your chart');
    expect(step1).toContain('stability');
    expect(step2).toContain('birth place Petlad, India');
    expect(step3).toContain('I do not have your date of birth yet');
    expect(step3).toContain('birth place Petlad, India');
    expect(step4).toContain('date of birth 1980-08-22');
    expect(step4).toContain('birth place Petlad, India');
    expect(step5).toContain('date of birth 22-08-1980');
    expect(step5).toContain('birth place Petlad, India');
    expect(step5).toContain('birth time');
  });

  it('routes only birth-detail and memory turns to local no-kundli handling', () => {
    expect(shouldUseLocalNoKundliResponse('Place: Petlad, India')).toBe(true);
    expect(shouldUseLocalNoKundliResponse('Which birthdate do you have?')).toBe(true);
    expect(shouldUseLocalNoKundliResponse('Please analyze my chart')).toBe(true);
    expect(shouldUseLocalNoKundliResponse('I want to know my finances in coming years')).toBe(false);
  });
});
