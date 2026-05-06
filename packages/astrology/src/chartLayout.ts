import type { ChartData } from '@pridicta/types';

export type ChartCell = {
  key: string;
  sign: string;
  signShort: string;
  house?: number;
  planets: string[];
  row: number;
  col: number;
};

const SIGNS = [
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
] as const;

const SIGN_SHORT: Record<string, string> = {
  Aries: 'Ari',
  Taurus: 'Tau',
  Gemini: 'Gem',
  Cancer: 'Can',
  Leo: 'Leo',
  Virgo: 'Vir',
  Libra: 'Lib',
  Scorpio: 'Sco',
  Sagittarius: 'Sag',
  Capricorn: 'Cap',
  Aquarius: 'Aqu',
  Pisces: 'Pis',
};

const NORTH_INDIAN_POSITIONS: Record<number, { row: number; col: number }> = {
  1: { row: 0, col: 2 },
  2: { row: 0, col: 1 },
  3: { row: 1, col: 0 },
  4: { row: 2, col: 0 },
  5: { row: 3, col: 0 },
  6: { row: 4, col: 1 },
  7: { row: 4, col: 2 },
  8: { row: 4, col: 3 },
  9: { row: 3, col: 4 },
  10: { row: 2, col: 4 },
  11: { row: 1, col: 4 },
  12: { row: 0, col: 3 },
};

export function buildNorthIndianChartCells(chart: ChartData): ChartCell[] {
  const ascendantIndex = SIGNS.indexOf(chart.ascendantSign as (typeof SIGNS)[number]);

  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const sign =
      ascendantIndex >= 0
        ? SIGNS[(ascendantIndex + index) % SIGNS.length]
        : SIGNS[index];
    const position = NORTH_INDIAN_POSITIONS[house];

    return {
      col: position.col,
      house,
      key: `house-${house}`,
      planets: chart.housePlacements[house] ?? chart.signPlacements[sign] ?? [],
      row: position.row,
      sign,
      signShort: SIGN_SHORT[sign],
    };
  });
}

export function getPlanetAbbreviation(planet: string): string {
  return (
    {
      Jupiter: 'Ju',
      Ketu: 'Ke',
      Mars: 'Ma',
      Mercury: 'Me',
      Moon: 'Mo',
      Rahu: 'Ra',
      Saturn: 'Sa',
      Sun: 'Su',
      Venus: 'Ve',
    }[planet] ?? planet.slice(0, 2)
  );
}

export function findHouseCell(cells: ChartCell[], house?: number): ChartCell | undefined {
  return cells.find(cell => cell.house === house);
}

export function findPlanetCell(
  cells: ChartCell[],
  planet?: string,
): ChartCell | undefined {
  if (!planet) {
    return undefined;
  }

  return cells.find(cell => cell.planets.includes(planet));
}
