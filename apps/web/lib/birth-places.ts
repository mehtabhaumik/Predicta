export type WebBirthPlace = {
  label: string;
  latitude: number;
  longitude: number;
  place: string;
  timezone: string;
  city?: string;
  state?: string;
  country?: string;
  source?: 'geocoding-api' | 'local-dataset' | 'manual-admin';
};

export const WEB_BIRTH_PLACES: WebBirthPlace[] = [
  {
    label: 'Petlad, India',
    city: 'Petlad',
    country: 'India',
    latitude: 22.4768,
    longitude: 72.7997,
    place: 'Petlad, Gujarat, India',
    source: 'local-dataset',
    state: 'Gujarat',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Mumbai, India',
    city: 'Mumbai',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
    place: 'Mumbai, Maharashtra, India',
    source: 'local-dataset',
    state: 'Maharashtra',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Ahmedabad, India',
    city: 'Ahmedabad',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    place: 'Ahmedabad, Gujarat, India',
    source: 'local-dataset',
    state: 'Gujarat',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Delhi, India',
    city: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
    place: 'Delhi, India',
    source: 'local-dataset',
    state: 'Delhi',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'New York, USA',
    city: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
    place: 'New York, NY, USA',
    source: 'local-dataset',
    state: 'New York',
    timezone: 'America/New_York',
  },
  {
    label: 'London, UK',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276,
    place: 'London, United Kingdom',
    source: 'local-dataset',
    state: 'England',
    timezone: 'Europe/London',
  },
];

export function getBirthPlaceLabel(place: WebBirthPlace): string {
  return [place.city, place.state, place.country]
    .filter(Boolean)
    .join(', ') || place.label || place.place;
}

export function searchLocalWebBirthPlaces(query?: string): WebBirthPlace[] {
  const normalizedQuery = normalizeBirthPlace(query);

  if (!normalizedQuery) {
    return WEB_BIRTH_PLACES.slice(0, 1);
  }

  const directMatches = WEB_BIRTH_PLACES.filter(option => {
    const city = normalizeBirthPlace(option.city ?? option.label.split(',')[0]);
    const label = normalizeBirthPlace(getBirthPlaceLabel(option));
    const place = normalizeBirthPlace(option.place);

    return (
      city.includes(normalizedQuery) ||
      normalizedQuery.includes(city) ||
      label.includes(normalizedQuery) ||
      place.includes(normalizedQuery)
    );
  });

  if (directMatches.length > 0) {
    return directMatches;
  }

  return WEB_BIRTH_PLACES.map(option => ({
    option,
    score: similarityScore(
      normalizedQuery,
      normalizeBirthPlace(option.city ?? option.label.split(',')[0]),
    ),
  }))
    .filter(item => item.score >= 0.58)
    .sort((a, b) => b.score - a.score)
    .map(item => item.option);
}

export async function searchWebBirthPlaces(
  query?: string,
): Promise<WebBirthPlace[]> {
  const normalizedQuery = normalizeBirthPlace(query);

  if (normalizedQuery.length < 2) {
    return WEB_BIRTH_PLACES.slice(0, 1);
  }

  try {
    const response = await fetch(
      `/api/places/search?q=${encodeURIComponent(query ?? '')}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      return searchLocalWebBirthPlaces(query).slice(0, 8);
    }

    const payload = (await response.json()) as { places?: WebBirthPlace[] };
    const places = payload.places ?? [];

    return places.length > 0
      ? places
      : searchLocalWebBirthPlaces(query).slice(0, 8);
  } catch {
    return searchLocalWebBirthPlaces(query).slice(0, 8);
  }
}

export function findWebBirthPlace(query?: string): WebBirthPlace | undefined {
  const normalizedQuery = normalizeBirthPlace(query);

  if (!normalizedQuery) {
    return undefined;
  }

  return (
    WEB_BIRTH_PLACES.find(place =>
      normalizeBirthPlace(place.place).includes(normalizedQuery),
    ) ??
    WEB_BIRTH_PLACES.find(place =>
      normalizedQuery.includes(normalizeBirthPlace(place.label)),
    ) ??
    WEB_BIRTH_PLACES.find(place =>
      normalizeBirthPlace(place.label).includes(normalizedQuery),
    ) ??
    WEB_BIRTH_PLACES.find(place =>
      normalizeBirthPlace(place.place)
        .split(',')
        .some(part => normalizedQuery.includes(part.trim())),
    )
  );
}

function normalizeBirthPlace(value?: string): string {
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
