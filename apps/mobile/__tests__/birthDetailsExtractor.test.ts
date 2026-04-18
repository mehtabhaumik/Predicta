import { extractBirthDetailsFromText } from '../src/services/ai/birthDetailsExtractor';

describe('birthDetailsExtractor', () => {
  it('extracts natural birth details and flags unclear AM/PM', async () => {
    const result = await extractBirthDetailsFromText(
      'My DOB is 16 Aug 1994, time is 6:42, born in Mumbai.',
    );

    expect(result.extracted.date).toBe('1994-08-16');
    expect(result.extracted.time).toBe('06:42');
    expect(result.extracted.city).toBe('Mumbai');
    expect(result.extracted.state).toBe('Maharashtra');
    expect(result.missingFields).toContain('am_pm');
  });

  it('normalizes morning time when AM is clear', async () => {
    const result = await extractBirthDetailsFromText(
      'DOB 16 Aug 1994, time is 6:42 in the morning, place is Mumbai.',
    );

    expect(result.extracted.time).toBe('06:42');
    expect(result.extracted.meridiem).toBe('AM');
    expect(result.missingFields).not.toContain('am_pm');
  });
});
