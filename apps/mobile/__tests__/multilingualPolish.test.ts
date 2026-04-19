import {
  getLocalizedString,
  normalizeLocale,
} from '@pridicta/config';
import { buildAiLanguageContext } from '@pridicta/ai';
import {
  buildReportCacheKey,
  composeReportSections,
} from '@pridicta/pdf';
import type { KundliData } from '@pridicta/types';

import {
  loadLanguagePreference,
  saveLanguagePreference,
} from '../src/services/storage/languagePreferenceStorage';

function kundli(inputHash = 'multilingual-hash'): KundliData {
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
    id: 'multilingual-kundli',
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Rohini',
    planets: [],
    yogas: [],
  };
}

describe('multilingual polish', () => {
  it('persists the selected language preference locally', async () => {
    await saveLanguagePreference('gu');

    await expect(loadLanguagePreference()).resolves.toMatchObject({
      locale: 'gu',
    });
  });

  it('loads static strings with English fallback for unsupported locales', () => {
    expect(normalizeLocale('fr')).toBe('en');
    expect(getLocalizedString('language.hindi', 'hi')).toBe('हिन्दी');
    expect(getLocalizedString('language.gujarati', normalizeLocale('fr'))).toBe(
      'Gujarati',
    );
  });

  it('adds the selected language to AI prompt context', () => {
    expect(buildAiLanguageContext('hi')).toMatchObject({
      locale: 'hi',
    });
    expect(buildAiLanguageContext('hi').instruction).toContain('Hindi');
  });

  it('adds report language metadata and keeps cache keys language-aware', () => {
    const gujaratiReport = composeReportSections({
      kundli: kundli(),
      language: 'gu',
      mode: 'FREE',
      reportType: 'FREE_KUNDLI_SUMMARY',
    });
    const englishKey = buildReportCacheKey({
      kundli: kundli(),
      language: 'en',
      mode: 'FREE',
      reportType: 'FREE_KUNDLI_SUMMARY',
    });
    const hindiKey = buildReportCacheKey({
      kundli: kundli(),
      language: 'hi',
      mode: 'FREE',
      reportType: 'FREE_KUNDLI_SUMMARY',
    });

    expect(gujaratiReport).toMatchObject({
      language: 'gu',
      languageLabel: 'Gujarati (ગુજરાતી)',
    });
    expect(gujaratiReport.sections[0]?.body).toContain(
      'Language preference: Gujarati (ગુજરાતી)',
    );
    expect(englishKey).not.toBe(hindiKey);
  });
});
