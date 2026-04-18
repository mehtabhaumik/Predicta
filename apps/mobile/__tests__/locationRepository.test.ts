import {
  listCitiesForState,
  listCountries,
  listStatesForCountry,
  resolveBirthPlace,
} from '../src/services/location/locationRepository';

describe('locationRepository', () => {
  it('enables dependent country, state, and city selection', () => {
    expect(listCountries()).toContain('India');
    expect(listStatesForCountry()).toEqual([]);
    expect(listStatesForCountry('India')).toContain('Maharashtra');
    expect(listCitiesForState('India')).toEqual([]);
    expect(listCitiesForState('India', 'Maharashtra')).toContain('Mumbai');
  });

  it('resolves city to coordinates and IANA timezone internally', () => {
    const place = resolveBirthPlace({
      city: 'Mumbai',
      country: 'India',
      state: 'Maharashtra',
    });

    expect(place?.latitude).toBeCloseTo(19.076);
    expect(place?.longitude).toBeCloseTo(72.8777);
    expect(place?.timezone).toBe('Asia/Kolkata');
  });
});
