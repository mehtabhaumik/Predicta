import type { BirthDetails, ResolvedBirthPlace } from '@pridicta/types';

import { LOCATION_SEED_DATA } from './locationSeedData';

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

export function buildBirthDetailsFromResolvedPlace({
  date,
  isTimeApproximate,
  name,
  originalPlaceText,
  resolvedPlace,
  time,
}: {
  date: string;
  isTimeApproximate?: boolean;
  name: string;
  originalPlaceText?: string;
  resolvedPlace: ResolvedBirthPlace;
  time: string;
}): BirthDetails {
  return {
    date,
    isTimeApproximate,
    latitude: resolvedPlace.latitude,
    longitude: resolvedPlace.longitude,
    name,
    originalPlaceText,
    place: [resolvedPlace.city, resolvedPlace.state, resolvedPlace.country]
      .filter(Boolean)
      .join(', '),
    resolvedBirthPlace: resolvedPlace,
    time,
    timezone: resolvedPlace.timezone,
  };
}

export function findBirthPlaceCandidates(query: string): ResolvedBirthPlace[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  const candidates = allCities();
  const exactLabelMatches = candidates.filter(
    city => normalize(city.label) === normalizedQuery,
  );

  if (exactLabelMatches.length > 0) {
    return exactLabelMatches;
  }

  const directCityMatches = candidates.filter(city =>
    normalize(city.city).includes(normalizedQuery),
  );

  if (directCityMatches.length > 0) {
    return directCityMatches.slice(0, 5);
  }

  const commaParts = normalizedQuery
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (commaParts.length >= 2) {
    const narrowedMatches = candidates.filter(city => {
      const cityName = normalize(city.city);
      const stateName = normalize(city.state ?? '');
      const countryName = normalize(city.country);

      return commaParts.every(
        part =>
          cityName.includes(part) ||
          stateName.includes(part) ||
          countryName.includes(part),
      );
    });

    if (narrowedMatches.length > 0) {
      return narrowedMatches.slice(0, 5);
    }
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
