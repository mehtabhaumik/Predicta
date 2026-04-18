import { validateBirthDetails } from '../src/utils/validateBirthDetails';

describe('validateBirthDetails', () => {
  it('accepts complete verified birth details', () => {
    const result = validateBirthDetails({
      date: '1994-08-16',
      latitude: 19.076,
      longitude: 72.8777,
      name: 'Aarav Mehta',
      place: 'Mumbai, India',
      time: '06:42',
      timezone: 'Asia/Kolkata',
    });

    expect(result.valid).toBe(true);
  });

  it('rejects missing coordinates and invalid timezone', () => {
    const result = validateBirthDetails({
      date: '1994/08/16',
      latitude: 120,
      longitude: 200,
      name: '',
      place: '',
      time: '25:99',
      timezone: 'Not/AZone',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(3);
  });
});
