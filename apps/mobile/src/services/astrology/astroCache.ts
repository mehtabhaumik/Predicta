import {
  ASTROLOGY_DEFAULTS,
  ASTROLOGY_ENGINE,
} from '../../config/astrologyConfig';
import type { BirthDetails, KundliData } from '../../types/astrology';

const memoryCache = new Map<string, KundliData>();

export function buildAstroCacheKey(birthDetails: BirthDetails): string {
  return JSON.stringify({
    ayanamsa: ASTROLOGY_DEFAULTS.ayanamsa,
    date: birthDetails.date,
    engine: ASTROLOGY_ENGINE.version,
    houseSystem: ASTROLOGY_DEFAULTS.houseSystem,
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude,
    nodeType: ASTROLOGY_DEFAULTS.nodeType,
    place: birthDetails.place,
    resolvedCity: birthDetails.resolvedBirthPlace?.city,
    resolvedCountry: birthDetails.resolvedBirthPlace?.country,
    resolvedState: birthDetails.resolvedBirthPlace?.state,
    time: birthDetails.time,
    timezone: birthDetails.timezone,
  });
}

export function getCachedKundli(birthDetails: BirthDetails): KundliData | null {
  return memoryCache.get(buildAstroCacheKey(birthDetails)) ?? null;
}

export function setCachedKundli(kundli: KundliData): void {
  memoryCache.set(buildAstroCacheKey(kundli.birthDetails), kundli);
}
