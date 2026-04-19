import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildJournalAnalyticsPayload,
  buildJournalHash,
  buildJournalInsight,
  mapJournalEntryToDasha,
  resolveJournalInsightAccess,
} from '@pridicta/astrology';
import type { JournalEntry, KundliData } from '@pridicta/types';

import {
  loadLocalJournalEntries,
  upsertLocalJournalEntry,
} from '../src/services/storage/localJournalStorage';
import { saveJournalEntryForUser } from '../src/services/firebase/journalPersistence';

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
      inputHash: 'journal-input-hash',
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
    houses: [],
    id: 'journal-kundli',
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Rohini',
    planets: [],
    yogas: [],
  };
}

const entries: JournalEntry[] = [
  {
    category: 'DECISION',
    createdAt: '2026-04-18T00:00:00.000Z',
    date: '2026-04-05',
    id: 'decision',
    kundliId: 'journal-kundli',
    mood: 'NEUTRAL',
    note: 'Private note about a career decision',
    relatedDecision: 'Career choice',
    syncStatus: 'LOCAL_ONLY',
    tags: ['career', 'timing'],
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
  {
    category: 'MOOD',
    createdAt: '2026-04-18T00:00:00.000Z',
    date: '2026-04-11',
    id: 'mood',
    kundliId: 'journal-kundli',
    mood: 'LOW',
    note: 'Private note about feeling tired',
    syncStatus: 'LOCAL_ONLY',
    tags: ['rest'],
    updatedAt: '2026-04-18T00:00:00.000Z',
  },
];

describe('Journal Insights', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem('predicta.journalEntries.v1');
    await AsyncStorage.removeItem('predicta.journalInsights.v1');
  });

  it('stores journal entries locally by default', async () => {
    await upsertLocalJournalEntry(entries[0]);

    expect(await loadLocalJournalEntries('journal-kundli')).toMatchObject([
      {
        id: 'decision',
        syncStatus: 'LOCAL_ONLY',
      },
    ]);
  });

  it('maps journal dates to dasha context', () => {
    expect(mapJournalEntryToDasha(kundli(), entries[0])).toMatchObject({
      antardasha: 'Mercury',
      mahadasha: 'Saturn',
    });
  });

  it('builds a stable journal hash for same entries', () => {
    const chart = kundli();

    expect(buildJournalHash(chart, entries, '2026-04')).toBe(
      buildJournalHash(chart, [...entries].reverse(), '2026-04'),
    );
    expect(buildJournalHash(chart, entries, '2026-04')).not.toBe(
      buildJournalHash(chart, [{ ...entries[0], note: 'changed' }], '2026-04'),
    );
  });

  it('gates premium journal patterns', () => {
    const free = buildJournalInsight({
      entries,
      hasPremiumAccess: false,
      kundli: kundli(),
      monthKey: '2026-04',
    });
    const premium = buildJournalInsight({
      entries,
      hasPremiumAccess: true,
      kundli: kundli(),
      monthKey: '2026-04',
    });

    expect(resolveJournalInsightAccess({ hasPremiumAccess: false })).toMatchObject({
      canViewPremiumPatterns: false,
      depth: 'FREE',
    });
    expect(free.premiumPatternSummary).toBeUndefined();
    expect(premium.premiumPatternSummary).toContain('career');
  });

  it('does not leak raw journal text into analytics payloads', () => {
    const payload = buildJournalAnalyticsPayload({
      entries,
      monthKey: '2026-04',
    });

    expect(JSON.stringify(payload)).not.toContain('Private note');
    expect(JSON.stringify(payload)).not.toContain('career, timing');
    expect(payload).toMatchObject({
      entryCount: 2,
      monthKey: '2026-04',
    });
  });

  it('rejects offline cloud sync when explicit user action is false', async () => {
    await expect(
      saveJournalEntryForUser({
        entry: entries[0],
        explicitUserAction: false,
        userId: 'user-1',
      } as never),
    ).rejects.toThrow('explicit user action');
  });
});
