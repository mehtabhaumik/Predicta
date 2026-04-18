import { buildAstroCacheKey } from '../src/services/astrology/astroCache';
import type { BirthDetails } from '../src/types/astrology';

const birthDetails: BirthDetails = {
  date: '1994-08-16',
  latitude: 19.076,
  longitude: 72.8777,
  name: 'Aarav Mehta',
  place: 'Mumbai, India',
  time: '06:42',
  timezone: 'Asia/Kolkata',
};

describe('buildAstroCacheKey', () => {
  it('changes when calculation-sensitive details change', () => {
    expect(buildAstroCacheKey(birthDetails)).not.toBe(
      buildAstroCacheKey({ ...birthDetails, time: '06:43' }),
    );
  });
});
