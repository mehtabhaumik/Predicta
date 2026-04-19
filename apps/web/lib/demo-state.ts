import { resolveAccess } from '@pridicta/access';
import { createInitialMonetizationState } from '@pridicta/monetization';
import type { AuthState, JournalEntry, KundliData, LifeEvent } from '@pridicta/types';

export const demoAuth: AuthState = {
  email: 'guest@predicta.rudraix.com',
  isLoggedIn: false,
  provider: null,
  userId: 'local-web-preview',
};

export const demoAdminAuth: AuthState = {
  email: 'ui.bhaumik@gmail.com',
  isLoggedIn: true,
  provider: 'google',
  userId: 'admin-web-preview',
};

export const demoMonetization = createInitialMonetizationState();

export const demoAccess = resolveAccess({
  auth: demoAuth,
  monetization: demoMonetization,
});

export const demoAdminAccess = resolveAccess({
  auth: demoAdminAuth,
  monetization: demoMonetization,
});

export const kundliSummary = {
  birthPlace: 'Mumbai, Maharashtra, India',
  calculatedAt: 'Ready for chart generation',
  dasha: 'Saturn / Mercury',
  lagna: 'Leo',
  moonSign: 'Taurus',
  nakshatra: 'Rohini',
  name: 'Predicta Seeker',
};

const houses = Array.from({ length: 12 }, (_, index) => ({
  house: index + 1,
  lord: [
    'Sun',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Saturn',
    'Jupiter',
    'Mars',
    'Venus',
    'Mercury',
    'Moon',
  ][index],
  planets: index === 9 ? ['Saturn'] : index === 10 ? ['Mercury'] : [],
  sign: [
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
  ][index],
}));

export const demoKundli: KundliData = {
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
    name: kundliSummary.name,
    place: kundliSummary.birthPlace,
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
    timeline: [
      {
        antardashas: [
          {
            antardasha: 'Venus',
            endDate: '2015-12-31',
            startDate: '2013-01-01',
          },
          {
            antardasha: 'Sun',
            endDate: '2017-12-31',
            startDate: '2016-01-01',
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
  houses,
  id: 'demo-kundli',
  lagna: kundliSummary.lagna,
  moonSign: kundliSummary.moonSign,
  nakshatra: kundliSummary.nakshatra,
  planets: [],
  yogas: [],
};

export const demoPartnerKundli: KundliData = {
  ...demoKundli,
  birthDetails: {
    ...demoKundli.birthDetails,
    date: '1995-02-12',
    name: 'Second Profile',
    place: 'Ahmedabad, Gujarat, India',
    time: '19:15',
  },
  calculationMeta: {
    ...demoKundli.calculationMeta,
    inputHash: 'demo-partner-input-hash',
  },
  dasha: {
    current: {
      antardasha: 'Venus',
      endDate: '2028-02-10',
      mahadasha: 'Rahu',
      startDate: '2025-02-10',
    },
    timeline: demoKundli.dasha.timeline,
  },
  id: 'demo-partner-kundli',
  lagna: 'Libra',
  moonSign: 'Cancer',
  nakshatra: 'Pushya',
};

export const demoLifeEvents: LifeEvent[] = [
  {
    approximateDate: false,
    category: 'EDUCATION',
    createdAt: '2026-04-18T00:00:00.000Z',
    description: 'A serious study period began.',
    eventDate: '2014-08-01',
    id: 'demo-life-event-education',
    kundliId: demoKundli.id,
    title: 'Education focus deepened',
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
  {
    approximateDate: false,
    category: 'CAREER',
    createdAt: '2026-04-18T00:00:00.000Z',
    description: 'Professional direction became more visible.',
    eventDate: '2021-06-15',
    id: 'demo-life-event-career',
    kundliId: demoKundli.id,
    title: 'Career direction shifted',
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
  {
    approximateDate: true,
    category: 'RELOCATION',
    createdAt: '2026-04-18T00:00:00.000Z',
    description: 'A move changed daily rhythm and priorities.',
    eventDate: '2024-03-01',
    id: 'demo-life-event-relocation',
    kundliId: demoKundli.id,
    title: 'Important relocation',
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
];

export const demoJournalEntries: JournalEntry[] = [
  {
    category: 'DECISION',
    createdAt: '2026-04-18T00:00:00.000Z',
    date: '2026-04-04',
    id: 'demo-journal-decision',
    kundliId: demoKundli.id,
    mood: 'NEUTRAL',
    note: 'Chose to slow down before committing to a larger responsibility.',
    relatedDecision: 'Career role timing',
    syncStatus: 'LOCAL_ONLY',
    tags: ['career', 'timing'],
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
  {
    category: 'MOOD',
    createdAt: '2026-04-18T00:00:00.000Z',
    date: '2026-04-11',
    id: 'demo-journal-mood',
    kundliId: demoKundli.id,
    mood: 'LOW',
    note: 'Felt mentally tired after too many open loops.',
    syncStatus: 'LOCAL_ONLY',
    tags: ['rest', 'boundaries'],
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
  {
    category: 'SPIRITUAL',
    createdAt: '2026-04-18T00:00:00.000Z',
    date: '2026-04-16',
    id: 'demo-journal-spiritual',
    kundliId: demoKundli.id,
    mood: 'GOOD',
    note: 'A calmer prayer routine made the week feel more grounded.',
    syncStatus: 'LOCAL_ONLY',
    tags: ['prayer', 'clarity'],
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
];
