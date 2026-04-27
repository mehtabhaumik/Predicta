import type { ResolvedBirthPlace } from '@pridicta/types';

export type LocationCity = ResolvedBirthPlace;

export type LocationState = {
  name: string;
  cities: LocationCity[];
};

export type LocationCountry = {
  name: string;
  code: string;
  states: LocationState[];
};

const source = 'local-dataset' as const;

export const LOCATION_SEED_DATA: LocationCountry[] = [
  {
    code: 'IN',
    name: 'India',
    states: [
      {
        name: 'Gujarat',
        cities: [
          {
            city: 'Ahmedabad',
            country: 'India',
            latitude: 23.0225,
            longitude: 72.5714,
            source,
            state: 'Gujarat',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Surat',
            country: 'India',
            latitude: 21.1702,
            longitude: 72.8311,
            source,
            state: 'Gujarat',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Vadodara',
            country: 'India',
            latitude: 22.3072,
            longitude: 73.1812,
            source,
            state: 'Gujarat',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Petlad',
            country: 'India',
            latitude: 22.4768,
            longitude: 72.7999,
            source,
            state: 'Gujarat',
            timezone: 'Asia/Kolkata',
          },
        ],
      },
      {
        name: 'Maharashtra',
        cities: [
          {
            city: 'Mumbai',
            country: 'India',
            latitude: 19.076,
            longitude: 72.8777,
            source,
            state: 'Maharashtra',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Pune',
            country: 'India',
            latitude: 18.5204,
            longitude: 73.8567,
            source,
            state: 'Maharashtra',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Nagpur',
            country: 'India',
            latitude: 21.1458,
            longitude: 79.0882,
            source,
            state: 'Maharashtra',
            timezone: 'Asia/Kolkata',
          },
        ],
      },
      {
        name: 'Delhi',
        cities: [
          {
            city: 'New Delhi',
            country: 'India',
            latitude: 28.6139,
            longitude: 77.209,
            source,
            state: 'Delhi',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Delhi',
            country: 'India',
            latitude: 28.7041,
            longitude: 77.1025,
            source,
            state: 'Delhi',
            timezone: 'Asia/Kolkata',
          },
        ],
      },
      {
        name: 'Karnataka',
        cities: [
          {
            city: 'Bengaluru',
            country: 'India',
            latitude: 12.9716,
            longitude: 77.5946,
            source,
            state: 'Karnataka',
            timezone: 'Asia/Kolkata',
          },
          {
            city: 'Mysuru',
            country: 'India',
            latitude: 12.2958,
            longitude: 76.6394,
            source,
            state: 'Karnataka',
            timezone: 'Asia/Kolkata',
          },
        ],
      },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    states: [
      {
        name: 'California',
        cities: [
          {
            city: 'Los Angeles',
            country: 'United States',
            latitude: 34.0522,
            longitude: -118.2437,
            source,
            state: 'California',
            timezone: 'America/Los_Angeles',
          },
          {
            city: 'San Francisco',
            country: 'United States',
            latitude: 37.7749,
            longitude: -122.4194,
            source,
            state: 'California',
            timezone: 'America/Los_Angeles',
          },
          {
            city: 'San Jose',
            country: 'United States',
            latitude: 37.3382,
            longitude: -121.8863,
            source,
            state: 'California',
            timezone: 'America/Los_Angeles',
          },
        ],
      },
      {
        name: 'New York',
        cities: [
          {
            city: 'New York City',
            country: 'United States',
            latitude: 40.7128,
            longitude: -74.006,
            source,
            state: 'New York',
            timezone: 'America/New_York',
          },
          {
            city: 'Buffalo',
            country: 'United States',
            latitude: 42.8864,
            longitude: -78.8784,
            source,
            state: 'New York',
            timezone: 'America/New_York',
          },
        ],
      },
      {
        name: 'Texas',
        cities: [
          {
            city: 'Houston',
            country: 'United States',
            latitude: 29.7604,
            longitude: -95.3698,
            source,
            state: 'Texas',
            timezone: 'America/Chicago',
          },
          {
            city: 'Dallas',
            country: 'United States',
            latitude: 32.7767,
            longitude: -96.797,
            source,
            state: 'Texas',
            timezone: 'America/Chicago',
          },
          {
            city: 'Austin',
            country: 'United States',
            latitude: 30.2672,
            longitude: -97.7431,
            source,
            state: 'Texas',
            timezone: 'America/Chicago',
          },
        ],
      },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    states: [
      {
        name: 'Ontario',
        cities: [
          {
            city: 'Toronto',
            country: 'Canada',
            latitude: 43.6532,
            longitude: -79.3832,
            source,
            state: 'Ontario',
            timezone: 'America/Toronto',
          },
          {
            city: 'Ottawa',
            country: 'Canada',
            latitude: 45.4215,
            longitude: -75.6972,
            source,
            state: 'Ontario',
            timezone: 'America/Toronto',
          },
        ],
      },
      {
        name: 'British Columbia',
        cities: [
          {
            city: 'Vancouver',
            country: 'Canada',
            latitude: 49.2827,
            longitude: -123.1207,
            source,
            state: 'British Columbia',
            timezone: 'America/Vancouver',
          },
        ],
      },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    states: [
      {
        name: 'England',
        cities: [
          {
            city: 'London',
            country: 'United Kingdom',
            latitude: 51.5072,
            longitude: -0.1276,
            source,
            state: 'England',
            timezone: 'Europe/London',
          },
          {
            city: 'Manchester',
            country: 'United Kingdom',
            latitude: 53.4808,
            longitude: -2.2426,
            source,
            state: 'England',
            timezone: 'Europe/London',
          },
          {
            city: 'Birmingham',
            country: 'United Kingdom',
            latitude: 52.4862,
            longitude: -1.8904,
            source,
            state: 'England',
            timezone: 'Europe/London',
          },
        ],
      },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    states: [
      {
        name: 'New South Wales',
        cities: [
          {
            city: 'Sydney',
            country: 'Australia',
            latitude: -33.8688,
            longitude: 151.2093,
            source,
            state: 'New South Wales',
            timezone: 'Australia/Sydney',
          },
        ],
      },
      {
        name: 'Victoria',
        cities: [
          {
            city: 'Melbourne',
            country: 'Australia',
            latitude: -37.8136,
            longitude: 144.9631,
            source,
            state: 'Victoria',
            timezone: 'Australia/Melbourne',
          },
        ],
      },
    ],
  },
];
