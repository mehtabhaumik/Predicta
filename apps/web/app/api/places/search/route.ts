import { NextResponse } from 'next/server';
import {
  type WebBirthPlace,
  getBirthPlaceLabel,
  searchLocalWebBirthPlaces,
} from '../../../../lib/birth-places';

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const SEARCH_TIMEOUT_MS = 3500;

type OpenMeteoPlace = {
  name?: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  const localMatches = searchLocalWebBirthPlaces(query).slice(0, 8);

  if (query.length < 2) {
    return NextResponse.json({ places: localMatches });
  }

  if (localMatches.length > 0 && hasStrongLocalMatch(query, localMatches)) {
    return NextResponse.json({ places: localMatches.slice(0, 5) });
  }

  const remoteMatches = await searchOpenMeteoPlaces(query);
  const places = mergePlaces([...localMatches, ...remoteMatches]).slice(0, 10);

  return NextResponse.json({ places });
}

function hasStrongLocalMatch(query: string, places: WebBirthPlace[]): boolean {
  const normalizedQuery = normalizePlace(query);

  return places.some(place => {
    const city = normalizePlace(place.city ?? place.label.split(',')[0]);
    const label = normalizePlace(getBirthPlaceLabel(place));

    return (
      city.includes(normalizedQuery) ||
      normalizedQuery.includes(city) ||
      label.includes(normalizedQuery) ||
      similarityScore(normalizedQuery, city) >= 0.58
    );
  });
}

async function searchOpenMeteoPlaces(query: string): Promise<WebBirthPlace[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const url = new URL(OPEN_METEO_GEOCODING_URL);
    url.searchParams.set('name', query);
    url.searchParams.set('count', '10');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { results?: OpenMeteoPlace[] };

    return (payload.results ?? [])
      .map(toWebBirthPlace)
      .filter((place): place is WebBirthPlace => Boolean(place));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function toWebBirthPlace(place: OpenMeteoPlace): WebBirthPlace | undefined {
  if (
    !place.name ||
    typeof place.latitude !== 'number' ||
    typeof place.longitude !== 'number' ||
    !place.country ||
    !place.timezone
  ) {
    return undefined;
  }

  const state = place.admin1 || place.admin2;
  const country =
    place.country_code === 'US' ? 'United States' : place.country;
  const normalized: WebBirthPlace = {
    city: place.name,
    country,
    label: [place.name, state, country].filter(Boolean).join(', '),
    latitude: place.latitude,
    longitude: place.longitude,
    place: [place.name, state, country].filter(Boolean).join(', '),
    source: 'geocoding-api',
    state,
    timezone: place.timezone,
  };

  return {
    ...normalized,
    label: getBirthPlaceLabel(normalized),
  };
}

function mergePlaces(places: WebBirthPlace[]): WebBirthPlace[] {
  const seen = new Set<string>();
  const merged: WebBirthPlace[] = [];

  for (const place of places) {
    const key = [
      place.city ?? place.label,
      place.state ?? '',
      place.country ?? '',
      place.timezone,
    ]
      .join('|')
      .toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(place);
  }

  return merged;
}

function normalizePlace(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarityScore(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }

  if (a === b || a.includes(b) || b.includes(a)) {
    return 1;
  }

  const distance = levenshteinDistance(a, b);
  const longest = Math.max(a.length, b.length);

  return longest === 0 ? 0 : 1 - distance / longest;
}

function levenshteinDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);

  for (let column = 1; column <= b.length; column += 1) {
    rows[0][column] = column;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost,
      );
    }
  }

  return rows[a.length][b.length];
}
