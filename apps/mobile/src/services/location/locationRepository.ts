import { LOCATION_SEED_DATA } from '../../data/location/seedLocations';
import type { ResolvedBirthPlace } from '../../types/astrology';

type CityMatch = ResolvedBirthPlace & {
  label: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function allCities(): CityMatch[] {
  return LOCATION_SEED_DATA.flatMap(country =>
    country.states.flatMap(state =>
      state.cities.map(city => ({
        ...city,
        label: [city.city, city.state, city.country].filter(Boolean).join(', '),
      })),
    ),
  );
}

export function listCountries(): string[] {
  return LOCATION_SEED_DATA.map(country => country.name);
}

export function listStatesForCountry(countryName?: string): string[] {
  if (!countryName) {
    return [];
  }

  const country = LOCATION_SEED_DATA.find(
    item => normalize(item.name) === normalize(countryName),
  );

  return country?.states.map(state => state.name) ?? [];
}

export function listCitiesForState(
  countryName?: string,
  stateName?: string,
): string[] {
  if (!countryName || !stateName) {
    return [];
  }

  const country = LOCATION_SEED_DATA.find(
    item => normalize(item.name) === normalize(countryName),
  );
  const state = country?.states.find(
    item => normalize(item.name) === normalize(stateName),
  );

  return state?.cities.map(city => city.city) ?? [];
}

export function resolveBirthPlace({
  city,
  country,
  state,
}: {
  city?: string;
  country?: string;
  state?: string;
}): ResolvedBirthPlace | null {
  if (!city || !country || !state) {
    return null;
  }

  const countryRecord = LOCATION_SEED_DATA.find(
    item => normalize(item.name) === normalize(country),
  );
  const stateRecord = countryRecord?.states.find(
    item => normalize(item.name) === normalize(state),
  );
  const cityRecord = stateRecord?.cities.find(
    item => normalize(item.city) === normalize(city),
  );

  return cityRecord ?? null;
}

export function searchBirthPlaces(query: string): CityMatch[] {
  const normalizedQuery = normalize(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  return allCities()
    .filter(city => normalize(city.label).includes(normalizedQuery))
    .slice(0, 8);
}

export function findLikelyBirthPlaces(query: string): CityMatch[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  const candidates = allCities();
  const direct = candidates.filter(city =>
    normalize(city.city).includes(normalizedQuery),
  );

  if (direct.length > 0) {
    return direct.slice(0, 5);
  }

  return candidates
    .map(city => ({
      city,
      score: similarityScore(normalizedQuery, normalize(city.city)),
    }))
    .filter(item => item.score >= 0.58)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.city);
}

function similarityScore(a: string, b: string): number {
  const aSet = new Set(a.split(''));
  const bSet = new Set(b.split(''));
  const intersection = [...aSet].filter(char => bSet.has(char)).length;
  const union = new Set([...aSet, ...bSet]).size;

  return union === 0 ? 0 : intersection / union;
}
