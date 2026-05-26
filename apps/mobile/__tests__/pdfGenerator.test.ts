import RNFS from 'react-native-fs';

import {
  buildMobileReportPdfPayload,
  generateHoroscopePdf,
} from '../src/services/pdf/pdfGenerator';
import type { KundliData } from '../src/types/astrology';

const kundli = {
  ashtakavarga: {
    bav: {},
    sav: [],
    strongestHouses: [],
    totalScore: 0,
    weakestHouses: [],
  },
  birthDetails: {
    date: '1994-08-16',
    latitude: 19.076,
    longitude: 72.8777,
    name: 'Aarav Mehta',
    place: 'Mumbai, India',
    time: '06:42',
    timezone: 'Asia/Kolkata',
  },
  calculationMeta: {
    ayanamsa: 'LAHIRI',
    calculatedAt: '2026-05-26T00:00:00.000Z',
    houseSystem: 'WHOLE_SIGN',
    inputHash: 'hash-1',
    nodeType: 'TRUE_NODE',
    provider: 'swiss-ephemeris',
    utcDateTime: '1994-08-16T01:12:00.000Z',
    zodiac: 'SIDEREAL',
  },
  charts: {
    D1: {
      ascendantSign: 'Leo',
      chartType: 'D1',
      housePlacements: {},
      name: 'Rashi',
      planetDistribution: [],
      signPlacements: {},
      supported: true,
    },
  },
  dasha: {
    current: {
      antardasha: 'Mercury',
      endDate: '2027-01-01',
      mahadasha: 'Venus',
      startDate: '2025-01-01',
    },
    timeline: [],
  },
  houses: [],
  id: 'kundli-1',
  lagna: 'Leo',
  moonSign: 'Sagittarius',
  nakshatra: 'Mula',
  planets: [],
  yogas: [],
} as unknown as KundliData;

describe('mobile PDF generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds the shared report PDF payload without native filesystem access', () => {
    expect(
      buildMobileReportPdfPayload({
        kundli,
        language: 'gu',
        mode: 'PREMIUM',
        reportFocus: 'VEDIC',
        sectionKeys: ['charts', 'mahadasha'],
      }),
    ).toMatchObject({
      kundli,
      language: 'gu',
      mode: 'PREMIUM',
      reportFocus: 'VEDIC',
      sectionKeys: ['charts', 'mahadasha'],
    });
  });

  it('downloads the backend PDF bytes and writes them through the native FS boundary', async () => {
    const arrayBuffer = Uint8Array.from([37, 80, 68, 70]).buffer;
    const fetchMock = jest.fn(async () => ({
      arrayBuffer: async () => arrayBuffer,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'content-disposition'
            ? 'attachment; filename="Predicta Report.pdf"'
            : null,
      },
      ok: true,
    }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generateHoroscopePdf({
      kundli,
      language: 'en',
      mode: 'FREE',
      reportFocus: 'VEDIC',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:3000/api/report/pdf',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(RNFS.writeFile).toHaveBeenCalledWith(
      '/tmp/predicta-mobile-documents/predicta-report.pdf',
      'JVBERg==',
      'base64',
    );
    expect(result).toMatchObject({
      filePath: '/tmp/predicta-mobile-documents/predicta-report.pdf',
      mode: 'FREE',
    });
  });

  it('surfaces backend PDF errors without writing a file', async () => {
    globalThis.fetch = jest.fn(async () => ({
      json: async () => ({ error: 'PDF service unavailable' }),
      ok: false,
    })) as unknown as typeof fetch;

    await expect(
      generateHoroscopePdf({
        kundli,
        mode: 'FREE',
      }),
    ).rejects.toThrow('PDF service unavailable');

    expect(RNFS.writeFile).not.toHaveBeenCalled();
  });
});
