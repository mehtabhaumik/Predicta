import type { ChartData, KundliData, PlanetPosition } from '@pridicta/types';

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const ATMAKARAKA_CANDIDATES = new Set([
  'Moon',
  'Sun',
  'Mars',
  'Jupiter',
  'Venus',
  'Saturn',
  'Mercury',
]);

export type JaiminiSoulChartRole = 'SWAMSA' | 'KARAKAMSHA';

export function normalizeJaiminiSoulChartAlias(
  value: string,
): JaiminiSoulChartRole | undefined {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');

  if (normalized === 'swamsa' || normalized === 'swamsha' || normalized === 'svamsa') {
    return 'SWAMSA';
  }

  if (normalized === 'karakamsha' || normalized === 'karakmasa') {
    return 'KARAKAMSHA';
  }

  return undefined;
}

export function resolveAtmakaraka(kundli: KundliData): PlanetPosition | undefined {
  return kundli.planets
    .filter(planet => ATMAKARAKA_CANDIDATES.has(planet.name))
    .sort((first, second) => second.degree - first.degree)[0];
}

export function buildSwamsaChart(kundli?: KundliData): ChartData | undefined {
  const navamsa = kundli?.charts.D9;

  if (!kundli || !navamsa?.supported || !navamsa.ascendantSign) {
    return undefined;
  }

  return buildD9ReferenceChart({
    ascendantSign: navamsa.ascendantSign,
    name: 'Swamsa Chart',
    sourceChart: navamsa,
  });
}

export function buildKarakamshaChart(kundli?: KundliData): ChartData | undefined {
  const navamsa = kundli?.charts.D9;
  const atmakaraka = kundli ? resolveAtmakaraka(kundli) : undefined;
  const navamsaAtmakaraka = atmakaraka
    ? navamsa?.planetDistribution.find(planet => planet.name === atmakaraka.name)
    : undefined;

  if (!navamsa?.supported || !navamsaAtmakaraka?.sign) {
    return undefined;
  }

  return buildD9ReferenceChart({
    ascendantSign: navamsaAtmakaraka.sign,
    name: 'Karakamsha Chart',
    sourceChart: navamsa,
  });
}

function buildD9ReferenceChart({
  ascendantSign,
  name,
  sourceChart,
}: {
  ascendantSign: string;
  name: string;
  sourceChart: ChartData;
}): ChartData | undefined {
  if (!SIGN_ORDER.includes(ascendantSign)) {
    return undefined;
  }

  const ascendantIndex = SIGN_ORDER.indexOf(ascendantSign);
  const planetDistribution = sourceChart.planetDistribution.map(planet => {
    const signIndex = SIGN_ORDER.indexOf(planet.sign);
    const house = signIndex >= 0
      ? ((signIndex - ascendantIndex + 12) % 12) + 1
      : planet.house;

    return {
      ...planet,
      house,
    };
  });

  return {
    ascendantSign,
    chartType: 'D9',
    housePlacements: buildHousePlacements(planetDistribution),
    name,
    planetDistribution,
    signPlacements: buildSignPlacements(planetDistribution),
    supported: true,
  };
}

function buildHousePlacements(
  planetDistribution: PlanetPosition[],
): Record<number, string[]> {
  const houses = Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => [index + 1, [] as string[]]),
  ) as Record<number, string[]>;

  for (const planet of planetDistribution) {
    houses[planet.house]?.push(planet.name);
  }

  return houses;
}

function buildSignPlacements(
  planetDistribution: PlanetPosition[],
): Record<string, string[]> {
  const signs = Object.fromEntries(SIGN_ORDER.map(sign => [sign, [] as string[]]));

  for (const planet of planetDistribution) {
    signs[planet.sign]?.push(planet.name);
  }

  return signs;
}
