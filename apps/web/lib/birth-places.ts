export type WebBirthPlace = {
  aliases?: string[];
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
    aliases: ['Patlad', 'Petelad', 'Petlad Gujarat'],
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
    aliases: ['Bombay'],
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
    aliases: ['Ahmd', 'Amd', 'Ahemdabad', 'Ahmedabad Gujarat'],
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
    aliases: ['New Delhi', 'Dilli'],
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
    aliases: ['NYC', 'New York City', 'New York NY'],
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
    aliases: ['London England'],
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276,
    place: 'London, United Kingdom',
    source: 'local-dataset',
    state: 'England',
    timezone: 'Europe/London',
  },
  {
    label: 'Rajkot, India',
    aliases: ['Rajkot Gujarat'],
    city: 'Rajkot',
    country: 'India',
    latitude: 22.3039,
    longitude: 70.8022,
    place: 'Rajkot, Gujarat, India',
    source: 'local-dataset',
    state: 'Gujarat',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Sydney, Australia',
    aliases: ['Sybdny', 'Sydny', 'Sidney', 'Sydney NSW'],
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    place: 'Sydney, New South Wales, Australia',
    source: 'local-dataset',
    state: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
];

export function getBirthPlaceLabel(place: WebBirthPlace): string {
  return [place.city, place.state, place.country]
    .filter(Boolean)
    .join(', ') || place.label || place.place;
}

export function searchLocalWebBirthPlaces(query?: string): WebBirthPlace[] {
  const normalizedQuery = normalizeBirthPlace(resolveBirthPlaceSearchQuery(query));

  if (!normalizedQuery) {
    return [];
  }

  const directMatches = WEB_BIRTH_PLACES.filter(option => {
    const searchTerms = getBirthPlaceSearchTerms(option);

    return searchTerms.some(
      term => term.includes(normalizedQuery) || normalizedQuery.includes(term),
    );
  });

  if (directMatches.length > 0) {
    return directMatches;
  }

  return WEB_BIRTH_PLACES.map(option => ({
    option,
    score: Math.max(
      ...getBirthPlaceSearchTerms(option).map(term =>
        similarityScore(normalizedQuery, term),
      ),
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
    return [];
  }

  try {
    const searchQuery = resolveBirthPlaceSearchQuery(query);
    const response = await fetch(
      `/api/places/search?q=${encodeURIComponent(searchQuery)}`,
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
  const normalizedQuery = normalizeBirthPlace(resolveBirthPlaceSearchQuery(query));

  if (!normalizedQuery) {
    return undefined;
  }

  return (
    WEB_BIRTH_PLACES.find(place => doesBirthPlaceMatchQuery(place, query)) ??
    WEB_BIRTH_PLACES.find(place =>
      getBirthPlaceSearchTerms(place).some(term => term.includes(normalizedQuery)),
    )
  );
}

export function doesBirthPlaceMatchQuery(
  place: WebBirthPlace | undefined,
  query?: string,
): boolean {
  if (!place) {
    return false;
  }

  const normalizedQuery = normalizeBirthPlace(resolveBirthPlaceSearchQuery(query));

  if (!normalizedQuery) {
    return false;
  }

  return getBirthPlaceSearchTerms(place).some(
    term =>
      term === normalizedQuery ||
      term.includes(normalizedQuery) ||
      normalizedQuery.includes(term),
  );
}

export function resolveBirthPlaceSearchQuery(query?: string): string {
  const normalizedQuery = normalizeBirthPlace(query);

  if (!normalizedQuery) {
    return '';
  }

  const aliasMatch = BIRTH_PLACE_QUERY_ALIASES.find(alias =>
    alias.matches.includes(normalizedQuery),
  );

  return aliasMatch?.search ?? query ?? '';
}

export function normalizeBirthPlace(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBirthPlaceSearchTerms(place: WebBirthPlace): string[] {
  return [
    place.city,
    place.label,
    place.place,
    getBirthPlaceLabel(place),
    ...(place.aliases ?? []),
  ]
    .filter(Boolean)
    .map(term => normalizeBirthPlace(term))
    .filter(Boolean);
}

const BIRTH_PLACE_QUERY_ALIASES: Array<{
  matches: string[];
  search: string;
}> = [
  {
    matches: ['nyc', 'new york city'],
    search: 'New York',
  },
  {
    matches: ['ahmd', 'amd', 'ahemdabad'],
    search: 'Ahmedabad',
  },
  {
    matches: ['sybdny', 'sydny', 'sidney'],
    search: 'Sydney',
  },
  {
    matches: ['bombay'],
    search: 'Mumbai',
  },
  {
    matches: ['patlad', 'petelad'],
    search: 'Petlad',
  },
];

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
