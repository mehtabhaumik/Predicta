import type { BirthDetails, ResolvedBirthPlace } from '../../types/astrology';
import { resolvePlaceWithBackend } from './geocodingService';
import {
  findLikelyBirthPlaces,
  listCitiesForState,
  listCountries,
  listStatesForCountry,
  resolveBirthPlace,
} from './locationRepository';

export {
  listCitiesForState,
  listCountries,
  listStatesForCountry,
  resolveBirthPlace,
};

export async function findBirthPlaceCandidates(
  query: string,
): Promise<ResolvedBirthPlace[]> {
  const localMatches = findLikelyBirthPlaces(query);

  if (localMatches.length > 0) {
    return localMatches;
  }

  return (await resolvePlaceWithBackend(query)) ?? [];
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
  const place = [resolvedPlace.city, resolvedPlace.state, resolvedPlace.country]
    .filter(Boolean)
    .join(', ');

  return {
    date,
    isTimeApproximate,
    latitude: resolvedPlace.latitude,
    longitude: resolvedPlace.longitude,
    name,
    originalPlaceText,
    place,
    resolvedBirthPlace: resolvedPlace,
    time,
    timezone: resolvedPlace.timezone,
  };
}
