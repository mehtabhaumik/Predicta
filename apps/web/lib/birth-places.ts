export type WebBirthPlace = {
  label: string;
  latitude: number;
  longitude: number;
  place: string;
  timezone: string;
};

export const WEB_BIRTH_PLACES: WebBirthPlace[] = [
  {
    label: 'Petlad, India',
    latitude: 22.4768,
    longitude: 72.7997,
    place: 'Petlad, Gujarat, India',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Mumbai, India',
    latitude: 19.076,
    longitude: 72.8777,
    place: 'Mumbai, Maharashtra, India',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Ahmedabad, India',
    latitude: 23.0225,
    longitude: 72.5714,
    place: 'Ahmedabad, Gujarat, India',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    place: 'Delhi, India',
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.006,
    place: 'New York, NY, USA',
    timezone: 'America/New_York',
  },
  {
    label: 'London, UK',
    latitude: 51.5072,
    longitude: -0.1276,
    place: 'London, United Kingdom',
    timezone: 'Europe/London',
  },
];

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
